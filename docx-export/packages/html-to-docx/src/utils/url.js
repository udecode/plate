const isValidUrl = (urlString) => {
  const urlRegex =
    /http(s)?:\/\/(\w+:?\w*@)?(\S+)(:\d+)?((?<=\.)\w+)+(\/([\w#!:.?+=&%@!\-/])*)?/gi;

  return Boolean(urlRegex.test(urlString));
};

// eslint-disable-next-line import/prefer-default-export
export { isValidUrl };
