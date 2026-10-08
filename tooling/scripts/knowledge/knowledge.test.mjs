import assert from 'node:assert/strict';
import { test } from 'node:test';

import { card, findings, gaps, loadIndex } from './knowledge.mjs';

const spec = [
  '## Table',
  '',
  '### Cell Navigation',
  '',
  '- `EDIT-TABLE-TAB-001` `locked` `⇥`: moves to the next cell',
  '',
].join('\n');

function tree(files) {
  const all = {
    'docs/editor-behavior/markdown-editing-spec.md': spec,
    'benchmarks/targets/slate-v2.json': '{"targets":[]}',
    'docs/editor-issue-harvester/slate/full/issue-closure-ledger.tsv':
      'issue_number\ttitle\tstatus\n6034\tCursor moves below a final table\tcovered\n',
    ...files,
  };
  // Word queries read the review ledger, which only a repository holds.
  return {
    repo: process.cwd(),
    ref: 'fixture',
    list: () => Object.keys(all),
    has: (path) => path in all,
    read: (path) => all[path],
  };
}

// Fixture tests stay inside strings, never real calls, because the repository's
// own K4 check and gaps read this file's tests and their tags.
const testCall = (title) => `it('${title}', () => {});\n`;
const tagged = testCall('moves [EDIT-TABLE-TAB-001]');

const check = (files, rule) =>
  findings(loadIndex(tree(files))).filter((finding) => finding.rule === rule);
const gapIds = (files) => gaps(loadIndex(tree(files))).map((rule) => rule.id);

test('a test tag that names no rule is a K4 finding', () => {
  assert.deepEqual(
    check(
      { 'packages/x/src/a.spec.ts': testCall('moves [EDIT-NO-SUCH-RULE-001]') },
      'K4'
    ).map((finding) => finding.message),
    ['tag EDIT-NO-SUCH-RULE-001 names no rule']
  );
});

test('tags naming a rule, an issue row and a plate issue pass K4', () => {
  assert.deepEqual(
    check(
      {
        'packages/x/src/a.spec.ts': testCall(
          'moves [EDIT-TABLE-TAB-001] [slate#6034] [plate#4567]'
        ),
      },
      'K4'
    ),
    []
  );
});

test('a rule defined twice is a K1 finding', () => {
  assert.equal(
    check(
      {
        'docs/editor-behavior/markdown-editing-spec.md': `${spec}- \`EDIT-TABLE-TAB-001\` \`locked\`: again\n`,
      },
      'K1'
    ).length,
    1
  );
});

test('a harvest index whose entries no adapter reads is a K0 finding', () => {
  const index =
    '## ../prosemirror/model/test/test-content.ts\n\n* 34 :: describe => ContentMatch\n* 36 :: it => accepts empty content\n';
  assert.equal(
    check(
      { 'docs/editor-test-harvester/prosemirror/test-index.md': index },
      'K0'
    ).length,
    1
  );
});

test('a relative citation of a missing file is a K7 finding', () => {
  assert.deepEqual(
    check(
      {
        'docs/research/sources/a.md':
          'See [the run](../../plans/artifacts/run/result.json).\n',
      },
      'K7'
    ).map((finding) => finding.message),
    [
      'cites docs/plans/artifacts/run/result.json, which a fresh checkout does not have',
    ]
  );
});

test('an angle-bracket link to a missing file is a K7 finding', () => {
  assert.deepEqual(
    check(
      {
        'docs/research/sources/a.md':
          'See [the run](<../../plans/missing.json>).\n',
      },
      'K7'
    ).map((finding) => finding.message),
    ['cites docs/plans/missing.json, which a fresh checkout does not have']
  );
});

test('a link whose path holds parentheses passes K7 when the file is tracked', () => {
  assert.deepEqual(
    check(
      {
        'apps/www/src/app/(app)/page.tsx': '',
        'docs/research/sources/a.md':
          'See [the page](../../../apps/www/src/app/(app)/page.tsx).\n',
      },
      'K7'
    ),
    []
  );
});

test('a qualified citation of another editor’s file and link syntax in code pass K7', () => {
  assert.deepEqual(
    check(
      {
        'docs/plans/topics/a.md':
          'Lexical keeps it in `facebook/lexical@dd5c41b13:packages/lexical/src/LexicalEditor.ts`; type `[text](url)` to link.\n',
      },
      'K7'
    ),
    []
  );
});

test('an unqualified path into a folder this repository lacks is a K7 finding', () => {
  assert.deepEqual(
    check(
      {
        'docs/plans/topics/a.md':
          'Lexical keeps it in `packages/lexical/src/LexicalEditor.ts`.\n',
      },
      'K7'
    ).map((finding) => finding.message),
    [
      'cites packages/lexical/src/LexicalEditor.ts, which a fresh checkout does not have',
    ]
  );
});

test('a commit pin this repository does not hold is a K7 finding', () => {
  assert.deepEqual(
    check(
      { 'docs/plans/topics/a.md': 'See `0123456789abcdef:docs/x.md`.\n' },
      'K7'
    ).map((finding) => finding.message),
    ['cites commit 0123456789abcdef, which no remote branch contains']
  );
});

test('swapping which citation on a line is broken changes the K7 identity', () => {
  const identities = (missing) => {
    const files = {
      'docs/plans/topics/a.md': 'Read docs/plans/a.md and docs/plans/b.md.\n',
      'docs/plans/a.md': '',
      'docs/plans/b.md': '',
    };
    delete files[`docs/plans/${missing}.md`];
    return check(files, 'K7').map((finding) => finding.identity);
  };
  assert.notDeepEqual(identities('a'), identities('b'));
});

test('a rule card shows the issue its tagged test guards', () => {
  const index = loadIndex(
    tree({
      'packages/x/src/a.spec.ts': testCall(
        'moves [EDIT-TABLE-TAB-001] [slate#6034]'
      ),
    })
  );
  assert.deepEqual(
    card(index, 'EDIT-TABLE-TAB-001').upstream.map((issue) => issue.ref),
    ['slate#6034']
  );
});

test('an issue card shows the rule its tagged test proves', () => {
  const index = loadIndex(
    tree({
      'packages/x/src/a.spec.ts': testCall(
        'moves [EDIT-TABLE-TAB-001] [slate#6034]'
      ),
    })
  );
  assert.deepEqual(
    card(index, 'slate#6034').law.map((rule) => rule.id),
    ['EDIT-TABLE-TAB-001']
  );
});

test('a word query shows the rule its best-matching test proves', () => {
  const index = loadIndex(
    tree({
      'packages/x/src/a.spec.ts': testCall(
        'tabs forward to the following cell [EDIT-TABLE-TAB-001]'
      ),
    })
  );
  assert.equal(
    card(index, 'tabs forward following').law[0]?.id,
    'EDIT-TABLE-TAB-001'
  );
});

test('a tag inside a skipped describe leaves its rule a gap', () => {
  assert.deepEqual(
    gapIds({
      'packages/x/src/a.spec.ts': `describe.skip('group', () => {\n  ${tagged}});\n`,
    }),
    ['EDIT-TABLE-TAB-001']
  );
});

test('a tag inside a skipped Playwright describe leaves its rule a gap', () => {
  assert.deepEqual(
    gapIds({
      'packages/x/src/a.spec.ts': `test.describe.skip('group', () => {\n  test('moves [EDIT-TABLE-TAB-001]', () => {});\n});\n`,
    }),
    ['EDIT-TABLE-TAB-001']
  );
});

test('a tag inside a skipped each-describe leaves its rule a gap', () => {
  assert.deepEqual(
    gapIds({
      'packages/x/src/a.spec.ts': `describe.skip.each([1])('group %s', () => {\n  ${tagged}});\n`,
    }),
    ['EDIT-TABLE-TAB-001']
  );
});

test('a tag on a commented-out test leaves its rule a gap', () => {
  assert.deepEqual(gapIds({ 'packages/x/src/a.spec.ts': `// ${tagged}` }), [
    'EDIT-TABLE-TAB-001',
  ]);
});

test('a tag in a file that skips itself leaves its rule a gap', () => {
  assert.deepEqual(
    gapIds({
      'packages/x/src/a.spec.ts': `test.skip(!process.env.REPLAY, 'needs a replay');\ntest('moves [EDIT-TABLE-TAB-001]', () => {});\n`,
    }),
    ['EDIT-TABLE-TAB-001']
  );
});

test('a tag on a deferred spec leaves its rule a gap', () => {
  assert.deepEqual(
    gapIds({
      'apps/www/src/__tests__/package-integration/__deferred__/a/b.deferred.spec.tsx':
        tagged,
    }),
    ['EDIT-TABLE-TAB-001']
  );
});

test('a tag only on a manual browser spec leaves its rule a gap', () => {
  assert.deepEqual(gapIds({ 'apps/www/tests/browser/a.spec.ts': tagged }), [
    'EDIT-TABLE-TAB-001',
  ]);
});

test('a tag on a running test closes its rule', () => {
  assert.deepEqual(gapIds({ 'packages/x/src/a.spec.ts': tagged }), []);
});

const notes = (body) => ({
  'docs/research/sources/plate-notes/README.md':
    '# Plate notes\n\n- [Selection](selection.md) keeps the caret\n',
  'docs/research/sources/plate-notes/selection.md': `---\ntitle: Selection\nsource_refs:\n- 52625e8502:docs/solutions\n---\n\n# Selection\n\n## Caret\n\n${body}`,
});

test('a plate-notes bullet kb cannot parse as a lesson is a K0 finding', () => {
  assert.deepEqual(
    check(
      notes('- **Keep the caret.** It stays.\n- Restore focus first.\n'),
      'K0'
    ).map((finding) => finding.file),
    ['docs/research/sources/plate-notes/selection.md']
  );
});

test('plate-notes lessons, frontmatter and README pass K0', () => {
  assert.deepEqual(
    check(
      notes('- **Keep the caret.** It stays.\n  - a nested detail\n'),
      'K0'
    ),
    []
  );
});

const subject = (section) => ({
  'docs/plans/topics/kb.md': `# Kb\n\n## ${section}\n\n- Waits on \`docs/plans/artifacts/run/round2.patch\`. owner: zbeyens. stop: 2026-11-08.\n`,
});

test("a subject's Open work line may cite its run directory", () => {
  assert.deepEqual(check(subject('Open work'), 'K7'), []);
});

test('a subject line outside Open work that cites a run directory is a K7 finding', () => {
  assert.deepEqual(
    check(subject('Main changes'), 'K7').map((finding) => finding.line),
    [5]
  );
});

test('a fenced example on a plate-notes page is not a lesson', () => {
  assert.deepEqual(
    check(
      notes(
        '- **Keep the caret.** It stays.\n\n```md\n- item one\n- item two\n```\n'
      ),
      'K0'
    ),
    []
  );
});

test('the Open work exemption ends at a top-level heading', () => {
  assert.deepEqual(
    check(
      {
        'docs/plans/topics/kb.md':
          '# Kb\n\n## Open work\n\n- Waits. owner: z. stop: y.\n\n# Published conclusion\n\nSee `docs/plans/artifacts/run/proof.log`.\n',
      },
      'K7'
    ).map((finding) => finding.line),
    [9]
  );
});

test('an Open work citation that leaves the run directory is a K7 finding', () => {
  assert.deepEqual(
    check(
      {
        'docs/plans/topics/kb.md':
          '# Kb\n\n## Open work\n\n- Waits on `docs/plans/artifacts/../../packages/missing.ts`. owner: z. stop: y.\n',
      },
      'K7'
    ).map((finding) => finding.line),
    [5]
  );
});

test('a fenced example on a plate-notes page is not indexed as a lesson', () => {
  const index = loadIndex(
    tree(
      notes(
        '- **Keep the caret.** It stays.\n\n```md\n- **Example** not a lesson\n```\n'
      )
    )
  );
  assert.deepEqual(
    index.lessons.map((lesson) => lesson.title),
    ['Keep the caret']
  );
});
