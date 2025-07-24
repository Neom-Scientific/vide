import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const sample_id = searchParams.get('sample_id');
    const response = [];
    try {
        if (!sample_id) {
            response.push({
                message: 'sample_id is required',
                status: 400
            });
            return NextResponse.json(response);
        }
        const data = await pool.query('SELECT * FROM audit_logs WHERE sample_id = $1 order by id', [sample_id]);
        if (data.rows.length > 0) {
            response.push({
                message: 'Audit logs fetched successfully',
                status: 200,
                logs: data.rows
            });
        } else {
            response.push({
                message: 'No audit logs found for this sample',
                status: 404
            });
        }
        return NextResponse.json(response);
    }
    catch (e) {
        console.log('error', e);
        return NextResponse.json({ error: "Failed to fetch audit logs", status: 500 });
    }
}

export async function POST(request) {
    const body = await request.json();
    const { sample_id, comments, changed_by, changed_at } = body;
    const response = [];
    try {
        if (!sample_id) {
            response.push({
                message: 'sample_id is required',
                status: 400
            });
            return NextResponse.json(response);
        }
        const data = await pool.query(
            'INSERT INTO audit_logs (sample_id, comments, changed_by, changed_at) VALUES ($1, $2, $3, $4) RETURNING *',
            [sample_id, comments, changed_by, changed_at]
        );
        if (data.rows.length > 0) {
            response.push({
                message: 'Audit log added successfully',
                status: 201,
                log: data.rows[0]
            });
        } else {
            response.push({
                message: 'Failed to add audit log',
                status: 500
            });
        }
        return NextResponse.json(response);
    }
    catch (e) {
        console.log('error', e);
        return NextResponse.json({ error: "Failed to add audit log", status: 500 });
    }

}