import { NextResponse } from 'next/server'
import { agentResultSchema, shoppingRequestSchema, runLegacyAgent } from '@/lib/shopgenie'

export async function POST(request: Request) {
  try {
    const parsed = shoppingRequestSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Enter a shopping request between 1 and 500 characters.' }, { status: 400 })
    const { query } = parsed.data
    const { gemini, result } = await runLegacyAgent(query)
    const output = {
      query,
      status: 'completed' as const,
      source: { type: 'DEMO_DATA' as const, label: 'ShopGenie structured demo provider' },
      generatedAt: new Date().toISOString(),
      intent: {
        category: result.requirements.category,
        budget: result.requirements.budget?.max ?? null,
        excludedBrands: result.requirements.excludedBrands,
        needsClarification: result.status === 'NO_MATCHING_PRODUCTS',
        confidence: gemini.intent ? 'HIGH' as const : 'MEDIUM' as const,
      },
      route: result.events.map((event) => event.label),
      summary: result.status === 'NO_MATCHING_PRODUCTS' ? 'No matching products were found.' : `Found ${result.candidates.length} validated products for this request.`,
      recommendations: result.candidates.slice(0, 5).map((p) => ({ id: p.id, title: p.title, store: p.store, price: p.price, fit: p.fit ?? 0, reason: p.reason, provenance: 'DEMO' as const })),
      warnings: result.warnings,
    }
    return NextResponse.json(agentResultSchema.parse(output))
  } catch { return NextResponse.json({ error: 'Unable to process this request.' }, { status: 400 }) }
}
