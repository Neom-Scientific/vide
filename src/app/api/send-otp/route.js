import { pool } from "@/lib/db";
import { sendMail } from "@/lib/send-mail";
import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();
    const { email } = body;
    let response = []
    try {
        const data = await pool.query('SELECT email FROM request_form')
        const emailExists = data.rows.some(row => row.email === email);
        if (emailExists) {
            response.push({
                status: 400,
                message: 'Email already exists',
            });
        }
        else {
            const otp = Math.floor(100000 + Math.random() * 900000);
            const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
            // store opt in database
            pool.query('INSERT INTO otp_data (otp,email,expiry_time) VALUES ($1, $2, $3)', [otp, email, expiryTime]);
            
            // delete otp after 10 minutes
            pool.query('DELETE FROM otp_data WHERE email = $1 AND expiry_time < NOW()', [email]);

            await sendMail(
                email,
                'Request Form Submission Confirmation',
                `
                Thank you for registering with us!

                Your One - Time Password(OTP) for completing the registration is:

                🔐 OTP: ${otp}

                This OTP is valid for the next 10 minutes.Please do not share this code with anyone.

                If you did not request this, please ignore this email or contact our support team immediately.

                Best regards,
                NEOM Scientific Solutions Team
            `
            )
            response.push({
                status: 200,
                message: 'OTP sent successfully',
            });
        }
        return NextResponse.json(response)
    }
    catch (error) {
        console.error('Error executing query', error);
        response.push({
            status: 500,
            message: 'Internal Server Error',
        });
        return NextResponse.json(response);
    }
}