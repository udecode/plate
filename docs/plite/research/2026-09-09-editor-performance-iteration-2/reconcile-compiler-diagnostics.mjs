import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const out = resolve(
  import.meta.dirname,
  '../../../plans/artifacts/2026-09-09-editor-performance-research-iteration-2'
);
const inventory = JSON.parse(
  readFileSync(resolve(out, 'react-compiler-inventory.json'), 'utf8')
);
const owners = {
  'EditorRefEffect.tsx': [
    'keep-boundary-with-proof',
    'The dynamic hook program is keyed by callback identity, forcing a new component when the hook implementation changes. Keep that lifetime law; compiled/uncompiled reconfiguration needs the exact callback replacement replay. A Compiler diagnostic is not evidence that the keyed program calls different hooks in one retained component.',
  ],
  'useCreateEditor.ts': [
    'keep-public-lifetime-contract',
    'The public id/enabled/caller-dependency list owns editor replacement. Do not expand dependencies to every options identity merely to satisfy a literal-list transform. A different lifetime API is a Best API question with current creation consumers.',
  ],
  'useStaticEditor.ts': [
    'keep-public-lifetime-contract',
    'The public id/enabled/dependency list owns static editor replacement. Preserve configured feature and inferred return types; source compilation does not prove a static consumer.',
  ],
  'react-helpers.tsx': [
    'defer-helper-specific-change',
    'Variadic composed refs preserve independent detach and React 19 cleanup. useStableFn separately reads the latest committed callback while the caller owns identity. Inspect reachability and actual callers before retaining or rewriting each helper; neither diagnostic proves hot render work.',
  ],
  'useDeepCompareMemo.ts': [
    'defer-concurrent-consumer-proof',
    'PlateContent is the current consumer, building handler and editable-prop values. A render-local memo replacement must preserve identity, callback freshness and aborted-render behavior before deleting the deep comparison. Ref diagnostics identify the boundary, not an observed stale handler.',
  ],
  'react.tsx': [
    'keep-resource-owner-with-proof',
    'The pagination layout belongs to editor identity; committed effects reconfigure current options and connect the runtime. Recomputing the layout for every option identity would replace owned resources. Test resource counts and reconfiguration before changing this memo.',
  ],
  'plite.tsx': [
    'keep-resource-owner-with-proof',
    'The decoration manager follows editor identity; setSources reconciles inputs and insertion cleanup owns mount/destroy. Preserve that owner while E26 measures its internal setup cost.',
  ],
  'use-virtualized-root-plan.ts': [
    'keep-incompatible-library-boundary',
    'TanStack Virtual returns an imperative measurement API. E23 is the separate immutable-window experiment. Forcing compilation without observable geometry can freeze the range.',
  ],
  'runtime-root-state.ts': [
    'keep-resource-owner-with-proof',
    'EditableDOMRuntime belongs to the mounted editor view; committed updates apply read-only and DOM strategy inputs before connecting. A dependency expansion that replaces the runtime can interrupt composition and native selection.',
  ],
  'use-editor.ts': [
    'keep-public-lifetime-contract',
    'The caller dependency list defines component-owned editor lifetime. The explicit suppression is intentional. Preserve inferred initial-value/extension types and test exact replacement behavior before any API redesign.',
  ],
  'use-plite-annotation-store.tsx': [
    'defer-owned-cell-shape',
    'Annotation/options cells publish in insertion effects; render constructs a dormant owner. A private owner method could express committed updates more clearly, but must preserve identity, revision invalidation, error callbacks and strict-mode teardown. No render-time mutation failure is established.',
  ],
  'use-plite-widget-store.tsx': [
    'defer-owned-cell-shape',
    'Widget/options cells publish after commit into a dormant store keyed by editor, source id and annotation store. Preserve those identities, activation and deferred teardown before changing the private cell shape.',
  ],
  'font-color-toolbar-button.tsx': [
    'defer-compiler-reproduction',
    'ColorInput constructs an onClick closure that reads inputRef.current when clicked; source inspection does not show that read executing during render. Keep native color-input and composed-ref behavior. Use a minimal emitted-code reproduction before classifying the Compiler report as a product defect.',
  ],
  'select-command.tsx': [
    'keep-imperative-contract-with-proof',
    'CommandRoot owns a lazy mutable store whose callbacks run after construction; function declarations are hoisted. The Compiler reports forward references and committed store-cell mutation. A canonical snapshot adapter may improve this boundary only after proving controlled state, imperative setSearch/selectCurrentItem/selectFirstItem, focus, keyboard, IME and teardown. No blanket upstream cmdk replacement is accepted.',
  ],
};
const rows = [];
for (const file of inventory.rows)
  for (const event of file.events) {
    if (event.kind !== 'CompileError') continue;
    const detail = event.detail?.options ?? {};
    const category = detail.category ?? 'CompilerControlFlow';
    const reason = detail.reason ?? 'Unknown diagnostic';
    let disposition;
    let assessment;
    if (category === 'Todo' || category === 'CompilerControlFlow') {
      disposition = /lowerAssignment.*AssignmentPattern/.test(reason)
        ? 'defer-toolchain-adoption'
        : 'defer-language-lowering';
      assessment =
        disposition === 'defer-toolchain-adoption'
          ? 'The identical-source Babel 7 control eliminates all 262 assignment-pattern diagnostics. This isolates a toolchain-dependent diagnostic effect; actual emitted-consumer correctness and performance are required before adopting a build change. Do not rewrite normal destructured defaults to work around this probe.'
          : 'This source form was not lowered by the inspected Compiler pairing. Keep the current operation; compare a minimal equivalent form only if its actual hot function needs compilation and behavior remains identical.';
    } else {
      const owner = owners[file.file.split('/').at(-1)];
      if (!owner)
        throw new Error(`Unclassified semantic diagnostic owner: ${file.file}`);
      [disposition, assessment] = owner;
    }
    rows.push({
      id: `RC-${String(rows.length + 1).padStart(3, '0')}`,
      file: file.file,
      sourceSha256: file.sha256,
      functionLine: event.fnLoc?.start?.line ?? null,
      diagnosticLine: detail.loc?.start?.line ?? event.fnLoc?.start?.line ?? 1,
      category,
      reason,
      disposition,
      assessment,
      evidence: `${file.file}:${detail.loc?.start?.line ?? event.fnLoc?.start?.line ?? 1}`,
      proofBoundary:
        'Current source classification. No native performance or compiled-consumer pass is inferred from this diagnostic.',
    });
  }
const groups = (key) =>
  Object.fromEntries(
    [...new Set(rows.map((row) => row[key]))].map((value) => [
      value,
      rows.filter((row) => row[key] === value).map((row) => row.id),
    ])
  );
const report = {
  capturedAt: new Date().toISOString(),
  expected: 322,
  reviewed: rows.length,
  unresolvedDispositions: 0,
  sourceInventory: 'react-compiler-inventory.json',
  byCategory: groups('category'),
  byDisposition: groups('disposition'),
  rows,
};
if (rows.length !== report.expected)
  throw new Error('Diagnostic denominator changed; review the new inventory');
writeFileSync(
  resolve(out, 'react-compiler-diagnostic-dispositions.json'),
  JSON.stringify(report, null, 2) + '\n'
);
writeFileSync(
  resolve(out, 'react-compiler-diagnostic-dispositions.md'),
  [
    '# Compiler diagnostic dispositions',
    '',
    `${rows.length}/${report.expected} diagnostic events have an explicit disposition. Repeated events and different locations within one function retain separate IDs. This is not a count of broken functions.`,
    '',
    '| ID | Source | Category | Disposition | Assessment |',
    '| --- | --- | --- | --- | --- |',
    ...rows.map(
      (row) =>
        `| ${row.id} | \`${row.evidence}\` | ${row.category} | ${row.disposition} | ${row.assessment} |`
    ),
    '',
  ].join('\n')
);
console.log(
  JSON.stringify({
    reviewed: rows.length,
    categories: Object.fromEntries(
      Object.entries(report.byCategory).map(([key, ids]) => [key, ids.length])
    ),
    dispositions: Object.fromEntries(
      Object.entries(report.byDisposition).map(([key, ids]) => [
        key,
        ids.length,
      ])
    ),
  })
);

const controlPath = resolve(out, 'react-compiler-inventory-babel-7.29.0.json');
if (existsSync(controlPath)) {
  const control = JSON.parse(readFileSync(controlPath, 'utf8'));
  const byFile = new Map(inventory.rows.map((row) => [row.file, row]));
  if (
    control.rows.length !== inventory.rows.length ||
    control.rows.some((row) => row.sha256 !== byFile.get(row.file)?.sha256)
  ) {
    throw new Error('Babel controls must use exactly the same source inputs');
  }
  const controls = [];
  for (const file of control.rows)
    for (const event of file.events) {
      if (event.kind !== 'CompileError') continue;
      const detail = event.detail?.options ?? {};
      const category = detail.category ?? 'CompilerControlFlow';
      const reason = detail.reason ?? 'Unknown diagnostic';
      const owner =
        category === 'Todo' || category === 'CompilerControlFlow'
          ? [
              'defer-language-lowering',
              'The Babel 7 control still skips this language form. Preserve dynamic import, error handling and native operation behavior; actual emitted consumer proof is required before any source simplification.',
            ]
          : owners[file.file.split('/').at(-1)];
      if (!owner)
        throw new Error(`Unclassified Babel 7 diagnostic owner: ${file.file}`);
      controls.push({
        id: `RC7-${String(controls.length + 1).padStart(3, '0')}`,
        file: file.file,
        sourceSha256: file.sha256,
        functionLine: event.fnLoc?.start?.line ?? null,
        diagnosticLine:
          detail.loc?.start?.line ??
          detail.details?.find((entry) => entry.loc)?.loc.start.line ??
          event.fnLoc?.start?.line ??
          1,
        category,
        reason,
        disposition: owner[0],
        assessment: owner[1],
      });
    }
  const pairedFunctions = rows.map((row) => {
    const file = control.rows.find((file) => file.file === row.file);
    const events = file.events.filter(
      (event) => event.fnLoc?.start?.line === row.functionLine
    );
    return {
      id: row.id,
      file: row.file,
      functionLine: row.functionLine,
      originalCategory: row.category,
      originalReason: row.reason,
      babel7CompileSuccess: events.some(
        (event) => event.kind === 'CompileSuccess'
      ),
      babel7Diagnostics: controls
        .filter(
          (entry) =>
            entry.file === row.file && entry.functionLine === row.functionLine
        )
        .map((entry) => entry.id),
    };
  });
  const summary = {
    capturedAt: new Date().toISOString(),
    sourceFiles: control.rows.length,
    sourceHashesEqual: true,
    babel8: inventory.babelVersion,
    babel7: control.babelVersion,
    babel8DiagnosticEvents: rows.length,
    babel7DiagnosticEvents: controls.length,
    assignmentPatternEvents: {
      babel8: rows.filter((row) =>
        /lowerAssignment.*AssignmentPattern/.test(row.reason)
      ).length,
      babel7: controls.filter((row) =>
        /lowerAssignment.*AssignmentPattern/.test(row.reason)
      ).length,
    },
    controlCounts: control.counts,
    categories: Object.fromEntries(
      [...new Set(controls.map((row) => row.category))].map((category) => [
        category,
        controls.filter((row) => row.category === category).length,
      ])
    ),
    pairedFunctions,
    controls,
    claimBoundary:
      'Same-source diagnostic counterfactual, not a production toolchain switch, build-time benchmark, universal function-coverage denominator or runtime equivalence attestation.',
  };
  writeFileSync(
    resolve(out, 'react-compiler-toolchain-control.json'),
    JSON.stringify(summary, null, 2) + '\n'
  );
  writeFileSync(
    resolve(out, 'react-compiler-toolchain-control.md'),
    [
      '# Babel toolchain control',
      '',
      `${summary.sourceFiles} identical source files: ${rows.length} Compiler diagnostics with Babel ${inventory.babelVersion}, ${controls.length} with ${control.babelVersion}. Assignment-pattern diagnostics: ${summary.assignmentPatternEvents.babel8} versus ${summary.assignmentPatternEvents.babel7}.`,
      '',
      summary.claimBoundary,
      '',
      '| ID | Source | Category | Disposition | Assessment |',
      '| --- | --- | --- | --- | --- |',
      ...controls.map(
        (row) =>
          `| ${row.id} | ${row.file}:${row.diagnosticLine} | ${row.category} | ${row.disposition} | ${row.assessment} |`
      ),
      '',
    ].join('\n')
  );
  console.log(
    JSON.stringify({
      sourceHashesEqual: true,
      diagnostics: controls.length,
      assignmentPatternEvents: summary.assignmentPatternEvents,
      categories: summary.categories,
    })
  );
}
