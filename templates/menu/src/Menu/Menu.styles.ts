import { createStyles } from '@udecode/plate-styled-components';
import { css } from 'styled-components';
import tw from 'twin.macro';
import { MenuStyleProps } from './Menu.types';

export const getMenuStyles = (props: MenuStyleProps) =>
  createStyles(
    { prefixClassNames: 'Menu', ...props },
    {
      root: css`
        .szh-menu-container {
          ${tw`relative w-0 h-0`};
        }

        .szh-menu {
          ${tw`absolute bg-white`}
          list-style: none;
          width: max-content;
          z-index: 100;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }
        .szh-menu:focus {
          ${tw`outline-none`};
        }
        .szh-menu--state-closed {
          ${tw`hidden`};
        }
        .szh-menu__arrow {
          ${tw`absolute bg-white`};
          width: 0.75rem;
          height: 0.75rem;
          border: 1px solid transparent;
          border-left-color: rgba(0, 0, 0, 0.1);
          border-top-color: rgba(0, 0, 0, 0.1);
          z-index: -1;
        }
        .szh-menu__arrow--dir-left {
          right: -0.375rem;
          transform: translateY(-50%) rotate(135deg);
        }
        .szh-menu__arrow--dir-right {
          left: -0.375rem;
          transform: translateY(-50%) rotate(-45deg);
        }
        .szh-menu__arrow--dir-top {
          bottom: -0.375rem;
          transform: translateX(-50%) rotate(-135deg);
        }
        .szh-menu__arrow--dir-bottom {
          top: -0.375rem;
          transform: translateX(-50%) rotate(45deg);
        }
        .szh-menu__item {
          ${tw`cursor-pointer`};
        }
        .szh-menu__item:focus {
          ${tw`outline-none`};
        }
        .szh-menu__item--hover {
          ${tw`bg-gray-100`};
        }
        .szh-menu__item--focusable {
          ${tw`cursor-default`};
          background-color: inherit;
        }
        .szh-menu__item--disabled {
          ${tw`cursor-default`};
          //color: #aaa;
        }
        .szh-menu__submenu {
          ${tw`relative m-0`};
        }
        .szh-menu__group {
        }
        .szh-menu__radio-group {
          ${tw`m-0 p-0`};
          list-style: none;
        }
        .szh-menu__divider {
          ${tw`bg-gray-200 h-px`};
          margin: 0.5rem 0;
        }

        .szh-menu {
          ${tw`select-none border-none`};
          border-radius: 0.25rem;
          min-width: 10rem;
          padding: 0.5rem 0;
          box-shadow: rgba(9, 30, 66, 0.31) 0 0 1px,
            rgba(9, 30, 66, 0.25) 0 4px 8px -2px;
        }
        .szh-menu__item {
          ${tw`relative flex items-center m-0`};
          padding: 0.375rem 1.5rem;
        }
        .szh-menu-container--itemTransition .szh-menu__item {
        }
        .szh-menu__item--active {
          ${tw`bg-gray-200`};
        }
        .szh-menu__item--type-radio {
          padding-left: 2.2rem;
        }
        .szh-menu__item--type-radio::before {
          ${tw`absolute`};
          content: '○';
          left: 0.8rem;
          top: 0.55rem;
          font-size: 0.8rem;
        }
        .szh-menu__item--type-radio.szh-menu__item--checked::before {
          content: '●';
        }
        .szh-menu__item--type-checkbox {
          padding-left: 2.2rem;
        }
        .szh-menu__item--type-checkbox::before {
          ${tw`absolute`};
          left: 0.8rem;
        }
        .szh-menu__item--type-checkbox.szh-menu__item--checked::before {
          content: '✔';
        }
        .szh-menu__submenu > .szh-menu__item {
          padding-right: 2.5rem;
        }
        .szh-menu__submenu > .szh-menu__item::after {
          ${tw`absolute`};
          content: '❯';
          right: 1rem;
        }
        .szh-menu__header {
          font-size: 0.8em;
          padding: 0.2rem 1.5rem;
          text-transform: uppercase;
        }
      `,
    }
  );
