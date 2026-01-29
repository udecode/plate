/** A template for the bibliography item edit dialog. */
export const bibDialog = ({bib_type, BibTypes, BibTypeTitles}) =>
    `<div id="bib-dialog-tabs">
        <div class="bib-dialog-header">
            <div class="fw-select-container">
                <select id="select-bibtype" class="fw-button fw-light fw-large" required>
                    ${
                        bib_type === false
                            ? `<option class="placeholder" selected disabled value="">${gettext("Select source type")}</option>`
                            : ""
                    }
                    ${Object.keys(BibTypes)
                        .map(
                            key =>
                                `<option value="${key}"
                                    ${key === bib_type ? "selected" : ""}>
                                ${BibTypeTitles[key]}
                            </option>`
                        )
                        .join("")}
                </select>
                <div class="fw-select-arrow fa fa-caret-down"></div>
            </div>
            <ul class="ui-tabs-nav">
                <li class="tab-link"><a href="#req-fields-tab" class="tab-link-inner">
                    ${gettext("Required Fields")}
                </a></li>
                <li class="tab-link"><a href="#opt-fields-tab" class="tab-link-inner">
                    ${gettext("Optional Fields")}
                </a></li>
                <li class="tab-link" id="categories-link"><a href="#categories-tab" class="tab-link-inner">
                    ${gettext("Categories")}
                </a></li>
            </ul>
        </div>
        <div class="tab-content ui-tabs-panel" id="req-fields-tab">
            <table class="fw-dialog-table"><tbody id="eo-fields"></tbody></table>
            <table class="fw-dialog-table"><tbody id="req-fields"></tbody></table>
        </div>
        <div class="tab-content ui-tabs-panel" id="opt-fields-tab">
            <table class="fw-dialog-table"><tbody id="opt-fields"></tbody></table>
        </div>
        <div class="tab-content ui-tabs-panel" id="categories-tab">
            <table class="fw-dialog-table">
                <tbody>
                    <tr>
                        <th><h4 class="fw-tablerow-title">${gettext("Categories")}</h4></th>
                        <td id="categories-field"></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>`
