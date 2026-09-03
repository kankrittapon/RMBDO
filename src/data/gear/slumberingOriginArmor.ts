export interface SlumberingOriginPieceItem {
  id: string;
  title: string;
  category: 'HELMET' | 'ARMOR' | 'GLOVES' | 'SHOES';
  objective: string;
  reward: string;
  isImportantReward: boolean;
  importantNote?: string;
  order: number;
}

// Source: BDFoundry "Hyperboost Beginner/Returning Player Guide"
// (https://www.blackdesertfoundry.com/new-player-guide/), fetched 2026-09-03.
// All four pieces come from Black Spirit Support quests - a Season/Olvia
// graduate does NOT need to farm these bosses manually; the quest chain
// hands them a scaled/guaranteed kill. Previously this armor set had zero
// data anywhere in RMBDO despite being one of the three endgame gear goals
// (Sovereign weapons / Slumbering Origin armor / Kharazad accessories) the
// whole Hyperboost+Olvia path leads to.
export const slumberingOriginPiecesList: SlumberingOriginPieceItem[] = [
  {
    id: "so_labreska_helmet",
    title: "1. หมวกลาเบรสก้า (Labreska's Helmet)",
    category: "HELMET",
    objective: "รับเควส [Black Spirit Support] Golden Pig King Calamity 8 แล้วปราบ Golden Pig King Calamity 8",
    reward: "Labreska's Helmet (Slumbering Origin)",
    isImportantReward: true,
    importantNote: "ต้องการ AP 305+ และต้องเคลียร์เควส '[Golden Pig King] Truth of the Gold Mine' ก่อน",
    order: 1
  },
  {
    id: "so_fallen_god_armor",
    title: "2. เกราะเทพผู้ล่วงลับ (Fallen God's Armor)",
    category: "ARMOR",
    objective: "รับเควส [Black Spirit Support] Sangoon Calamity 8 แล้วปราบ Sangoon Calamity 8",
    reward: "Fallen God's Armor (Slumbering Origin)",
    isImportantReward: true,
    importantNote: "ต้องการ AP 310+ และเคลียร์เควสที่เกี่ยวข้องกับซังกุนก่อน",
    order: 2
  },
  {
    id: "so_dahn_gloves",
    title: "3. ถุงมือดาห์น (Dahn's Gloves)",
    category: "GLOVES",
    objective: "รับเควส [Black Spirit Support] Gumiho Calamity 8 แล้วปราบ Gumiho Calamity 8",
    reward: "Dahn's Gloves (Slumbering Origin) - เลือกออปชั่น Damage Reduction (สีฟ้า)",
    isImportantReward: true,
    importantNote: "ต้องการ AP 315+ และเคลียร์เควส '[Gumiho] Back to Dalbeol' ก่อน — ตอนเลือกออปชั่นรางวัล ต้องเลือกฝั่ง Damage Reduction (สีฟ้า) ไม่ใช่ฝั่ง AP",
    order: 3
  },
  {
    id: "so_ator_shoes",
    title: "4. รองเท้าอาทอร์ (Ator's Shoes)",
    category: "SHOES",
    objective: "รับเควส [Black Spirit Support] Golden Pig King Calamity 9 แล้วปราบ Golden Pig King Calamity 9",
    reward: "Ator's Shoes (Slumbering Origin) - เลือกออปชั่น Damage Reduction (สีฟ้า)",
    isImportantReward: true,
    importantNote: "ต้องการ AP 315+ — เหมือนถุงมือดาห์น ต้องเลือกออปชั่น Damage Reduction (สีฟ้า) ตอนรับรางวัล",
    order: 4
  }
];
