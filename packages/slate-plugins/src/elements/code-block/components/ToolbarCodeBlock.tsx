import * as React from 'react';
import { useSlate } from 'slate-react';
import { getPreventDefaultHandler } from '../../../common/utils/getPreventDefaultHandler';
import { setDefaults } from '../../../common/utils/setDefaults';
import { ToolbarButtonProps } from '../../../components/ToolbarButton/ToolbarButton.types';
import { ToolbarElement } from '../../../components/ToolbarElement/ToolbarElement';
import { DEFAULTS_CODE_BLOCK } from '../defaults';
import { insertEmptyCodeBlock } from '../transforms/insertEmptyCodeBlock';
import {
  CodeBlockContainerInsertOptions,
  CodeBlockContainerOptions,
  CodeBlockOptions,
  CodeLineOptions,
} from '../types';

export const ToolbarCodeBlock = ({
  options = {},
  ...props
}: ToolbarButtonProps & {
  options?: CodeBlockOptions &
    CodeLineOptions &
    CodeBlockContainerOptions &
    CodeBlockContainerInsertOptions;
}) => {
  const { code_block_container } = setDefaults(options, DEFAULTS_CODE_BLOCK);
  const editor = useSlate();

  return (
    <ToolbarElement
      type={code_block_container.type}
      onMouseDown={getPreventDefaultHandler(
        insertEmptyCodeBlock,
        editor,
        { select: true },
        options
      )}
      {...props}
    />
  );
};
