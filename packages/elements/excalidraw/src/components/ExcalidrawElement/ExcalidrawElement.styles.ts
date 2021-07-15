import { createStyles } from '@udecode/slate-plugins-styled-components';
import tw from 'twin.macro';
import { ExcalidrawElementProps } from './ExcalidrawElement.types';

export const getExcalidrawElementStyles = (props: ExcalidrawElementProps) =>
  createStyles(
    { prefixClassNames: 'ExcalidrawElement', ...props },
    {
      excalidrawWrapper: tw`height[600px]`,
    }
  );
