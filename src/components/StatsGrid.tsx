import React from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Database, TrendingUp, Globe, Zap } from 'lucide-react';

const StatsGrid: React.FC = () => {
  const stats = [
    {
      name: 'Active Users',
      value: '124K+',
      icon: Users,
      color: 'from-red-400 to-violet-500',
      change: '+12%',
      description: 'Global users'
    },
    {
      name: 'Data Points',
      value: '2.4M+',
      icon: Database,
      color: 'from-green-400 to-emerald-500',
      change: '+8%',
      description: 'Processed daily'
    },
    {
      name: 'Security Score',
      value: '99.9%',
      icon: Shield,
      color: 'from-violet-400 to-pink-500',
      change: '+0.1%',
      description: 'Uptime guarantee'
    },
    {
      name: 'Prediction Accuracy',
      value: '94.2%',
      icon: TrendingUp,
      color: 'from-yellow-400 to-orange-500',
      change: '+2.1%',
      description: 'ML model accuracy'
    },
    {
      name: 'Global Reach',
      value: '45+',
      icon: Globe,
      color: 'from-red-400 to-pink-500',
      change: '+3',
      description: 'Countries served'
    },
    {
      name: 'Response Time',
      value: '< 2s',
      icon: Zap,
      color: 'from-red-400 to-violet-500',
      change: '-15%',
      description: 'Average response'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="group relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-violet-500/10 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300" />
          
          <div className="relative backdrop-blur-xl bg-midnight/40 border border-red-500/10 rounded-xl p-4 hover:bg-midnight/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} bg-opacity-20`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <div className={`text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${stat.color} bg-opacity-20 text-white`}>
                {stat.change}
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.name}</div>
              <div className="text-xs text-gray-500">{stat.description}</div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsGrid;