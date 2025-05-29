import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    const body= await request.json();
    const { username, password } = body;
    try{
        let response = [];
        const userData = await pool.query('SELECT password FROM request_form WHERE username = $1', [username]);
        if (userData.rowCount === 0) {
            response.push({
                status: 401,
                message: 'Username does not exist',
            });
        }
        const isPasswordValid = userData.rows[0].password === password;
        if (!isPasswordValid) {
            response.push({
                status: 401,
                message: 'Invalid password',
            });
        }
        const result = await pool.query(
            'INSERT INTO login (username, password) VALUES ($1, $2)',
            [username, password]
        );
        if (result.rowCount > 0) {
            response.push({
                status: 200,
                message: 'Login successful',
            });
        } else {
            response.push({
                status: 500,
                message: 'Failed to login',
            });
        }
        return NextResponse(response);
    }
    catch (error) {
        console.error('Error executing query', error);
        return new NextResponse({error: 'Internal Server Error'}, { status: 500 });
    }
}