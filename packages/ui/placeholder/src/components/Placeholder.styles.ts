import { Value } from '@udecode/plate-common';
import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { PlaceholderProps } from './Placeholder.types';

export const getPlaceholderStyles = <V extends Value>(
  props: PlaceholderProps<V> & { enabled?: boolean }
) =>
  createStyles(
    { prefixClassNames: 'Placeholder', ...props },
    {
      root: props.enabled
        ? css`
            ::before {
              content: attr(placeholder);
              opacity: 0.3;
              ${tw`block absolute cursor-text`}
            }
          `
        : undefined,
    }
  );
