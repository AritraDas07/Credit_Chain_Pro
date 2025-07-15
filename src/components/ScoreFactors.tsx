import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, Clock, PieChart, Plus } from 'lucide-react';
import { useCreditContext } from '../contexts/CreditContext';

const ScoreFactors: React.FC = () => {
  const { creditScore } = useCreditContext();

  const factors = [
    {
      name: 'Payment History',
      value: creditScore.factors.paymentHistory,
      icon: CreditCard,
      description: 'On-time payments and payment consistency',
      weight: '35%',
      color: 'from-green-400 to-emerald-500'
    },
    {
      name: 'Credit Utilization',
      value: creditScore.factors.creditUtilization,
      icon: PieChart,
      description: 'Percentage of available credit used',
      weight: '30%',
      color: 'from-red-400 to-violet-500'
    },
    {
      name: 'Credit Length',
      value: creditScore.factors.creditLength,
      icon: Clock,
      description: 'Average age of credit accounts',
      weight: '15%',
      color: 'from-violet-400 to-pink-500'
    },
    {
      name: 'Credit Mix',
      value: creditScore.factors.creditMix,
      icon: TrendingUp,
      description: 'Variety of credit account types',
      weight: '10%',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      name: 'New Credit',
      value: creditScore.factors.newCredit,
      icon: Plus,
      description: 'Recent credit inquiries and accounts',
      weight: '10%',
      color: 'from-red-400 to-pink-500'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-white">Score Factors</h3>
        <p className="text-gray-400">Breakdown of your credit score components</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {factors.map((factor, index) => (
          <motion.div
            key={factor.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-violet-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            
            <div className="relative backdrop-blur-xl bg-midnight/40 border border-red-500/10 rounded-xl p-6 hover:bg-midnight/50 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${factor.color} bg-opacity-20`}>
                  <factor.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm">{factor.name}</h4>
                  <p className="text-xs text-gray-400">{factor.weight}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{factor.value}%</span>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${factor.color} bg-opacity-20 text-white`}>
                    {factor.value >= 80 ? 'Excellent' : factor.value >= 60 ? 'Good' : 'Fair'}
                  </div>
                </div>

                <div className="w-full bg-charcoal rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full bg-gradient-to-r ${factor.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.value}%` }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                  />
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  {factor.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ScoreFactors;