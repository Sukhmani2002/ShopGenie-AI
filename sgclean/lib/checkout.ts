import { z } from 'zod'
import { execute, seedProducts, type Product } from './commerce-engine'

export type SessionStage = 'DISCOVERING' | 'MATCHED' | 'REVIEWING' | 'COMPARING' | 'CART' | 'CHECKOUT' | 'PAYMENT_PENDING' | 'ORDER_CONFIRMED' | 'TRACKING' | 'COMPLETED'
export type CartItem = { productId: string; quantity: number; product: Product }
export type CheckoutAddress = { name: string; line1: string; city: string; postalCode: string; country: string }
export type Order = { id: string; sessionId: string; items: CartItem[]; total: number; currency: string; status: 'CONFIRMED'; createdAt: string; tracking: { status: string; eta: string; provenance: 'DEMO_SIMULATION' } }

const sessions = new Map<string, { stage: SessionStage; cart: Map<string, number>; products: Map<string, Product>; orders: Order[] }>()
export function getSession(sessionId: string) { const existing = sessions.get(sessionId); if (existing) return existing; const next = { stage: 'DISCOVERING' as SessionStage, cart: new Map<string, number>(), products: new Map<string, Product>(), orders: [] }; sessions.set(sessionId, next); return next }
export function findProduct(productId: string): Product | undefined { return seedProducts.find((product) => product.id === productId) }
export async function catalogProduct(productId: string) { return findProduct(productId) }
export function cartItems(sessionId: string): CartItem[] { const session = getSession(sessionId); return [...session.cart.entries()].flatMap(([productId, quantity]) => { const product = session.products.get(productId); return product ? [{ productId, quantity, product }] : [] }) }
export function totals(items: CartItem[]) { const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0); return { subtotal, shipping: subtotal > 5000 ? 0 : 99, tax: Math.round(subtotal * 0.18), total: Math.round(subtotal * 1.18 + (subtotal > 5000 ? 0 : 99)) } }
export const checkoutSchema = z.object({ sessionId: z.string().min(8), address: z.object({ name: z.string().min(2), line1: z.string().min(4), city: z.string().min(2), postalCode: z.string().min(3), country: z.string().min(2) }), paymentMethod: z.enum(['demo_card', 'cash_on_delivery']), confirm: z.literal(true) })
export { sessions }
