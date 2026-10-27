import { loadScript } from '../../scripts/aem.js';

/*
 * Brand Concierge (Adobe Experience Platform web agent).
 *
 * Reproduces the vendor deploy script: the Web SDK (alloy) queue stub, `alloy("configure")` +
 * `alloy("sendEvent")`, alloy.min.js, the Brand Concierge main.js, then
 * `adobe.concierge.bootstrap()` into a mount element inside the block. The agent's styling
 * configuration (vendor styleConfigurations.js) lives in style-config.json next to this file.
 * Everything loads only when the block nears the viewport, so pages without it pay nothing.
 */
const CONFIG_URL = new URL('./style-config.json', import.meta.url).href;
const ALLOY_SRC = 'https://cdn1.adoberesources.net/alloy/2.35.1/alloy.min.js';
const CONCIERGE_SRC = 'https://experience.adobe.net/solutions/experience-platform-brand-concierge-web-agent/static-assets/main.js';
const MOUNT_ID = 'brand-concierge-mount';
const WAIT_MS = 10000;

const ALLOY_CONFIG = {
  defaultConsent: 'in',
  edgeDomain: 'edge.adobedc.net',
  edgeBasePath: 'ee',
  datastreamId: '4365b1d5-1fb0-47e8-8f7d-25c9717c994f',
  orgId: '447AE26358FA40C50A495DB1@AdobeOrg',
  debugEnabled: true,
  idMigrationEnabled: false,
  thirdPartyCookiesEnabled: false,
  prehidingStyle: '.personalization-container { opacity: 0 !important }',
  // Must match the region provisioned for the Brand Concierge customer.
  conversation: { region: 'aus5' },
};

let sdkReady;

/**
 * Installs the alloy queue stub, queues configure + sendEvent and loads the vendor scripts.
 * Runs once per page, however many blocks there are.
 * @returns {Promise<void>}
 */
function loadSdk() {
  if (!sdkReady) {
    const w = window;
    if (!w.alloy) {
      // __alloyNS is the Web SDK's own global; its name is fixed by the vendor
      // eslint-disable-next-line no-underscore-dangle
      (w.__alloyNS = w.__alloyNS || []).push('alloy');
      w.alloy = (...args) => new Promise((resolve, reject) => {
        w.alloy.q.push([resolve, reject, args]);
      });
      w.alloy.q = [];
    }
    w.alloy('configure', ALLOY_CONFIG);
    w.alloy('sendEvent', {});
    sdkReady = loadScript(ALLOY_SRC).then(() => loadScript(CONCIERGE_SRC));
  }
  return sdkReady;
}

function waitForConcierge(timeout = WAIT_MS) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (window.adobe?.concierge?.bootstrap) resolve(window.adobe.concierge);
      else if (Date.now() - start > timeout) reject(new Error('adobe.concierge not available'));
      else setTimeout(check, 100);
    };
    check();
  });
}

async function init(block, selector) {
  try {
    const [config, concierge] = await Promise.all([
      fetch(CONFIG_URL).then((resp) => {
        if (!resp.ok) throw new Error(`style config ${resp.status}`);
        return resp.json();
      }),
      loadSdk().then(() => waitForConcierge()),
    ]);
    window.styleConfiguration = config;
    concierge.bootstrap({
      instanceName: 'alloy',
      stylingConfigurations: config,
      selector,
      stickySession: false,
    });
    block.dataset.conciergeStatus = 'ready';
  } catch (e) {
    block.dataset.conciergeStatus = 'error';
    // eslint-disable-next-line no-console
    console.error('brand-concierge block failed:', e);
  }
}

export default function decorate(block) {
  block.textContent = '';
  const mount = document.createElement('div');
  const count = document.querySelectorAll(`[id^="${MOUNT_ID}"]`).length;
  mount.id = count ? `${MOUNT_ID}-${count + 1}` : MOUNT_ID;
  block.append(mount);

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      init(block, `#${mount.id}`);
    }
  }, { rootMargin: '200px' });
  observer.observe(block);
}
