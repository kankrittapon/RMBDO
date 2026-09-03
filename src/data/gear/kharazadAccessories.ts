export interface KharazadPieceItem {
  id: string;
  title: string;
  category: 'NECKLACE' | 'BELT' | 'RING' | 'EARRING' | 'ENHANCEMENT';
  objective: string;
  reward: string;
  isImportantReward: boolean;
  importantNote?: string;
  order: number;
}

// Source: BDFoundry "Hyperboost Beginner/Returning Player Guide"
// (https://www.blackdesertfoundry.com/new-player-guide/), fetched 2026-09-03.
// All six accessory pieces come from Alustin's Support quests in Velia, each
// needing the same materials (Essence of Dawn x10 + Sharp Black Crystal
// Shard x50). Previously this list existed only as a design-system page
// spec (design-system/pages/kharazad.md) with no actual data or tracking -
// same gap as the Slumbering Origin armor set.
export const kharazadPiecesList: KharazadPieceItem[] = [
  {
    id: "kh_necklace",
    title: "1. สร้อยคอคาราซัด PEN (Kharazad Necklace)",
    category: "NECKLACE",
    objective: "รับเควส [Alustin's Support] PEN (V) Kharazad Necklace ที่ Alustin ใน Velia",
    reward: "PEN (V) Kharazad Necklace",
    isImportantReward: true,
    importantNote: "ต้องการ Essence of Dawn x10 + Sharp Black Crystal Shard x50",
    order: 1
  },
  {
    id: "kh_belt",
    title: "2. เข็มขัดคาราซัด PEN (Kharazad Belt)",
    category: "BELT",
    objective: "รับเควส [Alustin's Support] PEN (V) Kharazad's Belt ที่ Alustin ใน Velia",
    reward: "PEN (V) Kharazad Belt",
    isImportantReward: true,
    importantNote: "ต้องการ Essence of Dawn x10 + Sharp Black Crystal Shard x50",
    order: 2
  },
  {
    id: "kh_ring_1",
    title: "3. แหวนคาราซัด PEN วงที่ 1 (Kharazad Ring I)",
    category: "RING",
    objective: "รับเควส [Alustin's Support] PEN (V) Kharazad Ring I ที่ Alustin ใน Velia",
    reward: "PEN (V) Kharazad Ring I",
    isImportantReward: true,
    importantNote: "ต้องการ Essence of Dawn x10 + Sharp Black Crystal Shard x50",
    order: 3
  },
  {
    id: "kh_ring_2",
    title: "4. แหวนคาราซัด PEN วงที่ 2 (Kharazad Ring II)",
    category: "RING",
    objective: "รับเควส [Alustin's Support] PEN (V) Kharazad Ring II ที่ Alustin ใน Velia",
    reward: "PEN (V) Kharazad Ring II",
    isImportantReward: true,
    importantNote: "ต้องการ Essence of Dawn x10 + Sharp Black Crystal Shard x50",
    order: 4
  },
  {
    id: "kh_earring_1",
    title: "5. ต่างหูคาราซัด PEN ข้างที่ 1 (Kharazad Earring I)",
    category: "EARRING",
    objective: "รับเควส [Alustin's Support] PEN (V) Kharazad Earrings I ที่ Alustin ใน Velia",
    reward: "PEN (V) Kharazad Earring I",
    isImportantReward: true,
    importantNote: "ต้องการ Essence of Dawn x10 + Sharp Black Crystal Shard x50",
    order: 5
  },
  {
    id: "kh_earring_2",
    title: "6. ต่างหูคาราซัด PEN ข้างที่ 2 (Kharazad Earring II)",
    category: "EARRING",
    objective: "รับเควส [Alustin's Support] PEN (V) Kharazad Earrings II ที่ Alustin ใน Velia",
    reward: "PEN (V) Kharazad Earring II",
    isImportantReward: true,
    importantNote: "ต้องการ Essence of Dawn x10 + Sharp Black Crystal Shard x50",
    order: 6
  },
  {
    id: "kh_oct_upgrade",
    title: "7. อัปเกรดเป็น OCT ด้วยหินดำโบราณ (OCT Upgrade)",
    category: "ENHANCEMENT",
    objective: "ทำ Adventure Log 'Emma Bartali's Journal' ให้จบเพื่อรับ Ancient Black Stone x2 แล้วใช้กับสร้อยคอ+เข็มขัด",
    reward: "Ancient Black Stone x2 (พอสำหรับอัปเกรด 2 ชิ้นเป็น OCT)",
    isImportantReward: true,
    importantNote: "แนะนำให้ใช้กับสร้อยคอและเข็มขัดก่อน (ตามคำแนะนำใน BDFoundry guide) เพราะมีผลกระทบต่อ AP/DP รวมมากที่สุด",
    order: 7
  }
];
