const routesUser = require('express').Router();
const sql = require('../database/mySQL')
const {checkPassword, hashPassword, createToken, verifyToken, authenticateToken} = require('../utils/auth')
const {signupSchema, loginSchema} = require('../utils/validator')
const crypto = require('crypto')
const sendVerificationEmail = require('../utils/mailHandler')

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
                    console.log(passData);
                    const comparedpass = await checkPassword(pass,passData[0])
                    if(comparedpass){
                        await sql.query(`CALL CheckEmailVerifiedByUsername('${username}')`, async (err, rows)=>{
                            console.log(rows[0]);
                            const isEmailVerified = rows[0].map(data=> data.email_verified);
                            if(isEmailVerified=='verified'){
                                const accessToken = await createToken(username);
                                res.json({ accessToken: accessToken });
                                console.log(await verifyToken(accessToken));
                            } else {
                                console.log(`${username}'s Email is not yet verified`)
                                res.status(401).json({ error: 'Email is not yet verified' })
                            }
                        });
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
routesUser.post('/signup/', async (req,res)=>{
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
                const email_verified = crypto.createHash('md5').update(`${Date.now()}`).digest("hex");
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
                                await sql.query(`CALL AddUser('${first_name}','${last_name}','${email}','${pass}','${username}','${gender}','${email_verified}')`, ()=>{
                                    sendVerificationEmail(username,email,email_verified);
                                    console.log(`account created for: ${username}`);
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

//Show User Details by Username
routesUser.get('/userdetails/', authenticateToken, async (req, res) => {
    const username = req.body.username;
    try {
        await sql.query(`CALL ShowDetailsByUsername('${username}')`, (err, rows) => {
            res.status(200).json(rows[0]);
        });
    } catch (error) {
        console.log(error);
    }
})

//Verify email
routesUser.get('/emailverify/:email&:key', async (req, res) => {
    console.log(req.params.email, req.params.key)
    try {
        await sql.query(`CALL CheckEmail('${req.params.email}')`, async (err, rows)=>{
            const emailData = rows[0].map(data=> data.email)
            if(emailData != ''){
                console.log(`Email exists: '${emailData}'`)
                await sql.query(`CALL CheckEmailVerifiedByEmail('${emailData}')`, async (err, rows)=>{
                    console.log(rows[0]);
                    const isEmailVerified = rows[0].map(data=> data.email_verified);
                    if(isEmailVerified == 'verified'){
                        console.log(`${emailData} is already verified`)
                        res.status(400).json({ error: 'Email is already verified' })
                    } else {
                        if(isEmailVerified == req.params.key){
                            console.log(`Key entered matched for ${emailData}`);
                            await sql.query(`CALL SetEmailVerified('${emailData}')`, async (err, rows)=>{
                                console.log(`${emailData} is now verified`)
                                res.status(200).json({ message: 'Email is now Verified' })
                            });
                        } else {
                            console.log(`Entered key:${req.params.key} and Registered key:${isEmailVerified} doesn't match.`)
                            res.status(400).json({ error: 'invalid email or key' })
                        }
                    }
                });
            } else {
                res.status(400).json({error:'invalid email or key'});
            }
        })
    } catch (error) {
        console.log(error);
    }
})

//Resend Verification email
routesUser.post('/emailverify/', async (req, res) => {
    console.log(req.body.email)
    try {
        await sql.query(`CALL CheckEmail('${req.body.email}')`, async (err, rows)=>{
            const emailData = rows[0].map(data=> data.email)
            if(emailData != ''){
                console.log(`Email exists: '${emailData}'`)
                await sql.query(`CALL CheckEmailVerifiedByEmail('${emailData}')`, async (err, rows)=>{
                    const isEmailVerified = rows[0].map(data=> data.email_verified);
                    if(isEmailVerified == 'verified'){
                        console.log(`${emailData} is already verified`)
                        res.status(400).json({ error: 'Email is already verified' })
                    } else {
                        await sql.query(`CALL CheckUsernameByEmail('${emailData}')`, async (err, rows)=>{
                            const username = rows[0].map(data=> data.username);
                            sendVerificationEmail(username[0],emailData[0],isEmailVerified[0]);
                            console.log(`Resent email verification for: ${emailData}`);
                            //Send generic message to avoid exploit
                            res.status(201).json({message:'if the address is correct, you will receive an email soon'});
                        });
                    }
                });
            } else {
                //Send generic message to avoid exploit
                res.status(400).json({message:'if the address is correct, you will receive an email soon'});
            }
        })
    } catch (error) {
        console.log(error);
    }
})

module.exports = routesUser;