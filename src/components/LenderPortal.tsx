import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Users, TrendingUp, Shield, BarChart3, FileText, CheckCircle } from 'lucide-react';
import { useLenderPortal } from '../hooks/useContract';
import { useCreditContext } from '../contexts/CreditContext';

const LenderPortal: React.FC = () => {
  const [requestedAccess, setRequestedAccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState({
    companyName: '',
    licenseNumber: ''
  });
  
  const { requestAPIAccess, registerLender, isLoading: contractLoading } = useLenderPortal();
  const { isWalletConnected } = useCreditContext();

  const features = [
    {
      name: 'Batch Processing',
      description: 'Process thousands of credit requests simultaneously',
      icon: Users,
      color: 'from-red-400 to-violet-500'
    },
    {
      name: 'Risk Analytics',
      description: 'Advanced risk assessment with ML models',
      icon: TrendingUp,
      color: 'from-violet-400 to-pink-500'
    },
    {
      name: 'Compliance Tools',
      description: 'Built-in regulatory reporting and compliance',
      icon: Shield,
      color: 'from-green-400 to-emerald-500'
    },
    {
      name: 'Custom Models',
      description: 'Deploy your own risk scoring models',
      icon: BarChart3,
      color: 'from-yellow-400 to-orange-500'
    }
  ];

  const stats = [
    { label: 'Processing Time', value: '< 5 seconds' },
    { label: 'Accuracy Rate', value: '94.2%' },
    { label: 'API Uptime', value: '99.9%' },
    { label: 'Integrated Lenders', value: '150+' }
  ];

  const handleRequestAccess = async () => {
    if (!isWalletConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    setIsProcessing(true);
    setTransactionHash(null);
    
    try {
      const result = await requestAPIAccess('premium');
      setTransactionHash(result.transactionHash);
      setRequestedAccess(true);
      
      setTimeout(() => {
        alert(`API Access granted! Transaction: ${result.transactionHash.slice(0, 10)}...`);
      }, 500);
    } catch (error) {
      console.error('API access request failed:', error);
      alert('Request failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleRegisterLender = async () => {
    if (!isWalletConnected) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (!registrationData.companyName || !registrationData.licenseNumber) {
      alert('Please fill in all required fields');
      return;
    }
    
    setIsProcessing(true);
    setTransactionHash(null);
    
    try {
      const result = await registerLender(registrationData.companyName, registrationData.licenseNumber);
      setTransactionHash(result.transactionHash);
      
      setTimeout(() => {
        alert(`Registration successful! Transaction: ${result.transactionHash.slice(0, 10)}...`);
      }, 500);
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 via-pink-500 to-red-600 bg-clip-text text-transparent">
          Lender Portal
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Enterprise-grade credit scoring solutions for financial institutions
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Features */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <h3 className="text-2xl font-bold text-white">Enterprise Features</h3>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-5 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300`} />
                
                <div className="relative backdrop-blur-xl bg-midnight/40 border border-red-500/10 rounded-xl p-4 hover:bg-midnight/50 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${feature.color} bg-opacity-20`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{feature.name}</h4>
                      <p className="text-sm text-gray-400">{feature.description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats & CTA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6"
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-red-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            
            <div className="relative backdrop-blur-xl bg-midnight/40 border border-red-500/10 rounded-2xl p-8 hover:bg-midnight/50 transition-all duration-300">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500/20 to-red-600/20">
                  <Building className="w-8 h-8 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Performance Metrics</h3>
                  <p className="text-sm text-gray-400">Real-time platform statistics</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    className="text-center p-4 bg-charcoal/30 rounded-lg"
                  >
                    <div className="text-lg font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Registration Form */}
              <div className="space-y-4 mb-6">
                <h4 className="text-lg font-semibold text-white">Lender Registration</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={registrationData.companyName}
                    onChange={(e) => setRegistrationData({...registrationData, companyName: e.target.value})}
                    className="w-full px-3 py-2 bg-midnight/50 border border-red-500/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500/30"
                  />
                  <input
                    type="text"
                    placeholder="License Number"
                    value={registrationData.licenseNumber}
                    onChange={(e) => setRegistrationData({...registrationData, licenseNumber: e.target.value})}
                    className="w-full px-3 py-2 bg-midnight/50 border border-red-500/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500/30"
                  />
                </div>
                <motion.button
                  onClick={handleRegisterLender}
                  disabled={isProcessing || !isWalletConnected}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-violet-600 rounded-lg hover:from-red-500 hover:to-violet-500 transition-all duration-200 shadow-lg hover:shadow-red-500/25 disabled:opacity-50"
                >
                  <span className="text-white font-semibold">
                    {isProcessing ? 'Registering...' : 'Register as Lender'}
                  </span>
                </motion.button>
              </div>
              
              {/* Transaction Hash Display */}
              {transactionHash && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-xs font-mono">
                    Transaction: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                  </p>
                </div>
              )}
              
              {!isWalletConnected && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">Please connect your wallet to access lender features</p>
                </div>
              )}

              <div className="space-y-3">
                {requestedAccess ? (
                  <div className="flex items-center justify-center space-x-2 py-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold">Access Requested Successfully</span>
                  </div>
                ) : (
                  <motion.button
                    onClick={handleRequestAccess}
                    disabled={contractLoading || isProcessing || !isWalletConnected}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-red-600 rounded-lg hover:from-violet-500 hover:to-red-500 transition-all duration-200 shadow-lg hover:shadow-violet-500/25 disabled:opacity-50"
                  >
                    <span className="text-white font-semibold">{isProcessing ? 'Processing...' : 'Request API Access'}</span>
                  </motion.button>
                )}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 bg-charcoal/50 border border-red-500/10 rounded-lg hover:bg-charcoal/70 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 font-medium">View Documentation</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LenderPortal;