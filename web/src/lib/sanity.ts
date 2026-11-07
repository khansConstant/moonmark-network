import { createClient } from '@sanity/client';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';

if (!projectId) {
  throw new Error('PUBLIC_SANITY_PROJECT_ID is not set');
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-01-01',
  useCdn: false,
});

export interface GuideSummary {
  _id: string;
  title: string;
  slug: string;
  dek: string;
  topic?: string;
  readMinutes?: number;
  publishedAt?: string;
}

export interface Guide extends GuideSummary {
  body?: unknown[];
  updatedAt?: string;
}

export interface GlossaryTerm {
  _id: string;
  term: string;
  slug: string;
  arabic?: string;
  definition: string;
}

const guideSummaryFields = `
  _id,
  title,
  "slug": slug.current,
  dek,
  topic,
  readMinutes,
  publishedAt
`;

const guideFields = `
  ${guideSummaryFields},
  body,
  updatedAt
`;

export async function getGuides(limit?: number): Promise<GuideSummary[]> {
  const query = `*[_type == "guide"] | order(publishedAt desc) ${limit ? `[0...${limit}]` : ''} {
    ${guideSummaryFields}
  }`;
  return sanityClient.fetch<GuideSummary[]>(query);
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  const query = `*[_type == "guide" && slug.current == $slug][0] {
    ${guideFields}
  }`;
  return sanityClient.fetch<Guide | null>(query, { slug });
}

export async function getGuideSlugs(): Promise<{ slug: string }[]> {
  const query = `*[_type == "guide" && defined(slug.current)] {
    "slug": slug.current
  }`;
  return sanityClient.fetch<{ slug: string }[]>(query);
}

export async function getGlossaryTerms(): Promise<GlossaryTerm[]> {
  const query = `*[_type == "glossaryTerm"] | order(term asc) {
    _id,
    term,
    "slug": slug.current,
    arabic,
    definition
  }`;
  return sanityClient.fetch<GlossaryTerm[]>(query);
}
