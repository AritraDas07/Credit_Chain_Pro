import React from 'react';
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DataMarketplace from './components/DataMarketplace';
import LenderPortal from './components/LenderPortal';
import LoadingPage from './components/LoadingPage';
import { CreditProvider } from './contexts/CreditContext';

function App() {
  const [isLoading, setIsLoading] = React.useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoadingPage onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <CreditProvider>
      <div className="min-h-screen bg-gradient-to-br from-midnight via-dark-purple to-charcoal relative overflow-hidden">
        {/* Spline Background Animation */}
        <div className="fixed inset-0 z-0">
          <Spline
            scene="https://prod.spline.design/7jwHFIgQscJG32DZ/scene.splinecode"
            className="w-full h-full opacity-20"
          />
        </div>

        {/* Gradient Overlay */}
        <div className="fixed inset-0 bg-gradient-to-br from-midnight/80 via-dark-purple/60 to-charcoal/90 z-10" />

        {/* Main Content */}
        <div className="relative z-20">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <Dashboard />
              <DataMarketplace />
              <LenderPortal />
            </motion.div>
          </main>
        </div>

        {/* Floating Particles */}
        <div className="fixed inset-0 pointer-events-none z-15">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-red-400 rounded-full opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
    </CreditProvider>
  );
}

export default App;