import React from 'react';
import { PlatePluginComponent } from '@udecode/plate-common';
import { CodeSyntaxLeaf } from './CodeSyntaxLeaf';

export const PlateCodeSyntaxLeaf: PlatePluginComponent = ({
  children,
  leaf,
}) => {
  return (
    <CodeSyntaxLeaf.Root>
      <CodeSyntaxLeaf.Token leaf={leaf}>{children}</CodeSyntaxLeaf.Token>
    </CodeSyntaxLeaf.Root>
  );
};
