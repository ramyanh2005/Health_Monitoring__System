import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Minimize2, 
  Maximize2, 
  ShieldAlert, 
  Check, 
  RotateCcw
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { queryAIAssistant } from '../../services/aiService';
import { ChatMessage } from '../../types/health';
import { sound } from '../../utils/audio';

export const AIAssistantWidget: React.FC = () => {
  const { profile, todayLog, pastLogs, addWater } = useHealth();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initialGreeting: ChatMessage = {
    id: 'msg-init',
    role: 'assistant',
    content: `Hello ${profile.name || 'there'}! 👋 I am your **Healthy Me AI Health Assistant**.\n\nI have real-time access to your health telemetry:\n- 💧 **Hydration:** ${todayLog.waterIntakeMl} / ${todayLog.waterGoalMl} ml\n- 👣 **Steps:** ${todayLog.steps.toLocaleString()} / ${todayLog.stepGoal.toLocaleString()}\n- 🏃 **Active Exercise:** ${todayLog.exerciseMinutes} mins\n- 📊 **Health Score:** ${todayLog.healthScore}/100\n\nHow can I help you elevate your health right now? You can ask me for personalized workouts, meal plans, hydration tips, or progress explanations!`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'How is my health progress?',
      'Suggest a 20 minute exercise.',
      'What should I eat today?',
      'How much water have I consumed?'
    ]
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);
    sound.playTick();

    try {
      const response = await queryAIAssistant(textToSend, profile, todayLog, pastLogs);
      
      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: response.suggestions,
        actionType: response.actionType,
        actionPayload: response.actionPayload
      };

      setMessages(prev => [...prev, assistantMsg]);
      sound.playSuccess();
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered a temporary connection issue. Please ask again or check your settings.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (type?: string, payload?: any) => {
    if (type === 'log_water') {
      addWater(payload?.amountMl || 250);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-act-${Date.now()}`,
          role: 'system',
          content: `💧 Added +${payload?.amountMl || 250} ml water to today's hydration log!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const resetChat = () => {
    setMessages([initialGreeting]);
  };

  return (
    <>
      {/* Floating Action Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            sound.playSuccess();
          }}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all group flex items-center gap-2.5 animate-pulse-glow"
          aria-label="Open AI Health Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-300 rounded-full animate-ping" />
          </div>
          <div className="hidden sm:flex flex-col text-left pr-1">
            <span className="text-xs font-black tracking-tight leading-none">AI Health Coach</span>
            <span className="text-[10px] text-emerald-100 font-semibold mt-0.5">Ask questions • Live</span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-900 rounded-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-300 ${
            isExpanded ? 'w-[calc(100vw-3rem)] sm:w-[650px] h-[80vh]' : 'w-[calc(100vw-3rem)] sm:w-[420px] h-[560px]'
          }`}
        >
          {/* Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white font-heading">Healthy Me AI Assistant</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Context-Aware Wellness Coach</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition"
                title="Reset Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition hidden sm:block"
                title={isExpanded ? 'Minimize Window' : 'Expand Window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition"
                title="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isSystem = msg.role === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center my-2">
                    <span className="text-[11px] px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-slate-200 dark:border-slate-700 font-semibold inline-block">
                      {msg.content}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <div className="space-y-1.5 whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {msg.actionType && (
                      <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
                        <button
                          onClick={() => handleAction(msg.actionType, msg.actionPayload)}
                          className="btn-primary py-1 px-2.5 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Log +{msg.actionPayload?.amountMl || 250} ml Now
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 px-1">{msg.timestamp}</span>

                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1.5 max-w-[95%]">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(sug)}
                          className="text-[11px] py-1 px-2.5 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition text-left shadow-sm"
                        >
                          💬 {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-2xl max-w-[200px] border border-slate-200 dark:border-slate-700 animate-pulse shadow-sm">
                <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
                <span>AI is analyzing your stats...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Medical Disclaimer Banner */}
          <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span className="truncate">
              General wellness guidance only. Not a substitute for professional medical advice.
            </span>
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask about water, workouts, meals, or progress..."
              className="glass-input flex-1 text-xs py-2 px-3"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              className="btn-primary py-2 px-3.5 text-xs font-bold disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
