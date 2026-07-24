import { readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testDir, '../../..');
const pliteDomRoot = resolve(repoRoot, 'packages/plite-dom/src');
const pliteReactRoot = resolve(repoRoot, 'packages/plite-react/src');
const sourceFiles = [
  resolve(pliteReactRoot, 'components/editable.tsx'),
  ...readdirSync(resolve(pliteReactRoot, 'editable'))
    .filter((file) => file.endsWith('.ts') || file.endsWith('.tsx'))
    .map((file) => resolve(pliteReactRoot, 'editable', file)),
];

const getMatchesByFile = (pattern: RegExp) =>
  Object.fromEntries(
    sourceFiles
      .map((file) => {
        const source = readFileSync(file, 'utf8');
        const matches = source.match(pattern);

        return [
          relative(repoRoot, file),
          matches ? matches.length : 0,
        ] as const;
      })
      .filter(([, count]) => count > 0)
      .sort(([a], [b]) => a.localeCompare(b))
  );

const getMatchesByRelativeFile = (pattern: RegExp, files: readonly string[]) =>
  Object.fromEntries(
    files
      .map((file) => {
        const absoluteFile = resolve(pliteReactRoot, file);
        const source = readFileSync(absoluteFile, 'utf8');
        const matches = source.match(pattern);

        return [
          relative(repoRoot, absoluteFile),
          matches ? matches.length : 0,
        ] as const;
      })
      .filter(([, count]) => count > 0)
      .sort(([a], [b]) => a.localeCompare(b))
  );

const collectSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      return collectSourceFiles(absolutePath);
    }

    return entry.isFile() &&
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))
      ? [absolutePath]
      : [];
  });

const getMatchesByFiles = (pattern: RegExp, files: readonly string[]) =>
  Object.fromEntries(
    files
      .map((file) => {
        const source = readFileSync(file, 'utf8');
        const matches = source.match(pattern);

        return [
          relative(repoRoot, file),
          matches ? matches.length : 0,
        ] as const;
      })
      .filter(([, count]) => count > 0)
      .sort(([a], [b]) => a.localeCompare(b))
  );

type AuthorityInventory = Record<
  string,
  {
    count: number;
    owner: string;
    rationale: string;
    next: 'burn-down' | 'central-owner' | 'explicit-bridge' | 'worker';
  }
>;

const expectAuthorityInventory = (
  pattern: RegExp,
  inventory: AuthorityInventory
) => {
  expect(getMatchesByFile(pattern)).toEqual(
    Object.fromEntries(
      Object.entries(inventory).map(([file, entry]) => [file, entry.count])
    )
  );
  expect(
    Object.values(inventory).every(
      (entry) =>
        entry.owner.length > 0 &&
        entry.rationale.length > 0 &&
        entry.next.length > 0
    )
  ).toBe(true);
};

type EditableHotPolicyInventory = Record<
  string,
  {
    count: number;
    next: 'burn-down' | 'central-owner' | 'root-source';
    owner: string;
    rationale: string;
  }
>;

const expectEditableHotPolicyInventory = (
  inventory: EditableHotPolicyInventory
) => {
  const editableSource = readFileSync(
    resolve(pliteReactRoot, 'components/editable.tsx'),
    'utf8'
  );
  const actual = Object.fromEntries(
    Object.entries(inventory).map(([pattern]) => {
      const expression = new RegExp(pattern, 'g');
      const matches = editableSource.match(expression);

      return [pattern, matches ? matches.length : 0] as const;
    })
  );

  expect(actual).toEqual(
    Object.fromEntries(
      Object.entries(inventory).map(([pattern, entry]) => [
        pattern,
        entry.count,
      ])
    )
  );
  expect(
    Object.values(inventory).every(
      (entry) =>
        entry.owner.length > 0 &&
        entry.rationale.length > 0 &&
        entry.next.length > 0
    )
  ).toBe(true);
};

type EditableEventRuntimeInventory = Record<
  string,
  {
    count: number;
    next:
      | 'event-runtime'
      | 'runtime-facade'
      | 'root-wiring'
      | 'temporary-bridge';
    owner: string;
    rationale: string;
  }
>;

const expectEditableEventRuntimeInventory = (
  inventory: EditableEventRuntimeInventory
) => {
  const editableSource = readFileSync(
    resolve(pliteReactRoot, 'components/editable.tsx'),
    'utf8'
  );
  const actual = Object.fromEntries(
    Object.entries(inventory).map(([pattern]) => {
      const expression = new RegExp(pattern, 'g');
      const matches = editableSource.match(expression);

      return [pattern, matches ? matches.length : 0] as const;
    })
  );

  expect(actual).toEqual(
    Object.fromEntries(
      Object.entries(inventory).map(([pattern, entry]) => [
        pattern,
        entry.count,
      ])
    )
  );
  expect(
    Object.values(inventory).every(
      (entry) =>
        entry.owner.length > 0 &&
        entry.rationale.length > 0 &&
        entry.next.length > 0
    )
  ).toBe(true);
};

type SourceOwnershipInventory = Record<
  string,
  {
    count: number;
    next: 'burn-down' | 'node-source' | 'root-runtime' | 'root-source';
    owner: string;
    rationale: string;
  }
>;

const expectSourceOwnershipInventory = (
  pattern: RegExp,
  files: readonly string[],
  inventory: SourceOwnershipInventory
) => {
  expect(getMatchesByRelativeFile(pattern, files)).toEqual(
    Object.fromEntries(
      Object.entries(inventory).map(([file, entry]) => [file, entry.count])
    )
  );
  expect(
    Object.values(inventory).every(
      (entry) =>
        entry.owner.length > 0 &&
        entry.rationale.length > 0 &&
        entry.next.length > 0
    )
  ).toBe(true);
};

const editableRootRuntimeFiles = [
  'components/editable.tsx',
  'components/editable-descendant-binding.ts',
  'components/editable-text-blocks.tsx',
  'editable/root-selector-sources.ts',
] as const;

test('EditableDOMRoot hot policy ownership has an explicit burn-down inventory', () => {
  expectEditableHotPolicyInventory({
    '\\bEDITOR_TO_FORCE_RENDER\\.set\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Runtime repair/view engine',
      rationale:
        'Editable must not register the root wakeup callback directly; repair/view runtime owns forced render requests.',
    },
    '\\bcompleteEditableSelectionChangeImport\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Runtime selection engine',
      rationale:
        'Selectionchange import completion belongs with the selectionchange runtime controller.',
    },
    '\\bcreateDOMRepairQueue\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Runtime repair engine',
      rationale:
        'Editable must not construct the repair queue directly; repair lifecycle policy belongs behind runtime ownership.',
    },
    '\\bdomRepairQueue\\.cancelBefore\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Runtime repair engine',
      rationale:
        'Event-frame repair cancellation should be routed through the repair engine instead of component-local calls.',
    },
    '\\bgetEditableSelectionChangeOwnership\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Runtime selection engine',
      rationale:
        'Selectionchange ownership classification is hot policy and should not live inside React component closures.',
    },
    '\\bsetEditableComposingState\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Runtime composition engine',
      rationale:
        'Editable must not own composition state transitions directly; runtime composition engine owns them.',
    },
    '\\buseAndroidInputManager\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Runtime Android engine',
      rationale:
        'Editable must not construct the Android input manager directly; runtime Android engine owns it.',
    },
    '\\buseEditorSelector\\(': {
      count: 0,
      next: 'root-source',
      owner: 'Editable root source selector',
      rationale:
        'Editable root commit wakeup is tolerated only until a named source/view selector owns it.',
    },
  });
});

test('root selector source ownership is fenced to named source modules', () => {
  expectSourceOwnershipInventory(
    /\buseEditorSelector\(/g,
    editableRootRuntimeFiles,
    {
      'packages/plite-react/src/editable/root-selector-sources.ts': {
        count: 6,
        next: 'root-source',
        owner: 'Editable root selector sources',
        rationale:
          'Generic root selector calls are allowed only inside the named root selector source module.',
      },
    }
  );

  expectSourceOwnershipInventory(
    /\beditorGetSnapshot\(/g,
    editableRootRuntimeFiles,
    {
      'packages/plite-react/src/components/editable-descendant-binding.ts': {
        count: 1,
        next: 'node-source',
        owner: 'Mounted node render selector',
        rationale:
          'This snapshot read resolves mounted child runtime ids inside the named descendant binding owner, not root render facts.',
      },
    }
  );
});

test('EditableDOMRoot root runtime orchestration has an explicit next-owner inventory', () => {
  expectEditableHotPolicyInventory({
    '\\battachEditableGlobalDragLifecycleListeners\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Editable root runtime',
      rationale:
        'Global drag lifecycle listener attachment should move behind the root runtime facade.',
    },
    '\\battachEditableSelectionChangeListener\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Editable root runtime',
      rationale:
        'Global selectionchange listener attachment should move behind the root runtime facade.',
    },
    '\\bcreateRuntimeSelectionChangeHandler\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Runtime selection engine',
      rationale:
        'Selectionchange handler construction should be composed by the root runtime facade.',
    },
    '\\bcreateRuntimeSelectionChangeScheduler\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Runtime selection engine',
      rationale:
        'Selectionchange throttling should be composed by the root runtime facade.',
    },
    '\\bcreateRuntimeSelectionImportController\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Runtime selection engine',
      rationale:
        'Selection import controller construction should be composed by the root runtime facade.',
    },
    '\\bsubscribeSelectionOnlyDOMExport\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Runtime selection engine',
      rationale:
        'Selection-only DOM export subscription should be owned by the root runtime facade.',
    },
    '\\buseEditableRootCommitWakeup\\(': {
      count: 0,
      next: 'root-source',
      owner: 'Editable root selector sources',
      rationale:
        'Root commit wakeup is a named source hook but should be called through the root runtime facade.',
    },
    '\\buseFlushDeferredSelectorsOnRender\\(': {
      count: 0,
      next: 'root-source',
      owner: 'Editable root runtime facade',
      rationale:
        'Deferred selector flushing is a root runtime wakeup and should not be called directly by EditableDOMRoot.',
    },
    '\\buseEditableRootRuntime\\(': {
      count: 1,
      next: 'central-owner',
      owner: 'Editable root runtime facade',
      rationale:
        'EditableDOMRoot should enter root policy through one root runtime facade.',
    },
    '\\buseEditableSelectionReconciler\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Runtime selection reconciler',
      rationale:
        'Selection reconciler setup should move behind the root runtime facade.',
    },
    '\\buseRuntimeAndroidEngine\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Runtime Android engine',
      rationale:
        'Android input lifecycle should move behind the root runtime facade.',
    },
    '\\buseRuntimeKernelTraceEngine\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Runtime kernel trace engine',
      rationale:
        'Kernel trace runtime setup should move behind the root runtime facade.',
    },
    '\\buseRuntimeRepairEngine\\(': {
      count: 0,
      next: 'central-owner',
      owner: 'Runtime repair engine',
      rationale:
        'Repair runtime setup should move behind the root runtime facade.',
    },
  });
});

test('root global lifecycle listeners are owned by the root lifecycle module', () => {
  const rootRuntimeFiles = [
    'editable/runtime-root-engine.ts',
    'editable/runtime-root-lifecycle.ts',
    'editable/runtime-root-selection-import.ts',
    'editable/runtime-root-selection-export.ts',
  ] as const;

  expectSourceOwnershipInventory(
    /\battachEditableSelectionChangeListener\(/g,
    rootRuntimeFiles,
    {
      'packages/plite-react/src/editable/runtime-root-lifecycle.ts': {
        count: 1,
        next: 'root-runtime',
        owner: 'Editable root global lifecycle',
        rationale:
          'Native selectionchange listener attachment belongs in the root lifecycle owner, not the root coordinator body.',
      },
    }
  );

  expectSourceOwnershipInventory(
    /\battachEditableGlobalDragLifecycleListeners\(/g,
    rootRuntimeFiles,
    {
      'packages/plite-react/src/editable/runtime-root-lifecycle.ts': {
        count: 1,
        next: 'root-runtime',
        owner: 'Editable root global lifecycle',
        rationale:
          'Global drag cleanup belongs with root lifecycle attachment, not the root coordinator body.',
      },
    }
  );

  expectSourceOwnershipInventory(
    /\buseEditableRootGlobalLifecycle\(/g,
    rootRuntimeFiles,
    {
      'packages/plite-react/src/editable/runtime-root-engine.ts': {
        count: 1,
        next: 'root-runtime',
        owner: 'Editable root runtime facade',
        rationale:
          'The root runtime facade should delegate global listener attachment through one lifecycle owner.',
      },
    }
  );

  expectSourceOwnershipInventory(
    /\bcreateRuntimeSelectionChangeHandler\(/g,
    rootRuntimeFiles,
    {
      'packages/plite-react/src/editable/runtime-root-selection-import.ts': {
        count: 1,
        next: 'root-runtime',
        owner: 'Editable root selection import',
        rationale:
          'Selectionchange handler construction belongs in the root selection import owner, not the root coordinator body.',
      },
    }
  );

  expectSourceOwnershipInventory(
    /\bcreateRuntimeSelectionChangeScheduler\(/g,
    rootRuntimeFiles,
    {
      'packages/plite-react/src/editable/runtime-root-selection-import.ts': {
        count: 1,
        next: 'root-runtime',
        owner: 'Editable root selection import',
        rationale:
          'Selectionchange throttling belongs in the root selection import owner, not the root coordinator body.',
      },
    }
  );

  expectSourceOwnershipInventory(
    /\bcreateRuntimeSelectionImportController\(/g,
    rootRuntimeFiles,
    {
      'packages/plite-react/src/editable/runtime-root-selection-import.ts': {
        count: 1,
        next: 'root-runtime',
        owner: 'Editable root selection import',
        rationale:
          'Selection import controller construction belongs in the root selection import owner, not the root coordinator body.',
      },
    }
  );

  expectSourceOwnershipInventory(
    /\buseEditableRootSelectionImport\(/g,
    rootRuntimeFiles,
    {
      'packages/plite-react/src/editable/runtime-root-engine.ts': {
        count: 1,
        next: 'root-runtime',
        owner: 'Editable root runtime facade',
        rationale:
          'The root runtime facade should delegate selection import construction through one root owner.',
      },
    }
  );

  expectSourceOwnershipInventory(
    /\bsubscribeSelectionOnlyDOMExport\(/g,
    rootRuntimeFiles,
    {
      'packages/plite-react/src/editable/runtime-root-selection-export.ts': {
        count: 1,
        next: 'root-runtime',
        owner: 'Editable root selection export',
        rationale:
          'Selection-only DOM export subscription belongs in a root selection export owner, not the root coordinator body.',
      },
    }
  );

  expectSourceOwnershipInventory(
    /\buseEditableRootSelectionExport\(/g,
    rootRuntimeFiles,
    {
      'packages/plite-react/src/editable/runtime-root-engine.ts': {
        count: 1,
        next: 'root-runtime',
        owner: 'Editable root runtime facade',
        rationale:
          'The root runtime facade should delegate selection export subscription through one root owner.',
      },
    }
  );
});

test('root runtime cells are owned by EditableDOMRuntime', () => {
  const rootRuntimeStateFiles = [
    'editable/editable-dom-runtime.ts',
    'editable/runtime-root-engine.ts',
    'editable/runtime-root-state.ts',
  ] as const;

  expectSourceOwnershipInventory(
    /\buseEditableRootRuntimeState\(/g,
    rootRuntimeStateFiles,
    {
      'packages/plite-react/src/editable/runtime-root-engine.ts': {
        count: 1,
        next: 'root-runtime',
        owner: 'Editable root runtime facade',
        rationale:
          'The root runtime facade should enter root cell/state ownership through one state hook.',
      },
    }
  );

  expectSourceOwnershipInventory(/\buseRef\(/g, rootRuntimeStateFiles, {});

  expectSourceOwnershipInventory(
    /\bcreateEditableInputControllerState\(/g,
    rootRuntimeStateFiles,
    {
      'packages/plite-react/src/editable/editable-dom-runtime.ts': {
        count: 1,
        next: 'root-runtime',
        owner: 'DOM input runtime adapter',
        rationale:
          'The React adapter binds controller access to the renderer-neutral per-root input runtime.',
      },
    }
  );

  expectSourceOwnershipInventory(
    /\bnew EditableDOMRuntime\(/g,
    rootRuntimeStateFiles,
    {
      'packages/plite-react/src/editable/runtime-root-state.ts': {
        count: 1,
        next: 'root-runtime',
        owner: 'Editable root runtime state',
        rationale:
          'The React bridge creates exactly one imperative runtime per mounted root.',
      },
    }
  );

  expectSourceOwnershipInventory(
    /\bisSelectionPartialDOMBacked\(/g,
    rootRuntimeStateFiles,
    {
      'packages/plite-react/src/editable/editable-dom-runtime.ts': {
        count: 1,
        next: 'root-runtime',
        owner: 'Editable DOM runtime',
        rationale:
          'Partial-DOM-backed selection policy belongs to the runtime that owns the mounted root.',
      },
    }
  );
});

test('renderer-neutral input decisions and edit epochs are DOM-owned', () => {
  const allDOMSourceFiles = collectSourceFiles(pliteDomRoot);
  const allReactSourceFiles = collectSourceFiles(pliteReactRoot);
  const inputSourceFiles = [...allDOMSourceFiles, ...allReactSourceFiles];

  expect(
    getMatchesByFiles(
      /\bprepare(?:BeforeInput|Clipboard|Composition|FocusMouse|Input|KeyDown)Decision\b/g,
      inputSourceFiles
    )
  ).toEqual({
    'packages/plite-dom/src/plugin/dom-input-runtime.ts': 6,
    'packages/plite-react/src/editable/editing-kernel.ts': 6,
  });
  expect(
    getMatchesByFiles(
      /commandKey: .*?(?:delete-both|delete-fragment|insert-break|delete):/g,
      inputSourceFiles
    )
  ).toEqual({
    'packages/plite-dom/src/plugin/dom-input-runtime.ts': 4,
  });
  expect(
    allReactSourceFiles.some((file) =>
      file.endsWith('/editable/editing-epoch-kernel.ts')
    )
  ).toBe(false);
});

test('each mounted root runtime owns the only DOM phase scheduler instance', () => {
  const allSourceFiles = collectSourceFiles(pliteReactRoot);
  const allDOMSourceFiles = collectSourceFiles(pliteDomRoot);
  const editableSourceFiles = collectSourceFiles(
    resolve(pliteReactRoot, 'editable')
  );

  expect(
    getMatchesByFiles(/\bcreateDOMPhaseScheduler\(/g, allSourceFiles)
  ).toEqual({});
  expect(
    getMatchesByFiles(/\bcreateDOMPhaseScheduler\(/g, allDOMSourceFiles)
  ).toEqual({
    'packages/plite-dom/src/plugin/dom-phase-scheduler.ts': 1,
    'packages/plite-dom/src/plugin/dom-root-runtime.ts': 1,
  });
  expect(
    getMatchesByFiles(
      /\b(?:queueMicrotask|requestAnimationFrame|setTimeout)\(/g,
      editableSourceFiles
    )
  ).toEqual({});
  expect(
    getMatchesByFiles(
      /\b(?:queueMicrotask|requestAnimationFrame|setTimeout)\(/g,
      allDOMSourceFiles
    )
  ).toEqual({
    'packages/plite-dom/src/plugin/dom-phase-scheduler.ts': 6,
  });
  expect(
    getMatchesByFiles(/\bdomPhaseScheduler\?:/g, editableSourceFiles)
  ).toEqual({});
});

test('all source timing primitives are scheduler internals or named semantic timers', () => {
  const allSourceFiles = collectSourceFiles(pliteReactRoot);

  expect(
    getMatchesByFiles(
      /\b(?:queueMicrotask|requestAnimationFrame|requestIdleCallback|setTimeout)\(|Promise\.resolve\(\)\.then\(/g,
      allSourceFiles
    )
  ).toEqual({
    'packages/plite-react/src/components/editable-rendered-element.tsx': 1,
    'packages/plite-react/src/components/editable-text-blocks.tsx': 2,
    'packages/plite-react/src/hooks/use-plite-annotation-store.tsx': 1,
    'packages/plite-react/src/hooks/use-plite-decoration-source.ts': 1,
    'packages/plite-react/src/hooks/use-plite-widget-store.tsx': 1,
    'packages/plite-react/src/hooks/use-editor-selector.tsx': 1,
  });
  expect(
    getMatchesByFiles(
      /document\.(?:addEventListener|removeEventListener)\(['"](?:blur|focus|focusin|focusout)['"]/g,
      allSourceFiles
    )
  ).toEqual({});
});

test('DOM sync tokens and model selection preferences belong to the root runtime lifecycle', () => {
  const allDOMSourceFiles = collectSourceFiles(pliteDomRoot);
  const allReactSourceFiles = collectSourceFiles(pliteReactRoot);

  expect(
    getMatchesByFiles(/\bnew DOMSyncMutationOwnership\(/g, allReactSourceFiles)
  ).toEqual({});
  expect(
    getMatchesByFiles(/\bnew DOMSyncMutationOwnership\(/g, allDOMSourceFiles)
  ).toEqual({
    'packages/plite-dom/src/plugin/dom-root-runtime.ts': 1,
  });
  expect(
    getMatchesByFiles(
      /\bMODEL_SELECTION_DOM_PREFERENCE_TTL_MS\b/g,
      allReactSourceFiles
    )
  ).toEqual({
    'packages/plite-react/src/editable/editable-dom-runtime.ts': 3,
  });
  expect(
    getMatchesByFiles(
      /\b(?:DOM_SYNC_MUTATION_TOKENS|PENDING_DOM_SYNC_MUTATION_TOKENS|MODEL_SELECTION_DOM_PREFERENCES)\b/g,
      allReactSourceFiles
    )
  ).toEqual({});
});

test('one private root runtime owns DOM mutation observation', () => {
  const allDOMSourceFiles = collectSourceFiles(pliteDomRoot);
  const allReactSourceFiles = collectSourceFiles(pliteReactRoot);

  expect(
    getMatchesByFiles(
      /\bnew MutationObserverConstructor\(/g,
      allReactSourceFiles
    )
  ).toEqual({});
  expect(
    getMatchesByFiles(/\bnew MutationObserverConstructor\(/g, allDOMSourceFiles)
  ).toEqual({
    'packages/plite-dom/src/plugin/dom-integrity-observer.ts': 1,
  });
  expect(
    getMatchesByFiles(/\buseMutationObserver\(/g, allReactSourceFiles)
  ).toEqual({});
});

test('EditableDOMRoot event-worker imports have an explicit event-runtime inventory', () => {
  expectEditableEventRuntimeInventory({
    "\\bfrom '../editable/browser-handle'": {
      count: 0,
      next: 'event-runtime',
      owner: 'Runtime browser handle events',
      rationale:
        'Browser proof handle attachment should be routed through the event runtime instead of the React root component.',
    },
    "\\bfrom '../editable/clipboard-input-strategy'": {
      count: 0,
      next: 'event-runtime',
      owner: 'Runtime clipboard events',
      rationale:
        'Clipboard handler assembly belongs to the event runtime; the strategy module remains the worker.',
    },
    "\\bfrom '../editable/composition-state'": {
      count: 0,
      next: 'event-runtime',
      owner: 'Runtime composition events',
      rationale:
        'Composition event handler assembly and adjacent pending mark effects belong to runtime owners, not EditableDOMRoot.',
    },
    "\\bfrom '../editable/editing-kernel'": {
      count: 0,
      next: 'event-runtime',
      owner: 'Runtime keyboard events',
      rationale:
        'Kernel preparation calls should be made by event family owners, not by EditableDOMRoot closures.',
    },
    "\\bfrom '../editable/input-router'": {
      count: 0,
      next: 'runtime-facade',
      owner: 'Editable event runtime facade',
      rationale:
        'Root event wrapper hooks may stay as low-level adapters, but their assembly belongs behind runtime facades.',
    },
    "\\bfrom '../editable/runtime-clipboard-events'": {
      count: 0,
      next: 'runtime-facade',
      owner: 'Editable event runtime facade',
      rationale:
        'Clipboard event family assembly is in a runtime module and should be composed by the facade in the final shape.',
    },
    "\\bfrom '../editable/runtime-before-input-events'": {
      count: 0,
      next: 'runtime-facade',
      owner: 'Editable event runtime facade',
      rationale:
        'Beforeinput event family assembly is in a runtime module and should be composed by the facade in the final shape.',
    },
    "\\bfrom '../editable/runtime-browser-handle-events'": {
      count: 0,
      next: 'runtime-facade',
      owner: 'Editable event runtime facade',
      rationale:
        'Browser handle setup is behind a runtime module and should be composed by the facade in the final shape.',
    },
    "\\bfrom '../editable/runtime-composition-events'": {
      count: 0,
      next: 'runtime-facade',
      owner: 'Editable event runtime facade',
      rationale:
        'Composition event family assembly is in a runtime module and should be composed by the facade in the final shape.',
    },
    "\\bfrom '../editable/runtime-drag-events'": {
      count: 0,
      next: 'runtime-facade',
      owner: 'Editable event runtime facade',
      rationale:
        'Drag/drop event family assembly is in a runtime module and should be composed by the facade in the final shape.',
    },
    "\\bfrom '../editable/runtime-event-engine'": {
      count: 0,
      next: 'runtime-facade',
      owner: 'Editable event runtime facade',
      rationale:
        'EditableDOMRoot consumes the root runtime facade, which composes the event runtime facade.',
    },
    "\\bfrom '../editable/runtime-focus-mouse-events'": {
      count: 0,
      next: 'runtime-facade',
      owner: 'Editable event runtime facade',
      rationale:
        'Focus/mouse event family assembly is in a runtime module and should be composed by the facade in the final shape.',
    },
    "\\bfrom '../editable/runtime-input-events'": {
      count: 0,
      next: 'runtime-facade',
      owner: 'Editable event runtime facade',
      rationale:
        'Input event family assembly is in a runtime module and should be composed by the facade in the final shape.',
    },
    "\\bfrom '../editable/runtime-keyboard-events'": {
      count: 0,
      next: 'runtime-facade',
      owner: 'Editable event runtime facade',
      rationale:
        'Keyboard event family assembly is in a runtime module and should be composed by the facade in the final shape.',
    },
    "\\bfrom '../editable/runtime-root-engine'": {
      count: 1,
      next: 'runtime-facade',
      owner: 'Editable root runtime facade',
      rationale:
        'EditableDOMRoot may import the root runtime facade as the root policy owner.',
    },
    "\\bfrom '../editable/runtime-target-bridge'": {
      count: 0,
      next: 'runtime-facade',
      owner: 'Editable event runtime facade',
      rationale:
        'Implicit target bridge setup is behind a runtime module and should be composed by the facade in the final shape.',
    },
    "\\bfrom '../editable/keyboard-input-strategy'": {
      count: 0,
      next: 'event-runtime',
      owner: 'Runtime keyboard events',
      rationale:
        'Keyboard event assembly belongs to the event runtime; the keyboard strategy module remains the worker.',
    },
    "\\bfrom '../editable/model-input-strategy'": {
      count: 0,
      next: 'event-runtime',
      owner: 'Runtime beforeinput/input events',
      rationale:
        'Beforeinput and input event assembly should call model-input workers from runtime event owners, not from EditableDOMRoot.',
    },
    "\\bfrom '../editable/native-input-strategy'": {
      count: 0,
      next: 'event-runtime',
      owner: 'Runtime beforeinput events',
      rationale:
        'Native beforeinput decisions are part of event-runtime orchestration.',
    },
    "\\bfrom '../editable/selection-reconciler'": {
      count: 0,
      next: 'event-runtime',
      owner: 'Runtime selection and focus/mouse events',
      rationale:
        'Selection/focus helpers should be consumed by runtime owners rather than the root React component.',
    },
  });
});

test('EditableDOMRoot event handler assembly has an explicit burn-down inventory', () => {
  expectEditableEventRuntimeInventory({
    '\\bconst handle(DOMBeforeInput|ReactBeforeInputFallback|Paste|Copy|Cut|DragEnd|DragOver|DragStart|Drop|CompositionEnd|CompositionStart|CompositionUpdate|Input|InputCapture|Blur|Focus|Click|MouseDown|MouseUp|KeyDown)\\b':
      {
        count: 0,
        next: 'event-runtime',
        owner: 'Editable event runtime family modules',
        rationale:
          'Root event handlers should be assembled by event family modules and returned to EditableDOMRoot as stable bindings.',
      },
    '\\bconst on(DOMBeforeInput|DOMInput|ReactBeforeInput|Paste|Copy|Cut|DragEnd|DragOver|DragStart|Drop|CompositionEnd|CompositionStart|CompositionUpdate|Input|InputCapture|Blur|Focus|Click|MouseDown|MouseUp|KeyDown)\\b':
      {
        count: 0,
        next: 'runtime-facade',
        owner: 'Editable event runtime facade',
        rationale:
          'Root handler wrapper constants should be returned by the event runtime facade instead of assembled directly in EditableDOMRoot.',
      },
    '\\beventRuntime\\.handlers\\b': {
      count: 0,
      next: 'runtime-facade',
      owner: 'Editable root runtime facade',
      rationale:
        'EditableDOMRoot should receive stable root event bindings from the root runtime facade instead of unpacking event families.',
    },
    '\\battachPliteBrowserHandle\\(': {
      count: 0,
      next: 'event-runtime',
      owner: 'Runtime browser handle events',
      rationale:
        'Browser handle setup is an event/proof bridge and should be attached behind a runtime event capability.',
    },
    '\\bwriteTargetRuntime\\(': {
      count: 0,
      next: 'event-runtime',
      owner: 'Runtime target bridge',
      rationale:
        'Implicit target runtime setup is root event capability wiring and should move behind the event runtime facade.',
    },
  });
});

test('kernel frame and trace ownership remains centralized', () => {
  expectAuthorityInventory(/\bbeginEditableEventFrame\(/g, {
    'packages/plite-react/src/editable/runtime-kernel-trace.ts': {
      count: 3,
      next: 'central-owner',
      owner: 'Runtime kernel trace engine',
      rationale:
        'Non-selectionchange event frames are owned by the runtime kernel trace engine.',
    },
    'packages/plite-react/src/editable/browser-handle.ts': {
      count: 1,
      next: 'explicit-bridge',
      owner: 'Browser proof handle',
      rationale:
        'The test-only browser handle imports explicit DOM selections through a named bridge.',
    },
    'packages/plite-react/src/editable/runtime-selection-engine.ts': {
      count: 1,
      next: 'central-owner',
      owner: 'Runtime selection engine',
      rationale:
        'Selectionchange event frames are owned by the runtime selection engine.',
    },
  });

  expectAuthorityInventory(/\brecordEditableKernelTrace\(/g, {
    'packages/plite-react/src/editable/runtime-kernel-trace.ts': {
      count: 3,
      next: 'central-owner',
      owner: 'Runtime kernel trace engine',
      rationale:
        'Non-selectionchange user-event command traces are owned by the runtime kernel trace engine.',
    },
    'packages/plite-react/src/editable/browser-handle.ts': {
      count: 2,
      next: 'explicit-bridge',
      owner: 'Browser proof handle',
      rationale:
        'The handle emits explicit test/proof traces for semantic browser actions.',
    },
    'packages/plite-react/src/editable/dom-repair-queue.ts': {
      count: 1,
      next: 'central-owner',
      owner: 'DOM repair queue',
      rationale: 'The repair executor emits repair traces when it mutates DOM.',
    },
    'packages/plite-react/src/editable/runtime-selection-engine.ts': {
      count: 1,
      next: 'central-owner',
      owner: 'Runtime selection engine',
      rationale:
        'Selectionchange traces are owned by the runtime selection engine.',
    },
  });
});

test('selection bridge authority has an explicit remaining inventory', () => {
  expectAuthorityInventory(
    /\b(syncEditorSelectionFromDOM|syncEditableDOMSelectionToEditor)\(/g,
    {
      'packages/plite-react/src/editable/browser-handle.ts': {
        count: 4,
        next: 'explicit-bridge',
        owner: 'Browser proof handle',
        rationale:
          'The browser handle is the explicit semantic test bridge, not app runtime mutation.',
      },
      'packages/plite-react/src/editable/runtime-selection-engine.ts': {
        count: 2,
        next: 'central-owner',
        owner: 'Runtime selection engine',
        rationale:
          'DOM-to-model selection import policy for editable events is owned by the runtime selection engine.',
      },
      'packages/plite-react/src/editable/selection-reconciler.ts': {
        count: 1,
        next: 'central-owner',
        owner: 'Selection reconciler',
        rationale:
          'Selection reconciler is the central DOM-to-model selection bridge worker.',
      },
    }
  );

  expectAuthorityInventory(/\beditor\.(select|deselect|move|collapse)\(/g, {});
});

test('mutation and repair authority has an explicit remaining inventory', () => {
  expectAuthorityInventory(
    /\b(Editor\.(insertText|deleteBackward|deleteForward|deleteFragment|insertBreak|insertSoftBreak)|ReactEditor\.insertData|editor\.(delete|removeNodes))\(/g,
    {}
  );

  expectAuthorityInventory(
    /\b(requestRepair|applyEditableRepairRequest|repairDOMInput|domRepairQueue\.repair|repairCaretAfterModelIntent|repairCaretAfterModelTextInsert)\(/g,
    {
      'packages/plite-react/src/editable/dom-repair-queue.ts': {
        count: 5,
        next: 'central-owner',
        owner: 'DOM repair queue',
        rationale: 'Repair queue is the central DOM repair executor.',
      },
      'packages/plite-react/src/editable/input-router.ts': {
        count: 1,
        next: 'explicit-bridge',
        owner: 'Input router',
        rationale:
          'Router forwards DOM input events to the Editable-owned repair callback.',
      },
      'packages/plite-react/src/editable/model-input-strategy.ts': {
        count: 1,
        next: 'explicit-bridge',
        owner: 'Model input strategy',
        rationale:
          'Input strategy forwards a verified root receipt after Android declines ownership.',
      },
      'packages/plite-react/src/editable/mutation-controller.ts': {
        count: 2,
        next: 'central-owner',
        owner: 'Mutation controller',
        rationale:
          'Mutation controller may request model-owned repair after mutations.',
      },
      'packages/plite-react/src/editable/runtime-kernel-trace.ts': {
        count: 2,
        next: 'central-owner',
        owner: 'Runtime kernel trace engine',
        rationale:
          'Runtime kernel trace engine routes DOM input repair through traced event frames.',
      },
      'packages/plite-react/src/editable/runtime-repair-engine.ts': {
        count: 1,
        next: 'central-owner',
        owner: 'Runtime repair/view engine',
        rationale:
          'Runtime repair engine owns the root repair request application bridge.',
      },
      'packages/plite-react/src/editable/runtime-selection-engine.ts': {
        count: 1,
        next: 'central-owner',
        owner: 'Runtime selection engine',
        rationale:
          'Runtime selection engine owns selectionchange-triggered pending native text repair.',
      },
    }
  );
});

test('React user-action mutation owners do not bypass semantic commands', () => {
  const mutationOwnerFiles = [
    resolve(pliteReactRoot, 'editable/mutation-block-editing.ts'),
    resolve(pliteReactRoot, 'editable/mutation-controller.ts'),
    resolve(pliteReactRoot, 'editable/mutation-full-block-editing.ts'),
  ];

  expect(
    getMatchesByFiles(
      /\btx\.(?:break|fragment|marks|nodes|slice|text)\.(?:add|delete|insert|insertSoft|remove|replace|replaceChildren)\(/g,
      mutationOwnerFiles
    )
  ).toEqual({});

  expect(
    getMatchesByFiles(/\btx\.selection\.(?:collapse|move|set)\(/g, [
      resolve(pliteReactRoot, 'editable/caret-engine.ts'),
    ])
  ).toEqual({});
});

test('direct force render calls have explicit runtime owners', () => {
  expectAuthorityInventory(/\bforceRender\(/g, {
    'packages/plite-react/src/editable/browser-handle.ts': {
      count: 9,
      next: 'explicit-bridge',
      owner: 'Browser proof handle',
      rationale:
        'Browser proof handles may force the view after explicit semantic test actions and remote canonical change import until proof transport is split from runtime repair.',
    },
    'packages/plite-react/src/editable/keyboard-input-strategy.ts': {
      count: 1,
      next: 'worker',
      owner: 'Keyboard input worker',
      rationale:
        'Keyboard worker still directly forces render for select-all partial-dom-backed selection before repair/view runtime owns that request.',
    },
    'packages/plite-react/src/editable/runtime-repair-engine.ts': {
      count: 1,
      next: 'central-owner',
      owner: 'Runtime repair engine',
      rationale:
        'The root repair owner may force one render while applying an explicit model-owned repair request.',
    },
  });
});
