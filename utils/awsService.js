import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

export async function uploadTextFile({ stringifiedExpenses, filename }) {
  const command = new PutObjectCommand({
    Bucket: "expense.tracker.1",
    Key: filename,
    Body: stringifiedExpenses,
    ContentType: "text/plain",
  });

  try {
    const response = await s3Client.send(command);
    const url = `https://s3.ap-south-1.amazonaws.com/expense.tracker.1/${filename}`;

    return url;
  } catch (error) {
    console.error("Error uploading file:", error);
    return null;
  }
}
