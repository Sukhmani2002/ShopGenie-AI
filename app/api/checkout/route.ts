import { NextResponse } from 'next/server'
import { checkoutSchema, cartItems, getSession, totals, type Order } from '@/lib/checkout'

export async function POST(request: Request) {
  try {
    const input = checkoutSchema.parse(await request.json())
    const session = getSession(input.sessionId)
    const items = cartItems(input.sessionId)
    if (!items.length) return NextResponse.json({ error: 'Your cart is empty.' }, { status: 409 })
    const summary = totals(items)
    const order: Order = { id: `SG-${Date.now().toString(36).toUpperCase()}`, sessionId: input.sessionId, items, total: summary.total, currency: 'INR', status: 'CONFIRMED', createdAt: new Date().toISOString(), tracking: { status: 'Order confirmed', eta: 'Demo estimate: 3–5 business days', provenance: 'DEMO_SIMULATION' } }
    session.orders.push(order); session.stage = 'ORDER_CONFIRMED'; session.cart.clear()
    return NextResponse.json({ order, summary, payment: { status: 'DEMO_CONFIRMED', method: input.paymentMethod, provenance: 'DEMO_SIMULATION' }, warning: 'No real payment was processed and no order was sent to a retailer.' })
  } catch { return NextResponse.json({ error: 'Checkout requires a confirmed address, payment method, and explicit purchase confirmation.' }, { status: 400 }) }
}
