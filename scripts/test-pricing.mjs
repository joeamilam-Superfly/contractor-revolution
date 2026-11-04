import assert from "node:assert/strict";
import {
  COMPARISON,
  JOBBER_EXTRA_USER,
  MAX_SEATS,
  MIN_SEATS,
  TIERS,
  allPriceEnvNames,
  applyAnnualDiscount,
  dueToday,
  formatMoney,
  priceEnvNamesFor,
  quote,
  quoteText,
  stripePriceAmounts,
  stripeReady,
} from "../shared/pricing.mjs";
import { PROMISES } from "../shared/copy.mjs";
import { SITE_URL } from "../shared/site.mjs";
import { CONTACT, ADDRESS_LINE } from "../shared/contact.mjs";

const PDF = {
  starter: { monthly: 239, annualMonthly: 203, annualYear: 2436, setup: 1500, extra: 19, included: 5 },
  crew: { monthly: 329, annualMonthly: 280, annualYear: 3360, setup: 2500, extra: 19, included: 10 },
  company: { monthly: 429, annualMonthly: 365, annualYear: 4380, setup: 4000, extra: 15, included: 20 },
  pro: { monthly: 529, annualMonthly: 450, annualYear: 5400, setup: 6000, extra: 12, included: 40 },
  enterprise: { monthly: 729, annualMonthly: 620, annualYear: 7440, setup: 9500, extra: 8, included: 75 },
};

assert.equal(TIERS.length, 5);
assert.equal(SITE_URL, "https://www.contractor-revolution.co");
assert.equal(CONTACT.phoneDisplay, "864-437-1827");
assert.equal(CONTACT.email, "info@isomtechnologies.com");
assert.equal(CONTACT.supportEmail, "support@isomtechnologies.com");
assert.equal(ADDRESS_LINE, "7205 US 76, Pendleton, SC 29670");
assert.equal(PROMISES.length, 5);
assert.equal(PROMISES[2], "We track every hour, and when the work is done we make sure it's billed.");
assert.equal(PROMISES[4], "Employees track their time, PTO requests and scheduled work orders from their phone.");

for (const tier of TIERS) {
  const pdf = PDF[tier.id];
  const q = quote(tier.included);
  assert.equal(q.tierId, tier.id, tier.id);
  assert.equal(q.extraSeats, 0, tier.id);
  assert.equal(q.monthlyFee, pdf.monthly, tier.id);
  assert.equal(tier.monthly, pdf.monthly);
  assert.equal(tier.setup, pdf.setup);
  assert.equal(tier.extra, pdf.extra);
  assert.equal(tier.included, pdf.included);
  assert.equal(applyAnnualDiscount(tier.monthly), pdf.annualMonthly, tier.id);
  assert.equal(tier.annualMonthly, pdf.annualMonthly);
  assert.equal(tier.annualYear, pdf.annualYear);
  assert.equal(tier.annualMonthly * 12, pdf.annualYear);
  assert.equal(dueToday(q, "monthly"), pdf.setup + pdf.monthly);
  assert.equal(dueToday(q, "annual"), pdf.setup + pdf.annualYear);
  assert.equal(quoteText(q, "monthly").due, formatMoney(pdf.setup + pdf.monthly));
  assert.equal(quoteText(q, "annual").due, formatMoney(pdf.setup + pdf.annualYear));
  assert.ok(!q.note.includes("\u2014"));
  assert.ok(!q.note.includes("\u2013"));
}

assert.equal(applyAnnualDiscount(19), 16);
assert.equal(applyAnnualDiscount(15), 13);
assert.equal(applyAnnualDiscount(12), 10);
assert.equal(applyAnnualDiscount(8), 7);
assert.equal(TIERS[0].extraAnnual, 16);
assert.equal(TIERS[2].extraAnnual, 13);
assert.equal(TIERS[3].extraAnnual, 10);
assert.equal(TIERS[4].extraAnnual, 7);

const nine = quote(9);
assert.equal(nine.tierId, "starter");
assert.equal(nine.extraSeats, 4);
assert.equal(nine.monthlyFee, 315);
assert.equal(nine.annualPerMonth, 203 + 4 * 16);
assert.equal(nine.annualYear, 267 * 12);
assert.equal(dueToday(nine, "monthly"), 1500 + 315);
assert.equal(dueToday(nine, "annual"), 1500 + 3204);
assert.match(nine.note, /stay on Starter/);
assert.match(nine.note, /\$315/);
assert.match(nine.note, /\$329/);

const ten = quote(10);
assert.equal(ten.tierId, "crew");
assert.equal(ten.extraSeats, 0);
assert.equal(ten.monthlyFee, 329);
assert.match(ten.note, /move up to Crew/);
assert.match(ten.note, /\$334/);

assert.equal(quote(15).tierId, "crew");
assert.equal(quote(15).extraSeats, 5);
assert.equal(quote(15).monthlyFee, 424);
assert.equal(quote(16).tierId, "company");
assert.equal(quote(16).monthlyFee, 429);

assert.equal(quote(26).tierId, "company");
assert.equal(quote(26).monthlyFee, 519);
assert.equal(quote(27).tierId, "pro");
assert.equal(quote(27).monthlyFee, 529);

assert.equal(quote(56).tierId, "pro");
assert.equal(quote(56).monthlyFee, 721);
assert.equal(quote(57).tierId, "enterprise");
assert.equal(quote(57).monthlyFee, 729);

const eighty = quote(80);
assert.equal(eighty.tierId, "enterprise");
assert.equal(eighty.extraSeats, 5);
assert.equal(eighty.monthlyFee, 769);
assert.equal(eighty.setupFrom, true);
assert.match(quoteText(eighty, "monthly").setupNote, /\$9,500/);

assert.equal(quote(1).tierId, "starter");
assert.equal(quote(5).extraSeats, 0);
assert.equal(quote(200).extraSeats, 125);
assert.equal(quote(200).monthlyFee, 729 + 125 * 8);

let previous = 0;
for (let seats = MIN_SEATS; seats <= MAX_SEATS; seats += 1) {
  const q = quote(seats);
  assert.equal(q.monthlyFee, q.tier.monthly + q.extraSeats * q.tier.extra);
  assert.equal(q.annualPerMonth, q.tier.annualMonthly + q.extraSeats * q.tier.extraAnnual);
  assert.equal(q.annualYear, q.annualPerMonth * 12);
  assert.ok(q.monthlyFee >= previous, `fee dropped at ${seats}`);
  previous = q.monthlyFee;
  assert.ok(q.annualYear < q.monthlyFee * 12);
  const text = JSON.stringify(quoteText(q, "monthly"));
  assert.ok(!text.includes("\u2014"));
  assert.ok(!text.includes("\u2013"));
  assert.ok(!/heath|commission/i.test(text));
  if (seats <= 75) {
    const covering = TIERS.find((tier) => tier.included >= seats);
    assert.ok(q.monthlyFee <= covering.monthly, `${seats} costs more than the covering tier`);
  }
}

for (const bad of [0, -1, 201, 1.5, 10.2]) {
  assert.throws(() => quote(bad));
}

assert.deepEqual(
  COMPARISON.map((row) => row.cr),
  [239, 329, 429, 529, 729],
);
for (const row of COMPARISON) {
  assert.ok(row.cr < row.jobberGrow);
  assert.ok(row.cr < row.jobberPlus);
  assert.ok(row.cr < row.jobtread);
  const q = quote(row.users);
  assert.equal(q.monthlyFee, row.cr);
  assert.equal(q.extraSeats, 0);
}
assert.equal(JOBBER_EXTRA_USER, 29);
assert.equal(COMPARISON[2].jobberGrow, 499 + 5 * 29);
assert.equal(COMPARISON[3].jobberGrow, 499 + 25 * 29);
assert.equal(COMPARISON[4].jobberPlus, 699 + 60 * 29);
assert.equal(COMPARISON[0].jobtread, 199 + 4 * 20);
assert.equal(COMPARISON[1].jobtread, 199 + 9 * 20);
assert.equal(COMPARISON[2].jobtread, 199 + 9 * 20 + 10 * 15);
assert.equal(COMPARISON[4].jobtread, 679 + 35 * 5);

const catalog = stripePriceAmounts();
assert.equal(catalog.length, 25);
assert.equal(allPriceEnvNames().length, 25);
const byEnv = Object.fromEntries(catalog.map((item) => [item.env, item]));
assert.deepEqual(byEnv.STRIPE_PRICE_STARTER_MONTHLY, { env: "STRIPE_PRICE_STARTER_MONTHLY", amount: 239, interval: "month", mode: "recurring" });
assert.deepEqual(byEnv.STRIPE_PRICE_STARTER_ANNUAL, { env: "STRIPE_PRICE_STARTER_ANNUAL", amount: 2436, interval: "year", mode: "recurring" });
assert.deepEqual(byEnv.STRIPE_PRICE_STARTER_SETUP, { env: "STRIPE_PRICE_STARTER_SETUP", amount: 1500, interval: "once", mode: "one_time" });
assert.deepEqual(byEnv.STRIPE_PRICE_STARTER_EXTRA_ANNUAL, { env: "STRIPE_PRICE_STARTER_EXTRA_ANNUAL", amount: 192, interval: "year", mode: "recurring" });
assert.equal(byEnv.STRIPE_PRICE_CREW_ANNUAL.amount, 3360);
assert.equal(byEnv.STRIPE_PRICE_COMPANY_ANNUAL.amount, 4380);
assert.equal(byEnv.STRIPE_PRICE_COMPANY_EXTRA_MONTHLY.amount, 15);
assert.equal(byEnv.STRIPE_PRICE_COMPANY_EXTRA_ANNUAL.amount, 156);
assert.equal(byEnv.STRIPE_PRICE_PRO_SETUP.amount, 6000);
assert.equal(byEnv.STRIPE_PRICE_PRO_EXTRA_ANNUAL.amount, 120);
assert.equal(byEnv.STRIPE_PRICE_ENTERPRISE_MONTHLY.amount, 729);
assert.equal(byEnv.STRIPE_PRICE_ENTERPRISE_ANNUAL.amount, 7440);
assert.equal(byEnv.STRIPE_PRICE_ENTERPRISE_SETUP.amount, 9500);
assert.equal(byEnv.STRIPE_PRICE_ENTERPRISE_EXTRA_ANNUAL.amount, 84);

assert.deepEqual(priceEnvNamesFor(quote(10), "monthly"), [
  "STRIPE_PRICE_CREW_MONTHLY",
  "STRIPE_PRICE_CREW_SETUP",
]);
assert.deepEqual(priceEnvNamesFor(quote(9), "annual"), [
  "STRIPE_PRICE_STARTER_ANNUAL",
  "STRIPE_PRICE_STARTER_SETUP",
  "STRIPE_PRICE_STARTER_EXTRA_ANNUAL",
]);
assert.equal(stripeReady({}, quote(10), "monthly"), false);
assert.equal(
  stripeReady(
    {
      STRIPE_SECRET_KEY: "sk_test_example",
      STRIPE_PRICE_CREW_MONTHLY: "price_m",
      STRIPE_PRICE_CREW_SETUP: "price_s",
    },
    quote(10),
    "monthly",
  ),
  true,
);

console.log("pricing tests passed");
