// prettier-ignore
import {
  getExportedResult,
} from '../export-helpers/index';
import basicResolvedCommentData from '../data/comments/basic-resolved-comment';
import {
  getInitials,
  toIsoNoFractional,
  removeCommentsFilesFromConvertedXml,
} from '@converter/v2/exporter/commentsExporter';

describe('[basic-comment.docx] interrupted ordered list tests', async () => {
  const fileName = 'basic-comment.docx';
  const result = await getExportedResult(fileName, basicResolvedCommentData);
  const body = {};

  beforeEach(() => {
    Object.assign(
      body,
      result.elements?.find((el) => el.name === 'w:body'),
    );
  });

  it('correctly exports first list item', () => {
    const content = body.elements[0].elements;
    const commentStart = content.findIndex((el) => el.name === 'w:commentRangeStart');
    const commentId = content[commentStart]?.attributes['w:id'];
    expect(commentStart).toBe(-1);
    expect(commentId).toBeUndefined();
  });
});

describe('test getInitials function', () => {
  it('can get initials from a name', () => {
    const name = 'Nick Bernal';
    const initials = getInitials(name);
    expect(initials).toBe('NB');
  });

  it('removes "(imported)" from the name', () => {
    const name = 'Nick Bernal (imported)';
    const initials = getInitials(name);
    expect(initials).toBe('NB');
  });

  it('removes leading and trailing whitespace', () => {
    const name = '  Nick Bernal  ';
    const initials = getInitials(name);
    expect(initials).toBe('NB');
  });

  it('handles empty strings', () => {
    const name = '';
    const initials = getInitials(name);
    expect(initials).toBe(null);
  });

  it('handles null values', () => {
    const name = null;
    const initials = getInitials(name);
    expect(initials).toBe(null);
  });

  it('can import single name', () => {
    const name = 'Nick';
    const initials = getInitials(name);
    expect(initials).toBe('N');
  });
});

describe('test toIsoNoFractional function', () => {
  it('can convert a date to ISO without fractional seconds', () => {
    const date = 1739389620000;
    const isoDate = toIsoNoFractional(date);
    expect(isoDate).toBe('2025-02-12T19:47:00Z');
  });

  it('can handle null values', () => {
    const date = null;
    const isoDate = toIsoNoFractional(date);
    expect(isoDate).toBeDefined();
  });

  it('can use Date.now()', () => {
    const date = Date.now();
    const isoDate = toIsoNoFractional(date);
    expect(isoDate).toBe(new Date(date).toISOString().replace(/\.\d{3}Z$/, 'Z'));
  });
});

describe('removeCommentsFilesFromConvertedXml', () => {
  it('removes comment-related files from the cloned object without mutating the original', () => {
    // Arrange
    const originalXml = {
      'word/comments.xml': '<comments>Some comment content</comments>',
      'word/commentsExtended.xml': '<commentsExtended>Some extended content</commentsExtended>',
      'word/commentsExtensible.xml': '<commentsExtensible>Some extensible content</commentsExtensible>',
      'word/commentsIds.xml': '<commentsIds>Some comment IDs content</commentsIds>',
      'word/document.xml': '<document>Some document content</document>',
    };

    // Act
    const result = removeCommentsFilesFromConvertedXml(originalXml);

    // Assert
    // 1. The original object should remain unchanged.
    expect(originalXml).toHaveProperty('word/comments.xml');
    expect(originalXml).toHaveProperty('word/commentsExtended.xml');
    expect(originalXml).toHaveProperty('word/commentsExtensible.xml');
    expect(originalXml).toHaveProperty('word/commentsIds.xml');

    // 2. The returned object should NOT have those properties.
    expect(result).not.toHaveProperty('word/comments.xml');
    expect(result).not.toHaveProperty('word/commentsExtended.xml');
    expect(result).not.toHaveProperty('word/commentsExtensible.xml');
    expect(result).not.toHaveProperty('word/commentsIds.xml');

    // 3. The returned object should still contain other properties.
    expect(result).toHaveProperty('word/document.xml');
    expect(result['word/document.xml']).toEqual('<document>Some document content</document>');
  });
});
