import { useEffect, useState } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { Editor } from '../components/Editor';
import { useNodeStore } from '../store/nodeStore';
import { exportNodeToZip } from '../lib/exportUtils';
import { ChevronRight } from 'lucide-react';

function EditorRouteWrapper({ isSidebarCollapsed }: { isSidebarCollapsed: boolean }) {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <Editor nodeId={id} key={id} isSidebarCollapsed={isSidebarCollapsed} />;
}

export function AppShell() {
  const { fetchNodes, nodes } = useNodeStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsSidebarCollapsed(prev => {
      const newVal = !prev;
      localStorage.setItem('sidebar-collapsed', String(newVal));
      return newVal;
    });
  };

  useEffect(() => {
    fetchNodes();
  }, [fetchNodes]);

  useEffect(() => {
    const handleExport = (e: any) => {
      exportNodeToZip(e.detail.nodeId, nodes);
    };
    window.addEventListener('export-node', handleExport);
    return () => window.removeEventListener('export-node', handleExport);
  }, [nodes]);


  return (
    <div className="flex h-screen w-full bg-[#050505] overflow-hidden font-mono text-white selection:bg-[#66fcf1] selection:text-black">
      <AppSidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {isSidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            title="Expand Sidebar"
            className="absolute top-3.5 left-3.5 z-50 p-1.5 bg-[#0a0a0a]/80 backdrop-blur-sm border border-[#333] hover:border-[#66fcf1] text-gray-400 hover:text-[#66fcf1] rounded transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center"
          >
            <ChevronRight size={16} />
          </button>
        )}

        <Routes>
          <Route path="/" element={<div className="flex-1 flex items-center justify-center text-gray-600 font-mono text-sm uppercase tracking-widest">Select a document to read or edit</div>} />
          <Route path="node/:id" element={<EditorRouteWrapper isSidebarCollapsed={isSidebarCollapsed} />} />
        </Routes>
      </div>
    </div>
  );
}
