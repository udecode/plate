export const handleImageUpload = (file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = reject;
    setTimeout(() => reader.readAsDataURL(file), 250);
  });
};
