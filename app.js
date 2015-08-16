console.log("hi");

var mysql = require('./config/mysql.js')

var post = require('./modules/Post.js')



mysql.conn.query('select * from Instagram.posts', function(err, res) {
  console.log(res)
})

function postsInit() {
  post.getPostsFromIG(function(err, res){
    console.log(res)
  })
}

postsInit()