import { pool } from "@/lib/db";
import { sendMail } from "@/lib/send-mail";
import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();
    const { name, hospital_name, email, phone_no ,username, password} = body;
    try {        
        let response = [];
        const result = await pool.query(
            'INSERT INTO request_form (name, hospital_name, username, password, phone_no, email, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [name, hospital_name, username, password, phone_no, email , "disable"]
        );
        if (result.rowCount > 0) {
            response.push({
                status: 200,
                message: 'Request submitted successfully',
            });

            await sendMail(
                process.env.ADMIN_EMAIL, // Send to admin email
                `Registration Request from ${hospital_name}`,
                `A new registration request has been submitted, following are the details:
                Name: ${name}
                Hospital Name: ${hospital_name}
                Email: ${email}
                
                please review the request and take appropriate action.
                
                Best regards,
                NEOM Scientific Solutions Team`,
            )
            
            

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
        const data = await pool.query('SELECT * FROM request_form where status = $1', ['disable']);
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

export async function PUT(request){
    const body = await request.json();
    const { id, status } = body;
    try{
        let response = [];
        if (!id || !status){
            response.push({
                status: 400,
                message: 'ID and status are required',
            });
        }
        if(status === 'disable'){
            await pool.query('UPDATE request_form SET status = $1 WHERE id = $2',['enable', id]);
            response.push({
                status: 200,
                message: 'Status updated successfully',
            });
        }
        else if(status === 'enable'){
            await pool.query('UPDATE request_form SET status = $1 WHERE id = $2',['disable', id]);
            response.push({
                status: 200,
                message: 'Status updated successfully',
            });
        }
        else{
            response.push({
                status: 400,
                message: 'Invalid status value',
            });
        }
        return NextResponse.json(response);
    }
    catch (error) {
        console.error('Error updating status', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}