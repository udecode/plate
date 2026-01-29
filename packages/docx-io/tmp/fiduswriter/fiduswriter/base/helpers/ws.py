from urllib.parse import urlparse


def get_url_base(origin, conn):

    # Determine the expected values based on conn

    if isinstance(conn, int) and conn > 0:
        # conn is a port: expect origin's host and conn's port
        # Parse the origin URL (hostname and port)
        parsed_origin = urlparse(origin)
        origin_name = parsed_origin.hostname
        return f"{origin_name}:{conn}/ws"

    elif isinstance(conn, dict) and "external" in conn:
        # conn is a dict of type:
        # {"internal": 8000, "external": 9000}
        # or
        # {"internal": 8000, "external": "ws1.fiduswriter.com"}
        if isinstance(conn["external"], str):
            return f"{conn["external"]}/ws"
        elif isinstance(conn["external"], int):
            parsed_origin = urlparse(origin)
            origin_name = parsed_origin.hostname
            return f"{origin_name}:{conn['external']}/ws"

    return "/ws"
