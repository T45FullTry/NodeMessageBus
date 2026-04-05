import { useState } from 'react';
import { Mail, Plus, Trash2, ToggleLeft, ToggleRight, Edit2 } from 'lucide-react';
import axios from 'axios';
import { EventListener } from '../../../shared/types';

interface Props {
  listeners: EventListener[];
  setListeners: (listeners: EventListener[]) => void;
}

export default function ListenersPanel({ listeners, setListeners }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    eventType: '',
    handler: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await axios.put(`http://localhost:3001/api/listeners/${editingId}`, formData);
        setListeners(listeners.map(l => l.id === editingId ? res.data : l));
      } else {
        const res = await axios.post('http://localhost:3001/api/listeners', formData);
        setListeners([...listeners, res.data]);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', eventType: '', handler: '' });
    } catch (error) {
      console.error('Failed to save listener:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listener?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/listeners/${id}`);
      setListeners(listeners.filter(l => l.id !== id));
    } catch (error) {
      console.error('Failed to delete listener:', error);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await axios.post(`http://localhost:3001/api/listeners/${id}/toggle`);
      setListeners(listeners.map(l => l.id === id ? res.data : l));
    } catch (error) {
      console.error('Failed to toggle listener:', error);
    }
  };

  const handleEdit = (listener: EventListener) => {
    setEditingId(listener.id);
    setFormData({
      name: listener.name,
      eventType: listener.eventType,
      handler: listener.handler
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', eventType: '', handler: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Event Listeners</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Listener
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
              <label className="block text-sm font-medium text-gray-700">Event Type</label>
              <input
                type="text"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                placeholder="e.g., user.signup"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Handler</label>
              <input
                type="text"
                value={formData.handler}
                onChange={(e) => setFormData({ ...formData, handler: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                placeholder="e.g., sendWelcomeEmail"
                required
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
        {listeners.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No event listeners configured</p>
          </div>
        ) : (
          listeners.map((listener) => (
            <div key={listener.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">{listener.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      listener.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {listener.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Event Type:</span> {listener.eventType}
                    </div>
                    <div>
                      <span className="font-medium">Handler:</span> {listener.handler}
                    </div>
                    <div>
                      <span className="font-medium">Triggers:</span> {listener.triggerCount}
                    </div>
                    {listener.lastTriggered && (
                      <div>
                        <span className="font-medium">Last Triggered:</span>{' '}
                        {new Date(listener.lastTriggered).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggle(listener.id)}
                    className="p-2 text-gray-400 hover:text-blue-600"
                    title={listener.active ? 'Deactivate' : 'Activate'}
                  >
                    {listener.active ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                  </button>
                  <button
                    onClick={() => handleEdit(listener)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(listener.id)}
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
