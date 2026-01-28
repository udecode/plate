/**
 * Process an uploaded image to ensure it fits within the editor's content area.
 * @param {string | File} fileData Base 64 string or File object.
 * @returns {Promise<string | File>} Resolves with a base 64 string or File object.
 */
export const processUploadedImage = (fileData, editor) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const { width: logicalWidth, height: logicalHeight } = getAllowedImageDimensions(img.width, img.height, editor);

      // Set canvas to original image size first
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');

      // Ensure the highest quality if the browser ever needs to resample.
      // `imageSmoothingQuality` is not supported in every browser, so we wrap it in a try/catch.
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        try {
          ctx.imageSmoothingQuality = 'high';
        } catch {}
      }

      // Draw original image at full size
      ctx.drawImage(img, 0, 0, img.width, img.height);

      // We generate an image that has `devicePixelRatio` × the CSS size
      // in real pixels, but we still tell the editor to draw it at the
      // logical (CSS) width/height.  This keeps the image crisp while
      // avoiding the browser's secondary up-scaling that causes blur.
      const dpr = typeof window !== 'undefined' && window.devicePixelRatio ? window.devicePixelRatio : 1;
      const targetPixelWidth = Math.round(logicalWidth * dpr);
      const targetPixelHeight = Math.round(logicalHeight * dpr);

      const finalTargetWidth = Math.min(targetPixelWidth, img.width);
      const finalTargetHeight = Math.min(targetPixelHeight, img.height);

      // Use multi-step Hermite resize algorithm if dimensions need to be changed
      const resizeNeeded = finalTargetWidth !== img.width || finalTargetHeight !== img.height;
      if (resizeNeeded) {
        multiStepResize(canvas, finalTargetWidth, finalTargetHeight);
      }

      if (typeof fileData === 'string') {
        const resizedBase64 = canvas.toDataURL();
        resolve(resizedBase64);
      } else {
        canvas.toBlob((blob) => {
          const updatedFile = new File([blob], fileData.name, {
            type: fileData.type,
            lastModified: Date.now(),
          });
          resolve({ file: updatedFile, width: logicalWidth, height: logicalHeight });
        });
      }
    };
    img.onerror = (error) => reject(error);
    img.src = typeof fileData === 'string' ? fileData : URL.createObjectURL(fileData);
  });
};

export const getAllowedImageDimensions = (width, height, editor) => {
  const { width: maxWidth, height: maxHeight } = editor.getMaxContentSize();
  if (!maxWidth || !maxHeight) return { width, height };

  let adjustedWidth = width;
  let adjustedHeight = height;
  const aspectRatio = width / height;

  if (height > maxHeight) {
    adjustedHeight = maxHeight;
    adjustedWidth = Math.round(maxHeight * aspectRatio);
  }

  if (adjustedWidth > maxWidth) {
    adjustedWidth = maxWidth;
    adjustedHeight = Math.round(maxWidth / aspectRatio);
  }

  return { width: adjustedWidth, height: adjustedHeight };
};

/**
 * Hermite resize - fast image resize/resample using Hermite filter. 1 cpu version!
 * see: https://github.com/viliusle/Hermite-resize
 * @param {HtmlElement} canvas
 * @param {int} width
 * @param {int} height
 * @param {boolean} resize_canvas if true, canvas will be resized. Optional.
 */
function resample_high_quality(canvas, width, height, resize_canvas) {
  var width_source = canvas.width;
  var height_source = canvas.height;
  width = Math.round(width);
  height = Math.round(height);

  var ratio_w = width_source / width;
  var ratio_h = height_source / height;
  var ratio_w_half = Math.ceil(ratio_w / 2);
  var ratio_h_half = Math.ceil(ratio_h / 2);

  var ctx = canvas.getContext('2d');
  var img = ctx.getImageData(0, 0, width_source, height_source);
  var img2 = ctx.createImageData(width, height);
  var data = img.data;
  var data2 = img2.data;

  for (var j = 0; j < height; j++) {
    for (var i = 0; i < width; i++) {
      var x2 = (i + j * width) * 4;
      var weight = 0;
      var weights = 0;
      var weights_alpha = 0;
      var gx_r = 0;
      var gx_g = 0;
      var gx_b = 0;
      var gx_a = 0;
      var center_y = (j + 0.5) * ratio_h;
      var yy_start = Math.floor(j * ratio_h);
      var yy_stop = Math.ceil((j + 1) * ratio_h);
      for (var yy = yy_start; yy < yy_stop; yy++) {
        var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
        var center_x = (i + 0.5) * ratio_w;
        var w0 = dy * dy; //pre-calc part of w
        var xx_start = Math.floor(i * ratio_w);
        var xx_stop = Math.ceil((i + 1) * ratio_w);
        for (var xx = xx_start; xx < xx_stop; xx++) {
          var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
          var w = Math.sqrt(w0 + dx * dx);
          if (w >= 1) {
            //pixel too far
            continue;
          }
          //hermite filter
          weight = 2 * w * w * w - 3 * w * w + 1;
          var pos_x = 4 * (xx + yy * width_source);
          //alpha
          gx_a += weight * data[pos_x + 3];
          weights_alpha += weight;
          //colors
          if (data[pos_x + 3] < 255) weight = (weight * data[pos_x + 3]) / 250;
          gx_r += weight * data[pos_x];
          gx_g += weight * data[pos_x + 1];
          gx_b += weight * data[pos_x + 2];
          weights += weight;
        }
      }
      data2[x2] = gx_r / weights;
      data2[x2 + 1] = gx_g / weights;
      data2[x2 + 2] = gx_b / weights;
      data2[x2 + 3] = gx_a / weights_alpha;
    }
  }
  //clear and resize canvas
  if (resize_canvas === true) {
    canvas.width = width;
    canvas.height = height;
  } else {
    ctx.clearRect(0, 0, width_source, height_source);
  }

  //draw
  ctx.putImageData(img2, 0, 0);
}

/**
 * Multi-step resize function that scales images in multiple steps for better quality
 * @param {HTMLCanvasElement} canvas - The canvas to resize
 * @param {number} targetWidth - Target width
 * @param {number} targetHeight - Target height
 */
function multiStepResize(canvas, targetWidth, targetHeight) {
  const originalWidth = canvas.width;
  const originalHeight = canvas.height;

  // Calculate scale factors
  const scaleX = targetWidth / originalWidth;
  const scaleY = targetHeight / originalHeight;
  const scaleFactor = Math.min(scaleX, scaleY);

  // If scaling down to more than 50%, use multi-step approach
  // Can change this based on performance needs
  if (scaleFactor < 0.5) {
    let currentWidth = originalWidth;
    let currentHeight = originalHeight;

    // Keep halving until we're close to or smaller than target
    while (currentWidth > targetWidth * 2 || currentHeight > targetHeight * 2) {
      const nextWidth = Math.round(currentWidth / 2);
      const nextHeight = Math.round(currentHeight / 2);

      resample_high_quality(canvas, nextWidth, nextHeight, true);

      currentWidth = nextWidth;
      currentHeight = nextHeight;
    }

    // Final step to exact target size
    if (currentWidth !== targetWidth || currentHeight !== targetHeight) {
      resample_high_quality(canvas, targetWidth, targetHeight, true);
    }
  } else {
    // for smaller scale factors, use single-step resize
    resample_high_quality(canvas, targetWidth, targetHeight, true);
  }
}
