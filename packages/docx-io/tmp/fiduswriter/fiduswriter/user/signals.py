from urllib.request import urlopen
from urllib.parse import urlparse

from django.template.defaultfilters import slugify
from django.core.files.base import ContentFile
from django.dispatch import receiver
from django.conf import settings

from avatar.models import Avatar
from allauth.account.signals import user_signed_up, email_confirmed

from user.views import invites_connect

# This file is split of from django-allauth and is licensed as:

# Copyright (c) 2010 Raymond Penners and contributors

# Permission is hereby granted, free of charge, to any person
# obtaining a copy of this software and associated documentation
# files (the "Software"), to deal in the Software without
# restriction, including without limitation the rights to use,
# copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the
# Software is furnished to do so, subject to the following
# conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
# OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
# WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
# OTHER DEALINGS IN THE SOFTWARE.


def name_from_url(url):
    """
    >>> name_from_url('http://google.com/dir/file.ext')
    u'file.ext'
    >>> name_from_url('http://google.com/dir/')
    u'dir'
    >>> name_from_url('http://google.com/dir')
    u'dir'
    >>> name_from_url('http://google.com/dir/..')
    u'dir'
    >>> name_from_url('http://google.com/dir/../')
    u'dir'
    >>> name_from_url('http://google.com')
    u'google.com'
    >>> name_from_url('http://google.com/dir/subdir/file..ext')
    u'file.ext'
    """
    p = urlparse(url)
    for base in (p.path.split("/")[-1], p.path, p.netloc):
        name = ".".join([s for s in map(slugify, base.split(".")) if s])
        if name:
            return name


def copy_avatar(request, user, account):
    url = account.get_avatar_url()
    if url:
        ava = Avatar(user=user)
        ava.primary = Avatar.objects.filter(user=user).count() == 0
        try:
            content = urlopen(url).read()
            name = name_from_url(url)
            ava.avatar.save(name, ContentFile(content))
        except OSError:
            # Let's not make a big deal out of this...
            pass


@receiver(user_signed_up)
def on_user_signed_up(sender, request, user, *args, **kwargs):
    sociallogin = kwargs.get("sociallogin")
    if sociallogin:
        copy_avatar(request, sociallogin.account.user, sociallogin.account)
        invites_connect(sociallogin.account.user)
    if settings.ACCOUNT_EMAIL_VERIFICATION != "mandatory":
        invites_connect(user)


@receiver(email_confirmed)
def on_email_confirmed(sender, request, email_address, *args, **kwargs):
    invites_connect(email_address.user)
