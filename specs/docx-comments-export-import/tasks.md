# Tasks: DOCX Comments & Subcomments Export/Import

**Input**: Design documents from `/specs/docx-comments-export-import/`
**Prerequisites**: plan.md (required), research.md (required)
**Branch**: `exporting_and_importing_comments`
**Package**: `packages/docx-io`

## User Stories

- **US1 (P1)**: Export threaded comments -- discussions with replies export to DOCX with all 5 XML files, correct threading via commentsExtended.xml
- **US2 (P2)**: Import threaded comments -- DOCX with comment threads imports into Plate preserving reply hierarchy
- **US3 (P3)**: Round-trip fidelity -- export then reimport preserves all discussion threads, authors, dates

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

## Base Paths

- **Export TS**: `packages/docx-io/src/lib/html-to-docx/`
- **Import JS (mammoth)**: `packages/docx-io/src/lib/mammoth.js/lib/`
- **Import TS**: `packages/docx-io/src/lib/`
- **Tests**: `packages/docx-io/src/lib/__tests__/`
- **Templates**: `.claude/skills/docx/scripts/templates/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Types, hex ID generator, namespace constants, template constants shared by both export and import.

- [ ] T001 [P] Add `CommentReply` interface and `replies?` field to `CommentPayload` in `packages/docx-io/src/lib/html-to-docx/tracking.ts` (lines 31-37). `CommentReply` has fields: `authorName?: string`, `authorInitials?: string`, `date?: string`, `text?: string`. Add `replies?: CommentReply[]` to existing `CommentPayload`. Ref: plan E1.

- [ ] T002 [P] Extend `StoredComment` in `packages/docx-io/src/lib/html-to-docx/tracking.ts` (lines 59-65). Add three new fields: `paraId: string` (8-char hex < 0x7FFFFFFF), `durableId: string` (8-char hex < 0x7FFFFFFF), `parentParaId?: string` (links reply to parent). Ref: plan E2.

- [ ] T003 [P] Add `generateHexId()` utility function in `packages/docx-io/src/lib/html-to-docx/tracking.ts`. Returns 8-char uppercase hex string < 0x7FFFFFFF. Uses `Math.floor(Math.random() * 0x7FFFFFFE) + 1` then `.toString(16).toUpperCase().padStart(8, '0')`. Also add a module-level `Set<string>` to track allocated IDs for document-wide uniqueness (per research R12). Export both. Ref: plan E2.

- [ ] T004 [P] Add namespace URIs to `packages/docx-io/src/lib/html-to-docx/namespaces.ts`. Add: `w14: 'http://schemas.microsoft.com/office/word/2010/wordml'`, `w15: 'http://schemas.microsoft.com/office/word/2012/wordml'`, `w16cid: 'http://schemas.microsoft.com/office/word/2016/wordml/cid'`, `w16cex: 'http://schemas.microsoft.com/office/word/2018/wordml/cex'`. Ref: plan E11.

- [ ] T005 [P] Add content type and relationship type constants to `packages/docx-io/src/lib/html-to-docx/constants.ts`. Add constants for the 4 NEW file types (commentsExtended, commentsIds, commentsExtensible, people) -- both content type strings and relationship type strings. Values from plan section "Content Types" and "Relationship Types". Ref: plan E13.

- [ ] T006 [P] Create XML template string constants in a new file `packages/docx-io/src/lib/html-to-docx/comment-templates.ts`. Read the 5 template files from `.claude/skills/docx/scripts/templates/` (comments.xml, commentsExtended.xml, commentsIds.xml, commentsExtensible.xml, people.xml) and embed each as an exported `const` string. These are the full root element shells with 30+ namespace declarations. Do NOT read files at runtime -- embed as string literals. Ref: plan "XML Generation Strategy" section.

**Checkpoint**: All shared types, ID generators, namespace constants, and template constants available. No functional changes yet -- existing tests must still pass.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that blocks user story implementation. No user story label.

- [ ] T007 [P] Add `DocxImportCommentReply` type and `replies?` field to `DocxImportComment` in `packages/docx-io/src/lib/importComments.ts` (lines 54-73). `DocxImportCommentReply` has: `authorName?: string`, `authorInitials?: string`, `date?: string`, `text?: string`. Add `replies?: DocxImportCommentReply[]` to `DocxImportComment`. Ref: plan I8.

- [ ] T008 [P] Add `paraId` property to `comment()` function in `packages/docx-io/src/lib/mammoth.js/lib/documents.js` (lines 149-157). Add `paraId: options.paraId || null` to the returned object. Ref: plan I3.

**Checkpoint**: Type foundation complete for both export and import. All existing tests must still pass.

---

## Phase 3: US1 -- Export Threaded Comments (P1)

**Goal**: Discussions with replies export to DOCX producing all 5 XML files with correct threading.

### Tests for US1 (write FIRST, verify they FAIL)

- [ ] T009 [P] [US1] Create unit test file `packages/docx-io/src/lib/__tests__/export-replies.spec.ts`. Test `resolveCommentMeta()` with a multi-comment discussion (1 parent + 2 replies). Assert returned `CommentPayload` has `replies` array of length 2, each with `authorName`, `text`, `date`. Import `resolveCommentMeta` from `../exportTrackChanges`. Mock a discussion object with `comments: [parentComment, reply1, reply2]` matching the shape used in existing code. Ref: plan T6.

- [ ] T010 [P] [US1] Add test case in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "exported DOCX ZIP contains all 5 comment XML files". Create a Plate editor value with one discussion containing 1 parent + 1 reply. Run export. Inspect the resulting ZIP (jszip) to assert files `word/comments.xml`, `word/commentsExtended.xml`, `word/commentsIds.xml`, `word/commentsExtensible.xml`, `word/people.xml` all exist. Ref: plan T2.

- [ ] T011 [P] [US1] Add test case in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "commentsExtended.xml has correct paraIdParent linking". Same export setup as T010. Parse `word/commentsExtended.xml` from ZIP. Assert it contains a `<w15:commentEx>` with `w15:paraIdParent` pointing to the parent comment's `w15:paraId`. Ref: plan T3.

- [ ] T012 [P] [US1] Add test case in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "people.xml contains unique authors only". Export a discussion where parent author = "Alice" and reply author = "Bob". Parse `word/people.xml`. Assert exactly 2 `<w15:person>` elements with correct `w15:author` attributes. Ref: plan T5.

- [ ] T013 [P] [US1] Add test case in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "comment date round-trips through export". Export a discussion with `date: '2025-01-15T10:30:00Z'`. Parse `word/comments.xml`. Assert `<w:comment>` has `w:date` attribute matching the input date. Ref: plan T4.

### Implementation for US1

- [ ] T014 [US1] Extend `resolveCommentMeta()` in `packages/docx-io/src/lib/exportTrackChanges.ts` (lines 281-325). Currently reads only `discussion.comments?.[0]`. Change to iterate `comments[0]` as parent (existing), `comments[1..n]` as replies. For each reply: resolve `text` from `contentRich` via `nodeToString`, resolve `authorName` and `authorInitials`, resolve `date` via `normalizeDate`. Build `replies[]` array on returned `CommentPayload`. Ref: plan E3.

- [ ] T015 [US1] Extend `ensureComment()` in `packages/docx-io/src/lib/html-to-docx/docx-document.ts` (lines 1030-1068). Add new optional param `parentParaId?: string`. Inside: call `generateHexId()` (from tracking.ts) twice -- once for `paraId`, once for `durableId`. Store both + `parentParaId` on the `StoredComment` object. Ref: plan E4.

- [ ] T016 [US1] Update `generateCommentsXML()` in `packages/docx-io/src/lib/html-to-docx/docx-document.ts` (lines 1083-1126). Use `comments.xml` template string from `comment-templates.ts` as root element (replaces current minimal `xmlns:w`-only root). Add `w14:paraId` and `w14:textId` attributes to each `<w:p>` inside `<w:comment>`. `w14:textId` can be a fixed value `"77777777"`. Ref: plan E5, E6.

- [ ] T017 [US1] Add `generateCommentsExtendedXML()` method in `packages/docx-io/src/lib/html-to-docx/docx-document.ts`. Parse `COMMENTS_EXTENDED_TEMPLATE` from `comment-templates.ts` with xmlbuilder2 `create()`. For each `StoredComment`: append `<w15:commentEx>` with `w15:paraId` and `w15:done="0"`. If `parentParaId` exists, add `w15:paraIdParent`. Serialize and return string. Ref: plan E7.

- [ ] T018 [US1] Add `generateCommentsIdsXML()` method in `packages/docx-io/src/lib/html-to-docx/docx-document.ts`. Parse `COMMENTS_IDS_TEMPLATE`. For each `StoredComment`: append `<w16cid:commentId>` with `w16cid:paraId` and `w16cid:durableId`. Ref: plan E8.

- [ ] T019 [US1] Add `generateCommentsExtensibleXML()` method in `packages/docx-io/src/lib/html-to-docx/docx-document.ts`. Parse `COMMENTS_EXTENSIBLE_TEMPLATE`. For each `StoredComment`: append `<w16cex:commentExtensible>` with `w16cex:durableId` and `w16cex:dateUtc` (use comment's date or current ISO date). Ref: plan E9.

- [ ] T020 [US1] Add `generatePeopleXML()` method in `packages/docx-io/src/lib/html-to-docx/docx-document.ts`. Parse `PEOPLE_TEMPLATE`. Collect unique authors from all `StoredComment` entries. For each: append `<w15:person w15:author="{name}">` with `<w15:presenceInfo w15:providerId="None" w15:userId="{name}"/>`. Ref: plan E10.

- [ ] T021 [US1] Update `generateContentTypesXML()` in `packages/docx-io/src/lib/html-to-docx/docx-document.ts` (lines 498-532). Add Override entries for: `commentsExtended.xml`, `commentsIds.xml`, `commentsExtensible.xml`, `people.xml`. Use content type constants from T005. Only add when comments exist. Ref: plan E12.

- [ ] T022 [US1] Update ZIP assembly in `packages/docx-io/src/lib/html-to-docx/html-to-docx.ts` (lines 330-448). When comments exist: (1) call all 4 new XML generators, (2) add each file to ZIP at `word/` path, (3) add 4 new relationship entries in `document.xml.rels` using `createDocumentRelationships()` with correct relationship types from T005 constants. Scan existing rIds to avoid collision (assign `rId{max+1}` through `rId{max+4}`). Ref: plan E13.

- [ ] T023 [US1] Process reply comments in rendering pipeline at `packages/docx-io/src/lib/html-to-docx/helpers/xml-builder.ts`. When a `commentStart` token with `replies` is parsed: (1) call `ensureComment(parent)` for parent, (2) for each reply call `ensureComment(reply, parentParaId=parent.paraId)`, (3) emit reply `commentRangeStart/End` + `commentReference` runs in document.xml at same anchor position as parent (matching reference library's `reply_to_comment()` pattern). Ref: plan E14.

**Checkpoint**: All US1 export tests (T009-T013) must pass. Export a Plate document with threaded comments and verify the DOCX opens correctly in Microsoft Word with visible comment threads.

---

## Phase 4: US2 -- Import Threaded Comments (P2)

**Goal**: DOCX files with comment threads import into Plate preserving reply hierarchy.

### Tests for US2 (write FIRST, verify they FAIL)

- [ ] T024 [P] [US2] Create test fixture: `.docx` file with threaded comments at `packages/docx-io/src/lib/__tests__/test-data/threaded-comments.docx`. Create using the export functionality from Phase 3 (or manually craft a ZIP with all 5 XML files). Must contain: 1 discussion with 1 parent ("Alice", "Main comment") + 2 replies ("Bob", "Reply 1" and "Alice", "Reply 2"). Ref: plan T8.

- [ ] T025 [P] [US2] Create unit test file `packages/docx-io/src/lib/__tests__/import-replies.spec.ts`. Test `parseDocxComments()` with a mock HTML string containing a `DOCX_CMT_START` token whose JSON payload includes `replies: [{authorName: "Bob", text: "Reply", date: "2025-01-15T10:30:00Z"}]`. Assert returned `DocxImportComment` has `replies` array of length 1 with correct fields. Ref: plan T7.

- [ ] T026 [P] [US2] Add test case in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "import of threaded DOCX creates discussion with replies". Use the fixture from T024. Import via `importDocx`. Assert the resulting Plate value contains a discussion with `comments.length >= 2` (parent + at least 1 reply). Ref: plan T1 (import half).

### Implementation for US2

- [ ] T027 [US2] Fix `w:date` reading in `packages/docx-io/src/lib/mammoth.js/lib/docx/comments-reader.js` (lines 18-24). Add `date: readOptionalAttribute('w:date')` to the `documents.comment()` call inside `readCommentElement()`. Ref: plan I1, research R2.

- [ ] T028 [US2] Read `w14:paraId` from comment paragraphs in `packages/docx-io/src/lib/mammoth.js/lib/docx/comments-reader.js`. In `readCommentElement()`, after reading body, find first `<w:p>` child element and read its `w14:paraId` attribute. Pass as `paraId` to `documents.comment()`. Ref: plan I2.

- [ ] T029 [US2] Add `commentsExtended` to `findPartPaths()` in `packages/docx-io/src/lib/mammoth.js/lib/docx/docx-reader.js` (lines 104-148). Add explicit `findPartPath()` call with relationship type `http://schemas.microsoft.com/office/2011/relationships/commentsExtended`. Return as `commentsExtended` field on the paths object. Cannot reuse `findPartRelatedToMainDocument()` because it uses wrong base URL. Ref: plan I4.

- [ ] T030 [US2] Create `packages/docx-io/src/lib/mammoth.js/lib/docx/comments-extended-reader.js`. Export a function `readCommentsExtended(element)` that parses `<w15:commentEx>` child elements from the root `<w15:commentsEx>`. For each: read `w15:paraId` and optional `w15:paraIdParent`. Return array of `{paraId, parentParaId}`. Ref: plan I5.

- [ ] T031 [US2] Read commentsExtended in `read()` function of `packages/docx-io/src/lib/mammoth.js/lib/docx/docx-reader.js` (lines 67-76). If `commentsExtended` path exists: read the XML via `zipFile.read()`, parse with `comments-extended-reader.js`. Pass resulting threading data through the pipeline alongside comments. Ref: plan I6.

- [ ] T032 [US2] Build threading in `commentRangeStart` handler in `packages/docx-io/src/lib/mammoth.js/lib/document-to-html.js` (lines 432-462). Build `paraId -> commentId` map from comments array. Build `parentParaId -> childCommentIds[]` map from commentsExtended data. For parent comment's `commentRangeStart`: look up children, add their data as `replies[]` on token payload. Skip emitting separate tokens for child comments that are already included as replies. Ref: plan I7.

- [ ] T033 [US2] Extend `parseDocxComments()` in `packages/docx-io/src/lib/importComments.ts` (lines 230-248). When decoding token payload JSON, extract `replies` field if present. Map to `DocxImportCommentReply[]` on returned `DocxImportComment`. Ref: plan I9.

- [ ] T034 [US2] Extend `applyTrackedCommentsLocal()` in `packages/docx-io/src/lib/importComments.ts` (lines 793-812). When building `discussion.comments[]`: after the parent comment entry, append reply entries from `comment.replies`. Each reply maps to `{contentRich: [{type:'p', children:[{text: reply.text}]}], createdAt: parseDateToDate(reply.date, documentDate), userId: formatAuthorAsUserId(reply.authorName), user: {id, name}}`. Ref: plan I10.

**Checkpoint**: All US2 import tests (T024-T026) must pass. Import the threaded-comments fixture and verify Plate shows the discussion with parent + replies.

---

## Phase 5: US3 -- Round-Trip Fidelity (P3)

**Goal**: Export then reimport preserves all discussion threads, authors, dates.

### Tests for US3 (write FIRST, verify they FAIL)

- [ ] T035 [US3] Add integration test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "full round-trip preserves threaded comments". Create Plate editor value with 2 discussions: (A) 1 parent + 2 replies, (B) 1 parent + 0 replies. Export to DOCX buffer. Reimport the buffer. Assert: (A) discussion has 3 comments with correct authors and text, (B) discussion has 1 comment. Ref: plan T1.

- [ ] T036 [US3] Add integration test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "round-trip preserves comment dates". Create discussion with parent date `'2025-01-10T08:00:00Z'` and reply date `'2025-01-11T09:30:00Z'`. Export + reimport. Assert both dates survive (within ISO string equality or Date equality). Ref: plan T4.

- [ ] T037 [US3] Add integration test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "round-trip preserves author names and initials". Create discussion with authors "Alice" (initials "A") and "Bob" (initials "B"). Export + reimport. Assert author names match on parent and reply. Ref: plan T1 extension.

**Checkpoint**: All US3 round-trip tests (T035-T037) must pass. Full bidirectional fidelity confirmed.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, cleanup, robustness.

- [ ] T038 [P] Ensure `paraId` uniqueness is document-wide in `packages/docx-io/src/lib/html-to-docx/tracking.ts`. In `generateHexId()` (T003), verify the Set tracks IDs across ALL generated XML files (document.xml paragraphs + comments.xml paragraphs). If existing `document.xml` paragraphs already have `w14:paraId` values, scan and pre-populate the Set before generating new IDs. Ref: research R12.

- [ ] T039 [P] Handle edge case: discussion with 0 comments (empty discussion). Ensure `resolveCommentMeta()` returns gracefully without crashing. Add a guard test in `packages/docx-io/src/lib/__tests__/export-replies.spec.ts`.

- [ ] T040 [P] Handle edge case: import DOCX without `commentsExtended.xml` (e.g., older Word versions) in `packages/docx-io/src/lib/mammoth.js/lib/docx/comments-extended-reader.js` and `packages/docx-io/src/lib/mammoth.js/lib/document-to-html.js`. Ensure reader returns empty array when file is missing. Ensure threading logic handles empty threading data (no replies, flat comments only). Add guard test in `packages/docx-io/src/lib/__tests__/import-replies.spec.ts`.

- [ ] T041 [P] Handle `rId` collision avoidance in `packages/docx-io/src/lib/html-to-docx/html-to-docx.ts`. Before adding new relationships, scan existing `document.xml.rels` entries to find max numeric suffix. Assign new rIds starting from `rId{max+1}`. Do NOT hardcode rId values. Ref: plan resolved question 12.

- [ ] T042 [P] Add code comment on `xml:space="preserve"` in `packages/docx-io/src/lib/html-to-docx/docx-document.ts` `generateCommentsXML()` (line 1113). Document that this attribute is required on all `<w:t>` elements per OOXML spec. Verify new reply comment `<w:t>` elements also include it. Ref: research R8.

- [ ] T043 [P] Add XML escaping utility `escapeXml(str: string): string` in `packages/docx-io/src/lib/html-to-docx/comment-templates.ts`. Must escape `&`, `<`, `>`, `"`, `'` before interpolating user-provided strings (author names, comment text) into XML. Verify all calls to `generatePeopleXML()` and `generateCommentsXML()` use this utility for author names and comment text. If xmlbuilder2's `.txt()` / `.att()` methods are used, they handle escaping automatically — in that case, document this fact and add a test confirming escaping works for names like `O'Brien & <Co>`. Ref: verification gap 5.

- [ ] T044 [P] Ensure Content Type Override entries in `packages/docx-io/src/lib/html-to-docx/docx-document.ts` `generateContentTypesXML()` use leading `/` in PartName (e.g., `/word/commentsExtended.xml`, not `word/commentsExtended.xml`). OOXML requires absolute part names in `[Content_Types].xml`. Verify existing `comments.xml` override also uses leading `/`. Ref: verification gap 4.

- [ ] T045 [P] Run full test suite: `yarn turbo build --filter=./packages/docx-io && yarn turbo typecheck --filter=./packages/docx-io && yarn test --filter=./packages/docx-io`. Fix any type errors or test failures.

- [ ] T046 [P] Run lint: `yarn lint:fix`. Fix any linting issues introduced by new code.

---

## Phase 7: Regression Prevention & Integration Verification

**Purpose**: Verify no regressions in existing comment/suggestion/discussion functionality. Based on investigation of codebase interactions.

### Investigation Context

**Key findings from codebase investigation:**
- Comments (`comment_<id>` marks) and suggestions (`suggestion_<id>` marks) are **independent systems** with separate export/import pipelines
- DOCX export uses **custom token-based serialization** (NOT Plate's `serializeHtml`), embedding `[[DOCX_CMT_START:...]]` tokens in HTML text before converting to Word XML
- UI shows comments via `CommentLeaf` component rendering `comment_{id}` marks as highlighted text, with `BlockDiscussion` popover for thread display
- Transient/state-only comments require `createDiscussionsForTransientComments()` preprocessing before export; discussions must be explicitly passed to export options
- HTML serialization docs at platejs.org/docs/html do **NOT** apply to DOCX comment handling — DOCX pipeline is entirely custom
- `import-toolbar-button.tsx:85-122` converts imported discussions to `TDiscussion` format for UI display

### Regression Tests

- [ ] T047 [P] Add regression test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "suggestion+comment coexistence survives threading changes". Create Plate value with BOTH a suggestion mark (`suggestion_<id>`) AND a comment mark (`comment_<id>`) on the same text node. Export to DOCX. Verify both `[[DOCX_INS_START:...]]` and `[[DOCX_CMT_START:...]]` tokens are present. Reimport and verify both marks survive. Key regression risk: token injection order in `exportTrackChanges.ts:784-843` — suggestions sort before comments, and threading must not break this ordering.

- [ ] T048 [P] Add regression test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "transient comments export correctly with threading". Create Plate value with `commentTransient` marks (state-only comments). Call `injectDocxTrackingTokens()` with `includeTransientComments: true`. Verify `createDiscussionsForTransientComments()` (exportTrackChanges.ts:622-685) converts them to `comment_<id>` marks and creates synthetic discussion entries. Ensure threading changes don't break the transient → persistent mark conversion.

- [ ] T049 [P] Add regression test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "overlapping comment marks roundtrip correctly". Create Plate value with two overlapping comment marks (same text range, different discussion IDs). Export and reimport. Verify both `comment_<id1>` and `comment_<id2>` marks survive. UI renders overlapping comments with different styling (`border-b-2 border-b-highlight/[.7] bg-highlight/25` per `comment-node.tsx:32`).

- [ ] T050 [P] Add regression test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "single-comment discussions (no replies) still work after threading changes". Create Plate value with a simple single-comment discussion (the common case before threading support). Export and reimport. Verify the discussion has exactly 1 comment. This guards against `resolveCommentMeta()` changes breaking the base case.

### Integration Verification

- [ ] T051 [P] Verify import-to-UI integration in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "imported discussions match TDiscussion format". After importing a DOCX with threaded comments via `importDocxWithTracking()`, verify the returned `ImportDocxWithTrackingResult.discussions` array contains discussions with correct structure: `{id, comments: [{contentRich, createdAt, userId, user}, ...], createdAt, isResolved, userId}`. This is what `import-toolbar-button.tsx:100-116` expects. Verify `comments.length` matches parent + replies count.

- [ ] T052 [P] Verify comment marks are correctly applied to editor after import in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "imported comment marks have correct keys". After importing threaded DOCX, iterate text nodes and verify: (a) commented text has `comment_<discussionId>: true` mark, (b) the mark key matches a discussion ID in the returned discussions array. This confirms the UI's `BlockDiscussion` component (`block-discussion.tsx:311-367`) can resolve marks → discussions via `uniquePathMap`.

- [ ] T053 [P] Add test in `packages/docx-io/src/lib/__tests__/export-replies.spec.ts`: "block-level suggestions on commented blocks export without interference". Create a paragraph with BOTH a block-level suggestion (`{suggestion: {id, type: 'insert', userId}}`) AND inline comment marks. Export and verify both suggestion tokens and comment tokens are present in the output. This guards against `injectDocxTrackingTokens()` (exportTrackChanges.ts:707-847) not handling the interaction correctly.

### Documentation Verification

- [ ] T054 [P] Verify in `packages/docx-io/src/lib/docx-export-plugin.tsx`: the `DocxTrackingExportOptions.discussions` parameter documentation is accurate after threading changes. Ensure the JSDoc on `discussions` field (line 152-158) notes that discussions with multiple comments will have replies exported as separate DOCX comment entries linked via `commentsExtended.xml`. No code change needed if docs already accurate — just verify.

---

## Phase 8: OOXML Schema Validation (Reference Library Parity)

**Purpose**: Certify our exported DOCX matches the structure validated by the reference Python library's `Document.validate()` method. The Python `Document` class (`.claude/skills/docx/scripts/document.py`) produces DOCX files that pass both XSD schema validation and redlining validation. Our TypeScript export MUST produce structurally identical XML.

### Reference Library Contract

The Python `Document` class enforces these invariants during `add_comment()` and `reply_to_comment()`:

1. **comments.xml**: Each `<w:comment>` has `w:id`, `w:author`, `w:date`, `w:initials`. Inner `<w:p>` has `w14:paraId` and `w14:textId="77777777"`. First run has `<w:rStyle w:val="CommentReference"/>` + `<w:annotationRef/>`. Text run has `<w:color w:val="000000"/><w:sz w:val="20"/><w:szCs w:val="20"/>`.
2. **commentsExtended.xml**: Each `<w15:commentEx>` has `w15:paraId` and `w15:done="0"`. Replies add `w15:paraIdParent`.
3. **commentsIds.xml**: Each `<w16cid:commentId>` has `w16cid:paraId` and `w16cid:durableId`.
4. **commentsExtensible.xml**: Each `<w16cex:commentExtensible>` has `w16cex:durableId`.
5. **people.xml**: Each `<w15:person>` has `w15:author` and child `<w15:presenceInfo w15:providerId="None" w15:userId="{author}"/>`.
6. **document.xml**: Reply `commentRangeStart` inserted after parent's `commentRangeStart`. Reply `commentRangeEnd` + `commentReference` run inserted after parent's reference run.
7. **document.xml.rels**: 4 relationship entries (comments, commentsExtended, commentsIds, commentsExtensible) with correct Type URIs. rIds don't collide.
8. **[Content_Types].xml**: 4 Override entries with correct PartName (leading `/`) and ContentType strings.
9. **Text escaping**: `&`, `<`, `>` escaped in comment text before XML insertion.

### Validation Tasks

- [ ] T055 [P] Add comprehensive structural validation test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "exported comments.xml matches reference library structure". Export a discussion with 1 parent + 1 reply. Unzip and parse `word/comments.xml`. For each `<w:comment>`: assert `w:id`, `w:author`, `w:date`, `w:initials` attributes exist. For inner `<w:p>`: assert `w14:paraId` is 8-char hex, `w14:textId` exists. Assert first `<w:r>` contains `<w:rStyle w:val="CommentReference"/>` and `<w:annotationRef/>`. Assert text `<w:r>` contains `<w:t>` with `xml:space="preserve"`.

- [ ] T056 [P] Add structural validation test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "commentsExtended.xml has correct w15:done and parent linking". Parse exported `word/commentsExtended.xml`. For parent comment: assert `<w15:commentEx>` has `w15:paraId` matching comments.xml's `<w:p w14:paraId>` and `w15:done="0"` and NO `w15:paraIdParent`. For reply: assert `w15:paraIdParent` matches parent's `w15:paraId`.

- [ ] T057 [P] Add structural validation test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "commentsIds.xml and commentsExtensible.xml cross-reference correctly". Parse both files from exported ZIP. For each comment: assert `<w16cid:commentId>` has both `w16cid:paraId` (matching commentsExtended) and `w16cid:durableId`. Assert `<w16cex:commentExtensible>` has `w16cex:durableId` matching the same durableId. This validates the paraId ↔ durableId linkage chain.

- [ ] T058 [P] Add structural validation test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "document.xml reply anchoring matches reference library". Export discussion with parent + reply. Parse `word/document.xml`. Assert: (a) reply's `<w:commentRangeStart>` appears AFTER parent's `<w:commentRangeStart>`, (b) reply's `<w:commentRangeEnd>` + `<w:commentReference>` run appear AFTER parent's `<w:commentReference>` run. This matches the Python `reply_to_comment()` anchoring pattern.

- [ ] T059 [P] Add structural validation test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "document.xml.rels has all 4 comment relationship types". Parse `word/_rels/document.xml.rels` from exported ZIP. Assert 4 relationships exist with exact Type URIs: `http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments`, `http://schemas.microsoft.com/office/2011/relationships/commentsExtended`, `http://schemas.microsoft.com/office/2016/09/relationships/commentsIds`, `http://schemas.microsoft.com/office/2018/08/relationships/commentsExtensible`. Assert all rId values are unique.

- [ ] T060 [P] Add structural validation test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "[Content_Types].xml has all comment overrides with leading slash". Parse `[Content_Types].xml` from exported ZIP. Assert 4 Override entries exist with PartNames `/word/comments.xml`, `/word/commentsExtended.xml`, `/word/commentsIds.xml`, `/word/commentsExtensible.xml` (leading `/` required). Assert correct ContentType for each.

- [ ] T061 [P] Add structural validation test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "people.xml matches reference library format". Parse `word/people.xml`. For each unique author: assert `<w15:person w15:author="{name}">` with child `<w15:presenceInfo w15:providerId="None" w15:userId="{name}"/>`. Assert no duplicate authors.

- [ ] T062 [P] Add structural validation test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "XML-unsafe characters in comment text and author names are escaped". Export a discussion with author name `O'Brien & <Co>` and comment text `Check x < y && z > 0`. Parse exported XML files. Assert no raw `&`, `<`, `>` appear in attribute values or text content (should be `&amp;`, `&lt;`, `&gt;`). Assert Word can open the file (no parse errors).

- [ ] T063 [P] Add structural validation test in `packages/docx-io/src/lib/__tests__/roundtrip.spec.tsx`: "paraId values are 8-char hex < 0x7FFFFFFF and unique across all XML files". Collect ALL `w14:paraId` values from `word/document.xml` and `word/comments.xml`. Collect all `w15:paraId` values from `word/commentsExtended.xml` and `w16cid:paraId` from `word/commentsIds.xml`. Assert: (a) each is 8-char hex, (b) numeric value < 0x7FFFFFFF, (c) no duplicates across the entire set.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies. All T001-T006 are parallel.
- **Phase 2 (Foundational)**: Depends on Phase 1 for types (T001, T002). T007 and T008 are parallel.
- **Phase 3 (US1 Export)**: Depends on Phase 1 + Phase 2. Tests T009-T013 first (parallel), then implementation T014-T023 (mostly sequential).
- **Phase 4 (US2 Import)**: Depends on Phase 2. Can run in parallel with Phase 3 for implementation, but T024 (fixture) benefits from Phase 3 export. Tests T024-T026 first, then T027-T034 (mostly sequential).
- **Phase 5 (US3 Round-trip)**: Depends on Phase 3 AND Phase 4 both complete.
- **Phase 6 (Polish)**: Depends on Phase 5. All T038-T046 are parallel.
- **Phase 7 (Regression)**: Depends on Phase 5 (US3 complete). All T047-T054 are parallel. Can run concurrently with Phase 6.
- **Phase 8 (OOXML Validation)**: Depends on Phase 3 (US1 Export complete). All T055-T063 are parallel. Can start as soon as export works; should run before US2/US3 to catch structural issues early.

### Within Each Phase

- Tests MUST be written first and FAIL before implementation
- Type definitions before functions that use them
- Generator functions before ZIP assembly that calls them
- mammoth.js reader changes before `document-to-html.js` threading logic

### Critical Path

```
T001-T006 (parallel)
    |
T007, T008 (parallel)
    |
    +-- US1: T009-T013 (test, parallel) -> T014 -> T015 -> T016-T020 (parallel) -> T021 -> T022 -> T023
    |
    +-- US2: T024-T026 (test, parallel) -> T027 -> T028 -> T029 -> T030 -> T031 -> T032 -> T033 -> T034
    |
    +--- (both complete) ---> US3: T035-T037 (test) -> verify pass
    |
    +--- T038-T046 (polish, parallel)
    +--- T047-T054 (regression, parallel) — can run concurrently with polish
    +--- T055-T063 (OOXML validation, parallel) — can start after US1 export works
```

### Parallel Opportunities

- All Phase 1 tasks (T001-T006): different files, no deps
- All Phase 3 tests (T009-T013): different test cases, same file but no conflict
- T016-T020: different methods in `docx-document.ts`, can be written in parallel if careful
- All Phase 6 tasks (T038-T046): independent edge cases and cleanup
- All Phase 7 tasks (T047-T054): independent regression tests, can run in parallel with Phase 6
- All Phase 8 tasks (T055-T063): independent structural validation tests, can start after Phase 3

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to user story for traceability
- Each user story is independently testable after its phase completes
- Verify tests FAIL before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate
- API mode import (line 496-706 in importComments.ts) only supports single comment per discussion -- reply import is Local mode only (documented limitation per research R6)
