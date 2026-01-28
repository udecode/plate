const uploadBtn = document.querySelector('.file-upload-button');
const fileInput = document.querySelector('.file-upload-input');
uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    const uploadEvent = new CustomEvent("file-upload", { detail: file });
    if (file) window.dispatchEvent(uploadEvent);
});