import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { useCreditContext } from '../contexts/CreditContext';
import { useCreditScoreRegistry } from '../hooks/useContract';

const CreditScoreCard: React.FC = () => {
  const { creditScore, updateScore, walletAddress } = useCreditContext();
  const { getScore, updateScore: updateScoreOnChain, isLoading: contractLoading } = useCreditScoreRegistry();
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(creditScore.score);
    }, 500);
    return () => clearTimeout(timer);
  }, [creditScore.score]);

  const handleUpdateScore = async () => {
    setIsUpdating(true);
    setTransactionHash(null);
    
    try {
      if (walletAddress) {
        // Get updated score from blockchain
        const onChainScore = await getScore(walletAddress);
        
        // Update score on blockchain (simulate oracle update)
        const tx = await updateScoreOnChain(walletAddress, onChainScore + Math.floor(Math.random() * 20) - 10);
        setTransactionHash(tx.transactionHash);
        
        // Update local state
        updateScore();
      } else {
        // Fallback to local update if no wallet connected
        await new Promise(resolve => setTimeout(resolve, 1500));
        updateScore();
      }
    } catch (error) {
      console.error('Failed to update score:', error);
      // Fallback to local update
      updateScore();
    }
    
    setIsUpdating(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'from-green-400 to-emerald-500';
    if (score >= 700) return 'from-red-400 to-violet-500';
    if (score >= 650) return 'from-yellow-400 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const getScoreIcon = (tier: string) => {
    switch (tier) {
      case 'Excellent': return <Award className="w-6 h-6 text-green-400" />;
      case 'Good': return <CheckCircle className="w-6 h-6 text-red-400" />;
      case 'Fair': return <AlertCircle className="w-6 h-6 text-yellow-400" />;
      default: return <AlertCircle className="w-6 h-6 text-red-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-violet-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
      
      <div className="relative backdrop-blur-xl bg-midnight/40 border border-red-500/10 rounded-2xl p-8 hover:bg-midnight/50 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {getScoreIcon(creditScore.tier)}
            <div>
              <h3 className="text-xl font-bold text-white">Credit Score</h3>
              <p className="text-sm text-gray-400">Real-time assessment</p>
            </div>
          </div>
          <motion.button
            onClick={handleUpdateScore}
            disabled={isUpdating || contractLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-charcoal/50 border border-red-500/10 hover:bg-charcoal/70 transition-colors group disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors ${isUpdating || contractLoading ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>

        {/* Score Display */}
        <div className="text-center space-y-4">
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-32 h-32 mx-auto relative"
            >
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - animatedScore / 850) }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#7c3aed" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1 }}
                    className="text-3xl font-bold text-white"
                  >
                    {animatedScore}
                  </motion.div>
                  <div className="text-xs text-gray-400">/ 850</div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          <div className="space-y-2">
            <div className={`text-2xl font-bold bg-gradient-to-r ${getScoreColor(creditScore.score)} bg-clip-text text-transparent`}>
              {creditScore.tier}
            </div>
            <p className="text-sm text-gray-400">
              {creditScore.score >= 750 ? 'Outstanding creditworthiness' :
               creditScore.score >= 700 ? 'Good creditworthiness' :
               creditScore.score >= 650 ? 'Fair creditworthiness' :
               'Needs improvement'}
            </p>
          </div>
        </div>

        {/* Score Range */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Poor</span>
            <span>Fair</span>
            <span>Good</span>
            <span>Excellent</span>
          </div>
          <div className="w-full bg-charcoal rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-500 via-yellow-500 via-red-400 to-green-500 h-2 rounded-full relative"
            >
              <div 
                className="absolute top-0 w-3 h-3 bg-white rounded-full border-2 border-red-400 transform -translate-y-0.5"
                style={{ left: `${(creditScore.score / 850) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Transaction Hash Display */}
        {transactionHash && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-xs text-green-400 font-mono">
              Transaction: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
            </p>
          </div>
        )}

        {/* Recommendations */}
        <div className="mt-6 space-y-2">
          <h4 className="text-sm font-semibold text-white">Recommendations</h4>
          <div className="space-y-1">
            {creditScore.recommendations.slice(0, 2).map((rec, index) => (
              <p key={index} className="text-xs text-gray-400 flex items-start space-x-2">
                <span className="text-red-400 mt-1">•</span>
                <span>{rec}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreditScoreCard;