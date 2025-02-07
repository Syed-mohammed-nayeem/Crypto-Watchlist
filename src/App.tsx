import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SearchBar } from './components/SearchBar';
import { WatchlistTable } from './components/WatchlistTable';
import { Watchlist, Cryptocurrency } from './types';
import { createWebSocketConnection } from './services/binance-service';
import { saveWatchlists, getWatchlists } from './store/indexdb';  // Import the IndexedDB utilities

function App() {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [isAddingWatchlist, setIsAddingWatchlist] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  // Load watchlists from IndexedDB when the app starts
  useEffect(() => {
    const loadWatchlists = async () => {
      const savedWatchlists = await getWatchlists();
      setWatchlists(savedWatchlists);
    };
    loadWatchlists();
  }, []);

  useEffect(() => {
    const allCoins = watchlists.flatMap(list => list.coins);
    const symbols = [...new Set(allCoins.map(coin => coin.symbol))];

    if (symbols.length > 0) {
      const ws = createWebSocketConnection(symbols, (data) => {
        if (data.s && data.c && data.P) {
          const symbol = data.s.replace('USDT', '');
          setWatchlists(currentWatchlists => 
            currentWatchlists.map(list => ({
              ...list,
              coins: list.coins.map(coin => 
                coin.symbol === symbol
                  ? {
                      ...coin,
                      price: parseFloat(data.c),
                      priceChange24h: parseFloat(data.P),
                      volume24h: parseFloat(data.v)
                    }
                  : coin
              )
            }))
          );
        }
      });

      setWebsocket(ws);
      return () => ws.close();
    }
  }, [watchlists.map(w => w.coins.map(c => c.symbol).join()).join()]);

  // Add a new watchlist
  const addWatchlist = () => {
    if (newWatchlistName.trim()) {
      const newWatchlist = {
        id: Date.now().toString(),
        name: newWatchlistName.trim(),
        coins: []
      };
      const updatedWatchlists = [...watchlists, newWatchlist];
      setWatchlists(updatedWatchlists);
      saveWatchlists(updatedWatchlists);  // Save to IndexedDB
      setNewWatchlistName('');
      setIsAddingWatchlist(false);
      setActiveTab(newWatchlist.id);
    }
  };

  // Add coin to the watchlist
  const addCoinToWatchlist = (coin: Cryptocurrency, watchlistId: string) => {
    const updatedWatchlists = watchlists.map(list => {
      if (list.id === watchlistId) {
        const exists = list.coins.some(c => c.symbol === coin.symbol);
        if (!exists) {
          return { ...list, coins: [...list.coins, coin] };
        }
      }
      return list;
    });
    setWatchlists(updatedWatchlists);
    saveWatchlists(updatedWatchlists);  // Save to IndexedDB
  };

  // Remove coin from watchlist
  const removeCoinFromWatchlist = (symbol: string, watchlistId: string) => {
    const updatedWatchlists = watchlists.map(list => {
      if (list.id === watchlistId) {
        return { ...list, coins: list.coins.filter(c => c.symbol !== symbol) };
      }
      return list;
    });
    setWatchlists(updatedWatchlists);
    saveWatchlists(updatedWatchlists);  // Save to IndexedDB
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6"
        >
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Crypto Watchlist
          </h1>
          <div className="flex items-center gap-3">
            {isAddingWatchlist ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                  placeholder="Watchlist name"
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
                <button onClick={addWatchlist} className="bg-indigo-500 text-white px-4 py-2 rounded-lg">
                  Add
                </button>
                <button onClick={() => setIsAddingWatchlist(false)} className="text-gray-400">
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsAddingWatchlist(true)} className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-lg">
                <PlusIcon className="h-5 w-5" />
                Create New Watchlist
              </button>
            )}
          </div>
        </motion.div>

        {/* Search Bar */}
        <SearchBar onCoinSelect={addCoinToWatchlist} watchlists={watchlists.map(({ id, name }) => ({ id, name }))} />

        {/* Tabs */}
        {watchlists.length > 0 && (
          <div className="flex border-b border-gray-700 mb-4">
            {watchlists.map(watchlist => (
              <button
                key={watchlist.id}
                onClick={() => setActiveTab(watchlist.id)}
                className={`px-4 py-2 text-white ${activeTab === watchlist.id ? 'border-b-2 border-indigo-500' : 'opacity-50'}`}
              >
                {watchlist.name}
              </button>
            ))}
          </div>
        )}

        {/* Show message if no watchlists exist */}
        {watchlists.length === 0 ? (
          <div className="text-center text-gray-400 mt-12">
            <p>No watchlists available.</p>
            <p>Click "Create New Watchlist" to add one.</p>
          </div>
        ) : (
          watchlists.map(watchlist => (
            activeTab === watchlist.id && (
              <WatchlistTable key={watchlist.id} watchlist={watchlist} onRemoveCoin={removeCoinFromWatchlist} />
            )
          ))
        )}
      </div>
    </div>
  );
}

export default App;
