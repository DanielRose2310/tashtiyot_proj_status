// app.js — dashboard module
let interestsPayloadPromise = null;

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
