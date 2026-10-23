/**
 * table-key-value: two-column label/value table without a header row.
 * Authoring: one row per entry, [label | value]. Values may hold links and
 * inline formatting; cell content is moved, not re-created.
 * Rows with a single cell span both columns; extra cells are merged into the value.
 * @param {Element} block
 */

function moveContent(from, to) {
  // unwrap a lone paragraph so the cell text sits directly in the table cell
  const only = from.children.length === 1 && from.firstElementChild.tagName === 'P'
    && from.childNodes.length === 1;
  to.append(...(only ? from.firstElementChild.childNodes : from.childNodes));
}

export default function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')]
    .filter((row) => row.children.length && row.textContent.trim());

  const table = document.createElement('table');
  table.className = 'table-key-value-table';
  const tbody = document.createElement('tbody');

  rows.forEach((row) => {
    const [labelCell, ...valueCells] = [...row.children];
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.scope = 'row';
    th.className = 'table-key-value-label';
    moveContent(labelCell, th);
    tr.append(th);
    if (valueCells.length) {
      const td = document.createElement('td');
      td.className = 'table-key-value-value';
      valueCells.forEach((cell) => moveContent(cell, td));
      tr.append(td);
    } else {
      th.colSpan = 2;
    }
    tbody.append(tr);
  });

  table.append(tbody);
  block.replaceChildren(table);
}
