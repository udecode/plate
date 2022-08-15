import {
  PlateRenderElementProps,
  useEditorRef,
  Value,
} from '@udecode/plate-core';
import { useOrigin } from 'slate-portive';
import { TPortiveImageElement } from './createPortivePlugin';

export const PortiveImage = ({
  element,
  className,
  children,
  ...imageProps
}: PlateRenderElementProps<Value, TPortiveImageElement>) => {
  const editor = useEditorRef();

  const origin = useOrigin(element.originKey ?? '');
  console.log(origin);

  return children;
};
