const express = require('express');
const router = express.Router();

const path = require('path');
const db = require('./db.js');
const moment = require('moment');

// 前台首页
router.get('/index', (req, res) => {

    // 如果要执行两种sql语句 需要给db模块添加一个配置项
    const sql = `select * from ali_cate;
                    select * from ali_article order by rand() limit 0,5;
                    select * from ali_pic;
                    select * from ali_article where article_focus=1 order by  article_addtime desc limit 0,5;
                    select * from ali_comment join  ali_admin on cmt_id=admin_id;
                    select * from ali_article order by article_click desc limit 0,5;
                    select * from ali_article order by article_good desc limit 0,4;
                    select * from ali_article 
                    join  ali_cate  on cate_id=article_cateid  
                    join  ali_admin on admin_id=article_adminid
                    limit 0,5;                                                                     
                    `
    // select * from ali_article
    // join ali_cate on cate_id=article_cateid
    // join ali_admin on admin_id=article_adminid
    // limit 0,5;
    db.query(sql, (err, result) => {
        const data = {
            cate: result[0], // result[0] 是第一个sql语句执行的结果 保存到cate里面 页面循环的是cate
            rand: result[1], // result[1] 是第二个sql语句执行的结果 保存到rand里面 页面循环的是rand
            pic: result[2], // result[2] 第三个sql语句执行结果 保存到pic里面 页面循环的是pic
            focus: result[3], //result[3]  第四个sql的执行结果  保存到focus里面 页面循环focus
            pinglun: result[4],
            paihang: result[5],
            tuijian: result[6],
            fabu: result[7]
        }
        res.render(path.join(__dirname, 'view', 'index.html'), data)
    })
})





router.get('/list', (req, res) => {

    const cate_id = req.query.id;
    const sql = `select * from ali_cate;
    select * from ali_article order by rand() limit 0,5;
    select cate_name from ali_cate where cate_id=${cate_id};
    select ali_article.*,ali_admin.admin_nickname from ali_article
                    join ali_admin on ali_article.article_adminid=ali_admin.admin_id
                    where ali_article.article_cateid=${cate_id};
    select * from ali_comment join  ali_admin on cmt_id=admin_id;
    `

    db.query(sql, (err, result) => {
        const data = {
            cate: result[0],
            rand: result[1],
            name: result[2],
            list: result[3],
            pinglun: result[4]
        }
        // console.log(cen)
        res.render(path.join(__dirname, 'view', 'list.html'), data)
    })
})





router.get('/detail', (req, res) => {

    const article_id = req.query.id;

    const sql = `select * from ali_cate;
                 select * from ali_article order by rand() limit 0,5;
                 select ali_article.*,ali_admin.admin_nickname,
                        ali_cate.cate_id,ali_cate.cate_name from ali_article
                        join ali_admin on ali_article.article_adminid=ali_admin.admin_id
                        join ali_cate on ali_article.article_cateid=ali_cate.cate_id
                        where ali_article.article_id=${article_id}`;

    db.query(sql, (err, result) => {
        const data = {
            cate: result[0],
            rand: result[1],
            article: result[2][0]
        };
        res.render(path.join(__dirname, 'view', 'detail.html'),data)
    })
})





// 后台登录页
router.get('/admin/login', (req, res) => {
    res.render(path.join(__dirname, 'view/admin', 'login.html'))
});
// 后台首页
router.get('/admin/index', (req, res) => {
    res.render(path.join(__dirname, 'view/admin', 'index.html'));
})
// 显示栏目列表页
router.get('/admin/cate/cate', (req, res) => {
    res.render(path.join(__dirname, 'view/admin/cate', 'cate.html'))
})
router.get('/admin/cate/getdate', (req, res) => {
    const sql = 'select * from ali_cate';
    db.query(sql, (err, result) => {
        if (err || result.length == 0) {
            return res.send({
                code: 201,
                message: "获取失败"
            })
        }
        res.send({
            code: 200,
            message: "获取成功",
            data: result
        })
    })

})

// 添加栏目页

router.get('/admin/cate/addcate', (req, res) => {
    res.render(path.join(__dirname, './view/admin/cate', 'addcate.html'))
})

router.post('/admin/cate.addcatedel', (req, res) => {

    // 先接受ajax发送的数据
    const data = {
        cate_name: req.body.name,
        cate_icon: req.body.icon,
        cate_addtime: moment().format('YYYY-MM-DD')
    }

    const sql = 'insert into ali_cate set ?';
    db.query(sql, data, (err, result) => {

        // 如果往数据库添加 报错也就是 用影响行来判断
        if (err || result.affectedRows != 1) {
            return res.send({
                code: 201,
                message: "添加数据失败"
            })
        }
        res.send({
            code: 200,
            message: "添加数据成功"
        })
    })
})

// 删除栏目列表 
// 思路:  先阻止A标签的跳转 自定义添加ID属性   因为这是后续加的内容 不能设置 ID={{$value.cate_id}}    
//  要想删除 得把ID通过ajax传到后端 

router.get('/admin/cate/del', (req, res) => {

    const id = req.query.id;

    const sql = 'delete from ali_cate where cate_id=?'

    db.query(sql, id, (err, result) => {
        if (err || result.affectedRows != 1) {
            return res.send({
                code: 201,
                message: "删除失败"
            })
        }
        res.send({
            code: 200,
            message: "删除成功"
        })
    })
})

router.get('/admin/cate/editcate', (req, res) => {

    // console.log(req.query)
    const cate_id = req.query.id;

    const sql = 'select * from ali_cate where cate_id=?';
    db.query(sql, cate_id, (err, result) => {

        if (err || result.length != 1) {
            return res.render(path.join(__dirname, './view/admin/cate', 'editcate.html'), {
                code: 201
            })
        }
        res.render(path.join(__dirname, './view/admin/cate', 'editcate.html'), result[0])
    })


})

router.post('/admin/cate/modifycate', (req, res) => {

    // console.log(req.body)
    const data = {
        cate_name: req.body.name,
        cate_icon: req.body.icon
    }
    const cate_id = req.body.id;
    const sql = 'update ali_cate set ? where cate_id=?'
    db.query(sql, [data, cate_id], (err, result) => {

        if (err || result.affectedRows != 1) {
            5
            return res.send({
                code: 201,
                message: "修改失败"
            })
        }
        res.send({
            code: 200,
            message: "修改成功"
        })
    })
})

router.get('/admin/user/users', (req, res) => {

    const sql = 'select * from ali_admin'
    db.query(sql, (err, result) => {

        if (err) {
            return res.send({
                code: 201,
                messsge: "错误"
            })
        }
        res.render(path.join(__dirname, './view/admin/user', 'users.html'), {
            list: result
        })
    })
})



router.get('/admin/user/adduser', (req, res) => {
    res.render(path.join(__dirname, 'view/admin/user', 'adduser.html'))
})
router.post('/admin/yanzheng', (req, res) => {
    const data = {
        admin_email: req.body.email,
        admin_nickname: req.body.nickname,
        admin_pwd: req.body.password
    }
    const sql = 'insert  into ali_admin set ?';
    db.query(sql, data, (err, result) => {
        if (err || result.affectedRows != 1) {
            console.log(err)
            return res.send({
                code: 201,
                message: "失败"
            })
        }
        res.send({
            code: 200,
            message: "OK"
        })
    })
})


// 批量删除

router.get('/admin/user/delusers', (req, res) => {

    const ids = req.query.ids;
    const sql = `delete from ali_admin where admin_id in (${ids})`

    db.query(sql, (err, result) => {
        if (err || result.affectedRows == 0) {
            return res.send({
                code: 201,
                message: "错误"
            })
        }
        res.send({
            code: 200,
            message: "删除成功"
        })

    })
})

router.get('/admin/user/edituser', (req, res) => {

    const id = req.query.id;
    const sql = 'select * from ali_admin where admin_id= ?'

    db.query(sql, id, (err, result) => {

        res.render(path.join(__dirname, './view/admin/user', 'edituser.html'), result[0])
    })
})

router.post('/admin/user/modifyuser', (req, res) => {

    console.log(req.body)
    const data = {
        admin_email: req.body.email,
        admin_nickname: req.body.nickname,
        admin_tel: req.body.tel,
        admin_gender: req.body.gender
    }
    console.log(req.body.id)
    const id = req.body.id;

    // 分组 获取数据
    const sql = 'update ali_admin set ? where admin_id = ?';
    db.query(sql, [data, id], (err, result) => {
        if (err || result.affectedRows != 1) {
            return res.send({
                code: 201,
                message: "修改失败"
            })
        }
        res.send({
            code: 200,
            message: "修改成功"
        })
    })
})


router.get('/admin/center/profile', (req, res) => {

    // console.log(req.session)

    const admin_id = req.session.userInfo.admin_id;
    const sql = 'select * from ali_admin where admin_id = ?'

    db.query(sql, admin_id, (err, result) => {

        // console.log(result)
        res.render(path.join(__dirname, './view/admin/center', 'profile.html'), result[0])
    })
})



router.get('/admin/center/passwd', (req, res) => {

    res.render(path.join(__dirname, './view/admin/center', 'password-reset.html'))
})

// 写文章
router.get('/admin/post/addpost', (req, res) => {
    res.render(path.join(__dirname, './view/admin/post', 'addpost.html'))
})
//所有文章页
router.get('/admin/post/posts', (req, res) => {
    res.render(path.join(__dirname, './view/admin/post', 'posts.html'))
})

router.get('/admin/other/slides', (req, res) => {
    res.render(path.join(__dirname, './view/admin/other', 'slides.html'))
})
module.exports = router;