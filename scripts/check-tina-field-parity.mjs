// check-tina-field-parity.mjs — deterministic Tina visual-editing contract guard.
// Proves behavior/contract from source, without requiring TinaCloud credentials,
// a browser, or a running server. Fails closed on any known field-mapping defect.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const failures = [];
const check = (name, cond, detail = '') => {
  if (!cond) failures.push(`${name}${detail ? ` — ${detail}` : ''}`);
};

const hero = read('apps/web/src/components/Hero.astro');
const islands = read('apps/web/src/lib/tina/islands.ts');
const faqSection = read('apps/web/src/components/FAQSection.astro');
const faqPage = read('apps/web/src/pages/faq.astro');
const whyChooseUs = read('apps/web/src/components/WhyChooseUs.astro');
const clubIntro = read('apps/web/src/components/ClubIntro.astro');
const button = read('apps/web/src/components/Button.astro');
const sectionHeader = read('apps/web/src/components/SectionHeader.astro');

// 1. Primary CTA link must map to primaryCtaLink, not the label field.
check(
  'hero-primary-cta-link-mapping',
  hero.includes('tinaField(data, "primaryCtaLink")'),
  'Hero primary Button hrefTinaField must use primaryCtaLink',
);
check(
  'hero-primary-cta-no-label-duplication',
  !hero.includes('hrefTinaField={tinaField(data, "primaryCtaLabel")}'),
  'Hero primary Button must not reuse primaryCtaLabel for href marker',
);

// 2. Hero image must carry an image-field marker.
check(
  'hero-image-marker',
  hero.includes('tinaField(data, "heroImage")'),
  'Hero <img> must carry tinaField(data, "heroImage")',
);

// 3. Island registry must propagate metadata-bearing data where required.
check(
  'island-aboutSection-passes-data',
  /aboutSection[\s\S]*?propsFromData[\s\S]*?data:\s*d\b/.test(islands),
  'aboutSection propsFromData must include data: d',
);
check(
  'island-whyChooseUs-passes-data',
  /whyChooseUs[\s\S]*?propsFromData[\s\S]*?data:\s*d\b/.test(islands),
  'whyChooseUs propsFromData must include data: d',
);

// 4. WhyChooseUs must expose per-item title/body markers from nearest item object.
check(
  'whychooseus-imports-tinaField',
  whyChooseUs.includes("from '@tinacms/astro'") &&
    whyChooseUs.includes('tinaField'),
  'WhyChooseUs must import tinaField',
);
check(
  'whychooseus-title-marker',
  /tinaField\(\s*\w+\s*,\s*"title"\s*\)/.test(whyChooseUs),
  'WhyChooseUs must call tinaField(item, "title")',
);
check(
  'whychooseus-body-marker',
  /tinaField\(\s*\w+\s*,\s*"body"\s*\)/.test(whyChooseUs),
  'WhyChooseUs must call tinaField(item, "body")',
);

// 5. FAQSection must use nearest-item mappings, never a shared parent marker.
check(
  'faqsection-imports-tinaField',
  faqSection.includes("from '@tinacms/astro'") &&
    faqSection.includes('tinaField'),
  'FAQSection must import tinaField',
);
check(
  'faqsection-question-per-item',
  /tinaField\(\s*item\s*,\s*"question"\s*\)/.test(faqSection),
  'FAQSection must call tinaField(item, "question") per item',
);
check(
  'faqsection-answer-per-item',
  /tinaField\(\s*item\s*,\s*"answer"\s*\)/.test(faqSection),
  'FAQSection must call tinaField(item, "answer") per item',
);

// 6. FAQ page must not assign one shared marker to all repeated items.
check(
  'faq-page-no-shared-items-marker',
  !faqPage.includes("tinaField(tinaFaq, 'items.question')") &&
    !faqPage.includes('tinaField(tinaFaq, "items.question")'),
  'faq.astro must not use shared tinaField(tinaFaq, items.question)',
);

// 7. FAQ heading/eyebrow must be editable via SectionHeader forwarding.
check(
  'sectionheader-forwards-tina-markers',
  sectionHeader.includes('eyebrowTinaField') &&
    sectionHeader.includes('headingTinaField'),
  'SectionHeader must accept and forward eyebrow/heading Tina markers',
);
check(
  'faq-page-heading-marker',
  faqPage.includes('pageHeading') &&
    /headingTinaField|tinaField\(tinaFaq,\s*["']pageHeading["']\)/.test(
      faqPage,
    ),
  'faq.astro must map pageHeading to a Tina marker',
);

// 8. No literal static data-tina-field="..." in Tina-edited components.
for (const [label, src] of [
  ['Hero.astro', hero],
  ['FAQSection.astro', faqSection],
  ['WhyChooseUs.astro', whyChooseUs],
  ['faq.astro', faqPage],
]) {
  check(
    `no-literal-marker-${label}`,
    !/data-tina-field="[^"]+"/.test(src),
    `${label} must use dynamic tinaField(), not a literal marker`,
  );
}

// 9. Component forwarding contracts.
check(
  'button-forwards-tina-markers',
  button.includes('labelTinaField') &&
    button.includes('hrefTinaField') &&
    button.includes('data-tina-field'),
  'Button must forward label/href Tina markers to HTML',
);
check(
  'clubintro-uses-data-prop',
  clubIntro.includes('tinaField(data, "clubIntroLede")'),
  'ClubIntro must map clubIntroLede via tinaField(data, ...)',
);

if (failures.length > 0) {
  console.error(
    JSON.stringify({ TINA_FIELD_PARITY_STATUS: 'FAIL', failures }, null, 2),
  );
  process.exit(1);
}
console.log(JSON.stringify({ TINA_FIELD_PARITY_STATUS: 'PASS', failures: [] }));
