#!/usr/bin/env node

'use strict';

const { CookieJar } = require('tough-cookie');
const cheerio = require('cheerio');
const debug = require('debug')('scraper');
const Gauge = require('gauge');
const kleur = require('kleur');
const pkg = require('./package.json');
const pMap = require('p-map');
const request = require('got').extend({
  cookieJar: new CookieJar(),
  headers: { 'user-agent': 'Mozilla/5.0' }
});

const noop = () => {};
const readVar = ($, name) => $(`#${name}`).val() || '';
const readCells = ($, $cells, keys) => $cells
  .map((_, el) => $(el).text()).get()
  .reduce((acc, value, index) => {
    const key = keys[index];
    return Object.assign(acc, { [key]: value });
  }, {});

const options = require('minimist-options')({
  help: { type: 'boolean', alias: 'h' },
  version: { type: 'boolean', alias: 'v' },
  concurrency: { type: 'number', alias: 'c', default: 16 }
});
const argv = require('minimist')(process.argv.slice(2), options);

const help = `
  ${kleur.bold(pkg.name)} v${pkg.version} - ${pkg.description}

  Usage:
    $ ${pkg.name} > data.json        # print data to file
    $ ${pkg.name} -c 24 > data.json  # set maximum number of concurrent
                                      # http requests

  Options:
    -c, --concurrency  Set number of concurrent http requests
    -h, --help         Show help
    -v, --version      Show version number

  Homepage:     ${kleur.green(pkg.homepage)}
  Report issue: ${kleur.green(pkg.bugs.url)}
`;

(async function program(flags) {
  if (flags.version) return console.log(pkg.version);
  if (flags.help) return console.log(help);
  const gauge = new Gauge();
  gauge.show('calculating row count', 0);
  const data = await fetchData(pkg.config.url, {
    concurrency: flags.concurrency,
    onprogress(value, processed, total) {
      const stats = `${processed}/${total} rows processed`;
      gauge.show(stats, value);
    }
  });
  gauge.hide();
  console.log(JSON.stringify(data, null, 2));
}(argv));

async function fetchData(url, { concurrency, onprogress = noop, ondata = noop } = {}) {
  debug('executing preflight request');
  const resp = await request.get(url);
  const $ = cheerio.load(resp.body);
  const rowCount = getRowCount($);
  debug('row count: %d', rowCount);
  const arr = Array.from({ length: rowCount });
  let processed = 0;
  return pMap(arr, async (_, index) => {
    debug('expanding row: %d', index + 1);
    const resp = await expandRow($, url, index);
    debug('parsing row: %d', index + 1);
    processed += 1;
    onprogress(processed / rowCount, processed, rowCount);
    const data = parseTable(resp.body);
    ondata(data);
    return data;
  }, { concurrency });
}

function parseTable(html) {
  const $ = cheerio.load(html);
  const $parent = $('.rgCollapse').parent();
  const institution = readCells($, $parent.nextAll('td'), [
    'title',
    'url',
    'state',
    'city',
    'carnegie'
  ]);
  const $children = $('.rgDetailTable tbody tr');
  const people = [];
  $children.each((_, el) => {
    const $cells = $(el).find('td');
    people.push(readCells($, $cells, [
      'fullName',
      'title',
      'memberType'
    ]));
  });
  return { institution, people };
}

async function expandRow($, url, index) {
  const body = getFormData($, index);
  return request.post(url, { body, form: true });
}

function getRowCount($) {
  return $('.rgExpandCol input').length;
}

function getFormData($, index = 0) {
  const __VIEWSTATE = readVar($, '__VIEWSTATE');
  const __EVENTTARGET = readVar($, '__EVENTTARGET');
  const __EVENTTARGUMENT = readVar($, '__EVENTARGUMENT');
  const ctrl = $('.rgExpandCol input').eq(index).attr('name');
  return {
    __VIEWSTATE,
    __EVENTTARGET,
    __EVENTTARGUMENT,
    [ctrl]: ''
  };
}
