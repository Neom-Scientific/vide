import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PUT(request) {
    const body = await request.json();
    const { name, hospital_name, email, phone_no ,username, password} = body;
    let response = {}
    try {        
        const result = await pool.query(
            'INSERT INTO request_form (name, hospital_name, username, password, phone_no, email) VALUES ($1, $2, $3, $4, $5, $6)',
            [name, hospital_name, username, password, phone_no, email]
        );
        if (result.rowCount > 0) {
            response = {
                status: 200,
                message: 'Request submitted successfully',
            };
            
            

        } else {
            response = {
                status: 500,
                message: 'Failed to submit request',
            };

        }
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

export async function GET(request) {
    let response = {}
    try {
        const data = await pool.query('SELECT * FROM request_form where username IS NULL')
        if (data.rows.length === 0) {
            response = {
                status: 404,
                message: 'No data found',
            };
        } else {
            response = {
                status: 200,
                data: data.rows,
            };
        }
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