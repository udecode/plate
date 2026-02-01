                               
  Python → TypeScript Mapping                               
                                                            
  1. _generate_hex_id() → generateHexId()                   
  Python: Document._generate_hex_id()                       
  TypeScript: generateHexId() in tracking.ts:113-124        
  Both generate 8-char uppercase hex < 0x7FFFFFFF with      
  uniqueness via a Set (allocated_ids / allocatedIds). Our  
  version also exports resetAllocatedIds()                  
  (tracking.ts:108-110) for inter-document cleanup.         
                                                            
  ---                                                       
  2. Document.__init__() state → DocxDocument constructor   
  Python field: self.comments = []                          
  TypeScript field: this.comments: StoredComment[] = []     
  Location: docx-document.ts:483                            
  ────────────────────────────────────────                  
  Python field: self.comment_id_map = {}                    
  TypeScript field: this.commentIdMap = new Map()           
  Location: docx-document.ts:484                            
  ────────────────────────────────────────                  
  Python field: self.last_comment_id = 0                    
  TypeScript field: this.lastCommentId = 0                  
  Location: docx-document.ts:485                            
  ────────────────────────────────────────                  
  Python field: self.people = set()                         
  TypeScript field: Computed on-the-fly in                  
    generatePeopleXML()                                     
  Location: docx-document.ts:1291                           
  ---                                                       
  3. add_comment() → ensureComment() + token processing     
  Python: Document.add_comment(text, author, date, initials)
  TypeScript: DocxDocument.ensureComment(data,              
  parentParaId?)                                            
     at docx-document.ts:1084-1125                          
  Both:                                                     
  - Auto-increment numeric comment IDs                      
  - Map string IDs → numeric IDs                            
  - Store paraId + durableId (hex IDs)                      
  - Default author to 'unknown'                             
                                                            
  Key difference: Our ensureComment() is idempotent --      
  calling it twice with the same id updates missing fields  
  rather than creating duplicates. The Python version       
  creates a new comment each time.                          
                                                            
  The actual call site for adding parent comments is in     
  xml-builder.ts when processing commentStart tokens (the   
  large file at the part.type === 'commentStart' branch).   
                                                            
  ---                                                       
  4. reply_to_comment() → Reply handling in xml-builder.ts  
  Python: Document.reply_to_comment(parent_id, text, author,
                                                            
    date)                                                   
  TypeScript: Reply loop in xml-builder.ts commentStart     
    handler                                                 
  In our code, when a commentStart token has data.replies,  
  the handler iterates and calls ensureComment() for each   
  reply, passing parentComment.paraId as the parentParaId:  
                                                            
  // xml-builder.ts (commentStart handler)                  
  if (data.replies && data.replies.length > 0 &&            
  docxDocumentInstance.comments &&                          
  docxDocumentInstance.ensureComment) {                     
    const parentComment =                                   
  docxDocumentInstance.comments.find(c => c.id ===          
  parentCommentId);                                         
    data.replies.forEach((reply) => {                       
      const replyCommentId =                                
  docxDocumentInstance.ensureComment!({...reply},           
  parentComment?.paraId);                                   
                                                            
  fragments.push(buildCommentRangeStart(replyCommentId));   
    });                                                     
  }                                                         
                                                            
  ---                                                       
  5. _add_to_comments_xml() → generateCommentsXML()         
  Python: DocxXMLEditor._add_to_comments_xml()              
  TypeScript: DocxDocument.generateCommentsXML() at         
    docx-document.ts:1142-1221                              
  Both produce <w:comment> elements with:                   
  - w:id, w:author, w:initials, w:date attributes           
  - <w:p> with w14:paraId, w14:textId                       
  - <w:pPr><w:pStyle w:val="CommentText"/></w:pPr>          
  - First paragraph gets <w:r><w:rPr><w:rStyle              
  w:val="CommentReference"/></w:rPr><w:annotationRef/></w:r>
  - Text run with <w:rPr><w:color w:val="000000"/><w:sz     
  w:val="20"/><w:szCs w:val="20"/></w:rPr>                  
  - <w:t xml:space="preserve">text</w:t>                    
                                                            
  Root element uses COMMENTS_TEMPLATE                       
  (comment-templates.ts:13-15) with 30+ namespace           
  declarations.                                             
                                                            
  ---                                                       
  6. _add_to_comments_extended_xml() →                      
  generateCommentsExtendedXML()                             
  Python: DocxXMLEditor._add_to_comments_extended_xml()     
  TypeScript: DocxDocument.generateCommentsExtendedXML() at 
    docx-document.ts:1227-1242                              
  Both produce <w15:commentEx> elements with:               
  - w15:paraId linking to comments.xml                      
  - w15:done="0"                                            
  - w15:paraIdParent (only for replies, links to parent's   
  paraId)                                                   
                                                            
  Root element uses COMMENTS_EXTENDED_TEMPLATE              
  (comment-templates.ts:18-20).                             
                                                            
  ---                                                       
  7. _add_to_comments_ids_xml() → generateCommentsIdsXML()  
  Python: DocxXMLEditor._add_to_comments_ids_xml()          
  TypeScript: DocxDocument.generateCommentsIdsXML() at      
    docx-document.ts:1248-1260                              
  Both produce <w16cid:commentId> elements with:            
  - w16cid:paraId linking to comments.xml /                 
  commentsExtended.xml                                      
  - w16cid:durableId for cross-session stability            
                                                            
  Root element uses COMMENTS_IDS_TEMPLATE                   
  (comment-templates.ts:23-25).                             
                                                            
  ---                                                       
  8. _add_to_comments_extensible_xml() →                    
  generateCommentsExtensibleXML()                           
  Python: DocxXMLEditor._add_to_comments_extensible_xml()   
  TypeScript: DocxDocument.generateCommentsExtensibleXML()  
  at                                                        
     docx-document.ts:1266-1280                             
  Both produce <w16cex:commentExtensible> elements with:    
  - w16cex:durableId                                        
  - w16cex:dateUtc (optional, if date exists)               
                                                            
  Root element uses COMMENTS_EXTENSIBLE_TEMPLATE            
  (comment-templates.ts:28-30).                             
                                                            
  ---                                                       
  9. _add_to_people_xml() → generatePeopleXML()             
  Python: DocxXMLEditor._add_to_people_xml()                
  TypeScript: DocxDocument.generatePeopleXML() at           
    docx-document.ts:1286-1310                              
  Both produce <w15:person> elements with:                  
  - w15:author attribute                                    
  - <w15:presenceInfo w15:providerId="None"                 
  w15:userId="{author}"/>                                   
  - Unique authors only (Python uses self.people set, TS    
  uses new Set<string>() locally)                           
                                                            
  Root element uses PEOPLE_TEMPLATE                         
  (comment-templates.ts:33-35).                             
                                                            
  ---                                                       
  10. _ensure_comment_relationships() →                     
  createDocumentRelationships() switch cases                
  Python: DocxXMLEditor._ensure_comment_relationships()     
  TypeScript: Switch cases in docx-document.ts:1005-1036 +  
    calls in html-to-docx.ts:338-501                        
  Relationship types mapped in createDocumentRelationships()
   switch:                                                  
  Type constant: commentsType                               
  Relationship URI: namespaces.comments (2006)              
  File: docx-document.ts:1012-1014                          
  ────────────────────────────────────────                  
  Type constant: commentsExtendedType                       
  Relationship URI: commentsExtendedRelationshipType (2011) 
  File: docx-document.ts:1015-1017                          
  ────────────────────────────────────────                  
  Type constant: commentsIdsType                            
  Relationship URI: commentsIdsRelationshipType (2016/09)   
  File: docx-document.ts:1018-1020                          
  ────────────────────────────────────────                  
  Type constant: commentsExtensibleType                     
  Relationship URI: commentsExtensibleRelationshipType      
    (2018/08)                                               
  File: docx-document.ts:1021-1023                          
  ────────────────────────────────────────                  
  Type constant: peopleType                                 
  Relationship URI: peopleRelationshipType (2011)           
  File: docx-document.ts:1024-1026                          
  Relationship URIs in constants.ts:188-195:                
  - commentsExtendedRelationshipType = http://schemas.micros
  oft.com/office/2011/relationships/commentsExtended        
  - commentsIdsRelationshipType = http://schemas.microsoft.c
  om/office/2016/09/relationships/commentsIds               
  - commentsExtensibleRelationshipType = http://schemas.micr
  osoft.com/office/2018/08/relationships/commentsExtensible 
  - peopleRelationshipType = http://schemas.microsoft.com/of
  fice/2011/relationships/people                            
                                                            
  The actual relationship creation calls happen in          
  html-to-docx.ts:338-345 (comments.xml) and                
  html-to-docx.ts:478-501 (the 4 extended files).           
                                                            
  ---                                                       
  11. _ensure_comment_content_types() →                     
  generateContentTypesXML()                                 
  Python: DocxXMLEditor._ensure_comment_content_types()     
  TypeScript: DocxDocument.generateContentTypesXML() at     
    docx-document.ts:536-571                                
  Both add 5 Override entries when comments exist:          
  PartName: /word/comments.xml                              
  ContentType constant: application/vnd.openxmlformats-offic
  edocument.wordprocessingml.comments+xml                   
  ────────────────────────────────────────                  
  PartName: /word/commentsExtended.xml                      
  ContentType constant: commentsExtendedContentType         
    (constants.ts:178-179)                                  
  ────────────────────────────────────────                  
  PartName: /word/commentsIds.xml                           
  ContentType constant: commentsIdsContentType              
    (constants.ts:180-181)                                  
  ────────────────────────────────────────                  
  PartName: /word/commentsExtensible.xml                    
  ContentType constant: commentsExtensibleContentType       
    (constants.ts:182-183)                                  
  ────────────────────────────────────────                  
  PartName: /word/people.xml                                
  ContentType constant: peopleContentType                   
    (constants.ts:184-185)                                  
  ---                                                       
  12. ZIP Assembly → addFilesToContainer()                  
  Python: Document.save() / zipfile writes                  
  TypeScript: addFilesToContainer() in                      
    html-to-docx.ts:294-522                                 
  The ZIP assembly at html-to-docx.ts:450-501 conditionally 
  adds all 5 XML files + 5 relationships when               
  docxDocument.comments.length > 0.                         
                                                            
  ---                                                       
  13. _add_comment_range_start/end() → XML fragment builders
  Python: DocxXMLEditor._add_comment_range_start()          
  TypeScript: buildCommentRangeStart() at                   
  tracking.ts:281-286                                       
  ────────────────────────────────────────                  
  Python: DocxXMLEditor._add_comment_range_end()            
  TypeScript: buildCommentRangeEnd() at tracking.ts:291-296 
  ────────────────────────────────────────                  
  Python: DocxXMLEditor._add_comment_reference()            
  TypeScript: buildCommentReferenceRun() at                 
    tracking.ts:301-308                                     
  These are called from xml-builder.ts during token         
  processing.                                               
                                                            
  ---                                                       
  14. validate() → Not yet implemented                      
                                                            
  The Python reference's validate() method (OOXML schema    
  validation) maps to Phase 8 tasks (T055-T063) which are   
  still pending.                                            
                                                            
  ---                                                       
  15. Namespace URIs                                        
                                                            
  All namespace URIs from the Python reference are defined  
  in namespaces.ts:85-140, including the comment-specific   
  ones:                                                     
  - w14 (docx-document.ts:1169) →                           
  http://schemas.microsoft.com/office/word/2010/wordml      
  - w15 (docx-document.ts:1232) →                           
  http://schemas.microsoft.com/office/word/2012/wordml      
  - w16cid (docx-document.ts:1253) →                        
  http://schemas.microsoft.com/office/word/2016/wordml/cid  
  - w16cex (docx-document.ts:1271) →                        
  http://schemas.microsoft.com/office/word/2018/wordml/cex  
                                                            
  ---                                                       
  Summary: Coverage                                         
  Python Feature: _generate_hex_id()                        
  TS Status: Done                                           
  Location: tracking.ts:113-124                             
  ────────────────────────────────────────                  
  Python Feature: add_comment()                             
  TS Status: Done                                           
  Location: docx-document.ts:1084-1125                      
  ────────────────────────────────────────                  
  Python Feature: reply_to_comment()                        
  TS Status: Done                                           
  Location: xml-builder.ts commentStart handler             
  ────────────────────────────────────────                  
  Python Feature: _add_to_comments_xml()                    
  TS Status: Done                                           
  Location: docx-document.ts:1142-1221                      
  ────────────────────────────────────────                  
  Python Feature: _add_to_comments_extended_xml()           
  TS Status: Done                                           
  Location: docx-document.ts:1227-1242                      
  ────────────────────────────────────────                  
  Python Feature: _add_to_comments_ids_xml()                
  TS Status: Done                                           
  Location: docx-document.ts:1248-1260                      
  ────────────────────────────────────────                  
  Python Feature: _add_to_comments_extensible_xml()         
  TS Status: Done                                           
  Location: docx-document.ts:1266-1280                      
  ────────────────────────────────────────                  
  Python Feature: _add_to_people_xml()                      
  TS Status: Done                                           
  Location: docx-document.ts:1286-1310                      
  ────────────────────────────────────────                  
  Python Feature: _ensure_comment_relationships()           
  TS Status: Done                                           
  Location: docx-document.ts:1005-1036 +                    
    html-to-docx.ts:338-501                                 
  ────────────────────────────────────────                  
  Python Feature: _ensure_comment_content_types()           
  TS Status: Done                                           
  Location: docx-document.ts:536-571                        
  ────────────────────────────────────────                  
  Python Feature: ZIP assembly                              
  TS Status: Done                                           
  Location: html-to-docx.ts:450-501                         
  ────────────────────────────────────────                  
  Python Feature: Range start/end/reference                 
  TS Status: Done                                           
  Location: tracking.ts:281-308                   

                               
  ---                                                       
  Nuance 1: validate_whitespace_preservation() —            
  xml:space="preserve" on all w:t                           
                                                            
  Python validator check: Every <w:t> with leading/trailing 
  whitespace must have xml:space="preserve".                
                                                            
  Our code: Always set unconditionally, not just when       
  whitespace present.                                       
                                                            
  There are exactly 3 code paths that emit w:t or w:delText:
  Code path: buildTextElement()                             
  File:line: tracking.ts:259-265                            
  Always sets xml:space="preserve"?: .att('@xml', 'space',  
    'preserve') —                                           
    unconditional                                           
  ────────────────────────────────────────                  
  Code path: buildDeletedTextElement()                      
  File:line: tracking.ts:270-276                            
  Always sets xml:space="preserve"?: .att('@xml', 'space',  
    'preserve') —                                           
    unconditional                                           
  ────────────────────────────────────────                  
  Code path: Legacy buildRun() in xml-builder               
  File:line: xml-builder.ts:406-412                         
  Always sets xml:space="preserve"?: .att('@xml', 'space',  
    'preserve') —                                           
    unconditional                                           
  ────────────────────────────────────────                  
  Code path: generateCommentsXML() comment text             
  File:line: docx-document.ts:1207-1211                     
  Always sets xml:space="preserve"?:                        
  .att('http://www.w3.org/XML/1998/namespace',              
     'space', 'preserve') —                                 
    unconditional                                           
  We don't need to validate because we always set           
  xml:space="preserve" on every text element, regardless of 
  whether whitespace is present. The validator checks for   
  the conditional case; we eliminate the bug class entirely.
                                                            
  ---                                                       
  Nuance 2: validate_deletions() — No w:t inside w:del      
                                                            
  Python validator check: w:t must NOT appear as descendant 
  of w:del (must use w:delText instead).                    
                                                            
  Our code: Structurally impossible via the deleted flag.   
                                                            
  The critical code path is in buildRunsFromTextWithTokens()
   at xml-builder.ts:483-498:                               
                                                            
  // xml-builder.ts:487-491                                 
  const activeSuggestion: ActiveSuggestion | undefined =    
    trackingState.suggestionStack[trackingState.suggestionSt
  ack.length - 1];                                          
  const runFragment = buildTextRunFragment(part.value,      
  attributes, {                                             
    deleted: activeSuggestion?.type === 'remove',  // ← KEY 
  LINE                                                      
  });                                                       
                                                            
  Then in buildTextRunFragment() at xml-builder.ts:417-435: 
                                                            
  // xml-builder.ts:429-431                                 
  runFragment.import(                                       
    options?.deleted ? buildDeletedTextElement(text) :      
  buildTextElement(text)                                    
  );                                                        
                                                            
  The decision tree:                                        
  1. When inside a delStart..delEnd range,                  
  activeSuggestion.type === 'remove' → deleted: true        
  2. deleted: true → calls buildDeletedTextElement() → emits
   <w:delText>                                              
  3. deleted: false (or no suggestion) → calls              
  buildTextElement() → emits <w:t>                          
                                                            
  Then at xml-builder.ts:493-496, the run is wrapped:       
  fragments.push(                                           
    activeSuggestion                                        
      ? wrapRunWithSuggestion(runFragment, activeSuggestion)
      : runFragment                                         
  );                                                        
                                                            
  wrapRunWithSuggestion() (tracking.ts:313-335) wraps with  
  <w:del> when type === 'remove'.                           
                                                            
  Result: <w:del> always contains <w:delText>, never <w:t>. 
  The two decisions (buildDeletedTextElement vs             
  buildTextElement, and <w:del> vs <w:ins>) are coupled to  
  the same type === 'remove' flag, making the invalid       
  combination structurally unreachable.                     
                                                            
  ---                                                       
  Nuance 3: validate_insertions() — No w:delText in w:ins   
  (unless nested w:del)                                     
                                                            
  Python validator XPath:                                   
  .//w:ins//w:delText[not(ancestor::w:del)]                 
                                                            
  Our code: Same structural coupling prevents this.         
                                                            
  The deleted flag that selects buildDeletedTextElement() is
   set only when activeSuggestion?.type === 'remove'        
  (xml-builder.ts:490). When type === 'remove',             
  wrapRunWithSuggestion() wraps with <w:del>, never <w:ins>.
                                                            
  Conversely, when type === 'insert', deleted is false, so  
  buildTextElement() (emitting <w:t>) is called, and        
  wrapRunWithSuggestion() wraps with <w:ins>.               
                                                            
  The invalid combination <w:ins><w:r><w:delText> is        
  unreachable because both element name and wrapper tag are 
  derived from the same suggestion.type value:              
                                                            
  type === 'remove' → buildDeletedTextElement (w:delText) + 
  wrap as w:del  ✓                                          
  type === 'insert' → buildTextElement (w:t)               +
   wrap as w:ins ✓                                          
  type === 'remove' → buildDeletedTextElement (w:delText) + 
  wrap as w:ins  ✗ IMPOSSIBLE                               
  type === 'insert' → buildTextElement (w:t)               +
   wrap as w:del ✗ IMPOSSIBLE                               
                                                            
  ---                                                       
  Nuance 4: Suggestion stack prevents cross-contamination   
                                                            
  Python validator concern: Nested tracked changes could    
  produce invalid combos.                                   
                                                            
  Our code: The suggestionStack (xml-builder.ts:584-587)    
  tracks active suggestions. Only the top of the stack      
  determines the text element type. When a delEnd or insEnd 
  token pops the stack (xml-builder.ts:591-595), subsequent 
  text reverts to the outer context. The stack is filtered  
  by ID to prevent duplicates (xml-builder.ts:584).         
                                                            
  ---                                                       
  Nuance 5: Paragraph count preservation                    
                                                            
  Python validator: compare_paragraph_counts() compares     
  original vs generated.                                    
                                                            
  Our code: Not explicitly validated, but paragraph         
  structure is preserved because convertVTreeToXML() (called
   via renderDocumentFile()) generates one <w:p> per        
  paragraph-level VTree node.                               
                                                            
  ---                                                       
  Nuance 6: Namespace declarations + Content types +        
  Relationship IDs                                          
                                                            
  Python validator checks: validate_namespaces(),           
  validate_content_types(), validate_file_references(),     
  validate_all_relationship_ids().                          
                                                            
  Our code ensures these by construction:                   
  - Namespaces: All 30+ namespaces declared in              
  COMMENTS_TEMPLATE etc. (comment-templates.ts:13-35) —     
  copied verbatim from Word output                          
  - Content types: 5 overrides added conditionally in       
  generateContentTypesXML() (docx-document.ts:536-571) —    
  only when comments.length > 0                             
  - Relationships: 5 relationship entries created in        
  html-to-docx.ts:338-501 — each with correct relationship  
  type URI from constants.ts:188-195                        
  - Relationship IDs: Auto-incremented via                  
  createDocumentRelationships() (docx-document.ts:984-1046) 
  — lastRelsId counter per file ensures no collisions       
                                                            
  ---                                                       
  Summary: Correctness by Construction                      
  Validator check: xml:space="preserve"                     
  Our approach: Always set unconditionally                  
  Where: tracking.ts:262,273, xml-builder.ts:409,           
    docx-document.ts:1209                                   
  ────────────────────────────────────────                  
  Validator check: No w:t in w:del                          
  Our approach: deleted flag → buildDeletedTextElement      
  Where: xml-builder.ts:489-490 → tracking.ts:270-276       
  ────────────────────────────────────────                  
  Validator check: No w:delText in w:ins (w/o w:del)        
  Our approach: Same flag drives both element + wrapper     
  Where: xml-builder.ts:489-495 → tracking.ts:313-335       
  ────────────────────────────────────────                  
  Validator check: Namespace declarations                   
  Our approach: Full namespace templates from Word          
  Where: comment-templates.ts:13-35                         
  ────────────────────────────────────────                  
  Validator check: Content types                            
  Our approach: Conditional 5 overrides                     
  Where: docx-document.ts:536-571                           
  ────────────────────────────────────────                  
  Validator check: Relationships                            
  Our approach: Auto-increment IDs, correct URIs            
  Where: docx-document.ts:984-1046, constants.ts:188-195    
  ────────────────────────────────────────                  
  Validator check: Unique IDs (paraId/durableId)            
  Our approach: allocatedIds Set + generateHexId()          
  Where: tracking.ts:105-124                                
  The Python validator validates post-hoc; our TypeScript   
  generates correct-by-construction XML where the invalid   
  states the validator checks for are structurally          
  unreachable in the code paths.                            
                                             

                                                                 
  Plugin Usage Audit: www Demo App                          
                                                            
  Overall Verdict: Correctly wired, with 2 issues found.    
                                                            
  ---                                                       
  Import Flow (DOCX → Plate) ✅                             
                                                            
  import-toolbar-button.tsx:78-134                          
                                                            
  User uploads .docx                                        
    → arrayBuffer                                           
    → importDocxWithTracking(editor, arrayBuffer, {         
        suggestionKey: KEYS.suggestion,   ✅ matches        
  BaseSuggestionPlugin key                                  
        getSuggestionKey,                 ✅ from           
  @platejs/suggestion                                       
        commentKey: KEYS.comment,         ✅ matches        
  BaseCommentPlugin key                                     
        getCommentKey,                    ✅ from           
  @platejs/comment                                          
        isText: TextApi.isText,           ✅ from platejs   
        generateId: crypto.randomUUID,    ✅ unique IDs     
      })                                                    
    → result.discussions → mapped to TDiscussion[]          
    → stored in discussionPlugin options                    
                                                            
  Verified correct:                                         
  - Plugin keys match (KEYS.suggestion, KEYS.comment)       
  - Discussion plugin receives imported discussions at line 
  118-121                                                   
  - Author name preserved via d.user?.id ??                 
  'imported-unknown' (line 109, 114)                        
  - authorName stored on TDiscussion (line 115) for export  
  round-trip                                                
                                                            
  ---                                                       
  Export Flow (Plate → DOCX) ✅ with issues                 
                                                            
  export-toolbar-button.tsx:154-187                         
                                                            
  User clicks "Export as Word"                              
    → discussions = editor.getOption(discussionPlugin,      
  'discussions')                                            
    → mapped to DocxExportDiscussion[]                      
    → exportToDocx(editor.children, {                       
        editorPlugins: [...BaseEditorKit, ...DocxExportKit],
        tracking: { discussions: exportDiscussions },       
      })                                                    
    → internally calls injectDocxTrackingTokens(value, {    
        discussions,                                        
        userNameMap: buildUserNameMap(discussions),         
      })                                                    
    → serializeToHtml(processedValue)                       
    → htmlToDocxBlob(html)                                  
                                                            
  Verified correct:                                         
  - BaseEditorKit includes BaseCommentKit +                 
  BaseSuggestionKit (lines 40-41 of editor-base-kit.tsx) —  
  needed for HTML serialization to preserve                 
  comment/suggestion marks as leaf components               
  - DocxExportKit configures DOCX-specific static components
   for code blocks, columns, equations, etc.                
  - exportToDocxInternal() at docx-export-plugin.tsx:459-468
   correctly calls injectDocxTrackingTokens when tracking   
  option is present                                         
  - buildUserNameMap() iterates all discussions AND all     
  reply comments to map userId → name                       
                                                            
  ---                                                       
  Issue 1: Reply user field not passed through on export    
                                                            
  export-toolbar-button.tsx:159-170:                        
  const exportDiscussions: DocxExportDiscussion[] =         
  discussions.map((d) => ({                                 
    id: d.id,                                               
    comments: d.comments?.map((c) => ({                     
      contentRich: c.contentRich,                           
      createdAt: c.createdAt,                               
      userId: c.userId,         // ✅ passed                
      // ❌ MISSING: user: { id: c.userId, name: ??? }      
    })),                                                    
    ...                                                     
    user: d.authorName ? { id: d.userId, name: d.authorName 
  } : undefined,                                            
  }));                                                      
                                                            
  The user field is set at the discussion level (line 169)  
  but not on individual comments (lines 161-165). This      
  means:                                                    
                                                            
  - resolveCommentAuthorName() for reply comments falls back
   to comment?.user?.name → undefined                       
  - Then to discussion?.user?.name → works for parent author
   but wrong for replies by different users                 
  - Then to userNameMap?.get(comment?.userId) → only works  
  if that userId was registered from the discussion level   
                                                            
  Impact: Reply comments by different authors than the      
  discussion creator may get the wrong author name in       
  exported DOCX.                                            
                                                            
  Fix needed in export-toolbar-button.tsx: Pass user on each
   comment:                                                 
  comments: d.comments?.map((c) => ({                       
    contentRich: c.contentRich,                             
    createdAt: c.createdAt,                                 
    userId: c.userId,                                       
    user: { id: c.userId, name: c.authorName ??             
  usersData[c.userId]?.name },                              
  })),                                                      
                                                            
  ---                                                       
  Issue 2: authorName not stored on imported reply comments 
                                                            
  import-toolbar-button.tsx:100-110:                        
  const newDiscussions: TDiscussion[] =                     
  result.discussions.map((d) => ({                          
    id: d.id,                                               
    comments: (d.comments ?? []).map((c, index) => ({       
      id: `${d.id}-comment-${index}`,                       
      contentRich: c.contentRich as ...,                    
      createdAt: c.createdAt ?? new Date(),                 
      discussionId: d.id,                                   
      isEdited: false,                                      
      userId: c.userId ?? c.user?.id ?? 'imported-unknown', 
      // ❌ MISSING: authorName: c.user?.name               
    })),                                                    
    ...                                                     
    authorName: d.user?.name,   // ✅ only on discussion    
  level                                                     
  }));                                                      
                                                            
  The TComment type (from comment.tsx) has authorName?:     
  string and authorInitials?: string fields, but the import 
  code doesn't populate them on individual comments. This   
  means:                                                    
                                                            
  - On re-export, c.authorName is undefined for individual  
  comments                                                  
  - The user field is also not passed through (Issue 1      
  above)                                                    
  - Reply author names from DOCX import are lost on         
  round-trip                                                
                                                            
  ---                                                       
  Plugin Configuration Verification                         
  Plugin: DiscussionKit                                     
  Included in EditorKit?: ✅ line 70                        
  Included in BaseEditorKit (export)?: Not needed           
    (state-only)                                            
  Correct?: ✅                                              
  ────────────────────────────────────────                  
  Plugin: CommentKit                                        
  Included in EditorKit?: ✅ line 71                        
  Included in BaseEditorKit (export)?: ✅ BaseCommentKit    
  line                                                      
     40                                                     
  Correct?: ✅                                              
  ────────────────────────────────────────                  
  Plugin: SuggestionKit                                     
  Included in EditorKit?: ✅ line 72                        
  Included in BaseEditorKit (export)?: ✅ BaseSuggestionKit 
    line 41                                                 
  Correct?: ✅                                              
  ────────────────────────────────────────                  
  Plugin: DocxKit                                           
  Included in EditorKit?: ✅ line 84                        
  Included in BaseEditorKit (export)?: N/A (import only)    
  Correct?: ✅                                              
  ────────────────────────────────────────                  
  Plugin: DocxExportKit                                     
  Included in EditorKit?: Not in EditorKit                  
  Included in BaseEditorKit (export)?: Passed separately to 
    exportToDocx                                            
  Correct?: ✅                                              
  ---                                                       
  Data Flow Verification                                    
  Step: Mark extraction                                     
  Function: defaultGetSuggestions() reads suggestion_* keys 
  Correct?: ✅ matches getSuggestionKey()                   
  ────────────────────────────────────────                  
  Step: Mark extraction                                     
  Function: defaultGetCommentIds() reads comment_* keys     
  Correct?: ✅ matches getCommentKey()                      
  ────────────────────────────────────────                  
  Step: Token injection                                     
  Function: injectDocxTrackingTokens() injects              
    [[DOCX_CMT_START:...]]                                  
  Correct?: ✅                                              
  ────────────────────────────────────────                  
  Step: Comment payload                                     
  Function: resolveCommentMeta() builds payload with replies
  Correct?: ✅                                              
  ────────────────────────────────────────                  
  Step: HTML serialize                                      
  Function: serializeToHtml() with BaseCommentKit +         
    BaseSuggestionKit                                       
  Correct?: ✅ preserves marks                              
  ────────────────────────────────────────                  
  Step: Token parsing                                       
  Function: splitDocxTrackingTokens() in xml-builder.ts     
  Correct?: ✅                                              
  ────────────────────────────────────────                  
  Step: XML generation                                      
  Function: ensureComment() → generateCommentsXML() etc.    
  Correct?: ✅                                              
  ────────────────────────────────────────                  
  Step: ZIP assembly                                        
  Function: addFilesToContainer() adds 5 XML files +        
    relationships                                           
  Correct?: ✅                                              
  ---                                                       
  Summary                                                   
  Area: Plugin registration (EditorKit)                     
  Status: ✅ Correct                                        
  ────────────────────────────────────────                  
  Area: Plugin registration (BaseEditorKit for export)      
  Status: ✅ Correct                                        
  ────────────────────────────────────────                  
  Area: Import: token parsing + mark application            
  Status: ✅ Correct                                        
  ────────────────────────────────────────                  
  Area: Import: discussion storage                          
  Status: ✅ Correct                                        
  ────────────────────────────────────────                  
  Area: Export: token injection                             
  Status: ✅ Correct                                        
  ────────────────────────────────────────                  
  Area: Export: HTML serialization                          
  Status: ✅ Correct                                        
  ────────────────────────────────────────                  
  Area: Export: DOCX generation                             
  Status: ✅ Correct                                        
  ────────────────────────────────────────                  
  Area: Export: reply author names                          
  Status: ⚠️ Lost — user field not passed on individual     
    comments                                                
  ────────────────────────────────────────                  
  Area: Round-trip: reply author names                      
  Status: ⚠️ Lost — authorName not stored on imported       
    TComment                                                
  The two issues are related — fixing both gives full       
  round-trip fidelity for reply author names. Want me to fix
   them?                                                    
                                                            
⏺ Ran 2 stop hooks                                          
  ⎿  Stop hook error: Failed with non-blocking              
  status code: /bin/sh: terminal-notifier: command          
  not found                                                 
                                                            
✻ Brewed for 6m 32s                                         
                                                            
❯ please fix very carefully and comrpehensively             
                                                            
⏺ Let me first understand the full type chain to make sure  
  the fix is complete.                                      
                                                            
⏺ Read 1 file (ctrl+o to expand)                            
                                                            
⏺ Good, TComment already has authorName and authorInitials  
  fields. Now let me check what importDocxWithTracking      
  returns for individual comments to understand the shape of
   result.discussions[].comments[].                         
                                                            
⏺ Read 1 file (ctrl+o to expand)                            
                                                            
⏺ Now let me find the DocxImportDiscussion type and see what
   fields individual comments carry.                        
                                                            
⏺ Searched for 2 patterns (ctrl+o to expand)                
                                                            
⏺ Good. Now I see the full picture:                         
                                                            
  - DocxImportDiscussion.comments[].user has { id: string;  
  name: string } — this carries authorName from DOCX        
  - TComment has authorName?: string and authorInitials?:   
  string                                                    
  - DocxExportComment has user?: DocxExportUser | null where
   DocxExportUser = { id?: string; name?: string }          
                                                            
  Let me now check how comment rendering uses authorName to 
  understand the UI side.                                   
                                                            
⏺ Searched for 1 pattern (ctrl+o to expand)                 
                                                            
⏺ The UI already supports authorName on TComment. Now let me
   also look at how block-discussion.tsx and                
  block-suggestion.tsx use these fields to make sure there's
   no missing piece.                              

                    
                                                            
⏺ I see the problem. DocxImportComment extends              
  DocxCommentData (which has replies?: DocxCommentData[]),  
  and then re-declares replies?: DocxImportCommentReply[].  
  This creates an intersection type DocxCommentData[] &     
  DocxImportCommentReply[] for replies, meaning each reply  
  must satisfy both types — but DocxImportCommentReply lacks
   id (required by DocxCommentData).                        
                                                            
  Let me read lines 190-230 to see the assignment sites.    
                                                            
⏺ Read 1 file (ctrl+o to expand)                            
                                                            
⏺ The fix is to change DocxCommentData.replies to use       
  DocxImportCommentReply[] instead of DocxCommentData[],    
  since replies don't need id, startToken, etc. But that    
  would be too broad a change. The cleaner fix is to use    
  Omit on the base type to avoid the intersection conflict. 
                                                            
  The cleanest fix: change DocxImportComment to use         
  Omit<DocxCommentData, 'replies'> so the re-declared       
  replies doesn't conflict.                                 
                                                            
⏺ Update(packages/docx-io/src/lib/importComments.ts)        
  ⎿  Added 2 lines, removed 2 lines                         
      87  };                                                
      88                                                    
      89  /** Comment parsed from HTML with token met       
          adata */                                          
      90 -export type DocxImportComment = DocxComment       
         -Data & {                                          
      90 +export type DocxImportComment = Omit<DocxCo       
         +mmentData, 'replies'> & {                         
      91    /** The full start token string (for sear       
          ching in editor) */                               
      92    startToken: string;                             
      93    /** The full end token string (for search       
          ing in editor) */                                 
     ...                                                    
       96    hasStartToken: boolean;                        
       97    /** Whether the end token was found in H       
           TML */                                           
       98    hasEndToken: boolean;                          
       99 -  /** Nested replies */                          
       99 +  /** Nested replies (use DocxImportCommen       
          +tReply which omits fields like id) */            
      100    replies?: DocxImportCommentReply[];            
      101  };                                               
      102                                                   
                                                            
⏺ Now let me verify there are no other places that depend on
   DocxImportComment having DocxCommentData's replies field 
  (which was DocxCommentData[]).                            
                                                            
⏺ Searched for 1 pattern (ctrl+o to expand)                 
                                                            
⏺ Good, no other code references DocxCommentData.replies    
  directly. Let me also check if DocxCommentData.replies is 
  used elsewhere (the base type still declares replies?:    
  DocxCommentData[]).                                       
                                                            
⏺ Searched for 1 pattern (ctrl+o to expand)                 
                                                            
⏺ Let me check line 246 and 804 to make sure the Omit       
  doesn't break anything.                                   
                                                            
⏺ Read 1 file (ctrl+o to expand)                            
                                                            
⏺ Line 804 uses DocxCommentData which still has replies?:   
  DocxCommentData[]. Line 820 calls                         
  c.replies.forEach(addCommentRecursive) — this recursion   
  works because DocxCommentData replies are also            
  DocxCommentData[].                                        
                                                            
  But the actual DocxImportComment objects stored in        
  commentsById have replies?: DocxImportCommentReply[], and 
  addCommentRecursive accepts DocxCommentData. Let me check 
  if DocxImportCommentReply is compatible with              
  DocxCommentData for this recursive call.                  
                                                            
  DocxImportCommentReply has: authorName?, authorInitials?, 
  date?, text?                                              
  DocxCommentData requires: id (required), plus optional    
  fields                                                    
                                                            
  So DocxImportCommentReply is NOT assignable to            
  DocxCommentData because it lacks id. But this is the      
  existing code — let me check how addCommentRecursive is   
  actually called.                                          
                                                            
⏺ Read 1 file (ctrl+o to expand)                            
                                                            
⏺ Line 824: addCommentRecursive(comment) where comment is a 
  DocxImportComment (which now is Omit<DocxCommentData,     
  'replies'> & {...}). This still has all the fields        
  addCommentRecursive needs (authorName, date, text, body), 
  plus replies?: DocxImportCommentReply[].                  
                                                            
  But addCommentRecursive takes DocxCommentData and line 820
   calls c.replies.forEach(addCommentRecursive). Since      
  DocxImportComment now has replies?:                       
  DocxImportCommentReply[], and DocxImportCommentReply lacks
   id, TypeScript will error on line 820 because            
  DocxImportCommentReply can't satisfy DocxCommentData.     
                                                            
  However, the first call on line 824 passes a              
  DocxImportComment to addCommentRecursive(c:               
  DocxCommentData) — the DocxImportComment type is a        
  superset of DocxCommentData (minus replies but plus other 
  fields), so this should still work... Let me think about  
  this more carefully.                                      
                                                            
  Actually, Omit<DocxCommentData, 'replies'> removes replies
   from the base, then the intersection adds replies?:      
  DocxImportCommentReply[]. So DocxImportComment now has    
  replies?: DocxImportCommentReply[] only. When             
  addCommentRecursive(comment) is called at line 824,       
  comment is DocxImportComment which is assignable to       
  DocxCommentData because... actually it's NOT directly     
  assignable since DocxImportComment.replies is             
  DocxImportCommentReply[] while DocxCommentData.replies    
  expects DocxCommentData[].                                
                                                            
  The real fix should be: make addCommentRecursive accept a 
  broader type. Let me look at what it actually uses from   
  the parameter:                                            
                                                            
  const addCommentRecursive = (c: DocxCommentData) => {     
    const userId = formatAuthorAsUserId(c.authorName);    //
   uses authorName                                          
    const createdAt = parseDateToDate(c.date, documentDate);
   // uses date                                             
    const contentRich = c.body ?? (c.text ? ...);         //
   uses body, text                                          
    // pushes to discussionComments                         
    if (c.replies) {                                        
      c.replies.forEach(addCommentRecursive);             //
   recurses on replies                                      
    }                                                       
  };                                                        
                                                            
  It uses: authorName, date, body, text, replies. The reply 
  items only need authorName, date, text (no body or replies
   on them). Let me make this function accept a broader     
  type.                                                     
                                                            
⏺ Read 1 file (ctrl+o to expand)                            
                                                            
⏺ The cleanest fix is to define a minimal type for what     
  addCommentRecursive actually needs, which avoids the      
  DocxCommentData vs DocxImportCommentReply incompatibility.
   The recursive call on c.replies passes replies which are 
  DocxImportCommentReply — these don't have replies         
  themselves, so recursion stops at depth 1.                
                                                            
⏺ Update(packages/docx-io/src/lib/importComments.ts)        
  ⎿  Added 7 lines, removed 1 line                          
      801        const discussionComments: NonNullabl       
           e<DocxImportDiscussion['comments']> =            
      802          [];                                      
      803                                                   
      804 -      const addCommentRecursive = (c: Docx       
          -CommentData) => {                                
      804 +      const addCommentRecursive = (              
      805 +        c: Pick<DocxCommentData, 'authorNa       
          +me' | 'body' | 'date' | 'text'> & {              
      806 +          replies?: Array<                       
      807 +            Pick<DocxCommentData, 'authorN       
          +ame' | 'body' | 'date' | 'text'>                 
      808 +          >;                                     
      809 +        }                                        
      810 +      ) => {                                     
      811          const userId = formatAuthorAsUserI       
           d(c.authorName);                                 
      812          const createdAt = parseDateToDate(       
           c.date, documentDate);                     