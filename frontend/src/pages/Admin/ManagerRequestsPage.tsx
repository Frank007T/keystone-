import React, { useEffect, useState, useRef } from 'react';
import { 
  fetchRequestsByZone, 
  fetchAdminManagerMessages, 
  sendAdminManagerMessage, 
  WorkOrder, 
  Notification 
} from '../../lib/api';
import api from '../../lib/api';

export function ManagerRequestsPage() {
  const [requests, setRequests] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected Zone Filter
  const [selectedZone, setSelectedZone] = useState<number | undefined>(undefined);

  // Chat Modal States
  const [activeRequest, setActiveRequest] = useState<WorkOrder | null>(null);
  const [chatMessages, setChatMessages] = useState<Notification[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [queryMessage, setQueryMessage] = useState('');
  const [sendingQuery, setSendingQuery] = useState(false);
  const [chatError, setChatError] = useState('');
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeRequest && chatMessages.length > 0) {
      scrollToBottom();
    }
  }, [chatMessages, activeRequest]);

  // Fetch current user email
  useEffect(() => {
    api.get('/api/data/me')
      .then((res) => {
        if (res.data?.email) setCurrentUserEmail(res.data.email);
      })
      .catch(() => {
        const savedUser = localStorage.getItem('keystoneUser');
        if (savedUser) {
          try {
            const parsed = JSON.parse(savedUser);
            if (parsed.email) setCurrentUserEmail(parsed.email);
          } catch (e) {
            console.error('Failed to parse saved user:', e);
          }
        }
      });
  }, []);

  const loadRequests = () => {
    setLoading(true);
    fetchRequestsByZone(selectedZone)
      .then(setRequests)
      .catch((err) => setError(err.message || 'Failed to load requests.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, [selectedZone]);

  // Fetch isolated Admin-Manager Chat History for the specific Work Order
  const fetchChatHistory = async (workOrderId: number) => {
    setLoadingChat(true);
    setChatError('');
    try {
      const messages = await fetchAdminManagerMessages(workOrderId);
      setChatMessages(messages);
    } catch (err: any) {
      setChatError(err.message || 'Failed to load chat history.');
    } finally {
      setLoadingChat(false);
    }
  };

  // Open Chat Modal
  const handleOpenChat = (req: WorkOrder) => {
    setActiveRequest(req);
    setQueryMessage('');
    fetchChatHistory(req.id);
  };

  // Send Message in Admin-Manager Channel
  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequest || !queryMessage.trim()) return;

    setSendingQuery(true);
    setChatError('');
    const textToSend = queryMessage.trim();

    try {
      await sendAdminManagerMessage(activeRequest.id, textToSend, activeRequest.assignedToEmail);
      setQueryMessage('');
      // Refresh chat list directly from dedicated endpoint
      await fetchChatHistory(activeRequest.id);
    } catch (err: any) {
      setChatError(err.message || 'Failed to send message.');
    } finally {
      setSendingQuery(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in_progress':
      case 'in progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pending':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-white p-6 shadow-soft">
        {/* Header & Zone Selection */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Zone Operations</p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Work Order Requests</h2>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="zoneFilter" className="text-sm font-medium text-slate-600">
              Filter Zone:
            </label>
            <select
              id="zoneFilter"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 outline-none focus:border-primary"
              value={selectedZone ?? ''}
              onChange={(e) => setSelectedZone(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">All Zones</option>
              <option value="1">Zone 1 - North</option>
              <option value="2">Zone 2 - South</option>
              <option value="3">Zone 3 - East</option>
              <option value="4">Zone 4 - West</option>
            </select>
          </div>
        </div>

        {/* Requests Table */}
        <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
          <table className="w-full border-collapse text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                {['Request ID', 'Title', 'Site', 'Priority', 'Status', 'Created Date', 'Action'].map(
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
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    Loading requests...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-rose-600">
                    {error}
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-500">
                    No requests found for this zone.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-950">#{req.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{req.title}</td>
                    <td className="px-6 py-4">{req.siteName || 'N/A'}</td>
                    <td className="px-6 py-4 capitalize">{req.priority}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusBadgeClass(
                          req.status
                        )}`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOpenChat(req)}
                        className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-white transition-colors"
                      >
                        Ask Manager
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chat Thread Modal */}
      {activeRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Manager Chat — Request #{activeRequest.id}
                </h3>
                <p className="text-xs text-slate-500">{activeRequest.title}</p>
              </div>
              <button
                onClick={() => setActiveRequest(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            {/* Chat Box */}
            <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1 max-h-[380px] min-h-[220px]">
              {loadingChat ? (
                <p className="text-center text-xs text-slate-400 py-10">Loading conversation...</p>
              ) : chatError ? (
                <p className="text-center text-xs text-rose-600 py-4">{chatError}</p>
              ) : chatMessages.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm font-medium text-slate-600">No prior messages.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Send a query to start the conversation with the Zone Manager.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const sRole = msg.senderRole ? msg.senderRole.toUpperCase() : '';
                  const isMe =
                    (currentUserEmail &&
                      msg.senderEmail?.toLowerCase() === currentUserEmail.toLowerCase()) ||
                    sRole === 'SUPER_ADMIN' ||
                    sRole === 'SUPER ADMIN';

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1 px-1">
                        <span className="font-semibold text-slate-600">
                          {isMe ? 'You (Admin)' : msg.senderEmail || 'Manager'}
                        </span>
                        {msg.senderRole && (
                          <span className="bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200 text-[10px]">
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
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          isMe
                            ? 'bg-primary text-white rounded-tr-none'
                            : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input & Actions */}
            <form onSubmit={handleSendQuery} className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Type message to Zone Manager..."
                  value={queryMessage}
                  onChange={(e) => setQueryMessage(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={sendingQuery || !queryMessage.trim()}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-primary/90 disabled:opacity-50 transition"
                >
                  {sendingQuery ? 'Sending...' : 'Send'}
                </button>
              </div>

              {/* Quick Reply Pills */}
              <div className="flex gap-2 items-center text-xs">
                <span className="text-slate-400">Quick:</span>
                <button
                  type="button"
                  onClick={() => setQueryMessage('Please provide an update on this request.')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition"
                >
                  Status Update Request
                </button>
                <button
                  type="button"
                  onClick={() => setQueryMessage('Please assign a technician as soon as possible.')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg transition"
                >
                  Urgent Priority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}