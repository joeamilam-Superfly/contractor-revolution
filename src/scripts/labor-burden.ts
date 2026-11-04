const form = document.querySelector<HTMLFormElement>('#burden-form');
if (form) {
  const money = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const num = (id: string) => {
    const input = document.getElementById(id) as HTMLInputElement | null;
    const value = Number(input?.value);
    return Number.isFinite(value) ? value : NaN;
  };

  const set = (id: string, value: string) => {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  };

  const run = () => {
    const wage = num('wage');
    const paid = num('paid-hours');
    const taxPct = num('tax-pct');
    const compPct = num('comp-pct');
    const benefits = num('benefits');
    const other = num('other');
    const pto = num('pto-hours');
    const error = document.getElementById('burden-error');
    const out = document.getElementById('burden-out');
    const fail = (message: string) => {
      if (error) {
        error.hidden = false;
        error.textContent = message;
      }
      if (out) out.hidden = true;
    };

    if ([wage, paid, taxPct, compPct, benefits, other, pto].some((value) => Number.isNaN(value))) {
      fail('Enter a number in every field. Use 0 if a cost does not apply.');
      return;
    }
    if (wage < 0 || paid <= 0 || taxPct < 0 || compPct < 0 || benefits < 0 || other < 0 || pto < 0) {
      fail('Hours paid per year must be above zero. Costs cannot be negative.');
      return;
    }
    if (pto >= paid) {
      fail('PTO hours have to be less than hours paid. Otherwise there are no hours left to put on a job.');
      return;
    }

    const wages = wage * paid;
    const tax = wages * (taxPct / 100);
    const comp = wages * (compPct / 100);
    const total = wages + tax + comp + benefits + other;
    const productive = paid - pto;
    const perPaid = total / paid;
    const perJob = total / productive;

    if (error) error.hidden = true;
    if (out) out.hidden = false;
    set('r-wages', money(wages));
    set('r-tax', money(tax));
    set('r-comp', money(comp));
    set('r-benefits', money(benefits));
    set('r-other', money(other));
    set('r-total', money(total));
    set('r-productive', productive.toLocaleString('en-US'));
    set('r-paid-hour', money(perPaid));
    set('r-job-hour', money(perJob));
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    run();
  });
  form.addEventListener('input', run);
  run();
}
