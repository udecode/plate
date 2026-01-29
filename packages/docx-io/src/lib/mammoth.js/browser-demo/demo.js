(() => {
  document
    .getElementById('document')
    .addEventListener('change', handleFileSelect, false);

  function handleFileSelect(event) {
    if (!event.target.files || !event.target.files[0]) {
      return;
    }
    readFileInputEventAsArrayBuffer(event, (arrayBuffer) => {
      mammoth.convertToHtml({ arrayBuffer }).then(displayResult, (error) => {
        console.error(error);
      });
    });
  }

  function displayResult(result) {
    // WARNING: result.value contains unsanitized HTML from the source document.
    // In production, sanitize with DOMPurify or similar before innerHTML assignment
    // to prevent XSS attacks from malicious documents.
    document.getElementById('output').innerHTML = result.value;

    var messageHtml = result.messages
      .map(
        (message) =>
          '<li class="' +
          message.type +
          '">' +
          escapeHtml(message.message) +
          '</li>'
      )
      .join('');

    document.getElementById('messages').innerHTML =
      '<ul>' + messageHtml + '</ul>';
  }

  function readFileInputEventAsArrayBuffer(event, callback) {
    var file = event.target.files[0];

    var reader = new FileReader();

    reader.onload = (loadEvent) => {
      var arrayBuffer = loadEvent.target.result;
      callback(arrayBuffer);
    };

    reader.readAsArrayBuffer(file);
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
})();
