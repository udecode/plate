import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type TableElementColGroupProps = HTMLPropsAs<'colgroup'>;

export const useTableElementColGroupProps = ({
  ...props
}: TableElementColGroupProps): HTMLPropsAs<'colgroup'> => {
  return {
    contentEditable: false,
    style: { width: '100%' },
    ...props,
  };
};

export const TableElementColGroup = createComponentAs<TableElementColGroupProps>(
  (props) => {
    const htmlProps = useTableElementColGroupProps(props);

    return createElementAs('colgroup', htmlProps);
  }
);
