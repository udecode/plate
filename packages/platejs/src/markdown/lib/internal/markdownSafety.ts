import type { Parent, Root, RootContent } from 'mdast';

import {
  decideUrl,
  isScriptCapableUrl,
  isScriptUrl,
} from '../../../internal/utils/urlPolicy';
import type { MarkdownDiagnostic, MarkdownSourceLocation } from '../types';

type MarkdownSafetyOptions = Readonly<{
  lossPolicy: 'allow' | 'reject';
  phase: 'parse' | 'serialize';
  report: (diagnostic: MarkdownDiagnostic) => void;
  sourceLocation?: (node: RootContent) => MarkdownSourceLocation | undefined;
}>;

const isUnsafe = (role: 'image' | 'navigation', url: string) => {
  const decision = decideUrl(role, url);

  return !decision.ok && decision.reason !== 'empty';
};

/**
 * Remove destinations no reader or page may act on from standard link, image
 * and definition syntax. Parsing runs this before any mapping reads the tree;
 * serializing runs it on the emitted tree. A link keeps its label and an image
 * its alt text; an empty destination is unresolved, not unsafe.
 */
export const cleanMarkdownDestinations = (
  tree: Root,
  { lossPolicy, phase, report, sourceLocation }: MarkdownSafetyOptions
) => {
  // A link or definition keeps its label, so losing its destination warns
  // under every policy; a lost image follows the loss policy.
  const reportRemoval = (
    node: RootContent,
    impact: 'lossless' | 'lossy',
    message: string
  ) =>
    report({
      code: 'markdown-unsafe-content',
      impact,
      message,
      nodeType: node.type,
      phase,
      severity:
        impact === 'lossless' || lossPolicy === 'allow' || node.type !== 'image'
          ? 'warning'
          : 'error',
      source: sourceLocation?.(node),
    });
  const clean = (parent: { children: Parent['children'] }) => {
    parent.children = parent.children.flatMap((child): RootContent[] => {
      if (child.type === 'link' && isUnsafe('navigation', child.url)) {
        reportRemoval(
          child,
          isScriptCapableUrl(child.url) ? 'lossless' : 'lossy',
          'Markdown link destination is not safe to open and was removed; its label was kept.'
        );
        clean(child);

        return child.children;
      }
      if (child.type === 'definition' && isUnsafe('navigation', child.url)) {
        reportRemoval(
          child,
          isScriptCapableUrl(child.url) ? 'lossless' : 'lossy',
          'Markdown link definition is not safe to open and was removed; its references read as text.'
        );

        return [];
      }
      if (child.type === 'image' && isUnsafe('image', child.url)) {
        // A script source never rendered, so only its alt text was visible.
        reportRemoval(
          child,
          isScriptUrl(child.url) ? 'lossless' : 'lossy',
          child.alt
            ? 'Markdown image source is not an allowed image source; the image was removed and its alt text kept.'
            : 'Markdown image source is not an allowed image source; the image was removed.'
        );

        return child.alt ? [{ type: 'text', value: child.alt }] : [];
      }
      if ('children' in child) clean(child);

      return [child];
    });
    // An unwrapped label joins the text around it.
    parent.children = parent.children.reduce<Parent['children']>(
      (children, child) => {
        const previous = children.at(-1);

        if (previous?.type === 'text' && child.type === 'text') {
          children[children.length - 1] = {
            ...previous,
            value: previous.value + child.value,
          };
        } else {
          children.push(child);
        }

        return children;
      },
      []
    );
  };

  clean(tree);
};
