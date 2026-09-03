export interface OlviaLifeTaskItem {
  id: string;
  skillName: string;
  skillId: string;
  title: string;
  objective: string;
  reward: string;
  recommendedGear: string;
  order: number;
}

// Rewritten 2026-09-03. Every quest step here previously had specific
// quantities ("1,000 ชิ้น", "500 จาน", "200 ตัว", ...) that could not be
// found in ANY source, official or community, when re-checked - not
// Pearl Abyss's own support FAQ (support.pearlabyss.com, faqNo=649), not
// their GM Notes article ("The Essential Path to Growth - Enroll at Olvia
// Academy!", naeu.playblackdesert.com/en-US/News/Detail?groupContentNo=9597),
// not Garmoth's per-skill guide pages. The official sources only confirm:
// (1) which 9 life skill courses exist, (2) that completing all of them
// grants a one-time Family Reward of "Carta's Gathering Clothes and Crio's
// Fishing Chair" (support.pearlabyss.com FAQ #649, quoted directly), and
// (3) that weekly quests within each course grant Olvia Academy Coins.
// Nobody publishes the exact per-quest objective numbers - that detail only
// exists in the live game client. Rather than invent another equally
// precise-looking but equally fabricated set of numbers, objectives below
// are left as "verify in-game" rather than guessed - a missing number is
// less misleading than a wrong one that looks authoritative.
export const olviaLifeTasksList: OlviaLifeTaskItem[] = [
  {
    id: "ol_gathering_1",
    skillName: "เก็บรวบรวม (Gathering)",
    skillId: "gathering",
    title: "คอร์สเก็บรวบรวม (Gathering Course)",
    objective: "คอร์สแรกของสาย Life Skill - เควสละเอียด/จำนวนที่ต้องทำ ให้เช็คในเกมจริงที่หน้าต่าง Olvia Academy (ยังไม่มีแหล่งข้อมูลทางการยืนยันตัวเลขที่แน่นอน)",
    reward: "Life EXP จำนวนมากสำหรับสาย Gathering (ยืนยันจาก official GM Notes ว่ามี แต่ไม่ระบุจำนวน)",
    recommendedGear: "ชุดเก็บรวบรวมมาโนส (Manos Gathering Clothes)",
    order: 1
  },
  {
    id: "ol_fishing_1",
    skillName: "ตกปลา (Fishing / AFK Fishing)",
    skillId: "fishing",
    title: "คอร์สตกปลา (AFK Fishing Course)",
    objective: "official GM Notes เรียกคอร์สนี้ว่า 'AFK Fishing' โดยเฉพาะ - เควสละเอียด/จำนวนที่ต้องทำ ให้เช็คในเกมจริง",
    reward: "Life EXP จำนวนมากสำหรับสาย Fishing",
    recommendedGear: "เบ็ดตกปลาบาเลนอส & เก้าอี้ตกปลามาโนส",
    order: 2
  },
  {
    id: "ol_hunting_1",
    skillName: "ล่าสัตว์ (Hunting)",
    skillId: "hunting",
    title: "คอร์สล่าสัตว์ (Hunting Course)",
    objective: "official GM Notes ระบุว่าคอร์สนี้ให้ 'meat, hide, and blood all at once' - เควสละเอียด/จำนวนที่ต้องทำ ให้เช็คในเกมจริง",
    reward: "Life EXP จำนวนมากสำหรับสาย Hunting",
    recommendedGear: "ปืนคาบศิลามาโนส (Manos Matchlock)",
    order: 3
  },
  {
    id: "ol_cooking_1",
    skillName: "ทำอาหาร (Cooking)",
    skillId: "cooking",
    title: "คอร์สทำอาหาร (Cooking Course)",
    objective: "เควสละเอียด/จำนวนที่ต้องทำ ให้เช็คในเกมจริง",
    reward: "Life EXP จำนวนมากสำหรับสาย Cooking",
    recommendedGear: "ชุดนักทำอาหารมาโนส (Manos Cook's Clothes)",
    order: 4
  },
  {
    id: "ol_alchemy_1",
    skillName: "แปรธาตุ (Alchemy)",
    skillId: "alchemy",
    title: "คอร์สแปรธาตุ (Alchemy Course)",
    objective: "official GM Notes ระบุว่าสอนโดย NPC Eileen - เควสละเอียด/จำนวนที่ต้องทำ ให้เช็คในเกมจริง",
    reward: "Life EXP จำนวนมากสำหรับสาย Alchemy",
    recommendedGear: "ชุดนักแปรธาตุมาโนส (Manos Alchemy Clothes)",
    order: 5
  },
  {
    id: "ol_processing_1",
    skillName: "แปรรูป (Processing)",
    skillId: "processing",
    title: "คอร์สแปรรูป (Processing Course)",
    objective: "official GM Notes ระบุว่า 'สามารถทำได้ด้วยมือเปล่า' - เควสละเอียด/จำนวนที่ต้องทำ ให้เช็คในเกมจริง",
    reward: "Life EXP จำนวนมากสำหรับสาย Processing",
    recommendedGear: "หินแปรรูปมาโนส (Manos Processing Stone)",
    order: 6
  },
  {
    id: "ol_training_1",
    skillName: "ฝึกสัตว์ (Training)",
    skillId: "training",
    title: "คอร์สฝึกสัตว์ (Training Course)",
    objective: "official GM Notes เรียกว่าคอร์ส 'ผูกสัมพันธ์กับม้า' - เควสละเอียด/จำนวนที่ต้องทำ ให้เช็คในเกมจริง",
    reward: "Life EXP จำนวนมากสำหรับสาย Training",
    recommendedGear: "แส้ม้ามาโนส (Manos Riding Crop)",
    order: 7
  },
  {
    id: "ol_farming_1",
    skillName: "เพาะปลูก (Farming)",
    skillId: "farming",
    title: "คอร์สเพาะปลูก (Farming Course)",
    objective: "official GM Notes เรียกว่าคอร์ส 'สร้างรายได้มั่นคง' - เควสละเอียด/จำนวนที่ต้องทำ ให้เช็คในเกมจริง",
    reward: "Life EXP จำนวนมากสำหรับสาย Farming",
    recommendedGear: "ชุดเกษตรกรมาโนส",
    order: 8
  },
  {
    id: "ol_sailing_1",
    skillName: "การเดินเรือ (Sailing)",
    skillId: "sailing",
    title: "คอร์สเดินเรือ (Sailing Course)",
    objective: "official GM Notes เรียกว่าคอร์ส 'ล่องเรือสู่ทะเลเปิด' - เควสละเอียด/จำนวนที่ต้องทำ ให้เช็คในเกมจริง",
    reward: "Life EXP จำนวนมากสำหรับสาย Sailing",
    recommendedGear: "ชุดกะลาสีมาโนส",
    order: 9
  },
  {
    id: "ol_bartering_1",
    skillName: "การแลกเปลี่ยนสินค้า (Bartering)",
    skillId: "bartering",
    title: "คอร์สแลกเปลี่ยนสินค้า (Bartering Course)",
    objective: "พบใน Garmoth's Olvia Academy guide series แต่ไม่ได้อยู่ในรายชื่อ 9 คอร์สที่ official GM Notes เอ่ยถึงตรงๆ (ต้อง verify ในเกมว่ามีคอร์สนี้แยกจริงหรือรวมอยู่ใน Sailing)",
    reward: "Life EXP จำนวนมากสำหรับสาย Bartering (ยังไม่ยืนยัน)",
    recommendedGear: "เรือคาร์แรคแห่งเอเฟเรีย (Epheria Carrack)",
    order: 10
  },
  {
    id: "ol_family_reward_complete",
    title: "11. รางวัลจบคอร์สครบทุกสาย (Family Reward)",
    skillName: "รางวัลรวม (All Courses)",
    skillId: "family_reward",
    objective: "เคลียร์ Academy Pass ของทุกคอร์สให้ครบ (รางวัลนี้ได้ครั้งเดียวต่อครอบครัว - เควสที่เคลมไปแล้วจะเคลมซ้ำไม่ได้แม้ enroll ใหม่)",
    reward: "Carta's Gathering Clothes + Crio's Fishing Chair (ยืนยันจาก support.pearlabyss.com FAQ #649 โดยตรง)",
    recommendedGear: "-",
    order: 11
  }
];
