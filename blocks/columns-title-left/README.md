# columns-title-left

Custom **columns** block. Purpose: Narrow title column (optional icon above, optional stat tile below) beside wide body copy.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: each row = [optional icon image, heading (H2), optional stat tile: strong value paragraph + caption paragraph (link either to link the whole tile) | body paragraphs, images, buttons].

## Supported variations

No authored variations. Layout is derived from placement:

- **One instance per section** (steps, Priority Driven Program): 33% / 58% columns with a 9% gap. When the previous section also ends with this block, a thin grey rule is drawn between them (`follows-sibling`).
- **Several instances in one section** (our-facilities, get-involved): `stacked` list layout, 1/3 + 2/3 columns with a 132px gap, a top rule on every instance and 16px between instances.

Icons: a title-cell paragraph containing only an `:icon-name:` token is rendered from `icons/icon-name.svg` (72px) even when the token reaches the browser as raw text.

CTAs: bold links (`a.button.primary`) render as the source ochre button. Plain links stay inline links.

## Universal Editor fields

N/A (Document Authoring project)
