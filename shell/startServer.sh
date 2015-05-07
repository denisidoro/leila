#!/bin/bash

script_dir=$(dirname $0)

if ! type "node" > /dev/null; then
	node="/cygdrive/c/Portable/Programming/CLI/NodeJS/node.exe"
else
	node="node"
fi

DEBUG=Node ${node} ${script_dir}/../Node/app.js
