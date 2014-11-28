#!/bin/bash

curl -sL https://deb.nodesource.com/setup | sudo bash -

apt-get update
apt-get install -y git nodejs build-essential
apt-get install -y redis-server mongodb-server

npm install -g gulp
