import { NextResponse } from 'next/server'
import { z } from 'zod'
import { execute } from '@/lib/commerce-engine'

const sessions = new Map<string, { messages: string[]; result: Awaited<ReturnType<typeof execute>> | null }>()
const schema = z.object({ sessionId: z.string().min(8).max(100), message: z.string().trim().min(1).max(500) })
export async function POST(request: Request) { try { const { sessionId, message } = schema.parse(await request.json()); const session = sessions.get(sessionId) ?? { messages: [], result: null }; session.messages.push(message); session.result = await execute(message, session.result?.requirements); sessions.set(sessionId, session); return NextResponse.json({ sessionId, ...session.result, messages: session.messages }) } catch { return NextResponse.json({ error: 'Invalid session request.' }, { status: 400 }) } }
