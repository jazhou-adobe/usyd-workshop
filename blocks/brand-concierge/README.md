# brand-concierge

Custom **brand-concierge** block. Purpose: embeds the Adobe Experience Platform Brand Concierge web agent
(conversational assistant) where the block is placed. Ported from
`aclarke-adobe/uom-da` `blocks/brand-concierge`.

## Authoring (Document Authoring)

Model: `standalone`

Add a block table named **Brand Concierge**. Content is ignored; an empty one-row table is enough.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Behaviour

- When the block comes within 200px of the viewport it installs the Web SDK (`alloy`) queue stub, queues
  `alloy("configure")` + `alloy("sendEvent")`, loads `alloy.min.js` 2.35.1 then the Brand Concierge `main.js`,
  and calls `adobe.concierge.bootstrap()` into a mount inside the block (`#brand-concierge-mount`; further
  blocks on the page get numbered ids). Pages without the block load none of it.
- Web SDK settings (`ALLOY_CONFIG` in `brand-concierge.js`), from the vendor deploy script: datastream
  `4365b1d5-1fb0-47e8-8f7d-25c9717c994f`, org `447AE26358FA40C50A495DB1@AdobeOrg`, edge `edge.adobedc.net/ee`,
  `defaultConsent: 'in'`, `debugEnabled: true`, conversation region `aus5`.
- The Web SDK is configured once per page, even with several blocks.
- The agent's styling configuration (vendor `styleConfigurations.js`) is `style-config.json` (University of
  Sydney / Drug Discovery copy, prompts and images); edit it to change the agent's text, prompts and theme.
- `block.dataset.conciergeStatus` is `ready` once bootstrapped, or `error` (details in the console).
- The site's consent placeholder (`scripts/consent-check.js`) is not consulted; the Web SDK uses
  `defaultConsent` as in the vendor deploy script.
- CSP: the scripts are inserted by the nonce'd module graph, so `strict-dynamic` allows them.
