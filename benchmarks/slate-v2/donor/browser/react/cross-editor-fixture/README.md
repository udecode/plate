# Cross-editor fixture inputs

This directory pins the published dependencies used by
`../huge-document-cross-editor.mjs`. Run commands from the Plate repository root
with its dependencies and Playwright Chromium installed. The runner uses the
repository's existing build tools and reads local Plate/Plite source.

```sh
fixture="$PWD/benchmarks/slate-v2/donor/browser/react/cross-editor-fixture"
npm ci --prefix "$fixture"
```

The fixture has 27 exact direct dependencies and 97 locked package entries. It
includes React 19.2.8, Lexical 0.50.0, Tiptap 3.31.3, ProseMirror view 1.42.3,
history 1.5.0 and Quill 2.0.3. The lock pins transitive dependencies and integrity
hashes. The runner reads Slate, Quill, Wordgard and ProseKit from source;
installing their published packages does not select their source revision.

## Reproduce the recorded reference revisions

Use existing sibling Git object stores. These commands export source into a
temporary directory without changing a sibling checkout. The four commits must
already exist locally; `git cat-file -e` fails before export if one is missing.

```sh
export CROSS_EDITOR_HUGE_WORDGARD_REF=76a37ab961b19cb349de3a66e6e2e3f77896fac9
export CROSS_EDITOR_HUGE_PROSEKIT_REF=9ce6e9860b4b04fdb011e8ba3548b8305f67afd5
export CROSS_EDITOR_HUGE_SLATE_REF=945a484df2497e4c448b33f417b0de2a49840032
export CROSS_EDITOR_HUGE_QUILL_REF=539cbffd0a13b18e9c65eb84dd35e6596e403158

git -C ../wordgard cat-file -e "$CROSS_EDITOR_HUGE_WORDGARD_REF^{commit}"
git -C ../prosekit cat-file -e "$CROSS_EDITOR_HUGE_PROSEKIT_REF^{commit}"
git -C ../slate cat-file -e "$CROSS_EDITOR_HUGE_SLATE_REF^{commit}"
git -C ../quill cat-file -e "$CROSS_EDITOR_HUGE_QUILL_REF^{commit}"

benchmark_sources=$(mktemp -d "${TMPDIR:-/tmp}/cross-editor-sources.XXXXXX")
export CROSS_EDITOR_HUGE_WORDGARD_REPO="$benchmark_sources/wordgard"
export CROSS_EDITOR_HUGE_PROSEKIT_REPO="$benchmark_sources/prosekit"
export CROSS_EDITOR_HUGE_SLATE_REPO="$benchmark_sources/slate"
export CROSS_EDITOR_HUGE_QUILL_REPO="$benchmark_sources/quill"
mkdir "$CROSS_EDITOR_HUGE_WORDGARD_REPO" "$CROSS_EDITOR_HUGE_PROSEKIT_REPO" \
  "$CROSS_EDITOR_HUGE_SLATE_REPO" "$CROSS_EDITOR_HUGE_QUILL_REPO"

git -C ../wordgard archive -o "$benchmark_sources/wordgard.tar" "$CROSS_EDITOR_HUGE_WORDGARD_REF"
git -C ../prosekit archive -o "$benchmark_sources/prosekit.tar" "$CROSS_EDITOR_HUGE_PROSEKIT_REF"
git -C ../slate archive -o "$benchmark_sources/slate.tar" "$CROSS_EDITOR_HUGE_SLATE_REF"
git -C ../quill archive -o "$benchmark_sources/quill.tar" "$CROSS_EDITOR_HUGE_QUILL_REF"
tar -xf "$benchmark_sources/wordgard.tar" -C "$CROSS_EDITOR_HUGE_WORDGARD_REPO"
tar -xf "$benchmark_sources/prosekit.tar" -C "$CROSS_EDITOR_HUGE_PROSEKIT_REPO"
tar -xf "$benchmark_sources/slate.tar" -C "$CROSS_EDITOR_HUGE_SLATE_REPO"
tar -xf "$benchmark_sources/quill.tar" -C "$CROSS_EDITOR_HUGE_QUILL_REPO"

CROSS_EDITOR_HUGE_SURFACES=plite,plate,slate,lexical,prosemirror,tiptap,quill,wordgard,prosekit \
CROSS_EDITOR_HUGE_BLOCKS=100 \
CROSS_EDITOR_HUGE_WARMUPS=1 \
CROSS_EDITOR_HUGE_ITERATIONS=1 \
CROSS_EDITOR_HUGE_ARTIFACT=tmp/cross-editor-portability-smoke.json \
node benchmarks/slate-v2/donor/browser/react/huge-document-cross-editor.mjs
```

One iteration checks operation coverage and correctness oracles. It does not
establish performance percentiles. Copy the operation list, cohort sizes,
iterations, compiler arms and browser from the original artifact when repeating
a measured packet. A source revision alone does not reproduce local Plate edits,
browser versions, machine load or generated bundles; compare the artifact's
source hashes, dependency lock, bundle hashes and environment receipts too.

The plain paragraph/bold/history ProseKit fixture shares these pinned
ProseMirror dependencies. It does not exercise ProseKit's Yjs integration or
its collaboration-specific patches.

## Select current upstream source

For a separate experiment, resolve upstream HEAD and fetch that exact object into
the existing sibling repository. This updates its Git object store and
`FETCH_HEAD`; it does not switch or edit its checkout. Run the export and benchmark
commands above after replacing the desired reference variables. Preserve the
previous packet and use a new artifact filename.

```sh
export CROSS_EDITOR_HUGE_WORDGARD_REF=$(git -C ../wordgard ls-remote origin HEAD | awk '{print $1}')
export CROSS_EDITOR_HUGE_PROSEKIT_REF=$(git -C ../prosekit ls-remote origin HEAD | awk '{print $1}')
test -n "$CROSS_EDITOR_HUGE_WORDGARD_REF"
test -n "$CROSS_EDITOR_HUGE_PROSEKIT_REF"
git -C ../wordgard fetch --no-tags origin "$CROSS_EDITOR_HUGE_WORDGARD_REF"
git -C ../prosekit fetch --no-tags origin "$CROSS_EDITOR_HUGE_PROSEKIT_REF"
```

Without source path overrides, the runner uses `../wordgard`, `../prosekit`,
`../slate` and `../quill`. Lexical uses the fixture's published source unless
`CROSS_EDITOR_HUGE_LEXICAL_REPO` selects a source checkout. Set
`CROSS_EDITOR_HUGE_DEPS` to use a different fixture directory.

An archive's `declaredRef` records the explicit `*_REF` value; it is not a claim
that Git verified the extracted directory. A Git checkout records its observed
`ref`. Frozen input hashes describe the bytes bundled in either case, and the
runner checks those bytes for drift before closing the artifact. Do not reuse a
declared ref after editing an export.
