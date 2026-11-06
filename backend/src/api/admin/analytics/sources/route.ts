import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderModule = req.scope.resolve(Modules.ORDER) as any
  const orders = await orderModule.listOrders({}, { relations: ["items"] })
  const sources = new Map<string, { orders: number; revenue: number }>()

  for (const order of orders) {
    const source =
      (order.metadata as Record<string, unknown> | null)?.traffic_source ||
      "Direct"
    const key = String(source)
    const current = sources.get(key) || { orders: 0, revenue: 0 }
    current.orders += 1
    current.revenue += Number(order.total ?? 0)
    sources.set(key, current)
  }

  res.json({
    sources: [...sources.entries()].map(([source, totals]) => ({
      source,
      ...totals,
    })),
  })
}
