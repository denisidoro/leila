#!/bin/bash

script_dir=$(dirname $0)

cp ${script_dir}/../Node/node_modules/changes/johnny-five/node_modules/firmata/lib/firmata.js ${script_dir}/../Node/node_modules/johnny-five/node_modules/firmata/lib/firmata.js
cd ${script_dir}/../Node
npm install
bower install
cd node_modules/johnny-five
npm install
cd ${script_dir}/..