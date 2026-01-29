import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ensureValidImageRID } from './image-rid.js';

describe('ensureValidImageRID', () => {
  let mockEditor;
  let mockTransaction;
  let mockLogger;

  beforeEach(() => {
    mockTransaction = {
      setNodeMarkup: vi.fn(),
    };

    mockLogger = {
      debug: vi.fn(),
    };

    mockEditor = {
      converter: {
        docxHelpers: {
          findRelationshipIdFromTarget: vi.fn(),
          insertNewRelationship: vi.fn(),
        },
      },
    };
  });

  it('does nothing if image already has rId and src', () => {
    const images = [
      {
        node: { attrs: { rId: 'r123', src: 'image.png' } },
        pos: 5,
      },
    ];

    const result = ensureValidImageRID(images, mockEditor, mockTransaction, mockLogger);

    expect(result.modified).toBe(false);
    expect(result.results).toHaveLength(0);
    expect(mockTransaction.setNodeMarkup).not.toHaveBeenCalled();
  });

  it('skips image nodes with no src', () => {
    const images = [
      {
        node: { attrs: {} },
        pos: 8,
      },
    ];

    const result = ensureValidImageRID(images, mockEditor, mockTransaction, mockLogger);

    expect(result.modified).toBe(false);
    expect(result.results).toHaveLength(0);
    expect(mockTransaction.setNodeMarkup).not.toHaveBeenCalled();
  });

  it('reuses existing rId if found via findRelationshipIdFromTarget', () => {
    mockEditor.converter.docxHelpers.findRelationshipIdFromTarget.mockReturnValue('existing-rId');

    const images = [
      {
        node: { attrs: { src: 'img.jpg' } },
        pos: 2,
      },
    ];

    const result = ensureValidImageRID(images, mockEditor, mockTransaction, mockLogger);

    expect(result.modified).toBe(true);
    expect(result.results[0]).toBe('Added missing rId to image at pos 2');
    expect(mockTransaction.setNodeMarkup).toHaveBeenCalledWith(2, undefined, {
      src: 'img.jpg',
      rId: 'existing-rId',
    });

    expect(mockLogger.debug).toHaveBeenCalledWith('Reusing existing rId for image:', 'existing-rId', 'at pos:', 2);
  });

  it('creates new rId when not found', () => {
    mockEditor.converter.docxHelpers.findRelationshipIdFromTarget.mockReturnValue(null);
    mockEditor.converter.docxHelpers.insertNewRelationship.mockReturnValue('new-rId');

    const images = [
      {
        node: { attrs: { src: 'new-img.png' } },
        pos: 3,
      },
    ];

    const result = ensureValidImageRID(images, mockEditor, mockTransaction, mockLogger);

    expect(result.modified).toBe(true);
    expect(result.results[0]).toBe('Added missing rId to image at pos 3');
    expect(mockTransaction.setNodeMarkup).toHaveBeenCalledWith(3, undefined, {
      src: 'new-img.png',
      rId: 'new-rId',
    });

    expect(mockLogger.debug).toHaveBeenCalledWith('Creating new rId for image at pos:', 3, 'with src:', 'new-img.png');
  });

  it('handles multiple images with mixed outcomes', () => {
    mockEditor.converter.docxHelpers.findRelationshipIdFromTarget
      .mockReturnValueOnce(null) // first image -> not found
      .mockReturnValueOnce('reused-rId'); // second image -> found

    mockEditor.converter.docxHelpers.insertNewRelationship.mockReturnValue('created-rId');

    const images = [
      { node: { attrs: { src: 'a.png' } }, pos: 0 },
      { node: { attrs: { src: 'b.png' } }, pos: 10 },
    ];

    const result = ensureValidImageRID(images, mockEditor, mockTransaction, mockLogger);

    expect(result.modified).toBe(true);
    expect(result.results).toHaveLength(2);

    expect(mockTransaction.setNodeMarkup).toHaveBeenCalledTimes(2);
    expect(mockTransaction.setNodeMarkup).toHaveBeenNthCalledWith(1, 0, undefined, {
      src: 'a.png',
      rId: 'created-rId',
    });
    expect(mockTransaction.setNodeMarkup).toHaveBeenNthCalledWith(2, 10, undefined, {
      src: 'b.png',
      rId: 'reused-rId',
    });
  });
});
