/** Creates a dropdown box.
 * @param btn The button to open and close the dropdown box.
 * @param box The node containing the contents of the dropdown box.
 * @param preopen An optional function to be called before opening the dropdown box. Used to position dropdown box.
 */
export const filterPrimaryEmail = emails => {
    const primaryEmails = emails.filter(email => email.primary)
    if (!primaryEmails.length) {
        if (emails.length) {
            return emails[0].address
        } else {
            return ""
        }
    }
    return primaryEmails[0].address
}
