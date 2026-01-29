import os
import shelve
import time

from django.core.mail.backends.base import BaseEmailBackend
from django.conf import settings

import logging

logger = logging.getLogger(__name__)

# Source: https://github.com/jricardo27/channels_example/commit/637b689870c2f879286f30eeb0c3e1d65283d557#diff-180eb8ba4002fc012b871a9b0c0ba23b31727c34a20d8470421841e9e3bb637b

MAIL_STORAGE_BASE = ".test_mail_storage_"
OUTBOX = "outbox"


class EmailBackend(BaseEmailBackend):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if hasattr(settings, "MAIL_STORAGE_NAME"):
            self.mail_storage = MAIL_STORAGE_BASE + settings.MAIL_STORAGE_NAME
        else:
            self.mail_storage = MAIL_STORAGE_BASE

    def send_messages(self, messages):
        """Redirect messages to the dummy outbox"""
        logger.debug(f"send_messages: {len(messages)}")
        storage = shelve.open(self.mail_storage)
        outbox = storage.get(OUTBOX, [])
        storage.close()
        msg_count = 0
        for message in messages:  # .message() triggers header validation
            message.message()
            outbox.append(message)
            msg_count += 1
        storage = shelve.open(self.mail_storage)
        storage[OUTBOX] = outbox
        storage.close()
        logger.debug(f"Total length: {len(outbox)}")
        return msg_count


def get_outbox(mail_storage_name=None):
    time.sleep(1)
    if mail_storage_name:
        mail_storage = MAIL_STORAGE_BASE + mail_storage_name
    else:
        mail_storage = MAIL_STORAGE_BASE
    storage = shelve.open(mail_storage)
    outbox = storage.get(OUTBOX, [])
    storage.close()
    logger.info(f"Mailbox length: {len(outbox)}")
    return outbox


def empty_outbox(mail_storage_name=None):
    if mail_storage_name:
        mail_storage = MAIL_STORAGE_BASE + mail_storage_name
    else:
        mail_storage = MAIL_STORAGE_BASE
    storage = shelve.open(mail_storage)
    storage[OUTBOX] = []
    storage.close()


def delete_outbox(mail_storage_name=None):
    if mail_storage_name:
        mail_storage = MAIL_STORAGE_BASE + mail_storage_name
    else:
        mail_storage = MAIL_STORAGE_BASE
    # Clean outbox.
    try:
        os.remove(mail_storage)
    except OSError:
        pass
