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

import { buttonVariants } from '@/plate/button/PlateButton';
import { floatingStyles } from '@/plate/toolbar/floatingStyles';
import { FloatingVerticalDivider } from '@/plate/toolbar/FloatingVerticalDivider';

export function PlateFloatingLink({ readOnly }: TEditableProps) {
  const isEditing = useFloatingLinkSelectors().isEditing();

  if (readOnly) return null;

  const input = (
    <div className="flex w-[330px] flex-col">
      <div className={floatingStyles.inputWrapperVariants()}>
        <div className={floatingStyles.iconWrapperVariants()}>
          <LinkIcon width={18} />
        </div>

        <FloatingLink.UrlInput
          className={floatingStyles.inputVariants()}
          placeholder="Paste link"
        />
      </div>

      <div className="h-px bg-gray-200" />

      <div className={floatingStyles.inputWrapperVariants()}>
        <div className={floatingStyles.iconWrapperVariants()}>
          <ShortTextIcon width={18} />
        </div>
        <FloatingLink.TextInput
          className={floatingStyles.inputVariants()}
          placeholder="Text to display"
        />
      </div>
    </div>
  );

  const editContent = !isEditing ? (
    <div className={floatingStyles.rowVariants()}>
      <FloatingLink.EditButton className={buttonVariants()}>
        Edit link
      </FloatingLink.EditButton>

      <FloatingVerticalDivider />

      <FloatingLink.OpenLinkButton className={floatingStyles.buttonVariants()}>
        <LaunchIcon width={18} />
      </FloatingLink.OpenLinkButton>

      <FloatingVerticalDivider />

      <FloatingLink.UnlinkButton className={floatingStyles.buttonVariants()}>
        <LinkOffIcon width={18} />
      </FloatingLink.UnlinkButton>
    </div>
  ) : (
    input
  );

  return (
    <>
      <FloatingLink.InsertRoot className={floatingStyles.rootVariants()}>
        {input}
      </FloatingLink.InsertRoot>

      <FloatingLink.EditRoot className={floatingStyles.rootVariants()}>
        {editContent}
      </FloatingLink.EditRoot>
    </>
  );
}
