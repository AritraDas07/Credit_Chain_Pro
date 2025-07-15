import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Star, TrendingUp, Users, Database, Shield, Check } from 'lucide-react';
import { useDataMarketplace } from '../hooks/useContract';
import { useCreditContext } from '../contexts/CreditContext';

const DataMarketplace: React.FC = () => {
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [showPurchaseModal, setShowPurchaseModal] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  
  const { purchaseProduct, isLoading: contractLoading } = useDataMarketplace();
  const { isWalletConnected } = useCreditContext();

  const dataProducts = [
    {
      id: 'premium-report',
      name: 'Premium Credit Report',
      price: '0.5 ETH',
      rating: 4.9,
      reviews: 1234,
      description: 'Comprehensive credit analysis with AI insights',
      features: ['360° Credit View', 'Predictive Analytics', 'Risk Assessment'],
      color: 'from-red-400 to-violet-500'
    },
    {
      id: 'behavioral-analytics',
      name: 'Behavioral Analytics',
      price: '0.3 ETH',
      rating: 4.8,
      reviews: 892,
      description: 'Advanced spending pattern analysis',
      features: ['Transaction Insights', 'Spending Patterns', 'Risk Indicators'],
      color: 'from-violet-400 to-pink-500'
    },
    {
      id: 'market-intelligence',
      name: 'Market Intelligence',
      price: '0.7 ETH',
      rating: 4.7,
      reviews: 567,
      description: 'Real-time market data and trends',
      features: ['Market Trends', 'Sector Analysis', 'Predictive Models'],
      color: 'from-green-400 to-emerald-500'
    }
  ];

  const handlePurchase = async (productId: string) => {
    if (!isWalletConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    setIsProcessing(true);
    setTransactionHash(null);
    
    try {
      const result = await purchaseProduct(parseInt(productId));
      setTransactionHash(result.transactionHash);
      setPurchasedItems([...purchasedItems, productId]);
      setShowPurchaseModal(null);
      
      // Show success message
      setTimeout(() => {
        alert(`Purchase successful! Transaction: ${result.transactionHash.slice(0, 10)}...`);
      }, 500);
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="marketplace" className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 via-red-500 to-violet-600 bg-clip-text text-transparent">
          Data Marketplace
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Monetize your data or access premium credit intelligence reports
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dataProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group relative"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${product.color} opacity-10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300`} />
            
            <div className="relative backdrop-blur-xl bg-midnight/40 border border-red-500/10 rounded-2xl p-6 hover:bg-midnight/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${product.color} bg-opacity-20`}>
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-300">{product.rating}</span>
                  <span className="text-sm text-gray-500">({product.reviews})</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
                  <p className="text-gray-400 text-sm">{product.description}</p>
                </div>

                <div className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-red-500/10">
                  <div className="text-2xl font-bold text-white">{product.price}</div>
                  {purchasedItems.includes(product.id) ? (
                    <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium">Purchased</span>
                    </div>
                  ) : (
                    <motion.button
                      onClick={() => setShowPurchaseModal(product.id)}
                      disabled={contractLoading || isProcessing}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${product.color} rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50`}
                    >
                      <ShoppingCart className="w-4 h-4 text-white" />
                      <span className="text-white font-medium">
                        {isProcessing ? 'Processing...' : 'Purchase'}
                      </span>
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Purchase Modal */}
      <AnimatePresence>
        {showPurchaseModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPurchaseModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-midnight/90 border border-red-500/20 rounded-2xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-white mb-4">Confirm Purchase</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to purchase this data product? This will create a blockchain transaction.
              </p>
              
              {!isWalletConnected && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">Please connect your wallet to continue</p>
                </div>
              )}
              
              {transactionHash && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-xs font-mono">
                    Transaction: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPurchaseModal(null)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-charcoal/50 border border-red-500/10 rounded-lg text-gray-300 hover:bg-charcoal/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePurchase(showPurchaseModal)}
                  disabled={isProcessing || !isWalletConnected}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-violet-600 rounded-lg text-white hover:from-red-500 hover:to-violet-500 transition-all duration-200 disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Confirm Purchase'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-center"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-violet-600 rounded-lg hover:from-red-500 hover:to-violet-500 transition-all duration-200 shadow-lg hover:shadow-red-500/25"
        >
          <span className="text-white font-semibold">Explore All Products</span>
        </motion.button>
      </motion.div>
    </section>
  );
};

export default DataMarketplace;