import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'
import { getEnv } from '@/env'
import logger from '@/shared/utils/logger'

type Processor = (payload: Record<string, unknown>) => Promise<void>
const processors = new Map<string, Processor>()

export function registerProcessor(name: string, fn: Processor): void {
  processors.set(name, fn)
}

export interface QueuedJob {
  name: string
  payload: Record<string, unknown>
  id?: string
}

interface Driver {
  enqueue(job: QueuedJob): Promise<void>
  stop(): Promise<void>
}

class InlineDriver implements Driver {
  async enqueue(job: QueuedJob): Promise<void> {
    const fn = processors.get(job.name)
    if (fn) await fn(job.payload)
  }
  async stop(): Promise<void> {}
}

class BullMQDriver implements Driver {
  private connection: Redis
  private queue: Queue
  private worker: Worker | null = null

  constructor() {
    this.connection = new Redis(getEnv().REDIS_URI, {
      db: getEnv().REDIS_DB,
      maxRetriesPerRequest: null,
      lazyConnect: true
    })
    this.queue = new Queue('wexpense', { connection: this.connection })
    this.worker = new Worker(
      'wexpense',
      async (job) => {
        const fn = processors.get(job.name)
        if (fn) await fn(job.data as Record<string, unknown>)
      },
      { connection: this.connection, concurrency: 10 }
    )
  }

  async enqueue(job: QueuedJob): Promise<void> {
    await this.queue.add(job.name, job.payload, job.id ? { jobId: job.id } : {})
  }

  async stop(): Promise<void> {
    await this.worker?.close()
    await this.queue.close()
    this.connection.disconnect()
  }
}

let driver: Driver | null = null

export function getQueue(): Driver {
  if (!driver) {
    driver = getEnv().QUEUE_DRIVER === 'bullmq' ? new BullMQDriver() : new InlineDriver()
  }
  return driver
}

export function startQueueWorkers(): void {
  if (getEnv().QUEUE_DRIVER !== 'bullmq') return
  getQueue()
  logger.info('bullmq worker started')
}

export async function enqueue(job: QueuedJob): Promise<void> {
  await getQueue().enqueue(job)
}

export async function stopQueue(): Promise<void> {
  if (driver) {
    await driver.stop()
    driver = null
  }
}

export function queueStats(): Record<string, unknown> {
  return {
    driver: getEnv().QUEUE_DRIVER,
    jobs: Array.from(processors.keys())
  }
}
