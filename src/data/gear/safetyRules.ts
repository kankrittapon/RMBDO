export type SafetyAction = 
  | 'DO_NOT_USE' 
  | 'DO_NOT_SELL' 
  | 'DO_NOT_HEAT' 
  | 'DO_NOT_OPEN_YET' 
  | 'SAFE_TO_USE' 
  | 'SAFE_TO_SELL';

export interface SafetyRuleItem {
  id: string;
  name: string;
  action: SafetyAction;
  icon: string;
  badgeColor: string;
  purpose: string;
  needed: string;
  useWhen: string;
  dangerRisk: string;
  category: 'MATERIAL' | 'SELECTION_BOX' | 'VALUABLE_FAILSTACK' | 'COUPON' | 'JUNK_TRADE';
  lockedByDefault: boolean;
}

export const itemSafetyRules: SafetyRuleItem[] = [
  {
    id: "gem_of_twilight",
    name: "Gem of Twilight",
    action: "DO_NOT_USE",
    icon: "Gem",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
    purpose: "Mandatory catalyst for Sovereign Sub-weapon craft",
    needed: "1 / 1 (Store in Central Market Warehouse or Safe Town)",
    useWhen: "Crafting Tier 10 Sovereign Sub-weapon (Kutum/Nouver Primordial Forge)",
    dangerRisk: "Extremely difficult to re-obtain; wasting this locks your Sovereign Sub progression.",
    category: "MATERIAL",
    lockedByDefault: true
  },
  {
    id: "pen_blackstar_box",
    name: "Selectable PEN Blackstar Weapon Box",
    action: "DO_NOT_OPEN_YET",
    icon: "Package",
    badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/40",
    purpose: "Free Selection Box for PEN Mainhand, Awakening, or Sub-weapon",
    needed: "1 / 1 in storage",
    useWhen: "ONLY after auditing your existing PEN Blackstar counts per slot (Main needs 2, Awakening needs 1, Sub needs 2)",
    dangerRisk: "Picking the wrong weapon results in wasted 80B+ Silver for Sovereign synth.",
    category: "SELECTION_BOX",
    lockedByDefault: true
  },
  {
    id: "flame_primordial",
    name: "Flame of the Primordial",
    action: "DO_NOT_SELL",
    icon: "Flame",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
    purpose: "Mandatory catalyst for Sovereign Awakening Weapon craft only (not Sub, not Main)",
    needed: "1 / 1 per Sovereign forge attempt",
    useWhen: "At the Blacksmith during Primordial Forge interaction",
    dangerRisk: "Central Market tax cuts 15% and will force you to pay higher buy order later.",
    category: "MATERIAL",
    lockedByDefault: true
  },
  {
    id: "weapon_exchange_coupons",
    name: "Sealed Main/Awakening/Sub Weapon Exchange Coupons",
    action: "DO_NOT_USE",
    icon: "FileCode",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
    purpose: "Class reroll and weapon conversion for future meta shifts",
    needed: "Keep in Family Inventory",
    useWhen: "Rerolling to a new character class permanently",
    dangerRisk: "Extremely rare; given only during major festival balls once or twice a year.",
    category: "COUPON",
    lockedByDefault: true
  },
  {
    id: "advice_of_valks_200",
    name: "Advice of Valks (+200 to +300)",
    action: "DO_NOT_USE",
    icon: "ShieldAlert",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
    purpose: "PEN Blackstar / TET & PEN Deboreka / Sovereign high-tier attempts",
    needed: "Stack reserve",
    useWhen: "Attempting PEN Blackstar (240+ FS) or OCT/NOV Kharazad",
    dangerRisk: "Using 200+ FS on regular boss gear or cheap accessories is an irreversible trap.",
    category: "VALUABLE_FAILSTACK",
    lockedByDefault: true
  },
  {
    id: "flame_frost_despair_resonance",
    name: "Flame of Frost / Despair / Resonance / Hongik",
    action: "DO_NOT_SELL",
    icon: "Flame",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
    purpose: "Crafting Slumbering Origin Armors (Labreska, Fallen God, Ator, Dahn)",
    needed: "1 per armor piece",
    useWhen: "Caphras Level 10 Boss Armor is ready for fusion",
    dangerRisk: "Selling incurs market loss and hours of re-grinding low RNG drop zones.",
    category: "MATERIAL",
    lockedByDefault: true
  },
  {
    id: "specter_energy",
    name: "Specter's Energy",
    action: "DO_NOT_HEAT",
    icon: "Zap",
    badgeColor: "bg-red-500/20 text-red-400 border-red-500/40",
    purpose: "Blackstar Weapon & Armor crafting at Dorin Morgrim anvil",
    needed: "1 per Blackstar base craft",
    useWhen: "Crafting Blackstar bases to enhance for profit or self-use",
    dangerRisk: "Heating gives useless trace materials destroying 10+ hours of RNG drops.",
    category: "MATERIAL",
    lockedByDefault: true
  },
  {
    id: "ancient_spirit_dust",
    name: "Ancient Spirit Dust",
    action: "SAFE_TO_USE",
    icon: "CheckCircle",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    purpose: "Convert directly to Caphras Stones via Simple Alchemy (Dust x5 + Black Stone x1)",
    needed: "Craft anytime",
    useWhen: "Immediately whenever collected in inventory",
    dangerRisk: "None. Direct 1:1 value conversion into Caphras.",
    category: "MATERIAL",
    lockedByDefault: false
  },
  {
    id: "time_filled_blackstone",
    name: "Time-filled Black Stones / Tuvala Ores",
    action: "SAFE_TO_SELL",
    icon: "DollarSign",
    badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/40",
    purpose: "Post-graduation season leftovers",
    needed: "0 (Graduation complete)",
    useWhen: "After graduating season character",
    dangerRisk: "None. Sell to NPC vendor for raw silver.",
    category: "JUNK_TRADE",
    lockedByDefault: false
  }
];
