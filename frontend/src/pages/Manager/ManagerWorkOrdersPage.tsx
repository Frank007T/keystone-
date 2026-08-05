import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
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

  // Create Work Order Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

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
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    siteName: '',
    customerEmail: '',
    assignedToEmail: '',
    priority: 'MEDIUM',
    status: 'OPEN',
    dueDate: '',
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const token = localStorage.getItem('keystoneToken');
      const API_BASE_URL = (import.meta.env as any).VITE_API_URL || 'http://localhost:8080';

      const payload = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      };

      await axios.post(`${API_BASE_URL}/api/data/manager/work-orders`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsModalOpen(false);
      setFormData({
        title: '',
        description: '',
        siteName: '',
        customerEmail: '',
        assignedToEmail: '',
        priority: 'MEDIUM',
        status: 'OPEN',
        dueDate: '',
      });
      loadWorkOrders();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create work order.');
    } finally {
      setSubmitting(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-[32px] bg-white p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Work Orders</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">Create and manage service work orders</h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-soft hover:bg-primary/90 transition-colors"
        >
          Create Work Order
        </button>
      </div>

      {/* Table Section */}
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
              orders.map((order) => (
                <tr key={order.id} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-950">WO-{order.id}</td>
                  <td className="px-6 py-4">{order.customerEmail}</td>
                  <td className="px-6 py-4">{order.siteName}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      order.status.toUpperCase() === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      order.status.toUpperCase() === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {order.status}
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
              ))
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

      {/* Create Work Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-semibold text-slate-950">Create Work Order</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {formError && <p className="mt-4 text-sm text-rose-600">{formError}</p>}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-primary"
                  placeholder="HVAC Repair / System Check"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Description</label>
                <textarea
                  name="description"
                  required
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-primary"
                  placeholder="Detailed breakdown of work required..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Site Name</label>
                  <input
                    type="text"
                    name="siteName"
                    required
                    value={formData.siteName}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-primary"
                    placeholder="Building A"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Customer Email</label>
                  <input
                    type="email"
                    name="customerEmail"
                    required
                    value={formData.customerEmail}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-primary"
                    placeholder="client@company.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Assign Technician</label>
                  <input
                    type="email"
                    name="assignedToEmail"
                    value={formData.assignedToEmail}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-primary"
                    placeholder="tech@keystone.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Priority</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="URGENT">URGENT</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-soft hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}