import React from 'react';
import { User, Bot, Clock } from 'lucide-react';
import { formatDateTime } from '../../utils/helpers';

const ChatBubble = ({ message, emoji, showTimestamp = true, formatTimestamp }) => {
  const isUser = message.type === 'user';
  
  const formatTime = (timestamp) => {
    if (formatTimestamp) {
      return formatTimestamp(timestamp);
    }
    return formatDateTime(timestamp);
  };
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up`}>
      {/* Enhanced Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transition-all duration-300 hover:scale-110 ${
        isUser 
          ? 'bg-gradient-to-br from-secondary-500 to-secondary-600' 
          : 'bg-gradient-to-br from-primary-500 to-primary-600'
      }`}>
        {isUser ? (
          <User size={18} className="text-white" />
        ) : (
          <div className="relative">
            <Bot size={18} className="text-white" />
            {emoji && (
              <div className="absolute -top-1 -right-1 text-xs animate-bounce">
                {emoji}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Message Content */}
      <div className={`max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
          isUser
            ? 'bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-br-md'
            : 'bg-gradient-to-br from-dark-bg-tertiary to-dark-bg-secondary text-white rounded-bl-md border border-dark-border/30'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          
          {/* Response Time for Bot Messages */}
          {!isUser && message.responseTime && (
            <div className="flex items-center gap-1 mt-2 text-xs text-muted">
              <Clock size={10} />
              <span>{message.responseTime}ms</span>
            </div>
          )}
        </div>
        
        {/* Enhanced Timestamp */}
        {showTimestamp && (
          <div className={`flex items-center gap-1 mt-2 text-xs text-muted ${isUser ? 'justify-end' : 'justify-start'}`}>
            <Clock size={10} />
            <span>{formatTime(message.timestamp)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;