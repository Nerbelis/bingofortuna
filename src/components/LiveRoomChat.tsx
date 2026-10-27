import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  MessageSquare,
  Send,
  Sparkles,
  MapPin,
  Smile,
  Shield,
  Circle,
} from 'lucide-react';
import { ChatMessage, VirtualPlayer } from '../types/bingo';

interface LiveRoomChatProps {
  players: VirtualPlayer[];
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  jackpotUsdt: number;
}

const QUICK_EMOJIS = ['🎉', '🍀', '💰', '🔥', '👏', '⚡'];

export const LiveRoomChat: React.FC<LiveRoomChatProps> = ({
  players,
  messages,
  onSendMessage,
  jackpotUsdt,
}) => {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'PLAYERS'>('CHAT');
  const [inputText, setInputText] = useState('');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleSendEmoji = (emoji: string) => {
    onSendMessage(emoji);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[520px] shadow-xl overflow-hidden">
      {/* Top Header */}
      <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('CHAT')}
            className={`flex items-center gap-1 px-3 py-1 rounded font-semibold transition-all ${
              activeTab === 'CHAT' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Chat en Vivo
          </button>
          <button
            onClick={() => setActiveTab('PLAYERS')}
            className={`flex items-center gap-1 px-3 py-1 rounded font-semibold transition-all ${
              activeTab === 'PLAYERS' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Jugadores ({players.length + 1})
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
          <Circle className="w-2 h-2 fill-emerald-400 animate-pulse" />
          <span>SALA VIRTUAL #1</span>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5" ref={chatScrollRef}>
        {activeTab === 'CHAT' ? (
          messages.length === 0 ? (
            <div className="text-center text-slate-500 text-xs py-8">
              Sé el primero en enviar un mensaje a la sala...
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`text-xs ${
                  msg.isSystem
                    ? 'p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-200'
                    : msg.isUser
                    ? 'p-2 bg-slate-800/90 rounded-lg border border-slate-700/80 ml-4'
                    : 'p-2 bg-slate-950/70 rounded-lg border border-slate-800 mr-4'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span
                    className={`font-bold ${
                      msg.isSystem
                        ? 'text-amber-400'
                        : msg.isUser
                        ? 'text-emerald-400'
                        : 'text-slate-300'
                    }`}
                  >
                    {msg.sender}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{msg.timestamp}</span>
                </div>
                <div className="text-slate-200 break-words">{msg.text}</div>
              </div>
            ))
          )
        ) : (
          /* PLAYERS LIST */
          <div className="space-y-1.5">
            {/* User row */}
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  TÚ
                </div>
                <div>
                  <div className="font-bold text-xs text-amber-300">Tú (Jugador)</div>
                  <div className="text-[10px] text-slate-400">En línea</div>
                </div>
              </div>
              <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-amber-400 border border-slate-800 font-mono">
                Activo
              </span>
            </div>

            {players.map((p) => (
              <div
                key={p.id}
                className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between hover:bg-slate-950"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{p.avatar}</span>
                  <div>
                    <div className="font-semibold text-xs text-slate-200">{p.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-2.5 h-2.5 text-slate-500" /> {p.location}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {p.cardsCount} cartón(es)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK EMOJIS & CHAT INPUT */}
      {activeTab === 'CHAT' && (
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 space-y-2">
          {/* Quick emojis */}
          <div className="flex items-center justify-between gap-1">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSendEmoji(emoji)}
                className="p-1 text-sm hover:scale-125 transition-transform bg-slate-900 border border-slate-800 rounded-lg flex-1 text-center"
              >
                {emoji}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe en la sala..."
              maxLength={120}
              className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 rounded-xl transition-all font-bold"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
