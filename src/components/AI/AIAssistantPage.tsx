import React, { useState } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  RotateCcw,
  Check
} from 'lucide-react';
import { useHealth } from '../../context/HealthContext';
import { queryAIAssistant } from '../../services/aiService';
import { ChatMessage } from '../../types/health';
import { sound } from '../../utils/audio';

export const AIAssistantPage: React.FC = () => {
  const { profile, todayLog, pastLogs, addWater } = useHealth();
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'page-msg-init',
      role: 'assistant',
      content: `Welcome to your **AI Health & Longevity Consultation Center**, ${profile.name}!\n\nI have evaluated your complete health profile and live telemetry:\n- 🎯 **Primary Goal:** ${profile.fitnessGoal.replace('_', ' ').toUpperCase()}\n- 💧 **Hydration Status:** ${todayLog.waterIntakeMl} / ${todayLog.waterGoalMl} ml (${Math.round((todayLog.waterIntakeMl / (todayLog.waterGoalMl || 2500)) * 100)}%)\n- 👣 **Physical Movement:** ${todayLog.steps.toLocaleString()} steps today\n- 🏃 **Active Exercise:** ${todayLog.exerciseMinutes} minutes logged\n- 🌙 **Sleep Recovery:** ${((todayLog.sleep?.durationMinutes || 0)/60).toFixed(1)} hrs (${todayLog.sleep?.quality || 'Good'} Quality)\n- 📊 **Current Health Score:** ${todayLog.healthScore}/100\n\nSelect any quick consultation prompt below or ask any question!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'How is my health progress?',
        'Suggest a 20 minute exercise.',
        'What should I eat today?',
        'How much water have I consumed?'
      ]
    }
  ]);

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `page-msg-${Date.now()}`,
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
        id: `page-msg-ai-${Date.now()}`,
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
          id: `page-msg-err-${Date.now()}`,
          role: 'assistant',
          content: 'I apologize, but I encountered a processing error. Please try again.',
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
          id: `page-act-${Date.now()}`,
          role: 'system',
          content: `💧 Added +${payload?.amountMl || 250} ml water to today's hydration log!`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const samplePrompts = [
    { title: '💧 Hydration Check', prompt: 'How much water have I consumed today and how much more do I need?' },
    { title: '🏃 20-Min Workout', prompt: 'Suggest an exercise for 20 minutes based on my activity level and goal.' },
    { title: '🍲 Dinner Recipe', prompt: 'What should I eat for dinner based on my remaining calories and dietary preferences?' },
    { title: '📊 Health Review', prompt: 'How is my health progress today and what can I do to improve my score?' },
    { title: '🌙 Sleep Optimization', prompt: 'Give me science-backed sleep improvement suggestions.' },
  ];

  return (
    <div className="space-y-6 animate-fade-in w-full">
      
      {/* 1. Header */}
      <div className="health-card p-6 border-cyan-200 dark:border-cyan-900/60 bg-gradient-to-r from-teal-500/10 via-cyan-500/5 to-white dark:to-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-teal-500/20">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-heading">AI Health Consultant</h2>
              <span className="badge badge-cyan text-[10px]">Context-Aware</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Wellness intelligence analyzing your live telemetry</p>
          </div>
        </div>

        <button
          onClick={() => setMessages([messages[0]])}
          className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Clear History
        </button>
      </div>

      {/* 2. Quick Prompt Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.prompt)}
            className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-400 text-left transition group shadow-sm hover:shadow-md"
          >
            <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 transition-colors block">
              {p.title}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
              {p.prompt}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Main Chat Stream Container */}
      <div className="health-card border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-[520px] bg-white dark:bg-slate-900">
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-950/30">
          {messages.map(msg => {
            const isUser = msg.role === 'user';
            const isSystem = msg.role === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-slate-200 font-semibold inline-block">
                    {msg.content}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}>
                <div
                  className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.content}
                  </div>

                  {msg.actionType && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
                      <button
                        onClick={() => handleAction(msg.actionType, msg.actionPayload)}
                        className="btn-primary py-1.5 px-3 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Log +{msg.actionPayload?.amountMl || 250} ml Now
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 px-1">{msg.timestamp}</span>

                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.suggestions.map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(sug)}
                        className="text-xs py-1 px-3 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-100 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 transition shadow-sm"
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
            <div className="flex items-center gap-2 text-xs text-slate-600 bg-white dark:bg-slate-800 p-3 rounded-2xl max-w-[220px] border border-slate-200 shadow-sm animate-pulse">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
              <span>AI is analyzing your stats...</span>
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>
            <strong>Disclaimer:</strong> The AI Health Assistant provides general wellness, nutrition, and exercise recommendations for informational purposes and is not a replacement for clinical advice.
          </span>
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Type your health, workout, or nutrition question..."
            className="glass-input flex-1 text-sm py-2.5 px-4"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="btn-primary py-2.5 px-5 text-sm font-bold disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>

    </div>
  );
};
