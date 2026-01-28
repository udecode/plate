import atexit

from base.models import Presence
from base.base_consumer import BaseWebsocketConsumer


class SystemMessageConsumer(BaseWebsocketConsumer):
    clients = []

    async def connect(self):
        if not await super().connect():
            return
        SystemMessageConsumer.clients.append(self)
        headers = dict(self.scope["headers"])
        user_agent = headers.get(b"user-agent", b"").decode("utf-8")
        if user_agent == "Fidus Writer":
            return
        host = headers.get(b"host", b"").decode("utf-8")
        origin = headers.get(b"origin", b"").decode("utf-8")
        protocol = "wss://" if origin.startswith("https") else "ws://"

        # Create presence asynchronously
        self.presence = await Presence.objects.acreate(
            user=self.user,
            server_url=protocol + host + self.scope["path"],
        )

    async def disconnect(self, close_code):
        if hasattr(self, "presence"):
            await self.presence.adelete()
        if self in SystemMessageConsumer.clients:
            SystemMessageConsumer.clients.remove(self)
        await self.close()

    async def send_pong(self):
        if hasattr(self, "presence"):
            await self.presence.asave()
        await super().send_pong()

    async def handle_message(self, message):
        if message["type"] == "system_message":
            for client in SystemMessageConsumer.clients:
                await client.send_message(message)


def remove_all_presences():
    # Removing all presences connected to this server
    for client in SystemMessageConsumer.clients:
        if hasattr(client, "presence"):
            client.presence.delete()

    SystemMessageConsumer.clients = []


atexit.register(remove_all_presences)
