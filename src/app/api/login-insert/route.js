import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    const body= await request.json();
    const { username, password } = body;
    let response = {}
    try{
        const userData = await pool.query('SELECT password FROM request_form WHERE username = $1', [username]);
        if (userData.rowCount === 0) {
            response = {
                status: 401,
                message: 'Username does not exist',
            };
            return new NextResponse(response, { status: response.status });
        }
        const isPasswordValid = userData.rows[0].password === password;
        if (!isPasswordValid) {
            response = {
                status: 401,
                message: 'Invalid password',
            };
            return new NextResponse(response, { status: response.status });
        }
        const result = await pool.query(
            'INSERT INTO login (username, password) VALUES ($1, $2)',
            [username, password]
        );
        if (result.rowCount > 0) {
            response = {
                status: 200,
                message: 'Login successful',
            };
            return new NextResponse(response, { status: response.status });
        } else {
            response = {
                status: 500,
                message: 'Failed to login',
            };
            return new NextResponse(response, { status: response.status });
        }
    }
    catch (error) {
        console.error('Error executing query', error);
        response = {
            status: 500,
            message: 'Internal Server Error',
        };
        return new NextResponse(response, { status: response.status });
    }
}