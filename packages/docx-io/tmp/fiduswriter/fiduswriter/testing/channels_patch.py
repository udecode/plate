from functools import partial
import multiprocessing

from django.test.utils import modify_settings
from django.contrib.contenttypes.models import ContentType

from channels.routing import get_default_application
from channels.testing import (
    ChannelsLiveServerTestCase as ChannelsLiveServerTestCaseBase,
)
from channels.testing.live import set_database_connection

# Modifications to get around https://github.com/django/channels/issues/2208 until fixed.

_server_command_queue = None


def clear_contenttype_cache():
    ContentType.objects.clear_cache()


def make_application(*, static_wrapper, commands={}):
    # Module-level function for pickle-ability
    application = get_default_application()
    # Wrap the application with our command processing middleware
    application = ServerCommandMiddleware(application, commands)
    if static_wrapper is not None:
        application = static_wrapper(application)
    return application


class ServerCommandMiddleware:
    """
    Middleware that processes commands from the test process.
    This is automatically added to the ASGI application in test mode.
    """

    def __init__(self, app, commands):
        self.app = app
        self.commands = commands

    async def __call__(self, scope, receive, send):
        # Process any pending server commands before handling the request
        self.process_server_commands()
        return await self.app(scope, receive, send)

    def process_server_commands(self):
        global _server_command_queue
        if _server_command_queue is None:
            return

        while not _server_command_queue.empty():
            command = _server_command_queue.get_nowait()
            if command in self.commands:
                self.commands[command]()


class ChannelsLiveServerTestCase(ChannelsLiveServerTestCaseBase):
    commands = {"clear_contenttype_cache": clear_contenttype_cache}

    @classmethod
    def setUpClass(cls):
        global _server_command_queue

        # for connection in connections.all():
        #     if cls._is_in_memory_db(connection):
        #         raise ImproperlyConfigured(
        #             "ChannelLiveServerTestCase can not be used with in memory databases"
        #         )

        super(ChannelsLiveServerTestCaseBase, cls).setUpClass()

        cls._live_server_modified_settings = modify_settings(
            ALLOWED_HOSTS={"append": cls.host}
        )
        cls._live_server_modified_settings.enable()

        # Create a command queue for communication with the server process
        _server_command_queue = multiprocessing.Queue()
        cls._server_command_queue = _server_command_queue

        get_application = partial(
            make_application,
            static_wrapper=cls.static_wrapper if cls.serve_static else None,
            commands=cls.commands,
        )
        cls._server_process = cls.ProtocolServerProcess(
            cls.host,
            get_application,
            setup=set_database_connection,
        )
        cls._server_process.start()
        while True:
            if not cls._server_process.ready.wait(timeout=1):
                if cls._server_process.is_alive():
                    continue
                raise RuntimeError("Server stopped") from None
            break
        cls._port = cls._server_process.port.value

    def setUp(self):
        super().setUp()
        self.run_server_command("clear_contenttype_cache")

    def run_server_command(self, command):
        """
        Add command to server command queue.
        """
        if hasattr(self.__class__, "_server_command_queue"):
            self._server_command_queue.put(command)
