import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const response = [];
        let pool_no = 'P_001';
        const poolData = await pool.query('SELECT pool_no FROM pool_info WHERE pool_no IS NOT NULL ORDER BY pool_no DESC LIMIT 1 FOR UPDATE');
        console.log('poolData:', poolData.rows);
        if (poolData.rows.length > 0) {
            const lastPoolNo = poolData.rows[0].pool_no;
            if (typeof lastPoolNo === "string" && lastPoolNo.includes("_")) {
                const lastNumber = parseInt(lastPoolNo.split('_')[1], 10);
                const newNumber = lastNumber + 1;
                console.log('lastNumber:', lastNumber, 'newNumber:', newNumber);
                pool_no = `P_${newNumber.toString().padStart(3, '0')}`;
            }
        }
        response.push({
            pool_no: pool_no,
            message: 'Pool number generated successfully.',
            status: 200
        });

        return NextResponse.json(response);
    }
    catch (error) {
        console.error("Error in GET /api/pool-no:", error);
        return NextResponse.json({
            message: 'An error occurred while processing your request.',
            status: 500
        })
    }
}