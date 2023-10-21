/* 1. expressモジュールをロードし、インスタンス化してappに代入。*/
var express = require("express");
const crypto = require('crypto')//md5ハッシュ化の前提

const fs=require("fs");
var app = express();
var jwt = require('jsonwebtoken');//tokenの発行関係
app.use(express.urlencoded({extended:true}))
var cookies = require("cookie-parser");
const bcrypt = require('bcrypt');
app.use(cookies());

/* 2. listen()メソッドを実行して3000番ポートで待ち受け。*/
var server = app.listen(3000, function(){
    console.log("Node.js is listening to PORT:" + server.address().port);
});

//mysqlとの接続関係
const mysql = require('mysql');

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
});

con.connect(function (err) {
    console.log('Connected');
    const sql = 'select * from webapp.name_pass where name = "a"';
    con.query(sql, function (err, result, fields) {
	if (err) {throw err;}	
	console.log(result);
    });
    
});
//クッキーからtoken を持って来てあってるか確かめる関数
function check_token (cookie){
    
    if (cookie.token==null){return false};
    token=cookie.token;
    console.log(token);
    var token_value = jwt.verify(token, 'my_secret');
    var hantei = "kai"
    var text = fs.readFileSync("./name_token.txt","utf-8");
    var sql = "select * from webapp.name_token where token = ?";
    return new Promise((resolve,reject)=>{
	con.query(sql,token,function(err,result,fields){
	    console.log("uni")
	    if(result.length !=0){console.log("oook")
				  resolve(true)

				 }
	    else{
		console.log("nooooo")
		resolve(false)
	    }

	})
	return hantei
    }
		      )
}

//md5にハッシュ化する関数
function to_md5(text){
    const md5 = crypto.createHash('md5')
    return md5.update(text).digest('hex')
}

// View EngineにEJSを指定。
app.set('view engine', 'ejs');
//新規登録
app.get("/newaccount",function(req,res,next){
    res.render("newaccount",{})
})



app.post("/newaccount",function(req,res,next){

    var form = req.body;
    var output = [];
    const sql = 'insert into webapp.name_pass set ?';
    console.log (form)
    output  = {name : form.name,pass : to_md5(form.pass)}
    console.log(output)
    con.query(sql,output, function (err, result, fields) {
    	
	console.log(err);
    });
    
    
    res.render("madeaccount",{})
    
})
var tokenok=0;
// "/"へのGETリクエストでindex.ejsを表示する。トークンがあればそのトークンを確認、homeに遷移する
app.get("/", async function(req, res, next){		//パスワード確認ページを表示する処理
    
    

    const cookies = req.cookies;
    


    if(await check_token(cookies)){
	console.log("ok")
    	res.render("home", {});
    }
    else{
	console.log("no")
	res.render("index",{});
    }
});
app.get("/get_kinmu", async function(req, res, next){		//勤務表のデータを送る
    if(await check_token){
	var sql ="select * from webapp.shift";
	con.query(sql, function(err,result,fields){
	    res.json(result);
	})
    }
});
app.post("/", function(req, res, next){		//送られてきたパスワードとユーザ名を確かめる
    var sql = 'select * from webapp.name_pass where name = ? and pass = ?';
    var data = "name = 'aa'"
    con.query(sql,[req.body.name,to_md5(req.body.pass)], function (err, result, fields) {
	console.log(err)
	if (result.length!=0){
	    const token = jwt.sign({ name: req.body.name}, 'my_secret', { expiresIn: '1h' });
	    var sql = "insert into webapp.name_token values(?,?)";
	    con.query(sql,[req.body.name,token ],function(err,result,fields){console.log(err);console.log("カニ")})
    	    res.cookie("token",token)			//cookieにtokenを渡す
	    res.render("home",{});
	}
	else{
	    res.render("index",{})
	}
    });
    
});


//		ログアウト

app.get("/delcookie",(req,res)=>{
    var sql="delete from webapp.name_token where token = ?"
    con.query(sql,req.cookies.token ,function(err,result,fields){console.log(err);})
    res.clearCookie("token")
    res.send("<a href='../'>ログイン画面へ行く</a>")
})
app.post('/send_kinmu', async function(req, res){		//送られてきた勤務の情報をテキストに書き込み、リロードさせる
    if(await check_token(req.cookies)){
	var form = req.body;
	var output = [];
	output  = [form.username,form.day,form.start,form.fin,form.coment]
	var sql = "insert into webapp.shift values(?,?,?,?,?)"

	con.query(sql,output,function(err,result,fields){})
	res.render("home",{});
    }
    else{
	res.render("error",{});
    }  
})
app.use(function(req, res, next){
    res.status(404);
    res.render("error",{});
})





