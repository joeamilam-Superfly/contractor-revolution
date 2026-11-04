import { company, productDescription, productName, siteUrl, type Crumb, type Faq } from './site';
import { tiers } from './pricing';

export function absolute(path: string): string {
  if (path === '/') return `${siteUrl}/`;
  return `${siteUrl}${path}`;
}

export function organizationNode() {
  return {
    '@type': 'Organization',
    '@id': `${company.url}/#organization`,
    name: company.name,
    url: company.url,
    telephone: company.phoneTel,
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
}

export function softwareNode() {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${siteUrl}/#software`,
    name: productName,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: siteUrl,
    description: productDescription,
    provider: { '@id': `${company.url}/#organization` },
    offers: tiers.map((tier) => ({
      '@type': 'Offer',
      name: `${tier.name}, up to ${tier.included} users`,
      price: String(tier.monthly),
      priceCurrency: 'USD',
      url: `${siteUrl}/pricing`,
      availability: 'https://schema.org/InStock',
      description: `${tier.name} is $${tier.monthly} a month with no commitment for up to ${tier.included} users. Annual prepay is 15% off. Setup is separate.`,
    })),
  };
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: productName,
    url: siteUrl,
    publisher: { '@id': `${company.url}/#organization` },
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

export function pageGraph(options: { crumbs?: Crumb[]; faqs?: Faq[] }) {
  const graph = [organizationNode(), softwareNode(), websiteNode()];
  if (options.crumbs && options.crumbs.length > 1) graph.push(breadcrumbNode(options.crumbs));
  if (options.faqs && options.faqs.length > 0) graph.push(faqNode(options.faqs));
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
