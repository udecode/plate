#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const root = 'docs/editor-issue-harvester/prosemirror/full'
const classified = JSON.parse(
  readFileSync(path.join(root, 'classified-issues.json'), 'utf8')
)
const overridesPath = path.join(root, 'issue-closure-overrides.json')
const closureOverrides = existsSync(overridesPath)
  ? JSON.parse(readFileSync(overridesPath, 'utf8'))
  : {}

const ledgerRows = classified.map((issue) => {
  const relevant = issue.disposition !== 'skip'
  const row = {
    action: issue.action,
    checkmark: relevant ? '[ ]' : '[x]',
    closureKind: relevant ? 'needs-test-audit' : 'invalid-skip',
    closureState: relevant ? 'unchecked' : 'checked',
    cluster: issue.cluster,
    command: relevant ? issue.command : 'N/A',
    disposition: issue.disposition,
    exactTest: '',
    issue: issue.number,
    matrixKey: issue.matrixKey,
    owner: issue.owner,
    proofKind: issue.proofKind,
    reason: issue.reason,
    relevant,
    state: issue.state,
    title: issue.title,
    url: issue.url,
  }

  const override = closureOverrides[String(issue.number)]
  if (!override) return row

  const next = {
    ...row,
    ...override,
    issue: row.issue,
    state: row.state,
    title: row.title,
    url: row.url,
  }

  if (Object.hasOwn(override, 'relevant')) {
    next.relevant = Boolean(override.relevant)
  } else if (override.disposition === 'skip') {
    next.relevant = false
  }

  if (override.closureState === 'checked' && !override.checkmark) {
    next.checkmark = '[x]'
  }

  return next
})

const columns = [
  'check',
  'issue',
  'state',
  'relevant',
  'closureKind',
  'disposition',
  'cluster',
  'matrixKey',
  'owner',
  'proofKind',
  'exactTest',
  'command',
  'title',
  'url',
  'reason',
]

const tsv = [
  columns.join('\t'),
  ...ledgerRows.map((row) =>
    [
      row.checkmark,
      row.issue,
      row.state,
      row.relevant ? 'yes' : 'no',
      row.closureKind,
      row.disposition,
      row.cluster,
      row.matrixKey,
      row.owner,
      row.proofKind,
      row.exactTest,
      row.command,
      row.title,
      row.url,
      row.reason,
    ]
      .map((value) => String(value ?? '').replace(/\s+/g, ' ').replace(/\t/g, ' '))
      .join('\t')
  ),
]

writeFileSync(path.join(root, 'issue-closure-ledger.tsv'), `${tsv.join('\n')}\n`)

const byClosure = ledgerRows.reduce((acc, row) => {
  const key = `${row.relevant ? 'relevant' : 'irrelevant'}:${row.closureKind}`
  acc[key] = (acc[key] || 0) + 1
  return acc
}, {})

const byDisposition = ledgerRows.reduce((acc, row) => {
  acc[row.disposition] = (acc[row.disposition] || 0) + 1
  return acc
}, {})

const uncheckedRelevant = ledgerRows.filter(
  (row) => row.relevant && row.closureState !== 'checked'
)
const status = uncheckedRelevant.length === 0 ? 'checked' : 'open'

const markdown = [
  '# ProseMirror Issue Closure Ledger',
  '',
  `status: ${status}`,
  'source: `docs/editor-issue-harvester/prosemirror/full/classified-issues.tsv`',
  '',
  'Rule: every relevant issue needs an explicit checkmark. A cluster/matrix row',
  'does not close an issue. Close a relevant issue only by linking and verifying',
  'an exact existing Slate-v2 test, writing and verifying a fresh Slate-v2 test,',
  'or recording a concrete defer owner. Under Slate-v2-only scope, Plate rows',
  'are defer-only and must not trigger Plate edits.',
  '',
  '## Counts',
  '',
  '| Bucket | Count |',
  '| --- | ---: |',
  ...Object.entries(byDisposition)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `| ${key} | ${count} |`),
  `| unchecked relevant | ${uncheckedRelevant.length} |`,
  '',
  '## Closure Counts',
  '',
  '| Closure | Count |',
  '| --- | ---: |',
  ...Object.entries(byClosure)
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => `| ${key} | ${count} |`),
  '',
  '## Next Unchecked Relevant Issues',
  '',
  '| Check | Issue | Disposition | Matrix key | Owner | Command | Title |',
  '| --- | ---: | --- | --- | --- | --- | --- |',
  ...uncheckedRelevant.slice(0, 50).map((row) =>
    [
      row.checkmark,
      `#${row.issue}`,
      row.disposition,
      row.matrixKey,
      row.owner,
      row.command,
      row.title,
    ]
      .map((value) => String(value).replace(/\|/g, '\\|'))
      .join(' | ')
      .replace(/^/, '| ')
      .replace(/$/, ' |')
  ),
  '',
  'Full ledger: `issue-closure-ledger.tsv`.',
  '',
]

writeFileSync(path.join(root, 'issue-closure-ledger.md'), markdown.join('\n'))

console.log(
  JSON.stringify(
    {
      total: ledgerRows.length,
      uncheckedRelevant: uncheckedRelevant.length,
      byClosure,
      byDisposition,
    },
    null,
    2
  )
)
