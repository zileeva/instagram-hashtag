
var ig = require('instagram-node').instagram();
ig.use({ access_token: '1733274060.1fb234f.f33566c1baa44262843c33aaed2857ea' });
var async = require('async');
var post = require('./modules/Post.js');

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

  return Hashtag;
}

module.exports = Hashtag();