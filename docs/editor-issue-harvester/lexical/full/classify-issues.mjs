#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = 'docs/editor-issue-harvester/lexical/full'
const rawRoot = '.tmp/editor-issue-harvester/lexical/raw'
const legacyRawRoot = '.tmp/editor-issue-harvester/lexical/full'
const rawInputPath = path.join(rawRoot, 'issues-all-with-bodies.json')
const legacyInputPath = path.join(legacyRawRoot, 'issues-all-with-bodies.json')
const inputPath = existsSync(rawInputPath) ? rawInputPath : legacyInputPath
const issues = JSON.parse(readFileSync(inputPath, 'utf8'))
const checkpointDir = path.join(root, 'checkpoints')
mkdirSync(checkpointDir, { recursive: true })

const verifyOnly = process.argv.includes('--verify')

const owners = {
  ime: {
    action: 'refactor-existing/create-new',
    command:
      'PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/richtext.test.ts --project=chromium --grep "IME|composition|beforeinput"',
    owner:
      '.tmp/plite/playwright/integration/examples/richtext.test.ts; .tmp/plite/packages/plite-browser/src/playwright/ime.ts',
    proof: 'browser IME/beforeinput plus package history when applicable',
  },
  mobile: {
    action: 'defer',
    command: 'bun test:mobile-device-proof:raw',
    owner: 'raw mobile device proof lane',
    proof: 'raw Android/iOS device proof',
  },
  selection: {
    action: 'refactor-existing/create-new',
    command:
      'PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/stress/generated-editing.test.ts --project=chromium --grep "selection|range|cursor|caret"',
    owner: '.tmp/plite/playwright/stress/generated-editing.test.ts',
    proof: 'browser model/native selection proof',
  },
  clipboard: {
    action: 'refactor-existing/create-new',
    command:
      'PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/paste-html.test.ts --project=chromium --grep "paste|clipboard|copy|cut"',
    owner:
      '.tmp/plite/playwright/integration/examples/paste-html.test.ts; .tmp/plite/packages/plite-dom/test/clipboard-boundary.ts',
    proof: 'browser clipboard plus plite-dom package proof',
  },
  history: {
    action: 'refactor-existing/create-new',
    command:
      'bun test ./packages/plite-history/test/history-contract.ts --test-name-pattern "history|undo|redo|batch|selection"',
    owner: '.tmp/plite/packages/plite-history/test/history-contract.ts',
    proof: 'package history contract plus browser proof when transport matters',
  },
  table: {
    action: 'refactor-existing/create-new/defer-model',
    command:
      'PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/tables.test.ts --project=chromium --grep "table|cell|selection|paste|drag"',
    owner:
      '.tmp/plite/playwright/integration/examples/tables.test.ts; future table model owner for whole-table/nested-table semantics',
    proof: 'browser table containment/navigation plus package insert-fragment proof',
  },
  voidAtom: {
    action: 'refactor-existing/create-new',
    command:
      'PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/editable-voids.test.ts --project=chromium --grep "void|decorator|image|mention|Enter|Arrow"',
    owner:
      '.tmp/plite/playwright/integration/examples/editable-voids.test.ts; .tmp/plite/playwright/integration/examples/mentions.test.ts',
    proof: 'browser atom/void keyboard, paste, and IME proof',
  },
  collab: {
    action: 'create-new/defer-yjs-browser',
    command:
      'bun test ./packages/plite/test/collab-history-runtime-contract.ts --test-name-pattern "remote|selection|history|collab"',
    owner:
      '.tmp/plite/packages/plite/test/collab-history-runtime-contract.ts; future yjs browser lane',
    proof: 'package remote-selection/history proof; browser yjs proof when accepted',
  },
  perf: {
    action: 'defer-to-benchmark-target',
    command: 'create or select a benchmark target before runtime optimization',
    owner: 'plite-ar-fast/slate-ar-perf benchmark target owner',
    proof: 'benchmark with correctness guardrails',
  },
  shadowDom: {
    action: 'covered/refactor-existing',
    command:
      'PLAYWRIGHT_BASE_URL=http://localhost:3100 PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/shadow-dom.test.ts --project=chromium',
    owner: '.tmp/plite/playwright/integration/examples/shadow-dom.test.ts',
    proof: 'browser shadow-root input and selection proof',
  },
  plate: {
    action: 'plate-owned',
    command: 'select Plate package/example owner before applying',
    owner: 'Plate plugin/package/docs/example owner',
    proof: 'Plate package or example proof',
  },
  skip: {
    action: 'skip',
    command: 'N/A',
    owner: 'N/A',
    proof: 'N/A',
  },
}

const categoryDefs = [
  {
    cluster: 'ime-beforeinput-keyboard',
    key: 'IME and beforeinput transport',
    ownerKey: 'ime',
    disposition: 'keep-portable',
    titleRe: /\b(ime|composition|beforeinput|inputevent|input event|target range|insertcompositiontext|deletecompositiontext|text replacement|autocorrect|spellcheck|korean|japanese|chinese|hiragana|katakana)\b/i,
    bodyRe: /\b(ime|composition|beforeinput|target range|insertcompositiontext|deletecompositiontext|text replacement|autocorrect|spellcheck|korean|japanese|chinese|hiragana|katakana)\b/i,
  },
  {
    cluster: 'mobile-device-keyboard',
    key: 'Raw mobile keyboard, tap, selection, and IME',
    ownerKey: 'mobile',
    disposition: 'defer',
    titleRe: /\b(android|ios|iphone|ipad|mobile|gboard|openboard|florisboard|aosp|touch|tap)\b/i,
    bodyRe: /\b(android|ios|iphone|ipad|mobile|gboard|openboard|florisboard|aosp|touch|tap)\b/i,
  },
  {
    cluster: 'table-grid-selection',
    key: 'Table selection, navigation, paste, and nested table robustness',
    ownerKey: 'table',
    disposition: 'keep-portable',
    titleRe: /\b(table|tables|cell|cells|row|rows|column|columns|grid|merged cell|colspan|rowspan|nested table)\b/i,
    bodyRe: /\b(table|tables|table cell|table row|merged cell|colspan|rowspan|nested table)\b/i,
  },
  {
    cluster: 'collaboration-remote-rebase',
    key: 'Remote/collaborative edit rebasing, selection, and history',
    ownerKey: 'collab',
    disposition: 'keep-portable',
    titleRe: /\b(collab|collaboration|collaborator|collaborative|yjs|liveblocks|sync|sharedhistory|shared history|shared|remote|provider|multi-user|multiplayer|crdt|external editor update|desynchronize|desync)\b/i,
    bodyRe: /\b(collab|collaboration|collaborator|collaborative|yjs|liveblocks|sharedhistory|shared history|remote edit|remote update|multi-user|multiplayer|crdt|external editor update|desynchronize|desync)\b/i,
  },
  {
    cluster: 'history-undo-redo',
    key: 'History, undo/redo, and batch boundaries',
    ownerKey: 'history',
    disposition: 'keep-portable',
    titleRe: /\b(history|undo|redo|snapshot|time travel|batch)\b/i,
    bodyRe: /\b(history|undo|redo|snapshot|time travel|undo stack|redo stack|history stack)\b/i,
  },
  {
    cluster: 'clipboard-paste-serialization',
    key: 'Clipboard, paste, copy, cut, HTML, markdown, and serialization',
    ownerKey: 'clipboard',
    disposition: 'keep-portable',
    titleRe: /\b(paste|pasting|copy|clipboard|cut|html|markdown|deserialize|serialize|import|export|plain text|rich text|ghostty|rtf|nbsp|unicode whitespace|google docs|google sheets)\b/i,
    bodyRe: /\b(paste|pasting|clipboard|copy\/paste|copy and paste|cut and paste|text\/html|markdown|deserialize|serialize|importing|exporting|plain text|rich text|ghostty|rtf|nbsp|unicode whitespace|google docs|google sheets|paste[^\n]{0,80}line ?break|line ?break[^\n]{0,80}paste)\b/i,
  },
  {
    cluster: 'selection-dom-caret',
    key: 'DOM selection, caret, range, focus, and native movement',
    ownerKey: 'selection',
    disposition: 'keep-portable',
    titleRe: /\b(selection|cursor|caret|range|focus|blur|arrow|hotkey|mouse|click|drag|select|dom selection|anchor|extent|offset|delete|backspace|move backward|move forward|word backward|word forward|line break|newline|spacebar|enter|return|cmd \+|command-|ctrl\+)\b/i,
    bodyRe: /\b(selection|cursor|caret|range|focus|blur|arrow|hotkey|mouse|drag|dom selection|anchor|extent|offset|delete backward|delete forward|backspace|move backward|move forward|word backward|word forward)\b/i,
  },
  {
    cluster: 'void-decoration-atom',
    key: 'Void, decorator, image, mention, token, and inline atom boundaries',
    ownerKey: 'voidAtom',
    disposition: 'keep-portable',
    titleRe: /\b(decorator|decorators|decoration|decorations|void|image|mention|emoji|token|inline|atom|nodeview|horizontal rule|hr|equation|widget)\b/i,
    bodyRe: /\b(decorator node|decoratornode|decorators|void node|void element|inline void|inline element|atom|nodeview|horizontal rule|emoji node|emojinode|mention node|mentionnode|token-mode)\b/i,
  },
  {
    cluster: 'shadow-dom-browser',
    key: 'Shadow DOM and non-document-root browser selection',
    ownerKey: 'shadowDom',
    disposition: 'keep-portable',
    titleRe: /\b(shadow dom|shadow-dom|web component|iframe|ownerDocument|getRootNode)\b/i,
    bodyRe: /\b(shadow dom|shadow-dom|web component|iframe|ownerDocument|getRootNode)\b/i,
  },
  {
    cluster: 'large-doc-performance',
    key: 'Large document, transform, memory, and freeze performance',
    ownerKey: 'perf',
    disposition: 'defer',
    titleRe: /\b(performance|perf|slow|freeze|frozen|lag|large|scale|memory|crash|scroll|hang|infinite loop|too many|thousand|massive|node transform|profile)\b/i,
    bodyRe: /\b(performance|slow|freeze|frozen|lag|large document|large number|memory leak|crash|scroll|hang|infinite loop|too many|thousand|massive|node transform|profile)\b/i,
  },
  {
    cluster: 'plate-plugin-policy',
    key: 'Plate-owned rich text/plugin/product policy',
    ownerKey: 'plate',
    disposition: 'plate-owned',
    titleRe: /\b(list|lists|checklist|link|autolink|code block|codeblock|quote|heading|bold|italic|underline|strikethrough|format|style|font|indent|paragraph|hashtag|toolbar|typeahead|menu|plugin|extension|react composer|composer|playground|emoji picker|autocomplete|mentions|keywords|date time|media|sticker|comment editor)\b/i,
    bodyRe: /\b(checklist|autolink|code block|codeblock|toolbar|typeahead|plugin|extension|react composer|composer|emoji picker|autocomplete|hashtag|date time|media plugin|sticker|comment editor)\b/i,
  },
]

const hardSkipDefs = [
  ['docs-release-website', /\b(docs|documentation|readme|release|version|changelog|website|lexical\.dev|typo|trusted publishing)\b/i],
  ['support-question-discussion', /\b(question|how to|help|support|discussion|not issue|hi @|feature request|proposal|request)\b/i],
  ['package-build-infra', /\b(ci|test infra|lint|eslint|prettier|packaging|package|npm|pnpm|yarn|webpack|vite|rollup|esm|typescript|flow|build|devtools)\b/i],
  ['lexical-api-ontology', /\b(lexicalnode|elementnode|textnode|decoratornode|command|node class|nodekey|editorstate|editor state|extension api|registercommand|createDOM|updateDOM|exportJSON|importJSON)\b/i],
]

const priority = [
  'ime-beforeinput-keyboard',
  'mobile-device-keyboard',
  'table-grid-selection',
  'collaboration-remote-rebase',
  'history-undo-redo',
  'clipboard-paste-serialization',
  'selection-dom-caret',
  'void-decoration-atom',
  'shadow-dom-browser',
  'large-doc-performance',
  'plate-plugin-policy',
]

function labels(issue) {
  return (issue.labels || []).map((label) => label.name || '').join(' ')
}

function text(issue) {
  return `${issue.title || ''}\n${labels(issue)}\n${issue.body || ''}`
}

function classify(issue) {
  const titleHay = `${issue.title || ''}\n${labels(issue)}`
  const bodyHay = issue.body || ''
  const hay = `${titleHay}\n${bodyHay}`
  const lowerTitle = (issue.title || '').toLowerCase()
  const titleMatched = categoryDefs.filter((def) => def.titleRe.test(titleHay))
  const matched =
    titleMatched.length > 0
      ? titleMatched
      : categoryDefs.filter((def) => def.bodyRe.test(bodyHay))

  const skipHits = hardSkipDefs.filter(([, re]) => re.test(hay)).map(([name]) => name)

  if (
    titleMatched.length === 0 &&
    skipHits.length > 0 &&
    ['docs-release-website', 'support-question-discussion', 'package-build-infra'].includes(skipHits[0])
  ) {
    return {
      action: 'skip',
      cluster: skipHits[0],
      command: 'N/A',
      disposition: 'skip',
      matrixKey: `Skip: ${skipHits[0]}`,
      owner: 'N/A',
      proofKind: 'N/A',
      reason: `Skipped as ${skipHits[0]}; no title/label-level portable editor invariant.`,
      secondaryClusters: [],
      skipFamilies: skipHits,
    }
  }

  if (matched.length > 0) {
    matched.sort((a, b) => priority.indexOf(a.cluster) - priority.indexOf(b.cluster))
    let primary = matched[0]
    const plateMatch = matched.find((def) => def.cluster === 'plate-plugin-policy')
    const strongRawMatch = matched.some((def) =>
      [
        'ime-beforeinput-keyboard',
        'mobile-device-keyboard',
        'table-grid-selection',
        'collaboration-remote-rebase',
        'history-undo-redo',
        'clipboard-paste-serialization',
      ].includes(def.cluster)
    )

    if (
      plateMatch &&
      !strongRawMatch &&
      /\b(sticker|comment editor|toolbar|playground|typeahead|emoji picker|plugin|extension)\b/i.test(
        titleHay
      )
    ) {
      primary = plateMatch
    }
    const owner = owners[primary.ownerKey]
    let disposition = primary.disposition
    let action = owner.action
    let reason = `Matched portable/body cluster: ${primary.cluster}.`

    if (primary.disposition === 'keep-portable' && skipHits.includes('lexical-api-ontology')) {
      reason += ' Lexical ontology terms present, but kept because the issue also exposes a portable editor behavior.'
    }

    if (
      primary.cluster === 'plate-plugin-policy' &&
      /selection|cursor|caret|range|paste|copy|ime|composition|beforeinput|undo|redo|table|void|decorator/i.test(
        hay
      )
    ) {
      disposition = 'plate-owned'
      action = 'plate-owned/split-raw-invariant-if-needed'
      reason =
        'Plugin/product issue with possible raw invariant; route to Plate unless a Plite substrate row is split.'
    }

    return {
      action,
      cluster: primary.cluster,
      command: owner.command,
      disposition,
      matrixKey: primary.key,
      owner: owner.owner,
      proofKind: owner.proof,
      reason,
      secondaryClusters: matched.slice(1).map((def) => def.cluster),
      skipFamilies: skipHits,
    }
  }

  if (skipHits.length > 0) {
    return {
      action: 'skip',
      cluster: skipHits[0],
      command: 'N/A',
      disposition: 'skip',
      matrixKey: `Skip: ${skipHits[0]}`,
      owner: 'N/A',
      proofKind: 'N/A',
      reason: `Skipped as ${skipHits[0]}; no portable Plite/Plate editor robustness invariant found in title/body.`,
      secondaryClusters: [],
      skipFamilies: skipHits,
    }
  }

  if (/^feature:?$/i.test(issue.title || '') || lowerTitle.length < 8) {
    return {
      action: 'skip',
      cluster: 'low-signal',
      command: 'N/A',
      disposition: 'skip',
      matrixKey: 'Skip: low-signal',
      owner: 'N/A',
      proofKind: 'N/A',
      reason: 'Skipped as low-signal issue without portable editor invariant in title/body.',
      secondaryClusters: [],
      skipFamilies: ['low-signal'],
    }
  }

  return {
    action: 'skip',
    cluster: 'unrelated-or-product-unclear',
    command: 'N/A',
    disposition: 'skip',
    matrixKey: 'Skip: unrelated-or-product-unclear',
    owner: 'N/A',
    proofKind: 'N/A',
    reason: 'Skipped after full-body pass; no portable Plite/Plate editor robustness invariant matched.',
    secondaryClusters: [],
    skipFamilies: ['unrelated-or-product-unclear'],
  }
}

const classified = issues
  .map((issue) => {
    const result = classify(issue)
    return {
      number: issue.number,
      state: issue.state,
      title: issue.title,
      url: issue.url,
      labels: (issue.labels || []).map((label) => label.name || ''),
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      closedAt: issue.closedAt,
      bodyChars: (issue.body || '').length,
      ...result,
    }
  })
  .sort((a, b) => a.number - b.number)

const byDisposition = groupCount(classified, 'disposition')
const byCluster = groupCount(classified, 'cluster')
const byMatrixKey = groupCount(classified.filter((row) => row.disposition !== 'skip'), 'matrixKey')
const issueCount = classified.length
const classifiedCount = classified.filter((row) => row.disposition).length

const matrixRows = [...new Set(classified.filter((row) => row.disposition !== 'skip').map((row) => row.matrixKey))]
  .sort()
  .map((key) => {
    const rows = classified.filter((row) => row.matrixKey === key)
    const sample = rows
      .slice(0, 12)
      .map((row) => `#${row.number}`)
      .join(', ')
    const first = rows[0]
    return {
      action: first.action,
      count: rows.length,
      disposition: first.disposition,
      issues: sample,
      key,
      owner: first.owner,
      proofKind: first.proofKind,
      command: first.command,
    }
  })

const tsv = [
  [
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
  ].join('\t'),
  ...classified.map((row) =>
    [
      row.number,
      row.state,
      row.disposition,
      row.cluster,
      row.matrixKey,
      row.owner,
      row.proofKind,
      row.action,
      row.command,
      row.title,
      row.url,
    ]
      .map((value) => String(value ?? '').replace(/\s+/g, ' ').replace(/\t/g, ' '))
      .join('\t')
  ),
]

writeFileSync(path.join(root, 'classified-issues.json'), JSON.stringify(classified, null, 2))
writeFileSync(path.join(root, 'classified-issues.tsv'), `${tsv.join('\n')}\n`)

writeMatrix(matrixRows)
writeReport({ byCluster, byDisposition, byMatrixKey, classifiedCount, issueCount, matrixRows })
writeCheckpoints(classified)

const failures = []
if (issueCount !== 2741) failures.push(`expected 2741 issues, got ${issueCount}`)
if (classifiedCount !== issueCount) failures.push(`classified ${classifiedCount}/${issueCount}`)
if (Object.values(byDisposition).reduce((sum, count) => sum + count, 0) !== issueCount) {
  failures.push('disposition counts do not sum to issue count')
}
if (classified.some((row) => row.disposition !== 'skip' && (!row.owner || !row.proofKind || !row.command))) {
  failures.push('non-skip row missing owner/proof/command')
}
if (classified.some((row) => row.disposition === 'needs-follow-up')) {
  failures.push('needs-follow-up rows remain')
}

if (failures.length > 0) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'))
  process.exitCode = 1
} else if (verifyOnly) {
  console.log(`verified ${issueCount} classified issues`)
} else {
  console.log(JSON.stringify({ issueCount, byDisposition, matrixRows: matrixRows.length }, null, 2))
}

function groupCount(rows, key) {
  return rows.reduce((acc, row) => {
    const value = row[key] || 'unknown'
    acc[value] = (acc[value] || 0) + 1
    return acc
  }, {})
}

function writeMatrix(rows) {
  const lines = [
    '# Full Lexical Issue Matrix',
    '',
    'source: `docs/editor-issue-harvester/lexical/full/classified-issues.tsv`',
    '',
    '| Matrix key | Issues | Disposition | Owner | Proof kind | Action | Verification / defer command |',
    '| --- | ---: | --- | --- | --- | --- | --- |',
    ...rows.map((row) =>
      [
        row.key,
        `${row.count} (${row.issues})`,
        row.disposition,
        row.owner,
        row.proofKind,
        row.action,
        row.command,
      ]
        .map((cell) => String(cell).replace(/\n/g, ' '))
        .join(' | ')
        .replace(/^/, '| ')
        .replace(/$/, ' |')
    ),
    '',
  ]
  writeFileSync(path.join(root, 'matrix.md'), lines.join('\n'))
}

function writeReport(summary) {
  const lines = [
    '# Lexical Full All-Issues Robustness Harvest',
    '',
    'status: full issue-body classification complete',
    'target: `facebook/lexical`',
    'local checkout: `../lexical`',
    'artifact_dir: `docs/editor-issue-harvester/lexical/full`',
    '',
    '## Verdict',
    '',
    `Classified all ${summary.issueCount} open and closed Lexical issues with issue bodies. Every issue has one primary disposition. Non-skip dispositions map to an owner, proof kind, and verification/defer command in [matrix.md](./matrix.md).`,
    '',
    'No runtime/package patch was made in this harvest pass.',
    '',
    '## Disposition Counts',
    '',
    '| Disposition | Count |',
    '| --- | ---: |',
    ...Object.entries(summary.byDisposition)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => `| ${key} | ${count} |`),
    '',
    '## Cluster Counts',
    '',
    '| Cluster | Count |',
    '| --- | ---: |',
    ...Object.entries(summary.byCluster)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => `| ${key} | ${count} |`),
    '',
    '## Matrix Counts',
    '',
    '| Matrix key | Count |',
    '| --- | ---: |',
    ...Object.entries(summary.byMatrixKey)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => `| ${key} | ${count} |`),
    '',
    '## Artifacts',
    '',
    '- raw source: `.tmp/editor-issue-harvester/lexical/raw/issues-all-with-bodies.json`, with `.tmp/editor-issue-harvester/lexical/full/issues-all-with-bodies.json` as a legacy fallback.',
    '- `classified-issues.json`: all issue rows with disposition and owner/proof mapping.',
    '- `classified-issues.tsv`: compact all-issue review table.',
    '- `matrix.md`: grouped action matrix.',
    '- `checkpoints/checkpoint-*.md`: batch checkpoint summaries.',
    '',
  ]
  writeFileSync(path.join(root, 'report.md'), lines.join('\n'))
}

function writeCheckpoints(rows) {
  const batchSize = 200
  for (let start = 0; start < rows.length; start += batchSize) {
    const batch = rows.slice(start, start + batchSize)
    const index = String(Math.floor(start / batchSize) + 1).padStart(2, '0')
    const byDisposition = groupCount(batch, 'disposition')
    const byCluster = groupCount(batch, 'cluster')
    const nonSkip = batch.filter((row) => row.disposition !== 'skip')
    const lines = [
      `# Checkpoint ${index}`,
      '',
      `issue range: #${batch[0].number} to #${batch.at(-1).number}`,
      `count: ${batch.length}`,
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
        .slice(0, 14)
        .map(([key, count]) => `| ${key} | ${count} |`),
      '',
      '## Non-Skip Rows',
      '',
      '| Issue | Disposition | Matrix key | Action |',
      '| --- | --- | --- | --- |',
      ...nonSkip
        .slice(0, 80)
        .map((row) => `| #${row.number} | ${row.disposition} | ${row.matrixKey} | ${row.action} |`),
      nonSkip.length > 80 ? `| ... | ... | ${nonSkip.length - 80} more non-skip rows in classified TSV | ... |` : '',
      '',
    ].filter(Boolean)
    writeFileSync(path.join(checkpointDir, `checkpoint-${index}.md`), lines.join('\n'))
  }
}
