'use client'

import { useState } from 'react'

export function TestRunner() {
  const [category, setCategory] = useState('')
  const [item, setItem] = useState('')
  const [report, setReport] = useState<{ summary: { totalTests: number; datasetTotal: number; shown: number; passed: number; failed: number; noResults: number; errors: number }; filters: { categories: string[]; items: string[] }; results: Array<{ search_query: string; category: string; item: string; status: string; reason?: string }> } | null>(null)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    const params = new URLSearchParams({ limit: '100' })
    if (category) params.set('category', category)
    if (item) params.set('item', item)
    const response = await fetch(`/api/test-runner?${params}`)
    setReport(await response.json())
    setLoading(false)
  }

  return <section className="test-runner panel" aria-labelledby="test-runner-title">
    <div className="panel-heading"><div><span className="result-kicker">QUALITY CONTROL</span><h2 id="test-runner-title">CSV test runner</h2><p>Runs real search queries through the production commerce pipeline.</p></div><button className="text-button" onClick={run} disabled={loading}>{loading ? 'Running…' : 'Run 100 tests'}</button></div>
    <div className="runner-filters"><label>Category<select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{report?.filters.categories.map((value) => <option key={value}>{value}</option>)}</select></label><label>Item<select value={item} onChange={(event) => setItem(event.target.value)}><option value="">All items</option>{report?.filters.items.map((value) => <option key={value}>{value}</option>)}</select></label></div>
    {report && <><div className="runner-stats"><strong>{report.summary.totalTests.toLocaleString()}</strong><span>tested</span><strong>{report.summary.passed}</strong><span>passed</span><strong>{report.summary.failed}</strong><span>failed</span><strong>{report.summary.noResults}</strong><span>no results</span><strong>{report.summary.errors}</strong><span>errors</span><span>{report.summary.datasetTotal.toLocaleString()} total dataset rows</span></div><div className="runner-results">{report.results.filter((result) => result.status !== 'PASS').slice(0, 12).map((result) => <div className="runner-row" key={`${result.category}-${result.item}-${result.search_query}`}><span className={`runner-status ${result.status.toLowerCase()}`}>{result.status}</span><div><strong>{result.search_query}</strong><small>{result.category} / {result.item} · {result.reason}</small></div></div>)}{report.results.every((result) => result.status === 'PASS') && <p className="runner-empty">All shown queries passed validation.</p>}</div></>}
  </section>
}
