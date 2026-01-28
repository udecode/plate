import {escapeText} from "../../common"

/* A template for the image category selection of the image selection dialog. */
const imageEditCategoryTemplate = ({image, cats}) => {
    if (!cats.length) {
        return ""
    }
    return `<div class="fw-media-category">
            <div>${gettext("Select categories")}</div>
            ${cats
                .map(
                    cat =>
                        `<label class="fw-checkable fw-checkable-label${
                            image && image.cats.includes(cat.id)
                                ? " checked"
                                : ""
                        }"
                        for="imageCat${cat.id}">
                    ${escapeText(cat.category_title)}
                </label>
                <input class="fw-checkable-input fw-media-form entry-cat" type="checkbox"
                        id="imageCat${cat.id}" name="imageCat" value="${cat.id}" ${
                            image && image.cats.includes(cat.id)
                                ? " checked"
                                : ""
                        }>`
                )
                .join("")}
        </div>`
}

/* A template for the form for the image upload dialog. */
export const imageEditTemplate = ({image, cats}) =>
    `<div>
        <input name="title" class="fw-media-title" type="text"
                placeholder="${gettext("Insert a title")}" value="${
                    image ? escapeText(image.title) : ""
                }" />
        ${
            image
                ? ""
                : `<button type="button" class="fw-media-select-button fw-button fw-light">
                ${gettext("Select a file")}
            </button>
            <input name="image" type="file" class="fw-media-file-input">`
        }
    </div>
    <div class="figure-preview">
        <button class="figure-edit-menu" title="${gettext("Edit Image")}">
            <span class="dot-menu-icon"><i class="fa fa-ellipsis-v"></i></span>
        </button>
    <div>
        ${
            image && image.image
                ? `<div class="img" style="background-image: url(${image.image});"></div>`
                : ""
        }
    </div></div>
    ${imageEditCategoryTemplate({image, cats})}`
