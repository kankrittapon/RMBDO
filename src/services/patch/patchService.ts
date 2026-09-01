import { metaFreshness } from '@/data/patches/meta';

export class PatchService {
  public static getPatchNotes() {
    return {
      patchVersion: metaFreshness.livePatch,
      verifiedDate: metaFreshness.verifiedAt,
      region: metaFreshness.region,
      notes: [
        "Sovereign Weapon forge synthesis verified (2x PEN BS / 1x PEN BS + Flame)",
        "Kharazad accessory non-destructive enhancement transition active",
        "Inner Edania high-tier monster zones added to optimal grind matrix"
      ]
    };
  }
}
