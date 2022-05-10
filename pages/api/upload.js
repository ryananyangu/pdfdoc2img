var cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "200mb",
    },
  },
};

export default async function handler(req, res) {
  if (req.method === "POST") {
    let response = "";
    try {
      let fileStr = req.body.data;

      response = await cloudinary.uploader.upload(fileStr, {
        resource_type: "image",
        chunk_size: 6000000,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Something went wrong" });
    }

    res.status(200).json(response);
  }
}
