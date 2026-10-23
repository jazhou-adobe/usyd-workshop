# embed-formstack

Custom **embed** block. Purpose: Embed a live Formstack form from its public URL.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: row 1 = link to https://<account>.formstack.com/forms/<slug> (link text, if not the URL, becomes the accessible name).

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Behaviour

- The form URL is read from the authored link; nothing is hardcoded. Only `https://*.formstack.com` URLs are accepted; otherwise the block removes itself.
- The form loads in a sandboxed iframe (`allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox`) once the block is within 400px of the viewport (IntersectionObserver; loads immediately where unsupported). The iframe also has `loading="lazy"`.
- The block is a `role="region"` named by the link text (default "Online form"); the iframe gets the same `title`.
- An "Open the ... in a new tab" link stays below the frame as a fallback if framing fails.

## Why not the Formstack JS embed (`/forms/js.php/<slug>`)

`head.html` sets `script-src 'nonce-aem' 'strict-dynamic' ...` plus `require-trusted-types-for 'script'`. A script element created by the nonce'd `scripts.js` module graph would be allowed under `strict-dynamic`, and the `default` Trusted Types policy in `scripts/scripts.js` passes script URLs through, so CSP alone does not block it. But js.php renders the form entirely through `document.write(...)`, which browsers ignore for asynchronously inserted scripts (and the default TT policy strips `<script>` from `document.write` HTML). Injected after page load it would render nothing, so the block uses the iframe. `frame-src 'self' https:` in the CSP allows the Formstack frame, and Formstack sends no `X-Frame-Options`.

A cross-origin frame cannot size itself to the form (Formstack sends no resize messages and scrolls inside its own full-viewport container), so the heights are fixed in `embed-formstack.css`: the frame starts at the first-screen height (1000px) and gets `.embed-formstack-expanded` (3760px mobile, 3180px from 900px) once the reader clicks, taps or tabs into it, detected as the page window blurring onto the frame after the form's own autofocus has been undone. The expanded height fits the longest conditional branch with no inner scrollbar; adjust both custom properties if the form changes length.

From 1024px, in a section without a `split` layout, the block takes the source form column (59.13% wide, right-aligned).
