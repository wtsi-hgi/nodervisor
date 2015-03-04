/*
 * GET/POST hosts page
 */

exports.hosts = function(params) {
	var config = params.config;
	var db = params.db;
	return function(req, res) {

		if ((!req.session.loggedIn) || (req.session.user.Role != 'Admin')) {
			res.redirect('/login');
		} else if (req.body.delete !== undefined) {
			if (req.params.idHost) {
				params.db('hosts').delete()
				.where('idHost', req.params.idHost)
				.exec(function() {
					params.config.readHosts(params.db, function(){
						res.redirect('/hosts');
					});
				});
			}
		} else if (req.body.submit !== undefined) {
			if (req.params.idHost == 'new') {
				params.db('hosts').insert({
					Name: req.body.name,
					Url: req.body.url,
					idGroup: req.body.group,
				}, 'idHost').exec(function(err, insertId){
					params.config.readHosts(params.db, function(){
						if (err !== null) {
							console.log(err);
							res.redirect('/hosts');
						} else {
							res.redirect('/host/' + insertId);
						}
					});
				});
			} else {
				var info = {
					Name: req.body.name,
					Url: req.body.url,
					idGroup: req.body.group !== 'null' ? req.body.group : 0
				};

				console.log(info);

				params.db('hosts').update(info)
				.where('idHost', req.params.idHost)
				.exec(function() {
					params.config.readHosts(params.db, function(){
						res.redirect('/host/' + req.params.idHost);
					});
				});
			}
		} else {
			var qry = params.db('hosts');

			if (req.params.idHost) {
				if (req.params.idHost == 'new') {
					qry = params.db('groups').select('idGroup', 'Name');
					qry.exec(function(err, groups){
						res.render('edit_host', {
							title: 'Nodervisor - New Host',
							host: null,
							groups: groups,
							session: req.session
						});
					});
				} else {
					qry.where('idHost', req.params.idHost)
					.exec(function(err, host){
						qry = params.db('groups').select('idGroup', 'Name');
						qry.exec(function(err, groups){
							res.render('edit_host', {
								title: 'Nodervisor - Edit Host',
								host: host[0],
								groups: groups,
								session: req.session
							});
						});
					});
				}
			} else {
				qry.join('groups', 'hosts.idGroup', '=', 'groups.idGroup', 'left')
				.select('hosts.idHost', 'hosts.Name', 'hosts.Url', 'groups.Name AS GroupName')
				.exec(function(err, hosts){
					res.render('hosts', {
						title: 'Nodervisor - Hosts',
						hosts: hosts,
						session: req.session
					});
				});
			}
		}
	};
};
