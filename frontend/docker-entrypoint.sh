#!/bin/sh

# Replace environment variables in nginx config
envsubst '$REACT_APP_BACKEND_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g 'daemon off;'
