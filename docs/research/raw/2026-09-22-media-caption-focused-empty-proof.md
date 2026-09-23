# Focused empty media caption proof

The first full-caption Delete repair retained the image and its empty direct
child in the model, but the source-backed browser rendered a blank caption with
no placeholder. The reporter's visual contradiction was valid. The shared
`Caption` component read an element prop that stayed stale during Plite's DOM
text flow. Its focus hook also passed a facade `Range` without `kind` to
`SelectionApi.isText`, which always rejected it.

The published `https://platejs.org/docs/media` demo was tested in Chrome with a
native full selection of `Image caption`. Delete kept the image, but removed
its separate textarea and moved focus to the page body. That older demo does
not exhibit the requested focused-empty-caption behavior, so it is comparison
evidence rather than the target oracle.

On the source-backed `/blocks/editor-ai` editor at local port 3298, Chrome
replay selected all `Images with captions provide context.` and pressed Delete.
The same image remained; the focused `figcaption` showed `Write a caption...`
in the rendered screenshot and DOM. Clicking the preceding heading hid the
empty caption; clicking the image showed the placeholder again. The browser
test also verified that typing after refocus edits the same image's direct
caption child.

- `pnpm --filter www build:registry`: passed; generated registry payloads are
  included.
- `pnpm exec ultracite check apps/www/src/registry/components/editor/caption.tsx apps/www/tests/browser/media-caption-delete.spec.ts`: passed.
- `pnpm --filter www typecheck`: passed, including registry freshness and the
  application TypeScript projects.
- `PLAYWRIGHT_BASE_URL=http://localhost:3298 pnpm --filter www test:www-browser:chromium media-caption.spec.ts media-caption-delete.spec.ts`: 8 passed on the final warmed source-backed server.

The first broad browser run had seven passes and a timeout waiting for five
figures on `/docs/media`; its failure screenshot showed the preview still
compiling with `Loading...`. After compilation, the isolated highlight case
passed and the full eight-case suite passed. The browser proof covers the
shared caption component and the image reporter interaction; it does not
establish every media behavior outside those cases.
