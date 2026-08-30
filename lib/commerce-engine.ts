import { z } from 'zod'
import seedCatalog from './generated-catalog.json'

export const currencySchema = z.enum(['INR', 'USD'])
export const requirementsSchema = z.object({
  category: z.string().min(1),
  subcategory: z.string().nullable(),
  productType: z.string().nullable(),
  gender: z.string().nullable(),
  budget: z.object({ max: z.number().nonnegative(), currency: currencySchema }).nullable(),
  requiredFeatures: z.array(z.string()),
  excludedSubcategories: z.array(z.string()),
  excludedBrands: z.array(z.string()),
  quantity: z.number().int().positive(),
  useCase: z.string(),
  intent: z.string(),
})
export type Requirements = z.infer<typeof requirementsSchema>
export type Product = {
  id: string; title: string; category: string; subcategory: string; price: number; currency: 'INR' | 'USD'; image: string | null
  description: string; specifications: Record<string, string>; rating: number; reviewCount: number; store: string
  source: string; dataStatus: 'DEMO'; features: string[]; reason: string; fit?: number; evidence?: string[]
}

type SeedProduct = Omit<Product, 'fit' | 'evidence' | 'reason'> & { reason?: string }
const catalog: Product[] = (seedCatalog as SeedProduct[]).map((p) => ({
  ...p,
  title: p.title.replace(/^Demo\s+/i, '').replace(/\s+(Pro|Essential)$/i, ''),
  store: p.store === 'Demo catalog' ? 'ShopGenie Sandbox Catalog' : p.store,
  source: p.source || (p.store === 'Demo catalog' ? 'ShopGenie Sandbox Catalog' : p.store) || 'ShopGenie Sandbox Catalog',
  reason: p.reason || 'Matches the detected product type and current constraints.',
}))

const aliases: Record<string, string[]> = {
  smartphones: ['smartphone','smartphones','mobile','mobiles','mobile phone','mobile phones','cell phone','cellphone','iphone','android phone'],
  laptops: ['laptop','laptops','notebook','notebooks','macbook'],
  'running shoes': ['running shoe','running shoes','jogging shoes','run shoes'],
  shirts: ['shirt','shirts','tee','tshirt','t-shirt','tees'],
  headphones: ['headphone','headphones','headset','headsets','noise cancelling headphones','noise-cancelling headphones'],
  watches: ['watch','watches','wristwatch','wrist watches'],
  earbuds: ['earbud','earbuds','airpods','wireless earbuds'],
  shoes: ['shoe','shoes','footwear'],
  clothing: ['clothing','clothes','cloth','outfit','apparel','wear'],
  gifts: ['gift','gifts','present','presents'],
}

const normalize = (value: string) => value.toLowerCase()
  .replace(/[^a-z0-9₹$€£,.'\s-]/gi, ' ')
  .replace(/\bcloths?\b/g, 'clothes')
  .replace(/\bt-?shirts?\b/g, 'shirts')
  .replace(/\bshooes\b/g, 'shoes')
  .replace(/\bheadfone?s?\b/g, 'headphones')
  .replace(/\blaptp\b/g, 'laptop')
  .replace(/\bwacth\b/g, 'watch')
  .replace(/\bmoble\b/g, 'mobile')
  .replace(/\s+/g, ' ')
  .trim()

function canonicalItem(query: string) {
  const q = normalize(query)
  const aliasEntries = Object.entries(aliases)
    .flatMap(([canonical, values]) => values.map((value) => ({ canonical, value })))
    .sort((a, b) => b.value.length - a.value.length)
  const alias = aliasEntries.find(({ value }) => new RegExp(`(?:^|\\s)${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:$|\\s)`, 'i').test(q))
  if (alias) return alias.canonical
  const types = [...new Set(catalog.map((p) => p.subcategory))].sort((a, b) => b.length - a.length)
  return types.find((type) => q.includes(type.toLowerCase())) || null
}

function inferCategory(query: string, item: string | null, previous?: Partial<Requirements>) {
  if (item) {
    const found = catalog.find((p) => p.subcategory === item)
    if (found) return found.category
    if (item === 'clothing') return 'clothing'
    if (item === 'watches') return catalog.find((p) => p.category === 'watches-jewellery')?.category || 'watches-jewellery'
    if (item === 'shoes') return 'footwear'
  }
  const q = normalize(query)
  if (/\b(gift|present)\b/.test(q)) {
    const match = catalog.find((p) => p.category === 'gifts-occasions')
    if (match) return match.category
  }
  const categoryAliases: Record<string, string[]> = {
    electronics: ['electronics', 'electronic', 'tech', 'gadgets'],
    clothing: ['clothing', 'clothes', 'fashion', 'apparel'],
    footwear: ['footwear', 'shoes', 'shoe'],
    'home-appliances': ['home appliances', 'appliances'],
    kitchen: ['kitchen'],
    travel: ['travel'],
    automotive: ['automotive', 'car accessories', 'bike accessories'],
    'sports-fitness': ['sports', 'fitness', 'gym'],
  }
  for (const [category, values] of Object.entries(categoryAliases)) if (values.some((v) => q.includes(v))) {
    const match = catalog.find((p) => p.category === category || p.category.startsWith(`${category}-`))
    if (match) return match.category
  }
  return previous?.category || catalog.find((p) => q.includes(p.category))?.category || 'shopping'
}

function parseBudget(q: string, previous?: Partial<Requirements>) {
  const match = q.match(/(?:under|below|less than|within|up to|max(?:imum)?|budget(?: of)?|ke andar|se kam|tak)\s*[₹$€£]?\s*([\d,]+(?:\.\d+)?)/i)
    || q.match(/[₹$€£]\s*([\d,]+(?:\.\d+)?)/)
  if (!match) return previous?.budget ?? null
  const max = Number(match[1].replaceAll(',', ''))
  if (!Number.isFinite(max)) return previous?.budget ?? null
  const currency = /\$/.test(match[0]) ? 'USD' : /€/.test(match[0]) ? 'INR' : /£/.test(match[0]) ? 'INR' : 'INR'
  return { max, currency: currency as 'INR' | 'USD' }
}

function extractFeatures(q: string, item: string | null) {
  const stop = new Set(['best', 'find', 'need', 'want', 'under', 'below', 'within', 'with', 'for', 'from', 'less', 'than', 'daily', 'use', 'the', 'and', 'show', 'give', 'recommend', 'recommendations'])
  const words = q.split(/\s+/).filter((x) => x.length > 3 && !stop.has(x) && !/^\d/.test(x) && !/^[₹$€£]/.test(x))
  const itemWords = new Set((item || '').split(/\s+/))
  return words.filter((x) => !itemWords.has(x)).slice(0, 12)
}

export function extractRequirements(query: string, previous?: Partial<Requirements>): Requirements {
  const q = normalize(query)
  const productType = canonicalItem(q) || previous?.productType || null
  const category = inferCategory(q, productType, previous)
  const subcategory = productType && productType !== 'clothing' ? productType : previous?.subcategory ?? null
  const gender = /\b(men|men's|mens|male)\b/.test(q) ? "men's" : /\b(women|women's|womens|female)\b/.test(q) ? "women's" : previous?.gender ?? null
  const excludedBrands = [...(previous?.excludedBrands ?? [])]
  const noBrand = q.match(/(?:no|exclude|not)\s+([a-z][a-z0-9-]+)/i)
  if (noBrand && !['shirt', 'shoes', 'phone', 'laptop', 'brand'].includes(noBrand[1].toLowerCase())) excludedBrands.push(noBrand[1].toLowerCase())
  const quantityMatch = q.match(/\b(\d+)\s+(?:items?|pieces?|units?|sets?)\b/)
  const intent = /\b(compare|vs|versus)\b/.test(q) ? 'compare' : /\b(alternative|cheaper alternative|replacement)\b/.test(q) ? 'alternative' : /\b(gift|present)\b/.test(q) ? 'gift' : /\b(build|setup|everything|kit|bundle)\b/.test(q) ? 'bundle' : /\b(cheapest|lowest price)\b/.test(q) ? 'lowest-cost' : /\b(premium|luxury)\b/.test(q) ? 'premium' : 'recommend'
  return {
    category,
    subcategory,
    productType,
    gender,
    budget: parseBudget(q, previous),
    requiredFeatures: extractFeatures(q, productType),
    excludedSubcategories: previous?.excludedSubcategories ?? [],
    excludedBrands: [...new Set(excludedBrands)],
    quantity: quantityMatch ? Math.max(1, Number(quantityMatch[1])) : previous?.quantity ?? 1,
    useCase: query,
    intent,
  }
}

function textMatches(p: Product, value: string) {
  const haystack = `${p.title} ${p.category} ${p.subcategory} ${p.features.join(' ')} ${Object.values(p.specifications).join(' ')}`.toLowerCase()
  return haystack.includes(value.toLowerCase())
}

export function validateProduct(p: Product, r: Requirements) {
  const categoryOk = r.category === 'shopping' || p.category === r.category
  const productOk = !r.productType
    || (r.productType === 'clothing' && p.category === 'clothing')
    || (r.productType === 'gifts' && p.category === 'gifts-occasions')
    || (r.productType === 'watches' && p.category === 'watches-jewellery' && /watch/.test(p.subcategory))
    || (r.productType === 'shoes' && p.category === 'footwear')
    || p.subcategory === r.productType
    || textMatches(p, r.productType)
  const budgetOk = !r.budget || (p.currency === r.budget.currency && p.price <= r.budget.max)
  const excludedOk = !r.excludedSubcategories.includes(p.subcategory) && !r.excludedBrands.some((b) => textMatches(p, b))
  return categoryOk && productOk && budgetOk && excludedOk
}

function scoreProduct(p: Product, r: Requirements) {
  let score = 60 + p.rating * 6
  if (r.productType && (p.subcategory === r.productType || textMatches(p, r.productType))) score += 20
  const matchingFeatures = r.requiredFeatures.filter((f) => textMatches(p, f)).length
  score += matchingFeatures * 3
  if (r.budget) score += Math.max(0, 10 - (p.price / Math.max(1, r.budget.max)) * 10)
  return Math.min(99, Math.round(score))
}

export function searchProducts(r: Requirements, limit = 20) {
  const candidates = catalog.filter((p) => validateProduct(p, r)).map((p) => ({
    ...p,
    fit: scoreProduct(p, r),
    evidence: [
      'product type validated',
      r.budget ? `price <= ${r.budget.max} ${r.budget.currency}` : 'budget not specified',
      r.requiredFeatures.length ? `matched ${r.requiredFeatures.filter((f) => textMatches(p, f)).length} requested features` : 'no extra feature constraint',
      'structured demo catalog data',
    ],
  })).sort((a, b) => (b.fit ?? 0) - (a.fit ?? 0)).slice(0, limit)
  const rejected = catalog.filter((p) => !validateProduct(p, r)).slice(0, 100)
  return { candidates, rejected, total: catalog.length, matchingTotal: candidates.length }
}

export function optimize(products: Product[], budget: Requirements['budget']) {
  const eligible = products.filter((p) => !budget || (p.currency === budget.currency && p.price <= budget.max))
  const total = eligible.reduce((s, p) => s + p.price, 0)
  return {
    bestValue: [...eligible].sort((a, b) => (b.fit ?? 0) - (a.fit ?? 0)).slice(0, 1),
    bestPerformance: [...eligible].sort((a, b) => b.rating - a.rating).slice(0, 3),
    lowestCost: [...eligible].sort((a, b) => a.price - b.price).slice(0, 3),
    total,
    remaining: budget ? budget.max - total : null,
  }
}

function normalizeGeminiType(value: string | null | undefined) {
  if (!value) return null
  const normalized = normalize(value)
  return canonicalItem(normalized) || [...new Set(catalog.map((p) => p.subcategory))].find((type) => normalized === type.toLowerCase()) || null
}

function mergeRequirements(deterministic: Requirements, geminiIntent?: Partial<Requirements> | null): Requirements {
  if (!geminiIntent) return deterministic
  const geminiType = normalizeGeminiType(geminiIntent.productType)
  const resolvedType = geminiType || deterministic.productType
  const resolvedCategory = resolvedType
    ? catalog.find((p) => p.subcategory === resolvedType)?.category || deterministic.category
    : deterministic.category
  const deterministicBudget = deterministic.budget
  const geminiBudget = geminiIntent.budget
  const budget = geminiBudget && Number.isFinite(geminiBudget.max)
    ? { max: geminiBudget.max, currency: geminiBudget.currency as 'INR' | 'USD' }
    : deterministicBudget
  return {
    ...deterministic,
    category: resolvedCategory,
    productType: resolvedType,
    subcategory: resolvedType || deterministic.subcategory,
    budget,
    requiredFeatures: geminiIntent.requiredFeatures?.length ? geminiIntent.requiredFeatures : deterministic.requiredFeatures,
    excludedBrands: [...new Set([...(deterministic.excludedBrands || []), ...(geminiIntent.excludedBrands || [])])],
    quantity: geminiIntent.quantity || deterministic.quantity,
    useCase: geminiIntent.useCase || deterministic.useCase,
    intent: geminiIntent.intent || deterministic.intent,
  }
}

export async function execute(query: string, previous?: Partial<Requirements>, geminiIntent?: Partial<Requirements> | null) {
  const deterministic = extractRequirements(query, previous)
  const requirements = mergeRequirements(deterministic, geminiIntent)
  const searched = searchProducts(requirements)
  const noMatch = searched.candidates.length === 0
  const events = [
    { label: 'Intent understood', detail: `${requirements.productType || requirements.category}${requirements.budget ? ` · max ${requirements.budget.max} ${requirements.budget.currency}` : ''}` },
    { label: 'Search provider queried', detail: `Scanned ${searched.total.toLocaleString()} structured demo listings` },
    { label: 'Constraints validated', detail: `${searched.matchingTotal} eligible products remained` },
    { label: noMatch ? 'No matching products found' : 'Recommendations ranked', detail: noMatch ? 'No constraints were relaxed' : 'Only validated products returned' },
  ]
  return {
    requestId: crypto.randomUUID(),
    query,
    requirements,
    total: searched.matchingTotal,
    scannedTotal: searched.total,
    candidates: searched.candidates,
    rejected: searched.rejected,
    status: noMatch ? 'NO_MATCHING_PRODUCTS' as const : 'completed' as const,
    optimization: optimize(searched.candidates, requirements.budget),
    events,
    warnings: ['DEMO DATA: prices and availability are not live.'],
    executionMs: 0,
    provider: 'DEMO_PROVIDER' as const,
  }
}

export { catalog as seedProducts }
