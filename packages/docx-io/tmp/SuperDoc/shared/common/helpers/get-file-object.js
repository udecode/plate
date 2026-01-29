/**
 * Turn a file URL into a File object
 *
 * @param {string} fileUrl The url
 * @param {string} name The name to assign the file object
 * @param {string} type The mime type
 * @returns {Promise<File>} The file object
 */
export const getFileObject = async (fileUrl, name, type) => {
  const response = await fetch(fileUrl);
  const blob = await response.blob();
  return new File([blob], name, { type });
};
