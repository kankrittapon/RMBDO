export interface LedgerItem {
  name: string
  category: string
  quantity: number
  estimatedPrice: number | null
  notes: string
}

export interface SheetInventoryResponse {
  status: "ok" | "error"
  timestamp: string
  inventory: Record<string, number>
  ledger: LedgerItem[]
  message?: string
}

export interface TotalWealthSummary {
  totalSilver: number
  liquidSilver: number
  boundSilver: number
  byCategory: Record<string, number>
  asOf: string
}

// Helper: aggregate ledger to total valuation (for future dashboard)
// totalSilver = Σ quantity * (estimatedPrice ?? marketPrice ?? 0)
export function computeWealthSummary(
  ledger: LedgerItem[],
  marketPriceMap?: Record<string, number>,
): TotalWealthSummary {
  let totalSilver = 0
  let liquidSilver = 0
  const byCategory: Record<string, number> = {}

  for (const item of ledger) {
    const unit = item.estimatedPrice ?? (marketPriceMap ? marketPriceMap[item.name] : undefined) ?? 0
    const value = (Number(item.quantity) || 0) * (Number(unit) || 0)
    totalSilver += value
    byCategory[item.category] = (byCategory[item.category] || 0) + value
    // Heuristic: Liquid Silver category or notes containing "liquid"
    if (item.category.toLowerCase().includes("liquid") || item.notes.toLowerCase().includes("liquid")) {
      liquidSilver += value
    }
  }

  return {
    totalSilver,
    liquidSilver,
    boundSilver: totalSilver - liquidSilver,
    byCategory,
    asOf: new Date().toISOString(),
  }
}
