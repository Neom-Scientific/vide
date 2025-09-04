// import { google } from "googleapis";
// import { NextResponse } from "next/server";
// import { Readable } from "stream"; // <-- Add this import

// export const config = {
//     api: {
//         bodyParser: false
//     }
// }

// export async function POST(request) {
//     const formData = await request.formData();
//     const file = formData.get('file')
//     const fileBuffer = Buffer.from(await file.arrayBuffer());
//     const fileName = formData.get('fileName') || file.name;
//     try { 
//         const auth = new google.auth.GoogleAuth({
//             credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
//             scopes: ['https://www.googleapis.com/auth/drive']
//         })
//         const drive = google.drive({ version: 'v3', auth });
//         const response = drive.files.create({
//             requestBody: {
//                 name: fileName,
//                 parents: ['1xzTkB-k3PxEbGpvj4yoHXxBFgAtCLz1p']
//             },
//             media: {
//                 mimeType: file.type,
//                 body: Readable.from(fileBuffer) // <-- Use stream here
//             },
//             supportsAllDrives: true,
//             driveId:'0AGcjkp59qA5iUk9PVA'
//         });
//         return NextResponse.json({
//             message: "File uploaded successfully",
//             fileId: (await response).data.id,
//             status: 200
//         });
//     }
//     catch (error) {
//         return NextResponse.json({
//             error: "Failed to upload file",
//             message: error.message,
//             status: 500
//         })
//     }
// }


// import { NextResponse } from 'next/server';
// import path from 'path';
// import fs from 'fs';
// import Busboy from 'busboy';

// export const POST = async (req) => {
//   const response = [];

//   const contentType = req.headers.get
//     ? req.headers.get('content-type')
//     : req.headers['content-type'];

//   if (!contentType) {
//     return NextResponse.json({ message: 'Missing Content-Type', status: 400 });
//   }

//   return new Promise((resolve, reject) => {
//     const busboy = Busboy({ headers: { 'content-type': contentType } });

//     let uploadPath = '';
//     const safeBasePath = path.resolve('./uploads');

//     busboy.on('field', (fieldname, val) => {
//       if (fieldname === 'uploadPath') {
//         const resolvedPath = path.resolve(safeBasePath, val);
//         if (!resolvedPath.startsWith(safeBasePath)) {
//           response.push({ message: 'Invalid upload path', status: 400 });
//           reject(NextResponse.json(response));
//         } else {
//           uploadPath = resolvedPath;
//           fs.mkdirSync(uploadPath, { recursive: true });
//         }
//       }
//     });

//     busboy.on('file', (fieldname, file, filename) => {
//       if (!uploadPath) {
//         response.push({ message: 'Upload path not provided', status: 400 });
//         reject(NextResponse.json(response));
//         return;
//       }

//       const filePath = path.join(uploadPath, filename);
//       const writeStream = fs.createWriteStream(filePath);
//       file.pipe(writeStream);

//       writeStream.on('close', () => {
//         response.push({ message: 'File uploaded successfully', path: filePath, status: 200 });
//         resolve(NextResponse.json(response));
//       });

//       writeStream.on('error', (err) => {
//         console.error('File write error:', err);
//         response.push({ message: 'File write error', status: 500 });
//         reject(NextResponse.json(response));
//       });
//     });

//     req.body.pipe(busboy);
//   });
// };

import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(request) {
  try {
    const response = []
    const formData = await request.formData();
    const file = formData.get('file');
    const uploadPath = formData.get('uploadPath') || '';
    // console.log('uploadPath', uploadPath);
    // console.log('file', file);
    if (!file || typeof file === 'string') {
      response.push({ message: 'No file uploaded', status: 400 });
      return NextResponse.json(response);
    }

    const filePath = path.join(uploadPath, file.name);
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);
    response.push({ message: 'File uploaded successfully', path: filePath, status: 200 });

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json({ message: error.message, status: 500 });
  }
}
