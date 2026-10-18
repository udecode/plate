import React, { type ComponentType } from 'react';

import type {
  Descendant,
  Path,
  Point,
  Element as ElementNode,
  Text as TextNode,
} from '../..';
import type { DOMCoverageSession } from '../../dom/internal';
import { hasProbeDOM } from '../editable/render-contract-monitor';
import {
  useClaimEditableDOMInsertionCommit,
  useEditableDOMRuntime,
} from '../hooks/use-claim-editable-dom-commit';
import { useEditorContext } from '../hooks/use-editor-context';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type {
  RenderElementProps,
  RenderElementRenderer,
} from './editable-text-blocks';

const isText = (value: Descendant): value is TextNode =>
  typeof (value as TextNode).text === 'string';

type ProcessLike = {
  env?: {
    NODE_ENV?: string;
  };
};

export const isPliteReactDevelopmentEnvironment = (
  processLike: ProcessLike | undefined = (
    globalThis as { process?: ProcessLike }
  ).process
) =>
  processLike?.env?.NODE_ENV != null &&
  processLike.env.NODE_ENV !== 'production';

const isDevelopment = isPliteReactDevelopmentEnvironment();

type RendererBoundaryProps = {
  path: Path;
  props: RenderElementProps;
};
const RENDERER_BOUNDARIES = new WeakMap<
  object,
  ComponentType<RendererBoundaryProps>
>();

export const getEditableElementRenderer = <TElement extends ElementNode>(
  renderer: RenderElementRenderer<TElement>
) => {
  let Boundary = RENDERER_BOUNDARIES.get(renderer);
  if (!Boundary) {
    // React copies top-level props eagerly. Nest them to preserve the lazy children getter.
    Boundary = ({ path, props }) => {
      useClaimEditableDOMInsertionCommit();
      const rendered = (renderer as RenderElementRenderer)(props);
      return isDevelopment ? (
        <RenderedChildrenGuard element={props.element} path={path}>
          {rendered}
        </RenderedChildrenGuard>
      ) : (
        rendered
      );
    };
    RENDERER_BOUNDARIES.set(renderer, Boundary);
  }
  return Boundary as ComponentType<
    Omit<RendererBoundaryProps, 'props'> & {
      props: RenderElementProps<TElement>;
    }
  >;
};

const RenderedChildrenGuard = ({
  children,
  element,
  path,
}: {
  children: React.ReactNode;
  element: ElementNode;
  path: Path;
}) => {
  const editor = useEditorContext();
  const runtime = useEditableDOMRuntime();

  useIsomorphicLayoutEffect(() => {
    if (!runtime) return;

    const elementPath = editor.read.nodes.path(element) ?? path;

    element.children.forEach((child, index) => {
      const probe = findUncoveredFirstText(runtime.domCoverage, child, [
        ...elementPath,
        index,
      ]);

      if (probe && !hasProbeDOM(runtime.editor, probe, runtime.rootElement)) {
        runtime.renderContract.nominate(probe, 'commit');
      }
    });
  }, [editor, element, path, runtime]);

  return children;
};

const findUncoveredFirstText = (
  coverage: DOMCoverageSession,
  node: Descendant,
  path: Path
): Point | null => {
  if (isText(node)) {
    const point = { path, offset: 0 };

    return coverage.getBoundaryForPoint(point) ? null : point;
  }

  for (let index = 0; index < node.children.length; index++) {
    const point = findUncoveredFirstText(coverage, node.children[index], [
      ...path,
      index,
    ]);

    if (point) return point;
  }

  return null;
};
