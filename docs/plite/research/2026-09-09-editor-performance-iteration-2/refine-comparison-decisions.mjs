const cite = (path) => `\`${path}:1\``;
const dossier =
  'docs/plite/research/2026-09-09-editor-performance-iteration-2/experiments.md';
const results =
  'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2/common-operation-results.md';
const keep = {
  'plite.history':
    'Current history owns idle grouping, canonical change recovery and remote mapping. The formerly proposed idle delay is already implemented; saved product revisions remain a different job. Keep the current owner and its exact grouping/recovery controls.',
  'plite.facets':
    'Current committed/draft caches own dependency revisions and rollback. No first-party hot read consumer was found beyond the facade, so a cache-hit allocation proposal has no established current material value.',
  'plite.multiview':
    'The private mounted-view graph owns exact focus and commands for shared models, portals and duplicate IDs. Replacing it with reference single-view assumptions or a global model-ID bus would lose a current job.',
  'plite.extensions':
    'Current configuration stages activation, rolls back fields/resources and retains ordered failures. The previous missing-atomicity premise is stale; preserve those lifecycle laws before any compiler or composition change.',
  'plite.public-contracts':
    'NodeKey is branded and participates in NodeTarget; the former unbranded runtime-ID omission no longer describes this API. Canonical mapped anchors still own live text positions.',
  'plate.core-plugins':
    'Persisted ElementIdPlugin identity is explicit and separate from transient runtime node keys. Keep the persisted-ID/migration job and do not replace it with DOM or mount identity.',
  'plate.diff':
    'The Plate entry directly adopts the substrate diff implementation. There is no independent runtime diff loop here to optimize or replace; diff-algorithm work belongs to the substrate row.',
  'plate.pagination':
    'The Plate entry directly forwards the Plite pagination React contract. A second Plate pagination runtime would duplicate the existing owner; geometry/virtualization costs belong to the lower owner.',
  'plate.substrate-adoption':
    'The internal history bridge uses the current Plite owner. No separate Plate undo model is retained. Preserve this adoption rather than recreate a second history layer.',
  'plate.math':
    'The current package explicitly exports math/katex.css. The historical missing-CSS-boundary proposal is rejected; math rendering performance needs its own formula-size operation.',
  'plate.resizable':
    'The current handle provides slider semantics and arrow-key updates while preserving width units. The historical missing-keyboard-resize proposal is no longer current; pointer/keyboard cancellation remain proof controls.',
};

export const refineComparisonRows = ({
  rows,
  assessments,
  prefix,
  name,
  gapPath,
  proofPath,
  owners,
}) => {
  for (const row of rows) {
    const lane = assessments.find((entry) => row.Concept === entry.id);
    if (lane && keep[lane.id]) {
      const reason = `${keep[lane.id]} ${cite(lane.owner)}`;
      row['Local debt'] =
        `${lane.id === 'plite.facets' ? 'non-material' : 'none'} — ${reason}`;
      row['Reference adaptation'] = `keep-local — ${reason}`;
      row['Proof adaptation'] =
        `keep-local — preserve current ${lane.id} behavior and the independently reconciled donor invariants; current-source proof references and missing native replays are recorded in ${cite('docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2/portable-invariant-reconciliation.md')}.`;
      row.Verdict = `keep — ${reason}`;
    }
    if (
      lane &&
      [
        'plite.react-components',
        'plite.react-commit',
        'plite.editing-primitives',
        'plate.react-composition',
      ].includes(lane.id)
    ) {
      row['Runtime/perf'] =
        `reference stronger — the frozen full-DOM 10k fixture has materially lower ProseKit/ProseMirror/Wordgard mount or structural-operation times; ${cite(results)} records every cell. The fixture spans multiple owners, so this does not attribute the difference to ${lane.id} alone. ${cite(lane.owner)}`;
    }
    if (row.ID === '`WG-MAC-LINE-KEYMAP`') {
      row.Correctness = `Plite/Plate stack stronger — the trusted macOS line-start and line-end actions pass locally but fail at all three sizes in the Wordgard pin; its earlier Mod-Arrow binding selects word movement. ${cite(results)} and ${cite('../wordgard/src/editor/keymap.ts')}.`;
      row['Runtime/perf'] =
        `insufficient evidence — all 186 retained Wordgard line-boundary operation samples fail their oracle, so none is ranked by speed. ${cite(results)}`;
      row.Classification = `Plite/Plate stack stronger — this narrow macOS line-binding contract is proved by matched native/model oracles, with the reference failure preserved in ${cite(results)}.`;
      row['Preferred base'] =
        `Plite/Plate stack — preserve the passing local line-boundary behavior; reference precedence is not an adaptation target. ${cite(results)}`;
      row['Proof adaptation'] =
        `keep-local — retain both trusted line-boundary oracles and the failed reference evidence. ${cite(results)}`;
    }
  }

  const definitions = [
    {
      suffix: 'MISSING-RANGE-PAYLOAD',
      lane: 'plite.virtualization',
      origin: 'Plite',
      title: 'Missing-range boundary payload and hidden-key copying',
      owner:
        'packages/plitejs/src/react/dom-strategy/use-virtualized-root-plan.ts',
      correctness:
        'The consumed boundary payload consists of indexes, boundary identity and endpoint keys. The extracted-function probe checks 1,000 generated mounted-range arrangements; native selection and scroll are separate gates.',
      api: 'Remove the unused private nodeKeys field and read the endpoints from the canonical top-level key array. No application-level virtualizer API is added.',
      data: 'The proposal removes an ephemeral view-plan copy; it does not change serialized content, live node identity, mapped selection, history or collaboration.',
      lifecycle:
        'The existing mounted view owns its missing ranges. A second cache or global range registry would retain duplicate truth after scroll/reconfiguration.',
      perf: 'The probe removes 9,969 copied keys per plan at 10k nodes; its p95 is 0.861 ms versus 0.00775 ms for 100 calls. This is allocation evidence, not scrolling/paint latency.',
      proof:
        'The pure payload probe passes; exact coverage-boundary, dynamic-height, backward-scroll and native selection/copy tests remain required before adoption.',
      proofFile:
        'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2/virtual-boundaries-probe.json',
      verdict: 'hard-cut',
      priority: 'P2',
      debt: 'material',
      proofAdaptation: 'keep-local',
    },
    {
      suffix: 'DECORATION-COMPILE-COST',
      lane: 'plite.view-sources',
      origin: 'Plite',
      title: 'Decoration-source setup and changed-bucket cost',
      owner: 'packages/plitejs/src/react/decoration-source.ts',
      correctness:
        'Equivalent attributes/wrappers, stable unchanged buckets, exact affected wakes and zero observers after destroy pass the registered isolated owner oracle.',
      api: 'Keep the public source definitions and order. A proposed private compiled representation should avoid absent node/source intersections instead of adding another public cache or store.',
      data: 'Decoration buckets derive from canonical node keys and snapshots; they cannot become independently authoritative document or annotation data.',
      lifecycle:
        'One source observer and mounted-node subscriptions are measured benefits. Removing the manager wholesale would restore per-node/source fanout and discard its cleanup ownership.',
      perf: 'The 10k-node/32-source cohort has 264.94 ms production mount p95 versus 144.80 ms in the equal-oracle benchmark baseline; update is 2.01 versus 0.82 ms. Large, stress and pathological timing guards fail.',
      proof:
        'The headless target identifies a current owning bottleneck but not a chosen replacement. Preserve read-locality gains and replay a complete many-source browser route after one causal intervention.',
      proofFile:
        'docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2/owner-benchmarks/decoration-manager-benchmark.json',
      verdict: 'rearchitect',
      priority: 'P1',
      debt: 'material',
      proofAdaptation: 'keep-local',
    },
    {
      suffix: 'NESTED-INACTIVE-POINTER',
      lane: 'plite.native-selection',
      origin: 'shared',
      title: 'Inactive-selection clearing before nested primary mousedown',
      owner: 'packages/plitejs/src/react/editable/inactive-selection.ts',
      correctness:
        'ProseKit requires primary nested-editable pointer entry to clear inactive paint before mousedown; secondary pointer and non-editable controls retain it. Current Plite focus-policy tests do not establish that exact ordering.',
      api: 'Preserve the current marked-control policy and exact mounted-view authority. A portable timing assertion does not justify copying a general-blur API or adding a focus coordinator.',
      data: 'Inactive paint is view-local derived selection; changing it must not alter the shared model selection, history group or remote cursor state.',
      lifecycle:
        'Document-level focus listeners are ref-counted in the current owner. Pointer timing must resolve the exact nested editable and teardown without changing another view.',
      perf: 'No interaction-latency gain is claimed. This is a native correctness gate that can invalidate an otherwise fast focus/selection optimization.',
      proof:
        name === 'prosekit'
          ? 'Adapt the five named virtual-selection cases, with primary/secondary pointer, editable/non-editable targets and before-mousedown observation. Current local marked-control proof stays as a separate policy control.'
          : 'The exact portable donor proof is established in the ProseKit comparison. No equivalent Wordgard proof was resolved, so reference adaptation remains deferred here.',
      proofFile:
        name === 'prosekit'
          ? '../prosekit/packages/extensions/src/virtual-selection/index.spec.ts'
          : proofPath,
      verdict: name === 'prosekit' ? 'steal' : 'defer',
      priority: name === 'prosekit' ? 'P2' : '—',
      debt: name === 'prosekit' ? 'non-material' : 'insufficient evidence',
      proofAdaptation: name === 'prosekit' ? 'adapt' : 'defer',
    },
  ];
  const concepts = [];
  for (const definition of definitions) {
    const id = `${prefix}-${definition.suffix}`;
    concepts.push({
      id,
      origin: definition.origin,
      title: definition.title,
      parentLane: definition.lane,
    });
    const source = cite(definition.owner);
    const reference = owners[definition.lane];
    const referenceSource = reference
      ? cite(`../${name}/${reference[0]}`)
      : cite(gapPath);
    rows.push({
      ID: `\`${id}\``,
      Concept: definition.title,
      Origin: definition.origin,
      'Reference mapping': `partial — covers=${referenceSource}; missing=${cite(gapPath)}; proof=${cite(definition.proofFile)} — the related source owner does not prove an identical local representation or runtime contract.`,
      'Plite mapping': `partial — covers=${source}; missing=${cite(dossier)}; proof=${cite(definition.proofFile)} — current ownership and the precise remaining adoption gates are recorded separately.`,
      'Plate mapping': `partial — covers=${cite('packages/platejs/src/react/editor/withPlate.ts')}; missing=${cite(dossier)}; proof=${cite(definition.proofFile)} — Plate adopts the view substrate and requires its feature consumers to preserve this contract.`,
      Correctness: `different tradeoff — ${definition.correctness} ${source} ${cite(definition.proofFile)}`,
      'API/types': `different tradeoff — ${definition.api} ${source} ${cite(dossier)}`,
      'Data/collab': `different tradeoff — ${definition.data} ${source}`,
      'Ownership/lifecycle': `different tradeoff — ${definition.lifecycle} ${source}`,
      'Runtime/perf': `insufficient evidence — ${definition.perf} ${cite(definition.proofFile)}`,
      'Proof/host': `insufficient evidence — ${definition.proof} ${cite(definition.proofFile)} ${cite(dossier)}`,
      Classification: `insufficient evidence — this atomic local cost/proof question has no equal-contract runtime result for both editors. ${source} ${cite(dossier)}`,
      'Preferred base': `insufficient evidence — no reference implementation is accepted as the replacement; preserve the named canonical local authority while testing the proposed cut or proof. ${source} ${cite(dossier)}`,
      'Reference adaptation': `defer — compare the exact mechanism below the broader feature row; ${referenceSource} is a source lead, not an adoption verdict.`,
      'Local debt': `${definition.debt} — ${definition.perf} ${cite(definition.proofFile)}`,
      'Proof adaptation': `${definition.proofAdaptation} — ${definition.proof} ${cite(definition.proofFile)} ${cite(dossier)}`,
      'Prior candidates': `none — earlier family-level proposals remain reconciled once at their owning lane in ${cite('docs/plans/artifacts/2026-09-09-editor-performance-research-iteration-2/prior-candidate-reconciliation.md')}; this row splits the current independently judged mechanism.`,
      Verdict: `${definition.verdict} — the concrete internal target, deletion, surviving authority, adoption boundaries and next owner are in ${cite(dossier)}. This is a research recommendation; no product implementation is accepted as proven.`,
      Priority: definition.priority,
    });
  }
  return concepts;
};
