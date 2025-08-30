import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

export const getUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: fileName,
      ContentType: fileType,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    res.json({ uploadUrl: url, key: uniqueFileName });
  } catch (err) {
    console.error("Error generating upload URL", err);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
};
