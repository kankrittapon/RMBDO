export interface SeasonTaskItem {
  id: string;
  title: string;
  category: 'CREATION' | 'GEAR' | 'LEVEL' | 'PASS' | 'GRADUATION';
  description: string;
  reward: string;
  safetyNote?: string;
  order: number;
}

export const seasonTasksList: SeasonTaskItem[] = [
  {
    id: "season_create_char",
    title: "สร้างตัวละครซีซั่น (Season Character Created)",
    category: "CREATION",
    description: "สร้างตัวละครใน Season Server พร้อมรับสิทธิประโยชน์บัฟ EXP/Skill EXP",
    reward: "Season Pass & สิทธิ์เข้าเซิร์ฟเวอร์ซีซั่น",
    order: 1
  },
  {
    id: "season_main_quest",
    title: "เคลียร์เควสหลักเมเดีย หรือ เควสย่อ (Main Quest Progression)",
    category: "CREATION",
    description: "ทำเควสหลักผ่านเมเดีย (Mediah) หรือเลือกเควสย่อแบบ Simplified เพื่อรับอุปกรณ์ทูบัลล่า (Tuvala)",
    reward: "ชุดอุปกรณ์นารุ (Naru Gear) และ หินดำเริ่มต้น",
    order: 2
  },
  {
    id: "season_naru_to_tuvala",
    title: "อัปเกรดนารุ PEN เป็นทูบัลล่า PRI (Naru PEN → Tuvala PRI Conversion)",
    category: "GEAR",
    description: "ตีบวกอุปกรณ์นารุ (Naru) ระดับ PEN (V) ให้ครบทุกชิ้นแล้วแลกเปลี่ยนเป็นอุปกรณ์ทูบัลล่า (Tuvala) ระดับ PRI (I)",
    reward: "เซ็ตอุปกรณ์ทูบัลล่า PRI (I)",
    safetyNote: "หินดำนารุมีแจกไม่อั้น ตีบวกได้ 100% ไม่ต้องใช้สะสมแต้มความล้มเหลว (Failstack)",
    order: 3
  },
  {
    id: "season_pen_tuvala_weapons",
    title: "ตีบวกอาวุธทูบัลล่า PEN (V) ครบ 3 ชิ้น (PEN Tuvala Weapons)",
    category: "GEAR",
    description: "อัปเกรดอาวุธหลัก (Main), อาวุธตื่นพลัง (Awakening), และอาวุธเสริม (Sub) เป็นระดับ PEN (V)",
    reward: "สถิติพลังโจมตี AP พื้นฐานพร้อมลุย Tier ถัดไป",
    safetyNote: "ใช้แร่ทูบัลล่าซ่อมความทนทาน และใช้หินทูบัลล่าบริสุทธิ์เพื่อรับประกันการติด 100%",
    order: 4
  },
  {
    id: "season_pen_tuvala_armors",
    title: "ตีบวกชุดเกราะทูบัลล่า PEN (V) ครบ 4 ชิ้น (PEN Tuvala Armors)",
    category: "GEAR",
    description: "อัปเกรดหมวก (Helmet), เกราะ (Armor), ถุงมือ (Gloves), และรองเท้า (Shoes) เป็นระดับ PEN (V)",
    reward: "สถิติพลังป้องกัน DP พื้นฐานสำหรับมอนสเตอร์ระดับกลาง",
    order: 5
  },
  {
    id: "season_pen_tuvala_accs",
    title: "ตีบวกเครื่องประดับทูบัลล่า PEN (V) ครบเซ็ต (PEN Tuvala Accessories)",
    category: "GEAR",
    description: "อัปเกรดสร้อย (Necklace), เข็มขัด (Belt), แหวน 2 วง (Rings), ต่างหู 2 ข้าง (Earrings) เป็น PEN (V)",
    reward: "AP/DP เสริมสำหรับสำเร็จการศึกษา",
    safetyNote: "เครื่องประดับทูบัลล่าหากตีแตกจะหายไปทันที ให้เตรียมเครื่องประดับสำรองไว้เสมอ",
    order: 6
  },
  {
    id: "season_reach_lv60",
    title: "เก็บเลเวลตัวละครถึง เลเวล 60 (Reach Level 60)",
    category: "LEVEL",
    description: "เก็บเลเวลผ่านเควสเฉินกุก (Chenga Tome) หรือฟาร์มในเซิร์ฟเวอร์ซีซั่นจนถึง Lv.60",
    reward: "ปลดล็อกสกิลและของรางวัลท้าทาย (Y Challenge)",
    order: 7
  },
  {
    id: "season_reach_lv61",
    title: "เก็บเลเวลตัวละครถึง เลเวล 61 (Reach Level 61)",
    category: "LEVEL",
    description: "เก็บเลเวลถึง Lv.61 เพื่อปลดล็อกของรางวัลท้าทายระดับตำนาน",
    reward: "กล่องเลือกอาวุธดวงดาวรัตติกาล PEN (V) Blackstar Weapon Box",
    safetyNote: "กล่องนี้อย่าเพิ่งเปิดใช้งานจนกว่าจะตรวจสอบแผนการเลือกอาวุธใน Sovereign Tracker",
    order: 8
  },
  {
    id: "season_pass_complete",
    title: "เคลียร์ภารกิจบัตรผ่านซีซั่นครบทุกข้อ (Season Pass Completed)",
    category: "PASS",
    description: "ทำภารกิจใน Season Pass ครบทุกช่องเพื่อรับสะเก็ดแห่งความทรงจำ, หินครอน, และคำแนะนำของบาลค์",
    reward: "ของรางวัลบัตรผ่านซีซั่นครบเซ็ต",
    order: 9
  },
  {
    id: "season_graduation",
    title: "สำเร็จการศึกษาซีซั่น (Season Graduation)",
    category: "GRADUATION",
    description: "สำเร็จการศึกษากับพุการ์ (Fughar) เพื่อแปลงอุปกรณ์ทูบัลล่าเป็นของตัวละครทั่วไป พร้อมรับใบแลกของขวัญซีซั่น",
    reward: "ใบแลกของขวัญซีซั่นพิเศษ (เช่น สร้อยคาโพเทีย PEN Capotia Necklace)",
    safetyNote: "เลือกสร้อย PEN Capotia (+30 AP) หากยังไม่มีสร้อยระดับสูง",
    order: 10
  }
];
