import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'

const intentSchema = z.object({
  category: z.string().min(1),
  productType: z.string().nullable().default(null),
  subcategory: z.string().nullable().default(null),
  useCase: z.string().default(''),
  requiredFeatures: z.array(z.string()).default([]),
  preferredBrands: z.array(z.string()).default([]),
  excludedBrands: z.array(z.string()).default([]),
  budget: z.number().nullable().default(null),
  currency: z.enum(['INR', 'USD']).default('INR'),
  quantity: z.number().int().positive().default(1),
  priorities: z.record(z.string(), z.number()).default({}),
})

export type GeminiIntent = z.infer<typeof intentSchema>

function modelName() {
  return process.env.GEMINI_MODEL || 'gemini-2.5-flash'
}

export function geminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY)
}

export async function extractIntentWithGemini(query: string, previous?: unknown) {
  if (!process.env.GEMINI_API_KEY) return { intent: null, warning: 'GEMINI_API_KEY is not configured. Using deterministic fallback intelligence.' }
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const prompt = `You are ShopGenie, an agentic commerce requirement extractor. Return ONLY valid JSON matching this shape: {"category":string,"productType":string|null,"subcategory":string|null,"useCase":string,"requiredFeatures":string[],"preferredBrands":string[],"excludedBrands":string[],"budget":number|null,"currency":"INR"|"USD","quantity":number,"priorities":object}. Identify the most specific product type requested (for example "smartphones" for "mobile" or "running shoes" for "jogging shoes"). Preserve every user constraint. Do not invent products, prices, reviews, or availability. Previous structured state: ${JSON.stringify(previous ?? null)}. User message: ${query}`
  try {
    const response = await client.models.generateContent({ model: modelName(), contents: prompt, config: { temperature: 0, responseMimeType: 'application/json' } })
    const parsed = JSON.parse(response.text ?? '{}')
    const result = intentSchema.safeParse(parsed)
    if (!result.success) return { intent: null, warning: 'Gemini returned an invalid structured intent. Using deterministic fallback intelligence.' }
    return { intent: result.data, warning: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gemini request failed.'
    const safe = /api.?key|quota|rate|timeout|network|model/i.test(message) ? message : 'Gemini could not complete the request. Using deterministic fallback intelligence.'
    return { intent: null, warning: safe }
  }
}
