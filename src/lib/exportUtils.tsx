import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { Node } from '../store/nodeStore';
import { createRoot } from 'react-dom/client';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Find all descendants of a given node
function getDescendants(nodeId: string, allNodes: Node[]): Node[] {
  const children = allNodes.filter(n => n.parent_id === nodeId);
  let descendants = [...children];
  for (const child of children) {
    descendants = descendants.concat(getDescendants(child.id, allNodes));
  }
  return descendants;
}

// Generate PDF from Markdown string using a temporary DOM element
async function generatePDF(content: string, title: string): Promise<Blob> {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '-9999px';
    container.style.width = '800px'; // Fixed width for consistent PDF
    container.style.background = '#ffffff'; // White bg for PDF
    container.style.color = '#000000';
    container.style.padding = '40px';
    container.className = 'prose max-w-none'; // Tailwind typography
    document.body.appendChild(container);

    const markdownComponents = {
      code({ node, inline, className, children, ...props }: any) {
        const match = /language-(\w+)/.exec(className || '');
        return !inline ? (
          <div style={{ margin: '16px 0', borderRadius: '8px', overflow: 'hidden', border: '1px solid #313244', backgroundColor: '#1e1e2e' }}>
            <SyntaxHighlighter
              style={{
                ...vscDarkPlus,
                'pre[class*="language-"]': {
                  ...vscDarkPlus['pre[class*="language-"]'],
                  background: '#1e1e2e',
                  margin: 0,
                  padding: '16px',
                },
                'code[class*="language-"]': {
                  ...vscDarkPlus['code[class*="language-"]'],
                  background: '#1e1e2e',
                  textShadow: 'none',
                }
              }}
              language={match ? match[1] : 'text'}
              PreTag="div"
              customStyle={{ fontSize: '14px', borderRadius: 0 }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        ) : (
          <code style={{ backgroundColor: '#1e1e2e', color: '#cdd6f4', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace', fontSize: '14px', border: '1px solid #313244' }} {...props}>
            {children}
          </code>
        );
      }
    };

    const root = createRoot(container);
    root.render(
      <div>
        <h1 style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>{title}</h1>
        <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
      </div>
    );

    // Wait for React to render and images to load (simplified timeout for prototyping)
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(container, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [canvas.width / 2, canvas.height / 2]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
        
        root.unmount();
        document.body.removeChild(container);
        
        resolve(pdf.output('blob'));
      } catch (err) {
        console.error('PDF Generation failed', err);
        root.unmount();
        document.body.removeChild(container);
        // Fallback to text if canvas fails
        const fallbackPdf = new jsPDF();
        fallbackPdf.text(title + '\n\n' + content, 10, 10);
        resolve(fallbackPdf.output('blob'));
      }
    }, 1000);
  });
}

export async function exportNodeToZip(nodeId: string, allNodes: Node[]) {
  const targetNode = allNodes.find(n => n.id === nodeId);
  if (!targetNode) return;

  const zip = new JSZip();
  const descendants = getDescendants(nodeId, allNodes);
  
  // Create a map to resolve paths easily
  const nodeMap = new Map(allNodes.map(n => [n.id, n]));

  const getPath = (n: Node): string => {
    let path = n.title;
    let curr = n;
    while (curr.parent_id && curr.parent_id !== nodeId) {
      const parent = nodeMap.get(curr.parent_id);
      if (parent) {
        path = parent.title + '/' + path;
        curr = parent;
      } else {
        break;
      }
    }
    return path;
  };

  const docs = targetNode.type === 'document' ? [targetNode] : descendants.filter(n => n.type === 'document');

  if (docs.length === 0) {
    alert('No documents found to export.');
    return;
  }

  // Set up a progress notification
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.background = '#66fcf1';
  toast.style.color = '#000';
  toast.style.padding = '10px 20px';
  toast.style.zIndex = '9999';
  toast.style.fontFamily = 'monospace';
  toast.innerText = `Preparing export for ${docs.length} document(s)...`;
  document.body.appendChild(toast);

  try {
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i];
      toast.innerText = `Generating PDF ${i + 1} of ${docs.length}: ${doc.title}`;
      
      const pdfBlob = await generatePDF(doc.content || '', doc.title);
      const filePath = getPath(doc) + '.pdf';
      zip.file(filePath, pdfBlob);
    }

    toast.innerText = 'Zipping files...';
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${targetNode.title.replace(/\s+/g, '_')}_export.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    document.body.removeChild(toast);
  } catch (error) {
    console.error(error);
    toast.innerText = 'Export failed!';
    toast.style.background = 'red';
    toast.style.color = 'white';
    setTimeout(() => document.body.removeChild(toast), 3000);
  }
}
