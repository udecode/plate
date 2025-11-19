export const formatJson = (code: string): string => {
  try {
    return JSON.stringify(JSON.parse(code), null, 2);
  } catch (_error) {
    return code;
  }
};

export const isValidJson = (code: string): boolean => {
  try {
    JSON.parse(code);

    return true;
  } catch (_error) {
    return false;
  }
};
