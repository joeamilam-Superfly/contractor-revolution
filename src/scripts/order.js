import { MAX_SEATS, MIN_SEATS, quote, quoteText } from "../../shared/pricing.mjs";

const form = document.querySelector("#order-form");
if (form) {
  const seatsInput = form.querySelector("#seats");
  const errors = document.querySelector("#form-errors");
  const status = document.querySelector("#form-status");
  const payNote = document.querySelector("#pay-note");
  const button = document.querySelector("#place-order");
  const presets = document.querySelectorAll("[data-seats]");

  const text = (id, value) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  };

  const billing = () => {
    const checked = form.querySelector('input[name="billing"]:checked');
    return checked ? checked.value : "monthly";
  };

  const paint = () => {
    const raw = seatsInput.value.trim();
    let seats = Number(raw);
    if (!/^\d+$/.test(raw) || !Number.isInteger(seats)) {
      text("q-tier", "Enter a whole number");
      text("q-note", `Use a seat count from ${MIN_SEATS} to ${MAX_SEATS}.`);
      return null;
    }
    seats = Math.min(MAX_SEATS, Math.max(MIN_SEATS, seats));
    const priced = quote(seats);
    const view = quoteText(priced, billing());
    text("q-kicker", view.kicker);
    text("q-tier", view.tier);
    text("q-seats", view.seats);
    text("q-extra", view.extraLine);
    text("q-monthly", view.monthly);
    text("q-annual", view.annual);
    text("q-setup", view.setup);
    text("q-extra-rate", view.extraRate);
    text("q-due", view.due);
    text("q-due-detail", view.dueDetail);
    text("q-alt", view.alt);
    text("q-note", view.note);
    text("q-setup-note", view.setupNote);
    form.elements.tier.value = priced.tierName;
    form.elements.extra_seats.value = String(priced.extraSeats);
    form.elements.monthly_fee.value = String(priced.monthlyFee);
    form.elements.annual_per_month.value = String(priced.annualPerMonth);
    form.elements.annual_year.value = String(priced.annualYear);
    form.elements.setup_fee.value = String(priced.setup);
    form.elements.due_today.value = view.due.replace(/[^0-9]/g, "");
    presets.forEach((preset) => {
      preset.setAttribute("aria-pressed", preset.dataset.seats === String(seats) ? "true" : "false");
    });
    return priced;
  };

  const syncUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("seats", seatsInput.value.trim());
    url.searchParams.set("billing", billing());
    window.history.replaceState(null, "", url);
  };

  const params = new URLSearchParams(window.location.search);
  if (/^\d+$/.test(params.get("seats") || "")) seatsInput.value = params.get("seats");
  if (params.get("billing") === "annual" || params.get("billing") === "monthly") {
    const radio = form.querySelector(`input[name="billing"][value="${params.get("billing")}"]`);
    if (radio) radio.checked = true;
  }

  seatsInput.addEventListener("input", () => {
    paint();
    syncUrl();
  });
  form.querySelectorAll('input[name="billing"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      paint();
      syncUrl();
    });
  });
  presets.forEach((preset) => {
    preset.addEventListener("click", () => {
      seatsInput.value = preset.dataset.seats;
      paint();
      syncUrl();
      seatsInput.focus();
    });
  });

  paint();

  const stripeCheckout = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && parsed.hostname === "checkout.stripe.com";
    } catch {
      return false;
    }
  };

  fetch("/api/checkout")
    .then((res) => res.json())
    .then((data) => {
      if (!button || !payNote) return;
      if (data.stripe) {
        button.textContent = "Continue to payment";
        payNote.textContent = "The next step is Stripe. You pay the setup fee and the first period there. The company and contact details go with the payment.";
      } else {
        button.textContent = "Send order";
        payNote.textContent = "Card checkout is not turned on. Sending this form stores the order. No payment is taken.";
      }
    })
    .catch(() => {
      if (button) button.textContent = "Send order";
    });

  const problemsFor = () => {
    const problems = [];
    const company = form.company.value.trim();
    const contact = form.contact.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const raw = seatsInput.value.trim();
    const seats = Number(raw);
    if (!/^\d+$/.test(raw) || seats < MIN_SEATS || seats > MAX_SEATS) {
      problems.push(`Enter a whole number of users from ${MIN_SEATS} to ${MAX_SEATS}.`);
    }
    if (company.length < 2) problems.push("Enter the company name.");
    if (contact.length < 2) problems.push("Enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) problems.push("Enter a valid email address.");
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) problems.push("Enter a phone number.");
    return problems;
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form["bot-field"] && form["bot-field"].value) return;
    paint();
    const problems = problemsFor();
    errors.replaceChildren();
    if (problems.length) {
      const list = document.createElement("ul");
      problems.forEach((problem) => {
        const item = document.createElement("li");
        item.textContent = problem;
        list.append(item);
      });
      errors.append(list);
      errors.hidden = false;
      errors.focus();
      return;
    }
    errors.hidden = true;
    button.disabled = true;
    status.textContent = "Sending the order.";
    const payload = {
      seats: Number(seatsInput.value),
      billing: billing(),
      company: form.company.value.trim(),
      contact: form.contact.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      notes: form.notes.value.trim(),
    };
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 400) {
        errors.replaceChildren(document.createTextNode(data.error || "Check the form and try again."));
        errors.hidden = false;
        button.disabled = false;
        status.textContent = "";
        return;
      }
      if (data.mode === "stripe" && stripeCheckout(data.url)) {
        window.location.href = data.url;
        return;
      }
    } catch {
      status.textContent = "Card checkout is unavailable. Saving the order.";
    }
    form.submit();
  });
}
