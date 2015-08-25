var ig = require('instagram-node').instagram();
ig.use({ access_token: '1733274060.1fb234f.f33566c1baa44262843c33aaed2857ea' });

var async = require('async');
var Post = require('./Post.js');
var mysql = require('../config/mysql.js');

/**
 * Hashtag object to represent a Hashtag
 */
function Hashtag() {
  var Hashtag = {};
  /**
   * main function to insert the hashtag and update is score based on the post score
   * @param hashtag instagram hashtag
   * @param instagramPost instagram post
   * @param callback callback
   */
  Hashtag.upsertHashtagScore = function(hashtag, instagramPost, callback) {
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
            Post.getPost(instagramPost.id, function(err, media) {
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
                callback(null, tag, media, res.affectedRows);
              }
            })
          },
          function(tag, media, affectedRows, callback) {

            if (affectedRows === 0) {
              callback(null, tag)
            } else {
              var score = Hashtag.scoreHashtag(tag, media);
              Hashtag.updateHashtagScore(tag, score, function (err, res) {
                if (err) {
                  console.log(err);
                  callback(err)
                }
                else {
                  callback(null, tag);
                }
              })
            }
          }
      ],
      function(err, results) {
          callback(err, results);
      });

  };

  /**
   * scores each hashtag in the Instagram Post
   * @param instagramPost Instagram Post
   * @param callback callback
   */
  Hashtag.hashtagInit = function(instagramPost, callback) {
    var functions = [];
      instagramPost.tags.forEach(function(hashtag) {
        functions.push(function(cb) {
          Hashtag.upsertHashtagScore(hashtag, instagramPost, cb)
        })
      })

    async.parallel(functions, function(err, res) {
      if (err) {
        callback(err, null)
      }
      else {
        callback(null, res)
      }
    })
  
  };

  /**
   * inserts the hashtag for the first time if not already in the DB otherwise
   * do nothing
   * @param hashtagString hashtag
   * @param callback callback
   */
  Hashtag.insertHashtag = function(hashtagString, callback) {
      var hashtag = {};
      hashtag.hashtag = hashtag;
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

  /**
   * gets a hashtag based on the hashtag from the DB
   * @param hashtagString hashtag
   * @param callback callback
   */
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

  /**
   * scores a Hashtag based on a given post score (post score / hashtag times used)
   * @param hashtag hashtag
   * @param post post
   * @returns {number} score
   */
  Hashtag.scoreHashtag = function (hashtag, post) {
    var sumPostScore = hashtag.score * hashtag.times_used;
    sumPostScore += post.score;
    return sumPostScore / (hashtag.times_used + 1)
  };

  /**
   * updates the hastag with the score
   * @param hashtag hashtag
   * @param score score
   * @param callback callback
   */
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

  /**
   * returns the top 10 hashtags currently in the DB
   * @param callback
   */
  Hashtag.topHashtags = function(callback) {
    mysql.conn.query('SELECT hashtag, score FROM Instagram.hashtags  ORDER BY score  DESC LIMIT 10', function(err, res){
      if (err) {
        console.log(err);
        callback(err, null)
      }
      else {
        callback(err, res)
      }
    })
  };

  /**
   * returns the top 10 or less hashtags currently in the DB
   * used at least the amount times given
   * @param minUsedTimes minimum times used for a hashtag
   * @param callback callback
   */
  Hashtag.topHashtagsMinUsedTimes = function(minUsedTimes, callback) {
    mysql.conn.query('SELECT hashtag, score, times_used FROM Instagram.hashtags WHERE times_used > ? ORDER BY score DESC LIMIT 10', minUsedTimes,
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