import {avatarTemplate} from "./user"
import {filterPrimaryEmail} from "./user_util"

export const baseBodyTemplate = ({user, contents, hasOverview, app}) => `
<div id="wait">
    <i class="fa fa-spinner fa-pulse"></i>
</div>
<header class="fw-header" role="banner">
    <div class="fw-container">
        <a href="${app && app.routes[""].app === "document" ? "/" : "/documents/"}">
            <h1 class="fw-logo">
                <span class="fw-logo-text"></span>
                <img src="${staticUrl("svg/icon.svg")}" alt="Logo" />
            </h1>
        </a>
        <nav id="header-nav" role="navigation" aria-label="${gettext("Site navigation")}"></nav>
        <div id="user-preferences" class="fw-user-preferences fw-header-text">
            <div id="preferences-btn" class="fw-button">
                ${avatarTemplate({user})}
            </div>
            <div id="user-preferences-pulldown" class="fw-pulldown fw-right">
                <div data-value="profile">
                    <span class='fw-avatar-card'>
                        <span class='fw-avatar-card-avatar'>${avatarTemplate({user})}</span>
                        <span class='fw-avatar-card-name'>
                            ${user.username}
                            <span class='fw-avatar-card-email'>${filterPrimaryEmail(user.emails)}</span>
                        </span>
                    </span>
                </div>
                <div data-value="contacts">${gettext("Contacts")}</div>
                <div data-value="logout">${gettext("Log out")}</div>
            </div>
        </div><!-- end user preference -->
    </div><!-- end container -->
</header>
<div class="fw-contents-outer">
    ${hasOverview ? '<div class="fw-overview-menu-wrapper"><ul id="fw-overview-menu"></ul></div>' : ""}
    <div class="fw-contents">
        ${contents}
    </div>
</div>`
