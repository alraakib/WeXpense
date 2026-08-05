import { MongoClient, Db } from 'mongodb'
import { getEnv } from '@/env'

let client: MongoClient | null = null
let db: Db | null = null

export async function connectMongo(uri = getEnv().MONGODB_URI, dbName = getEnv().MONGO_DB): Promise<Db> {
  if (db) return db
  client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 600000,
    serverSelectionTimeoutMS: 10000,
    waitQueueTimeoutMS: 10000
  })
  await client.connect()
  db = client.db(dbName)
  return db
}

export function getDb(): Db {
  if (!db) throw new Error('MongoDB not connected. Call connectMongo() first.')
  return db
}

export async function disconnectMongo(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
  }
}

export const isConnected = () => db !== null
