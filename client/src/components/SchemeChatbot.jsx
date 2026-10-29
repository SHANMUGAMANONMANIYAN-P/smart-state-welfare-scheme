import React, { useState, useEffect, useRef } from 'react';
import { chatbotAPI } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  RefreshCw,
  Globe,
  Bot,
} from 'lucide-react';

export default function SchemeChatbot() {
  const { language, toggleLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const messagesEndRef = useRef(null);

  // Initialize welcome message & suggestions on language change
  useEffect(() => {
    async function loadSuggestions() {
      try {
        const res = await chatbotAPI.getSuggestions(language);
        if (res.data?.data) {
          setSuggestions(res.data.data);
        }
      } catch {
        // use default fallback
      }
    }
    loadSuggestions();

    // Set initial greeting
    setMessages([
      {
        id: 'welcome',
        sender: 'bot',
        text: t('chatWelcome'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        verified: true,
      },
    ]);
  }, [language]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (questionText = null) => {
    const q = (questionText || input).trim();
    if (!q || loading) return;

    const userMsg = {
      id: Date.now() + '-user',
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatbotAPI.query(q, language);
      const data = res.data?.data;

      const botMsg = {
        id: Date.now() + '-bot',
        sender: 'bot',
        text: data?.answer || 'Here is the verified information for your request.',
        matched_schemes: data?.matched_schemes || [],
        source_citations: data?.source_citations || [],
        follow_up_suggestions: data?.follow_up_suggestions || [],
        verified: data?.verified ?? true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg = {
        id: Date.now() + '-err',
        sender: 'bot',
        text: language === 'ta'
          ? 'மன்னிக்கவும், தகவலைப் பெறுவதில் சிக்கல் ஏற்பட்டது. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
          : 'Sorry, I encountered a temporary connection issue. Please try asking again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center space-x-2.5 px-4 py-3 rounded-full bg-brand-purple hover:bg-brand-purpleDark text-white shadow-xl shadow-brand-purple/30 hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white group"
            aria-label="Open Scheme Assistant Chatbot"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-brand-purple animate-pulse" />
            </div>
            <div className="text-left font-bold text-xs tracking-wide">
              <span>{t('chatTitle')}</span>
              <span className="hidden sm:inline text-[10px] block font-medium text-brand-lavender/90">
                {language === 'ta' ? 'அரசு வழிகாட்டி' : 'TN & Central Schemes'}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[420px] max-h-[85vh] h-[600px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-navy via-slate-900 to-brand-navy p-4 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-brand-purple/90 flex items-center justify-center text-white shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-sm tracking-tight text-white">
                    {t('chatTitle')}
                  </h3>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Verified
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">
                  {t('chatSubtitle')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Language Switcher Button */}
              <button
                onClick={toggleLanguage}
                className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-[11px] font-bold text-brand-lavender transition flex items-center space-x-1 border border-slate-700"
                title="Switch Language / மொழியை மாற்ற"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'தமிழ்' : 'EN'}</span>
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 leading-relaxed shadow-2xs ${
                    m.sender === 'user'
                      ? 'bg-brand-purple text-white rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  {m.sender === 'bot' && (
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-brand-purple mb-1.5 pb-1 border-b border-slate-100">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t('appName')} Verified Advisory</span>
                    </div>
                  )}

                  <div className="whitespace-pre-line text-xs font-normal">
                    {m.text}
                  </div>

                  {/* Render Matched Scheme Citations */}
                  {m.source_citations && m.source_citations.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-100 space-y-1.5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Official Citations:
                      </div>
                      {m.source_citations.map((c, i) => (
                        <a
                          key={i}
                          href={c.official_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-brand-lavender/30 text-[11px] font-semibold text-brand-navy hover:text-brand-purple border border-slate-200 transition"
                        >
                          <span className="truncate max-w-[220px]">{c.scheme_name}</span>
                          <ExternalLink className="w-3 h-3 text-brand-purple shrink-0 ml-1" />
                        </a>
                      ))}
                    </div>
                  )}

                  <span className="block text-[9px] mt-1 text-right opacity-60">
                    {m.timestamp}
                  </span>
                </div>

                {/* Follow-up suggestions if provided by bot */}
                {m.follow_up_suggestions && m.follow_up_suggestions.length > 0 && (
                  <div className="mt-2 space-y-1 max-w-[90%]">
                    {m.follow_up_suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(suggestion)}
                        className="text-left text-[11px] px-3 py-1.5 rounded-full bg-white hover:bg-brand-lavender/60 border border-slate-200 text-slate-700 hover:text-brand-purple font-medium flex items-center space-x-1.5 shadow-2xs transition"
                      >
                        <ChevronRight className="w-3 h-3 text-brand-purple shrink-0" />
                        <span className="truncate">{suggestion}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 p-3 bg-white rounded-2xl border border-slate-200/80 w-fit text-xs text-slate-500 shadow-2xs">
                <RefreshCw className="w-3.5 h-3.5 text-brand-purple animate-spin" />
                <span>Searching verified government registry...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Preset Questions Chips (shown if only 1 welcome message) */}
          {messages.length === 1 && suggestions.length > 0 && (
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto text-[11px] no-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 shrink-0">
                {t('quickQuestions')}:
              </span>
              {suggestions.slice(0, 3).map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-brand-lavender/60 text-slate-700 hover:text-brand-purple font-medium shrink-0 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chatPlaceholder')}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/20 text-xs text-slate-900 outline-hidden bg-slate-50/50 focus:bg-white"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-brand-purple hover:bg-brand-purpleDark disabled:opacity-50 text-white font-bold transition shadow-xs"
                aria-label="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-2 text-[9px] text-center text-slate-400 leading-tight">
              {t('chatDisclaimer')}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
