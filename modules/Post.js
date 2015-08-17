var ig = require('instagram-node').instagram();
ig.use({ access_token: '1733274060.1fb234f.f33566c1baa44262843c33aaed2857ea' });
var mysql = require('../config/mysql.js');



function Posts() {
  return {
    getPostsFromIG : function(callback) {
      ig.media_popular(function(err, medias, remaining, limit) {
        if (err) {
          console.log(err);
          callback(err, null)
        }
        else if (medias.meta !== 200) {
          console.log('Error code : ' + medias.meta.code);
          callback(Error('Error code : ' + medias.meta.code), null)
        }
        else {
          callback(null, medias)
        }
      })
    },
    getPost : function(instagramPostID, callback) {
      mysql.conn.query('SELECT * FROM Instagram.posts where instagram_post_id = ?', instagramPostID, function(err, post) {
        if (err) {
          console.log(err);
          callback(err, null)
        }
        else {
          callback(null, post)
        }
      })
    },
    insertPost : function(instagramPost, user, callback) {
      var post = {};
      post.post_id = instagramPost.data.id;
      post.user_id = user.id;
      post.instagram_user_id = instagramPost.data.user.id;
      if (instagramPost.data.caption) {
        post.caption = instagramPost.data.caption.text
      }
      else {
        post.caption = null
      }
      post.filter_type = instagramPost.data.filter;
      if (instagramPost.data.likes) {
        post.likes_count = instagramPost.data.likes.count;
      }
      else {
        post.likes_count = 0;
      }
      if (instagramPost.data.comments) {
        post.comment_count = instagramPost.data.comments.count;
      }
      else {
        post.comment_count = 0;
      }
      post.score = (post.likes_count + 2 * post.comment_count) / user.followers;


      if (instagramPost.data.created_time) {
        post.created_date = new Date(instagramPost.data.created_time * 1000)
        console.log()
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
    insertPostHashtags : function(postID, HashtagID, callback) {
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