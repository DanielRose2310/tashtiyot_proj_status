// interests.js — dashboard module

function normalizeInterestsRows(payload) {
  if (Array.isArray(payload)) return payload.map(trimRowKeys);
  if (payload && Array.isArray(payload[INTERESTS_SHEET_NAME])) return payload[INTERESTS_SHEET_NAME].map(trimRowKeys);
  if (payload && Array.isArray(payload.data)) return payload.data.map(trimRowKeys);
  if (payload && payload.data && Array.isArray(payload.data[INTERESTS_SHEET_NAME])) return payload.data[INTERESTS_SHEET_NAME].map(trimRowKeys);
  return [];
}

function getFirstNColumns(rows, count = 4) {
  const firstRow = rows.find(row => row && typeof row === 'object') || {};
  const keys = Object.keys(firstRow).slice(0, count);
  while (keys.length < count) keys.push(`עמודה ${String.fromCharCode(65 + keys.length)}`);
  return keys;
}

function getNthColumnKey(rows, idx) {
  const firstRow = rows.find(row => row && typeof row === 'object') || {};
  return Object.keys(firstRow)[idx] || '';
}

function getInterestCell(row, idx) {
  const key = interestsColumns[idx];
  const value = row?.[key];
  return value === null || value === undefined || String(value).trim() === '' ? '' : String(value).trim();
}

function getInterestCellByAbsoluteColumn(row, idx) {
  const key = getNthColumnKey(interestsRows, idx);
  if (!key) return '';
  const value = row?.[key];
  return value === null || value === undefined || String(value).trim() === '' ? '' : String(value).trim();
}

function isInterestTotalRow(row) {
  return Object.values(row || {}).some(value => {
    const text = String(value ?? '').trim().toUpperCase();
    return text === 'TOTAL' || text === 'סה"כ' || text === 'סהכ';
  });
}

function isRealInterestDataRow(row) {
  if (!row || typeof row !== 'object') return false;
  if (isInterestTotalRow(row)) return false;

  return Object.values(row).some(value => String(value ?? '').trim() !== '');
}

function getInterestDataRows() {
  return interestsRows.filter(isRealInterestDataRow);
}

function getInterestDateKey() {
  return getNthColumnKey(interestsRows, 7);
}

function formatDateDDMMYY(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

function getInterestDate(row) {
  const raw = getInterestCellByAbsoluteColumn(row, 7);
  return formatDateDDMMYY(raw);
}

function parseMetricNumber(value) {
  if (value === null || value === undefined) return null;
  const cleaned = String(value).replace(/[,\s]/g, '').trim();
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function extractYear(value) {
  if (value === null || value === undefined) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  const directYear = raw.match(/\b(19|20)\d{2}\b/);
  if (directYear) return directYear[0];

  const normalized = raw.replace(/\\/g, '/');
  const dmy = normalized.match(/^(\d{1,2})\/(\d{1,2})\/((?:19|20)\d{2})$/);
  if (dmy) return dmy[3];

  const iso = new Date(raw);
  if (!Number.isNaN(iso.getTime())) return String(iso.getFullYear());

  return null;
}

function getInterestMetricFromRowBlankKey(rowIndexZeroBased) {
  const row = interestsRows[rowIndexZeroBased];
  if (!row) return null;
  return parseMetricNumber(row[""]);
}

function renderInterestsSummary() {
  const el = document.getElementById('interestsSummary');
  if (!el) return;

  const fixedValues = [
    getInterestDataRows().length,
    getInterestMetricFromRowBlankKey(1),
    getInterestMetricFromRowBlankKey(2)
  ];

  const cards = INTERESTS_KPI_LABELS.map((label, idx) => {
    const val = fixedValues[idx];
    const cls = idx === 0 ? 'blue' : idx === 1 ? 'green' : 'teal';
    return `
      <div class="s-stat">
        <div class="s-val ${cls}">${val === null ? '—' : val.toLocaleString('he-IL')}</div>
        <div class="s-label">${label}</div>
      </div>
    `;
  }).join('');

  el.innerHTML = `<div class="s-stats">${cards}</div>`;
}

function destroyInterestsCharts() {
  [interestsTypePieChart, interestsYearChart].forEach(chart => {
    if (chart) chart.destroy();
  });
  interestsTypePieChart = null;
  interestsYearChart = null;
}

function renderInterestsCharts() {
  destroyInterestsCharts();

  const typeCounts = {};
  const yearCounts = {};
  const rows = getInterestDataRows();

  rows.forEach(row => {
    const typeValue = getInterestCell(row, 2);
    const yearValue = getInterestDate(row);

    if (typeValue) typeCounts[typeValue] = (typeCounts[typeValue] || 0) + 1;

    const year = extractYear(yearValue);
    if (year) yearCounts[year] = (yearCounts[year] || 0) + 1;
  });

  const typeEntries = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'he'));

  const yearEntries = Object.entries(yearCounts)
    .sort((a, b) => a[0].localeCompare(b[0], 'en'));

  const pieCanvas = document.getElementById('interestsTypePieChart');
  if (pieCanvas) {
    interestsTypePieChart = new Chart(pieCanvas, {
      type: 'doughnut',
      data: {
        labels: typeEntries.map(([label]) => label),
        datasets: [{
          data: typeEntries.map(([, value]) => value),
          backgroundColor: PIE_COLORS,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { padding: 10, font: { size: 10 }, boxWidth: 12 }
          }
        },
        cutout: '58%'
      }
    });
  }

  const yearCanvas = document.getElementById('interestsYearChart');
  if (yearCanvas) {
    interestsYearChart = new Chart(yearCanvas, {
      type: 'bar',
      data: {
        labels: yearEntries.map(([year]) => year),
        datasets: [{
          label: 'כמות רשומות',
          data: yearEntries.map(([, count]) => count),
          backgroundColor: C.blue,
          borderRadius: 6,
          maxBarThickness: 48
        }]
      },
      options: chartOpts({
        plugins: { legend: { display: false } }
      })
    });
  }
}

function renderInterestsTable() {
  const tbody = document.getElementById('interestsBody');
  const countEl = document.getElementById('interestsCount');
  const searchValue = (document.getElementById('interestsSearchInput')?.value || '').trim().toLowerCase();

  document.getElementById('interestsCol1Header').textContent = interestsColumns[0] || 'עמודה A';
  document.getElementById('interestsCol2Header').textContent = interestsColumns[1] || 'עמודה B';
  document.getElementById('interestsCol3Header').textContent = interestsColumns[2] || 'עמודה C';
  document.getElementById('interestsCol4Header').textContent = interestsColumns[3] || 'עמודה D';

  const dateHeader = document.getElementById('interestsDateHeader');
  if (dateHeader) dateHeader.textContent = getInterestDateKey() || 'תאריך';

  const filtered = getInterestDataRows().filter(row => {
    const values = [
      ...interestsColumns.map((_, idx) => getInterestCell(row, idx).toLowerCase()),
      (getInterestDate(row) || '').toLowerCase()
    ];

    if (!searchValue) return true;
    return values.some(v => v.includes(searchValue));
  });

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="no-results">${renderEmptyState()}</td></tr>`;
    if (countEl) countEl.textContent = '0 שורות';
    return;
  }

  tbody.innerHTML = filtered.map(row => `
    <tr>
      <td>${getInterestCell(row, 0) || '<span class="dash">—</span>'}</td>
      <td>${getInterestCell(row, 1) || '<span class="dash">—</span>'}</td>
      <td>${getInterestCell(row, 2) || '<span class="dash">—</span>'}</td>
      <td>${getInterestCell(row, 3) || '<span class="dash">—</span>'}</td>
      <td>${getInterestDate(row) || '<span class="dash">—</span>'}</td>
    </tr>
  `).join('');

  if (countEl) countEl.textContent = `${filtered.length.toLocaleString('he-IL')} שורות`;
}

function setInterestsLoadingState(message = 'טוען נתוני אינטרסים...') {
  const summary = document.getElementById('interestsSummary');
  const body = document.getElementById('interestsBody');
  const countEl = document.getElementById('interestsCount');

  if (summary) {
    summary.innerHTML = renderSkeletonSummary() + `
      <div class="loading-shell">
        <div class="spinner"></div>
        <div class="section-sub">${message}</div>
      </div>`;
  }

  if (body) body.innerHTML = renderSkeletonTableRows(5, 8);
  if (countEl) countEl.textContent = 'טוען...';

  destroyInterestsCharts();
  setChartWidgetsLoading(INTERESTS_CHART_IDS, true, message);
}

function setInterestsErrorState(message) {
  const summary = document.getElementById('interestsSummary');
  const body = document.getElementById('interestsBody');
  const countEl = document.getElementById('interestsCount');

  if (summary) {
    summary.innerHTML = `
      <div style="color:var(--red);font-weight:700;">שגיאה בטעינת נתוני אינטרסים</div>
      <div class="section-sub">${message}</div>`;
  }

  if (body) body.innerHTML = `<tr><td colspan="5" class="no-results">${renderEmptyState("שגיאה בטעינת הנתונים", message)}</td></tr>`;
  if (countEl) countEl.textContent = '';

  destroyInterestsCharts();
  setChartWidgetsLoading(INTERESTS_CHART_IDS, false);
}

function bindInterestsEvents() {
  const searchInput = document.getElementById('interestsSearchInput');
  const clearBtn = document.getElementById('clearInterestsFilters');

  if (searchInput && !searchInput.dataset.bound) {
    searchInput.addEventListener('input', debounce(renderInterestsTable, 120));
    searchInput.dataset.bound = 'true';
  }

  if (clearBtn && !clearBtn.dataset.bound) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      renderInterestsTable();
    });
    clearBtn.dataset.bound = 'true';
  }
}

async function loadInterestsDashboardFromPayload(payload) {
  setInterestsLoadingState();

  try {
    const rows = normalizeInterestsRows(payload);
    if (!rows.length) throw new Error(`Sheet "${INTERESTS_SHEET_NAME}" not found or empty.`);

    interestsRows = rows;
    interestsColumns = getFirstNColumns(rows, 4);

    renderInterestsSummary();
    renderInterestsCharts();
    setChartWidgetsLoading(INTERESTS_CHART_IDS, false);
    renderInterestsTable();
  } catch (error) {
    console.error('Failed to load interests data:', error);
    setInterestsErrorState('לא ניתן לטעון נתוני אינטרסים מתוך נתוני השרת.');
  }
}