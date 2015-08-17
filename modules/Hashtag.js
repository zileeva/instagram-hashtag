var ig = require('instagram-node').instagram();
ig.use({ access_token: '1733274060.1fb234f.f33566c1baa44262843c33aaed2857ea' });
var async = require('async');

var Post = require('./Post.js');

var mysql = require('../config/mysql.js');


function Hashtag() {
  var Hashtag = {};


  Hashtag.fight = function(hashtag, media, final_cb) {
    console.log(hashtag, 'text')
      async.waterfall([
          function(callback) {
            Hashtag.insertHashtag(hashtag, function(err, res) {
              if (err) {
                console.log(err);
                callback(err)
              }
              else {
                callback(null);
              }
            });
          },
          function(callback) {
            Hashtag.getHashtag(hashtag, function(err, tag) {
              if (err) {
                console.log(err);
                callback(err)
              }
              else {
                callback(null, tag);
              }
            });
          },
          function(tag, callback) {
            Post.getPost(media.id, function(err, media) {
              if (err) {
                console.log(err);
                callback(err)
              }
              else {
                callback(null, tag, media);
              }
            })
          },
          function(tag, media, callback) {
            Post.insertPostHashtag(media.id, tag.id, function(err, res) {
              if (err) {
                console.log(err);
                callback(err)
              }
              else {
                callback(null, tag, media);
              }
            })
          },
          function(tag, media, callback) {
            var score = Hashtag.scoreHashtag(tag, media);
            Hashtag.updateHashtagScore(tag, score, function(err, res) {
              if (err) {
                console.log(err);
                callback(err)
              }
              else {
                callback(null, tag);
              }
            })
          }
      ],
      function(err, results) {
          final_cb(err, results);
      });

  };

  Hashtag.hashtagInit = function(post, final_cb) {
    var functions = [];
      post.tags.forEach(function(hashtag) {
        functions.push(function(cb) {
          Hashtag.fight(hashtag, post, cb)
        })
      })

    async.parallel(functions, function(err, res) {
      if (err) {
        final_cb(err, null)
      }
      else {
        final_cb(null, res)
      }
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
    mysql.conn.query('SELECT * FROM Instagram.hashtags where hashtag = ?', hashtagString, function (err, res) {
      if (err) {
        console.log(err);
        callback(err, null)
      }
      else if (res.length == 0) {
        console.log(Error('no hashtag found'));
       callback(Error('no hashtag found'), null);
      }
      else {
        callback(err, res[0])
      }
    })
  }

  Hashtag.scoreHashtag = function (hashtag, post) {
    var sumPostScore = hashtag.score * hashtag.times_used;
    sumPostScore += post.score;
    return sumPostScore / (hashtag.times_used + 1)
  };

  Hashtag.updateHashtagScore = function(hashtag, score, callback) {
    mysql.conn.query('UPDATE Instagram.hashtags SET score = ?, times_used = times_used + 1 WHERE hashtag = ?', [score, hashtag.hashtag],
      function(err, res){
        if (err) {
          console.log(err);
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