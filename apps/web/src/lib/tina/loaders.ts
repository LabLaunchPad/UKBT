import { z } from 'zod';
import faqData from '../../../content/faq/faq.json' with { type: 'json' };
import homepageData from '../../../content/homepage/homepage.json' with {
  type: 'json',
};
import siteData from '../../../content/site/siteSettings.json' with {
  type: 'json',
};
// REM-003: CMS-controlled navigation values are validated against the URL
// allowlist at build time (fail-closed: a violation throws and breaks the
// build). UI-side Tina checks are client-only and never re-enforced here.
import {
  isEmailValue,
  isHttpsUrl,
  isSiteRelativeUrl,
  isTelUrl,
} from '../allowed-urls';

const HomepageSchema = z.object({
  eyebrow: z.string().optional(),
  headline: z.string(),
  tagline: z.string(),
  metaDescription: z.string().optional(),
  heroImage: z.string().optional(),
  primaryCtaLabel: z.string(),
  primaryCtaLink: z.string().refine(isSiteRelativeUrl, {
    message: 'primaryCtaLink must be a site-relative URL',
  }),
  secondaryCtaLabel: z.string().optional(),
  secondaryCtaLink: z
    .string()
    .optional()
    .refine((v) => v === undefined || isSiteRelativeUrl(v), {
      message: 'secondaryCtaLink must be a site-relative URL',
    }),
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
    email: z.string().refine(isEmailValue, {
      message: 'contact.email must be a mailbox address',
    }),
    phoneDisplay: z.string(),
    phoneHref: z
      .string()
      .refine(isTelUrl, { message: 'contact.phoneHref must be a tel: URL' }),
  }),
  social: z.array(
    z.object({
      platform: z.string(),
      url: z
        .string()
        .refine(isHttpsUrl, { message: 'social.url must be an https: URL' }),
    }),
  ),
  socialCard: z.string().optional(),
});

export type HomepageTina = z.infer<typeof HomepageSchema>;
export type FaqItemTina = z.infer<typeof FaqItemSchema>;
export type FaqTina = z.infer<typeof FaqSchema>;
export type SiteSettingsTina = z.infer<typeof SiteSettingsSchema>;

export const tinaHomepage = HomepageSchema.parse(homepageData);
export const tinaFaq = FaqSchema.parse(faqData);
export const tinaSite = SiteSettingsSchema.parse(siteData);
