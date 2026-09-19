import type { IslandConfig } from '@tinacms/astro/experimental';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import ClubIntroComponent from '../../components/ClubIntro.astro';
import FAQSection from '../../components/FAQSection.astro';
import HeroComponent from '../../components/Hero.astro';
import WhyChooseUsComponent from '../../components/WhyChooseUs.astro';
import { homepage } from '../../content/homepage-data';
import { getAbout, getFaq, getHomepage } from './data';
import {
  FaqSchema,
  HomepageSchema,
  tinaFaq as tinaFaqLocal,
  validateWithPreserve,
} from './loaders';

async function fetchHomepageDoc(): Promise<Record<string, unknown>> {
  const res = await getHomepage();
  const doc = (
    res?.data as unknown as { homepage?: Record<string, unknown> | undefined }
  )?.homepage;
  if (doc && Object.keys(doc).length > 0) {
    const validated = validateWithPreserve(HomepageSchema, doc);
    if (validated.success) {
      return validated.original as Record<string, unknown>;
    }
    return doc;
  }
  throw new Error('Failed to fetch homepage data for island');
}

async function fetchAboutDoc(): Promise<Record<string, unknown>> {
  const res = await getAbout();
  const doc = (
    res?.data as unknown as { about?: Record<string, unknown> | undefined }
  )?.about;
  if (doc && Object.keys(doc).length > 0) {
    return doc;
  }
  throw new Error('Failed to fetch about data for island');
}

async function fetchFaqDoc(): Promise<Record<string, unknown>> {
  const res = await getFaq();
  const doc = (
    res?.data as unknown as { faq?: Record<string, unknown> | undefined }
  )?.faq;
  if (doc && Object.keys(doc).length > 0) {
    const validated = validateWithPreserve(FaqSchema, doc);
    if (validated.success) {
      return validated.original as Record<string, unknown>;
    }
    return doc;
  }
  // Fallback to committed JSON when TinaCloud has no indexed data yet
  // (first deploy, unauthenticated build, or empty branch index).
  return tinaFaqLocal as unknown as Record<string, unknown>;
}

export const islands = {
  hero: {
    fetch: fetchHomepageDoc,
    component: HeroComponent as unknown as AstroComponentFactory,
    wrapper: { tag: 'div', className: 'ukbt-hero-island' },
    propsFromData: (data: unknown, _params: URLSearchParams) => {
      const d = data as Record<string, unknown>;
      return {
        taglineShort: homepage.taglineShort,
        tagline: (d.tagline as string) || homepage.taglineShort,
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
        data: d,
      };
    },
  },
  aboutSection: {
    fetch: fetchAboutDoc,
    component: ClubIntroComponent as unknown as AstroComponentFactory,
    wrapper: { tag: 'div', className: 'ukbt-club-intro-island' },
    propsFromData: (data: unknown, _params: URLSearchParams) => {
      const d = data as Record<string, unknown>;
      return {
        lede: d.heroSubline || homepage.taglineShort,
        founded: homepage.founded,
        data: d,
      };
    },
  },
  faq: {
    fetch: fetchFaqDoc,
    component: FAQSection as unknown as AstroComponentFactory,
    wrapper: { tag: 'div', className: 'ukbt-faq-island' },
    propsFromData: (data: unknown, _params: URLSearchParams) => {
      const d = data as Record<string, unknown>;
      return {
        items: d.items || [],
      };
    },
  },
  whyChooseUs: {
    fetch: fetchHomepageDoc,
    component: WhyChooseUsComponent as unknown as AstroComponentFactory,
    wrapper: { tag: 'div', className: 'ukbt-chooseus' },
    propsFromData: (data: unknown, _params: URLSearchParams) => {
      const d = data as Record<string, unknown>;
      return {
        reasons: d.whyChooseUs || [],
        data: d,
      };
    },
  },
} satisfies Record<string, IslandConfig>;
