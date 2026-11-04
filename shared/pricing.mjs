/**
 * Contractor Revolution rate card.
 * Source: Contractor Revolution Pricing Proposal, November 3, 2026.
 * Annual prepay is 15% off, rounded to the nearest dollar.
 * Extra users on an annual plan are discounted the same way, each rounded
 * to the nearest dollar, so a Stripe per-seat price matches the page.
 * Setup is never discounted.
 */

export const MIN_SEATS = 1;
export const MAX_SEATS = 200;

export const PRICE_KINDS = [
  "MONTHLY",
  "ANNUAL",
  "SETUP",
  "EXTRA_MONTHLY",
  "EXTRA_ANNUAL",
];

/** Half-up rounding of a 15% discount. `dollars` must be a whole number. */
export function applyAnnualDiscount(dollars) {
  if (!Number.isInteger(dollars) || dollars < 0) {
    throw new Error("Discount expects a whole dollar amount.");
  }
  return Math.floor((dollars * 85 + 50) / 100);
}

const RAW_TIERS = [
  { id: "starter", name: "Starter", included: 5, setup: 1500, monthly: 239, extra: 19 },
  { id: "crew", name: "Crew", included: 10, setup: 2500, monthly: 329, extra: 19 },
  { id: "company", name: "Company", included: 20, setup: 4000, monthly: 429, extra: 15 },
  { id: "pro", name: "Pro", included: 40, setup: 6000, monthly: 529, extra: 12 },
  {
    id: "enterprise",
    name: "Enterprise",
    included: 75,
    setup: 9500,
    setupFrom: true,
    monthly: 729,
    extra: 8,
  },
];

export const TIERS = RAW_TIERS.map((tier) => ({
  ...tier,
  setupFrom: Boolean(tier.setupFrom),
  annualMonthly: applyAnnualDiscount(tier.monthly),
  annualYear: applyAnnualDiscount(tier.monthly) * 12,
  extraAnnual: applyAnnualDiscount(tier.extra),
}));

/** No-commitment monthly prices. Jobber above 15 users is an estimate. */
export const COMPARISON = [
  { users: 5, cr: 239, jobberGrow: 299, jobberPlus: 499, jobtread: 279 },
  { users: 10, cr: 329, jobberGrow: 399, jobberPlus: 599, jobtread: 379 },
  { users: 20, cr: 429, jobberGrow: 644, jobberPlus: 844, jobtread: 529 },
  { users: 40, cr: 529, jobberGrow: 1224, jobberPlus: 1424, jobtread: 679 },
  { users: 75, cr: 729, jobberGrow: 2239, jobberPlus: 2439, jobtread: 854 },
];

export const JOBBER_EXTRA_USER = 29;

export const JOBBER_PLANS = [
  { plan: "Core", users: "1", monthly: "$49", oneYear: "$39", annual: "$29" },
  { plan: "Connect", users: "1, 5, 10, or 15", monthly: "$139 to $399", oneYear: "$119 to $339", annual: "$99 to $299" },
  { plan: "Grow", users: "1, 5, 10, or 15", monthly: "$199 to $499", oneYear: "$169 to $429", annual: "$149 to $399" },
  { plan: "Plus", users: "5, 10, or 15", monthly: "$499 to $699", oneYear: "$439 to $599", annual: "$399 to $529" },
];

export const JOBTREAD_RATES = [
  { item: "Base, 1 user", monthly: "$199", annual: "20% off" },
  { item: "Users 2 to 10", monthly: "$20", annual: "$16" },
  { item: "Users 11 to 20", monthly: "$15", annual: "$12" },
  { item: "Users 21 to 30", monthly: "$10", annual: "$8" },
  { item: "Users 31 and up", monthly: "$5", annual: "$4" },
];

export const PRICE_CHECKED = "November 3, 2026";

export function formatMoney(dollars) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(dollars);
}

function buildNote(seats, tier, extraSeats, monthlyFee) {
  const index = TIERS.findIndex((item) => item.id === tier.id);
  if (extraSeats > 0) {
    const next = TIERS[index + 1];
    if (!next) {
      return `${seats} users is Enterprise: ${tier.included} included and ${extraSeats} extra at ${formatMoney(tier.extra)} each.`;
    }
    const noun = extraSeats === 1 ? "user" : "users";
    return `${seats} users stay on ${tier.name}. ${tier.name} plus ${extraSeats} extra ${noun} is ${formatMoney(monthlyFee)}, which is less than ${next.name} at ${formatMoney(next.monthly)}.`;
  }
  const prev = index > 0 ? TIERS[index - 1] : null;
  if (prev && seats > prev.included) {
    const prevExtras = seats - prev.included;
    const stacked = prev.monthly + prevExtras * prev.extra;
    return `${seats} users move up to ${tier.name}. ${prev.name} plus ${prevExtras} extra users would be ${formatMoney(stacked)}, and ${tier.name} is ${formatMoney(tier.monthly)}.`;
  }
  return `${tier.name} includes up to ${tier.included} users at ${formatMoney(tier.monthly)} a month.`;
}

export function quote(seats) {
  if (!Number.isInteger(seats) || seats < MIN_SEATS || seats > MAX_SEATS) {
    throw new Error(`Seat count must be a whole number from ${MIN_SEATS} to ${MAX_SEATS}.`);
  }

  const covering = TIERS.find((tier) => tier.included >= seats);
  let tier;
  let extraSeats;

  if (!covering) {
    tier = TIERS[TIERS.length - 1];
    extraSeats = seats - tier.included;
  } else {
    const index = TIERS.indexOf(covering);
    const prev = index > 0 ? TIERS[index - 1] : null;
    if (prev && seats > prev.included) {
      const prevExtras = seats - prev.included;
      const stacked = prev.monthly + prevExtras * prev.extra;
      if (stacked < covering.monthly) {
        tier = prev;
        extraSeats = prevExtras;
      } else {
        tier = covering;
        extraSeats = 0;
      }
    } else {
      tier = covering;
      extraSeats = 0;
    }
  }

  const monthlyFee = tier.monthly + extraSeats * tier.extra;
  const annualPerMonth = tier.annualMonthly + extraSeats * tier.extraAnnual;
  const annualYear = annualPerMonth * 12;

  return {
    seats,
    tierId: tier.id,
    tierName: tier.name,
    included: tier.included,
    extraSeats,
    extraMonthly: tier.extra,
    extraAnnual: tier.extraAnnual,
    monthlyFee,
    annualPerMonth,
    annualYear,
    setup: tier.setup,
    setupFrom: tier.setupFrom,
    note: buildNote(seats, tier, extraSeats, monthlyFee),
    tier,
  };
}

export function dueToday(q, billing) {
  if (billing === "annual") return q.setup + q.annualYear;
  if (billing === "monthly") return q.setup + q.monthlyFee;
  throw new Error("Billing must be monthly or annual.");
}

export function quoteText(q, billing) {
  const due = dueToday(q, billing);
  const savings = q.monthlyFee * 12 - q.annualYear;
  const setupBit = q.setupFrom
    ? `setup starting at ${formatMoney(q.setup)}`
    : `setup ${formatMoney(q.setup)}`;
  const dueDetail =
    billing === "annual"
      ? `${setupBit} + ${formatMoney(q.annualYear)} for the year (${formatMoney(q.annualPerMonth)} a month).`
      : `${setupBit} + ${formatMoney(q.monthlyFee)} for the first month.`;
  const alt =
    billing === "annual"
      ? `Monthly would be ${formatMoney(dueToday(q, "monthly"))} today.`
      : `Annual prepay would be ${formatMoney(dueToday(q, "annual"))} today, ${formatMoney(savings)} less than twelve monthly payments.`;

  return {
    kicker: billing === "annual" ? "Annual prepay" : "Monthly",
    tier: q.tierName,
    seats: `${q.seats} ${q.seats === 1 ? "user" : "users"}`,
    extraLine:
      q.extraSeats === 0
        ? `No extra users. ${q.tierName} includes up to ${q.included} users.`
        : `${q.extraSeats} extra ${q.extraSeats === 1 ? "user" : "users"} at ${formatMoney(q.extraMonthly)} = ${formatMoney(q.extraSeats * q.extraMonthly)}.`,
    monthly: formatMoney(q.monthlyFee),
    annual: `${formatMoney(q.annualPerMonth)} a month, ${formatMoney(q.annualYear)} for the year`,
    setup: q.setupFrom ? `${formatMoney(q.setup)} starting fee` : formatMoney(q.setup),
    extraRate: `${formatMoney(q.extraMonthly)} a month, ${formatMoney(q.extraAnnual)} on annual prepay`,
    due: formatMoney(due),
    dueDetail,
    alt,
    note: q.note,
    setupNote: q.setupFrom
      ? "The payment uses the $9,500 starting setup fee. If data migration runs past a standard setup, Isom will tell you the difference before that extra work starts."
      : "",
  };
}

export function priceEnvName(tierId, kind) {
  return `STRIPE_PRICE_${String(tierId).toUpperCase()}_${kind}`;
}

export function allPriceEnvNames() {
  return TIERS.flatMap((tier) => PRICE_KINDS.map((kind) => priceEnvName(tier.id, kind)));
}

export function priceEnvNamesFor(q, billing) {
  const names = [
    priceEnvName(q.tierId, billing === "annual" ? "ANNUAL" : "MONTHLY"),
    priceEnvName(q.tierId, "SETUP"),
  ];
  if (q.extraSeats > 0) {
    names.push(priceEnvName(q.tierId, billing === "annual" ? "EXTRA_ANNUAL" : "EXTRA_MONTHLY"));
  }
  return names;
}

export function stripeReady(env, q, billing) {
  if (!env || !env.STRIPE_SECRET_KEY) return false;
  return priceEnvNamesFor(q, billing).every((name) => Boolean(env[name]));
}

export function stripeCatalogReady(env) {
  if (!env || !env.STRIPE_SECRET_KEY) return false;
  return allPriceEnvNames().every((name) => Boolean(env[name]));
}

/** Dollar amounts to create in Stripe. Annual prices are charged once a year. */
export function stripePriceAmounts() {
  return TIERS.flatMap((tier) => [
    { env: priceEnvName(tier.id, "MONTHLY"), amount: tier.monthly, interval: "month", mode: "recurring" },
    { env: priceEnvName(tier.id, "ANNUAL"), amount: tier.annualYear, interval: "year", mode: "recurring" },
    { env: priceEnvName(tier.id, "SETUP"), amount: tier.setup, interval: "once", mode: "one_time" },
    { env: priceEnvName(tier.id, "EXTRA_MONTHLY"), amount: tier.extra, interval: "month", mode: "recurring" },
    { env: priceEnvName(tier.id, "EXTRA_ANNUAL"), amount: tier.extraAnnual * 12, interval: "year", mode: "recurring" },
  ]);
}
