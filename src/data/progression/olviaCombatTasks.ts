export interface OlviaCombatTaskItem {
  id: string;
  title: string;
  category: 'FOUNDATION' | 'MONSTER_ZONE' | 'BOSS_CONQUEST' | 'GEAR_SYNTHESIS' | 'CAPSTONE' | 'BASIC_TACTICS' | 'FIELD_TACTICS';
  objective: string;
  reward: string;
  isImportantReward: boolean;
  safetyTag?: 'DO_NOT_USE' | 'DO_NOT_OPEN_YET' | 'SAFE_TO_USE' | 'DO_NOT_SELL';
  importantNote?: string;
  order: number;
}

// Rewritten 2026-09-03 against a screenshot of the user's own in-game Olvia
// Academy panel - the ground truth. The previous version of this file had
// 11 generic/fabricated quest names (centaurs, ancient ruins, boss blitz...)
// that don't correspond to anything in the real Basic Tactics quest chain
// at all. The real Basic Tactics course is exactly these 12 quests, given
// by NPC Cliff (Professor of Combat), in this order:
export const olviaCombatTasksList: OlviaCombatTaskItem[] = [
  { id: "bt_01_sign_up", title: "1. [Combat Course] Sign Up for Course", category: "BASIC_TACTICS", objective: "รับเควสเริ่มต้นจาก Cliff (Professor of Combat) เพื่อสมัครเข้าคอร์ส Basic Tactics", reward: "-", isImportantReward: false, order: 1 },
  { id: "bt_02_basics_first", title: "2. [Combat Course] Basics First", category: "BASIC_TACTICS", objective: "เรียนรู้พื้นฐานการต่อสู้เบื้องต้น", reward: "-", isImportantReward: false, order: 2 },
  { id: "bt_03_strike_from_behind", title: "3. [Combat Course] Strike from Behind", category: "BASIC_TACTICS", objective: "ฝึกโจมตีจากด้านหลัง (Back Attack)", reward: "-", isImportantReward: false, order: 3 },
  { id: "bt_04_bumblin_buccaneers", title: "4. [Combat Course] The Bumblin' Buccaneers", category: "BASIC_TACTICS", objective: "ปราบกลุ่มโจรสลัด Bumblin' Buccaneers", reward: "-", isImportantReward: false, order: 4 },
  { id: "bt_05_pirates_treasure_map", title: "5. [Combat Course] The Pirates' Treasure Map?", category: "BASIC_TACTICS", objective: "ตามหาแผนที่สมบัติโจรสลัด", reward: "-", isImportantReward: false, order: 5 },
  { id: "bt_06_headmasters_visit", title: "6. [Combat Course] Headmaster's Visit", category: "BASIC_TACTICS", objective: "ต้อนรับการมาเยือนของอาจารย์ใหญ่", reward: "-", isImportantReward: false, order: 6 },
  { id: "bt_07_a_new_adventure", title: "7. [Combat Course] A New Adventure", category: "BASIC_TACTICS", objective: "เริ่มการผจญภัยครั้งใหม่", reward: "-", isImportantReward: false, order: 7 },
  { id: "bt_08_survival_tactics", title: "8. [Combat Course] Survival Tactics", category: "BASIC_TACTICS", objective: "ฝึกกลยุทธ์การเอาชีวิตรอด", reward: "-", isImportantReward: false, order: 8 },
  { id: "bt_09_why_defense_matters", title: "9. [Combat Course] Why Defense Matters", category: "BASIC_TACTICS", objective: "เรียนรู้ความสำคัญของการป้องกัน (DP)", reward: "-", isImportantReward: false, order: 9 },
  { id: "bt_10_a_likely_place", title: "10. [Combat Course] A Likely Place", category: "BASIC_TACTICS", objective: "สำรวจพื้นที่ที่น่าจะมีเป้าหมาย", reward: "-", isImportantReward: false, order: 10 },
  { id: "bt_11_blessing_of_the_divine", title: "11. [Combat Course] Blessing of the Divine", category: "BASIC_TACTICS", objective: "รับพรจากเทพ", reward: "-", isImportantReward: false, order: 11 },
  {
    id: "bt_12_artifacts_and_lightstones",
    title: "12. [Combat Course] Artifacts and Lightstones",
    category: "BASIC_TACTICS",
    objective: "เรียนรู้การติดตั้งโบราณวัตถุ (Artifacts) และหินแปรธาตุ (Lightstones) - เควสสุดท้ายของ Basic Tactics",
    reward: "-",
    isImportantReward: false,
    importantNote: "จบ Basic Tactics แล้วต้องต่อด้วย Field Tactics (19 เควส, รายชื่อยังไม่ได้บันทึก) ก่อนจะเคลม Family Rewards - Combat ได้",
    order: 12
  },
  // Field Tactics (19 quests) - titles not yet recorded, track progress via
  // the sub-course counter (src/data/progression/olviaSubCourses.ts) until
  // the user reports individual quest names the same way they did for
  // Basic Tactics.
  {
    id: "oc_sovereign_preparation",
    title: "13. เคลม Family Rewards - Combat (หลังจบทั้ง Basic Tactics + Field Tactics)",
    category: "CAPSTONE",
    objective: "เคลียร์ Basic Tactics (12 เควส) และ Field Tactics (19 เควส) ให้ครบ แล้วกดเคลม 'Family Rewards - Combat' ในหน้าต่าง Olvia Academy",
    reward: "PEN (V) Blackstar Mainhand x1 + TET (IV) Blackstar Mainhand x1 + Obsidian Hammer x15 + Gem of Twilight x1 + Darkstar Black Stone x1",
    isImportantReward: true,
    safetyTag: "DO_NOT_OPEN_YET",
    importantNote: "รางวัลนี้เป็นคนละชุดกับ PEN/TET Blackstar 3 ชิ้นที่ได้จากภารกิจท้าทาย Lv.61 (ปุ่ม Y) — รวมกันแล้วคือวัตถุดิบราชันครบชุด (ดูจุดตรวจ #2 Hyperboost) Obsidian Hammer x15 ใช้ตี TET Mainhand ให้เป็น PEN, Darkstar Black Stone ใช้กับ TET Offhand จากภารกิจ Y (item breakdown ยืนยันจาก blackdesertfoundry.com/new-player-guide; ปุ่มเคลม 'Family Rewards - Combat' ยืนยันจากสกรีนช็อตในเกมจริงของผู้ใช้, 2026-09-03)",
    order: 13
  }
];
