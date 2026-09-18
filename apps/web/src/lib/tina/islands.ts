import client from '@tina-client';
import { requestWithMetadata } from '@tinacms/astro';
import type { IslandConfig } from '@tinacms/astro/experimental';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import { homepage } from '../../content/homepage-data';
import { tinaHomepage } from './loaders';

import ClubIntroComponent from '../../components/ClubIntro.astro';
import HeroComponent from '../../components/Hero.astro';

// Visual-editing data source (official @tinacms/astro static-site flow):
// the island fetch resolves the CMS document through requestWithMetadata,
// which (a) registers the admin form payload during bridge priming and
// (b) overlays the editor's unsaved values onto the query result on every
// re-render POST. If the TinaCloud content API is unreachable, fall back
// to the build-validated local JSON so the preview still renders (without
// a form payload) instead of failing the island.
async function fetchHomepageDoc(): Promise<Record<string, unknown>> {
  try {
    const res = await requestWithMetadata(
      client.queries.homepage({ relativePath: 'homepage.json' }),
    );
    const doc = (res?.data as { homepage?: Record<string, unknown> })?.homepage;
    if (doc && Object.keys(doc).length > 0) return doc;
  } catch {
    // unreachable via requestWithMetadata's own catch — kept as a
    // belt-and-braces guard for unexpected shapes.
  }
  return tinaHomepage as unknown as Record<string, unknown>;
}

export const islands = {
  hero: {
    fetch: fetchHomepageDoc,
    component: HeroComponent as unknown as AstroComponentFactory,
    wrapper: { tag: 'div', className: 'ukbt-hero-island' },
    propsFromData: (data: unknown, _params: URLSearchParams) => {
      const d = data as Record<string, unknown>;
      // Mirrors the static hero mapping in pages/index.astro exactly:
      // an island re-render must receive the same props as the static
      // build, or a Tina save silently reverts the hero to defaults
      // (headline, primary CTA, hero image — audit 2026-09-18).
      // taglineShort/social come from the gated site-settings import —
      // the homepage collection does not carry them.
      return {
        taglineShort: homepage.taglineShort,
        eyebrow: d.eyebrow || 'UK Bangla Tigers Cricket Club',
        headline: d.headline,
        social: homepage.social,
        primaryCtaLabel: d.primaryCtaLabel,
        primaryCtaLink: d.primaryCtaLink,
        secondaryCta: d.secondaryCtaLabel
          ? {
              label: d.secondaryCtaLabel,
              href: d.secondaryCtaLink || '/tournaments/',
            }
          : undefined,
        heroImage: d.heroImage,
      };
    },
  },
  aboutSection: {
    fetch: fetchHomepageDoc,
    component: ClubIntroComponent as unknown as AstroComponentFactory,
    wrapper: { tag: 'div', className: 'ukbt-club-intro-island' },
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
