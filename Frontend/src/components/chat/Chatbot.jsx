import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User, Trash2, Wifi, WifiOff, Sparkles, Clock, MessageCircle, Zap } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useToast } from '../../hooks/useToast';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';
import ChatBubble from './ChatBubble';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m Jarvis, your AI assistant. How can I help you today?',
      timestamp: Date.now(),
      tone: 'friendly'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTone, setSelectedTone] = useState('friendly');
  const [responseTime, setResponseTime] = useState(null);
  const [showToneSelector, setShowToneSelector] = useState(false);
  
  const messagesEndRef = useRef(null);
  const { sendChatMessage, isConnected, onMessage, offMessage, connectText, backendAvailable } = useWebSocket();
  const { error: showError, success: showSuccess } = useToast();

  const tones = [
    { id: 'friendly', label: 'Friendly', emoji: '😊', color: 'from-green-500 to-emerald-500' },
    { id: 'professional', label: 'Professional', emoji: '💼', color: 'from-blue-500 to-cyan-500' },
    { id: 'casual', label: 'Casual', emoji: '😎', color: 'from-purple-500 to-pink-500' },
    { id: 'enthusiastic', label: 'Enthusiastic', emoji: '🎉', color: 'from-orange-500 to-red-500' },
    { id: 'helpful', label: 'Helpful', emoji: '🤝', color: 'from-indigo-500 to-blue-500' }
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleManualConnect = async () => {
    if (!backendAvailable) {
      showError('Backend server is not available. Please start the backend server first.');
      return;
    }

    try {
      await connectText(
        (message) => {
          console.log('Text WebSocket connected');
          showSuccess('Connected to chat server!');
        },
        (error) => {
          console.error('Text WebSocket connection failed:', error);
          showError('Failed to connect to chat server');
        },
        () => {
          console.log('Text WebSocket disconnected');
        }
      );
    } catch (error) {
      showError('Failed to connect to chat server');
    }
  };

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isTyping) return;

    const startTime = Date.now();
    const userMessage = {
      id: startTime,
      type: 'user',
      content: inputMessage.trim(),
      timestamp: startTime,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setResponseTime(null);

    try {
      if (isConnected) {
        sendChatMessage(inputMessage.trim(), selectedTone);
      } else {
        setTimeout(() => {
          setIsTyping(false);
          const connectionMessage = {
            id: Date.now() + 1,
            type: 'bot',
            content: 'I\'m currently connecting to the server. Please wait a moment and try again.',
            timestamp: Date.now(),
            tone: selectedTone,
          };
          setMessages(prev => [...prev, connectionMessage]);
        }, 1000);
        return;
      }

      const timeout = setTimeout(() => {
        setIsTyping(false);
        const timeoutMessage = {
          id: Date.now() + 2,
          type: 'bot',
          content: 'Sorry, I\'m taking longer than expected to respond. Please try again.',
          timestamp: Date.now(),
          tone: selectedTone,
        };
        setMessages(prev => [...prev, timeoutMessage]);
      }, 15000);

      const handleResponse = (data) => {
        try {
          const response = typeof data === 'string' ? JSON.parse(data) : data;
          
          if (response.type === 'chat_response') {
            clearTimeout(timeout);
            setIsTyping(false);
            
            const endTime = Date.now();
            const responseTimeMs = endTime - startTime;
            setResponseTime(responseTimeMs);
            
            const botMessage = {
              id: endTime,
              type: 'bot',
              content: response.response,
              timestamp: endTime,
              tone: selectedTone,
              responseTime: responseTimeMs
            };
            
            setMessages(prev => [...prev, botMessage]);
            offMessage(handleResponse);
          }
        } catch (error) {
          console.error('Error parsing chat response:', error);
        }
      };

      onMessage(handleResponse);
      
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      showError('Failed to send message');
    }
  }, [inputMessage, isTyping, selectedTone, isConnected, sendChatMessage, onMessage, offMessage, showError]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: Date.now(),
        type: 'bot',
        content: 'Hello! I\'m Jarvis, your AI assistant. How can I help you today?',
        timestamp: Date.now(),
        tone: selectedTone
      }
    ]);
    setResponseTime(null);
  }, [selectedTone]);

  const getToneEmoji = useCallback((tone) => {
    const toneObj = tones.find(t => t.id === tone);
    return toneObj ? toneObj.emoji : '🤖';
  }, [tones]);

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-dark-bg-primary via-dark-bg-secondary to-dark-bg-tertiary border-0 shadow-2xl overflow-hidden">
      {/* Enhanced Header with Better Spacing */}
      <div className="flex items-center justify-between p-8 border-b border-dark-border/50 bg-gradient-to-r from-dark-bg-primary to-dark-bg-secondary relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-secondary-500/5 animate-pulse-slow"></div>
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse-slow">
              <Bot size={28} className="text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-3 border-dark-bg-primary animate-pulse"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-transparent rounded-2xl animate-spin-slow"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              Jarvis Chatbot
              <Sparkles size={20} className="text-primary-400 animate-spin-slow" />
            </h2>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowToneSelector(!showToneSelector)}
            className="text-muted hover:text-white transition-all duration-300 hover:scale-105 px-4 py-2"
          >
            <MessageCircle size={18} />
            <span className="ml-2 text-sm">Tone</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="text-muted hover:text-red-400 transition-all duration-300 hover:scale-105 px-4 py-2"
          >
            <Trash2 size={18} />
            <span className="ml-2 text-sm">Clear</span>
          </Button>
        </div>
      </div>

      {/* Enhanced Tone Selector with Better Spacing */}
      {showToneSelector && (
        <div className="px-8 py-6 bg-dark-bg-tertiary/50 border-b border-dark-border/30 animate-slide-down">
          <div className="flex flex-wrap gap-3">
            {tones.map((tone) => (
              <button
                key={tone.id}
                onClick={() => {
                  setSelectedTone(tone.id);
                  setShowToneSelector(false);
                }}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  selectedTone === tone.id
                    ? `bg-gradient-to-r ${tone.color} text-white shadow-lg`
                    : 'bg-dark-bg-secondary text-muted hover:text-white hover:bg-dark-bg-primary'
                }`}
              >
                <span className="mr-2 text-lg">{tone.emoji}</span>
                {tone.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Messages Area with Better Spacing */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gradient-to-b from-dark-bg-primary/50 to-dark-bg-secondary/50">
        {!isConnected && !backendAvailable && (
          <div className="text-center py-12 animate-fade-in">
            <WifiOff size={64} className="text-red-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Backend Server Unavailable</h3>
            <p className="text-muted mb-8 text-lg">Please start the backend server to use the chatbot.</p>
            <Button
              variant="primary"
              onClick={handleManualConnect}
              className="animate-pulse px-8 py-4 text-lg"
            >
              <Wifi size={20} className="mr-3" />
              Try to Connect
            </Button>
          </div>
        )}

        {!isConnected && backendAvailable && (
          <div className="text-center py-12 animate-fade-in">
            <Wifi size={64} className="text-yellow-400 mx-auto mb-6 animate-pulse" />
            <h3 className="text-2xl font-bold text-white mb-4">Connecting to Server...</h3>
            <p className="text-muted mb-8 text-lg">Attempting to establish connection with the chat server.</p>
            <Button
              variant="primary"
              onClick={handleManualConnect}
              className="animate-pulse px-8 py-4 text-lg"
            >
              <Zap size={20} className="mr-3" />
              Connect Now
            </Button>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`animate-fade-in-up`}
            style={{ animationDelay: `${index * 0.15}s` }}
          >
            <ChatBubble
              message={message}
              tone={message.tone || selectedTone}
              showTimestamp={true}
              formatTimestamp={formatTimestamp}
            />
            {message.responseTime && (
              <div className="flex items-center justify-center mt-3 text-sm text-muted animate-fade-in">
                <Clock size={14} className="mr-2" />
                Response time: {message.responseTime}ms
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-4 p-6 bg-dark-bg-secondary rounded-2xl animate-fade-in shadow-lg">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
              <Bot size={24} className="text-white" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-muted text-lg">Jarvis is typing</span>
              <div className="flex gap-2">
                <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Enhanced Input Area with Better Spacing */}
      <div className="p-8 border-t border-dark-border/50 bg-gradient-to-r from-dark-bg-primary to-dark-bg-secondary">
        <form onSubmit={handleSendMessage} className="flex gap-4">
          <div className="flex-1 relative">
            <Input
              type="text"
              placeholder={isConnected ? "Ask me anything..." : "Connecting to server..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={!isConnected || isTyping}
              className="w-full pr-16 bg-dark-bg-tertiary border-dark-border focus:border-primary-500 transition-all duration-300 text-lg py-4"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <span className="text-muted text-lg">{getToneEmoji(selectedTone)}</span>
            </div>
          </div>
          
          <Button
            type="submit"
            variant="primary"
            disabled={!inputMessage.trim() || isTyping || !isConnected}
            className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            <Send size={20} />
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default Chatbot;