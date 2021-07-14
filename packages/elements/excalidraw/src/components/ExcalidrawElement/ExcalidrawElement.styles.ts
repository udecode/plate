import { createStyles } from '@udecode/slate-plugins-ui';
import tw from 'twin.macro';
import { ExcalidrawElementProps } from './ExcalidrawElement.types';

export const getExcalidrawElementStyles = (props: ExcalidrawElementProps) =>
  createStyles(
    { prefixClassNames: 'ExcalidrawElement', ...props },
    {
      excalidrawWrapper: tw`height[600px]`,
    }
  );
