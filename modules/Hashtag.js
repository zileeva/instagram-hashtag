
var ig = require('instagram-node').instagram();
ig.use({ access_token: '1733274060.1fb234f.f33566c1baa44262843c33aaed2857ea' });
var async = require('async');

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
    }
    hashtagInit : function(post) {
        for (var i = 0; i < post.tags; i++) {
          var hashtag = post.tags[i];
          fight(hashtag);
        }
    }
  }
}

module.exports = Hashtag();