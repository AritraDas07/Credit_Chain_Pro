import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowUpRight, ArrowDownLeft, CreditCard, DollarSign, Filter } from 'lucide-react';
import { useCreditContext } from '../contexts/CreditContext';

const TransactionHistory: React.FC = () => {
  const { transactions, addTransaction } = useCreditContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'payment' | 'purchase' | 'income'>('all');
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    type: 'purchase' as 'payment' | 'purchase' | 'transfer' | 'income',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTransaction.amount && newTransaction.description) {
      addTransaction({
        ...newTransaction,
        amount: parseFloat(newTransaction.amount)
      });
      setNewTransaction({
        amount: '',
        type: 'purchase',
        description: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowAddForm(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard className="w-4 h-4 text-green-400" />;
      case 'income': return <ArrowDownLeft className="w-4 h-4 text-blue-400" />;
      case 'purchase': return <ArrowUpRight className="w-4 h-4 text-red-400" />;
      default: return <DollarSign className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'payment': return 'text-green-400';
      case 'income': return 'text-blue-400';
      case 'purchase': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-violet-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
      
      <div className="relative backdrop-blur-xl bg-midnight/40 border border-red-500/10 rounded-2xl p-6 hover:bg-midnight/50 transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-white">Transaction History</h3>
            <p className="text-sm text-gray-400">Recent financial activity</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1 bg-charcoal/50 border border-red-500/10 rounded-lg text-white text-sm focus:outline-none focus:border-red-500/30"
            >
              <option value="all">All</option>
              <option value="payment">Payments</option>
              <option value="purchase">Purchases</option>
              <option value="income">Income</option>
            </select>
            <motion.button
              onClick={() => setShowAddForm(!showAddForm)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-gradient-to-r from-red-600 to-violet-600 rounded-lg hover:from-red-500 hover:to-violet-500 transition-all duration-200"
            >
              <Plus className="w-4 h-4 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Add Transaction Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddTransaction}
              className="mb-6 p-4 bg-charcoal/30 rounded-lg border border-red-500/10"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Amount"
                  value={newTransaction.amount}
                  onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                  className="px-3 py-2 bg-midnight/50 border border-red-500/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500/30"
                  required
                />
                <select
                  value={newTransaction.type}
                  onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value as any})}
                  className="px-3 py-2 bg-midnight/50 border border-red-500/10 rounded-lg text-white focus:outline-none focus:border-red-500/30"
                >
                  <option value="purchase">Purchase</option>
                  <option value="payment">Payment</option>
                  <option value="income">Income</option>
                  <option value="transfer">Transfer</option>
                </select>
                <input
                  type="text"
                  placeholder="Description"
                  value={newTransaction.description}
                  onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                  className="px-3 py-2 bg-midnight/50 border border-red-500/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500/30"
                  required
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newTransaction.category}
                  onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                  className="px-3 py-2 bg-midnight/50 border border-red-500/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500/30"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-violet-600 rounded-lg text-white hover:from-red-500 hover:to-violet-500 transition-all duration-200"
                >
                  Add Transaction
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Transaction List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredTransactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-charcoal/20 rounded-lg hover:bg-charcoal/30 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-charcoal/50 rounded-lg">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="text-white font-medium">{transaction.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>{transaction.category}</span>
                    <span>•</span>
                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${getTransactionColor(transaction.type)}`}>
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-400 capitalize">{transaction.type}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No transactions found</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TransactionHistory;