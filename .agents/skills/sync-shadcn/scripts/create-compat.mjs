import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { git, resolveClone } from './ui-drift.mjs';

const ts = createRequire(import.meta.url)('@typescript/typescript6');

export const DEFAULT_CREATE_REF = 'origin/main';

export const CREATE_COMPAT_FEATURE = 'create-compat';

const upstreamSources = {
  preset: [
    'packages/registry/src/preset/preset.ts',
    'packages/shadcn/src/preset/preset.ts',
  ],
  styleMap: ['packages/shadcn/src/styles/transform-style-map.ts'],
  updateFiles: [
    'packages/registry/src/updaters/update-files.ts',
    'packages/registry/src/utils/updaters/update-files.ts',
    'packages/shadcn/src/utils/updaters/update-files.ts',
  ],
};

// These fields' values change the code the CLI writes, so each value needs a
// verdict. The other fields write only CSS variables.
const perValueFields = { iconLibrary: 'icon', menuColor: 'menu', style: 'style' };

const plateSources = [
  {
    file: 'apps/www/src/lib/plate-registry-styles.ts',
    name: 'PLATE_REGISTRY_BASES',
    prefix: 'base',
  },
  {
    file: 'apps/www/src/lib/plate-registry-styles.ts',
    name: 'PLATE_REGISTRY_STYLE_NAMES',
    prefix: 'style',
  },
  {
    file: 'apps/www/src/lib/registry-icon-placeholder.ts',
    name: 'ICON_PLACEHOLDER_LIBRARIES',
    prefix: 'icon',
  },
  {
    file: 'apps/www/scripts/vendored-shadcn.mts',
    name: 'SHADCN_INSTALL_MARKERS',
    prefix: 'marker',
  },
];

const servedStates = new Set(['synced', 'fork']);

function parse(source, file) {
  return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
}

function unwrap(node) {
  let next = node;
  while (
    next &&
    (ts.isAsExpression(next) ||
      ts.isSatisfiesExpression(next) ||
      ts.isParenthesizedExpression(next))
  ) {
    next = next.expression;
  }
  return next;
}

function constants(sourceFile) {
  const found = new Map();
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (ts.isIdentifier(declaration.name) && declaration.initializer) {
        found.set(declaration.name.text, unwrap(declaration.initializer));
      }
    }
  }
  return found;
}

function declared(found, name, file) {
  const node = found.get(name);
  if (!node) {
    throw new Error(`${file} declares no ${name}.`);
  }
  return node;
}

function arrayElements(found, node, file, label) {
  const value = unwrap(node);
  if (ts.isIdentifier(value)) {
    return arrayElements(
      found,
      declared(found, value.text, file),
      file,
      value.text
    );
  }
  if (!ts.isArrayLiteralExpression(value)) {
    throw new Error(`${file}: ${label} is not an array literal.`);
  }
  return value.elements.flatMap((element) =>
    ts.isSpreadElement(element)
      ? arrayElements(found, element.expression, file, label)
      : [unwrap(element)]
  );
}

function stringArray(found, name, file) {
  return arrayElements(found, declared(found, name, file), file, name).map(
    (element) => {
      if (!ts.isStringLiteral(element)) {
        throw new Error(`${file}: ${name} holds a value that is not a string.`);
      }
      return element.text;
    }
  );
}

function property(object, key, file) {
  const match = object.properties.find(
    (prop) =>
      ts.isPropertyAssignment(prop) &&
      prop.name.getText(object.getSourceFile()) === key
  );
  if (!match) {
    throw new Error(`${file}: a preset field has no ${key}.`);
  }
  return unwrap(match.initializer);
}

function readPreset(source, file) {
  const found = constants(parse(source, file));
  const options = stringArray(found, 'PRESET_BASES', file).map(
    (value) => `base:${value}`
  );

  for (const field of arrayElements(
    found,
    declared(found, 'PRESET_FIELDS_V2', file),
    file,
    'PRESET_FIELDS_V2'
  )) {
    if (!ts.isObjectLiteralExpression(field)) {
      throw new Error(`${file}: PRESET_FIELDS_V2 holds a non-object field.`);
    }
    const key = property(field, 'key', file);
    if (!ts.isStringLiteral(key)) {
      throw new Error(`${file}: a preset field key is not a string.`);
    }
    const prefix = perValueFields[key.text];
    if (!prefix) {
      options.push(`preset:${key.text}`);
      continue;
    }
    for (const value of arrayElements(
      found,
      property(field, 'values', file),
      file,
      `${key.text} values`
    )) {
      if (!ts.isStringLiteral(value)) {
        throw new Error(`${file}: a ${key.text} value is not a string.`);
      }
      options.push(`${prefix}:${value.text}`);
    }
  }

  return options;
}

function readMarkers(source, file) {
  const set = declared(constants(parse(source, file)), 'ALLOWLIST', file);
  const [values] = ts.isNewExpression(set) ? (set.arguments ?? []) : [];
  if (!values || !ts.isArrayLiteralExpression(values)) {
    throw new Error(`${file}: ALLOWLIST is not new Set([...]).`);
  }
  return values.elements.map((element) => {
    if (!ts.isStringLiteral(element)) {
      throw new Error(`${file}: ALLOWLIST holds a value that is not a string.`);
    }
    return `marker:${element.text}`;
  });
}

function readTransforms(source, file) {
  const names = [];
  const collect = (node) => {
    const value = unwrap(node);
    if (ts.isIdentifier(value)) {
      names.push(value.text);
    } else if (ts.isArrayLiteralExpression(value)) {
      for (const element of value.elements) {
        collect(ts.isSpreadElement(element) ? element.expression : element);
      }
    } else if (ts.isConditionalExpression(value)) {
      collect(value.whenTrue);
      collect(value.whenFalse);
    } else {
      throw new Error(
        `${file}: the transform(...) list holds ${ts.SyntaxKind[value.kind]}, which this check cannot read.`
      );
    }
  };
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'transform' &&
      node.arguments.length === 2
    ) {
      collect(node.arguments[1]);
    }
    ts.forEachChild(node, visit);
  };
  visit(parse(source, file));

  if (names.length === 0) {
    throw new Error(`${file} has no transform(opts, [...]) call.`);
  }
  return [...new Set(names)].map((name) => `transform:${name}`);
}

function showFirst(clone, commit, paths) {
  for (const file of paths) {
    const exists = git(clone, ['ls-tree', '--name-only', commit, '--', file])
      .split('\n')
      .includes(file);
    if (exists) {
      return { file, source: git(clone, ['show', `${commit}:${file}`]) };
    }
  }
  throw new Error(
    `shadcn ${commit.slice(0, 9)} has none of ${paths.join(', ')}.`
  );
}

function readPlateServed(repoRoot) {
  const served = new Set();
  for (const { file, name, prefix } of plateSources) {
    const absolute = path.join(repoRoot, file);
    if (!fs.existsSync(absolute)) {
      throw new Error(`${file} does not exist.`);
    }
    for (const value of stringArray(
      constants(parse(fs.readFileSync(absolute, 'utf8'), file)),
      name,
      file
    )) {
      served.add(`${prefix}:${value}`);
    }
  }
  return served;
}

function resolveRef(clone, ref) {
  let line;
  try {
    line = git(clone, [
      'log',
      '-1',
      '--format=%H %cs',
      '--end-of-options',
      `${ref}^{commit}`,
    ]).trim();
  } catch {
    throw new Error(
      `shadcn ref ${ref} does not resolve in ${clone}. Fetch it, or pass --ref with a commit the clone has.`
    );
  }
  const [commit, date] = line.split(' ');
  return { commit, date };
}

export function readCreateCompat(repoRoot, status, ref = DEFAULT_CREATE_REF) {
  const clone = resolveClone(repoRoot, status);
  const resolved = resolveRef(clone, ref);
  const preset = showFirst(clone, resolved.commit, upstreamSources.preset);
  const styleMap = showFirst(clone, resolved.commit, upstreamSources.styleMap);
  const updateFiles = showFirst(
    clone,
    resolved.commit,
    upstreamSources.updateFiles
  );

  return {
    ref,
    ...resolved,
    sources: [preset.file, styleMap.file, updateFiles.file],
    options: [
      ...readPreset(preset.source, preset.file),
      ...readMarkers(styleMap.source, styleMap.file),
      ...readTransforms(updateFiles.source, updateFiles.file),
    ],
    served: readPlateServed(repoRoot),
  };
}

export function findCompatProblems(compat, items) {
  const upstream = new Set(compat.options);
  const listing = new Map();
  for (const item of items) {
    for (const option of item.options) {
      listing.set(option, [...(listing.get(option) ?? []), item]);
    }
  }

  return {
    unrecorded: compat.options.filter((option) => !listing.has(option)),
    unknown: [...listing.keys()].filter((option) => !upstream.has(option)),
    duplicated: [...listing]
      .filter(([, listed]) => listed.length > 1)
      .map(
        ([option, listed]) =>
          `${option} (${listed.map((item) => item.id).join(', ')})`
      ),
    unsettled: [...compat.served]
      .sort()
      .filter(
        (option) =>
          !(listing.get(option) ?? []).some((item) =>
            servedStates.has(item.state)
          )
      ),
    undecided: items
      .filter(
        (item) =>
          item.options.length > 0 &&
          (!item.decision.trim() || !item.evidence.trim())
      )
      .map((item) => item.id),
  };
}

export function describeCompatProblems(compat, problems) {
  const at = `shadcn ${compat.ref} ${compat.commit.slice(0, 9)}`;
  return [
    problems.unrecorded.length > 0 &&
      `${at} has create options no deltas.json item lists in options: ${problems.unrecorded.join(', ')}. Judge each against Plate's served code and add it to an item.`,
    problems.unknown.length > 0 &&
      `deltas.json items list options ${at} does not have: ${problems.unknown.join(', ')}. Drop each from its item, or record why Plate still needs it.`,
    problems.duplicated.length > 0 &&
      `More than one deltas.json item lists: ${problems.duplicated.join('; ')}. Keep each option in one item.`,
    problems.unsettled.length > 0 &&
      `Plate serves create options whose item is not synced or fork: ${problems.unsettled.join(', ')}. Make Plate's served code work with each, or stop serving it.`,
    problems.undecided.length > 0 &&
      `deltas.json items list options without a decision or evidence: ${problems.undecided.join(', ')}.`,
  ].filter(Boolean);
}
