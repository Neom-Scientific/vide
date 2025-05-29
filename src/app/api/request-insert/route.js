import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(request) {
    const body = await request.json();
    const { name, hospital_name, email, phone_no ,username, password} = body;
    try {        
        let response = [];
        const result = await pool.query(
            'INSERT INTO request_form (name, hospital_name, username, password, phone_no, email) VALUES ($1, $2, $3, $4, $5, $6)',
            [name, hospital_name, username, password, phone_no, email]
        );
        if (result.rowCount > 0) {
            response.push({
                status: 200,
                message: 'Request submitted successfully',
            });
            
            

        } else {
            response.push({
                status: 500,
                message: 'Failed to submit request',
            });

        }
        return NextResponse.json(response)
    }
    catch (error) {
        console.error('Error executing query', error);
        return NextResponse.json({error: 'Internal Server Error'}, { status: 500 });
    }
}

export async function GET(request) {
    try {
        let response = [];
        const data = await pool.query('SELECT * FROM request_form where username IS NULL')
        if (data.rows.length === 0) {
            response.push({
                status: 404,
                message: 'No data found',
            });
        } else {
            response.push({
                status: 200,
                data: data.rows,
            });
        }
        return NextResponse.json(response, );
    }
    catch (error) {
        console.error('Error executing query', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}