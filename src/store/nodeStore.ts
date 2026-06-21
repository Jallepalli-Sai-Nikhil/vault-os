import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export type NodeType = 'space' | 'folder' | 'topic' | 'document';

export interface Node {
  id: string;
  parent_id: string | null;
  type: NodeType;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NodeState {
  nodes: Node[];
  loading: boolean;
  fetchNodes: () => Promise<void>;
  createNode: (type: NodeType, parent_id: string | null, title: string) => Promise<Node | null>;
  updateNode: (id: string, updates: Partial<Node>) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
}

export const useNodeStore = create<NodeState>((set, get) => ({
  nodes: [],
  loading: false,

  fetchNodes: async () => {
    set({ loading: true });
    const { data, error } = await supabase.from('nodes').select('*').order('created_at', { ascending: true });
    if (!error && data) {
      set({ nodes: data });
    }
    set({ loading: false });
  },

  createNode: async (type, parent_id, title) => {
    const { data } = await supabase.from('nodes').insert([{
      type, parent_id, title, content: ''
    }]).select().single();
    
    if (data) {
      set({ nodes: [...get().nodes, data] });
      return data;
    }
    return null;
  },

  updateNode: async (id, updates) => {
    const { error } = await supabase.from('nodes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    if (!error) {
      set({ nodes: get().nodes.map(n => n.id === id ? { ...n, ...updates } : n) });
    }
  },

  deleteNode: async (id) => {
    // Recursive delete should ideally be handled by cascade in DB or an edge function,
    // but for prototyping we delete the single node.
    const { error } = await supabase.from('nodes').delete().eq('id', id);
    if (!error) {
      // Also optimistic local delete of children
      const deleteRecursive = (nodeId: string, currentNodes: Node[]) => {
        const children = currentNodes.filter(n => n.parent_id === nodeId);
        let updatedNodes = currentNodes.filter(n => n.id !== nodeId);
        for (const child of children) {
          updatedNodes = deleteRecursive(child.id, updatedNodes);
        }
        return updatedNodes;
      };
      set({ nodes: deleteRecursive(id, get().nodes) });
    }
  }
}));
