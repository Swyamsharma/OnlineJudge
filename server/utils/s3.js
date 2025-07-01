import { S3Client, PutObjectCommand, DeleteObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});
export const uploadToS3 = async (key, body) => {
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: body,
    });

    try {
        await s3Client.send(command);
        console.log(`Successfully uploaded to S3: ${key}`);
        return key;
    } catch (err) {
        console.error("S3 Upload Error:", err);
        throw new Error("Failed to upload file to S3.");
    }
};


export const deleteFromS3 = async (keys) => {
    if (!keys || keys.length === 0) {
        console.log("S3 Delete: No keys provided to delete.");
        return;
    }

    console.log(`S3 Delete: Attempting to delete ${keys.length} objects.`);
    console.log("Keys to delete:", keys);
    
    const command = new DeleteObjectsCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Delete: {
            Objects: keys.map(key => ({ Key: key })),
            Quiet: false,
        },
    });

    try {
        const output = await s3Client.send(command);
        
        if (output.Deleted && output.Deleted.length > 0) {
            console.log(`S3 Delete: Successfully deleted ${output.Deleted.length} objects.`);
        }

        if (output.Errors && output.Errors.length > 0) {
            console.error(`S3 Delete: Encountered ${output.Errors.length} errors.`);
            output.Errors.forEach(err => {
                console.error(`- Key: ${err.Key}, Code: ${err.Code}, Message: ${err.Message}`);
            });
            throw new Error("Encountered errors while deleting files from S3.");
        }

        if ((!output.Deleted || output.Deleted.length === 0) && (!output.Errors || output.Errors.length === 0)) {
            console.log("S3 Delete: No objects were deleted (they may not have existed).");
        }

    } catch (err) {
        console.error("S3 Batch Delete Command Failed:", err);
        throw new Error("Failed to execute delete command on S3.");
    }
};

export const downloadFromS3 = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
    });

    const streamToString = (stream) =>
        new Promise((resolve, reject) => {
            const chunks = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
        });

    try {
        const { Body } = await s3Client.send(command);
        return await streamToString(Body);
    } catch (err) {
        console.error(`S3 Download Error for key ${key}:`, err);
        throw new Error(`Failed to download file from S3: ${key}`);
    }
};