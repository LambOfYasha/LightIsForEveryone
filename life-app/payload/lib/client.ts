import { getPayload, type Payload } from 'payload'
import config from '@payload-config'

let cached: Promise<Payload> | null = null

export function getPayloadClient() {
  if (!cached) {
    cached = getPayload({ config })
  }
  return cached
}
