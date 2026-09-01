import { CheckpointStatus } from '@/types/profile';

export interface CheckpointNode {
  id: string;
  title: string;
  englishTitle: string;
  category: string;
  shortDesc: string;
  requiredAction: string;
  requirements: string[];
  rewards: string[];
  whyImportant: string;
  unlocksWhat: string;
  nextRecommendedStep: string;
  dataSource: string;
  lastVerified: string;
  safetyNote?: string;
  childTaskIds?: string[];
  order: number;
}

export const masterCheckpointsList: CheckpointNode[] = [
  {
    id: "cp_season",
    title: "1. สำเร็จการศึกษาเซิร์ฟเวอร์ซีซั่น",
    englishTitle: "Season Server Graduation & Full PEN Tuvala",
    category: "FOUNDATION",
    shortDesc: "สร้างตัวละครซีซั่น ตีบวกทูบัลล่า PEN ครบเซ็ต และสำเร็จการศึกษา",
    requiredAction: "เคลียร์ Season Pass ตีบวกอาวุธ/เกราะ/ประดับ Tuvala เป็น PEN (V) และรับของขวัญซีซั่น",
    requirements: ["ตัวละครเลเวล 60-61", "อุปกรณ์ Tuvala PEN ครบ 13 ช่อง", "สำเร็จเควสหลักเมเดียหรือเควสย่อ"],
    rewards: ["เซ็ตเกราะและอาวุธ Tuvala PEN", "สร้อยคาโพเทีย PEN Capotia Necklace (+30 AP)", "หินครอนและคำแนะนำของบาลค์"],
    whyImportant: "เป็นรากฐานสำหรับเปลี่ยนผ่านไปสู่เซิร์ฟเวอร์ทั่วไปและรับพลังโจมตี AP 240+ / DP 305+",
    unlocksWhat: "สิทธิ์การเข้าสู่ Olvia Academy และ Hyperboost Progression",
    nextRecommendedStep: "ทำเควส Olvia Combat Academy และกดรับกล่องอาวุธดวงดาวรัตติกาล PEN กล่องแรก",
    dataSource: "Official BDO Season 2026 Live",
    lastVerified: "2026-09-01",
    safetyNote: "อย่าลืมแลกเปลี่ยนของขวัญซีซั่นเป็นสร้อย PEN Capotia หากยังไม่มีสร้อยระดับสูง",
    childTaskIds: [
      "season_create_char",
      "season_main_quest",
      "season_naru_to_tuvala",
      "season_pen_tuvala_weapons",
      "season_pen_tuvala_armors",
      "season_pen_tuvala_accs",
      "season_reach_lv60",
      "season_reach_lv61",
      "season_pass_complete",
      "season_graduation"
    ],
    order: 1
  },
  {
    id: "cp_hyperboost",
    title: "2. ไฮเปอร์บูสต์ & บริหารจัดการอาวุธดวงดาวรัตติกาล PEN",
    englishTitle: "Hyperboost & PEN Blackstar Weapon Allocation",
    category: "WEAPONS",
    shortDesc: "รับกล่องอาวุธ PEN Blackstar และวางแผนการเลือกอาวุธหลัก/ตื่นพลัง/อาวุธเสริม",
    requiredAction: "รับกล่อง PEN Blackstar จากภารกิจท้าทาย Lv.61, กิจกรรม Olvia และอัปเกรด TET เป็น PEN",
    requirements: ["สำเร็จการศึกษาซีซั่น", "เลเวล 61+", "เคลียร์ภารกิจท้าทาย Y"],
    rewards: ["PEN (V) Blackstar Weapon Box #1", "PEN (V) Blackstar Weapon Box #2", "PEN (V) Blackstar Weapon Box #3"],
    whyImportant: "อาวุธดวงดาวรัตติกาล PEN 2 ชิ้นเป็นวัตถุดิบจำเป็นในการหลอมอาวุธราชัน (Sovereign Weapon)",
    unlocksWhat: "การสร้างอาวุธระดับโบราณกาลราชัน (Sovereign Tier 10)",
    nextRecommendedStep: "เลือก Awakening เป็นชิ้นแรกหากเล่นสาย Awakening และเตรียม Mainhand ชิ้นที่สอง",
    dataSource: "Hyperboost Live Specification",
    lastVerified: "2026-09-01",
    safetyNote: "ห้ามเปิดกล่องเลือกอาวุธแบบสุ่มเด็ดขาด! ต้องคำนวณใน Sovereign Tracker ก่อนเสมอ",
    childTaskIds: [
      "hb_pen_bs_lv61_challenge",
      "hb_tet_bs_challenge",
      "hb_olvia_welcome_pen_bs",
      "hb_olvia_combat_pen_bs",
      "hb_tet_to_pen_upgrade",
      "hb_darkstar_stone_use",
      "hb_sovereign_main_ready",
      "hb_sovereign_awakening_ready"
    ],
    order: 2
  },
  {
    id: "cp_olvia_combat",
    title: "3. สถาบันฝึกฝนการต่อสู้ Olvia Academy (Combat)",
    englishTitle: "Olvia Combat Academy & Core PvE Specialization",
    category: "ACADEMY",
    shortDesc: "ทำแบบฝึกหัดการต่อสู้ ติดตั้ง Skill Add-ons อัญมณีกิริน และปราบมอนสเตอร์ระดับสูง",
    requiredAction: "เคลียร์ภารกิจ 11 ข้อใน Olvia Combat Academy ตั้งแต่เซนทอร์ไปจนถึงสุสานแห่งดวงดาวและบอสอรุณ",
    requirements: ["AP 260+ / DP 320+", "เซ็ตอัญมณีเวทมนตร์ Ahkrad / Girin", "อาหารครอนและน้ำยาอีลิกเซอร์"],
    rewards: ["หัวใจของกามอสกลับด้าน (Inverted Heart of Garmoth)", "กล่องอัญมณีกิรินแท้จริง", "คำแนะนำของบาลค์ +100"],
    whyImportant: "ช่วยปลดล็อกช่องอัญมณีอาวุธอเวคกิ้ง 2 ช่อง และดันค่าพลังโจมตีมอนสเตอร์ทะลุ 850+",
    unlocksWhat: "ความพร้อมในการฟาร์มวิหารไกฟินราเซียใต้ดิน และสถานที่พักผู้แสวงหาความมืด",
    nextRecommendedStep: "นำหัวใจของกามอสไปสกัดใส่อาวุธ Awakening ทันที",
    dataSource: "Olvia Academy System 2026",
    lastVerified: "2026-09-01",
    safetyNote: "เก็บสะเก็ดแห่งความเงียบงัน (Specter's Energy) ไว้ อย่าหลอมทิ้ง",
    childTaskIds: [
      "oc_course_intro",
      "oc_skill_addons",
      "oc_crystal_preset",
      "oc_centaurs_conquest",
      "oc_kamasylvia_kratuga",
      "oc_stars_end",
      "oc_gyfin_underground",
      "oc_darkseekers_trial",
      "oc_boss_blitz_loml",
      "oc_garmoth_heart_quest",
      "oc_sovereign_preparation"
    ],
    order: 3
  },
  {
    id: "cp_olvia_life",
    title: "4. สถาบันฝึกฝนสายอาชีพ Olvia Academy (Life Skill)",
    englishTitle: "Olvia Life Skill Academy & Imperial Delivery",
    category: "LIFE_SKILL",
    shortDesc: "ฝึกฝน 11 สายอาชีพ เก็บเกี่ยว ปรุงอาหาร จัดส่งราชสำนัก และเดินเรือมหาสมุทร",
    requiredAction: "ทำภารกิจฝึกทักษะการเก็บรวบรวม ปรุงอาหาร ล่าสัตว์ แปรรูป ตกปลา และเดินเรือ",
    requirements: ["ชุดนักทำอาหาร/เก็บรวบรวมมาโนส (Manos)", "เครื่องมือมาโนสระดับ TRI/TET"],
    rewards: ["เงินซิลเวอร์กำไร 300M+ ต่อวันจากการส่งราชสำนัก", "เหรียญตรามหาสมุทรอีกาดำ x5,000", "วัสดุต่อเรือ"],
    whyImportant: "สร้างรายได้ Passive Income รายวันแบบมั่นคงโดยไม่ต้องพึ่งพาการตีมอนสเตอร์เพียงอย่างเดียว",
    unlocksWhat: "การคราฟต์น้ำยาบัฟระดับสูงและต่อเรือคาร์แรคแห่งเอเฟเรีย",
    nextRecommendedStep: "ดันเลเวลทำอาหารให้ถึง Guru เพื่อส่งกล่องอาหารกูรูทุกวัน",
    dataSource: "Olvia Academy Life Branch",
    lastVerified: "2026-09-01",
    childTaskIds: [
      "ol_gathering_1",
      "ol_gathering_2",
      "ol_cooking_1",
      "ol_cooking_2",
      "ol_hunting_1",
      "ol_alchemy_1",
      "ol_processing_1",
      "ol_training_1",
      "ol_fishing_1",
      "ol_farming_1",
      "ol_sailing_1",
      "ol_bartering_1"
    ],
    order: 4
  },
  {
    id: "cp_sovereign_forge",
    title: "5. หลอมสร้างอาวุธราชัน (Sovereign Weapon Forge)",
    englishTitle: "Sovereign Primordial Weapon Synthesis",
    category: "ENDGAME_GEAR",
    shortDesc: "หลอมรวม PEN Blackstar 2 ชิ้น เป็นอาวุธราชัน Tier 10 พร้อมตีบวกขั้น I - X (Dec)",
    requiredAction: "นำ PEN Blackstar 2 ชิ้นไปที่ช่างตีเหล็กแห่งประเทศรุ่งอรุณเพื่อสร้างอาวุธราชัน",
    requirements: ["PEN Blackstar x2 ในช่องอาวุธเดียวกัน", "หรือ PEN Blackstar x1 + Flame of the Primordial"],
    rewards: ["อาวุธราชัน (Sovereign Weapon) Base AP +5 สูงกว่า PEN Blackstar"],
    whyImportant: "เป็นอาวุธขั้นสูงสุดในเกม มีระบบตีบวก 10 ขั้น (PRI ถึง DEC) และสามารถสลักอัญมณีเฉพาะทางได้",
    unlocksWhat: "สถิติพลังโจมตี AP 310+ สำหรับเข้าสู่ดินแดนเอดาเนีย (Edania)",
    nextRecommendedStep: "เริ่มสะสมหินดำแห่งอรุณเพื่อดันระดับราชันขึ้นขั้น PRI / DUO / TRI",
    dataSource: "Sovereign Weapon Live Data",
    lastVerified: "2026-09-01",
    safetyNote: "ห้ามใช้ Gem of Twilight กับอาวุธหลักเด็ดขาด เก็บไว้สำหรับอาวุธเสริมในอนาคต",
    order: 5
  },
  {
    id: "cp_slumbering_armors",
    title: "6. เซ็ตชุดเกราะเทพผู้ล่วงลับครบ 4 ชิ้น (Slumbering Origin Quad)",
    englishTitle: "Slumbering Origin Armor Quad (Fallen God, Labreska, Dahn, Ator)",
    category: "ENDGAME_GEAR",
    shortDesc: "คราฟต์เกราะผู้ล่วงลับ, หมวกลาเบริสกา, ถุงมือดาน, และรองเท้าอาโทร ระดับ DUO / TRI",
    requiredAction: "สะสมเปลวไฟแห่งความสิ้นหวัง, เปลวไฟเยือกแข็ง, เปลวไฟแห่งฮงอิก และเปลวไฟแห่งเสียงก้อง",
    requirements: ["เกราะบอส Caphras C10 x4 ชิ้น", "หรือ เกราะ Blackstar PEN x4 ชิ้น", "เปลวไฟบอส 4 ชนิด"],
    rewards: ["เกราะ Fallen God, หมวก Labreska, ถุงมือ Dahn, รองเท้า Ator", "DP พุ่งทะลุ 400+"],
    whyImportant: "มอบค่าพลังป้องกัน DP และการลดความเสียหาย (Damage Reduction) สูงสุดในเกม",
    unlocksWhat: "ความสามารถในการยืนชนมอนสเตอร์ในจุดฟาร์มระดับ Apex Endgame (Dehkia & Edania)",
    nextRecommendedStep: "ตีบวกชุดเกราะทั้ง 4 ชิ้นให้ถึงระดับ DUO (Distorted) เป็นอย่างน้อย",
    dataSource: "Fallen God Live Crafting",
    lastVerified: "2026-09-01",
    safetyNote: "ห้ามขายเปลวไฟบอสลงตลาดกลางแม้จะได้ชิ้นซ้ำ เก็บไว้ใช้หรือทำของสำรอง",
    order: 6
  },
  {
    id: "cp_permanent_journals",
    title: "7. บันทึกการผจญภัย & สเตตัสถาวรประจำตระกูล (Permanent Journals)",
    englishTitle: "Adventure Logs & Permanent Family AP/DP Stats",
    category: "PERMANENT_STATS",
    shortDesc: "เคลียร์บันทึกอีกอร์ บาร์ทัลลี่, เดฟ, โดริน มอร์กริม, พาวิโน เกรโก และศาลาราชันแห่งอรุณ",
    requiredAction: "ทำเควสในสมุดบันทึกการผจญภัยทุกเล่มเพื่อรับ AP ถาวร +9, DP ถาวร +9 และ Max HP +1,000+",
    requirements: ["บันทึกบาร์ทัลลี่ 15 เล่ม", "บันทึกเดฟ 6 เล่ม", "บันทึกโดริน", "บอสศาลาราชัน 5 ธาตุ"],
    rewards: ["AP ถาวร +9", "DP ถาวร +9", "Max HP +1,150", "Max Stamina +100"],
    whyImportant: "เป็นสเตตัสฟรีที่ติดตัวทุกตัวละครในตระกูลแบบถาวร ดัน AP/DP ทะลุ Bracket โดยไม่ต้องเปลี่ยนของ",
    unlocksWhat: "โบนัสสเตตัส AP/DP Bracket ระดับสูง",
    nextRecommendedStep: "เริ่มทำบันทึกบาร์ทัลลี่เล่ม 1-10 เป็นอันดับแรกเพื่อรับ AP +4 ทันที",
    dataSource: "Adventure Log Codex 2026",
    lastVerified: "2026-09-01",
    order: 7
  },
  {
    id: "cp_infinite_potions",
    title: "8. น้ำยาฟื้นฟูพลังชีวิตและมานาไร้ขีดจำกัด (Infinite Potions)",
    englishTitle: "Ornette & Odore Spirit Essence (Infinite HP/MP)",
    category: "TREASURE",
    shortDesc: "สะสมชิ้นส่วนสมบัติทำน้ำยาฟื้นฟูเลือดและมานาแบบกดใช้ได้ไม่จำกัดจำนวนครั้ง",
    requiredAction: "ฟาร์มชิ้นส่วน 3 ชิ้นสำหรับน้ำยาเลือด (เชเรคาน, โรนารอส, หมาป่าแดง) และ 3 ชิ้นสำหรับน้ำยามานา (ทชีรา, แมนชาอูม, นาร์วานน์)",
    requirements: ["AP 210 - 240", "สัตว์เลี้ยงเก็บของ Tier 4", "เต็นท์พักแรมพรีเมียม"],
    rewards: ["น้ำยาฟื้นฟูพลังชีวิตโอเนท (Ornette's Spirit Essence)", "น้ำยาฟื้นฟูมานาโอโดเร (Odore's Spirit Essence)"],
    whyImportant: "ตั้งค่านางฟ้า (Fairy) ให้กดเลือดและมานาอัตโนมัติ ทำให้เอาชีวิตรอดได้ในทุกสถานการณ์โดยไม่ต้องพกขวดน้ำยา",
    unlocksWhat: "ความต่อเนื่องในการฟาร์มมอนสเตอร์โดยไม่ต้องวาร์ปกลับเมืองไปซื้อน้ำยา",
    nextRecommendedStep: "เริ่มฟาร์มที่หลุมศพเชเรคาน (Sherekhan Necropolis) หรือใช้ระบบสะสมสะเก็ดหิน 100 ชิ้น",
    dataSource: "Infinite Potion Drop Tables",
    lastVerified: "2026-09-01",
    order: 8
  },
  {
    id: "cp_war_readiness",
    title: "9. ความพร้อมสำหรับสงครามฐานและสงครามปราสาท (War Readiness)",
    englishTitle: "7-Pillar Node War & Siege Readiness Audit",
    category: "WAR_READY",
    shortDesc: "ตรวจสอบความพร้อม 7 ด้าน: อุปกรณ์, สเตตัสถาวร, สมบัติ, พรีเซ็ตบัฟ, พรีเซ็ตอัญมณี PvP, และความชำนาญอาชีพ",
    requiredAction: "ผ่านเกณฑ์ขั้นต่ำ 7 เสาหลัก: GS 700+, น้ำยาฟื้นฟูโอเนท, คริสตัล PvP, และน้ำยาบัฟสงครามครบเซ็ต",
    requirements: ["GS 700+ (AP 305+ / DP 395+)", "น้ำยาโอเนท (Infinite HP)", "บัฟน้ำหอม/อาหาร/อีลิกเซอร์ PvP ครบ"],
    rewards: ["ความพร้อมในการเข้าร่วมกิลด์ระดับแนวหน้าใน Node War Tier 2-4 และ Siege War"],
    whyImportant: "ป้องกันการโดนวันช็อต (One-shot) ในสนามรบ และเพิ่มดาเมจเบิสต์ในการสังหารเป้าหมาย",
    unlocksWhat: "เกียรติยศและรางวัลเงินกิลด์มหาศาลจากชัยชนะในสงคราม",
    nextRecommendedStep: "ทดสอบคอมโบสกิลในลานประลองเสรี (Battle Arena) ร่วมกับเพื่อนในกิลด์",
    dataSource: "Node War Meta Audit 2026",
    lastVerified: "2026-09-01",
    order: 9
  }
];
