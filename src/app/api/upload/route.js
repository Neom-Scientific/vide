// // app/api/upload/route.js
// import { google } from 'googleapis';
// import { NextResponse } from 'next/server';
// import { Readable } from 'stream';

// const CLIENT_ID = process.env.CLIENT_ID_GOOGLE_DRIVE;
// const CLIENT_SECRET = process.env.CLIENT_SECRET_GOOGLE_DRIVE;
// // const REDIRECT_URI = process.env.REDIRECT_URI_GOOGLE_DRIVE;
// const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

// const REFRESH_TOKEN = process.env.REFRESH_TOKEN_GOOGLE_DRIVE;

// const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
// oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// const drive = google.drive({ version: 'v3', auth: oauth2Client });
// console.log('drive', drive.context._options.auth);

// export async function POST(req) {
//   const formData = await req.formData();
//   const file = formData.get('file');

//   console.log('file', file);
//   const buffer = Buffer.from(await file.arrayBuffer());

//   // Convert the buffer into a readable stream
//   const stream = Readable.from(buffer);

//   try {
//     const response = await drive.files.create({
//       requestBody: {
//         name: file.name,
//         mimeType: file.type,
//       },
//       media: {
//         mimeType: file.type,
//         body: stream, // Use the readable stream here
//       },
//     });

//     // Send the file URL so that it can be used in the frontend
//     console.log('File uploaded successfully:', response.data);
//     return NextResponse.json({ success: true, fileId: response.data.id });
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     return NextResponse.json({ success: false, error: error.message });
//   }
// }

// import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
// import { NextResponse } from "next/server";
// import { storage } from "../../../../firebaseConfig";

// export async function POST(req) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get('file');
//     console.log('file', file);

//     // Convert the file into a Buffer
//     const buffer = Buffer.from(await file.arrayBuffer());

//     // Create a reference to the file in Firebase Storage
//     const storageRef = ref(storage, `uploads/${file.name}`);

//     // Upload the file to Firebase Storage
//     const snapshot = await uploadBytes(storageRef, buffer, { contentType: file.type });

//     // Get the download URL
//     const url = await getDownloadURL(snapshot.ref);

//     return NextResponse.json({ success: true, fileUrl: url });
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     return NextResponse.json({ success: false, error: error.message });
//   }
// }

import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import  {s3}  from '../../../../S3clientConfig';

export async function POST(request){
    const body = await request.formData();
    const file = body.get('file');
    console.log('file', file);
    try{
      const response = [];
       if(!file){
        response.push({
          message: 'No file provided',
          status:404
        })
       }
        const buffer = Buffer.from(await file.arrayBuffer());
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `uploads/${file.name}`,
            Body: buffer,
            ContentType: file.type
        };
        const command = new PutObjectCommand(params);
        const data = await s3.send(command);
        console.log('File uploaded successfully:', data);
        const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/uploads/${file.name}`;
        response.push({
            message: 'File uploaded successfully',
            status: 200,
            fileUrl: fileUrl
        });

        return NextResponse.json(response);

    }
    catch(error){
        console.error('Error uploading file:', error);
        return NextResponse.json({ success: false, error: error.message });
    }
}