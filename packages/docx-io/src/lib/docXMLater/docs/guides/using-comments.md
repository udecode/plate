# Using Comments in DocXML

## Overview

The Comments feature allows you to add annotations and threaded discussions to Word documents programmatically. Comments can be attached to specific text ranges and support replies, multiple authors, and formatted content.

## Core Concepts

### Comment Structure

A comment in Microsoft Word consists of:

- **Comment Range Start** (`<w:commentRangeStart>`) - Marks the beginning of the commented text
- **Comment Range End** (`<w:commentRangeEnd>`) - Marks the end of the commented text
- **Comment Reference** (`<w:commentReference>`) - Links the range to the comment definition
- **Comment Definition** (in `word/comments.xml`) - Contains the actual comment content

### Comment Properties

Each comment has:

- **ID**: Unique identifier assigned by the CommentManager
- **Author**: Name of the person who created the comment
- **Initials**: Author's initials (auto-generated or custom)
- **Date**: When the comment was created
- **Content**: Text or formatted runs
- **Parent ID**: For reply comments, links to the parent comment

## Basic Usage

### Creating a Simple Comment

```typescript
import { Document } from "docxml";

const doc = Document.create();

// Create a paragraph
const para = doc.createParagraph("This text needs review.");

// Create and add a comment
const comment = doc.createComment(
  "John Smith",
  "Please verify this information.",
  "JS" // Optional initials
);

// Attach comment to paragraph
para.addComment(comment);

await doc.save("document.docx");
```

### Using the Convenience Method

```typescript
const doc = Document.create();
const para = doc.createParagraph("Content here.");

// Create and attach in one step
doc.addCommentToParagraph(
  para,
  "Jane Doe", // Author
  "Looks good!", // Content
  "JD" // Initials (optional)
);
```

## Comment Management

### The CommentManager

The `CommentManager` handles all comment operations:

```typescript
// Get the manager
const manager = doc.getCommentManager();

// Create and register a comment
const comment = manager.createComment("Author Name", "Comment text");

// Get statistics
const stats = manager.getStats();
console.log(`Total comments: ${stats.total}`);
console.log(`Authors: ${stats.authors.join(", ")}`);
```

### Document-Level API

Convenient wrapper methods on the `Document` class:

```typescript
// Create comments
const comment = doc.createComment("Author", "Text");

// Get all comments (top-level only)
const comments = doc.getAllComments();

// Get a specific comment
const comment = doc.getComment(commentId);

// Get comment statistics
const stats = doc.getCommentStats();

// Check if document has comments
if (doc.hasComments()) {
  console.log("Document has comments");
}
```

## Threaded Comments (Replies)

### Creating Replies

```typescript
const doc = Document.create();
const para = doc.createParagraph("Project proposal text.");

// Create main comment
const mainComment = doc.createComment(
  "Sarah Thompson",
  "What is the estimated budget?"
);
para.addComment(mainComment);

// Create replies
doc.createReply(mainComment.getId(), "Mike Rodriguez", "Estimated at $50,000.");

doc.createReply(
  mainComment.getId(),
  "Sarah Thompson",
  "That seems reasonable, thanks!"
);
```

### Working with Comment Threads

```typescript
// Get a full comment thread
const thread = doc.getCommentThread(mainComment.getId());
if (thread) {
  console.log(`Comment: ${thread.comment.getText()}`);
  console.log(`Replies: ${thread.replies.length}`);

  thread.replies.forEach((reply) => {
    console.log(`  - ${reply.getAuthor()}: ${reply.getText()}`);
  });
}
```

## Formatted Comment Content

### Using Formatted Runs

Comments can contain formatted text with bold, italic, colors, etc.:

```typescript
import { Comment, Run } from "docxml";

const formattedRuns = [
  new Run("This requires ").setBold(false),
  new Run("urgent attention").setBold(true).setColor("FF0000"),
  new Run(" before the deadline.").setBold(false),
];

const comment = Comment.createFormatted("Project Manager", formattedRuns, "PM");

// Register and attach
doc.getCommentManager().register(comment);
para.addComment(comment);
```

### Mixed Formatting Example

```typescript
const runs = [
  new Run("Question: ").setBold(true),
  new Run("Should we use ").setBold(false),
  new Run("approach A").setItalic(true),
  new Run(" or ").setBold(false),
  new Run("approach B").setItalic(true),
  new Run("?").setBold(false),
];

const comment = Comment.createFormatted("Tech Lead", runs);
```

## Comment Ranges

### Commenting Specific Text

By default, `para.addComment()` comments the entire paragraph. For specific text ranges:

```typescript
const para = new Paragraph();
para.addText("Some text ");

// Add comment start marker
para.addCommentStart(comment);
para.addText("commented portion ");
// Add comment end marker
para.addCommentEnd(comment);

para.addText("more text");
```

### Multiple Comments on Same Paragraph

```typescript
const para = doc.createParagraph("This paragraph has multiple comments.");

const comment1 = doc.createComment("Author 1", "First comment");
const comment2 = doc.createComment("Author 2", "Second comment");

para.addComment(comment1);
para.addComment(comment2);
```

## Searching and Filtering

### Find Comments by Text

```typescript
// Search all comment content
const results = doc.findCommentsByText("budget");

results.forEach((comment) => {
  console.log(`Found in comment by ${comment.getAuthor()}`);
});
```

### Get Recent Comments

```typescript
// Get 5 most recent comments
const recent = doc.getRecentComments(5);

recent.forEach((comment) => {
  console.log(`${comment.getAuthor()} at ${comment.getDate()}`);
});
```

### Filter by Author

```typescript
const manager = doc.getCommentManager();

// Get all comments by specific author
const authorComments = manager.getCommentsByAuthor("John Smith");

// Get all unique authors
const authors = manager.getAuthors();
console.log(`Comments from: ${authors.join(", ")}`);
```

### Filter by Date

```typescript
const manager = doc.getCommentManager();

const startDate = new Date("2024-01-01");
const endDate = new Date("2024-12-31");

const comments = manager.getCommentsByDateRange(startDate, endDate);
console.log(`Comments in 2024: ${comments.length}`);
```

## Comment API Reference

### Comment Class

```typescript
// Creation
const comment = Comment.create('Author', 'Text');
const reply = Comment.createReply(parentId, 'Author', 'Text');
const formatted = Comment.createFormatted('Author', runs);

// Properties
comment.getId(): number
comment.getAuthor(): string
comment.getInitials(): string
comment.getDate(): Date
comment.getParentId(): number | undefined
comment.isReply(): boolean

// Content
comment.getText(): string
comment.getRuns(): Run[]
comment.addRun(run: Run): this

// Modification
comment.setAuthor(author: string): this
comment.setInitials(initials: string): this
comment.setDate(date: Date): this

// XML generation
comment.toRangeStartXML(): XMLElement
comment.toRangeEndXML(): XMLElement
comment.toReferenceXML(): XMLElement
comment.toXML(): XMLElement
```

### CommentManager Class

```typescript
// Creation
const manager = CommentManager.create();

// Registration
manager.register(comment: Comment): Comment
manager.createComment(author, content, initials?): Comment
manager.createReply(parentId, author, content, initials?): Comment

// Retrieval
manager.getComment(id: number): Comment | undefined
manager.getAllComments(): Comment[]
manager.getAllCommentsWithReplies(): Comment[]
manager.getReplies(commentId: number): Comment[]

// Queries
manager.hasReplies(commentId: number): boolean
manager.getCount(): number
manager.getTopLevelCount(): number
manager.isEmpty(): boolean

// Filtering
manager.getAuthors(): string[]
manager.getCommentsByAuthor(author: string): Comment[]
manager.getCommentsByDateRange(start: Date, end: Date): Comment[]
manager.findCommentsByText(searchText: string): Comment[]
manager.getRecentComments(count: number): Comment[]

// Thread operations
manager.getCommentThread(commentId: number): { comment, replies } | undefined

// Removal
manager.removeComment(id: number): boolean
manager.clear(): void

// Statistics
manager.getStats(): { total, topLevel, replies, authors, nextId }

// XML generation
manager.generateCommentsXml(): string
```

### Document Class Comment Methods

```typescript
// Manager access
doc.getCommentManager(): CommentManager

// Creation
doc.createComment(author, content, initials?): Comment
doc.createReply(parentId, author, content, initials?): Comment

// Retrieval
doc.getComment(id: number): Comment | undefined
doc.getAllComments(): Comment[]

// Convenience
doc.addCommentToParagraph(para, author, content, initials?): Comment
doc.addCommentToParagraph(para, comment): Comment

// Queries
doc.hasComments(): boolean
doc.hasNoComments(): boolean
doc.getCommentThread(id: number): { comment, replies } | undefined

// Filtering
doc.findCommentsByText(searchText: string): Comment[]
doc.getRecentComments(count: number): Comment[]

// Statistics
doc.getCommentStats(): { total, topLevel, replies, authors, nextId }
```

## XML Structure

### Comment Range in document.xml

```xml
<w:p>
  <!-- Comment range start -->
  <w:commentRangeStart w:id="0"/>

  <!-- Commented content -->
  <w:r>
    <w:t>Commented text</w:t>
  </w:r>

  <!-- Comment range end -->
  <w:commentRangeEnd w:id="0"/>

  <!-- Comment reference -->
  <w:r>
    <w:commentReference w:id="0"/>
  </w:r>
</w:p>
```

### Comment Definition in comments.xml

```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:comments xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">

  <!-- Top-level comment -->
  <w:comment w:id="0"
             w:author="John Smith"
             w:date="2024-10-16T12:00:00Z"
             w:initials="JS">
    <w:p>
      <w:r>
        <w:t xml:space="preserve">Comment text here</w:t>
      </w:r>
    </w:p>
  </w:comment>

  <!-- Reply comment -->
  <w:comment w:id="1"
             w:author="Jane Doe"
             w:date="2024-10-16T12:30:00Z"
             w:initials="JD"
             w:parentId="0">
    <w:p>
      <w:r>
        <w:t xml:space="preserve">Reply text here</w:t>
      </w:r>
    </w:p>
  </w:comment>

</w:comments>
```

### Relationships Entry

In `word/_rels/document.xml.rels`:

```xml
<Relationship Id="rId3"
              Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments"
              Target="comments.xml"/>
```

### Content Types Entry

In `[Content_Types].xml`:

```xml
<Override PartName="/word/comments.xml"
          ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml"/>
```

## Best Practices

### Comment Organization

1. **Use meaningful author names**: Include full names or identifiers
2. **Provide context**: Comments should be self-explanatory
3. **Use initials consistently**: Either auto-generate or always provide them
4. **Group related comments**: Use replies for threaded discussions

### Performance Considerations

1. **Batch operations**: Register multiple comments before saving
2. **Avoid excessive comments**: Too many comments can bloat the file
3. **Search efficiently**: Use manager methods for filtering

### Error Handling

```typescript
try {
  const comment = doc.createComment("Author", "Text");
  para.addComment(comment);
  await doc.save("document.docx");
} catch (error) {
  console.error("Failed to add comment:", error);
}
```

### Reply Validation

```typescript
// Verify parent exists before creating reply
const parentId = mainComment.getId();
if (doc.getComment(parentId)) {
  const reply = doc.createReply(parentId, "Author", "Reply text");
} else {
  console.error("Parent comment not found");
}
```

## Complete Examples

### Example 1: Document Review Workflow

```typescript
import { Document } from "docxml";

const doc = Document.create({
  properties: {
    title: "Quarterly Report - Draft",
    creator: "Marketing Team",
  },
});

// Add content
const execSummary = doc.createParagraph(
  "Q4 results show significant growth across all departments."
);

// Reviewer 1 comments
const comment1 = doc.createComment(
  "Alice Johnson",
  "Great work! Can we add specific percentage numbers?",
  "AJ"
);
execSummary.addComment(comment1);

// Reviewer 2 replies
doc.createReply(
  comment1.getId(),
  "Bob Williams",
  "I agree. I will add the figures by tomorrow.",
  "BW"
);

await doc.save("review-draft.docx");
```

### Example 2: Multi-Author Discussion

```typescript
const doc = Document.create();
const para = doc.createParagraph("Proposed timeline: 6 months");

// Start discussion
const mainComment = doc.createComment(
  "Project Manager",
  "Can we shorten to 4 months?",
  "PM"
);
para.addComment(mainComment);

// Multiple replies
doc.createReply(
  mainComment.getId(),
  "Tech Lead",
  "That would require additional resources."
);

doc.createReply(
  mainComment.getId(),
  "Project Manager",
  "Let me check resource availability."
);

doc.createReply(
  mainComment.getId(),
  "Finance",
  "We can allocate 2 more developers if needed."
);

await doc.save("project-discussion.docx");
```

### Example 3: Formatted Technical Comments

```typescript
import { Document, Comment, Run } from "docxml";

const doc = Document.create();
const codePara = doc.createParagraph("function processData(input) { ... }");

// Create formatted comment
const commentRuns = [
  new Run("Critical: ").setBold(true).setColor("FF0000"),
  new Run("This function needs ").setBold(false),
  new Run("error handling").setItalic(true),
  new Run(" for null inputs.").setBold(false),
];

const comment = Comment.createFormatted("Code Reviewer", commentRuns, "CR");

doc.getCommentManager().register(comment);
codePara.addComment(comment);

await doc.save("code-review.docx");
```

### Example 4: Comment Analysis

```typescript
// Load existing document
const doc = await Document.load("reviewed-document.docx");

// Analyze comments
const stats = doc.getCommentStats();
console.log(`Total comments: ${stats.total}`);
console.log(`Top-level: ${stats.topLevel}, Replies: ${stats.replies}`);
console.log(`Authors: ${stats.authors.join(", ")}`);

// Find unresolved issues
const urgent = doc.findCommentsByText("urgent");
console.log(`Urgent items: ${urgent.length}`);

// Get recent activity
const recent = doc.getRecentComments(10);
console.log("Recent comments:");
recent.forEach((comment) => {
  console.log(`  ${comment.getAuthor()}: ${comment.getText()}`);
});
```

## Integration with Other Features

### Comments with Bookmarks

```typescript
const bookmark = doc.createBookmark("ImportantSection");
const para = doc.createParagraph("Critical information here");
para.addBookmark(bookmark);

const comment = doc.createComment(
  "Reviewer",
  "This section references bookmark: ImportantSection"
);
para.addComment(comment);
```

### Comments with Track Changes

```typescript
const para = doc.createParagraph("Original text");

// Add tracked deletion
doc.trackDeletion(para, "Editor", "removed text");

// Add comment about the change
const comment = doc.createComment(
  "Editor",
  "Removed redundant text as per style guide"
);
para.addComment(comment);
```

### Comments with Styles

```typescript
const para = doc.createParagraph("Heading Text").setStyle("Heading1");

const comment = doc.createComment(
  "Designer",
  "Consider using Heading2 for better hierarchy"
);
para.addComment(comment);
```

## Troubleshooting

### Comments Not Appearing

1. **Check relationships**: Verify `word/_rels/document.xml.rels` includes comments relationship
2. **Check content types**: Verify `[Content_Types].xml` includes comments override
3. **Check file exists**: Verify `word/comments.xml` was created
4. **Check ranges**: Verify both start and end markers are present

### Reply Comments Not Threaded

1. **Verify parent ID**: Check that `parentId` is set correctly
2. **Verify parent exists**: Parent comment must be registered first
3. **Check order**: Parent must be registered before reply

### Formatting Not Preserved

1. **Use Run objects**: Pass `Run[]` instead of plain strings for formatting
2. **Register formatted comments**: Use `Comment.createFormatted()` for complex formatting

## Migration from Other Libraries

### From docx (dolanmiu)

```typescript
// docx library
new Paragraph({
  children: [
    new TextRun("text"),
    new CommentRangeStart(0),
    // ...
  ],
});

// DocXML
const para = doc.createParagraph("text");
const comment = doc.createComment("Author", "Comment text");
para.addComment(comment);
```

### From python-docx

```python
# python-docx
paragraph = document.add_paragraph('text')
comment = document.add_comment('text', 'author')
paragraph.add_comment(comment)
```

```typescript
// DocXML
const para = doc.createParagraph("text");
const comment = doc.createComment("author", "text");
para.addComment(comment);
```

## Additional Resources

- [Microsoft OpenXML Specification - Comments](https://learn.microsoft.com/en-us/openspecs/office_standards/ms-oi29500)
- [WordprocessingML Reference](https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.wordprocessing)
- [Comments.xml Schema](https://schemas.openxmlformats.org/wordprocessingml/2006/main)

## Summary

The Comments feature in DocXML provides:

- Simple API for adding comments to paragraphs
- Support for threaded discussions with replies
- Multiple authors with automatic initial generation
- Formatted comment content with Run formatting
- Comprehensive search and filtering capabilities
- Full WordprocessingML XML generation
- Integration with other document features

For additional examples, see the `examples/11-comments/` directory in the repository.
