import { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"

export default async function repairCustomerCampaigns({
  container,
  args,
}: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const promotionModule = container.resolve(Modules.PROMOTION)
  const apply = args?.includes("apply")

  const promotions = await promotionModule.listPromotions(
    {},
    { relations: ["campaign", "campaign.budget"] }
  )

  logger.info("Member promotion codes:")
  for (const promotion of promotions as any[]) {
    logger.info(`- ${(promotion.code || "(no code)")}: ${promotion.id}`)
  }

  const campaigns = await promotionModule.listCampaigns(
    {},
    { relations: ["budget"] }
  )

  const affected = campaigns.filter((campaign: any) =>
    campaign.budget?.attribute === "customer_id"
  )

  logger.info(
    `Found ${affected.length} campaign${affected.length === 1 ? "" : "s"} using customer_id budgets.`
  )

  for (const campaign of affected) {
    logger.info(`- ${campaign.name} (${campaign.id})`)
  }

  if (!apply) {
    logger.info("Dry run complete. Run with 'apply' to delete these campaigns.")
    return
  }

  if (affected.length) {
    await promotionModule.deleteCampaigns(affected.map((campaign: any) => campaign.id))
  }

  logger.info("Removed customer_id campaign budgets.")
}
