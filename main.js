var express = require('express');
var mysql = require('mysql');
var session = require('express-session');
var ejs = require('ejs');
var MySQLStore = require('express-mysql-session')(session);
var app = module.exports = express();
var helmet = require('helmet');
var cookieParser = require('cookie-parser')
var uniqid = require('uniqid');
require('dotenv').config();

    
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.static('js'));
app.use(express.static('uploads'));
app.use(helmet());

app.set('view engine', 'ejs');
app.set('views', './views');
app.set('uploads', './uploads');

app.use(express.json());
app.use(express.urlencoded({
    extended: false
}));

var db = mysql.createConnection({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    port: process.env.port
});

var options = {
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    port: process.env.port
};

var sessionStore = new MySQLStore(options);


db.connect();
app.use(session({
    name: 'sessionId',
    key: process.env.key,
    secret: process.env.secret,
    store: sessionStore,
    resave: false,
    rolling: true,
    saveUninitialized: false
}));

app.get('/', function(request, response) {
    response.render('main_page');
});

app.get('/create', function(request, response){
    response.render('create_page');
});

app.get('/result/:pageId', function(request, response){
    var test_id = request.params.pageId;
    var test_address = 'http://localhost:3000/test/'+test_id;
    db.query(`SELECT EXISTS (SELECT id FROM test_data WHERE test_id = ? LIMIT 1) AS success`,
    [test_id],
    function(error, result) {
        if (error) {
            throw error;
        }
        console.log(result[0].success);
        if(result[0].success){
            response.render('result_page',{
                exist: true,
                test_address: test_address
            });
        }
        else{
            response.render('result_page',{
                exist: false,
                test_address: test_address
            });
        }
    });
    
});

app.post('/create', function(request, response) {
    var post = request.body;
    var title = post.title;
    var result = post.result;
    var test_id = uniqid.process();

    console.log(post);
    db.query(`INSERT INTO test_data (test_id, title, result) VALUES(?, ?, ?)`,
    [test_id, title, result],
    function(error, result) {
        if (error) {
            throw error;
        }
        response.send({
            result: 'success',
            test_id: test_id
        });
    });
    
});

app.listen(3000, function(){
	console.log('Example app listening on port 3000!');
});