import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    const {searchParams} = new URL(request.url);
    const hospital_name = searchParams.get('hospital_name');
    try{
        const response = [];
        if (!hospital_name) {
            response.push({
                status: 400,
                message: "Organization Name is required"
            });
        }
        const {rows} = await pool.query(
            `SELECT test_name, array_agg(sample_id) AS sample_ids 
             FROM pool_info 
             WHERE hospital_name = $1 AND run_id IS NULL
             GROUP BY test_name 
             ORDER BY test_name;`,
            [hospital_name]
        );
        // const {rows} = await pool.query(
        //     `SELECT DISTINCT test_name FROM pool_info WHERE hospital_name = $1 ORDER BY test_name;`,
        //     [hospital_name]
        // );
        if (rows.length === 0) {
            response.push({
                status: 404,
                message: "No test names found for the provided Organization Name"
            });
        }
        else{
            const data = rows.map(row => ({
                test_name: row.test_name,
                sample_ids: row.sample_ids || []
            }));
            response.push({
                status: 200,
                data: data
            });
        }
        return NextResponse.json(response);
    }
    catch (error){
        console.log('error', error);
        return NextResponse.json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });
    }
}