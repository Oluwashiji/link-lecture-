import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, ChevronDown } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function LLAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm **LL Assistant**, your academic support assistant for Lecture-Link. I can help you find course materials, answer questions, and guide you around the platform. How can I help?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 640);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || isLoading) return;

    const currentMessages = [...messages];
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'You need to be logged in to use LL Assistant. Please refresh and log in again.'
        }]);
        return;
      }

      const conversationHistory = currentMessages
        .slice(1)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: msg, conversationHistory })
      });

      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply || data.message || 'Sorry, something went wrong.'
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  };

  // ── MOBILE: full screen overlay ──
  const mobileStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
  };

  // ── DESKTOP: bottom-right floating panel ──
  const desktopStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    width: '380px',
    height: '520px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
    border: '1px solid #e5e7eb',
  };

  return (
    <>
      {/* Floating bubble */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: '#0158fe',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(1,88,254,0.45)',
            zIndex: 9999,
          }}
        >
          <MessageCircle size={22} />
        </button>
      )}

      {/* Chat window */}
      {isOpen && (
        <div style={isDesktop ? desktopStyle : mobileStyle}>

          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            backgroundColor: '#012060',
            borderTopLeftRadius: isDesktop ? '16px' : 0,
            borderTopRightRadius: isDesktop ? '16px' : 0,
            flexShrink: 0,
          }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: '#0158fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Bot size={20} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'white', fontWeight: 700, fontSize: '15px', margin: 0 }}>
                LL Assistant
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>
                Academic Support · Lecture-Link
              </p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                cursor: 'pointer',
                color: 'white',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isDesktop ? <X size={18} /> : <ChevronDown size={20} />}
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            backgroundColor: '#f8f9ff',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '8px',
                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-start',
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  backgroundColor: msg.role === 'assistant' ? '#0158fe' : '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {msg.role === 'assistant'
                    ? <Bot size={15} color="white" />
                    : <User size={15} color="#6b7280" />
                  }
                </div>
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'assistant'
                    ? '4px 16px 16px 16px'
                    : '16px 4px 16px 16px',
                  backgroundColor: msg.role === 'assistant' ? 'white' : '#0158fe',
                  color: msg.role === 'assistant' ? '#1f2937' : 'white',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                }}>
                  <span dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                </div>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  backgroundColor: '#0158fe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bot size={15} color="white" />
                </div>
                <div style={{
                  padding: '10px 16px',
                  borderRadius: '4px 16px 16px 16px',
                  backgroundColor: 'white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center',
                }}>
                  {/* Animated dots */}
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{
                      width: '8px', height: '8px', borderRadius: '50%',
                      backgroundColor: '#0158fe',
                      animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                    }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: 'white',
            borderBottomLeftRadius: isDesktop ? '16px' : 0,
            borderBottomRightRadius: isDesktop ? '16px' : 0,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask LL Assistant..."
                disabled={isLoading}
                style={{
                  flex: 1,
                  fontSize: '14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '24px',
                  padding: '10px 16px',
                  outline: 'none',
                  backgroundColor: '#f9fafb',
                  color: '#1f2937',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: input.trim() && !isLoading ? '#0158fe' : '#e5e7eb',
                  border: 'none',
                  cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background-color 0.2s',
                }}
              >
                <Send size={16} color="white" />
              </button>
            </div>
            <p style={{
              fontSize: '11px',
              color: '#9ca3af',
              textAlign: 'center',
              margin: '8px 0 0',
            }}>
              Powered by Lecture-Link AI
            </p>
          </div>

          {/* Bounce animation */}
          <style>{`
            @keyframes bounce {
              0%, 60%, 100% { transform: translateY(0); }
              30% { transform: translateY(-6px); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
