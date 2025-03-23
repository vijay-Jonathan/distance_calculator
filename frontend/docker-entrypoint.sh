#!/bin/sh

# Set nginx environment variable from React environment variable
export BACKEND_URL=$REACT_APP_BACKEND_URL

# Replace environment variables in nginx config
envsubst '$BACKEND_URL' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g 'daemon off;'
