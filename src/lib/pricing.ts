export type Tier = {
  id: string;
  name: string;
  included: number;
  setup: number;
  setupFrom: boolean;
  monthly: number;
  extra: number;
  annualMonthly: number;
  annualYear: number;
  extraAnnual: number;
};

/** 15% off, rounded to the nearest dollar. Matches the published rate card. */
export function annualDiscount(amount: number): number {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error('Discount expects a whole dollar amount.');
  }
  return Math.floor((amount * 85 + 50) / 100);
}

const rawTiers = [
  { id: 'starter', name: 'Starter', included: 5, setup: 1500, monthly: 239, extra: 19, setupFrom: false },
  { id: 'crew', name: 'Crew', included: 10, setup: 2500, monthly: 329, extra: 19, setupFrom: false },
  { id: 'company', name: 'Company', included: 20, setup: 4000, monthly: 429, extra: 15, setupFrom: false },
  { id: 'pro', name: 'Pro', included: 40, setup: 6000, monthly: 529, extra: 12, setupFrom: false },
  { id: 'enterprise', name: 'Enterprise', included: 75, setup: 9500, monthly: 729, extra: 8, setupFrom: true },
] as const;

export const tiers: Tier[] = rawTiers.map((tier) => ({
  ...tier,
  annualMonthly: annualDiscount(tier.monthly),
  annualYear: annualDiscount(tier.monthly) * 12,
  extraAnnual: annualDiscount(tier.extra),
}));

export function money(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export type SeatQuote = {
  seats: number;
  tier: Tier;
  extraSeats: number;
  monthlyFee: number;
  annualPerMonth: number;
  annualYear: number;
  note: string;
};

function tierNote(seats: number, tier: Tier, extraSeats: number, monthlyFee: number): string {
  const index = tiers.findIndex((item) => item.id === tier.id);
  if (extraSeats > 0) {
    const next = tiers[index + 1];
    if (!next) {
      return `${seats} users is Enterprise: ${tier.included} included and ${extraSeats} extra at ${money(tier.extra)} each.`;
    }
    const label = extraSeats === 1 ? 'user' : 'users';
    return `${seats} users stay on ${tier.name}. ${tier.name} plus ${extraSeats} extra ${label} is ${money(monthlyFee)}, which is less than ${next.name} at ${money(next.monthly)}.`;
  }
  const previous = index > 0 ? tiers[index - 1] : null;
  if (previous && seats > previous.included) {
    const moved = seats - previous.included;
    const previousTotal = previous.monthly + moved * previous.extra;
    return `${seats} users move up to ${tier.name}. ${previous.name} plus ${moved} extra users would be ${money(previousTotal)}, and ${tier.name} is ${money(tier.monthly)}.`;
  }
  return `${tier.name} includes up to ${tier.included} users at ${money(tier.monthly)} a month.`;
}

export function priceSeats(seats: number): SeatQuote {
  if (!Number.isInteger(seats) || seats < 1 || seats > 200) {
    throw new Error('Seat count must be a whole number from 1 to 200.');
  }
  const covering = tiers.find((tier) => tier.included >= seats);
  let tier: Tier;
  let extraSeats: number;
  if (!covering) {
    tier = tiers[tiers.length - 1];
    extraSeats = seats - tier.included;
  } else {
    const index = tiers.indexOf(covering);
    const previous = index > 0 ? tiers[index - 1] : null;
    if (previous && seats > previous.included) {
      const extraOnPrevious = seats - previous.included;
      if (previous.monthly + extraOnPrevious * previous.extra < covering.monthly) {
        tier = previous;
        extraSeats = extraOnPrevious;
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
  return {
    seats,
    tier,
    extraSeats,
    monthlyFee,
    annualPerMonth,
    annualYear: annualPerMonth * 12,
    note: tierNote(seats, tier, extraSeats, monthlyFee),
  };
}

export function dueToday(quote: SeatQuote, billing: 'monthly' | 'annual'): number {
  if (billing === 'annual') return quote.tier.setup + quote.annualYear;
  return quote.tier.setup + quote.monthlyFee;
}
