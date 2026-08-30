import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { execute } from '@/lib/commerce-engine'
import { extractIntentWithGemini } from '@/lib/gemini-provider'

type CsvRow = { category: string; item: string; query_type: string; search_query: string }
type TestStatus = 'PASS' | 'FAIL' | 'NO_RESULTS' | 'ERROR'

function parseCsv(csv: string): CsvRow[] {
  const lines = csv.split(/\r?\n/).filter(Boolean)
  return lines.slice(1).map((line) => {
    const [category = '', item = '', query_type = '', search_query = ''] = line.split(',').map((value) => value.trim().replace(/^"|"$/g, ''))
    return { category, item, query_type, search_query }
  }).filter((row) => row.search_query)
}

function validate(row: CsvRow, result: Awaited<ReturnType<typeof execute>>): { status: TestStatus; reason?: string } {
  const candidates = result.candidates
  if (result.status === 'NO_MATCHING_PRODUCTS' || candidates.length === 0) return { status: 'NO_RESULTS', reason: 'No eligible demo products were returned by the provider.' }
  const requested = row.item.toLowerCase()
  const itemMatch = candidates.every((candidate) => {
    const haystack = `${candidate.title} ${candidate.subcategory} ${candidate.features.join(' ')}`.toLowerCase()
    return haystack.includes(requested) || result.requirements.productType?.toLowerCase() === requested || (requested === 'clothes' && candidate.category === 'clothing')
  })
  if (!itemMatch) return { status: 'FAIL', reason: `Product-type mismatch: expected ${row.item}.` }
  if (result.requirements.budget) {
    const overBudget = candidates.some((candidate) => candidate.currency !== result.requirements.budget?.currency || candidate.price > result.requirements.budget.max)
    if (overBudget) return { status: 'FAIL', reason: 'Budget or currency constraint violated.' }
  }
  const sourceIds = new Set(candidates.map((candidate) => candidate.id))
  if (sourceIds.size !== candidates.length) return { status: 'FAIL', reason: 'Duplicate recommendation identifiers detected.' }
  return { status: 'PASS' }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const categoryFilter = searchParams.get('category')?.toLowerCase()
  const itemFilter = searchParams.get('item')?.toLowerCase()
  const limit = Math.min(Number(searchParams.get('limit') || 200), 1000)
  const offset = Math.max(Number(searchParams.get('offset') || 0), 0)
  const csv = await readFile(path.join(process.cwd(), 'data/shopgenie_search_possibilities.csv'), 'utf8')
  const rows = parseCsv(csv).filter((row) => (!categoryFilter || row.category.toLowerCase() === categoryFilter) && (!itemFilter || row.item.toLowerCase() === itemFilter))
  const selected = rows.slice(offset, offset + limit)
  const results = []
  for (const row of selected) {
    const started = performance.now()
    try {
      const gemini = await extractIntentWithGemini(row.search_query)
      const result = await execute(row.search_query, undefined, gemini.intent ? { ...gemini.intent, budget: gemini.intent.budget === null ? null : { max: gemini.intent.budget, currency: gemini.intent.currency }, intent: 'recommend' } : null)
      const verdict = validate(row, result)
      results.push({ ...row, status: verdict.status, reason: verdict.reason, normalizedIntent: result.requirements, candidateCount: result.candidates.length, rejectedCount: result.rejected.length, executionMs: Math.round(performance.now() - started), provider: 'production-commerce-engine' })
    } catch (error) {
      results.push({ ...row, status: 'ERROR' as const, reason: error instanceof Error ? error.message : 'Unknown runner error', normalizedIntent: null, candidateCount: 0, rejectedCount: 0, executionMs: Math.round(performance.now() - started), provider: 'production-commerce-engine' })
    }
  }
  const allRows = parseCsv(csv)
  const summary = { totalTests: selected.length, datasetTotal: allRows.length, shown: results.length, passed: results.filter((r) => r.status === 'PASS').length, failed: results.filter((r) => r.status === 'FAIL').length, noResults: results.filter((r) => r.status === 'NO_RESULTS').length, errors: results.filter((r) => r.status === 'ERROR').length }
  return NextResponse.json({ summary, filters: { categories: [...new Set(allRows.map((row) => row.category))], items: [...new Set(allRows.map((row) => row.item))] }, pagination: { offset, limit, returned: results.length }, results })
}
