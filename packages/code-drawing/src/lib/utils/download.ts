/**
 * Download image from data URL
 */
export function downloadImage(
  imageDataUrl: string,
  filename = 'code-drawing.png'
): void {
  const imageEl = new Image();
  imageEl.src = imageDataUrl;
  imageEl.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = imageEl.width;
    canvas.height = imageEl.height;
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(imageEl, 0, 0);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = filename;
      a.click();
    }
  };
}
