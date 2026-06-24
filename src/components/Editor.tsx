import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNodeStore } from '../store/nodeStore';
import { useAuthStore } from '../store/authStore';
import { 
  Save, Bold, Italic, Strikethrough, Code, Link as LinkIcon, 
  Image as ImageIcon, Video, List, Quote, Type, Download,
  Edit3, Columns, BookOpen, Copy, Check, Sparkles, Sliders, 
  FileText, Plus, Table, Info, Lightbulb, 
  AlertCircle, AlertTriangle, Flame
} from 'lucide-react';
import { exportNodeToZip } from '../lib/exportUtils';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- STYLED SUB-COMPONENTS FOR REACT-MARKDOWN ---

function MarkdownCodeBlock({ language, code, ...props }: { language: string; code: string; [key: string]: any }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-[#313244] relative group font-sans">
      <div className="bg-[#11111b] px-4 py-1.5 flex items-center justify-between text-xs font-mono text-[#a6adc8] border-b border-[#313244]">
        <span>{language}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1 text-gray-500 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <SyntaxHighlighter
        style={{
          ...vscDarkPlus,
          'pre[class*="language-"]': {
            ...vscDarkPlus['pre[class*="language-"]'],
            background: '#1e1e2e',
            margin: 0,
            padding: '1rem',
          },
          'code[class*="language-"]': {
            ...vscDarkPlus['code[class*="language-"]'],
            background: '#1e1e2e',
            textShadow: 'none',
          }
        }}
        language={language}
        PreTag="div"
        customStyle={{ fontSize: '14px', borderRadius: 0 }}
        {...props}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function MarkdownBlockquote({ children }: { children: any }) {
  const extractText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node?.props?.children) return extractText(node.props.children);
    return "";
  };

  const fullText = extractText(children).trim();
  const match = fullText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
  
  if (match) {
    const type = match[1].toUpperCase();
    const prefixLength = match[0].length;
    
    const removePrefix = (nodes: any): any => {
      if (typeof nodes === 'string') {
        if (nodes.trim().startsWith(match[0])) {
          return nodes.substring(nodes.indexOf(match[0]) + prefixLength).trim();
        }
        return nodes;
      }
      if (Array.isArray(nodes)) {
        let found = false;
        return nodes.map((node) => {
          if (found) return node;
          const text = extractText(node);
          if (text.trim().startsWith(match[0])) {
            found = true;
            if (typeof node === 'string') {
              return node.substring(node.indexOf(match[0]) + prefixLength).trim();
            }
            if (node?.props?.children) {
              return {
                ...node,
                props: {
                  ...node.props,
                  children: removePrefix(node.props.children)
                }
              };
            }
          }
          return node;
        });
      }
      if (nodes?.props?.children) {
        return {
          ...nodes,
          props: {
            ...nodes.props,
            children: removePrefix(nodes.props.children)
          }
        };
      }
      return nodes;
    };

    const cleanedChildren = removePrefix(children);
    
    let borderClass = "";
    let bgClass = "";
    let textClass = "";
    let IconComponent = null;

    switch (type) {
      case 'NOTE':
        borderClass = "border-blue-500/80";
        bgClass = "bg-blue-950/10";
        textClass = "text-blue-400";
        IconComponent = Info;
        break;
      case 'TIP':
        borderClass = "border-emerald-500/80";
        bgClass = "bg-emerald-950/10";
        textClass = "text-emerald-400";
        IconComponent = Lightbulb;
        break;
      case 'IMPORTANT':
        borderClass = "border-indigo-500/80";
        bgClass = "bg-indigo-950/10";
        textClass = "text-indigo-400";
        IconComponent = AlertCircle;
        break;
      case 'WARNING':
        borderClass = "border-amber-500/80";
        bgClass = "bg-amber-950/10";
        textClass = "text-amber-400";
        IconComponent = AlertTriangle;
        break;
      case 'CAUTION':
        borderClass = "border-rose-500/80";
        bgClass = "bg-rose-950/10";
        textClass = "text-rose-400";
        IconComponent = Flame;
        break;
    }

    return (
      <div className={`my-4 p-4 border-l-4 rounded-r-md ${borderClass} ${bgClass} font-sans`}>
        <div className={`flex items-center gap-2 mb-2 font-mono text-xs font-bold tracking-wider ${textClass}`}>
          {IconComponent && <IconComponent size={14} />}
          <span>{type}</span>
        </div>
        <div className="text-gray-300 leading-relaxed text-sm">
          {cleanedChildren}
        </div>
      </div>
    );
  }

  return (
    <blockquote className="border-l-4 border-[var(--line)] bg-[var(--surface-2)]/30 pl-4 py-1 my-4 italic text-gray-400">
      {children}
    </blockquote>
  );
}

// --- TEMPLATES LIBRARY ---

const TEMPLATES = [
  {
    name: "Meeting Notes",
    desc: "Agenda, action items, and key decisions.",
    content: `# Meeting Notes: [Project Name] - [Date]

## 📅 Agenda
- [Brief discussion point 1]
- [Brief discussion point 2]

## 📝 Key Discussions
- **Topic A:** Summary of discussion and consensus.
- **Topic B:** Key concerns raised and how they were resolved.

## 🚀 Action Items
- [ ] @username - Task details (Due: [Date])
- [ ] @username - Another action item

## 💡 Decisions Made
1. **Decision 1:** [Details about decision]
2. **Decision 2:** [Details about decision]`
  },
  {
    name: "Project Roadmap",
    desc: "Milestones, roadmap, and risks log.",
    content: `# Project Roadmap: [Project Title]

> [!NOTE]
> This roadmap is updated weekly. Target release is Q3.

## 🎯 Objectives
- Build a robust, scalable system.
- Improve user engagement by 25%.

## 🗺️ Phases & Milestones
### Phase 1: Planning & Setup
- [x] Initial design system design.
- [ ] Setup production environments.

### Phase 2: Core Development
- [ ] Database schemas & migrations.
- [ ] Frontend UI templates.

## ⚠️ Known Risks & Mitigation
- **Risk:** Integration delays.
- **Mitigation:** Setup mockup APIs early.`
  },
  {
    name: "API Reference",
    desc: "Technical specs for endpoints.",
    content: `# API Documentation: GET /api/v1/resource

Retrieve a paginated list of resources.

## 🔒 Authentication
Requires standard Bearer Token: \`Authorization: Bearer <token>\`

## 📥 Query Parameters
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| \`page\` | integer | No | Page number (default: 1) |
| \`limit\` | integer | No | Items per page (default: 20) |

## 📤 Response (200 OK)
\`\`\`json
{
  "status": "success",
  "data": [
    {
      "id": "123",
      "name": "Sample Resource"
    }
  ]
}
\`\`\``
  },
  {
    name: "Product Spec (PRD)",
    desc: "Goals, stories, and requirements.",
    content: `# Product Requirements Document (PRD): [Feature Name]

## 🌟 Executive Summary
A brief description of what this feature is, why it matters, and who it's for.

## 🎯 Goals & Scope
- **In-Scope:** Feature A, Feature B.
- **Out-of-Scope:** Advanced analytics, third-party syncing.

## 👥 User Stories
1. **As a** writer, **I want** a clean editor **so that** I can write without distractions.
2. **As a** reviewer, **I want** to preview markdown in real-time.

## 🎨 UI/UX Mockups & Flows
- [Describe the user flow or link to Figma]

## ⚙️ Technical Requirements
- Frontend state managed via Zustand.
- Real-time previews rendered using ReactMarkdown.`
  },
  {
    name: "Weekly Log",
    desc: "Goals, daily logs, and barriers.",
    content: `# Weekly Work Log: Week of [Date]

## 🎯 Weekly Goals
- [ ] Complete UI refinements for document editor.
- [ ] Implement sync-scroll for split panes.

## 🪵 Daily Achievements
### Monday
- Started designing the side drawer for writing templates.
- Researched react-markdown blockquote customization.

### Tuesday
- Implemented admonitions (NOTE, TIP, etc.) with custom SVGs.
- Added font-size slider controls.

## 🛑 Blockers & Challenges
- *None this week!*

## 💡 Lessons Learned & Notes
- Simple scroll percent calculations work wonders for sync scroll.`
  }
];

// --- MAIN EDITOR COMPONENT ---

export function Editor({ nodeId, isSidebarCollapsed }: { nodeId: string; isSidebarCollapsed?: boolean }) {
  const { nodes, updateNode } = useNodeStore();
  const { profile } = useAuthStore();
  const node = nodes.find(n => n.id === nodeId);
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  // --- PERSISTED WRITING SETTINGS ---
  const [viewMode, setViewMode] = useState<'edit' | 'split' | 'read'>(() => {
    return (localStorage.getItem('editor-viewmode') as any) || 'split';
  });
  const [syncScrollEnabled, setSyncScrollEnabled] = useState(() => {
    return localStorage.getItem('editor-syncscroll') !== 'false';
  });
  const [fontSize, setFontSize] = useState(() => {
    return Number(localStorage.getItem('editor-fontsize')) || 14;
  });
  const [lineHeight, setLineHeight] = useState<'normal' | 'relaxed' | 'loose'>(() => {
    return (localStorage.getItem('editor-lineheight') as any) || 'relaxed';
  });
  const [wordWrap, setWordWrap] = useState(() => {
    return localStorage.getItem('editor-wordwrap') !== 'false';
  });
  const [editorFont, setEditorFont] = useState<'mono' | 'sans'>(() => {
    return (localStorage.getItem('editor-font') as any) || 'mono';
  });
  const [showToolsPanel, setShowToolsPanel] = useState(() => {
    return localStorage.getItem('editor-showtools') === 'true';
  });
  const [activeTab, setActiveTab] = useState<'templates' | 'elements' | 'preferences'>('templates');
  const [hoveredGrid, setHoveredGrid] = useState({ r: 0, c: 0 });
  const [markdownCopied, setMarkdownCopied] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  // Sync to localStorage
  useEffect(() => { localStorage.setItem('editor-viewmode', viewMode); }, [viewMode]);
  useEffect(() => { localStorage.setItem('editor-syncscroll', String(syncScrollEnabled)); }, [syncScrollEnabled]);
  useEffect(() => { localStorage.setItem('editor-fontsize', String(fontSize)); }, [fontSize]);
  useEffect(() => { localStorage.setItem('editor-lineheight', lineHeight); }, [lineHeight]);
  useEffect(() => { localStorage.setItem('editor-wordwrap', String(wordWrap)); }, [wordWrap]);
  useEffect(() => { localStorage.setItem('editor-font', editorFont); }, [editorFont]);
  useEffect(() => { localStorage.setItem('editor-showtools', String(showToolsPanel)); }, [showToolsPanel]);

  useEffect(() => {
    if (node) {
      setContent(node.content || '');
      setTitle(node.title || '');
      setIsDirty(false);
    }
  }, [node?.id]);

  if (!node) return <div className="p-10 text-white font-mono">Document not found</div>;

  const canEdit = profile?.role !== 'viewer';

  // --- HANDLERS ---

  const handleChange = (val: string) => {
    setContent(val);
    setIsDirty(true);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      await updateNode(node.id, { content: val, title });
      setSaving(false);
      setIsDirty(false);
    }, 2000);
  };

  const handleTitleChange = (e: any) => {
    setTitle(e.target.value);
    setIsDirty(true);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      await updateNode(node.id, { content, title: e.target.value });
      setSaving(false);
      setIsDirty(false);
    }, 2000);
  };

  const handleManualSave = async () => {
    if (!isDirty) return;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    setSaving(true);
    await updateNode(node.id, { content, title });
    setSaving(false);
    setIsDirty(false);
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

  const insertTable = (rows: number, cols: number) => {
    let tableMd = "\n";
    tableMd += "|";
    for (let c = 1; c <= cols; c++) {
      tableMd += ` Header ${c} |`;
    }
    tableMd += "\n|";
    for (let c = 1; c <= cols; c++) {
      tableMd += " --- |";
    }
    tableMd += "\n";
    for (let r = 1; r <= rows; r++) {
      tableMd += "|";
      for (let c = 1; c <= cols; c++) {
        tableMd += ` Cell |`;
      }
      tableMd += "\n";
    }
    insertText(tableMd, '', '');
  };

  const handleApplyTemplate = (templateContent: string, mode: 'insert' | 'overwrite') => {
    if (mode === 'overwrite') {
      if (confirm('This will replace your current document content. Are you sure?')) {
        setContent(templateContent);
        handleChange(templateContent);
      }
    } else {
      insertText(templateContent, '', '');
    }
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

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(content);
    setMarkdownCopied(true);
    setTimeout(() => setMarkdownCopied(false), 2000);
  };

  // --- SCROLL SYNC ---

  const handleEditorScroll = () => {
    if (!syncScrollEnabled || isSyncingScroll.current) return;
    const editor = textareaRef.current;
    const preview = previewScrollRef.current;
    if (!editor || !preview) return;

    isSyncingScroll.current = true;
    const scrollHeightDiff = editor.scrollHeight - editor.clientHeight;
    const scrollPercentage = scrollHeightDiff > 0 ? editor.scrollTop / scrollHeightDiff : 0;
    
    preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
    
    setTimeout(() => {
      isSyncingScroll.current = false;
    }, 50);
  };

  const handlePreviewScroll = () => {
    if (!syncScrollEnabled || isSyncingScroll.current) return;
    const editor = textareaRef.current;
    const preview = previewScrollRef.current;
    if (!editor || !preview) return;

    isSyncingScroll.current = true;
    const scrollHeightDiff = preview.scrollHeight - preview.clientHeight;
    const scrollPercentage = scrollHeightDiff > 0 ? preview.scrollTop / scrollHeightDiff : 0;

    editor.scrollTop = scrollPercentage * (editor.scrollHeight - editor.clientHeight);

    setTimeout(() => {
      isSyncingScroll.current = false;
    }, 50);
  };

  // --- CURSOR TRACKING ---
  const updateCursorPos = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const textBeforeCursor = content.substring(0, textarea.selectionStart);
    const lines = textBeforeCursor.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    });
  };

  // Custom components for react-markdown
  const markdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline ? (
        <MarkdownCodeBlock 
          language={match ? match[1] : 'text'} 
          code={String(children).replace(/\n$/, '')} 
          {...props} 
        />
      ) : (
        <code className="bg-[#1e1e2e] text-[#cdd6f4] px-1.5 py-0.5 rounded-md font-mono text-sm border border-[#313244]" {...props}>
          {children}
        </code>
      );
    },
    blockquote({ children }: any) {
      return <MarkdownBlockquote children={children} />;
    },
    input({ type, checked, ...props }: any) {
      if (type === 'checkbox') {
        return (
          <input 
            type="checkbox" 
            checked={checked} 
            readOnly 
            className="mr-2 h-4 w-4 rounded border-[#333] bg-[#111] text-[var(--accent)] focus:ring-[var(--accent)] accent-[var(--accent)] cursor-pointer" 
            {...props} 
          />
        );
      }
      return <input {...props} />;
    },
    li({ children, className, ...props }: any) {
      const isCheckbox = className?.includes('task-list-item') || 
                         (Array.isArray(children) && children.some(c => c?.props?.type === 'checkbox'));
      return (
        <li className={`my-1 text-gray-300 leading-relaxed ${isCheckbox ? 'list-none flex items-center -ml-5' : 'list-disc ml-5'}`} {...props}>
          {children}
        </li>
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
      return <a href={href} className="text-[var(--accent)] hover:underline font-semibold" target="_blank" rel="noreferrer" {...props}>{children}</a>;
    }
  };

  // Counts
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="h-full flex flex-col bg-[var(--bg)] text-[var(--text)] overflow-hidden font-mono select-none">
      
      {/* Top Header */}
      <div className={`h-14 border-b border-[#333]/50 flex items-center justify-between px-6 shrink-0 bg-[var(--bg-soft)] transition-all duration-300 ${isSidebarCollapsed ? 'pl-16' : ''}`}>
        <input 
          value={title}
          onChange={handleTitleChange}
          readOnly={!canEdit}
          className="font-mono text-lg truncate pr-4 bg-transparent outline-none border-none hover:bg-[var(--surface-2)]/30 focus:bg-[var(--surface-2)]/30 px-2 py-1 rounded w-1/2 text-white"
          placeholder="Document Title"
        />
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-xs font-mono text-gray-500 italic">
            {saving ? 'Saving...' : isDirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          {canEdit && (
            <button 
              onClick={handleManualSave}
              disabled={!isDirty || saving}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded transition-colors text-xs font-mono font-bold cursor-pointer ${isDirty ? 'bg-[var(--accent)] text-[var(--on-accent)] hover:opacity-90' : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-[#333]/50'}`}
            >
              <Save size={14} /> Save
            </button>
          )}
          <button 
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111] hover:bg-[#222] border border-[#333]/50 text-xs font-mono text-[var(--accent)] rounded transition-colors cursor-pointer"
          >
            <Download size={14} /> PDF
          </button>
        </div>
      </div>

      {/* Toolbar */}
      {canEdit && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#333]/50 bg-[var(--bg-soft)]/80 overflow-x-auto shrink-0 gap-4">
          <div className="flex items-center gap-1">
            <button onClick={() => handleToolbarClick('h1')} className="p-1.5 hover:bg-neutral-800 text-gray-400 hover:text-white rounded transition-colors cursor-pointer" title="Heading 1"><Type size={16} /></button>
            <div className="w-px h-4 bg-neutral-800 mx-1" />
            <button onClick={() => handleToolbarClick('bold')} className="p-1.5 hover:bg-neutral-800 text-gray-400 hover:text-white rounded transition-colors cursor-pointer" title="Bold"><Bold size={16} /></button>
            <button onClick={() => handleToolbarClick('italic')} className="p-1.5 hover:bg-neutral-800 text-gray-400 hover:text-white rounded transition-colors cursor-pointer" title="Italic"><Italic size={16} /></button>
            <button onClick={() => handleToolbarClick('strike')} className="p-1.5 hover:bg-neutral-800 text-gray-400 hover:text-white rounded transition-colors cursor-pointer" title="Strikethrough"><Strikethrough size={16} /></button>
            <div className="w-px h-4 bg-neutral-800 mx-1" />
            <button onClick={() => handleToolbarClick('list')} className="p-1.5 hover:bg-neutral-800 text-gray-400 hover:text-white rounded transition-colors cursor-pointer" title="Bullet List"><List size={16} /></button>
            <button onClick={() => handleToolbarClick('quote')} className="p-1.5 hover:bg-neutral-800 text-gray-400 hover:text-white rounded transition-colors cursor-pointer" title="Blockquote"><Quote size={16} /></button>
            <div className="w-px h-4 bg-neutral-800 mx-1" />
            <button onClick={() => handleToolbarClick('code')} className="p-1.5 hover:bg-neutral-800 text-gray-400 hover:text-white rounded transition-colors cursor-pointer" title="Inline Code"><Code size={16} /></button>
            <button onClick={() => handleToolbarClick('codeblock')} className="p-1.5 hover:bg-neutral-800 text-gray-400 hover:text-white rounded transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono" title="Code Block"><Code size={14} /> Block</button>
            <div className="w-px h-4 bg-neutral-800 mx-1" />
            <button onClick={() => handleToolbarClick('link')} className="p-1.5 hover:bg-neutral-800 text-gray-400 hover:text-white rounded transition-colors cursor-pointer" title="Hyperlink"><LinkIcon size={16} /></button>
            <button onClick={() => handleToolbarClick('image')} className="p-1.5 hover:bg-neutral-800 text-gray-400 hover:text-white rounded transition-colors cursor-pointer" title="Image"><ImageIcon size={16} /></button>
            <button onClick={() => handleToolbarClick('youtube')} className="p-1.5 hover:bg-neutral-800 text-[#ff0000] hover:text-[#ff4444] rounded transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono" title="Embed YouTube"><Video size={16} /> YouTube</button>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex bg-neutral-900/60 p-0.5 rounded border border-neutral-800 text-xs font-mono">
              <button 
                onClick={() => setViewMode('edit')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer ${viewMode === 'edit' ? 'bg-[var(--accent)] text-[var(--on-accent)] font-bold shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                <Edit3 size={13} />
                <span>Write</span>
              </button>
              <button 
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer ${viewMode === 'split' ? 'bg-[var(--accent)] text-[var(--on-accent)] font-bold shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                <Columns size={13} />
                <span>Split</span>
              </button>
              <button 
                onClick={() => setViewMode('read')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded transition-all cursor-pointer ${viewMode === 'read' ? 'bg-[var(--accent)] text-[var(--on-accent)] font-bold shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                <BookOpen size={13} />
                <span>Read</span>
              </button>
            </div>

            <div className="w-px h-4 bg-neutral-800" />

            {/* Quick Markdown Copy */}
            <button 
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1 px-2 py-1.5 bg-[#16161a] hover:bg-[#222] border border-[#2d2d30] hover:border-gray-500 rounded text-xs font-mono text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Copy markdown to clipboard"
            >
              {markdownCopied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              <span>{markdownCopied ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Helper Side Drawer Trigger */}
            <button 
              onClick={() => setShowToolsPanel(!showToolsPanel)}
              className={`flex items-center gap-1 px-3 py-1.5 border rounded text-xs font-mono transition-all cursor-pointer ${
                showToolsPanel 
                  ? 'bg-[var(--accent)]/15 border-[var(--accent)] text-[var(--accent)] shadow-[0_0_10px_rgba(102,252,241,0.15)] font-bold' 
                  : 'bg-[#16161a] border-[#2d2d30] text-gray-400 hover:text-white hover:border-gray-500'
              }`}
              title="Toggle Writing Helpers"
            >
              <Sparkles size={14} />
              <span>Writing Tools</span>
            </button>
          </div>
        </div>
      )}

      {/* Workspace Area: Split Panes & Tools Panel */}
      <div className={`flex-1 flex overflow-hidden relative ${!canEdit ? 'justify-center' : ''}`}>
        
        {/* Editing / Previewing Area */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Pane: Raw Editor */}
          {canEdit && viewMode !== 'read' && (
            <div className={`${viewMode === 'edit' ? 'w-full' : 'w-1/2'} border-r border-[#333]/50 flex flex-col bg-[var(--bg-soft)]/20`}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleChange(e.target.value)}
                onScroll={handleEditorScroll}
                onSelect={updateCursorPos}
                onKeyUp={updateCursorPos}
                style={{ 
                  fontSize: `${fontSize}px`, 
                  whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                }}
                className={`flex-1 w-full p-6 bg-transparent resize-none outline-none leading-relaxed custom-scrollbar ${
                  editorFont === 'mono' ? 'font-mono text-gray-300' : 'font-sans text-gray-200'
                } ${
                  lineHeight === 'normal' ? 'leading-normal' : lineHeight === 'loose' ? 'leading-loose' : 'leading-relaxed'
                }`}
                placeholder="# Start writing..."
                spellCheck="false"
              />
            </div>
          )}

          {/* Right Pane: Live Preview */}
          {viewMode !== 'edit' && (
            <div 
              ref={previewScrollRef}
              onScroll={handlePreviewScroll}
              className={`${viewMode === 'read' ? 'w-full max-w-4xl mx-auto' : 'w-1/2'} overflow-y-auto p-8 custom-scrollbar bg-[var(--bg)]`}
            >
              {content ? (
                <div className="prose prose-invert prose-headings:font-mono prose-a:text-[var(--accent)] max-w-none">
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
          )}

        </div>

        {/* Right Drawer: Writing Tools & Preferences Panel */}
        {showToolsPanel && canEdit && (
          <div className="w-80 border-l border-[#333]/60 bg-[var(--bg-soft)] flex flex-col shrink-0 text-white">
            {/* Header Tabs */}
            <div className="flex border-b border-[#333]/50 bg-neutral-950/40 text-xs">
              <button 
                onClick={() => setActiveTab('templates')}
                className={`flex-1 py-3 text-center border-b-2 font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${activeTab === 'templates' ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--surface)]/10 font-bold' : 'border-transparent text-gray-500 hover:text-white'}`}
              >
                <FileText size={13} /> Templates
              </button>
              <button 
                onClick={() => setActiveTab('elements')}
                className={`flex-1 py-3 text-center border-b-2 font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${activeTab === 'elements' ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--surface)]/10 font-bold' : 'border-transparent text-gray-500 hover:text-white'}`}
              >
                <Plus size={13} /> Elements
              </button>
              <button 
                onClick={() => setActiveTab('preferences')}
                className={`flex-1 py-3 text-center border-b-2 font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${activeTab === 'preferences' ? 'border-[var(--accent)] text-[var(--accent)] bg-[var(--surface)]/10 font-bold' : 'border-transparent text-gray-500 hover:text-white'}`}
              >
                <Sliders size={13} /> Prefs
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto custom-scrollbar select-none">
              
              {/* Tab 1: Templates Content */}
              {activeTab === 'templates' && (
                <div className="p-4 flex flex-col gap-4">
                  <p className="text-[10px] text-gray-500 font-mono leading-relaxed">
                    Insert or apply structured layouts to kickstart your documents.
                  </p>
                  <div className="flex flex-col gap-3">
                    {TEMPLATES.map((tmpl) => (
                      <div 
                        key={tmpl.name}
                        className="bg-[#111116] border border-[#2d2d35] rounded p-3 hover:border-[var(--accent)]/50 transition-colors flex flex-col gap-2.5"
                      >
                        <div>
                          <h4 className="text-xs font-mono font-bold text-white">{tmpl.name}</h4>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5 leading-snug">{tmpl.desc}</p>
                        </div>
                        <div className="flex gap-2 text-[10px] font-mono mt-1">
                          <button
                            onClick={() => handleApplyTemplate(tmpl.content, 'insert')}
                            className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-gray-300 hover:text-white rounded border border-[#333]/50 cursor-pointer flex-1 transition-colors text-center"
                          >
                            Insert at Cursor
                          </button>
                          <button
                            onClick={() => handleApplyTemplate(tmpl.content, 'overwrite')}
                            className="px-2 py-1 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded border border-[var(--accent)]/20 cursor-pointer flex-1 transition-colors text-center font-bold"
                          >
                            Overwrite
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Elements Insertion Content */}
              {activeTab === 'elements' && (
                <div className="flex flex-col">
                  
                  {/* Grid Table Builder */}
                  <div className="p-4 border-b border-[#333]/50">
                    <div className="flex items-center gap-1.5 mb-3 text-gray-400">
                      <Table size={13} />
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider">Table Grid Builder</h4>
                    </div>
                    <div className="bg-[#111116] p-4 rounded border border-[#2d2d35] flex flex-col items-center">
                      <span className="text-[10px] text-[var(--accent)] font-mono mb-3 bg-[var(--accent)]/10 px-2 py-0.5 rounded border border-[var(--accent)]/10 min-h-[1.5rem] flex items-center">
                        {hoveredGrid.r > 0 ? `Insert ${hoveredGrid.r} × ${hoveredGrid.c} Table` : 'Select grid dimensions'}
                      </span>
                      <div 
                        className="grid grid-cols-5 gap-1.5 p-1 bg-black/40 rounded border border-[#222]"
                        onMouseLeave={() => setHoveredGrid({ r: 0, c: 0 })}
                      >
                        {Array.from({ length: 25 }).map((_, idx) => {
                          const r = Math.floor(idx / 5) + 1;
                          const c = (idx % 5) + 1;
                          const isActive = r <= hoveredGrid.r && c <= hoveredGrid.c;
                          return (
                            <button
                              key={idx}
                              onMouseEnter={() => setHoveredGrid({ r, c })}
                              onClick={() => insertTable(r, c)}
                              className={`w-6 h-6 rounded transition-all border cursor-pointer ${
                                isActive 
                                  ? 'bg-[var(--accent)] border-[var(--accent)] scale-105 shadow-[0_0_8px_var(--accent-glow)]' 
                                  : 'bg-[#1b1b22] border-[#2d2d35] hover:border-gray-500'
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Admonitions */}
                  <div className="p-4 border-b border-[#333]/50">
                    <div className="flex items-center gap-1.5 mb-3 text-gray-400">
                      <Info size={13} />
                      <h4 className="text-xs font-mono font-bold uppercase tracking-wider">Premium Callouts</h4>
                    </div>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: 'Note Callout', type: 'NOTE', bg: 'bg-blue-950/15 border-blue-500/80 text-blue-400' },
                        { label: 'Tip Callout', type: 'TIP', bg: 'bg-emerald-950/15 border-emerald-500/80 text-emerald-400' },
                        { label: 'Important Callout', type: 'IMPORTANT', bg: 'bg-indigo-950/15 border-indigo-500/80 text-indigo-400' },
                        { label: 'Warning Callout', type: 'WARNING', bg: 'bg-amber-950/15 border-amber-500/80 text-amber-400' },
                        { label: 'Caution Callout', type: 'CAUTION', bg: 'bg-rose-950/15 border-rose-500/80 text-rose-400' }
                      ].map((callout) => (
                        <button
                          key={callout.type}
                          onClick={() => insertText(`\n> [!${callout.type}]\n> `, '', `${callout.label} body`)}
                          className={`w-full py-2 px-3 border-l-2 rounded-r font-mono text-[10px] text-left cursor-pointer flex items-center justify-between transition-all hover:translate-x-1 ${callout.bg}`}
                        >
                          <span>[!{callout.type}]</span>
                          <span className="opacity-40 text-[9px]">Insert</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Format helpers */}
                  <div className="p-4">
                    <h4 className="text-[10px] font-mono font-bold text-gray-400 mb-3 uppercase tracking-wider">Checklists & Code</h4>
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <button
                        onClick={() => insertText('- [ ] ', '', 'Task')}
                        className="py-2 bg-neutral-900 border border-[#2d2d35] rounded hover:border-gray-500 text-gray-300 hover:text-white transition-colors cursor-pointer text-center"
                      >
                        [ ] Checklist
                      </button>
                      <button
                        onClick={() => insertText('\n```python\n', '\n```\n', 'print("hello")')}
                        className="py-2 bg-neutral-900 border border-[#2d2d35] rounded hover:border-gray-500 text-gray-300 hover:text-white transition-colors cursor-pointer text-center"
                      >
                        🐍 Python Block
                      </button>
                      <button
                        onClick={() => insertText('\n```sql\n', '\n```\n', 'SELECT * FROM users;')}
                        className="py-2 bg-neutral-900 border border-[#2d2d35] rounded hover:border-gray-500 text-gray-300 hover:text-white transition-colors cursor-pointer text-center"
                      >
                        🗄️ SQL Block
                      </button>
                      <button
                        onClick={() => insertText('\n---\n', '', '')}
                        className="py-2 bg-neutral-900 border border-[#2d2d35] rounded hover:border-gray-500 text-gray-300 hover:text-white transition-colors cursor-pointer text-center"
                      >
                        ― Horizontal Line
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* Tab 3: Preferences / Settings */}
              {activeTab === 'preferences' && (
                <div className="p-4 flex flex-col gap-5 text-xs font-mono">
                  
                  {/* Font Size slider */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-gray-400">
                      <span>Editor Font Size</span>
                      <span className="text-[var(--accent)] font-bold">{fontSize}px</span>
                    </div>
                    <input 
                      type="range" 
                      min="12" 
                      max="24" 
                      value={fontSize} 
                      onChange={(e) => setFontSize(Number(e.target.value))} 
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[var(--accent)]" 
                    />
                  </div>

                  {/* Font family selection */}
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-400">Editor Font Style</span>
                    <div className="flex bg-neutral-900 border border-[#2d2d35] p-0.5 rounded">
                      <button
                        onClick={() => setEditorFont('mono')}
                        className={`flex-1 py-1 rounded transition-colors text-center cursor-pointer text-[10px] ${editorFont === 'mono' ? 'bg-[#222] text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                        Monospace (JetBrains)
                      </button>
                      <button
                        onClick={() => setEditorFont('sans')}
                        className={`flex-1 py-1 rounded transition-colors text-center cursor-pointer text-[10px] ${editorFont === 'sans' ? 'bg-[#222] text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                      >
                        Sans-Serif (Inter)
                      </button>
                    </div>
                  </div>

                  {/* Line height selection */}
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-400">Editor Line Spacing</span>
                    <div className="flex bg-neutral-900 border border-[#2d2d35] p-0.5 rounded">
                      {(['normal', 'relaxed', 'loose'] as const).map((lh) => (
                        <button
                          key={lh}
                          onClick={() => setLineHeight(lh)}
                          className={`flex-1 py-1 rounded transition-colors text-center cursor-pointer capitalize text-[10px] ${lineHeight === lh ? 'bg-[#222] text-white font-bold' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                          {lh}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-[#333]/50" />

                  {/* Checklist options */}
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={syncScrollEnabled}
                        onChange={(e) => setSyncScrollEnabled(e.target.checked)}
                        className="rounded border-[#333] bg-[#111] text-[var(--accent)] focus:ring-[var(--accent)] accent-[var(--accent)] w-3.5 h-3.5"
                      />
                      <span>Synchronize Scrolling</span>
                    </label>
                    <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={wordWrap}
                        onChange={(e) => setWordWrap(e.target.checked)}
                        className="rounded border-[#333] bg-[#111] text-[var(--accent)] focus:ring-[var(--accent)] accent-[var(--accent)] w-3.5 h-3.5"
                      />
                      <span>Enable Word Wrap</span>
                    </label>
                  </div>

                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* Editor Status Bar */}
      <div className="h-8 border-t border-[#333]/50 bg-[var(--bg-soft)] flex items-center justify-between px-6 shrink-0 text-[10px] text-gray-500 font-mono">
        <div className="flex items-center gap-4">
          <span>{wordCount} words</span>
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
          <span>{charCount} characters</span>
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
          <span>{readTime} min read</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-800" />
          <span className="text-[var(--accent)] opacity-80 uppercase tracking-widest font-bold font-sans">
            Markdown Mode
          </span>
        </div>
      </div>

    </div>
  );
}
