const list = document.querySelector<HTMLUListElement>('#payroll-checks');
if (list) {
  const key = 'cr-payroll-checklist';
  const boxes = Array.from(list.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'));
  const count = document.getElementById('check-count');
  const saved = (() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  })();

  const paint = () => {
    const done = boxes.filter((box) => box.checked).length;
    if (count) count.textContent = `${done} of ${boxes.length} checked`;
    const state: Record<string, boolean> = {};
    boxes.forEach((box) => {
      state[box.id] = box.checked;
    });
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* private mode can block storage; the list still works */
    }
  };

  boxes.forEach((box) => {
    if (saved[box.id]) box.checked = true;
    box.addEventListener('change', paint);
  });
  paint();

  document.getElementById('check-reset')?.addEventListener('click', () => {
    boxes.forEach((box) => {
      box.checked = false;
    });
    paint();
  });
  document.getElementById('check-print')?.addEventListener('click', () => {
    window.print();
  });
}
