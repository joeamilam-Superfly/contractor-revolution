import Stripe from "stripe";
import { SITE_URL } from "../../shared/site.mjs";
import {
  MAX_SEATS,
  MIN_SEATS,
  dueToday,
  quote,
  stripeCatalogReady,
  stripeReady,
} from "../../shared/pricing.mjs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function clean(value, max) {
  return String(value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

export function validateOrder(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "The order could not be read." };
  }

  const company = clean(body.company, 120);
  const contact = clean(body.contact, 120);
  const email = clean(body.email, 160);
  const phone = clean(body.phone, 40);
  const notes = clean(body.notes, 480);
  const billing = body.billing === "annual" ? "annual" : body.billing === "monthly" ? "monthly" : "";

  const seats = Number(body.seats);
  if (!Number.isInteger(seats) || seats < MIN_SEATS || seats > MAX_SEATS) {
    return { ok: false, error: `Enter a whole number of users from ${MIN_SEATS} to ${MAX_SEATS}.` };
  }
  if (company.length < 2 || !/[A-Za-z0-9]/.test(company)) {
    return { ok: false, error: "Enter the company name." };
  }
  if (contact.length < 2 || !/[A-Za-z0-9]/.test(contact)) {
    return { ok: false, error: "Enter the contact name." };
  }
  if (!EMAIL.test(email)) {
    return { ok: false, error: "Enter a valid email address." };
  }
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) {
    return { ok: false, error: "Enter a phone number." };
  }
  if (billing !== "monthly" && billing !== "annual") {
    return { ok: false, error: "Choose monthly or annual prepay." };
  }

  let priced;
  try {
    priced = quote(seats);
  } catch {
    return { ok: false, error: `Enter a whole number of users from ${MIN_SEATS} to ${MAX_SEATS}.` };
  }

  return {
    ok: true,
    value: { company, contact, email, phone, notes, billing, seats, priced },
  };
}

function siteBase() {
  const raw = process.env.SITE_URL || process.env.DEPLOY_PRIME_URL || SITE_URL;
  return String(raw).replace(/\/$/, "");
}

function followup() {
  return json({ mode: "followup" });
}

export default async function handler(request) {
  if (request.method === "GET") {
    return json({ stripe: stripeCatalogReady(process.env) });
  }
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  let body;
  try {
    const text = await request.text();
    if (text.length > 20000) return json({ error: "The order is too large." }, 400);
    body = JSON.parse(text);
  } catch {
    return json({ error: "The order could not be read." }, 400);
  }

  const parsed = validateOrder(body);
  if (!parsed.ok) return json({ error: parsed.error }, 400);

  const { company, contact, email, phone, notes, billing, priced } = parsed.value;

  if (!stripeReady(process.env, priced, billing)) {
    return followup();
  }

  const recurringKind = billing === "annual" ? "ANNUAL" : "MONTHLY";
  const extraKind = billing === "annual" ? "EXTRA_ANNUAL" : "EXTRA_MONTHLY";
  const lineItems = [
    { price: process.env[`STRIPE_PRICE_${priced.tierId.toUpperCase()}_${recurringKind}`], quantity: 1 },
  ];
  if (priced.extraSeats > 0) {
    lineItems.push({
      price: process.env[`STRIPE_PRICE_${priced.tierId.toUpperCase()}_${extraKind}`],
      quantity: priced.extraSeats,
    });
  }
  lineItems.push({
    price: process.env[`STRIPE_PRICE_${priced.tierId.toUpperCase()}_SETUP`],
    quantity: 1,
  });

  const base = siteBase();
  const metadata = {
    company,
    contact,
    phone,
    email,
    notes,
    seats: String(priced.seats),
    tier: priced.tierId,
    billing,
    extra_seats: String(priced.extraSeats),
    monthly_fee: String(priced.monthlyFee),
    annual_year: String(priced.annualYear),
    setup_fee: String(priced.setup),
    due_today: String(dueToday(priced, billing)),
  };
  if (!notes) delete metadata.notes;

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: lineItems,
      success_url: `${base}/order/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/order?seats=${priced.seats}&billing=${billing}`,
      metadata,
      subscription_data: { metadata },
      allow_promotion_codes: false,
    });
    if (!session.url) return followup();
    return json({ mode: "stripe", url: session.url });
  } catch (error) {
    console.error("Stripe checkout failed", error instanceof Error ? error.message : "unknown");
    return followup();
  }
}
