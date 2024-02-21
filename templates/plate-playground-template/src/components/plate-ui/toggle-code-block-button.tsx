import { withRef } from '@udecode/cn';
import { useToggleCodeBlockButton } from '@udecode/plate-code-block';

import { Icons } from '../icons';
import { ToolbarButton } from './toolbar';

export const ToggleCodeBlockButton = withRef<typeof ToolbarButton>(
  (rest, ref) => {
    const { props } = useToggleCodeBlockButton();

    return (
      <ToolbarButton ref={ref} tooltip="Toggle Code Block" {...props} {...rest}>
        <Icons.codeblock />
      </ToolbarButton>
    );
  }
);
