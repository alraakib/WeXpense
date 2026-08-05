import pino from 'pino'
import { getEnv } from '@/env'

const logger = pino({
  level: getEnv().LOG_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
  base: undefined
})

export function childLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings)
}

export default logger
