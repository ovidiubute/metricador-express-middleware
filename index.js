/*
 * The MIT License (MIT)
 * Copyright (c) 2016 Ovidiu Bute ovidiu.bute@gmail.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 *  and associated documentation files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom
 * the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

"use strict";

var metricador = require('metricador');
var util = require('util');
var url = require('url');

/**
 * Metricador Express Middleware entry point
 * @param {object} [options] Configuration options
 * @param {string} [options.namespace] A namespace for application metrics. This will be the prefix to all metrics
 * registered. Defaults to 'myexpressapp'.
 * @param {object} [options.reporter] A Metricador Reporter instance to publish the app metrics. Defaults to a basic
 * reporter that outputs all metrics to the console every 30 seconds.
 * @return {Function} Middleware function
 */
function getMiddleware(options) {
    var defaultOptions = {
        namespace: 'myexpressapp'
    };
    var opts = options || {};
    if (!opts.namespace) {
        opts.namespace = defaultOptions.namespace;
    }
    if (!opts.reporter) {
        opts.reporter = new metricador.Reporter([
            metricador.publishers.console.json.get(metricador.registry)
        ])
    }

    // Start the Reporter if it's not already running
    if (!opts.reporter.isRunning()) {
        opts.reporter.start();
    }

    return function _middleware(req, res, next) {
        var startAt = process.hrtime();
        var path = url.parse(req.url).pathname;

        function updateHistogram() {
            res.removeListener("finish", updateHistogram);
            res.removeListener("close", updateHistogram);

            var diff = process.hrtime(startAt);
            var time = diff[0] * 1e3 + diff[1] * 1e-6;

            var histogram = metricador.registry.histogram(constructMetricName(opts.namespace, path));
            histogram.update(time);
        }

        res.on("finish", updateHistogram);
        res.on("close", updateHistogram);

        next();
    }
}

function constructMetricName(namespace, path) {
    return util.format('%s.path.%s.responseTime', namespace, path);
}

module.exports = getMiddleware;