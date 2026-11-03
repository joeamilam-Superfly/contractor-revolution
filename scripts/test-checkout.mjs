import assert from "node:assert/strict";
import handler, { validateOrder } from "../netlify/functions/create-checkout.mjs";

function order(overrides = {}) {
  return {
    seats: 10,
    billing: "annual",
    company: "Sample Contracting",
    contact: "Alex Rivera",
    email: "alex@example.com",
    phone: "864-555-0100",
    notes: "Call before noon.",
    ...overrides,
  };
}

for (const name of Object.keys(process.env)) {
  if (name.startsWith("STRIPE_")) delete process.env[name];
}

const bad = [
  order({ email: "not-an-email" }),
  order({ company: " " }),
  order({ contact: "A" }),
  order({ phone: "123" }),
  order({ seats: 0 }),
  order({ seats: 999 }),
  order({ billing: "weekly" }),
  null,
];
for (const body of bad) {
  assert.equal(validateOrder(body).ok, false);
}
assert.equal(validateOrder(order()).ok, true);

const post = (body) =>
  handler(
    new Request("https://www.contractor-revolution.co/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
  );

const missing = await post(order());
assert.equal(missing.status, 200);
assert.deepEqual(await missing.json(), { mode: "followup" });

const invalid = await post(order({ email: "nope" }));
assert.equal(invalid.status, 400);

const huge = await handler(
  new Request("https://www.contractor-revolution.co/api/checkout", {
    method: "POST",
    body: "x".repeat(20001),
  }),
);
assert.equal(huge.status, 400);

const method = await handler(new Request("https://www.contractor-revolution.co/api/checkout", { method: "PUT" }));
assert.equal(method.status, 405);

const status = await handler(new Request("https://www.contractor-revolution.co/api/checkout"));
assert.equal(status.status, 200);
assert.deepEqual(await status.json(), { stripe: false });

console.log("checkout tests passed");
