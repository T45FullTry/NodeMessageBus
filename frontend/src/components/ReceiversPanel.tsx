import { useState } from 'react';
import { Server, Plus, Trash2, ToggleLeft, ToggleRight, Edit2, Wifi } from 'lucide-react';
import axios from 'axios';
import { Receiver } from '../../../shared/types';

interface Props {
  receivers: Receiver[];
  setReceivers: (receivers: Receiver[]) => void;
}

export default function ReceiversPanel({ receivers, setReceivers }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'webhook' as Receiver['type'],
    url: '',
    port: undefined as number | undefined,
    config: '{}'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const config = JSON.parse(formData.config || '{}');
      const payload = { ...formData, config };
      
      if (editingId) {
        const res = await axios.put(`http://localhost:3001/api/receivers/${editingId}`, payload);
        setReceivers(receivers.map(r => r.id === editingId ? res.data : r));
      } else {
        const res = await axios.post('http://localhost:3001/api/receivers', payload);
        setReceivers([...receivers, res.data]);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', type: 'webhook', url: '', port: undefined, config: '{}' });
    } catch (error) {
      console.error('Failed to save receiver:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this receiver?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/receivers/${id}`);
      setReceivers(receivers.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete receiver:', error);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await axios.post(`http://localhost:3001/api/receivers/${id}/toggle`);
      setReceivers(receivers.map(r => r.id === id ? res.data : r));
    } catch (error) {
      console.error('Failed to toggle receiver:', error);
    }
  };

  const handleEdit = (receiver: Receiver) => {
    setEditingId(receiver.id);
    setFormData({
      name: receiver.name,
      type: receiver.type,
      url: receiver.url || '',
      port: receiver.port,
      config: JSON.stringify(receiver.config, null, 2)
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', type: 'webhook', url: '', port: undefined, config: '{}' });
  };

  const getTypeIcon = (type: Receiver['type']) => {
    switch (type) {
      case 'websocket': return <Wifi className="w-5 h-5" />;
      case 'sse': return <Activity className="w-5 h-5" />;
      case 'polling': return <Clock className="w-5 h-5" />;
      default: return <Server className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: Receiver['type']) => {
    switch (type) {
      case 'websocket': return 'bg-purple-100 text-purple-800';
      case 'sse': return 'bg-blue-100 text-blue-800';
      case 'polling': return 'bg-orange-100 text-orange-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Receivers</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Receiver
        </button>
      </div>

      {showForm && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
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
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Receiver['type'] })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
              >
                <option value="webhook">Webhook</option>
                <option value="websocket">WebSocket</option>
                <option value="sse">Server-Sent Events</option>
                <option value="polling">Polling</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">URL</label>
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  placeholder="/webhooks or https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Port</label>
                <input
                  type="number"
                  value={formData.port || ''}
                  onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || undefined })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  placeholder="3000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Config (JSON)</label>
              <textarea
                value={formData.config}
                onChange={(e) => setFormData({ ...formData, config: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border font-mono text-sm"
                rows={4}
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {receivers.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Server className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No receivers configured</p>
          </div>
        ) : (
          receivers.map((receiver) => (
            <div key={receiver.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{receiver.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(receiver.type)}`}>
                      {receiver.type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      receiver.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {receiver.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                    {receiver.url && (
                      <div>
                        <span className="font-medium">URL:</span> {receiver.url}
                      </div>
                    )}
                    {receiver.port && (
                      <div>
                        <span className="font-medium">Port:</span> {receiver.port}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Messages:</span> {receiver.messageCount}
                    </div>
                    {receiver.lastMessageAt && (
                      <div>
                        <span className="font-medium">Last Message:</span>{' '}
                        {new Date(receiver.lastMessageAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggle(receiver.id)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title={receiver.active ? 'Deactivate' : 'Activate'}
                  >
                    {receiver.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={() => handleEdit(receiver)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(receiver.id)}
                    className="p-2 text-gray-400 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
