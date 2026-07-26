import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

import { format } from "prettier";
import ts from "/Users/zbeyens/git/prosemirror/node_modules/typescript/lib/typescript.js";

const workspace = resolve(process.cwd());
const outputRoot = resolve(
  workspace,
  "docs/plans/artifacts/multi-editor-full-architecture-audit"
);

const writeFormatted = async (file, value) => {
  const filePath = resolve(file);

  writeFileSync(filePath, await format(value, { filepath: filePath }));
};

const modules = [
  ["model", "../prosemirror/model"],
  ["transform", "../prosemirror/transform"],
  ["state", "../prosemirror/state"],
  ["view", "../prosemirror/view"],
  ["keymap", "../prosemirror-keymap"],
  ["inputrules", "../prosemirror-inputrules"],
  ["history", "../prosemirror/history"],
  ["collab", "../prosemirror/collab"],
  ["commands", "../prosemirror-commands"],
  ["gapcursor", "../prosemirror-gapcursor"],
  ["schema-basic", "../prosemirror-schema-basic"],
  ["schema-list", "../prosemirror-schema-list"],
  ["menu", "../prosemirror-menu"],
  ["example-setup", "../prosemirror-example-setup"],
  ["markdown", "../prosemirror-markdown"],
  ["dropcursor", "../prosemirror-dropcursor"],
  ["test-builder", "../prosemirror-test-builder"],
  ["changeset", "../prosemirror-changeset"],
  ["search", "../prosemirror-search"],
];

const concepts = {
  "PM-C01": "Package constellation and meta-repository orchestration",
  "PM-C02": "Persistent immutable class-based document tree",
  "PM-C03": "Fragment child storage and adjacent-text canonicalization",
  "PM-C04": "Flat integer positions, resolved positions, ranges, and caches",
  "PM-C05": "Open-edge slices and strict replacement",
  "PM-C06": "Content-expression parser and compiled automaton",
  "PM-C07": "Schema, node-type, and mark-type compilation",
  "PM-C08": "Attribute defaults, validation, and requiredness",
  "PM-C09": "Schema-aware construction, filling, and content validation",
  "PM-C10": "Ordered mark-set algebra and exclusions",
  "PM-C11": "Structural equality and minimal dirty-range diffing",
  "PM-C12": "Schema-local caches and live type identity",
  "PM-C13": "Document and polymorphic JSON serialization",
  "PM-C14": "Declarative DOM parsing rules and precedence",
  "PM-C15": "Context-aware DOM parse fitting and position recovery",
  "PM-C16": "Declarative DOM output specs, rendering, and safety checks",
  "PM-C17": "Polymorphic Step protocol and global type registry",
  "PM-C18": "Compact position maps, recovery tokens, and mirror mappings",
  "PM-C19": "Mutable Transform accumulator and changed-range derivation",
  "PM-C20": "Atomic replace, mark, and attribute steps",
  "PM-C21": "Schema-aware slice fitter and replacement heuristics",
  "PM-C22": "Structural lift, wrap, split, join, and type transforms",
  "PM-C23":
    "Transaction document, selection, mark, metadata, time, and scroll intent",
  "PM-C24": "Extensible selection hierarchy, ranges, mapping, and bookmarks",
  "PM-C25": "Immutable EditorState fields, reduction, and reconfiguration",
  "PM-C26":
    "Plugin state, props, transaction filters, appenders, and view lifecycle",
  "PM-C27": "Plugin identity, precedence, and configuration ordering",
  "PM-C28": "Optional-dispatch command contract and command composition",
  "PM-C29": "Key-name normalization, platform aliases, and precedence",
  "PM-C30": "Input-rule matching, undo, builders, and composition timing",
  "PM-C31": "Branch-based history grouping, mapping, rebasing, and compression",
  "PM-C32": "Central-version collaboration and unconfirmed-step rebasing",
  "PM-C33": "Imperative EditorView lifecycle and state publication",
  "PM-C34": "Editor prop precedence and event pipeline",
  "PM-C35": "Mutable ViewDesc tree and localized DOM reconciliation",
  "PM-C36": "NodeView and MarkView lifecycle and mutation contracts",
  "PM-C37": "Persistent mapped decorations, widgets, and invalidation",
  "PM-C38": "DOM mutation and selection observation",
  "PM-C39": "DOM-change parsing, diffing, and model dispatch",
  "PM-C40": "Input, composition, drag/drop, focus, and event scheduling",
  "PM-C41": "DOM-to-model selection import and export",
  "PM-C42": "Clipboard slice context, HTML/text pipelines, and fitting",
  "PM-C43": "Coordinates, scrolling, bidi, and text-block edge navigation",
  "PM-C44": "Browser-specific compatibility and distributed timers",
  "PM-C45": "Gap-cursor selection extension",
  "PM-C46": "Drop-cursor view extension",
  "PM-C47": "Basic rich-text schema policy",
  "PM-C48": "List schema and list-specific commands",
  "PM-C49": "Menu, toolbar, icon, focus, and floating UI",
  "PM-C50": "Example editor bundle, prompts, and schema-discovered defaults",
  "PM-C51": "Schema-bound Markdown parsing",
  "PM-C52": "Schema-bound Markdown serialization",
  "PM-C53": "ChangeSet ranges, mapping, diffing, simplification, and metadata",
  "PM-C54": "Search query, replacement, highlighting, and commands",
  "PM-C55": "Tagged document-builder test DSL",
  "PM-C56": "Unit, browser, fuzz-like, and harness proof surface",
  "PM-C57": "Package-owned public DOM styling",
  "PM-C58": "Meta demo and benchmark shell",
  "PM-C59": "Single-root and class-identity representation constraint",
  "PM-C60": "Unversioned persistence and live-registry dependency",
  "PM-C61": "Schema-bound codec ownership",
  "PM-C62": "Order-dependent, non-transactional extension configuration",
  "PM-C63": "Package exports and ownership boundaries",
  "PM-C64": "Caching, locality, and large-document cost controls",
};

const sourceConcepts = {
  model: {
    "src/comparedeep.ts": ["PM-C11"],
    "src/content.ts": ["PM-C06", "PM-C09", "PM-C64"],
    "src/diff.ts": ["PM-C11", "PM-C64"],
    "src/dom.ts": ["PM-C14", "PM-C16", "PM-C61"],
    "src/fragment.ts": ["PM-C03", "PM-C11", "PM-C13", "PM-C64"],
    "src/from_dom.ts": ["PM-C14", "PM-C15", "PM-C61"],
    "src/index.ts": ["PM-C01", "PM-C63"],
    "src/mark.ts": ["PM-C10", "PM-C13"],
    "src/node.ts": [
      "PM-C02",
      "PM-C04",
      "PM-C05",
      "PM-C08",
      "PM-C09",
      "PM-C11",
      "PM-C13",
      "PM-C59",
      "PM-C60",
    ],
    "src/replace.ts": ["PM-C05", "PM-C09", "PM-C21"],
    "src/resolvedpos.ts": ["PM-C04", "PM-C64"],
    "src/schema.ts": [
      "PM-C06",
      "PM-C07",
      "PM-C08",
      "PM-C09",
      "PM-C10",
      "PM-C12",
      "PM-C13",
      "PM-C59",
      "PM-C60",
      "PM-C61",
      "PM-C62",
      "PM-C64",
    ],
    "src/to_dom.ts": ["PM-C16", "PM-C61"],
  },
  transform: {
    "src/attr_step.ts": ["PM-C17", "PM-C20"],
    "src/index.ts": ["PM-C01", "PM-C63"],
    "src/map.ts": ["PM-C18", "PM-C64"],
    "src/mark.ts": ["PM-C10", "PM-C22"],
    "src/mark_step.ts": ["PM-C17", "PM-C20"],
    "src/replace.ts": ["PM-C05", "PM-C21", "PM-C22"],
    "src/replace_step.ts": ["PM-C17", "PM-C20"],
    "src/step.ts": ["PM-C13", "PM-C17", "PM-C60"],
    "src/structure.ts": ["PM-C09", "PM-C21", "PM-C22"],
    "src/transform.ts": ["PM-C18", "PM-C19", "PM-C64"],
  },
  state: {
    "src/index.ts": ["PM-C01", "PM-C63"],
    "src/plugin.ts": ["PM-C26", "PM-C27", "PM-C62"],
    "src/selection.ts": ["PM-C13", "PM-C17", "PM-C18", "PM-C24", "PM-C60"],
    "src/state.ts": [
      "PM-C13",
      "PM-C25",
      "PM-C26",
      "PM-C27",
      "PM-C60",
      "PM-C62",
    ],
    "src/transaction.ts": ["PM-C19", "PM-C23", "PM-C28"],
  },
  view: {
    "src/browser.ts": ["PM-C44"],
    "src/capturekeys.ts": ["PM-C28", "PM-C40", "PM-C43", "PM-C44"],
    "src/clipboard.ts": ["PM-C15", "PM-C16", "PM-C42", "PM-C44", "PM-C61"],
    "src/decoration.ts": ["PM-C34", "PM-C37", "PM-C64"],
    "src/dom.ts": ["PM-C35", "PM-C41", "PM-C43", "PM-C44"],
    "src/domchange.ts": ["PM-C11", "PM-C14", "PM-C39", "PM-C40", "PM-C44"],
    "src/domcoords.ts": ["PM-C41", "PM-C43", "PM-C44"],
    "src/domobserver.ts": ["PM-C38", "PM-C40", "PM-C44"],
    "src/index.ts": [
      "PM-C26",
      "PM-C27",
      "PM-C33",
      "PM-C34",
      "PM-C35",
      "PM-C36",
      "PM-C38",
      "PM-C40",
      "PM-C41",
      "PM-C43",
      "PM-C63",
    ],
    "src/input.ts": [
      "PM-C28",
      "PM-C34",
      "PM-C38",
      "PM-C39",
      "PM-C40",
      "PM-C42",
      "PM-C44",
    ],
    "src/selection.ts": ["PM-C24", "PM-C35", "PM-C36", "PM-C41", "PM-C44"],
    "src/viewdesc.ts": [
      "PM-C35",
      "PM-C36",
      "PM-C37",
      "PM-C38",
      "PM-C41",
      "PM-C64",
    ],
  },
  keymap: {
    "src/keymap.ts": ["PM-C27", "PM-C28", "PM-C29", "PM-C44"],
  },
  inputrules: {
    "src/index.ts": ["PM-C01", "PM-C63"],
    "src/inputrules.ts": ["PM-C23", "PM-C26", "PM-C30", "PM-C40", "PM-C44"],
    "src/rulebuilders.ts": ["PM-C09", "PM-C21", "PM-C30"],
    "src/rules.ts": ["PM-C30"],
  },
  history: {
    "src/history.ts": [
      "PM-C18",
      "PM-C23",
      "PM-C24",
      "PM-C26",
      "PM-C31",
      "PM-C32",
      "PM-C64",
    ],
  },
  collab: {
    "src/collab.ts": [
      "PM-C17",
      "PM-C18",
      "PM-C23",
      "PM-C26",
      "PM-C31",
      "PM-C32",
    ],
  },
  commands: {
    "src/commands.ts": [
      "PM-C09",
      "PM-C21",
      "PM-C22",
      "PM-C24",
      "PM-C28",
      "PM-C43",
      "PM-C44",
    ],
  },
  gapcursor: {
    "src/gapcursor.ts": ["PM-C17", "PM-C24", "PM-C35", "PM-C41", "PM-C45"],
    "src/index.ts": [
      "PM-C26",
      "PM-C28",
      "PM-C34",
      "PM-C37",
      "PM-C40",
      "PM-C45",
      "PM-C63",
    ],
  },
  "schema-basic": {
    "src/schema-basic.ts": ["PM-C07", "PM-C14", "PM-C16", "PM-C47", "PM-C61"],
  },
  "schema-list": {
    "src/schema-list.ts": [
      "PM-C06",
      "PM-C09",
      "PM-C21",
      "PM-C22",
      "PM-C28",
      "PM-C48",
    ],
  },
  menu: {
    "src/icons.ts": ["PM-C44", "PM-C49"],
    "src/index.ts": ["PM-C01", "PM-C49", "PM-C63"],
    "src/menu.ts": ["PM-C28", "PM-C33", "PM-C43", "PM-C49"],
    "src/menubar.ts": [
      "PM-C26",
      "PM-C33",
      "PM-C40",
      "PM-C43",
      "PM-C44",
      "PM-C49",
    ],
  },
  "example-setup": {
    "src/index.ts": [
      "PM-C26",
      "PM-C27",
      "PM-C29",
      "PM-C30",
      "PM-C49",
      "PM-C50",
    ],
    "src/inputrules.ts": ["PM-C30", "PM-C48", "PM-C50"],
    "src/keymap.ts": ["PM-C28", "PM-C29", "PM-C47", "PM-C48", "PM-C50"],
    "src/menu.ts": ["PM-C28", "PM-C47", "PM-C48", "PM-C49", "PM-C50"],
    "src/prompt.ts": ["PM-C40", "PM-C49", "PM-C50"],
  },
  markdown: {
    "src/from_markdown.ts": [
      "PM-C03",
      "PM-C07",
      "PM-C09",
      "PM-C47",
      "PM-C51",
      "PM-C61",
    ],
    "src/index.ts": ["PM-C01", "PM-C51", "PM-C52", "PM-C63"],
    "src/schema.ts": [
      "PM-C07",
      "PM-C47",
      "PM-C48",
      "PM-C51",
      "PM-C52",
      "PM-C61",
    ],
    "src/to_markdown.ts": ["PM-C10", "PM-C47", "PM-C52", "PM-C61"],
  },
  dropcursor: {
    "src/dropcursor.ts": [
      "PM-C26",
      "PM-C33",
      "PM-C37",
      "PM-C40",
      "PM-C43",
      "PM-C44",
      "PM-C46",
    ],
  },
  "test-builder": {
    "src/build.ts": ["PM-C02", "PM-C04", "PM-C07", "PM-C55", "PM-C56"],
    "src/index.ts": ["PM-C47", "PM-C48", "PM-C55", "PM-C56", "PM-C63"],
  },
  changeset: {
    "src/change.ts": ["PM-C13", "PM-C53"],
    "src/changeset.ts": ["PM-C11", "PM-C18", "PM-C53", "PM-C64"],
    "src/diff.ts": ["PM-C11", "PM-C12", "PM-C53", "PM-C64"],
    "src/simplify.ts": ["PM-C53", "PM-C64"],
  },
  search: {
    "src/query.ts": [
      "PM-C04",
      "PM-C05",
      "PM-C11",
      "PM-C12",
      "PM-C54",
      "PM-C64",
    ],
    "src/search.ts": [
      "PM-C23",
      "PM-C24",
      "PM-C26",
      "PM-C28",
      "PM-C37",
      "PM-C54",
    ],
  },
};

const testConcepts = {
  model: {
    "test/test-content.ts": ["PM-C06", "PM-C09"],
    "test/test-diff.ts": ["PM-C11"],
    "test/test-dom.ts": ["PM-C14", "PM-C15", "PM-C16", "PM-C61"],
    "test/test-mark.ts": ["PM-C10"],
    "test/test-node.ts": ["PM-C02", "PM-C08", "PM-C09", "PM-C11", "PM-C13"],
    "test/test-replace.ts": ["PM-C05", "PM-C09", "PM-C21"],
    "test/test-resolve.ts": ["PM-C04"],
    "test/test-slice.ts": ["PM-C05"],
  },
  transform: {
    "test/test-mapping.ts": ["PM-C18"],
    "test/test-replace_step.ts": ["PM-C17", "PM-C20"],
    "test/test-step.ts": ["PM-C17", "PM-C20"],
    "test/test-structure.ts": ["PM-C21", "PM-C22"],
    "test/test-trans.ts": ["PM-C10", "PM-C19", "PM-C20", "PM-C21", "PM-C22"],
    "test/trans.ts": ["PM-C55", "PM-C56"],
  },
  state: {
    "test/state.ts": ["PM-C55", "PM-C56"],
    "test/test-selection.ts": ["PM-C18", "PM-C24"],
    "test/test-state.ts": ["PM-C23", "PM-C25", "PM-C26", "PM-C27", "PM-C62"],
  },
  view: {
    "test/view.ts": ["PM-C55", "PM-C56"],
    "test/webtest-clipboard.ts": ["PM-C15", "PM-C16", "PM-C42"],
    "test/webtest-composition.ts": [
      "PM-C38",
      "PM-C39",
      "PM-C40",
      "PM-C41",
      "PM-C44",
    ],
    "test/webtest-decoration.ts": ["PM-C18", "PM-C37"],
    "test/webtest-domchange.ts": ["PM-C38", "PM-C39", "PM-C40", "PM-C44"],
    "test/webtest-draw-decoration.ts": ["PM-C35", "PM-C36", "PM-C37"],
    "test/webtest-draw.ts": ["PM-C33", "PM-C34", "PM-C35"],
    "test/webtest-endOfTextblock.ts": ["PM-C41", "PM-C43", "PM-C44"],
    "test/webtest-markview.ts": ["PM-C35", "PM-C36", "PM-C38"],
    "test/webtest-nodeview.ts": ["PM-C35", "PM-C36", "PM-C37", "PM-C38"],
    "test/webtest-selection.ts": ["PM-C24", "PM-C41", "PM-C43", "PM-C44"],
    "test/webtest-view.ts": ["PM-C33", "PM-C34", "PM-C35", "PM-C41", "PM-C43"],
  },
  keymap: { "test/test-keymap.ts": ["PM-C28", "PM-C29", "PM-C44"] },
  history: { "test/test-history.ts": ["PM-C18", "PM-C24", "PM-C31", "PM-C32"] },
  collab: {
    "test/test-collab.ts": ["PM-C31", "PM-C32"],
    "test/test-rebase.ts": ["PM-C18", "PM-C32"],
  },
  commands: {
    "test/test-commands.ts": [
      "PM-C09",
      "PM-C21",
      "PM-C22",
      "PM-C24",
      "PM-C28",
      "PM-C43",
    ],
  },
  gapcursor: { "test/test-gapcursor.ts": ["PM-C24", "PM-C41", "PM-C45"] },
  "schema-list": {
    "test/test-commands.ts": ["PM-C21", "PM-C22", "PM-C28", "PM-C48"],
  },
  markdown: {
    "test/build.ts": ["PM-C55", "PM-C56"],
    "test/test-custom-parser.ts": ["PM-C51"],
    "test/test-parse.ts": ["PM-C51", "PM-C52"],
  },
  "test-builder": { "test/test-marks.ts": ["PM-C10", "PM-C55"] },
  changeset: {
    "test/test-changed-range.ts": ["PM-C18", "PM-C53"],
    "test/test-changes.ts": ["PM-C18", "PM-C53"],
    "test/test-diff.ts": ["PM-C11", "PM-C53", "PM-C64"],
    "test/test-merge.ts": ["PM-C53"],
    "test/test-simplify.ts": ["PM-C53"],
  },
  search: {
    "test/test-query.ts": ["PM-C05", "PM-C54"],
    "test/test-search.ts": ["PM-C23", "PM-C24", "PM-C28", "PM-C37", "PM-C54"],
  },
};

const testClassifications = {
  model: {
    "test/test-content.ts": [
      "portable-mixed",
      ["PM-01"],
      "Ordered grammar, per-prefix matching, and filler laws are portable; the string grammar and class types are not.",
    ],
    "test/test-diff.ts": [
      "portable-mixed",
      ["PM-05"],
      "Minimal dirty-range behavior is portable; flat integer offsets are source-specific.",
    ],
    "test/test-dom.ts": [
      "portable",
      ["PM-03", "PM-11"],
      "DOM parse/render, whitespace, context, mark, namespace, and recovery behavior.",
    ],
    "test/test-mark.ts": [
      "portable-mixed",
      ["PM-04"],
      "Conflict, replacement, and inclusivity laws are portable; PM mark objects, raw exclusion strings, and rank are not.",
    ],
    "test/test-node.ts": [
      "portable-mixed",
      ["PM-01", "PM-03"],
      "Tree equality, slicing, text, JSON, and validation behavior; class representation is not portable.",
    ],
    "test/test-replace.ts": [
      "portable",
      ["PM-01", "PM-02"],
      "Structural replacement, fitting, rejection, and open-edge behavior.",
    ],
    "test/test-resolve.ts": [
      "portable-mixed",
      ["PM-06", "PM-13"],
      "Context and boundary behavior is portable; numeric position resolution is not.",
    ],
    "test/test-slice.ts": [
      "portable",
      ["PM-02"],
      "Open slice boundaries and partial marked fragments.",
    ],
  },
  transform: {
    "test/test-mapping.ts": [
      "portable",
      ["PM-05", "PM-06"],
      "Affinity and deletion mapping through structural changes.",
    ],
    "test/test-replace_step.ts": [
      "portable",
      ["PM-05", "PM-08"],
      "Concurrent replacement and replace-around mapping pressure.",
    ],
    "test/test-step.ts": [
      "portable",
      ["PM-05", "PM-07"],
      "Change merge, inversion, and typing/delete grouping behavior.",
    ],
    "test/test-structure.ts": [
      "portable",
      ["PM-01", "PM-05"],
      "Split, lift, wrap, and replacement fitting/rejection.",
    ],
    "test/test-trans.ts": [
      "portable",
      ["PM-01", "PM-02", "PM-04", "PM-05"],
      "Main structural editing oracle across insertion, deletion, marks, wrapping, and joining.",
    ],
    "test/trans.ts": [
      "harness",
      ["PM-15"],
      "Transform assertion and fixture helper only.",
    ],
  },
  state: {
    "test/state.ts": [
      "harness",
      ["PM-15"],
      "Editor-state fixture helper only.",
    ],
    "test/test-selection.ts": [
      "portable",
      ["PM-06"],
      "Selection mapping through insert, replace, delete, and leaf/block boundaries.",
    ],
    "test/test-state.ts": [
      "portable-mixed",
      ["PM-14"],
      "Transaction application behavior is portable; PM plugin-field/filter/append policy is not.",
    ],
  },
  view: {
    "test/view.ts": [
      "harness",
      ["PM-15"],
      "Browser editor, text-node, and flush helpers only.",
    ],
    "test/webtest-clipboard.ts": [
      "portable",
      ["PM-02", "PM-11"],
      "Clipboard context, wrappers, attrs, open slices, and text/HTML behavior.",
    ],
    "test/webtest-composition.ts": [
      "portable",
      ["PM-10"],
      "Composition lifecycle across browsers, marks, decorations, wrappers, and paragraphs.",
    ],
    "test/webtest-decoration.ts": [
      "portable",
      ["PM-12"],
      "Mapped decoration/widget behavior and cleanup through structural edits.",
    ],
    "test/webtest-domchange.ts": [
      "portable",
      ["PM-09", "PM-10"],
      "Native DOM mutation interpretation and ambiguous input routing.",
    ],
    "test/webtest-draw-decoration.ts": [
      "portable",
      ["PM-12"],
      "Rendered projection/widget locality and cleanup; plugin-facing authoring details route to Plate.",
    ],
    "test/webtest-draw.ts": [
      "portable-mixed",
      ["PM-12", "PM-14"],
      "Incremental DOM update behavior is portable; PM props/plugin views are not.",
    ],
    "test/webtest-endOfTextblock.ts": [
      "portable",
      ["PM-13"],
      "Line-edge, vertical, RTL, widget, and atom navigation behavior.",
    ],
    "test/webtest-markview.ts": [
      "portable-mixed",
      ["PM-12", "PM-14"],
      "Lifecycle and mutation laws are useful; MarkView public API is Plate-owned.",
    ],
    "test/webtest-nodeview.ts": [
      "portable-mixed",
      ["PM-12", "PM-14"],
      "Lifecycle, mutation, position, and decoration laws are useful; NodeView API is Plate-owned.",
    ],
    "test/webtest-selection.ts": [
      "portable",
      ["PM-06", "PM-13"],
      "DOM selection import/export, geometry, RTL, and atom/block movement.",
    ],
    "test/webtest-view.ts": [
      "portable-mixed",
      ["PM-13", "PM-14"],
      "DOM position/geometry is portable; PM prop/state/dispatch policy is not.",
    ],
  },
  keymap: {
    "test/test-keymap.ts": [
      "portable-mixed",
      ["PM-16"],
      "Key normalization and precedence are portable; raw key strings and PM commands are not.",
    ],
  },
  history: {
    "test/test-history.ts": [
      "portable",
      ["PM-07"],
      "Undo grouping, redo, selection restore, rebasing, and compression pressure.",
    ],
  },
  collab: {
    "test/test-collab.ts": [
      "portable",
      ["PM-08"],
      "Multi-peer convergence and history behavior under concurrent changes.",
    ],
    "test/test-rebase.ts": [
      "portable",
      ["PM-06", "PM-08"],
      "Concurrent local/remote mapping, deletion, wrapping, and mark behavior.",
    ],
  },
  commands: {
    "test/test-commands.ts": [
      "portable",
      ["PM-17"],
      "High-value command behavior across deletion, joining, splitting, marks, atoms, and bidi edges.",
    ],
  },
  gapcursor: {
    "test/test-gapcursor.ts": [
      "portable-mixed",
      ["PM-18"],
      "Gap selection validity and mapping are portable; PM subclass/plugin shape is not.",
    ],
  },
  "schema-list": {
    "test/test-commands.ts": [
      "portable-mixed",
      ["PM-19"],
      "List wrap/split/lift/sink behavior is Plate-owned and tied to one PM list shape.",
    ],
  },
  markdown: {
    "test/build.ts": [
      "harness",
      ["PM-15", "PM-20"],
      "Markdown fixture and round-trip helper only.",
    ],
    "test/test-custom-parser.ts": [
      "portable-mixed",
      ["PM-20"],
      "Custom token-to-schema mapping is useful; PM schema/type-name coupling is not.",
    ],
    "test/test-parse.ts": [
      "portable",
      ["PM-20"],
      "Markdown parse/serialize and escaping round-trip behavior.",
    ],
  },
  "test-builder": {
    "test/test-marks.ts": [
      "harness",
      ["PM-23"],
      "Test-builder tag and mark fixture behavior, not editor product behavior.",
    ],
  },
  changeset: {
    "test/test-changed-range.ts": [
      "portable-mixed",
      ["PM-21"],
      "Changed-range comparison is useful for a future review feature, not Plite transaction truth.",
    ],
    "test/test-changes.ts": [
      "portable-mixed",
      ["PM-21"],
      "Mapped change-span accumulation and metadata behavior for a future review feature.",
    ],
    "test/test-diff.ts": [
      "portable-mixed",
      ["PM-21"],
      "Bounded structural token diff behavior for a future review feature.",
    ],
    "test/test-merge.ts": [
      "portable-mixed",
      ["PM-21"],
      "Sequential change-set merge behavior for a future review feature.",
    ],
    "test/test-simplify.ts": [
      "portable-mixed",
      ["PM-21"],
      "Human-facing word-boundary simplification for a future review feature.",
    ],
  },
  search: {
    "test/test-query.ts": [
      "portable-mixed",
      ["PM-22"],
      "Search/replace query behavior is Plate-owned; numeric positions are not portable.",
    ],
    "test/test-search.ts": [
      "portable-mixed",
      ["PM-22"],
      "Mapped search state, highlighting, navigation, and replacement are Plate-owned.",
    ],
  },
};

const runGit = (root, ...args) =>
  execFileSync("git", ["-C", root, ...args], {
    encoding: "utf8",
  }).trim();

const lineOf = (source, node) =>
  source.getLineAndCharacterOfPosition(node.getStart(source)).line + 1;

const nodeName = (node, source) => {
  if (node.name?.getText) return node.name.getText(source);
  if (ts.isConstructorDeclaration(node)) return "constructor";
  if (ts.isCallSignatureDeclaration(node)) return "()";
  if (ts.isConstructSignatureDeclaration(node)) return "new()";
  if (ts.isIndexSignatureDeclaration(node)) return "[]";
  if (ts.isExportDeclaration(node)) {
    return (
      node.moduleSpecifier?.getText(source) ??
      node.exportClause?.getText(source)
    );
  }
  return "<anonymous>";
};

const declarationKind = (node) => {
  if (ts.isClassDeclaration(node)) return "class";
  if (ts.isInterfaceDeclaration(node)) return "interface";
  if (ts.isTypeAliasDeclaration(node)) return "type";
  if (ts.isEnumDeclaration(node)) return "enum";
  if (ts.isFunctionDeclaration(node)) return "function";
  if (ts.isVariableDeclaration(node)) return "variable";
  if (ts.isModuleDeclaration(node)) return "namespace";
  if (ts.isExportDeclaration(node)) return "re-export";
  if (ts.isMethodDeclaration(node) || ts.isMethodSignature(node))
    return "method";
  if (ts.isPropertyDeclaration(node) || ts.isPropertySignature(node))
    return "property";
  if (ts.isGetAccessorDeclaration(node)) return "getter";
  if (ts.isSetAccessorDeclaration(node)) return "setter";
  if (ts.isConstructorDeclaration(node)) return "constructor";
  if (ts.isCallSignatureDeclaration(node)) return "call-signature";
  if (ts.isConstructSignatureDeclaration(node)) return "construct-signature";
  if (ts.isIndexSignatureDeclaration(node)) return "index-signature";
  return ts.SyntaxKind[node.kind];
};

const hasModifier = (node, kind) =>
  Boolean(node.modifiers?.some((modifier) => modifier.kind === kind));

const collectDeclarations = (absolutePath, relativePath) => {
  const text = readFileSync(absolutePath, "utf8");
  const source = ts.createSourceFile(
    relativePath,
    text,
    ts.ScriptTarget.Latest,
    true,
    relativePath.endsWith(".js") ? ts.ScriptKind.JS : ts.ScriptKind.TS
  );
  const declarations = [];

  const addDeclaration = (node, owner = null, exported = false) => {
    declarations.push({
      owner,
      name: nodeName(node, source),
      kind: declarationKind(node),
      line: lineOf(source, node),
      exported:
        exported ||
        hasModifier(node, ts.SyntaxKind.ExportKeyword) ||
        ts.isExportDeclaration(node),
      default: hasModifier(node, ts.SyntaxKind.DefaultKeyword),
    });
  };

  for (const statement of source.statements) {
    if (ts.isImportDeclaration(statement)) continue;
    if (ts.isVariableStatement(statement)) {
      const exported = hasModifier(statement, ts.SyntaxKind.ExportKeyword);
      for (const declaration of statement.declarationList.declarations) {
        addDeclaration(declaration, null, exported);
      }
      continue;
    }
    if (
      ts.isClassDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      ts.isEnumDeclaration(statement) ||
      ts.isFunctionDeclaration(statement) ||
      ts.isModuleDeclaration(statement) ||
      ts.isExportDeclaration(statement)
    ) {
      addDeclaration(statement);
      if (
        ts.isClassDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement)
      ) {
        const owner = nodeName(statement, source);
        for (const member of statement.members) addDeclaration(member, owner);
      }
    }
  }

  const testNames = [];
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      (ts.isIdentifier(node.expression) ||
        ts.isPropertyAccessExpression(node.expression))
    ) {
      const callee = ts.isIdentifier(node.expression)
        ? node.expression.text
        : node.expression.name.text;
      const first = node.arguments[0];
      if (
        ["describe", "it", "test"].includes(callee) &&
        first &&
        (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first))
      ) {
        testNames.push({
          kind: callee,
          line: lineOf(source, node),
          name: first.text,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  return {
    lines: text.split(/\r?\n/).length,
    declarations,
    testNames,
  };
};

const fileRole = (path) => {
  if (/^src\/.*\.[cm]?[jt]sx?$/.test(path)) return "source";
  if (
    /^(test|tests|__tests__)\/.*\.[cm]?[jt]sx?$/.test(path) ||
    /\.(test|spec)\.[cm]?[jt]sx?$/.test(path)
  ) {
    return "test";
  }
  if (/^src\/README\.md$/.test(path)) return "api-doc-source";
  if (/^style\//.test(path)) return "public-style";
  if (path === "package.json") return "package-contract";
  if (/^(LICENSE|LICENCE|COPYING|NOTICE)/i.test(path)) return "license";
  if (path === "README.md") return "public-doc";
  if (/^demo\//.test(path)) return "demo";
  return "excluded-support";
};

const repositories = modules.map(([module, relativeRoot]) => {
  const root = resolve(workspace, relativeRoot);
  const tracked = runGit(root, "ls-files").split("\n").filter(Boolean);
  const files = tracked.map((path) => {
    const role = fileRole(path);
    const parseable =
      ["source", "test"].includes(role) && /\.[cm]?[jt]sx?$/.test(path);
    return {
      path,
      role,
      ...(parseable
        ? collectDeclarations(resolve(root, path), `${module}/${path}`)
        : {}),
    };
  });

  return {
    module,
    root,
    head: runGit(root, "rev-parse", "HEAD"),
    branch: runGit(root, "branch", "--show-current"),
    upstream: runGit(
      root,
      "rev-parse",
      "--abbrev-ref",
      "--symbolic-full-name",
      "@{upstream}"
    ),
    remote: runGit(root, "remote", "get-url", "origin"),
    clean: runGit(root, "status", "--porcelain") === "",
    files,
  };
});

const metaRoot = resolve(workspace, "../prosemirror");
const meta = {
  root: metaRoot,
  head: runGit(metaRoot, "rev-parse", "HEAD"),
  branch: runGit(metaRoot, "branch", "--show-current"),
  upstream: runGit(
    metaRoot,
    "rev-parse",
    "--abbrev-ref",
    "--symbolic-full-name",
    "@{upstream}"
  ),
  remote: runGit(metaRoot, "remote", "get-url", "origin"),
  clean: runGit(metaRoot, "status", "--porcelain") === "",
  files: runGit(metaRoot, "ls-files").split("\n").filter(Boolean),
};
const moduleSetRows = [
  `meta ${meta.head}`,
  ...repositories.map(
    (repository) => `${repository.module} ${repository.head}`
  ),
].sort();
const moduleSetCursor = `sha256:${createHash("sha256")
  .update(`${moduleSetRows.join("\n")}\n`)
  .digest("hex")}`;

const totals = repositories.reduce(
  (counts, repo) => {
    counts.repositories += 1;
    counts.trackedFiles += repo.files.length;
    for (const file of repo.files) {
      counts.roles[file.role] = (counts.roles[file.role] ?? 0) + 1;
      counts.declarations += file.declarations?.length ?? 0;
      counts.testNames += file.testNames?.length ?? 0;
    }
    return counts;
  },
  {
    repositories: 0,
    trackedFiles: 0,
    declarations: 0,
    testNames: 0,
    roles: {},
  }
);

const output = {
  generatedAt: new Date().toISOString(),
  moduleSetCursor,
  moduleSetRows,
  meta,
  repositories,
  totals,
};

const supportReason = (path) => {
  if (
    [
      ".gitignore",
      ".npmignore",
      ".npmrc",
      ".tern-project",
      "tsconfig.json",
    ].includes(path)
  ) {
    return "Repository/tool configuration; no editor runtime or public API semantics.";
  }
  if (path === "CHANGELOG.md") {
    return "Historical release log; current source and public documentation are authoritative.";
  }
  if (path === "CONTRIBUTING.md") {
    return "Contribution-process documentation; no editor architecture mechanism.";
  }
  return "Non-runtime repository support file with no editor architecture mechanism.";
};

const moduleConceptUnion = (module) => [
  ...new Set(Object.values(sourceConcepts[module] ?? {}).flat()),
];

const manifestRepositories = repositories.map((repo) => ({
  module: repo.module,
  root: repo.root,
  head: repo.head,
  branch: repo.branch,
  upstream: repo.upstream,
  remote: repo.remote,
  clean: repo.clean,
  files: repo.files.map((file) => {
    let conceptIds = [];
    let disposition = "mapped";
    let explanation;

    if (file.role === "source") {
      conceptIds = sourceConcepts[repo.module]?.[file.path] ?? [];
      explanation =
        "Implementation source; every top-level declaration and member inherits this file concept mapping.";
    } else if (file.role === "test") {
      conceptIds = [
        ...new Set([
          ...(testConcepts[repo.module]?.[file.path] ?? []),
          "PM-C56",
        ]),
      ];
      explanation =
        "Proof source; every extracted test declaration and test name inherits this behavior mapping.";
    } else if (file.role === "package-contract") {
      conceptIds = ["PM-C01", "PM-C63"];
      explanation =
        "Published package metadata, entry points, dependencies, and license contract.";
    } else if (file.role === "license") {
      conceptIds = ["PM-C01", "PM-C63"];
      explanation =
        "License provenance for source and portable test extraction.";
    } else if (file.role === "public-doc") {
      conceptIds = ["PM-C01", "PM-C63"];
      explanation =
        "Package-level public ownership and positioning documentation.";
    } else if (file.role === "api-doc-source") {
      conceptIds = [...new Set([...moduleConceptUnion(repo.module), "PM-C63"])];
      explanation =
        "Generated API-documentation source for the module implementation concepts.";
    } else if (file.role === "public-style") {
      conceptIds = ["PM-C57"];
      explanation = "Published DOM class and appearance contract.";
    } else {
      disposition = "excluded";
      explanation = supportReason(file.path);
    }

    if (["source", "test"].includes(file.role) && conceptIds.length === 0) {
      throw new Error(
        `Unmapped ${file.role} file: ${repo.module}/${file.path}`
      );
    }
    for (const conceptId of conceptIds) {
      if (!concepts[conceptId]) {
        throw new Error(
          `Unknown concept ${conceptId}: ${repo.module}/${file.path}`
        );
      }
    }

    return {
      path: file.path,
      role: file.role,
      disposition,
      explanation,
      conceptIds,
      lines: file.lines,
      testNames: file.testNames,
      declarations: file.declarations?.map((declaration) => ({
        ...declaration,
        conceptIds,
      })),
    };
  }),
}));

const metaFile = (path) => {
  if (path === "bin/pm" || path === "bin/pm.js") {
    return {
      path,
      role: "module-orchestration",
      disposition: "mapped",
      explanation:
        "Declares and operates the package constellation used as the full audit boundary.",
      conceptIds: ["PM-C01", "PM-C63"],
    };
  }
  if (
    path === "demo/demo.ts" ||
    path.startsWith("demo/bench/") ||
    path === "demo/index.html"
  ) {
    return {
      path,
      role: path.startsWith("demo/bench/") ? "benchmark" : "demo",
      disposition: "mapped",
      explanation: "Meta-repository product shell or benchmark consumer.",
      conceptIds: ["PM-C56", "PM-C58"],
    };
  }
  if (path === "demo/demo.css" || path === "demo/img.png") {
    return {
      path,
      role: "demo-asset",
      disposition: "mapped",
      explanation: "Asset consumed by the meta demo shell.",
      conceptIds: ["PM-C57", "PM-C58"],
    };
  }
  if (path.startsWith("demo/test/")) {
    return {
      path,
      role: "vendored-test-harness",
      disposition: "excluded",
      explanation:
        "Vendored Mocha harness asset, not a ProseMirror behavior test.",
      conceptIds: [],
    };
  }
  if (path === "LICENSE") {
    return {
      path,
      role: "license",
      disposition: "mapped",
      explanation: "Meta-repository license provenance.",
      conceptIds: ["PM-C01", "PM-C63"],
    };
  }
  if (path === "README.md" || path === "package.json") {
    return {
      path,
      role: path === "package.json" ? "package-contract" : "public-doc",
      disposition: "mapped",
      explanation: "Meta-repository module-boundary and launcher contract.",
      conceptIds: ["PM-C01", "PM-C63"],
    };
  }
  return {
    path,
    role: "support",
    disposition: "excluded",
    explanation:
      path === "demo/parent"
        ? "Empty demo marker; no runtime or architecture semantics."
        : "Repository governance, tool configuration, or static branding asset; no editor architecture mechanism.",
    conceptIds: [],
  };
};

const sourceManifest = {
  generatedAt: output.generatedAt,
  moduleSetCursor,
  moduleSetRows,
  concepts,
  meta: {
    ...meta,
    files: meta.files.map(metaFile),
  },
  repositories: manifestRepositories,
};

const manifestFiles = [
  ...sourceManifest.meta.files.map((file) => ({ scope: "meta", ...file })),
  ...sourceManifest.repositories.flatMap((repo) =>
    repo.files.map((file) => ({ scope: repo.module, ...file }))
  ),
];
const unexplained = manifestFiles.filter(
  (file) =>
    !file.explanation ||
    file.explanation.trim() === "" ||
    (file.disposition === "mapped" && file.conceptIds.length === 0)
);
if (unexplained.length) {
  throw new Error(
    `Unexplained manifest rows: ${unexplained
      .map((file) => `${file.scope}/${file.path}`)
      .join(", ")}`
  );
}

sourceManifest.totals = {
  repositories: repositories.length,
  metaTrackedFiles: sourceManifest.meta.files.length,
  moduleTrackedFiles: manifestRepositories.reduce(
    (count, repo) => count + repo.files.length,
    0
  ),
  trackedFiles: manifestFiles.length,
  sourceFiles: manifestFiles.filter((file) => file.role === "source").length,
  testFiles: manifestFiles.filter((file) => file.role === "test").length,
  declarations: manifestRepositories.reduce(
    (count, repo) =>
      count +
      repo.files.reduce(
        (fileCount, file) => fileCount + (file.declarations?.length ?? 0),
        0
      ),
    0
  ),
  testNames: manifestRepositories.reduce(
    (count, repo) =>
      count +
      repo.files.reduce(
        (fileCount, file) => fileCount + (file.testNames?.length ?? 0),
        0
      ),
    0
  ),
  mappedFiles: manifestFiles.filter((file) => file.disposition === "mapped")
    .length,
  excludedFiles: manifestFiles.filter((file) => file.disposition === "excluded")
    .length,
  unexplainedFiles: unexplained.length,
};

await writeFormatted(
  resolve(outputRoot, "prosemirror-raw-inventory.json"),
  `${JSON.stringify(output, null, 2)}\n`
);
await writeFormatted(
  resolve(outputRoot, "prosemirror-source-manifest.json"),
  `${JSON.stringify(sourceManifest, null, 2)}\n`
);

const declarationMarkdown = [
  "# ProseMirror raw declaration index",
  "",
  `Generated from ${totals.repositories} package repositories, ${
    totals.roles.source ?? 0
  } source files, and ${totals.declarations} source/test declarations.`,
  "",
];

for (const repo of repositories) {
  declarationMarkdown.push(`## ${repo.module}`, "");
  for (const file of repo.files.filter((item) => item.role === "source")) {
    declarationMarkdown.push(
      `### ${repo.module}/${file.path}`,
      "",
      ...file.declarations.map(
        (declaration) =>
          `- ${declaration.line}: ${declaration.exported ? "export " : ""}${
            declaration.kind
          } ${declaration.owner ? `${declaration.owner}.` : ""}${
            declaration.name
          }`
      ),
      ""
    );
  }
}

await writeFormatted(
  resolve(outputRoot, "prosemirror-raw-declarations.md"),
  `${declarationMarkdown.join("\n")}\n`
);

const harvestedTests = repositories.flatMap((repo) =>
  repo.files
    .filter((file) => file.role === "test")
    .map((file) => {
      const classification = testClassifications[repo.module]?.[file.path];
      if (!classification) {
        throw new Error(
          `Unclassified harvested test: ${repo.module}/${file.path}`
        );
      }
      const [category, behaviorRows, reason] = classification;
      return {
        module: repo.module,
        commit: repo.head,
        source: `${relative(workspace, repo.root)}/${file.path}`,
        path: file.path,
        lines: file.lines,
        testNames: file.testNames,
        category,
        behaviorRows,
        reason,
      };
    })
);
const categoryCounts = harvestedTests.reduce((counts, testFile) => {
  counts[testFile.category] = (counts[testFile.category] ?? 0) + 1;
  return counts;
}, {});
const harvestNameCount = harvestedTests.reduce(
  (count, file) => count + file.testNames.length,
  0
);
if (harvestedTests.length !== 47 || harvestNameCount !== 1369) {
  throw new Error(
    `Unexpected harvest totals: ${harvestedTests.length} files, ${harvestNameCount} names`
  );
}

const harvestRoot = resolve(
  workspace,
  "docs/editor-test-harvester/prosemirror"
);
const inventoryMarkdown = [
  "# ProseMirror test inventory",
  "",
  "Source boundary: all 19 package repositories declared by the ProseMirror meta launcher.",
  "",
  "Immutable commits and license evidence: `docs/plans/artifacts/multi-editor-full-architecture-audit/prosemirror-provenance.md`.",
  "",
  `Module-set cursor: \`${moduleSetCursor}\`.`,
  "",
  "## Counts",
  "",
  "| Metric | Count |",
  "| --- | ---: |",
  `| Source test/support files | ${harvestedTests.length} |`,
  "| Named `describe`/`it`/`test` rows | " + harvestNameCount + " |",
  `| Classified files | ${harvestedTests.length} |`,
  "| Unresolved files | 0 |",
  `| Portable | ${categoryCounts.portable ?? 0} |`,
  `| Portable-mixed | ${categoryCounts["portable-mixed"] ?? 0} |`,
  `| Harness/support | ${categoryCounts.harness ?? 0} |`,
  "",
  "## File rows",
  "",
  "| Source | Commit | Lines | Names | Category | Behavior rows | Reason |",
  "| --- | --- | ---: | ---: | --- | --- | --- |",
  ...harvestedTests.map(
    (file) =>
      `| \`${file.source}\` | \`${file.commit.slice(0, 12)}\` | ${
        file.lines
      } | ${file.testNames.length} | ${
        file.category
      } | ${file.behaviorRows.join(", ")} | ${file.reason} |`
  ),
  "",
  "## Negative controls",
  "",
  "- Meta `demo/test/mocha.css` and `demo/test/mocha.js` are vendored harness assets, not source behavior tests.",
  "- Module build configuration, changelogs, READMEs, and package metadata are architecture/provenance inputs, not test inventory rows.",
  "- `harness` rows remain indexed so the inventory is closed, but they do not create product behavior work.",
  "- `portable-mixed` means the behavior is useful while the ProseMirror representation, owner, or public API is explicitly rejected.",
  "",
];
await writeFormatted(
  resolve(harvestRoot, "inventory.md"),
  `${inventoryMarkdown.join("\n")}\n`
);

const testIndexMarkdown = [
  "# ProseMirror test-name index",
  "",
  "Source boundary: all 19 package repositories declared by the ProseMirror meta launcher.",
  "",
  "Extraction: TypeScript AST walk of string-literal `describe`, `it`, and `test` calls.",
  "",
  `Total source files: ${harvestedTests.length}`,
  "",
  `Total extracted names: ${harvestNameCount}`,
  "",
];
for (const file of harvestedTests) {
  testIndexMarkdown.push(
    `## ${file.source}`,
    "",
    `Commit: \`${file.commit}\`  `,
    `Category: ${file.category}  `,
    `Behavior rows: ${file.behaviorRows.join(", ")}  `,
    `Names: ${file.testNames.length}`,
    "",
    ...(file.testNames.length
      ? file.testNames.map(
          (testName) =>
            `- ${testName.line}: ${testName.kind} — ${testName.name}`
        )
      : ["- No named test calls; support/harness file."]),
    ""
  );
}
await writeFormatted(
  resolve(harvestRoot, "test-index.md"),
  `${testIndexMarkdown.join("\n")}\n`
);
