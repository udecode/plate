import argparse

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "level": "INFO",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
}

parser = argparse.ArgumentParser()
parser.add_argument(
    "--debug-mode", action="store_true", help="Enable debug mode"
)
args, _unknown = parser.parse_known_args()

if args.debug_mode:
    LOGGING["root"]["level"] = "DEBUG"
    LOGGING["handlers"]["console"]["level"] = "DEBUG"

INSTALLED_APPS = [
    "user_template_manager",
]
