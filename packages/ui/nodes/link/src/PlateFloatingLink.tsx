import React from 'react';
import { TEditableProps } from '@udecode/plate-common';
import {
  FloatingLink,
  LaunchIcon,
  LinkIcon,
  LinkOffIcon,
  ShortTextIcon,
  useFloatingLinkSelectors,
} from '@udecode/plate-link';
import { cn } from '@udecode/plate-styled-components';
import { buttonVariants } from '@udecode/plate-ui-button';
import {
  floatingVariants,
  FloatingVerticalDivider,
} from '@udecode/plate-ui-toolbar';

export const PlateFloatingLink = ({ readOnly }: TEditableProps) => {
  const isEditing = useFloatingLinkSelectors().isEditing();

  if (readOnly) return null;

  const input = (
    <div className="flex w-[330px] flex-col">
      <div className={floatingVariants({ element: 'inputWrapper' })}>
        <div className={floatingVariants({ element: 'iconWrapper' })}>
          <LinkIcon width={18} />
        </div>

        <FloatingLink.UrlInput
          className={floatingVariants({ element: 'input' })}
          placeholder="Paste link"
        />
      </div>

      <div className="h-px bg-gray-200" />

      <div className={floatingVariants({ element: 'inputWrapper' })}>
        <div className={floatingVariants({ element: 'iconWrapper' })}>
          <ShortTextIcon width={18} />
        </div>
        <FloatingLink.TextInput
          className={floatingVariants({ element: 'input' })}
          placeholder="Text to display"
        />
      </div>
    </div>
  );

  const editContent = !isEditing ? (
    <div className={cn(floatingVariants({ element: 'row' }))}>
      <FloatingLink.EditButton className={buttonVariants()}>
        Edit link
      </FloatingLink.EditButton>

      <FloatingVerticalDivider />

      <FloatingLink.OpenLinkButton
        className={floatingVariants({ element: 'button' })}
      >
        <LaunchIcon width={18} />
      </FloatingLink.OpenLinkButton>

      <FloatingVerticalDivider />

      <FloatingLink.UnlinkButton
        className={floatingVariants({ element: 'button' })}
      >
        <LinkOffIcon width={18} />
      </FloatingLink.UnlinkButton>
    </div>
  ) : (
    input
  );

  return (
    <>
      <FloatingLink.InsertRoot
        className={cn(floatingVariants({ element: 'root' }))}
      >
        {input}
      </FloatingLink.InsertRoot>

      <FloatingLink.EditRoot
        className={cn(floatingVariants({ element: 'root' }))}
      >
        {editContent}
      </FloatingLink.EditRoot>
    </>
  );
};
