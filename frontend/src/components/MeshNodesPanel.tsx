import { MeshNode } from '../../shared/types';
import { Server, Wifi, WifiOff, Activity, Clock, Zap } from 'lucide-react';

interface MeshNodesPanelProps {
  nodes: MeshNode[];
  setNodes: (nodes: MeshNode[]) => void;
}

function MeshNodesPanel({ nodes, setNodes }: MeshNodesPanelProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'hub': return 'bg-purple-100 text-purple-800';
      case 'bridge': return 'bg-blue-100 text-blue-800';
      case 'node': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (timestamp?: string) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (nodes.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Server className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Mesh Nodes</h3>
        <p className="text-gray-500">Mesh nodes will appear here when connected.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {nodes.map((node) => (
        <div
          key={node.id}
          className="bg-white rounded-lg shadow border-l-4"
          style={{
            borderLeftColor: node.status === 'online' ? '#22c55e' : node.status === 'degraded' ? '#eab308' : '#ef4444'
          }}
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-gray-600" />
                <h3 className="text-base font-semibold text-gray-900">{node.name}</h3>
              </div>
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${getStatusColor(node.status)}`} />
                <span className="text-xs text-gray-500 capitalize">{node.status}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Host</span>
                <span className="font-mono text-gray-700">{node.host}:{node.port}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Role</span>
                <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(node.role)}`}>
                  {node.role}
                </span>
              </div>

              {node.latency && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center">
                    <Activity className="w-3 h-3 mr-1" />
                    Latency
                  </span>
                  <span className={`font-medium ${node.latency < 50 ? 'text-green-600' : node.latency < 100 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {node.latency}ms
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  Events Relayed
                </span>
                <span className="font-medium text-gray-700">{node.eventsRelayed.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Last Heartbeat
                </span>
                <span className="text-gray-600">{formatTimeAgo(node.lastHeartbeat)}</span>
              </div>
            </div>

            {node.connectedAt && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Connected: {new Date(node.connectedAt).toLocaleDateString('en-GB')}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MeshNodesPanel;
