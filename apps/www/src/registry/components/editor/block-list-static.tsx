import { cn } from 'cn';
import {
  BaseListPlugin,
  type Editor,
  type Element,
  type ListType,
} from 'platejs';
import { BaseDetailsPlugin } from 'platejs/details';
import { BaseImagePlugin } from 'platejs/media';
import type { RenderStaticNodeWrapper } from 'platejs/static';
import * as React from 'react';

type ListWrapper = RenderStaticNodeWrapper<typeof BaseListPlugin>;

// Toggles and images draw no wrapped children, so their bullets keep the
// marker on the block itself.
export const drawsBulletOnRoot = (editor: Editor, element: Element) =>
  element.listType === 'bulleted' &&
  [BaseDetailsPlugin, BaseImagePlugin].some((descriptor) => {
    const plugin = editor.plugin(descriptor);

    return plugin.installed && element.type === plugin.schema.type;
  });

export const BlockListStatic: ListWrapper = (props) => {
  const { listStyle, listType } = props.element;

  if (!listType || drawsBulletOnRoot(props.editor, props.element)) {
    return undefined;
  }

  return function BlockListStaticWrapper(innerProps) {
    return (
      <List
        {...innerProps}
        listStart={
          listType === 'numbered'
            ? innerProps.editor
                .plugin(BaseListPlugin)
                .read.ordinal(innerProps.path)
            : undefined
        }
        listStyle={listStyle}
        listType={listType}
      />
    );
  };
};

function List(
  props: Parameters<NonNullable<ReturnType<ListWrapper>>>[0] & {
    listStart?: number;
    listStyle?: string;
    listType: ListType;
  }
) {
  const { listStart, listStyle, listType } = props;
  const isTask = listType === 'task';
  const isBullet = listType === 'bulleted';
  const isNumbered = listType === 'numbered';
  const InnerList = isNumbered ? 'ol' : 'ul';
  const markerStyle =
    isNumbered && listStart === undefined
      ? 'none'
      : (listStyle ?? (isNumbered ? 'decimal' : isBullet ? 'disc' : 'none'));

  return (
    <InnerList
      className="relative m-0 p-0"
      data-list-id={props.element.listId ?? ''}
      data-list-levels={
        props.element.listLevels
          ? JSON.stringify(props.element.listLevels)
          : undefined
      }
      style={{ listStyleType: markerStyle }}
      start={isNumbered ? listStart : undefined}
    >
      <li
        data-checked={
          isTask ? String(props.element.checked === true) : undefined
        }
        data-indent={props.element.indent}
        data-list-id={props.element.listId ?? ''}
        data-list-levels={
          props.element.listLevels
            ? JSON.stringify(props.element.listLevels)
            : undefined
        }
        data-list-restart={props.element.listRestart}
        data-list-start={props.element.listStart}
        data-list-style={isBullet || isNumbered ? listStyle : undefined}
        data-list-type={listType}
        className={
          isTask
            ? cn(
                'list-none',
                props.element.checked === true &&
                  'text-muted-foreground line-through'
              )
            : undefined
        }
      >
        {isTask && <TodoMarkerStatic {...props} />}
        {props.children}
      </li>
    </InnerList>
  );
}

function TodoMarkerStatic(
  props: Parameters<NonNullable<ReturnType<ListWrapper>>>[0] & {
    listStart?: number;
    listStyle?: string;
    listType: ListType;
  }
) {
  const checked = props.element.checked === true;

  return (
    <button
      aria-checked={checked}
      aria-label={checked ? 'Completed task' : 'Incomplete task'}
      className={cn(
        'cn-checkbox peer -start-6 pointer-events-none absolute top-1 shrink-0',
        props.className
      )}
      data-checked={checked || undefined}
      data-state={checked ? 'checked' : 'unchecked'}
      role="checkbox"
      type="button"
    >
      <div className="cn-checkbox-indicator grid place-content-center text-current">
        {checked && (
          <svg
            aria-hidden="true"
            className="size-3.5"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        )}
      </div>
    </button>
  );
}
