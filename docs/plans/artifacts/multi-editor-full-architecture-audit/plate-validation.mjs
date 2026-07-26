import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../../../..");
const manifestPath = path.join(
  import.meta.dirname,
  "plate-coverage-manifest.json"
);
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const fail = (message) => {
  throw new Error(`Plate coverage manifest: ${message}`);
};
const relative = (file) => path.relative(root, file).replaceAll(path.sep, "/");
const walk = (directory, accept) => {
  if (!fs.existsSync(directory)) return [];
  const files = [];
  const stack = [directory];

  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const file = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (
          entry.name === "dist" ||
          entry.name === "node_modules" ||
          entry.name === ".next"
        ) {
          continue;
        }
        stack.push(file);
      } else if (accept(file)) {
        files.push(file);
      }
    }
  }

  return files;
};

const expected = [];
const packageDirectories = fs
  .readdirSync(path.join(root, "packages"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith("plite"))
  .map((entry) => entry.name);

for (const packageName of packageDirectories) {
  const packageRoot = path.join(root, "packages", packageName);
  const packageJson = path.join(packageRoot, "package.json");
  if (fs.existsSync(packageJson)) expected.push(packageJson);
  for (const directory of ["src", "test", "type-tests"]) {
    expected.push(
      ...walk(path.join(packageRoot, directory), (file) =>
        /\.[cm]?[jt]sx?$/.test(file)
      )
    );
  }
}
expected.push(
  ...walk(path.join(root, "apps/www/src/registry"), (file) =>
    /\.[cm]?[jt]sx?$/.test(file)
  ),
  ...walk(path.join(root, "apps/www/src/__tests__"), (file) =>
    /\.[cm]?[jt]sx?$/.test(file)
  ),
  ...walk(path.join(root, "content/docs"), (file) => /\.mdx?$/.test(file))
);

const expectedPaths = [...new Set(expected.map(relative))].sort();
const actualPaths = manifest.files.map((file) => file.path);
if (new Set(actualPaths).size !== actualPaths.length) {
  fail("duplicate file paths");
}
if (JSON.stringify([...actualPaths].sort()) !== JSON.stringify(expectedPaths)) {
  const actual = new Set(actualPaths);
  const expectedSet = new Set(expectedPaths);
  fail(
    `scope drift; missing=${
      expectedPaths.filter((file) => !actual.has(file)).join(",") || "none"
    } extra=${
      actualPaths.filter((file) => !expectedSet.has(file)).join(",") || "none"
    }`
  );
}

const knownConcepts = new Set(manifest.conceptIds);
for (const file of manifest.files) {
  const absolute = path.join(root, file.path);
  if (!fs.existsSync(absolute)) fail(`missing file ${file.path}`);
  const source = fs.readFileSync(absolute);
  const sha256 = crypto.createHash("sha256").update(source).digest("hex");
  if (sha256 !== file.sha256) fail(`content drift in ${file.path}`);
  if (!file.exclusion && file.concepts.length === 0) {
    fail(`unmapped file ${file.path}`);
  }
  for (const concept of file.concepts) {
    if (!knownConcepts.has(concept)) {
      fail(`unknown concept ${concept} on ${file.path}`);
    }
  }
  for (const declaration of file.declarations) {
    if (!Number.isInteger(declaration.line) || declaration.line < 1) {
      fail(`invalid declaration line in ${file.path}`);
    }
    if (!declaration.name || declaration.concepts.length === 0) {
      fail(`unmapped declaration in ${file.path}:${declaration.line}`);
    }
    for (const concept of declaration.concepts) {
      if (!knownConcepts.has(concept)) {
        fail(
          `unknown declaration concept ${concept} in ${file.path}:${declaration.line}`
        );
      }
    }
  }
}

const includedFiles = manifest.files.filter((file) => !file.exclusion);
const declarations = includedFiles.flatMap((file) => file.declarations);
const sourceLines = (file) =>
  fs.readFileSync(path.join(root, file), "utf8").split(/\r?\n/);
const countLineMatches = (paths, pattern, accept = () => true) =>
  paths.reduce(
    (count, file) =>
      count +
      sourceLines(file).filter(
        (line, index) => pattern.test(line) && accept(file, line, index + 1)
      ).length,
    0
  );
const productionOptionMutations = includedFiles
  .filter((file) => file.kind === "product" || file.kind === "source")
  .flatMap((file) =>
    sourceLines(file.path).flatMap((line, index) =>
      /\bsetOptions?\s*\(/.test(line)
        ? [{ file: file.path, line: index + 1 }]
        : []
    )
  );
const expectedPressure = {
  globalPriority: {
    conceptualPublicScalars: 2,
    consumptionSites: countLineMatches(
      [
        "packages/core/src/internal/plugin/resolvePlugins.ts",
        "packages/core/src/internal/plugin/compilePlateHtmlCodec.ts",
        "packages/core/src/internal/plugin/compilePlateCodecs.ts",
        "packages/plite/src/core/editor-extension.ts",
      ],
      /(?:\bplugin\??\.priority|\bownerPlugin\.priority|\b(?:a|b)\.resolved\.priority|\bextension\.priority)/
    ),
    repeatedTypeDeclarations: countLineMatches(
      [
        "packages/core/src/lib/plugin/BasePlugin.ts",
        "packages/core/src/lib/plugin/PluginConfig.ts",
        "packages/plite/src/interfaces/editor.ts",
      ],
      /\bpriority\??:\s*number;/
    ),
  },
  mixedPluginOptions: {
    contextAndPortalMethods: 4,
    mutationFiles: new Set(productionOptionMutations.map(({ file }) => file))
      .size,
    mutationLines: productionOptionMutations.length,
    reactHookNames: 4,
  },
  mutualMarkClear: {
    files: 6,
    occurrences: countLineMatches(
      [
        "packages/plite/src/interfaces/editor.ts",
        "packages/plite/src/editor/toggle-mark.ts",
        "packages/plite/src/core/editor-commands.ts",
        "packages/basic-nodes/src/lib/BaseSubscriptPlugin.ts",
        "packages/basic-nodes/src/lib/BaseSuperscriptPlugin.ts",
        "packages/utils/src/react/hooks/useMarkToolbarButton.ts",
      ],
      /\bclear\b/,
      (file, line) =>
        file !== "packages/plite/src/interfaces/editor.ts" ||
        /clear\?: string\[\] \| string/.test(line)
    ),
  },
  orderedContentPressure: {
    activeCorrectionEntries: countLineMatches(
      [
        "packages/utils/src/lib/plugins/single-block/SingleBlockPlugin.ts",
        "packages/utils/src/lib/plugins/single-block/SingleLinePlugin.ts",
        "packages/utils/src/lib/plugins/trailing-block/TrailingBlockPlugin.ts",
        "packages/utils/src/lib/plugins/normalize-types/NormalizeTypesPlugin.ts",
      ],
      /\bevent:\s*'(?:children|content)'/
    ),
    activeCorrectionOwners: 4,
    classicListPositionalAssumptions: countLineMatches(
      ["packages/list-classic/src/lib/BaseListPlugin.ts"],
      /concat\(0\)|concat\(\[1\]\)|concat\(1\)|children\[0\]|children\[1\]|\[\.\.\.liPath, 1(?:, 0)?\]/
    ),
  },
  queryMiddleware: {
    executionOwnerLines:
      fs
        .readFileSync(
          path.join(root, "packages/plite/src/core/query-middleware.ts"),
          "utf8"
        )
        .match(/\n/g)?.length ?? 0,
    exportedTypes: 4,
    plateRegistrationFiles: 4,
    plateRegistrations: countLineMatches(
      [
        "packages/core/src/lib/plugins/override/OverridePlugin.ts",
        "packages/diff/src/lib/excludeDiffFromFragment.ts",
        "packages/table/src/lib/BaseTablePlugin.ts",
        "packages/toggle/src/react/TogglePlugin.tsx",
      ],
      /\bqueries:/
    ),
    wrapperCalls: countLineMatches(
      [
        "packages/plite/src/core/editor-query-runtime.ts",
        "packages/plite/src/core/public-state.ts",
        "packages/plite/src/core/query-middleware.ts",
      ],
      /\bexecuteQueryMiddleware\(/
    ),
    overridableMethods: 43,
  },
};
if (JSON.stringify(expectedPressure) !== JSON.stringify(manifest.pressure)) {
  fail(
    `pressure mismatch; expected=${JSON.stringify(
      expectedPressure
    )} actual=${JSON.stringify(manifest.pressure)}`
  );
}
const recomputed = {
  bytes: manifest.files.reduce((sum, file) => sum + file.bytes, 0),
  declarations: declarations.length,
  excludedFiles: manifest.files.length - includedFiles.length,
  exportedDeclarations: declarations.filter((item) => item.exported).length,
  files: manifest.files.length,
  includedFiles: includedFiles.length,
  kinds: Object.fromEntries(
    [...new Set(manifest.files.map((file) => file.kind))]
      .sort()
      .map((kind) => [
        kind,
        manifest.files.filter((file) => file.kind === kind).length,
      ])
  ),
  lines: manifest.files.reduce((sum, file) => sum + file.lines, 0),
  packages: packageDirectories.length,
  publicPackages: packageDirectories.filter((packageName) =>
    fs.existsSync(path.join(root, "packages", packageName, "package.json"))
  ).length,
  targetPublicPackages: manifest.files.filter(
    (file) => file.kind === "package" && !file.exclusion
  ).length,
};

if (JSON.stringify(recomputed) !== JSON.stringify(manifest.summary)) {
  fail(
    `summary mismatch; expected=${JSON.stringify(
      recomputed
    )} actual=${JSON.stringify(manifest.summary)}`
  );
}

console.log(
  `plate coverage ok: ${manifest.summary.includedFiles} included files, ` +
    `${manifest.summary.declarations} declarations, ` +
    `${manifest.summary.exportedDeclarations} exported declarations, ` +
    `${manifest.summary.excludedFiles} explicit exclusions`
);
