import AWS from "aws-sdk";
export const uploadtoS3 = async (stringifiedExpenses, filename) => {
  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  let s3bucket = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  });

  var params = {
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: stringifiedExpenses,
    ACL: "public-read",
  };
  try {
    const response = await s3bucket.upload(params).promise();
    console.log("File is uploaded successfully", response);
    return response;
  } catch (error) {
    console.log("Something went wrong", error);
    return null;
  }
};
