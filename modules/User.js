var ig = require('instagram-node').instagram();
ig.use({ access_token: '1733274060.1fb234f.f33566c1baa44262843c33aaed2857ea' });
var async = require('async');

function User() {
  return {
  	getUserFromIG : function(user_id, cb) {
  		ig.user('user_id', function(err, result, remaining, limit) {
  			if (err) {
  				console.log("Error while getting user information from Instagram: ", err);
  				cb(err, null);
  			} else {
  				cb(null, result);
  			}
  		});
  	},

    getUser : function(user_id, cb) {
    	getUserFromDb(user_id, function(err, res) {
    		if (res) {
    			console.log("Got user from DB: ", err, res);
    			cb(null, res);
    		} else {
    			getUserFromIG(user_id, function(err, res) {
    				console.log("Got user from IG: ", res);
    				if (err) {
    					cb(err, null);
    				} else {
    					insertUser(res, function(err, res) {
	    					if (err) {
	    						console.log(err);
	    						cb(err, null);
	    					} else {
	    						getUserFromDb(user_id, function(err, res) {
	    							console.log("Got user from DB: ", err, res);
	    							if (err) {
	    								console.log(err);
	    								cb(err, null);
	    							} else {
	    								cb(null, res);
	    							}
	    						})
	    					}
    					})
    				}
    				
    			})
    		}
    	})
    }
  }
}

module.exports = User();