const express = require('express');
const app = express();
app.listen(3000,()=>{
    console.log('ali-show server is running......')
})

app.engine('html',require('express-art-template'));
// 静态资源  用到了 内置的中间件 只要有use 就放在app.js下
app.use('/uploads',express.static('./view/uploads'))
app.use('/assets',express.static('./view/assets'))
app.use('/upload',express.static('./upload'))


// 加载session
// const session = require('express-session');
// app.use(session({
//     secret: 'a327fg3fggtg',
//     resave: false,
//     saveUninitialized: false
// }))
// app.use(checksession);




// 加载session模块 分三步

const session = require('express-session');
app.use(session({
    secret:'2d5as1d6asd1s',
    resave:false,
    saveUninitialized:false
}))
app.use(checksession);






//加载bp模块
const bp = require('body-parser')
app.use(bp.urlencoded({extended:false}))


const router = require('./router.js')
app.use(router);

const api = require('./api.js');
app.use(api);



const url = require('url')

// 先创建中间件session函数  必须放在加载之后
function checksession (req,res,next){
    
    const allow_url = ['/admin/login','/api/login/checkLogin','/index','/list','/detail']


    const urlObj = url.parse(req.url)
    //如果路径不属于这个数组 取反 进行验证 
    if(!allow_url.includes(urlObj.pathname)){

        // 未检测到session跳转到登录页
        if(!req.session.isLogin){
            return res.redirect('/admin/login')
        }
    }
    next();
}






// //定义检测session 的中间件
// function checksession (req, res, next) {
//     if (req.url != '/admin/login' && req.url != '/api/login/checkLogin') {
//         //如果 isLogin=false代表未登录
//         if (!req.session.isLogin) {
//             //未登录则跳转回登录页 /admin/login
//             return res.redirect('/admin/login');
//         }
//     }
//     next();
// }