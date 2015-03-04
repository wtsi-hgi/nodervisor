/*
 * GET downloadctl page.
 */

exports.ajax_supervisorctl = function(params) {
	var config = params.config;
	var supervisordapi = params.supervisordapi;

	return function(req, res) {

		if (!req.session.loggedIn) {
			res.send({error: 'Not logged in'});
		} else {
			if (req.session.user.Role != 'Admin') {
				res.send({error: 'Incorrect Priviledges!'});
				return false;
			} else {
				var host = req.param('host');
				var process = req.param('process');
				var action = req.param('action');

				if (config.hosts[host] !== undefined) {
					var supclient = supervisordapi.connect(config.hosts[host].Url);
					switch (action) {
						case 'stop': {
							supclient.stopProcess(process, function(){
								res.send({result: 'success'});
							});
						}
						break;
						case 'start': {
							supclient.startProcess(process, function(){
								res.send({result: 'success'});
							});
						}
						break;
						case 'restartAll': {
							supclient.stopAllProcesses(true, function(){
								supclient.startAllProcesses(true, function(){
									res.send({result: 'success'});
								});
							});
						}
						break;
					}
				} else {
					res.send({result: 'error', message: 'Host not found'});
				}
			}
		}
	};
};
