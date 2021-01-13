
import AWS from 'aws-sdk';

const s3 = new AWS.S3();

export const deleteFile = (imageKey: string) => {
    console.log('imageKey  ==>> ', imageKey)
    s3.deleteObject({
        Bucket: 'hanbok-app',
        Key: imageKey
    }, (err, data) => {
        if (err) throw err;
        console.log('s3 deleteObject ', data)
    })
}