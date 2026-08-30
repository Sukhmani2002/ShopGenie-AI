import { PRODUCT_TAXONOMY } from './product-taxonomy'

const budgets = ['under ₹500', 'below ₹2000', 'under ₹7000', 'less than $100', 'within €300', 'up to 10000 INR', 'on a budget']
const intents = ['find the best', 'recommend', 'compare', 'find a cheaper', 'find a durable', 'find an alternative to', 'help me buy']
const uses = ['for college', 'for travel', 'for a gift', 'for a small apartment', 'for daily use', 'for a beginner', 'for monsoon', 'for a wedding']
const attributes = ['lightweight', 'with good reviews', 'durable', 'easy to clean', 'with a warranty', 'for a beginner', 'premium quality']
const languages = ['', ' please', ' mujhe chahiye', ' ke liye', ' on a budget']

export type GeneratedQuery = { id: string; category: string; productType: string; query: string }
export function generateQueries(perProductType = 1024): GeneratedQuery[] {
  const output: GeneratedQuery[] = []
  for (const [category, productTypes] of Object.entries(PRODUCT_TAXONOMY)) for (const productType of productTypes) {
    let i = 0
    for (const intent of intents) for (const budget of budgets) for (const use of uses) for (const attribute of attributes) for (const language of languages) {
      if (i++ >= perProductType) break
      output.push({ id: `${category}-${productType.replaceAll(' ', '-')}-${i}`, category, productType, query: `${intent} ${productType} ${budget} ${use} ${attribute}${language}` })
    }
  }
  return output
}
