# ProseMirror audit provenance

## Boundary

The target is not one repository. The clean `../prosemirror` checkout is a
launcher, issue tracker, demo, and benchmark shell. Its declared development
graph is the 19 package repositories listed by
`../prosemirror/bin/pm.js:9-13`. The meta README states the same ownership split
at `../prosemirror/README.md:11-18`.

This audit follows all 19 declared editor modules. The website is separately
declared by the launcher, but the exact configured remote
`https://code.haverbeke.berlin/prosemirror/` returned `remote: Not found`. It is
a documentation/example product shell, not an editor runtime package. Current
package API documentation is still covered through every package's README and
`src/README.md`. The inaccessible website is therefore a recorded evidence
limit, not a silently omitted architecture lane.

## Immutable cursor

Composite module-set cursor:
`sha256:8a8158142c4d7f27635ad76eb698113183f6da1a9b453e81f2d275b8a5a86c84`.
It is the SHA-256 of the sorted newline-delimited
`<module> <full-commit>` rows below, including `meta`, with one trailing
newline. The individual full commits remain authoritative; the digest is the
single equality key for incremental audit/test synchronization.

| Scope         | Commit                                     | Branch   | Upstream        | Remote                                                                    |
| ------------- | ------------------------------------------ | -------- | --------------- | ------------------------------------------------------------------------- |
| meta          | `c7f2f1d7bde70728dfedaa68ca8f5fc3dffa17cc` | `master` | `origin/master` | `https://github.com/ProseMirror/prosemirror.git`                          |
| model         | `bc912ea0ff8ac935c7f1dc3cf029cd0b6ecdda97` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-model.git`         |
| transform     | `8fecfa62dc8c816ef3ddd54427e6585418720f63` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-transform.git`     |
| state         | `57d4a96286ca972125a18a56ecd6d2b00927de30` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-state.git`         |
| view          | `c752c6ef7225199f73cb433dd3179e7d69b840d8` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-view.git`          |
| keymap        | `d60e2447d63374d7612121675e9e7fa9ccfb2eb0` | `master` | `origin/master` | `https://github.com/ProseMirror/prosemirror-keymap.git`                   |
| inputrules    | `ea304c0f91a1f2409f17519066fb46c370a78517` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-inputrules.git`    |
| history       | `768b74205ad59919ed54d75e197312964ddcf3c2` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-history.git`       |
| collab        | `19ad580996ba404d81cd51968c547665b5948e5c` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-collab.git`        |
| commands      | `52a84a842774fadec3b167bcdbd56085ec6c85df` | `master` | `origin/master` | `https://github.com/ProseMirror/prosemirror-commands.git`                 |
| gapcursor     | `2ea9ca9d7aadc3a9ce8ac279f4ff869d0320a216` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-gapcursor.git`     |
| schema-basic  | `6daea265c3983a04f272f510b99493868919d374` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-schema-basic.git`  |
| schema-list   | `d5515fe14169373c3f4ae73d2a82c13b50c6486e` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-schema-list.git`   |
| menu          | `fae4f6f74aa06cdbd0e425871542876bdc42a26d` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-menu.git`          |
| example-setup | `731657f47ed928ed80a1fdba96a2e5e73e4ee612` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-example-setup.git` |
| markdown      | `221ec60e26bc72005cacdbfc4f0ee43fda143489` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-markdown.git`      |
| dropcursor    | `061f64ac887a9fac2bf5ef36d31ad4d13a4ecd36` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-dropcursor.git`    |
| test-builder  | `a76003ea1ed08993d4e523ad990bf39058b0cbe3` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-test-builder.git`  |
| changeset     | `e215757276357b64cf74f536552f3a5ef292fa1a` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-changeset.git`     |
| search        | `ff1148a339bb7daa9d7b02dff9614b9d7123f552` | `main`   | `origin/main`   | `https://code.haverbeke.berlin/prosemirror/prosemirror-search.git`        |

All 20 audited checkouts were clean at intake. The generated source manifest
records the same cursor and a per-repository `clean` field so closure can detect
drift.

## License and extraction policy

The meta repository and every audited package declare MIT. The license grants
use, copying, modification, and distribution subject to retaining the notice
(`../prosemirror/LICENSE:1-18`). Portable test names and behavior descriptions
therefore live under the stable permissive-source path
`docs/editor-test-harvester/prosemirror/`.

The harvest copies no implementation body. It records file paths, short test
names, behavioral invariants, owner decisions, and current Plite/Plate proof
targets.

## Mechanical closure

`prosemirror-build-inventory.mjs` walks `git ls-files` in every declared package,
parses TypeScript/JavaScript declarations and test names, and writes:

- `prosemirror-raw-inventory.json`
- `prosemirror-raw-declarations.md`
- `prosemirror-source-manifest.json`

Current manifest totals:

| Metric                                      |             Count |
| ------------------------------------------- | ----------------: |
| Repositories                                | 20 including meta |
| Tracked files                               |               330 |
| Package implementation files                |                74 |
| Package test/support files                  |                47 |
| Parsed source/test declarations and members |             2,180 |
| Extracted `describe`/`it`/`test` names      |             1,369 |
| Mapped files                                |               214 |
| Explicitly excluded support files           |               116 |
| Unexplained files                           |                 0 |

The exclusions are governance, release history, tool configuration, branding,
or vendored harness assets. Every implementation file, test file, package
contract, public API document, stylesheet, demo, and benchmark has an explicit
concept mapping.
