import { PRODUCT_TAXONOMY } from './product-taxonomy'

const budgets = ['under ₹500','below ₹2000','less than $100','within €300','max £250','500 ke andar','up to 10000 INR','around 1k']
const intents = ['find the best','recommend','compare','find a cheaper','find a premium','find the most durable','find an alternative to','help me buy']
const uses = ['for college','for travel','for a gift','for a small apartment','for daily use','for a beginner','for monsoon','for a wedding']
const brands = ['from Sony','from Apple','from Samsung','from Nike','from Canon','without Apple','with good reviews','that is lightweight']
const languages = ['', ' please', ' mujhe chahiye', ' ke liye', ' on a budget']

export const QUERY_SUITE = Array.from(new Set(
  Object.values(PRODUCT_TAXONOMY).flatMap((items) => items.flatMap((product) =>
    budgets.flatMap((budget) => intents.slice(0, 4).flatMap((intent) => uses.slice(0, 4).map((use, i) => `${intent} ${product} ${budget} ${use}${brands[i % brands.length]}${languages[i % languages.length]}`)))
  ))
)).slice(0, 2048)

export type QueryTestResult = { query: string; category: string; budget: number | null; candidateCount: number; validCandidateCount: number; rejectedCount: number; passed: boolean; failureReason?: string; executionTime: number }

export function buildQuerySuite(minimum = 1000) {
  if (QUERY_SUITE.length < minimum) throw new Error(`Query suite contains ${QUERY_SUITE.length}; expected at least ${minimum}`)
  return QUERY_SUITE
}
