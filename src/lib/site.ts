export const siteUrl = 'https://contractor-revolution.co';

export const productName = 'Contractor Revolution';

export const productDescription =
  'Time tracking, work orders, PTO, and billing for contractors. Your own logo and colors, set up around your process. A product of Isom Technologies.';

export const company = {
  name: 'Isom Technologies',
  url: 'https://isomtechnologies.com',
  phoneDisplay: '864-437-1827',
  phoneTel: '+1-864-437-1827',
  email: 'info@isomtechnologies.com',
  support: 'support@isomtechnologies.com',
  street: '7205 US 76',
  locality: 'Pendleton',
  region: 'SC',
  postal: '29670',
  country: 'US',
};

export const mapUrl =
  'https://www.google.com/maps/search/?api=1&query=7205%20US%2076%2C%20Pendleton%2C%20SC%2029670';

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
  {
    name: 'Isom Technologies',
    line: 'Uses Contractor Revolution for its own low-voltage and fiber work: time tracking, work orders, PTO, and billing.',
  },
];

export type Crumb = { name: string; path: string };

export type Faq = { q: string; a: string };
