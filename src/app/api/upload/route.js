import { google } from "googleapis";
import { NextResponse } from "next/server";
import { Readable } from "stream"; // <-- Add this import

export const config = {
    api: {
        bodyParser: false
    }
}

export async function POST(request) {
    const formData = await request.formData();
    const file = formData.get('file')
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = formData.get('fileName') || file.name;
    try { 
        const auth = new google.auth.GoogleAuth({
            credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
            scopes: ['https://www.googleapis.com/auth/drive']
        })
        const drive = google.drive({ version: 'v3', auth });
        const response = drive.files.create({
            requestBody: {
                name: fileName,
                parents: ['1xzTkB-k3PxEbGpvj4yoHXxBFgAtCLz1p']
            },
            media: {
                mimeType: file.type,
                body: Readable.from(fileBuffer) // <-- Use stream here
            },
            supportsAllDrives: true,
            driveId:'0AGcjkp59qA5iUk9PVA'
        });
        return NextResponse.json({
            message: "File uploaded successfully",
            fileId: (await response).data.id,
            status: 200
        });
    }
    catch (error) {
        return NextResponse.json({
            error: "Failed to upload file",
            message: error.message,
            status: 500
        })
    }
}