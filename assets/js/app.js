// app.js — dashboard module
let interestsPayloadPromise = null;

function setupThemeToggle() {
  const root = document.documentElement;
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const icon = btn.querySelector(".theme-toggle__icon");
  const text = btn.querySelector(".theme-toggle__text");

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    localStorage.setItem("dashboard-theme", theme);

    if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙";
    if (text) text.textContent = theme === "dark" ? "מצב בהיר" : "מצב כהה";
  }

  const savedTheme = localStorage.getItem("dashboard-theme") || "light";
  applyTheme(savedTheme);

  btn.addEventListener("click", () => {
    const current = root.getAttribute("data-theme") || "light";
    applyTheme(current === "dark" ? "light" : "dark");
  });
}

function setupChartDefaults() {
  if (!window.Chart) return;

  Chart.defaults.plugins.tooltip.backgroundColor = "#111827";
  Chart.defaults.plugins.tooltip.titleColor = "#ffffff";
  Chart.defaults.plugins.tooltip.bodyColor = "#ffffff";
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 10;
  Chart.defaults.plugins.tooltip.titleFont = { weight: "700" };
  Chart.defaults.plugins.tooltip.bodyFont = { size: 12 };
}

async function fetchInterestsPayloadOnce() {
  if (!interestsPayloadPromise) {
    interestsPayloadPromise = fetch(INTERESTS_API_URL, {
      method: "GET",
      headers: { Accept: "application/json" }
    }).then(async response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    });
  }

  return interestsPayloadPromise;
}

document.addEventListener("DOMContentLoaded", async () => {
  setupThemeToggle();
  setupChartDefaults();
  setupTabs();
  bindOriginalEvents();
  bindInterestsEvents();

  setLoadingState("טוען נתוני הסבת תשתיות...");
  setInterestsLoadingState("טוען נתוני אינטרסים...");
  setConversionLoadingState("טוען נתוני משימות והסבות...");

  const conversionPromise = loadConversionDashboard();

  try {
    const interestsPayload = await fetchInterestsPayloadOnce();
    loadOriginalDataFromPayload(interestsPayload);
    loadInterestsDashboardFromPayload(interestsPayload);
  } catch (error) {
    console.error("Failed to load shared interests payload:", error);
    setErrorState("לא ניתן לטעון נתונים מהשרת. בדוק הרשאות / CORS / מבנה JSON.");
    setInterestsErrorState("לא ניתן לטעון נתונים מהשרת. בדוק הרשאות / CORS / מבנה JSON.");
  }

  await conversionPromise;
});