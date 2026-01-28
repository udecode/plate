import type { ReportConfig, DocumentComment, MetaComment, UploadedDocument } from '../types';

/**
 * Interface for comment lookup
 */
export interface CommentLookup {
  wordComments: DocumentComment[];
  metaComments: MetaComment[];
  documents: UploadedDocument[];
}

/**
 * Generate a human-readable report from the given configuration
 */
export function generateHumanReport(
  config: ReportConfig,
  lookup: CommentLookup
): string {
  const lines: string[] = [];
  
  // Add title and metadata
  lines.push(config.name);
  
  const generatedDate = new Date();
  lines.push(`Generated ${formatDate(generatedDate)}`);
  lines.push('');
  
  // Add document list if there are documents
  const documentSet = new Set<string>();
  config.sections.forEach(section => {
    section.commentIds.forEach(commentId => {
      const wordComment = lookup.wordComments.find(c => c.id === commentId);
      if (wordComment) {
        documentSet.add(wordComment.documentId);
      }
    });
  });
  
  if (documentSet.size > 0) {
    lines.push('Documents:');
    documentSet.forEach(docId => {
      const doc = lookup.documents.find(d => d.id === docId);
      if (doc) {
        lines.push(`- ${doc.name}`);
      }
    });
    lines.push('');
  }
  
  // Process each section
  config.sections.forEach((section, index) => {
    if (index > 0) {
      lines.push('');
    }
    
    lines.push(section.title.toUpperCase());
    lines.push('');
    
    // Process each comment in the section
    section.commentIds.forEach(commentId => {
      // Check if it's a word comment
      const wordComment = lookup.wordComments.find(c => c.id === commentId);
      if (wordComment) {
        lines.push(...formatWordComment(wordComment, lookup));
        lines.push('');
        return;
      }
      
      // Check if it's a meta-comment
      const metaComment = lookup.metaComments.find(c => c.id === commentId);
      if (metaComment) {
        lines.push(...formatMetaComment(metaComment, lookup));
        lines.push('');
        return;
      }
    });
  });
  
  return lines.join('\n');
}

/**
 * Format a word comment with attribution
 */
function formatWordComment(
  comment: DocumentComment,
  lookup: CommentLookup
): string[] {
  const lines: string[] = [];
  
  // Get document name
  const doc = lookup.documents.find(d => d.id === comment.documentId);
  const docName = doc?.name || 'Unknown Document';
  
  // Format attribution line
  const dateStr = formatDate(comment.date);
  lines.push(`${comment.author} (${docName}, ${dateStr}):`);
  
  // Add comment text (strip HTML tags for clean prose)
  const cleanText = stripHtmlTags(comment.content);
  lines.push(`"${cleanText}"`);
  
  // Add linked comments context if present
  if (comment.parentId) {
    const parentComment = lookup.wordComments.find(c => c.paraId === comment.parentId);
    if (parentComment) {
      lines.push('');
      lines.push(`[In response to ${parentComment.author}:]`);
      const parentText = stripHtmlTags(parentComment.content);
      lines.push(`"${parentText}"`);
    }
  }
  
  return lines;
}

/**
 * Format a meta-comment with "My Analysis:" prefix
 */
function formatMetaComment(
  metaComment: MetaComment,
  lookup: CommentLookup
): string[] {
  const lines: string[] = [];
  
  lines.push('My Analysis:');
  lines.push(metaComment.text);
  
  // Add linked comments context if relevant
  if (metaComment.linkedComments.length > 0) {
    lines.push('');
    lines.push('[Based on comments from:');
    
    metaComment.linkedComments.forEach(linkedId => {
      const wordComment = lookup.wordComments.find(c => c.id === linkedId);
      if (wordComment) {
        const doc = lookup.documents.find(d => d.id === wordComment.documentId);
        const docName = doc?.name || 'Unknown Document';
        lines.push(`- ${wordComment.author} (${docName})`);
      } else {
        const linkedMetaComment = lookup.metaComments.find(c => c.id === linkedId);
        if (linkedMetaComment) {
          lines.push(`- ${linkedMetaComment.author} (Meta-comment)`);
        }
      }
    });
    
    lines.push(']');
  }
  
  return lines;
}

/**
 * Format a date for human-readable display
 */
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
}

/**
 * Strip HTML tags from text for clean prose output
 */
function stripHtmlTags(html: string): string {
  // Use DOMParser to safely parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Get text content and clean up whitespace
  let text = doc.body.textContent || '';
  
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

/**
 * Generate a default report config from selected comments
 * Used by ReportPreview to quickly create a simple report config
 */
export function generateDefaultReportConfig(
  title: string,
  selectedCommentIds: string[],
  _metaComments: MetaComment[]
): Partial<ReportConfig> {
  // Create a single section with all selected comments
  const sections = selectedCommentIds.length > 0 ? [
    {
      id: `section-${crypto.randomUUID()}`,
      title: 'Analysis',
      commentIds: selectedCommentIds
    }
  ] : [];
  
  return {
    name: title,
    selectedCommentIds,
    sections,
    options: {
      showAuthor: true,
      showDate: true,
      showContext: false,
      format: 'human'
    }
  };
}

/**
 * Generate a hybrid format report with AI-friendly structural markers
 */
export function generateHybridReport(
  config: ReportConfig,
  lookup: CommentLookup
): string {
  const lines: string[] = [];
  
  // Add title and metadata
  lines.push(config.name);
  
  const generatedDate = new Date();
  lines.push(`Generated ${formatDate(generatedDate)}`);
  lines.push('');
  
  // Add document list if there are documents
  const documentSet = new Set<string>();
  config.sections.forEach(section => {
    section.commentIds.forEach(commentId => {
      const wordComment = lookup.wordComments.find(c => c.id === commentId);
      if (wordComment) {
        documentSet.add(wordComment.documentId);
      }
    });
  });
  
  if (documentSet.size > 0) {
    lines.push('Documents:');
    documentSet.forEach(docId => {
      const doc = lookup.documents.find(d => d.id === docId);
      if (doc) {
        lines.push(`- ${doc.name}`);
      }
    });
    lines.push('');
  }
  
  // Track comment references for the reference map
  const commentRefs = new Map<string, { author: string; docName: string; type: 'word' | 'meta' }>();
  
  // Process each section
  config.sections.forEach((section, index) => {
    if (index > 0) {
      lines.push('');
      lines.push('═══════════════════════════════════════════════════════════════');
      lines.push('');
    }
    
    lines.push(section.title.toUpperCase());
    if (section.description) {
      lines.push(section.description);
    }
    lines.push('');
    
    // Process each comment in the section
    section.commentIds.forEach(commentId => {
      // Check if it's a word comment
      const wordComment = lookup.wordComments.find(c => c.id === commentId);
      if (wordComment) {
        const commentLines = formatWordCommentHybrid(wordComment, lookup, commentRefs);
        lines.push(...commentLines);
        lines.push('');
        return;
      }
      
      // Check if it's a meta-comment
      const metaComment = lookup.metaComments.find(c => c.id === commentId);
      if (metaComment) {
        const commentLines = formatMetaCommentHybrid(metaComment, lookup, commentRefs);
        lines.push(...commentLines);
        lines.push('');
        return;
      }
    });
  });
  
  // Add Relationships section
  const relationships = extractRelationships(config, lookup);
  if (relationships.length > 0) {
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');
    lines.push('RELATIONSHIPS');
    lines.push('');
    relationships.forEach(rel => {
      lines.push(rel);
    });
    lines.push('');
  }
  
  // Add Comment Reference Map at the end
  if (commentRefs.size > 0) {
    lines.push('');
    lines.push('═══════════════════════════════════════════════════════════════');
    lines.push('');
    lines.push('COMMENT REFERENCE MAP');
    lines.push('');
    
    commentRefs.forEach((info, commentId) => {
      const refId = getCommentRefId(commentId);
      if (info.type === 'word') {
        lines.push(`[${refId}] ${info.author} (${info.docName})`);
      } else {
        lines.push(`[${refId}] ${info.author} (Meta-comment)`);
      }
    });
  }
  
  return lines.join('\n');
}

/**
 * Format a word comment in hybrid format with comment ID and tags
 */
function formatWordCommentHybrid(
  comment: DocumentComment,
  lookup: CommentLookup,
  commentRefs: Map<string, { author: string; docName: string; type: 'word' | 'meta' }>
): string[] {
  const lines: string[] = [];
  
  // Get document name
  const doc = lookup.documents.find(d => d.id === comment.documentId);
  const docName = doc?.name || 'Unknown Document';
  
  // Track this comment for the reference map
  commentRefs.set(comment.id, { author: comment.author, docName, type: 'word' });
  
  // Format attribution line with comment ID
  const commentRef = getCommentRefId(comment.id);
  const dateStr = formatDate(comment.date);
  
  // Extract hashtags from comment text
  const hashtags = extractHashtags(comment.plainText);
  const hashtagStr = hashtags.length > 0 ? ' ' + hashtags.join(' ') : '';
  
  lines.push(`[${commentRef}] ${comment.author} (${docName}, ${dateStr})${hashtagStr}:`);
  
  // Add comment text (strip HTML tags for clean prose)
  const cleanText = stripHtmlTags(comment.content);
  lines.push(`"${cleanText}"`);
  
  // Add linked comments context if present
  if (comment.parentId) {
    const parentComment = lookup.wordComments.find(c => c.paraId === comment.parentId);
    if (parentComment) {
      const parentRef = getCommentRefId(parentComment.id);
      commentRefs.set(parentComment.id, { 
        author: parentComment.author, 
        docName: lookup.documents.find(d => d.id === parentComment.documentId)?.name || 'Unknown Document',
        type: 'word'
      });
      lines.push('');
      lines.push(`[In response to ${parentRef}:]`);
      const parentText = stripHtmlTags(parentComment.content);
      lines.push(`"${parentText}"`);
    }
  }
  
  return lines;
}

/**
 * Format a meta-comment in hybrid format with comment ID and tags
 */
function formatMetaCommentHybrid(
  metaComment: MetaComment,
  lookup: CommentLookup,
  commentRefs: Map<string, { author: string; docName: string; type: 'word' | 'meta' }>
): string[] {
  const lines: string[] = [];
  
  // Track this comment for the reference map
  commentRefs.set(metaComment.id, { author: metaComment.author, docName: '', type: 'meta' });
  
  const commentRef = getCommentRefId(metaComment.id);
  
  // Extract hashtags
  const hashtagStr = metaComment.tags.length > 0 ? ' ' + metaComment.tags.map(t => `#${t}`).join(' ') : '';
  
  lines.push(`[${commentRef}] My Analysis${hashtagStr}:`);
  lines.push(metaComment.text);
  
  // Add linked comments context if relevant
  if (metaComment.linkedComments.length > 0) {
    lines.push('');
    lines.push('[Based on comments:');
    
    const linkedRefs: string[] = [];
    metaComment.linkedComments.forEach(linkedId => {
      const wordComment = lookup.wordComments.find(c => c.id === linkedId);
      if (wordComment) {
        const doc = lookup.documents.find(d => d.id === wordComment.documentId);
        const docName = doc?.name || 'Unknown Document';
        commentRefs.set(linkedId, { author: wordComment.author, docName, type: 'word' });
        const linkedRef = getCommentRefId(linkedId);
        lines.push(`- [${linkedRef}] ${wordComment.author} (${docName})`);
        linkedRefs.push(linkedRef);
      } else {
        const linkedMetaComment = lookup.metaComments.find(c => c.id === linkedId);
        if (linkedMetaComment) {
          commentRefs.set(linkedId, { author: linkedMetaComment.author, docName: '', type: 'meta' });
          const linkedRef = getCommentRefId(linkedId);
          lines.push(`- [${linkedRef}] ${linkedMetaComment.author} (Meta-comment)`);
          linkedRefs.push(linkedRef);
        }
      }
    });
    
    lines.push(']');
  }
  
  return lines;
}

/**
 * Generate a short reference ID from comment ID (e.g., "comment-123" -> "C123", "meta-456" -> "M456")
 */
function getCommentRefId(commentId: string): string {
  // Extract numeric part and type prefix
  if (commentId.startsWith('meta-')) {
    const numericPart = commentId.replace('meta-', '').split('-')[0];
    return `M${numericPart}`;
  } else if (commentId.startsWith('comment-')) {
    const numericPart = commentId.replace('comment-', '');
    return `C${numericPart}`;
  } else {
    // For document-specific IDs like "doc-1-0", extract the last part
    const parts = commentId.split('-');
    const lastPart = parts[parts.length - 1];
    return `C${lastPart}`;
  }
}

/**
 * Extract relationships between comments
 */
function extractRelationships(
  config: ReportConfig,
  lookup: CommentLookup
): string[] {
  const relationships: string[] = [];
  
  config.sections.forEach(section => {
    section.commentIds.forEach(commentId => {
      const metaComment = lookup.metaComments.find(c => c.id === commentId);
      if (metaComment) {
        const sourceRef = getCommentRefId(metaComment.id);
        
        // Check meta-comment type for relationships
        if (metaComment.type === 'synthesis' && metaComment.linkedComments.length > 1) {
          // Multiple linked comments suggest a synthesis relationship
          const linkedRefs = metaComment.linkedComments
            .map(id => getCommentRefId(id))
            .join(', ');
          relationships.push(`${sourceRef} synthesizes ${linkedRefs}`);
        } else if (metaComment.type === 'link' && metaComment.linkedComments.length >= 2) {
          // Link type suggests connected/related comments
          const linkedRefs = metaComment.linkedComments.map(id => getCommentRefId(id));
          for (let i = 0; i < linkedRefs.length - 1; i++) {
            relationships.push(`${linkedRefs[i]} relates-to ${linkedRefs[i + 1]}`);
          }
        } else if (metaComment.type === 'question' && metaComment.linkedComments.length > 0) {
          // Question about specific comments
          const linkedRefs = metaComment.linkedComments
            .map(id => getCommentRefId(id))
            .join(', ');
          relationships.push(`${sourceRef} questions ${linkedRefs}`);
        }
        
        // Check for conflict/constraint tags
        if (metaComment.tags.includes('conflict') && metaComment.linkedComments.length >= 2) {
          const linkedRefs = metaComment.linkedComments.map(id => getCommentRefId(id));
          for (let i = 0; i < linkedRefs.length - 1; i++) {
            relationships.push(`${linkedRefs[i]} conflicts-with ${linkedRefs[i + 1]}`);
          }
        }
        
        if (metaComment.tags.includes('constraint') && metaComment.linkedComments.length > 0) {
          const linkedRefs = metaComment.linkedComments.map(id => getCommentRefId(id));
          if (linkedRefs.length >= 2) {
            relationships.push(`${linkedRefs[0]} constrains ${linkedRefs.slice(1).join(', ')}`);
          }
        }
      }
      
      // Check for threaded comment relationships
      const wordComment = lookup.wordComments.find(c => c.id === commentId);
      if (wordComment && wordComment.parentId) {
        const parentComment = lookup.wordComments.find(c => c.paraId === wordComment.parentId);
        if (parentComment) {
          const childRef = getCommentRefId(wordComment.id);
          const parentRef = getCommentRefId(parentComment.id);
          relationships.push(`${childRef} responds-to ${parentRef}`);
        }
      }
    });
  });
  
  return relationships;
}

/**
 * Extract hashtags from text
 */
function extractHashtags(text: string): string[] {
  const hashtagPattern = /#[\w-]+/g;
  const matches = text.match(hashtagPattern);
  return matches || [];
}
