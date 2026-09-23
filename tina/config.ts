import { defineConfig } from 'tinacms';

export default defineConfig({
  branch: process.env.TINA_BRANCH || process.env.GITHUB_BRANCH || process.env.WORKERS_CI_BRANCH || process.env.CF_PAGES_BRANCH || 'main',
  // PUBLIC_TINA_CLIENT_ID is the Astro-convention name; TINA_CLIENT_ID is
  // accepted as a fallback because Tina's own docs use that name and a
  // mismatched variable name otherwise fails closed at build time.
  clientId: process.env.PUBLIC_TINA_CLIENT_ID || process.env.TINA_CLIENT_ID || null,
  token: process.env.TINA_TOKEN || null,
  build: {
    outputFolder: 'admin',
    publicFolder: 'apps/web/public',
  },
  media: {
    tina: {
      publicFolder: 'apps/web/public',
      mediaRoot: 'media',
    },
  },
  // Search disabled by design — build uses --skip-search-index
  // (package.json:18, ci.yml:272). Do not provision TINA_SEARCH_TOKEN
  // unless search is re-enabled per https://tina.io/docs/reference/search/overview
  search: {
    tina: {
      indexerToken: process.env.TINA_SEARCH_TOKEN || undefined,
      stopwordLanguages: ['eng'],
    },
    indexBatchSize: 100,
    maxSearchIndexFieldLength: 100,
  },
  schema: {
    collections: [
      {
        name: 'homepage',
        label: 'Homepage',
        path: 'apps/web/content/homepage',
        format: 'json',
        ui: {
          allowedActions: { create: false, delete: false },
          router: () => '/',
        },
        fields: [
          {
            type: 'string',
            name: 'eyebrow',
            label: 'Eyebrow — small text above headline',
            description: 'Appears above the large headline. Example: UK Bangla Tigers Cricket Club',
            required: false,
            ui: { validate: (v: string) => (v && v.length > 60 ? 'Keep under 60 characters' : undefined) },
          },
          {
            type: 'string',
            name: 'headline',
            label: 'Headline',
            description: 'Large hero headline. Use \\n for a line break. Keep concise and impactful.',
            required: true,
            isTitle: true,
            ui: {
              component: 'textarea',
              validate: (v: string) => {
                if (!v || !v.trim()) return 'Headline is required';
                if (v.length > 80) return 'Keep under 80 characters';
              },
            },
          },
          {
            type: 'string',
            name: 'tagline',
            label: 'Supporting text',
            description: 'Short supporting line under the headline. Shown under the hero. Keep to one sentence.',
            required: true,
            ui: {
              component: 'textarea',
              validate: (v: string) => {
                if (!v) return 'Supporting text is required';
                if (v.length > 120) return 'Keep under 120 characters';
              },
            },
          },
          {
            type: 'string',
            name: 'metaDescription',
            label: 'Homepage meta description (SEO)',
            description: 'Search-result snippet for the homepage. Factual club summary, 120-160 characters.',
            required: false,
            ui: {
              component: 'textarea',
              validate: (v: string) => {
                if (v && (v.length < 120 || v.length > 160)) return 'Keep 120-160 characters';
              },
            },
          },
          {
            type: 'image',
            name: 'heroImage',
            label: 'Hero background image',
            description: 'Team photo shown behind hero text. Use a wide, high-quality image (min 1080px wide).',
            required: false,
          },
          {
            type: 'string',
            name: 'primaryCtaLabel',
            label: 'Primary button — label',
            description: 'Text on the main hero button. Example: Join the Club',
            required: true,
            ui: { validate: (v: string) => (!v ? 'Required' : v.length > 24 ? 'Keep under 24 characters' : undefined) },
          },
          {
            type: 'string',
            name: 'primaryCtaLink',
            label: 'Primary button — link',
            description: 'Where the button goes. Must be a site page like /join or /contact',
            required: true,
            ui: {
              validate: (v: string) => {
                if (!v) return 'Required';
                if (!v.startsWith('/')) return 'Must start with /';
                if (/^javascript:/i.test(v)) return 'Invalid link';
              },
            },
          },
          {
            type: 'string',
            name: 'secondaryCtaLabel',
            label: 'Secondary button — label',
            description: 'Second hero button. Optional — leave blank to hide.',
            required: false,
          },
          {
            type: 'string',
            name: 'secondaryCtaLink',
            label: 'Secondary button — link',
            description: 'Where the second button goes. Required if label is set.',
            required: false,
            ui: {
              validate: (v: string, all: Record<string, unknown>) => {
                if (all['secondaryCtaLabel'] && !v) return 'Add a link for the secondary button';
                if (v && !String(v).startsWith('/')) return 'Must start with /';
              },
            },
          },
          {
            type: 'string',
            name: 'clubIntroLede',
            label: 'About teaser — intro line',
            description: 'Short paragraph on homepage that introduces the club. Under hero, before stats.',
            required: false,
            ui: { component: 'textarea' },
          },
          {
            type: 'object',
            name: 'whyChooseUs',
            label: 'Why Choose Us — reasons',
            description: 'Four cards under Club Intro. Keep titles short, bodies 1–2 sentences.',
            list: true,
            ui: { itemProps: (it: Record<string, string>) => ({ label: it?.title || 'Reason' }) },
            fields: [
              { type: 'string', name: 'title', label: 'Title', required: true },
              { type: 'string', name: 'body', label: 'Body', required: true, ui: { component: 'textarea' } },
            ],
          },
        ],
      },
      {
        name: 'about',
        label: 'About page',
        path: 'apps/web/content/about',
        format: 'json',
        ui: { allowedActions: { create: false, delete: false }, router: () => '/about' },
        fields: [
          {
            type: 'string',
            name: 'heroSubline',
            label: 'Hero subline',
            description: 'Large subtitle under Page banner on About. Example: Building a legacy of cricket excellence…',
            required: true,
            ui: { component: 'textarea' },
          },
          {
            type: 'rich-text',
            name: 'storyBody',
            label: 'Club story — paragraphs',
            description: 'Main story paragraphs. Keep 2–3 short paragraphs; avoid inventing facts.',
            isBody: false,
          },
          {
            type: 'image',
            name: 'aboutImage',
            label: 'About page — feature image',
            description: 'Image shown alongside the story. Use 1000×1200 or similar portrait.',
            required: false,
          },
          {
            type: 'string',
            name: 'aboutImageAlt',
            label: 'Feature image — alternative text',
            description: 'Describe the image for screen readers. Required if image is set.',
            required: false,
            ui: {
              validate: (v: string, all: Record<string, unknown>) => {
                if (all['aboutImage'] && !v) return 'Add alternative text for this image';
                if (v && v.length < 10) return 'Make it descriptive (10+ chars)';
              },
            },
          },
          {
            type: 'string',
            name: 'leadershipIntro',
            label: 'Leadership — intro paragraph',
            description: 'Short intro before leadership cards. Mention founder + acting chairman + vice-chairman only.',
            required: false,
            ui: { component: 'textarea' },
          },
          {
            type: 'image',
            name: 'managementImage',
            label: 'Leadership — team graphic',
            required: false,
          },
          {
            type: 'string',
            name: 'managementImageAlt',
            label: 'Team graphic — alternative text',
            required: false,
          },
        ],
      },
      {
        name: 'faq',
        label: 'FAQ',
        path: 'apps/web/content/faq',
        format: 'json',
        ui: { allowedActions: { create: false, delete: false }, router: () => '/faq' },
        fields: [
          {
            type: 'string',
            name: 'pageHeading',
            label: 'Page heading',
            required: true,
            isTitle: true,
          },
          {
            type: 'string',
            name: 'pageEyebrow',
            label: 'Eyebrow',
            required: false,
          },
          {
            type: 'object',
            name: 'items',
            label: 'Questions & answers',
            description: 'Add, reorder, or hide questions. Keep answers factual and concise.',
            list: true,
            ui: { itemProps: (it: Record<string, string>) => ({ label: it?.question || 'Question' }) },
            fields: [
              {
                type: 'string',
                name: 'question',
                label: 'Question',
                required: true,
                ui: { validate: (v: string) => (!v ? 'Required' : v.length > 120 ? 'Keep under 120 characters' : undefined) },
              },
              {
                type: 'string',
                name: 'answer',
                label: 'Answer',
                required: true,
                ui: { component: 'textarea', validate: (v: string) => (!v ? 'Required' : v.length > 500 ? 'Keep under 500 characters' : undefined) },
              },
              {
                type: 'boolean',
                name: 'visible',
                label: 'Show this question',
                description: 'Turn off to hide without deleting.',
              },
            ],
          },
        ],
      },
      {
        name: 'siteSettings',
        label: 'Site settings',
        path: 'apps/web/content/site',
        format: 'json',
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: 'string', name: 'siteTaglineShort', label: 'Short tagline', description: 'Used in meta, footer, SEO. Example: United by Passion. Driven by Cricket.', required: true },
          { type: 'string', name: 'footerTagline', label: 'Footer tagline', required: false },
          {
            type: 'object',
            name: 'contact',
            label: 'Contact',
            fields: [
              { type: 'string', name: 'email', label: 'Email', required: true, ui: { validate: (v: string) => (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || '') ? 'Enter a valid email' : undefined) } },
              { type: 'string', name: 'phoneDisplay', label: 'Phone — display', required: true },
              { type: 'string', name: 'phoneHref', label: 'Phone — link', description: 'tel: link, e.g. tel:+447827627997', required: true, ui: { validate: (v: string) => (!v?.startsWith('tel:') ? 'Must start with tel:' : undefined) } },
            ],
          },
          {
            type: 'object',
            name: 'social',
            label: 'Social links',
            list: true,
            ui: { itemProps: (it: Record<string, string>) => ({ label: it?.platform || 'Social' }) },
            fields: [
              { type: 'string', name: 'platform', label: 'Platform', required: true, options: ['facebook', 'instagram', 'tiktok', 'x', 'youtube', 'linkedin'] },
              { type: 'string', name: 'url', label: 'URL', required: true, ui: { validate: (v: string) => (!v?.startsWith('https://') ? 'Must start with https://' : undefined) } },
            ],
          },
          {
            type: 'image',
            name: 'socialCard',
            label: 'Social share image',
            description: 'Shown when sharing on social. 1200×630 recommended.',
            required: false,
          },
        ],
      },
    ],
  },
});
