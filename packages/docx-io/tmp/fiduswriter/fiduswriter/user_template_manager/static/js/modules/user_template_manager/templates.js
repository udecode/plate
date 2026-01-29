/** A template for the Fidus Writer document import dialog */
export const importFidusTemplateTemplate = () =>
    `<form id="import-fidus-form" method="post" enctype="multipart/form-data" class="ajax-upload">
            <input type="file" id="fidus-template-uploader" name="fidustemplate" accept=".fidustemplate" required />
            <button id="import-fidus-template-btn" class="fw-button fw-light fw-large">
                ${gettext("Select a file")}
            </button>
            <label id="import-fidus-template-name" class="ajax-upload-label"></label>
        </form>`
