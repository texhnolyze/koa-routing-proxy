'use strict';

const urlParser = require('url');
const requestPromise = require('request-promise');
const proxy = require('./lib/proxy')({ urlParser, requestPromise });

module.exports = proxy;
