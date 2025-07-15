import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, LogOut, Loader } from 'lucide-react';
import { useCreditContext } from '../contexts/CreditContext';
import { useCreditScoreRegistry } from '../hooks/useContract';

const WalletButton: React.FC = () => {
  const { isWalletConnected, walletAddress, walletBalance, connectWallet, disconnectWallet, isLoading } = useCreditContext();
  const { contract, isLoading: contractLoading } = useCreditScoreRegistry();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600/20 to-violet-600/20 rounded-lg border border-red-500/30"
      >
        <Loader className="w-5 h-5 text-red-400 animate-spin" />
        <span className="text-red-400 font-medium">Connecting...</span>
      </motion.div>
    );
  }

  if (isWalletConnected) {
    return (
      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-4 px-4 py-2 bg-gradient-to-r from-charcoal/50 to-dark-purple/50 rounded-lg border border-red-500/10 backdrop-blur-xl">
          <div className="text-right">
            <p className="text-sm text-gray-300 font-mono">
              {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
            </p>
            <p className="text-xs text-red-400 font-mono">
              {walletBalance.toFixed(3)} ETH
            </p>
            {contractLoading && (
              <p className="text-xs text-yellow-400">Loading contracts...</p>
            )}
          </div>
        </div>
        <motion.button
          onClick={disconnectWallet}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors group"
        >
          <LogOut className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
          <span className="text-red-400 font-medium">Disconnect</span>
        </motion.button>
      </div>
    );
  }

  return (
    <motion.button
      onClick={connectWallet}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-600 to-violet-600 rounded-lg hover:from-red-500 hover:to-violet-500 transition-all duration-200 shadow-lg hover:shadow-red-500/25 group"
    >
      <Wallet className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
      <span className="text-white font-semibold">Connect Wallet</span>
    </motion.button>
  );
};

export default WalletButton;