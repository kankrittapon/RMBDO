export interface MetaFreshness {
  region: string;
  livePatch: string;
  verifiedAt: string;
  confidence: 'HIGH' | 'MEDIUM' | 'EXPERIMENTAL';
  globalLabNote?: string;
  serverWorkspace: string;
}

export const metaFreshness: MetaFreshness = {
  region: "Asia / TH-SEA",
  livePatch: "2026-08-27",
  verifiedAt: "2026-09-01",
  confidence: "HIGH",
  globalLabNote: "Inner Edania & Sovereign Sub-weapon expansion verified on Global Lab + Live TH-SEA roadmap sync",
  serverWorkspace: "n8n-zort"
};
