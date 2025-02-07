import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Watchlist } from '../types';

interface WatchlistTableProps {
  watchlist: Watchlist;
  onRemoveCoin: (symbol: string, watchlistId: string) => void;
}

export const WatchlistTable: React.FC<WatchlistTableProps> = ({ watchlist, onRemoveCoin }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700 
                overflow-hidden"
    >
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r 
                      from-indigo-400 to-purple-400">
          {watchlist.name}
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-900/50">
              <th className="text-left py-4 px-6 text-gray-400 font-semibold">Asset</th>
              <th className="text-right py-4 px-6 text-gray-400 font-semibold">Price</th>
              <th className="text-right py-4 px-6 text-gray-400 font-semibold">24h Change</th>
              <th className="text-right py-4 px-6 text-gray-400 font-semibold">Volume</th>
              <th className="text-right py-4 px-6 text-gray-400 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {watchlist.coins.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-500">
                  No cryptocurrencies added to this watchlist yet
                </td>
              </tr>
            ) : (
              watchlist.coins.map((coin) => (
                <motion.tr
                  key={coin.symbol}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="border-b border-gray-700 hover:bg-gray-700/30 transition-colors 
                           duration-200"
                >
                  <td className="py-4 px-6 font-medium text-white">{coin.symbol}</td>
                  <td className="text-right py-4 px-6 text-white">
                    ${coin.price.toFixed(2)}
                  </td>
                  <td className={`text-right py-4 px-6 ${
                    coin.priceChange24h >= 0 
                      ? 'text-green-400' 
                      : 'text-red-400'
                  }`}>
                    <span className="inline-flex items-center gap-1">
                      {coin.priceChange24h >= 0 ? '↑' : '↓'}
                      {Math.abs(coin.priceChange24h).toFixed(2)}%
                    </span>
                  </td>
                  <td className="text-right py-4 px-6 text-gray-300">
                    ${(coin.volume24h / 1000000).toFixed(2)}M
                  </td>
                  <td className="text-right py-4 px-6">
                    <button
                      onClick={() => onRemoveCoin(coin.symbol, watchlist.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 
                               rounded-xl transition-colors duration-200"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};