import { EventLog } from '../../shared/types';
import { Activity, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface EventLogPanelProps {
  logs: EventLog[];
}

function EventLogPanel({ logs }: EventLogPanelProps) {
  const getActionIcon = (action: string) => {
    if (action.includes('created') || action.includes('added')) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    if (action.includes('failed') || action.includes('error')) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
    if (action.includes('processing') || action.includes('pending')) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    return <AlertCircle className="w-4 h-4 text-blue-500" />;
  };

  const getActionColor = (action: string) => {
    if (action.includes('created') || action.includes('added')) {
      return 'bg-green-50 border-green-200';
    }
    if (action.includes('failed') || action.includes('error')) {
      return 'bg-red-50 border-red-200';
    }
    if (action.includes('processing') || action.includes('pending')) {
      return 'bg-yellow-50 border-yellow-200';
    }
    return 'bg-blue-50 border-blue-200';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Event Logs</h3>
        <p className="text-gray-500">Event logs will appear here as activities occur in the system.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Event Logs</h2>
        <p className="text-sm text-gray-500 mt-1">
          Showing {logs.length} most recent events
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`px-6 py-4 ${getActionColor(log.action)} border-l-4`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getActionIcon(log.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {log.entityName}
                  </p>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">{log.action}</span>
                  {log.details && (
                    <span className="text-gray-500"> — {log.details}</span>
                  )}
                </p>
                
                <div className="flex items-center space-x-2 mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                    {log.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    ID: {log.entityId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventLogPanel;
