# carousel-gallery

Custom **carousel** block. Purpose: One-slide-per-view carousel with dots, prev/next (desktop only) and play/pause. Starts paused like the source; pressing play advances every 5s. When the user prefers reduced motion, slide transitions are off and the carousel never starts or keeps playing on its own.

## Authoring (Document Authoring)

Model: `standalone`

Single block table. Content: one row per slide: [image | caption] for photos, [empty | quotation paragraph(s), bold name, position] for quotes.

## Supported variations

- `autoplay`: start playing on load (skipped when the user prefers reduced motion).

## Universal Editor fields

N/A (Document Authoring project)
