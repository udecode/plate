import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EditorState } from 'prosemirror-state';
import { Node as PMNode } from 'prosemirror-model';
import { schema as basic } from 'prosemirror-schema-basic';

if (!Object.getOwnPropertyDescriptor(PMNode.prototype, 'children')) {
  Object.defineProperty(PMNode.prototype, 'children', {
    get() {
      return { length: this.childCount };
    },
    configurable: true,
  });
}

// Local helpers
const schema = basic;
const p = schema.nodes.paragraph;
const text = (s) => schema.text(s);
const makeState = (docNode) => EditorState.create({ schema, doc: docNode });
const makeAnnotationAt = (state, pos) => {
  const node = state.doc.nodeAt(pos);
  if (!node) throw new Error(`No node at pos ${pos}`);
  return { pos, node };
};
const hardBreak = schema.nodes.hard_break;
const textContent = (docNode) => docNode.textContent;
const mockHelperPath = '../fieldAnnotationHelpers/index.js';

describe('cleanUpParagraphWithAnnotations - test range error crash', () => {
  /** Test to fix error in position out of range in original */
  it('throws RangeError "Position … out of range" on single-paragraph doc', async () => {
    const doc = schema.node('doc', null, [p.createAndFill(null, [text('A')])]);
    const state = makeState(doc);
    const tr = state.tr;

    const ann = makeAnnotationAt(state, 1);

    vi.doMock('../fieldAnnotationHelpers/index.js', () => ({
      findFieldAnnotationsByFieldId: vi.fn(() => [ann]),
    }));

    // Import AFTER mocking so the command picks up the mocked helper
    const { cleanUpParagraphWithAnnotations } = await import('./index.js');

    const cmd = cleanUpParagraphWithAnnotations(['field-x']);
    const run = () => cmd({ dispatch: () => {}, tr, state });

    expect(run).not.toThrow(/Position\s+\d+\s+out of range/i);
  });
});

if (!Object.getOwnPropertyDescriptor(PMNode.prototype, 'children')) {
  Object.defineProperty(PMNode.prototype, 'children', {
    get() {
      return { length: this.childCount };
    },
    configurable: true,
  });
}

describe('cleanUpParagraphWithAnnotations – original behavior', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('deletes a single-child paragraph (non-last) annotated node', async () => {
    // doc: [ p("REMOVE_ME"), p("keep this") ]
    const doc = schema.node('doc', null, [
      p.createAndFill(null, [text('REMOVE_ME')]),
      p.createAndFill(null, [text('keep this')]),
    ]);
    const state = makeState(doc);
    const tr = state.tr;

    // Annotate inside the first paragraph
    const ann = makeAnnotationAt(state, 1);

    vi.doMock(mockHelperPath, () => ({
      findFieldAnnotationsByFieldId: vi.fn(() => [ann]),
    }));

    const { cleanUpParagraphWithAnnotations } = await import('./index.js');
    const cmd = cleanUpParagraphWithAnnotations(['field-x']);

    // no-op dispatch is fine; we inspect tr afterwards
    const run = () => cmd({ dispatch: () => {}, tr, state });
    expect(run).not.toThrow();

    // Should have applied a delete step
    expect(tr.steps.length).toBeGreaterThan(0);

    // The content that was in the annotated paragraph should be gone
    const after = tr.doc;
    expect(textContent(after)).not.toMatch(/REMOVE_ME/);
  });

  it('no-ops when parent has >= 2 inline children (e.g., text + hardBreak + text)', async () => {
    // p("A", <br/>, "B") -> childCount >= 2 -> guard should fail -> no deletion
    const para = p.createAndFill(null, [text('A'), hardBreak.create(), text('B')]);
    const doc = schema.node('doc', null, [para]);
    const state = makeState(doc);
    const tr = state.tr;

    const ann = makeAnnotationAt(state, 1);

    vi.doMock(mockHelperPath, () => ({
      findFieldAnnotationsByFieldId: vi.fn(() => [ann]),
    }));

    const { cleanUpParagraphWithAnnotations } = await import('./index.js');
    const cmd = cleanUpParagraphWithAnnotations(['field-x']);
    const run = () => cmd({ dispatch: () => {}, tr, state });

    expect(run).not.toThrow();
    expect(tr.steps.length).toBe(0); // no delete performed
    expect(textContent(tr.doc)).toContain('AB');
  });

  it('no-ops when the annotation node does not equal the current node at mapped position', async () => {
    // doc: [ p("X"), p("Y") ]
    const doc = schema.node('doc', null, [p.createAndFill(null, [text('X')]), p.createAndFill(null, [text('Y')])]);
    const state = makeState(doc);
    const tr = state.tr;

    // Build an "annotation" object whose node DOES NOT equal the current node at pos 1
    // We fake it by using a different node instance/type (paragraph node) so node.eq(currentNode) is false.
    const badAnn = { pos: 1, node: state.doc.child(0) /* paragraph, not text node */ };

    vi.doMock(mockHelperPath, () => ({
      findFieldAnnotationsByFieldId: vi.fn(() => [badAnn]),
    }));

    const { cleanUpParagraphWithAnnotations } = await import('./index.js');
    const cmd = cleanUpParagraphWithAnnotations(['field-x']);
    const run = () => cmd({ dispatch: () => {}, tr, state });

    expect(run).not.toThrow();
    expect(tr.steps.length).toBe(0); // guard prevented deletion
    expect(textContent(tr.doc)).toMatch(/^XY$/);
  });

  it('handles multiple annotations by queuing and deleting them in descending order', async () => {
    // doc: [ p("FIRST"), p("MID"), p("SECOND") ]
    // Annotate inside FIRST and SECOND (both single-child paragraphs).
    const first = p.createAndFill(null, [text('FIRST')]);
    const mid = p.createAndFill(null, [text('MID')]);
    const second = p.createAndFill(null, [text('SECOND')]);
    const doc = schema.node('doc', null, [first, mid, second]);
    const state = makeState(doc);
    const tr = state.tr;

    // Positions:
    // - First paragraph text starts at pos 1
    // - Compute start of SECOND text by summing nodeSizes
    const firstSize = state.doc.child(0).nodeSize; // [p("FIRST")]
    const midSize = state.doc.child(1).nodeSize; // [p("MID")]
    const secondTextPos = firstSize + midSize + 1;

    const ann1 = makeAnnotationAt(state, 1);
    const ann2 = makeAnnotationAt(state, secondTextPos);

    vi.doMock(mockHelperPath, () => ({
      findFieldAnnotationsByFieldId: vi.fn(() => [ann1, ann2]),
    }));

    const { cleanUpParagraphWithAnnotations } = await import('./index.js');
    const cmd = cleanUpParagraphWithAnnotations(['field-x']);
    const run = () => cmd({ dispatch: () => {}, tr, state });

    expect(run).not.toThrow();
    expect(tr.steps.length).toBeGreaterThan(0);

    // Both annotated paragraph contents should be gone; "MID" may remain
    const after = tr.doc;
    const content = textContent(after);
    expect(content).not.toMatch(/FIRST/);
    expect(content).not.toMatch(/SECOND/);
    expect(content).toMatch(/MID/);
  });
});
