/* eslint-disable tailwindcss/no-custom-classname */
'use client';

import React, { memo, useMemo } from 'react';

import { cn } from '@udecode/cn';
import { useAI } from '@udecode/plate-ai/react';

import { Icons } from '@/components/icons';

import { useActionHandler } from './action-handler';
import { aiActions, defaultValues } from './ai-actions';
import { aiCommands } from './ai-menu-items';
import { AIPreviewEditor } from './ai-previdew-editor';
import { Button } from './button';
import { Menu, comboboxVariants, renderSearchMenuItems } from './menu';

// eslint-disable-next-line react/display-name
export const AIMenu = memo(({ children }: React.PropsWithChildren) => {
  const {
    CurrentItems,
    action,
    aiEditor,
    aiState,
    comboboxProps,
    menuProps,
    menuType,
    searchItems,
    submitButtonProps,
    onCloseMenu,
  } = useAI({
    aiActions: aiActions,
    aiCommands: aiCommands,
    defaultValues,
  });

  useActionHandler(action, aiEditor!);

  return (
    <>
      <Menu
        variant="ai"
        {...menuProps}
        combobox={
          <input
            className="flex-1 px-1"
            {...comboboxProps}
            placeholder={
              aiState === 'done'
                ? 'Tell AI what todo next'
                : 'Ask AI to write something'
            }
          />
        }
        comboboxClassName={cn(
          menuType === 'selection' &&
            aiState !== 'idle' &&
            'rounded-t-none border-t-0 '
        )}
        comboboxListClassName={cn(
          searchItems && searchItems.length === 0 && 'border-0'
        )}
        comboboxSubmitButton={
          <Button
            size="icon"
            variant="ghost"
            className="ml-2"
            {...submitButtonProps}
          >
            <Icons.submit></Icons.submit>
          </Button>
        }
        flip={false}
        injectAboveMenu={useMemo(() => {
          if (menuType === 'selection' && aiState !== 'idle')
            return <AIPreviewEditor />;
        }, [aiState, menuType])}
        loadingPlaceholder={
          <div
            className={cn(
              'flex justify-between',
              comboboxVariants({ variant: 'ai' }),
              menuType === 'selection' &&
                aiState !== 'idle' &&
                'rounded-t-none border-t-0'
            )}
          >
            <div>
              <span>AI is Writing</span>
              <div className="loader ml-1 mt-px inline-block" />
            </div>

            <Icons.stop
              className="size-5 cursor-pointer"
              onClick={() => onCloseMenu()}
            ></Icons.stop>
          </div>
        }
      >
        {renderSearchMenuItems(searchItems, { hiddenOnEmpty: true }) ?? (
          <CurrentItems />
        )}
      </Menu>
      {children}
    </>
  );
});
