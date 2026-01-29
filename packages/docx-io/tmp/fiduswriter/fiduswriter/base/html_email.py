from django.template import loader


def html_email(body_html):
    html_string = loader.render_to_string(
        "email.html", {"body_html": body_html}
    )
    return html_string
