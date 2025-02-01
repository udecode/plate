export const formatJson = (code: string): string => {
  try {
    return JSON.stringify(JSON.parse(code), null, 2);
  } catch (error) {
    return code;
  }
};

export const isValidJson = (code: string): boolean => {
  try {
    JSON.parse(code);

    return true;
  } catch (error) {
    return false;
  }
};
