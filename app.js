console.log("hi");

var ig = require('instagram-node').instagram();
var mysql = require('./config/mysql.js')

ig.use({ access_token: '1733274060.1fb234f.f33566c1baa44262843c33aaed2857ea' });


mysql.conn.query('select * from Instagram.posts', function(err, res) {
  console.log(res)
})

function postsInit() {

}