import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    const body= await request.json();
    const { sample_id, sample_indicator } = body;
    let response = {};
    try {
        const data = await pool.query('UPDATE master_sheet SET sample_indicator = $1 WHERE sample_id = $2', [sample_indicator, sample_id]);
        if (data.rowCount === 0) {
            response = {
                status: 404,
                message: "No data found"
            };
            return new NextResponse(response);
        } else {
            response = {
                status: 200,
                message: "Sample indicator updated successfully"
            };
            return new NextResponse(response);
        }
    } catch (error) {
        console.error("Error in update-sample-indicator API", error);
        response = {
            status: 500,
            message: "Internal server error"
        };
        return new NextResponse(response);
    }
}