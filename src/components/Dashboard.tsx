import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Shield, Database, Users } from 'lucide-react';
import CreditScoreCard from './CreditScoreCard';
import ScoreFactors from './ScoreFactors';
import ScoreHistory from './ScoreHistory';
import StatsGrid from './StatsGrid';
import TransactionHistory from './TransactionHistory';

const Dashboard: React.FC = () => {
  return (
    <section id="dashboard" className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 via-violet-500 to-red-600 bg-clip-text text-transparent">
          Your Credit Intelligence
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Real-time decentralized credit scoring powered by blockchain technology and federated learning
        </p>
      </motion.div>

      {/* Stats Grid */}
      <StatsGrid />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Credit Score Card */}
        <div className="lg:col-span-1">
          <CreditScoreCard />
        </div>

        {/* Score History */}
        <div className="lg:col-span-2">
          <ScoreHistory />
        </div>
      </div>

      {/* Transaction History */}
      <TransactionHistory />

      {/* Score Factors */}
      <ScoreFactors />
    </section>
  );
};

export default Dashboard;