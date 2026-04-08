const POLL_ALARM = 'poll-openclaw-companion';
const POLL_INTERVAL_MINUTES = 0.033; // ~2 seconds
const BASE_URL = 'http://127.0.0.1:3210';

async function pollNextAction() {
  try {
    const response = await fetch(`${BASE_URL}/next-action`, { cache: 'no-store' });
    if (!response.ok) return;

    const data = await response.json();
    const action = data && data.action;
    if (!action) return;

    if (action.type === 'open_url' && typeof action.url === 'string') {
      await chrome.tabs.create({ url: action.url });
      console.log('Opened URL from companion:', action.url);
    }
  } catch (error) {
    console.debug('OpenClaw companion poll failed:', error?.message || error);
  }
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(POLL_ALARM, { periodInMinutes: POLL_INTERVAL_MINUTES });
  pollNextAction();
});

chrome.runtime.onStartup?.addListener(() => {
  chrome.alarms.create(POLL_ALARM, { periodInMinutes: POLL_INTERVAL_MINUTES });
  pollNextAction();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === POLL_ALARM) {
    pollNextAction();
  }
});
