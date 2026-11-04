import { CONTACT, MAPS_URL } from '../../shared/contact.mjs';
import { SITE_URL } from '../../shared/site.mjs';

export const siteUrl = SITE_URL;

export const productName = CONTACT.product;

export const productDescription =
  'Time tracking, work orders, PTO, and billing for contractors. Your own logo and colors, set up around your process.';

export const company = {
  name: CONTACT.product,
  url: SITE_URL,
  phoneDisplay: CONTACT.phoneDisplay,
  phoneTel: CONTACT.phoneTel,
  email: CONTACT.email,
  support: CONTACT.supportEmail,
  street: CONTACT.street,
  locality: CONTACT.locality,
  region: CONTACT.region,
  postal: CONTACT.postalCode,
  country: 'US',
};

export const mapUrl = MAPS_URL;

export const ogImage = {
  path: '/og.png',
  alt: 'Contractor Revolution. Time, work orders, and billing for contractors.',
  width: 1200,
  height: 630,
};

export type Customer = {
  name: string;
  line: string;
};

export const customers: Customer[] = [
  {
    name: 'Isom Electric',
    line: 'An electrical contractor. Uses Contractor Revolution for time tracking, work orders, PTO, and billing.',
  },
  {
    name: 'South Pointe Construction',
    line: 'Uses Contractor Revolution for time tracking, work orders, PTO, and billing.',
  },
];

export type Crumb = { name: string; path: string };

export type Faq = { q: string; a: string };
