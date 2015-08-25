

var mysql = require('./config/mysql.js');
var post = require('./modules/Post.js');
var hashtag = require('./modules/Hashtag.js');
var user = require('./modules/User.js');
var async = require('async');

// to run node app.js

/**
 * Gets the user either from Instagram or our database depending on
 * whether we have previously made an insert
 * @param instagramUserID instagram user id
 * @param callback callback
 */
function getUser(instagramUserID, callback) {
	user.getUser(instagramUserID, function(err, res) {
		if (res) {
			callback(null, res);
		} else {
			user.getUserFromIG(instagramUserID, function(err, res) {
				if (err) {
					callback(err, null);
				} else {
					user.insertUser(res, function(err, res) {
    					if (err) {
    						console.log(err);
    						callback(err, null);
    					} else {
                user.getUser(instagramUserID, function(err, res) {
    							if (err) {
    								console.log(err);
    								callback(err, null);
    							} else {
    								callback(null, res);
    							}
    						})
    					}
					})
				}
				
			})
		}
	})
};

/**
 * Main function to get user, insert/score the post and insert/score hashtag
 * @param instagramPost Instagram post
 * @param callback callback
 */
function control(instagramPost, callback) {
	async.waterfall([
	    function(callback) {
	    	getUser(instagramPost.user.id, function(err, user) {
	    		if (err) {
            callback(err, null);
	    			console.log(err);
	    		} else {
	    			callback(null, user);
	    		}	
	    	})	        
	    },
	    function(user, callback) {
	      	post.insertPost(instagramPost, user, function(err, res) {
	      		if (err) {
              callback(err, null);
	      			console.log(err);
	      		} else {
	      			callback(null);
	      		}
	      	})
	    },
	    function(callback) {
	    	hashtag.hashtagInit(instagramPost, function(err, hashtag) {
	    		if (err) {
            callback(err, null);
	      			console.log(err);
	      		} else {
	      			callback(null, hashtag);
	      		}
	    	})
	    }
	], function (err, result) {
	    callback(err, result);
	});

}

/**
 * main function to call to get new posts as well as display the top hashtags
 * (Asynchronously)
 */
function postsInit() {
  post.getPostsByLocations(function (err, res) {
    if (err) {
      console.log("ERROR");
      console.log(err);
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
