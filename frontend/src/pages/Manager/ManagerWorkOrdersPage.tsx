import React, { useEffect, useState, useRef } from 'react';
import { 
  fetchManagerWorkOrders, 
  fetchManagerDispatcherMessages,
  sendManagerDispatcherMessage,
  WorkOrder,
  Notification
} from '../../lib/api';

export function ManagerWorkOrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Chat Enquiry Modal State
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [messages, setMessages] = useState<Notification[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatError, setChatError] = useState('');
  
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const currentUserEmail = localStorage.getItem('userEmail') || '';

  // Form State for New Work Order
  const loadWorkOrders = () => {
    setLoading(true);
    fetchManagerWorkOrders()
      .then(setOrders)
      .catch((err) => setError(err.message || 'Unable to load work orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWorkOrders();
  }, []);

  // Auto-scroll chat when messages update
  useEffect(() => {
    if (isChatModalOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatModalOpen]);

  // Fetch Chat History
  const fetchMessages = async (workOrderId: number) => {
    setLoadingMessages(true);
    setChatError('');
    try {
      const res = await fetchManagerDispatcherMessages(workOrderId);
      setMessages(res);
    } catch (err: any) {
      setChatError(err.message || 'Failed to load conversation history.');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Open Chat Modal
  const handleOpenChat = (order: WorkOrder) => {
    setSelectedOrder(order);
    setNewMessage('');
    setIsChatModalOpen(true);
    fetchMessages(order.id);
  };

  // Send Message in Manager-Dispatcher Chat
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !newMessage.trim()) return;

    setSendingMessage(true);
    setChatError('');

    try {
      await sendManagerDispatcherMessage(
        selectedOrder.id,
        newMessage,
        selectedOrder.assignedToEmail
      );
      setNewMessage('');
      await fetchMessages(selectedOrder.id);
    } catch (err: any) {
      setChatError(err.message || 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusLabel = (status?: string) => {
    const normalized = (status || '').toString().trim().toLowerCase();

    if (normalized.includes('success')) return 'success';
    if (normalized.includes('failed')) return 'failed';
    if (normalized.includes('pending')) return 'pending';
    if (normalized.includes('processing') || normalized.includes('in_progress') || normalized.includes('in progress') || normalized.includes('progress')) return 'processing';
    if (normalized.includes('complete') || normalized.includes('completed')) return 'completed';

    return normalized || 'pending';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-[32px] bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Work Orders</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Manage service work orders</h2>
        </div>
      </div>
      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-soft">
        <table className="w-full border-collapse text-left text-sm text-slate-700">
          <thead className="bg-slate-50">
            <tr>
              {['Order', 'Customer', 'Site', 'Status', 'Priority', 'Assigned To', 'Due Date', 'Actions'].map((heading) => (
                <th key={heading} className="px-6 py-4 font-medium text-slate-500">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-slate-500">Loading work orders...</td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-rose-600">{error}</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-slate-500">No work orders found.</td>
              </tr>
            ) : (
              orders.map((order) => {
                const statusLabel = getStatusLabel(order.status);

                return (
                  <tr key={order.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-950">WO-{order.id}</td>
                    <td className="px-6 py-4">{order.customerEmail}</td>
                    <td className="px-6 py-4">{order.siteName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        statusLabel === 'success'
                          ? 'bg-emerald-100 text-emerald-800'
                          : statusLabel === 'failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {statusLabel}
                      </span>
                    </td>
                  <td className="px-6 py-4 font-medium">{order.priority}</td>
                  <td className="px-6 py-4">{order.assignedToEmail || 'Unassigned'}</td>
                  <td className="px-6 py-4">{order.dueDate ? new Date(order.dueDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <button 
                      onClick={() => handleOpenChat(order)}
                      className="text-amber-600 font-semibold hover:underline flex items-center gap-1"
                    >
                      💬 Enquire
                    </button>
                  </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Chat Modal */}
      {isChatModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white shadow-xl flex flex-col h-[580px] overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Dispatcher Chat — WO-{selectedOrder.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Target: {selectedOrder.assignedToEmail || 'Assigned Dispatcher'}
                </p>
              </div>
              <button
                onClick={() => setIsChatModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
              {loadingMessages ? (
                <div className="text-center py-10 text-sm text-slate-400">Loading conversation history...</div>
              ) : chatError ? (
                <div className="text-center py-4 text-sm text-rose-600">{chatError}</div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  No manager/dispatcher messages for this work order yet. Type below to send an inquiry.
                </div>
              ) : (
                messages.map((msg) => {
                  const sRole = msg.senderRole ? msg.senderRole.toUpperCase() : '';
                  const isMe = msg.senderEmail === currentUserEmail || sRole === 'MANAGER';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-medium text-slate-400">
                          {isMe ? 'You (Manager)' : `Dispatcher (${msg.senderEmail})`}
                        </span>
                        <span className="text-[9px] text-slate-300">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isMe
                            ? 'bg-amber-600 text-white rounded-tr-none'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                        }`}
                      >
                        {msg.message}
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
                placeholder="Type your message to the dispatcher..."
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessage.trim()}
                className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-amber-700 disabled:opacity-50 transition-colors"
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
