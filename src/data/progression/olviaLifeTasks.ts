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

export const olviaLifeTasksList: OlviaLifeTaskItem[] = [
  // Gathering
  {
    id: "ol_gathering_1",
    skillName: "เก็บรวบรวม (Gathering)",
    skillId: "gathering",
    title: "รวบรวมเนื้อสัตว์และเลือด 1,000 ชิ้น",
    objective: "ใช้มีดแล่เนื้อ (Butcher Knife) รวบรวมเนื้อแกะหรือเนื้อกวางใกล้ฟาร์มลินช์",
    reward: "สะเก็ดหินแร่แข็งแกร่ง x50 & น้ำยาเพิ่มความเร็วการเก็บรวบรวม",
    recommendedGear: "มีดแล่เนื้อมาโนส (Manos Butcher Knife) TET",
    order: 1
  },
  {
    id: "ol_gathering_2",
    skillName: "เก็บรวบรวม (Gathering)",
    skillId: "gathering",
    title: "ตัดไม้และรวบรวมยางไม้ 1,000 ชิ้น",
    objective: "ใช้ขวานตัดไม้หรือขวดดูดยางไม้ในป่าคามาซิลเวีย",
    reward: "สะเก็ดหินแร่บริสุทธิ์ x50 & ค่าประสบการณ์เก็บรวบรวม",
    recommendedGear: "ขวานตัดไม้มาโนส (Manos Lumbering Axe)",
    order: 2
  },

  // Cooking
  {
    id: "ol_cooking_1",
    skillName: "ทำอาหาร (Cooking)",
    skillId: "cooking",
    title: "ปรุงอาหารเบื้องต้นสำหรับราชสำนัก 500 จาน",
    objective: "ใช้อุปกรณ์ทำอาหารระดับสูงในที่พัก ทำน้ำส้มสายชู (Vinegar) หรือเบียร์ (Beer)",
    reward: "เหรียญตราตอบแทนทองคำ - การทำอาหาร x100",
    recommendedGear: "ชุดนักทำอาหารมาโนส (Manos Cook's Clothes)",
    order: 3
  },
  {
    id: "ol_cooking_2",
    skillName: "ทำอาหาร (Cooking)",
    skillId: "cooking",
    title: "จัดส่งกล่องอาหารราชสำนักกูร์เมต์ (Guru Imperial Delivery)",
    objective: "แพ็คกล่องอาหารระดับเชี่ยวชาญ/กูรู และส่งมอบให้ NPC จัดส่งราชสำนัก",
    reward: "เงินซิลเวอร์กำไรประมาณ 250M - 400M ต่อวัน",
    recommendedGear: "เครื่องประดับมาโนสครบเซ็ต (Manos Accessories)",
    order: 4
  },

  // Hunting
  {
    id: "ol_hunting_1",
    skillName: "ล่าสัตว์ (Hunting)",
    skillId: "hunting",
    title: "ล่าแรดและหมาป่าเงาด้วยปืนคาบศิลา 200 ตัว",
    objective: "ติดตั้งปืนคาบศิลามาโนสและออกล่าในเขตทุ่งหญ้านาร์วานน์หรือป่านาร์ค",
    reward: "หัวสัตว์สตัฟฟ์สำหรับประดับบ้านบัฟ & กระสุนปืนไฟ",
    recommendedGear: "ปืนคาบศิลามาโนส (Manos Matchlock) +10",
    order: 5
  },

  // Alchemy
  {
    id: "ol_alchemy_1",
    skillName: "แปรธาตุ (Alchemy)",
    skillId: "alchemy",
    title: "แปรธาตุน้ำยาบริสุทธิ์และน้ำยาฟื้นฟู 1,000 ครั้ง",
    objective: "ใช้อุปกรณ์แปรธาตุในที่พัก ปรุงน้ำยาฟอกขาวบริสุทธิ์ (Clear Liquid Reagent)",
    reward: "น้ำยาแห่งความกล้าหาญ (Perfume of Courage) x10 & หินแปรธาตุ",
    recommendedGear: "ชุดนักแปรธาตุมาโนส (Manos Alchemy Clothes)",
    order: 6
  },

  // Processing
  {
    id: "ol_processing_1",
    skillName: "แปรรูป (Processing)",
    skillId: "processing",
    title: "สับไม้และหลอมโลหะแบบจำนวนมาก (Mass Processing)",
    objective: "ใช้อัญมณีแปรรูปมาโนสเพื่อสับท่อนไม้สนหรือหลอมทองแดง/เหล็ก",
    reward: "ผลึกโลหะบริสุทธิ์ x50 & สะเก็ดร่องรอย",
    recommendedGear: "หินแปรรูปมาโนส (Manos Processing Stone) TET",
    order: 7
  },

  // Training
  {
    id: "ol_training_1",
    skillName: "ฝึกสัตว์ (Training)",
    skillId: "training",
    title: "จับม้าป่า Tier 6-8 และนำไปลงทะเบียนที่คอกม้า 5 ตัว",
    objective: "ใช้เชือกจับม้าและก้อนน้ำตาลทรายดิบ จับม้าป่าบริเวณป่าบาเลนอสหรือเซเรนเดีย",
    reward: "คูปองเปลี่ยนทักษะม้า x3 & บัฟฝึกสัตว์",
    recommendedGear: "แส้ม้ามาโนส (Manos Riding Crop) TET",
    order: 8
  },

  // Fishing
  {
    id: "ol_fishing_1",
    skillName: "ตกปลา (Fishing)",
    skillId: "fishing",
    title: "ตกปลาเกรดสีทองหรือปลาโบราณ 50 ตัว",
    objective: "ใช้เบ็ดตกปลาบาเลนอสและทุ่นคาเอดา ตกปลาที่ชายหาดเวเรียหรือทะเลเปิด",
    reward: "ชิ้นส่วนผลึกดำโบราณ (Relic Crystal Shards) x30",
    recommendedGear: "เบ็ดตกปลาบาเลนอส +10 & เก้าอี้ตกปลามาโนส",
    order: 9
  },

  // Farming
  {
    id: "ol_farming_1",
    skillName: "เพาะปลูก (Farming)",
    skillId: "farming",
    title: "ติดตั้งรั้วเพาะปลูก 10 อันและเก็บเกี่ยวพืชเวทมนตร์",
    objective: "เช่ารั้วแข็งแรงจากผู้ดูแลคลัง ติดตั้งใกล้เมืองไฮเดล และเพาะปลูกพืชพิเศษ",
    reward: "ผลผลิตแห่งการเพาะปลูกเวทมนตร์ & ผลไม้แปรธาตุ x100",
    recommendedGear: "ชุดเกษตรกรมาโนส",
    order: 10
  },

  // Sailing
  {
    id: "ol_sailing_1",
    skillName: "การเดินเรือ (Sailing)",
    skillId: "sailing",
    title: "ต่อเรือสำเภาเอเฟเรียหรือเรือแกลเลียส (Epheria Caravel / Galleass)",
    objective: "อัปเกรดเรือใบเอเฟเรียเป็นเรือคาร์แรค (Carrack) หรือเรือสำเภาพาณิชย์",
    reward: "วัสดุต่อเรือขั้นสูง & เหรียญกาดาวน์แลกเปลี่ยน",
    recommendedGear: "ชุดกะลาสีมาโนส & ปืนใหญ่เรือ",
    order: 11
  },

  // Bartering
  {
    id: "ol_bartering_1",
    skillName: "การแลกเปลี่ยนสินค้า (Bartering)",
    skillId: "bartering",
    title: "แลกเปลี่ยนสินค้าทางทะเลครบ 500 ครั้ง",
    objective: "แลกเปลี่ยนสินค้าระดับ 1-5 ทั่วมหาสมุทรเกาะมาร์โกเรียและหมู่เกาะโอคิลลูอา",
    reward: "เหรียญตรามหาสมุทรอีกาดำ (Crow Coins) x5,000",
    recommendedGear: "เรือคาร์แรคแห่งเอเฟเรีย (Epheria Carrack)",
    order: 12
  }
];
