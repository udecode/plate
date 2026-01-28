import {escapeText, localizeDate} from "../../common"

/** A template for the Fidus Writer document import dialog */
export const importFidusTemplate = () =>
    `<form id="import-fidus-form" method="post" enctype="multipart/form-data" class="ajax-upload">
            <input type="file" id="fidus-uploader" name="fidus" accept=".fidus" required />
            <button id="import-fidus-btn" class="fw-button fw-light fw-large">
                ${gettext("Select a file")}
            </button>
            <label id="import-fidus-name" class="ajax-upload-label"></label>
        </form>`

export const deleteFolderCell = ({subdir, ids}) =>
    `<span class="delete-folder fw-link-text" data-ids="${ids.join(",")}"
        data-title="${escapeText(subdir)}">
        '<i class="fa fa-trash-alt"></i>
</span>`

export const dateCell = ({date}) => localizeDate(date * 1000, "sortable-date")
