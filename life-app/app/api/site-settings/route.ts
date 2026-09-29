import { NextResponse } from 'next/server'
import { getMaintenanceMode } from '@/payload/lib/pages'

export async function GET() {
  const maintenanceMode = await getMaintenanceMode()
  return NextResponse.json({ maintenanceMode })
}
