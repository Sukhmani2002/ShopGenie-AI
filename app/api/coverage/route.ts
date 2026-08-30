import { NextResponse } from 'next/server'
import { generateQueries } from '@/lib/QUERY_GENERATOR'
import { execute } from '@/lib/commerce-engine'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const page = Math.max(1, Number(url.searchParams.get('page') || 1))
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize') || 25)))
  const all = generateQueries(1024)
  const slice = all.slice((page - 1) * pageSize, page * pageSize)
  const results = await Promise.all(slice.map(async (item) => {
    const result = await execute(item.query)
    return { ...item, status: result.status === 'completed' ? 'PASS' : 'NO_RESULTS', candidateCount: result.candidates.length, rejectedCount: result.rejected.length, intent: result.requirements }
  }))
  return NextResponse.json({ page, pageSize, total: all.length, totalPages: Math.ceil(all.length / pageSize), results, summary: { pass: results.filter((r) => r.status === 'PASS').length, noResults: results.filter((r) => r.status === 'NO_RESULTS').length } })
}
