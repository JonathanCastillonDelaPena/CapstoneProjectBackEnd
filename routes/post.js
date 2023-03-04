const routesPost = require("express").Router();
const sql = require("../database/mySQL");

routesPost.get("/post/", (req, res) => {
  try {
    sql.query("CALL ShowAllPost()", (err, rows) => {
      res.status(201).send(rows[0]);
    });
  } catch (error) {
    console.log(error);
  }
});

routesPost.get("/post/:id", (req, res) => {
  const id = req.params.id;
  try {
    sql.query(`CALL ShowPostByID(${id})`, (err, rows) => {
      res.status(201).send(rows[0]);
    });
  } catch (error) {
    console.log(error);
  }
});

routesPost.put("/post/", (req, res) => {
  const post_id = parseInt(req.body.postId);
  const title = req.body.postTitle;
  const content = req.body.postContent;

  try {
    sql.query(
      `CALL UpdatePost(${post_id}, '${title}', '${content}')`,
      (err, rows) => {
        res.status(201).send(rows);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

routesPost.post("/post/", (req, res) => {
  const user_id = req.body.userId;
  const title = req.body.postTitle;
  const content = req.body.postContent;

  try {
    sql.query(
      `CALL AddPost(${user_id}, '${title}', '${content}')`,
      (err, rows) => {
        res.status(201).send(rows);
      }
    );
  } catch (error) {
    console.log(error);
  }
});

routesPost.delete("/post/", (req, res) => {
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
