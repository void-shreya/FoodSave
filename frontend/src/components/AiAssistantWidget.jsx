import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Trash2,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Bot,
  User,
  ChevronDown,
  ExternalLink,
  Minimize2,
  Maximize2
} from 'lucide-react';
import aiService from '../services/aiService';

const INITIAL_GREETING = {
  id: 'init-msg',
  sender: 'ai',
  text: `👋 **Welcome to FoodSave AI Assistant!**\n\nI am your dedicated companion for food rescue, safety standards, and hunger relief. How can I help you today?`,
  suggestedQuestions: [
    "What is the Temperature Danger Zone?",
    "How do I list surplus food?",
    "Are there any available donations right now?",
    "How does volunteer delivery work?",
    "Show current platform impact"
  ],
  actions: [
    { label: "Browse Food", path: "/donations" },
    { label: "Our Impact", path: "/impact" }
  ],
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
};

export const AiAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('foodsave_ai_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed reading chat history', e);
    }
    return [INITIAL_GREETING];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [feedbackState, setFeedbackState] = useState({});
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Listen for global custom event to open AI assistant (from Navbar, buttons, etc.)
  useEffect(() => {
    const handleOpenAi = (e) => {
      setIsOpen(true);
      setHasUnread(false);
      if (e.detail?.query) {
        handleSend(e.detail.query);
      }
    };
    window.addEventListener('open-foodsave-ai', handleOpenAi);
    return () => window.removeEventListener('open-foodsave-ai', handleOpenAi);
  }, [messages]);

  // Persist messages in localStorage
  useEffect(() => {
    try {
      localStorage.setItem('foodsave_ai_chat', JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed persisting chat', e);
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const speakText = (text) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      // Strip markdown syntax for natural voice reading
      const clean = text.replace(/[*#_`~[\]]/g, '').replace(/https?:\/\/\S+/g, '');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error', e);
    }
  };

  const handleSend = async (messageToSend = null) => {
    const query = (messageToSend || inputText).trim();
    if (!query || isLoading) return;

    setInputText('');
    const userMsgId = 'msg-' + Date.now();
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Prepare previous conversation history for context
      const chatHistory = messages
        .filter((m) => m.id !== 'init-msg')
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'model',
          text: m.text
        }));

      const response = await aiService.sendMessage(query, chatHistory);

      const aiMsg = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: response.reply,
        suggestedQuestions: response.suggestedQuestions || [],
        actions: response.actions || [],
        modelUsed: response.modelUsed || 'FoodSave-Engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
      speakText(response.reply);

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error('AI chat failed:', err);
      const errorMsg = {
        id: 'msg-err-' + Date.now(),
        sender: 'ai',
        text: `⚠️ I encountered a temporary connection issue. Please check your network and try again, or explore our [Donations Directory](/donations).`,
        suggestedQuestions: ["How do I donate food?", "Show platform impact"],
        actions: [{ label: "Browse Donations", path: "/donations" }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Reset conversation history with FoodSave AI?')) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setMessages([INITIAL_GREETING]);
      try {
        localStorage.removeItem('foodsave_ai_chat');
      } catch (e) {}
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (msgId, type) => {
    setFeedbackState((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === type ? null : type
    }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple Markdown renderer for bold, lists, and line breaks
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold parsing **bold**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} style={{ color: 'inherit' }}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <div key={idx} style={{ display: 'flex', gap: '8px', marginTop: '4px', marginLeft: '4px' }}>
            <span style={{ color: 'var(--primary)' }}>•</span>
            <span style={{ flex: 1 }}>{renderedLine}</span>
          </div>
        );
      }

      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} style={{ marginTop: '6px', fontWeight: line.includes(':') ? 600 : 400 }}>
            {renderedLine}
          </div>
        );
      }

      return (
        <div key={idx} style={{ minHeight: line.trim() === '' ? '8px' : 'auto', marginTop: '2px' }}>
          {renderedLine}
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px'
        }}
      >
        {/* Unread Pill or Tooltip when closed */}
        {!isOpen && (
          <div
            onClick={() => setIsOpen(true)}
            style={{
              backgroundColor: '#1B5E20',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              animation: 'bounce 2s infinite',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={14} color="#FFB300" />
            <span>Ask FoodSave AI</span>
          </div>
        )}

        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setHasUnread(false);
          }}
          aria-label="Toggle FoodSave AI Assistant"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(46, 125, 50, 0.4), 0 2px 6px rgba(0,0,0,0.1)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            cursor: 'pointer',
            transition: 'transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.2s',
            transform: isOpen ? 'rotate(90deg)' : 'scale(1)',
            position: 'relative'
          }}
          onMouseEnter={(e) => {
            if (!isOpen) e.currentTarget.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            if (!isOpen) e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {isOpen ? (
            <X size={26} />
          ) : (
            <>
              <Bot size={28} />
              {hasUnread && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '14px',
                    height: '14px',
                    backgroundColor: 'var(--accent)',
                    border: '2px solid #ffffff',
                    borderRadius: '50%'
                  }}
                />
              )}
            </>
          )}
        </button>
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="FoodSave AI Assistant Chat"
          style={{
            position: 'fixed',
            bottom: isExpanded ? '20px' : '96px',
            right: isExpanded ? '20px' : '24px',
            width: isExpanded ? 'calc(100vw - 40px)' : '420px',
            maxWidth: isExpanded ? '900px' : 'calc(100vw - 32px)',
            height: isExpanded ? 'calc(100vh - 40px)' : '580px',
            maxHeight: 'calc(100vh - 110px)',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.18), 0 4px 12px rgba(46, 125, 50, 0.1)',
            border: '1px solid rgba(46, 125, 50, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9998,
            animation: 'fadeInUp 0.25s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                  position: 'relative'
                }}
              >
                <Bot size={22} color="#ffffff" />
                <span
                  style={{
                    position: 'absolute',
                    bottom: '-1px',
                    right: '-1px',
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#4ade80',
                    border: '2px solid #1B5E20',
                    borderRadius: '50%'
                  }}
                  title="Online"
                />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                  FoodSave AI
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#c8e6c9', opacity: 0.9 }}>
                  Food Safety & Community Assistant
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* Voice toggle */}
              <button
                onClick={() => {
                  if (speechEnabled && window.speechSynthesis) window.speechSynthesis.cancel();
                  setSpeechEnabled(!speechEnabled);
                }}
                style={{
                  background: speechEnabled ? 'rgba(255, 255, 255, 0.3)' : 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                title={speechEnabled ? 'Mute Speech' : 'Enable Speech Reading'}
              >
                {speechEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              {/* Clear chat */}
              <button
                onClick={handleClearChat}
                style={{
                  background: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                title="Clear Chat History"
              >
                <Trash2 size={16} />
              </button>

              {/* Expand / Collapse */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  background: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                title={isExpanded ? 'Restore size' : 'Expand window'}
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Quick Suggestions Chips Bar */}
          <div
            style={{
              padding: '8px 14px',
              backgroundColor: '#f8faf8',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
              scrollbarWidth: 'none'
            }}
          >
            {[
              { label: '🍲 Safety rules', query: 'What are the food safety guidelines?' },
              { label: '📦 How to donate', query: 'How do I donate surplus food?' },
              { label: '🚴 Volunteer', query: 'How does volunteer pickup and delivery work?' },
              { label: '📊 Platform impact', query: 'Show me current platform impact' },
              { label: '📍 Available food', query: 'Are there any available donations right now?' }
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.query)}
                disabled={isLoading}
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: '#ffffff',
                  color: '#1b5e20',
                  border: '1px solid #c8e6c9',
                  borderRadius: '14px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8f5e9';
                  e.currentTarget.style.borderColor = '#2e7d32';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#c8e6c9';
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: '#fafcfa'
            }}
          >
            {messages.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isAi ? 'flex-start' : 'flex-end',
                    maxWidth: '100%'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '8px',
                      maxWidth: isAi ? '92%' : '85%',
                      flexDirection: isAi ? 'row' : 'row-reverse'
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: isAi ? '#e8f5e9' : '#2E7D32',
                        color: isAi ? '#2E7D32' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px',
                        border: isAi ? '1px solid #c8e6c9' : 'none'
                      }}
                    >
                      {isAi ? <Bot size={16} /> : <User size={16} />}
                    </div>

                    {/* Bubble */}
                    <div
                      style={{
                        backgroundColor: isAi ? '#ffffff' : '#2E7D32',
                        color: isAi ? '#1f2937' : '#ffffff',
                        padding: '12px 14px',
                        borderRadius: isAi ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                        boxShadow: isAi
                          ? '0 2px 6px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)'
                          : '0 2px 8px rgba(46, 125, 50, 0.25)',
                        border: isAi ? '1px solid #e5e7eb' : 'none',
                        fontSize: '0.88rem',
                        lineHeight: 1.5,
                        wordBreak: 'break-word'
                      }}
                    >
                      {renderFormattedText(msg.text)}

                      {/* Interactive Action Buttons if attached */}
                      {msg.actions && msg.actions.length > 0 && (
                        <div
                          style={{
                            marginTop: '12px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            borderTop: isAi ? '1px solid #f3f4f6' : '1px solid rgba(255,255,255,0.2)',
                            paddingTop: '10px'
                          }}
                        >
                          {msg.actions.map((act, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={() => {
                                setIsOpen(false);
                                navigate(act.path);
                              }}
                              style={{
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                backgroundColor: isAi ? '#2E7D32' : '#ffffff',
                                color: isAi ? '#ffffff' : '#2E7D32',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '6px 12px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                cursor: 'pointer',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                              }}
                            >
                              <span>{act.label}</span>
                              <ArrowRight size={13} />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Metadata and Controls row for AI responses */}
                  {isAi && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginTop: '4px',
                        marginLeft: '36px',
                        fontSize: '0.7rem',
                        color: '#9ca3af'
                      }}
                    >
                      <span>{msg.timestamp}</span>

                      {/* Copy */}
                      <button
                        onClick={() => handleCopy(msg.text, msg.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6b7280',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          padding: 0
                        }}
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check size={12} color="#16a34a" />
                            <span style={{ color: '#16a34a' }}>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      {/* Helpful Reaction */}
                      <button
                        onClick={() => handleFeedback(msg.id, 'up')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: feedbackState[msg.id] === 'up' ? '#16a34a' : '#6b7280',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title="Helpful"
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, 'down')}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: feedbackState[msg.id] === 'down' ? '#dc2626' : '#6b7280',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title="Not helpful"
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </div>
                  )}

                  {/* Suggested questions follow-up chips */}
                  {isAi && msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        marginLeft: '36px',
                        marginTop: '8px',
                        width: 'calc(100% - 36px)'
                      }}
                    >
                      <span style={{ fontSize: '0.72rem', color: '#6b7280', fontWeight: 600 }}>
                        Related Questions:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {msg.suggestedQuestions.map((sq, sqIdx) => (
                          <button
                            key={sqIdx}
                            onClick={() => handleSend(sq)}
                            disabled={isLoading}
                            style={{
                              fontSize: '0.75rem',
                              backgroundColor: '#ffffff',
                              color: '#2e7d32',
                              border: '1px dashed #a5d6a7',
                              borderRadius: '10px',
                              padding: '4px 10px',
                              cursor: 'pointer',
                              textAlign: 'left'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#e8f5e9';
                              e.currentTarget.style.borderColor = '#2e7d32';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ffffff';
                              e.currentTarget.style.borderColor = '#a5d6a7';
                            }}
                          >
                            👉 {sq}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '4px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#e8f5e9',
                    color: '#2E7D32',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Bot size={16} />
                </div>
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    padding: '10px 14px',
                    borderRadius: '4px 16px 16px 16px',
                    display: 'flex',
                    gap: '4px',
                    alignItems: 'center'
                  }}
                >
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#2E7D32',
                      animation: 'pulse 1s infinite alternate'
                    }}
                  />
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#2E7D32',
                      animation: 'pulse 1s infinite alternate 0.2s'
                    }}
                  />
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#2E7D32',
                      animation: 'pulse 1s infinite alternate 0.4s'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '6px' }}>
                    Consulting FoodSave knowledge...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#ffffff',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about food safety, donating, pickups..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: '1.5px solid #d1d5db',
                borderRadius: '24px',
                fontSize: '0.88rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: '#ffffff'
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2E7D32')}
              onBlur={(e) => (e.target.style.borderColor = '#d1d5db')}
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: inputText.trim() && !isLoading ? '#2E7D32' : '#e5e7eb',
                color: inputText.trim() && !isLoading ? '#ffffff' : '#9ca3af',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'background-color 0.2s, transform 0.1s'
              }}
              title="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistantWidget;
