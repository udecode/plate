import os

#############################################
# Django settings for Fidus Writer project. #
#############################################

# After copying this file to configuration.py, adjust the below settings to
# work with your setup.

# If you don't want to show debug messages, set DEBUG to False.

DEBUG = True
# SOURCE_MAPS - allows any value used by webpack devtool
# https://webpack.js.org/configuration/devtool/
# For example
# SOURCE_MAPS = 'cheap-module-source-map' # fast - line numbers only
# SOURCE_MAPS = 'source-map' # slow - line and column number
SOURCE_MAPS = False

PROJECT_PATH = os.environ.get("PROJECT_PATH")
# SRC_PATH is the root path of the FW sources.
SRC_PATH = os.environ.get("SRC_PATH")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": os.path.join(PROJECT_PATH, "fiduswriter.sql"),
        "CONN_MAX_AGE": 15,
    }
}

# Interval between document saves
# DOC_SAVE_INTERVAL = 1

# Migrate, transpile JavaScript and install required fixtures automatically
# when starting runserver. You might want to turn this off on a production
# server. The default is the opposite of DEBUG

# AUTO_SETUP = False

# This determines whether the server is used for testing and will let the
# users know upon signup know that their documents may disappear.
TEST_SERVER = True
# This is the contact email that will be shown in various places all over
# the site.
CONTACT_EMAIL = "mail@email.com"
# Ports that Fidus Writer will run on.
PORTS = [
    8000,
]
#

# Allow the server to listen to all network interfaces (0.0.0.0) instead of just localhost
# SECURITY WARNING: Setting this to True in production environments could expose your server
LISTEN_TO_ALL_INTERFACES = False

ADMINS = (("Your Name", "your_email@example.com"),)

# Whether anyone surfing to the site can open an account with a login/password.
REGISTRATION_OPEN = True

# Whether user's can login using passwords (if not, they will only be able to
# sign in using social accounts).
PASSWORD_LOGIN = True

# Whether anyone surfing to the site can open an account or login with a
# socialaccount.
SOCIALACCOUNT_OPEN = True

# ACCOUNT_EMAIL_VERIFICATION = 'optional'

# This determines whether there is a star labeled "Free" on the login page
IS_FREE = True

MANAGERS = ADMINS

# DATABASES = {
#    'default': {
# Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
#        'ENGINE': 'django.db.backends.',
# Or path to database file if using sqlite3.
#        'NAME': '',
# Not used with sqlite3.
#        'USER': '',
# Not used with sqlite3.
#        'PASSWORD': '',
# Set to empty string for localhost. Not used with sqlite3.
#        'HOST': '',
# Set to empty string for default. Not used with sqlite3.
#        'PORT': '',
# The max time in seconds a database connection should wait for a subsequent
# request.
#        'CONN_MAX_AGE': 15
#    }
# }

# Send emails using an SMTP server
# EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
# EMAIL_HOST = 'localhost'
# EMAIL_HOST_USER = ''
# EMAIL_HOST_PASSWORD = ''
# EMAIL_PORT = 25
# EMAIL_SUBJECT_PREFIX = '[Fidus Writer]'
# EMAIL_USE_TLS = False
# DEFAULT_FROM_EMAIL = 'mail@email.com' # For messages to end users
# SERVER_EMAIL = 'mail@email.com' # For messages to server administrators

# FOOTER_LINKS = [
#     {
#         "text": "Terms and Conditions",
#         "link": "/pages/terms/"
#     },
#     {
#         "text": "Privacy policy",
#         "link": "/pages/privacy/"
#     },
#     {
#         "text": "Equations and Math with MathLive",
#         "link": "https://github.com/arnog/mathlive#readme",
#         "external": True
#     },
#     {
#         "text": "Citations with Citation Style Language",
#         "link": "https://citationstyles.org/",
#         "external": True
#     },
#     {
#         "text": "Editing with ProseMirror",
#         "link": "https://prosemirror.net/",
#         "external": True
#     }
# ]


INSTALLED_APPS = [
    # If you want to enable one or several of the social network login options
    # below, make sure you add the authorization keys at:
    # http://SERVER.COM/admin/socialaccount/socialapp/
    # 'allauth.socialaccount.providers.facebook',
    # 'allauth.socialaccount.providers.google',
    # 'allauth.socialaccount.providers.twitter',
    # 'allauth.socialaccount.providers.github',
    # 'allauth.socialaccount.providers.linkedin',
    # 'allauth.socialaccount.providers.openid',
    # 'allauth.socialaccount.providers.persona',
    # 'allauth.socialaccount.providers.soundcloud',
    # 'allauth.socialaccount.providers.stackexchange',
    "user_template_manager",
]

# A list of allowed hostnames of this Fidus Writer installation
ALLOWED_HOSTS = [
    "localhost",
]

# Disable service worker (default is True)
# USE_SERVICE_WORKER = False

# The maximum size of user uploaded images in bytes. If you use NGINX, note
# that also it needs to support at least this size.
MEDIA_MAX_SIZE = False

# Create URLs in https (required for social media login)
# ACCOUNT_DEFAULT_HTTP_PROTOCOL = 'https'

# Which domains served over http to allow post requests from. Should be the same as ALLOWED_HOSTS
# But including https://, for example "https://www.domain.com".
# CSRF_TRUSTED_ORIGINS = []

# Add branding logo inside of "static-libs" folder. For example: static-libs/svg/logo.svg
# BRANDING_LOGO = "svg/logo.svg"
