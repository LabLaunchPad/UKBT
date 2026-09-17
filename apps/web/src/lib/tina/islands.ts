import type { IslandConfig } from '@tinacms/astro/experimental';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { homepage } from '../../content/homepage-data';
import { tinaHomepage } from './loaders';

import ClubIntroComponent from '../../components/ClubIntro.astro';
import HeroComponent from '../../components/Hero.astro';

export const islands = {
  hero: {
    fetch: async (_req: Request, _params: URLSearchParams) => {
      return { ...tinaHomepage, social: homepage.social };
    },
    component: HeroComponent as unknown as AstroComponentFactory,
    wrapper: { tag: 'section' },
    propsFromData: (data: unknown, _params: URLSearchParams) => {
      const d = data as Record<string, unknown>;
      return {
        taglineShort: d.tagline,
        eyebrow: d.eyebrow,
        social: d.social,
        secondaryCta: d.secondaryCtaLabel
          ? { label: d.secondaryCtaLabel, href: d.secondaryCtaLink }
          : null,
      };
    },
  },
  aboutSection: {
    fetch: async (_req: Request, _params: URLSearchParams) => {
      return tinaHomepage;
    },
    component: ClubIntroComponent as unknown as AstroComponentFactory,
    wrapper: { tag: 'section' },
    propsFromData: (data: unknown, _params: URLSearchParams) => {
      const d = data as Record<string, unknown>;
      // REM-004: fallbacks are truth-controlled, not hard-coded factual
      // assertions — homepage.* below are gated @ukbt/truth values.
      return {
        lede: d.clubIntroLede || homepage.taglineShort,
        founded: homepage.founded,
      };
    },
  },
} satisfies Record<string, IslandConfig>;
