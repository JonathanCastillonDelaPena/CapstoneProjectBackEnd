const routesFriendlist = require('express').Router();
const sql = require('../database/mySQL')
const crypto = require('crypto')
const {authenticateToken} = require('../utils/auth')

//Show friendlist 
routesFriendlist.post('/showfriendlist/', authenticateToken, async (req,res)=>{
        try {
            const user_id = req.body.user_id
            await sql.query(`CALL ShowFriendlist(${user_id})`, async (err, rows)=>{
                console.log(rows[0]);
                res.status(200).json(rows[0]);
            });
        } catch (error) {
            console.log(error)
        }
    })


//Send friend request 
routesFriendlist.post('/friendlist/', authenticateToken, async (req,res)=>{
    try {
        const user_id = req.body.user_id
        const friend_id = req.body.friend_id
        await sql.query(`CALL SendFriendRequest(${user_id},${friend_id})`, async (err, rows)=>{
            console.log(`${user_id} sent ${friend_id} a friend request`);
            res.status(200).json({rows});
        });
    } catch (error) {
        console.log(error)
    }
})

//Delete friend 
routesFriendlist.delete('/friendlist/', authenticateToken, async (req,res)=>{
    try {
        const user_id = req.body.user_id
        const friend_id = req.body.friend_id
        await sql.query(`CALL DeleteFriend(${user_id},${friend_id})`, async (err, rows)=>{
            console.log(`${user_id} and ${friend_id} are no longer friends`);
            res.status(200).json({rows});
        });
    } catch (error) {
        console.log(error)
    }
})

//Reject request
routesFriendlist.post('/rejectfriend/', authenticateToken, async (req,res)=>{
    try {
        const user_id = req.body.user_id
        const friend_id = req.body.friend_id
        await sql.query(`CALL RejectFriend(${user_id},${friend_id})`, async (err, rows)=>{
            console.log(`${user_id} rejected ${friend_id}'s friend request`);
            res.status(200).json({rows});
        });
    } catch (error) {
        console.log(error)
    }
})

//Accept request
routesFriendlist.post('/acceptfriend/', authenticateToken, async (req,res)=>{
    try {
        const user_id = req.body.user_id
        const friend_id = req.body.friend_id
        await sql.query(`CALL AcceptFriend(${user_id},${friend_id})`, async (err, rows)=>{
            console.log(`${user_id} accepted ${friend_id}'s friend request`);
            res.status(200).json({rows});
        });
    } catch (error) {
        console.log(error)
    }
})

module.exports = routesFriendlist;