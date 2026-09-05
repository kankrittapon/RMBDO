// Structured material requirements for the "Hyperboost end goal": a full
// Sovereign weapon set (3 pieces) + full Slumbering Origin armor set (4
// pieces) + full PEN Kharazad accessory set (6 pieces). Every quantity
// here is reformatted from data already verified elsewhere in this
// project (checkpoints.ts cp_sovereign_forge/cp_slumbering_armors/
// cp_kharazad_accessories, hyperboostTasks.ts) - nothing new is invented
// here, this file just structures already-confirmed numbers into a
// shape a shopping-list UI can render and total up.

export interface GoalMaterial {
  id: string;
  name: string;
  quantity: number;
  note?: string;
  /** id of the existing checklist task (hyperboostTasksList / etc.) whose
   * COMPLETED status means this material requirement is satisfied - lets
   * the UI show real progress instead of a separate untracked checkbox. */
  linkedTaskId?: string;
}

export interface GoalStage {
  id: string;
  order: number;
  title: string;
  englishTitle: string;
  /** Which existing progressStats key (from useRoadmapStore) drives this
   * stage's overall completion bar - undefined for the Sovereign stage,
   * since its 3 forge-readiness checks are a subset of the broader
   * `hyperboost` stat (which also includes unrelated Y-Challenge box
   * claims), so its progress is computed from `materials[].linkedTaskId`
   * against `profile.hyperboostClaims` directly instead. */
  progressStatsKey?: 'slumberingOrigin' | 'kharazad';
  gatingRequirement?: string;
  materials: GoalMaterial[];
  viewTab: string; // NavTabId to jump to for the detailed checklist
}

export const endgameGoalStages: GoalStage[] = [
  {
    id: 'goal_sovereign',
    order: 1,
    title: 'อาวุธราชันครบ 3 ชิ้น (Main / Awakening / Sub)',
    englishTitle: 'Full Sovereign Weapon Set',
    gatingRequirement: 'เลเวล 61+ จบ Main Quest 1 ใน 4 ทาง + สมัคร Olvia Academy',
    materials: [
      { id: 'sov_main_pen', name: 'PEN (V) Blackstar Mainhand', quantity: 2, note: 'จาก Y-Challenge + Combat Academy รวมกัน', linkedTaskId: 'hb_sovereign_main_ready' },
      { id: 'sov_awakening_pen', name: 'PEN (V) Blackstar Awakening', quantity: 2, note: 'เป้าหมายหลักอันดับ 1 สำหรับดัน AP 310+', linkedTaskId: 'hb_sovereign_awakening_ready' },
      { id: 'sov_sub_pen', name: 'PEN (V) Blackstar Offhand', quantity: 1, linkedTaskId: 'hb_sovereign_sub_ready' },
      { id: 'sov_gem_twilight', name: 'Gem of Twilight', quantity: 1, note: 'ใช้กับ Sub-weapon เท่านั้น ห้ามใช้กับ Main/Awakening', linkedTaskId: 'hb_sovereign_sub_ready' },
      { id: 'sov_flame_primordial', name: 'Flame of the Primordial', quantity: 1, note: 'แลกจาก World Boss Seal / Olvia Academy Coin x100', linkedTaskId: 'hb_flame_primordial' },
    ],
    viewTab: 'sovereign',
  },
  {
    id: 'goal_slumbering',
    order: 2,
    title: 'เกราะเทพผู้ล่วงลับครบ 4 ชิ้น',
    englishTitle: 'Full Slumbering Origin Armor Set',
    progressStatsKey: 'slumberingOrigin',
    gatingRequirement: 'ปลดตาม AP: หมวก 305+ / เกราะ 310+ / ถุงมือ+รองเท้า 315+',
    materials: [
      { id: 'so_helmet', name: "Labreska's Helmet", quantity: 1, note: 'AP 305+ (ต่ำสุดในกลุ่ม เริ่มจากอันนี้ก่อน)' },
      { id: 'so_armor', name: "Fallen God's Armor", quantity: 1, note: 'AP 310+' },
      { id: 'so_gloves', name: "Dahn's Gloves", quantity: 1, note: 'AP 315+ เลือกออปชั่น Damage Reduction ตอนรับ' },
      { id: 'so_shoes', name: "Ator's Shoes", quantity: 1, note: 'AP 315+ เลือกออปชั่น Damage Reduction ตอนรับ' },
    ],
    viewTab: 'slumbering_origin',
  },
  {
    id: 'goal_kharazad',
    order: 3,
    title: 'เครื่องประดับคาราซัด PEN ครบ 6 ชิ้น',
    englishTitle: 'Full PEN Kharazad Accessory Set',
    progressStatsKey: 'kharazad',
    gatingRequirement: 'สำเร็จเควส Olvia Academy Admission',
    materials: [
      { id: 'kh_essence_dawn', name: 'Essence of Dawn', quantity: 60, note: '10 ชิ้น x 6 ประดับ' },
      { id: 'kh_black_crystal_shard', name: 'Sharp Black Crystal Shard', quantity: 300, note: '50 ชิ้น x 6 ประดับ' },
      { id: 'kh_ancient_black_stone', name: 'Ancient Black Stone', quantity: 2, note: "สำหรับอัป OCT สร้อยคอ+เข็มขัด จาก Emma Bartali's Journal (ไม่ใช่ตลาด)", linkedTaskId: 'kh_oct_upgrade' },
    ],
    viewTab: 'kharazad',
  },
];
