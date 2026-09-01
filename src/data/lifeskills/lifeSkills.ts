export interface LifeSkillItem {
  id: string;
  name: string;
  category: 'GATHERING' | 'COOKING' | 'ALCHEMY' | 'PROCESSING' | 'FISHING' | 'HUNTING' | 'TRAINING' | 'TRADING' | 'FARMING' | 'SAILING' | 'BARTERING';
  icon: string;
  currentLevel: string;
  currentMastery: number;
  nextBreakpointMastery: number;
  nextBreakpointBonus: string;
  recommendedGear: string;
  recommendedArtifact: string;
  recommendedLightstone: string;
  recommendedActivity: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  olviaAcademyCompleted: boolean;
  olviaTasks: string[];
}

export const lifeSkillList: LifeSkillItem[] = [
  {
    id: "cooking",
    name: "Cooking",
    category: "COOKING",
    icon: "Utensils",
    currentLevel: "Master 18",
    currentMastery: 1150,
    nextBreakpointMastery: 1200,
    nextBreakpointBonus: "+15.2% Imperial Delivery Profit, +2.4% Max Batch Chance",
    recommendedGear: "TET Manos Cook's Clothes + TRI Manos Accessories",
    recommendedArtifact: "Cooking Mastery Artifacts x2",
    recommendedLightstone: "Hearty Meal (Cooking Mastery +30, Cooking Time -1s)",
    recommendedActivity: "Mass cook Pickled Vegetables & Balenos Meals for Guru 1 & Daily Imperial Delivery",
    priority: "HIGH",
    olviaAcademyCompleted: false,
    olviaTasks: [
      "Reach Guru 1 Cooking (Currently Master 18)",
      "Craft 5,000x Balenos Meals in Calpheon Residence",
      "Deliver 200x Guru Imperial Delivery Boxes daily for 220M+ Silver/day"
    ]
  },
  {
    id: "gathering",
    name: "Gathering",
    category: "GATHERING",
    icon: "Pickaxe",
    currentLevel: "Master 4",
    currentMastery: 1280,
    nextBreakpointMastery: 1300,
    nextBreakpointBonus: "+68.4% Extra Drop Rate on Caphras & Hard/Sharp Black Crystal Shards",
    recommendedGear: "TET Manos Gathering Clothes + TET Manos Butcher Knife / Fluid Collector",
    recommendedArtifact: "Gathering Mastery Artifacts",
    recommendedLightstone: "Green Thumb (Gathering Mastery +45)",
    recommendedActivity: "Lynch Ranch / Behr Herbs & Navarn Steppe Tanning for Valtarra Treasure piece",
    priority: "HIGH",
    olviaAcademyCompleted: true,
    olviaTasks: [
      "Reach Master 1 Gathering (Completed ✓)",
      "Gather 10,000x Meat for Guru Cooking recipes",
      "Farm Valtarra's Clairvoyance at Navarn Steppe with Fluid Collector"
    ]
  },
  {
    id: "hunting",
    name: "Hunting",
    category: "HUNTING",
    icon: "Crosshair",
    currentLevel: "Artisan 8",
    currentMastery: 920,
    nextBreakpointMastery: 1000,
    nextBreakpointBonus: "+42% Sniper Rifle Crit Rate & Fire Horn Drop Multiplier",
    recommendedGear: "TET Manos Hunter Clothes + +10 Master Matchlock",
    recommendedArtifact: "Hunting Mastery Artifacts",
    recommendedLightstone: "Bullseye (Hunting Mastery +30, Crit Chance +5%)",
    recommendedActivity: "Narcion Shadow Wolves / Grass Rhinos sniper hunting for massive meat/blood",
    priority: "MEDIUM",
    olviaAcademyCompleted: false,
    olviaTasks: [
      "Reach Master 1 Hunting at Narcion (O'dyllita)",
      "Craft Breath of Narcion furniture buffs"
    ]
  },
  {
    id: "alchemy",
    name: "Alchemy",
    category: "ALCHEMY",
    icon: "FlaskConical",
    currentLevel: "Artisan 2",
    currentMastery: 850,
    nextBreakpointMastery: 900,
    nextBreakpointBonus: "+18% Oil of Fortitude / Elixir Mass Batch Multiplier",
    recommendedGear: "TET Manos Alchemist's Clothes + Supreme Alchemy Tool",
    recommendedArtifact: "Alchemy Mastery Artifacts",
    recommendedLightstone: "Philosopher's Stone (Alchemy Time -1s, Mastery +25)",
    recommendedActivity: "Synthesize Oils, Clear Liquid Reagents, and Perfumes of Courage for Endgame PvE",
    priority: "MEDIUM",
    olviaAcademyCompleted: false,
    olviaTasks: [
      "Synthesize 2,000x Clear Liquid Reagent",
      "Stockpile 500x Oil of Corruption for Frenzy Draught crafting"
    ]
  },
  {
    id: "processing",
    name: "Processing",
    category: "PROCESSING",
    icon: "Boxes",
    currentLevel: "Master 12",
    currentMastery: 1350,
    nextBreakpointMastery: 1400,
    nextBreakpointBonus: "Mass Processing speed: 250 items per 6 seconds",
    recommendedGear: "TET Manos Craftsman's Clothes + Manos Processing Stones",
    recommendedArtifact: "Processing Mastery Artifacts",
    recommendedLightstone: "Industrial Revolution (Mass Processing +40)",
    recommendedActivity: "AFK mass chopping logs and heating ores from worker empire nodes",
    priority: "LOW",
    olviaAcademyCompleted: true,
    olviaTasks: [
      "Process 50,000 Iron Ingot / Timber for Calpheon Timber Crates",
      "Master Processing 1 reached (Completed ✓)"
    ]
  },
  {
    id: "training",
    name: "Training (Horses)",
    category: "TRAINING",
    icon: "Horse",
    currentLevel: "Artisan 6",
    currentMastery: 880,
    nextBreakpointMastery: 900,
    nextBreakpointBonus: "+3.2% Mythical Dream Horse Awakening Success Rate Bonus",
    recommendedGear: "TET Manos Trainer Clothes + Manos Riding Crop +10",
    recommendedArtifact: "Training Mastery Artifacts",
    recommendedLightstone: "Iron Horse (Mount XP +15%, Mastery +30)",
    recommendedActivity: "Wagon training 4x T8 horses simultaneously for Imperial Horse Delivery seals",
    priority: "HIGH",
    olviaAcademyCompleted: false,
    olviaTasks: [
      "Level 4x T8 Courser horses to Level 30",
      "Attempt Mythical Arduanatt / Diné awakening at Stonetail Ranch"
    ]
  },
  {
    id: "fishing",
    name: "Fishing",
    category: "FISHING",
    icon: "Fish",
    currentLevel: "Master 22",
    currentMastery: 1200,
    nextBreakpointMastery: 1250,
    nextBreakpointBonus: "+4.5% Ancient Relic Crystal Shard & Prize Fish chance",
    recommendedGear: "TET Manos Fisher Clothes + +10 Balenos Fishing Rod + +10 Maple Float",
    recommendedArtifact: "Fishing Mastery Artifacts",
    recommendedLightstone: "Big Catch (Prize Catch +2.5%, Auto-fishing time -10%)",
    recommendedActivity: "Overnight AFK fishing at Velia Beach / Tooth Fairy Cabin for Relic Shards",
    priority: "MEDIUM",
    olviaAcademyCompleted: true,
    olviaTasks: [
      "Catch 100x Ancient Relic Crystal Shards via AFK fishing (Completed ✓)",
      "Trade prize fish with Imperial Fishing Delivery"
    ]
  },
  {
    id: "farming",
    name: "Farming",
    category: "FARMING",
    icon: "Sprout",
    currentLevel: "Master 3",
    currentMastery: 1000,
    nextBreakpointMastery: 1050,
    nextBreakpointBonus: "Breeding yield +25% Magical Seeds and Blush Leaves",
    recommendedGear: "Silver Embroidered Farmer's Clothes + 10x Strong Fences",
    recommendedArtifact: "Farming Mastery Artifacts",
    recommendedLightstone: "Bountiful Harvest",
    recommendedActivity: "Harvest High-Quality Onion, Pepper, and Magical Seeds in Heidel farm plots",
    priority: "HIGH",
    olviaAcademyCompleted: true,
    olviaTasks: [
      "Deploy 10x 10-slot Fences around Heidel river",
      "Breed High-Quality Pepper for Balenos Meal cooking recipes"
    ]
  },
  {
    id: "trading",
    name: "Trading",
    category: "TRADING",
    icon: "Truck",
    currentLevel: "Professional 5",
    currentMastery: 600,
    nextBreakpointMastery: 650,
    nextBreakpointBonus: "+12% Desert Trade Buff distance bonus",
    recommendedGear: "Silver Embroidered Trader Clothes + Forest Path Wagon",
    recommendedArtifact: "Trade Exp Artifacts",
    recommendedLightstone: "Traveling Merchant",
    recommendedActivity: "Connect Calpheon to Valencia node network for crate deliveries",
    priority: "LOW",
    olviaAcademyCompleted: false,
    olviaTasks: [
      "Connect Valencia desert trade node network",
      "Deliver 5,000x Calpheon Timber Crates with Desert Trade Buff"
    ]
  },
  {
    id: "sailing",
    name: "Sailing",
    category: "SAILING",
    icon: "Ship",
    currentLevel: "Artisan 1",
    currentMastery: 780,
    nextBreakpointMastery: 800,
    nextBreakpointBonus: "+5% Ship Speed, +3% BreezySail duration",
    recommendedGear: "TET Manos Sailor Clothes + Epheria Carrack (Volante / Valor)",
    recommendedArtifact: "Sailing Mastery Artifacts",
    recommendedLightstone: "Smooth Sailing (Ship Speed +5%, Ship Brake +3%)",
    recommendedActivity: "Sail through Margoria sea for Khan guild raids and sea monster hunting",
    priority: "MEDIUM",
    olviaAcademyCompleted: false,
    olviaTasks: [
      "Upgrade Epheria Caravel to Epheria Carrack (Volante)",
      "Complete Margoria Sea Monster hunting weekly quests"
    ]
  },
  {
    id: "bartering",
    name: "Bartering",
    category: "BARTERING",
    icon: "Repeat",
    currentLevel: "Master 8",
    currentMastery: 1100,
    nextBreakpointMastery: 1150,
    nextBreakpointBonus: "+15% Crow Coin yield from Margoria Barter nodes",
    recommendedGear: "Epheria Carrack with +10 Green/Blue Gear + TET Manos Clothes",
    recommendedArtifact: "Barter Parley Artifacts",
    recommendedLightstone: "Sea Trader (Parley Cost -10%, Crow Coins +5%)",
    recommendedActivity: "Run 3 daily barter cycles to exchange land items for Sea Coins and Khan's Hearts",
    priority: "MEDIUM",
    olviaAcademyCompleted: true,
    olviaTasks: [
      "Reach 10,000 total cumulative barters",
      "Accumulate 50,000 Crow Coins for Khan's Heart / Carrack Blue Gear"
    ]
  }
];
