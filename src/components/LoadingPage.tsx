import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Database, TrendingUp, Zap } from 'lucide-react';

interface LoadingPageProps {
  onLoadingComplete: () => void;
}

const LoadingPage: React.FC<LoadingPageProps> = ({ onLoadingComplete }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const loadingSteps = [
    { label: 'Initializing Blockchain Connection', icon: Shield, duration: 1000 },
    { label: 'Loading Credit Intelligence', icon: Database, duration: 1200 },
    { label: 'Analyzing Market Data', icon: TrendingUp, duration: 800 },
    { label: 'Optimizing Performance', icon: Zap, duration: 600 }
  ];

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    let stepTimeout: NodeJS.Timeout;

    const startLoading = () => {
      progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            setIsComplete(true);
            setTimeout(() => onLoadingComplete(), 800);
            return 100;
          }
          return prev + 1;
        });
      }, 35);

      // Step progression
      loadingSteps.forEach((step, index) => {
        stepTimeout = setTimeout(() => {
          setCurrentStep(index);
        }, loadingSteps.slice(0, index).reduce((acc, s) => acc + s.duration, 0));
      });
    };

    startLoading();

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stepTimeout);
    };
  }, [onLoadingComplete]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-midnight via-dark-purple to-charcoal flex items-center justify-center overflow-hidden"
      >
        {/* Animated Background Particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-red-500 rounded-full opacity-40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-midnight/90 via-dark-purple/70 to-charcoal/90" />

        {/* Main Loading Content */}
        <div className="relative z-10 text-center space-y-8 max-w-md mx-auto px-6">
          {/* Animated Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative mx-auto"
          >
            <div className="relative">
              {/* Outer Ring */}
              <motion.div
                className="w-24 h-24 mx-auto relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 rounded-full border-2 border-red-500/30" />
                <div className="absolute inset-2 rounded-full border border-violet-400/20" />
              </motion.div>

              {/* Center Logo */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.1, 1],
                  filter: ['hue-rotate(0deg)', 'hue-rotate(60deg)', 'hue-rotate(0deg)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/25">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </motion.div>

              {/* Pulse Effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-r from-red-500/20 to-violet-500/20"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 0, 0.5]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Brand Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-2"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-violet-500 to-red-600 bg-clip-text text-transparent">
              CreditChain Pro
            </h1>
            <p className="text-gray-400 font-mono text-sm">
              Decentralized Credit Intelligence
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="space-y-4"
          >
            <div className="relative">
              <div className="w-full h-2 bg-charcoal/50 rounded-full overflow-hidden backdrop-blur-sm">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 via-violet-500 to-red-600 rounded-full relative"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </motion.div>
              </div>
              
              {/* Progress Percentage */}
              <motion.div
                className="absolute -top-8 left-0 text-sm font-mono text-red-400"
                animate={{ left: `${progress}%` }}
                transition={{ duration: 0.3 }}
                style={{ transform: 'translateX(-50%)' }}
              >
                {progress}%
              </motion.div>
            </div>

            {/* Loading Steps */}
            <div className="space-y-3">
              {loadingSteps.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ 
                    opacity: index <= currentStep ? 1 : 0.3,
                    x: 0,
                    scale: index === currentStep ? 1.05 : 1
                  }}
                  transition={{ duration: 0.4 }}
                  className={`flex items-center space-x-3 p-3 rounded-lg backdrop-blur-sm transition-all duration-300 ${
                    index === currentStep 
                      ? 'bg-charcoal/60 border border-red-500/30' 
                      : 'bg-charcoal/20'
                  }`}
                >
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    index === currentStep
                      ? 'bg-gradient-to-r from-red-500/20 to-violet-500/20'
                      : 'bg-charcoal/30'
                  }`}>
                    <step.icon className={`w-4 h-4 transition-colors duration-300 ${
                      index === currentStep ? 'text-red-400' : 'text-gray-500'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium transition-colors duration-300 ${
                    index === currentStep ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                  
                  {/* Loading Dots */}
                  {index === currentStep && (
                    <div className="flex space-x-1 ml-auto">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="w-1 h-1 bg-red-400 rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ 
                            duration: 0.8, 
                            repeat: Infinity, 
                            delay: i * 0.2 
                          }}
                        />
                      ))}
                    </div>
                  )}
                  
                  {/* Checkmark for completed steps */}
                  {index < currentStep && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center ml-auto"
                    >
                      <motion.div
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Completion Animation */}
          <AnimatePresence>
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="text-center space-y-4">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, 360]
                    }}
                    transition={{ duration: 0.8 }}
                    className="w-16 h-16 mx-auto bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center"
                  >
                    <motion.svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-green-400 font-semibold"
                  >
                    Ready to Launch!
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Corner Decorations */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-violet-500/10 to-transparent rounded-tl-full" />
      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingPage;