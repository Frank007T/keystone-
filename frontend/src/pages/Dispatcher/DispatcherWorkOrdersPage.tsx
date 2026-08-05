import { useEffect, useState, useRef } from 'react';
import {
  fetchDispatcherWorkOrders,
  fetchDispatcherTechnicians,
  assignWorkOrder,
  fetchManagerDispatcherMessages,
  sendManagerDispatcherMessage,
  fetchDispatcherTechnicianMessages,
  sendDispatcherTechnicianMessage,
  Notification,
  WorkOrder,
  User,
} from '../../lib/api';

type ChatType = 'MANAGER' | 'TECHNICIAN';

export function DispatcherWorkOrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [error, setError] = useState('');

  // Chat Modal State
  const [activeChatOrder, setActiveChatOrder] = useState<WorkOrder | null>(null);
  const [chatType, setChatType] = useState<ChatType>('MANAGER');
  const [chatMessages, setChatMessages] = useState<Notification[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatError, setChatError] = useState('');

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const currentUserEmail = (localStorage.getItem('userEmail') || '').toLowerCase().trim();

  useEffect(() => {
    Promise.all([fetchDispatcherWorkOrders(), fetchDispatcherTechnicians()])
      .then(([ordersData, techData]) => {
        setOrders(ordersData);
        setTechnicians(techData);
      })
      .catch((err) => setError(err.message || 'Unable to load work orders.'))
      .finally(() => setLoading(false));
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeChatOrder && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChatOrder]);

  const handleAssign = async (workOrderId: number, email: string) => {
    if (!email) return;
    setAssigningId(workOrderId);
    try {
      const updatedOrder = await assignWorkOrder(workOrderId, email);
      setOrders((prev) =>
        prev.map((order) => (order.id === workOrderId ? updatedOrder : order))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to assign work order.');
    } finally {
      setAssigningId(null);
    }
  };

  const loadMessages = async (workOrderId: number, type: ChatType) => {
    setLoadingChat(true);
    setChatError('');
    try {
      let msgs: Notification[] = [];
      if (type === 'MANAGER') {
        msgs = await fetchManagerDispatcherMessages(workOrderId);
      } else {
        msgs = await fetchDispatcherTechnicianMessages(workOrderId);
      }
      setChatMessages(msgs);
    } catch (err: any) {
      setChatError(err.message || 'Failed to load chat history.');
    } finally {
      setLoadingChat(false);
    }
  };

  const openChatModal = (order: WorkOrder, type: ChatType) => {
    setActiveChatOrder(order);
    setChatType(type);
    setNewMessage('');
    loadMessages(order.id, type);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatOrder) return;

    setSendingMessage(true);
    setChatError('');

    try {
      if (chatType === 'MANAGER') {
        await sendManagerDispatcherMessage(
          activeChatOrder.id,
          newMessage,
          activeChatOrder.customerEmail
        );
      } else {
        await sendDispatcherTechnicianMessage(
          activeChatOrder.id,
          newMessage,
          activeChatOrder.assignedToEmail
        );
      }
      setNewMessage('');
      await loadMessages(activeChatOrder.id, chatType);
    } catch (err: any) {
      setChatError(err.message || 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Work Orders Table */}
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Dispatcher Dashboard</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">Assign & Manage Work Orders</h2>

        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                {['Order ID', 'Customer', 'Site', 'Priority', 'Status', 'Assign Technician', 'Due Date', 'Actions'].map(
                  (heading) => (
                    <th key={heading} className="px-6 py-4 font-medium text-slate-500">
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                    Loading work orders...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-slate-500">
                    No work orders available.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-950">WO-{order.id}</td>
                    <td className="px-6 py-4">{order.customerEmail}</td>
                    <td className="px-6 py-4">{order.siteName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.priority?.toUpperCase() === 'HIGH'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {order.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.status?.toUpperCase() === 'ASSIGNED'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        disabled={assigningId === order.id}
                        value={order.assignedToEmail || ''}
                        onChange={(e) => handleAssign(order.id, e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                      >
                        <option value="" disabled>
                          -- Assign Technician --
                        </option>
                        {technicians.map((tech) => (
                          <option key={tech.email} value={tech.email}>
                            {tech.fullName} ({tech.email})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      {order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openChatModal(order, 'MANAGER')}
                          className="rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors whitespace-nowrap"
                        >
                          Chat Manager
                        </button>
                        <button
                          onClick={() => openChatModal(order, 'TECHNICIAN')}
                          className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors whitespace-nowrap"
                        >
                          Chat Tech
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chat Modal */}
      {activeChatOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white shadow-xl flex flex-col h-[580px] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  {chatType === 'MANAGER' ? 'Manager Chat' : 'Technician Chat'} — WO-{activeChatOrder.id}
                </h3>
                <p className="text-xs text-slate-500">
                  {chatType === 'MANAGER'
                    ? 'Conversation with Manager'
                    : `Conversation with Technician (${activeChatOrder.assignedToEmail || 'Unassigned'})`}
                </p>
              </div>
              <button
                onClick={() => setActiveChatOrder(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
              {loadingChat ? (
                <div className="text-center py-10 text-sm text-slate-400">Loading conversation history...</div>
              ) : chatError ? (
                <div className="text-center py-4 text-sm text-rose-600">{chatError}</div>
              ) : chatMessages.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  No messages in this chat yet. Type below to start chatting.
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const sRole = (msg.senderRole || '').toUpperCase();
                  const sEmail = (msg.senderEmail || '').toLowerCase().trim();
                  const techEmail = (activeChatOrder.assignedToEmail || '').toLowerCase().trim();

                  // DIRECT OVERRIDE LOGIC:
                  // 1. If senderRole is explicitly TECHNICIAN or MANAGER -> NOT me (LEFT)
                  // 2. If senderEmail matches the technician's assigned email -> NOT me (LEFT)
                  // 3. Otherwise, if senderRole is DISPATCHER or sender matches current logged dispatcher -> IS me (RIGHT)
                  let isMe = true;

                  if (
                    sRole === 'TECHNICIAN' ||
                    sRole === 'MANAGER' ||
                    (techEmail && sEmail === techEmail)
                  ) {
                    isMe = false;
                  } else if (
                    sRole === 'DISPATCHER' ||
                    (currentUserEmail && sEmail === currentUserEmail)
                  ) {
                    isMe = true;
                  } else {
                    // Fallback to alternating side based on index if database fields are empty/corrupt
                    isMe = idx % 2 === 0;
                  }

                  const senderLabel = isMe
                    ? 'You (Dispatcher)'
                    : chatType === 'MANAGER'
                    ? `Manager (${msg.senderEmail || 'Manager'})`
                    : `Technician (${msg.senderEmail || activeChatOrder.assignedToEmail || 'Technician'})`;

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-medium text-slate-400">{senderLabel}</span>
                        <span className="text-[9px] text-slate-300">
                          {msg.createdAt
                            ? new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isMe
                            ? 'bg-primary text-white rounded-br-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                        }`}
                      >
                        <p className="break-words">{msg.message}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="border-t border-slate-100 p-4 bg-white flex items-center gap-2">
              <input
                type="text"
                required
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  chatType === 'MANAGER'
                    ? 'Type your message to the manager...'
                    : 'Type your message to the technician...'
                }
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessage.trim()}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {sendingMessage ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}