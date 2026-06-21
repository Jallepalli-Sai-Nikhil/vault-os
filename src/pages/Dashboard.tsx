export function Dashboard() {
  return (
    <div className="max-w-5xl mx-auto p-8 lg:p-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back, Admin.</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Here's an overview of your second brain today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Documents</h3>
          <p className="text-3xl font-bold">1,248</p>
        </div>
        <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Learning Streak</h3>
          <p className="text-3xl font-bold text-purple-500">12 Days</p>
        </div>
        <div className="bg-[var(--sidebar)] border border-[var(--border)] rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Mastered Topics</h3>
          <p className="text-3xl font-bold">42</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Continue Learning</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="group bg-[var(--sidebar)] border border-[var(--border)] rounded-2xl p-6 hover:shadow-md transition-all cursor-pointer hover:border-purple-500/30">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold px-2 py-1 bg-purple-500/10 text-purple-500 rounded-md">Investing</span>
              <span className="text-xs text-gray-400">2h ago</span>
            </div>
            <h3 className="text-lg font-bold mb-2 group-hover:text-purple-500 transition-colors">Index Funds vs ETFs</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">A comprehensive comparison between traditional index funds and exchange-traded funds for long term wealth building.</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
