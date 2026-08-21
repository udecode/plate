'use client';

import {
  type BaseListPlugin,
  BulletedListRules,
  OrderedListRules,
  TaskListRules,
} from '@platejs/list-classic';
import {
  BulletedListPlugin,
  ListItemContentPlugin,
  ListItemPlugin,
  ListPlugin,
  NumberedListPlugin,
  TaskListPlugin,
} from '@platejs/list-classic/react';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ElementWith } from 'platejs';
import {
  type PlateElementProps,
  PlateElement,
  useEditor,
  useEditorReadOnly,
} from 'platejs/react';
import * as React from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const listVariants = cva('m-0 py-1 ps-6', {
  variants: {
    variant: {
      ol: 'list-decimal',
      ul: 'list-disc [&_ul]:list-[circle] [&_ul_ul]:list-[square]',
    },
  },
});

type ListItemElementProps = Omit<
  PlateElementProps<typeof ListItemPlugin>,
  'element'
> & {
  element: PlateElementProps<typeof ListItemPlugin>['element'] &
    ElementWith<typeof BaseListPlugin>;
};

export function ListElement({
  variant,
  ...props
}: PlateElementProps<typeof BulletedListPlugin> &
  VariantProps<typeof listVariants>) {
  return (
    <PlateElement
      as={variant!}
      className={listVariants({ variant })}
      {...props}
    >
      {props.children}
    </PlateElement>
  );
}

export function BulletedListElement(
  props: PlateElementProps<typeof BulletedListPlugin>
) {
  return <ListElement variant="ul" {...props} />;
}

export function NumberedListElement(
  props: PlateElementProps<typeof NumberedListPlugin>
) {
  return (
    <PlateElement
      as="ol"
      className={listVariants({ variant: 'ol' })}
      {...props}
    >
      {props.children}
    </PlateElement>
  );
}

export function TaskListElement(
  props: PlateElementProps<typeof TaskListPlugin>
) {
  return (
    <PlateElement as="ul" className="m-0 list-none! py-1 ps-6" {...props}>
      {props.children}
    </PlateElement>
  );
}

export function ListItemElement(props: ListItemElementProps) {
  const isTaskList = 'checked' in props.element;

  if (isTaskList) {
    return <TaskListItemElement {...props} />;
  }

  return <BaseListItemElement {...props} />;
}

export function BaseListItemElement(props: ListItemElementProps) {
  return (
    <PlateElement as="li" {...props}>
      {props.children}
    </PlateElement>
  );
}

export function TaskListItemElement(props: ListItemElementProps) {
  const { element } = props;
  const editor = useEditor();
  const readOnly = useEditorReadOnly();
  const checked = !!element.checked;
  const [firstChild, ...otherChildren] = React.Children.toArray(props.children);

  return (
    <BaseListItemElement {...props}>
      <div
        className={cn(
          'flex items-stretch *:nth-[2]:flex-1 *:nth-[2]:focus:outline-none',
          {
            '*:nth-[2]:text-muted-foreground *:nth-[2]:line-through': checked,
          }
        )}
      >
        <div
          className="-ms-5 me-1.5 flex w-fit items-start justify-center pt-[0.275em] select-none"
          contentEditable={false}
        >
          <Checkbox
            checked={checked}
            disabled={readOnly}
            onCheckedChange={(value) => {
              if (readOnly) return;

              editor.update.nodes.set({ checked: !!value }, { at: element });
            }}
          />
        </div>

        {firstChild}
      </div>

      {otherChildren}
    </BaseListItemElement>
  );
}

export const ListKit = [
  ListPlugin.configure({
    inputRules: [
      BulletedListRules.markdown({ variant: '-' }),
      BulletedListRules.markdown({ variant: '*' }),
      OrderedListRules.markdown({ variant: '.' }),
      OrderedListRules.markdown({ variant: ')' }),
      TaskListRules.markdown({ checked: false }),
      TaskListRules.markdown({ checked: true }),
    ],
    shortcuts: {
      toggleBulleted: {
        handler: ({ editor }) =>
          editor.plugin(ListPlugin).update.toggle({
            type: editor.plugin(BulletedListPlugin).schema.type,
          }),
        keys: 'mod+alt+5',
      },
      toggleNumbered: {
        handler: ({ editor }) =>
          editor.plugin(ListPlugin).update.toggle({
            type: editor.plugin(NumberedListPlugin).schema.type,
          }),
        keys: 'mod+alt+6',
      },
      toggleTask: {
        handler: ({ editor }) =>
          editor.plugin(ListPlugin).update.toggle({
            type: editor.plugin(TaskListPlugin).schema.type,
          }),
        keys: 'mod+alt+7',
      },
    },
  }),
  ListItemContentPlugin,
  BulletedListPlugin.configure({ component: BulletedListElement }),
  NumberedListPlugin.configure({ component: NumberedListElement }),
  TaskListPlugin.configure({ component: TaskListElement }),
  ListItemPlugin.configure({ component: ListItemElement }),
];
