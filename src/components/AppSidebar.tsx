import { useState } from 'react';
import { useNodeStore } from '../store/nodeStore';
import type { Node, NodeType } from '../store/nodeStore';
import { ChevronRight, ChevronDown, ChevronLeft, Folder, FileText, Layout, Plus, Trash2, Download, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ICONS = {
  space: Layout,
  folder: Folder,
  topic: Folder,
  document: FileText,
};

function NodeTree({ node, level = 0 }: { node: Node, level?: number }) {
  const [expanded, setExpanded] = useState(false);
  const { nodes, createNode, deleteNode } = useNodeStore();
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  const children = nodes.filter(n => n.parent_id === node.id);
  const Icon = ICONS[node.type];
  const isDoc = node.type === 'document';
  const canEdit = profile?.role !== 'viewer';

  const handleCreateChild = async (e: React.MouseEvent, type: NodeType) => {
    e.stopPropagation();
    const title = prompt(`Enter ${type} name:`);
    if (!title) return;
    await createNode(type, node.id, title);
    setExpanded(true);
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Dispatch a custom event to trigger zip/pdf generation at the AppShell level
    window.dispatchEvent(new CustomEvent('export-node', { detail: { nodeId: node.id } }));
  };

  return (
    <div className="font-mono text-sm">
      <div 
        className={`flex items-center justify-between py-1.5 px-2 hover:bg-[#1a1a1a] cursor-pointer group select-none`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (isDoc) {
            navigate(`/app/node/${node.id}`);
          } else {
            setExpanded(!expanded);
          }
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {!isDoc ? (
            expanded ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />
          ) : <span className="w-3.5 inline-block" />}
          <Icon size={14} className={isDoc ? "text-[#66fcf1]" : "text-gray-400"} />
          <span className="truncate">{node.title}</span>
        </div>
        
        <div className="hidden group-hover:flex items-center gap-1 opacity-60 hover:opacity-100">
          {!isDoc && (
            <button onClick={handleDownload} title="Export as ZIP/PDF"><Download size={14} /></button>
          )}
          {canEdit && !isDoc && (
            <button onClick={(e) => handleCreateChild(e, node.type === 'space' ? 'folder' : node.type === 'folder' ? 'topic' : 'document')} title="Create Child">
              <Plus size={14} />
            </button>
          )}
          {canEdit && (
            <button onClick={(e) => { e.stopPropagation(); if(confirm('Delete?')) deleteNode(node.id); }} className="hover:text-red-500">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {!isDoc && expanded && (
        <div>
          {children.map(child => <NodeTree key={child.id} node={child} level={level + 1} />)}
        </div>
      )}
    </div>
  );
}

export function AppSidebar({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
  const { nodes, createNode } = useNodeStore();
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const rootSpaces = nodes.filter(n => !n.parent_id);

  const handleCreateSpace = () => {
    const title = prompt('Enter Space name:');
    if (title) createNode('space', null, title);
  };

  return (
    <div className={`h-full bg-[#0a0a0a] text-white border-r border-[#333] flex flex-col transition-all duration-300 ease-in-out overflow-hidden shrink-0 ${
      isCollapsed ? 'w-0 border-r-0' : 'w-64'
    }`}>
      <div className="p-4 border-b border-[#333] flex justify-between items-center whitespace-nowrap shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={onToggle} 
            title="Collapse Sidebar" 
            className="p-1 hover:bg-[#1a1a1a] text-gray-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="tracking-widest uppercase text-xs font-bold text-[#66fcf1]">Vault OS</span>
        </div>
        {profile?.role !== 'viewer' && (
          <button onClick={handleCreateSpace} title="New Space" className="hover:text-[#66fcf1] cursor-pointer"><Plus size={16} /></button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-2 whitespace-nowrap">
        {rootSpaces.length === 0 ? (
          <div className="p-4 text-xs text-gray-500 uppercase tracking-widest text-center">Empty Vault</div>
        ) : (
          rootSpaces.map(space => <NodeTree key={space.id} node={space} />)
        )}
      </div>
      
      <div className="p-4 border-t border-[#333] flex flex-col gap-3 text-xs whitespace-nowrap shrink-0">
        <div className="flex justify-between items-center text-gray-500">
          <span className="truncate pr-2">{profile?.email}</span>
          <span className="uppercase text-[#66fcf1] shrink-0">{profile?.role}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          {(profile?.role === 'god_admin' || profile?.role === 'admin') ? (
            <button 
              onClick={() => navigate('/admin')}
              className="uppercase tracking-widest text-[#66fcf1] hover:text-white flex items-center gap-1.5"
            >
              <Shield size={14} /> Admin
            </button>
          ) : <div />}
          <button 
            onClick={async () => {
              const { useAuthStore } = await import('../store/authStore');
              await useAuthStore.getState().signOut();
              navigate('/');
            }}
            className="uppercase tracking-widest text-gray-400 hover:text-white flex items-center gap-1.5"
          >
            <LogOut size={14} /> Exit
          </button>
        </div>
      </div>
    </div>
  );
}
