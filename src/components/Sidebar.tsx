import { Link } from 'react-router-dom';
import { Home, Book, Bookmark, Settings, Search, Hash } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 h-full bg-[var(--sidebar)] border-r border-[var(--border)] flex flex-col transition-colors duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
          S
        </div>
        <h1 className="font-bold text-xl tracking-tight">Second Brain</h1>
      </div>

      <div className="px-4 mb-4">
        <button className="w-full flex items-center gap-2 px-3 py-2 bg-black/5 dark:bg-white/5 rounded-lg text-sm text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
          <Search size={16} />
          <span>Search...</span>
          <kbd className="ml-auto text-xs opacity-50">⌘K</kbd>
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4">Menu</p>
        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5 text-sm font-medium">
          <Home size={18} />
          Dashboard
        </Link>
        <Link to="/doc/1" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
          <Book size={18} />
          All Documents
        </Link>
        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
          <Bookmark size={18} />
          Bookmarks
        </Link>
        
        <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-6">Spaces</p>
        <div className="space-y-1">
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            <Hash size={18} />
            Money
          </button>
          <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            <Hash size={18} />
            Health
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <button className="flex items-center gap-3 px-3 py-2 w-full rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
          <Settings size={18} />
          Settings
        </button>
      </div>
    </aside>
  );
}
