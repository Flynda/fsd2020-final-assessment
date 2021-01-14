require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const fetch = require('node-fetch')
const withQuery = require('with-query').default
const mysql = require('mysql2/promise')
const jwt = require('jsonwebtoken')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const AWS = require('aws-sdk')
const multer = require('multer')
const fs = require('fs')
const nodemailer = require("nodemailer");
const crypto = require('crypto')

const PORT = parseInt(process.argv[2]) || parseInt(process.env) || 3000
const NYT_BOOK_REVIEW_ENDPOINT = 'https://api.nytimes.com/svc/books/v3/reviews.json'
const nytimes_apikey = process.env.NYTIMES_APIKEY || ''
const TOKEN_SECRET = process.env.TOKEN_SECRET
const NEW_SECRET = process.env.NEW_SECRET

const SQL_CHECK_USER_PASSWORD = 'select id, user_id, email from user where user_id = ? and password = sha(?) and activated = 1'
const SQL_CHECK_UNIQUE_USERNAME = `select id from user where user_id = ?`
const SQL_CHECK_UNIQUE_EMAIL = `select id from user where email = ?`
const SQL_ADD_NEW_USER = `insert into user (user_id, password, email, temp_hash) values (?, sha(?), ?, ?)`
const SQL_CHECK_VERIFICATION = 'select id, user_id, email from user where user_id = ? and temp_hash = ?'
const SQL_UPDATE_VERIFICATION = 'UPDATE user SET activated = 1, temp_hash = null WHERE (user_id = ?)'
const SQL_GET_TITLE_LIST = 'select book_id, title from book2018 where title like ? and (user_id is null or user_id = ?) order by title asc limit ? offset ?'
const SQL_TOTAL_LIST = 'select count(*) as listCount from book2018 where title like ?'
const SQL_GET_BOOK_DETAILS = 'select * from book2018 where book_id = ?'
const SQL_ADD_TO_DATABASE = `INSERT INTO book2018 (book_id, title, authors, description, edition, format, pages, genres, image_url, user_id) VALUES
(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
const SQL_GET_LAST_BOOK_ID = ` select book_id from book2018 ORDER BY book_id DESC LIMIT 1;`
const SQL_CHECK_IF_BOOK_IS_IN_USER_FAVORITES = `select id from favorites where user_id = ? and book_id = ?`
const SQL_ADD_TO_FAVORITES = `insert into favorites (user_id, book_id) values (?, ?)`
const SQL_REMOVE_FROM_FAVORITES = `delete from favorites where id = ?`
const SQL_SHOW_ALL_USER_FAVORITES = `SELECT * FROM (
	SELECT b.book_id, b.title, f.user_id
		FROM book2018 b
        LEFT JOIN favorites f
        ON b.book_id = f.book_id
	) AS my_joint
    WHERE my_joint.user_id = ?;`
const SQL_GET_ALL_USER_SUGGESTIONS = `select book_id, title from book2018 where user_id is not null order by title asc;`

const SQL_LIMIT = 10

const pool = mysql.createPool({
    host: process.env.SQL_HOST || 'localhost',
    port: parseInt(process.env.SQL_PORT) || 3306,
    database: process.env.SQL_DATABASE,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    connectionLimit: process.env.SQL_CONNECTION_LIMIT,
    timezone: '+08:00'
})

const mkQuery = (sqlStmt, pool) => {
    const f = async (params) => {
        const conn = await pool.getConnection()
        try {
            const results = await pool.query(sqlStmt, params)
            return results[0]
        } catch(e) {
            return Promise.reject(e)
        } finally {
            conn.release()
        }
    }
    return f
}

const getBookList = mkQuery(SQL_GET_TITLE_LIST, pool)
const listCount = mkQuery(SQL_TOTAL_LIST, pool)
const bookDetails = mkQuery(SQL_GET_BOOK_DETAILS, pool)
const checkUserPassword = mkQuery(SQL_CHECK_USER_PASSWORD, pool)
const getLastBookId = mkQuery(SQL_GET_LAST_BOOK_ID, pool)
const addToSQLDb = mkQuery(SQL_ADD_TO_DATABASE, pool)
const addToFavTable = mkQuery(SQL_ADD_TO_FAVORITES, pool)
const checkIfFav = mkQuery(SQL_CHECK_IF_BOOK_IS_IN_USER_FAVORITES, pool)
const deleteFromFavTable = mkQuery(SQL_REMOVE_FROM_FAVORITES, pool)
const userFav = mkQuery(SQL_SHOW_ALL_USER_FAVORITES, pool)
const allUserSuggestions = mkQuery(SQL_GET_ALL_USER_SUGGESTIONS, pool)
const checkUniqueUsername = mkQuery(SQL_CHECK_UNIQUE_USERNAME, pool)
const checkUniqueEmail = mkQuery(SQL_CHECK_UNIQUE_EMAIL, pool)
const addNewUserToDB = mkQuery(SQL_ADD_NEW_USER, pool)
const checkVerification = mkQuery(SQL_CHECK_VERIFICATION, pool)
const updateVerification = mkQuery(SQL_UPDATE_VERIFICATION, pool)

const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint(process.env.S3_HOSTNAME),
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY
})

const upload = multer({
    dest: process.env.TMP_DIR || '/temp/uploads'
})

const readFile = (path) => new Promise(
    (resolve, reject) => 
        fs.readFile(path, (err, buff) => {
            if (null != err)
                reject (err)
            else
                resolve(buff)
        })
)

const putObject = (file, buff, s3) => new Promise(
    (resolve, reject) => {
        const params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: file.filename,
            Body: buff,
            ACL: 'public-read',
            ContentType: file.mimetype,
            ContentLength: file.size
        }
        s3.putObject(params, (err, result) => {
            if (null != err) {
                reject(err)
            } else {
                resolve(result)
            }
        })
    }
)

const authMiddleware = (passport) => {
    return (req, resp, next) => {
        passport.authenticate('local',
            (err, user, info) => {
                console.info('info', info)
                if ((null != err)) {
                    resp.status(401)
                    resp.json({message: err})
                    return
                }
                if (null != info) {
                    resp.status(401)
                    resp.json(info)
                    return
                }
                req.user = user
                next()
            }
        )  (req, resp, next)
    }
}

passport.use(
    new LocalStrategy(
        {usernameField: 'username', passwordField: 'password', passReqToCallback: true },
        async (req, user, password, done) => {
            // perform the authentication
            const authResult = await checkUserPassword([user, password])
            if (authResult.length) {
                done(null,
                    // info about the user
                    // for application to use
                    {
                        username: user,
                        email: authResult[0].email,
                        userId: authResult[0].id,
                        loginTime: (new Date()).toString(),
                        security: 2
                    }
                )
                return;
            }
            // incorrect login
            done('Incorrect username and password', false)
        }
    )
)

// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "http://localhost:3000/auth/google/callback"
//   },
//   function(accessToken, refreshToken, profile, done) {
//        User.findOrCreate({ googleId: profile.id }, function (err, user) {
//          return done(err, user);
//        });
//   }
// ));

const localStrategyAuth = authMiddleware(passport)

const checkAuth = (req, resp, next) => {
    // check if the request has Authorization header
    const auth = req.get('Authorization')
    if (null == auth) {
        resp.status(403)
        resp.json({ message: 'Forbidden' })
        return
    }
    // Bearer authorization
    const terms = auth.split(' ')
    if ((terms.length != 2) || (terms[0] != 'Bearer')) {
        resp.status(403)
        resp.json({message: 'Forbidden'})
        return
    }
    const token = terms[1]
    try {
        const verified = jwt.verify(token, TOKEN_SECRET)
        console.info(`Verified token`, verified)
        req.token = verified
        next()
    } catch (e) {
        resp.status(403)
        resp.json({message: 'Forbidden!', error: e})
        return
    }
}

// const testEmail = async () => {
//     let testAccount = await nodemailer.createTestAccount();
//     let transporter = nodemailer.createTransport({
//         host: "smtp.ethereal.email",
//         port: 587,
//         secure: false, // true for 465, false for other ports
//         auth: {
//           user: testAccount.user, // generated ethereal user
//           pass: testAccount.pass, // generated ethereal password
//         },
//       });
//       let info = await transporter.sendMail({
//         from: '"Fred Foo 👻" <foo@example.com>', // sender address
//         to: "", // list of receivers
//         subject: "Hello ✔", // Subject line
//         text: "Hello world?", // plain text body
//         html: "<b>Hello world?</b>", // html body
//       });
    
//       console.log("Message sent: %s", info.messageId);
//       console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
// }

const sendEmail = async(newUser, temp_hash) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.SENDER_NAME,
            pass: process.env.SENDER_PW
        }
    })
    const mailContents = {
        from: process.env.SENDER_NAME,
        to: newUser.email,
        subject: 'Welcome to My Bookshelf App!',
        html: `Thank you for creating an account with us. <br>
        <p>Your username is: ${newUser.username} </p><br>
        <p>Please click <a href="http://localhost:3000/verify?u=${newUser.username}&h=${temp_hash}" target="_blank">here</a> to verify your email.</p>
        <p>Alternatively, copy the link below and paste it in your browser:<br>
        http://localhost:3000/verify?u=${newUser.username}&h=${temp_hash}
        </p>
        <b>Why have you received this message?</b><br>
        This mail address was used to create an account. If this account was set up in error, or if you received this message but did not create the account, please reply and the account will be deleted.`
    }

    const info = await transporter.sendMail(mailContents, (err, info) => {
        if (err) {
            console.error(err)
        } else {
            console.info('Email sent: ' + info)
        }
    })
}


const app = express()
app.use(morgan('combined'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(passport.initialize())

app.post('/login', 
        // passport middleware to perform login
        localStrategyAuth,
        (req, resp) => {
            // do something
            console.info(`user: `, req.user)
            // generate JWT token
            const currentTime = (new Date()).getTime() / 1000
            const token = jwt.sign({
                sub: req.user.username,
                iss: 'myapp',
                ist: currentTime,
                // nbf: currentTime + 30,
                exp: currentTime + (60 * 60),
                data: {
                    user: req.user.username,
                    userId: req.user.userId,
                    user_email: req.user.email,
                    loginTime: req.user.loginTime
                }
            }, TOKEN_SECRET)

            resp.status(200)
            resp.type('application/json')
            resp.json({ message: `Login in at ${new Date()}`, token})
        }
)

// app.get('/auth/google',
//   passport.authenticate('google', { scope:
//       [ 'email', 'profile' ] }
// ));

// app.get( '/auth/google/callback',
//     passport.authenticate( 'google', {
//         successRedirect: '/auth/google/success',
//         failureRedirect: '/auth/google/failure'
// }));


app.post('/signup', async(req, resp, next) => {
    const newUser = req.body
    const temp_hasher = crypto.createHmac('sha256', NEW_SECRET)
                              .update(newUser.username)
                              .digest('hex')
    try {
        const userCheck = await checkUniqueUsername([newUser.username])
        const emailCheck = await checkUniqueEmail([newUser.email])
        console.info('new signup?', userCheck)
        console.info('new signup?', emailCheck)
            if (!!userCheck.length || !!emailCheck.length) {
                resp.status(409)
                resp.type('application/json')
                resp.json({message: 'Username or email already exists.'})
                return;
            }
        sendEmail(newUser, temp_hasher)
        console.info('>>>>>')
        const addNewUser = await addNewUserToDB([newUser.username, newUser.password, newUser.email, temp_hasher])
        console.info('add new user? ', addNewUser)
        resp.status(202)
        resp.type('application/json')
        resp.json({message: 'Check email'})
    } catch (err) {
        resp.status(500)
        resp.type('application/json')
        resp.json({error: err})
    }
    // next()
    }
    // , (req, resp) => {
    //     // generate JWT token
    //     const currentTime = (new Date()).getTime() / 1000
    //     const token = jwt.sign({
    //         sub: req.body.username,
    //         iss: 'myapp',
    //         ist: currentTime,
    //         // nbf: currentTime + 30,
    //         exp: currentTime + (60 * 60),
    //         data: {
    //             user: req.body.username,
    //             // userId: req.user.userId,
    //             user_email: req.body.email,
    //             loginTime: currentTime
    //         }
    //     }, TOKEN_SECRET)

    //     resp.status(200)
    //     resp.type('application/json')
    //     resp.json({ message: `Login in at ${new Date()}`, token})
    // }
)

app.get('/verify', async (req, resp) => {
    const user = req.query['u'].toString()
    const temp_hash = req.query['h']
    try {
        const results = await checkVerification([user, temp_hash])
        console.info('>>results: ', results)
        if (!results.length) {
            resp.status(400)
            resp.type('application/json')
            resp.json({message: 'The link either does not exist or has expired.'})
            return
        }
        const results2 = await updateVerification([user])
        console.info(results2)
        resp.status(200)
        resp.type('text/html')
        resp.send(`Verification has succeeded. Please <a href="http://localhost:4200">log in</a>.`)
    } catch (err) {
        resp.status(500)
        resp.type('application/json')
        resp.json({error: err})
    }
})

// Authorization: Bearer <token>
app.post('/protected/addFav', 
    checkAuth,
    async (req, resp) => {
        const userId = req.token.data.userId
        const bookId = req.body.bookId
        console.info(bookId)
        try {
            const addToFav = await addToFavTable([userId, bookId])
            console.info('added? ', addToFav)
            resp.status(200)
            resp.json({ message: 'Added' })
        } catch (err) {
            resp.status(500)
            resp.type('application/json')
            resp.json({error: err})
        }
    }
)

app.delete('/protected/removeFav', 
    checkAuth,
    async (req, resp) => {
        console.info('params? ', req.query['favId'])
        const favId = parseInt(req.query['favId'])
        console.info('to delete, favid: ', favId)
        console.info('type of: ', typeof(favId))
        try {
            const rmFav = await deleteFromFavTable([favId])
            console.info('deleted? ', rmFav)
            resp.status(200)
            resp.json({ message: 'Deleted' })
        } catch (err) {
            resp.status(500)
            resp.type('application/json')
            resp.json({error: err})
        }
    }
)

app.get('/protected/userFav', 
    checkAuth,
    async (req, resp) => {
        const userId = req.token.data.userId
        try {
            const favList = await userFav([userId])
            console.info('fav? ', favList)
            resp.status(200)
            resp.json(favList)
        } catch (err) {
            resp.status(500)
            resp.type('application/json')
            resp.json({error: err})
        }
    }
)

app.post('/protected/share', 
    upload.single('bookcover-img'),
    checkAuth,
    async (req, resp) => {
        let imgFilename = ''
        let imgPath = ''
        const conn = await pool.getConnection()
        try {
            await conn.beginTransaction()
            const x = await getLastBookId([])
            const prev_bookId = x[0]['book_id']
            const firstChar = prev_bookId.substring(0, 1)
            let new_book_id = ''
            if (firstChar != 'u') {
                console.info('not u')
                new_book_id = 'u0000001'
            } else {
                const inc = (parseInt(prev_bookId.substring(1)) + 1) + ""
                const pad = '0000000'
                new_book_id = 'u' + (pad + inc).substring(inc.length)
            }
            console.info('new book id ', new_book_id)
            const userId = req.token.data.userId

            if (req.file) {
                imgFilename = req.file.filename
                console.info('img filename: ', imgFilename)
                readFile(req.file.path)
                .then(buff => {
                    putObject(req.file, buff, s3)
                })
                imgPath = s3.endpoint.protocol + '//' + process.env.S3_BUCKET_NAME + '.' + s3.endpoint.host + '/' + imgFilename
                fs.unlink(req.file.path, () => {})
            }
            console.info('test record', imgPath)
            const add = await addToSQLDb([
                new_book_id, 
                req.body.title, 
                req.body.authors,
                req.body.description,
                req.body.edition,
                req.body.format,
                req.body.pages || 0,
                req.body.genres,
                imgPath,
                userId
            ])
            console.info('add? ', add)
            await conn.commit()
            resp.status(200)
            resp.json({meaning_of_life: 42})
        } catch (e) {
            console.error(e);
            conn.rollback()
            resp.status(500)
            resp.type('application/json')
            resp.json({error: e})
        } finally {
            conn.release()
        }
        
    }
)

app.get ('/protected/othersSuggestions',
    checkAuth,
    async (req, resp) => {
        try {
            const shareList = await allUserSuggestions([])
            console.info('share list? ', shareList)
            resp.status(200)
            resp.json(shareList)
        } catch (err) {
            resp.status(500)
            resp.type('application/json')
            resp.json({error: err})
        }
    }
)

app.get('/protected/list/:id', 
    checkAuth,
    async(req, resp) => {
        const list_id = req.params['id']
        const page = parseInt(req.query['page'])
        let totalInList = parseInt(req.query['total']) || 0
        const offset = (page - 1) * SQL_LIMIT
        try {
            const booklist = await getBookList([`${list_id}%`, req.token.data.userId, SQL_LIMIT, offset])
            if (!totalInList) {
                const listTotal = await listCount([`${list_id}%`])
                totalInList = listTotal[0]['listCount']
            }
            console.info('number:' , totalInList)
            resp.status(200)
            resp.type('application/json')
            resp.json({
                results: booklist, 
                limit: SQL_LIMIT, 
                total: totalInList
            })
        } catch (e) {
            resp.status(500)
            resp.type('application/json')
            resp.json({error: e})
        }
    }
)

app.get('/protected/book/:book_id', 
    checkAuth, 
    async(req, resp) => {
        const book_id = req.params['book_id']
        try {
            const results = await bookDetails([book_id])
            console.info(results)
            if (results.length <= 0) {
                resp.status(404)
                resp.type('application/json')
                resp.json({error: `${book_id} does not exist in the database.`})
                return
            }
            const checkFav = await checkIfFav([req.token.data.userId, book_id])
            console.info('what is here?', checkFav)
            console.info('checking length? ', !!checkFav.length)
            let favId = 0
            if (checkFav.length) {
                favId = checkFav[0].id
            }
            console.info('what will favid show? ', favId)
            resp.status(200)
            resp.type('application/json')
            resp.json({
                bookId: results[0].book_id,
                title: results[0].title,
                authors: results[0].authors.split('|').join(', '),
                summary: results[0].description,
                pages: results[0].pages,
                rating: results[0].rating,
                ratingCount: results[0].rating_count,
                genre: results[0].genres.split('|').join(', '),
                image_url: results[0].image_url || '/assets/no_image.png',
                fav: (!!checkFav.length),
                favId: favId
            })
        } catch (e) {
            resp.status(500)
            resp.type('assplication/json')
            resp.json({error: e})
        }
    }
)

app.get('/review/:title', async (req, resp) => {
    const title = req.params['title']
    const url = withQuery(
        NYT_BOOK_REVIEW_ENDPOINT,
        {
            title: title,
            "api-key": nytimes_apikey
        }
    )
    console.info(url)
    try {
        let results = await fetch(url)
        results = await results.json()
        const reviews = results.results.map(
            d => {
                return {
                    title: d.book_title,
                    author: d.book_author,
                    reviewer: d.byline,
                    review_date: d.publication_dt,
                    summary: d.summary,
                    link: d.url
                }
            }
        )
        console.info(results)
        resp.status(200)
        resp.type('application/json')
        resp.json({
            hasReview: !!results.num_results,
            copyright:results.copyright,
            reviews: reviews
        })
    } catch (e) {
        console.error(e)
        resp.status(500)
        resp.type('application/json')
        resp.json({error: e})
    }
})

const p0 = (async () => {
    const conn = await pool.getConnection()
    console.info('Pinging database...')
    await conn.ping()
    conn.release()
    return true
})()

const p1 = new Promise(
    (resolve, reject) => {
        if (!!nytimes_apikey) {
            resolve()
        } else {
            reject('Api key not found')
        }
    }
)

const p2 = new Promise(
    (resolve, reject) => {
        if((!!process.env.S3_ACCESS_KEY) && (!!process.env.S3_SECRET_ACCESS_KEY))
            resolve()
        else
            reject('S3 keys not found')
    }
)

Promise.all([p0, p1, p2])
    .then(r => {
		app.listen(PORT, () => {
			console.info(`Application started on port ${PORT} at ${new Date()}`)
		})
    })
    .catch(err => console.error('Cannot connect: ', err))