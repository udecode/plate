import path from 'node:path';

export const entrypointRuntimes = Object.freeze(['headless', 'ssr', 'client']);
const entrypointRuntimeSet = new Set(entrypointRuntimes);

const withRuntime = (runtime) => (entrypoint) => ({
  ...entrypoint,
  runtime,
});

const headless = withRuntime('headless');
const ssr = withRuntime('ssr');
const client = withRuntime('client');

const directory = (
  source,
  dependencies = [],
  externalDependencies = [],
  options = {}
) => ({
  dependencies,
  externalDependencies,
  peerDependencies: [],
  public: true,
  source,
  sourceKind: 'directory',
  ...options,
});

const file = (
  source,
  dependencies = [],
  externalDependencies = [],
  options = {}
) => ({
  dependencies,
  externalDependencies,
  peerDependencies: [],
  public: true,
  source,
  sourceKind: 'file',
  ...options,
});

const root = (dependencies = [], externalDependencies = [], options = {}) => ({
  dependencies,
  externalDependencies,
  peerDependencies: [],
  public: true,
  source: null,
  sourceKind: 'root',
  ...options,
});

const privateDirectory = (
  source,
  dependencies = [],
  externalDependencies = [],
  options = {}
) =>
  directory(source, dependencies, externalDependencies, {
    public: false,
    ...options,
  });

const privateRoot = (
  dependencies = [],
  externalDependencies = [],
  options = {}
) => root(dependencies, externalDependencies, { public: false, ...options });

export const rootFeatureDependencies = Object.freeze({
  'basic-nodes': [],
  'basic-styles': [],
  'code-block': ['dom'],
  indent: [],
  link: [],
  list: ['standard/indent'],
});

export const publicFeatureDependencies = Object.freeze({
  callout: [],
  combobox: [],
  comments: [],
  date: [],
  details: [],
  find: [],
  footnote: ['combobox'],
  layout: [],
  media: ['dom'],
  mention: ['combobox'],
  'slash-command': ['combobox'],
  suggestion: ['diff'],
  table: ['dom'],
  tag: [],
  toc: [],
});

export const publicFeatureReactEntrypoints = Object.freeze([
  'callout',
  'comments',
  'date',
  'details',
  'footnote',
  'layout',
  'media',
  'mention',
  'slash-command',
  'suggestion',
  'table',
  'tag',
  'toc',
]);

export const publicReactOnlyEntrypoints = Object.freeze(['resizable']);

const standardReactDependencies = {
  table: ['dom'],
};

const standardReactPeerDependencies = {
  'basic-nodes': ['react'],
  list: ['react'],
  resizable: ['react'],
  table: ['react'],
  details: ['react'],
};

const rootReactFeatures = [
  'basic-nodes',
  'basic-styles',
  'code-block',
  'indent',
  'link',
  'list',
];

const rootFeatureEntrypoints = Object.fromEntries([
  ...Object.entries(rootFeatureDependencies).map(([name, dependencies]) => [
    `standard/${name}`,
    headless(
      privateDirectory(`features/${name}`, ['core', ...dependencies], [])
    ),
  ]),
  ...rootReactFeatures.map((name) => [
    `standard/${name}/react`,
    client(
      privateDirectory(
        `react/features/${name}`,
        [
          'core',
          'react-core',
          `standard/${name}`,
          ...(standardReactDependencies[name] ?? []),
        ],
        [],
        { peerDependencies: standardReactPeerDependencies[name] ?? [] }
      )
    ),
  ]),
]);

const publicFeatureEntrypoints = Object.fromEntries([
  ...Object.entries(publicFeatureDependencies).map(([name, dependencies]) => [
    name,
    headless(
      directory(
        `features/${name}`,
        ['core', ...dependencies],
        name === 'comments' ? ['plitejs/annotations'] : [],
        name === 'combobox' ? {} : { runtimeProof: 'plate-plugin' }
      )
    ),
  ]),
  ...publicFeatureReactEntrypoints.map((name) => [
    `${name}/react`,
    client(
      directory(
        `react/features/${name}`,
        [
          'core',
          'react-core',
          name,
          ...(standardReactDependencies[name] ?? []),
        ],
        [],
        {
          peerDependencies: standardReactPeerDependencies[name] ?? [],
          runtimeProof: 'plate-plugin-client',
        }
      )
    ),
  ]),
  ...publicReactOnlyEntrypoints.map((name) => [
    `${name}/react`,
    client(
      directory(
        `react/features/${name}`,
        ['core', 'react-core', ...(standardReactDependencies[name] ?? [])],
        [],
        {
          peerDependencies: standardReactPeerDependencies[name] ?? [],
        }
      )
    ),
  ]),
]);

const singletonPartitions = (entrypointNames) =>
  Object.fromEntries(
    entrypointNames.map((entrypointName) => [
      entrypointName.replaceAll('/', '-'),
      [entrypointName],
    ])
  );

export const entrypointDags = {
  platejs: {
    entrypoints: {
      compiler: headless(directory('compiler', ['core'])),
      ai: headless(
        directory(
          'ai',
          ['core', 'markdown', 'combobox', 'suggestion', 'table'],
          [],
          { peerDependencies: ['fastest-levenshtein'] }
        )
      ),
      'ai/react': client(
        directory(
          'ai/react',
          [
            'ai',
            'core',
            'markdown',
            'react-core',
            'combobox',
            'suggestion',
            'suggestion/react',
            'table',
          ],
          [],
          { peerDependencies: ['@ai-sdk/react', 'ai', 'react'] }
        )
      ),
      authored: headless(directory('authored', [], ['plitejs/authored'])),
      core: headless(privateRoot(['dom', 'history'], ['plitejs'])),
      'code-block/codemirror': client(
        directory('code-block/codemirror', ['react-core'], [], {
          peerDependencies: [
            '@codemirror/language',
            '@codemirror/state',
            '@codemirror/view',
          ],
        })
      ),
      'code-drawing': client(
        directory('code-drawing', ['core'], [], {
          peerDependencies: [
            'flowchart.js',
            'mermaid',
            'plantuml-encoder',
            'viz.js',
          ],
        })
      ),
      'code-drawing/react': client(
        directory('code-drawing/react', ['code-drawing', 'core', 'react-core'])
      ),
      csv: headless(
        directory('csv', ['core'], [], {
          peerDependencies: ['@types/papaparse', 'papaparse'],
        })
      ),
      diff: headless(
        directory('diff', [], ['plitejs/diff'], {
          peerDependencies: ['diff-match-patch-ts'],
        })
      ),
      dom: client(directory('dom', [], ['plitejs/dom'])),
      'dnd/react': client(
        directory('dnd/react', ['core', 'react-core', 'standard/list'], [], {
          peerDependencies: [
            'raf',
            'react',
            'react-dnd',
            'react-dnd-html5-backend',
          ],
        })
      ),
      docx: client(
        directory('docx', ['core', 'docx-html'], [], {
          peerDependencies: ['juice'],
        })
      ),
      'docx/export': client(
        directory('docx/export', ['core', 'static'], [], {
          peerDependencies: [
            'color-name',
            'html-to-vdom',
            'jszip',
            'juice',
            'mime-types',
            'virtual-dom',
            'xmlbuilder2',
          ],
        })
      ),
      'docx/import': client(
        directory('docx/import', ['core', 'docx-html'], [], {
          peerDependencies: ['mammoth'],
        })
      ),
      'docx-html': client(
        privateDirectory('docx/html', ['core'], [], {
          peerDependencies: ['validator'],
        })
      ),
      emoji: headless(
        directory('emoji', ['core', 'combobox'], [], {
          peerDependencies: ['@emoji-mart/data'],
        })
      ),
      'emoji/react': client(
        directory('emoji/react', ['core', 'emoji', 'react-core'])
      ),
      excalidraw: headless(
        directory('excalidraw', ['core'], [], {
          peerDependencies: ['@excalidraw/excalidraw'],
        })
      ),
      'excalidraw/react': client(
        directory(
          'excalidraw/react',
          ['core', 'excalidraw', 'react-core'],
          [],
          {
            peerDependencies: ['@excalidraw/excalidraw', 'react'],
          }
        )
      ),
      history: headless(directory('history', [], ['plitejs/history'])),
      hyperscript: headless(
        directory('hyperscript', [], ['plitejs/hyperscript'])
      ),
      markdown: headless(
        directory('markdown', ['core', 'standard/list'], [], {
          peerDependencies: [
            'marked',
            'remark-mdx',
            'remark-parse',
            'remark-stringify',
            'unified',
          ],
        })
      ),
      math: headless(
        directory('math', ['core'], [], {
          peerDependencies: ['katex'],
        })
      ),
      'math/react': client(
        directory('math/react', ['core', 'math', 'react-core'])
      ),
      migrations: headless(directory('migrations', ['core', 'dom', 'history'])),
      pagination: headless(
        directory('pagination', [], ['plitejs/pagination'], {
          peerDependencies: ['@chenglou/pretext'],
        })
      ),
      'pagination/react': client(
        directory('pagination/react', [], ['plitejs/pagination/react'])
      ),
      'react-core': client(
        privateDirectory(
          'react',
          ['core', 'dom', 'history', 'static'],
          ['plitejs/annotations', 'plitejs/react'],
          { peerDependencies: ['react', 'react-dom'] }
        )
      ),
      react: client(
        file('react/index', [
          'react-core',
          'root-shared',
          ...rootReactFeatures.map((name) => `standard/${name}/react`),
        ])
      ),
      root: headless(file('index', ['root-shared'])),
      'root-shared': headless(
        file(
          'root',
          [
            'core',
            ...Object.keys(rootFeatureDependencies).map(
              (name) => `standard/${name}`
            ),
          ],
          [],
          { public: false }
        )
      ),
      static: ssr(
        directory('static', ['core', 'dom'], ['plitejs/react'], {
          peerDependencies: ['react', 'react-dom'],
          runtimeProof: 'plate-static-html',
        })
      ),
      testing: headless(directory('testing', [], ['plitejs/testing'])),
      ...rootFeatureEntrypoints,
      ...publicFeatureEntrypoints,
      tabbable: headless(
        directory('tabbable', ['core'], [], {
          peerDependencies: ['tabbable'],
        })
      ),
      'tabbable/react': client(
        directory('tabbable/react', ['core', 'react-core', 'tabbable'], [], {
          peerDependencies: ['react', 'tabbable'],
        })
      ),
      yjs: headless(directory('yjs', ['core'], ['plitejs/yjs'])),
      'yjs/react': client(
        directory(
          'yjs/react',
          ['core', 'react-core', 'yjs'],
          ['plitejs/yjs/react'],
          {
            peerDependencies: ['react'],
          }
        )
      ),
    },
    fallbackEntrypoint: 'core',
    packageRoot: 'packages/platejs',
    sourceMarker: '/packages/platejs/src/',
    taskPartitions: {
      core: ['core'],
      migrations: ['migrations'],
      proxies: [
        'authored',
        'diff',
        'dom',
        'history',
        'hyperscript',
        'pagination',
        'pagination/react',
      ],
      react: ['react'],
      'react-core': ['react-core'],
      root: ['root', 'root-shared'],
      static: ['static'],
      ...singletonPartitions([
        ...Object.keys(rootFeatureDependencies).map(
          (name) => `standard/${name}`
        ),
        ...rootReactFeatures.map((name) => `standard/${name}/react`),
        ...Object.keys(publicFeatureDependencies),
        ...publicFeatureReactEntrypoints.map((name) => `${name}/react`),
        ...publicReactOnlyEntrypoints.map((name) => `${name}/react`),
        'ai',
        'ai/react',
        'code-block/codemirror',
        'code-drawing',
        'code-drawing/react',
        'compiler',
        'csv',
        'dnd/react',
        'docx',
        'docx/export',
        'docx/import',
        'docx-html',
        'emoji',
        'emoji/react',
        'excalidraw',
        'excalidraw/react',
        'markdown',
        'math',
        'math/react',
        'tabbable',
        'tabbable/react',
        'testing',
        'yjs',
        'yjs/react',
      ]),
    },
  },
  plitejs: {
    entrypoints: {
      annotations: headless(directory('annotations', ['root'])),
      authored: headless(directory('authored', ['root'])),
      diff: headless(
        directory('diff', ['root'], [], {
          peerDependencies: ['diff-match-patch-ts'],
        })
      ),
      dom: client(directory('dom', ['root'])),
      history: headless(directory('history', ['root'])),
      hyperscript: headless(directory('hyperscript', ['root'])),
      pagination: headless(
        directory('pagination', ['root'], [], {
          peerDependencies: ['@chenglou/pretext'],
        })
      ),
      'pagination/react': client(
        file('pagination/react', ['root', 'pagination', 'react'], [], {
          peerDependencies: ['react', 'react-dom'],
        })
      ),
      react: client(
        directory('react', ['root', 'dom', 'annotations'], [], {
          peerDependencies: ['@tanstack/react-virtual', 'react', 'react-dom'],
        })
      ),
      root: headless(root()),
      testing: headless(directory('testing', ['root', 'hyperscript'])),
      yjs: headless(
        directory('yjs', ['root'], [], {
          peerDependencies: ['diff-match-patch-ts', 'yjs'],
        })
      ),
      'yjs/react': client(
        directory('yjs/react', ['root', 'react', 'yjs'], [], {
          peerDependencies: ['react'],
        })
      ),
    },
    packageRoot: 'packages/plitejs',
    sourceMarker: '/packages/plitejs/src/',
    taskPartitions: {
      authored: ['authored'],
      core: ['annotations', 'root'],
      diff: ['diff'],
      dom: ['dom'],
      history: ['history'],
      pagination: ['pagination', 'pagination/react'],
      react: ['react'],
      testing: ['hyperscript', 'testing'],
      yjs: ['yjs', 'yjs/react'],
    },
  },
  '@platejs/test': {
    contractPartition: 'root',
    entrypoints: {
      browser: client(directory('browser')),
      playwright: headless(
        directory('playwright', ['browser', 'proof', 'root'], ['platejs'], {
          peerDependencies: ['@playwright/test'],
        })
      ),
      proof: headless(directory('proof')),
      react: client(
        directory('react', [], ['platejs/react'], {
          peerDependencies: ['@testing-library/react', 'react', 'react-dom'],
        })
      ),
      root: headless(root([], ['platejs', 'platejs/testing'])),
    },
    packageRoot: 'packages/test',
    sourceMarker: '/packages/test/src/',
    taskPartitions: {
      browser: ['browser'],
      playwright: ['playwright'],
      proof: ['proof'],
      react: ['react'],
      root: ['root'],
    },
  },
};

const sourceExtension = /\.(?:[cm]?[jt]sx?)$/u;

export const normalizePath = (value) => value.replaceAll('\\', '/');

export const normalizeSourcePath = (value) =>
  normalizePath(value).replace(sourceExtension, '');

export const dependencyName = (specifier) =>
  specifier.startsWith('@')
    ? specifier.split('/').slice(0, 2).join('/')
    : specifier.split('/')[0];

const isWithinSourceRoot = (relativePath) =>
  relativePath !== '..' && !relativePath.startsWith('../');

export const assertEntrypointDags = (dags = entrypointDags) => {
  const runtimeProofs = {
    client: new Set(['plate-plugin-client']),
    headless: new Set(['plate-plugin']),
    ssr: new Set(['plate-static-html']),
  };

  for (const [packageName, definition] of Object.entries(dags)) {
    const { entrypoints } = definition;

    if (!entrypoints.root || entrypoints.root.public === false) {
      throw new Error(`${packageName} must define one root entrypoint.`);
    }

    const taskSlugs = new Set();
    const partitionedEntrypoints = new Set();

    for (const [entrypointName, entrypoint] of Object.entries(entrypoints)) {
      const taskSlug = entrypointTaskSlug(entrypointName);

      if (!entrypointRuntimeSet.has(entrypoint.runtime)) {
        throw new Error(
          `${packageName}/${entrypointName} must declare runtime as ${entrypointRuntimes.join(', ')}.`
        );
      }
      if (
        entrypoint.public !== false &&
        entrypoint.runtime === 'ssr' &&
        (typeof entrypoint.runtimeProof !== 'string' ||
          entrypoint.runtimeProof.length === 0)
      ) {
        throw new Error(
          `${packageName}/${entrypointName} must declare an SSR runtime proof.`
        );
      }
      if (
        entrypoint.runtimeProof !== undefined &&
        !runtimeProofs[entrypoint.runtime].has(entrypoint.runtimeProof)
      ) {
        throw new Error(
          `${packageName}/${entrypointName} declares unknown ${entrypoint.runtime} runtime proof ${entrypoint.runtimeProof}.`
        );
      }

      if (taskSlugs.has(taskSlug)) {
        throw new Error(
          `${packageName} entrypoint task slug ${taskSlug} is ambiguous.`
        );
      }
      taskSlugs.add(taskSlug);

      for (const dependency of entrypoint.dependencies) {
        if (!(dependency in entrypoints)) {
          throw new Error(
            `${packageName}/${entrypointName} references unknown entrypoint ${dependency}.`
          );
        }
      }

      for (const dependency of entrypoint.externalDependencies) {
        const target = resolvePublicEntrypoint(dependency, dags);

        if (!target || target.packageName === packageName) {
          throw new Error(
            `${packageName}/${entrypointName} references invalid external entrypoint ${dependency}.`
          );
        }
      }

      for (const dependency of entrypoint.peerDependencies ?? []) {
        if (
          typeof dependency !== 'string' ||
          dependency.length === 0 ||
          dependency.includes('/') !== dependency.startsWith('@')
        ) {
          throw new Error(
            `${packageName}/${entrypointName} references invalid peer dependency ${String(dependency)}.`
          );
        }
      }
    }

    for (const [partitionName, partitionEntrypoints] of Object.entries(
      definition.taskPartitions
    )) {
      if (partitionEntrypoints.length === 0) {
        throw new Error(
          `${packageName}/${partitionName} task partition is empty.`
        );
      }

      for (const entrypointName of partitionEntrypoints) {
        if (!(entrypointName in entrypoints)) {
          throw new Error(
            `${packageName}/${partitionName} task partition references unknown entrypoint ${entrypointName}.`
          );
        }
        if (partitionedEntrypoints.has(entrypointName)) {
          throw new Error(
            `${packageName}/${entrypointName} belongs to multiple task partitions.`
          );
        }
        partitionedEntrypoints.add(entrypointName);
      }
    }

    for (const entrypointName of Object.keys(entrypoints)) {
      if (!partitionedEntrypoints.has(entrypointName)) {
        throw new Error(
          `${packageName}/${entrypointName} has no task partition.`
        );
      }
    }
  }

  const visiting = new Set();
  const visited = new Set();
  const visit = (packageName, entrypointName) => {
    const nodeId = `${packageName}/${entrypointName}`;

    if (visiting.has(nodeId)) {
      throw new Error(
        `Entrypoint dependencies contain a cycle through ${nodeId}.`
      );
    }
    if (visited.has(nodeId)) return;

    visiting.add(nodeId);

    const entrypoint = dags[packageName].entrypoints[entrypointName];

    for (const dependency of entrypoint.dependencies) {
      visit(packageName, dependency);
    }
    for (const dependency of entrypoint.externalDependencies) {
      const target = resolvePublicEntrypoint(dependency, dags);

      visit(target.packageName, target.entrypointName);
    }

    visiting.delete(nodeId);
    visited.add(nodeId);
  };

  for (const [packageName, definition] of Object.entries(dags)) {
    for (const entrypointName of Object.keys(definition.entrypoints)) {
      visit(packageName, entrypointName);
    }
  }
};

export const entrypointTaskSlug = (entrypointName) =>
  entrypointName.replaceAll('/', '-');

export const partitionTypecheckTask = (partitionName) =>
  `typecheck:partition:${partitionName}`;

export const entrypointTaskPartition = (packageName, entrypointName) => {
  const partition = Object.entries(
    entrypointDags[packageName].taskPartitions
  ).find(([, entrypoints]) => entrypoints.includes(entrypointName))?.[0];

  if (!partition) {
    throw new Error(`${packageName}/${entrypointName} has no task partition.`);
  }

  return partition;
};

export const findPackageSource = (filename) => {
  const normalizedFilename = normalizeSourcePath(filename);

  for (const [packageName, definition] of Object.entries(entrypointDags)) {
    const markerIndex = normalizedFilename.lastIndexOf(definition.sourceMarker);

    if (markerIndex === -1) continue;

    return {
      definition,
      packageName,
      relativePath: normalizedFilename.slice(
        markerIndex + definition.sourceMarker.length
      ),
      sourceRoot: normalizedFilename.slice(
        0,
        markerIndex + definition.sourceMarker.length - 1
      ),
    };
  }

  return null;
};

export const classifyEntrypoint = (definition, relativePath) => {
  const normalizedRelativePath = normalizeSourcePath(relativePath);
  const ownedEntrypoints = Object.entries(definition.entrypoints)
    .filter(([, entrypoint]) => entrypoint.sourceKind !== 'root')
    .toSorted(
      ([, left], [, right]) => right.source.length - left.source.length
    );

  for (const [entrypointName, entrypoint] of ownedEntrypoints) {
    if (
      entrypoint.sourceKind === 'file' &&
      normalizedRelativePath === entrypoint.source
    ) {
      return entrypointName;
    }

    if (
      entrypoint.sourceKind === 'directory' &&
      (normalizedRelativePath === entrypoint.source ||
        normalizedRelativePath.startsWith(`${entrypoint.source}/`))
    ) {
      return entrypointName;
    }
  }

  return definition.fallbackEntrypoint ?? 'root';
};

export const resolveEntrypointEdge = (filename, importSource) => {
  const packageSource = findPackageSource(filename);

  if (!packageSource) return null;

  if (!importSource.startsWith('.')) {
    const target = resolvePublicEntrypoint(importSource);

    if (!target) {
      const peerDependency = dependencyName(importSource);
      const modeledPeers = new Set(
        Object.values(packageSource.definition.entrypoints).flatMap(
          (entrypoint) => entrypoint.peerDependencies ?? []
        )
      );

      if (!modeledPeers.has(peerDependency)) return null;

      return {
        definition: packageSource.definition,
        escapedSourceRoot: false,
        from: classifyEntrypoint(
          packageSource.definition,
          packageSource.relativePath
        ),
        packageName: packageSource.packageName,
        peerImport: true,
        publicImport: false,
        to: peerDependency,
        toPackageName: null,
      };
    }

    return {
      definition: packageSource.definition,
      escapedSourceRoot: false,
      from: classifyEntrypoint(
        packageSource.definition,
        packageSource.relativePath
      ),
      packageName: packageSource.packageName,
      peerImport: false,
      publicImport: true,
      to: target.entrypointName,
      toPackageName: target.packageName,
    };
  }

  const resolvedTarget = normalizeSourcePath(
    path.resolve(path.dirname(filename), importSource)
  );
  const targetRelativePath = path.posix.relative(
    packageSource.sourceRoot,
    resolvedTarget
  );
  const from = classifyEntrypoint(
    packageSource.definition,
    packageSource.relativePath
  );

  if (!isWithinSourceRoot(targetRelativePath)) {
    return {
      definition: packageSource.definition,
      escapedSourceRoot: true,
      from,
      packageName: packageSource.packageName,
      publicImport: false,
      to: null,
      toPackageName: packageSource.packageName,
    };
  }

  return {
    definition: packageSource.definition,
    escapedSourceRoot: false,
    from,
    packageName: packageSource.packageName,
    peerImport: false,
    publicImport: false,
    to: classifyEntrypoint(packageSource.definition, targetRelativePath),
    toPackageName: packageSource.packageName,
  };
};

export const resolvePublicEntrypoint = (specifier, dags = entrypointDags) => {
  for (const [packageName, definition] of Object.entries(dags)) {
    if (specifier === packageName) {
      return { entrypointName: 'root', packageName };
    }
    if (!specifier.startsWith(`${packageName}/`)) continue;

    const entrypointName = specifier.slice(packageName.length + 1);

    if (
      entrypointName in definition.entrypoints &&
      definition.entrypoints[entrypointName].public !== false
    ) {
      return { entrypointName, packageName };
    }
  }

  return null;
};

export const getPublicEntrypointRuntimeRows = (dags = entrypointDags) =>
  Object.entries(dags)
    .flatMap(([packageName, definition]) =>
      Object.entries(definition.entrypoints)
        .filter(([, entrypoint]) => entrypoint.public !== false)
        .map(([entrypointName, entrypoint]) => ({
          entrypointName,
          packageName,
          runtime: entrypoint.runtime,
          runtimeProof: entrypoint.runtimeProof,
          specifier:
            entrypointName === 'root'
              ? packageName
              : `${packageName}/${entrypointName}`,
        }))
    )
    .sort((left, right) => left.specifier.localeCompare(right.specifier, 'en'));

assertEntrypointDags();
