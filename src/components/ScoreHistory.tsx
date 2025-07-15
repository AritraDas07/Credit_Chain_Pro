import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { useCreditContext } from '../contexts/CreditContext';

const ScoreHistory: React.FC = () => {
  const { creditScore } = useCreditContext();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="backdrop-blur-xl bg-midnight/90 border border-red-500/10 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{label}</p>
          <p className="text-red-400">
            Score: {payload[0].value}
          </p>
          <p className="text-gray-400 text-sm">
            {payload[0].payload.transactions} transactions
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
      
      <div className="relative backdrop-blur-xl bg-midnight/40 border border-red-500/10 rounded-2xl p-8 hover:bg-midnight/50 transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500/20 to-red-600/20">
              <TrendingUp className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Score History</h3>
              <p className="text-sm text-gray-400">6-month trend analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>Last 6 months</span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={creditScore.history}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis 
                domain={['dataMin - 20', 'dataMax + 20']}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="url(#gradient)" 
                strokeWidth={3}
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#dc2626' }}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#dc2626" />
                  <stop offset="100%" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-charcoal/30 rounded-lg">
            <div className="text-xl font-bold text-green-400">+22</div>
            <div className="text-sm text-gray-400">Points gained</div>
          </div>
          <div className="text-center p-4 bg-charcoal/30 rounded-lg">
            <div className="text-xl font-bold text-red-400">{creditScore.score}</div>
            <div className="text-sm text-gray-400">Current score</div>
          </div>
          <div className="text-center p-4 bg-charcoal/30 rounded-lg">
            <div className="text-xl font-bold text-violet-400">320</div>
            <div className="text-sm text-gray-400">Total transactions</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScoreHistory;