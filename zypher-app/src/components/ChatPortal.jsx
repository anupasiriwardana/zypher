'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, Send, MessageSquare, Plus, Search, User, X } from 'lucide-react';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import { useSession } from 'next-auth/react';

// Mock data for demonstration purposes
const mockConversations = [
  {
    id: 'conv-1',
    ruleId: 'RULE-001',
    title: 'SQL Injection Prevention',
    lastMessage: 'Let me know if you need help testing.',
    messages: [
      { id: uuidv4(), sender: 'maintainer', text: 'Please review and develop a new rule to prevent SQL injection.', timestamp: '10:30 AM' },
      { id: uuidv4(), sender: 'developer', text: 'Got it. I\'ll start working on it now.', timestamp: '10:32 AM' },
      { id: uuidv4(), sender: 'maintainer', text: 'Let me know if you need help testing.', timestamp: '11:00 AM' },
    ],
  },
  {
    id: 'conv-2',
    ruleId: 'RULE-002',
    title: 'Input Validation for Forms',
    lastMessage: 'Sure, I will send the code snippet.',
    messages: [
      { id: uuidv4(), sender: 'maintainer', text: 'Could you add a rule for frontend input validation?', timestamp: 'Yesterday' },
      { id: uuidv4(), sender: 'developer', text: 'Sure, I will send the code snippet.', timestamp: 'Yesterday' },
    ],
  },
  {
    id: 'conv-3',
    ruleId: 'RULE-003',
    title: 'Unused Variable Cleanup',
    lastMessage: 'Marking this as resolved.',
    messages: [
      { id: uuidv4(), sender: 'maintainer', text: 'Rule for cleaning up unused variables is ready for review.', timestamp: '2 days ago' },
      { id: uuidv4(), sender: 'developer', text: 'Looks good. Marking this as resolved.', timestamp: '2 days ago' },
    ],
  },
];

// Mock data for new chat options
const mockDevelopers = [
  { id: 'dev-1', name: 'Alice RuleDev' },
  { id: 'dev-2', name: 'Bob RuleDev' },
];

const mockRules = [
  { id: 'new-rule-1', title: 'New Rule: File Upload Security' },
  { id: 'new-rule-2', title: 'New Rule: Cross-Site Scripting (XSS) Remediation' },
];

const ChatPortal = ({ onClose }) => { // Accepting the onClose prop
  const [conversations, setConversations] = useState(mockConversations);
  const [activeConversation, setActiveConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatDeveloper, setNewChatDeveloper] = useState('');
  const [newChatRule, setNewChatRule] = useState('');
  const { data: session } = useSession();
  const currentUserRole = session?.user?.role || 'maintainer';

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !activeConversation) return;

    const updatedConversations = conversations.map(conv => {
      if (conv.id === activeConversation.id) {
        const newMsg = {
          id: uuidv4(),
          sender: currentUserRole,
          text: newMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        return {
          ...conv,
          messages: [...conv.messages, newMsg],
          lastMessage: newMessage,
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setActiveConversation(prev => ({
      ...prev,
      messages: [...prev.messages, {
        id: uuidv4(),
        sender: currentUserRole,
        text: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]
    }));
    setNewMessage('');
  };

  const handleCreateNewChat = (e) => {
    e.preventDefault();
    if (!newChatDeveloper || !newChatRule) return;

    const newConversation = {
      id: uuidv4(),
      ruleId: newChatRule,
      title: mockRules.find(r => r.id === newChatRule)?.title || 'New Chat',
      lastMessage: 'New chat started.',
      messages: [
        {
          id: uuidv4(),
          sender: currentUserRole,
          text: `New chat started for rule: ${mockRules.find(r => r.id === newChatRule)?.title}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversation(newConversation);
    setIsNewChatModalOpen(false);
    setNewChatDeveloper('');
    setNewChatRule('');
  };

  const filteredConversations = useMemo(() => {
    if (!searchTerm) {
      return conversations;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return conversations.filter(conv =>
      conv.title.toLowerCase().includes(lowerCaseSearchTerm) ||
      conv.ruleId.toLowerCase().includes(lowerCaseSearchTerm) ||
      conv.lastMessage.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [searchTerm, conversations]);

  const sortedConversations = [...filteredConversations].sort((a, b) => {
    const timeA = a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].timestamp) : new Date(0);
    const timeB = b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].timestamp) : new Date(0);
    return timeB - timeA;
  });

  return (
    <div className="flex h-[calc(100vh-140px)] rounded-xl overflow-hidden shadow-2xl border border-[var(--border-input)] animate-fadeIn relative">
      {/* Close Button */}
      <div className="absolute top-4 right-4 z-50">
        <button onClick={onClose} className="p-2 rounded-full bg-[var(--background-light)] text-[var(--text-secondary)] hover:text-red-500 transition">
          <X size={24} />
        </button>
      </div>
      
      {/* Left Sidebar: Conversation List */}
      <div className="w-1/3 bg-[var(--background-light)] border-r border-[var(--border-input)] flex flex-col">
        <div className="p-4 border-b border-[var(--border-input)] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare size={20} className="text-[var(--brand-yellow)]" /> Chats
            </h2>
            <button
              onClick={() => setIsNewChatModalOpen(true)}
              className="text-[var(--text-secondary)] hover:text-[var(--brand-yellow)] transition"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-yellow)]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {sortedConversations.length > 0 ? (
            sortedConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setActiveConversation(conv)}
                className={clsx(
                  "w-full text-left p-4 transition-colors duration-200 border-l-4",
                  activeConversation?.id === conv.id
                    ? "bg-[var(--background)] border-[var(--brand-yellow)]"
                    : "hover:bg-[var(--input-bg)] border-transparent"
                )}
              >
                <p className="font-semibold text-[var(--foreground)]">{conv.title}</p>
                <p className="text-sm text-[var(--text-secondary)] truncate">{conv.lastMessage}</p>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-[var(--text-secondary)]">No conversations found.</div>
          )}
        </div>
      </div>

      {/* Right Content: Active Chat Window */}
      <div className="flex-1 flex flex-col bg-[var(--background)]">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-[var(--border-input)] flex items-center gap-4">
              <button
                onClick={() => setActiveConversation(null)}
                className="text-[var(--text-secondary)] hover:text-[var(--brand-yellow)] md:hidden"
              >
                <ChevronLeft size={24} />
              </button>
              <div>
                <h3 className="text-xl font-semibold text-[var(--foreground)]">{activeConversation.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">{activeConversation.ruleId}</p>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar flex flex-col">
              {activeConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={clsx(
                    "flex flex-col max-w-[70%] drop-shadow-sm",
                    msg.sender === currentUserRole ? "self-end items-end" : "self-start items-start"
                  )}
                >
                  <div
                    className={clsx(
                      "p-3 rounded-2xl",
                      msg.sender === currentUserRole
                        ? "bg-[var(--brand-yellow)] text-gray-900 rounded-br-none"
                        : "bg-[var(--input-bg)] text-[var(--foreground)] rounded-tl-none"
                    )}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <span className="text-[10px] text-[var(--text-secondary)] mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[var(--border-input)]">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 rounded-xl bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)] transition-all"
                />
                <button
                  type="submit"
                  className="p-3 bg-[var(--brand-yellow)] text-gray-900 rounded-xl hover:bg-yellow-400 transition-colors"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-[var(--text-secondary)]">
            <MessageSquare size={80} className="mb-4 text-[var(--border-input)]" />
            <h3 className="text-2xl font-semibold text-[var(--foreground)]">Select a chat to start messaging</h3>
            <p className="mt-2 text-md">Or, click the <Plus size={16} className="inline-block" /> icon to create a new one.</p>
          </div>
        )}
      </div>

      {isNewChatModalOpen && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-[var(--background-dark)] p-8 rounded-2xl shadow-2xl w-full max-w-md border border-[var(--border-input)]">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-[var(--foreground)]">Start a New Chat</h3>
              <button onClick={() => setIsNewChatModalOpen(false)} className="text-[var(--text-secondary)] hover:text-red-500 transition">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateNewChat} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
                  Select Rule Developer
                </label>
                <select
                  value={newChatDeveloper}
                  onChange={(e) => setNewChatDeveloper(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
                  required
                >
                  <option value="" disabled>Choose a developer</option>
                  {mockDevelopers.map(dev => (
                    <option key={dev.id} value={dev.id}>{dev.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">
                  Select a Rule
                </label>
                <select
                  value={newChatRule}
                  onChange={(e) => setNewChatRule(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-[var(--input-bg)] border border-[var(--border-input)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-yellow)]"
                  required
                >
                  <option value="" disabled>Choose a rule</option>
                  {mockRules.map(rule => (
                    <option key={rule.id} value={rule.id}>{rule.title}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-lg bg-[var(--brand-yellow)] text-gray-900 font-semibold hover:bg-yellow-400 transition"
              >
                Create Chat
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPortal;