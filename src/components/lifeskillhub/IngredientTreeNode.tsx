'use client';

import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Loader2, AlertCircle, ShoppingCart, Pickaxe, Wheat, Package } from 'lucide-react';

// Renders one ingredient row, and — if it's a sub-recipe — lets it expand
// inline into its own ingredient list on click, recursively. Replaces the
// old "view sub-recipe" button that swapped the whole drawer to a new
// recipe (so seeing 3 levels deep meant 3 separate clicks and losing your
// place in the parent list each time). Now every level loads on demand
// (same cache-first API call as before, no bulk fetch) and stays visible
// as a nested tree/canvas the user can keep expanding down the chain.

export interface TreeIngredient {
  name: string;
  quantity: number;
  unitPrice: number | null;
  totalCost: number | null;
  isSubRecipe: boolean;
  subRecipeSlug: string | null;
  iconUrl: string | null;
}

interface RecipeDetailLite {
  ingredients: TreeIngredient[];
}

type ProcurementAdvice = { label: string; icon: 'market' | 'gather' | 'node'; tooltip?: string };

interface IngredientTreeNodeProps {
  ingredient: TreeIngredient;
  // How many units of THIS ingredient's own parent recipe are being
  // crafted - used to scale this ingredient's "need" and, if expanded,
  // to scale its own children's need in turn.
  parentBatch: number;
  inventory: Record<string, number>;
  setInventory: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  getProcurementAdvice: (name: string) => ProcurementAdvice;
  fmtSilver: (n: number | null) => string;
  // Best-guess category for the on-demand-scrape hint - not required for
  // a cache hit, only helps the fallback live scrape pick the right page.
  categoryHint: string | null;
  depth?: number;
}

const MAX_DEPTH = 6; // matches this project's "never assume infinite/bulk" discipline

export const IngredientTreeNode: React.FC<IngredientTreeNodeProps> = ({
  ingredient,
  parentBatch,
  inventory,
  setInventory,
  getProcurementAdvice,
  fmtSilver,
  categoryHint,
  depth = 0,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<RecipeDetailLite | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalReq = ingredient.quantity * parentBatch;
  const owned = inventory[ingredient.name] ?? 0;
  const shortage = Math.max(0, totalReq - owned);
  const missingCost = ingredient.unitPrice !== null ? shortage * ingredient.unitPrice : null;
  const advice = getProcurementAdvice(ingredient.name);

  const canExpand = ingredient.isSubRecipe && ingredient.subRecipeSlug && depth < MAX_DEPTH;

  const toggleExpand = () => {
    if (!canExpand) return;
    if (!expanded && !detail && !loading) {
      setLoading(true);
      setError(null);
      const categoryParam = categoryHint ? `?category=${encodeURIComponent(categoryHint)}` : '';
      fetch(`/api/crafting-recipes/${encodeURIComponent(ingredient.subRecipeSlug!)}/ingredients${categoryParam}`)
        .then(async (res) => {
          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.hint || body.error || `HTTP ${res.status}`);
          }
          return res.json();
        })
        .then((data: RecipeDetailLite) => setDetail(data))
        .catch((err: Error) => setError(err.message))
        .finally(() => setLoading(false));
    }
    setExpanded((prev) => !prev);
  };

  return (
    <div className="space-y-1.5">
      <div
        className="p-2.5 rounded-lg bg-bg-surface-2 border border-border-subtle space-y-1.5"
        style={depth > 0 ? { marginLeft: `${Math.min(depth, 4) * 14}px` } : undefined}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              {canExpand && (
                <button
                  onClick={toggleExpand}
                  className="text-text-muted hover:text-brand-primary shrink-0"
                  aria-label={expanded ? 'ยุบ' : 'ขยาย'}
                >
                  {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : expanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
              {ingredient.iconUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ingredient.iconUrl} alt="" className="w-5 h-5 rounded shrink-0 bg-bg-surface-3" loading="lazy" />
              )}
              <span onClick={toggleExpand} className={canExpand ? 'cursor-pointer' : undefined}>
                {ingredient.name}
              </span>
              {ingredient.isSubRecipe && (
                <span className="text-[10px] px-1 py-0.5 rounded bg-brand-primary/15 border border-brand-primary/30 text-brand-primary">
                  sub-recipe
                </span>
              )}
            </div>
            <div className="text-[11px] font-mono text-text-muted">
              x{ingredient.quantity} per craft • {fmtSilver(ingredient.unitPrice)} each • total {fmtSilver(ingredient.totalCost)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-amber-300">
              {ingredient.totalCost !== null ? fmtSilver(ingredient.totalCost) : '-'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-[11px] font-mono">
          <div className="bg-bg-surface-3 border border-border-subtle rounded p-1.5 text-center">
            <div className="text-[9px] text-text-muted uppercase">Need x{parentBatch}</div>
            <div className="font-bold text-text-primary">{totalReq.toLocaleString()}</div>
          </div>
          <div className="bg-bg-surface-3 border border-border-subtle rounded p-1.5 text-center">
            <div className="text-[9px] text-text-muted uppercase">In Stock</div>
            <input
              type="number"
              min={0}
              value={owned === 0 ? '' : owned}
              placeholder="0"
              onChange={(e) => {
                const v = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value) || 0);
                setInventory((prev) => ({ ...prev, [ingredient.name]: v }));
              }}
              className="w-full mt-1 px-1 py-0.5 bg-bg-surface-1 border border-border-subtle rounded text-center text-xs font-mono"
            />
          </div>
          <div className={`border rounded p-1.5 text-center ${shortage > 0 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
            <div className="text-[9px] text-text-muted uppercase">Shortage</div>
            <div className={`font-bold ${shortage > 0 ? 'text-amber-300' : 'text-emerald-400'}`}>{shortage.toLocaleString()}</div>
          </div>
          <div className="bg-bg-surface-3 border border-border-subtle rounded p-1.5 text-center">
            <div className="text-[9px] text-text-muted uppercase">Missing Cost</div>
            <div className="font-bold text-text-primary">{missingCost !== null ? fmtSilver(missingCost) : '-'}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${
              advice.icon === 'market'
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                : advice.icon === 'gather'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            }`}
            title={advice.tooltip}
          >
            {advice.icon === 'market' ? <ShoppingCart className="w-3 h-3" /> : advice.icon === 'gather' ? <Pickaxe className="w-3 h-3" /> : <Wheat className="w-3 h-3" />}
            {advice.label === 'Market Buy' ? '🛒 Market Buy' : advice.label === 'Gather' ? '⛏️ Gather' : '🌾 Worker Node'}
          </span>
          {advice.tooltip && <span className="text-[10px] text-text-muted">{advice.tooltip}</span>}
          {ingredient.isSubRecipe && (
            <span className="ml-auto text-[10px] text-text-muted">
              <Package className="w-3 h-3 inline" /> sub-recipe{canExpand ? ' • คลิกชื่อเพื่อขยาย' : ''}
            </span>
          )}
        </div>
      </div>

      {expanded && error && (
        <div className="ml-3.5 p-2 rounded-lg border border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-200 flex items-start gap-1.5" style={{ marginLeft: `${(Math.min(depth, 4) + 1) * 14}px` }}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {expanded && detail && !loading && (
        <div className="space-y-1.5">
          {detail.ingredients.length === 0 ? (
            <p className="text-[11px] text-text-muted" style={{ marginLeft: `${(Math.min(depth, 4) + 1) * 14}px` }}>
              No ingredient data for this sub-recipe.
            </p>
          ) : (
            detail.ingredients.map((child, idx) => (
              <IngredientTreeNode
                key={`${child.name}-${idx}`}
                ingredient={child}
                parentBatch={totalReq}
                inventory={inventory}
                setInventory={setInventory}
                getProcurementAdvice={getProcurementAdvice}
                fmtSilver={fmtSilver}
                categoryHint={categoryHint}
                depth={depth + 1}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
