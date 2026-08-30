import { NextResponse } from 'next/server'
import { z } from 'zod'
import { execute } from '@/lib/commerce-engine'
const schema = z.object({ prompt: z.string().trim().min(1).max(500) })
export async function POST(request: Request) { try { const { prompt } = schema.parse(await request.json()); const result = await execute(prompt); return NextResponse.json({ prompt, detectedIntent: result.requirements, toolsCalled: ['search_products','calculate_budget'], agentsExecuted: ['Requirement Agent','Research Agent','Product Intelligence Agent','Budget Agent','Decision Agent'], candidateCount: result.total, rejectedCount: result.rejected.length, finalCandidates: result.candidates, budget: result.optimization, warnings: result.warnings, executionMs: result.executionMs }) } catch { return NextResponse.json({ error: 'Invalid AI Lab prompt.' }, { status: 400 }) } }
