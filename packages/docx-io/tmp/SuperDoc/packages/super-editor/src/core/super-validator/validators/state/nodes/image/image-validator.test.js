import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ensureValidImageRID } from './rules/index.js';

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

  it('does nothing when rId is already present', () => {
    const images = [
      {
        node: { attrs: { rId: 'r1', src: 'image.png' } },
        pos: 0,
      },
    ];

    const result = ensureValidImageRID(images, mockEditor, mockTransaction, mockLogger);

    expect(result.modified).toBe(false);
    expect(result.results).toHaveLength(0);
    expect(mockTransaction.setNodeMarkup).not.toHaveBeenCalled();
  });

  it('reuses existing rId when found', () => {
    mockEditor.converter.docxHelpers.findRelationshipIdFromTarget.mockReturnValue('existing-rId');

    const images = [
      {
        node: { attrs: { src: 'image1.png' } },
        pos: 5,
      },
    ];

    const result = ensureValidImageRID(images, mockEditor, mockTransaction, mockLogger);

    expect(result.modified).toBe(true);
    expect(result.results[0]).toContain('Added missing rId to image at pos 5');
    expect(mockTransaction.setNodeMarkup).toHaveBeenCalledWith(5, undefined, {
      src: 'image1.png',
      rId: 'existing-rId',
    });

    expect(mockLogger.debug).toHaveBeenCalledWith('Reusing existing rId for image:', 'existing-rId', 'at pos:', 5);
  });

  it('creates new rId when not found', () => {
    mockEditor.converter.docxHelpers.findRelationshipIdFromTarget.mockReturnValue(null);
    mockEditor.converter.docxHelpers.insertNewRelationship.mockReturnValue('new-rId');

    const images = [
      {
        node: { attrs: { src: 'new-image.png' } },
        pos: 2,
      },
    ];

    const result = ensureValidImageRID(images, mockEditor, mockTransaction, mockLogger);

    expect(result.modified).toBe(true);
    expect(result.results[0]).toBe('Added missing rId to image at pos 2');

    expect(mockTransaction.setNodeMarkup).toHaveBeenCalledWith(2, undefined, {
      src: 'new-image.png',
      rId: 'new-rId',
    });

    expect(mockLogger.debug).toHaveBeenCalledWith(
      'Creating new rId for image at pos:',
      2,
      'with src:',
      'new-image.png',
    );
  });

  it('skips images with no src', () => {
    const images = [
      {
        node: { attrs: {} },
        pos: 3,
      },
    ];

    const result = ensureValidImageRID(images, mockEditor, mockTransaction, mockLogger);

    expect(result.modified).toBe(false);
    expect(result.results).toHaveLength(0);
    expect(mockTransaction.setNodeMarkup).not.toHaveBeenCalled();
  });

  it('handles multiple images with mixed outcomes', () => {
    mockEditor.converter.docxHelpers.findRelationshipIdFromTarget
      .mockReturnValueOnce(null)
      .mockReturnValueOnce('reused-rId');

    mockEditor.converter.docxHelpers.insertNewRelationship.mockReturnValue('created-rId');

    const images = [
      { node: { attrs: { src: 'img-a.png' } }, pos: 0 },
      { node: { attrs: { src: 'img-b.png' } }, pos: 10 },
    ];

    const result = ensureValidImageRID(images, mockEditor, mockTransaction, mockLogger);

    expect(result.modified).toBe(true);
    expect(result.results).toHaveLength(2);
    expect(mockTransaction.setNodeMarkup).toHaveBeenCalledTimes(2);
  });
});
