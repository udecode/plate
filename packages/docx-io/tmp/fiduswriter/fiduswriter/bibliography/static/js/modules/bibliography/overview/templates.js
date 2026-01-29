import {escapeText} from "../../common"

/** A template for each category in the category list edit of the bibliography categories list. */
const categoryFormsTemplate = ({categories}) =>
    `${categories
        .map(
            cat =>
                `<tr id="categoryTr_${cat.id}" class="fw-list-input">
                <td>
                    <input type="text" class="category-form" id="categoryTitle_${cat.id}"
                            value="${escapeText(cat.category_title)}" data-id="${cat.id}" />
                    <span class="fw-add-input icon-addremove" tabindex="0"></span>
                </td>
            </tr>`
        )
        .join("")}
    <tr class="fw-list-input">
        <td>
            <input type="text" class="category-form" />
            <span class="fw-add-input icon-addremove" tabindex="0"></span>
        </td>
    </tr>`

/** A template for the editing of bibliography categories list. */
export const editCategoriesTemplate = ({categories}) =>
    `<table id="editCategoryList" class="fw-dialog-table">
        <tbody>
            ${categoryFormsTemplate({categories})}
        </tbody>
    </table>`
