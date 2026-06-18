import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '../..');
const docsRoot = join(repoRoot, 'content/docs/slate');
const contractPath = join(
  repoRoot,
  'packages/slate/test/public-surface-contract.ts'
);

const contract = readFileSync(contractPath, 'utf8');

for (const signal of [
  'bannedSlateRootHelperExports',
  'bannedEditorInstanceSurface',
  "'getSelection'",
  "'getChildren'",
  "'Transforms'",
]) {
  if (!contract.includes(signal)) {
    throw new Error(
      `Slate v2 public-surface contract missing expected signal: ${signal}`
    );
  }
}

const teachingDocs = new Set([
  'docs/slate-v2/agent-start.md',
  'docs/slate-v2/absolute-architecture-release-claim.md',
  'docs/slate-v2/references/architecture-contract.md',
]);

const staleCodePatterns = [
  {
    pattern:
      /\beditor\.(getSelection|getChildren|getSnapshot|getFragment|getOperations|getLastCommit|getPathByRuntimeId|getRuntimeId)\s*\(/,
    reason: 'public reads must go through editor.read((state) => ...)',
  },
  {
    pattern:
      /\beditor\.(insertNodes|insertNode|setNodes|moveNodes|wrapNodes|unwrapNodes|removeNodes|insertText|insertFragment|delete|select|move)\s*\(/,
    reason: 'public writes must go through editor.update((tx) => ...)',
  },
  {
    pattern: /\bTransforms\./,
    reason: 'primary Slate v2 docs must not teach Transforms.*',
  },
];

const staleTeachingPatterns = [
  {
    pattern:
      /`editor\.(getSelection|getChildren|getSnapshot|getFragment|getOperations|getLastCommit|getPathByRuntimeId|getRuntimeId)\(\)`\s+reads/,
    reason: 'public read prose must name editor.read state groups',
  },
  {
    pattern:
      /`editor\.(insertNodes|insertNode|setNodes|moveNodes|wrapNodes|unwrapNodes|removeNodes|insertText|insertFragment|delete|select|move)\(/,
    reason: 'public write prose must name editor.update tx groups',
  },
];

const collectMarkdown = (dir) =>
  readdirSync(dir)
    .flatMap((entry) => {
      const path = join(dir, entry);

      if (statSync(path).isDirectory()) {
        return collectMarkdown(path);
      }

      return path.endsWith('.md') || path.endsWith('.mdx') ? [path] : [];
    })
    .sort();

const inCodeFenceByLine = (lines) => {
  const codeLines = new Set();
  let inFence = false;

  lines.forEach((line, index) => {
    if (line.trimStart().startsWith('```')) {
      inFence = !inFence;
      return;
    }

    if (inFence) {
      codeLines.add(index);
    }
  });

  return codeLines;
};

const failures = [];

for (const path of collectMarkdown(docsRoot)) {
  const relativePath = relative(repoRoot, path).replaceAll('\\', '/');
  const source = readFileSync(path, 'utf8');
  const lines = source.split('\n');
  const codeLines = inCodeFenceByLine(lines);

  lines.forEach((line, index) => {
    if (codeLines.has(index)) {
      for (const { pattern, reason } of staleCodePatterns) {
        if (pattern.test(line)) {
          failures.push(
            `${relativePath}:${index + 1}: ${reason}: ${line.trim()}`
          );
        }
      }
    }

    if (teachingDocs.has(relativePath)) {
      for (const { pattern, reason } of staleTeachingPatterns) {
        if (pattern.test(line)) {
          failures.push(
            `${relativePath}:${index + 1}: ${reason}: ${line.trim()}`
          );
        }
      }
    }
  });
}

if (failures.length > 0) {
  console.error('Slate v2 docs audit failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Slate v2 docs audit passed.');
