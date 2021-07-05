import { createStyles } from '@udecode/slate-plugins-ui';
import { MediaEmbedElementProps } from './MediaEmbedElement.types';

export const getMediaEmbedElementStyles = (props: MediaEmbedElementProps) =>
  createStyles(
    { prefixClassNames: 'MediaEmbedElement', ...props },
    {
      root: {
        position: 'relative',
      },
      iframeWrapper: {
        padding: '75% 0 0 0',
        position: 'relative',
      },
      iframe: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
      },
      input: {
        fontSize: '0.85em',
        width: '100%',
        padding: '0.5em',
        border: '2px solid #ddd',
        background: '#fafafa',
        marginTop: '5px',
      },
    }
  );
