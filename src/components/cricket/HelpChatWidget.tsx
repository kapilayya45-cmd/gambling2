import React, { useState } from 'react';

interface HelpChatWidgetProps {
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const HelpChatWidget: React.FC<HelpChatWidgetProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Hello! How can I help you with your cricket betting today?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [showFaq, setShowFaq] = useState(false);
  
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // Simulate agent response after a short delay
    setTimeout(() => {
      const agentMessage: ChatMessage = {
        id: `agent_${Date.now()}`,
        text: getAutoResponse(inputText),
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }, 1000);
  };
  
  const getAutoResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    // Simple auto-responses based on keywords
    if (lowerQuestion.includes('back') && lowerQuestion.includes('lay')) {
      return 'Back betting means you bet ON a selection to win, while lay betting means you bet AGAINST a selection winning. With lay betting, you act like the bookmaker.';
    }
    
    if (lowerQuestion.includes('deposit') || lowerQuestion.includes('withdraw')) {
      return 'We support multiple payment methods including UPI, bank transfer, and e-wallets. Deposits are instant, while withdrawals typically take 1-24 hours to process.';
    }
    
    if (lowerQuestion.includes('odds') || lowerQuestion.includes('price')) {
      return 'Our odds are displayed in decimal format by default. You can switch to fractional or American odds using the toggle above the odds grid.';
    }
    
    return 'Thank you for your question. One of our support agents will respond shortly. Meanwhile, would you like to check our FAQ section?';
  };
  
  // Sample FAQ items
  const faqItems = [
    {
      question: 'What is the difference between Back and Lay betting?',
      answer: 'Back betting means you bet ON a selection to win, while lay betting means you bet AGAINST a selection winning. With lay betting, you act like the bookmaker.'
    },
    {
      question: 'How are my winnings calculated?',
      answer: 'For back bets: Winnings = Stake × (Odds - 1). For lay bets: Winnings = Stake, but your liability is Stake × (Odds - 1).'
    },
    {
      question: 'How do I deposit funds?',
      answer: 'Go to your wallet, click "Deposit" and select your preferred payment method. We support UPI, bank transfer, and various e-wallets.'
    },
    {
      question: 'What is responsible gambling?',
      answer: 'Responsible gambling means betting for entertainment, not as a source of income. Set limits, never chase losses, and bet only what you can afford to lose.'
    }
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-[#0a0d14] border border-[#1a2030] rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-black rounded-t-lg p-3 flex justify-between items-center">
        <h3 className="text-white font-medium">Customer Support</h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowFaq(!showFaq)}
            className="text-xs text-white bg-[#25b95f] rounded-full w-6 h-6 flex items-center justify-center"
          >
            ?
          </button>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Chat/FAQ Content */}
      <div className="h-80 overflow-y-auto p-3">
        {!showFaq ? (
          // Chat messages
          <div className="space-y-3">
            {messages.map(message => (
              <div 
                key={message.id}
                className={`max-w-[80%] ${message.isUser ? 'ml-auto' : 'mr-auto'}`}
              >
                <div className={`p-2 rounded-lg ${
                  message.isUser 
                    ? 'bg-[#25b95f] text-white' 
                    : 'bg-black text-white'
                }`}>
                  {message.text}
                </div>
                <div className={`text-xs text-gray-400 mt-1 ${message.isUser ? 'text-right' : ''}`}>
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // FAQ section
          <div className="space-y-4">
            <h4 className="text-white font-medium">Frequently Asked Questions</h4>
            {faqItems.map((item, index) => (
              <div key={index} className="bg-black p-3 rounded-lg">
                <div className="font-medium text-[#25b95f] mb-1">{item.question}</div>
                <div className="text-sm text-white">{item.answer}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Input area - only shown in chat mode */}
      {!showFaq && (
        <div className="bg-black rounded-b-lg p-3">
          <div className="flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-[#0a0d14] border border-[#1a2030] rounded-l p-2 text-white text-sm"
            />
            <button
              onClick={handleSendMessage}
              className="bg-[#25b95f] text-white p-2 rounded-r"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Floating button component to trigger the chat widget
export const HelpButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-4 right-4 z-50 bg-[#25b95f] hover:bg-[#25b95f]/80 text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  </button>
);

export default HelpChatWidget; 