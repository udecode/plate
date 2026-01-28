from django.shortcuts import render


def index(request):
    response = {}
    return render(
        request, "browser_check/browser_not_supported.html", response
    )
