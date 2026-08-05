import { useEffect, useState, useRef } from 'react';
import {
  fetchTechnicianJobs,
  fetchDispatcherTechnicianMessages,
  sendDispatcherTechnicianMessage,
  Notification,
  WorkOrder,
} from '../../lib/api';

export function TechnicianJobsPage() {
  const [jobs, setJobs] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Chat Modal State
  const [activeChatJob, setActiveChatJob] = useState<WorkOrder | null>(null);
  const [chatMessages, setChatMessages] = useState<Notification[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatError, setChatError] = useState('');

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const currentUserEmail = localStorage.getItem('userEmail') || '';

  useEffect(() => {
    fetchTechnicianJobs()
      .then(setJobs)
      .catch((err) => setError(err.message || 'Unable to load jobs.'))
      .finally(() => setLoading(false));
  }, []);

  // Auto-scroll chat modal to bottom
  useEffect(() => {
    if (activeChatJob && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeChatJob]);

  const loadMessages = async (workOrderId: number) => {
    setLoadingChat(true);
    setChatError('');
    try {
      const msgs = await fetchDispatcherTechnicianMessages(workOrderId);
      setChatMessages(msgs);
    } catch (err: any) {
      setChatError(err.message || 'Failed to load chat history.');
    } finally {
      setLoadingChat(false);
    }
  };

  const openChatModal = (job: WorkOrder) => {
    setActiveChatJob(job);
    setNewMessage('');
    loadMessages(job.id);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChatJob) return;

    setSendingMessage(true);
    setChatError('');

    try {
      await sendDispatcherTechnicianMessage(
        activeChatJob.id,
        newMessage,
        'dispatcher@keystone.com'
      );
      setNewMessage('');
      await loadMessages(activeChatJob.id);
    } catch (err: any) {
      setChatError(err.message || 'Failed to send message.');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">My Jobs</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-950">View and manage assigned jobs</h2>
        
        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                {['Job ID', 'Customer', 'Site', 'Priority', 'Status', 'Due Date', 'Actions'].map((heading) => (
                  <th key={heading} className="px-6 py-4 font-medium text-slate-500">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    Loading jobs...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    No jobs assigned yet.
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-950">WO-{job.id}</td>
                    <td className="px-6 py-4">{job.customerEmail}</td>
                    <td className="px-6 py-4">{job.siteName}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          job.priority?.toUpperCase() === 'HIGH'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {job.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                          (job.status || '').toString().toLowerCase().includes('assigned')
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {(job.status || '').toString().trim().toLowerCase().includes('assigned')
                          ? 'assigned'
                          : (job.status || '').toString().trim().toLowerCase().includes('success')
                            ? 'success'
                            : (job.status || '').toString().trim().toLowerCase().includes('failed')
                              ? 'failed'
                              : (job.status || '').toString().trim().toLowerCase().includes('pending')
                                ? 'pending'
                                : (job.status || '').toString().trim().toLowerCase().includes('processing') || (job.status || '').toString().trim().toLowerCase().includes('in progress')
                                  ? 'processing'
                                  : 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {job.dueDate ? new Date(job.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openChatModal(job)}
                        className="rounded-xl bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
                      >
                        Chat Dispatcher
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technician - Dispatcher Chat Modal */}
      {activeChatJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white shadow-xl flex flex-col h-[580px] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Dispatcher Chat — WO-{activeChatJob.id}
                </h3>
                <p className="text-xs text-slate-500">
                  Direct Channel with Dispatcher
                </p>
              </div>
              <button
                onClick={() => setActiveChatJob(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30">
              {loadingChat ? (
                <div className="text-center py-10 text-sm text-slate-400">
                  Loading conversation history...
                </div>
              ) : chatError ? (
                <div className="text-center py-4 text-sm text-rose-600">{chatError}</div>
              ) : chatMessages.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-400">
                  No messages with the dispatcher for this job yet. Type below to start chatting.
                </div>
              ) : (
                chatMessages.map((msg, idx) => {
                  const sRole = msg.senderRole ? msg.senderRole.toUpperCase() : '';
                  const isMe =
                    (currentUserEmail && msg.senderEmail?.toLowerCase() === currentUserEmail.toLowerCase()) ||
                    sRole === 'TECHNICIAN';

                  return (
                    <div
                      key={msg.id || idx}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[10px] font-medium text-slate-400">
                          {isMe ? 'You (Technician)' : `Dispatcher (${msg.senderEmail})`}
                        </span>
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
                            ? 'bg-primary text-white rounded-br-none' // Right Side (You - Tech)
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none' // Left Side (Dispatcher)
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
                placeholder="Type your message to the dispatcher..."
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