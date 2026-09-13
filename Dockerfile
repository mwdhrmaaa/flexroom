FROM nginx:1.25-alpine

# Copy static web assets to nginx html root
COPY . /usr/share/nginx/html

# Configure lightweight SPA routing, security headers, and aggressive asset caching
RUN printf 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    add_header X-Content-Type-Options "nosniff" always;\n\
    add_header X-Frame-Options "SAMEORIGIN" always;\n\
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
    location ~ /\\. {\n\
        deny all;\n\
        access_log off;\n\
        log_not_found off;\n\
    }\n\
    location ~* \\.(css|js|png|jpg|jpeg|gif|ico|svg|woff2)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, no-transform";\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
