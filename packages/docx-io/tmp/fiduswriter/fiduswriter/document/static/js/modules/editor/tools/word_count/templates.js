export const wordCounterDialogTemplate = ({
    docNumWords,
    docNumNoSpace,
    docNumChars,
    selectionNumWords,
    selectionNumNoSpace,
    selectionNumChars
}) =>
    `<table class="fw-data-table">
        <thead class="fw-data-table-header">
            <tr>
                <th>&nbsp;${gettext("Number of")}&nbsp;</th>
                <th>&nbsp;${gettext("Document")}&nbsp;</th>
                <th>&nbsp;${gettext("Selection")}&nbsp;</th>
            </tr>
        </thead>
        <tbody class="fw-word-counter-tbody">
            <tr>
                <td>&nbsp;${gettext("Words")}&nbsp;</td>
                <td>&nbsp;${docNumWords}&nbsp;</td>
                <td>&nbsp;${selectionNumWords}&nbsp;</td>
            </tr>
            <tr>
                <td>&nbsp;${gettext("Characters without blanks")}&nbsp;</td>
                <td>&nbsp;${docNumNoSpace}&nbsp;</td>
                <td>&nbsp;${selectionNumNoSpace}&nbsp;</td>
            </tr>
            <tr>
                <td>&nbsp;${gettext("Characters with blanks")}&nbsp;</td>
                <td>&nbsp;${docNumChars}&nbsp;</td>
                <td>&nbsp;${selectionNumChars}&nbsp;</td>
            </tr>
        </tbody>
    </table>`
