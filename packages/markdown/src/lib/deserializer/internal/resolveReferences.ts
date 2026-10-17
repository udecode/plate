import type {
  Definition,
  ImageReference,
  LinkReference,
  PhrasingContent,
  Root,
} from 'mdast';

import { visit } from 'unist-util-visit';

const referenceSuffix = (node: ImageReference | LinkReference) => {
  if (node.referenceType === 'full') {
    return `][${node.label ?? node.identifier}]`;
  }
  if (node.referenceType === 'collapsed') {
    return '][]';
  }
  return ']';
};

const resolveLinkReference = (
  node: LinkReference,
  definition: Definition | undefined
): PhrasingContent[] => {
  if (definition) {
    return [
      {
        children: node.children,
        title: definition.title,
        type: 'link',
        url: definition.url,
      },
    ];
  }
  return [
    { type: 'text', value: '[' },
    ...node.children,
    { type: 'text', value: referenceSuffix(node) },
  ];
};

const resolveImageReference = (
  node: ImageReference,
  definition: Definition | undefined
): PhrasingContent[] => {
  if (definition) {
    return [
      {
        alt: node.alt,
        title: definition.title,
        type: 'image',
        url: definition.url,
      },
    ];
  }
  return [
    { type: 'text', value: `![${node.alt ?? ''}${referenceSuffix(node)}` },
  ];
};

export const resolveReferences = (root: Root) => {
  const definitions = new Map<string, Definition>();

  visit(root, 'definition', (node) => {
    if (!definitions.has(node.identifier)) {
      definitions.set(node.identifier, node);
    }
  });

  visit(root, (node, index, parent) => {
    if (
      !parent ||
      index === undefined ||
      (node.type !== 'linkReference' && node.type !== 'imageReference')
    ) {
      return;
    }

    const definition = definitions.get(node.identifier);
    const replacement =
      node.type === 'linkReference'
        ? resolveLinkReference(node, definition)
        : resolveImageReference(node, definition);

    (parent.children as PhrasingContent[]).splice(index, 1, ...replacement);

    return index + replacement.length;
  });
};
