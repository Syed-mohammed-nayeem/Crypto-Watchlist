import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { searchCryptocurrencies } from '../services/binance-service';
import { Cryptocurrency } from '../types';

interface SearchBarProps {
  onCoinSelect: (coin: Cryptocurrency, watchlistId: string) => void;
  watchlists: { id: string; name: string; }[];
}

export const SearchBar: React.FC<SearchBarProps> = ({ onCoinSelect, watchlists }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Cryptocurrency[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const searchCoins = async () => {
      if (query.length >= 2) {
        setIsLoading(true);
        const coins = await searchCryptocurrencies(query);
        setResults(coins);
        setIsLoading(false);
      } else {
        setResults([]);
      }
    };

    const timeoutId = setTimeout(searchCoins, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search cryptocurrencies..."
            className="w-full pl-12 pr-4 py-4 bg-gray-800/50 backdrop-blur-xl border border-gray-700 
                     rounded-2xl shadow-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
                     text-white placeholder-gray-400 transition-all duration-300"
          />
        </div>
        
        <AnimatePresence>
          {results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute w-full mt-2 bg-gray-800/95 backdrop-blur-xl rounded-2xl 
                       shadow-2xl z-10 border border-gray-700 overflow-hidden"
            >
              {results.map((coin, index) => (
                <motion.div
                  key={coin.symbol}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-gray-700/50 transition-colors duration-200 
                           border-b border-gray-700 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-white">{coin.symbol}</div>
                      <div className="text-sm text-gray-400">${coin.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        className="px-3 py-2 bg-gray-900/50 backdrop-blur-sm border border-gray-700 
                                 rounded-xl text-white focus:ring-2 focus:ring-indigo-500 
                                 focus:border-transparent"
                        onChange={(e) => setSelectedWatchlist(e.target.value)}
                        value={selectedWatchlist}
                      >
                        <option value="">Select Watchlist</option>
                        {watchlists.map((list) => (
                          <option key={list.id} value={list.id}>{list.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          if (selectedWatchlist) {
                            onCoinSelect(coin, selectedWatchlist);
                            setQuery('');
                            setResults([]);
                            setSelectedWatchlist('');
                          }
                        }}
                        disabled={!selectedWatchlist}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 
                                 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 
                                 disabled:opacity-50 disabled:cursor-not-allowed transform 
                                 hover:scale-105 transition-all duration-200 disabled:hover:scale-100"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};