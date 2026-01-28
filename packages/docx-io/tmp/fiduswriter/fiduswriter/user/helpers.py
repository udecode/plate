from django.conf import settings
import asyncio
from avatar.utils import get_username
from avatar.providers import PrimaryAvatarProvider


class Avatars:
    def __init__(self):
        self.AVATARS = {}
        self.lock = (
            asyncio.Lock()
        )  # Add a lock for thread safety in async context

    def get_url(self, user):
        """Synchronous method to get avatar URL"""
        if user.id not in self.AVATARS:
            username = get_username(user)
            self.AVATARS[user.id] = PrimaryAvatarProvider.get_avatar_url(
                username, settings.AVATAR_DEFAULT_SIZE
            )
        return self.AVATARS[user.id]

    async def get_url_async(self, user):
        """Asynchronous method to get avatar URL with proper locking"""
        # If avatar is already cached, return it immediately
        if user.id in self.AVATARS:
            return self.AVATARS[user.id]

        # Use lock to prevent multiple concurrent operations for the same user
        async with self.lock:
            # Check again in case another task added it while we were waiting
            if user.id in self.AVATARS:
                return self.AVATARS[user.id]

            # Attempt to get username from user object without DB access if possible
            if hasattr(user, "username") and user.username:
                username = user.username
            else:
                # Fall back to the get_username function which might access DB
                from asgiref.sync import sync_to_async

                username = await sync_to_async(get_username)(user)

            # For avatar URL generation
            if hasattr(PrimaryAvatarProvider, "get_avatar_url_async"):
                # Use async version if available
                avatar_url = await PrimaryAvatarProvider.get_avatar_url_async(
                    username, settings.AVATAR_DEFAULT_SIZE
                )
            else:
                # Fall back to sync version
                from asgiref.sync import sync_to_async

                avatar_url = await sync_to_async(
                    PrimaryAvatarProvider.get_avatar_url
                )(username, settings.AVATAR_DEFAULT_SIZE)

            self.AVATARS[user.id] = avatar_url
            return avatar_url
