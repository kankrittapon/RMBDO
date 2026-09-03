export interface OlviaCombatTaskItem {
  id: string;
  title: string;
  category: 'FOUNDATION' | 'MONSTER_ZONE' | 'BOSS_CONQUEST' | 'GEAR_SYNTHESIS' | 'CAPSTONE';
  objective: string;
  reward: string;
  isImportantReward: boolean;
  safetyTag?: 'DO_NOT_USE' | 'DO_NOT_OPEN_YET' | 'SAFE_TO_USE' | 'DO_NOT_SELL';
  importantNote?: string;
  order: number;
}

export const olviaCombatTasksList: OlviaCombatTaskItem[] = [
  {
    id: "oc_course_intro",
    title: "1. เริ่มต้นหลักสูตรฝึกฝนการต่อสู้ Olvia Academy",
    category: "FOUNDATION",
    objective: "รับเควสเริ่มต้นจาก NPC ผู้ดูแลสถาบัน Olvia Academy ในเซิร์ฟเวอร์",
    reward: "คัมภีร์เพิ่มค่าประสบการณ์การต่อสู้ 530% x10",
    isImportantReward: false,
    order: 1
  },
  {
    id: "oc_skill_addons",
    title: "2. ตั้งค่าการเชี่ยวชาญทักษะ (Skill Add-on Specialization)",
    category: "FOUNDATION",
    objective: "ไปพบครูฝึกทักษะและติดตั้ง Skill Add-on ระดับ Tier 3 ให้ครบ 6 สกิล",
    reward: "น้ำยาฟื้นฟูพลังชีวิตและมานาอย่างดี x500",
    isImportantReward: false,
    order: 2
  },
  {
    id: "oc_crystal_preset",
    title: "3. ติดตั้งพรีเซ็ตอัญมณีเวทมนตร์ (Crystal Preset Configuration)",
    category: "FOUNDATION",
    objective: "ติดตั้งพรีเซ็ตผลึกอัญมณี 14 ช่อง เช่น ผลึกแห่งความมืดมิด และอัญมณีกิริน (Girin)",
    reward: "ผลึกแห่งความมืดมิดแท้จริง (Ahkrad Crystal) x2",
    isImportantReward: true,
    safetyTag: "SAFE_TO_USE",
    importantNote: "ใช้อัญมณีกิริน (Girin's Tear) เพิ่มพลังโจมตีมอนสเตอร์ +15 และ Critical Damage +5%",
    order: 3
  },
  {
    id: "oc_centaurs_conquest",
    title: "4. ปราบฝูงเซนทอร์แห่งบาเลนเซีย (Centaurs Zone Trial)",
    category: "MONSTER_ZONE",
    objective: "กำจัดมอนสเตอร์ในทุ่งเซนทอร์ 1,000 ตัวเพื่อทดสอบความเร็วในการเคลื่อนที่และเก็บขยะ",
    reward: "กล่องหินครอน (Cron Stone) x500 & หินคาพลาส x100",
    isImportantReward: true,
    safetyTag: "SAFE_TO_USE",
    order: 4
  },
  {
    id: "oc_kamasylvia_kratuga",
    title: "5. บททดสอบโบราณสถานคราทูก้า (Kratuga Ancient Ruins Trial)",
    category: "MONSTER_ZONE",
    objective: "ลงไปล่าในถ้ำคราทูก้าและเปิดการทำงานของระบบรักษาความปลอดภัยฉุกเฉิน",
    reward: "คำแนะนำของบาลค์ (+100) Advice of Valks",
    isImportantReward: true,
    safetyTag: "SAFE_TO_USE",
    importantNote: "เก็บคำแนะนำของบาลค์ +100 ไว้ใช้สำหรับการตีบวก TET/PEN อุปกรณ์ระดับสูง",
    order: 5
  },
  {
    id: "oc_stars_end",
    title: "6. พิชิตสุสานแห่งดวงดาว (Star's End Distortion Trial)",
    category: "MONSTER_ZONE",
    objective: "ทำลายศิลาแห่งความมืดและกำจัดมอนสเตอร์ในสุสานแห่งดวงดาว 1,500 ตัว",
    reward: "สะเก็ดแห่งความเงียบงัน (Specter's Energy) x2 & หินดำบริสุทธิ์ x50",
    isImportantReward: true,
    safetyTag: "DO_NOT_USE",
    importantNote: "อย่าเพิ่งหลอมหรือทิ้ง Specter's Energy เพราะใช้สำหรับการคราฟต์ชุดเกราะดวงดาวรัตติกาล",
    order: 6
  },
  {
    id: "oc_gyfin_underground",
    title: "7. บททดสอบวิหารใต้ดินไกฟินราเซีย (Gyfin Underground Mastery)",
    category: "MONSTER_ZONE",
    objective: "พิชิตมอนสเตอร์ไกฟินราเซียชั้นใต้ดินและปราบบอส Butcher of Gyfin",
    reward: "กล่องเลือกอัญมณีระดับสูง (Girin / Haetae Crystal Choice Box)",
    isImportantReward: true,
    safetyTag: "SAFE_TO_USE",
    importantNote: "เลือกน้ำตาแห่งกิริน (Girin's Tear) เพื่อดันพลังโจมตี PvE สูงสุด",
    order: 7
  },
  {
    id: "oc_darkseekers_trial",
    title: "8. บททดสอบสถานที่พักผ่อนของผู้แสวงหาความมืด (Darkseekers Retreat)",
    category: "MONSTER_ZONE",
    objective: "ล่ามอนสเตอร์ในอูลูกิตา (Ulukita) และรักษาคบเพลิงแห่งเปลวไฟนิรันดร์",
    reward: "สะเก็ดของคาบัว (Kabua's Fragment) x50",
    isImportantReward: true,
    safetyTag: "SAFE_TO_USE",
    importantNote: "สะสมครบ 100 ชิ้นเพื่อคราฟต์โบราณวัตถุคาบัว (Kabua's Artifact) ลดความเสียหายมอนสเตอร์ +15",
    order: 8
  },
  {
    id: "oc_boss_blitz_loml",
    title: "9. ปราบพลังแห่งศาลาราชันแห่งอรุณ (LoML Boss Blitz Conquered)",
    category: "BOSS_CONQUEST",
    objective: "เคลียร์บอสศาลาราชัน (Boss Blitz) ในประเทศแห่งรุ่งอรุณระดับความยากขั้นที่ 5",
    reward: "คริสตัลแห่งแสงอรุณ (Essence of Dawn) & ถุงสมบัติบอส",
    isImportantReward: true,
    safetyTag: "SAFE_TO_USE",
    order: 9
  },
  {
    id: "oc_garmoth_heart_quest",
    title: "10. เคลียร์เควสหัวใจของกามอส (Inverted Heart of Garmoth Chain)",
    category: "GEAR_SYNTHESIS",
    objective: "ทำเควสต่อเนื่องรับหัวใจของกามอสกลับด้านเพื่อนำไปอัญเชิญใส่อาวุธตื่นพลัง/อาวุธเสริม",
    reward: "หัวใจของกามอสกลับด้าน (Inverted Heart of Garmoth)",
    isImportantReward: true,
    safetyTag: "SAFE_TO_USE",
    importantNote: "ติดตั้งกับอาวุธ Awakening ทันทีเพื่อรับช่องอัญมณีเวทมนตร์เพิ่ม 2 ช่อง และ Max HP +400",
    order: 10
  },
  {
    id: "oc_sovereign_preparation",
    title: "11. จบคอร์ส Olvia Combat Academy (Combat Course Completion)",
    category: "CAPSTONE",
    objective: "เคลียร์ภารกิจ Combat Course ครบทั้ง 11 ข้อ (ข้อ 1-10 ด้านบน) เพื่อสำเร็จการศึกษา",
    reward: "PEN (V) Blackstar Mainhand x1 + TET (IV) Blackstar Mainhand x1 + Obsidian Hammer x15 + Gem of Twilight x1 + Darkstar Black Stone x1",
    isImportantReward: true,
    safetyTag: "DO_NOT_OPEN_YET",
    importantNote: "รางวัลนี้เป็นคนละชุดกับ PEN/TET Blackstar 3 ชิ้นที่ได้จากภารกิจท้าทาย Lv.61 (ปุ่ม Y) — รวมกันแล้วคือวัตถุดิบราชันครบชุด (ดูจุดตรวจ #2 Hyperboost) Obsidian Hammer x15 ใช้ตี TET Mainhand ให้เป็น PEN, Darkstar Black Stone ใช้กับ TET Offhand จากภารกิจ Y (ยืนยันรางวัลจาก blackdesertfoundry.com/new-player-guide, 2026-09-03)",
    order: 11
  }
];
