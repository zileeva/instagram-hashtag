var ig = require('instagram-node').instagram();
ig.use({ access_token: '1733274060.1fb234f.f33566c1baa44262843c33aaed2857ea' });
var mysql = require('../config/mysql.js');



function Posts() {
  return {

    getPostsByLocations : function(callback) {
      /* OPTIONS: { [min_timestamp], [max_timestamp], [distance] }; */
      var options = {distance: 5000};
      ig.media_search(42.340013, -71.089161, [options], function(err, medias, remaining, limit) {
        if (err) {
          console.log(err);
          callback(err, null);
        } else {
          callback(null, medias);
        }
      });
    },
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
    },
    getPost : function(instagramPostID, callback) {
      mysql.conn.query('SELECT * FROM Instagram.posts WHERE post_id = ?', instagramPostID, function(err, post) {
        if (err) {
          console.log(err);
          callback(err, null)
        }
        else {
          callback(null, post[0])
        }
      })
    },
    insertPost : function(instagramPost, user, callback) {
      var post = {};
      post.post_id = instagramPost.id;
      post.user_id = user.id;
      post.instagram_user_id = instagramPost.user.id;
      if (instagramPost.caption == null) {
        post.caption = null
      }
      else {
        post.caption = instagramPost.caption.text
      }
      post.filter_type = instagramPost.filter;
      if (instagramPost.likes) {
        post.likes_count = instagramPost.likes.count;
      }
      else {
        post.likes_count = 0;
      }
      if (instagramPost.comments) {
        post.comment_count = instagramPost.comments.count;
      }
      else {
        post.comment_count = 0;
      }
      post.score = (post.likes_count + 2 * post.comment_count) / user.followers;


      if (instagramPost.created_time) {
        post.created_date = new Date(instagramPost.created_time * 1000)
      }
      else {
        post.created_date = null
      }
      mysql.conn.query('INSERT IGNORE INTO Instagram.Posts SET ?;', post, function(err, res) {
        if (err) {
          console.log(err);
          callback(err, null)
        }
        else {
          callback(null, res)
        }
      })

    },
    insertPostHashtag : function(postID, HashtagID, callback) {
      mysql.conn.query('INSERT IGNORE INTO Instagram.post_hashtags ' +
      '(post_id,hashtag_id) VALUES (?,?)', [postID, HashtagID], function(err, res) {
        if (err) {
          console.log(err);
          callback(err, null)
        }
        else {
          callback(null, res)
        }
      })
    }
  }
}

module.exports = Posts();