import { NextResponse } from 'next/server'
import { execute } from '@/lib/commerce-engine'
import { buildQuerySuite } from '@/lib/query-suite'

export async function GET() {
  const results = []
  for (const query of buildQuerySuite()) {
    const started = performance.now()
    const result = await execute(query)
    results.push({ query, normalizedIntent: result.requirements, category: result.requirements.category, budget: result.requirements.budget?.max ?? null, currency: result.requirements.budget?.currency ?? null, candidateCount: result.total, validCandidateCount: result.candidates.length, rejectedCount: result.rejected.length, finalRecommendationCount: result.candidates.length, passed: result.status === 'completed' || result.status === 'NO_MATCHING_PRODUCTS', failureReason: undefined, executionTime: Math.round(performance.now() - started) })
  }
  const passed = results.filter((item) => item.passed).length
  return NextResponse.json({ totalTests: results.length, passed, failed: results.length - passed, passRate: `${((passed / results.length) * 100).toFixed(2)}%`, results })
}
