import { describe, it, expect } from 'vitest';
import {
  getNewRelationshipId,
  getDocumentRelationshipElements,
  getMaxRelationshipIdInt,
  insertNewRelationship,
  findRelationshipIdFromTarget,
} from './document-rels.js';
import { RELATIONSHIP_TYPES } from './docx-constants.js';

describe('getNewRelationshipId', () => {
  it('returns rId1 when no existing relationships', () => {
    const editor = {
      converter: {
        convertedXml: {
          'word/_rels/document.xml.rels': {
            elements: [
              {
                name: 'Relationships',
                elements: [],
              },
            ],
          },
        },
      },
    };

    const result = getNewRelationshipId(editor);
    expect(result).toBe('rId1');
  });

  it('returns rIdN+1 when max rId is rId11', () => {
    const editor = {
      converter: {
        convertedXml: {
          'word/_rels/document.xml.rels': {
            elements: [
              {
                name: 'Relationships',
                elements: [{ attributes: { Id: 'rId5' } }, { attributes: { Id: 'rId11' } }],
              },
            ],
          },
        },
      },
    };

    const result = getNewRelationshipId(editor);
    expect(result).toBe('rId12');
  });

  it('returns rId1 if Relationships tag is missing', () => {
    const editor = {
      converter: {
        convertedXml: {
          'word/_rels/document.xml.rels': {
            elements: [], // no Relationships tag
          },
        },
      },
    };

    const result = getNewRelationshipId(editor);
    expect(result).toBe('rId1');
  });
});

describe('getMaxRelationshipIdInt', () => {
  it('returns 0 for an empty relationships array', () => {
    const result = getMaxRelationshipIdInt([]);
    expect(result).toBe(0);
  });

  it('returns the max numeric value from valid rId strings', () => {
    const relationships = [
      { attributes: { Id: 'rId2' } },
      { attributes: { Id: 'rId10' } },
      { attributes: { Id: 'rId5' } },
    ];
    const result = getMaxRelationshipIdInt(relationships);
    expect(result).toBe(10);
  });

  it('ignores malformed rIds and returns max from valid ones', () => {
    const relationships = [
      { attributes: { Id: 'rId3' } },
      { attributes: { Id: 'invalid' } },
      { attributes: { Id: 'rIDX' } }, // Not a number
      { attributes: { Id: 'rId42' } },
      { attributes: { Id: 'rId' } }, // No number
    ];
    const result = getMaxRelationshipIdInt(relationships);
    expect(result).toBe(42);
  });

  it('returns 0 if no valid numeric rIds are present', () => {
    const relationships = [
      { attributes: { Id: 'foo' } },
      { attributes: { Id: 'rIdABC' } },
      { attributes: { Id: 'bar' } },
    ];
    const result = getMaxRelationshipIdInt(relationships);
    expect(result).toBe(0);
  });

  it('handles rIds with prefixes like "word_rId23"', () => {
    const relationships = [{ attributes: { Id: 'word_rId7' } }, { attributes: { Id: 'word_rId12' } }];
    const result = getMaxRelationshipIdInt(relationships);
    expect(result).toBe(12); // split on 'rId', then parse
  });

  it('handles rIds with leading zeros like "rId0012"', () => {
    const relationships = [{ attributes: { Id: 'rId0005' } }, { attributes: { Id: 'rId0012' } }];
    const result = getMaxRelationshipIdInt(relationships);
    expect(result).toBe(12);
  });
});

describe('getDocumentRelationshipElements', () => {
  it('returns relationship elements when structure is valid', () => {
    const editor = {
      converter: {
        convertedXml: {
          'word/_rels/document.xml.rels': {
            elements: [
              {
                name: 'Relationships',
                elements: [{ attributes: { Id: 'rId1' } }, { attributes: { Id: 'rId2' } }],
              },
            ],
          },
        },
      },
    };

    const result = getDocumentRelationshipElements(editor);
    expect(result).toHaveLength(2);
    expect(result[0].attributes.Id).toBe('rId1');
    expect(result[1].attributes.Id).toBe('rId2');
  });

  it('returns an empty array if document.xml.rels is missing', () => {
    const editor = {
      converter: {
        convertedXml: {},
      },
    };

    const result = getDocumentRelationshipElements(editor);
    expect(result).toEqual([]);
  });

  it('returns an empty array if Relationships tag is missing', () => {
    const editor = {
      converter: {
        convertedXml: {
          'word/_rels/document.xml.rels': {
            elements: [{ name: 'OtherTag', elements: [{}, {}] }],
          },
        },
      },
    };

    const result = getDocumentRelationshipElements(editor);
    expect(result).toEqual([]);
  });

  it('returns an empty array if Relationships tag has no elements', () => {
    const editor = {
      converter: {
        convertedXml: {
          'word/_rels/document.xml.rels': {
            elements: [{ name: 'Relationships' }],
          },
        },
      },
    };

    const result = getDocumentRelationshipElements(editor);
    expect(result).toEqual([]);
  });

  it('returns an empty array if documentRels has no elements key', () => {
    const editor = {
      converter: {
        convertedXml: {
          'word/_rels/document.xml.rels': {},
        },
      },
    };

    const result = getDocumentRelationshipElements(editor);
    expect(result).toEqual([]);
  });
});

describe('insertNewRelationship', () => {
  let mockEditor;

  beforeEach(() => {
    mockEditor = {
      converter: {
        convertedXml: {
          'word/_rels/document.xml.rels': {
            elements: [
              {
                name: 'Relationships',
                elements: [
                  {
                    attributes: {
                      Id: 'rId42',
                      Target: 'foo',
                    },
                  },
                ],
              },
            ],
          },
        },
      },
    };

    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  it('throws if target is not a non-empty string', () => {
    expect(() => insertNewRelationship(null, 'hyperlink', mockEditor)).toThrow();
    expect(() => insertNewRelationship(123, 'hyperlink', mockEditor)).toThrow();
    expect(() => insertNewRelationship('', 'hyperlink', mockEditor)).toThrow();
  });

  it('throws if type is not a non-empty string', () => {
    expect(() => insertNewRelationship('foo', null, mockEditor)).toThrow();
    expect(() => insertNewRelationship('foo', 123, mockEditor)).toThrow();
    expect(() => insertNewRelationship('foo', '', mockEditor)).toThrow();
  });

  it('throws if editor is not provided', () => {
    expect(() => insertNewRelationship('foo', 'hyperlink')).toThrow();
  });

  it('returns null and warns on unsupported type', () => {
    const result = insertNewRelationship('foo', 'unsupportedType', mockEditor);
    expect(result).toBeNull();
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Unsupported relationship type'));
  });

  it('returns existing relationship if already present', () => {
    vi.spyOn({ findRelationshipIdFromTarget }, 'findRelationshipIdFromTarget').mockReturnValueOnce('rId42');

    const result = insertNewRelationship('foo', 'hyperlink', mockEditor);
    expect(result).toBe('rId42');
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('Reusing existing relationship for target'));
  });

  it('returns null if editor.converter.convertedXml is missing', () => {
    const badEditor = { converter: {} };
    const result = insertNewRelationship('foo', 'hyperlink', badEditor);
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('No converted XML found in editor');
  });

  it('returns null if documentRels is missing', () => {
    const badEditor = {
      converter: {
        convertedXml: {},
      },
    };
    const result = insertNewRelationship('foo', 'hyperlink', badEditor);
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('No document relationships found in the docx');
  });

  it('returns null if Relationships tag is missing', () => {
    const editor = {
      converter: {
        convertedXml: {
          'word/_rels/document.xml.rels': {
            elements: [],
          },
        },
      },
    };

    const result = insertNewRelationship('foo', 'hyperlink', editor);
    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith('No Relationships tag found in document relationships');
  });

  it('returns null if getNewRelationshipId fails', () => {
    const result = insertNewRelationship('bar', 'hyperlink', mockEditor);
    expect(result).toBe('rId43');
  });

  it('inserts a new relationship and returns the new rId', () => {
    const result = insertNewRelationship('bar', 'hyperlink', mockEditor);
    expect(result).toBe('rId43');

    const relationshipsTag = mockEditor.converter.convertedXml['word/_rels/document.xml.rels'].elements[0];
    const lastElement = relationshipsTag.elements[relationshipsTag.elements.length - 1];

    expect(lastElement).toEqual({
      type: 'element',
      name: 'Relationship',
      attributes: {
        Id: 'rId43',
        Type: RELATIONSHIP_TYPES.hyperlink,
        Target: 'bar',
      },
    });
  });
});
