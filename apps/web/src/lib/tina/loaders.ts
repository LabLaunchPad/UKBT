import { z } from 'zod';
import faqData from '../../../content/faq/faq.json' with { type: 'json' };
import homepageData from '../../../content/homepage/homepage.json' with {
  type: 'json',
};
import siteData from '../../../content/site/siteSettings.json' with {
  type: 'json',
};

const HomepageSchema = z.object({
  eyebrow: z.string().optional(),
  headline: z.string(),
  tagline: z.string(),
  metaDescription: z.string().optional(),
  heroImage: z.string().optional(),
  primaryCtaLabel: z.string(),
  primaryCtaLink: z.string(),
  secondaryCtaLabel: z.string().optional(),
  secondaryCtaLink: z.string().optional(),
  clubIntroLede: z.string(),
  whyChooseUs: z.array(z.object({ title: z.string(), body: z.string() })),
});

const FaqItemSchema = z.object({
  question: z.string(),
  answer: z.unknown(),
  visible: z.boolean(),
});

const FaqSchema = z.object({
  pageHeading: z.string(),
  pageEyebrow: z.string().optional(),
  items: z.array(FaqItemSchema),
});

const SiteSettingsSchema = z.object({
  siteTaglineShort: z.string(),
  footerTagline: z.string().optional(),
  contact: z.object({
    email: z.string(),
    phoneDisplay: z.string(),
    phoneHref: z.string(),
  }),
  social: z.array(z.object({ platform: z.string(), url: z.string() })),
  socialCard: z.string().optional(),
});

export type HomepageTina = z.infer<typeof HomepageSchema>;
export type FaqItemTina = z.infer<typeof FaqItemSchema>;
export type FaqTina = z.infer<typeof FaqSchema>;
export type SiteSettingsTina = z.infer<typeof SiteSettingsSchema>;

export const tinaHomepage = HomepageSchema.parse(homepageData);
export const tinaFaq = FaqSchema.parse(faqData);
export const tinaSite = SiteSettingsSchema.parse(siteData);
