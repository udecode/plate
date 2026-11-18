import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const ts = createRequire(import.meta.url)('@typescript/typescript6');

const siteUiDir = 'apps/www/src/components/ui';
const upstreamUiDir = 'registry/new-york-v4/ui';
const printer = ts.createPrinter({ removeComments: true });

function git(cwd, args) {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  if (result.status !== 0) {
    throw new Error(
      `git ${args.join(' ')} failed in ${cwd}: ${result.stderr.trim()}`
    );
  }

  return result.stdout;
}

export function canonicalLines(source, fileName) {
  const sourceFile = ts.createSourceFile(
    fileName,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const keyOf = (node) =>
    printer.printNode(ts.EmitHint.Unspecified, node, sourceFile);
  const sortRuns = (nodes, isFixed) => {
    const sorted = [];
    let run = [];
    const flush = () => {
      sorted.push(...run.sort((a, b) => keyOf(a).localeCompare(keyOf(b))));
      run = [];
    };

    for (const node of nodes) {
      if (isFixed(node)) {
        flush();
        sorted.push(node);
      } else {
        run.push(node);
      }
    }
    flush();

    return sorted;
  };
  const never = () => false;
  const opensClassStrings = (node) =>
    ((ts.isJsxAttribute(node) || ts.isPropertyAssignment(node)) &&
      /class/i.test(node.name.getText(sourceFile))) ||
    (ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      ['cn', 'cva'].includes(node.expression.text));

  const transformer = (context) => {
    const { factory } = context;
    const visit = (node, inClassStrings) => {
      if (
        ts.isImportDeclaration(node) ||
        (ts.isExpressionStatement(node) &&
          ts.isSourceFile(node.parent) &&
          ts.isStringLiteral(node.expression))
      ) {
        return;
      }

      const childrenInClassStrings =
        inClassStrings || opensClassStrings(node);
      const next = ts.visitEachChild(
        node,
        (child) => visit(child, childrenInClassStrings),
        context
      );

      if (ts.isStringLiteral(next)) {
        return factory.createStringLiteral(
          inClassStrings
            ? next.text.split(/\s+/).filter(Boolean).sort().join(' ')
            : next.text
        );
      }
      if (ts.isJsxAttributes(next)) {
        return factory.updateJsxAttributes(
          next,
          sortRuns(next.properties, ts.isJsxSpreadAttribute)
        );
      }
      if (ts.isObjectLiteralExpression(next)) {
        return factory.createObjectLiteralExpression(
          sortRuns(next.properties, ts.isSpreadAssignment),
          true
        );
      }
      if (ts.isArrayLiteralExpression(next)) {
        return factory.createArrayLiteralExpression(next.elements, true);
      }
      if (ts.isObjectBindingPattern(next)) {
        return factory.updateObjectBindingPattern(
          next,
          sortRuns(next.elements, (element) => Boolean(element.dotDotDotToken))
        );
      }
      if (ts.isTypeLiteralNode(next)) {
        return factory.updateTypeLiteralNode(
          next,
          factory.createNodeArray(sortRuns(next.members, never))
        );
      }
      if (ts.isUnionTypeNode(next)) {
        return factory.updateUnionTypeNode(
          next,
          factory.createNodeArray(sortRuns(next.types, never))
        );
      }
      if (ts.isNamedExports(next)) {
        return factory.updateNamedExports(
          next,
          sortRuns(next.elements, never)
        );
      }

      return next;
    };

    return (file) => ts.visitNode(file, visit);
  };

  const result = ts.transform(sourceFile, [transformer]);
  const printed = printer.printFile(result.transformed[0]);
  result.dispose();

  return printed
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function diffLines(upstream, plate) {
  const width = plate.length + 1;
  const table = new Uint32Array((upstream.length + 1) * width);

  for (let i = upstream.length - 1; i >= 0; i--) {
    for (let j = plate.length - 1; j >= 0; j--) {
      table[i * width + j] =
        upstream[i] === plate[j]
          ? table[(i + 1) * width + j + 1] + 1
          : Math.max(table[(i + 1) * width + j], table[i * width + j + 1]);
    }
  }

  const lines = [];
  let i = 0;
  let j = 0;

  while (i < upstream.length || j < plate.length) {
    if (i < upstream.length && j < plate.length && upstream[i] === plate[j]) {
      i++;
      j++;
    } else if (
      i < upstream.length &&
      (j === plate.length ||
        table[(i + 1) * width + j] >= table[i * width + j + 1])
    ) {
      lines.push(`- ${upstream[i++]}`);
    } else {
      lines.push(`+ ${plate[j++]}`);
    }
  }

  return lines;
}

function resolveUpstream(repoRoot, status) {
  const commit = status.uiSyncedCommit;
  if (!commit) {
    throw new Error(
      'docs/sync/shadcn/status.json has no uiSyncedCommit, the upstream commit the site ui copies are compared against.'
    );
  }

  const commonDir = git(repoRoot, [
    'rev-parse',
    '--path-format=absolute',
    '--git-common-dir',
  ]).trim();
  const clone = path.resolve(
    path.dirname(commonDir),
    status.upstream.clonePath
  );
  const hasCommit =
    fs.existsSync(clone) &&
    spawnSync('git', ['cat-file', '-e', `${commit}^{commit}`], { cwd: clone })
      .status === 0;

  if (!hasCommit) {
    throw new Error(
      `uiSyncedCommit ${commit} is not in ${clone}. Clone ${status.upstream.repo} there, or fetch ${status.upstream.remote}.`
    );
  }

  return {
    clone,
    commit,
    dir: path.posix.join(status.upstream.appPath, upstreamUiDir),
  };
}

export function readUiDrift(repoRoot, status) {
  const upstream = resolveUpstream(repoRoot, status);
  const upstreamNames = new Set(
    git(upstream.clone, [
      'ls-tree',
      '--name-only',
      `${upstream.commit}:${upstream.dir}`,
    ])
      .split('\n')
      .filter(Boolean)
  );
  const files = fs
    .readdirSync(path.join(repoRoot, siteUiDir))
    .filter((name) => name.endsWith('.tsx'))
    .sort()
    .map((name) => {
      const file = path.posix.join(siteUiDir, name);
      if (!upstreamNames.has(name)) {
        return { file, upstream: null, lines: [] };
      }

      const upstreamFile = path.posix.join(upstream.dir, name);
      const lines = diffLines(
        canonicalLines(
          git(upstream.clone, ['show', `${upstream.commit}:${upstreamFile}`]),
          name
        ),
        canonicalLines(
          fs.readFileSync(path.join(repoRoot, file), 'utf8'),
          name
        )
      );

      return { file, upstream: upstreamFile, lines };
    });

  return { commit: upstream.commit, files };
}
