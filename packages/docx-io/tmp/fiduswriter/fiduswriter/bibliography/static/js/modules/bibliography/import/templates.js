/** a template for the BibTeX file import dialog */
export const importBibFileTemplate = () =>
    `<form id="import-bib-form" method="post" enctype="multipart/form-data" class="ajax-upload">
        <input type="file" id="bib-uploader" name="bib" required />
        <span id="import-bib-btn" class="fw-button fw-light fw-large">
            ${gettext("Select a file")}
        </span>
        <label id="import-bib-name" class="ajax-upload-label"></label>
    </form>`
