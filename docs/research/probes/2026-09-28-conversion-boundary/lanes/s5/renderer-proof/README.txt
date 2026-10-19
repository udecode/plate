Lane S5 renderer proof: webpack production build with bare `react-dom/server`

Snapshot: main at 2026-09-29T13:23:53Z (HEAD a7750ad388 + 492 changed/untracked
files, 4 deletions; list fingerprint 3e1702fb7ba9; files in snapshot-files.sha256),
copied into one scratch worktree. renderStaticHtmlWithOverrides.tsx line 5:
`import { renderToStaticMarkup } from 'react-dom/server';`

Command (apps/www, the verdict-2 build without --no-mangling):
  PLATE_WWW_PLITE=1 PLATE_WWW_WEBPACK=1 PLATE_WWW_ASYNC_DOCS=1 PLATE_WWW_DIST_DIR=.next-rp \
  NODE_OPTIONS=--max-old-space-size=8192 next build --webpack --debug-build-paths \
  "src/app/(blocks)/blocks/[name]/page.tsx,src/app/(blocks)/blocks/clipboard-static-proof/page.tsx,src/app/(blocks)/blocks/clipboard-upload-proof/page.tsx,src/app/(view)/view/[name]/page.tsx,src/app/api/files/route.ts,src/app/api/plite/ready/route.ts"

Result: the build fails (exit 1, 47 s; build-webpack-blocks-view-api.log).
  ../../packages/platejs/src/static/internal/renderStaticHtmlWithOverrides.tsx
  Error: You're importing a component that imports react-dom/server. To fix it,
  render or return the content directly as a Server Component instead for perf
  and security.
  Import trace: renderStaticHtmlWithOverrides.tsx <- static/renderStaticHtml.tsx
  <- static/index.ts <- src/registry/blocks/html-export/page.tsx
  <- src/lib/registry-component.tsx <- src/lib/block-preview-page.tsx
  <- src/app/(blocks)/blocks/[name]/page.tsx
The same error appeared in a first attempt that also built the git-ignored
local api/ai/{command,copilot} routes, traced through the registry AI command
route and plugins-static.ts instead (that log was overwritten).

Not run, because there is no build to serve: docx.spec.ts, clipboard.spec.ts,
static-clipboard.spec.ts and the client-bundle grep for the legacy stub.

Earlier reference: the verdict-2 build of the same pipeline with
`react-dom/server.browser` (snapshot 2026-09-29T11:59:28Z) compiled, and
docx.spec.ts passed 3/3 on it (../verdict-2/reruns/chromium-docx.log).

run-2: runtime-selected import (PASS)

Snapshot: main at 2026-09-29T14:03:42Z (505 changed/untracked files,
4 deletions; list fingerprint c0eae6e8c6cd; run-2-snapshot-files.sha256). The
renderer has no static react-dom import; at call time it imports
`react-dom/server.edge` when `globalThis.process?.versions?.node` is set and
`react-dom/server.browser` otherwise.

Build: same command as run 1 plus `src/app/(app)/docs/[[...slug]]/page.tsx`
and the git-ignored local api/ai/{command,copilot} routes. Exit 0, 118 s,
"Compiled successfully" (run-2-build-webpack.log). Served with `next start`
(PLATE_WWW_PLITE=1) on :3581; /blocks/docx-demo, /blocks/html-demo,
/docs/examples/html-export and /docs/html return 200.

Chromium specs (PLAYWRIGHT_BASE_URL=http://localhost:3581):
  docx.spec.ts              3/3, including "the export menu applies one
                            suggestion projection to every format"
  clipboard.spec.ts         6/6
  static-clipboard.spec.ts  1/1
(run-2-chromium-*.log)

Client chunks (.next-rp2/static/chunks):
  3587.*.js  660 B  Next's react-dom/server stub ("do not use legacy
                    react-dom/server APIs"): the `.edge` branch, bundled but
                    never loaded in the browser.
  2989.*.js  295 B  react-dom/server.browser entry: re-exports
                    renderToString/renderToStaticMarkup from module 26738 and
                    renderToReadableStream from module 18120.
  db8353ba.*.js 98 KB  React's legacy browser server renderer
                    (renderToStaticMarkup, "does not support Suspense").
  b81bf5dc.*.js 102 KB React's streaming browser renderer
                    (renderToReadableStream, MessageChannel).
Clicking Export > Export as HTML on /blocks/docx-demo downloaded plate.html
with no page error and loaded exactly b81bf5dc, db8353ba and 2989; the stub
chunk 3587 was not requested (run-2-export-chunks.json,
run-2-export-chunks-probe.mjs).
