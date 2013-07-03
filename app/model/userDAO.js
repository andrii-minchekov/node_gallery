/**
 * Created with JetBrains WebStorm.
 * User: aminchekov
 * Date: 14/06/13
 * Time: 11:20
 * To change this template use File | Settings | File Templates.
 */
// Let's group our tools together
var tools = require('../lib/tools.js');

var redis = require("redis"),
    client = redis.createClient();

client.on("error", function (err) {
    console.log("error event - " + client.host + ":" + client.port + " - " + err);
});

//client.set("string key", "string val", redis.print);
//client.hset("users", "hashtest 1", "some value", redis.print);

exports.createUser = function (email, passwd, fname, lname){
    var newUserCreated = false;
    var user = {
        email: email,
        passwd: passwd,
        fname: fname,
        lname: lname
    };

    client.hget("users", email,
        function (err, reply){
            if (reply) {
                tools.log("User " + email + " already exist");

            } else {
                client.hset("users", email, user, redis.print);
                newUserCreated = true;
            }
        });
};