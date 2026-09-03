export interface HyperboostTaskItem {
  id: string;
  title: string;
  category: 'BLACKSTAR' | 'ENHANCEMENT' | 'REWARD_CLAIM' | 'FORGE_PREP';
  description: string;
  sourceType: string;
  targetSlot: 'MAIN' | 'AWAKENING' | 'SUB' | 'ARMOR' | 'ACCESSORY' | 'GENERAL' | 'PLAYER_CHOICE';
  rewardItem: string;
  safetyTag: 'DO_NOT_USE' | 'DO_NOT_OPEN_YET' | 'SAFE_TO_USE' | 'DO_NOT_SELL';
  importantNote: string;
  order: number;
}

// Rewritten 2026-09-03, THIRD pass, against the user's own check of current
// official Asia/SEA data. This corrects a real mistake from the previous
// pass: the Y-Challenge window does NOT hand out weapons pre-assigned to
// specific slots (Awakening x2 + Offhand x1) - every box in Y lets the
// player freely choose Main/Awakening/Sub-weapon. The previous version's
// rigid slot assignment was an unverified guess that happened to total the
// right count (3 PEN) but got the actual claim structure wrong.
//
// This file = ONLY what's in the (Y) Challenge window. Olvia Academy's
// Family Rewards - Combat (separate PEN Blackstar #3, TET Blackstar,
// Darkstar Black Stone, Obsidian Hammer, Gem of Twilight, and its OWN
// separate Inverted Heart of Garmoth) lives in olviaCombatTasks.ts
// (oc_sovereign_preparation) - do not merge the two, they are genuinely
// different reward sources even though some items share a name (there are
// TWO separate Inverted Heart of Garmoth claims: one here in Y, one in
// Combat Family Rewards).
//
// Grand total across BOTH sources: 3x Choose Your PEN (V) Blackstar Weapon
// Box (free slot choice each) + 2x TET (IV) Blackstar Weapon Box + 2x
// Inverted Heart of Garmoth.
export const hyperboostTasksList: HyperboostTaskItem[] = [
  {
    id: "y_pen_blackstar_1",
    title: "1. Choose Your PEN (V) Blackstar Weapon Box #1 (Y-Challenge)",
    category: "REWARD_CLAIM",
    description: "เลเวล 61+ และจบ Main Quest 1 ใน 4 ทาง: [Mediah] Apocalyptic Prophecy / [Everfrost] Beyond the Doors of Alyaelli / [Koo Mihyun] Seungsan's Secret / [Special Growth] Fughar's Memorandum - Chapter 11",
    sourceType: "Lv.61 Y-Challenge Reward",
    targetSlot: "PLAYER_CHOICE",
    rewardItem: "Choose Your PEN (V) Blackstar Weapon Box (เลือก Main/Awakening/Sub ได้อิสระ)",
    safetyTag: "DO_NOT_OPEN_YET",
    importantNote: "เลือก slot ที่ยังขาดก่อนเสมอ - วางแผนรวมกับกล่อง #2/#3 และ Combat Academy ก่อนเปิด",
    order: 1
  },
  {
    id: "y_tet_blackstar_1",
    title: "2. Choose Your TET (IV) Blackstar Weapon Box #1 (Y-Challenge)",
    category: "REWARD_CLAIM",
    description: "เงื่อนไขเดียวกับกล่อง PEN #1 ด้านบน (Lv.61 + Main Quest 1 ใน 4 ทาง) - ปลดพร้อมกัน",
    sourceType: "Lv.61 Y-Challenge Reward",
    targetSlot: "PLAYER_CHOICE",
    rewardItem: "Choose Your TET (IV) Blackstar Weapon Box (เลือก Main/Awakening/Sub ได้อิสระ, บางกรณีเลือก Dim Origin of Dark Hunger แทนได้)",
    safetyTag: "DO_NOT_OPEN_YET",
    importantNote: "ถ้า PEN #1 เคลมได้แล้วแต่ยังไม่เห็นกล่องนี้ ให้เลื่อนหาใน Y เพิ่มเติม - ปลดพร้อมกันตามเงื่อนไขเดียวกัน",
    order: 2
  },
  {
    id: "y_pen_blackstar_2_welcome",
    title: "3. Choose Your PEN (V) Blackstar Weapon Box #2 - Olvia Academy Welcome Gift (Y-Challenge)",
    category: "REWARD_CLAIM",
    description: "จบเควส [Olvia Academy] Your First Steps In เท่านั้น (ไม่ต้องจบ Combat Course ทั้งหมด) - ของใหม่จาก Hyperboost patch 30 ก.ค. 2026",
    sourceType: "Olvia Academy Welcome Gift (Y-Challenge)",
    targetSlot: "PLAYER_CHOICE",
    rewardItem: "Choose Your PEN (V) Blackstar Weapon Box (เลือก Main/Awakening/Sub ได้อิสระ)",
    safetyTag: "DO_NOT_OPEN_YET",
    importantNote: "เงื่อนไขง่ายกว่ากล่องอื่นมาก แค่สมัคร/เข้า Olvia Academy สำเร็จก็ได้แล้ว",
    order: 3
  },
  {
    id: "y_inverted_heart_garmoth",
    title: "4. Inverted Heart of Garmoth (Y-Challenge) - คนละดวงกับของ Combat Academy",
    category: "REWARD_CLAIM",
    description: "เลเวล 61+ และ Family Playtime ตาม requirement ปัจจุบัน (เดิม 200 ชม. Hyperboost ปรับให้ง่ายขึ้นแล้ว) และมี Knowledge 'In Return for Your Help' จากเควส Magnus [The Magnus] In Return for Your Help",
    sourceType: "Lv.61 + Magnus + Family Playtime (Y-Challenge)",
    targetSlot: "AWAKENING",
    rewardItem: "Inverted Heart of Garmoth x1",
    safetyTag: "DO_NOT_OPEN_YET",
    importantNote: "มี Inverted Heart of Garmoth อีก 1 ดวงแยกต่างหากจาก Olvia Combat Academy Family Rewards (olviaCombatTasks.ts) - รวมแล้วได้ 2 ดวง ปุ่มเทาในเกม = ยังมี requirement ข้อใดข้อหนึ่งไม่ครบ",
    order: 4
  },
  {
    id: "y_new_adventurer_support_funds",
    title: "5. New Adventurer Support Funds (Y-Challenge, เฉพาะบัญชีที่เข้าเกณฑ์)",
    category: "REWARD_CLAIM",
    description: "เฉพาะบัญชีที่เข้าเกณฑ์ New Adventurer - ปลดทีละ milestone: Lv.61, จบ Main Quest ที่กำหนด, Magnus, Family Playtime, Season Graduation, Adventure Log/progression milestone อื่นๆ (เช่น Igor Bartali's Adventures)",
    sourceType: "New Adventurer Milestone Track (Y-Challenge)",
    targetSlot: "GENERAL",
    rewardItem: "Gold Bar (ตัวอย่าง milestone: Gold Bar 10,000G x2 ≈ 2B Silver/milestone) - รวมสูงสุดตามระบบประมาณ 10 Billion Silver ถ้าบัญชีมีสิทธิ์ครบ",
    safetyTag: "SAFE_TO_USE",
    importantNote: "ขาย Gold Bar ให้ Storage Keeper/NPC เพื่อแปลงเป็น Silver - ไม่ใช่ทุกบัญชีจะเห็นระบบนี้ ถ้าไม่เข้าเกณฑ์ New Adventurer จะไม่มีในรายการ Y เลย",
    order: 5
  },
  {
    id: "hb_tet_to_pen_upgrade",
    title: "6. อัปเกรด TET Blackstar → PEN ด้วย Darkstar Black Stone",
    category: "ENHANCEMENT",
    description: "ใช้ Darkstar Black Stone x1 (จาก Olvia Combat Academy Family Rewards) ตี TET Blackstar 1 ชิ้นให้เป็น PEN แบบสำเร็จ 100%",
    sourceType: "Enhancement Forge",
    targetSlot: "PLAYER_CHOICE",
    rewardItem: "PEN (V) Blackstar Weapon",
    safetyTag: "SAFE_TO_USE",
    importantNote: "มี Darkstar Black Stone แค่ 1 ก้อน (จาก Combat Academy) ใช้ได้แค่ TET เดียว - TET อีกชิ้นต้องตีเองด้วย Obsidian Hammer x12 (โอกาสไม่การันตี 100% เหมือน Darkstar)",
    order: 6
  },
  {
    id: "hb_flame_primordial",
    title: "7. เตรียมเปลวไฟแห่งจุดเริ่มต้น (Flame of the Primordial)",
    category: "FORGE_PREP",
    description: "ปราบ World Boss ใน Land of the Morning Light เพื่อรับตราประทับ แลกเป็น Ember of the Primordial x50 ที่ Manage Currency UI, หรือแลก Olvia Academy Coin เป็น Ember อีก x50 - รวมให้ครบ 100 แล้วใช้ (L) Heating แปลงเป็น Flame of the Primordial x1",
    sourceType: "World Boss Seal / Olvia Academy Coin Exchange",
    targetSlot: "SUB",
    rewardItem: "Flame of the Primordial x1",
    safetyTag: "SAFE_TO_USE",
    importantNote: "ใช้เฉพาะสำหรับหลอมอาวุธราชันเสริม (Sub-weapon) เท่านั้น ไม่ต้องใช้กับ Main/Awakening",
    order: 7
  },
  {
    id: "hb_sovereign_main_ready",
    title: "8. วัตถุดิบอาวุธราชันหลักพร้อม (Sovereign Mainhand)",
    category: "FORGE_PREP",
    description: "ตรวจสอบว่ามี PEN Blackstar Mainhand x2 ครบแล้ว (จากทั้งหมด 5 กล่อง: Y x3 + Combat Academy x2 หลังอัปเกรด TET)",
    sourceType: "Inventory Check",
    targetSlot: "MAIN",
    rewardItem: "Sovereign Mainhand Forge Readiness",
    safetyTag: "SAFE_TO_USE",
    importantNote: "นำไปหลอมที่แท่นหลอมบงฮวาง (Bonghwang Statue) บนภูเขาอาชิ (Mount Ahshi), ประเทศแห่งรุ่งอรุณ",
    order: 8
  },
  {
    id: "hb_sovereign_awakening_ready",
    title: "9. วัตถุดิบอาวุธราชันตื่นพลังพร้อม (Sovereign Awakening)",
    category: "FORGE_PREP",
    description: "ตรวจสอบว่ามี PEN Blackstar Awakening x2 ครบแล้ว",
    sourceType: "Inventory Check",
    targetSlot: "AWAKENING",
    rewardItem: "Sovereign Awakening Forge Readiness",
    safetyTag: "SAFE_TO_USE",
    importantNote: "เป้าหมายหลักอันดับ 1 สำหรับดัน AP ทะลุ 310+",
    order: 9
  },
  {
    id: "hb_sovereign_sub_ready",
    title: "10. วัตถุดิบอาวุธราชันเสริมพร้อม (Sovereign Sub-weapon)",
    category: "FORGE_PREP",
    description: "ตรวจสอบว่ามี PEN Blackstar Offhand x1 + Gem of Twilight x1 (จาก Combat Academy) + Flame of the Primordial x1 ครบแล้ว",
    sourceType: "Inventory Check",
    targetSlot: "SUB",
    rewardItem: "Sovereign Sub-weapon Forge Readiness",
    safetyTag: "SAFE_TO_USE",
    importantNote: "สูตรนี้ต่างจาก Main/Awakening (ที่ใช้ PEN Blackstar x2) - Sub-weapon ใช้ PEN Blackstar x1 + Gem of Twilight + Flame of Primordial แทน",
    order: 10
  }
];
