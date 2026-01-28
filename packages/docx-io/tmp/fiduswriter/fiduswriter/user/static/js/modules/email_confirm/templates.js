/** A template for the confirm email/agree to terms page */
export const confirmAccountTemplate = ({
    username,
    email,
    verified,
    validKey,
    confirmQuestionsTemplates
}) =>
    `<h1 class="fw-login-title">${verified ? gettext("Confirm E-mail Address") : gettext("Confirm E-mail Address and Agree to Terms and Conditions")}</h1>
    ${validKey ? confirmAccountFormTemplate({username, email, verified, confirmQuestionsTemplates}) : expiredConfirmationLinkTemplate()}
    `

const confirmAccountFormTemplate = ({
    username,
    email,
    verified,
    confirmQuestionsTemplates
}) =>
    `<p>${
        verified
            ? interpolate(
                  gettext(
                      'Please confirm that you own the email <a href="mailto:%(email)s">%(email)s</a>.'
                  ),
                  {email},
                  true
              )
            : interpolate(
                  gettext(
                      'Please confirm that you own the email <a href="mailto:%(email)s">%(email)s</a>, that you apply for the username %(username)s, and that you have read and agree to our <a href="/pages/terms/" target="_blank">Terms and Conditions</a> and <a href="/pages/privacy/" target="_blank">Privacy Policy</a>.'
                  ),
                  {email, username},
                  true
              )
    }</p>
    <table>
    ${confirmQuestionsTemplates.map(template => `<tr>${template()}</tr>`).join("")}
    </table>
    <p class="submit-wrapper">
        <button type="submit" id="submit" disabled class="fw-button fw-orange fw-uppercase">${gettext("Confirm")}</button>
    </p>
    `

export const checkTermsTemplate = () =>
    `<td>
        <input type="checkbox" class="checker" id="terms-check">
    </td><td>
        ${gettext('I have read and agree to the <a href="/pages/terms/" target="_blank">Terms and Conditions</a>.')}
    </td>`

export const testServerQuestionTemplate = () =>
    `<td>
        <input type="checkbox" class="checker" id="test-check">
    </td><td>
        ${gettext("I am aware that I am signing up for a test account and that service may be ended abruptly and without notice, leaving me without my files.")}
    </td>`

const expiredConfirmationLinkTemplate = () =>
    `<p>
        ${gettext("This e-mail confirmation link expired or is invalid. Please try to open another account.")}
    </p>`

export const verifiedAccountTemplate = () =>
    `<h1>${gettext("Thanks for verifying!")}</h1>
    <p>${gettext("You can now log in.")}</p>`
