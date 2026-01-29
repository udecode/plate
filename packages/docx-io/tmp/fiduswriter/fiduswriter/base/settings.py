import os

# The ports Fidus Writer is running on:
PORTS = [
    8000,
]

# Allow the server to listen to all network interfaces (0.0.0.0) instead of just localhost
# SECURITY WARNING: Setting this to True in production environments could expose your server
LISTEN_TO_ALL_INTERFACES = False

# If you want to show debug messages, set DEBUG to True.
DEBUG = True
SOURCE_MAPS = False

# This determines whether the server is used for testing and will let the
# users know upon signup know that their documents may disappear.
TEST_SERVER = True
# This is the contact email that will be shown in various places all over
# the site.
CONTACT_EMAIL = "mail@email.com"

# Interval between document saves
DOC_SAVE_INTERVAL = 30

ADMINS = (("Your Name", "your_email@example.com"),)

MANAGERS = ADMINS

# The top path of the project. Depending on whether ./manage.py is executed or
# the fiduswriter pip package, it is either the dir that contains manage.py or
# the cwd.
PROJECT_PATH = os.environ.get("PROJECT_PATH")
# SRC_PATH is the root path of the FW sources.
SRC_PATH = os.environ.get("SRC_PATH")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.path.join(PROJECT_PATH, "fiduswriter.sqlite3"),
        "CONN_MAX_AGE": None,
        "TEST": {"NAME": "testdb.sqlite3"},
    }
}

# Will let any user not delete more than 5000 bibliography entries
# simultaneously
DATA_UPLOAD_MAX_NUMBER_FIELDS = 5000

# Whether anyone surfing to the site can open an account with a login/password.
REGISTRATION_OPEN = True

# Whether user's can login using passwords (if not, they will only be able to
# sign in using social accounts).
PASSWORD_LOGIN = True

# Whether anyone surfing to the site can open an account or login with a
# socialaccount.
SOCIALACCOUNT_OPEN = True
SOCIALACCOUNT_STORE_TOKENS = True
SOCIALACCOUNT_EMAIL_VERIFICATION = "none"

# This determines whether there is a star labeled "Free" on the login page
IS_FREE = True

# Send emails to console.
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Or send emails using an SMTP server
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'localhost'
# EMAIL_HOST_USER = ''
# EMAIL_HOST_PASSWORD = ''
# EMAIL_PORT = 25
# EMAIL_SUBJECT_PREFIX = '[Fidus Writer]'


# Local time zone for this installation. Keep UTC here, the frontend will
# translate this to the correct local time.
TIME_ZONE = "UTC"

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = "en-us"

SITE_ID = 1

# If you set this to False, the server will make some optimizations so as not
# to load the internationalization machinery. Fidus Writer makes use of
# internationalization, so you should probably keep this on.

USE_I18N = True

LOCALE_PATHS = (os.path.join(SRC_PATH, "locale"),)

# A list of allowed hostnames of this Fidus Writer installation
ALLOWED_HOSTS = [
    "localhost",
]

# If you set this to False, the server will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, the server will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# The default is the media folder in the directory above this file.
MEDIA_ROOT = os.path.join(PROJECT_PATH, "media/")

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
MEDIA_URL = "/media/"

# The maximum size of user uploaded images in bytes. If you use NGINX, note
# that also it needs to support at least this size.
MEDIA_MAX_SIZE = False
DATA_UPLOAD_MAX_MEMORY_SIZE = None

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = os.path.join(PROJECT_PATH, "static-collected/")

# URL prefix for static files.
# Example: "https://media.lawrence.com/static/"
STATIC_URL = "/static/"

# Additional locations of static files
STATICFILES_DIRS = (
    os.path.join(PROJECT_PATH, "static-transpile"),
    os.path.join(PROJECT_PATH, "static-libs"),
)

LOGIN_URL = "/"
SOCIALACCOUNT_LOGIN_ON_GET = True

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    "django.contrib.staticfiles.finders.FileSystemFinder",
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
    #    "django.contrib.staticfiles.finders.DefaultStorageFinder",
)

# Make this unique, and don't share it with anybody. Change the default string.
SECRET_KEY = "2ouq2zgw5y-@w+t6!#zf#-z1inigg7$lg3p%8e3kkob1bf$#p4"


# These middleware classes is what Fidus Writer needs in its standard setup.
# You only need to change this in very advanced setups.
BASE_MIDDLEWARE = [
    "django.middleware.common.CommonMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.locale.LocaleMiddleware",
    "allauth.account.middleware.AccountMiddleware",
    "user.middleware.UserLanguageMiddleware",
]

MIDDLEWARE = []


# The location of the top urls.py file inside the base folder.
# You only need to change this in very advanced setups.
ROOT_URLCONF = "base.root_urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            os.path.join(PROJECT_PATH, "templates"),
            # Put strings here, like "/home/html/django_templates".
            # You only need to change this in very advanced setups.
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.contrib.auth.context_processors.auth",
                "django.template.context_processors.debug",
                "django.template.context_processors.i18n",
                "django.template.context_processors.media",
                "django.template.context_processors.static",
                "django.template.context_processors.request",
                "django.template.context_processors.tz",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# The following are the apps needed by Fidus Writer.

BASE_INSTALLED_APPS = [
    "npm_mjs",
    "base",
    "daphne",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.sites",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.admin",
    "django.contrib.admindocs",
    "django.contrib.flatpages",
    "channels",
    "django_js_error_hook",
    "loginas",
    "fixturemedia",
    "browser_check",
    "menu",
    "document",
    "bibliography",
    "usermedia",
    "user",
    "allauth",
    "allauth.account",
    "allauth.socialaccount",
    "avatar",
    "feedback",
    "style",
]

# These are additional apps to be overriden by configuration.py
INSTALLED_APPS = []

# These are apps that are removed from core apps overriden by configuration.py
REMOVED_APPS = []


AUTHENTICATION_BACKENDS = (
    # Needed to login by username in Django admin, regardless of `allauth`
    "django.contrib.auth.backends.ModelBackend",
    # `allauth` specific authentication methods, such as login by e-mail
    "allauth.account.auth_backends.AuthenticationBackend",
)

TEST_RUNNER = "django.test.runner.DiscoverRunner"
TESTING = False  # Overriden by test runner.


# Define available languages
# You only need to change this in very advanced setups.
def gettext(s):
    return s


LANGUAGES = (
    ("en", gettext("English")),
    ("bg", gettext("Bulgarian")),
    ("de", gettext("German")),
    ("fr", gettext("French")),
    ("it", gettext("Italian")),
    ("es", gettext("Spanish")),
    ("pt-br", gettext("Portuguese (Brazil)")),
)

LOGIN_REDIRECT_URL = "/"


# Allow users with login_as permission to log in as different user
def can_login_as(request, target_user):
    return request.user.has_perm("user.can_login_as")


CAN_LOGIN_AS = can_login_as

ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_EMAIL_VERIFICATION = "mandatory"
ACCOUNT_DEFAULT_HTTP_PROTOCOL = "http"

# allow login either with email or username
ACCOUNT_AUTHENTICATION_METHOD = "username_email"
ACCOUNT_ADAPTER = "user.adapter.AccountAdapter"

AUTH_PROFILE_MODULE = "account.Profile"
AUTH_USER_MODEL = "user.User"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "require_debug_false": {"()": "django.utils.log.RequireDebugFalse"}
    },
    "formatters": {
        "verbose": {
            "format": (
                "%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d "
                "%(message)s"
            )
        },
        "simple": {"format": "\033[22;32m%(levelname)s\033[0;0m %(message)s"},
    },
    "handlers": {
        "mail_admins": {
            "level": "ERROR",
            "filters": ["require_debug_false"],
            "class": "django.utils.log.AdminEmailHandler",
        },
        "console": {
            "level": "DEBUG",
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
        "null": {
            "class": "logging.NullHandler",
        },
    },
    "loggers": {
        "django.request": {
            "handlers": ["mail_admins"],
            "level": "ERROR",
            "propagate": True,
        },
        "django.security.DisallowedHost": {
            "handlers": ["null"],
            "propagate": False,
        },
        "javascript_error": {
            "handlers": ["mail_admins", "console"],
            "level": "ERROR",
            "propagate": True,
        },
    },
}

# Global variables for avatar
# You only need to change this in very advanced setups.
AVATAR_GRAVATAR_BACKUP = False
AVATAR_THUMB_FORMAT = "PNG"
AVATAR_DEFAULT_URL = "img/default_avatar.avif"
AVATAR_DEFAULT_SIZE = 80
AVATAR_MAX_AVATARS_PER_USER = 1
AVATAR_CACHE_ENABLED = True


WEBSOCKET_PING_INTERVAL = 55

ADMIN_SITE_TITLE = gettext("Fidus Writer Admin")
ADMIN_SITE_HEADER = gettext("Fidus Writer Administration Site")
ADMIN_INDEX_TITLE = gettext("Welcome to the Fidus Writer Administration Site")

# The below allow login via JavaScript
SESSION_COOKIE_HTTPONLY = False
CSRF_COOKIE_HTTPONLY = False

# To make npm-mjs enable the webpack offline plugin
RSPACK_CONFIG_TEMPLATE = os.path.join(
    os.path.dirname(os.path.realpath(__file__)), "rspack.config.template.js"
)

# JS error logging
JAVASCRIPT_ERROR_USERAGENT_BLACKLIST = ["googlebot", "bingbot", "cutycapt"]
JAVASCRIPT_ERROR_BLACKLIST = [
    "script error",
    "the operation is insecure",
    "parse error",
    "unhandledrejection, {}",
    "An unknown error occurred",
]

# The page to show while transpilation takes place.
SETUP_PAGE_PATH = os.path.join(SRC_PATH, "base/setup_page/")

# Whether to create a service worker on production sites
USE_SERVICE_WORKER = True


DEFAULT_AUTO_FIELD = "django.db.models.AutoField"
SILENCED_SYSTEM_CHECKS = ["models.W042"]

FOOTER_LINKS = []
BRANDING_LOGO = False

ASGI_APPLICATION = "base.routing.application"
