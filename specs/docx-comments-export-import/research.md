# Research: DOCX Comments & Subcomments Export/Import

**Date**: 2026-02-01 | **Status**: Complete

## Research Items

### R1: mammoth.js fork access to commentsExtended.xml

**Question**: Does the mammoth.js fork already have access to `commentsExtended.xml` during DOCX parsing?

**Evidence**:
- `docx-reader.js` line 104-148: `findPartPaths()` returns `{mainDocument, comments, endnotes, footnotes, numbering, styles}` — no `commentsExtended`
- `findPartRelatedToMainDocument()` (line 126-136) constructs relationship type as `http://schemas.openxmlformats.org/officeDocument/2006/relationships/ + name`
- The standard `commentsExtended` relationship type uses a *different* base: `http://schemas.microsoft.com/office/2011/relationships/commentsExtended`
- The `read()` function (line 20-102) reads `comments` at line 67-76 but has no equivalent for `commentsExtended`

**Decision**: Must add explicit support. Two changes needed:
1. Add `commentsExtended` path to `findPartPaths()` using explicit `findPartPath()` call with correct relationship type
2. Read the XML in `read()` and pass threading data through the pipeline

**Alternatives considered**:
- Using fallback path `word/commentsExtended.xml` only: Rejected because some DOCX files store parts in different locations based on relationships
- Parsing in importComments.ts instead: Rejected because mammoth already handles DOCX → HTML conversion; threading should be resolved before token emission

### R2: Comment date import bug

**Question**: Does the mammoth.js fork correctly import `w:date` from `<w:comment>` elements?

**Evidence**:
- `comments-reader.js` line 11-25: `readCommentElement()` reads `w:author` and `w:initials` via `readOptionalAttribute()` but **never reads `w:date`**
- `documents.js` line 149-157: `comment()` function accepts `date` and sets `date: options.date || null`
- Since `date` is never passed by the reader, `comment.date` is always `null`
- `document-to-html.js` line 451: `payload.date = comment.date` — always `null`
- This propagates to the import token where `date` is always missing

**Decision**: Fix by adding `date: readOptionalAttribute('w:date')` to the `documents.comment()` call in `comments-reader.js`.

**Alternatives considered**: None — this is a straightforward bug fix.

### R3: commentsExtended.xml namespace and relationship type

**Question**: What exact namespaces and relationship types does commentsExtended use?

**Evidence** (from OOXML specification):
- Relationship type: `http://schemas.microsoft.com/office/2011/relationships/commentsExtended`
- XML namespace (w15): `http://schemas.microsoft.com/office/word/2012/wordml`
- XML namespace (w14, for paraId): `http://schemas.microsoft.com/office/word/2010/wordml`
- Content type: `application/vnd.openxmlformats-officedocument.wordprocessingml.commentsExtended+xml`
- Root element: `<w15:commentsEx>`
- Child elements: `<w15:commentEx>` with attributes `w15:paraId`, `w15:paraIdParent` (optional), `w15:done`

**Decision**: Use these exact namespaces. Add `w14` and `w15` to `namespaces.ts`.

### R4: paraId mapping between comments.xml and commentsExtended.xml

**Question**: How does commentsExtended.xml link to specific comments?

**Evidence** (from OOXML specification):
- Each `<w:comment>` in comments.xml contains `<w:p>` paragraph elements
- Each `<w:p>` can have a `w14:paraId` attribute (8-char hex string)
- `commentsExtended.xml` uses `w15:paraId` to reference these paragraph IDs
- Threading: `w15:paraIdParent` on a child comment's `<w15:commentEx>` points to the parent comment's `w15:paraId`
- The mapping is: comment's first paragraph's `w14:paraId` → same value in `w15:paraId` of `<w15:commentEx>`

**Decision**:
- On export: Generate unique `paraId` hex strings for each comment, store on `StoredComment`
- On import: Read `w14:paraId` from first `<w:p>` of each `<w:comment>` in `comments-reader.js`, build parent→children map in `document-to-html.js`

### R5: Existing token payload size limits

**Question**: Are there size limits on the token payload that could affect replies?

**Evidence**:
- Tokens use `encodeURIComponent(JSON.stringify(payload))` (tracking.ts line 342)
- `parseDocxComments()` (importComments.ts line 230-251) uses `JSON.parse(decodeURIComponent(rawPayload))`
- No explicit size limits in the regex parsing (`/\[\[DOCX_CMT_START:(.*?)\]\]/g` — lazy match)
- Tokens are embedded in HTML text nodes processed by DOMParser
- Practical limit: browser string handling, typically no issue for reasonable reply counts

**Decision**: No size limit concerns for typical use (< 100 replies per discussion). The token approach works.

### R6: API mode vs Local mode for replies

**Question**: How should reply import work in API mode (`applyTrackedComments`) vs Local mode (`applyTrackedCommentsLocal`)?

**Evidence**:
- API mode (line 496-706): Creates discussion via `createDiscussionWithComment.mutateAsync()` which returns `{id: string}` — no support for creating multiple comments in one call
- Local mode (line 715-901): Creates `DocxImportDiscussion` with `comments[]` array — already supports multiple comments structurally

**Decision**:
- Local mode: Include all replies in `discussion.comments[]` — full support
- API mode: Create parent comment only (backward compatible). Reply creation requires API changes outside scope
- Document this limitation for API mode consumers

### R7: helpers.ts rendering pipeline for comment tokens

**Question**: Where exactly in the html-to-docx rendering pipeline are comment tokens processed and `ensureComment()` called?

**Status**: Deferred to implementation phase. Need to read `helpers.ts` rendering code to trace VDOM → XML conversion path where `splitDocxTrackingTokens()` is called and comment tokens are handled.

### R8: xml:space="preserve" requirement for comment text

**Question**: Must `<w:t>` elements inside `<w:comment>` have `xml:space="preserve"` when text contains leading/trailing whitespace?

**Evidence** (from DOCXSchemaValidator `validate_whitespace_preservation()` and OOXML spec):
- The validator (`docx.py` line 72-122) checks ALL `<w:t>` elements in document.xml: if `elem.text` starts or ends with whitespace and lacks `xml:space="preserve"`, it fails validation
- OOXML spec (ISO/IEC 29500-1, section 17.3.3.31 `<w:t>`): "If the attribute is not specified, the value `default` is assumed, which means that whitespace [...] is subject to default processing" — i.e., leading/trailing spaces get stripped by XML parsers
- The validator currently only checks `document.xml`, but the same rule applies to `comments.xml` since `<w:t>` elements appear inside `<w:comment>/<w:p>/<w:r>/<w:t>`
- **Current export code already handles this**: `docx-document.ts` line 1113 always emits `.att('@xml', 'space', 'preserve')` on every `<w:t>` in `generateCommentsXML()` — this is correct and safe
- **Import side**: mammoth.js `comments-reader.js` does not need to worry about this since it reads the parsed text content, not raw XML

**Decision**: No action needed for export (already correct). For any future code that generates `<w:t>` elements in comment XML, always include `xml:space="preserve"`. Add this as a code comment in `generateCommentsXML()`.

### R9: Validation requirements for generated comment XML files

**Question**: What validation checks must pass for the 5 comment-related XML files (comments.xml, commentsExtended.xml, commentsIds.xml, commentsExtensible.xml, people.xml)?

**Evidence** (from DOCXSchemaValidator 10-check pipeline):
1. **XML well-formedness** (Test 0): All generated XML must parse without errors
2. **Namespace declarations** (Test 1): Every namespace prefix used in the file must be declared on the root element. The `mc:Ignorable` attribute must only list prefixes that are declared
3. **Unique IDs** (Test 2): Comment `w:id` attributes must be unique within `comments.xml`. The validator has `"comment": ("id", "file")` in `UNIQUE_ID_REQUIREMENTS`
4. **File references** (Test 3): Every file in the ZIP must be referenced by a `.rels` file. Every `.rels` target must point to an existing file. **Unreferenced files cause CRITICAL corruption**
5. **Content types** (Test 4): Every XML file in the ZIP (except `.rels` and `[Content_Types].xml`) must have a matching Override entry in `[Content_Types].xml`
6. **XSD schema validation** (Test 5): `commentsExtended.xml` validates against `microsoft/wml-2012.xsd`, `commentsIds.xml` against `microsoft/wml-cid-2016.xsd`, `commentsExtensible.xml` against `microsoft/wml-cex-2018.xsd` (per `SCHEMA_MAPPINGS` in `base.py` lines 57-60)
7. **Whitespace** (Test 6): `<w:t>` in comments.xml must have `xml:space="preserve"` when text has leading/trailing whitespace
8. **Relationship IDs** (Test 9): All `r:id` attributes in XML must point to valid entries in the corresponding `.rels` file
9. **Paragraph count** (informational): Adding comment files must NOT alter the paragraph count in `document.xml`

**Current state of export code**:
- `html-to-docx.ts` line 330-337: Creates relationship for `comments.xml` only
- `docx-document.ts` line 516-529: Adds content type Override for `comments.xml` only
- **Missing**: No relationship, content type, or file generation for `commentsExtended.xml`, `commentsIds.xml`, `commentsExtensible.xml`, or `people.xml`

**Decision**: When implementing subcomment export, must add for each new file:
1. Relationship entry via `createDocumentRelationships()` with correct relationship type
2. Content type Override in `[Content_Types].xml` with correct ContentType string
3. The actual XML file in `word/` folder
4. Ensure all namespace prefixes used in the file body are declared on the root element

### R10: Namespace declaration requirements on comment XML root elements

**Question**: What namespaces must be declared on the root elements of generated comment XML files?

**Evidence** (from template files and DOCXSchemaValidator):
- The validator's `validate_namespaces()` (`base.py` line 156-184) checks that all prefixes listed in `mc:Ignorable` are declared on the root element
- Template `commentsExtended.xml` declares 30+ namespaces on `<w15:commentsEx>` root, including `w`, `w14`, `w15`, `w16cid`, `mc`, etc.
- Template `commentsIds.xml` declares the same set on `<w16cid:commentsIds>` root
- Both templates include `mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl w16du wp14"`
- **Current `generateCommentsXML()` only declares the `w` namespace** (`docx-document.ts` line 1086): `namespaceAlias: { w: namespaces.w }`. This is sufficient for `comments.xml` since it only uses `w:` prefixed elements
- For `commentsExtended.xml`, the root element MUST declare at minimum: `w15` (for `commentsEx`, `commentEx`), `w14` (for `paraId` values), and `mc` (for `Ignorable`)
- For `commentsIds.xml`, the root element MUST declare: `w16cid` (root namespace), `w14` (for `paraId`), and `mc`

**Decision**: When generating new comment XML files:
- Use the full namespace set from the template files as a starting point
- At minimum declare every prefix actually used in the generated content
- Always include `mc:Ignorable` listing the Microsoft extension prefixes
- **Do not** generate a minimal namespace set — Word and validators may reject files missing expected declarations

### R11: Content type declarations for all comment-related files

**Question**: What exact content types are needed in `[Content_Types].xml` for each comment file?

**Evidence** (from OOXML spec, template files, and validator):
- `comments.xml`: `application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml` (already in `docx-document.ts` line 524)
- `commentsExtended.xml`: `application/vnd.openxmlformats-officedocument.wordprocessingml.commentsExtended+xml` (mentioned in R3)
- `commentsIds.xml`: `application/vnd.openxmlformats-officedocument.wordprocessingml.commentsIds+xml`
- `commentsExtensible.xml`: `application/vnd.openxmlformats-officedocument.wordprocessingml.commentsExtensible+xml`
- `people.xml`: `application/vnd.openxmlformats-officedocument.wordprocessingml.people+xml`

**Relationship types** (for `document.xml.rels`):
- `comments.xml`: `http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments` (already used)
- `commentsExtended.xml`: `http://schemas.microsoft.com/office/2011/relationships/commentsExtended`
- `commentsIds.xml`: `http://schemas.microsoft.com/office/2016/09/relationships/commentsIds`
- `commentsExtensible.xml`: `http://schemas.microsoft.com/office/2018/08/relationships/commentsExtensible`
- `people.xml`: `http://schemas.microsoft.com/office/2011/relationships/people`

**Decision**: Store these as constants in `namespaces.ts` or a new `comment-constants.ts`. The validator will fail (Tests 3, 4) if any file exists in the ZIP without both a relationship and content type entry.

### R12: Unique ID constraints across comment files

**Question**: What ID uniqueness rules apply across comment-related XML files?

**Evidence** (from DOCXSchemaValidator `validate_unique_ids()` and OOXML spec):
- `w:id` on `<w:comment>` must be unique within `comments.xml` (validator: `"comment": ("id", "file")`)
- `w:id` on `<w:commentRangeStart>` and `<w:commentRangeEnd>` must be unique within `document.xml` and must cross-reference to `comments.xml` IDs
- `w14:paraId` attributes (8-char hex) must be globally unique across the entire document: the same paraId cannot appear in `document.xml` and `comments.xml`
- `w15:paraId` in `commentsExtended.xml` must match exactly one `w14:paraId` in `comments.xml`
- `w16cid:durableId` in `commentsIds.xml` (if generated) is a 32-bit integer, must be unique

**Decision**: The paraId generator must check against all existing paraIds in the document (from both `document.xml` and `comments.xml` paragraphs). Use a Set to track allocated IDs and generate new hex strings that do not collide.

---

## Corrections to Existing Research Items

### R3 correction: Missing content types for additional files
R3 mentions the content type for `commentsExtended.xml` but does not list content types or relationship types for `commentsIds.xml`, `commentsExtensible.xml`, or `people.xml`. These are now covered in R11.

### R4 correction: paraId uniqueness scope
R4 states "Generate unique paraId hex strings for each comment" but does not mention that paraIds must be unique across ALL XML files in the ZIP (document.xml paragraphs also have paraIds). Updated guidance in R12.

---

## Controversies / Items Needing OOXML Spec Citation

1. **Are commentsExtended/commentsIds/commentsExtensible mandatory when comments exist?** Word generates all 5 files when saving with comments, but older OOXML consumers may not require them. Need citation from ISO/IEC 29500-4 or Microsoft documentation on which files are optional vs required for comment threading.

2. **Minimum namespace set on root elements**: The template files declare 30+ namespaces. Is this because Word always dumps its full namespace set, or does the spec require all of them? The validator only checks that `mc:Ignorable` prefixes are declared, not that unused namespaces are present. Need spec citation on whether a minimal set (only used prefixes) is valid.

3. **paraId generation algorithm**: OOXML spec says paraId is an 8-character hex string, but does not specify whether it must be random, sequential, or derived from content. Word appears to use random generation. Need citation on uniqueness scope — is it per-file or per-document?

4. **w:delText inside w:comment**: The validator checks that `<w:t>` must not appear inside `<w:del>` (must use `<w:delText>`). If a comment's text content contains tracked deletions (rare but possible in rich comments), this constraint applies inside `comments.xml` too. No current research item covers rich comment content with tracked changes.
