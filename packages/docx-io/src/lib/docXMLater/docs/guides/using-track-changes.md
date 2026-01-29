# Using Track Changes in DocXML

## Overview

The Track Changes feature enables programmatic creation and management of document revisions. Track changes records insertions and deletions made by different authors, displaying them with visual markup in Microsoft Word.

## Core Concepts

### Revision Types

DocXML supports two types of revisions:

1. **Insertions** (`<w:ins>`) - Text that was added to the document
2. **Deletions** (`<w:del>`) - Text that was removed from the document

### Revision Properties

Each revision contains:

- **ID**: Unique identifier assigned by the RevisionManager
- **Author**: Name of the person who made the change
- **Date**: When the change was made
- **Type**: Either 'insert' or 'delete'
- **Content**: The text that was added or removed (as Run objects)

### How Track Changes Works

In Microsoft Word:

- **Insertions** appear underlined (default)
- **Deletions** appear struck through
- **Color coding** identifies different authors
- Users can accept or reject changes

## Basic Usage

### Creating Tracked Insertions

```typescript
import { Document, Run } from "docxml";

const doc = Document.create();
const para = doc.createParagraph("Original text ");

// Create an insertion revision
const insertion = doc.createInsertion("Editor Name", new Run("added text"));

// Add to paragraph
para.addRevision(insertion);

await doc.save("document.docx");
```

### Creating Tracked Deletions

```typescript
const doc = Document.create();
const para = doc.createParagraph("Keep this text ");

// Create a deletion revision
const deletion = doc.createDeletion("Editor Name", new Run("removed text"));

// Add to paragraph
para.addRevision(deletion);

await doc.save("document.docx");
```

### Using Convenience Methods

```typescript
const doc = Document.create();
const para = doc.createParagraph("Original content ");

// Track an insertion
doc.trackInsertion(para, "John Doe", "new text");

// Track a deletion
doc.trackDeletion(para, "Jane Smith", "old text");
```

## Revision Management

### The RevisionManager

The `RevisionManager` handles all revision operations:

```typescript
// Get the manager
const manager = doc.getRevisionManager();

// Create revision from text
const revision = Revision.fromText("insert", "Author Name", "Inserted text");

// Register the revision
manager.register(revision);

// Get statistics
const stats = manager.getStats();
console.log(`Total revisions: ${stats.total}`);
console.log(`Insertions: ${stats.insertions}`);
console.log(`Deletions: ${stats.deletions}`);
```

### Document-Level API

Convenient wrapper methods on the `Document` class:

```typescript
// Create revisions
const insertion = doc.createInsertion("Author", new Run("text"));
const deletion = doc.createDeletion("Author", new Run("text"));

// From text (convenience)
const revision = doc.createRevisionFromText("insert", "Author", "text");

// Track changes on paragraphs
doc.trackInsertion(para, "Author", "inserted text");
doc.trackDeletion(para, "Author", "deleted text");

// Check status
if (doc.isTrackingChanges()) {
  console.log("Document has tracked changes");
}

// Get statistics
const stats = doc.getRevisionStats();
```

## Multiple Authors

### Tracking Changes from Different Authors

```typescript
const doc = Document.create();
const para = doc.createParagraph("Document text ");

// Author 1 makes changes
doc.trackInsertion(para, "Alice Johnson", "added by Alice");
doc.trackDeletion(para, "Alice Johnson", "removed by Alice");

// Author 2 makes changes
doc.trackInsertion(para, "Bob Williams", "added by Bob");
doc.trackDeletion(para, "Bob Williams", "removed by Bob");

await doc.save("multi-author.docx");
```

### Analyzing Changes by Author

```typescript
const manager = doc.getRevisionManager();

// Get all unique authors
const authors = manager.getAuthors();
console.log(`Authors: ${authors.join(", ")}`);

// Get revisions by specific author
const aliceChanges = manager.getRevisionsByAuthor("Alice Johnson");
console.log(`Alice made ${aliceChanges.length} changes`);
```

## Advanced Usage

### Formatted Revisions

Revisions can contain formatted text:

```typescript
import { Run, Revision } from "docxml";

// Create formatted runs
const runs = [
  new Run("important ").setBold(true).setColor("FF0000"),
  new Run("addition").setItalic(true),
];

// Create insertion with formatted content
const insertion = Revision.createInsertion("Editor", runs);

doc.getRevisionManager().register(insertion);
para.addRevision(insertion);
```

### Multiple Runs in Single Revision

```typescript
const runs = [
  new Run("Part 1 "),
  new Run("Part 2 ").setBold(true),
  new Run(" Part 3"),
];

const insertion = doc.createInsertion("Author", runs);
para.addRevision(insertion);
```

### Custom Dates

```typescript
// Specify custom date for revision
const date = new Date("2024-10-15T10:00:00Z");

const insertion = doc.createInsertion("Author", new Run("text"), date);
```

## Searching and Filtering

### Find Revisions by Text

```typescript
// Search all revision content
const results = doc.findRevisionsByText("budget");

results.forEach((revision) => {
  console.log(`Found in ${revision.getType()} by ${revision.getAuthor()}`);
});
```

### Get Recent Revisions

```typescript
// Get 10 most recent revisions
const recent = doc.getRecentRevisions(10);

recent.forEach((revision) => {
  const type = revision.getType();
  console.log(`${type} by ${revision.getAuthor()} at ${revision.getDate()}`);
});
```

### Get Insertions or Deletions

```typescript
// Get all insertions
const insertions = doc.getAllInsertions();
console.log(`Total insertions: ${insertions.length}`);

// Get all deletions
const deletions = doc.getAllDeletions();
console.log(`Total deletions: ${deletions.length}`);
```

### Filter by Type

```typescript
const manager = doc.getRevisionManager();

// Get only insertions
const insertions = manager.getRevisionsByType("insert");

// Get only deletions
const deletions = manager.getRevisionsByType("delete");
```

### Filter by Date

```typescript
const manager = doc.getRevisionManager();

const startDate = new Date("2024-10-01");
const endDate = new Date("2024-10-31");

const revisions = manager.getRevisionsByDateRange(startDate, endDate);
console.log(`Changes in October: ${revisions.length}`);
```

## Revision API Reference

### Revision Class

```typescript
// Creation
const insertion = Revision.createInsertion(author, content, date?);
const deletion = Revision.createDeletion(author, content, date?);
const revision = Revision.fromText(type, author, text, date?);

// Properties
revision.getId(): number
revision.getAuthor(): string
revision.getDate(): Date
revision.getType(): 'insert' | 'delete'

// Content
revision.getRuns(): Run[]
revision.addRun(run: Run): this

// Modification
revision.setAuthor(author: string): this
revision.setDate(date: Date): this

// XML generation
revision.toXML(): XMLElement
```

### RevisionManager Class

```typescript
// Creation
const manager = RevisionManager.create();

// Registration
manager.register(revision: Revision): Revision

// Retrieval
manager.getAllRevisions(): Revision[]
manager.getRevisionsByType(type: 'insert' | 'delete'): Revision[]
manager.getAllInsertions(): Revision[]
manager.getAllDeletions(): Revision[]

// Queries
manager.getCount(): number
manager.getInsertionCount(): number
manager.getDeletionCount(): number
manager.isEmpty(): boolean
manager.isTrackingChanges(): boolean

// Filtering
manager.getAuthors(): string[]
manager.getRevisionsByAuthor(author: string): Revision[]
manager.getRevisionsByDateRange(start: Date, end: Date): Revision[]
manager.findRevisionsByText(searchText: string): Revision[]
manager.getRecentRevisions(count: number): Revision[]

// Latest revision
manager.getLatestRevision(): Revision | undefined

// Removal
manager.clear(): void

// Statistics
manager.getStats(): { total, insertions, deletions, authors, nextId }
```

### Document Class Revision Methods

```typescript
// Manager access
doc.getRevisionManager(): RevisionManager

// Creation
doc.createInsertion(author, content, date?): Revision
doc.createDeletion(author, content, date?): Revision
doc.createRevisionFromText(type, author, text, date?): Revision

// Convenience tracking
doc.trackInsertion(para, author, text, date?): Revision
doc.trackDeletion(para, author, text, date?): Revision

// Queries
doc.isTrackingChanges(): boolean
doc.hasRevisions(): boolean
doc.hasNoRevisions(): boolean

// Filtering
doc.findRevisionsByText(searchText: string): Revision[]
doc.getRecentRevisions(count: number): Revision[]
doc.getAllInsertions(): Revision[]
doc.getAllDeletions(): Revision[]

// Statistics
doc.getRevisionStats(): { total, insertions, deletions, authors, nextId }
```

## XML Structure

### Insertion in document.xml

```xml
<w:p>
  <!-- Insertion -->
  <w:ins w:id="0"
         w:author="John Doe"
         w:date="2024-10-16T12:00:00Z">
    <w:r>
      <w:t>Inserted text</w:t>
    </w:r>
  </w:ins>
</w:p>
```

### Deletion in document.xml

```xml
<w:p>
  <!-- Deletion -->
  <w:del w:id="1"
         w:author="Jane Smith"
         w:date="2024-10-16T12:30:00Z">
    <w:r>
      <w:delText>Deleted text</w:delText>
    </w:r>
  </w:del>
</w:p>
```

### Mixed Content

```xml
<w:p>
  <!-- Regular text -->
  <w:r>
    <w:t>Original text </w:t>
  </w:r>

  <!-- Insertion -->
  <w:ins w:id="0" w:author="Editor" w:date="2024-10-16T12:00:00Z">
    <w:r>
      <w:t>added text </w:t>
    </w:r>
  </w:ins>

  <!-- Deletion -->
  <w:del w:id="1" w:author="Editor" w:date="2024-10-16T12:05:00Z">
    <w:r>
      <w:delText>removed text </w:delText>
    </w:r>
  </w:del>

  <!-- More regular text -->
  <w:r>
    <w:t>more text</w:t>
  </w:r>
</w:p>
```

### Formatted Revision

```xml
<w:ins w:id="0" w:author="Editor" w:date="2024-10-16T12:00:00Z">
  <w:r>
    <w:rPr>
      <w:b/>
      <w:color w:val="FF0000"/>
    </w:rPr>
    <w:t>Bold red inserted text</w:t>
  </w:r>
</w:ins>
```

## Best Practices

### Tracking Organization

1. **Consistent author names**: Use full names or identifiers
2. **Meaningful changes**: Track substantive edits, not typo fixes
3. **Date accuracy**: Use correct dates for proper chronology
4. **Change description**: Include comments explaining why changes were made

### Performance Considerations

1. **Batch operations**: Register multiple revisions before saving
2. **Avoid excessive tracking**: Too many revisions can make documents hard to read
3. **Search efficiently**: Use manager methods for filtering

### Error Handling

```typescript
try {
  const revision = doc.createInsertion("Author", new Run("text"));
  para.addRevision(revision);
  await doc.save("document.docx");
} catch (error) {
  console.error("Failed to track change:", error);
}
```

### Validation

```typescript
// Verify revisions before saving
const stats = doc.getRevisionStats();
if (stats.total > 0) {
  console.log(`Saving document with ${stats.total} tracked changes`);
  await doc.save("document.docx");
}
```

## Complete Examples

### Example 1: Document Editing Session

```typescript
import { Document } from "docxml";

const doc = Document.create({
  properties: {
    title: "Article Draft",
    creator: "Writer",
  },
});

// Original content
const para1 = doc.createParagraph("The project was completed successfully. ");
const para2 = doc.createParagraph("Total cost was within budget. ");

// Editor makes changes
doc.trackDeletion(para1, "Editor", "successfully");
doc.trackInsertion(para1, "Editor", "on schedule");

doc.trackDeletion(para2, "Editor", "within");
doc.trackInsertion(para2, "Editor", "under");

await doc.save("edited-draft.docx");

// Check statistics
const stats = doc.getRevisionStats();
console.log(`Total changes: ${stats.total}`);
console.log(`Insertions: ${stats.insertions}, Deletions: ${stats.deletions}`);
```

### Example 2: Collaborative Editing

```typescript
const doc = Document.create();
const para = doc.createParagraph("Original content ");

// Author 1 edits
doc.trackInsertion(para, "Alice", "added by Alice ");

// Author 2 edits
doc.trackInsertion(para, "Bob", "added by Bob ");

// Author 3 removes something
doc.trackDeletion(para, "Carol", "removed by Carol ");

await doc.save("collaborative.docx");

// Analyze contributions
const manager = doc.getRevisionManager();
const authors = manager.getAuthors();

authors.forEach((author) => {
  const changes = manager.getRevisionsByAuthor(author);
  console.log(`${author}: ${changes.length} changes`);
});
```

### Example 3: Formatted Track Changes

```typescript
import { Document, Run, Revision } from "docxml";

const doc = Document.create();
const para = doc.createParagraph("Document text ");

// Create formatted insertion
const formattedRuns = [
  new Run("IMPORTANT: ").setBold(true).setColor("FF0000"),
  new Run("This section must be reviewed.").setBold(false),
];

const insertion = Revision.createInsertion("Editor", formattedRuns, new Date());

doc.getRevisionManager().register(insertion);
para.addRevision(insertion);

await doc.save("formatted-changes.docx");
```

### Example 4: Change Analysis

```typescript
// Load existing document
const doc = await Document.load("reviewed-document.docx");

// Analyze all changes
const stats = doc.getRevisionStats();
console.log(`Total tracked changes: ${stats.total}`);
console.log(`Authors involved: ${stats.authors.join(", ")}`);

// Find specific changes
const critical = doc.findRevisionsByText("critical");
console.log(`Critical changes: ${critical.length}`);

// Get recent activity
const recent = doc.getRecentRevisions(5);
console.log("Recent changes:");
recent.forEach((revision) => {
  const type = revision.getType() === "insert" ? "Added" : "Removed";
  const text = revision
    .getRuns()
    .map((r) => r.getText())
    .join("");
  console.log(`  ${type} by ${revision.getAuthor()}: "${text}"`);
});

// Author statistics
const authors = doc.getRevisionManager().getAuthors();
authors.forEach((author) => {
  const changes = doc.getRevisionManager().getRevisionsByAuthor(author);
  const insertions = changes.filter((r) => r.getType() === "insert").length;
  const deletions = changes.filter((r) => r.getType() === "delete").length;
  console.log(`${author}: ${insertions} insertions, ${deletions} deletions`);
});
```

### Example 5: Date-Based Analysis

```typescript
const doc = await Document.load("document.docx");
const manager = doc.getRevisionManager();

// Get changes from specific date range
const startDate = new Date("2024-10-01");
const endDate = new Date("2024-10-31");
const octoberChanges = manager.getRevisionsByDateRange(startDate, endDate);

console.log(`Changes in October: ${octoberChanges.length}`);

// Group by week
const changesByWeek = new Map();
octoberChanges.forEach((revision) => {
  const date = revision.getDate();
  const week = Math.floor(date.getDate() / 7);
  const count = changesByWeek.get(week) || 0;
  changesByWeek.set(week, count + 1);
});

console.log("Changes by week:");
changesByWeek.forEach((count, week) => {
  console.log(`  Week ${week + 1}: ${count} changes`);
});
```

## Integration with Other Features

### Track Changes with Comments

```typescript
const para = doc.createParagraph("Original text ");

// Track a deletion
const deletion = doc.trackDeletion(para, "Editor", "removed text");

// Add comment explaining the change
const comment = doc.createComment(
  "Editor",
  "Removed redundant text as per style guide section 3.2"
);
para.addComment(comment);
```

### Track Changes with Bookmarks

```typescript
const bookmark = doc.createBookmark("Version2Changes");
const para = doc.createParagraph("Updated content ");
para.addBookmark(bookmark);

// Track changes in bookmarked section
doc.trackInsertion(para, "Editor", "new version 2 content");
```

### Track Changes with Styles

```typescript
const para = doc.createParagraph("Section heading ").setStyle("Heading2");

// Track formatting change
doc.trackDeletion(para, "Editor", "old heading");
doc.trackInsertion(para, "Editor", "new heading");
```

## Accepting/Rejecting Changes

While DocXML creates tracked changes, accepting or rejecting them is typically done in Microsoft Word. However, you can programmatically remove revisions:

```typescript
// Get all revisions
const revisions = doc.getRevisionManager().getAllRevisions();

// "Accept" insertions by removing revision markup and keeping content
// "Reject" deletions by removing revision markup
// This would require custom logic based on your workflow

// Or clear all track changes
doc.getRevisionManager().clear();
```

## Troubleshooting

### Revisions Not Appearing

1. **Check XML structure**: Verify `<w:ins>` or `<w:del>` tags are present
2. **Check IDs**: Each revision must have a unique ID
3. **Check date format**: Dates must be ISO 8601 format
4. **Enable tracking**: In Word, ensure "Track Changes" is enabled to see markup

### Formatting Not Preserved

1. **Use Run objects**: Pass `Run[]` with formatting instead of plain strings
2. **Check rPr element**: Verify run properties are inside the revision element

### Author Attribution Issues

1. **Consistent names**: Use the same author name across revisions
2. **Date ordering**: Ensure dates are in chronological order

## Migration from Other Libraries

### From docx (dolanmiu)

```typescript
// docx library
new Paragraph({
  children: [
    new InsertedTextRun({ text: "inserted", author: "John", date: new Date() }),
    new DeletedTextRun({ text: "deleted", author: "John", date: new Date() }),
  ],
});

// DocXML
const para = doc.createParagraph();
doc.trackInsertion(para, "John", "inserted");
doc.trackDeletion(para, "John", "deleted");
```

### From python-docx

```python
# python-docx
run = paragraph.add_run('text')
run._element.append(OxmlElement('w:ins'))
```

```typescript
// DocXML
doc.trackInsertion(para, "Author", "text");
```

## Word Compatibility

Track Changes in DocXML is compatible with:

- Microsoft Word 2016 and later
- Microsoft 365
- LibreOffice Writer (with some limitations)
- Google Docs (when importing DOCX)

## Additional Resources

- [Microsoft OpenXML Specification - Track Changes](https://learn.microsoft.com/en-us/openspecs/office_standards/ms-oi29500)
- [WordprocessingML Reference](https://learn.microsoft.com/en-us/dotnet/api/documentformat.openxml.wordprocessing)
- [Track Revisions Schema](https://schemas.openxmlformats.org/wordprocessingml/2006/main)

## Summary

The Track Changes feature in DocXML provides:

- Simple API for tracking insertions and deletions
- Support for multiple authors
- Formatted revision content with Run formatting
- Comprehensive search and filtering capabilities
- Full WordprocessingML XML generation
- Integration with comments and other document features
- Production-ready implementation

For additional examples, see the `examples/10-track-changes/` directory in the repository.
