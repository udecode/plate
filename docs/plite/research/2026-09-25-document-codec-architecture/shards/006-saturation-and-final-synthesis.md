# Shard 006: saturation and final synthesis

## Scope

Resolve browser and Node HTML runtimes, challenge the final API for hidden
machinery, and close the research stop rule.

## Server HTML candidates

Tiptap's happy-dom precedent was implemented as one isolated Window per
operation with JavaScript, network, CSS, iframe, and computed-style features
disabled. Normal and large cohorts passed latency budgets, but the stress
cohort retained roughly 320 MB per completed isolated parse after abort,
close, and forced garbage collection. Repeated 1.47 MB/48,002-element parses
exhausted a 4 GB process. Happy DOM is rejected as Plate's built-in adapter.

LinkeDOM alone was fast and light but did not match browser tree construction
for malformed fragments. It is rejected as the parser. The accepted candidate
uses parse5 to produce and serialize the canonical repaired tree, then
materializes that HTML in LinkeDOM for the existing element-mapping surface.

The frozen benchmark passed every cohort:

| Cohort | Input | Elements | p95 | Retained heap | Peak RSS delta | Budget: p95 / heap / RSS |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| normal | 10,383 B | 362 | 2.41 ms | 0.69 MB | 12.55 MB | 25 ms / 24 MB / 96 MB |
| large | 356,823 B | 12,002 | 52.03 ms | 4.33 MB | 61.36 MB | 400 ms / 128 MB / 256 MB |
| stress | 1,470,823 B | 48,002 | 143.65 ms | -0.89 MB¹ | 5.14 MB | 1,500 ms / 256 MB / 640 MB |
| pathological | 3,166,823 B | 96,002 | 368.19 ms | 19.95 MB | 194.99 MB | 3,000 ms / 512 MB / 1,200 MB |

¹ Retained heap is a post-GC delta and may be negative from collection noise.
Every row runs in a fresh process and separately budgets peak RSS delta.

The correctness probe passed ten malformed/conformance cases and six real
Plate conversions. Parse5's canonical tree remained stable through LinkeDOM
materialization, custom dataset/style mapping worked, source scripts did not
execute, and unsafe script/JavaScript URL input did not survive conversion.

One compatibility repair is required: LinkeDOM's `CSSStyleDeclaration` omits
`item()`, so Plate must iterate numeric declaration keys. The production path
must receive DOM objects explicitly rather than mutating ambient globals.

## Browser HTML candidate

The earlier `DOMParser` direction overclaimed inertness. Its platform contract
disables scripts and handlers but permits user agents to download resources
named by `img` and `iframe`; it also becomes a Trusted Types sink under a strict
CSP. A format parser cannot promise network isolation on that basis.

The accepted target shares parse5 tree construction across browser and server.
The browser adapter creates nodes directly in the `ownerDocument` of a detached
`template` fragment. It performs no `innerHTML` assignment and never attaches
the tree to a browsing context. The Chromium probe passed under
`require-trusted-types-for 'script'`, preserved complete head/body and editor
marker structure, executed no script, and emitted no image, iframe, or
stylesheet request. The standalone parse5 8.0.1 browser entry measures 151,560
minified bytes and 42,013 gzip bytes; final package proof caps parser overhead
at 60 KiB gzip and requires the browser matrix network oracle.

## Package decision

Expose browser parsing through `platejs/html` and Node parsing through
`platejs/html/server`. Make parse5 a normal direct dependency used only by HTML
parse capabilities. Keep LinkeDOM out of browser and non-HTML graphs as an
optional peer, and throw an actionable error from the server entrypoint when it
is missing. This keeps one canonical tree builder and one official server
implementation without installing the server DOM for browser-only consumers.
The plan must prove packed installation, ESM resolution, SSR, browser tree
shaking, and the gzip budget; no CommonJS condition is advertised.

## Resource contract

The target defaults are exact and overrideable:

- `maxBytes: 5 * 1024 * 1024`
- `maxNodes: 100_000`
- `maxDepth: 256`

Limits are checked while parsing or walking, before feature mapping allocates
an unbounded editor tree. Breach returns a format diagnostic and no partial
document/slice. The production benchmark reruns the same four cohorts and
must not regress the recorded p95 or retained-heap budget.

## Final bounded challenges

### 1. Noun deletion

Every proposed owner was deleted, merged, inlined, or reused in turn. Direct
functions plus private compilation still serve every current caller. No new
P0/P1 lead survived.

### 2. Fidelity and source ownership

Ordinary parse never gives hidden native data authority. The explicit authored
path requires trust or signature verification plus strict v2 schema,
configuration, projection, and three-way hash correspondence. Format
diagnostics and a private complete-document fit trace cover framework-owned
recovery without a universal result. Open slices keep contextual fitting at
the insertion owner. No new P0/P1 lead survived.

### 3. Environment, security, and resources

The parse5 plus LinkeDOM adapter passed the pre-acceptance benchmark and
correctness oracle. Optional peer isolation, explicit DOM objects, inertness,
limits, and the production rerun cover the remaining risks. No new P0/P1 lead
survived.

## Final disposition

Pursue the API in shard 005 and the adoption packets in
`promoted-ledger.tsv`. The main residual risks are implementation proof:
mapping every document fit and format loss exactly once, maintaining TypeScript
inference during the hard rename, keeping server dependencies out of browser graphs, and
preserving DOCX native artifacts in real viewers. They do not justify another
public abstraction.
