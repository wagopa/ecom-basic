#!/bin/sh
set -e

# If API_BASE_URL is provided by docker-compose, bake it into config.js so
# the browser knows where to reach the backend. Otherwise the default
# value already committed in config.js (http://localhost:8080/api) is used
# as-is — this keeps "just open index.html in a browser" working too.
if [ -n "$API_BASE_URL" ]; then
  echo "window.API_BASE_URL = \"$API_BASE_URL\";" > /usr/share/nginx/html/js/config.js
  echo "==> frontend: API_BASE_URL set to $API_BASE_URL"
fi

exec nginx -g "daemon off;"
