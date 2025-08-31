import { withAuth } from "@/utils/middleware";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const POST = withAuth(async (request) => {
  const body = await request.json();
  const dataUri = `data:image/jpeg;base64,${body.imageBase64}`;

  try {
    const res = await cloudinary.uploader.upload(dataUri, {
      folder: "calai",
      resource_type: "image",
    });

    return Response.json({
      ok: true,
      imageUrl: res.secure_url,
      publicId: res.public_id,
    });
  } catch (err) {
    console.log(err);
    return Response.json(
      { ok: false, error: (err as any).message },
      { status: 500 },
    );
  }
});
