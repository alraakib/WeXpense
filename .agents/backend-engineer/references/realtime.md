# Real-time & Messaging

## WebSockets

### Socket.io
- Real-time bidirectional communication
- Auto-reconnection
- Room/namespace support

```typescript
import { Server } from 'socket.io';

const io = new Server(server);

io.on('connection', (socket) => {
  socket.on('message', (data) => {
    io.emit('message', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});
```

### ws (WebSocket)
- Lightweight WebSocket library
- Standard WebSocket API

```typescript
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    ws.send(data.toString());
  });
});
```

## Message Queues

### Bull/BullMQ
- Redis-based job queue
- Delayed jobs
- Retries
- Rate limiting

```typescript
import { Queue, Worker } from 'bullmq';

// Producer
const emailQueue = new Queue('email');
await emailQueue.add('send', { to: 'user@example.com' });

// Consumer
const worker = new Worker('email', async (job) => {
  await sendEmail(job.data.to);
});
```

### RabbitMQ (amqplib)
- AMQP protocol
- Exchanges, queues, routing
- Acknowledgments

### Kafka
- Distributed event streaming
- High throughput
- Event sourcing

## Server-Sent Events (SSE)

```typescript
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  const sendEvent = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };
  
  // Send events
  sendEvent({ message: 'Connected' });
});
```

## Best Practices

- Use WebSockets for real-time bidirectional
- Use SSE for server-to-client streaming
- Use message queues for async processing
- Implement reconnection logic
- Use heartbeats for connection health
- Implement proper error handling
- Use rooms/namespaces for organization
