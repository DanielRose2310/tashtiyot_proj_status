// tabs.js — dashboard module
/* ---------------- TABS ---------------- */
function getAllCharts() {
  return [
    ...Object.values(charts),
    chart1,
    chart2,
    chart3,
    expertsChart,
    pniyotChart,
    avgDurationChart,
    qualityChart,
    workloadChart,
    projectTimelineChart,
    interestsTypePieChart,
    interestsYearChart
  ].filter(Boolean);
}

function activateTab(tab) {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");
  buttons.forEach(button => button.classList.remove("active"));
  panels.forEach(panel => panel.classList.remove("active"));

  const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
  const panel = document.getElementById(`tab-${tab}`);
  if (btn) btn.classList.add("active");
  if (panel) panel.classList.add("active");

  requestAnimationFrame(() => {
    getAllCharts().forEach(chart => {
      if (typeof chart.resize === "function") chart.resize();
    });
  });
}

function goToTableWithConversionFilter(value) {
  const filter = document.getElementById("filterStatus25");
  if (filter) filter.value = value;
  activateTab("table");
  renderTable();
}

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      activateTab(btn.dataset.tab);
    });
  });
}
function renderTableHeader() {
  const header = document.getElementById("tableHeaderRow");

  header.innerHTML = `
    <th data-col="1">גוף תשתית <span class="sort-icon">↕</span></th>
    <th data-col="0">סוג תשתית <span class="sort-icon">↕</span></th>
    <th data-col="2">עדיפות <span class="sort-icon">↕</span></th>
    <th data-col="11">טעינה למאגר <span class="sort-icon">↕</span></th>
    <th data-col="latestConversion">עבר הסבה <span class="sort-icon">↕</span></th>
    ${YEARS.map((y, i) => `<th data-col="${YEAR_INDEXES[i]}">${y} <span class="sort-icon">↕</span></th>`).join("")}
  `;
}
