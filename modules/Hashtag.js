var ig = require('instagram-node').instagram();
ig.use({ access_token: '1733274060.1fb234f.f33566c1baa44262843c33aaed2857ea' });
var async = require('async');

var post = require('./modules/Post.js');

var mysql = require('../config/mysql.js');


function Hashtag() {
  var Hashtag = {};


  Hashtag.fight = function(hashtag, media, final_cb) {
      async.waterfall([
          function(callback) {
            Hashtag.insertHashtag(hashtag, function(err, res) {
              callback(null);
            });
          },
          function(callback) {
            Hashtag.getHashtag(hashtag, function(err, tag) {
              callback(null, tag);
            });
          },
          function(tag, callback) {
            post.getPost(media.id, function(err, media) {
              callback(null, tag, media);
            })
          },
          function(tag, media, callback) {
            post.insertPostHashtag(media.id, tag.id, function(err, res) {
              callback(null, tag, media);
            })
          },
          function(tag, media, callback) {
            var score = Hashtag.scoreHashtag(tag, media);
            callback(null, tag, score);
          },
          function(tag, score, callback) {
            Hashtag.updateHashtagScore(tag, score, function(err, res) {
              callback(null, 'done');
            })
          }
      ],
      function(err, results) {
          final_cb(results);
      });

  };

  Hashtag.hashtagInit = function(post, cb) {
    var functions = [];

    for (var i = 0; i < post.tags; i++) {
      functions.push(function(cb) { 
        fight(post.tags[i], post, cb) 
      })
    }

    async.parallel(functions, function(err, res) {
      cb();
    })
  
  };

  Hashtag.insertHashtag = function(hashtagString, callback) {
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
  };

  Hashtag.getHashtag = function (hashtagString, callback) {
    mysql.conn.query('SELECT * FROM Instagram.hashtag where hashtag = ?', hashtagString, function (err, res) {
      if (err) {
        console.log(err);
        callback(err, null)
      }
      else {
        callback(err, res[0])
      }
    })
  }

  Hashtag.scoreHashtag = function (hashtag, post) {
    var sumPostScore = hashtag.score * hashtag.timed_used;
    sumPostScore += post.score;
    return sumPostScore / (hashtag.times_used + 1)
  };

  Hashtag.updateHashtagScore = function(hashtag, score, callback) {
    mysql.conn.query('UPDATE Instagram.hashtag SET score = ?, times_used = times_used + 1 WHERE hashtag = ?', [score, hashtag],
      function(err, res){
        if (err) {
          console.log(err)
          callback(err, null)
        }
        else {
          callback(err, res)
        }
    })
  };

  return Hashtag;

}

module.exports = Hashtag();