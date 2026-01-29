/**
 * Unit tests for RevisionWalker
 *
 * Tests the DOM-based tree walking for accepting Word document revisions
 */

import { RevisionWalker } from '../../src/utils/RevisionWalker';
import { XMLParser } from '../../src/xml/XMLParser';

describe('RevisionWalker', () => {
  describe('processTree', () => {
    describe('Unwrapping insertions (w:ins)', () => {
      it('should unwrap simple w:ins with one w:r child', () => {
        const input = {
          'w:p': {
            'w:ins': {
              '@_w:id': '0',
              '@_w:author': 'Author',
              'w:r': {
                'w:t': { '#text': 'Inserted text' },
              },
              _orderedChildren: [{ type: 'w:r', index: 0 }],
            },
            _orderedChildren: [{ type: 'w:ins', index: 0 }],
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        // w:ins should be removed
        expect(result['w:p']['w:ins']).toBeUndefined();

        // w:r should be promoted to w:p level
        expect(result['w:p']['w:r']).toBeDefined();
        expect(result['w:p']['w:r']['w:t']['#text']).toBe('Inserted text');
      });

      it('should unwrap w:ins with multiple w:r children', () => {
        const input = {
          'w:p': {
            'w:ins': {
              '@_w:id': '0',
              'w:r': [
                { 'w:t': { '#text': 'First' } },
                { 'w:t': { '#text': 'Second' } },
              ],
              _orderedChildren: [
                { type: 'w:r', index: 0 },
                { type: 'w:r', index: 1 },
              ],
            },
            _orderedChildren: [{ type: 'w:ins', index: 0 }],
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        expect(result['w:p']['w:ins']).toBeUndefined();
        expect(Array.isArray(result['w:p']['w:r'])).toBe(true);
        expect(result['w:p']['w:r']).toHaveLength(2);
        expect(result['w:p']['w:r'][0]['w:t']['#text']).toBe('First');
        expect(result['w:p']['w:r'][1]['w:t']['#text']).toBe('Second');
      });

      it('should handle nested w:ins elements', () => {
        const input = {
          'w:p': {
            'w:ins': {
              '@_w:id': '0',
              'w:ins': {
                '@_w:id': '1',
                'w:r': { 'w:t': { '#text': 'Nested' } },
                _orderedChildren: [{ type: 'w:r', index: 0 }],
              },
              _orderedChildren: [{ type: 'w:ins', index: 0 }],
            },
            _orderedChildren: [{ type: 'w:ins', index: 0 }],
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        // Both w:ins should be removed
        expect(result['w:p']['w:ins']).toBeUndefined();
        // Content should be preserved
        expect(result['w:p']['w:r']).toBeDefined();
        expect(result['w:p']['w:r']['w:t']['#text']).toBe('Nested');
      });

      it('should preserve existing runs when unwrapping w:ins', () => {
        const input = {
          'w:p': {
            'w:r': { 'w:t': { '#text': 'Existing' } },
            'w:ins': {
              '@_w:id': '0',
              'w:r': { 'w:t': { '#text': 'Inserted' } },
              _orderedChildren: [{ type: 'w:r', index: 0 }],
            },
            _orderedChildren: [
              { type: 'w:r', index: 0 },
              { type: 'w:ins', index: 0 },
            ],
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        expect(result['w:p']['w:ins']).toBeUndefined();
        expect(Array.isArray(result['w:p']['w:r'])).toBe(true);
        expect(result['w:p']['w:r']).toHaveLength(2);
      });

      it('should not unwrap w:ins when acceptInsertions is false', () => {
        const input = {
          'w:p': {
            'w:ins': {
              '@_w:id': '0',
              'w:r': { 'w:t': { '#text': 'Inserted' } },
            },
          },
        };

        const result = RevisionWalker.processTree(input, {
          acceptInsertions: false,
        }) as any;

        // w:ins should still be present
        expect(result['w:p']['w:ins']).toBeDefined();
      });
    });

    describe('Removing deletions (w:del)', () => {
      it('should remove simple w:del with content', () => {
        const input = {
          'w:p': {
            'w:del': {
              '@_w:id': '0',
              'w:r': {
                'w:delText': { '#text': 'Deleted text' },
              },
            },
            _orderedChildren: [{ type: 'w:del', index: 0 }],
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        // w:del should be removed entirely
        expect(result['w:p']['w:del']).toBeUndefined();
        // No content should be promoted
        expect(result['w:p']['w:r']).toBeUndefined();
      });

      it('should preserve sibling runs when removing w:del', () => {
        const input = {
          'w:p': {
            'w:r': [
              { 'w:t': { '#text': 'Before' } },
              { 'w:t': { '#text': 'After' } },
            ],
            'w:del': {
              '@_w:id': '0',
              'w:r': { 'w:delText': { '#text': 'Deleted' } },
            },
            _orderedChildren: [
              { type: 'w:r', index: 0 },
              { type: 'w:del', index: 0 },
              { type: 'w:r', index: 1 },
            ],
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        expect(result['w:p']['w:del']).toBeUndefined();
        expect(Array.isArray(result['w:p']['w:r'])).toBe(true);
        expect(result['w:p']['w:r']).toHaveLength(2);
        expect(result['w:p']['w:r'][0]['w:t']['#text']).toBe('Before');
        expect(result['w:p']['w:r'][1]['w:t']['#text']).toBe('After');
      });

      it('should not remove w:del when acceptDeletions is false', () => {
        const input = {
          'w:p': {
            'w:del': {
              '@_w:id': '0',
              'w:r': { 'w:delText': { '#text': 'Deleted' } },
            },
          },
        };

        const result = RevisionWalker.processTree(input, {
          acceptDeletions: false,
        }) as any;

        expect(result['w:p']['w:del']).toBeDefined();
      });
    });

    describe('Move operations (w:moveFrom, w:moveTo)', () => {
      it('should remove w:moveFrom with content', () => {
        const input = {
          'w:p': {
            'w:moveFrom': {
              '@_w:id': '0',
              'w:r': { 'w:t': { '#text': 'Moved text' } },
            },
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        expect(result['w:p']['w:moveFrom']).toBeUndefined();
        expect(result['w:p']['w:r']).toBeUndefined();
      });

      it('should unwrap w:moveTo keeping content', () => {
        const input = {
          'w:p': {
            'w:moveTo': {
              '@_w:id': '0',
              'w:r': { 'w:t': { '#text': 'Moved text' } },
              _orderedChildren: [{ type: 'w:r', index: 0 }],
            },
            _orderedChildren: [{ type: 'w:moveTo', index: 0 }],
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        expect(result['w:p']['w:moveTo']).toBeUndefined();
        expect(result['w:p']['w:r']).toBeDefined();
        expect(result['w:p']['w:r']['w:t']['#text']).toBe('Moved text');
      });

      it('should not process moves when acceptMoves is false', () => {
        const input = {
          'w:p': {
            'w:moveFrom': {
              '@_w:id': '0',
              'w:r': { 'w:t': { '#text': 'Source' } },
            },
            'w:moveTo': {
              '@_w:id': '1',
              'w:r': { 'w:t': { '#text': 'Dest' } },
            },
          },
        };

        const result = RevisionWalker.processTree(input, {
          acceptMoves: false,
        }) as any;

        expect(result['w:p']['w:moveFrom']).toBeDefined();
        expect(result['w:p']['w:moveTo']).toBeDefined();
      });
    });

    describe('Property changes', () => {
      it('should remove w:rPrChange', () => {
        const input = {
          'w:r': {
            'w:rPr': {
              'w:b': {},
              'w:rPrChange': {
                '@_w:id': '0',
                '@_w:author': 'Author',
                'w:rPr': { 'w:i': {} },
              },
            },
            'w:t': { '#text': 'Text' },
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        expect(result['w:r']['w:rPr']['w:rPrChange']).toBeUndefined();
        expect(result['w:r']['w:rPr']['w:b']).toBeDefined();
      });

      it('should remove w:pPrChange', () => {
        const input = {
          'w:p': {
            'w:pPr': {
              'w:jc': { '@_w:val': 'center' },
              'w:pPrChange': {
                '@_w:id': '0',
                'w:pPr': { 'w:jc': { '@_w:val': 'left' } },
              },
            },
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        expect(result['w:p']['w:pPr']['w:pPrChange']).toBeUndefined();
        expect(result['w:p']['w:pPr']['w:jc']).toBeDefined();
      });

      it('should remove all property change types', () => {
        const propertyChangeTypes = [
          'w:rPrChange',
          'w:pPrChange',
          'w:tblPrChange',
          'w:tcPrChange',
          'w:trPrChange',
          'w:sectPrChange',
          'w:tblGridChange',
          'w:numberingChange',
        ];

        for (const changeType of propertyChangeTypes) {
          const input = {
            'w:parent': {
              [changeType]: { '@_w:id': '0' },
              'w:other': {},
            },
          };

          const result = RevisionWalker.processTree(input) as any;

          expect(result['w:parent'][changeType]).toBeUndefined();
          expect(result['w:parent']['w:other']).toBeDefined();
        }
      });

      it('should not remove property changes when acceptPropertyChanges is false', () => {
        const input = {
          'w:r': {
            'w:rPr': {
              'w:rPrChange': { '@_w:id': '0' },
            },
          },
        };

        const result = RevisionWalker.processTree(input, {
          acceptPropertyChanges: false,
        }) as any;

        expect(result['w:r']['w:rPr']['w:rPrChange']).toBeDefined();
      });
    });

    describe('Range markers', () => {
      it('should remove move range markers', () => {
        const input = {
          'w:p': {
            'w:moveFromRangeStart': { '@_w:id': '0' },
            'w:r': { 'w:t': { '#text': 'Text' } },
            'w:moveFromRangeEnd': { '@_w:id': '0' },
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        expect(result['w:p']['w:moveFromRangeStart']).toBeUndefined();
        expect(result['w:p']['w:moveFromRangeEnd']).toBeUndefined();
        expect(result['w:p']['w:r']).toBeDefined();
      });

      it('should remove all range marker types', () => {
        const rangeMarkerTypes = [
          'w:moveFromRangeStart',
          'w:moveFromRangeEnd',
          'w:moveToRangeStart',
          'w:moveToRangeEnd',
          'w:customXmlInsRangeStart',
          'w:customXmlInsRangeEnd',
          'w:customXmlDelRangeStart',
          'w:customXmlDelRangeEnd',
        ];

        for (const markerType of rangeMarkerTypes) {
          const input = {
            'w:p': {
              [markerType]: { '@_w:id': '0' },
              'w:r': { 'w:t': { '#text': 'Text' } },
            },
          };

          const result = RevisionWalker.processTree(input) as any;

          expect(result['w:p'][markerType]).toBeUndefined();
          expect(result['w:p']['w:r']).toBeDefined();
        }
      });
    });

    describe('Element order preservation', () => {
      it('should update _orderedChildren when unwrapping', () => {
        const input = {
          'w:p': {
            'w:r': { 'w:t': { '#text': 'Before' } },
            'w:ins': {
              '@_w:id': '0',
              'w:r': { 'w:t': { '#text': 'Inserted' } },
              _orderedChildren: [{ type: 'w:r', index: 0 }],
            },
            _orderedChildren: [
              { type: 'w:r', index: 0 },
              { type: 'w:ins', index: 0 },
            ],
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        // _orderedChildren should be updated
        expect(result['w:p']._orderedChildren).toBeDefined();
        // Should not contain w:ins
        const hasIns = result['w:p']._orderedChildren.some(
          (c: any) => c.type === 'w:ins'
        );
        expect(hasIns).toBe(false);
      });

      it('should update _orderedChildren when removing', () => {
        const input = {
          'w:p': {
            'w:r': { 'w:t': { '#text': 'Before' } },
            'w:del': {
              '@_w:id': '0',
              'w:r': { 'w:delText': { '#text': 'Deleted' } },
            },
            _orderedChildren: [
              { type: 'w:r', index: 0 },
              { type: 'w:del', index: 0 },
            ],
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        expect(result['w:p']._orderedChildren).toBeDefined();
        const hasDel = result['w:p']._orderedChildren.some(
          (c: any) => c.type === 'w:del'
        );
        expect(hasDel).toBe(false);
      });
    });

    describe('Edge cases', () => {
      it('should handle empty w:ins elements', () => {
        const input = {
          'w:p': {
            'w:ins': { '@_w:id': '0' },
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        expect(result['w:p']['w:ins']).toBeUndefined();
      });

      it('should handle empty w:del elements', () => {
        const input = {
          'w:p': {
            'w:del': { '@_w:id': '0' },
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        expect(result['w:p']['w:del']).toBeUndefined();
      });

      it('should handle w:ins containing w:del', () => {
        const input = {
          'w:p': {
            'w:ins': {
              '@_w:id': '0',
              'w:del': {
                '@_w:id': '1',
                'w:r': { 'w:delText': { '#text': 'Deleted inside insert' } },
              },
              'w:r': { 'w:t': { '#text': 'Kept text' } },
              _orderedChildren: [
                { type: 'w:del', index: 0 },
                { type: 'w:r', index: 0 },
              ],
            },
            _orderedChildren: [{ type: 'w:ins', index: 0 }],
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        // Both w:ins and w:del should be processed
        expect(result['w:p']['w:ins']).toBeUndefined();
        expect(result['w:p']['w:del']).toBeUndefined();
        // Only the non-deleted content should remain
        expect(result['w:p']['w:r']).toBeDefined();
        expect(result['w:p']['w:r']['w:t']['#text']).toBe('Kept text');
      });

      it('should not mutate the original object', () => {
        const input = {
          'w:p': {
            'w:ins': {
              '@_w:id': '0',
              'w:r': { 'w:t': { '#text': 'Inserted' } },
            },
          },
        };

        const originalStr = JSON.stringify(input);
        RevisionWalker.processTree(input);

        expect(JSON.stringify(input)).toBe(originalStr);
      });

      it('should handle deeply nested structures', () => {
        const input = {
          'w:document': {
            'w:body': {
              'w:p': {
                'w:ins': {
                  '@_w:id': '0',
                  'w:r': {
                    'w:rPr': {
                      'w:rPrChange': { '@_w:id': '1' },
                    },
                    'w:t': { '#text': 'Deep text' },
                  },
                  _orderedChildren: [{ type: 'w:r', index: 0 }],
                },
                _orderedChildren: [{ type: 'w:ins', index: 0 }],
              },
            },
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        expect(result['w:document']['w:body']['w:p']['w:ins']).toBeUndefined();
        expect(result['w:document']['w:body']['w:p']['w:r']).toBeDefined();
        expect(
          result['w:document']['w:body']['w:p']['w:r']['w:rPr']['w:rPrChange']
        ).toBeUndefined();
      });

      it('should handle multiple w:ins elements at same level', () => {
        const input = {
          'w:p': {
            'w:ins': [
              {
                '@_w:id': '0',
                'w:r': { 'w:t': { '#text': 'First' } },
                _orderedChildren: [{ type: 'w:r', index: 0 }],
              },
              {
                '@_w:id': '1',
                'w:r': { 'w:t': { '#text': 'Second' } },
                _orderedChildren: [{ type: 'w:r', index: 0 }],
              },
            ],
            _orderedChildren: [
              { type: 'w:ins', index: 0 },
              { type: 'w:ins', index: 1 },
            ],
          },
        };

        const result = RevisionWalker.processTree(input) as any;

        expect(result['w:p']['w:ins']).toBeUndefined();
        expect(Array.isArray(result['w:p']['w:r'])).toBe(true);
        expect(result['w:p']['w:r']).toHaveLength(2);
      });
    });

    describe('Integration with XMLParser', () => {
      it('should process parsed XML correctly', () => {
        const xml = `
          <w:p xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:ins w:id="0" w:author="Test">
              <w:r>
                <w:t>Inserted text</w:t>
              </w:r>
            </w:ins>
          </w:p>
        `;

        const parsed = XMLParser.parseToObject(xml);
        const result = RevisionWalker.processTree(parsed) as any;

        expect(result['w:p']['w:ins']).toBeUndefined();
        expect(result['w:p']['w:r']).toBeDefined();
      });

      it('should handle complex real-world XML', () => {
        const xml = `
          <w:body xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
            <w:p>
              <w:r>
                <w:t>Normal text</w:t>
              </w:r>
              <w:ins w:id="1" w:author="User">
                <w:r>
                  <w:rPr>
                    <w:b/>
                    <w:rPrChange w:id="2">
                      <w:rPr/>
                    </w:rPrChange>
                  </w:rPr>
                  <w:t>Bold inserted</w:t>
                </w:r>
              </w:ins>
              <w:del w:id="3" w:author="User">
                <w:r>
                  <w:delText>Deleted</w:delText>
                </w:r>
              </w:del>
            </w:p>
          </w:body>
        `;

        const parsed = XMLParser.parseToObject(xml);
        const result = RevisionWalker.processTree(parsed) as any;

        // Check w:ins is unwrapped
        expect(result['w:body']['w:p']['w:ins']).toBeUndefined();
        // Check w:del is removed
        expect(result['w:body']['w:p']['w:del']).toBeUndefined();
        // Check w:rPrChange is removed
        const runs = result['w:body']['w:p']['w:r'];
        expect(Array.isArray(runs)).toBe(true);

        // Find the run with rPr and verify rPrChange is removed
        const runWithRPr = runs.find((r: any) => r['w:rPr']);
        if (runWithRPr) {
          expect(runWithRPr['w:rPr']['w:rPrChange']).toBeUndefined();
          expect(runWithRPr['w:rPr']['w:b']).toBeDefined();
        }
      });
    });
  });

  describe('isRevisionElement', () => {
    it('should identify w:ins as revision element', () => {
      expect(RevisionWalker.isRevisionElement('w:ins')).toBe(true);
    });

    it('should identify w:del as revision element', () => {
      expect(RevisionWalker.isRevisionElement('w:del')).toBe(true);
    });

    it('should identify property changes as revision elements', () => {
      expect(RevisionWalker.isRevisionElement('w:rPrChange')).toBe(true);
      expect(RevisionWalker.isRevisionElement('w:pPrChange')).toBe(true);
    });

    it('should identify range markers as revision elements', () => {
      expect(RevisionWalker.isRevisionElement('w:moveFromRangeStart')).toBe(
        true
      );
      expect(RevisionWalker.isRevisionElement('w:moveToRangeEnd')).toBe(true);
    });

    it('should not identify regular elements as revision elements', () => {
      expect(RevisionWalker.isRevisionElement('w:r')).toBe(false);
      expect(RevisionWalker.isRevisionElement('w:p')).toBe(false);
      expect(RevisionWalker.isRevisionElement('w:t')).toBe(false);
    });
  });

  describe('getRevisionElementCategories', () => {
    it('should return all revision element categories', () => {
      const categories = RevisionWalker.getRevisionElementCategories();

      expect(categories.UNWRAP).toContain('w:ins');
      expect(categories.UNWRAP).toContain('w:moveTo');
      expect(categories.REMOVE).toContain('w:del');
      expect(categories.REMOVE).toContain('w:moveFrom');
      expect(categories.PROPERTY_CHANGES).toContain('w:rPrChange');
      expect(categories.RANGE_MARKERS).toContain('w:moveFromRangeStart');
    });
  });
});
