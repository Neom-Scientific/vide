import { pool } from "@/lib/db";
import { sendMail } from "@/lib/send-mail";
import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();
    const { name, hospital_name, email, password, phone_no } = body.data;
    try {
        let response = [];
        let hospital_id = '101';
        const { rows } = await pool.query('SELECT * FROM request_form WHERE email = $1', [email]);
        let username = getUsername(rows.length);

        if (rows.length > 0) {
            response.push({
                status: 400,
                message: 'Email already exists',
            });
            return NextResponse.json(response);
        }

        if (!name || !hospital_name || !email || !phone_no || !password) {
            response.push({
                status: 400,
                message: 'All fields are required',
            });
            return NextResponse.json(response);
        }

        if (rows.length > 0) {
            const existingHospitalRows = await pool.query('SELECT hospital_name FROM request_form WHERE hospital_name = $1', [hospital_name]);
            if (existingHospitalRows.rows.length > 0) {
                hospital_id = existingHospitalRows.rows[0].hospital_id
            }
            else {
                hospital_id = rows[0].hospital_id; // Use the existing hospital_id if it exists
                hospital_id = (parseInt(hospital_id) + 1).toString(); // Increment the hospital_id}
            }
        }

        const result = await pool.query(
            'INSERT INTO request_form (name, hospital_name, hospital_id, username, password, phone_no, email, status, role, user_login) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [name, hospital_name, hospital_id, username, password, phone_no, email, "disable", "NormalUser", 0]
        );

        if (result.rowCount > 0) {
            response.push({
                status: 200,
                message: 'Request submitted successfully',
            });

            await sendMail(
                process.env.ADMIN_EMAIL, // Send to admin email
                `Registration Request from ${hospital_name}`,
                `
                <html>
                    <body>
                        <p>A new registration request has been submitted, following are the details:</p>
                        <ul>
                            <li><strong>Name:</strong> ${name}</li>
                            <li><strong>Organization Name:</strong> ${hospital_name}</li>
                            <li><strong>Email:</strong> ${email}</li>
                        </ul>
                        <p>Please review the request and take appropriate action.</p>
                        <p>Best regards,</p>
                        <p>NEOM Scientific Solutions Team</p>
                    </body>
                </html>
                `,
            )


            await sendMail(
                email,
                'Registration Request Submitted',
                `
                <html>
                  <body>
                    <p>Dear ${name},</p>
                    <p>Your registration request has been submitted successfully.</p>
                    <p><strong>Username:</strong> ${username}</p>
                    <p><strong>Password:</strong> ${password}</p>
                    <p>Please keep this information safe and do not share it with anyone.</p>
                    <p>Please wait for the admin to review your request.</p>
                    <p>Thank you,</p>
                    <p>NEOM Scientific Solutions Team</p>
                  </body>
                </html>
                `
            );

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
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // Default to 'NormalUser' if not provided
    const username = searchParams.get('username'); // Get username from query params 
    console.log('first', role, username);
    try {
        let response = [];
        if (role === 'SuperAdmin') {
            const data = await pool.query('SELECT * FROM request_form');
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
        }
        else {
            const data = await pool.query('SELECT * FROM request_form WHERE username = $1', [username]);
            if (data.rows.length === 0) {
                response.push({
                    status: 404,
                    message: 'No data found for the given username',
                });
            } else {
                response.push({
                    status: 200,
                    data: data.rows,
                });
            }
        }
        return NextResponse.json(response,);
    }
    catch (error) {
        console.error('Error executing query', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request) {
    const body = await request.json();
    const { id, status, role } = body; // Accept both status and role
    try {
        let response = [];

        // Validate the input
        if (!id) {
            response.push({
                status: 400,
                message: 'ID is required',
            });
            return NextResponse.json(response);
        }

        // Handle status update
        if (status) {
            if (status === 'disable') {
                await pool.query('UPDATE request_form SET status = $1 WHERE id = $2', ['enable', id]);
                response.push({
                    status: 200,
                    message: 'Status updated successfully',
                });
            } else if (status === 'enable') {
                await pool.query('UPDATE request_form SET status = $1 WHERE id = $2', ['disable', id]);
                response.push({
                    status: 200,
                    message: 'Status updated successfully',
                });
            } else {
                response.push({
                    status: 400,
                    message: 'Invalid status value',
                });
            }
        }

        // Handle role update
        if (role) {
            await pool.query('UPDATE request_form SET role = $1 WHERE id = $2', [role, id]);
            response.push({
                status: 200,
                message: 'Role updated successfully',
            });
        }

        // Return response
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error updating status or role', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function getUsername(count){
    const date = new Date();
    if(count === 0){
        count = 1; // Start with 1 if no previous entries
    }
    const yyyymmdd = date.toISOString().slice(0, 10).replace(/-/g, ''); // "20250616"
    const countStr = count.toString().padStart(2, '0'); // "01", "02", etc.
    return `${yyyymmdd}${countStr}`; // "2025061601"
}