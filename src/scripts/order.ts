import { dueToday, money, priceSeats, type SeatQuote } from '../lib/pricing';

const form = document.querySelector<HTMLFormElement>('#order-form');
if (form) {
  const seatsInput = form.querySelector<HTMLInputElement>('#seats');
  const errors = document.querySelector<HTMLElement>('#form-errors');
  const status = document.querySelector<HTMLElement>('#form-status');
  const payNote = document.querySelector<HTMLElement>('#pay-note');
  const placeOrder = document.querySelector<HTMLButtonElement>('#place-order');
  const presets = document.querySelectorAll<HTMLButtonElement>('[data-seats]');

  const setText = (id: string, value: string) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  };

  const billing = (): 'monthly' | 'annual' => {
    const selected = form.querySelector<HTMLInputElement>('input[name="billing"]:checked');
    return selected?.value === 'annual' ? 'annual' : 'monthly';
  };

  const render = (): SeatQuote | null => {
    if (!seatsInput) return null;
    const raw = seatsInput.value.trim();
    const seats = Number(raw);
    if (!/^\d+$/.test(raw) || !Number.isInteger(seats)) {
      setText('q-tier', 'Enter a whole number');
      setText('q-note', 'Use a seat count from 1 to 200.');
      return null;
    }
    const bounded = Math.min(200, Math.max(1, seats));
    const quote = priceSeats(bounded);
    const period = billing();
    const due = dueToday(quote, period);
    const savings = quote.monthlyFee * 12 - quote.annualYear;
    const setupLabel = quote.tier.setupFrom
      ? `setup starting at ${money(quote.tier.setup)}`
      : `setup ${money(quote.tier.setup)}`;
    const dueDetail =
      period === 'annual'
        ? `${setupLabel} + ${money(quote.annualYear)} for the year (${money(quote.annualPerMonth)} a month).`
        : `${setupLabel} + ${money(quote.monthlyFee)} for the first month.`;
    const alt =
      period === 'annual'
        ? `Monthly would be ${money(dueToday(quote, 'monthly'))} today.`
        : `Annual prepay would be ${money(dueToday(quote, 'annual'))} today, ${money(savings)} less than twelve monthly payments.`;

    setText('q-kicker', period === 'annual' ? 'Annual prepay' : 'Monthly');
    setText('q-tier', quote.tier.name);
    setText('q-seats', `${quote.seats} ${quote.seats === 1 ? 'user' : 'users'}`);
    setText(
      'q-extra',
      quote.extraSeats === 0
        ? `No extra users. ${quote.tier.name} includes up to ${quote.tier.included} users.`
        : `${quote.extraSeats} extra ${quote.extraSeats === 1 ? 'user' : 'users'} at ${money(quote.tier.extra)} = ${money(quote.extraSeats * quote.tier.extra)}.`,
    );
    setText('q-monthly', money(quote.monthlyFee));
    setText('q-annual', `${money(quote.annualPerMonth)} a month, ${money(quote.annualYear)} for the year`);
    setText('q-setup', quote.tier.setupFrom ? `${money(quote.tier.setup)} starting fee` : money(quote.tier.setup));
    setText('q-extra-rate', `${money(quote.tier.extra)} a month, ${money(quote.tier.extraAnnual)} on annual prepay`);
    setText('q-due', money(due));
    setText('q-due-detail', dueDetail);
    setText('q-alt', alt);
    setText('q-note', quote.note);
    setText(
      'q-setup-note',
      quote.tier.setupFrom
        ? 'The payment uses the $9,500 starting setup fee. If data migration runs past a standard setup, Isom will tell you the difference before that extra work starts.'
        : '',
    );

    const fields = form.elements as HTMLFormControlsCollection & Record<string, HTMLInputElement>;
    fields.tier.value = quote.tier.name;
    fields.extra_seats.value = String(quote.extraSeats);
    fields.monthly_fee.value = String(quote.monthlyFee);
    fields.annual_per_month.value = String(quote.annualPerMonth);
    fields.annual_year.value = String(quote.annualYear);
    fields.setup_fee.value = String(quote.tier.setup);
    fields.due_today.value = String(due);

    presets.forEach((button) => {
      button.setAttribute('aria-pressed', button.dataset.seats === String(bounded) ? 'true' : 'false');
    });
    return quote;
  };

  const syncUrl = () => {
    if (!seatsInput) return;
    const url = new URL(window.location.href);
    url.searchParams.set('seats', seatsInput.value.trim());
    url.searchParams.set('billing', billing());
    window.history.replaceState(null, '', url);
  };

  const params = new URLSearchParams(window.location.search);
  if (seatsInput && /^\d+$/.test(params.get('seats') || '')) {
    seatsInput.value = params.get('seats') || seatsInput.value;
  }
  const billingParam = params.get('billing');
  if (billingParam === 'annual' || billingParam === 'monthly') {
    const radio = form.querySelector<HTMLInputElement>(`input[name="billing"][value="${billingParam}"]`);
    if (radio) radio.checked = true;
  }

  seatsInput?.addEventListener('input', () => {
    render();
    syncUrl();
  });
  form.querySelectorAll<HTMLInputElement>('input[name="billing"]').forEach((radio) => {
    radio.addEventListener('change', () => {
      render();
      syncUrl();
    });
  });
  presets.forEach((button) => {
    button.addEventListener('click', () => {
      if (!seatsInput) return;
      seatsInput.value = button.dataset.seats || seatsInput.value;
      render();
      syncUrl();
      seatsInput.focus();
    });
  });
  render();

  const stripeUrl = (value: string) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname === 'checkout.stripe.com';
    } catch {
      return false;
    }
  };

  fetch('/api/checkout')
    .then((response) => response.json())
    .then((data: { stripe?: boolean }) => {
      if (!placeOrder || !payNote) return;
      if (data.stripe) {
        placeOrder.textContent = 'Continue to payment';
        payNote.textContent =
          'The next step is Stripe. You pay the setup fee and the first period there. Isom Technologies gets the company and contact details with the payment.';
      } else {
        placeOrder.textContent = 'Send order to Isom';
        payNote.textContent =
          'Card checkout is not turned on. Sending this form stores the order for Isom Technologies. No payment is taken.';
      }
    })
    .catch(() => {
      if (placeOrder) placeOrder.textContent = 'Send order to Isom';
    });

  const problems = () => {
    const found: string[] = [];
    const company = (form.elements.namedItem('company') as HTMLInputElement).value.trim();
    const contact = (form.elements.namedItem('contact') as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value.trim();
    const raw = seatsInput?.value.trim() || '';
    const seats = Number(raw);
    if (!/^\d+$/.test(raw) || seats < 1 || seats > 200) found.push('Enter a whole number of users from 1 to 200.');
    if (company.length < 2) found.push('Enter the company name.');
    if (contact.length < 2) found.push('Enter your name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) found.push('Enter a valid email address.');
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 15) found.push('Enter a phone number.');
    return found;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const bot = form.elements.namedItem('bot-field') as HTMLInputElement | null;
    if (bot && bot.value) return;
    render();
    const found = problems();
    if (!errors || !status || !placeOrder || !seatsInput) return;
    errors.replaceChildren();
    if (found.length) {
      const list = document.createElement('ul');
      found.forEach((item) => {
        const li = document.createElement('li');
        li.textContent = item;
        list.append(li);
      });
      errors.append(list);
      errors.hidden = false;
      errors.focus();
      return;
    }
    errors.hidden = true;
    placeOrder.disabled = true;
    status.textContent = 'Sending the order.';
    const payload = {
      seats: Number(seatsInput.value),
      billing: billing(),
      company: (form.elements.namedItem('company') as HTMLInputElement).value.trim(),
      contact: (form.elements.namedItem('contact') as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem('email') as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value.trim(),
      notes: (form.elements.namedItem('notes') as HTMLTextAreaElement).value.trim(),
    };
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (response.status === 400) {
        errors.replaceChildren(document.createTextNode(data.error || 'Check the form and try again.'));
        errors.hidden = false;
        placeOrder.disabled = false;
        status.textContent = '';
        return;
      }
      if (data.mode === 'stripe' && stripeUrl(data.url)) {
        window.location.href = data.url;
        return;
      }
    } catch {
      status.textContent = 'Card checkout is unavailable. Saving the order for Isom Technologies.';
    }
    form.submit();
  });
}
