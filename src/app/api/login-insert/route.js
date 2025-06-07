import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();
    const { username, password } = body;
    try {
        let response = [];

        const user = await pool.query('SELECT username from request_form WHERE username = $1', [username]);
        if (user.rowCount === 0) {
            response.push({
                status: 401,
                message: 'Username does not exist',
            });
            return NextResponse.json(response);
        }
        const userData = await pool.query('SELECT * FROM request_form WHERE username = $1', [username]);
        console.log('rows', userData.rows);
        const isPasswordValid = userData.rows[0].password === password;
        if (!isPasswordValid) {
            response.push({
                status: 401,
                message: 'Invalid password',
            });
        }
        const userEnable = userData.rows[0].status;
        if (userEnable === 'disable') {
            response.push({
                status: 401,
                message: 'Contact admin to enable your account',
            });
        }
        const result = await pool.query(
            'INSERT INTO login_data (username, password) VALUES ($1, $2)',
            [username, password]
        );
        if (result.rowCount > 0) {
            response.push({
                status: 200,
                data: {
                    username: userData.rows[0].username,
                    email: userData.rows[0].email,
                    hospital_name: userData.rows[0].hospital_name,
                    hospital_id: userData.rows[0].hospital_id,
                    role : userData.rows[0].role,
                },
                message: 'Login successful',
            });
        } else {
            response.push({
                status: 500,
                message: 'Failed to login',
            });
        }
        return NextResponse.json(response);
    }
    catch (error) {
        console.error('Error executing query', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}