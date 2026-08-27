import React, { useState, useRef, useEffect } from 'react';
import { useWellness } from '../../context/WellnessContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { Bot, X, Send, Sparkles, Volume2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  suggestions?: string[];
}

const QUICK_PROMPTS = [
  'What seated stretches relieve lower back tension?',
  'How to distribute hydration throughout the day for wheelchair users?',
  'Suggest easy high-protein vegetarian snacks',
  'Is 2.2L water target calibrated well for 65kg weight?',
  'How to do mindful box breathing safely?'
];

export const NutriBotChat: React.FC = () => {
  const { userProfile } = useWellness();
  const { speakText } = useAccessibility();


  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'bot',
      text: `Hello ${userProfile.name}! 👋 I am your NutriTrack AI & Girak Health Companion. How can I support your nutrition, hydration, or gentle seated wellness today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: QUICK_PROMPTS.slice(0, 3)
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const generateAIResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('back') || q.includes('stretch') || q.includes('tension') || q.includes('exercise')) {
      return `For wheelchair and seated mobility, gentle **Seated Shoulder Rolls** and **Thoracic Arm Openings** work wonders to alleviate upper and lower back tightness. Always keep your back supported, breathe deeply into the belly, and stop if you feel any sharp pinching.`;
    }

    if (q.includes('water') || q.includes('hydration') || q.includes('2.2') || q.includes('drink')) {
      return `For your current weight of **${userProfile.weightKg} kg** and **${userProfile.mobilityLevel}** routine, your **${(userProfile.dailyWaterTargetMl / 1000).toFixed(1)} L** daily target is ideal. To avoid bladder strain, try sipping 200–250 ml every 90 minutes rather than large quantities at once!`;
    }

    if (q.includes('snack') || q.includes('protein') || q.includes('vegetarian') || q.includes('food') || q.includes('meal')) {
      return `Great vegetarian choices with gentle digestion include **Roasted Foxnuts (Makhana)** with almonds, **Warm Sprouted Moong Salad** with lemon, or **Paneer/Tofu cubes** seasoned with cumin. They supply steady amino acids and magnesium without causing heavy lethargy.`;
    }

    if (q.includes('breathing') || q.includes('breath') || q.includes('calm') || q.includes('stress')) {
      return `Try **Mindful Box Breathing**: Inhale smoothly for 4 seconds, hold gently for 4 seconds, exhale for 4 seconds, and rest for 4 seconds. This activates the parasympathetic vagus nerve, reducing resting heart rate and relaxing tense muscles.`;
    }

    if (q.includes('bmi') || q.includes('weight') || q.includes('height')) {
      return `Your BMI of **${(userProfile.weightKg / Math.pow(userProfile.heightCm / 100, 2)).toFixed(1)}** is in the **Healthy range**. Remember, BMI is just a broad screening metric. Your daily comfort, joint mobility, and steady hydration are the true cornerstones of wellness.`;
    }

    return `Thank you for asking! For ${userProfile.mobilityLevel} and your ${userProfile.dietaryPreference} dietary preferences, focus on steady low-impact movement, mindful hydration pacing, and wholesome seasonal nutrition. Feel free to explore our guided routines or log your meal photo!`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = generateAIResponse(text);
      const botMsg: ChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800);
  };

  const handleSpeak = (text: string) => {
    speakText(text.replace(/\*\*/g, ''));
  };

  return (
    <>
      {/* Floating Launcher Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-primary"
          aria-label="Open NutriTrack AI & Girak Health Chatbot"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 900,
            borderRadius: 'var(--radius-full)',
            padding: '0.85rem 1.35rem',
            boxShadow: '0 8px 24px rgba(13, 148, 136, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Bot size={18} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Ask NutriBot AI / Girak</span>
        </button>
      )}

      {/* Floating Chatbot Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="NutriTrack AI / Girak Health Assistant Chat"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '90vw',
            maxWidth: '420px',
            height: '560px',
            maxHeight: '85vh',
            backgroundColor: 'var(--color-bg-card)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-xl)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 9999,
            animation: 'fadeIn 0.25s ease-out'
          }}
        >
          {/* Chat Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--color-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: '#ffffff' }}>
                  NutriBot AI &bull; Girak Assistant
                </h3>
                <span style={{ fontSize: '10px', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
                  Adaptive Health Companion Online
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn-secondary"
                style={{
                  padding: '0.35rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'transparent',
                  color: '#ffffff',
                  border: 'none',
                  minHeight: 'auto'
                }}
                aria-label="Minimize Chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.85rem',
              backgroundColor: 'var(--color-bg-main)'
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '0.75rem 1rem',
                    borderRadius: msg.sender === 'user' ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    backgroundColor: msg.sender === 'user' ? 'var(--color-primary)' : 'var(--color-bg-card)',
                    color: msg.sender === 'user' ? '#ffffff' : 'var(--color-text-main)',
                    border: msg.sender === 'user' ? 'none' : '1px solid var(--color-border)',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: 'var(--text-xs)',
                    lineHeight: 1.5
                  }}
                >
                  <p style={{ margin: 0 }}>{msg.text}</p>

                  {/* Read Aloud Button for Bot */}
                  {msg.sender === 'bot' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => handleSpeak(msg.text)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '10px',
                          color: 'var(--color-primary)',
                          fontWeight: 600,
                          padding: '0.1rem 0.3rem',
                          borderRadius: 'var(--radius-sm)'
                        }}
                        title="Read message aloud"
                      >
                        <Volume2 size={12} /> Listen
                      </button>
                    </div>
                  )}
                </div>

                <span style={{ fontSize: '10px', color: 'var(--color-text-light)', marginTop: '2px', padding: '0 4px' }}>
                  {msg.timestamp}
                </span>

                {/* Quick Prompts below initial greeting */}
                {msg.suggestions && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem', width: '100%' }}>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase' }}>
                      Suggested Questions:
                    </span>
                    {msg.suggestions.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleSendMessage(prompt)}
                        className="btn-secondary"
                        style={{
                          padding: '0.4rem 0.65rem',
                          fontSize: '11px',
                          textAlign: 'left',
                          justifyContent: 'flex-start',
                          minHeight: 'auto',
                          borderRadius: 'var(--radius-md)',
                          backgroundColor: 'var(--color-bg-card)'
                        }}
                      >
                        <Sparkles size={12} color="var(--color-primary)" />
                        <span>{prompt}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '11px', padding: '0.25rem' }}>
                <Bot size={14} color="var(--color-primary)" />
                <span>NutriBot is formulating personalized guidance...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips Bar */}
          <div
            style={{
              padding: '0.4rem 0.75rem',
              backgroundColor: 'var(--color-bg-card)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: '0.35rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {QUICK_PROMPTS.slice(2, 5).map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-bg-card-subtle)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-main)',
                  flexShrink: 0
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-bg-card)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <input
              type="text"
              placeholder="Ask about exercises, hydration, or meals..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              style={{
                flex: 1,
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                fontSize: 'var(--text-xs)',
                backgroundColor: 'var(--color-bg-card-subtle)',
                color: 'var(--color-text-main)'
              }}
            />

            <button
              type="submit"
              disabled={!inputText.trim()}
              className="btn-primary"
              style={{
                width: '38px',
                height: '38px',
                padding: 0,
                borderRadius: '50%',
                minHeight: 'auto',
                flexShrink: 0
              }}
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>

          {/* Disclaimer Footer */}
          <div
            style={{
              padding: '0.35rem 0.75rem',
              backgroundColor: 'var(--color-bg-card-subtle)',
              borderTop: '1px solid var(--color-border)',
              fontSize: '9px',
              color: 'var(--color-text-light)',
              textAlign: 'center'
            }}
          >
            NutriTrack AI / Girak provides supportive wellness guidance, not medical diagnosis.
          </div>
        </div>
      )}
    </>
  );
};
