import { useParams } from 'react-router-dom';

export function DocumentView() {
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto p-8 lg:p-12">
      <div className="mb-8 flex items-center text-sm text-gray-500 dark:text-gray-400">
        <span>Spaces</span>
        <span className="mx-2">/</span>
        <span>Money</span>
        <span className="mx-2">/</span>
        <span>Investing</span>
      </div>
      
      <article className="prose dark:prose-invert max-w-none">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Index Funds vs ETFs</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          A comprehensive comparison between traditional index funds and exchange-traded funds for long term wealth building. Document ID: {id}
        </p>
        
        <h2>Introduction</h2>
        <p>
          When building a long-term investment portfolio, two of the most popular vehicles are Index Funds and Exchange-Traded Funds (ETFs). Both offer diversified exposure to the market, but they have subtle differences in how they trade, their fees, and tax efficiency.
        </p>
        
        <div className="my-8 p-6 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-600 dark:text-purple-300">
          <strong>Key Takeaway:</strong> For most long-term investors using a buy-and-hold strategy, the differences between an index fund and its ETF equivalent are minimal. The best choice often depends on your broker's platform and your preference for automatic investing.
        </div>

        <h2>How they trade</h2>
        <p>
          <strong>ETFs</strong> trade like individual stocks. You can buy and sell them throughout the trading day at the current market price. This means the price fluctuates second by second.
        </p>
        <p>
          <strong>Index Funds</strong> (Mutual Funds) are priced only once per day, at the end of the trading day. When you place an order, you get the Net Asset Value (NAV) calculated after the market closes.
        </p>
      </article>
    </div>
  );
}
