'use strict';

exports.config = {
	'app_name':    [ 'teamboard-api' ],
	'license_key': process.env.NEW_RELIC_LICENSE_KEY,
	'error_collector': {
		'ignore_status_codes': [ 400, 401, 403, 404 ],
	}
}
