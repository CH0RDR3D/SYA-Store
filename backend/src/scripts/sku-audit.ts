/**
 * SKU Audit & Cleanup Script
 *
 * Usage:
 *   npx medusa exec ./src/scripts/sku-audit.ts
 *   npx medusa exec ./src/scripts/sku-audit.ts -- --merge     (merge duplicates)
 *   npx medusa exec ./src/scripts/sku-audit.ts -- --dry-run   (default; report only)
 *
 * What it does:
 *   1. Fetches all product variants with their SKUs.
 *   2. Groups variants by their NORMALIZED SKU.
 *   3. Reports groups with more than one variant (duplicates).
 *   4. With --merge: retains the most recently updated variant in each group
 *      and renames others with a __DUPE_<timestamp> suffix for safe review.
 *
 * Output: Console table + a JSON report saved to ./sku-audit-report.json
 */

import { ExecArgs } from "@medusajs/framework/types"
import { normalizeSku } from "../utils/sku-normalizer"
import * as fs from "fs"
import * as path from "path"

type VariantRow = {
  id: string
  sku: string | null
  product_id: string
  product_title?: string
  created_at?: string
  updated_at?: string
}

type DuplicateGroup = {
  normalized_sku: string
  count: number
  variants: VariantRow[]
  recommended_keep: string   // variant ID to keep
  recommended_rename: string[] // variant IDs to rename
}

export default async function skuAudit({ container, args }: ExecArgs) {
  const isDryRun = !(args ?? []).includes("--merge")
  const doMerge = (args ?? []).includes("--merge")

  console.log("\n=== SKU Audit Script ===")
  console.log(`Mode: ${isDryRun ? "DRY RUN (report only)" : "MERGE (will rename duplicates)"}`)
  console.log("Fetching all product variants...\n")

  // Use the product module service via the container
  const productModuleService = container.resolve("productModuleService") as any

  // Paginate through all variants
  const allVariants: VariantRow[] = []
  let offset = 0
  const limit = 500

  while (true) {
    const { variants: batch } = await productModuleService.listAndCountProductVariants(
      {},
      {
        select: ["id", "sku", "product_id", "created_at", "updated_at"],
        relations: ["product"],
        skip: offset,
        take: limit,
      }
    )

    if (!batch || batch.length === 0) break

    for (const v of batch) {
      allVariants.push({
        id: v.id,
        sku: v.sku ?? null,
        product_id: v.product_id,
        product_title: v.product?.title ?? "(no product)",
        created_at: v.created_at,
        updated_at: v.updated_at,
      })
    }

    offset += limit
    if (batch.length < limit) break
  }

  console.log(`Total variants scanned: ${allVariants.length}`)

  // Group by normalized SKU (skip null/empty SKUs)
  const groups = new Map<string, VariantRow[]>()
  for (const variant of allVariants) {
    const normalized = normalizeSku(variant.sku)
    if (!normalized) continue // skip variants with no SKU

    if (!groups.has(normalized)) {
      groups.set(normalized, [])
    }
    groups.get(normalized)!.push(variant)
  }

  // Find duplicate groups
  const duplicates: DuplicateGroup[] = []
  for (const [normalized_sku, variants] of groups.entries()) {
    if (variants.length <= 1) continue

    // Keep the most recently updated; rename the rest
    const sorted = [...variants].sort((a, b) => {
      const ta = a.updated_at ? new Date(a.updated_at).getTime() : 0
      const tb = b.updated_at ? new Date(b.updated_at).getTime() : 0
      return tb - ta // descending
    })

    duplicates.push({
      normalized_sku,
      count: variants.length,
      variants,
      recommended_keep: sorted[0].id,
      recommended_rename: sorted.slice(1).map((v) => v.id),
    })
  }

  // ── Report ──────────────────────────────────────────────────────────────────
  if (duplicates.length === 0) {
    console.log("\n✅ No duplicate SKUs found. Your catalog is clean!\n")
  } else {
    console.log(`\n⚠️  Found ${duplicates.length} duplicate SKU group(s):\n`)
    for (const group of duplicates) {
      console.log(`  Normalized SKU: "${group.normalized_sku}" (${group.count} variants)`)
      for (const v of group.variants) {
        const keepFlag = v.id === group.recommended_keep ? " ← KEEP" : " ← RENAME"
        console.log(
          `    - Variant ID: ${v.id} | Raw SKU: "${v.sku}" | Product: "${v.product_title}"${keepFlag}`
        )
      }
      console.log()
    }
  }

  // ── Save JSON Report ─────────────────────────────────────────────────────────
  const reportPath = path.resolve(process.cwd(), "sku-audit-report.json")
  const report = {
    generated_at: new Date().toISOString(),
    mode: isDryRun ? "dry_run" : "merge",
    total_variants_scanned: allVariants.length,
    duplicate_groups_found: duplicates.length,
    duplicates,
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8")
  console.log(`📄 Full report saved to: ${reportPath}`)

  // ── Merge (rename duplicates) ────────────────────────────────────────────────
  if (doMerge && duplicates.length > 0) {
    console.log("\n🔧 Renaming duplicate SKUs...\n")
    const timestamp = Date.now()

    for (const group of duplicates) {
      for (const variantId of group.recommended_rename) {
        const newSku = `${group.normalized_sku}__DUPE_${timestamp}_${variantId.slice(-4)}`
        try {
          await productModuleService.updateProductVariants(variantId, {
            sku: newSku,
          })
          console.log(
            `  ✓ Renamed variant ${variantId}: "${group.normalized_sku}" → "${newSku}"`
          )
        } catch (err) {
          console.error(`  ✗ Failed to rename variant ${variantId}:`, err)
        }
      }
    }

    console.log("\n✅ Duplicate SKUs renamed. Review the __DUPE_ variants and decide:")
    console.log("   - Delete them if truly duplicated")
    console.log("   - Assign unique SKUs if they represent distinct items\n")
  }
}
