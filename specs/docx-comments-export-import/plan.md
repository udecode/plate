# Implementation Plan: DOCX Comments & Subcomments Export/Import

**Branch**: `exporting_and_importing_comments` | **Date**: 2026-02-01 | **Spec**: [constitution](/specs/../.specify/memory/constitution.md)
**Input**: User requirement: export/import comments and subcomments (discussions) without unreadable tokens, with full fidelity round-trip.
**Reference**: Python OOXML library (`skills/docx/scripts/document.py`) — authoritative source for correct DOCX comment structure.

## Summary

Add full comment threading (subcomments/replies) support to DOCX export and import in `packages/docx-io`. Currently:
- **Export**: Only exports first comment of each discussion. Missing: `commentsExtended.xml`, `commentsIds.xml`, `commentsExtensible.xml`, `people.xml`.
- **Import**: Only creates single-comment discussions from DOCX. No threading reconstruction. Comment `w:date` attribute not read.

Goal: Full-fidelity round-trip of discussion threads (parent comment + replies) through DOCX format, matching the OOXML spec as implemented in the reference Python library.

## Technical Context

**Language/Version**: TypeScript 5.x (TS files in `packages/docx-io/src/lib/`), JavaScript (mammoth.js fork in `packages/docx-io/src/lib/mammoth.js/`)
**Primary Dependencies**: platejs, xmlbuilder2 (XML generation via `create()` and `fragment()`), jszip (ZIP manipulation), mammoth.js custom fork (DOCX→HTML), lodash (cloneDeep in constants.ts)
**Storage**: N/A (in-memory transforms)
**Testing**: vitest (roundtrip.spec.tsx uses `describe`/`it`/`expect`), test fixtures at `packages/docx/src/lib/__tests__/*.docx` and `packages/docx-io/src/lib/mammoth.js/test/test-data/*.docx`
**Target Platform**: Browser (export) + Node (tests)
**Project Type**: Monorepo package (`packages/docx-io`)

## Constitution Check

*GATE: Must pass before implementation.*

| Gate | Status | Notes |
|------|--------|-------|
| I. Test-First | ✅ PASS | Tests written first for each feature — red, then green |
| II. Evidence | ✅ PASS | Every decision cites exact file:line evidence + reference Python library |
| III. Diligence | ✅ PASS | All source files read; reference library analyzed |
| IV. Search-First | ✅ PASS | All existing patterns mapped; no duplicates |
| V. Simplicity | ✅ PASS | Minimal changes extending existing patterns |

## OOXML Comment Architecture (from Reference Library)

The reference Python library (`document.py`) shows the **complete** OOXML comment infrastructure requires **five** XML files and **four** relationship types:

### Files Required

| File | Purpose | Namespace |
|------|---------|-----------|
| `word/comments.xml` | Comment text content, `<w:comment>` elements with `w:id`, `w:author`, `w:date`, `w:initials`. Each contains `<w:p>` with `w14:paraId` and `w14:textId`. | `w:` |
| `word/commentsExtended.xml` | Threading. `<w15:commentEx>` with `w15:paraId` (matches `w14:paraId` on `<w:p>` in comments.xml) and optional `w15:paraIdParent` for replies. | `w15:` |
| `word/commentsIds.xml` | Durable IDs. `<w16cid:commentId>` with `w16cid:paraId` and `w16cid:durableId`. | `w16cid:` |
| `word/commentsExtensible.xml` | Extended metadata. `<w16cex:commentExtensible>` with `w16cex:durableId` and `w16cex:dateUtc`. | `w16cex:` |
| `word/people.xml` | Author registry. `<w15:person>` with `w15:author` and `<w15:presenceInfo>`. | `w15:` |

### Relationship Types

```
comments.xml:          http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments
commentsExtended.xml:  http://schemas.microsoft.com/office/2011/relationships/commentsExtended
commentsIds.xml:       http://schemas.microsoft.com/office/2016/09/relationships/commentsIds
commentsExtensible.xml: http://schemas.microsoft.com/office/2018/08/relationships/commentsExtensible
people.xml:            http://schemas.microsoft.com/office/2011/relationships/people
```

### Content Types

```
/word/comments.xml:          application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml
/word/commentsExtended.xml:  application/vnd.openxmlformats-officedocument.wordprocessingml.commentsExtended+xml
/word/commentsIds.xml:       application/vnd.openxmlformats-officedocument.wordprocessingml.commentsIds+xml
/word/commentsExtensible.xml: application/vnd.openxmlformats-officedocument.wordprocessingml.commentsExtensible+xml
/word/people.xml:            application/vnd.openxmlformats-officedocument.wordprocessingml.people+xml
```

### ID Architecture

Two independent hex IDs per comment:
- **`paraId`** (8-char hex, < `0x7FFFFFFF`): Links `comments.xml` `<w:p w14:paraId>` ↔ `commentsExtended.xml` `<w15:commentEx w15:paraId>` ↔ `commentsIds.xml` `<w16cid:commentId w16cid:paraId>`
- **`durableId`** (8-char hex, < `0x7FFFFFFF`): Links `commentsIds.xml` `<w16cid:commentId w16cid:durableId>` ↔ `commentsExtensible.xml` `<w16cex:commentExtensible w16cex:durableId>`

### Reply Threading (from `reply_to_comment()`)

Each reply comment:
1. Gets its **own** `<w:comment>` in `comments.xml` with unique `w:id` and `w14:paraId`
2. Gets its **own** `commentRangeStart/End` in `document.xml` (anchored near parent's markers)
3. Gets its **own** `commentReference` run in `document.xml`
4. Gets a `<w15:commentEx>` with `w15:paraIdParent` pointing to parent's `paraId`

### Namespace URIs

```
w14:    http://schemas.microsoft.com/office/word/2010/wordml
w15:    http://schemas.microsoft.com/office/word/2012/wordml
w16cid: http://schemas.microsoft.com/office/word/2016/wordml/cid
w16cex: http://schemas.microsoft.com/office/word/2018/wordml/cex
w16du:  http://schemas.microsoft.com/office/word/2023/wordml/word16du
```

## Current State Analysis (Evidence-Based)

### Export Pipeline: What Exists

**File**: `exportTrackChanges.ts`

1. **`resolveCommentMeta()`** (line 281-325): Reads `discussion.comments?.[0]` (line 288) — **only first comment**. Returns `CommentPayload` with single `text` string.

2. **`CommentPayload` type** (tracking.ts line 31-37): `{id, authorName?, authorInitials?, date?, text?}` — **no `replies` field**.

3. **`StoredComment` type** (tracking.ts line 59-65): Flat entry — **no `paraId`, `parentParaId`, or `durableId`**.

4. **`ensureComment()`** (docx-document.ts line 1030-1068): Creates one `StoredComment` per call. **No `paraId` generation.**

5. **`generateCommentsXML()`** (docx-document.ts line 1083-1126): Generates `<w:comment>` elements. **No `w14:paraId` on `<w:p>`, no `w14:textId`.**

6. **Content Types** (docx-document.ts line 498-532): Only adds `comments.xml`. **Missing 4 other content types.**

7. **ZIP assembly** (html-to-docx.ts line 440-448): Only adds `comments.xml`. **Missing 4 other files.**

### Import Pipeline: What Exists

1. **`comments-reader.js`** (line 11-25): Reads `w:id`, `w:author`, `w:initials`. **Does NOT read `w:date`**. **Does NOT read `w14:paraId` from `<w:p>`.**

2. **`findPartPaths()`** (docx-reader.js line 104-148): Returns `{mainDocument, comments, endnotes, footnotes, numbering, styles}`. **No `commentsExtended`, `commentsIds`, `commentsExtensible`, `people`.**

3. **`commentRangeStart` handler** (document-to-html.js line 432-462): Builds single-comment token. **No threading awareness.**

4. **`applyTrackedCommentsLocal()`** (importComments.ts line 715-901): Creates one discussion with one comment. **No replies.**

## Design

### Approach: Multi-Comment Token + Full OOXML Comment Infrastructure

### Export Changes (Detailed)

#### E1. Extend types (tracking.ts)

```typescript
// NEW type for reply data in token payload
export interface CommentReply {
  authorName?: string;
  authorInitials?: string;
  date?: string;
  text?: string;
}

// EXTENDED - add replies
export interface CommentPayload {
  id: string;
  authorName?: string;
  authorInitials?: string;
  date?: string;
  text?: string;
  replies?: CommentReply[];  // NEW
}

// EXTENDED - add paraId, durableId, parentParaId
export interface StoredComment {
  id: number;
  authorName: string;
  authorInitials: string;
  date?: string;
  text: string;
  paraId: string;        // NEW: 8-char hex < 0x7FFFFFFF
  durableId: string;     // NEW: 8-char hex < 0x7FFFFFFF
  parentParaId?: string; // NEW: links reply to parent
}
```

#### E2. Add hex ID generator (docx-document.ts or tracking.ts)

```typescript
/** Generate 8-char hex ID < 0x7FFFFFFF per OOXML spec. */
function generateHexId(): string {
  const val = Math.floor(Math.random() * 0x7FFFFFFE) + 1;
  return val.toString(16).toUpperCase().padStart(8, '0');
}
```

#### E3. Extend `resolveCommentMeta()` (exportTrackChanges.ts line 281-325)

- `comments[0]` → parent (existing behavior)
- `comments[1..n]` → build `replies[]` array
- Each reply: resolve `text` from `contentRich` via `nodeToString`, resolve `authorName` via same chain, resolve `date` via `normalizeDate`

#### E4. Extend `ensureComment()` (docx-document.ts line 1030-1068)

- Generate `paraId` and `durableId` via `generateHexId()`
- Accept optional `parentParaId` parameter
- Store all three on `StoredComment`

#### E5. Process replies in rendering pipeline

When `commentStart` token with `replies` is parsed:
- Call `ensureComment(parent)` → numeric ID `n`, paraId `P`, durableId `D`
- For each reply: call `ensureComment(reply, parentParaId=P)` → numeric IDs `n+1`, `n+2`, ...
- Each reply gets its own `commentRangeStart/End` in document.xml (anchored at same position as parent per reference library's `reply_to_comment()`)
- Each reply gets its own `commentReference` run

#### E6. Extend `generateCommentsXML()` (docx-document.ts line 1083-1126)

Add to each `<w:p>` inside `<w:comment>`:
- `w14:paraId="{comment.paraId}"` attribute
- `w14:textId="{generateHexId()}"` attribute (or fixed value like `"77777777"`)

#### E7. Add `generateCommentsExtendedXML()` (docx-document.ts)

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w15:commentsEx xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"
                xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
                mc:Ignorable="w15">
  <!-- One per comment -->
  <w15:commentEx w15:paraId="{paraId}" w15:done="0"/>
  <!-- Replies include paraIdParent -->
  <w15:commentEx w15:paraId="{replyParaId}" w15:paraIdParent="{parentParaId}" w15:done="0"/>
</w15:commentsEx>
```

#### E8. Add `generateCommentsIdsXML()` (docx-document.ts)

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w16cid:commentsIds xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid"
                    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
                    mc:Ignorable="w16cid">
  <w16cid:commentId w16cid:paraId="{paraId}" w16cid:durableId="{durableId}"/>
</w16cid:commentsIds>
```

#### E9. Add `generateCommentsExtensibleXML()` (docx-document.ts)

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w16cex:commentsExtensible xmlns:w16cex="http://schemas.microsoft.com/office/word/2018/wordml/cex"
                           xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
                           mc:Ignorable="w16cex">
  <w16cex:commentExtensible w16cex:durableId="{durableId}" w16cex:dateUtc="{isoDate}"/>
</w16cex:commentsExtensible>
```

#### E10. Add `generatePeopleXML()` (docx-document.ts)

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w15:people xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"
            xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
            mc:Ignorable="w15">
  <w15:person w15:author="{authorName}">
    <w15:presenceInfo w15:providerId="None" w15:userId="{authorName}"/>
  </w15:person>
</w15:people>
```

Collect unique authors from all `StoredComment` entries.

#### E11. Update namespaces (namespaces.ts)

Add: `w14`, `w15`, `w16cid`, `w16cex`

#### E12. Update Content Types (docx-document.ts `generateContentTypesXML()`)

Add all 5 overrides (comments, commentsExtended, commentsIds, commentsExtensible, people).

#### E13. Update ZIP assembly (html-to-docx.ts)

Add all 5 files to ZIP + all 5 relationships in `document.xml.rels`.

### Import Changes (Detailed)

#### I1. Fix `w:date` reading (comments-reader.js line 18-24)

Add `date: readOptionalAttribute('w:date')` to `documents.comment()` call.

#### I2. Read `w14:paraId` from comment paragraphs (comments-reader.js)

In `readCommentElement()`, after reading body, find first `<w:p>` child and read its `w14:paraId` attribute. Store on comment object.

#### I3. Add `paraId` to document model (documents.js line 149-157)

Add `paraId: options.paraId || null` to `comment()` function return.

#### I4. Add `commentsExtended` to `findPartPaths()` (docx-reader.js line 138-145)

Add explicit `findPartPath()` call with relationship type `http://schemas.microsoft.com/office/2011/relationships/commentsExtended`. Cannot reuse `findPartRelatedToMainDocument()` because it uses wrong base URL.

#### I5. Create `comments-extended-reader.js`

Parse `<w15:commentEx>` elements. Return array of `{paraId, parentParaId}`. The XML uses `w15:` namespace prefix.

#### I6. Read commentsExtended in `read()` (docx-reader.js line 67-76)

Read `commentsExtended.xml` similar to comments reading. Pass threading data through pipeline.

#### I7. Build threading in `commentRangeStart` handler (document-to-html.js line 432-462)

- Build `paraId → commentId` map from comments array (each comment now has `paraId`)
- Build `parentParaId → childCommentIds[]` map from commentsExtended data
- For parent comment's `commentRangeStart`: look up children, add their data to `payload.replies[]`
- Skip emitting tokens for child comments that are already included as replies (they have their own `commentRangeStart` in document.xml but we fold them into parent's token)

#### I8. Extend `DocxImportComment` type (importComments.ts)

```typescript
export type DocxImportCommentReply = {
  authorName?: string;
  authorInitials?: string;
  date?: string;
  text?: string;
};

export type DocxImportComment = {
  // ... existing fields ...
  replies?: DocxImportCommentReply[];
};
```

#### I9. Extend `parseDocxComments()` (importComments.ts)

Extract `replies` from decoded token payload.

#### I10. Extend `applyTrackedCommentsLocal()` (importComments.ts)

Include replies in `discussion.comments[]`:
```typescript
comments: [
  // Parent (existing)
  { contentRich, createdAt, userId, user },
  // Replies (NEW)
  ...(comment.replies ?? []).map(reply => ({
    contentRich: [{ type: 'p', children: [{ text: reply.text ?? '' }] }],
    createdAt: parseDateToDate(reply.date, documentDate),
    userId: formatAuthorAsUserId(reply.authorName),
    user: reply.authorName ? { id: formatAuthorAsUserId(reply.authorName), name: reply.authorName } : undefined,
  })),
],
```

## Data Flow (Export)

```
Discussion {comments: [c1, c2, c3]}
    ↓
resolveCommentMeta() → CommentPayload {id, text, authorName, date, replies: [{authorName, text, date}, ...]}
    ↓
Token: [[DOCX_CMT_START:{id, authorName, text, replies:[...]}]]...[[DOCX_CMT_END:id]]
    ↓
html-to-docx rendering:
  1. Parse token → ensureComment(parent) → numId=0, paraId="00000001", durableId="00000002"
  2. For each reply → ensureComment(reply, parentParaId="00000001") → numId=1, paraId="00000003", durableId="00000004"
  3. document.xml:
     <w:commentRangeStart w:id="0"/>
     <w:commentRangeStart w:id="1"/>  ← reply's own range
     ...text...
     <w:commentRangeEnd w:id="0"/>
     <w:r><w:commentReference w:id="0"/></w:r>
     <w:commentRangeEnd w:id="1"/>
     <w:r><w:commentReference w:id="1"/></w:r>
  4. comments.xml:
     <w:comment w:id="0" w:author="Alice" w:date="..." w:initials="A">
       <w:p w14:paraId="00000001" w14:textId="77777777">
         <w:r>...<w:t>Main comment</w:t></w:r>
       </w:p>
     </w:comment>
     <w:comment w:id="1" w:author="Bob" w:date="..." w:initials="B">
       <w:p w14:paraId="00000003" w14:textId="77777777">
         <w:r>...<w:t>Reply text</w:t></w:r>
       </w:p>
     </w:comment>
  5. commentsExtended.xml:
     <w15:commentEx w15:paraId="00000001" w15:done="0"/>
     <w15:commentEx w15:paraId="00000003" w15:paraIdParent="00000001" w15:done="0"/>
  6. commentsIds.xml:
     <w16cid:commentId w16cid:paraId="00000001" w16cid:durableId="00000002"/>
     <w16cid:commentId w16cid:paraId="00000003" w16cid:durableId="00000004"/>
  7. commentsExtensible.xml:
     <w16cex:commentExtensible w16cex:durableId="00000002" w16cex:dateUtc="..."/>
     <w16cex:commentExtensible w16cex:durableId="00000004" w16cex:dateUtc="..."/>
  8. people.xml:
     <w15:person w15:author="Alice"><w15:presenceInfo .../></w15:person>
     <w15:person w15:author="Bob"><w15:presenceInfo .../></w15:person>
```

## Files to Modify

### Export Pipeline

| # | File | Change |
|---|------|--------|
| E1 | `html-to-docx/tracking.ts` line 31-37 | Add `CommentReply` type, `replies?` to `CommentPayload` |
| E2 | `html-to-docx/tracking.ts` line 59-65 | Add `paraId`, `durableId`, `parentParaId?` to `StoredComment` |
| E3 | `exportTrackChanges.ts` line 281-325 | Extend `resolveCommentMeta()` to iterate all comments, build `replies[]` |
| E4 | `html-to-docx/docx-document.ts` line 1030-1068 | Extend `ensureComment()`: generate `paraId`+`durableId`, accept `parentParaId` |
| E5 | `html-to-docx/docx-document.ts` line 1083-1126 | Add `w14:paraId` and `w14:textId` to `<w:p>` in `generateCommentsXML()` |
| E6 | `html-to-docx/docx-document.ts` new method | Add `generateCommentsExtendedXML()` |
| E7 | `html-to-docx/docx-document.ts` new method | Add `generateCommentsIdsXML()` |
| E8 | `html-to-docx/docx-document.ts` new method | Add `generateCommentsExtensibleXML()` |
| E9 | `html-to-docx/docx-document.ts` new method | Add `generatePeopleXML()` |
| E10 | `html-to-docx/docx-document.ts` line 498-532 | Add 5 content types in `generateContentTypesXML()` |
| E11 | `html-to-docx/html-to-docx.ts` line 330-448 | Add 5 files to ZIP + 5 relationships |
| E12 | `html-to-docx/namespaces.ts` | Add `w14`, `w15`, `w16cid`, `w16cex` namespace URIs |
| E13 | `html-to-docx/constants.ts` | Add `commentsExtendedType`, `commentsIdsType`, `commentsExtensibleType`, `peopleType` constants |
| E14 | Rendering pipeline (helpers.ts or equivalent) | Process `commentStart` token replies: call `ensureComment()` per reply, emit reply `commentRangeStart/End` + `commentReference` |

### Import Pipeline

| # | File | Change |
|---|------|--------|
| I1 | `mammoth.js/lib/docx/comments-reader.js` line 18-24 | Add `date: readOptionalAttribute('w:date')` |
| I2 | `mammoth.js/lib/docx/comments-reader.js` line 18 | Read `w14:paraId` from first `<w:p>` child |
| I3 | `mammoth.js/lib/documents.js` line 149-157 | Add `paraId` property to `comment()` |
| I4 | `mammoth.js/lib/docx/docx-reader.js` line 104-148 | Add `commentsExtended` to `findPartPaths()` with correct relationship type |
| I5 | `mammoth.js/lib/docx/docx-reader.js` line 67-76 | Read commentsExtended.xml, pass to pipeline |
| I6 | NEW: `mammoth.js/lib/docx/comments-extended-reader.js` | Parse `<w15:commentEx>` → `{paraId, parentParaId}[]` |
| I7 | `mammoth.js/lib/document-to-html.js` line 432-462 | Build threading map, add `replies[]` to parent token payload |
| I8 | `importComments.ts` line 54-73 | Add `DocxImportCommentReply` type, `replies?` to `DocxImportComment` |
| I9 | `importComments.ts` line 230-248 | Extract `replies` from decoded payload in `parseDocxComments()` |
| I10 | `importComments.ts` line 793-812 | Include replies in `discussion.comments[]` in `applyTrackedCommentsLocal()` |

### Tests

| # | File | Test |
|---|------|------|
| T1 | `__tests__/roundtrip.spec.tsx` | Threaded comments roundtrip: create discussion w/ replies → export → reimport → verify replies |
| T2 | `__tests__/roundtrip.spec.tsx` | Verify all 5 XML files present in exported ZIP |
| T3 | `__tests__/roundtrip.spec.tsx` | Verify `commentsExtended.xml` has correct `paraIdParent` linking |
| T4 | `__tests__/roundtrip.spec.tsx` | Verify comment date roundtrip |
| T5 | `__tests__/roundtrip.spec.tsx` | Verify `people.xml` contains unique authors |
| T6 | `__tests__/export-replies.spec.ts` | Unit: `resolveCommentMeta()` with multi-comment discussion |
| T7 | `__tests__/import-replies.spec.ts` | Unit: `parseDocxComments()` with replies in token |
| T8 | Test fixture | Create `.docx` with threaded comments for import testing |

## XML Generation Strategy: Templates vs Minimal Generation

### Decision: Use Template-Based Generation (RECOMMENDED)

The project includes five XML template files at `.claude/skills/docx/scripts/templates/`:
- `comments.xml`
- `commentsExtended.xml`
- `commentsIds.xml`
- `commentsExtensible.xml`
- `people.xml`

Each template is an empty shell containing the root element with **30+ namespace declarations** matching what Word itself generates, plus the correct `mc:Ignorable` attribute.

#### Why templates over minimal generation

| Concern | Template approach | Minimal approach (plan's E7-E10 XML) |
|---------|-------------------|--------------------------------------|
| Namespace completeness | ✅ All 30+ namespaces declared — matches Word output exactly | ❌ Only declares namespaces actively used. Validator may pass, but Word or other consumers may warn about missing expected namespaces |
| `mc:Ignorable` correctness | ✅ Lists all extension prefixes: `w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl w16du wp14` | ❌ Plan's XML only lists the primary namespace (e.g., `mc:Ignorable="w15"` in E7). Missing prefixes could cause older Word versions to reject the file |
| `xmlns:w14` on `comments.xml` root | ✅ Template already declares it — solves the HIGH-severity gap from verification | ❌ Plan's `generateCommentsXML()` currently only declares `xmlns:w` — must be manually fixed |
| Maintenance | ✅ Templates are Word-generated — update by saving a new DOCX in Word and extracting | ⚠️ Must manually track namespace changes across Word versions |
| File size | ⚠️ ~2KB per file in namespace declarations | ✅ ~200 bytes per file |
| Implementation | Clone template string, inject child elements into empty root | Build full XML from scratch with xmlbuilder2 |

#### How to use templates in practice

For each of the 5 XML generators (E5, E7, E8, E9, E10):

1. **Embed the template** as a string constant in `docx-document.ts` (or a shared `comment-templates.ts`)
2. **Parse** with xmlbuilder2's `create(templateString)`
3. **Append child elements** to the root (e.g., `<w:comment>`, `<w15:commentEx>`, etc.)
4. **Serialize** to string for ZIP insertion

```typescript
// Example for commentsExtended.xml
const COMMENTS_EXTENDED_TEMPLATE = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w15:commentsEx xmlns:wpc="..." xmlns:mc="..." ... mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl w16du wp14">
</w15:commentsEx>`;

function generateCommentsExtendedXML(comments: StoredComment[]): string {
  const doc = create(COMMENTS_EXTENDED_TEMPLATE);
  const root = doc.root();
  for (const comment of comments) {
    const attrs: Record<string, string> = {
      'w15:paraId': comment.paraId,
      'w15:done': '0',
    };
    if (comment.parentParaId) {
      attrs['w15:paraIdParent'] = comment.parentParaId;
    }
    root.ele('w15:commentEx').att(attrs);
  }
  return doc.end({ prettyPrint: false });
}
```

#### Template source location

Templates are at `.claude/skills/docx/scripts/templates/`. During implementation, copy the root element strings into the TypeScript source as constants. Do NOT read template files at runtime — the export runs in-browser where filesystem access is unavailable.

#### Notable differences between templates

- `comments.xml`, `commentsExtended.xml`, `commentsIds.xml`: Identical 30+ namespace set, identical `mc:Ignorable`
- `commentsExtensible.xml`: Same set + extra `xmlns:cr="http://schemas.microsoft.com/office/comments/2020/reactions"` and `cr` in `mc:Ignorable`
- `people.xml`: **Minimal** — only declares `xmlns:w15`. This is intentional; Word generates `people.xml` with minimal namespaces. Use the template as-is.

#### Impact on plan items

- **E5 (generateCommentsXML)**: Use `comments.xml` template root — solves the missing `xmlns:w14` gap
- **E7 (generateCommentsExtendedXML)**: Use `commentsExtended.xml` template root instead of the minimal XML shown in E7
- **E8 (generateCommentsIdsXML)**: Use `commentsIds.xml` template root instead of minimal XML
- **E9 (generateCommentsExtensibleXML)**: Use `commentsExtensible.xml` template root instead of minimal XML
- **E10 (generatePeopleXML)**: Use `people.xml` template root (already minimal)
- **E6 (existing generateCommentsXML)**: Current code builds root with only `xmlns:w` — replace root namespace block with template's full set

## Resolved Questions

1. **mammoth.js fork access to `commentsExtended.xml`?** — NO. Must add with relationship type `http://schemas.microsoft.com/office/2011/relationships/commentsExtended`.

2. **Does `comments-reader.js` read `w:date`?** — NO. Bug fix needed.

3. **Do we need `people.xml`?** — **YES.** Reference library creates it. Required for proper Word compatibility.

4. **Do we need `commentsIds.xml`?** — **YES.** Reference library creates it with `paraId` ↔ `durableId` mapping.

5. **Do we need `commentsExtensible.xml`?** — **YES.** Reference library creates it with `durableId` and `dateUtc`.

6. **Do reply comments get their own `commentRangeStart/End`?** — **YES.** Reference library's `reply_to_comment()` creates separate range markers + `commentReference` run for each reply in document.xml, anchored near parent's markers.

7. **What is the `paraId` constraint?** — Must be 8-char hex < `0x7FFFFFFF` per OOXML spec (reference: `_generate_hex_id()`).

8. **Are `paraId` and `durableId` the same?** — **NO.** Two independent hex IDs per comment. `paraId` links comments.xml ↔ commentsExtended.xml ↔ commentsIds.xml. `durableId` links commentsIds.xml ↔ commentsExtensible.xml.

9. **Can the `docx` npm package handle comment threading?** — **NO.** It supports basic comments only. Reply/threading (`commentsExtended.xml`) is explicitly unsupported per maintainer (Discussion #1868). Manual XML generation via `xmlbuilder2` is required.

10. **Should we use the XML template files for generation?** — **YES.** Templates at `.claude/skills/docx/scripts/templates/` contain Word's full 30+ namespace declarations. Using them as root element shells solves multiple verification gaps: missing `xmlns:w14` on `comments.xml`, incomplete `mc:Ignorable`, and namespace declaration completeness. See "XML Generation Strategy" section above.

11. **`xml:space="preserve"` on `<w:t>` in comments?** — **YES, always.** The existing `generateCommentsXML()` already does this (`docx-document.ts` line 1113). Must be maintained for all comment text runs. Prevents whitespace stripping by XML parsers.

12. **`rId` collision avoidance?** — Must scan existing relationships in `document.xml.rels` to find max numeric suffix, then assign `rId{max+1}` through `rId{max+5}`. Do NOT hardcode rId values.

13. **`paraId` uniqueness scope?** — Document-wide. `paraId` values must be unique across ALL XML files in the ZIP (`document.xml`, `comments.xml`, headers, footers). Use a Set to track allocated IDs.

14. **Are `commentsIds.xml` and `commentsExtensible.xml` mandatory?** — Empirically, Word opens files with only `comments.xml` + `commentsExtended.xml` + `people.xml`. However, the reference Python library generates all 5, and Word itself always generates all 5. Generate all 5 for maximum compatibility.

## Unresolved Questions

1. How does the rendering pipeline in `html-to-docx/helpers.ts` process `commentStart` tokens to call `ensureComment()`? Need to trace VDOM → XML path at implementation time (E14).
