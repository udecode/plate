// Amendment probe for D5 of docs/plans/2026-09-28-conversion-boundary-adoption.md.
// Question: which ordinary documents would fail Markdown export if every
// unrepresented content property became "established loss" under the default
// `lossPolicy: 'reject'`? Records today's result for each case and whether the
// property's owner declares any Markdown mapping at all (a capability gap) or
// declares one that drops the property (a mapping gap).
// Run from the repository root:
//   bun test ./docs/research/probes/2026-09-28-conversion-boundary/amendment/loss-severity.test.ts
// (a test file so the repository preload supplies the DOM that HTML parsing needs)

import { writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  BaseParagraphPlugin,
  createEditor,
} from '../../../../../packages/platejs/src/core';
import {
  BaseLineHeightPlugin,
  BaseTextAlignPlugin,
  BaseTextIndentPlugin,
} from '../../../../../packages/platejs/src/features/basic-styles';
import { BaseLinkPlugin } from '../../../../../packages/platejs/src/features/link';
import { MarkdownPlugin } from '../../../../../packages/platejs/src/markdown';

it('records Markdown export results for unrepresentable properties', () => {
  const out = import.meta.dir;
  const editor = createEditor({
    plugins: [
      BaseParagraphPlugin,
      BaseLinkPlugin,
      BaseTextAlignPlugin,
      BaseLineHeightPlugin,
      BaseTextIndentPlugin,
      MarkdownPlugin,
    ],
  }) as any;

  const pasted = editor.api.html.parse(
    '<p>See <a href="https://example.com">the docs</a>.</p>',
    { lossPolicy: 'allow' }
  );
  const cases: Record<string, any> = {
    'aligned paragraph': { children: [{ children: [{ text: 'Centered' }], textAlign: 'center', type: 'paragraph' }] },
    'line height': { children: [{ children: [{ text: 'Airy' }], lineHeight: 2, type: 'paragraph' }] },
    'text indent': { children: [{ children: [{ text: 'Indented' }], textIndent: 1, type: 'paragraph' }] },
    'link pasted from HTML': pasted.ok ? pasted.document : null,
  };

  const rows = Object.entries(cases).map(([label, document]) => {
    if (!document) return { label, skipped: 'HTML paste failed' };
    const result = editor.api.markdown.serialize({ document });

    return {
      defaultPolicyOk: result.ok,
      diagnostics: result.diagnostics.map((d: any) => ({ code: d.code, key: d.key, owner: d.owner, severity: d.severity })),
      label,
      linkTarget: label.startsWith('link') ? JSON.stringify(document.children[0].children.find((n: any) => n.type === 'link')?.target) : undefined,
    };
  });

  writeFileSync(path.join(out, 'loss-severity.json'), `${JSON.stringify(rows, null, 2)}\n`);
  console.log(JSON.stringify(rows, null, 2));
});
