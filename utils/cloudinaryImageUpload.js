const cloudinary = require("../database/cloudinary");

const uploadImage = (image_file) => {
  return cloudinary.uploader.upload(image_file, {
    folder: "/Capstone/Posts",
  });

  //   return cloudinary.uploader.upload(
  //     "https://images.pexels.com/photos/1683492/pexels-photo-1683492.jpeg?auto=compress&cs=tinysrgb&w=600",
  //     {
  //       folder: "/Capstone/Posts",
  //     }
  //   );
};

module.exports = uploadImage;
