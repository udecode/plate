const sanitizeNumber = (value, defaultNumber) => {
  // remove non-numeric characters
  let sanitized = value.replace(/[^0-9.]/g, '');
  // convert to number
  sanitized = parseFloat(sanitized);
  if (isNaN(sanitized)) sanitized = defaultNumber;

  sanitized = parseFloat(sanitized);
  return sanitized;
};

const throttle = (func, wait, options) => {
  let timeout, context, args, result;
  let previous = 0;
  if (!options) options = {};

  const later = function () {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  const throttled = function () {
    const _now = Date.now();
    if (!previous && options.leading === false) previous = _now;
    const remaining = wait - (_now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = _now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };

  throttled.cancel = function () {
    clearTimeout(timeout);
    previous = 0;
    timeout = context = args = null;
  };
  return throttled;
};

export { sanitizeNumber, throttle };
