// tabs.js — dashboard module

/* ---------------- TABS ---------------- */

const DEFAULT_TAB = "overview";

const TAB_PARAM_MAP = {
  overview: "overview",
  table: "table",
  experts: "experts",
  technicians: "experts", // alias for מידענים
  pniyot: "pniyot",
  interests: "interests"
};

function getAllCharts() {
  return [
    ...Object.values(charts),
    chart1,
    chart2,
    chart3,
    overviewWeeklyProjectsChart,
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

function normalizeTab(tab) {
  return TAB_PARAM_MAP[tab] || DEFAULT_TAB;
}

function getTabFromUrl() {
  const params = new URLSearchParams(window.location.search);

  // Preferred format: ?tab=experts
  const tabParam = params.get("tab");
  if (tabParam) return normalizeTab(tabParam);

  // Alias/flag format: ?technicians, ?experts, ?table, etc.
  for (const [paramName, tabName] of Object.entries(TAB_PARAM_MAP)) {
    if (params.has(paramName)) return tabName;
  }

  return DEFAULT_TAB;
}

function setTabInUrl(tab, replace = false) {
  const normalizedTab = normalizeTab(tab);
  const params = new URLSearchParams(window.location.search);

  // Remove old flag-style params so the URL has one tab source of truth.
  Object.keys(TAB_PARAM_MAP).forEach(paramName => params.delete(paramName));

  params.set("tab", normalizedTab);

  const queryString = params.toString();
  const newUrl = `${window.location.pathname}${queryString ? `?${queryString}` : ""}${window.location.hash}`;

  if (replace) {
    history.replaceState({ tab: normalizedTab }, "", newUrl);
  } else {
    history.pushState({ tab: normalizedTab }, "", newUrl);
  }
}

function activateTab(tab) {
  const normalizedTab = normalizeTab(tab);
  const buttons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  buttons.forEach(button => button.classList.remove("active"));
  panels.forEach(panel => panel.classList.remove("active"));

  const btn = document.querySelector(`.tab-btn[data-tab="${normalizedTab}"]`);
  const panel = document.getElementById(`tab-${normalizedTab}`);

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
  setTabInUrl("table");
  renderTable();
}

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      activateTab(tab);
      setTabInUrl(tab);
    });
  });

  // Open the tab requested by URL, e.g. ?tab=experts or ?technicians.
  const initialTab = getTabFromUrl();
  activateTab(initialTab);
  setTabInUrl(initialTab, true);

  // Keep browser back/forward in sync with tabs.
  window.addEventListener("popstate", () => {
    activateTab(getTabFromUrl());
  });
}

function renderTableHeader() {
  const header = document.getElementById("tableHeaderRow");
  header.innerHTML = `
    <th>גוף תשתית ↕</th>
    <th>סוג תשתית ↕</th>
    <th>עדיפות ↕</th>
    <th>טעינה למאגר ↕</th>
    <th>עבר הסבה ↕</th>
    ${YEARS.map((y, i) => `<th>${y} ↕</th>`).join("")}
  `;
}
