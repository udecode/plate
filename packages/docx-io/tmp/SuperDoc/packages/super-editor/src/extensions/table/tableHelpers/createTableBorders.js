export const createTableBorders = ({ size = 0.66665, color = '#000000' } = {}) => {
  return {
    top: { size, color },
    left: { size, color },
    bottom: { size, color },
    right: { size, color },
    insideH: { size, color },
    insideV: { size, color },
  };
};
