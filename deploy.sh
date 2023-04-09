#!/bin/bash

read -p "Do you want deploy? (y/n) " yn

case $yn in
    y ) echo Deploying...;;
    n ) echo Exiting...;
        exit;;
    * ) echo Invalid response;
        exit 1;;
esac

scp server.js kannatan:app/server.js
scp party.js kannatan:app/party.js
scp utils.js kannatan:app/utils.js
scp package.json kannatan:app/package.json
scp index.html kannatan:app/index.html
scp app.html kannatan:app/app.html
scp about.html kannatan:app/about.html
scp -r static/* kannatan:app/static/
scp -r phrases/* kannatan:app/phrases/