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
      return {
        lede:
          d.clubIntroLede ||
          'A registered cricket club, competing across international tournaments since 2020.',
        founded: '2020',
      };
    },
  },
} satisfies Record<string, IslandConfig>;
