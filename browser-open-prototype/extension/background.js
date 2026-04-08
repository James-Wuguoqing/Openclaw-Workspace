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
      return;
    }

    if (action.type === 'close_url' && typeof action.match === 'string') {
      const tabs = await chrome.tabs.query({});
      const normalizedMatch = action.match.toLowerCase();
      const matchedTabs = tabs.filter(tab => typeof tab.url === 'string' && tab.url.toLowerCase().includes(normalizedMatch));
      if (matchedTabs.length) {
        await chrome.tabs.remove(matchedTabs.map(tab => tab.id).filter(Boolean));
        console.log('Closed tabs matching:', action.match);
      } else {
        console.log('No open tabs matched:', action.match);
      }
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
