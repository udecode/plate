import {langName} from "../common"

export const basePreloginTemplate = ({
    contents,
    language,
    headerLinks = [],
    footerLinks = []
}) => `
<div id="wait">
   <i class="fa fa-spinner fa-pulse"></i>
</div>
<header class="fw-header prelogin" role="banner">
   <div class="fw-container">
      <h1 class="fw-login-logo"><span class="fw-logo-text"></span><img src="${staticUrl("svg/icon.svg")}" alt="Logo"/></h1>
      <nav id="header-nav" role="navigation" aria-label="${gettext("Site navigation")}">${headerLinks
          .map(hLink => {
              let returnValue
              switch (hLink.type) {
                  case "label":
                      returnValue = `<label>${hLink.text}</label>`
                      break
                  case "button":
                      returnValue = `<a class="fw-button fw-orange fw-uppercase" href="${hLink.link}" title="${hLink.text}">${hLink.text}</a>`
                      break
                  default:
                      returnValue = ""
              }
              return returnValue
          })
          .join("")}</nav>
${
    settings_BRANDING_LOGO
        ? `<div class="fw-login-branding-logo"><img src="${staticUrl(settings_BRANDING_LOGO)}" alt="Brand logo" /></div>`
        : ""
}
   </div>
   ${
       settings_IS_FREE
           ? `<div class="star"><img src="${staticUrl("img/free_star.avif")}" alt="Free"></div>`
           : ""
   }
</header>
<div class="fw-contents prelogin">
    ${contents}
</div>
<footer id="footer-menu" class="prelogin">
    <div class="fw-container">
        <ul class="fw-footer-links">
            ${footerLinks
                .map(
                    fLink =>
                        `<li><a href="${fLink.link}" target="_blank"${fLink.external ? ' rel="noreferrer"' : ""}>${fLink.text}</a></li>`
                )
                .join("")}
        </ul>
        <select id="lang-selection" aria-label="${gettext("Select language")}">
            ${settings_LANGUAGES
                .map(
                    ([code, _name]) =>
                        `<option value="${code}" ${language === code ? "selected" : ""}>${langName(code)}</option>`
                )
                .join("")}
        </select>
    </div>
</footer>`
