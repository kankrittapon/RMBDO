import { metaFreshness, MetaFreshness } from '@/data/patches/meta';

export class MetaService {
  public static getMeta(): MetaFreshness {
    return metaFreshness;
  }
}
