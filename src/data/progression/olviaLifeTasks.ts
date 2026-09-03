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

// Rewritten 2026-09-03, second pass: replaced with the real per-course
// progression chains + reward tables the user compiled from their own
// research (Class 3 update era, cross-referencing official April 16 patch
// corrections - e.g. Hunting's Final Proof was reduced from Wildspark x200
// to x100, and the old "Maximizing Distance Bonus" objective wording in
// some guides is outdated). This supersedes the earlier "check in-game,
// count not published" placeholders - the user found what the placeholders
// said didn't exist. Three rows per skill: (1) the tool-unlock/progression
// chain summarized, (2) the Final Proof gate, (3) the completion reward.
export const olviaLifeTasksList: OlviaLifeTaskItem[] = [
  // Gathering (100% for the user's account - confirmed complete)
  {
    id: "ol_gathering_chain",
    skillName: "เก็บรวบรวม (Gathering)",
    skillId: "gathering",
    title: "1. ปลดล็อกเครื่องมือเก็บรวบรวมครบ 6 ชนิด",
    objective: "Hoe→Potato x20, Fluid Collector→Ash Sap x20, Butcher Knife→Wolf Meat x20, Lumbering Axe→Ash Timber x20, Tanning Knife→Wolf Hide, Pickaxe→Rough Stone x20",
    reward: "-",
    recommendedGear: "เครื่องมือ Dostter Steel ระดับเริ่มต้น",
    order: 1
  },
  {
    id: "ol_gathering_final_proof",
    skillName: "เก็บรวบรวม (Gathering)",
    skillId: "gathering",
    title: "2. Final Proof: Fairy's Breath x100",
    objective: "เก็บ Fairy's Breath x100 ก่อนเข้า Olvium Frontia เพื่อจบคอร์ส",
    reward: "-",
    recommendedGear: "-",
    order: 2
  },
  {
    id: "ol_gathering_reward",
    skillName: "เก็บรวบรวม (Gathering)",
    skillId: "gathering",
    title: "3. รางวัลจบคอร์ส Gathering",
    objective: "เคลม Academy Pass ให้ครบหลังจบคอร์ส",
    reward: "TRI Carta Gatherer's Clothes + TRI Dostter Steel Hoe/Tanning Knife/Lumbering Axe/Pickaxe + Cron Stone x1,000 (ระหว่างทางมี Stella's Spirit Stone, Mellow Herbal Medicine x3, Life Crystal, Gathering EXP จำนวนมาก)",
    recommendedGear: "-",
    order: 3
  },

  // Fishing (85% - Red Grade fish final proof remaining)
  {
    id: "ol_fishing_chain",
    skillName: "ตกปลา (Fishing)",
    skillId: "fishing",
    title: "4. สายเควสตกปลา: Green→Blue→Yellow→Red Grade",
    objective: "Green Grade Fish → Drying ปลา → Blue Grade Fish → ขายปลา → Bargaining → Yellow Grade Fish → Distance Bonus (Kurio อธิบายเฉยๆ หลัง patch 16 เม.ย. ไม่ใช่ objective แบบเก่า) → Imperial Fishing Delivery → Red Grade Fish",
    reward: "-",
    recommendedGear: "-",
    order: 4
  },
  {
    id: "ol_fishing_final_proof",
    skillName: "ตกปลา (Fishing)",
    skillId: "fishing",
    title: "5. Final Proof: Red Grade Fish x1 (ต้องออกไปตกนอก Academy)",
    objective: "ตก Red Grade Fish ไม่ได้ในพื้นที่ Academy - ต้องออกไปตกที่อื่น เช่น Velia",
    reward: "-",
    recommendedGear: "เบ็ดตกปลาบาเลนอส",
    order: 5
  },
  {
    id: "ol_fishing_reward",
    skillName: "ตกปลา (Fishing)",
    skillId: "fishing",
    title: "6. รางวัลจบคอร์ส Fishing",
    objective: "เคลม Academy Pass ให้ครบหลังจบคอร์ส",
    reward: "TRI Crio Fisher's Clothes + TRI Crio Fisher's Chair + Terrmian Fishing Rod + Concentrated Magical Black Stone x20 + Concentrated Magical Black Gem x20 + Cron Stone x1,000 (Pass ยังมี Triple-Float Fishing Rod, [Event] Wise Housekeeper, Marvelous Balacs Lunchbox x3)",
    recommendedGear: "-",
    order: 6
  },

  // Hunting (85% - Wildspark final proof remaining)
  {
    id: "ol_hunting_chain",
    skillName: "ล่าสัตว์ (Hunting)",
    skillId: "hunting",
    title: "7. Matchlock + Butchering/Taxidermy แล้วไล่ล่าตามโซน",
    objective: "เรียน Matchlock + Butchering/Taxidermy แล้วล่า Giant Elk → Giant Boar → Giant Brown Bear → โซน Kamasylvia → Everfrost → O'dyllita",
    reward: "-",
    recommendedGear: "ปืนคาบศิลามาโนส (Manos Matchlock)",
    order: 7
  },
  {
    id: "ol_hunting_final_proof",
    skillName: "ล่าสัตว์ (Hunting)",
    skillId: "hunting",
    title: "8. Final Proof: Wildspark x100 (แก้จาก x200 หลัง patch 16 เม.ย. 2026)",
    objective: "เก็บ Wildspark x100 (byproduct จากการ butcher ซากมอนสเตอร์สาย Hunting) - ระวังไกด์เก่าที่ยังเขียน x200 อยู่, และ Feather Wolf ใน Kamasylvia ลดเหลือ 5 ตัวด้วย",
    reward: "-",
    recommendedGear: "-",
    order: 8
  },
  {
    id: "ol_hunting_reward",
    skillName: "ล่าสัตว์ (Hunting)",
    skillId: "hunting",
    title: "9. รางวัลจบคอร์ส Hunting",
    objective: "เคลม Academy Pass ให้ครบหลังจบคอร์ส",
    reward: "TRI Robeau Hunter's Clothes + TRI Robeau Hunting Bag + Concentrated Magical Black Stone x20 + Concentrated Magical Black Gem x20 + Cron Stone x1,000 (Pass ยังมี Breath of Narcion x2, Stella's Spirit Stone, Life Crystal)",
    recommendedGear: "-",
    order: 9
  },

  // Cooking
  {
    id: "ol_cooking_chain",
    skillName: "ทำอาหาร (Cooking)",
    skillId: "cooking",
    title: "10. Fredelles Herba - Cooking from the Heart",
    objective: "Production Node → ทำ Beer → Imperial Cuisine/Delivery → ทำส่วนประกอบ Calpheon Meal (Fish Fillet Salad → Meat Pasta → Milk Tea → รวมเป็น Calpheon Meal) - มี Shared Cooking Utensil ให้ใช้ฟรี (durability ไม่หมด ใช้พร้อมกันหลายคนได้ แต่ทำช้ากว่าอุปกรณ์ปกติ)",
    reward: "-",
    recommendedGear: "Shared Cooking Utensil (ฟรีใน Academy)",
    order: 10
  },
  {
    id: "ol_cooking_final_proof",
    skillName: "ทำอาหาร (Cooking)",
    skillId: "cooking",
    title: "11. Final Proof: Seafood Cron Meal",
    objective: "ทำ Seafood Cron Meal - เริ่มต้องใช้วัตถุดิบนอกคอร์สมากขึ้น",
    reward: "-",
    recommendedGear: "-",
    order: 11
  },
  {
    id: "ol_cooking_reward",
    skillName: "ทำอาหาร (Cooking)",
    skillId: "cooking",
    title: "12. รางวัลจบคอร์ส Cooking",
    objective: "เคลม Academy Pass ให้ครบหลังจบคอร์ส",
    reward: "TRI Roroju Cook's Clothes + TRI Roroju Ladle + TRI Dostter Steel Butcher Knife + Concentrated Magical Black Stone x20 + Concentrated Magical Black Gem x20 + Cron Stone x1,000 (Pass มี Supreme Cooking Utensil, Gujeolpan, Vital Crystal)",
    recommendedGear: "-",
    order: 12
  },

  // Alchemy
  {
    id: "ol_alchemy_chain",
    skillName: "แปรธาตุ (Alchemy)",
    skillId: "alchemy",
    title: "13. Production Node → Reagent → Elixir → Imperial Delivery",
    objective: "Clear Liquid Reagent → Pure Powder Reagent → Elixir of Life → Imperial Alchemy Delivery → Elixir of Swiftness → Worker's Elixir - มี Shared Alchemy Tool ฟรีเหมือน Cooking",
    reward: "-",
    recommendedGear: "Shared Alchemy Tool (ฟรีใน Academy)",
    order: 13
  },
  {
    id: "ol_alchemy_final_proof",
    skillName: "แปรธาตุ (Alchemy)",
    skillId: "alchemy",
    title: "14. Final Proof: Verdure Draught",
    objective: "ทำ Verdure Draught ให้สำเร็จ",
    reward: "-",
    recommendedGear: "-",
    order: 14
  },
  {
    id: "ol_alchemy_reward",
    skillName: "แปรธาตุ (Alchemy)",
    skillId: "alchemy",
    title: "15. รางวัลจบคอร์ส Alchemy",
    objective: "เคลม Academy Pass ให้ครบหลังจบคอร์ส",
    reward: "TRI Gorgath Alchemist's Clothes + TRI Gorgath Flask + TRI Dostter Steel Fluid Collector + Concentrated Magical Black Stone x20 + Concentrated Magical Black Gem x20 + Cron Stone x1,000 (Pass มี Supreme Alchemy Tool, Gujeolpan, Vital Crystal)",
    recommendedGear: "-",
    order: 15
  },

  // Processing
  {
    id: "ol_processing_chain",
    skillName: "แปรรูป (Processing)",
    skillId: "processing",
    title: "16. ลองแปรรูปหลักครบทุกแบบ",
    objective: "Grinding→Potato Flour, Shaking→Potato Dough, Chopping→Scantling/Timber, Drying→Cheese, Filtering→Purified Water, Heating→Iron Ingot",
    reward: "-",
    recommendedGear: "หินแปรรูปมาโนส",
    order: 16
  },
  {
    id: "ol_processing_final_proof",
    skillName: "แปรรูป (Processing)",
    skillId: "processing",
    title: "17. Final Proof: Gemstone Processing",
    objective: "ทดลอง Processing อัญมณีระดับสูงก่อนจบคอร์ส",
    reward: "-",
    recommendedGear: "-",
    order: 17
  },
  {
    id: "ol_processing_reward",
    skillName: "แปรรูป (Processing)",
    skillId: "processing",
    title: "18. รางวัลจบคอร์ส Processing",
    objective: "เคลม Academy Pass ให้ครบหลังจบคอร์ส",
    reward: "TRI Carta Craftsman's Clothes + TRI Techthon Processing Stone + Concentrated Magical Black Stone x20 + Concentrated Magical Black Gem x20 + Cron Stone x1,000 (Pass มี Sethra's Artifact - Processing Success Rate x2, Marvelous Eilton Meal x3)",
    recommendedGear: "-",
    order: 18
  },

  // Training
  {
    id: "ol_training_chain",
    skillName: "ฝึกสัตว์ (Training)",
    skillId: "training",
    title: "19. จับม้า → ผสมพันธุ์ → จัดส่งราชสำนัก",
    objective: "Wooden Horse → ของจับม้า → Tame Wild Horse → เลี้ยงม้า → Taming Assessment → Breeding (ผสมม้า) → Imperial Horse Delivery",
    reward: "-",
    recommendedGear: "แส้ม้ามาโนส",
    order: 19
  },
  {
    id: "ol_training_final_proof",
    skillName: "ฝึกสัตว์ (Training)",
    skillId: "training",
    title: "20. Final Proof: Tame Tier 7 Wild Horse",
    objective: "จับม้าป่า Tier 7 ให้สำเร็จ (ไม่ใช่แค่ม้าธรรมดา)",
    reward: "-",
    recommendedGear: "-",
    order: 20
  },
  {
    id: "ol_training_reward",
    skillName: "ฝึกสัตว์ (Training)",
    skillId: "training",
    title: "21. รางวัลจบคอร์ส Training",
    objective: "เคลม Academy Pass ให้ครบหลังจบคอร์ส",
    reward: "TRI Izaro Trainer's Clothes + TRI Izaro Riding Crop + Concentrated Magical Black Stone x20 + Concentrated Magical Black Gem x20 + Cron Stone x1,000 (Pass มี Extra Mount EXP Scroll 10hr x5, Unbridled Celerity Draught x5)",
    recommendedGear: "-",
    order: 21
  },

  // Farming
  {
    id: "ol_farming_chain",
    skillName: "เพาะปลูก (Farming)",
    skillId: "farming",
    title: "22. เช่ารั้ว → ปลูก → ผสมพันธุ์พืชพิเศษ (มีเวลารอจริง - แนะนำเปิดคอร์สนี้ไว้ก่อนแล้วปล่อยพืชโตระหว่างทำคอร์สอื่น)",
    objective: "เช่า Fence → วาง Fence → ระบบ Crop → Mole → Pruning/Pest → Worker ดูแล Farm → ปลูกพืช → Breed จนได้ Special Garlic Seed x3 → เอาไป Shaking กับ Mysterious Seed → ได้ Mysterious Garlic Seed → ปลูกอีกครั้ง → Breed เพื่อหา Fruit of Nature",
    reward: "-",
    recommendedGear: "-",
    order: 22
  },
  {
    id: "ol_farming_final_proof",
    skillName: "เพาะปลูก (Farming)",
    skillId: "farming",
    title: "23. Final Proof: Blush Leaf x300",
    objective: "เก็บ Blush Leaf x300 (byproduct จาก Plant Breeding)",
    reward: "-",
    recommendedGear: "-",
    order: 23
  },
  {
    id: "ol_farming_reward",
    skillName: "เพาะปลูก (Farming)",
    skillId: "farming",
    title: "24. รางวัลจบคอร์ส Farming (พิเศษกว่าคอร์สอื่น)",
    objective: "เคลม Academy Pass ให้ครบหลังจบคอร์ส",
    reward: "Choose Your Floramos Accessory Box x2 + Concentrated Magical Black Stone x20 + Concentrated Magical Black Gem x20 + Cron Stone x1,000 (Pass มี Choose Your Artisan Worker Box I/II, [Event] Wise Housekeeper x3)",
    recommendedGear: "-",
    order: 24
  },

  // Sailing/Barter (ONE combined sub-course, not two)
  {
    id: "ol_sailing_barter_chain",
    skillName: "การเดินเรือ/แลกเปลี่ยน (Sailing/Barter)",
    skillId: "sailing_barter",
    title: "25. Register Ship → เปิด Knowledge เกาะบาเลนอส → Barter → Ship Repair/Upgrade",
    objective: "รับเควสจาก Philaberto Falasi → Register Ship → แล่นเปิด Knowledge (Angie, Marlene, Balvege, Eveto, Mariveno, Duch, Luivano, Ephde Rune) → Barter x10 (ใช้ Epheria Sailboat หรือเรือใหญ่ ทำ Land Goods → Tier 1 Barter Goods) → Ship Repair → Sailor Basics → Sick Hekaru x1 → Young Sea Monster x3 → Ship Upgrade → Emergency Supply",
    reward: "-",
    recommendedGear: "Epheria Sailboat (ดู Ship Support II จาก Lodovica สำหรับ Ship License, เคลมได้ครั้งเดียวต่อ Family - เควสนี้แยกจาก reward เดิมของ 'Toward the Balenos Islands' หลัง patch เมษายน)",
    order: 25
  },
  {
    id: "ol_sailing_barter_final_proof",
    skillName: "การเดินเรือ/แลกเปลี่ยน (Sailing/Barter)",
    skillId: "sailing_barter",
    title: "26. Final Proof: Hekaru x1 ใน Margoria",
    objective: "ปราบ Hekaru x1 ในทะเล Margoria",
    reward: "-",
    recommendedGear: "-",
    order: 26
  },
  {
    id: "ol_sailing_barter_reward",
    skillName: "การเดินเรือ/แลกเปลี่ยน (Sailing/Barter)",
    skillId: "sailing_barter",
    title: "27. รางวัลจบคอร์ส Sailing/Barter",
    objective: "เคลม Academy Pass ให้ครบหลังจบคอร์ส",
    reward: "TRI Srulk Sailing Log + TRI Srulk Sailor's Clothes + Concentrated Magical Black Stone x20 + Concentrated Magical Black Gem x20 + Cron Stone x1,000 (Pass มี Crow Coin x1,000, Elixir of Regeneration x10, Crow's Trade Voucher x10)",
    recommendedGear: "-",
    order: 27
  },

  // Overall Life Skill Family Reward summary (all 9 courses)
  {
    id: "ol_family_reward_complete",
    skillName: "รางวัลรวมทั้ง 9 สาย (All Life Courses)",
    skillId: "family_reward",
    title: "28. เคลม Family Rewards - Life Skill (ครบทั้ง 9 สาย)",
    objective: "เคลียร์ Academy Pass ของทั้ง 9 สาย Life Skill ให้ครบ (Gathering, Fishing, Hunting, Cooking, Alchemy, Processing, Training, Farming, Sailing/Barter)",
    reward: "รวม: Cron Stone x9,000 + Concentrated Magical Black Stone x160 + Concentrated Magical Black Gem x160 (Gathering แจกโครงสร้างต่างจาก 8 คอร์สอื่น เลย 160 ไม่ใช่ 180) + เครื่องมือ/ชุด TRI ครบทุกสาย + Floramos Accessory Box x2 + Life EXP จำนวนมาก (6 สาย Gathering/Fishing/Hunting/Cooking/Alchemy/Processing ได้ประมาณ Artisan 1 จาก Course, Artisan 5 จาก General Pass, Master 1 ถ้ามี Premium Pass; ส่วน Training/Farming/Sailing-Barter ได้ Skilled 1 → Skilled 5 → Professional 1 ตามลำดับ)",
    recommendedGear: "-",
    order: 28
  }
];
