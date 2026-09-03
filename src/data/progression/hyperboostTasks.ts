export interface HyperboostTaskItem {
  id: string;
  title: string;
  category: 'BLACKSTAR' | 'ENHANCEMENT' | 'REWARD_CLAIM' | 'FORGE_PREP';
  description: string;
  sourceType: string;
  targetSlot: 'MAIN' | 'AWAKENING' | 'SUB' | 'ARMOR' | 'ACCESSORY' | 'GENERAL';
  rewardItem: string;
  safetyTag: 'DO_NOT_USE' | 'DO_NOT_OPEN_YET' | 'SAFE_TO_USE' | 'DO_NOT_SELL';
  importantNote: string;
  order: number;
}

// Rewritten 2026-09-03 against BDFoundry's "Hyperboost Beginner/Returning
// Player Guide" (https://www.blackdesertfoundry.com/new-player-guide/).
// The previous version of this file had two fabricated entries duplicating
// the Olvia Combat Academy capstone reward (removed earlier the same day),
// AND got the Y-Challenge breakdown wrong (treated it as a single PEN
// Blackstar claim; it's actually 3 separate box claims). Full material
// chain, cross-checked against olviaCombatTasks.ts's capstone reward
// (oc_sovereign_preparation, which supplies the other PEN Mainhand + the
// TET Mainhand + Obsidian Hammer x12 + Gem of Twilight + Darkstar Black
// Stone that steps below consume):
//
//   Combat Course (see olviaCombatTasks.ts) -> PEN Mainhand x1, TET Mainhand x1
//   Y-Challenge (this file, 3 claims)       -> PEN Awakening x2, TET Offhand x1
//   Obsidian Hammer x12 (from Combat Course) -> upgrades TET Mainhand to PEN
//   Darkstar Black Stone x1 (from Combat Course) -> upgrades TET Offhand to PEN
//   ------------------------------------------------------------------
//   Final: PEN Mainhand x2, PEN Awakening x2, PEN Offhand x1
//   Sovereign Mainhand   = PEN Mainhand x2
//   Sovereign Awakening  = PEN Awakening x2
//   Sovereign Sub/Offhand = PEN Offhand x1 + Gem of Twilight x1 (from Combat
//                           Course) + Flame of the Primordial x1
export const hyperboostTasksList: HyperboostTaskItem[] = [
  {
    id: "hb_y_pen_awakening_1",
    title: "1. รับกล่องอาวุธ PEN Blackstar ตื่นพลัง ชิ้นที่ 1 (Y-Challenge Awakening #1)",
    category: "REWARD_CLAIM",
    description: "กดรับกล่องอาวุธดวงดาวรัตติกาล PEN (V) จากหน้าต่างภารกิจท้าทาย (ปุ่ม Y) เมื่อตัวละครถึง Lv.61 - เลือกอาวุธตื่นพลัง (Awakening)",
    sourceType: "Lv.61 Y-Challenge Reward",
    targetSlot: "AWAKENING",
    rewardItem: "PEN (V) Blackstar Awakening Weapon Box",
    safetyTag: "DO_NOT_OPEN_YET",
    importantNote: "Y-Challenge ให้กล่องทั้งหมด 3 ใบ (Awakening x2 + Offhand x1) ห้ามเลือกซ้ำ slot เดียวกันทั้ง 3 ใบ",
    order: 1
  },
  {
    id: "hb_y_pen_awakening_2",
    title: "2. รับกล่องอาวุธ PEN Blackstar ตื่นพลัง ชิ้นที่ 2 (Y-Challenge Awakening #2)",
    category: "REWARD_CLAIM",
    description: "กดรับกล่องอาวุธ PEN (V) Blackstar ใบที่สองจากหน้าต่างภารกิจท้าทาย (ปุ่ม Y) - เลือกอาวุธตื่นพลัง (Awakening) เช่นกัน",
    sourceType: "Lv.61 Y-Challenge Reward",
    targetSlot: "AWAKENING",
    rewardItem: "PEN (V) Blackstar Awakening Weapon Box",
    safetyTag: "DO_NOT_OPEN_YET",
    importantNote: "รวมกับกล่องแรก = PEN Blackstar Awakening x2 ซึ่งพอดีสำหรับหลอมอาวุธราชันตื่นพลัง",
    order: 2
  },
  {
    id: "hb_y_tet_offhand",
    title: "3. รับอาวุธ TET Blackstar เสริม (Y-Challenge Offhand)",
    category: "REWARD_CLAIM",
    description: "กดรับกล่องอาวุธจากภารกิจท้าทาย (ปุ่ม Y) ใบที่สาม - เลือกอาวุธเสริม (Offhand/Sub) แบบ TET (IV)",
    sourceType: "Lv.61 Y-Challenge Reward",
    targetSlot: "SUB",
    rewardItem: "TET (IV) Blackstar Offhand Weapon",
    safetyTag: "SAFE_TO_USE",
    importantNote: "ต้องอัปเป็น PEN ด้วยหินดำดวงดาวรัตติกาลบริสุทธิ์ (Darkstar Black Stone) ที่ได้จาก Olvia Combat Academy",
    order: 3
  },
  {
    id: "hb_tet_mainhand_to_pen",
    title: "4. อัปเกรด TET Mainhand → PEN (จาก Combat Course)",
    category: "ENHANCEMENT",
    description: "ใช้ Obsidian Hammer x12 (ได้จากจุดตรวจ #3 Olvia Combat Academy) ตี TET Blackstar Mainhand ให้เป็น PEN",
    sourceType: "Enhancement Forge",
    targetSlot: "MAIN",
    rewardItem: "PEN (V) Blackstar Mainhand Weapon",
    safetyTag: "SAFE_TO_USE",
    importantNote: "Obsidian Hammer ป้องกันไม่ให้อาวุธเสียหาย ใช้ได้อย่างปลอดภัย - TET Mainhand มาจาก reward ของ oc_sovereign_preparation ไม่ใช่จากที่นี่",
    order: 4
  },
  {
    id: "hb_tet_offhand_to_pen",
    title: "5. อัปเกรด TET Offhand → PEN (จาก Y-Challenge)",
    category: "ENHANCEMENT",
    description: "ใช้ Darkstar Black Stone x1 (ได้จากจุดตรวจ #3 Olvia Combat Academy) ตี TET Blackstar Offhand ให้เป็น PEN",
    sourceType: "Enhancement Forge",
    targetSlot: "SUB",
    rewardItem: "PEN (V) Blackstar Offhand Weapon",
    safetyTag: "SAFE_TO_USE",
    importantNote: "หลังขั้นนี้จะมี PEN Mainhand x2 / PEN Awakening x2 / PEN Offhand x1 ครบสำหรับหลอมราชันทั้ง 3 ชิ้น",
    order: 5
  },
  {
    id: "hb_flame_primordial",
    title: "6. เตรียมเปลวไฟแห่งจุดเริ่มต้น (Flame of the Primordial)",
    category: "FORGE_PREP",
    description: "ปราบ World Boss ใน Land of the Morning Light เพื่อรับตราประทับ แลกเป็น Ember of the Primordial x50 ที่ Manage Currency UI, หรือแลก Olvia Academy Coin เป็น Ember อีก x50 - รวมให้ครบ 100 แล้วใช้ (L) Heating แปลงเป็น Flame of the Primordial x1",
    sourceType: "World Boss Seal / Olvia Academy Coin Exchange",
    targetSlot: "SUB",
    rewardItem: "Flame of the Primordial x1",
    safetyTag: "SAFE_TO_USE",
    importantNote: "ใช้เฉพาะสำหรับหลอมอาวุธราชันเสริม (Sub-weapon) เท่านั้น ไม่ต้องใช้กับ Main/Awakening",
    order: 6
  },
  {
    id: "hb_sovereign_main_ready",
    title: "7. วัตถุดิบอาวุธราชันหลักพร้อม (Sovereign Mainhand Materials Ready)",
    category: "FORGE_PREP",
    description: "ตรวจสอบว่ามี PEN Blackstar Mainhand x2 ครบแล้ว",
    sourceType: "Inventory Check",
    targetSlot: "MAIN",
    rewardItem: "Sovereign Mainhand Forge Readiness",
    safetyTag: "SAFE_TO_USE",
    importantNote: "นำไปหลอมที่แท่นหลอมบงฮวาง (Bonghwang Statue) บนภูเขาอาชิ (Mount Ahshi), ประเทศแห่งรุ่งอรุณ",
    order: 7
  },
  {
    id: "hb_sovereign_awakening_ready",
    title: "8. วัตถุดิบอาวุธราชันตื่นพลังพร้อม (Sovereign Awakening Materials Ready)",
    category: "FORGE_PREP",
    description: "ตรวจสอบว่ามี PEN Blackstar Awakening x2 ครบแล้ว",
    sourceType: "Inventory Check",
    targetSlot: "AWAKENING",
    rewardItem: "Sovereign Awakening Forge Readiness",
    safetyTag: "SAFE_TO_USE",
    importantNote: "เป้าหมายหลักอันดับ 1 สำหรับดัน AP ทะลุ 310+ - หลอมที่แท่นบงฮวางเช่นเดียวกับ Mainhand",
    order: 8
  },
  {
    id: "hb_sovereign_sub_ready",
    title: "9. วัตถุดิบอาวุธราชันเสริมพร้อม (Sovereign Sub-weapon Materials Ready)",
    category: "FORGE_PREP",
    description: "ตรวจสอบว่ามี PEN Blackstar Offhand x1 + Gem of Twilight x1 + Flame of the Primordial x1 ครบแล้ว",
    sourceType: "Inventory Check",
    targetSlot: "SUB",
    rewardItem: "Sovereign Sub-weapon Forge Readiness",
    safetyTag: "SAFE_TO_USE",
    importantNote: "สูตรนี้ต่างจาก Main/Awakening (ที่ใช้ PEN Blackstar x2) - Sub-weapon ใช้ PEN Blackstar x1 + Gem of Twilight + Flame of Primordial แทน",
    order: 9
  }
];
