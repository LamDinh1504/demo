import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';
import mascot from '../assets/chatbot_mascot.png';
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Xin chào! Tôi có thể giúp gì cho bạn trong việc đặt vé máy bay hôm nay?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: 'Có lỗi xảy ra khi kết nối với máy chủ.', sender: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="bot-avatar">
              <img src={mascot} alt="Bot" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            </div>
            <div>
              <h3>Fly Viet Assistant</h3>
              <span>Online</span>
            </div>
          </div>
          
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender === 'user' ? 'user-message' : 'bot-message'}`}>
                {msg.text}
              </div>
            ))}
            {isTyping && <div className="typing">Trợ lý đang trả lời...</div>}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <input 
              type="text" 
              placeholder="Nhập tin nhắn..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="send-btn" onClick={handleSend}>
              <span>➤</span>
            </button>
          </div>
        </div>
      )}

      <div className="chatbot-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <span style={{ fontSize: '24px', color: '#0061ff' }}>✕</span> : <img src={mascot} alt="Mascot" />}
      </div>
    </div>
  );
};

export default Chatbot;
