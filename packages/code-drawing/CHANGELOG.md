# @platejs/code-drawing

## 54.0.0-beta.2

### Major Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Require React and React DOM 19.2 or newer.

  Insert code drawings through the descriptor's standard `editor.plugin(BaseCodeDrawingPlugin).update.insert(props?, nodeOptions?)` update. The compiled schema owns the complete default drawing data and versioned inline validation. Persist flat `code`, lowercase `language`, and `view` fields instead of an opaque `data` object with display-label enum values. The plugin also owns its Markdown MDX codec, so code-drawing data round-trips through Markdown without falling through the generic unreachable-node path. The capability name, command namespace, and default persisted element type are all `codeDrawing`. The MDX tag follows the resolved application schema type. Use `PLUGINS.codeDrawing` for the capability name instead of `CODE_DRAWING_KEY`.

  **Migration:** Replace direct `insertCodeDrawing` calls with the installed plugin update. Pass `at` as the second argument for an explicit location. MDX attributes cannot replace code-drawing children or its resolved schema type.

### Patch Changes

- [#5036](https://github.com/udecode/plate/pull/5036) by [@zbeyens](https://github.com/zbeyens) – Compile React package output for React 19 and use its built-in Compiler runtime.

## 53.0.0

## 52.3.10

### Patch Changes

- [#4897](https://github.com/udecode/plate/pull/4897) by [@zbeyens](https://github.com/zbeyens) – Fix declaration bundling by restoring the workspace `platejs` build edge during package builds

## 52.3.0

### Minor Changes

- [#4811](https://github.com/udecode/plate/pull/4811) by [@electroluxcode](https://github.com/electroluxcode) – Add code drawing plugin with inline editing support for PlantUML, Graphviz, Flowchart, and Mermaid diagrams
