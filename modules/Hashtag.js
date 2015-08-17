
var ig = require('instagram-node').instagram();
ig.use({ access_token: '1733274060.1fb234f.f33566c1baa44262843c33aaed2857ea' });
var async = require('async');
var mysql = require('../config/mysql.js');

function Hashtag() {
  return {
    fight : function(hashtag, final_cb) {
      async.series({
          insertHashtag: function(callback){
              insertHashtag(hashtag, callback);
          },
          getHashtag: function(callback){
              getHashtag(hashtag, callback)
          }
      },
      function(err, results) {
          final_cb(results);
      });
    },
    hashtagInit : function(post) {
        for (var i = 0; i < post.tags; i++) {
          var hashtag = post.tags[i];
          fight(hashtag);
        }
    },
    insertHashtag : function(hashtagString, callback) {
      var hashtag = {};
      hashtag.hashtag = hashtagString;
      hashtag.times_used = 0;
      hashtag.score = 0;
      mysql.conn.query('INSERT IGNORE INTO Instagram.hashtags SET ?', hashtag, function(err, res) {
        if (err) {
          console.log(err)
          callback(err, null)
        }
        else {
          callback(err, res)
        }
      })

    }

  }
}

module.exports = Hashtag();