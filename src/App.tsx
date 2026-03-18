import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { chatWithGemini } from './services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'model',
      text: 'Olá! Sou o assistente virtual do Espro. Como posso ajudar você hoje?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.text }],
      }));

      const aiResponse = await chatWithGemini(input, history);

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (error) {
      console.error('Erro ao conversar com Gemini:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: 'Desculpe, ocorreu um erro técnico. Por favor, tente novamente em instantes.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-2xl border-x border-zinc-200">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b-4 border-espro-orange bg-espro-blue text-white sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center p-1 overflow-hidden">
            {/* Placeholder for Espro Logo - Using a stylized 'e' */}
            <span className="text-espro-blue font-bold text-2xl italic">e</span>
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight uppercase">Espro Digital</h1>
            <p className="text-[10px] text-espro-orange font-semibold uppercase tracking-widest">
              Assistente Virtual
            </p>
          </div>
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2 text-[10px] font-medium bg-white/10 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SISTEMA OPERACIONAL
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-zinc-50/50">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, x: message.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-md border-2 ${
                  message.role === 'user' 
                    ? 'bg-espro-orange border-white text-white' 
                    : 'bg-white border-espro-blue text-espro-blue'
                }`}
              >
                {message.role === 'user' ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div
                className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-sm relative ${
                  message.role === 'user'
                    ? 'bg-espro-blue text-white rounded-tr-none'
                    : 'bg-white text-zinc-800 rounded-tl-none border border-zinc-100'
                }`}
              >
                <div className="markdown-body">
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                </div>
                <span
                  className={`text-[9px] mt-2 block font-medium uppercase tracking-tighter ${
                    message.role === 'user' ? 'text-white/70 text-right' : 'text-zinc-400 text-left'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 items-center text-espro-blue font-medium text-xs"
          >
            <div className="w-9 h-9 rounded-full bg-white border-2 border-espro-blue flex items-center justify-center text-espro-blue shadow-sm">
              <Bot size={18} />
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-zinc-100">
              Processando sua solicitação...
              <Loader2 size={14} className="animate-spin" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-6 border-t border-zinc-100 bg-white">
        <div className="relative flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Como podemos ajudar você hoje?"
            className="flex-1 bg-zinc-50 border-2 border-zinc-100 rounded-xl px-5 py-4 pr-14 focus:outline-none focus:border-espro-blue transition-all text-sm font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-3 bg-espro-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-all shadow-lg shadow-orange-200 active:scale-95"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="mt-4 flex justify-center items-center gap-4 opacity-40 grayscale">
           <span className="text-[9px] font-bold uppercase tracking-widest text-espro-blue">Espro</span>
           <div className="w-1 h-1 rounded-full bg-zinc-400" />
           <span className="text-[9px] font-bold uppercase tracking-widest text-espro-orange">Aprendizagem</span>
        </div>
      </footer>
    </div>
  );
}
