#!/usr/bin/env python3
import os
import sys
import multiprocessing
from importlib import import_module


if "COVERAGE_PROCESS_START" in os.environ:
    import coverage

    coverage.process_startup()

SRC_PATH = os.path.dirname(os.path.realpath(__file__))
os.environ.setdefault("SRC_PATH", SRC_PATH)


def load_settings(settings_module):
    """
    Load settings from three levels, each overriding the previous one:
    1. Django's global_settings.py
    2. Fiduswriter's base settings.py
    3. User's configuration.py (or custom settings module)
    """
    from django.conf import global_settings as GLOBAL_SETTINGS
    from base import settings as BASE_SETTINGS

    settings_paths = [BASE_SETTINGS.__file__]

    # Start with Django's global settings
    settings_dict = {}
    for setting in dir(GLOBAL_SETTINGS):
        if setting.isupper():
            settings_dict[setting] = getattr(GLOBAL_SETTINGS, setting)

    # Override with Fiduswriter's base settings
    for setting in dir(BASE_SETTINGS):
        if setting.isupper():
            settings_dict[setting] = getattr(BASE_SETTINGS, setting)

    # Override with user's configuration settings if available
    try:
        config_module = import_module(settings_module)
        settings_paths.append(config_module.__file__)
        for setting in dir(config_module):
            if setting.isupper():
                settings_dict[setting] = getattr(config_module, setting)
    except ModuleNotFoundError:
        pass

    # Add metadata about settings
    settings_dict["SETTINGS_PATHS"] = settings_paths
    settings_dict["SETTINGS_MODULE"] = settings_module

    return settings_dict


def inner(default_project_path):
    """
    Main entry point for the Django management commands.

    Args:
        default_project_path: The default path to use if no --pythonpath is provided
    """
    sys.path.append(SRC_PATH)
    sys_argv = sys.argv
    PROJECT_PATH = False

    # Handle --pythonpath argument
    while "--pythonpath" in sys_argv:
        index = sys_argv.index("--pythonpath")
        PROJECT_PATH = os.path.join(os.getcwd(), sys_argv[index + 1])
        sys.path.insert(0, PROJECT_PATH)
        # We prevent the pythonpath to be handled later on by removing it from
        # sys_argv
        sys_argv = sys_argv[:index] + sys_argv[index + 2 :]

    if not PROJECT_PATH:
        PROJECT_PATH = default_project_path
        sys.path.insert(0, PROJECT_PATH)
    os.environ.setdefault("PROJECT_PATH", PROJECT_PATH)

    if "--settings" in sys_argv:
        index = sys_argv.index("--settings")
        SETTINGS_MODULE = sys_argv[index + 1]
    else:
        SETTINGS_MODULE = "configuration"
    # Load settings from all sources and merge them
    settings_dict = load_settings(SETTINGS_MODULE)

    # Override PORTS setting if running tests
    if "test" in sys_argv:
        settings_dict["PORTS"] = [
            False,
        ]

    # Override INSTALLED_APPS
    if (
        "BASE_INSTALLED_APPS" in settings_dict
        and "INSTALLED_APPS" in settings_dict
    ):
        settings_dict["INSTALLED_APPS"] = settings_dict[
            "BASE_INSTALLED_APPS"
        ] + list(settings_dict["INSTALLED_APPS"])
    if "REMOVED_APPS" in settings_dict:
        for app in settings_dict["REMOVED_APPS"]:
            settings_dict["INSTALLED_APPS"].remove(app)

    # Merge MIDDLEWARE
    if "BASE_MIDDLEWARE" in settings_dict and "MIDDLEWARE" in settings_dict:
        settings_dict["MIDDLEWARE"] = settings_dict["BASE_MIDDLEWARE"] + list(
            settings_dict["MIDDLEWARE"]
        )

    # Configure Django settings
    from django.conf import settings

    settings.configure(**settings_dict)

    # Set timezone
    os.environ["TZ"] = settings.TIME_ZONE

    # Handle version command
    if len(sys_argv) > 1 and sys_argv[1] in ["version", "--version"]:
        from base import get_version

        sys.stdout.write(get_version() + "\n")
        return

    # Execute Django management command
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys_argv)


def entry():
    """
    Entry point for the Fiduswriter application when installed as a package.
    Uses the current working directory as the project path.
    """
    os.environ.setdefault("NO_COMPILEMESSAGES", "true")
    inner(os.getcwd())


if __name__ == "__main__":
    # Force fork method for multiprocessing (needed for Python 3.14)
    try:
        multiprocessing.set_start_method("fork", force=True)
    except RuntimeError:
        pass
    inner(SRC_PATH)
