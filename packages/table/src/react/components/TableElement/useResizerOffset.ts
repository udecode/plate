import React from 'react';

export const useReSizerOffset = ({
  containerRef,
  currentColIndex,
  currentRowIndex,
  marginLeft,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
  currentColIndex: number | null;
  currentRowIndex: number | null;
  marginLeft: number;
}) => {
  const lastValidOffsets = React.useRef({
    col: 0,
    colLeft: 0,
    row: 0,
  });

  const { colElements, initialColSize, nextInitialColSize } =
    React.useMemo(() => {
      if (!containerRef.current || currentColIndex === null) {
        return {
          colElements: [] as HTMLTableColElement[],
          initialColSize: 0,
          nextInitialColSize: 0,
        };
      }

      const cols = Array.from(containerRef.current.querySelectorAll('col'));

      return {
        colElements: cols,
        initialColSize:
          currentColIndex === -1
            ? cols[0]?.getBoundingClientRect().width
            : cols[currentColIndex]?.getBoundingClientRect().width,
        nextInitialColSize:
          cols[currentColIndex + 1]?.getBoundingClientRect().width,
      };
    }, [containerRef, currentColIndex]);

  const { initialRowSize, rowElements } = React.useMemo(() => {
    if (!containerRef.current || currentRowIndex === null) {
      return { initialRowSize: 0, rowElements: [] as HTMLTableRowElement[] };
    }

    const rows = Array.from(containerRef.current.querySelectorAll('tr'));

    return {
      initialRowSize: rows[currentRowIndex]?.getBoundingClientRect().height,
      rowElements: rows,
    };
  }, [currentRowIndex, containerRef]);

  if (currentColIndex !== null) {
    if (currentColIndex === -1) {
      const paddingLeft =
        Number.parseInt(
          window.getComputedStyle(containerRef.current!).paddingLeft
        ) || 0;
      const scrollLeft = containerRef.current?.scrollLeft ?? 0;

      lastValidOffsets.current.colLeft = paddingLeft - scrollLeft;
    } else {
      const totalWidth = colElements
        .slice(0, currentColIndex + 1)
        .reduce((sum, col) => sum + col.getBoundingClientRect().width, 0);
      const scrollLeft = containerRef.current?.scrollLeft ?? 0;

      lastValidOffsets.current.col = totalWidth - scrollLeft + marginLeft;
    }
  }
  if (currentRowIndex !== null) {
    const totalHeight = rowElements
      .slice(0, currentRowIndex + 1)
      .reduce((sum, row) => sum + row.getBoundingClientRect().height, 0);

    lastValidOffsets.current.row = totalHeight;
  }

  return {
    initialColSize,
    initialRowSize,
    lastValidOffsets,
    nextInitialColSize,
  };
};
