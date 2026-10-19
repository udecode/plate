// Strict parse of the CJK 50K fixture against the same document after an editor
// value.replace (normalized). Run from the repository root:
//   bun --preload ./config/plite-source-aliases.ts docs/research/probes/2026-09-28-conversion-boundary/lanes/s5/projection/diag-cjk-ragged-row/cjk-tail.ts
import { createTestEditor } from '../../../../../../../../packages/platejs/src/markdown/lib/__tests__/createTestEditor';

const cjkUnit = (i: number) =>
  `## 第 ${i} 步\n\n使用 \`Map<string, number>\` 来做 {key: value} 查找，当 x<y 时依然成立。参见 <https://example.com/${i}>。\n\n- 保持**顺序**\n- 避免_抖动_ 🚀\n\n| 键 | 值 |\n| - | - |\n| a | ${i} |\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;
const source = Array.from({ length: 2000 }, (_, i) => cjkUnit(i)).join('\n').slice(0, 50_000);
console.log('source tail', JSON.stringify(source.slice(-60)));
const editor = createTestEditor();
const result = editor.api.markdown.parseSlice(source);
if (!result.ok) throw new Error('parse failed');
const content = result.slice.content as any[];
console.log('blocks', content.length, 'last block', JSON.stringify(content.at(-1)));
editor.update({ history: 'skip' }).value.replace({ children: content as any });
const normalized = editor.read.children() as any[];
console.log('normalized blocks', normalized.length, 'last block', JSON.stringify(normalized.at(-1)));
