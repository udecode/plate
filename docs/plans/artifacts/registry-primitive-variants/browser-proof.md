# Browser proof

## Installed Base consumer

The final browser replay used a temporary shadcn 4.19 Vite consumer with the
installed Base author files. The harness imports the four flat installed
targets and typechecks through `tsconfig.harness.json` before runtime proof.

After the neutral focus-lifecycle hard cut, Chrome loaded a fresh final harness
at `http://localhost:5173/?final-focus-api=2` before the replay.

| Interaction | Final result |
| --- | --- |
| Toolbar dropdown opens | `overlay:open`; `Toolbar action` visible |
| Toolbar dropdown closes with Escape | `overlay:closed`; focus returns to `Toolbar menu` |
| Floating popover opens | `Base popover content` visible |
| Floating popover closes with Escape | content removed; focus returns to `Toggle Base popover` |
| Standalone dropdown opens | `Base dropdown action` visible |
| Standalone dropdown closes with Escape | focus returns to `Open Base dropdown` |
| Context menu opens by right-click | `Base context action` visible |
| Context menu closes with Escape | menu removed; close-focus callback records `context:closed` |

Each open assertion returned exactly one target. The final DOM had every menu
and popover closed, `overlay:closed`, and `context:closed`. Logs created after
the fresh navigation contained only Vite's connect/connected debug messages:
zero page warnings or errors. The prior full network trace saw zero
`Network.loadingFailed` events and zero HTTP responses at or above 400 across
48 events; the final Base and Radix CLI refreshes independently completed every
registry request without an install failure.

## Plate demo

`http://localhost:3000/blocks/floating-toolbar-demo` rendered successfully.
Double-clicking editor text opened a second toolbar. Its `Bulleted list`
dropdown rendered the complete radio-menu content and closed with Escape.

Chrome's Dark Reader injection caused one hydration mismatch in the demo. The
diff identifies the injected `darkreader` style as the cause. No provider
adapter runtime error occurred.

`/blocks/table-demo` cannot serve as final proof in this checkout because
current unrelated editor-schema work rejects an `id` property in the demo
document. The route also reports an unrelated Next uncached-data prerender
diagnostic.

## Route caveat

Both in-app Browser and Chrome block top-level navigation to the registry JSON
download routes before the app receives the request. Route status and payload
proof therefore comes from the registry response tests, generated payload
inspection, `curl`, and the successful shadcn CLI installs rather than a JSON
browser tab.
