import {
  TableElementStyleProps,
  TableElementStyles,
} from './TableElement.types';

export const getTableElementStyles = ({
  className,
}: TableElementStyleProps): TableElementStyles => {
  return {
    root: [
      {
        // Insert css properties
        margin: '10px 0',
        borderCollapse: 'collapse',
        width: '100%',
      },
      className,
    ],
  };
};
