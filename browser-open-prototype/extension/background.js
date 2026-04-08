const POLL_ALARM = 'poll-openclaw-companion';
const POLL_INTERVAL_MINUTES = 0.033; // ~2 seconds
const BASE_URL = 'http://127.0.0.1:3210';

async function reportResult(payload) {
  try {
    await fetch(`${BASE_URL}/report-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.debug('Failed to report companion result:', error?.message || error);
  }
}

async function pollNextAction() {
  try {
    const response = await fetch(`${BASE_URL}/next-action`, { cache: 'no-store' });
    if (!response.ok) return;

    const data = await response.json();
    const action = data && data.action;
    if (!action) return;

    if (action.type === 'open_url' && typeof action.url === 'string') {
      await chrome.tabs.create({ url: action.url });
      await reportResult({
        actionType: 'open_url',
        ok: true,
        url: action.url,
        status: 'opened'
      });
      console.log('Opened URL from companion:', action.url);
      return;
    }

    if (action.type === 'close_url' && typeof action.match === 'string') {
      const tabs = await chrome.tabs.query({});
      const normalizedMatch = action.match.toLowerCase();
      const matchedTabs = tabs.filter(tab => typeof tab.url === 'string' && tab.url.toLowerCase().includes(normalizedMatch));
      const matchedUrls = matchedTabs.map(tab => tab.url).filter(Boolean);
      if (matchedTabs.length) {
        await chrome.tabs.remove(matchedTabs.map(tab => tab.id).filter(Boolean));
        await reportResult({
          actionType: 'close_url',
          ok: true,
          match: action.match,
          status: 'closed',
          closedCount: matchedTabs.length,
          matchedUrls
        });
        console.log('Closed tabs matching:', action.match);
      } else {
        await reportResult({
          actionType: 'close_url',
          ok: false,
          match: action.match,
          status: 'no_match',
          closedCount: 0,
          matchedUrls: []
        });
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
