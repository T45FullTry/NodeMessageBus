import { useState, useEffect } from 'react';
import { Activity, Mail, Server, List, Clock, AlertCircle, CheckCircle, XCircle, GitMerge, Zap } from 'lucide-react';
import axios from 'axios';
import ListenersPanel from './components/ListenersPanel';
import ReceiversPanel from './components/ReceiversPanel';
import QueuesPanel from './components/QueuesPanel';
import EventLogPanel from './components/EventLogPanel';
import MeshNodesPanel from './components/MeshNodesPanel';
import EventBridgesPanel from './components/EventBridgesPanel';
import { EventListener, Receiver, Queue, DashboardStats, EventLog, MeshNode, EventBridge, MeshStats } from '../../shared/types';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [activeTab, setActiveTab] = useState<'listeners' | 'receivers' | 'queues' | 'logs' | 'mesh' | 'bridges'>('listeners');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [meshStats, setMeshStats] = useState<MeshStats | null>(null);
  const [listeners, setListeners] = useState<EventListener[]>([]);
  const [receivers, setReceivers] = useState<Receiver[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [meshNodes, setMeshNodes] = useState<MeshNode[]>([]);
  const [bridges, setBridges] = useState<EventBridge[]>([]);
  const [wsConnected, setWsConnected] = useState(false);

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [statsRes, listenersRes, receiversRes, queuesRes, logsRes, meshStatsRes, meshNodesRes, bridgesRes] = await Promise.all([
        axios.get(`${API_URL}/stats`),
        axios.get(`${API_URL}/listeners`),
        axios.get(`${API_URL}/receivers`),
        axios.get(`${API_URL}/queues`),
        axios.get(`${API_URL}/logs?limit=50`),
        axios.get(`${API_URL}/mesh/stats`),
        axios.get(`${API_URL}/mesh/nodes`),
        axios.get(`${API_URL}/mesh/bridges`)
      ]);
      setStats(statsRes.data);
      setMeshStats(meshStatsRes.data);
      setListeners(listenersRes.data);
      setReceivers(receiversRes.data);
      setQueues(queuesRes.data);
      setLogs(logsRes.data);
      setMeshNodes(meshNodesRes.data);
      setBridges(bridgesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  // WebSocket connection for real-time updates
  useEffect(() => {
    fetchData();

    const ws = new WebSocket('ws://localhost:3001/ws');
    
    ws.onopen = () => {
      setWsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('WS Message:', data);
      
      if (data.type === 'init') {
        setListeners(data.listeners);
        setReceivers(data.receivers);
        setQueues(data.queues);
        setMeshNodes(data.meshNodes || []);
        setBridges(data.eventBridges || []);
      } else if (data.type === 'listeners_updated') {
        setListeners(data.listeners);
      }
      
      fetchData(); // Refresh all data on any update
    };

    ws.onclose = () => {
      setWsConnected(false);
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'listeners':
        return <ListenersPanel listeners={listeners} setListeners={setListeners} />;
      case 'receivers':
        return <ReceiversPanel receivers={receivers} setReceivers={setReceivers} />;
      case 'queues':
        return <QueuesPanel queues={queues} setQueues={setQueues} />;
      case 'logs':
        return <EventLogPanel logs={logs} />;
      case 'mesh':
        return <MeshNodesPanel nodes={meshNodes} setNodes={setMeshNodes} />;
      case 'bridges':
        return <EventBridgesPanel bridges={bridges} nodes={meshNodes} setBridges={setBridges} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Event Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">{wsConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      {stats && meshStats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Event Listeners</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.activeListeners} / {stats.totalListeners}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <Server className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Receivers</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.activeReceivers} / {stats.totalReceivers}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                  <List className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Queue Items</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalQueueItems}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending / Failed</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.pendingItems} / {stats.failedItems}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mesh Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                  <Server className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Mesh Nodes</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {meshStats.onlineNodes} / {meshStats.totalNodes}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-teal-100 rounded-md p-3">
                  <GitMerge className="h-6 w-6 text-teal-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Event Bridges</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {meshStats.activeBridges} / {meshStats.totalBridges}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-orange-100 rounded-md p-3">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Events Relayed</p>
                  <p className="text-2xl font-semibold text-gray-900">{meshStats.eventsRelayed.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-pink-100 rounded-md p-3">
                  <Activity className="h-6 w-6 text-pink-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Avg Latency</p>
                  <p className="text-2xl font-semibold text-gray-900">{meshStats.avgLatency}ms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {[
              { id: 'listeners', label: 'Event Listeners', icon: Mail },
              { id: 'receivers', label: 'Receivers', icon: Server },
              { id: 'queues', label: 'Queues', icon: List },
              { id: 'logs', label: 'Event Logs', icon: Activity },
              { id: 'mesh', label: 'Mesh Nodes', icon: Server },
              { id: 'bridges', label: 'Event Bridges', icon: GitMerge }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
