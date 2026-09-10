import React, { type ComponentType } from 'react';

import type {
  Descendant,
  Path,
  Element as PliteElementNode,
  Text as PliteTextNode,
} from '../..';
import type { DOMCoverageSession } from '../../dom/internal';
import {
  useClaimEditableDOMInsertionCommit,
  useEditableDOMRuntime,
} from '../hooks/use-claim-editable-dom-commit';
import { useEditorContext } from '../hooks/use-editor-context';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import type {
  RenderElementProps,
  RenderElementRenderer,
} from './editable-text-blocks';

const isText = (value: Descendant): value is PliteTextNode =>
  typeof (value as PliteTextNode).text === 'string';

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

export const getEditableElementRenderer = <TElement extends PliteElementNode>(
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
  element: PliteElementNode;
  path: Path;
}) => {
  const editor = useEditorContext();
  const coverage = useEditableDOMRuntime()?.domCoverage;

  useIsomorphicLayoutEffect(() => {
    let cancelled = false;
    const timeout = globalThis.setTimeout(() => {
      if (cancelled) {
        return;
      }

      assertRenderedElementChildrenHaveDOMOrCoverage(editor, {
        coverage,
        element,
        path: editor.read.nodes.path(element) ?? path,
      });
    }, 0);

    return () => {
      cancelled = true;
      globalThis.clearTimeout(timeout);
    };
  }, [coverage, editor, element, path]);

  return children;
};

const getFirstTextPath = (node: Descendant, path: Path): Path | null => {
  if (isText(node)) {
    return path;
  }

  for (let index = 0; index < node.children.length; index++) {
    const textPath = getFirstTextPath(node.children[index], [...path, index]);

    if (textPath) {
      return textPath;
    }
  }

  return null;
};

const assertRenderedElementChildrenHaveDOMOrCoverage = (
  editor: ReactRuntimeEditor,
  {
    coverage,
    element,
    path,
  }: {
    coverage: DOMCoverageSession | undefined;
    element: PliteElementNode;
    path: Path;
  }
) => {
  element.children.forEach((child, index) => {
    const childPath = [...path, index];
    const textPath = getFirstTextPath(child, childPath);

    if (!textPath) {
      return;
    }

    const point = { path: textPath, offset: 0 };

    if (coverage?.getBoundaryForPoint(point)) {
      return;
    }

    if (!editor.api.dom.resolveDOMPoint(point)) {
      console.error(
        `Plite renderElement for "${String(
          element.type
        )}" at ${path.join('.')} omitted editable child ${childPath.join(
          '.'
        )} without a DOM coverage boundary. Render children or register a DOMCoverage boundary.`
      );
    }
  });
};
