#!/bin/bash

script_dir=$(dirname $0)

cd ${script_dir}/../Node
npm install --save bower
npm install
bower install
cd node_modules/dynanode
npm install
cd ${script_dir}/../
