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

    try {
        const response = [];

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

        // Remove commas from test names
        testNames.forEach((test, index) => {
            testNames[index] = test.replace(/,/g, '');
        });

        // Query for each test name
        const poolData = [];
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

        // If no data found for any test name
        if (poolData.length === 0) {

            response.push({
                status: 404,
                message: `No pool data found for hospital name "${hospital_name}" and provided test names`
            });
        }

        // Return successful response
        response.push({
            status: 200,
            data: poolData
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