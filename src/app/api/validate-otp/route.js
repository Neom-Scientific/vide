import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    const body= await request.json();
    const { email, otp } = body;
    let response = {}
    try{
        const optData = await pool.query('SELECT * FROM otp_data WHERE email = $1', [email]);
        if (optData.rows.length === 0) {
            response = {
                status: 400,
                message: 'Invalid OTP',
            };
        } else {
            const { otp: storedOtp, expiry_time } = optData.rows[0];
            const currentTime = new Date();
            if (currentTime > expiry_time) {
                response = {
                    status: 400,
                    message: 'OTP expired',
                };
            } else if (String(storedOtp) !== String(otp)) {
                response = {
                    status: 400,
                    message: 'Invalid OTP',
                };
            } else if(storedOtp === otp) {
                console.log('otp matched');
                response = {
                    status: 200,
                    message: 'OTP validated successfully',
                };
            }
        }
        // delete otp after validation
        await pool.query('DELETE FROM otp_data WHERE email = $1', [email]);
        response = {
            status: 200,
            message: 'OTP validated successfully',
        };
    }
    catch (error) {
        console.error('Error executing query', error);
        response = {
            status: 500,
            message: 'Internal Server Error',
        };
    }
    return NextResponse.json(response, { status: response.status });
}