import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Schema, DOMSerializer } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { SectionHelpers } from '@helpers/index.js';
import { DocumentSection } from './document-section.js';

vi.mock('@helpers/index.js', async () => {
  return {
    SectionHelpers: {
      getAllSections: vi.fn(),
    },
    findParentNode: () => () => null,
  };
});

// NodeView referenced by addNodeView, but not executed in these tests
vi.mock('../src/document-section/DocumentSectionView.js', async () => {
  return { DocumentSectionView: class {} };
});

// Minimal shims for Node.create / Attribute.mergeAttributes
vi.mock('@core/index.js', async () => {
  return {
    Node: {
      create(spec) {
        // Return spec so addCommands/parseDOM/etc are available
        return spec;
      },
    },
    Attribute: {
      mergeAttributes(a, b) {
        return { ...(a || {}), ...(b || {}) };
      },
    },
  };
});

function makeSchema() {
  const nodes = {
    doc: { content: 'block+' },
    text: { group: 'inline' },
    paragraph: {
      content: 'inline*',
      group: 'block',
      parseDOM: [{ tag: 'p' }],
      toDOM() {
        return ['p', 0];
      },
    },
    documentSection: {
      group: 'block',
      content: 'block*',
      atom: true,
      isolating: true,
      attrs: {
        id: { default: null },
        title: { default: '' },
        description: { default: '' },
        sectionType: { default: '' },
        isLocked: { default: false },
      },
      parseDOM: [{ tag: 'div.sd-document-section-block' }],
      toDOM(node) {
        return ['div', { class: 'sd-document-section-block', 'data-id': node.attrs.id }, 0];
      },
    },
  };
  return new Schema({ nodes });
}

function p(schema, text) {
  return schema.nodes.paragraph.createAndFill(null, schema.text(text));
}

function section(schema, attrs, contentNodes) {
  return schema.nodes.documentSection.createAndFill(attrs, contentNodes);
}

function docHTML(schema, doc) {
  const serializer = DOMSerializer.fromSchema(schema);
  const wrap = document.createElement('div');
  wrap.appendChild(serializer.serializeFragment(doc.content));
  return wrap.innerHTML;
}

describe('DocumentSection.updateSectionById (JS only)', () => {
  let schema;

  beforeEach(() => {
    schema = makeSchema();
    vi.clearAllMocks();
  });

  it('updates attributes (attrs-only)', () => {
    // initial doc: one section with id:1 and a paragraph
    const initialDoc = schema.nodes.doc.create(null, [
      section(schema, { id: 1, title: 'Old Title' }, [p(schema, 'Hello')]),
    ]);
    const state = EditorState.create({ schema, doc: initialDoc });

    const tr = state.tr;
    const dispatch = () => {}; // attrs-only path doesn't need us to capture the doc

    // Mock getAllSections to find the section at pos 0 (single top-level node)
    const secNode = state.doc.firstChild;
    SectionHelpers.getAllSections.mockReturnValue([{ pos: 0, node: secNode }]);

    // Build the command
    const cmdFactory = DocumentSection.addCommands().updateSectionById;
    const cmd = cmdFactory({ id: 1, attrs: { title: 'New Title', isLocked: true } }).bind({
      editor: { schema },
    });

    const ok = cmd({ tr, dispatch, editor: { schema } });
    expect(ok).toBe(true);

    const updated = tr.doc.firstChild;
    expect(updated.type.name).toBe('documentSection');
    expect(updated.attrs.title).toBe('New Title');
    expect(updated.attrs.isLocked).toBe(true);
  });

  it('updates content from JSON (JSON takes precedence over HTML)', () => {
    const initialDoc = schema.nodes.doc.create(null, [section(schema, { id: 1 }, [p(schema, 'Old')])]);
    const state = EditorState.create({ schema, doc: initialDoc });

    let nextDoc = state.doc;
    const dispatch = (t) => {
      nextDoc = t.doc;
    };

    const secNode = state.doc.firstChild;
    SectionHelpers.getAllSections.mockReturnValue([{ pos: 0, node: secNode }]);

    const json = { type: 'paragraph', content: [{ type: 'text', text: 'From JSON' }] };

    const cmdFactory = DocumentSection.addCommands().updateSectionById;
    const cmd = cmdFactory({ id: 1, html: '<p>From HTML</p>', json }).bind({
      editor: { schema },
    });

    const ok = cmd({ tr: state.tr, dispatch, editor: { schema } });
    expect(ok).toBe(true);

    const html = docHTML(schema, nextDoc);
    expect(html).toContain('<p>From JSON</p>');
    expect(html).not.toContain('From HTML');
  });

  it('updates content from HTML when JSON not provided', () => {
    const initialDoc = schema.nodes.doc.create(null, [section(schema, { id: 1 }, [p(schema, 'Old')])]);
    const state = EditorState.create({ schema, doc: initialDoc });

    let nextDoc = state.doc;
    const dispatch = (t) => {
      nextDoc = t.doc;
    };

    const secNode = state.doc.firstChild;
    SectionHelpers.getAllSections.mockReturnValue([{ pos: 0, node: secNode }]);

    const cmdFactory = DocumentSection.addCommands().updateSectionById;
    const cmd = cmdFactory({ id: 1, html: '<p>From HTML</p>' }).bind({
      editor: { schema },
    });

    const ok = cmd({ tr: state.tr, dispatch, editor: { schema } });
    expect(ok).toBe(true);

    const htmlOut = docHTML(schema, nextDoc);
    expect(htmlOut).toContain('<p>From HTML</p>');
  });
});
