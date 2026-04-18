import { useState, useRef, useEffect } from 'react';
import { useAuth, apiRequest } from '@/lib/auth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, Send, Loader2, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  'How do I improve my resume ATS score?',
  'What are the best ways to prepare for a technical interview?',
  'How should I negotiate my salary?',
  'What skills should I learn for a Full Stack Developer role?',
  'How do I write a strong cover letter?',
  'What is the STAR method for behavioral interviews?',
];

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isUser ? 'bg-primary' : 'bg-muted border border-border'}`}>
        {isUser ? <User className="w-4 h-4 text-primary-foreground" /> : <Bot className="w-4 h-4 text-primary" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border border-border text-foreground rounded-tl-sm'}`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        <p className={`text-xs mt-1.5 ${isUser ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}

export default function CoachPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm your AI Career Coach. I'm here to help you land your dream job in tech.\n\nI can help you with:\n• Resume writing & ATS optimization\n• Interview preparation & practice\n• Skill development strategies\n• Salary negotiation tactics\n• Job search strategies\n• Career roadmap planning\n\nWhat would you like to work on today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(text?: string) {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');

    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await apiRequest('/api/chatbot/message', {
        method: 'POST',
        body: JSON.stringify({ message: msg }),
      });
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response, timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card/50">
        <div className="flex items-center gap-3 max-w-4xl mx-auto">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              AI Career Coach
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />Online
              </Badge>
            </h2>
            <p className="text-xs text-muted-foreground">Powered by career intelligence · Always available</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">
        <div className="max-w-4xl mx-auto space-y-5">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full bg-primary/60"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && (
        <div className="px-6 pb-3">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> Quick questions
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => sendMessage(p)}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-6 pt-3 border-t border-border bg-card/30">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <Input
              placeholder="Ask me anything about your career..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="bg-background border-border pr-4 py-3 h-auto text-sm"
            />
          </div>
          <Button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            size="icon"
            className="h-10 w-10 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
