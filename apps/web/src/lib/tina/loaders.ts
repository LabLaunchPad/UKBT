import { z } from 'zod';
import faqData from '../../../content/faq/faq.json' with { type: 'json' };
import homepageData from '../../../content/homepage/homepage.json' with {
  type: 'json',
};
import siteData from '../../../content/site/siteSettings.json' with {
  type: 'json',
};
import {
  isEmailValue,
  isHttpsUrl,
  isSiteRelativeUrl,
  isTelUrl,
} from '../allowed-urls';

export const HomepageSchema = z.object({
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
  clubIntroLede: z.string().optional(),
  whyChooseUs: z
    .array(z.object({ title: z.string(), body: z.string() }))
    .optional(),
});

const FaqItemSchema = z.object({
  question: z.string(),
  answer: z.unknown(),
  visible: z.boolean(),
});

export const FaqSchema = z.object({
  pageHeading: z.string(),
  pageEyebrow: z.string().optional(),
  items: z.array(FaqItemSchema).optional(),
});

// About page (apps/web/content/about/about.json). Mirrors tina/config.ts:
// only heroSubline is required; everything else is optional. Used by the
// aboutHero/aboutStory/aboutLeadership islands via validateWithPreserve.
export const AboutSchema = z.object({
  heroSubline: z.string(),
  storyBody: z.unknown().optional(),
  aboutImage: z.string().optional(),
  aboutImageAlt: z.string().optional(),
  leadershipIntro: z.string().optional(),
  managementImage: z.string().optional(),
  managementImageAlt: z.string().optional(),
});

export const SiteSettingsSchema = z.object({
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
export type AboutTina = z.infer<typeof AboutSchema>;
export type SiteSettingsTina = z.infer<typeof SiteSettingsSchema>;

export function validateWithPreserve<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
):
  | { success: true; data: T; original: unknown }
  | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data, original: data };
  }
  return { success: false, error: result.error };
}

const _tinaHomepage = HomepageSchema.safeParse(homepageData);
const _tinaFaq = FaqSchema.safeParse(faqData);
const _tinaSite = SiteSettingsSchema.safeParse(siteData);

export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  name: string,
): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  throw new Error(`${name} data validation failed`);
}

export const tinaHomepage = validateOrThrow(
  HomepageSchema,
  homepageData,
  'Homepage',
);
export const tinaFaq = validateOrThrow(FaqSchema, faqData, 'FAQ');
export const tinaSite = validateOrThrow(
  SiteSettingsSchema,
  siteData,
  'Site settings',
);
