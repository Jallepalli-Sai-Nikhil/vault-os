import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppSidebar } from '../components/AppSidebar';
import { Editor } from '../components/Editor';
import { useNodeStore } from '../store/nodeStore';
import { exportNodeToZip } from '../lib/exportUtils';

function EditorRouteWrapper() {
  const { pathname } = window.location;
  const id = pathname.split('/node/')[1];
  return <Editor nodeId={id} key={id} />;
}

export function AppShell() {
  const { fetchNodes, nodes } = useNodeStore();

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
      <AppSidebar />
      <div className="flex-1 flex flex-col relative">

        <Routes>
          <Route path="/" element={<div className="flex-1 flex items-center justify-center text-gray-600 font-mono text-sm uppercase tracking-widest">Select a document to read or edit</div>} />
          <Route path="node/:id" element={<EditorRouteWrapper />} />
        </Routes>
      </div>
    </div>
  );
}
