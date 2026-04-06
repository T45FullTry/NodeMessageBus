import { EventBridge, MeshNode } from '../../shared/types';
import { GitMerge, ArrowRight, Filter, Zap, Clock, ToggleLeft, ToggleRight } from 'lucide-react';

interface EventBridgesPanelProps {
  bridges: EventBridge[];
  nodes: MeshNode[];
  setBridges: (bridges: EventBridge[]) => void;
}

function EventBridgesPanel({ bridges, nodes, setBridges }: EventBridgesPanelProps) {
  const getNodeName = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? node.name : nodeId;
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

  if (bridges.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <GitMerge className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Event Bridges</h3>
        <p className="text-gray-500">Create bridges to route events between mesh nodes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bridges.map((bridge) => (
        <div
          key={bridge.id}
          className={`bg-white rounded-lg shadow border-l-4 ${
            bridge.active ? 'border-green-500' : 'border-gray-300'
          }`}
        >
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <GitMerge className={`w-5 h-5 ${bridge.active ? 'text-green-600' : 'text-gray-400'}`} />
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{bridge.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{bridge.eventType}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                bridge.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {bridge.active ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Route Visualization */}
            <div className="bg-gray-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <p className="text-xs text-gray-500 mb-1">Source</p>
                  <p className="text-sm font-medium text-gray-900">{getNodeName(bridge.sourceNode)}</p>
                </div>
                
                <div className="flex items-center space-x-2 px-4">
                  <ArrowRight className={`w-5 h-5 ${bridge.active ? 'text-green-600' : 'text-gray-400'}`} />
                  {bridge.filter && (
                    <div className="flex items-center space-x-1">
                      <Filter className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500 font-mono">{bridge.filter}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 text-center">
                  <p className="text-xs text-gray-500 mb-1">Targets ({bridge.targetNodes.length})</p>
                  <div className="flex flex-wrap justify-center gap-1">
                    {bridge.targetNodes.map((targetId, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {getNodeName(targetId)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-500">Routed:</span>
                  <span className="font-medium text-gray-700">{bridge.eventsRouted.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-gray-500">Last:</span>
                  <span className="text-gray-600">{formatTimeAgo(bridge.lastRoutedAt)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  bridge.active = !bridge.active;
                  setBridges([...bridges]);
                }}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
              >
                {bridge.active ? (
                  <>
                    <ToggleRight className="w-5 h-5 text-green-600" />
                    <span>Disable</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-5 h-5 text-gray-400" />
                    <span>Enable</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default EventBridgesPanel;
