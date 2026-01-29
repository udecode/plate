const ACCEPT_IMAGE_TYPES = ['.jpg', '.jpeg', '.png', 'image/jpeg', 'image/png'];

export const getFileOpener = () => {
  let fileInput = document.createElement('input');
  fileInput.type = 'file';

  let acceptTypes = ACCEPT_IMAGE_TYPES;
  fileInput.accept = acceptTypes.join(',');

  const openFile = () => {
    return new Promise((resolve, reject) => {
      fileInput.onchange = async () => {
        const files = fileInput.files;
        if (!files) return resolve(null);
        const file = files.item(0);
        if (!file) return resolve(null);
        return resolve({ file });
      };
      fileInput.oncancel = () => resolve(null);
      fileInput.onerror = reject;
      fileInput.click();
    });
  };

  return openFile;
};
