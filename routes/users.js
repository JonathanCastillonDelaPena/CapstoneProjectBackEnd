const routesUser = require('express').Router();
const sql = require('../database/mySQL')
const {checkPassword,securePassword} = require('../utils/auth')

routesUser.post('/login/', async (req,res)=>{
    const uname = req.body.username
    const pass = req.body.pass
 try {
     await sql.query(`CALL CheckPassByUsername('${uname}')`, async (err, rows)=>{
        const passData = rows[0].map(data=> data.pass)
        const comparedpass = await checkPassword(pass,passData[0])
        if(comparedpass){
            console.log('True')
        } else {
            console.log('False')
        }
        res.status(202).send(rows[1]);
     });
 } catch (error) {
     console.log(error)
 }
})

routesUser.post('/users/', async (req,res)=>{
    const first_name = req.body.first_name
    const last_name = req.body.last_name
    const email = req.body.email
    const pass = await securePassword(req.body.pass)
    const username = req.body.username
    const gender = req.body.gender
 try {
     await sql.query(`CALL AddUser('${first_name}','${last_name}','${email}','${pass}','${username}','${gender}')`, (err, rows)=>{
     res.status(201).send(rows);   
     });
 } catch (error) {
     console.log(error)
 }
})

routesUser.put('/users/', async (req,res)=>{
    const user_id = req.body.user_id
    const first_name = req.body.first_name
    const last_name = req.body.last_name
    const email = req.body.email
    const pass = req.body.pass
    const username = req.body.username
    const gender = req.body.gender
 try {
     await sql.query(`CALL UpdateUser(${user_id},'${first_name}','${last_name}','${email}','${pass}','${username}','${gender}')`, (err, rows)=>{
     res.status(202).send(rows);   
     });
 } catch (error) {
     console.log(error)
 }
})   

routesUser.delete('/users/', async (req, res) => {
        const user_id = req.body.user_id;
        try {
            await sql.query(`CALL DeleteUserByID(${user_id})`, (err, rows) => {
                res.status(202).send(rows);
            });
        } catch (error) {
            console.log(error);
        }
    })

routesUser.get('/users/', async (req, res) => {
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