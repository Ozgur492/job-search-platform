import { useState, useRef, useEffect } from 'react';
import { chatWithAgent } from '../api';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Sparkles } from 'lucide-react';

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Merhaba! 👋 Ben JobBot, AI kariyer asistanınız. Size iş arama, ilan detayları, başvuru ve iş uyarıları konusunda yardımcı olabilirim. Ne aramak istersiniz?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await chatWithAgent(userMessage, history);
      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      const errMsg = err.response?.status === 429
        ? 'Rate limit aşıldı, lütfen biraz bekleyin.'
        : 'Bir hata oluştu, lütfen tekrar deneyin.';
      setMessages((prev) => [...prev, { role: 'assistant', content: `⚠️ ${errMsg}` }]);
    }

    setLoading(false);
  };

  return (
    <div className="chat-container">
      <div style={{ textAlign: 'center', paddingBottom: 8 }}>
        <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Sparkles size={24} style={{ color: 'var(--accent-primary)' }} />
          AI Kariyer Asistanı
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Claude ile desteklenen akıllı iş arama</p>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: '0.75rem', opacity: 0.7 }}>
              {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
              {msg.role === 'assistant' ? 'JobBot' : 'Sen'}
            </div>
            {msg.role === 'assistant' ? (
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            ) : (
              <p>{msg.content}</p>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant" style={{ opacity: 0.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="spinner" style={{ width: 20, height: 20, margin: 0, borderWidth: 2 }} />
              Düşünüyorum...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="chat-input-area">
        <input
          id="chat-input"
          type="text"
          placeholder="İş aramak, detay öğrenmek veya başvuru yapmak için yazın..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()} style={{ borderRadius: 'var(--radius-lg)' }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
