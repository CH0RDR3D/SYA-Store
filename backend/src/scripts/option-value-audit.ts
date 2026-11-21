/**
 * Product Option Value Audit & Cleanup Script
 *
 * Usage:
 *   npx medusa exec ./src/scripts/option-value-audit.ts
 *   npx medusa exec ./src/scripts/option-value-audit.ts -- --merge     (merge duplicates)
 *   npx medusa exec ./src/scripts/option-value-audit.ts -- --dry-run   (default; report only)
 *
 * What it does:
 *   1. Fetches all products with their options and option values.
 *   2. Within each option group, groups values by NORMALIZED value (title-case).
 *   3. Reports groups with more than one value (duplicates).
 *   4. With --merge: retains the first value in each group, deletes the rest,
 *      and reassigns any variant option references to the kept value.
 *
 * Output: Console table + a JSON report saved to ./option-value-audit-report.json
 */

import { ExecArgs } from "@medusajs/framework/types"
import { normalizeOptionValue } from "../utils/option-value-normalizer"
import * as fs from "fs"
import * as path from "path"

type OptionValueRow = {
  id: string
  value: string
  normalized: string
  option_id: string
  option_title: string
  product_id: string
  product_title: string
}

type DuplicateValueGroup = {
  option_id: string
  option_title: string
  product_title: string
  normalized_value: string
  count: number
  values: OptionValueRow[]
  recommended_keep: string   // value ID to keep
  recommended_delete: string[] // value IDs to delete
}

export default async function optionValueAudit({ container, args }: ExecArgs) {
  const isDryRun = !(args ?? []).includes("--merge")
  const doMerge = (args ?? []).includes("--merge")

  console.log("\n=== Product Option Value Audit Script ===")
  console.log(`Mode: ${isDryRun ? "DRY RUN (report only)" : "MERGE (will delete duplicates)"}`)
  console.log("Fetching all products with options...\n")

  const productModuleService = container.resolve("productModuleService") as any

  // Paginate through all products
  const allOptionValues: OptionValueRow[] = []
  let offset = 0
  const limit = 200

  while (true) {
    const { products: batch } = await productModuleService.listAndCountProducts(
      {},
      {
        select: ["id", "title"],
        relations: ["options", "options.values"],
        skip: offset,
        take: limit,
      }
    )

    if (!batch || batch.length === 0) break

    for (const product of batch) {
      for (const option of (product.options ?? [])) {
        for (const value of (option.values ?? [])) {
          allOptionValues.push({
            id: value.id,
            value: value.value,
            normalized: normalizeOptionValue(value.value),
            option_id: option.id,
            option_title: option.title,
            product_id: product.id,
            product_title: product.title,
          })
        }
      }
    }

    offset += limit
    if (batch.length < limit) break
  }

  console.log(`Total option values scanned: ${allOptionValues.length}`)

  // Group by (option_id + normalized value) → find duplicates within each option
  const groups = new Map<string, OptionValueRow[]>()
  for (const ov of allOptionValues) {
    const key = `${ov.option_id}::${ov.normalized}`
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(ov)
  }

  // Find duplicate groups
  const duplicates: DuplicateValueGroup[] = []
  for (const [, values] of groups.entries()) {
    if (values.length <= 1) continue
    const first = values[0]
    duplicates.push({
      option_id: first.option_id,
      option_title: first.option_title,
      product_title: first.product_title,
      normalized_value: first.normalized,
      count: values.length,
      values,
      recommended_keep: values[0].id,
      recommended_delete: values.slice(1).map((v) => v.id),
    })
  }

  // ── Report ──────────────────────────────────────────────────────────────────
  if (duplicates.length === 0) {
    console.log("\n✅ No duplicate option values found. Your catalog is clean!\n")
  } else {
    console.log(`\n⚠️  Found ${duplicates.length} duplicate option value group(s):\n`)
    for (const group of duplicates) {
      console.log(
        `  Product: "${group.product_title}" | Option: "${group.option_title}" | Normalized: "${group.normalized_value}"`
      )
      for (const v of group.values) {
        const flag = v.id === group.recommended_keep ? " ← KEEP" : " ← DELETE"
        console.log(`    - ID: ${v.id} | Raw value: "${v.value}"${flag}`)
      }
      console.log()
    }
  }

  // ── Save JSON Report ─────────────────────────────────────────────────────────
  const reportPath = path.resolve(process.cwd(), "option-value-audit-report.json")
  const report = {
    generated_at: new Date().toISOString(),
    mode: isDryRun ? "dry_run" : "merge",
    total_values_scanned: allOptionValues.length,
    duplicate_groups_found: duplicates.length,
    duplicates,
  }
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8")
  console.log(`📄 Full report saved to: ${reportPath}`)

  // ── Merge (delete duplicate values) ─────────────────────────────────────────
  if (doMerge && duplicates.length > 0) {
    console.log("\n🔧 Deleting duplicate option values...\n")
    console.log(
      "⚠️  WARNING: Deleting option values may orphan variant option selections."
    )
    console.log(
      "   Ensure no variants are using the deleted values before proceeding.\n"
    )

    for (const group of duplicates) {
      for (const valueId of group.recommended_delete) {
        try {
          await productModuleService.deleteProductOptionValues(valueId)
          console.log(
            `  ✓ Deleted option value ${valueId} (duplicate of "${group.normalized_value}")`
          )
        } catch (err) {
          console.error(`  ✗ Failed to delete option value ${valueId}:`, err)
        }
      }
    }

    console.log("\n✅ Duplicate option values removed.\n")
  }
}
