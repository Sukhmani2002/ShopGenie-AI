import { z } from 'zod'
import { execute, type Product } from './commerce-engine'
import { extractIntentWithGemini } from './gemini-provider'

export const shoppingRequestSchema = z.object({ query: z.string().trim().min(1).max(500) })
export const provenanceSchema = z.enum(['LIVE', 'DEMO', 'ESTIMATED', 'AI_ANALYSIS'])
export const productSchema = z.object({
  id: z.string(), title: z.string(), store: z.string(), price: z.number().nonnegative(), fit: z.number().min(0).max(100),
  reason: z.string(), provenance: provenanceSchema,
})
export const agentResultSchema = z.object({
  query: z.string(), status: z.literal('completed'), source: z.object({ type: z.literal('DEMO_DATA'), label: z.string() }),
  generatedAt: z.string(), intent: z.object({ category: z.string(), budget: z.number().nullable(), excludedBrands: z.array(z.string()), needsClarification: z.boolean(), confidence: z.enum(['HIGH', 'MEDIUM']) }),
  route: z.array(z.string()), summary: z.string(), recommendations: z.array(productSchema), warnings: z.array(z.string()),
})
export type { Product }

export interface ProductProvider { search(query: string): Promise<Product[]> }

export const demoProvider: ProductProvider = {
  async search(query) {
    const result = await execute(query)
    return result.candidates
  },
}

export async function runLegacyAgent(query: string) {
  const gemini = await extractIntentWithGemini(query)
  const result = await execute(query, undefined, gemini.intent ? {
    ...gemini.intent,
    budget: gemini.intent.budget === null ? null : { max: gemini.intent.budget, currency: gemini.intent.currency },
    productType: gemini.intent.productType,
    subcategory: gemini.intent.subcategory,
    intent: 'recommend',
  } : null)
  return { gemini, result }
}
