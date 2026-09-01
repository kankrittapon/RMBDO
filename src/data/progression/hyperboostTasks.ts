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

export const hyperboostTasksList: HyperboostTaskItem[] = [
  {
    id: "hb_pen_bs_lv61_challenge",
    title: "รับกล่องอาวุธดวงดาวรัตติกาล PEN #1 (Lv.61 Challenge PEN Blackstar Box)",
    category: "REWARD_CLAIM",
    description: "กดรับกล่องอาวุธดวงดาวรัตติกาล PEN (V) จากหน้าต่างภารกิจท้าทาย (กดปุ่ม Y) เมื่อตัวละครถึง Lv.61",
    sourceType: "Lv.61 Y-Challenge Reward",
    targetSlot: "AWAKENING",
    rewardItem: "Choose Your PEN (V) Blackstar Weapon Box #1",
    safetyTag: "DO_NOT_OPEN_YET",
    importantNote: "แนะนำให้เลือกอาวุธตื่นพลัง (Awakening) เพื่อเตรียมทำอาวุธราชัน (Sovereign Awakening)",
    order: 1
  },
  {
    id: "hb_tet_bs_challenge",
    title: "รับอาวุธดวงดาวรัตติกาล TET #1 (TET Blackstar Challenge Reward)",
    category: "REWARD_CLAIM",
    description: "รับอาวุธดวงดาวรัตติกาล TET (IV) จากภารกิจท้าทายซีซั่น/ไฮเปอร์บูสต์",
    sourceType: "Season Challenge Progression",
    targetSlot: "MAIN",
    rewardItem: "TET (IV) Blackstar Main Weapon",
    safetyTag: "SAFE_TO_USE",
    importantNote: "ใช้อัปเกรดเป็น PEN (V) โดยใช้หินดำดวงดาวรัตติกาลบริสุทธิ์ หรือค้อนอัญมณีไร้ที่ติ",
    order: 2
  },
  {
    id: "hb_olvia_welcome_pen_bs",
    title: "รับกล่องอาวุธดวงดาวรัตติกาล PEN #2 (Olvia Welcome PEN Blackstar)",
    category: "REWARD_CLAIM",
    description: "รับกล่องอาวุธ PEN (V) Blackstar ชิ้นที่สองจากกิจกรรมต้อนรับ Olvia / Hyperboost Server",
    sourceType: "Olvia Academy / Event Mission",
    targetSlot: "MAIN",
    rewardItem: "Choose Your PEN (V) Blackstar Weapon Box #2",
    safetyTag: "DO_NOT_OPEN_YET",
    importantNote: "เลือกอาวุธหลัก (Mainhand) หากกล่องแรกเลือก Awakening ไปแล้ว",
    order: 3
  },
  {
    id: "hb_olvia_combat_pen_bs",
    title: "รับกล่องอาวุธดวงดาวรัตติกาล PEN #3 (Olvia Combat Academy Grand Reward)",
    category: "REWARD_CLAIM",
    description: "เคลียร์ภารกิจ Olvia Academy สายต่อสู้ครบตามเงื่อนไขเพื่อรับกล่องอาวุธ PEN (V) ชิ้นที่ 3",
    sourceType: "Olvia Combat Academy Capstone",
    targetSlot: "SUB",
    rewardItem: "Choose Your PEN (V) Blackstar Weapon Box #3",
    safetyTag: "DO_NOT_OPEN_YET",
    importantNote: "ชิ้นนี้สามารถเลือกเป็นอาวุธเสริม (Sub-weapon) หรือนำไปฟิวชั่นราชันชิ้นที่สอง",
    order: 4
  },
  {
    id: "hb_tet_to_pen_upgrade",
    title: "อัปเกรด TET Blackstar → PEN Blackstar สำเร็จ (TET → PEN Conversion)",
    category: "ENHANCEMENT",
    description: "ใช้ค้อนอัญมณีไร้ที่ติ (J's Hammer of Precision) หรือหินดำดวงดาวรัตติกาลบริสุทธิ์เพื่อดัน TET Blackstar เป็น PEN",
    sourceType: "Enhancement Forge",
    targetSlot: "MAIN",
    rewardItem: "PEN (V) Blackstar Weapon",
    safetyTag: "SAFE_TO_USE",
    importantNote: "อย่าใช้หินครอนกับของที่ไม่จำเป็น และห้ามตีสดโดยไม่มีค้อนป้องกันความเสียหาย",
    order: 5
  },
  {
    id: "hb_darkstar_stone_use",
    title: "ใช้งานหินดำดวงดาวรัตติกาลถูกต้องตามแผน (Darkstar Black Stone Applied)",
    category: "ENHANCEMENT",
    description: "นำหินดำดวงดาวรัตติกาลไปอัปเกรดอาวุธดวงดาวรัตติกาลเป้าหมาย",
    sourceType: "Crafting / Reward",
    targetSlot: "GENERAL",
    rewardItem: "Guaranteed Enhancement Progression",
    safetyTag: "SAFE_TO_USE",
    importantNote: "ตรวจสอบให้แน่ใจว่าใช้กับอาวุธที่กำลังจะนำไปทำราชัน (Sovereign) เท่านั้น",
    order: 6
  },
  {
    id: "hb_sovereign_main_ready",
    title: "เตรียมวัตถุดิบอาวุธราชันหลักพร้อม (Sovereign Mainhand Materials Ready)",
    category: "FORGE_PREP",
    description: "มี PEN Blackstar Mainhand x2 หรือ PEN Blackstar x1 + เปลวไฟแห่งจุดเริ่มต้น (Flame of Primordial)",
    sourceType: "Inventory Check",
    targetSlot: "MAIN",
    rewardItem: "Sovereign Mainhand Forge Readiness",
    safetyTag: "SAFE_TO_USE",
    importantNote: "นำไปหลอมที่ช่างตีเหล็กในประเทศแห่งรุ่งอรุณ (Land of Morning Light)",
    order: 7
  },
  {
    id: "hb_sovereign_awakening_ready",
    title: "เตรียมวัตถุดิบอาวุธราชันตื่นพลังพร้อม (Sovereign Awakening Materials Ready)",
    category: "FORGE_PREP",
    description: "มี PEN Blackstar Awakening x2 หรือ PEN Blackstar Awakening x1 + เปลวไฟแห่งจุดเริ่มต้น",
    sourceType: "Inventory Check",
    targetSlot: "AWAKENING",
    rewardItem: "Sovereign Awakening Forge Readiness",
    safetyTag: "SAFE_TO_USE",
    importantNote: "เป้าหมายหลักอันดับ 1 สำหรับดัน AP ทะลุ 310+",
    order: 8
  }
];
