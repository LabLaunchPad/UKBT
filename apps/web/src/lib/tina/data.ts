import { requestWithMetadata } from '@tinacms/astro';
import client from '../../../../../tina/__generated__/client';

export async function getHomepage() {
  const res = await requestWithMetadata(
    client.queries.homepage({ relativePath: 'homepage.json' }),
  );
  return res;
}

export async function getAbout() {
  const res = await requestWithMetadata(
    client.queries.about({ relativePath: 'about.json' }),
  );
  return res;
}

export async function getFaq() {
  const res = await requestWithMetadata(
    client.queries.faq({ relativePath: 'faq.json' }),
  );
  return res;
}

export async function getSiteSettings() {
  const res = await requestWithMetadata(
    client.queries.siteSettings({ relativePath: 'siteSettings.json' }),
  );
  return res;
}
