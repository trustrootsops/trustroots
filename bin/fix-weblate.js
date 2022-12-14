#!/usr/bin/env node

// Reformat JSON structure to be suitable for Weblate.
// Context https://github.com/Trustroots/trustroots/issues/1487#issuecomment-636060326

const { readFileSync, writeFileSync } = require('fs');
const isObject = require('lodash/isObject');
const first = require('lodash/first');

const filenames = process.argv.slice(2);

if (filenames.length === 0) {
  console.log('Usage: node ./bin/weblate-fix.js [filename, filename...]');
  process.exit(0);
}

for (const filename of filenames) {
  const contents = readFileSync(filename, 'utf8');
  const result = convert(JSON.parse(contents));
  writeFileSync(filename, JSON.stringify(result, null, 2) + '\n', 'utf8');
}

function convert(obj) {
  const result = {};
  for (let key of Object.keys(obj)) {
    let value = obj[key];
    if (isObject(value) && Object.keys(value).length > 1) {
      /* for plurals we receive something like:
           {
             "foo": {
               "foo._0": "No foos",
               "foo._1": "1 foo",
               "foo._plural": "{{count}} foos"
             }
           }

        and we need to turn it into

           {
             "foo._0": "No foos",
             "foo._1": "1 foo",
             "foo._plural": "{{count}} foos"
           }
      */
      for (const key2 of Object.keys(value)) {
        result[key2] = value[key2];
      }
    } else {
      // For the rest we just de-nest all the keys all the way down
      while (isObject(value)) {
        const keys = Object.keys(value);
        const firstKey = first(keys);
        value = value[firstKey];
        key = `${key}.${firstKey}`;
      }
      result[key] = value;
    }
  }
  return result;
}
