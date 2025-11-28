import { useState, useRef, useEffect } from 'react';
import './ChatbotPopup.css';

interface ChatbotPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

function ChatbotPopup({ isOpen, onClose }: ChatbotPopupProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m your cooking assistant powered by Gemini. I can help you with recipe suggestions, cooking tips, ingredient substitutions, and more! What would you like to know?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate Gemini API response (in real app, this would call Gemini API)
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateMockResponse(inputText.trim()),
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateMockResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('recipe') || input.includes('cook')) {
      return 'I\'d be happy to help you with recipes! Based on your question, here are some suggestions:\n\n• For quick meals: Try pasta carbonara or stir-fry dishes\n• For healthy options: Consider quinoa bowls or grilled vegetables\n• For desserts: Chocolate chip cookies or fruit tarts are great choices\n\nWhat type of cuisine or dietary preferences do you have?';
    }
    
    if (input.includes('substitute') || input.includes('replace')) {
      return 'Great question about substitutions! Here are some common ingredient swaps:\n\n• Eggs: Use flax eggs (1 tbsp ground flaxseed + 3 tbsp water)\n• Butter: Try olive oil, coconut oil, or applesauce\n• Milk: Almond milk, oat milk, or coconut milk work well\n• Flour: Almond flour, coconut flour, or gluten-free blends\n\nWhat specific ingredient are you looking to substitute?';
    }
    
    if (input.includes('tip') || input.includes('advice')) {
      return 'Here are some cooking tips to help you:\n\n• Always taste as you cook and adjust seasoning\n• Keep your knives sharp for easier and safer cutting\n• Don\'t overcrowd the pan when sautéing\n• Let meat rest after cooking for juicier results\n• Prep ingredients before you start cooking (mise en place)\n\nIs there a specific cooking technique you\'d like to learn more about?';
    }
    
    if (input.includes('time') || input.includes('how long')) {
      return 'Cooking times can vary, but here are some general guidelines:\n\n• Pasta: 8-12 minutes depending on type\n• Chicken breast: 6-8 minutes per side\n• Vegetables: 3-5 minutes for most stir-fried veggies\n• Rice: 15-20 minutes for white rice\n• Potatoes: 20-30 minutes depending on size and method\n\nWhat specific food are you cooking? I can give you more precise timing!';
    }
    
    return 'That\'s an interesting question! I\'m here to help with all your cooking needs. I can assist with:\n\n• Recipe recommendations and modifications\n• Cooking techniques and tips\n• Ingredient substitutions\n• Meal planning ideas\n• Troubleshooting cooking problems\n\nCould you be more specific about what you\'d like help with?';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="chatbot-overlay" onClick={onClose}>
      <div className="chatbot-popup" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-info">
            <div className="chatbot-avatar">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 12l2 2 4-4"></path>
                <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9c1.5 0 2.91.37 4.15 1.02"></path>
              </svg>
            </div>
            <div>
              <h3>Cooking Assistant</h3>
              <p>Powered by Gemini</p>
            </div>
          </div>
          <button className="chatbot-close" onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.isUser ? 'user-message' : 'bot-message'}`}
            >
              <div className="message-content">
                <p>{message.text}</p>
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot-message">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form className="chatbot-input-form" onSubmit={handleSendMessage}>
          <div className="chatbot-input-container">
            <input
              type="text"
              value={inputText}
              onChange={handleInputChange}
              placeholder="Ask me anything about cooking..."
              className="chatbot-input"
              autoFocus
            />
            <button
              type="submit"
              className="chatbot-send"
              disabled={!inputText.trim()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatbotPopup;
