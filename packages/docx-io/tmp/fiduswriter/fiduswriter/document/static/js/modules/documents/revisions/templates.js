import {escapeText, localizeDate} from "../../common"

/** A template for listing the templates of a certain document */
export const documentrevisionsTemplate = ({doc}) =>
    `<table class="fw-data-table" style="width:342px;">
        <thead class="fw-data-table-header">
            <th width="80">${gettext("Time")}</th>
            <th width="300">${gettext("Description")}</th>
            <th width="50">${gettext("Recreate")}</th>
            <th width="50">${gettext("Download")}</th>
            ${doc.is_owner ? `<th width="50">${gettext("Delete")}</th>` : ""}
        </thead>
        <tbody class="fw-data-table-body fw-middle">
            ${doc.revisions
                .slice()
                .sort((a, b) => a.date > b.date)
                .map(
                    rev =>
                        `<tr class="revision-${rev.pk}" data-document="${doc.id}">
                        <td width="80"><span class="fw-inline">
                            ${localizeDate(rev.date * 1000)}
                        </span></td>
                        <td width="300"><span class="fw-inline">${rev.note}</span></td>
                        <td width="50"><span class="fw-inline recreate-revision" data-id="
                                ${rev.pk}"><i class="fa fa-download"></i></span></td>
                        <td width="50"><span class="fw-inline download-revision" data-id="
                                ${rev.pk}" data-filename="${escapeText(rev.file_name)}">
                            <i class="fa fa-download"></i>
                        </span></td>
                        ${
                            doc.is_owner
                                ? `<td width="50">
                                <span class="fw-inline delete-revision" data-id="${rev.pk}">
                                    <i class="fa fa-trash"></i>
                                </span>
                            </td>`
                                : ""
                        }
                    </tr>`
                )}
        </tbody>
    </table>`
