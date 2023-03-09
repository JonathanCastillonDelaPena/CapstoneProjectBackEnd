const routesPost = require("express").Router();
const { response } = require("express");
const sql = require("../database/mySQL");
const uploadImage = require("../utils/cloudinaryImageUpload");

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
  const post_id = req.body.post_id;
  const title = req.body.title;
  const content = req.body.content;

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

routesPost.post("/post/", async (req, res) => {
  const user_id = req.body.user_id;
  const title = req.body.title;
  const content = req.body.content;
  let image_public_id = "";
  let image_url = "";

  // Upload the image file to Cloudinary first.
  await uploadImage(req.body.image_file)
    .then((response) => {
      if (response.error) {
        console.log(`\nFailed to upload image.`);
        console.log(response.error);
      }

      image_public_id = response.public_id;
      image_url = response.secure_url;
    })
    .catch((error) => {
      console.log(error);
    });

  try {
    await sql.query(
      `CALL AddPost(${user_id}, '${title}', '${content}', '${image_public_id}', '${image_url}')`,
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
