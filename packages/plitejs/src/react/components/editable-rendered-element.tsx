import React, { createElement, type ComponentType } from 'react';

import type {
  Descendant,
  Path,
  Element as PliteElementNode,
  Text as PliteTextNode,
} from '../..';
import { DOMCoverage } from '../../dom/internal';
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

const EditableRenderedElementBoundary = <
  TElement extends PliteElementNode = PliteElementNode,
>({
  props,
  renderElement,
}: {
  props: RenderElementProps<TElement>;
  renderElement: RenderElementRenderer<TElement>;
}) =>
  createElement(
    renderElement as ComponentType<RenderElementProps<any>>,
    props as RenderElementProps<any>
  );

export const EditableRenderedElement = <
  TElement extends PliteElementNode = PliteElementNode,
>({
  path,
  props,
  renderElement,
}: {
  path: Path;
  props: RenderElementProps<TElement>;
  renderElement: RenderElementRenderer<TElement>;
}) => {
  const editor = useEditorContext();

  useIsomorphicLayoutEffect(() => {
    if (!isDevelopment) {
      return undefined;
    }

    let cancelled = false;
    const timeout = globalThis.setTimeout(() => {
      if (cancelled) {
        return;
      }

      assertRenderedElementChildrenHaveDOMOrCoverage(editor, {
        element: props.element,
        path: editor.read.nodes.path(props.element) ?? path,
      });
    }, 0);

    return () => {
      cancelled = true;
      globalThis.clearTimeout(timeout);
    };
  }, [editor, path, props.element]);

  return (
    <EditableRenderedElementBoundary
      props={props}
      renderElement={renderElement}
    />
  );
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
  { element, path }: { element: PliteElementNode; path: Path }
) => {
  element.children.forEach((child, index) => {
    const childPath = [...path, index];
    const textPath = getFirstTextPath(child, childPath);

    if (!textPath) {
      return;
    }

    const point = { path: textPath, offset: 0 };

    if (DOMCoverage.getBoundaryForPoint(editor, point)) {
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
