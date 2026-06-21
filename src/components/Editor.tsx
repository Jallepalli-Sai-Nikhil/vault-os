import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNodeStore } from '../store/nodeStore';

import { useAuthStore } from '../store/authStore';
import { Save, Bold, Italic, Strikethrough, Code, Link as LinkIcon, Image as ImageIcon, Video, List, Quote, Type, Download } from 'lucide-react';
import { exportNodeToZip } from '../lib/exportUtils';

export function Editor({ nodeId }: { nodeId: string }) {
  const { nodes, updateNode } = useNodeStore();
  const { profile } = useAuthStore();
  const node = nodes.find(n => n.id === nodeId);
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (node) {
      setContent(node.content || '');
      setTitle(node.title || '');
    }
  }, [node?.id]);

  if (!node) return <div className="p-10 text-white">Document not found</div>;

  const canEdit = profile?.role !== 'viewer';

  const handleChange = (val: string) => {
    setContent(val);
    setSaving(true);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      await updateNode(node.id, { content: val, title });
      setSaving(false);
    }, 1000);
  };

  const handleTitleChange = (e: any) => {
    setTitle(e.target.value);
    setSaving(true);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      await updateNode(node.id, { content, title: e.target.value });
      setSaving(false);
    }, 1000);
  };

  const insertText = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end) || defaultText;
    
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
    handleChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handleToolbarClick = (action: string) => {
    switch (action) {
      case 'h1': insertText('# ', '', 'Heading 1'); break;
      case 'h2': insertText('## ', '', 'Heading 2'); break;
      case 'h3': insertText('### ', '', 'Heading 3'); break;
      case 'bold': insertText('**', '**', 'bold text'); break;
      case 'italic': insertText('*', '*', 'italic text'); break;
      case 'strike': insertText('~~', '~~', 'strikethrough'); break;
      case 'quote': insertText('> ', '', 'quote'); break;
      case 'code': insertText('`', '`', 'code'); break;
      case 'codeblock': insertText('\n```\n', '\n```\n', 'code block'); break;
      case 'list': insertText('- ', '', 'list item'); break;
      case 'link': insertText('[', '](https://...)', 'link text'); break;
      case 'image': insertText('![', '](https://...)', 'image alt'); break;
      case 'youtube': insertText('\n[YouTube Video](', ')\n', 'https://youtube.com/watch?v=...'); break;
    }
  };

  const handleDownload = async () => {
    await exportNodeToZip(node.id, nodes);
  };

  // Custom components for react-markdown to support YouTube and styled code blocks
  const markdownComponents = {
    code({ inline, className, children, ...props }: any) {
      return !inline ? (
        <div className="bg-[#111] border border-[#333] p-4 rounded-md my-4 overflow-x-auto text-sm text-[#66fcf1] font-mono">
          <code className={className} {...props}>{children}</code>
        </div>
      ) : (
        <code className="bg-[#222] text-[#66fcf1] px-1 rounded font-mono text-sm" {...props}>
          {children}
        </code>
      );
    },
    a({ href, children, ...props }: any) {
      if (href?.includes('youtube.com/watch?v=') || href?.includes('youtu.be/')) {
        const videoId = href.includes('v=') ? href.split('v=')[1].split('&')[0] : href.split('youtu.be/')[1];
        return (
          <div className="my-6 aspect-video border border-[#333] rounded-lg overflow-hidden bg-[#111] relative">
            <iframe
              className="absolute inset-0 w-full h-full border-none"
              src={`https://www.youtube.com/embed/${videoId}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      return <a href={href} className="text-[#66fcf1] hover:underline" target="_blank" rel="noreferrer" {...props}>{children}</a>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#050505] text-white overflow-hidden">
      
      {/* Top Header */}
      <div className="h-14 border-b border-[#333] flex items-center justify-between px-6 shrink-0 bg-[#0a0a0a]">
        <input 
          value={title}
          onChange={handleTitleChange}
          readOnly={!canEdit}
          className="font-mono text-lg truncate pr-4 bg-transparent outline-none border-none hover:bg-[#111] focus:bg-[#111] px-2 py-1 rounded w-1/2 text-white"
          placeholder="Document Title"
        />
        <div className="flex items-center gap-4 shrink-0">
          {saving && <span className="text-xs font-mono text-gray-500 flex items-center gap-1"><Save size={12} /> Autosaving...</span>}
          <button 
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111] hover:bg-[#222] border border-[#333] text-xs font-mono text-[#66fcf1] rounded transition-colors"
          >
            <Download size={14} /> PDF
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {canEdit && (
        <div className="flex items-center gap-1 px-4 py-2 border-b border-[#333] bg-[#111] overflow-x-auto shrink-0">
          <button onClick={() => handleToolbarClick('h1')} className="p-1.5 hover:bg-[#333] text-gray-400 hover:text-white rounded" title="Heading 1"><Type size={16} /></button>
          <div className="w-px h-4 bg-[#333] mx-1" />
          <button onClick={() => handleToolbarClick('bold')} className="p-1.5 hover:bg-[#333] text-gray-400 hover:text-white rounded" title="Bold"><Bold size={16} /></button>
          <button onClick={() => handleToolbarClick('italic')} className="p-1.5 hover:bg-[#333] text-gray-400 hover:text-white rounded" title="Italic"><Italic size={16} /></button>
          <button onClick={() => handleToolbarClick('strike')} className="p-1.5 hover:bg-[#333] text-gray-400 hover:text-white rounded" title="Strikethrough"><Strikethrough size={16} /></button>
          <div className="w-px h-4 bg-[#333] mx-1" />
          <button onClick={() => handleToolbarClick('list')} className="p-1.5 hover:bg-[#333] text-gray-400 hover:text-white rounded" title="Bullet List"><List size={16} /></button>
          <button onClick={() => handleToolbarClick('quote')} className="p-1.5 hover:bg-[#333] text-gray-400 hover:text-white rounded" title="Blockquote"><Quote size={16} /></button>
          <div className="w-px h-4 bg-[#333] mx-1" />
          <button onClick={() => handleToolbarClick('code')} className="p-1.5 hover:bg-[#333] text-gray-400 hover:text-white rounded" title="Inline Code"><Code size={16} /></button>
          <button onClick={() => handleToolbarClick('codeblock')} className="p-1.5 hover:bg-[#333] text-gray-400 hover:text-white rounded flex items-center gap-1 text-xs font-mono" title="Code Block"><Code size={16} /> Block</button>
          <div className="w-px h-4 bg-[#333] mx-1" />
          <button onClick={() => handleToolbarClick('link')} className="p-1.5 hover:bg-[#333] text-gray-400 hover:text-white rounded" title="Hyperlink"><LinkIcon size={16} /></button>
          <button onClick={() => handleToolbarClick('image')} className="p-1.5 hover:bg-[#333] text-gray-400 hover:text-white rounded" title="Image"><ImageIcon size={16} /></button>
          <button onClick={() => handleToolbarClick('youtube')} className="p-1.5 hover:bg-[#333] text-[#ff0000] hover:text-[#ff4444] rounded flex items-center gap-1 text-xs font-mono" title="Embed YouTube"><Video size={16} /> YouTube</button>
        </div>
      )}

      {/* Split Pane Editor */}
      <div className={`flex-1 flex overflow-hidden ${!canEdit ? 'justify-center' : ''}`}>
        
        {/* Left Pane: Raw Editor */}
        {canEdit && (
          <div className="w-1/2 border-r border-[#333] flex flex-col bg-[#0d0d0d]">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleChange(e.target.value)}
              className="flex-1 w-full p-6 bg-transparent resize-none outline-none font-mono text-gray-300 leading-relaxed custom-scrollbar"
              placeholder="# Start writing..."
              spellCheck="false"
            />
          </div>
        )}

        {/* Right Pane: Live Preview */}
        <div className={`${canEdit ? 'w-1/2' : 'w-full max-w-4xl'} overflow-y-auto p-8 custom-scrollbar bg-[#050505]`}>
          {content ? (
            <div className="prose prose-invert prose-headings:font-mono prose-a:text-[#66fcf1] max-w-none">
              <ReactMarkdown components={markdownComponents}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-600 font-mono text-sm tracking-widest uppercase">
              Preview Area (Empty)
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
