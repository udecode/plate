/**
 * Custom error class which allows to pass additional details
 * @param {string} name - Error name
 * @param {string} message - Error message
 * @param {object} details - additional details from the calling context
 */

function ErrorWithDetails(name, message, details) {
  this.name = name;
  this.message = message || '';
  this.details = details;

  const error = new Error(this.message);
  this.stack = error.stack;
  error.name = this.name;
}
ErrorWithDetails.prototype = Object.create(Error.prototype);

export { ErrorWithDetails };
