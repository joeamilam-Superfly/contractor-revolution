import { TIERS } from '../../shared/pricing.mjs';
import { company, productDescription, productName, siteUrl, type Crumb, type Faq } from './site';

const creatorOrg = {
  '@type': 'Organization',
  name: 'Isom Technologies',
  url: 'https://isomtechnologies.com',
};

export function absolute(path: string): string {
  if (path === '/') return `${siteUrl}/`;
  return `${siteUrl}${path}`;
}

export function organizationNode(includeCreator = false) {
  const node: Record<string, unknown> = {
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: company.name,
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    telephone: '+1-864-437-1827',
    email: company.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: company.street,
      addressLocality: company.locality,
      addressRegion: company.region,
      postalCode: company.postal,
      addressCountry: company.country,
    },
  };
  if (includeCreator) node.parentOrganization = creatorOrg;
  return node;
}

export function softwareNode(includeCreator = false) {
  const node: Record<string, unknown> = {
    '@type': 'SoftwareApplication',
    '@id': `${siteUrl}/#software`,
    name: productName,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: siteUrl,
    description: productDescription,
    provider: { '@id': `${siteUrl}/#organization` },
    offers: TIERS.map((tier: { name: string; included: number; monthly: number }) => ({
      '@type': 'Offer',
      name: `${tier.name}, up to ${tier.included} users`,
      price: String(tier.monthly),
      priceCurrency: 'USD',
      url: `${siteUrl}/pricing`,
      availability: 'https://schema.org/InStock',
      description: `${tier.name} is $${tier.monthly} a month with no commitment for up to ${tier.included} users. Annual prepay is 15% off. Setup is separate.`,
    })),
  };
  if (includeCreator) node.creator = creatorOrg;
  return node;
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: productName,
    url: siteUrl,
    publisher: { '@id': `${siteUrl}/#organization` },
  };
}

export function breadcrumbNode(crumbs: Crumb[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  };
}

export function faqNode(faqs: Faq[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}

export function pageGraph(options: { crumbs?: Crumb[]; faqs?: Faq[]; includeCreator?: boolean }) {
  const graph = [
    organizationNode(options.includeCreator),
    softwareNode(options.includeCreator),
    websiteNode(),
  ];
  if (options.crumbs && options.crumbs.length > 1) graph.push(breadcrumbNode(options.crumbs));
  if (options.faqs && options.faqs.length > 0) graph.push(faqNode(options.faqs));
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
