# Yjs Hocuspocus Soak Reproductions

## Preconditions

- Start the Hocuspocus server: `bun start:yjs`
- Start the examples site on port 3100.
- Open target page: `http://localhost:3100/examples/yjs-hocuspocus`
- The page must render four editors: Peer A, Peer B, Peer C, Peer D.
- Each peer must expose these controls with `data-test-id="yjs-peer-${peer}-${action}"`:
  `select`, `mark-bold`, `disconnect`, `connect`, `reconcile`, `undo`,
  `redo`, `append`, `replace`, `remove-node`, `split-node`, `merge-node`,
  `move-down`, `set-node`, `unset-node`, `wrap-node`, `unwrap`, `lift`,
  `insert-fragment`, `delete-fragment`, `delete-backward`, `insert-text`,
  `move`.

## Full Soak Command

```sh
SOAK_URL='http://localhost:3100/examples/yjs-hocuspocus' \
SOAK_MS=10800000 \
SOAK_ACTION_DELAY_MS=1000 \
SOAK_REPORT_EVERY_MS=60000 \
SOAK_RUN_ID=hocuspocus-3h-20260609-231052 \
SOAK_START_SERVER=0 \
bun scripts/proof/yjs-collaboration-soak.mjs
```

Run output:

- Summary: `test-results/yjs-collaboration-soak/hocuspocus-3h-20260609-231052/summary.md`
- Event log: `test-results/yjs-collaboration-soak/hocuspocus-3h-20260609-231052/events.jsonl`
- Duration: 10,806,341 ms
- Actions: 9,228
- Iterations: 980
- Issues: 17

## Reproductions

Each sequence starts from a fresh `http://localhost:3100/examples/yjs-hocuspocus?room=<new-room>` page load.

### Awareness Selection Missing

Actions:

```text
a:select
```

Observed cursor text:

```text
remote:none | remote:none | remote:none | remote:none
```

### Random Control 5 Non-Convergence

Actions:

```text
a:redo -> a:remove-node -> c:insert-fragment -> b:wrap-node -> a:disconnect -> a:merge-node -> b:mark-bold -> a:remove-node -> b:delete-fragment -> d:insert-text -> d:insert-fragment -> d:unset-node -> c:move -> d:delete-backward -> a:connect -> b:connect -> c:connect -> d:connect -> a:reconcile
```

Observed peer block texts:

```json
[[" world!Ken fragment!Eve fragment"],[" world!Ken fragment!Eve fragment"],[" world!Ken fragment!Eve fragment"],[" world!Ken fragment!Eve fragmen"]]
```

### Random Control 31 Non-Convergence

Actions:

```text
a:insert-text -> a:move-down -> a:move-down -> c:append -> b:insert-fragment -> d:reconcile -> d:delete-fragment -> a:reconcile -> b:move-down -> c:split-node -> d:reconcile -> a:move -> c:reconcile -> c:delete-fragment -> a:connect -> b:connect -> c:connect -> d:connect -> a:reconcile
```

Observed peer block texts:

```json
[["d","d","!! KenLin fragment","d","block 2"],["d","d","!! KenLin fragment","d","block 2"],["d"," world","!! KenLin fragment"," world","block 2"],["d","d","!! KenLin fragment","d","block 2"]]
```

### Random Control 35 Non-Convergence

Actions:

```text
a:delete-backward -> d:reconcile -> c:move-down -> b:undo -> b:unset-node -> c:undo -> d:wrap-node -> d:remove-node -> a:remove-node -> d:undo -> c:unwrap -> d:redo -> a:redo -> d:move -> a:connect -> b:connect -> c:connect -> d:connect -> a:reconcile
```

Observed peer block texts:

```json
[["Hello world"],["Hello world"],["Hello world","block 2"],["Hello world"]]
```

### Random Control 41 Non-Convergence

Actions:

```text
b:reconcile -> d:wrap-node -> c:lift -> a:wrap-node -> b:connect -> b:move-down -> c:connect -> b:unset-node -> d:connect -> c:append -> d:unset-node -> d:wrap-node -> d:delete-fragment -> c:insert-text -> a:connect -> b:connect -> c:connect -> d:connect -> a:reconcile
```

Observed peer block texts:

```json
[[" world! Ken!"," world! Ken!"," world! Ken!"],[" world! Ken!"," world! Ken!"," world! Ken!"],[" world! Ken!"," world! Ken"," world! Ken"],[" world! Ken!"," world! Ken!"," world! Ken!"]]
```

### Random Control 42 Non-Convergence

Actions:

```text
b:insert-text -> c:wrap-node -> b:append -> b:split-node -> d:reconcile -> d:move -> c:remove-node -> c:insert-text -> a:connect -> d:disconnect -> c:merge-node -> c:unwrap -> d:remove-node -> a:remove-node -> a:connect -> b:connect -> c:connect -> d:connect -> a:reconcile
```

Observed peer block texts:

```json
[["Hello wo"],["Hello wo"],["Hello wo","rld!! Lin!"],["Hello wo"]]
```

### Random Control 43 Page Error

Actions:

```text
b:merge-node -> b:unwrap -> a:move-down -> d:append -> b:insert-text -> b:wrap-node -> c:move-down -> d:set-node -> b:reconcile -> a:move-down -> a:redo -> a:insert-fragment
```

Observed page error:

```text
Yjs parent is text at path 0.0
```

### Random Control 58 Non-Convergence

Actions:

```text
b:replace -> c:move-down -> a:reconcile -> b:move-down -> a:connect -> a:move -> b:insert-text -> a:set-node -> c:wrap-node -> c:insert-text -> c:wrap-node -> b:delete-fragment -> d:disconnect -> c:split-node -> a:connect -> b:connect -> c:connect -> d:connect -> a:reconcile
```

Observed peer block texts:

```json
[["anonical snapshot.!!","anonical s","anonical s","block 2"],["anonical snapshot.!!","anonical s","anonical s","block 2"],["anonical snapshot.!!","anonical snapshot.!!","anonical snapshot.!!","block 2"],["anonical snapshot.!!","anonical s","anonical s","block 2"]]
```

### Random Control 68 Non-Convergence

Actions:

```text
b:delete-backward -> b:wrap-node -> c:move -> c:connect -> a:move -> c:lift -> a:unset-node -> c:wrap-node -> a:insert-fragment -> c:connect -> c:move-down -> d:split-node -> d:lift -> c:move-down -> a:connect -> b:connect -> c:connect -> d:connect -> a:reconcile
```

Observed peer block texts:

```json
[["Hello","Hello"," worldAda fragment","Hello"],["Hello","Hello"," worldAda fragment","Hello"],[" worldAda fragment","Hello","Hello"],["Hello","Hello"," worldAda fragment","Hello"]]
```

### Random Control 75 Non-Convergence

Actions:

```text
b:insert-text -> a:delete-backward -> b:undo -> c:insert-fragment -> c:disconnect -> d:split-node -> d:unwrap -> a:move -> a:delete-backward -> d:merge-node -> b:redo -> c:unset-node -> d:delete-fragment -> d:merge-node -> a:connect -> b:connect -> c:connect -> d:connect -> a:reconcile
```

Observed peer block texts:

```json
[["!Ken fragmenHello ",""],["!Ken fragmenHello ",""],["!Ken fragmenHello ",""],["!Ken fragmenHello "]]
```

### Random Control 85 Non-Convergence

Actions:

```text
b:reconcile -> a:move-down -> a:merge-node -> d:replace -> c:move -> b:connect -> c:move-down -> b:split-node -> c:unset-node -> d:append -> b:delete-fragment -> b:insert-fragment -> d:remove-node -> d:move-down -> a:connect -> b:connect -> c:connect -> d:connect -> a:reconcile
```

Observed peer block texts:

```json
[["Lin fragment","Lin fragment","Lin fragment","Eve canonical snapshot."],["Lin fragment","Lin fragment","Lin fragment","Eve canonical snapshot."],["Lin fragment","Lin fragment","Lin fragment","Eve canonical snapshot."],["Eve canonical snapshot.","Lin fragment"]]
```

### Random Control 91 Page Error

Actions:

```text
b:replace -> a:append -> a:mark-bold -> c:append -> d:move-down -> a:insert-text -> c:replace -> d:connect -> c:undo -> c:insert-fragment -> b:redo -> b:move-down -> c:move -> c:delete-backward
```

Observed page error:

```text
No Yjs node at path 0.1
```

### Offline Structural Mix 99 Non-Convergence

Actions:

```text
b:disconnect -> b:delete-fragment -> c:split-node -> b:move-down -> c:append -> b:move-down -> d:split-node -> b:merge-node -> c:split-node -> b:connect -> a:connect -> b:connect -> c:connect -> d:connect -> a:reconcile
```

Observed peer block texts:

```json
[["block 2","","llo","  Ken","world!"],["\uFEFFblock 2","","llo","  Ken","world!"],["block 2","","llo","  Ken","world!"],["block 2","","llo","  Ken","world!"]]
```

## 2026-06-10 Hocuspocus 3h Rerun

Command:

```sh
SOAK_URL='http://localhost:3100/examples/yjs-hocuspocus' \
SOAK_MS=10800000 \
SOAK_ACTION_DELAY_MS=1000 \
SOAK_REPORT_EVERY_MS=60000 \
SOAK_RUN_ID=hocuspocus-3h-restart-20260610-192303 \
SOAK_START_SERVER=0 \
bun scripts/proof/yjs-collaboration-soak.mjs
```

Run output:

- Summary: `test-results/yjs-collaboration-soak/hocuspocus-3h-restart-20260610-192303/summary.md`
- Event log: `test-results/yjs-collaboration-soak/hocuspocus-3h-restart-20260610-192303/events.jsonl`
- Duration: 10,853,717 ms
- Actions: 7,128
- Iterations: 756
- Issues: 1

### Offline Undo Remote Split Redo Page Error

Actions:

```text
a:disconnect -> a:split-node -> a:undo -> b:insert-text -> b:split-node -> a:connect -> a:redo
```

Observed page error:

```text
Cannot redo split_node because the right text is no longer at the split boundary.
```

### Random Control 116 Non-Convergence

Actions:

```text
b:move-down -> a:reconcile -> c:insert-fragment -> b:connect -> c:unwrap -> b:merge-node -> d:lift -> b:set-node -> b:insert-text -> a:replace -> c:remove-node -> a:set-node -> c:replace -> c:unset-node -> a:connect -> b:connect -> c:connect -> d:connect -> a:reconcile
```

Observed peer block texts:

```json
[["Ken canonical snapshot.",""],["Ken canonical snapshot.",""],["Ken canonical snapshot."],["Ken canonical snapshot.",""]]
```

### Random Control 131 Non-Convergence

Actions:

```text
b:merge-node -> c:replace -> c:set-node -> d:mark-bold -> a:split-node -> a:delete-backward -> c:set-node -> d:set-node -> d:lift -> b:move-down -> a:unwrap -> a:mark-bold -> b:merge-node -> b:split-node -> a:connect -> b:connect -> c:connect -> d:connect -> a:reconcile
```

Observed peer block texts:

```json
[["n"," canonical snapshot.K",""],["n"," canonical snapshot.K"],["n"," canonical snapshot.K",""],["n"," canonical snapshot.K",""]]
```
