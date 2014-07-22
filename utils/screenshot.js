/**
 * Utility for taking a screenshot of a dummy board generated with Jade
 * templates.
 *
 * @module  utils/screenshot
 */

'use strict';


var jade    = require('jade');
var webshot = require('webshot');

module.exports = function(filename, tickets, callback) {

	var config = require('../config');

	jade.renderFile(config.staticContent.template, { tickets: tickets },
		function (err, html) {

			if(err) {
				return callback(err);
			}

			var zoomFactor = 0.25;

			var options = {
				siteType:   'html',
				zoomFactor: zoomFactor,

				shotSize: {
					width:  800 * zoomFactor,
					height: 480 * zoomFactor
				}
			}

			var dest = config.staticContent.dir + filename + '.png';

			webshot(html, dest, options, function(err) {

				if(err) {
					return callback(err);
				}

				return callback(null, dest);
			});
		});
}
