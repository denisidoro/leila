#!/bin/bash

script_dir=$(dirname $0)

if ! type "node" > /dev/null; then
	node="/cygdrive/c/Portable/Programming/Node/node.exe"
else
	node="node"
fi

clear
DEBUG=Node ${node} ${script_dir}/../Node/app.js
