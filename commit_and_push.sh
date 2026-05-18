#!/bin/bash

# Remove old files if they exist (Go and React structures)
rm -rf main.go go.mod templates static src package.json vite.config.js node_modules package-lock.json

# Initialize Git if not already done
git init
git config --local user.email "mwdhrmaaa@gmail.com"
git config --local user.name "mwdhrmaaa"
git branch -M devv
git remote add origin https://github.com/mwdhrmaaa/flexroom.git

# Add new files one by one with English commit messages
git add index.html
git commit -m "feat: add static index html"

git add css/style.css
git commit -m "style: add static css design system"

git add js/main.js
git commit -m "feat: add static js with localstorage support"

git push -u origin devv -f
