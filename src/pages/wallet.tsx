import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import Head from 'next/head';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';

// Transaction type
type Transaction = {
  id: string;
  type: 'deposit' | 'withdrawal' | 'win' | 'loss';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description: string;
};

export default function Wallet() {
  const { currentUser, realBalance } = useAuth();
  const router = useRouter();
  const [balance, setBalance] = useState(10000); // Mock balance
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      // Delay redirect to show message
      const redirectTimer = setTimeout(() => {
        router.push('/login');
      }, 3000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [currentUser, router]);

  // If not authenticated, show login message
  if (!currentUser) {
    return (
      <>
        <Head>
          <title>My Wallet | Foxxy</title>
          <meta name="description" content="Manage your funds on Foxxy" />
        </Head>
        <div className="flex h-screen bg-white text-gray-800">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header onAdd={null} />
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center p-8 bg-gray-100 rounded-xl shadow-md max-w-md">
                <div className="text-red-500 text-5xl mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold mb-2">Login Required</h1>
                <p className="text-gray-600 mb-4">Please login before doing any transaction</p>
                <p className="text-sm text-gray-500">Redirecting to login page...</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Generate mock transaction history
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      {
        id: 'txn-001',
        type: 'deposit',
        amount: 5000,
        status: 'completed',
        date: '2023-05-15T10:30:00',
        description: 'Initial deposit'
      },
      {
        id: 'txn-002',
        type: 'win',
        amount: 2500,
        status: 'completed',
        date: '2023-05-16T14:20:00',
        description: 'Win: Mumbai Indians vs Chennai Super Kings'
      },
      {
        id: 'txn-003',
        type: 'loss',
        amount: 1000,
        status: 'completed',
        date: '2023-05-17T18:45:00',
        description: 'Loss: Arsenal vs Chelsea'
      },
      {
        id: 'txn-004',
        type: 'withdrawal',
        amount: 2000,
        status: 'completed',
        date: '2023-05-18T09:15:00',
        description: 'Withdrawal to bank account'
      },
      {
        id: 'txn-005',
        type: 'deposit',
        amount: 3000,
        status: 'completed',
        date: '2023-05-19T11:30:00',
        description: 'Deposit from credit card'
      }
    ];
    
    setTransactions(mockTransactions);
  }, []);

  // Handle deposit submission
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;

    if (paymentMethod === 'credit-card' && !showCardForm) {
      setShowCardForm(true);
      return;
    }

    // Validate card details if payment method is credit card
    if (paymentMethod === 'credit-card' && showCardForm) {
      if (!validateCardDetails()) {
        return;
      }
    }
    
    try {
      setIsProcessing(true);
      
      // Simulate API call to payment processor
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add deposit to transactions
      const newTransaction: Transaction = {
        id: `txn-${Date.now()}`,
        type: 'deposit',
        amount: parseFloat(depositAmount),
        status: 'completed',
        date: new Date().toISOString(),
        description: `Deposit via ${paymentMethod === 'credit-card' ? 'Credit Card' : 'UPI'}`
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      // Reset form
      setDepositAmount('');
      setShowCardForm(false);
      setCardDetails({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
      });
      
      // Show success alert
      alert(`Successfully deposited $${parseFloat(depositAmount).toFixed(2)}`);
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle withdrawal submission
  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    
    // Check if enough balance
    if (parseFloat(withdrawAmount) > realBalance) {
      alert('Insufficient balance');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Simulate API call to payment processor
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add withdrawal to transactions
      const newTransaction: Transaction = {
        id: `txn-${Date.now()}`,
        type: 'withdrawal',
        amount: parseFloat(withdrawAmount),
        status: 'completed',
        date: new Date().toISOString(),
        description: `Withdrawal to bank account`
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      // Reset form
      setWithdrawAmount('');
      
      // Show success alert
      alert(`Successfully withdrew $${parseFloat(withdrawAmount).toFixed(2)}`);
    } catch (error) {
      console.error('Transaction failed:', error);
      alert('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Validate card details
  const validateCardDetails = () => {
    // Basic card number validation (16 digits)
    if (!/^\d{16}$/.test(cardDetails.cardNumber.replace(/\s/g, ''))) {
      alert('Please enter a valid 16-digit card number');
      return false;
    }

    // Name on card validation
    if (cardDetails.cardName.trim().length < 3) {
      alert('Please enter the name on your card');
      return false;
    }

    // Expiry date validation (MM/YY format)
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      alert('Please enter a valid expiry date (MM/YY)');
      return false;
    }

    // CVV validation (3 or 4 digits)
    if (!/^\d{3,4}$/.test(cardDetails.cvv)) {
      alert('Please enter a valid CVV');
      return false;
    }

    return true;
  };

  // Handle card input changes
  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format card number with spaces
  const formatCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\s/g, '');
    let formatted = '';
    
    for (let i = 0; i < input.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += input[i];
    }
    
    setCardDetails(prev => ({
      ...prev,
      cardNumber: formatted.substring(0, 19) // 16 digits + 3 spaces
    }));
  };

  // Format expiry date (MM/YY)
  const formatExpiryDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, '');
    let formatted = input;
    
    if (input.length > 2) {
      formatted = input.substring(0, 2) + '/' + input.substring(2, 4);
    }
    
    setCardDetails(prev => ({
      ...prev,
      expiryDate: formatted.substring(0, 5) // MM/YY
    }));
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Head>
        <title>My Wallet | Foxxy</title>
        <meta name="description" content="Manage your funds on Foxxy" />
      </Head>
      <div className="flex h-screen bg-white text-gray-800">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header onAdd={null} />
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">My Wallet</h1>
                
                {/* Balance Card */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl p-6 mb-8 text-white shadow-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white/80 mb-1">Current Balance</p>
                      <h2 className="text-3xl font-bold">
                        <span className="bg-green-500 px-3 py-1 rounded text-white">
                          ${realBalance.toFixed(2)}
                        </span>
                      </h2>
                    </div>
                    <div className="bg-white/20 p-3 rounded-full">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-white/80">Account ID:</span>
                    <span className="ml-2 font-medium">{currentUser?.uid?.substring(0, 8) || 'GUEST-USER'}</span>
                  </div>
                </div>
                
                {/* Deposit/Withdraw Section */}
                <div className="bg-white rounded-xl shadow mb-8 overflow-hidden border border-gray-200">
                  {/* Tabs */}
                  <div className="flex border-b border-gray-200">
                    <button
                      className={`flex-1 py-4 text-center font-medium transition ${
                        activeTab === 'deposit'
                          ? 'text-purple-600 border-b-2 border-purple-600'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                      onClick={() => {
                        setActiveTab('deposit');
                        setShowCardForm(false);
                      }}
                    >
                      Deposit
                    </button>
                    <button
                      className={`flex-1 py-4 text-center font-medium transition ${
                        activeTab === 'withdraw'
                          ? 'text-purple-600 border-b-2 border-purple-600'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                      onClick={() => {
                        setActiveTab('withdraw');
                        setShowCardForm(false);
                      }}
                    >
                      Withdraw
                    </button>
                  </div>
                  
                  {/* Deposit Form */}
                  {activeTab === 'deposit' && (
                    <div className="p-6">
                      {!showCardForm ? (
                        <form onSubmit={handleDeposit}>
                          <div className="mb-4">
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                              Amount ($)
                            </label>
                            <input
                              type="number"
                              id="amount"
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              min="5"
                              step="1"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              placeholder="Enter amount"
                              required
                            />
                          </div>
                          
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Payment Method
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              <div
                                className={`border ${
                                  paymentMethod === 'credit-card' 
                                    ? 'border-purple-500 bg-purple-50' 
                                    : 'border-gray-300'
                                } rounded-lg p-4 cursor-pointer`}
                                onClick={() => setPaymentMethod('credit-card')}
                              >
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                  </div>
                                  <span className="ml-3 font-medium">Credit/Debit Card</span>
                                </div>
                              </div>
                              <div
                                className={`border ${
                                  paymentMethod === 'upi' 
                                    ? 'border-purple-500 bg-purple-50' 
                                    : 'border-gray-300'
                                } rounded-lg p-4 cursor-pointer`}
                                onClick={() => setPaymentMethod('upi')}
                              >
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                  <span className="ml-3 font-medium">UPI</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-6">
                            <button
                              type="submit"
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                              disabled={isProcessing}
                            >
                              {isProcessing ? 'Processing...' : 'Deposit Now'}
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div>
                          <div className="mb-4 flex items-center">
                            <button 
                              onClick={() => setShowCardForm(false)}
                              className="text-purple-600 hover:text-purple-800 mr-2"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                            </button>
                            <h3 className="text-lg font-medium">Card Details</h3>
                          </div>
                          
                          <form onSubmit={handleDeposit}>
                            <div className="p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50">
                              <p className="text-sm font-medium text-gray-600 mb-2">Deposit Amount</p>
                              <p className="text-lg font-bold text-purple-600">${parseFloat(depositAmount).toFixed(2)}</p>
                            </div>
                            
                            <div className="mb-4">
                              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Card Number
                              </label>
                              <input
                                type="text"
                                id="cardNumber"
                                name="cardNumber"
                                value={cardDetails.cardNumber}
                                onChange={formatCardNumber}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="1234 5678 9012 3456"
                                required
                                maxLength={19}
                              />
                            </div>
                            
                            <div className="mb-4">
                              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">
                                Name on Card
                              </label>
                              <input
                                type="text"
                                id="cardName"
                                name="cardName"
                                value={cardDetails.cardName}
                                onChange={handleCardChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                placeholder="John Doe"
                                required
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                                  Expiry Date
                                </label>
                                <input
                                  type="text"
                                  id="expiryDate"
                                  name="expiryDate"
                                  value={cardDetails.expiryDate}
                                  onChange={formatExpiryDate}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  placeholder="MM/YY"
                                  required
                                  maxLength={5}
                                />
                              </div>
                              <div>
                                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                                  CVV
                                </label>
                                <input
                                  type="password"
                                  id="cvv"
                                  name="cvv"
                                  value={cardDetails.cvv}
                                  onChange={handleCardChange}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                  placeholder="123"
                                  required
                                  maxLength={4}
                                />
                              </div>
                            </div>
                            
                            <div className="mt-6">
                              <button
                                type="submit"
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                                disabled={isProcessing}
                              >
                                {isProcessing ? 'Processing...' : 'Confirm Payment'}
                              </button>
                            </div>
                            
                            <div className="mt-4 flex items-center justify-center">
                              <div className="text-gray-500 text-sm flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Secure Payment
                              </div>
                            </div>
                          </form>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Withdraw Form */}
                  {activeTab === 'withdraw' && (
                    <div className="p-6">
                      <form onSubmit={handleWithdraw}>
                        <div className="mb-4">
                          <label htmlFor="withdraw-amount" className="block text-sm font-medium text-gray-700 mb-1">
                            Amount ($)
                          </label>
                          <input
                            type="number"
                            id="withdraw-amount"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            min="5"
                            max={realBalance}
                            step="1"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Enter amount"
                            required
                          />
                          <p className="text-sm text-gray-500 mt-1">Available: ${realBalance.toFixed(2)}</p>
                        </div>
                        
                        <div className="mb-4">
                          <label htmlFor="bank-details" className="block text-sm font-medium text-gray-700 mb-1">
                            Bank Account
                          </label>
                          <select
                            id="bank-details"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          >
                            <option value="bank1">HDFC Bank - XXXX6789</option>
                            <option value="bank2">ICICI Bank - XXXX5432</option>
                            <option value="bank3">SBI - XXXX9876</option>
                          </select>
                        </div>
                        
                        <div className="mt-6">
                          <button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                            disabled={isProcessing}
                          >
                            {isProcessing ? 'Processing...' : 'Withdraw Now'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
                
                {/* Transaction History */}
                <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">Transaction History</h3>
                  </div>
                  
                  <div className="divide-y divide-gray-200">
                    {transactions.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        No transactions yet
                      </div>
                    ) : (
                      transactions.map(transaction => (
                        <div key={transaction.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                transaction.type === 'deposit' || transaction.type === 'win'
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-red-100 text-red-600'
                              }`}>
                                {transaction.type === 'deposit' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                                  </svg>
                                )}
                                {transaction.type === 'withdrawal' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                                  </svg>
                                )}
                                {transaction.type === 'win' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                                {transaction.type === 'loss' && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                )}
                              </div>
                              <div className="ml-4">
                                <p className="font-medium">
                                  {transaction.type === 'deposit' && 'Deposit'}
                                  {transaction.type === 'withdrawal' && 'Withdrawal'}
                                  {transaction.type === 'win' && 'Win'}
                                  {transaction.type === 'loss' && 'Loss'}
                                </p>
                                <p className="text-sm text-gray-500">{transaction.description}</p>
                                <p className="text-xs text-gray-400">{formatDate(transaction.date)}</p>
                              </div>
                            </div>
                            <div className={`font-semibold ${
                              transaction.type === 'deposit' || transaction.type === 'win'
                                ? 'text-green-600'
                                : 'text-red-600'
                            }`}>
                              {transaction.type === 'deposit' || transaction.type === 'win' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 