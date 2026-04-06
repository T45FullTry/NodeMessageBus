// Shared types for event dashboard

export interface EventListener {
  id: string;
  name: string;
  eventType: string;
  handler: string;
  active: boolean;
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export interface Receiver {
  id: string;
  name: string;
  type: 'webhook' | 'websocket' | 'sse' | 'polling';
  url?: string;
  port?: number;
  active: boolean;
  config: Record<string, any>;
  createdAt: string;
  lastMessageAt?: string;
  messageCount: number;
}

export interface Queue {
  id: string;
  name: string;
  type: 'fifo' | 'priority' | 'delayed';
  items: QueueItem[];
  processing: boolean;
  createdAt: string;
  processedCount: number;
  failedCount: number;
}

export interface QueueItem {
  id: string;
  data: any;
  priority?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
  attempts: number;
  error?: string;
}

export interface DashboardStats {
  totalListeners: number;
  activeListeners: number;
  totalReceivers: number;
  activeReceivers: number;
  totalQueues: number;
  totalQueueItems: number;
  pendingItems: number;
  failedItems: number;
}

export interface EventLog {
  id: string;
  timestamp: string;
  type: 'listener' | 'receiver' | 'queue' | 'bridge' | 'mesh';
  action: string;
  entityId: string;
  entityName: string;
  details?: string;
}

export interface MeshNode {
  id: string;
  name: string;
  host: string;
  port: number;
  status: 'online' | 'offline' | 'degraded';
  role: 'bridge' | 'node' | 'hub';
  connectedAt?: string;
  lastHeartbeat?: string;
  eventsRelayed: number;
  latency?: number;
}

export interface EventBridge {
  id: string;
  name: string;
  sourceNode: string;
  targetNodes: string[];
  eventType: string;
  filter?: string;
  active: boolean;
  createdAt: string;
  eventsRouted: number;
  lastRoutedAt?: string;
}

export interface MeshStats {
  totalNodes: number;
  onlineNodes: number;
  totalBridges: number;
  activeBridges: number;
  eventsRelayed: number;
  avgLatency: number;
}
