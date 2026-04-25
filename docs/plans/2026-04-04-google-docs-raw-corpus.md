# Google Docs Raw Corpus

## Goal

Expand the current narrow Google Docs sample in `../raw/google-docs` into a
real raw corpus of official Google Docs Editors Help pages.

## Phases

- [x] Find the official Google Docs help surface and choose the right inventory strategy
- [x] Build a URL inventory for the corpus
- [ ] Fetch the pages into `../raw/google-docs`
- [x] Generate indexes/catalogs and document the corpus
- [x] Read back the resulting raw layer for consistency

## Notes

- This should stay on official `support.google.com/docs` pages.
- The goal is the raw corpus first, not compiled research yet.
- The earlier four-page sample should be absorbed into the fuller corpus, not kept as a separate toy lane.
- The official surface discovered in this pass contains `28` topic pages and
  `292` answer pages.
- A bulk Crawl4AI fetch tripped Google's `unusual traffic` wall. The generated
  CAPTCHA markdown was deleted instead of being kept as fake raw content.
- The valid state now is:
  - full inventory on disk
  - four clean seed extracts on disk
  - full page-body pull blocked until the rate-limit cools down or a human
    solves the support-site CAPTCHA in the shared debug browser
