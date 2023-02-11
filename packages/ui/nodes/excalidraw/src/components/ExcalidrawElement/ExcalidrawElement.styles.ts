import { Value } from '@udecode/plate-core';
import { createStyles } from '@udecode/plate-styled-components';
import tw from 'twin.macro';
import { ExcalidrawElementProps } from './ExcalidrawElement.types';

export const getExcalidrawElementStyles = <V extends Value>(
  props: ExcalidrawElementProps<V>
) =>
  createStyles(
    { prefixClassNames: 'ExcalidrawElement', ...props },
    {
      excalidrawWrapper: tw`h-[600px]`,
    }
  );
