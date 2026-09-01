export interface TreasurePiece {
  id: string;
  name: string;
  dropSpot: string;
  monsterName: string;
  obtained: boolean;
  pityItemName?: string;
  pityCount?: number;
  pityTarget?: number;
}

export interface TreasureItem {
  id: string;
  name: string;
  category: 'POTION' | 'CONVENIENCE' | 'TELEPORT' | 'HORSE' | 'TRADE';
  icon: string;
  description: string;
  pieces: TreasurePiece[];
  recommendedSpot: string;
  recommendedClass: string;
  recommendedBuildId: string;
  utilityBenefit: string;
  priority: 'MANDATORY' | 'HIGH' | 'NICE_TO_HAVE';
}

export const treasureList: TreasureItem[] = [
  {
    id: "ornette",
    name: "Ornette's Spirit Essence (Infinite HP Potion)",
    category: "POTION",
    icon: "Heart",
    description: "Permanently refills 275 HP every 2 seconds without consuming potions or weight.",
    utilityBenefit: "Critical for endgame grinding survival and uncapped PvP Node War sustain.",
    priority: "MANDATORY",
    recommendedSpot: "Blood Wolf Settlement / Sherekhan Necropolis / Forest Ronaros",
    recommendedClass: "Nova Awakening / Witch Awakening / Musa",
    recommendedBuildId: "TREASURE_FARM",
    pieces: [
      { id: "o1", name: "Sherekhan's Panacea", dropSpot: "Sherekhan Necropolis (Day/Night)", monsterName: "Garud / Belcadas", obtained: true, pityCount: 100, pityTarget: 100 },
      { id: "o2", name: "Ron's Tintinnabulum", dropSpot: "Forest Ronaros", monsterName: "Ronaros Catcher / Guardian", obtained: true, pityCount: 100, pityTarget: 100 },
      { id: "o3", name: "Ash Halfmoon Kagtunak", dropSpot: "Blood Wolf Settlement", monsterName: "Kagtum Executioner", obtained: true, pityCount: 100, pityTarget: 100 }
    ]
  },
  {
    id: "odore",
    name: "Odore's Spirit Essence (Infinite MP/WP/SP Potion)",
    category: "POTION",
    icon: "Sparkles",
    description: "Permanently restores 375 MP/WP/SP every 3 seconds for uninterrupted skill rotations.",
    utilityBenefit: "Removes mana management constraints on high-APM spam classes.",
    priority: "MANDATORY",
    recommendedSpot: "Manshaum Forest / Tshira Ruins / Navarn Steppe",
    recommendedClass: "Agent / Witch Awakening / Wizard",
    recommendedBuildId: "TREASURE_FARM",
    pieces: [
      { id: "od1", name: "Markthanan's Gland", dropSpot: "Tshira Ruins", monsterName: "Leaf Keeper / Vine Keeper", obtained: true, pityCount: 100, pityTarget: 100 },
      { id: "od2", name: "Narc's Crimson Tear", dropSpot: "Manshaum Forest", monsterName: "Manshaum Great Warrior", obtained: true, pityCount: 100, pityTarget: 100 },
      { id: "od3", name: "Valtarra's Clairvoyance", dropSpot: "Navarn Steppe (Tanning)", monsterName: "Ferrica / Ferrina / Belladonna", obtained: false, pityCount: 68, pityTarget: 100 }
    ]
  },
  {
    id: "map",
    name: "Archaeologist's Map",
    category: "TELEPORT",
    icon: "Compass",
    description: "Instantly teleports user to the nearest town and allows returning back to the original grind spot within 30 minutes.",
    utilityBenefit: "Massive efficiency for remote grind spots (Crypt, Ash Forest, Ulukita, Edania).",
    priority: "HIGH",
    recommendedSpot: "Rood Sulfur Mine & Pila Ku Jail",
    recommendedClass: "Musa / Nova Awakening",
    recommendedBuildId: "SPEED_FARM",
    pieces: [
      { id: "m1", name: "Map Piece A (Lava Tuk)", dropSpot: "Rood Sulfur Mine", monsterName: "Lava Tuk", obtained: true },
      { id: "m2", name: "Map Piece B (Lava Searcher)", dropSpot: "Rood Sulfur Mine", monsterName: "Lava Searcher", obtained: true },
      { id: "m3", name: "Map Piece C (Iron Fist Warder)", dropSpot: "Pila Ku Jail", monsterName: "Iron Fist Warder", obtained: false },
      { id: "m4", name: "Map Piece D (Sordid Dog)", dropSpot: "Pila Ku Jail", monsterName: "Sordid Dog", obtained: false }
    ]
  },
  {
    id: "telescope",
    name: "Lafi Bedmountain's Upgraded Telescope",
    category: "TELEPORT",
    icon: "Eye",
    description: "Instantly teleports directly to any party or guild member's location across the world map.",
    utilityBenefit: "Essential for Node War / Siege tactical squad repositioning and instant backup.",
    priority: "HIGH",
    recommendedSpot: "Tungrad Ruins & City of the Dead (Ulukita)",
    recommendedClass: "Agent / Nova Awakening / Witch Awakening",
    recommendedBuildId: "MAX_DPS",
    pieces: [
      { id: "t1", name: "Telescope Part 1 (Tungrad Fragment)", dropSpot: "Tungrad Ruins", monsterName: "Tungrad Punisher", obtained: false },
      { id: "t2", name: "Telescope Part 2 (City Fragment)", dropSpot: "City of the Dead", monsterName: "Tephra / Haru", obtained: false },
      { id: "t3", name: "Telescope Part 3 (Scholar's Lens)", dropSpot: "Hystria Ruins / Craft", monsterName: "Vodkhan / Elten", obtained: true }
    ]
  },
  {
    id: "compass",
    name: "Lafi Bedmountain's Upgraded Compass",
    category: "TELEPORT",
    icon: "Navigation",
    description: "Permits viewing player location in Great Desert & Great Ocean + teleports entire party to your location.",
    utilityBenefit: "Strategic guild & party summon for World Bosses and deep desert dungeons.",
    priority: "NICE_TO_HAVE",
    recommendedSpot: "Hystria Ruins & Aakman Temple & Kratuga",
    recommendedClass: "Witch Awakening / Nova",
    recommendedBuildId: "BALANCED",
    pieces: [
      { id: "c1", name: "Compass Piece 1 (Vodkhan)", dropSpot: "Hystria Ruins", monsterName: "Vodkhan", obtained: true },
      { id: "c2", name: "Compass Piece 2 (Aakman)", dropSpot: "Aakman Temple", monsterName: "Aakman Elite Guardian", obtained: true },
      { id: "c3", name: "Compass Piece 3 (Elten Part)", dropSpot: "Hystria Ruins", monsterName: "Elten / Tukar Balten", obtained: false }
    ]
  },
  {
    id: "krogdalo_sanctuary",
    name: "Krogdalo's Sanctuary",
    category: "HORSE",
    icon: "Shield",
    description: "Infinite mythical stable holding Mythical Arduanatt, Diné, and Doom simultaneously with instant swapping.",
    utilityBenefit: "Triple mythical horse swapping for flight, ocean running, and combat charge.",
    priority: "HIGH",
    recommendedSpot: "Mythical Horse Awakening (Stonetail Horse Ranch)",
    recommendedClass: "Training Life Skill / Any",
    recommendedBuildId: "LIFESKILL",
    pieces: [
      { id: "k1", name: "Mythical Arduanatt (T10 Pegas)", dropSpot: "Mythical Awakening", monsterName: "Dream Arduanatt Male + Female", obtained: true },
      { id: "k2", name: "Mythical Diné (T10 Unicorn)", dropSpot: "Mythical Awakening", monsterName: "Dream Diné Male + Female", obtained: false },
      { id: "k3", name: "Mythical Doom (T10 Hellhorse)", dropSpot: "Mythical Awakening", monsterName: "Dream Doom Male + Female", obtained: false }
    ]
  },
  {
    id: "merchant_ring",
    name: "Rich Merchant's Ring",
    category: "TRADE",
    icon: "Coins",
    description: "Reduces Central Market transaction fee by +5% permanently across your entire account.",
    utilityBenefit: "Saves hundreds of billions of silver when selling endgame accessories and weapons.",
    priority: "NICE_TO_HAVE",
    recommendedSpot: "Sycraia Underwater, Padix Island, Ash Forest, Crypt, Olun's Valley",
    recommendedClass: "Agent / Witch Awakening",
    recommendedBuildId: "MAX_DPS",
    pieces: [
      { id: "mr1", name: "Merchant Ring Piece 1 (Sycraia)", dropSpot: "Sycraia Abyssal Ruins", monsterName: "Damaged Kureba", obtained: false },
      { id: "mr2", name: "Merchant Ring Piece 2 (Padix)", dropSpot: "Padix Island", monsterName: "Mutated Loah Flower", obtained: false },
      { id: "mr3", name: "Merchant Ring Piece 3 (Ash Forest)", dropSpot: "Ash Forest", monsterName: "Gairas", obtained: false },
      { id: "mr4", name: "Merchant Ring Piece 4 (Crypt)", dropSpot: "Crypt of Resting Thoughts", monsterName: "Ahib Salun Bear", obtained: false },
      { id: "mr5", name: "Merchant Ring Piece 5 (Olun)", dropSpot: "Olun's Valley", monsterName: "Olun's Golem Left Arm", obtained: false }
    ]
  }
];
