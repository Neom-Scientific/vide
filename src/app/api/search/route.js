import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();
    const {sample_id,test_name,from_data,to_data,run_id,sample_status,sample_indicator,doctor_name,dept_name} = body;
    let response = {};
    try {
    // search for the data which is provided in the body
        const data = await pool.query('select * from master_sheet where sample_id = $1 or test_name = $2 or run_id = $3 or sample_status = $4 or sample_indicator = $5 or doctor_name = $6 or dept_name = $7 and (sample_date between $8 and $9)', [sample_id,test_name,run_id,sample_status,sample_indicator,doctor_name,dept_name,from_data,to_data]);
        const rows = data.rows.length;
        if (rows === 0) {
            response = {
                status: 404,
                message: "No data found"
            };
            return new NextResponse(response);
        } else {
            response = {
                status: 200,
                data: data.rows
            };
            return new NextResponse(response);
        }
    } catch (error) {
        console.error("Error in search API", error);
        response = {
            status: 500,
            message: "Internal server error"
        };
        return new NextResponse(response);
    }
}