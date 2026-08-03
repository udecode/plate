/**
 * Direct evidence for every final Wordgard view, DOM, input, and product-view
 * row. Dimension array order is correctness, API, data, ownership, runtime,
 * proof. Runtime is deliberately empty: the current audit contains no
 * comparable Wordgard-versus-Plite/Plate benchmark for any view row.
 */

const list = (value) => (Array.isArray(value) ? value : [value]);

const exact = ({
  consumers,
  lifecycle,
  owner,
  proof,
  public: publicEvidence,
}) =>
  Object.freeze({
    consumers: list(consumers),
    lifecycle: list(lifecycle),
    owner: list(owner),
    proof: list(proof),
    public: list(publicEvidence),
  });

const partial = ({ covers, missingEvidence, proof }) =>
  Object.freeze({
    covers: list(covers),
    missingEvidence: list(missingEvidence),
    proof: list(proof),
  });

const WORDGARD_GAP =
  'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/wordgard-source-coverage.json:1-24';
const PLITE_GAP =
  'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plite-source-coverage.json:1-24';
const PLATE_GAP =
  'docs/plans/artifacts/wordgard-exhaustive-architecture-re-audit/plate-source-coverage.json:1-24';

const wordgard = Object.freeze({
  'WG-VIEW-001A': exact({
    public: '../wordgard/src/editor/editor.ts:28-79',
    owner: '../wordgard/src/editor/editor.ts:115-144',
    consumers: '../wordgard/test/tempview.ts:1-41',
    lifecycle: '../wordgard/src/editor/editor.ts:146-168',
    proof: '../wordgard/test/webtest-editor.ts:11-33',
  }),
  'WG-VIEW-002': exact({
    public: '../wordgard/src/editor/editor.ts:182-202',
    owner: '../wordgard/src/editor/editor.ts:203-245',
    consumers: '../wordgard/src/editor/editor.ts:364-380',
    lifecycle: '../wordgard/src/editor/editor.ts:146-168',
    proof: '../wordgard/test/webtest-editor.ts:59-77',
  }),
  'WG-VIEW-003A': partial({
    covers: [
      '../wordgard/src/editor/viewstate.ts:15-80',
      '../wordgard/src/editor/editor.ts:271-316',
    ],
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/test/webtest-editor.ts:11-33',
  }),
  'WG-VIEW-003B': partial({
    covers: [
      '../wordgard/src/editor/viewstate.ts:81-114',
      '../wordgard/src/editor/editor.ts:247-269',
    ],
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/test/webtest-coords.ts:18-101',
  }),
  'WG-VIEW-004A1': exact({
    public: '../wordgard/src/editor/tile.ts:55-122',
    owner: '../wordgard/src/editor/tile.ts:299-367',
    consumers: '../wordgard/src/editor/editor.ts:271-288',
    lifecycle: '../wordgard/src/editor/tile.ts:786-854',
    proof: '../wordgard/test/webtest-dom-changes.ts:1-120',
  }),
  'WG-VIEW-004A2': exact({
    public: '../wordgard/src/editor/tile.ts:13-54',
    owner: '../wordgard/src/editor/tile.ts:915-1050',
    consumers: '../wordgard/src/editor/tile.ts:123-193',
    lifecycle: '../wordgard/src/editor/tile.ts:786-854',
    proof: '../wordgard/test/webtest-resolve-dom.ts:19-117',
  }),
  'WG-VIEW-004B': exact({
    public: '../wordgard/src/editor/input.ts:619-648',
    owner: '../wordgard/src/editor/tile.ts:875-914',
    consumers: '../wordgard/src/editor/editor.ts:271-288',
    lifecycle: '../wordgard/src/editor/input.ts:649-679',
    proof: '../wordgard/test/webtest-composition.ts:1-180',
  }),
  'WG-VIEW-005A1': exact({
    public: '../wordgard/src/editor/decoration.ts:112-190',
    owner: '../wordgard/src/editor/decoration.ts:191-310',
    consumers: '../wordgard/src/editor/tile.ts:299-367',
    lifecycle: '../wordgard/src/editor/decoration.ts:470-510',
    proof: '../wordgard/test/webtest-content.ts:149-215',
  }),
  'WG-VIEW-005A2': exact({
    public: '../wordgard/src/editor/decoration.ts:10-69',
    owner: '../wordgard/src/editor/decoration.ts:511-579',
    consumers: '../wordgard/src/editor/tile.ts:326-365',
    lifecycle: '../wordgard/src/editor/decoration.ts:70-109',
    proof: '../wordgard/test/webtest-editor.ts:87-110',
  }),
  'WG-VIEW-005B1': partial({
    covers: '../wordgard/src/editor/decoration.ts:580-760',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/test/webtest-content.ts:149-215',
  }),
  'WG-VIEW-005B2': partial({
    covers: '../wordgard/src/editor/decoration.ts:761-972',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/test/webtest-content.ts:149-215',
  }),
  'WG-VIEW-005C1': exact({
    public: '../wordgard/src/editor/decoration.ts:973-1020',
    owner: '../wordgard/src/editor/decoration.ts:1021-1112',
    consumers: '../wordgard/src/editor/tile.ts:326-365',
    lifecycle: '../wordgard/src/editor/decoration.ts:1223-1268',
    proof: '../wordgard/test/webtest-content.ts:149-215',
  }),
  'WG-VIEW-005C2': exact({
    public: '../wordgard/src/editor/decoration.ts:1113-1222',
    owner: '../wordgard/src/editor/decoration.ts:1269-1397',
    consumers: '../wordgard/src/editor/tile.ts:326-365',
    lifecycle: '../wordgard/src/editor/decoration.ts:1398-1429',
    proof: '../wordgard/test/webtest-content.ts:149-215',
  }),
  'WG-VIEW-006A': exact({
    public: '../wordgard/src/editor/editor.ts:431-459',
    owner: '../wordgard/src/editor/tile.ts:55-193',
    consumers: '../wordgard/src/editor/input.ts:182-217',
    lifecycle: '../wordgard/src/editor/tile.ts:299-367',
    proof: '../wordgard/test/webtest-resolve-dom.ts:19-117',
  }),
  'WG-VIEW-006B': exact({
    public: '../wordgard/src/editor/editor.ts:460-488',
    owner: '../wordgard/src/editor/coords.ts:7-64',
    consumers: '../wordgard/src/editor/input.ts:519-567',
    lifecycle: '../wordgard/src/editor/editor.ts:247-269',
    proof: '../wordgard/test/webtest-coords.ts:18-101',
  }),
  'WG-VIEW-007A': exact({
    public: '../wordgard/src/editor/editor.ts:431-459',
    owner: '../wordgard/src/editor/selection.ts:1-36',
    consumers: '../wordgard/src/editor/domobserver.ts:130-169',
    lifecycle: '../wordgard/src/editor/editor.ts:271-288',
    proof: '../wordgard/test/webtest-resolve-dom.ts:19-117',
  }),
  'WG-VIEW-007B1': partial({
    covers: [
      '../wordgard/src/editor/selection.ts:37-79',
      '../wordgard/src/editor/editor.ts:490-508',
    ],
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/test/webtest-editor.ts:71-77',
  }),
  'WG-VIEW-007B2': exact({
    public: '../wordgard/src/editor/editor.ts:490-508',
    owner: '../wordgard/src/editor/selection.ts:80-148',
    consumers: '../wordgard/src/editor/domobserver.ts:130-169',
    lifecycle: '../wordgard/src/editor/editor.ts:271-288',
    proof: '../wordgard/test/webtest-composition.ts:1-180',
  }),
  'WG-VIEW-008A': exact({
    public: '../wordgard/src/editor/domobserver.ts:16-42',
    owner: '../wordgard/src/editor/domobserver.ts:184-229',
    consumers: '../wordgard/src/editor/editor.ts:133-168',
    lifecycle: '../wordgard/src/editor/domobserver.ts:71-108',
    proof: '../wordgard/test/webtest-dom-changes.ts:1-120',
  }),
  'WG-VIEW-008B1': partial({
    covers: '../wordgard/src/editor/domobserver.ts:35-61',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/domobserver.ts:71-108',
  }),
  'WG-VIEW-008B2': partial({
    covers: '../wordgard/src/editor/domobserver.ts:78-90',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/domobserver.ts:91-118',
  }),
  'WG-VIEW-008B3': partial({
    covers: [
      '../wordgard/src/editor/dom.ts:90-210',
      '../wordgard/src/editor/domobserver.ts:91-104',
    ],
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/tooltip.ts:618-690',
  }),
  'WG-VIEW-009A': exact({
    public: '../wordgard/src/editor/input.ts:218-281',
    owner: '../wordgard/src/editor/input.ts:680-709',
    consumers: '../wordgard/src/editor/input.ts:812-860',
    lifecycle: '../wordgard/src/editor/input.ts:98-171',
    proof: '../wordgard/test/webtest-dom-changes.ts:1-120',
  }),
  'WG-VIEW-010A': exact({
    public: '../wordgard/src/editor/input.ts:619-648',
    owner: '../wordgard/src/editor/input.ts:649-679',
    consumers: '../wordgard/src/editor/input.ts:812-860',
    lifecycle: '../wordgard/src/editor/tile.ts:875-914',
    proof: '../wordgard/test/webtest-composition.ts:1-180',
  }),
  'WG-VIEW-010B1': partial({
    covers: [
      '../wordgard/src/editor/input.ts:142-166',
      '../wordgard/src/editor/input.ts:680-900',
    ],
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/test/webtest-commands.ts:1-35',
  }),
  'WG-VIEW-010B2': partial({
    covers: '../wordgard/src/editor/input.ts:369-567',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/test/webtest-coords.ts:18-101',
  }),
  'WG-VIEW-010C1A': partial({
    covers: '../wordgard/src/editor/input.ts:487-576',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/input.ts:710-789',
  }),
  'WG-VIEW-010C2': exact({
    public: '../wordgard/src/editor/input.ts:577-590',
    owner: '../wordgard/src/editor/input.ts:591-606',
    consumers: '../wordgard/src/editor/input.ts:790-811',
    lifecycle: '../wordgard/src/editor/clipboard.ts:114-166',
    proof: '../wordgard/test/webtest-serialize.ts:1-120',
  }),
  'WG-VIEW-011A': exact({
    public: '../wordgard/src/editor/clipboard.ts:5-31',
    owner: '../wordgard/src/editor/clipboard.ts:66-112',
    consumers: '../wordgard/src/editor/input.ts:584-606',
    lifecycle: '../wordgard/src/editor/input.ts:790-811',
    proof: '../wordgard/test/webtest-serialize.ts:1-120',
  }),
  'WG-VIEW-011B': partial({
    covers: [
      '../wordgard/src/editor/clipboard.ts:32-60',
      '../wordgard/src/editor/clipboard.ts:114-166',
    ],
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/test/webtest-serialize.ts:1-120',
  }),
  'WG-VIEW-012A1A': partial({
    covers: '../wordgard/src/editor/keymap.ts:5-107',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/test/webtest-commands.ts:1-35',
  }),
  'WG-VIEW-012A1B': partial({
    covers: '../wordgard/src/editor/keymap.ts:240-320',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/keymap.ts:321-379',
  }),
  'WG-VIEW-012A1C': partial({
    covers: '../wordgard/src/editor/keymap.ts:321-379',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/test/webtest-commands.ts:1-35',
  }),
  'WG-VIEW-012A2': partial({
    covers: '../wordgard/src/editor/keymap.ts:108-238',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/test/webtest-commands.ts:1-35',
  }),
  'WG-VIEW-012B': partial({
    covers: [
      '../wordgard/src/editor/inputrule.ts:11-160',
      '../wordgard/src/editor/inputrule.ts:173-213',
    ],
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/inputrule.ts:161-172',
  }),
  'WG-VIEW-012C1A': partial({
    covers: '../wordgard/src/editor/input.ts:18-29',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/input.ts:108-126',
  }),
  'WG-VIEW-012C1B': partial({
    covers: '../wordgard/src/editor/input.ts:18-40',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/input.ts:108-166',
  }),
  'WG-VIEW-012C2': partial({
    covers: '../wordgard/src/editor/input.ts:30-40',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/input.ts:127-139',
  }),
  'WG-VIEW-013A': partial({
    covers: '../wordgard/src/editor/theme.ts:1-86',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/editor.ts:358-362',
  }),
  'WG-VIEW-013B': partial({
    covers: '../wordgard/src/editor/theme.ts:87-150',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/test/webtest-editor.ts:35-43',
  }),
  'WG-VIEW-013C': partial({
    covers: '../wordgard/src/editor/theme.ts:151-195',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/domobserver.ts:104-123',
  }),
  'WG-VIEW-013D': exact({
    public: '../wordgard/src/editor/editor.ts:509-518',
    owner: '../wordgard/src/editor/editor.ts:317-335',
    consumers: '../wordgard/src/editor/editor.ts:119-132',
    lifecycle: '../wordgard/src/editor/editor.ts:271-281',
    proof: '../wordgard/test/webtest-editor.ts:35-43',
  }),
  'WG-VIEW-014A1': partial({
    covers: '../wordgard/src/editor/panel.ts:14-205',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/panel.ts:146-205',
  }),
  'WG-VIEW-014A2': partial({
    covers: '../wordgard/src/editor/dialog.ts:8-185',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/dialog.ts:127-185',
  }),
  'WG-VIEW-014B': partial({
    covers: '../wordgard/src/editor/menubar.ts:20-562',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/menubar.ts:448-562',
  }),
  'WG-VIEW-014C1': partial({
    covers: '../wordgard/src/editor/tooltip.ts:21-616',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/tooltip.ts:504-616',
  }),
  'WG-VIEW-014C2': partial({
    covers: '../wordgard/src/editor/tooltip.ts:618-837',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/tooltip.ts:759-837',
  }),
  'WG-VIEW-015A': partial({
    covers: '../wordgard/src/editor/placeholder.ts:1-41',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/placeholder.ts:26-41',
  }),
  'WG-VIEW-015B1': partial({
    covers: '../wordgard/src/editor/drawcursor.ts:1-84',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/drawcursor.ts:47-84',
  }),
  'WG-VIEW-015C': partial({
    covers: '../wordgard/src/editor/dropcursor.ts:1-94',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/dropcursor.ts:49-94',
  }),
  'WG-VIEW-016A': partial({
    covers: '../wordgard/src/editor/editor.ts:1078-1159',
    missingEvidence: WORDGARD_GAP,
    proof: '../wordgard/src/editor/editor.ts:633-657',
  }),
});

const plite = Object.freeze({
  'WG-VIEW-001A': exact({
    public: 'packages/plite-react/src/plugin/with-react.ts:92-150',
    owner: 'packages/plite-react/src/plugin/with-react.ts:151-167',
    consumers: 'packages/plite-react/src/hooks/use-plite-editor.ts:20-53',
    lifecycle: 'packages/plite-react/src/components/plite.tsx:1-120',
    proof: 'packages/plite-react/test/with-react-contract.tsx:1-72',
  }),
  'WG-VIEW-002': exact({
    public: 'packages/plite-dom/src/plugin/dom-phase-scheduler.ts:9-48',
    owner: 'packages/plite-dom/src/plugin/dom-phase-scheduler.ts:109-332',
    consumers: 'packages/plite-dom/src/plugin/dom-phase-scheduler.ts:483-515',
    lifecycle: 'packages/plite-dom/src/plugin/dom-phase-scheduler.ts:427-480',
    proof: 'packages/plite-dom/test/dom-phase-scheduler.test.ts:54-327',
  }),
  'WG-VIEW-003A': exact({
    public: 'packages/plite-react/src/hooks/use-editor-view-state.ts:1-44',
    owner: 'packages/plite-react/src/editable/runtime-live-state.ts:1-83',
    consumers: 'packages/plite-react/src/editable/browser-handle.ts:493-599',
    lifecycle:
      'packages/plite-react/src/editable/editable-dom-runtime.ts:556-610',
    proof: 'packages/plite-react/test/runtime-live-state-contract.ts:1-118',
  }),
  'WG-VIEW-003B': partial({
    covers: [
      'packages/plite-dom/src/plugin/dom-geometry.ts:1115-1410',
      'packages/plite-react/src/editable/browser-handle.ts:67-140',
    ],
    missingEvidence: PLITE_GAP,
    proof: 'packages/plite-dom/test/dom-geometry.test.ts:1-312',
  }),
  'WG-VIEW-004A1': exact({
    public: 'packages/plite-react/src/components/editable.tsx:47-120',
    owner: 'packages/plite-react/src/components/editable-text-blocks.tsx:1-180',
    consumers: 'packages/plite-react/src/components/editable.tsx:378-674',
    lifecycle:
      'packages/plite-react/src/components/editable-dom-commit-fence.tsx:1-79',
    proof: 'packages/plite-react/test/rendered-dom-shape-contract.tsx:1-180',
  }),
  'WG-VIEW-004A3': exact({
    public: 'packages/plite-react/src/components/editable.tsx:65-120',
    owner: 'packages/plite-layout/src/page-mount-plan.ts:1-217',
    consumers: 'packages/plite-layout/src/react.tsx:584-814',
    lifecycle: 'packages/plite-layout/src/layout-runtime-lifecycle.ts:1-30',
    proof:
      'packages/plite-react/test/dom-strategy-page-virtualization.test.tsx:82-380',
  }),
  'WG-VIEW-004B': exact({
    public: 'packages/plite-react/src/editable/composition-state.ts:1-120',
    owner:
      'packages/plite-react/src/editable/runtime-composition-events.ts:18-179',
    consumers:
      'packages/plite-react/src/editable/runtime-before-input-events.ts:116-301',
    lifecycle: 'packages/plite-dom/src/plugin/dom-input-runtime.ts:1169-1265',
    proof:
      'packages/plite-react/test/composition-state-contract.test.ts:537-720',
  }),
  'WG-VIEW-005A1': exact({
    public: 'packages/plite-react/src/decoration-source.ts:1-80',
    owner: 'packages/plite-react/src/decoration-source.ts:119-240',
    consumers:
      'packages/plite-react/src/components/editable-decorations.ts:1-99',
    lifecycle: 'packages/plite-react/src/decoration-source.ts:241-323',
    proof:
      'packages/plite-react/test/projections-and-selection-contract.tsx:562-700',
  }),
  'WG-VIEW-005A2': exact({
    public: 'packages/plite-react/src/widget-store.ts:1-100',
    owner: 'packages/plite-react/src/widget-store.ts:207-305',
    consumers: 'packages/plite-react/src/hooks/use-plite-widgets.tsx:1-37',
    lifecycle: 'packages/plite-react/src/widget-store.ts:342-431',
    proof: 'packages/plite-react/test/widget-layer-contract.tsx:1-180',
  }),
  'WG-VIEW-005B1': exact({
    public: 'packages/plite/src/interfaces/editor.ts:1892-1950',
    owner: 'packages/plite/src/core/anchor.ts:1-210',
    consumers: 'packages/plite/src/transforms-node/set-nodes.ts:180-220',
    lifecycle: 'packages/plite/src/core/anchor.ts:430-626',
    proof: 'packages/plite/test/anchor-contract.ts:1-329',
  }),
  'WG-VIEW-005B2': partial({
    covers: [
      'packages/plite/src/core/anchor.ts:1-210',
      'packages/plite-react/src/stable-id-mapped-source.ts:1-180',
    ],
    missingEvidence: PLITE_GAP,
    proof: 'packages/plite/test/anchor-mapping-contract.ts:1-180',
  }),
  'WG-VIEW-005C1': exact({
    public: 'packages/plite-react/src/decoration-refresh.ts:1-44',
    owner: 'packages/plite-react/src/projection-store.ts:532-710',
    consumers:
      'packages/plite-react/src/hooks/use-plite-decoration-source.ts:80-230',
    lifecycle: 'packages/plite-react/src/projection-store.ts:711-850',
    proof: 'packages/plite-react/test/projection-graph-contract.test.ts:1-180',
  }),
  'WG-VIEW-005C2': partial({
    covers: [
      'packages/plite-react/src/decoration-source.ts:119-240',
      'packages/plite-react/src/projection-store.ts:532-710',
    ],
    missingEvidence: PLITE_GAP,
    proof:
      'packages/plite-react/test/projections-and-selection-contract.tsx:562-700',
  }),
  'WG-VIEW-006A': exact({
    public: 'packages/plite-react/src/plugin/react-editor.ts:1-33',
    owner: 'packages/plite-react/src/editable/selection-dom-range.ts:1-157',
    consumers: 'packages/plite-react/src/editable/browser-handle.ts:614-660',
    lifecycle: 'packages/plite-react/src/editable/selection-runtime.ts:1-120',
    proof:
      'packages/plite-react/test/selection-dom-realm-contract.test.ts:1-180',
  }),
  'WG-VIEW-006B': exact({
    public: 'packages/plite-dom/src/plugin/dom-geometry.ts:5-39',
    owner: 'packages/plite-dom/src/plugin/dom-geometry.ts:1115-1410',
    consumers: 'packages/plite-react/src/editable/caret-engine.ts:430-520',
    lifecycle: 'packages/plite-react/src/editable/browser-handle.ts:798-880',
    proof: 'packages/plite-dom/test/dom-geometry.test.ts:1-312',
  }),
  'WG-VIEW-007A': exact({
    public: 'packages/plite-react/src/editable/browser-handle.ts:67-140',
    owner: 'packages/plite-react/src/editable/selection-dom-range.ts:88-157',
    consumers:
      'packages/plite-react/src/editable/selection-reconciler.ts:172-360',
    lifecycle: 'packages/plite-react/src/editable/selection-runtime.ts:120-239',
    proof: 'packages/plite-react/test/selection-controller-contract.ts:679-882',
  }),
  'WG-VIEW-007B1': exact({
    public: 'packages/plite-react/src/hooks/focus-plite-editable.ts:1-90',
    owner:
      'packages/plite-react/src/editable/runtime-focus-mouse-events.ts:1-180',
    consumers:
      'packages/plite-react/src/editable/root-interaction-controller.ts:1260-1370',
    lifecycle: 'packages/plite-react/src/editable/history-focus.ts:1-62',
    proof:
      'packages/plite-react/test/focus-plite-editable-contract.test.ts:1-180',
  }),
  'WG-VIEW-007B2': exact({
    public: 'packages/plite-react/src/editable/browser-handle.ts:123-140',
    owner: 'packages/plite-react/src/editable/selection-reconciler.ts:982-1247',
    consumers: 'packages/plite-react/src/editable/browser-handle.ts:760-817',
    lifecycle:
      'packages/plite-react/src/editable/selection-controller.ts:1309-1492',
    proof: 'packages/plite-react/test/selection-reconciler-contract.ts:1-180',
  }),
  'WG-VIEW-008A': exact({
    public: 'packages/plite-dom/src/plugin/dom-integrity-observer.ts:1-90',
    owner: 'packages/plite-dom/src/plugin/dom-integrity-observer.ts:180-420',
    consumers:
      'packages/plite-react/src/editable/editable-dom-runtime.ts:670-821',
    lifecycle:
      'packages/plite-dom/src/plugin/dom-integrity-observer.ts:421-542',
    proof:
      'packages/plite-react/test/dom-integrity-observer-contract.test.ts:1-180',
  }),
  'WG-VIEW-008B1': exact({
    public: 'packages/plite-layout/src/react.tsx:112-180',
    owner: 'packages/plite-layout/src/react.tsx:584-700',
    consumers: 'packages/plite-layout/src/react.tsx:742-814',
    lifecycle: 'packages/plite-layout/src/layout-runtime-lifecycle.ts:1-30',
    proof: 'packages/plite-layout/test/react-fragments-contract.test.tsx:1-131',
  }),
  'WG-VIEW-008B2': exact({
    public: 'packages/plite-react/src/hooks/use-editor-dom-scope.ts:1-60',
    owner:
      'packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts:331-490',
    consumers:
      'packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts:624-710',
    lifecycle:
      'packages/plite-react/src/dom-strategy/use-virtualized-root-plan.ts:392-436',
    proof: 'packages/plite-react/test/dom-strategy-and-scroll.tsx:1-180',
  }),
  'WG-VIEW-009A': exact({
    public: 'packages/plite-react/src/components/editable.tsx:343-378',
    owner:
      'packages/plite-react/src/editable/runtime-before-input-events.ts:369-720',
    consumers: 'packages/plite-react/src/editable/input-router.ts:1480-1560',
    lifecycle: 'packages/plite-dom/src/plugin/dom-input-runtime.ts:1120-1302',
    proof:
      'packages/plite-react/test/runtime-before-input-events-contract.test.ts:1-180',
  }),
  'WG-VIEW-010A': exact({
    public: 'packages/plite-react/src/editable/composition-state.ts:1-120',
    owner:
      'packages/plite-react/src/editable/runtime-composition-events.ts:18-179',
    consumers:
      'packages/plite-react/src/editable/runtime-before-input-events.ts:116-301',
    lifecycle: 'packages/plite-dom/src/plugin/dom-input-runtime.ts:1169-1265',
    proof:
      'packages/plite-react/test/composition-state-contract.test.ts:890-1105',
  }),
  'WG-VIEW-010B1': exact({
    public: 'packages/plite-react/src/components/editable.tsx:365-378',
    owner: 'packages/plite-react/src/editable/runtime-keyboard-events.ts:1-250',
    consumers: 'packages/plite-react/src/editable/input-router.ts:1300-1479',
    lifecycle:
      'packages/plite-react/src/editable/runtime-event-engine.ts:120-240',
    proof:
      'packages/plite-react/test/keyboard-input-strategy-contract.test.ts:1-180',
  }),
  'WG-VIEW-010B2': exact({
    public:
      'packages/plite-react/src/editable/root-interaction-controller.ts:97-170',
    owner:
      'packages/plite-react/src/editable/root-interaction-controller.ts:430-890',
    consumers:
      'packages/plite-react/src/editable/runtime-focus-mouse-events.ts:180-385',
    lifecycle:
      'packages/plite-react/src/editable/root-interaction-controller.ts:1681-1805',
    proof:
      'packages/plite-react/test/root-interaction-controller.test.tsx:1-180',
  }),
  'WG-VIEW-010C1A': exact({
    public: 'packages/plite-react/src/editable/input-router.ts:780-850',
    owner: 'packages/plite-react/src/editable/runtime-drag-events.ts:1-166',
    consumers:
      'packages/plite-react/src/editable/clipboard-input-strategy.ts:650-720',
    lifecycle: 'packages/plite-react/src/editable/input-router.ts:809-900',
    proof: 'packages/plite-react/test/input-router-contract.test.tsx:1-180',
  }),
  'WG-VIEW-010C1B': partial({
    covers: [
      'packages/plite-react/src/editable/runtime-drag-events.ts:1-166',
      'packages/plite-react/src/editable/drag-auto-scroll-target.ts:1-187',
    ],
    missingEvidence: PLITE_GAP,
    proof: 'packages/plite-react/test/input-router-contract.test.tsx:1-180',
  }),
  'WG-VIEW-010C2': exact({
    public:
      'packages/plite-react/src/editable/runtime-clipboard-events.ts:1-60',
    owner:
      'packages/plite-react/src/editable/clipboard-input-strategy.ts:251-420',
    consumers: 'packages/plite-react/src/editable/input-router.ts:900-1060',
    lifecycle:
      'packages/plite-react/src/editable/runtime-clipboard-events.ts:61-173',
    proof:
      'packages/plite-react/test/projected-clipboard-contract.test.ts:1-180',
  }),
  'WG-VIEW-011A': exact({
    public: 'packages/plite-dom/src/plugin/host-codec.ts:63-125',
    owner: 'packages/plite-dom/src/plugin/dom-clipboard-runtime.ts:420-560',
    consumers: 'packages/plite-react/src/editable/projected-clipboard.ts:1-150',
    lifecycle: 'packages/plite-dom/src/plugin/dom-clipboard-runtime.ts:561-709',
    proof: 'packages/plite-dom/test/clipboard-boundary.ts:541-738',
  }),
  'WG-VIEW-011B': exact({
    public: 'packages/plite-dom/src/plugin/dom-html.ts:1-95',
    owner: 'packages/plite-dom/src/plugin/dom-clipboard-runtime.ts:560-709',
    consumers: 'packages/plite-dom/src/plugin/host-codec.ts:637-717',
    lifecycle: 'packages/plite-dom/src/plugin/with-dom.ts:159-230',
    proof: 'packages/plite-dom/test/host-codec.test.ts:560-760',
  }),
  'WG-VIEW-012A1A': exact({
    public: 'packages/plite-dom/src/utils/hotkeys.ts:1-90',
    owner: 'packages/plite-dom/src/utils/hotkey-match.ts:1-160',
    consumers:
      'packages/plite-react/src/editable/runtime-keyboard-events.ts:250-500',
    lifecycle:
      'packages/plite-react/src/editable/keyboard-input-strategy.ts:430-560',
    proof: 'packages/plite-dom/test/hotkeys.ts:1-180',
  }),
  'WG-VIEW-012A1B': partial({
    covers:
      'packages/plite-react/src/editable/runtime-keyboard-events.ts:250-500',
    missingEvidence: PLITE_GAP,
    proof:
      'packages/plite-react/test/keyboard-input-strategy-contract.test.ts:1-180',
  }),
  'WG-VIEW-012A1C': partial({
    covers:
      'packages/plite-react/src/editable/runtime-keyboard-events.ts:300-616',
    missingEvidence: PLITE_GAP,
    proof:
      'packages/plite-react/test/keyboard-input-strategy-contract.test.ts:1-180',
  }),
  'WG-VIEW-012C1A': exact({
    public: 'packages/plite-react/src/components/editable.tsx:343-378',
    owner: 'packages/plite-react/src/editable/runtime-event-engine.ts:1-120',
    consumers: 'packages/plite-react/src/editable/input-router.ts:1480-1637',
    lifecycle:
      'packages/plite-react/src/editable/editable-dom-runtime.ts:670-821',
    proof: 'packages/plite-react/test/input-router-contract.test.tsx:1-180',
  }),
  'WG-VIEW-012C1B': partial({
    covers: 'packages/plite-react/src/editable/input-router.ts:1480-1637',
    missingEvidence: PLITE_GAP,
    proof: 'packages/plite-react/test/input-router-contract.test.tsx:1-180',
  }),
  'WG-VIEW-012C2': partial({
    covers: 'packages/plite-react/src/editable/editable-dom-runtime.ts:670-821',
    missingEvidence: PLITE_GAP,
    proof:
      'packages/plite-react/test/editable-dom-runtime-contract.test.tsx:1-180',
  }),
  'WG-VIEW-013B': partial({
    covers: 'packages/plite-react/src/components/editable.tsx:620-674',
    missingEvidence: PLITE_GAP,
    proof: 'packages/plite-react/test/surface-contract.tsx:600-660',
  }),
  'WG-VIEW-013C': partial({
    covers: 'packages/plite-react/src/components/editable.tsx:620-674',
    missingEvidence: PLITE_GAP,
    proof: 'packages/plite-react/test/rendered-dom-shape-contract.tsx:1-180',
  }),
  'WG-VIEW-013D': partial({
    covers: 'packages/plite-react/src/components/editable.tsx:620-674',
    missingEvidence: PLITE_GAP,
    proof: 'packages/plite-react/test/rendered-dom-shape-contract.tsx:1-180',
  }),
  'WG-VIEW-015A': exact({
    public: 'packages/plite-react/src/components/editable.tsx:674-715',
    owner: 'packages/plite-react/src/components/plite-placeholder.tsx:1-93',
    consumers:
      'packages/plite-react/src/components/editable-text-blocks.tsx:180-360',
    lifecycle:
      'packages/plite-react/src/editable/root-selector-sources.ts:360-460',
    proof: 'packages/plite-react/test/editable-behavior.tsx:1-180',
  }),
  'WG-VIEW-015B1': exact({
    public: 'packages/plite-react/src/editable/caret-engine.ts:1-100',
    owner: 'packages/plite-react/src/editable/caret-engine.ts:430-824',
    consumers:
      'packages/plite-react/src/editable/runtime-keyboard-events.ts:250-500',
    lifecycle:
      'packages/plite-react/src/editable/selection-controller.ts:1309-1492',
    proof: 'packages/plite-react/test/caret-engine-contract.test.ts:1-58',
  }),
  'WG-VIEW-015B2': partial({
    covers: 'packages/plite-react/src/view-selection-decoration.ts:1-180',
    missingEvidence: PLITE_GAP,
    proof: 'packages/plite-react/test/view-selection-contract.test.ts:1-180',
  }),
  'WG-VIEW-015C': partial({
    covers: 'packages/plite-react/src/editable/runtime-drag-events.ts:1-166',
    missingEvidence: PLITE_GAP,
    proof: 'packages/plite-react/test/input-router-contract.test.tsx:1-180',
  }),
  'WG-VIEW-016B': exact({
    public: 'packages/plite-react/src/view-source.ts:1-21',
    owner: 'packages/plite-react/src/mapped-view-store.ts:120-176',
    consumers: 'packages/plite-react/src/projection-store.ts:532-710',
    lifecycle: 'packages/plite-react/src/projection-store.ts:711-850',
    proof:
      'packages/plite-react/test/view-source-fault-boundary.test.ts:25-158',
  }),
});

const plate = Object.freeze({
  'WG-VIEW-001A': exact({
    public: 'packages/core/src/react/editor/withPlate.ts:121-220',
    owner: 'packages/core/src/react/components/Plate.tsx:1-120',
    consumers: 'packages/core/src/react/components/PlateContent.tsx:25-120',
    lifecycle: 'packages/core/src/react/components/EditorRefEffect.tsx:1-54',
    proof: 'packages/core/src/react/components/Plate.slow.tsx:1-180',
  }),
  'WG-VIEW-003A': partial({
    covers: [
      'packages/core/src/react/stores/plate/PlateStore.ts:1-35',
      'packages/core/src/react/internal/usePlateModelRevision.ts:1-9',
    ],
    missingEvidence: PLATE_GAP,
    proof:
      'packages/core/src/react/stores/plate/createPlateStore.spec.tsx:1-165',
  }),
  'WG-VIEW-003B': partial({
    covers: 'packages/core/src/react/components/PlateContent.tsx:120-245',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/components/PlateContent.spec.tsx:1-180',
  }),
  'WG-VIEW-004A1': partial({
    covers: [
      'packages/core/src/react/components/plate-nodes.tsx:1-180',
      'packages/core/src/react/components/PlateContent.tsx:120-245',
    ],
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/components/plate-nodes.spec.tsx:1-124',
  }),
  'WG-VIEW-004A3': partial({
    covers: 'packages/core/src/react/components/PlateContent.tsx:120-245',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/components/PlateContent.spec.tsx:180-360',
  }),
  'WG-VIEW-004B': exact({
    public: 'packages/core/src/react/components/PlateContent.tsx:25-120',
    owner: 'packages/core/src/react/components/plate-nodes.tsx:180-312',
    consumers: 'packages/core/src/react/components/PlateView.tsx:1-20',
    lifecycle: 'packages/core/src/react/components/EditorRefEffect.tsx:1-54',
    proof: 'packages/core/src/react/components/PlateContent.spec.tsx:360-530',
  }),
  'WG-VIEW-005A1': partial({
    covers: 'packages/core/src/react/components/plate-nodes.tsx:1-180',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/components/plate-nodes.spec.tsx:1-124',
  }),
  'WG-VIEW-005A2': partial({
    covers: 'packages/core/src/react/plugin/PlatePlugin.ts:203-260',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/components/plate-nodes.spec.tsx:1-124',
  }),
  'WG-VIEW-005B1': partial({
    covers: 'packages/core/src/react/editor/PlateEditor.ts:1-70',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/editor/TPlateEditorCore.spec.ts:1-120',
  }),
  'WG-VIEW-005C1': partial({
    covers: 'packages/core/src/react/components/plate-nodes.tsx:180-312',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/components/plate-nodes.spec.tsx:1-124',
  }),
  'WG-VIEW-005C2': partial({
    covers: 'packages/core/src/react/components/plate-nodes.tsx:1-120',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/components/plate-nodes.spec.tsx:1-124',
  }),
  'WG-VIEW-006A': partial({
    covers: 'packages/core/src/react/editor/PlateEditor.ts:1-70',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/editor/TPlateEditor.spec.ts:1-175',
  }),
  'WG-VIEW-006B': partial({
    covers: 'packages/core/src/react/components/PlateContent.tsx:120-245',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/components/PlateContent.spec.tsx:180-360',
  }),
  'WG-VIEW-007A': partial({
    covers: 'packages/core/src/react/editor/PlateEditor.ts:1-70',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/editor/TPlateEditor.spec.ts:1-175',
  }),
  'WG-VIEW-007B1': partial({
    covers:
      'packages/core/src/react/plugins/event-editor/useEventEditor.ts:1-71',
    missingEvidence: PLATE_GAP,
    proof:
      'packages/core/src/react/plugins/event-editor/useEventEditor.spec.tsx:1-156',
  }),
  'WG-VIEW-007B2': partial({
    covers: 'packages/core/src/react/components/PlateContent.tsx:120-245',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/components/PlateContent.spec.tsx:360-530',
  }),
  'WG-VIEW-008A': partial({
    covers: 'packages/core/src/react/components/PlateContent.tsx:120-245',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/components/PlateContent.spec.tsx:360-530',
  }),
  'WG-VIEW-008B1': partial({
    covers: 'packages/core/src/react/components/PlateContent.tsx:120-245',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/components/PlateContent.spec.tsx:180-360',
  }),
  'WG-VIEW-008B2': partial({
    covers: 'packages/core/src/react/hooks/usePlateRootProps.ts:1-23',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/hooks/usePlateRootProps.spec.tsx:1-28',
  }),
  'WG-VIEW-008B3': partial({
    covers: 'apps/www/src/registry/ui/toolbar.tsx:287-389',
    missingEvidence: PLATE_GAP,
    proof: 'apps/www/src/registry/ui/mark-toolbar-button.spec.tsx:175-231',
  }),
  'WG-VIEW-009A': exact({
    public: 'packages/core/src/react/plugin/DOMHandlers.ts:1-70',
    owner: 'packages/core/src/react/utils/pipeHandler.ts:1-80',
    consumers: 'packages/core/src/react/components/PlateContent.tsx:120-245',
    lifecycle:
      'packages/core/src/react/plugins/event-editor/EventEditorStore.ts:1-38',
    proof: 'packages/core/src/react/utils/pipeHandler.spec.tsx:1-120',
  }),
  'WG-VIEW-010A': partial({
    covers: 'packages/core/src/react/plugin/DOMHandlers.ts:70-140',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/components/PlateContent.spec.tsx:360-530',
  }),
  'WG-VIEW-010B1': exact({
    public: 'packages/core/src/react/plugin/PlatePlugin.ts:289-343',
    owner:
      'packages/core/src/react/components/EditorShortcutDispatcher.tsx:1-90',
    consumers: 'packages/core/src/react/components/PlateContent.tsx:120-245',
    lifecycle:
      'packages/core/src/react/components/EditorShortcutDispatcher.tsx:91-180',
    proof:
      'packages/core/src/react/components/EditorShortcutDispatcher.spec.tsx:52-180',
  }),
  'WG-VIEW-010B2': exact({
    public: 'packages/core/src/react/plugin/DOMHandlers.ts:70-140',
    owner: 'packages/core/src/react/utils/pipeHandler.ts:80-155',
    consumers: 'packages/core/src/react/components/PlateContent.tsx:120-245',
    lifecycle:
      'packages/core/src/react/plugins/event-editor/EventEditorStore.ts:1-38',
    proof: 'packages/core/src/react/utils/pipeHandler.spec.tsx:1-120',
  }),
  'WG-VIEW-010C1A': partial({
    covers: 'packages/core/src/react/plugin/DOMHandlers.ts:140-212',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/utils/pipeHandler.spec.tsx:1-120',
  }),
  'WG-VIEW-010C1B': exact({
    public: 'packages/dnd/src/useDndNode.ts:22-112',
    owner: 'packages/dnd/src/useDndNode.ts:114-360',
    consumers:
      'apps/www/src/registry/components/editor/plugins/dnd-kit.tsx:1-28',
    lifecycle: 'packages/dnd/src/useDndNode.ts:114-190',
    proof: 'packages/dnd/src/useDndNode.spec.ts:79-220',
  }),
  'WG-VIEW-010C2': exact({
    public: 'packages/core/src/react/plugin/DOMHandlers.ts:1-70',
    owner: 'packages/core/src/react/utils/pipeHandler.ts:1-80',
    consumers: 'packages/core/src/react/components/PlateContent.tsx:120-245',
    lifecycle:
      'packages/core/src/react/plugins/event-editor/EventEditorStore.ts:1-38',
    proof: 'packages/core/src/react/utils/pipeHandler.spec.tsx:1-120',
  }),
  'WG-VIEW-011A': exact({
    public: 'packages/core/src/lib/plugins/html/HtmlPlugin.ts:489-560',
    owner: 'packages/core/src/internal/plugin/compilePlateCodecs.ts:213-313',
    consumers: 'packages/core/src/lib/editor/withPlite.ts:194-253',
    lifecycle:
      'packages/core/src/internal/plugin/compilePlateCodecs.ts:314-370',
    proof: 'packages/core/src/lib/plugins/ProductCodecs.spec.ts:1-180',
  }),
  'WG-VIEW-011B': exact({
    public: 'packages/core/src/lib/plugins/html/htmlDom.ts:1-80',
    owner: 'packages/core/src/lib/plugins/html/HtmlPlugin.ts:489-620',
    consumers:
      'apps/www/src/registry/components/editor/plate-to-html.tsx:39-112',
    lifecycle:
      'packages/core/src/internal/plugin/compilePlateCodecs.ts:314-370',
    proof:
      'apps/www/src/__tests__/package-integration/core-html/HtmlPlugin.slow.tsx:1-180',
  }),
  'WG-VIEW-012A1A': partial({
    covers: 'packages/core/src/lib/utils/hotkeys.ts:1-80',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/lib/utils/hotkeys.spec.ts:1-61',
  }),
  'WG-VIEW-012A1B': exact({
    public: 'packages/core/src/react/plugin/PlatePlugin.ts:289-343',
    owner: 'packages/core/src/internal/plugin/compilePlateShortcuts.ts:1-172',
    consumers: 'packages/core/src/internal/plugin/resolvePlugins.ts:1112-1247',
    lifecycle: 'packages/core/src/internal/plugin/plateRuntime.ts:1-80',
    proof: 'packages/core/src/react/utils/shortcuts.spec.tsx:58-218',
  }),
  'WG-VIEW-012A1C': exact({
    public:
      'packages/core/src/react/components/EditorShortcutDispatcher.tsx:1-40',
    owner:
      'packages/core/src/react/components/EditorShortcutDispatcher.tsx:41-180',
    consumers: 'packages/core/src/react/components/PlateContent.tsx:120-245',
    lifecycle: 'packages/core/src/internal/plugin/plateRuntime.ts:1-80',
    proof:
      'packages/core/src/react/components/EditorShortcutDispatcher.spec.tsx:180-360',
  }),
  'WG-VIEW-012A2': exact({
    public:
      'packages/core/src/react/plugins/paragraph/ParagraphPlugin.tsx:1-21',
    owner: 'packages/core/src/react/plugins/paragraph/ParagraphPlugin.tsx:6-21',
    consumers:
      'apps/www/src/registry/components/editor/plugins/basic-blocks-kit.tsx:1-80',
    lifecycle:
      'packages/core/src/internal/plugin/compilePlateShortcuts.ts:136-172',
    proof: 'packages/core/src/react/utils/shortcuts.spec.tsx:58-218',
  }),
  'WG-VIEW-012B': exact({
    public: 'packages/core/src/lib/plugins/input-rules/defineInputRule.ts:1-30',
    owner:
      'packages/core/src/lib/plugins/input-rules/createInputRules.ts:180-420',
    consumers:
      'packages/core/src/lib/plugins/input-rules/InputRulesPlugin.ts:120-311',
    lifecycle:
      'packages/core/src/lib/plugins/input-rules/createInputRules.ts:421-585',
    proof:
      'packages/core/src/lib/plugins/input-rules/createRuleFactory.spec.ts:1-179',
  }),
  'WG-VIEW-012C1A': partial({
    covers: 'packages/core/src/react/plugin/DOMHandlers.ts:1-212',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/utils/pipeHandler.spec.tsx:1-120',
  }),
  'WG-VIEW-012C1B': exact({
    public: 'packages/core/src/react/plugin/DOMHandlers.ts:1-70',
    owner: 'packages/core/src/react/utils/pipeHandler.ts:1-80',
    consumers: 'packages/core/src/react/components/PlateContent.tsx:120-245',
    lifecycle:
      'packages/core/src/react/plugins/event-editor/EventEditorStore.ts:1-38',
    proof: 'packages/core/src/react/utils/pipeHandler.spec.tsx:1-120',
  }),
  'WG-VIEW-012C2': partial({
    covers:
      'packages/core/src/react/plugins/event-editor/EventEditorPlugin.ts:1-36',
    missingEvidence: PLATE_GAP,
    proof:
      'packages/core/src/react/plugins/event-editor/EventEditorStore.spec.ts:1-28',
  }),
  'WG-VIEW-013A': partial({
    covers: 'apps/www/src/registry/registry-styles.ts:1-28',
    missingEvidence: PLATE_GAP,
    proof:
      'apps/www/src/registry/components/editor/plugins/fixed-toolbar-kit.tsx:1-19',
  }),
  'WG-VIEW-013B': partial({
    covers: 'apps/www/src/registry/registry-styles.ts:1-28',
    missingEvidence: PLATE_GAP,
    proof: 'apps/www/src/registry/ui/fixed-toolbar.tsx:1-17',
  }),
  'WG-VIEW-013C': partial({
    covers: 'apps/www/src/registry/registry-styles.ts:1-28',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/components/PlateContent.spec.tsx:180-360',
  }),
  'WG-VIEW-013D': exact({
    public: 'packages/core/src/react/hooks/usePlateRootProps.ts:1-23',
    owner: 'packages/core/src/react/utils/dom-attributes.ts:1-188',
    consumers: 'packages/core/src/react/components/PlateContent.tsx:120-245',
    lifecycle: 'packages/core/src/react/hooks/useEditableProps.ts:1-119',
    proof: 'packages/core/src/react/utils/dom-attributes.spec.ts:1-23',
  }),
  'WG-VIEW-014A1': exact({
    public: 'packages/selection/src/react/BlockMenuPlugin.tsx:1-80',
    owner: 'apps/www/src/registry/ui/block-context-menu.tsx:1-100',
    consumers:
      'apps/www/src/registry/components/editor/plugins/block-menu-kit.tsx:1-14',
    lifecycle: 'apps/www/src/registry/ui/block-context-menu.tsx:101-195',
    proof: 'packages/selection/src/react/BlockMenuPlugin.spec.tsx:1-55',
  }),
  'WG-VIEW-014A2': partial({
    covers:
      'apps/www/src/registry/components/editor/settings-dialog.tsx:218-446',
    missingEvidence: PLATE_GAP,
    proof: 'apps/www/src/registry/ui/media-preview-dialog.tsx:1-185',
  }),
  'WG-VIEW-014B': exact({
    public: 'apps/www/src/registry/ui/toolbar.tsx:120-280',
    owner: 'apps/www/src/registry/ui/insert-toolbar-button.tsx:80-269',
    consumers: 'apps/www/src/registry/ui/fixed-toolbar-buttons.tsx:70-194',
    lifecycle:
      'apps/www/src/registry/components/editor/plugins/fixed-toolbar-kit.tsx:1-19',
    proof: 'apps/www/src/registry/ui/turn-into-toolbar-button.spec.ts:1-80',
  }),
  'WG-VIEW-014C1': partial({
    covers: [
      'packages/floating/src/useFloating.ts:1-235',
      'apps/www/src/registry/ui/toolbar.tsx:287-389',
    ],
    missingEvidence: PLATE_GAP,
    proof: 'packages/floating/src/useFloating.spec.tsx:1-115',
  }),
  'WG-VIEW-014C2': partial({
    covers: 'apps/www/src/registry/ui/toolbar.tsx:287-389',
    missingEvidence: PLATE_GAP,
    proof: 'apps/www/src/registry/ui/mark-toolbar-button.spec.tsx:175-231',
  }),
  'WG-VIEW-015A': exact({
    public:
      'apps/www/src/registry/components/editor/plugins/block-placeholder-kit.tsx:1-17',
    owner: 'packages/core/src/react/components/plate-nodes.tsx:180-260',
    consumers: 'packages/core/src/react/components/PlateContent.tsx:120-245',
    lifecycle:
      'packages/core/src/react/stores/element/useElementStore.tsx:1-120',
    proof: 'packages/ai/src/react/AIChatPlugin.placeholders.spec.tsx:117-200',
  }),
  'WG-VIEW-015B1': partial({
    covers: 'apps/www/src/registry/ui/cursor-overlay.tsx:1-88',
    missingEvidence: PLATE_GAP,
    proof: 'packages/cursor/src/cursorGeometry.spec.tsx:1-180',
  }),
  'WG-VIEW-015B2': exact({
    public: 'packages/selection/src/react/CursorOverlayPlugin.tsx:9-40',
    owner: 'packages/cursor/src/useCursorOverlay.ts:71-190',
    consumers: 'apps/www/src/registry/ui/remote-cursor-overlay.tsx:30-120',
    lifecycle: 'packages/selection/src/react/useCursorOverlay.ts:1-30',
    proof: 'packages/selection/src/react/CursorOverlayPlugin.spec.tsx:36-83',
  }),
  'WG-VIEW-015C': exact({
    public: 'packages/dnd/src/useDndNode.ts:22-112',
    owner: 'packages/dnd/src/useDndNode.ts:360-620',
    consumers:
      'apps/www/src/registry/components/editor/plugins/dnd-kit.tsx:1-28',
    lifecycle: 'packages/dnd/src/DndPlugin.tsx:1-16',
    proof: 'packages/dnd/src/useDndNode.spec.ts:312-400',
  }),
  'WG-VIEW-016A': partial({
    covers: 'packages/core/src/internal/plugin/resolvePlugins.ts:1400-1540',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/internal/plugin/resolvePlugins.spec.tsx:1-120',
  }),
  'WG-VIEW-016B': partial({
    covers: 'packages/core/src/react/components/plate-nodes.tsx:180-312',
    missingEvidence: PLATE_GAP,
    proof: 'packages/core/src/react/components/plate-nodes.spec.tsx:1-124',
  }),
});

const viewIds = Object.freeze([
  'WG-VIEW-002',
  'WG-VIEW-006A',
  'WG-VIEW-006B',
  'WG-VIEW-008A',
  'WG-VIEW-010A',
  'WG-VIEW-012B',
  'WG-VIEW-014B',
  'WG-VIEW-003A',
  'WG-VIEW-003B',
  'WG-VIEW-005B1',
  'WG-VIEW-005B2',
  'WG-VIEW-001A',
  'WG-VIEW-004A1',
  'WG-VIEW-004A2',
  'WG-VIEW-004A3',
  'WG-VIEW-004B',
  'WG-VIEW-005A1',
  'WG-VIEW-005A2',
  'WG-VIEW-005C1',
  'WG-VIEW-005C2',
  'WG-VIEW-007A',
  'WG-VIEW-007B1',
  'WG-VIEW-007B2',
  'WG-VIEW-008B1',
  'WG-VIEW-008B2',
  'WG-VIEW-008B3',
  'WG-VIEW-009A',
  'WG-VIEW-010B1',
  'WG-VIEW-010B2',
  'WG-VIEW-010C1A',
  'WG-VIEW-010C1B',
  'WG-VIEW-010C2',
  'WG-VIEW-011A',
  'WG-VIEW-011B',
  'WG-VIEW-012C1A',
  'WG-VIEW-012C1B',
  'WG-VIEW-012C2',
  'WG-VIEW-012A1A',
  'WG-VIEW-012A1B',
  'WG-VIEW-012A1C',
  'WG-VIEW-012A2',
  'WG-VIEW-014A1',
  'WG-VIEW-014A2',
  'WG-VIEW-014C1',
  'WG-VIEW-014C2',
  'WG-VIEW-015A',
  'WG-VIEW-015B1',
  'WG-VIEW-015B2',
  'WG-VIEW-015C',
  'WG-VIEW-016A',
  'WG-VIEW-016B',
  'WG-VIEW-013A',
  'WG-VIEW-013B',
  'WG-VIEW-013C',
  'WG-VIEW-013D',
]);

export const contractEvidence = Object.freeze(
  Object.fromEntries(
    viewIds.map((id) => [
      id,
      Object.freeze({
        ...(wordgard[id] ? { wordgard: wordgard[id] } : {}),
        ...(plite[id] ? { plite: plite[id] } : {}),
        ...(plate[id] ? { plate: plate[id] } : {}),
      }),
    ])
  )
);

const pliteWins = Object.freeze({
  exact: () => [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
});

export const dimensionEvidenceKeys = Object.freeze({
  'WG-VIEW-001A': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['plite.consumers', 'plate.consumers'],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-VIEW-002': pliteWins.exact('WG-VIEW-002'),
  'WG-VIEW-003A': pliteWins.exact('WG-VIEW-003A'),
  'WG-VIEW-003B': [[], [], [], [], [], []],
  'WG-VIEW-004A1': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.covers'],
    ['plite.consumers', 'plate.covers'],
    ['plite.owner', 'plate.covers'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-VIEW-004A2': [[], [], [], [], [], []],
  'WG-VIEW-004A3': pliteWins.exact('WG-VIEW-004A3'),
  'WG-VIEW-004B': [
    ['wordgard.proof', 'plite.proof', 'plate.proof'],
    ['wordgard.public', 'plite.public', 'plate.public'],
    ['plite.consumers'],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-VIEW-005A1': pliteWins.exact('WG-VIEW-005A1'),
  'WG-VIEW-005A2': pliteWins.exact('WG-VIEW-005A2'),
  'WG-VIEW-005B1': pliteWins.exact('WG-VIEW-005B1'),
  'WG-VIEW-005B2': [
    ['wordgard.proof'],
    ['wordgard.covers'],
    [],
    ['wordgard.covers'],
    [],
    [],
  ],
  'WG-VIEW-005C1': pliteWins.exact('WG-VIEW-005C1'),
  'WG-VIEW-005C2': [
    ['wordgard.proof', 'plite.proof', 'plate.proof'],
    [],
    ['wordgard.consumers', 'plite.covers', 'plate.covers'],
    ['wordgard.owner', 'plite.covers', 'plate.covers'],
    [],
    ['plite.proof'],
  ],
  'WG-VIEW-006A': pliteWins.exact('WG-VIEW-006A'),
  'WG-VIEW-006B': pliteWins.exact('WG-VIEW-006B'),
  'WG-VIEW-007A': pliteWins.exact('WG-VIEW-007A'),
  'WG-VIEW-007B1': pliteWins.exact('WG-VIEW-007B1'),
  'WG-VIEW-007B2': pliteWins.exact('WG-VIEW-007B2'),
  'WG-VIEW-008A': pliteWins.exact('WG-VIEW-008A'),
  'WG-VIEW-008B1': pliteWins.exact('WG-VIEW-008B1'),
  'WG-VIEW-008B2': pliteWins.exact('WG-VIEW-008B2'),
  'WG-VIEW-008B3': [
    ['wordgard.proof'],
    ['wordgard.covers'],
    [],
    ['wordgard.covers'],
    [],
    [],
  ],
  'WG-VIEW-009A': [
    ['plite.proof'],
    ['plite.public'],
    ['plite.consumers'],
    ['plite.owner'],
    [],
    [],
  ],
  'WG-VIEW-010A': pliteWins.exact('WG-VIEW-010A'),
  'WG-VIEW-010B1': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['plite.consumers', 'plate.consumers'],
    ['plite.owner', 'plate.owner'],
    [],
    [],
  ],
  'WG-VIEW-010B2': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['plite.consumers', 'plate.consumers'],
    ['plite.owner', 'plate.owner'],
    [],
    [],
  ],
  'WG-VIEW-010C1A': pliteWins.exact('WG-VIEW-010C1A'),
  'WG-VIEW-010C1B': [
    ['plate.proof'],
    ['plate.public'],
    [],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-VIEW-010C2': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['plite.consumers', 'plate.consumers'],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-VIEW-011A': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['plite.consumers', 'plate.consumers'],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-VIEW-011B': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    ['plite.consumers', 'plate.consumers'],
    ['plite.owner', 'plate.owner'],
    [],
    [],
  ],
  'WG-VIEW-012A1A': [
    ['plite.proof'],
    ['plite.public'],
    [],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-VIEW-012A1B': [
    ['plate.proof'],
    ['plate.public'],
    [],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-VIEW-012A1C': [
    ['plate.proof'],
    ['plate.public'],
    [],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-VIEW-012A2': [
    ['plate.proof'],
    ['plate.public'],
    [],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-VIEW-012B': [
    ['plate.proof'],
    ['plate.public'],
    [],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-VIEW-012C1A': [
    ['plite.proof'],
    ['plite.public'],
    [],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-VIEW-012C1B': [
    ['plate.proof'],
    ['plate.public'],
    [],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-VIEW-012C2': [[], [], [], [], [], []],
  'WG-VIEW-013A': [
    ['wordgard.proof'],
    ['wordgard.covers'],
    [],
    ['wordgard.covers'],
    [],
    [],
  ],
  'WG-VIEW-013B': [
    ['wordgard.proof', 'plite.proof', 'plate.proof'],
    ['wordgard.covers', 'plite.covers', 'plate.covers'],
    [],
    ['wordgard.covers', 'plite.covers', 'plate.covers'],
    [],
    [],
  ],
  'WG-VIEW-013C': [
    ['wordgard.proof', 'plite.proof', 'plate.proof'],
    ['wordgard.covers', 'plite.covers', 'plate.covers'],
    [],
    ['wordgard.covers', 'plite.covers', 'plate.covers'],
    [],
    [],
  ],
  'WG-VIEW-013D': [
    ['plate.proof'],
    ['plate.public'],
    [],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-VIEW-014A1': [
    ['plate.proof'],
    ['plate.public'],
    [],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-VIEW-014A2': [[], [], [], [], [], []],
  'WG-VIEW-014B': [
    ['plate.proof'],
    ['plate.public'],
    [],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-VIEW-014C1': [[], [], [], [], [], []],
  'WG-VIEW-014C2': [
    ['wordgard.proof'],
    ['wordgard.covers'],
    [],
    ['wordgard.covers'],
    [],
    [],
  ],
  'WG-VIEW-015A': [
    ['plite.proof', 'plate.proof'],
    ['plite.public', 'plate.public'],
    [],
    ['plite.owner', 'plate.owner'],
    [],
    ['plite.proof', 'plate.proof'],
  ],
  'WG-VIEW-015B1': [
    ['plite.proof'],
    ['plite.public'],
    [],
    ['plite.owner'],
    [],
    ['plite.proof'],
  ],
  'WG-VIEW-015B2': [
    ['plate.proof'],
    ['plate.public'],
    [],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-VIEW-015C': [
    ['plate.proof'],
    ['plate.public'],
    [],
    ['plate.owner'],
    [],
    ['plate.proof'],
  ],
  'WG-VIEW-016A': [
    ['wordgard.proof'],
    ['wordgard.covers'],
    [],
    ['wordgard.covers'],
    [],
    [],
  ],
  'WG-VIEW-016B': pliteWins.exact('WG-VIEW-016B'),
});
