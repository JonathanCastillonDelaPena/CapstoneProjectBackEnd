const routesUser = require('express').Router();
const sql = require('../database/mySQL')
const {checkPassword, hashPassword, createToken, verifyToken, authenticateToken} = require('../utils/auth')
const {signupSchema, loginSchema} = require('../utils/validator')

//Login
routesUser.post('/login/', async (req,res)=>{
    const {error,value} = loginSchema.validate(req.body,{
        abortEarly: false,
    })
    if(error) {
        console.log(error.message);
        return res.status(400).json({ error: error.message });
    } else {
        try {
            const username = req.body.username
            const pass = req.body.pass
            await sql.query(`CALL CheckPassByUsername('${username}')`, async (err, rows)=>{
                console.log(rows[0]);
                const passData = rows[0].map(data=> data.pass)
                if(passData==''){
                    console.log(`Password data is '${passData}' \nInvalid Username`)
                    res.status(401).json({error: 'invalid'})
                } else {
                    console.log(passData)
                    const comparedpass = await checkPassword(pass,passData[0])
                    if(comparedpass){
                        const accessToken = await createToken(username);
                        res.json({ accessToken: accessToken })
                        console.log(await verifyToken(accessToken))
                    } else {
                        console.log(`Username Found\nBut Password Incorrect`)
                        res.status(401).json({ error: 'invalid' })
                    }
                }
            });
        } catch (error) {
            console.log(error)
        }
    }
})

//Register
routesUser.post('/register/', async (req,res)=>{
    const {error,value} = signupSchema.validate(req.body,{
        abortEarly: false,
    })
    if(error) {
        console.log(error.message);
        return res.status(400).send({ error: error.message });
    } else {
            try {
                const first_name = req.body.first_name
                const last_name = req.body.last_name
                const email = req.body.email
                const pass = await hashPassword(req.body.pass)
                const username = req.body.username
                const gender = req.body.gender
                await sql.query(`CALL CheckUsername('${username}')`, async (err, rows)=>{
                    const nameData = rows[0].map(data=> data.username)
                    if(nameData != ''){
                        console.log(`Username is taken: '${nameData}'`)
                        res.status(400).json({error:'username taken'})
                    } else {
                        console.log(`Username '${username}' is valid`)
                        await sql.query(`CALL CheckEmail('${email}')`, async (err, rows)=>{
                            const emailData = rows[0].map(data=> data.email)
                            if(emailData != ''){
                                console.log(`Email is taken: '${emailData}'`)
                                return res.status(400).json({error:'email taken'})
                            } else {
                                await sql.query(`CALL AddUser('${first_name}','${last_name}','${email}','${pass}','${username}','${gender}')`, ()=>{
                                    res.status(201).json({message:'account created'});
                                });
                            }
                        })
                    }
                })
            } catch (error) {
                console.log(error)
            }
    }
})

//Update
routesUser.put('/users/', authenticateToken, async (req,res)=>{
    const {error,value} = updateSchema.validate(req.body,{
        abortEarly: false,
    })
    if(error) {
        console.log(error.message);
        return res.send(error.message);
    } else {
        try {
            const user_id = req.body.user_id
            const first_name = req.body.first_name
            const last_name = req.body.last_name
            const gender = req.body.gender
            await sql.query(`CALL UpdateUser(${user_id},'${first_name}','${last_name}','${gender}')`, (err, rows)=>{
            res.status(202).send(rows);   
            });
        } catch (error) {
            console.log(error)
        }
    }
})   

//Delete
routesUser.delete('/users/', authenticateToken, async (req, res) => {
        const user_id = req.body.user_id;
        try {
            await sql.query(`CALL DeleteUserByID(${user_id})`, (err, rows) => {
                res.status(202).send(rows);
            });
        } catch (error) {
            console.log(error);
        }
    })

//Show Users (Admin use) / Users by ID    
routesUser.get('/users/', authenticateToken, async (req, res) => {
    const user_id = req.body.user_id;
    if(!user_id){
        try {
            await sql.query('CALL ShowAllUsers()', (err, rows)=>{
                res.status(200).send(rows[0]);
            });
        } catch (error) {
            console.log(error)
        }
    } else {
        try {
            await sql.query(`CALL ShowUserByID(${user_id})`, (err, rows) => {
                res.status(200).send(rows[0]);
            });
        } catch (error) {
            console.log(error);
        }
    }
    })

module.exports = routesUser;