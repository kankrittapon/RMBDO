export interface SpotBuildGuide {
  spotId: string;
  spotName: string;
  presetName: string;
  crystalFocus: string;
  artifactSet: string;
  lightstoneCombo: string;
  addonPreset: string;
  rotationKey: string;
  notes: string;
}

export interface ClassGuideItem {
  id: string;
  name: string;
  spec: 'AWAKENING' | 'SUCCESSION';
  role: 'DPS_BURST' | 'SUSTAINED_AOE' | 'BRUISER' | 'HYPER_MOBILITY';
  apmLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  mobilityRating: number;
  sustainRating: number;
  aoeRating: number;
  difficultyRating: number;
  keyStrengths: string[];
  coreRotation: string[];
  spotBuilds: SpotBuildGuide[];
  skillsList: Array<{ name: string; key: string; protection: 'SA' | 'FG' | 'IFRAME' | 'NONE'; cc: string; cooldown: string }>;
  addons: Array<{ skillName: string; buff1: string; buff2: string }>;
}

export const classGuideList: ClassGuideItem[] = [
  {
    id: "witch_awakening",
    name: "Witch",
    spec: "AWAKENING",
    role: "SUSTAINED_AOE",
    apmLevel: "LOW",
    mobilityRating: 6,
    sustainRating: 10,
    aoeRating: 10,
    difficultyRating: 4,
    keyStrengths: [
      "Massive natural HP/MP sustain with self-heals and Mana Absorption",
      "Full Super Armor and Forward Guard rotation on big AoE nukes",
      "High comfort for long grinding sessions without hand strain",
      "Excellent party support and magic lighthouse taunt for back attack setups"
    ],
    coreRotation: [
      "Magic Lighthouse (Pull & Taunt + Back Attack Setup)",
      "Voltaic Pulse (Shift + F) -> -20 All DP debuff + 100% Critical",
      "Yoke of Ordeal (Shift + RMB) -> Forward Guard Heavy Lightning Burst",
      "Equilibrium Break (Shift + LMB) -> High monster knockdown & Super Armor",
      "Fissure Wave (S + LMB + RMB) -> Earth Shock finisher",
      "Detonative Flow (W + F) -> Instant reposition & filler"
    ],
    skillsList: [
      { name: "Voltaic Pulse", key: "Shift + F", protection: "SA", cc: "Bound", cooldown: "6s" },
      { name: "Yoke of Ordeal", key: "Shift + RMB", protection: "FG", cc: "None", cooldown: "7s" },
      { name: "Equilibrium Break", key: "Shift + LMB", protection: "SA", cc: "Stiffness", cooldown: "6s" },
      { name: "Fissure Wave", key: "S + LMB + RMB", protection: "FG", cc: "Knockdown", cooldown: "8s" },
      { name: "Teleport / Magical Evasion", key: "Shift + Space / Shift + Direction", protection: "IFRAME", cc: "None", cooldown: "4s" }
    ],
    addons: [
      { skillName: "Voltaic Pulse", buff1: "Monster AP +30 (7s)", buff2: "Critical Hit Damage +5% (7s)" },
      { skillName: "Yoke of Ordeal", buff1: "Back Attack Damage +5% (7s)", buff2: "All DP -15 on Target (7s)" },
      { skillName: "Equilibrium Break", buff1: "Critical Hit Rate +20% (7s)", buff2: "Attack Speed +7% (7s)" },
      { skillName: "Fissure Wave", buff1: "Monster AP +20 (7s)", buff2: "Bleeding Damage +60 per 3s" }
    ],
    spotBuilds: [
      {
        spotId: "gyfin_underground",
        spotName: "Gyfin Rhasia Underground",
        presetName: "Kamasylvia Decimation & Back Attack Nuke",
        crystalFocus: "Haetae's Tear + Ahkrad x2 + Girin + Decimation x2",
        artifactSet: "Kabua's Artifacts (Left + Right)",
        lightstoneCombo: "The Wild: Kamasylvia (+30 Species AP, +6% Crit Dmg)",
        addonPreset: "Voltaic Pulse Opening (-20 DP) -> Yoke (+5% Back Attack)",
        rotationKey: "Lighthouse -> Teleport Behind -> Voltaic -> Yoke -> Eq Break -> Fissure",
        notes: "Place Magic Lighthouse right behind statue to lock mob orientation and score 100% Back Attacks."
      },
      {
        spotId: "inner_edania_core",
        spotName: "Inner Edania: Core of Void",
        presetName: "Abyssal Survival & Void Overcharge",
        crystalFocus: "Haetae's Tear + Frozen Bitterness + Rebellious + Viper",
        artifactSet: "Kabua's Artifacts (Damage Reduction Spec)",
        lightstoneCombo: "Target Openings / Untouchable (+15 Monster DR, +10% Crit Dmg)",
        addonPreset: "Self Heal +5% on hit -> Monster DR +15 buff on Equilibrium Break",
        rotationKey: "Teleport I-frame through Rift -> Full Super Armor Voltaic -> S-Block Guard",
        notes: "Inner Edania mobs hit through light Forward Guards; rely on Witch Super Armor chains and high Base DP."
      }
    ]
  },
  {
    id: "wizard_awakening",
    name: "Wizard",
    spec: "AWAKENING",
    role: "DPS_BURST",
    apmLevel: "LOW",
    mobilityRating: 6,
    sustainRating: 10,
    aoeRating: 10,
    difficultyRating: 4,
    keyStrengths: [
      "Devastating Fire & Water elemental explosions",
      "Magma Bomb & Cataclysm instant burst AOEs",
      "Double Teleport for fast pack relocation",
      "High defensive Super Armor rotation"
    ],
    coreRotation: [
      "Cataclysm (Shift + RMB) -> Super Armor Fire AoE + AP Buff",
      "Bolide of Destruction (Shift + F) -> Forward Guard Meteor Smash",
      "Hellfire (W + F) -> Forward Dash with Super Armor",
      "Aqua Jail Explosion (Shift + LMB) -> Water field slowing enemies",
      "Water Sphere (S + RMB) -> Knockdown burst"
    ],
    skillsList: [
      { name: "Cataclysm", key: "Shift + RMB", protection: "SA", cc: "Knockdown", cooldown: "6s" },
      { name: "Bolide of Destruction", key: "Shift + F", protection: "FG", cc: "None", cooldown: "7s" },
      { name: "Aqua Jail Explosion", key: "Shift + LMB", protection: "SA", cc: "Stiffness", cooldown: "6s" }
    ],
    addons: [
      { skillName: "Cataclysm", buff1: "Monster AP +30", buff2: "All Critical Damage +5%" },
      { skillName: "Bolide of Destruction", buff1: "Back Attack Damage +5%", buff2: "Target DP -20" }
    ],
    spotBuilds: [
      {
        spotId: "city_of_the_dead",
        spotName: "City of the Dead",
        presetName: "Demihuman Incinerator",
        crystalFocus: "Girin's Tear + Ahkrad x2 + Macalod x4",
        artifactSet: "Kabua's Artifacts",
        lightstoneCombo: "The Wild: Demihuman (+30 Demihuman AP)",
        addonPreset: "Cataclysm opening -> Bolide finisher",
        rotationKey: "Hellfire -> Cataclysm -> Bolide -> Aqua Jail",
        notes: "Pull whole pack into Tephra explosion and wipe them with Cataclysm."
      }
    ]
  },
  {
    id: "nova_awakening",
    name: "Nova",
    spec: "AWAKENING",
    role: "HYPER_MOBILITY",
    apmLevel: "VERY_HIGH",
    mobilityRating: 10,
    sustainRating: 7,
    aoeRating: 8,
    difficultyRating: 9,
    keyStrengths: [
      "Top-tier clearing speed via Accel mode turbo mechanics",
      "Rapid Sting & Star's Ring vacuums enemies together",
      "Unmatched movement speed between distant mob packs",
      "Highest theoretical DPS in endgame zones when mastered"
    ],
    coreRotation: [
      "Accel: Royal Fencing - Remise (LMB in Accel)",
      "Star's Breath -> Accel Mode Activation (Space)",
      "Break Orbit (Shift + Direction) -> Turbo dash",
      "Star's Ring (S + E) -> Gravity Well mob pull",
      "Frozen Ring (Shift + RMB) -> Heavy burst ice AoE",
      "Swooping Ring (W + RMB) -> Back attack gap closer"
    ],
    skillsList: [
      { name: "Break Orbit", key: "Shift + Direction", protection: "IFRAME", cc: "None", cooldown: "2s" },
      { name: "Star's Ring", key: "S + E", protection: "SA", cc: "Vacuum / Pull", cooldown: "8s" },
      { name: "Frozen Ring", key: "Shift + RMB", protection: "SA", cc: "Stiffness", cooldown: "5s" },
      { name: "Royal Fencing: Fleche", key: "Shift + LMB", protection: "FG", cc: "Knockback", cooldown: "4s" }
    ],
    addons: [
      { skillName: "Frozen Ring", buff1: "Monster AP +30", buff2: "Critical Hit Damage +5%" },
      { skillName: "Star's Ring", buff1: "Attack Speed +10%", buff2: "Target DP -20" },
      { skillName: "Royal Fencing: Remise", buff1: "Critical Rate +20%", buff2: "Back Attack +5%" }
    ],
    spotBuilds: [
      {
        spotId: "tungrad_ruins",
        spotName: "Tungrad Ruins",
        presetName: "Hyper Accel Demihuman Shredder",
        crystalFocus: "Girin + Decimation x2 + Ahkrad x2 + Rebellious",
        artifactSet: "Kabua's Artifacts (Monster AP)",
        lightstoneCombo: "Target Openings (+10% Critical Hit Damage)",
        addonPreset: "Star's Ring pull -> Remise spam -> Frozen Ring",
        rotationKey: "Break Orbit Behind -> Star's Ring -> Accel Remise -> Fleche",
        notes: "Cycle Accel gauge continuously. Use Break Orbit I-frame to evade Tungrad lightning slams."
      }
    ]
  },
  {
    id: "agent_class",
    name: "Agent (Scholar / Gunner Archetype)",
    spec: "AWAKENING",
    role: "DPS_BURST",
    apmLevel: "HIGH",
    mobilityRating: 9,
    sustainRating: 8,
    aoeRating: 9,
    difficultyRating: 7,
    keyStrengths: [
      "Sledgehammer gravity control and heavy armor piercing",
      "Anti-gravity leaps and long-range engagement",
      "Natural 100% Down Attack and Back Attack modifiers",
      "High single-target elite shredding for Ulukita & Edania"
    ],
    coreRotation: [
      "Flow: Gravity Warp (Shift + Space) -> Air dash behind boss",
      "Matter Acceleration (Shift + RMB) -> -20 All DP debuff",
      "Planetary Impact (Shift + F) -> Down Smash & 100% Crit",
      "Singularity Collapse (S + LMB + RMB) -> High DPS finisher"
    ],
    skillsList: [
      { name: "Matter Acceleration", key: "Shift + RMB", protection: "FG", cc: "Stiffness", cooldown: "5s" },
      { name: "Planetary Impact", key: "Shift + F", protection: "SA", cc: "Down Smash", cooldown: "6s" },
      { name: "Gravity Warp", key: "Shift + Space", protection: "IFRAME", cc: "None", cooldown: "3s" }
    ],
    addons: [
      { skillName: "Matter Acceleration", buff1: "Monster AP +30", buff2: "Target DP -20" },
      { skillName: "Planetary Impact", buff1: "Critical Hit Damage +5%", buff2: "Back Attack +5%" }
    ],
    spotBuilds: [
      {
        spotId: "darkseekers_retreat",
        spotName: "Darkseekers Retreat",
        presetName: "Gravity Piercer Demihuman",
        crystalFocus: "Girin + Haetae + Ahkrad x2 + Corrupted x2",
        artifactSet: "Kabua's Artifacts",
        lightstoneCombo: "The Wild: Demihuman",
        addonPreset: "Matter Acceleration -> Planetary Impact",
        rotationKey: "Gravity Warp -> Matter Accel -> Planetary Impact -> Singularity",
        notes: "Exploit Gravity Warp to stay permanently behind elite Darkseekers for 100% Back Attack uptime."
      }
    ]
  }
];
