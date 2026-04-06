import express, { Request, Response } from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import { EventListener, Receiver, Queue, QueueItem, DashboardStats, EventLog, MeshNode, EventBridge, MeshStats } from '../shared/types';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory mock data store
let listeners: EventListener[] = [
  {
    id: uuidv4(),
    name: 'User Signup Handler',
    eventType: 'user.signup',
    handler: 'sendWelcomeEmail',
    active: true,
    createdAt: new Date().toISOString(),
    lastTriggered: new Date(Date.now() - 3600000).toISOString(),
    triggerCount: 142
  },
  {
    id: uuidv4(),
    name: 'Payment Processor',
    eventType: 'payment.completed',
    handler: 'processPayment',
    active: true,
    createdAt: new Date().toISOString(),
    lastTriggered: new Date(Date.now() - 7200000).toISOString(),
    triggerCount: 89
  },
  {
    id: uuidv4(),
    name: 'Notification Dispatcher',
    eventType: 'notification.send',
    handler: 'dispatchNotification',
    active: false,
    createdAt: new Date().toISOString(),
    triggerCount: 0
  }
];

let receivers: Receiver[] = [
  {
    id: uuidv4(),
    name: 'Webhook Receiver',
    type: 'webhook',
    url: 'https://api.example.com/webhooks',
    port: 3002,
    active: true,
    config: { method: 'POST', headers: { 'Content-Type': 'application/json' } },
    createdAt: new Date().toISOString(),
    lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
    messageCount: 523
  },
  {
    id: uuidv4(),
    name: 'WebSocket Server',
    type: 'websocket',
    port: 3003,
    active: true,
    config: { path: '/ws', pingInterval: 30000 },
    createdAt: new Date().toISOString(),
    lastMessageAt: new Date(Date.now() - 60000).toISOString(),
    messageCount: 1247
  },
  {
    id: uuidv4(),
    name: 'SSE Endpoint',
    type: 'sse',
    url: '/events',
    port: 3001,
    active: false,
    config: { retry: 3000 },
    createdAt: new Date().toISOString(),
    messageCount: 0
  }
];

let queues: Queue[] = [
  {
    id: uuidv4(),
    name: 'Email Queue',
    type: 'fifo',
    items: [
      { id: uuidv4(), data: { to: 'user@example.com', subject: 'Welcome' }, status: 'pending', createdAt: new Date().toISOString(), attempts: 0 },
      { id: uuidv4(), data: { to: 'admin@example.com', subject: 'Report' }, status: 'processing', createdAt: new Date(Date.now() - 300000).toISOString(), attempts: 1 }
    ],
    processing: true,
    createdAt: new Date().toISOString(),
    processedCount: 456,
    failedCount: 3
  },
  {
    id: uuidv4(),
    name: 'Priority Tasks',
    type: 'priority',
    items: [
      { id: uuidv4(), data: { task: 'urgent' }, priority: 10, status: 'pending', createdAt: new Date().toISOString(), attempts: 0 },
      { id: uuidv4(), data: { task: 'normal' }, priority: 5, status: 'pending', createdAt: new Date(Date.now() - 600000).toISOString(), attempts: 0 },
      { id: uuidv4(), data: { task: 'failed' }, priority: 5, status: 'failed', createdAt: new Date(Date.now() - 3600000).toISOString(), attempts: 3, error: 'Timeout' }
    ],
    processing: false,
    createdAt: new Date().toISOString(),
    processedCount: 234,
    failedCount: 12
  },
  {
    id: uuidv4(),
    name: 'Delayed Jobs',
    type: 'delayed',
    items: [],
    processing: true,
    createdAt: new Date().toISOString(),
    processedCount: 89,
    failedCount: 1
  }
];

let eventLogs: EventLog[] = [];

let meshNodes: MeshNode[] = [
  {
    id: uuidv4(),
    name: 'Primary Hub',
    host: '192.168.1.100',
    port: 3001,
    status: 'online',
    role: 'hub',
    connectedAt: new Date(Date.now() - 86400000).toISOString(),
    lastHeartbeat: new Date().toISOString(),
    eventsRelayed: 15234,
    latency: 12
  },
  {
    id: uuidv4(),
    name: 'Edge Node 1',
    host: '192.168.1.101',
    port: 3002,
    status: 'online',
    role: 'node',
    connectedAt: new Date(Date.now() - 43200000).toISOString(),
    lastHeartbeat: new Date(Date.now() - 5000).toISOString(),
    eventsRelayed: 8421,
    latency: 25
  },
  {
    id: uuidv4(),
    name: 'Bridge Server',
    host: '192.168.1.102',
    port: 3003,
    status: 'degraded',
    role: 'bridge',
    connectedAt: new Date(Date.now() - 21600000).toISOString(),
    lastHeartbeat: new Date(Date.now() - 30000).toISOString(),
    eventsRelayed: 3210,
    latency: 150
  },
  {
    id: uuidv4(),
    name: 'Offline Node',
    host: '192.168.1.103',
    port: 3004,
    status: 'offline',
    role: 'node',
    lastHeartbeat: new Date(Date.now() - 3600000).toISOString(),
    eventsRelayed: 1205
  }
];

let eventBridges: EventBridge[] = [
  {
    id: uuidv4(),
    name: 'User Events Bridge',
    sourceNode: meshNodes[0].id,
    targetNodes: [meshNodes[1].id, meshNodes[2].id],
    eventType: 'user.*',
    active: true,
    createdAt: new Date().toISOString(),
    eventsRouted: 5230,
    lastRoutedAt: new Date(Date.now() - 10000).toISOString()
  },
  {
    id: uuidv4(),
    name: 'Payment Events Bridge',
    sourceNode: meshNodes[0].id,
    targetNodes: [meshNodes[2].id],
    eventType: 'payment.*',
    active: true,
    createdAt: new Date().toISOString(),
    eventsRouted: 1823,
    lastRoutedAt: new Date(Date.now() - 60000).toISOString()
  },
  {
    id: uuidv4(),
    name: 'Analytics Bridge',
    sourceNode: meshNodes[1].id,
    targetNodes: [meshNodes[0].id],
    eventType: 'analytics.*',
    filter: 'priority > 5',
    active: false,
    createdAt: new Date().toISOString(),
    eventsRouted: 0
  }
];

const logEvent = (type: 'listener' | 'receiver' | 'queue', action: string, entityId: string, entityName: string, details?: string) => {
  const log: EventLog = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    type,
    action,
    entityId,
    entityName,
    details
  };
  eventLogs.unshift(log);
  if (eventLogs.length > 100) eventLogs.pop();
};

// Dashboard Stats
app.get('/api/stats', (req: Request, res: Response) => {
  const stats: DashboardStats = {
    totalListeners: listeners.length,
    activeListeners: listeners.filter(l => l.active).length,
    totalReceivers: receivers.length,
    activeReceivers: receivers.filter(r => r.active).length,
    totalQueues: queues.length,
    totalQueueItems: queues.reduce((acc, q) => acc + q.items.length, 0),
    pendingItems: queues.reduce((acc, q) => acc + q.items.filter(i => i.status === 'pending').length, 0),
    failedItems: queues.reduce((acc, q) => acc + q.items.filter(i => i.status === 'failed').length, 0)
  };
  res.json(stats);
});

// Mesh Stats
app.get('/api/mesh/stats', (req: Request, res: Response) => {
  const stats: MeshStats = {
    totalNodes: meshNodes.length,
    onlineNodes: meshNodes.filter(n => n.status === 'online').length,
    totalBridges: eventBridges.length,
    activeBridges: eventBridges.filter(b => b.active).length,
    eventsRelayed: meshNodes.reduce((acc, n) => acc + n.eventsRelayed, 0),
    avgLatency: Math.round(meshNodes.filter(n => n.latency).reduce((acc, n) => acc + (n.latency || 0), 0) / meshNodes.filter(n => n.latency).length) || 0
  };
  res.json(stats);
});

// Event Listeners
app.get('/api/listeners', (req: Request, res: Response) => res.json(listeners));

app.post('/api/listeners', (req: Request, res: Response) => {
  const { name, eventType, handler } = req.body;
  const newListener: EventListener = {
    id: uuidv4(),
    name,
    eventType,
    handler,
    active: true,
    createdAt: new Date().toISOString(),
    triggerCount: 0
  };
  listeners.push(newListener);
  logEvent('listener', 'created', newListener.id, newListener.name);
  res.status(201).json(newListener);
});

app.put('/api/listeners/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = listeners.findIndex(l => l.id === id);
  if (index === -1) return res.status(404).json({ error: 'Listener not found' });
  listeners[index] = { ...listeners[index], ...req.body };
  logEvent('listener', 'updated', id, listeners[index].name);
  res.json(listeners[index]);
});

app.delete('/api/listeners/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const listener = listeners.find(l => l.id === id);
  if (!listener) return res.status(404).json({ error: 'Listener not found' });
  listeners = listeners.filter(l => l.id !== id);
  logEvent('listener', 'deleted', id, listener.name);
  res.status(204).send();
});

app.post('/api/listeners/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const listener = listeners.find(l => l.id === id);
  if (!listener) return res.status(404).json({ error: 'Listener not found' });
  listener.active = !listener.active;
  logEvent('listener', 'toggled', id, listener.name, `Active: ${listener.active}`);
  res.json(listener);
});

// Receivers
app.get('/api/receivers', (req: Request, res: Response) => res.json(receivers));

app.post('/api/receivers', (req: Request, res: Response) => {
  const { name, type, url, port, config } = req.body;
  const newReceiver: Receiver = {
    id: uuidv4(),
    name,
    type,
    url,
    port,
    active: true,
    config: config || {},
    createdAt: new Date().toISOString(),
    messageCount: 0
  };
  receivers.push(newReceiver);
  logEvent('receiver', 'created', newReceiver.id, newReceiver.name);
  res.status(201).json(newReceiver);
});

app.put('/api/receivers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = receivers.findIndex(r => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Receiver not found' });
  receivers[index] = { ...receivers[index], ...req.body };
  logEvent('receiver', 'updated', id, receivers[index].name);
  res.json(receivers[index]);
});

app.delete('/api/receivers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const receiver = receivers.find(r => r.id === id);
  if (!receiver) return res.status(404).json({ error: 'Receiver not found' });
  receivers = receivers.filter(r => r.id !== id);
  logEvent('receiver', 'deleted', id, receiver.name);
  res.status(204).send();
});

app.post('/api/receivers/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const receiver = receivers.find(r => r.id === id);
  if (!receiver) return res.status(404).json({ error: 'Receiver not found' });
  receiver.active = !receiver.active;
  logEvent('receiver', 'toggled', id, receiver.name, `Active: ${receiver.active}`);
  res.json(receiver);
});

// Queues
app.get('/api/queues', (req: Request, res: Response) => res.json(queues));

app.get('/api/queues/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const queue = queues.find(q => q.id === id);
  if (!queue) return res.status(404).json({ error: 'Queue not found' });
  res.json(queue);
});

app.post('/api/queues', (req: Request, res: Response) => {
  const { name, type } = req.body;
  const newQueue: Queue = {
    id: uuidv4(),
    name,
    type,
    items: [],
    processing: false,
    createdAt: new Date().toISOString(),
    processedCount: 0,
    failedCount: 0
  };
  queues.push(newQueue);
  logEvent('queue', 'created', newQueue.id, newQueue.name);
  res.status(201).json(newQueue);
});

app.post('/api/queues/:id/items', (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, priority } = req.body;
  const queue = queues.find(q => q.id === id);
  if (!queue) return res.status(404).json({ error: 'Queue not found' });
  
  const newItem: QueueItem = {
    id: uuidv4(),
    data,
    priority,
    status: 'pending',
    createdAt: new Date().toISOString(),
    attempts: 0
  };
  queue.items.push(newItem);
  logEvent('queue', 'item_added', id, queue.name, `Item: ${newItem.id}`);
  res.status(201).json(newItem);
});

app.delete('/api/queues/:queueId/items/:itemId', (req: Request, res: Response) => {
  const { queueId, itemId } = req.params;
  const queue = queues.find(q => q.id === queueId);
  if (!queue) return res.status(404).json({ error: 'Queue not found' });
  
  const item = queue.items.find(i => i.id === itemId);
  queue.items = queue.items.filter(i => i.id !== itemId);
  if (item) logEvent('queue', 'item_removed', queueId, queue.name, `Item: ${itemId}`);
  res.status(204).send();
});

app.post('/api/queues/:id/process', (req: Request, res: Response) => {
  const { id } = req.params;
  const queue = queues.find(q => q.id === id);
  if (!queue) return res.status(404).json({ error: 'Queue not found' });
  
  queue.processing = !queue.processing;
  logEvent('queue', 'processing_toggled', id, queue.name, `Processing: ${queue.processing}`);
  res.json({ processing: queue.processing });
});

app.delete('/api/queues/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const queue = queues.find(q => q.id === id);
  if (!queue) return res.status(404).json({ error: 'Queue not found' });
  queues = queues.filter(q => q.id !== id);
  logEvent('queue', 'deleted', id, queue.name);
  res.status(204).send();
});

// Event Logs
app.get('/api/logs', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 50;
  res.json(eventLogs.slice(0, limit));
});

// Mesh Nodes
app.get('/api/mesh/nodes', (req: Request, res: Response) => res.json(meshNodes));

app.post('/api/mesh/nodes', (req: Request, res: Response) => {
  const { name, host, port, role } = req.body;
  const newNode: MeshNode = {
    id: uuidv4(),
    name,
    host,
    port,
    status: 'offline',
    role,
    createdAt: new Date().toISOString(),
    eventsRelayed: 0
  };
  meshNodes.push(newNode);
  logEvent('mesh', 'node_added', newNode.id, newNode.name, `Role: ${role}`);
  res.status(201).json(newNode);
});

app.put('/api/mesh/nodes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = meshNodes.findIndex(n => n.id === id);
  if (index === -1) return res.status(404).json({ error: 'Node not found' });
  meshNodes[index] = { ...meshNodes[index], ...req.body };
  logEvent('mesh', 'node_updated', id, meshNodes[index].name);
  res.json(meshNodes[index]);
});

app.delete('/api/mesh/nodes/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const node = meshNodes.find(n => n.id === id);
  if (!node) return res.status(404).json({ error: 'Node not found' });
  meshNodes = meshNodes.filter(n => n.id !== id);
  logEvent('mesh', 'node_removed', id, node.name);
  res.status(204).send();
});

app.post('/api/mesh/nodes/:id/heartbeat', (req: Request, res: Response) => {
  const { id } = req.params;
  const { latency } = req.body;
  const node = meshNodes.find(n => n.id === id);
  if (!node) return res.status(404).json({ error: 'Node not found' });
  node.lastHeartbeat = new Date().toISOString();
  node.status = 'online';
  node.latency = latency;
  node.eventsRelayed += 1;
  res.json(node);
});

// Event Bridges
app.get('/api/mesh/bridges', (req: Request, res: Response) => res.json(eventBridges));

app.post('/api/mesh/bridges', (req: Request, res: Response) => {
  const { name, sourceNode, targetNodes, eventType, filter } = req.body;
  const newBridge: EventBridge = {
    id: uuidv4(),
    name,
    sourceNode,
    targetNodes,
    eventType,
    filter,
    active: true,
    createdAt: new Date().toISOString(),
    eventsRouted: 0
  };
  eventBridges.push(newBridge);
  logEvent('bridge', 'created', newBridge.id, newBridge.name, `Events: ${eventType}`);
  res.status(201).json(newBridge);
});

app.put('/api/mesh/bridges/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = eventBridges.findIndex(b => b.id === id);
  if (index === -1) return res.status(404).json({ error: 'Bridge not found' });
  eventBridges[index] = { ...eventBridges[index], ...req.body };
  logEvent('bridge', 'updated', id, eventBridges[index].name);
  res.json(eventBridges[index]);
});

app.delete('/api/mesh/bridges/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const bridge = eventBridges.find(b => b.id === id);
  if (!bridge) return res.status(404).json({ error: 'Bridge not found' });
  eventBridges = eventBridges.filter(b => b.id !== id);
  logEvent('bridge', 'deleted', id, bridge.name);
  res.status(204).send();
});

app.post('/api/mesh/bridges/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const bridge = eventBridges.find(b => b.id === id);
  if (!bridge) return res.status(404).json({ error: 'Bridge not found' });
  bridge.active = !bridge.active;
  logEvent('bridge', 'toggled', id, bridge.name, `Active: ${bridge.active}`);
  res.json(bridge);
});

app.post('/api/mesh/bridges/:id/route', (req: Request, res: Response) => {
  const { id } = req.params;
  const { eventData } = req.body;
  const bridge = eventBridges.find(b => b.id === id);
  if (!bridge) return res.status(404).json({ error: 'Bridge not found' });
  
  bridge.eventsRouted += 1;
  bridge.lastRoutedAt = new Date().toISOString();
  logEvent('bridge', 'event_routed', id, bridge.name, `Event: ${JSON.stringify(eventData)}`);
  res.json({ success: true, routedAt: bridge.lastRoutedAt });
});

// WebSocket for real-time updates
import { WebSocketServer } from 'ws';
import http from 'http';

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws) => {
  console.log('Client connected to WebSocket');
  
  // Send initial data
  ws.send(JSON.stringify({ type: 'init', listeners, receivers, queues, meshNodes, eventBridges }));
  
  ws.on('close', () => console.log('Client disconnected'));
});

// Broadcast updates
const broadcast = (data: any) => {
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(JSON.stringify(data));
  });
};

// Hook into mutations to broadcast changes
const originalListenersPush = listeners.push;
listeners.push = function(...items) {
  const result = originalListenersPush.apply(this, items);
  broadcast({ type: 'listeners_updated', listeners });
  return result;
};

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
});
