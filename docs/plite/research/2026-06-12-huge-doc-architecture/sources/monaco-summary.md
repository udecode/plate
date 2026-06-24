# Monaco Summary

The shallow `microsoft/monaco-editor` clone was inspected and rejected for this
packet. It is useful for public package/API surfaces, but the local source did
not expose enough internal viewport/height-map architecture to cite as a strong
engine reference.

Decision:

Do not spend this packet cloning the larger VS Code editor internals. CodeMirror
already supplied the architecture invariants needed to produce a concrete
Plite-native proof action.

