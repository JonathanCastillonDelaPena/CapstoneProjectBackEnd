const routesPost = require("express").Router();
const sql = require("../database/mySQL");
const multerUpload = require("../utils/multer");
const streamUpload = require("../utils/cloudinaryImageUpload");

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

routesPost.post(
  "/post/",
  multerUpload.single("image_file"),
  async (req, res) => {
    const user_id = req.body.user_id;
    const title = req.body.title;
    const content = req.body.content;
    let image_public_id = "";
    let image_url = "";

    if (req.file) {
      await streamUpload(req)
        .then((response) => {
          image_public_id = response.public_id;
          image_url = response.secure_url;

          console.log(`\nSuccess in uploading the image.`);
          console.log(response);
        })
        .catch((error) => {
          console.log(`\nError in uploading the image.`);
          console.log(error);

          res.status(error.http_code).send({ message: error.message });
        });
    }

    try {
      await sql.query(
        `CALL AddPost(${user_id}, '${title}', '${content}', '${image_public_id}', '${image_url}')`,
        (err, rows) => {
          res.status(201).send(rows);
        }
      );
    } catch (error) {
      console.log(`\nError in Calling the Stored Procedure: AddPost`);
      console.log(error);
    }
  }
);

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
