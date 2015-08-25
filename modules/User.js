var ig = require('instagram-node').instagram();
ig.use({ access_token: '1733274060.1fb234f.f33566c1baa44262843c33aaed2857ea' });
var async = require('async');
var mysql = require('../config/mysql.js');

/**
 * A User Object to represent an Instagram User
 */
function User() {

  return {
    /**
     * gets the user from the Instagram API
     * @param instagramUserId instagram User ID
     * @param callback callback
     */
  	getUserFromIG : function(instagramUserId, callback) {
  		ig.user(instagramUserId, function(err, result, remaining, limit) {
  			if (err) {
  				console.log("Error while getting user information from Instagram: ", err);
  				callback(err, null);
  			} else {
  				callback(null, result);
  			}
  		});
  	},

    /**
     * gets User from the DB
     * @param instagramUserId instagram user id
     * @param callback callback
     */
    getUser : function(instagramUserId, callback) {
      mysql.conn.query('SELECT * FROM Instagram.users where instagram_user_id = ?', [instagramUserId], function(err, user){
        if (err) {
          console.log(err);
          callback(err, null)
        }
        else if(user.length == 0) {
          callback(null, null)
        }
        else {
          callback(null, user[0])
        }
      })
    },

    /**
     * Inserts the user in the DB for the first time
     * @param instagramUser Instagram User Object
     * @param callback callback
     */
    insertUser : function(instagramUser, callback) {
      var user = {};
      user.instagram_user_id = instagramUser.id;
      if (instagramUser.bio == '' || instagramUser.bio === undefined) {
        user.bio = null
      }
      else {
        user.bio = instagramUser.bio;
      }
      if (instagramUser.full_name == '' || instagramUser.full_name === undefined) {
        user.full_name = null
      }
      else {
        user.full_name = instagramUser.full_name;
      }
      user.followers = instagramUser.counts.followed_by;
      user.following = instagramUser.counts.follows;
      user.username = instagramUser.username;

      mysql.conn.query('INSERT IGNORE Instagram.users set ?', [user], function(err, user){
        if (err) {
          console.log(err);
          callback(err, null)
        }
        else {
          callback(null, user[0])
        }
      })
    }

  }

}

module.exports = User();