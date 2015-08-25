

var mysql = require('./config/mysql.js');
var post = require('./modules/Post.js');
var hashtag = require('./modules/Hashtag.js');
var user = require('./modules/User.js');
var async = require('async');



function getUser(user_id, cb) {
	user.getUser(user_id, function(err, res) {
		if (res) {
			cb(null, res);
		} else {
			user.getUserFromIG(user_id, function(err, res) {
				if (err) {
					cb(err, null);
				} else {
					user.insertUser(res, function(err, res) {
    					if (err) {
    						console.log(err);
    						cb(err, null);
    					} else {
                user.getUser(user_id, function(err, res) {
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
};

function control(media, final_cb) {
	async.waterfall([
	    function(callback) {
	    	getUser(media.user.id, function(err, user) {
	    		if (err) {
            callback(err, null);
	    			console.log(err);
	    		} else {
	    			callback(null, user);
	    		}	
	    	})	        
	    },
	    function(user, callback) {
	      	post.insertPost(media, user, function(err, res) {
	      		if (err) {
              callback(err, null);
	      			console.log(err);
	      		} else {
	      			callback(null);
	      		}
	      	})
	    },
	    function(callback) {
	    	hashtag.hashtagInit(media, function(err, hashtag) {
	    		if (err) {
            callback(err, null);
	      			console.log(err);
	      		} else {
	      			callback(null, hashtag);
	      		}
	    	})
	    }
	], function (err, result) {
	    final_cb(err, result);
	});

}
function postsInit() {
  post.getPostsByLocations(function (err, res) {
    if (err) {
      console.log("ERROR");
    } else {
      for (var i = 0; i < res.length; i++) {
        if (res[i].tags.length > 0) {
          control(res[i], function (err, res) {
            if (err) {
              console.log(err)
              throw err
            }
          })
        }
        else {
          console.log('no tags')
        }
      }
      console.log('top hashtags')
        hashtag.topHashtags(function(err, results) {
          if (err) {
            throw err
          }
          else {
            console.log(results)
          }
        })

      console.log('top hashtags used at least 2 times (to remove outliers');
      hashtag.topHashtagsMinUsedTimes(2, function(err, results) {
        if (err) {
          throw err
        }
        else {
          console.log(results)
        }
      })
    }
  })
}



postsInit();
