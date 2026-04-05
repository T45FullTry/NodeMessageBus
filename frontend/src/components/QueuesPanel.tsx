import { useState } from 'react';
import { List, Plus, Trash2, Play, Pause, XCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { Queue } from '../../../shared/types';

interface Props {
  queues: Queue[];
  setQueues: (queues: Queue[]) => void;
}

export default function QueuesPanel({ queues, setQueues }: Props) {
  const [expandedQueue, setExpandedQueue] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newItemData, setNewItemData] = useState('');
  const [newItemPriority, setNewItemPriority] = useState(5);
  const [formData, setFormData] = useState({ name: '', type: 'fifo' as Queue['type'] });

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/api/queues', formData);
      setQueues([...queues, res.data]);
      setShowForm(false);
      setFormData({ name: '', type: 'fifo' });
    } catch (error) {
      console.error('Failed to create queue:', error);
    }
  };

  const handleDeleteQueue = async (id: string) => {
    if (!confirm('Are you sure you want to delete this queue?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/queues/${id}`);
      setQueues(queues.filter(q => q.id !== id));
    } catch (error) {
      console.error('Failed to delete queue:', error);
    }
  };

  const handleToggleProcessing = async (id: string) => {
    try {
      const res = await axios.post(`http://localhost:3001/api/queues/${id}/process`);
      setQueues(queues.map(q => q.id === id ? { ...q, processing: res.data.processing } : q));
    } catch (error) {
      console.error('Failed to toggle processing:', error);
    }
  };

  const handleAddItem = async (queueId: string) => {
    if (!newItemData.trim()) return;
    try {
      const res = await axios.post(`http://localhost:3001/api/queues/${queueId}/items`, {
        data: JSON.parse(newItemData),
        priority: newItemPriority
      });
      setQueues(queues.map(q => {
        if (q.id === queueId) {
          return { ...q, items: [...q.items, res.data] };
        }
        return q;
      }));
      setNewItemData('');
      setNewItemPriority(5);
    } catch (error) {
      console.error('Failed to add item:', error);
      alert('Invalid JSON data');
    }
  };

  const handleDeleteItem = async (queueId: string, itemId: string) => {
    try {
      await axios.delete(`http://localhost:3001/api/queues/${queueId}/items/${itemId}`);
      setQueues(queues.map(q => {
        if (q.id === queueId) {
          return { ...q, items: q.items.filter(i => i.id !== itemId) };
        }
        return q;
      }));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50';
      case 'processing': return 'text-blue-600 bg-blue-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: Queue['type']) => {
    switch (type) {
      case 'priority': return 'bg-purple-100 text-purple-800';
      case 'delayed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Create Queue Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleCreateQueue} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Queue['type'] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                >
                  <option value="fifo">FIFO</option>
                  <option value="priority">Priority</option>
                  <option value="delayed">Delayed</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Queue
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Queues List */}
      <div className="grid gap-4">
        {queues.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            <List className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No queues configured</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 flex items-center mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Queue
            </button>
          </div>
        ) : (
          queues.map((queue) => (
            <div key={queue.id} className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{queue.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(queue.type)}`}>
                      {queue.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      queue.processing ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {queue.processing ? 'Processing' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleProcessing(queue.id)}
                      className="p-2 text-gray-400 hover:text-blue-600"
                      title={queue.processing ? 'Pause' : 'Resume'}
                    >
                      {queue.processing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </button>
                    <button
                      onClick={() => setExpandedQueue(expandedQueue === queue.id ? null : queue.id)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title={expandedQueue === queue.id ? 'Collapse' : 'Expand'}
                    >
                      <List className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteQueue(queue.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                      title="Delete Queue"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-semibold text-gray-900">{queue.items.length}</p>
                    <p className="text-gray-500">Items</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-semibold text-blue-900">
                      {queue.items.filter(i => i.status === 'pending').length}
                    </p>
                    <p className="text-blue-500">Pending</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-semibold text-green-900">{queue.processedCount}</p>
                    <p className="text-green-500">Processed</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-semibold text-red-900">{queue.failedCount}</p>
                    <p className="text-red-500">Failed</p>
                  </div>
                </div>

                {/* Add Item Form */}
                {expandedQueue === queue.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex space-x-3 mb-4">
                      <input
                        type="text"
                        value={newItemData}
                        onChange={(e) => setNewItemData(e.target.value)}
                        placeholder='{"key": "value"}'
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border font-mono text-sm"
                      />
                      {queue.type === 'priority' && (
                        <input
                          type="number"
                          value={newItemPriority}
                          onChange={(e) => setNewItemPriority(parseInt(e.target.value) || 5)}
                          placeholder="Priority"
                          className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                        />
                      )}
                      <button
                        onClick={() => handleAddItem(queue.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Add Item
                      </button>
                    </div>

                    {/* Queue Items */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {queue.items.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">No items in queue</p>
                      ) : (
                        queue.items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(item.status)}`}
                          >
                            <div className="flex items-center space-x-3 flex-1">
                              {getStatusIcon(item.status)}
                              <div className="flex-1">
                                <p className="font-mono text-sm">
                                  {JSON.stringify(item.data).slice(0, 50)}
                                  {JSON.stringify(item.data).length > 50 ? '...' : ''}
                                </p>
                                <div className="flex items-center space-x-4 mt-1 text-xs">
                                  <span>Attempts: {item.attempts}</span>
                                  {item.priority !== undefined && (
                                    <span>Priority: {item.priority}</span>
                                  )}
                                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                                </div>
                                {item.error && (
                                  <p className="text-red-600 text-xs mt-1">Error: {item.error}</p>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteItem(queue.id, item.id)}
                              className="p-1 text-gray-400 hover:text-red-600"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
