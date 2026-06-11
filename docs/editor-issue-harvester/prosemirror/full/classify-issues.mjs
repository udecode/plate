#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = 'docs/editor-issue-harvester/prosemirror/full'
const rawRoot = '.tmp/editor-issue-harvester/prosemirror/raw'
const legacyRawRoot = '.tmp/editor-issue-harvester/prosemirror/full'
const rawInputPath = path.join(rawRoot, 'issues-all-with-bodies.json')
const legacyInputPath = path.join(legacyRawRoot, 'issues-all-with-bodies.json')
const inputPath = existsSync(rawInputPath) ? rawInputPath : legacyInputPath
const issues = JSON.parse(readFileSync(inputPath, 'utf8'))
const checkpointDir = path.join(root, 'checkpoints')
mkdirSync(checkpointDir, { recursive: true })

const owners = {
  api: {
    action: 'defer-api-design',
    command: 'select or add a focused Slate-v2 API/DX target before implementation',
    owner: 'Slate-v2 API/DX design owner',
    proof: 'package API contract and docs proof required',
  },
  clipboard: {
    action: 'refactor-existing/create-new',
    command:
      'PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/paste-html.test.ts --project=chromium --grep "paste|clipboard|copy|cut"',
    owner:
      '.tmp/slate-v2/playwright/integration/examples/paste-html.test.ts; .tmp/slate-v2/packages/slate-dom/test/clipboard-boundary.ts',
    proof: 'browser clipboard/serialization proof',
  },
  collab: {
    action: 'create-new/defer-collab-browser',
    command:
      'bun test ./packages/slate/test/collab-history-runtime-contract.ts --test-name-pattern "remote|selection|history|collab"',
    owner:
      '.tmp/slate-v2/packages/slate/test/collab-history-runtime-contract.ts; future yjs/browser collaboration lane',
    proof: 'package remote-edit/history proof; browser/provider proof when transport matters',
  },
  decoration: {
    action: 'refactor-existing/create-new',
    command:
      'PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/inlines.test.ts --project=chromium --grep "inline|link|decorator|void|triple-click|Backspace|Enter"',
    owner:
      '.tmp/slate-v2/playwright/integration/examples/inlines.test.ts; .tmp/slate-v2/playwright/integration/examples/editable-voids.test.ts',
    proof: 'browser decoration/inline/void boundary proof',
  },
  history: {
    action: 'refactor-existing/create-new',
    command:
      'bun test ./packages/slate-history/test/history-contract.ts --test-name-pattern "history|undo|redo|batch|selection"',
    owner: '.tmp/slate-v2/packages/slate-history/test/history-contract.ts',
    proof: 'package history contract proof',
  },
  ime: {
    action: 'refactor-existing/create-new',
    command:
      'PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "IME|composition|beforeinput"',
    owner:
      '.tmp/slate-v2/playwright/integration/examples/richtext.test.ts; .tmp/slate-v2/packages/slate-browser/src/playwright/ime.ts',
    proof: 'browser IME/beforeinput proof',
  },
  mobile: {
    action: 'defer-raw-device',
    command:
      'bun test:mobile-device-proof:raw or add a focused raw-device/platform browser target',
    owner: 'Slate-v2 raw mobile/browser proof owner',
    proof: 'raw Android/iOS/mobile browser proof required',
  },
  model: {
    action: 'refactor-existing/create-new',
    command:
      'bun test ./packages/slate/test/transforms-contract.ts ./packages/slate/test/query-contract.ts --test-name-pattern "schema|normalize|join|split|replace|range|node"',
    owner:
      '.tmp/slate-v2/packages/slate/test/transforms-contract.ts; .tmp/slate-v2/packages/slate/test/query-contract.ts',
    proof: 'Slate model/operation package proof',
  },
  performance: {
    action: 'defer-benchmark-target',
    command: 'create or select a Slate-v2 benchmark target before runtime optimization',
    owner: 'Slate-v2 performance benchmark owner',
    proof: 'focused benchmark target with correctness guardrails required',
  },
  plate: {
    action: 'plate-owned-defer',
    command: 'select Plate package/example owner before applying outside Slate-v2-only run',
    owner: 'Plate plugin/package/docs/example owner',
    proof: 'Plate package/example proof; deferred under Slate-v2-only scope',
  },
  selection: {
    action: 'refactor-existing/create-new',
    command:
      'PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/stress/generated-editing.test.ts --project=chromium --grep "selection|range|cursor|caret"',
    owner: '.tmp/slate-v2/playwright/stress/generated-editing.test.ts',
    proof: 'browser model/native selection proof',
  },
  shadowDom: {
    action: 'covered/refactor-existing',
    command:
      'PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/shadow-dom.test.ts --project=chromium',
    owner: '.tmp/slate-v2/playwright/integration/examples/shadow-dom.test.ts',
    proof: 'browser shadow-root input and selection proof',
  },
  table: {
    action: 'refactor-existing/create-new/defer-model',
    command:
      'PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/tables.test.ts --project=chromium --grep "table|cell|selection|paste|drag"',
    owner:
      '.tmp/slate-v2/playwright/integration/examples/tables.test.ts; future table model owner',
    proof: 'browser table containment/navigation/clipboard proof',
  },
}

const categoryDefs = [
  {
    cluster: 'ime-beforeinput-keyboard',
    disposition: 'keep-portable',
    key: 'IME, beforeinput, composition, keyboard replacement',
    ownerKey: 'ime',
    re: /\b(ime|composition|beforeinput|input ?rule|inputevent|text replacement|autocorrect|swiftkey|gboard|samsung|korean|japanese|chinese|cjk|insertcompositiontext|deletecompositiontext)\b/i,
  },
  {
    cluster: 'mobile-touch-keyboard',
    disposition: 'defer',
    key: 'Raw mobile, touch, Android, iOS',
    ownerKey: 'mobile',
    re: /\b(android|ios|iphone|ipad|mobile|touch|tap|virtual keyboard|swiftkey|gboard|samsung keyboard)\b/i,
  },
  {
    cluster: 'clipboard-paste-serialization',
    disposition: 'keep-portable',
    key: 'Clipboard, paste, copy, cut, HTML, markdown, DOM parser/serializer',
    ownerKey: 'clipboard',
    re: /\b(paste|pasting|copy|clipboard|cut|serialize|serializer|deserialize|parser|parse|fromdom|todom|html|markdown|domparser|domserializer|google docs|word|trustedtypes|trusted types|linebreak|whitespace|nbsp)\b/i,
  },
  {
    cluster: 'collaboration-rebase',
    disposition: 'keep-portable',
    key: 'Collaboration, remote steps, shared history, rebasing',
    ownerKey: 'collab',
    re: /\b(collab|collaboration|collaborative|remote|shared history|sharedhistory|rebase|rebasing|steps? maps?|mapping|sync|yjs|crdt|multi-user)\b/i,
  },
  {
    cluster: 'history-undo-redo',
    disposition: 'keep-portable',
    key: 'History, undo/redo, transaction grouping',
    ownerKey: 'history',
    re: /\b(history|undo|redo|transaction|addtotransaction|addtohistory|batch|snapshot)\b/i,
  },
  {
    cluster: 'table-grid-editing',
    disposition: 'keep-portable',
    key: 'Tables, cells, rows, columns, grid selection',
    ownerKey: 'table',
    re: /\b(table|tables|cell|cells|row|rows|column|columns|colspan|rowspan|mergecells|merged cells?|grid)\b/i,
  },
  {
    cluster: 'shadow-dom-browser',
    disposition: 'keep-portable',
    key: 'Shadow DOM, iframe, root-owner browser surfaces',
    ownerKey: 'shadowDom',
    re: /\b(shadow ?dom|shadowroot|iframe|ownerdocument|getrootnode|web component)\b/i,
  },
  {
    cluster: 'selection-dom-caret',
    disposition: 'keep-portable',
    key: 'Selection, caret, DOM range, focus, keyboard navigation, drag/drop',
    ownerKey: 'selection',
    re: /\b(selection|cursor|caret|range|focus|blur|arrow|keyboard|keymap|hotkey|click|mouse|drag|drop|draggable|node ?selection|text ?selection|select|backspace|delete|enter|return|scrollintoview|scroll to selection)\b/i,
  },
  {
    cluster: 'decoration-nodeview-inline-void',
    disposition: 'keep-portable',
    key: 'Decorations, NodeView, inline/atom/void boundaries',
    ownerKey: 'decoration',
    re: /\b(decoration|decorations|nodeview|node view|widget|atom|inline|image|link|embed|embedded|code ?mirror|codemirror|horizontal rule|hr|leaf)\b/i,
  },
  {
    cluster: 'model-schema-transform',
    disposition: 'keep-portable',
    key: 'Document model, schema, transforms, joins, splits, mapping',
    ownerKey: 'model',
    re: /\b(schema|model|nodebefore|nodeafter|join|split|replace|replacearound|slice|fragment|mark|marks|attr|attrs|attribute|nodespec|step|transform|mapping|position|resolve|normalize|content expression|content match)\b/i,
  },
  {
    cluster: 'large-doc-performance',
    disposition: 'defer',
    key: 'Performance, memory, layout, freeze, bundle size',
    ownerKey: 'performance',
    re: /\b(performance|perf|slow|lag|freeze|hang|memory|leak|reflow|layout|bundle|size|large document|huge|thousand|crash|pagination|scroll)\b/i,
  },
  {
    cluster: 'plate-plugin-policy',
    disposition: 'plate-owned',
    key: 'Product/plugin policy above Slate core',
    ownerKey: 'plate',
    re: /\b(menu|menubar|toolbar|tooltip|inputrules?|keymap plugin|schema-list|list item|ordered list|bullet list|heading|blockquote|code block|syntax highlighting|latex|math|mention|emoji|placeholder|prosemirror-menu|prosemirror-schema|tiptap|blocknote|dokuwiki|angular|react|vue|svelte)\b/i,
  },
]

const hardSkipDefs = [
  ['support-question', /\b(how to|help|question|suggested way|best way|is it possible|can i|should i|workaround|feature request|proposal|consider|support)\b/i],
  ['docs-release-package', /\b(docs?|documentation|readme|release|changelog|version|publish|npm|registry|package|license|website|demo fails|build|webpack|browserify|babel|typescript|type definitions?)\b/i],
  ['product-integration', /\b(angular|react|vue|svelte|tiptap|blocknote|dokuwiki|cms|plugin request|menu|toolbar|tooltip|syntax highlighting|latex|math|org-mode|git import)\b/i],
  ['repo-infra', /\b(ci|test fail|tests fail|lint|eslint|prettier|rollup|vite|bundler|dependency|install)\b/i],
]

const priority = [
  'ime-beforeinput-keyboard',
  'mobile-touch-keyboard',
  'clipboard-paste-serialization',
  'collaboration-rebase',
  'history-undo-redo',
  'table-grid-editing',
  'shadow-dom-browser',
  'selection-dom-caret',
  'decoration-nodeview-inline-void',
  'model-schema-transform',
  'large-doc-performance',
  'plate-plugin-policy',
]

const issueText = (issue) => {
  const labels = (issue.labels || []).map((label) => label.name || '').join(' ')
  const comments = (issue.comments || [])
    .map((comment) => comment.body || '')
    .join('\n')
  return `${issue.title || ''}\n${labels}\n${issue.body || ''}\n${comments}`
}

const classify = (issue) => {
  const hay = issueText(issue)
  const titleHay = issue.title || ''
  const matched = categoryDefs
    .filter((def) => def.re.test(hay))
    .sort((a, b) => priority.indexOf(a.cluster) - priority.indexOf(b.cluster))
  const titleMatched = categoryDefs
    .filter((def) => def.re.test(titleHay))
    .sort((a, b) => priority.indexOf(a.cluster) - priority.indexOf(b.cluster))
  const skipHits = hardSkipDefs.filter(([, re]) => re.test(hay)).map(([name]) => name)

  if (titleMatched.length === 0 && skipHits.length > 0) {
    return {
      action: 'skip',
      cluster: skipHits[0],
      command: 'N/A',
      disposition: 'skip',
      matrixKey: `Skip: ${skipHits[0]}`,
      owner: 'N/A',
      proofKind: 'N/A',
      reason: `Skipped as ${skipHits[0]}; no title-level portable Slate-v2 editor invariant.`,
      secondaryClusters: matched.map((def) => def.cluster),
      skipFamilies: skipHits,
    }
  }

  const primary = titleMatched[0] || matched[0]
  if (!primary) {
    return {
      action: 'skip',
      cluster: 'uncertain-nonportable',
      command: 'N/A',
      disposition: 'skip',
      matrixKey: 'Skip: no portable editor invariant detected',
      owner: 'N/A',
      proofKind: 'N/A',
      reason: 'Skipped because title/body/comments do not expose a portable Slate-v2 behavior invariant.',
      secondaryClusters: [],
      skipFamilies: skipHits,
    }
  }

  const owner = owners[primary.ownerKey]
  return {
    action: owner.action,
    cluster: primary.cluster,
    command: owner.command,
    disposition: primary.disposition,
    matrixKey: primary.key,
    owner: owner.owner,
    proofKind: owner.proof,
    reason: `Kept for ${primary.key}; closure requires exact Slate-v2 proof, fresh verified Slate-v2 test, or concrete defer owner.`,
    secondaryClusters: matched
      .map((def) => def.cluster)
      .filter((cluster) => cluster !== primary.cluster),
    skipFamilies: skipHits,
  }
}

const classified = issues
  .slice()
  .sort((a, b) => a.number - b.number)
  .map((issue) => ({
    action: classify(issue).action,
    author: issue.author?.login || '',
    closedAt: issue.closedAt || '',
    cluster: classify(issue).cluster,
    command: classify(issue).command,
    createdAt: issue.createdAt || '',
    disposition: classify(issue).disposition,
    matrixKey: classify(issue).matrixKey,
    number: issue.number,
    owner: classify(issue).owner,
    proofKind: classify(issue).proofKind,
    reason: classify(issue).reason,
    secondaryClusters: classify(issue).secondaryClusters,
    skipFamilies: classify(issue).skipFamilies,
    state: issue.state,
    title: issue.title,
    updatedAt: issue.updatedAt || '',
    url: issue.url,
  }))

writeFileSync(
  path.join(root, 'classified-issues.json'),
  `${JSON.stringify(classified, null, 2)}\n`
)

const columns = [
  'number',
  'state',
  'disposition',
  'cluster',
  'matrixKey',
  'owner',
  'proofKind',
  'action',
  'command',
  'title',
  'url',
  'reason',
]
const tsv = [
  columns.join('\t'),
  ...classified.map((row) =>
    columns
      .map((column) => String(row[column] ?? '').replace(/\s+/g, ' ').replace(/\t/g, ' '))
      .join('\t')
  ),
]
writeFileSync(path.join(root, 'classified-issues.tsv'), `${tsv.join('\n')}\n`)

const byDisposition = classified.reduce((acc, row) => {
  acc[row.disposition] = (acc[row.disposition] || 0) + 1
  return acc
}, {})
const byCluster = classified.reduce((acc, row) => {
  acc[row.cluster] = (acc[row.cluster] || 0) + 1
  return acc
}, {})

const matrix = [
  '# ProseMirror Issue Harvest Matrix',
  '',
  'source: `ProseMirror/prosemirror`, state: all',
  'target: Slate v2 only (`.tmp/slate-v2`)',
  '',
  'Clusters are routing only. Closure requires one checkmark per issue.',
  '',
  '## Disposition Counts',
  '',
  '| Disposition | Count |',
  '| --- | ---: |',
  ...Object.entries(byDisposition)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `| ${key} | ${count} |`),
  '',
  '## Cluster Counts',
  '',
  '| Cluster | Count |',
  '| --- | ---: |',
  ...Object.entries(byCluster)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `| ${key} | ${count} |`),
  '',
]
writeFileSync(path.join(root, 'matrix.md'), `${matrix.join('\n')}\n`)

const report = [
  '# ProseMirror Issue Harvest',
  '',
  'status: classification complete',
  'license: MIT from `../prosemirror/LICENSE` and `../prosemirror/package.json`',
  'issue output: `docs/editor-issue-harvester/prosemirror/full`',
  'raw source: `.tmp/editor-issue-harvester/prosemirror/raw/issues-all-with-bodies.json`, with `.tmp/editor-issue-harvester/prosemirror/full/issues-all-with-bodies.json` as a legacy fallback.',
  'target scope: Slate v2 only; Plate rows are deferred, not patched.',
  '',
  `issues: ${classified.length}`,
  `open: ${classified.filter((issue) => issue.state === 'OPEN').length}`,
  `closed: ${classified.filter((issue) => issue.state === 'CLOSED').length}`,
  '',
  'Next: run `build-closure-ledger.mjs` and resume only when unchecked relevant rows exist.',
  '',
]
writeFileSync(path.join(root, 'report.md'), `${report.join('\n')}\n`)

console.log(
  JSON.stringify(
    {
      total: classified.length,
      byDisposition,
      byCluster,
    },
    null,
    2
  )
)
