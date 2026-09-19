import type { IslandConfig } from '@tinacms/astro/experimental';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import AboutStory from '../../components/AboutStory.astro';
import ClubIntroComponent from '../../components/ClubIntro.astro';
import FAQSection from '../../components/FAQSection.astro';
import HeroComponent from '../../components/Hero.astro';
import LeadershipGrid from '../../components/LeadershipGrid.astro';
import PageBanner from '../../components/PageBanner.astro';
import WhyChooseUsComponent from '../../components/WhyChooseUs.astro';
import { about as aboutTruth } from '../../content/about-data';
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
    // Homepage ClubIntro — owns homepage.clubIntroLede (NOT the about doc).
    // ponytail: single-purpose fetch; about page uses aboutHero/aboutStory/aboutLeadership.
    fetch: fetchHomepageDoc,
    component: ClubIntroComponent as unknown as AstroComponentFactory,
    wrapper: { tag: 'div', className: 'ukbt-club-intro-island' },
    propsFromData: (data: unknown, _params: URLSearchParams) => {
      const d = data as Record<string, unknown>;
      return {
        lede: d.clubIntroLede || homepage.taglineShort,
        founded: homepage.founded,
        data: d,
      };
    },
  },
  aboutHero: {
    // About page banner — owns about.heroSubline.
    fetch: fetchAboutDoc,
    component: PageBanner as unknown as AstroComponentFactory,
    wrapper: { tag: 'div', className: 'ukbt-about-hero-island' },
    propsFromData: (data: unknown, _params: URLSearchParams) => {
      const d = data as Record<string, unknown>;
      return {
        title: 'About Us',
        crumbs: [{ label: 'Home', href: '/' }, { label: 'About Us' }],
        lede: d.heroSubline,
        background: {
          src: '/media/gallery-06.webp',
          alt: 'UK Bangla Tigers squad celebrating with a trophy',
          width: 1400,
          height: 933,
        },
        data: d,
      };
    },
  },
  aboutStory: {
    fetch: fetchAboutDoc,
    component: AboutStory as unknown as AstroComponentFactory,
    wrapper: { tag: 'div', className: 'ukbt-about-story-island' },
    propsFromData: (data: unknown, _params: URLSearchParams) => {
      const d = data as Record<string, unknown>;
      return {
        // ponytail: truth-gated statics pass through; only storyBody is Tina-owned.
        paragraphs: aboutTruth.storyParagraphs,
        stats: [
          { value: aboutTruth.founded, label: 'Founded' },
          { value: aboutTruth.stats.players, label: 'Players' },
          {
            value: aboutTruth.stats.tournaments,
            label: 'International Tournaments',
          },
        ],
        content: d.storyBody,
        data: d,
      };
    },
  },
  aboutLeadership: {
    fetch: fetchAboutDoc,
    component: LeadershipGrid as unknown as AstroComponentFactory,
    wrapper: { tag: 'div', className: 'ukbt-about-leadership-island' },
    propsFromData: (data: unknown, _params: URLSearchParams) => {
      const d = data as Record<string, unknown>;
      return {
        // ponytail: roster is truth-gated; only leadershipIntro is Tina-owned.
        leaders: aboutTruth.leaders,
        intro: d.leadershipIntro,
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
        pageHeading: d.pageHeading,
        pageEyebrow: d.pageEyebrow,
        data: d,
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
