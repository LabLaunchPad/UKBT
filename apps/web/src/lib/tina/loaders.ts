import aboutData from '../../../content/about/about.json' with { type: 'json' };
import faqData from '../../../content/faq/faq.json' with { type: 'json' };
import homepageData from '../../../content/homepage/homepage.json' with {
  type: 'json',
};
import siteData from '../../../content/site/siteSettings.json' with {
  type: 'json',
};

export interface HomepageTina {
  eyebrow: string;
  headline: string;
  tagline: string;
  heroImage?: string;
  primaryCtaLabel: string;
  primaryCtaLink: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
  clubIntroLede: string;
  whyChooseUs: { title: string; body: string }[];
}

export interface FaqItemTina {
  question: string;
  answer: unknown;
  visible: boolean;
}

export interface FaqTina {
  pageHeading: string;
  pageEyebrow?: string;
  items: FaqItemTina[];
}

export const tinaHomepage = homepageData as unknown as HomepageTina;
export const tinaAbout = aboutData as unknown as {
  heroSubline: string;
  storyBody: unknown;
  aboutImage?: string;
  aboutImageAlt?: string;
  leadershipIntro?: string;
  managementImage?: string;
  managementImageAlt?: string;
};
export const tinaFaq = faqData as unknown as FaqTina;
export const tinaSite = siteData as unknown as {
  siteTaglineShort: string;
  footerTagline?: string;
  contact: { email: string; phoneDisplay: string; phoneHref: string };
  social: { platform: string; url: string }[];
  socialCard?: string;
};
