// Lane P1: parse the rich AI preview exactly like ../../amendment/splice-profile.ts
// and cache its top-level nodes, so timing runs do not depend on Markdown
// source that other lanes are editing. Run from the repository root:
//   bun --preload ./docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/alias.ts \
//     docs/research/probes/2026-09-28-conversion-boundary/lanes/p1/build-preview.ts [bytes...]
// P1_PLATE_SRC=<dir> parses with another platejs source tree, such as a
// `git archive HEAD packages/platejs/src` extraction, when the live Markdown
// source is mid-edit.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const previewCache = path.resolve(
  import.meta.dir,
  '../../../../../../node_modules/.cache/p1-conversion-boundary'
);

const answerUnit = (i: number) =>
  `## Step ${i}\n\nUse a \`Map<string, number>\` or Map<string, number> for {key: value} lookups when x<y. See <https://example.com/${i}>.\n\n- keep **order**\n- avoid _churn_\n\n\`\`\`ts\nconst m = new Map<string, number>();\n\`\`\`\n`;

if (import.meta.main) {
  const repoRoot = path.resolve(import.meta.dir, '../../../../../..');
  const plateSource = path.resolve(
    repoRoot,
    process.env.P1_PLATE_SRC ?? 'packages/platejs/src'
  );
  const { createTestEditor } = await import(
    path.join(plateSource, 'markdown/lib/__tests__/createTestEditor')
  );
  const sizes = process.argv.slice(2).map(Number);

  mkdirSync(previewCache, { recursive: true });
  for (const bytes of sizes.length > 0 ? sizes : [5000, 50_000]) {
    const source = Array.from({ length: 2000 }, (_, i) => answerUnit(i))
      .join('\n')
      .slice(0, bytes);
    const editor = createTestEditor() as any;
    const nodes = editor.api.markdown.parseSlice(source, {
      lossPolicy: 'allow',
      partial: true,
    }).slice.content;
    const file = path.join(previewCache, `preview-${bytes}.json`);

    writeFileSync(file, JSON.stringify(nodes));
    console.log(`${file}: ${nodes.length} top-level nodes`);
  }
}
