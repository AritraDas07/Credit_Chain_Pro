import React, { createContext, useContext, useState, useEffect } from 'react';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'payment' | 'purchase' | 'transfer' | 'income';
  description: string;
  category: string;
}

interface CreditScore {
  score: number;
  tier: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  factors: {
    paymentHistory: number;
    creditUtilization: number;
    creditLength: number;
    creditMix: number;
    newCredit: number;
  };
  history: Array<{
    month: string;
    score: number;
    transactions: number;
  }>;
  recommendations: string[];
}

interface CreditContextType {
  creditScore: CreditScore;
  isWalletConnected: boolean;
  walletAddress: string | null;
  walletBalance: number;
  transactions: Transaction[];
  isLoading: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  updateScore: () => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  calculateScoreFromTransactions: () => void;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export const CreditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [creditScore, setCreditScore] = useState<CreditScore>({
    score: 742,
    tier: 'Good',
    factors: {
      paymentHistory: 85,
      creditUtilization: 72,
      creditLength: 68,
      creditMix: 78,
      newCredit: 82,
    },
    history: [
      { month: 'Jan', score: 720, transactions: 45 },
      { month: 'Feb', score: 735, transactions: 52 },
      { month: 'Mar', score: 728, transactions: 48 },
      { month: 'Apr', score: 742, transactions: 55 },
      { month: 'May', score: 755, transactions: 62 },
      { month: 'Jun', score: 742, transactions: 58 },
    ],
    recommendations: [
      'Pay down credit card balances to improve utilization ratio',
      'Set up automatic payments to avoid late fees',
      'Consider keeping old credit accounts open',
      'Diversify your credit mix with different account types'
    ]
  });

  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      date: '2025-01-15',
      amount: 2500,
      type: 'payment',
      description: 'Credit Card Payment',
      category: 'Finance'
    },
    {
      id: '2',
      date: '2025-01-14',
      amount: 150,
      type: 'purchase',
      description: 'Grocery Store',
      category: 'Food'
    },
    {
      id: '3',
      date: '2025-01-13',
      amount: 5000,
      type: 'income',
      description: 'Salary Deposit',
      category: 'Income'
    },
    {
      id: '4',
      date: '2025-01-12',
      amount: 80,
      type: 'purchase',
      description: 'Gas Station',
      category: 'Transportation'
    },
    {
      id: '5',
      date: '2025-01-11',
      amount: 1200,
      type: 'payment',
      description: 'Rent Payment',
      category: 'Housing'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = async () => {
    setIsLoading(true);
    // Simulate wallet connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsWalletConnected(true);
    setWalletAddress('0x742d35Cc6634C0532925a3b8D814B3c13a5d2C48');
    setWalletBalance(Math.random() * 10 + 1); // Random balance between 1-11 ETH
    setIsLoading(false);
  };

  const disconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletAddress(null);
    setWalletBalance(0);
  };

  const calculateScoreFromTransactions = () => {
    const recentTransactions = transactions.slice(0, 10);
    const paymentTransactions = recentTransactions.filter(t => t.type === 'payment');
    const totalSpending = recentTransactions
      .filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = recentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate factors based on transaction patterns
    const paymentHistory = Math.min(95, (paymentTransactions.length / recentTransactions.length) * 100 + 20);
    const creditUtilization = Math.max(10, 100 - (totalSpending / Math.max(totalIncome, 1000)) * 100);
    const creditLength = Math.random() * 30 + 50; // Simulated
    const creditMix = Math.random() * 20 + 70; // Simulated
    const newCredit = Math.random() * 25 + 65; // Simulated

    // Calculate overall score
    const newScore = Math.round(
      (paymentHistory * 0.35) +
      (creditUtilization * 0.30) +
      (creditLength * 0.15) +
      (creditMix * 0.10) +
      (newCredit * 0.10)
    ) * 8.5; // Scale to 850 max

    const tier = newScore >= 750 ? 'Excellent' : 
                 newScore >= 700 ? 'Good' : 
                 newScore >= 650 ? 'Fair' : 'Poor';

    setCreditScore(prev => ({
      ...prev,
      score: newScore,
      tier,
      factors: {
        paymentHistory: Math.round(paymentHistory),
        creditUtilization: Math.round(creditUtilization),
        creditLength: Math.round(creditLength),
        creditMix: Math.round(creditMix),
        newCredit: Math.round(newCredit),
      }
    }));
  };

  const updateScore = () => {
    calculateScoreFromTransactions();
  };

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Recalculate score after adding transaction
    setTimeout(() => {
      calculateScoreFromTransactions();
    }, 100);
  };

  // Recalculate score when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      calculateScoreFromTransactions();
    }
  }, []);

  return (
    <CreditContext.Provider value={{
      creditScore,
      isWalletConnected,
      walletAddress,
      walletBalance,
      transactions,
      isLoading,
      connectWallet,
      disconnectWallet,
      updateScore,
      addTransaction,
      calculateScoreFromTransactions,
    }}>
      {children}
    </CreditContext.Provider>
  );
};

export const useCreditContext = () => {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error('useCreditContext must be used within a CreditProvider');
  }
  return context;
};