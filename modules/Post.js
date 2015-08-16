
var ig = require('instagram-node').instagram();
ig.use({ access_token: '1733274060.1fb234f.f33566c1baa44262843c33aaed2857ea' });

function Posts() {
  return {
    getPostsFromIG : function(callback) {
      ig.media_popular(function(err, medias, remaining, limit) {
        if (err) {
          console.log(err);
          callback(err, null)
        }
        else {
          callback(null, medias)
        }
      })
    }
  }
}

module.exports = Posts();