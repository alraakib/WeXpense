import { getRedis } from './db/redis'
import { RealTimeEvent, Envelope } from './types'
import logger from './utils/logger'

const CHANNEL = 'ws:events'
const localSubscriptions = new Map<string, Set<WebSocket>>()

export function subscribeLocal(channel: string, ws: WebSocket): void {
  let set = localSubscriptions.get(channel)
  if (!set) {
    set = new Set()
    localSubscriptions.set(channel, set)
  }
  set.add(ws)
}

export function unsubscribeLocal(channel: string, ws: WebSocket): void {
  const set = localSubscriptions.get(channel)
  if (!set) return
  set.delete(ws)
  if (set.size === 0) localSubscriptions.delete(channel)
}

export function unsubscribeAllLocal(ws: WebSocket): void {
  for (const [channel, set] of localSubscriptions) {
    if (set.delete(ws) && set.size === 0) localSubscriptions.delete(channel)
  }
}

export async function publish(channel: string, event: RealTimeEvent): Promise<void> {
  const envelope: Envelope = { channel, event }
  try {
    await getRedis().publish(CHANNEL, JSON.stringify(envelope))
  } catch (err) {
    logger.warn({ err, channel }, 'realtime publish failed')
  }
}

let relayStarted = false
let subscriber: ReturnType<typeof getRedis> | null = null

export async function startRelay(onEvent: (envelope: Envelope) => void): Promise<void> {
  if (relayStarted) return
  relayStarted = true
  subscriber = getRedis().duplicate()
  await subscriber.connect()
  await subscriber.subscribe(CHANNEL)
  subscriber.on('message', (channel, message) => {
    if (channel !== CHANNEL) return
    try {
      onEvent(JSON.parse(message) as Envelope)
    } catch {
      /* ignore malformed */
    }
  })
}

export function closeRelay(): void {
  if (!relayStarted) return
  relayStarted = false
  subscriber?.disconnect()
  subscriber = null
}

export function deliverLocal(envelope: Envelope): void {
  const sockets = localSubscriptions.get(envelope.channel)
  if (!sockets) return
  const payload = JSON.stringify(envelope.event)
  for (const ws of sockets) {
    try {
      ws.send(payload)
    } catch {
      /* socket closed */
    }
  }
}

export function localSubscriberCount(): number {
  return localSubscriptions.size
}
