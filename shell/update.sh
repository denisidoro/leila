#!/bin/bash

script_dir=$(dirname $0)

cd ${script_dir}/../Node
npm install --save bower
npm install
bower install
cd node_modules/johnny-five
npm install
cp ${script_dir}/../Node/node_modules/changes/johnny-five/node_modules/firmata/lib/firmata.js ${script_dir}/../Node/node_modules/johnny-five/node_modules/firmata/lib/firmata.js
cd ${script_dir}/..
