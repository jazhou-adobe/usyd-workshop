# toc-on-this-page

Custom **toc** block. Purpose: Auto-generated 'On this page' list of anchor links to the page H2s.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: optional row 1 = title text (default 'On this page'); no other rows.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Behaviour

- Collects every non-empty `h2` in `main` (excluding any inside a TOC block) and builds an ordered list of `#id` links. EDS already gives headings ids; any H2 without one gets a unique slug id.
- The title is the authored row text, or "On this page" when the block is empty. It is a paragraph, not a heading, so it never lists itself; the list is wrapped in a `nav` labelled by the title.
- With no H2s on the page the block wrapper is removed, and the section is hidden if nothing else is left in it.
