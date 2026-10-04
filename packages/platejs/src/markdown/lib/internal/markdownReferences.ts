import type {
  Definition,
  FootnoteDefinition,
  FootnoteReference,
  Image,
  ImageReference,
  Link,
  LinkReference,
  Root,
} from 'mdast';
import type { Plugin as UnifiedPlugin } from 'unified';
import { visit } from 'unist-util-visit';

/**
 * Resolve reference-style links and images against their definitions within
 * one conversion. micromark only creates a reference when its definition
 * exists, so every reference resolves; definitions carry no content of their
 * own and are consumed.
 */
export const remarkResolveMarkdownReferences: UnifiedPlugin<[], Root> =
  () => (tree) => {
    const definitions = new Map<string, Definition>();

    visit(tree, 'definition', (node) => {
      if (!definitions.has(node.identifier)) {
        definitions.set(node.identifier, node);
      }
    });
    if (definitions.size === 0) return;

    // The node test keeps `visit` from looking up every node's sibling index,
    // which is quadratic in a long container.
    visit(
      tree,
      (node) =>
        node.type === 'definition' ||
        node.type === 'linkReference' ||
        node.type === 'imageReference',
      (node, index, parent) => {
        if (!parent || index === undefined) return;
        if (node.type === 'definition') {
          parent.children.splice(index, 1);

          return index;
        }
        const reference = node as ImageReference | LinkReference;
        const definition = definitions.get(reference.identifier);

        if (!definition) return;
        const resolved: Image | Link =
          reference.type === 'linkReference'
            ? {
                children: reference.children,
                position: reference.position,
                title: definition.title,
                type: 'link',
                url: definition.url,
              }
            : {
                alt: reference.alt,
                position: reference.position,
                title: definition.title,
                type: 'image',
                url: definition.url,
              };

        parent.children[index] = resolved;
      }
    );
  };

// CommonMark matches labels case-insensitively with collapsed whitespace.
const normalizeLabel = (label: string) =>
  label.replaceAll(/\s+/g, ' ').trim().toLowerCase();

/**
 * Give each distinct footnote label a spelling that stays distinct after
 * CommonMark label normalization (`A` and `a` would otherwise merge), and
 * report references whose definition is missing from the output.
 */
export const allocateMarkdownFootnoteLabels = (
  tree: Root,
  reportUnresolved: (label: string) => void
) => {
  const nodes: Array<FootnoteDefinition | FootnoteReference> = [];

  // The node test keeps `visit` from looking up every node's sibling index,
  // which is quadratic in a long container.
  visit(
    tree,
    (node) =>
      node.type === 'footnoteDefinition' || node.type === 'footnoteReference',
    (node) => {
      nodes.push(node as FootnoteDefinition | FootnoteReference);
    }
  );
  if (nodes.length === 0) return;

  const labels = new Map<string, string>();
  const taken = new Set<string>();

  for (const node of nodes) {
    if (labels.has(node.identifier)) continue;
    let label = node.identifier;

    for (let suffix = 2; taken.has(normalizeLabel(label)); suffix++) {
      label = `${node.identifier}-${suffix}`;
    }
    labels.set(node.identifier, label);
    taken.add(normalizeLabel(label));
  }

  const defined = new Set(
    nodes
      .filter((node) => node.type === 'footnoteDefinition')
      .map((node) => node.identifier)
  );

  for (const node of nodes) {
    const label = labels.get(node.identifier) ?? node.identifier;

    if (node.type === 'footnoteReference' && !defined.has(node.identifier)) {
      reportUnresolved(node.identifier);
    }
    node.identifier = label;
    node.label = label;
  }
};
