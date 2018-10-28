#!/usr/bin/env bash

echo `pwd`
echo "Run from the root of the project. Executes complete re-install, followed by test run, in Node 10, 8 and 6."

set -e

. ~/.nvm/nvm.sh

rm -Rf ./node_modules
nvm use 10
npm install
npm test

rm -Rf ./node_modules
nvm use 8
npm install
npm test

rm -Rf ./node_modules
nvm use 6
npm install
npm test

rm -Rf ./node_modules
nvm use 10
npm install

set +e
