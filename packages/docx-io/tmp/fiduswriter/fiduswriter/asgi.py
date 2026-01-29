import os
import sys
from importlib import import_module
import django

from channels.routing import get_default_application


# os.environ["DJANGO_ALLOW_ASYNC_UNSAFE"] = "true"

SRC_PATH = os.path.dirname(os.path.realpath(__file__))
os.environ.setdefault("SRC_PATH", SRC_PATH)

sys.path.append(SRC_PATH)
sys_argv = sys.argv
PROJECT_PATH = os.getcwd()
os.environ.setdefault("PROJECT_PATH", PROJECT_PATH)
SETTINGS_MODULE = "configuration"
mod = False
# There are three levels of settings, each overiding the previous one:
# global_settings.py, settings.py and configuration.py
from django.conf import global_settings as CONFIGURATION  # noqa
from base import settings as SETTINGS  # noqa

SETTINGS_PATHS = [SETTINGS.__file__]
for setting in dir(SETTINGS):
    setting_value = getattr(SETTINGS, setting)
    setattr(CONFIGURATION, setting, setting_value)
try:
    mod = import_module(SETTINGS_MODULE)
except ModuleNotFoundError:
    SETTINGS_MODULE = None
if mod:
    SETTINGS_PATHS.append(mod.__file__)
    for setting in dir(mod):
        if setting.isupper():
            setattr(CONFIGURATION, setting, getattr(mod, setting))
INSTALLED_APPS = CONFIGURATION.BASE_INSTALLED_APPS + list(
    CONFIGURATION.INSTALLED_APPS
)
for app in CONFIGURATION.REMOVED_APPS:
    INSTALLED_APPS.remove(app)
from django.conf import settings  # noqa

settings.configure(
    CONFIGURATION,
    SETTINGS_MODULE=SETTINGS_MODULE,
    SETTINGS_PATHS=SETTINGS_PATHS,
    INSTALLED_APPS=INSTALLED_APPS,
    MIDDLEWARE=(
        CONFIGURATION.BASE_MIDDLEWARE + list(CONFIGURATION.MIDDLEWARE)
    ),
)
django.setup()

application = get_default_application()
