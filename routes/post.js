const routesPost = require("express").Router();
const sql = require("../database/mySQL");
const {authenticateToken} = require("../utils/auth")

routesPost.get("/post/", authenticateToken, (req, res) => {
  try {
    sql.query("CALL ShowAllPost()", (err, rows) => {
      res.status(201).send(rows);
    });
  } catch (error) {
    console.log(error);
  }
});

routesPost.get("/post/:id", authenticateToken, (req, res) => {
  const id = req.params.id;
  try {
    sql.query(`CALL ShowPostByID(${id})`, (err, rows) => {
      res.status(201).send(rows[0]);
    });
  } catch (error) {
    console.log(error);
  }
});

routesPost.put("/post/", authenticateToken, async (req, res) => {
  const post_id = req.body.post_id;
  const title = req.body.title;
  const content = req.body.content;

  try {
    await sql.query(
      `CALL UpdatePost(${post_id}, '${title}', '${content}')`,
      (err, rows) => {
        res.status(201).send(rows);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

routesPost.post("/post/", authenticateToken, async (req, res) => {
  const user_id = req.body.user_id;
  const title = req.body.title;
  const content = req.body.content;

  try {
    await sql.query(
      `CALL AddPost(${user_id}, '${title}', '${content}')`,
      (err, rows) => {
        res.status(201).send(rows);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

routesPost.delete("/post/", authenticateToken, (req, res) => {
  const post_id = req.body.postId;
  try {
    sql.query(`CALL DeletePostByID(${post_id})`, (err, rows) => {
      res.status(201).send(rows);
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = routesPost;
