import { NextResponse } from 'next/server'
import { getSession } from '@/lib/checkout'
export async function GET(request: Request) { const sessionId = new URL(request.url).searchParams.get('sessionId'); if (!sessionId) return NextResponse.json({ error: 'sessionId is required' }, { status: 400 }); const session = getSession(sessionId); return NextResponse.json({ orders: session.orders, stage: session.stage, persisted: false, provenance: 'DEMO_SIMULATION' }) }
