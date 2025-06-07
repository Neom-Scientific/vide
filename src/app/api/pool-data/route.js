import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const hospital_name = searchParams.get('hospital_name');
    const parseList = (param) => {
        const val = searchParams.get(param);
        return val ? val.split(',').map(v => v.trim()).filter(Boolean) : [];
    };
    const testNames = parseList('application'); // Parse test names from query parameters
    const sample_ids = parseList('sample_id').map(id => parseInt(id, 10)).filter(Number.isInteger); // Ensure sample_ids are integers

    try {
        const response = [];
        const poolData = [];

        // Validate hospital_name
        if (!hospital_name) {
            response.push({
                status: 400,
                message: "Hospital name is required"
            });
        }

        // Validate testNames
        if (!testNames.length) {
            response.push({
                status: 400,
                message: "Test name is required"
            });
        }

        // Query by sample_ids if provided
        if (sample_ids.length > 0) {
            const { rows } = await pool.query(
                `SELECT * FROM pool_info WHERE sample_id = ANY($1::integer[]);`,
                [sample_ids]
            );

            if (rows.length === 0) {
                response.push({
                    status: 404,
                    message: `No pool data found for the provided sample IDs`
                });
            } else {
                poolData.push(...rows); // Add rows to the poolData array
            }
        }

        // If no sample_ids provided, query by hospital_name and testNames
        if (sample_ids.length === 0 && hospital_name && testNames.length > 0) {
            for (const testName of testNames) {
                const { rows } = await pool.query(
                    `SELECT * FROM pool_info WHERE hospital_name = $1 AND test_name = $2;`,
                    [hospital_name, testName]
                );

                if (rows.length === 0) {
                    response.push({
                        status: 404,
                        message: `No pool data found for hospital name "${hospital_name}" and test name "${testName}"`
                    });
                } else {
                    poolData.push(...rows); // Add rows to the poolData array
                }
            }
        }

        // Remove duplicate rows from poolData
        const uniquePoolData = Array.from(new Map(poolData.map(item => [item.sample_id, item])).values());

        // Return successful response
        response.push({
            status: 200,
            data: uniquePoolData
        });
        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching pool data:', error);
        return NextResponse.json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });
    }
}