---
review_scopes: [editor-comparison]
review_basis: []
work_kind: research
verdict: stop
review_commit: 6fa1169c5e723eb3e058697189cdcad85be220f9
review_inputs: [docs/research/schema.md, VISION.md, docs/vision/common.md, docs/plite/research/2026-10-13-editor-comparison/read-log.tsv, docs/plite/research/2026-10-13-editor-comparison/corpus-ledger.tsv]
review_upstreams:
  - "../BlockNote@ce806b17f1d899d2766df2d1b9a58ef624aee65e"
  - "../ckeditor5@0dce57d1a2ffa9d5f4fd5479e63cd4ec95962ff7"
  - "../codemirror-view@fbff59ba004d80d8c914f64c42586387b08706ac"
  - "../editor.js@b847d010c723ebce7ef0e0c879feda00baa529b5"
  - "../edix@9df9527a907f249bbdef691aa25543f92067b148"
  - "../lexical@80b6fb25c40378f010a3bde70bf2be104aaae4ba"
  - "../meowdown@55940d37847e12f8c1a8b83a2d468436fc9b6e55"
  - "../milkdown@d1a7af63637e2c788071a40a022ef2b9e4f6286f"
  - "../opendoc@e81336419d1e7cea0043ead7a1ca0d8fd8fc1636"
  - "../portabletext@dd533ff1ffc3d5e975b57da1985ae2ed14f0626e"
  - "../premirror@29b78634d6496206c84015068eb7d66d9cdc312c"
  - "../pretext@0e6b75fb70271111d6dd05550088741ff497e100"
  - "../prosekit@46963df47bddb13f9dd2aa896c6255e55fdb0e87"
  - "../prosemirror-state@ffad5d9450a0b93438be53a801deee1a223a81bf"
  - "../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534"
  - "../quill@539cbffd0a13b18e9c65eb84dd35e6596e403158"
  - "../raw/editor-comparison-2026-10-13/documents/Yoopta-Editor@070349b1cd703d05548e2db94c98b4e9622d4f07"
  - "../raw/editor-comparison-2026-10-13/documents/appflowy-editor@01eccc6ee36bd07698bd80915289fe7070478cd2"
  - "../raw/editor-comparison-2026-10-13/documents/blocksuite@5cb5cb68471ca692f3c162258f0087cb22fcb82d"
  - "../raw/editor-comparison-2026-10-13/documents/blok@3300748a3a89e8531d722aedbdd98df3b59b429d"
  - "../raw/editor-comparison-2026-10-13/documents/docx-editor@e3f0db31de195f4e2363a0f193c1f669c88c8cd2"
  - "../raw/editor-comparison-2026-10-13/documents/loro-prosemirror@0e036a9bedb432ea7ae238c82d379e1a2fca11d6"
  - "../raw/editor-comparison-2026-10-13/documents/siyuan@fb3355f07d22bff36f1d785999fd5ded6a90d468"
  - "../raw/editor-comparison-2026-10-13/engines/canonical-prosemirror-state@57d4a96286ca972125a18a56ecd6d2b00927de30"
  - "../raw/editor-comparison-2026-10-13/engines/canonical-prosemirror-view@3c28f8e797e8fd7e45b72616ba1ce51b6eb8582e"
  - "../raw/editor-comparison-2026-10-13/engines/editor@21211e2b794c5899bc40027cfd6c43049921d490"
  - "../raw/editor-comparison-2026-10-13/engines/parchment@3d0b71c95c056a3fd595e7a22f7ecd221f104268"
  - "../raw/editor-comparison-2026-10-13/engines/remirror@61d27d389e90333adab7a42a3b6d282342793655"
  - "../raw/editor-comparison-2026-10-13/engines/roosterjs@48048d84424eb5c5271598ddfbc46c64ba447c73"
  - "../raw/editor-comparison-2026-10-13/engines/wangEditor@f35d8a73a0a3dc159134d483afc5963d0256ea18"
  - "../raw/editor-comparison-2026-10-13/frontier/canvas-editor@e8d0be8f4c7d23ef1056a35b0891a3bc1083db82"
  - "../raw/editor-comparison-2026-10-13/frontier/lexxy@b384704c1c334509c07d3eb66ae6aa2e65742e3d"
  - "../raw/editor-comparison-2026-10-13/frontier/proof-sdk@fb2578758f1c62776301209131181643c5f4a19a"
  - "../raw/editor-comparison-2026-10-13/markdown/editor@4d9499a86cb797cb92d2a6a4718619983e5955e3"
  - "../raw/editor-comparison-2026-10-13/markdown/prosemirror-pretext@3a73961af388f88eb4fe6b9440e93ef1d6ce8a1e"
  - "../raw/editor-comparison-2026-10-13/markdown/vditor@4535ffb0c6b70809a0d5bcb477d9568e297ae83f"
  - "../rich-textarea@fe9cdab1b0a1d36dd5e6e9011743359786905402"
  - "../slate-official@6ae146a3691fd1e41961e1e36ac2ce8908ca6c32"
  - "../tinymce@46cb5f7ed8bfc1976cf9289db042932729ed1527"
  - "../tiptap@77df9afdbc3f6c73fe422d3971403746f269239b"
  - "../wordgard@51f2fff9a2fa6633ecfbae6e3f972feb790d854f"
---

# Current editor comparison

Status: closed: Stop verdict; research complete
Playbook: verdict

Stop a universal editor ranking or a runtime replacement inferred from age. The source research supports a wider comparison set for each question. The owner selected this research scope rather than the next product feature in the review queue.

## Brief

### What will change?

The comparison now covers current engines, frameworks, block editors, document processors and Markdown editors. Each recommendation names the question it helps answer. The research records 82 targeted screens and 161 source files.

### What could go wrong?

Source reads support this comparison. They do not establish speed, native input correctness or production readiness. Proprietary code and uninspected office engines remain explicit source gaps.

## Teach

An editor comparison needs a question. A document engine, a ready-made block editor and a text-layout library solve different problems.

The previous shortlist mixed those projects in one ranking. This research separates their jobs and checks the public source behind each important claim.

The useful additions supply different kinds of evidence. Wordgard adds another engine. BlockSuite and Blok add shared-block contracts. ProseKit adds composition. Meowdown adds Markdown input scenarios. None wins every job.

## Evidence

Model: unknown. The runtime does not expose a reliable model identifier in this conversation.

The review applies [the current ownership law](../../VISION.md) and [the research schema](../research/schema.md). [The source findings](../research/sources/editor-architecture/current-comparison.md) and [read log](../plite/research/2026-10-13-editor-comparison/read-log.tsv) record what was inspected. No external runtime result was carried forward as current proof.

### Requirements

- Research current GitHub projects beyond the familiar editor set.
- Inspect local source before accepting implementation claims.
- Keep engine, framework, product, layout and collaboration claims distinct.
- Preserve Plate and Plite's ownership and native-behavior laws.
- Deliver compiled research and a written verdict, with explicit evidence limits.

### Lanes

- Keep a small universal ranking. This is easy to read but cannot answer different architecture and product questions accurately.
- Replace the ranking with a decision-specific comparison set. Keep mature baselines and add current projects where they offer distinct source evidence.
- Replace Plate or Plite's runtime with a newer editor. Discovery alone cannot establish correctness, adoption cost or measured benefit.

### Dependents

No production consumer imports this documentation scope. Product scopes are unaffected because this request changes research only.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Comparison | Choose editors by the question | Rank every editor together | ranking | big |
| Runtime | Keep the current owners | Investigate a specific replacement | replacement | big |
| Mature editors | Keep useful baselines | Exclude projects by age | age | small |
| Repository checks | Report the scoped research checks and global failures (look) | Repair the separate documentation failures | repository | small |

## Close

The research refresh is complete. It changes documentation and provenance only. The candidate page was compressed, with five pinned historical specialist findings retained. The current comparison and accepted decision replace its unsupported universal winner claims.

Coverage is 274 discovered source-host identities, 82 targeted screens, 41 identities with file reads and 35 with implementation or test reads. There are 161 distinct recorded files, 173 primary read rows, four issue bodies and three PR bodies. Six downloaded Markdown files remain explicitly unread. Twenty-seven leads were kept, none merged, ten unsupported inferences rejected, and 27 documentation packets promoted. No runtime or benchmark packet was promoted. No external tests or device scenarios ran.

The lead checked the decision-changing source extractions. A separate consistency reader verified all 161 recorded file hashes against their pinned Git blobs, reconciled the counts and checked that prospective proof commands name existing scripts or targets. That review is same-family evidence checking, not a multi-model architecture panel or runtime acceptance.

The six corpora close through [the corpus ledger](../plite/research/2026-10-13-editor-comparison/corpus-ledger.tsv). The proprietary SuperDoc engine, uninspected office engines and Premirror's current integration remain named limits. They belong to a future feature-specific comparison lead and close only with the source and proof that could change that feature's decision. No additional broad discovery shard is required.

The authored files remain in the working tree on next. No commit or push was requested. Product tests, a panel, generated registry output and lint fixes are inapplicable because no product, API, source, test, tooling or agent instruction changed. The changed documentation is ignored by the code formatter.

The page-shape check passes. All 161 recorded source-file hashes and read spans validate against the private snapshots and pinned Git blobs. A final factual reader returned PASS. Both repository-wide knowledge and review-ledger checks fail outside this research. A clean detached control at the intake commit also fails both checks. Current knowledge failures include additional authored-path references, so this review does not label every current finding pre-existing or claim a clean repository. Task-specific findings are repaired and checked separately.

The raw verification logs and the detached control are retained in this run's local artifact directory. The control worktree was removed. Owner: the owners of the separately failing documentation, with zbeyens coordinating repository cleanup. Stop: both repository-wide checks pass. This limit does not change the research question or promote a runtime claim.

## What other editors do

[The comparison table](../research/sources/editor-architecture/candidates.md) selects editors by decision. [The source findings](../research/sources/editor-architecture/current-comparison.md) carry the evidence and limitations. Each external checkout and exact revision is named in this page's front matter and the read log. Editors were read, not run.

| Question | Useful comparison sources | Why they matter |
| --- | --- | --- |
| Independent engine and changes | Wordgard, Lexical, ProseMirror, Slate, CKEditor 5 | Canonical state, changes, mapping and DOM ownership |
| Typed extension composition | Current Lexical Extensions, ProseKit, Tiptap | Dependency identity, grouped capabilities, commands and disposal |
| Shared block state | BlockSuite, Blok, BlockNote | Block identity, placement, schema admission and local undo |
| Structured content and behavior specifications | Portable Text | Schema applicability, annotations and executable behavior scenarios |
| Hidden Markdown syntax | Meowdown | Caret affinity, syntax deletion, selection and subsequent typing |
| Markdown export and nested code editors | MDXEditor, Vditor, Milkdown | Selected fragments, serialization and lazy editor lifecycle |
| Document layout and pagination | OpenDoc, public SuperDoc painter, canvas-editor | Full/windowed equivalence, hydration and input/rendering costs |
| Prepared text measurement | Pretext, qualified Premirror experiment | Measurement work, line cursors and mapping. No speed result was measured. |
| Focus and undo | Lexxy, RoosterJS, TinyMCE, Quill | Prompt focus, unfocused formatting, nested history and remote-edit mapping |
| Collaboration adapters | Loro ProseMirror, BlockSuite, Blok, Wordgard | Initialization, local origins, stable cursors and structural convergence scenarios |
| Agent edits and provenance | Proof SDK | Canonical edits, provider/persistence agreement and reconnect |
| Cross-platform model/view contracts | AppFlowy Editor | Stable identities, transaction selections and Flutter materialization |

BlockNote remains useful and active. The largest omissions in the earlier ranking were distinct modern contracts, not a reason to discard every mature editor. SuperDoc's complete current engine is proprietary. Premirror and native-device claims retain the source and proof limits recorded above.

## Ownership

No public call changes. Plite remains the canonical model/change/runtime owner. Plate remains the product/framework owner. External editors provide evidence for those owners, rather than a new dependency or parallel authority.

## Prior evidence and reconciliation

The first exact editor-comparison lookup returned no existing semantic scope. The broader research lookup found prior export comparisons and Wordgard research. Those are feature-specific evidence, not a global market or quality ranking.

This review retains the pinned historical specialist findings from the old candidate page and the narrower Wordgard change/mapping lessons. It supersedes the candidate page's unsupported universal rankings. The September Wordgard performance run remains historical; its results were not carried forward as current timing proof. The retained and changed claims are inspectable against the earlier file in git and this run's source ledger.

The [schema](../research/schema.md) separates review judgment from adoption. The [candidate source](../research/sources/editor-architecture/candidates.md), [research result](../plite/research/2026-10-13-editor-comparison/README.md) and decision (`2e865a0bc4:docs/research/decisions/editor-comparison-set.md`) are the current documentation owners.

## Proof and limits

Verify selected source inspection, exact source fingerprints, schema/ledger validation, link checks and rendering for this artifact-only change. Native behavior, provider convergence, performance, accessibility and release readiness remain outside the claim. Investigation scores order evidence work only and do not grade editor architectures.

## Completion record

The research checklist has 18 entries. 17 are done, one is skipped with its reason, and none is open or blocked. Repository-wide check failures remain a separately stated proof limit, not a green result. The 45 local artifact links, six corpus dispositions, 173 primary read rows, 161 source-file hashes, unique ledger keys and lead-score arithmetic pass the final artifact validation. The prose received Unslop and plain-language passes. No lintable code changed.

## License protection

The current protection is a mandatory written rule in [Coding standards](../../CODING_STANDARDS.md#third-party-material). Reuse of third-party code, tests, fixtures or documentation needs a verified license, permission or other valid basis, with the applicable obligations satisfied. Unresolved material is omitted. The research license column and documentation promotions do not establish reuse clearance.

On October 13, the live check inventory and a search of tooling, CI configuration, hooks and the research rule found no dedicated automated license-compliance gate. This research introduced source summaries and provenance records into Plate, without importing vendor implementations. It was not a compliance audit of existing Plate code or dependencies.

Licenses must be checked at the actual package and file boundary. BlockNote documents MPL-2.0 for its core and GPL-3.0 or commercial terms for XL packages in its [pricing and licensing FAQ](https://www.blocknotejs.org/pricing). CKEditor documents GPL use for its open-source editor and commercial licensing for premium features and commercially licensed builds in its [licensing guide](https://ckeditor.com/docs/ckeditor5/latest/getting-started/licensing/license-key-and-activation.html).

A proposed stronger gate would record the exact file or package and revision, license evidence, intended reuse, required notices and source obligations, and a cleared or blocked decision before adoption. A dependency scanner would supplement that review. It would not clear copied or adapted material. This question did not authorize implementation of that gate.
