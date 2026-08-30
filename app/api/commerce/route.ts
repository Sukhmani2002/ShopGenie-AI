import { NextResponse } from 'next/server'
import { z } from 'zod'
import { execute } from '@/lib/commerce-engine'
import { extractIntentWithGemini } from '@/lib/gemini-provider'

const requestSchema = z.object({ query: z.string().trim().min(1).max(500), previous: z.record(z.string(), z.unknown()).nullable().optional() })
export async function POST(request: Request) {
  try {
    const input = requestSchema.parse(await request.json())
    const previous = input.previous ?? undefined
    const gemini = await extractIntentWithGemini(input.query, previous)
    const result = await execute(input.query, previous, gemini.intent ? { ...gemini.intent, budget: gemini.intent.budget === null ? null : { max: gemini.intent.budget, currency: gemini.intent.currency as 'INR' | 'USD' }, productType: gemini.intent.productType, subcategory: gemini.intent.subcategory, intent: 'recommend' } : null)
    return NextResponse.json({ ...result, intelligence: { provider: gemini.intent ? 'GEMINI_PLUS_DETERMINISTIC_SEARCH' : 'DETERMINISTIC_FALLBACK', model: gemini.intent ? (process.env.GEMINI_MODEL || 'gemini-2.5-flash') : null, warning: gemini.warning }, noMatchMessage: result.status === 'NO_MATCHING_PRODUCTS' ? `No matching ${result.requirements.category} products were found${result.requirements.budget ? ` under ${result.requirements.budget.currency} ${result.requirements.budget.max}` : ''} from the currently available product sources.` : null })
  } catch (error) {
    console.error('[ShopGenie /api/commerce]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'The shopping request could not be processed.' }, { status: 500 })
  }
}
