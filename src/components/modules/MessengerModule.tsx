import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { Message, User, isFounder } from '../../types';
import { MessageSquare, Send, UserCheck, ShieldCheck } from 'lucide-react';

export const MessengerModule: React.FC = () => {
  const { currentUser, allUsers } = useAuth();
  const [messages, setMessages] = useState<Message[]>(() => storageService.getMessages());
  const [activeRecipientId, setActiveRecipientId] = useState<string>(
    currentUser.id === 'usr_founder' ? 'usr_emp_1' : 'usr_founder'
  );
  const [inputContent, setInputContent] = useState('');

  const activeRecipient = allUsers.find((u) => u.id === activeRecipientId) || allUsers[0];

  const currentThread = messages.filter(
    (m) =>
      (m.senderId === currentUser.id && m.recipientId === activeRecipientId) ||
      (m.senderId === activeRecipientId && m.recipientId === currentUser.id)
  );

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputContent.trim()) return;

    const newMsg = storageService.sendMessage(currentUser.id, activeRecipientId, inputContent);
    setMessages([...messages, newMsg]);
    setInputContent('');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Direct Internal Messenger</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Section 3: Encrypted 1-on-1 team communication with participant-only access isolation.
        </p>
      </div>

      {/* Messenger Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden h-[600px] flex">
        {/* Left: Conversation List */}
        <div className="w-72 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Team Direct Chats</h3>
            <p className="text-[11px] text-slate-500 mt-0.5">Select a colleague to message</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {allUsers
              .filter((u) => u.id !== currentUser.id)
              .map((contact) => {
                const isSelected = contact.id === activeRecipientId;
                return (
                  <div
                    key={contact.id}
                    onClick={() => setActiveRecipientId(contact.id)}
                    className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-white border-l-4 border-brand-600 shadow-2xs' : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <img
                      src={contact.avatarUrl}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{contact.name}</span>
                        {isFounder(contact.role) && (
                          <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                            Founder
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{contact.designation}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right: Active Message Thread */}
        <div className="flex-1 flex flex-col justify-between bg-white">
          {/* Thread Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-3">
              <img
                src={activeRecipient.avatarUrl}
                alt={activeRecipient.name}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  {activeRecipient.name}
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </h4>
                <p className="text-[11px] text-slate-500">{activeRecipient.designation} • {activeRecipient.department}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
              Encrypted Thread
            </span>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/20">
            {currentThread.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                No messages yet. Send a greeting to start collaborating!
              </div>
            ) : (
              currentThread.map((msg) => {
                const isMine = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                        isMine
                          ? 'bg-brand-600 text-white rounded-br-xs'
                          : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              placeholder={`Message ${activeRecipient.name}...`}
              className="flex-1 text-xs px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800"
            />
            <button
              type="submit"
              className="p-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
