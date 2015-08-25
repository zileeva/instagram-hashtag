var ig = require('instagram-node').instagram();
ig.use({ access_token: '1733274060.1fb234f.f33566c1baa44262843c33aaed2857ea' });
var mysql = require('../config/mysql.js');


/**
 *A Post Object to Represent a Post Object
 */
function Posts() {
  return {
    /**
     * gets Posts from Instagram around Boston in the last 6 days
     * @param callback callback
     */
    getPostsByLocations : function(callback) {
      /* OPTIONS: { [min_timestamp], [max_timestamp], [distance] }; */
      var today = new Date();

      var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
      var yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

      var options = {distance: 5000, max_timestamp : yesterday.getTime()/1000, min_timestamp : lastWeek.getTime()/1000};

      ig.media_search(42.340013, -71.089161, options, function(err, medias, remaining, limit) {
        console.log(err)
        if (err) {
          console.log(err);
          callback(err, null);
        } else {
          callback(null, medias);
        }
      });
    },
    /**
     * gets the most popular from Instagram currently
     * @param callback callback
     */
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
    /**
     * gets a Post from the DB
     * @param instagramPostID Instagram Post ID
     * @param callback callback
     */
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
    /**
     * Inserts Post in DB for the first time, If already present does nothing
     * @param instagramPost Instagram Post
     * @param user User Object
     * @param callback callback
     */
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

      post.score = (post.likes_count + 33 * post.comment_count) / Math.log(user.followers);


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
    /**
     * Inserts a connection between 1 hastag and the post that it belongs to
     * @param postID Post Object ID
     * @param HashtagID Hashtag Object ID
     * @param callback callback
     */
    insertPostHashtag : function(postID, HashtagID, callback) {
      mysql.conn.query('INSERT IGNORE INTO Instagram.post_hashtags ' +
      '(post_id, hashtag_id) VALUES (?,?)', [postID, HashtagID], function(err, res) {
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