import React, { useState, useEffect } from 'react';
import api, {
  fetchAdminManagerMessages,
  fetchManagerDispatcherMessages,
  sendAdminManagerMessage,
  sendManagerDispatcherMessage,
  fetchManagerWorkOrders,
} from '../../lib/api';

interface NotificationItem {
  id?: string | number;
  workOrderId?: string | number;
  title?: string;
  message: string;
  senderEmail?: string;
  senderRole?: string;
  recipientEmail?: string;
  recipientRole?: string;
  channelRole?: 'SUPER ADMIN' | 'DISPATCHER' | 'MANAGER' | 'TECHNICIAN' | string;
  isRead?: boolean;
  createdAt?: string;
}

const MessagesPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [sendingMap, setSendingMap] = useState<Record<string, boolean>>({});

  const fetchUser = async () => {
    try {
      const res = await api.get('/api/data/me');
      if (res.data?.email) {
        setCurrentUserEmail(res.data.email.toLowerCase().trim());
      }
    } catch {
      const savedUser = localStorage.getItem('keystoneUser');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.email) setCurrentUserEmail(parsed.email.toLowerCase().trim());
        } catch (e) {
          console.error('Failed to parse saved user:', e);
        }
      }
    }
  };

  const loadAllMessagesAndChats = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Standard Notifications
      const notifRes = await api.get('/api/data/notifications').catch(() => ({ data: [] }));
      const baseNotifs: NotificationItem[] = Array.isArray(notifRes.data)
        ? notifRes.data.map((n) => ({ ...n, channelRole: n.senderRole || 'GENERAL' }))
        : [];

      // 2. Fetch Work Orders to fetch dedicated channels
      const workOrders = await fetchManagerWorkOrders().catch(() => []);

      const chatPromises: Promise<NotificationItem[]>[] = [];

      workOrders.forEach((wo) => {
        // Super Admin Channel
        chatPromises.push(
          fetchAdminManagerMessages(wo.id)
            .then((msgs) =>
              msgs.map((m) => ({
                ...m,
                workOrderId: wo.id,
                channelRole: 'SUPER ADMIN',
              }))
            )
            .catch(() => [])
        );

        // Dispatcher Channel
        chatPromises.push(
          fetchManagerDispatcherMessages(wo.id)
            .then((msgs) =>
              msgs.map((m) => ({
                ...m,
                workOrderId: wo.id,
                channelRole: 'DISPATCHER',
              }))
            )
            .catch(() => [])
        );
      });

      const chatResults = await Promise.all(chatPromises);
      const allChatMessages: NotificationItem[] = chatResults.flat();

      // Combine and deduplicate
      const combined = [...baseNotifs, ...allChatMessages];
      const uniqueMap = new Map<string, NotificationItem>();

      combined.forEach((item) => {
        const uniqueKey = item.id
          ? `${item.id}_${item.channelRole || ''}`
          : `${item.workOrderId}_${item.channelRole}_${item.createdAt}_${item.message}`;
        uniqueMap.set(uniqueKey, item);
      });

      setNotifications(Array.from(uniqueMap.values()));
    } catch (err: any) {
      console.error('Failed to load messages:', err);
      setError(err.message || 'Error fetching messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
    loadAllMessagesAndChats();
  }, []);

  const handleSendReply = async (
    threadKey: string,
    workOrderId: string | number,
    channelRole: string,
    customMessage?: string,
    recipientEmail?: string
  ) => {
    const textToSend = customMessage || replyTextMap[threadKey];

    if (!textToSend || !textToSend.trim()) {
      alert('Please enter a reply message.');
      return;
    }

    setSendingMap((prev) => ({ ...prev, [threadKey]: true }));

    try {
      let resItem: NotificationItem;
      const numWoId = Number(workOrderId);

      if (channelRole === 'DISPATCHER') {
        resItem = await sendManagerDispatcherMessage(numWoId, textToSend, recipientEmail);
        resItem = { ...resItem, channelRole: 'DISPATCHER' };
      } else if (channelRole === 'SUPER ADMIN') {
        resItem = await sendAdminManagerMessage(numWoId, textToSend, recipientEmail);
        resItem = { ...resItem, channelRole: 'SUPER ADMIN' };
      } else {
        const res = await api.post(`/api/data/requests/${workOrderId}/query`, {
          message: textToSend,
          recipientEmail: recipientEmail,
        });
        resItem = res.data;
      }

      setReplyTextMap((prev) => ({ ...prev, [threadKey]: '' }));

      const newReplyItem: NotificationItem = (resItem && resItem.id)
        ? resItem
        : {
            id: Date.now(),
            workOrderId: numWoId,
            senderEmail: currentUserEmail || 'me',
            senderRole: 'MANAGER',
            recipientEmail: recipientEmail,
            recipientRole: channelRole,
            channelRole: channelRole,
            title: `Enquiry on Work Order #${workOrderId}`,
            message: textToSend,
            createdAt: new Date().toISOString(),
          };

      setNotifications((prev) => [...prev, newReplyItem]);
    } catch (err: any) {
      console.error('Error sending reply:', err);
      alert(err.response?.data?.message || err.message || 'Failed to send reply.');
    } finally {
      setSendingMap((prev) => ({ ...prev, [threadKey]: false }));
    }
  };

  // Group strictly by workOrderId + channelRole to separate SuperAdmin and Dispatcher threads
  const groupedThreads = notifications.reduce<Record<string, NotificationItem[]>>(
    (acc, item) => {
      const woId = item.workOrderId ? String(item.workOrderId) : `gen`;
      const chRole = item.channelRole || 'GENERAL';
      const key = `${woId}___${chRole}`;

      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {}
  );

  const checkRoleMatch = (roleStr?: string, target?: string) => {
    if (!roleStr || !target) return false;
    const r = roleStr.toUpperCase().replace(/_/g, ' ');
    const t = target.toUpperCase().replace(/_/g, ' ');

    if (r === t) return true;
    if (t.includes('DISPATCH') && r.includes('DISPATCH')) return true;
    if (t.includes('ADMIN') && r.includes('ADMIN')) return true;
    return false;
  };

  const filteredThreadKeys = Object.keys(groupedThreads).filter((threadKey) => {
    if (selectedRoleFilter === 'ALL') return true;

    const [_, channelRole] = threadKey.split('___');
    if (checkRoleMatch(channelRole, selectedRoleFilter)) return true;

    const threadMessages = groupedThreads[threadKey];
    return threadMessages.some(
      (msg) =>
        checkRoleMatch(msg.senderRole, selectedRoleFilter) ||
        checkRoleMatch(msg.recipientRole, selectedRoleFilter)
    );
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-slate-900">Messages & Notifications</h1>

      {/* Role Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['ALL', 'SUPER ADMIN', 'DISPATCHER', 'MANAGER', 'TECHNICIAN'].map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRoleFilter(role)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              selectedRoleFilter === role
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {loading && <p className="text-gray-500">Loading notifications & chats...</p>}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md flex justify-between items-center mb-4">
          <span>{error}</span>
          <button
            onClick={loadAllMessagesAndChats}
            className="text-sm font-bold text-red-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && filteredThreadKeys.length === 0 && (
        <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-sm">No messages found for {selectedRoleFilter}.</p>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          {filteredThreadKeys.map((threadKey) => {
            const [rawWoId, channelRole] = threadKey.split('___');
            const workOrderId = rawWoId === 'gen' ? '' : rawWoId;

            const messages = groupedThreads[threadKey].sort(
              (a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
            );

            const firstMsg = messages[0];
            const title =
              firstMsg?.title ||
              `Enquiry on Work Order #${workOrderId} (${channelRole})`;

            const incomingMsg = messages.find(
              (m) =>
                m.senderEmail &&
                currentUserEmail &&
                m.senderEmail.toLowerCase().trim() !== currentUserEmail
            );
            const targetRecipientEmail = incomingMsg?.senderEmail || firstMsg?.senderEmail;

            return (
              <div
                key={threadKey}
                className="border rounded-xl shadow-sm bg-white overflow-hidden"
              >
                {/* Header */}
                <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800 text-base">{title}</h3>
                    {workOrderId && (
                      <span className="text-xs text-gray-500">
                        Work Order ID: #{workOrderId} | Channel: {channelRole}
                      </span>
                    )}
                  </div>
                  <span className="text-xs bg-gray-200 text-gray-700 font-medium px-2.5 py-1 rounded-full">
                    {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
                  </span>
                </div>

                {/* Messages Box */}
                <div className="p-4 bg-gray-50/50 max-h-96 overflow-y-auto space-y-3">
                  {messages.map((msg) => {
                    const msgEmail = msg.senderEmail?.toLowerCase().trim();
                    const isMe = currentUserEmail
                      ? msgEmail === currentUserEmail
                      : msg.senderRole === 'MANAGER';

                    return (
                      <div
                        key={msg.id || `${msg.createdAt}_${msg.message}`}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mb-1 px-1">
                          <span className="font-medium text-gray-600">
                            {isMe ? 'You' : msg.senderEmail || 'System'}
                          </span>
                          {msg.senderRole && (
                            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-100 text-[10px]">
                              {msg.senderRole.replace(/_/g, ' ')}
                            </span>
                          )}
                          <span>•</span>
                          <span>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : ''}
                          </span>
                        </div>

                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-tr-none'
                              : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Input */}
                <div className="p-3 bg-white border-t flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyTextMap[threadKey] || ''}
                      onChange={(e) =>
                        setReplyTextMap((prev) => ({
                          ...prev,
                          [threadKey]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendReply(
                            threadKey,
                            workOrderId,
                            channelRole,
                            undefined,
                            targetRecipientEmail
                          );
                        }
                      }}
                      placeholder={`Reply to ${channelRole}...`}
                      className="flex-1 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() =>
                        handleSendReply(
                          threadKey,
                          workOrderId,
                          channelRole,
                          undefined,
                          targetRecipientEmail
                        )
                      }
                      disabled={sendingMap[threadKey] || !replyTextMap[threadKey]?.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      {sendingMap[threadKey] ? 'Sending...' : 'Send'}
                    </button>
                  </div>

                  <div className="flex gap-2 items-center pt-1">
                    <span className="text-xs text-gray-400">Quick Reply:</span>
                    <button
                      onClick={() =>
                        handleSendReply(
                          threadKey,
                          workOrderId,
                          channelRole,
                          'Acknowledged',
                          targetRecipientEmail
                        )
                      }
                      disabled={sendingMap[threadKey]}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded transition"
                    >
                      👍 Acknowledged
                    </button>
                    <button
                      onClick={() =>
                        handleSendReply(
                          threadKey,
                          workOrderId,
                          channelRole,
                          'Work in progress.',
                          targetRecipientEmail
                        )
                      }
                      disabled={sendingMap[threadKey]}
                      className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded transition"
                    >
                      ⚙️ Work in progress
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MessagesPage;