# Origin: https://github.com/django/daphne/blob/2b13b74ce266fedf1cad9122314a2a3579cee576/daphne/management/commands/runserver.py
# With Fidus Writer specific adjustments.

import datetime
import importlib
import logging
import sys
import threading
import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from http.server import HTTPServer, SimpleHTTPRequestHandler


from base import get_version

from django.apps import apps
from django.conf import settings
from django.contrib.staticfiles.handlers import ASGIStaticFilesHandler
from django.core.exceptions import ImproperlyConfigured
from django.core.management import CommandError
from django.core.management.commands.runserver import (
    Command as RunserverCommand,
)
from django.core.management import call_command

from daphne.endpoints import build_endpoint_description_strings
from daphne.server import Server

logger = logging.getLogger("django.channels.server")


def get_default_application():
    """
    Gets the default application, set in the ASGI_APPLICATION setting.
    """
    try:
        path, name = settings.ASGI_APPLICATION.rsplit(".", 1)
    except (ValueError, AttributeError):
        raise ImproperlyConfigured("Cannot find ASGI_APPLICATION setting.")
    try:
        module = importlib.import_module(path)
    except ImportError:
        raise ImproperlyConfigured(
            "Cannot import ASGI_APPLICATION module %r" % path
        )
    try:
        value = getattr(module, name)
    except AttributeError:
        raise ImproperlyConfigured(
            f"Cannot find {name!r} in ASGI_APPLICATION module {path}"
        )
    return value


class MaintenancePageHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def do_GET(self):
        self.path = "/index.html"
        return SimpleHTTPRequestHandler.do_GET(self)

    def translate_path(self, path):
        return os.path.join(settings.SETUP_PAGE_PATH, "index.html")


class JSFileHandler(FileSystemEventHandler):
    def __init__(self, command_instance):
        self.command_instance = command_instance
        self.last_transpile = 0
        self.watched_extensions = (".js", ".mjs", ".json5")
        self.last_modified_times = {}

    def on_any_event(self, event):
        if event.event_type in ["created", "modified", "moved"]:
            if event.src_path.endswith(self.watched_extensions):
                if not self._should_ignore(event.src_path):
                    self._handle_change(event.src_path)

    def _should_ignore(self, path):
        # Add any specific files or directories you want to ignore
        ignore_list = ["node_modules", ".git"]
        return any(ignore_item in path for ignore_item in ignore_list)

    def _handle_change(self, path):
        current_time = time.time()
        try:
            mtime = os.path.getmtime(path)
        except OSError:
            # File might have been deleted or moved
            return

        if path in self.last_modified_times:
            if mtime == self.last_modified_times[path]:
                # File hasn't actually changed
                return

        self.last_modified_times[path] = mtime

        if current_time - self.last_transpile > 30:
            print(f"File changed: {path}")
            self.command_instance.stdout.write(
                "JavaScript or related file changed. Transpiling..."
            )
            call_command("transpile")
            self.last_transpile = current_time


def get_internal_port(conn):
    if isinstance(conn, int):
        return conn
    elif isinstance(conn, dict):
        return int(conn["internal"])


class Command(RunserverCommand):
    protocol = "http"
    server_cls = Server

    def add_arguments(self, parser):
        super().add_arguments(parser)
        parser.add_argument(
            "--http_timeout",
            action="store",
            dest="http_timeout",
            type=int,
            default=None,
            help=(
                "Specify the daphne http_timeout interval in seconds "
                "(default: no timeout)"
            ),
        )
        parser.add_argument(
            "--websocket_handshake_timeout",
            action="store",
            dest="websocket_handshake_timeout",
            type=int,
            default=5,
            help=(
                "Specify the daphne websocket_handshake_timeout interval in "
                "seconds (default: 5)"
            ),
        )

    def get_version(self):
        return get_version()

    def handle(self, *args, **options):
        self.addrport_provided = (
            "addrport" in options and options["addrport"] is not None
        )
        self.http_timeout = options.get("http_timeout", None)
        self.websocket_handshake_timeout = options.get(
            "websocket_handshake_timeout", 5
        )
        # Check Channels is installed right
        if not hasattr(settings, "ASGI_APPLICATION"):
            raise CommandError(
                "You have not set ASGI_APPLICATION, which is needed to run the server."
            )
        # Dispatch upward
        super().handle(*args, **options)

    def inner_run(self, *args, **options):
        # Determine the address to bind to
        if not options.get("addrport"):
            # If address not specified on command line, use settings
            listen_to_all = getattr(
                settings, "LISTEN_TO_ALL_INTERFACES", False
            )
            self.addr = "0.0.0.0" if listen_to_all else "127.0.0.1"

        # Determine ports to use
        default_port = int(self.port)
        if self.addrport_provided:
            ports = [default_port]
        else:
            ports = getattr(settings, "PORTS", [default_port])
            if isinstance(ports, int):
                ports = [ports]
            elif isinstance(ports, (list, tuple)):
                ports = list(ports)
            else:
                ports = [default_port]
            if not ports:
                ports = [default_port]
            try:
                ports = [get_internal_port(p) for p in ports]
            except (ValueError, TypeError):
                raise CommandError(
                    "PORTS must be a list of integers or dicts with an `internal` key."
                )

        # Start maintenance page servers for each port
        maintenance_servers = []
        for port in ports:
            server_address = (
                "[%s]" % self.addr if self._raw_ipv6 else self.addr,
                port,
            )
            maintenance_server = HTTPServer(
                server_address, MaintenancePageHandler
            )
            maintenance_server_thread = threading.Thread(
                target=maintenance_server.serve_forever
            )
            maintenance_server_thread.start()
            maintenance_servers.append(
                (maintenance_server, maintenance_server_thread)
            )

        # Run checks
        self.stdout.write("Performing system checks...\n\n")
        self.check(display_num_errors=True)
        self.check_migrations()
        call_command("setup", force_transpile=False)

        # Stop maintenance page servers
        for maintenance_server, thread in maintenance_servers:
            maintenance_server.shutdown()
            maintenance_server.server_close()
            thread.join()

        # Print helpful text
        quit_command = "CTRL-BREAK" if sys.platform == "win32" else "CONTROL-C"
        now = datetime.datetime.now().strftime("%B %d, %Y - %X")
        self.stdout.write(now)
        addr_display = "[%s]" % self.addr if self._raw_ipv6 else self.addr
        urls = [f"{self.protocol}://{addr_display}:{port}/" for port in ports]
        self.stdout.write(
            (
                "Fidus Writer version %(version)s, using settings %(settings)r\n"
                "Fidus Writer server is running at the following URL(s):\n"
                "%(urls)s\n"
                "Quit the server with %(quit_command)s.\n"
            )
            % {
                "version": self.get_version(),
                "settings": settings.SETTINGS_MODULE,
                "urls": "\n".join(urls),
                "quit_command": quit_command,
            }
        )

        # Configure endpoints for all ports
        endpoints = []
        for port in ports:
            endpoints.extend(
                build_endpoint_description_strings(host=self.addr, port=port)
            )

        # Add JavaScript file watcher
        if settings.DEBUG:
            js_handler = JSFileHandler(self)
            observer = Observer()
            observer.schedule(
                js_handler, path=settings.SRC_PATH, recursive=True
            )
            observer.start()

        try:
            self.server_cls(
                application=self.get_application(options),
                endpoints=endpoints,
                signal_handlers=not options["use_reloader"],
                action_logger=self.log_action,
                http_timeout=self.http_timeout,
                root_path=getattr(settings, "FORCE_SCRIPT_NAME", "") or "",
                websocket_handshake_timeout=self.websocket_handshake_timeout,
            ).run()
            logger.debug("Fidus Writer exited")
        except KeyboardInterrupt:
            if settings.DEBUG:
                observer.stop()
            shutdown_message = options.get("shutdown_message", "")
            if shutdown_message:
                self.stdout.write(shutdown_message)
            return

        finally:
            if settings.DEBUG:
                observer.join()

    def get_application(self, options):
        """
        Returns the static files serving application wrapping the default application,
        if static files should be served. Otherwise just returns the default
        handler.
        """
        staticfiles_installed = apps.is_installed("django.contrib.staticfiles")
        use_static_handler = options.get(
            "use_static_handler", staticfiles_installed
        )
        insecure_serving = options.get("insecure_serving", False)
        if use_static_handler and (settings.DEBUG or insecure_serving):
            return ASGIStaticFilesHandler(get_default_application())
        else:
            return get_default_application()

    def log_action(self, protocol, action, details):
        """
        Logs various different kinds of requests to the console.
        """
        # HTTP requests
        if protocol == "http" and action == "complete":
            msg = "HTTP %(method)s %(path)s %(status)s [%(time_taken).2f, %(client)s]"

            # Utilize terminal colors, if available
            if 200 <= details["status"] < 300:
                # Put 2XX first, since it should be the common case
                logger.info(self.style.HTTP_SUCCESS(msg), details)
            elif 100 <= details["status"] < 200:
                logger.info(self.style.HTTP_INFO(msg), details)
            elif details["status"] == 304:
                logger.info(self.style.HTTP_NOT_MODIFIED(msg), details)
            elif 300 <= details["status"] < 400:
                logger.info(self.style.HTTP_REDIRECT(msg), details)
            elif details["status"] == 404:
                logger.warning(self.style.HTTP_NOT_FOUND(msg), details)
            elif 400 <= details["status"] < 500:
                logger.warning(self.style.HTTP_BAD_REQUEST(msg), details)
            else:
                # Any 5XX, or any other response
                logger.error(self.style.HTTP_SERVER_ERROR(msg), details)

        # Websocket requests
        elif protocol == "websocket" and action == "connected":
            logger.info("WebSocket CONNECT %(path)s [%(client)s]", details)
        elif protocol == "websocket" and action == "disconnected":
            logger.info("WebSocket DISCONNECT %(path)s [%(client)s]", details)
        elif protocol == "websocket" and action == "connecting":
            logger.info("WebSocket HANDSHAKING %(path)s [%(client)s]", details)
        elif protocol == "websocket" and action == "rejected":
            logger.info("WebSocket REJECT %(path)s [%(client)s]", details)
