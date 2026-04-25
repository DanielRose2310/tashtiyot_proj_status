// app.js — dashboard module
let interestsPayloadPromise = null;

function setupThemeToggle(){
  const btn=document.getElementById('themeToggle');
  if(!btn)return;
  const savedTheme=localStorage.getItem('dashboard-theme')||'light';
  document.documentElement.dataset.theme=savedTheme;
  btn.textContent=savedTheme==='dark'?'מצב בהיר':'מצב כהה';
  btn.addEventListener('click',()=>{
    const current=document.documentElement.dataset.theme||'light';
    const next=current==='dark'?'light':'dark';
    document.documentElement.dataset.theme=next;
    localStorage.setItem('dashboard-theme',next);
    btn.textContent=next==='dark'?'מצב בהיר':'מצב כהה';
  });
}
function setupChartDefaults(){
  if(!window.Chart)return;
  Chart.defaults.plugins.tooltip.backgroundColor='#111827';
  Chart.defaults.plugins.tooltip.titleColor='#ffffff';
  Chart.defaults.plugins.tooltip.bodyColor='#ffffff';
  Chart.defaults.plugins.tooltip.padding=12;
  Chart.defaults.plugins.tooltip.cornerRadius=10;
  Chart.defaults.plugins.tooltip.titleFont={weight:'700'};
  Chart.defaults.plugins.tooltip.bodyFont={size:12};
}

async function fetchInterestsPayloadOnce() {
  if (!interestsPayloadPromise) {
    interestsPayloadPromise = fetch(INTERESTS_API_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    }).then(async response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    });
  }

  return interestsPayloadPromise;
}

document.addEventListener('DOMContentLoaded', async () => {
  setupThemeToggle();
  setupChartDefaults();
  setupTabs();
  bindOriginalEvents();
  bindInterestsEvents();

  setLoadingState('טוען נתוני הסבת תשתיות...');
  setInterestsLoadingState('טוען נתוני אינטרסים...');
  setConversionLoadingState('טוען נתוני משימות והסבות...');

  const conversionPromise = loadConversionDashboard();

  try {
    const interestsPayload = await fetchInterestsPayloadOnce();
    loadOriginalDataFromPayload(interestsPayload);
    loadInterestsDashboardFromPayload(interestsPayload);
  } catch (error) {
    console.error('Failed to load shared interests payload:', error);
    setErrorState('לא ניתן לטעון נתונים מהשרת. בדוק הרשאות / CORS / מבנה JSON.');
    setInterestsErrorState('לא ניתן לטעון נתונים מהשרת. בדוק הרשאות / CORS / מבנה JSON.');
  }

  await conversionPromise;
});
