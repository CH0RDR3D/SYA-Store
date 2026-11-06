import { MedusaRequest, MedusaResponse } from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const orderModule = req.scope.resolve(Modules.ORDER) as any
  const orders = await orderModule.listOrders({}, {
    order: { created_at: "DESC" },
    relations: ["items"],
  })
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const month = new Date(now.getFullYear(), now.getMonth(), 1)

  const totalRevenue = orders.reduce(
    (sum: number, order: any) => sum + Number(order.total ?? 0),
    0
  )
  const todayOrders = orders.filter(
    (order: any) => new Date(order.created_at) >= today
  )
  const monthOrders = orders.filter(
    (order: any) => new Date(order.created_at) >= month
  )

  res.json({
    visitors: {
      today: null,
      week: null,
      month: null,
      year: null,
      lifetime: null,
    },
    active_visitors: null,
    orders: orders.length,
    orders_today: todayOrders.length,
    orders_month: monthOrders.length,
    revenue: totalRevenue,
    revenue_today: todayOrders.reduce(
      (sum: number, order: any) => sum + Number(order.total ?? 0),
      0
    ),
    revenue_month: monthOrders.reduce(
      (sum: number, order: any) => sum + Number(order.total ?? 0),
      0
    ),
    average_order_value: orders.length ? totalRevenue / orders.length : 0,
  })
}
