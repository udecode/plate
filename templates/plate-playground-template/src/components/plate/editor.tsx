'use client';

import React, { useRef } from 'react';
import { CommentsProvider } from '@udecode/plate-comments';
import { Plate, PlateProvider } from '@udecode/plate-common';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { MENTIONABLES } from '@/lib/plate/mentionables';
import { plugins } from '@/lib/plate/plate-plugins';
import { cn } from '@/lib/utils';
import { CommentsPopover } from '@/components/plate-ui/comments-popover';
import { CursorOverlay } from '@/components/plate-ui/cursor-overlay';
import { FixedToolbar } from '@/components/plate-ui/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/plate-ui/fixed-toolbar-buttons';
import { FloatingToolbar } from '@/components/plate-ui/floating-toolbar';
import { FloatingToolbarButtons } from '@/components/plate-ui/floating-toolbar-buttons';
import { MentionCombobox } from '@/components/plate-ui/mention-combobox';

const commentsUsers = {
  1: {
    id: '1',
    name: 'zbeyens',
    avatarUrl: 'https://avatars.githubusercontent.com/u/19695832?s=96&v=4',
  },
};

const myUserId = '1';

export default function Editor() {
  const containerRef = useRef(null);

  const initialValue = [
    {
      type: ELEMENT_PARAGRAPH,
      children: [{ text: 'Hello, World!' }],
    },
  ];

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="relative">
        <PlateProvider plugins={plugins} initialValue={initialValue}>
          <FixedToolbar>
            <FixedToolbarButtons />
          </FixedToolbar>

          <div className="flex">
            <CommentsProvider users={commentsUsers} myUserId={myUserId}>
              <div
                ref={containerRef}
                className={cn(
                  'relative flex max-w-[900px] overflow-x-auto',
                  '[&_.slate-start-area-top]:!h-4',
                  '[&_.slate-start-area-left]:!w-[64px] [&_.slate-start-area-right]:!w-[64px]'
                )}
              >
                <Plate
                  editableProps={{
                    autoFocus: true,
                    className: cn(
                      'relative max-w-full leading-[1.4] outline-none [&_strong]:font-bold',
                      '!min-h-[600px] w-[900px] px-[96px] py-16'
                    ),
                  }}
                >
                  <FloatingToolbar>
                    <FloatingToolbarButtons />
                  </FloatingToolbar>

                  <MentionCombobox items={MENTIONABLES} />

                  <CursorOverlay containerRef={containerRef} />
                </Plate>
              </div>

              <CommentsPopover />
            </CommentsProvider>
          </div>
        </PlateProvider>
      </div>
    </DndProvider>
  );
}
