import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const parseList = (param) => {
        const val = searchParams.get(param);
        return val ? val.split(',').map(v => v.trim()).filter(Boolean) : [];
    };
    const sample_ids = parseList('sample_id');
    const test_names = parseList('test_name');
    const run_ids = parseList('run_id');
    const sample_statuses = parseList('sample_status');
    const sample_indicators = parseList('sample_indicator');
    const doctor_names = parseList('doctor_name');
    const dept_names = parseList('dept_name');
    const from_dates = parseList('from_date');
    const to_dates = parseList('to_date');

    let response = {};
    let where = [];
    let values = [];
    let idx = 1;

    if (
        !sample_ids.length && !test_names.length && !run_ids.length &&
        !sample_statuses.length && !sample_indicators.length &&
        !doctor_names.length && !dept_names.length && !from_dates.length && !to_dates.length
    ) {
        response = {
            status: 400,
            message: "Please provide at least one search parameter"
        };
        return NextResponse.json(response, { status: response.status });
    }

    // Check if the date range is valid
    if (from_dates.length && to_dates.length) {
        const fromDate = new Date(from_dates[0]);
        const toDate = new Date(to_dates[0]);
        if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
            response = {
                status: 400,
                message: "Invalid date format"
            };
            return NextResponse.json(response, { status: response.status });
        }
        if (fromDate > toDate) {
            response = {
                status: 400,
                message: "From date cannot be greater than To date"
            };
            return NextResponse.json(response, { status: response.status });
        }
    }

    if (sample_ids.length) {
        where.push(`sample_id IN (${sample_ids.map(() => `$${idx++}`).join(',')})`);
        values.push(...sample_ids);
    }
    if (test_names.length) {
        where.push(`test_name IN (${test_names.map(() => `$${idx++}`).join(',')})`);
        values.push(...test_names);
    }
    if (run_ids.length) {
        where.push(`run_id IN (${run_ids.map(() => `$${idx++}`).join(',')})`);
        values.push(...run_ids);
    }
    if (sample_statuses.length) {
        where.push(`sample_status IN (${sample_statuses.map(() => `$${idx++}`).join(',')})`);
        values.push(...sample_statuses);
    }
    if (sample_indicators.length) {
        where.push(`sample_indicator IN (${sample_indicators.map(() => `$${idx++}`).join(',')})`);
        values.push(...sample_indicators);
    }
    if (doctor_names.length) {
        where.push(`doctor_name IN (${doctor_names.map(() => `$${idx++}`).join(',')})`);
        values.push(...doctor_names);
    }
    if (dept_names.length) {
        where.push(`dept_name IN (${dept_names.map(() => `$${idx++}`).join(',')})`);
        values.push(...dept_names);
    }
    if (from_dates.length && to_dates.length) {
        where.push(`sample_date BETWEEN $${idx++} AND $${idx++}`);
        values.push(from_dates[0], to_dates[0]);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const query = `SELECT * FROM master_sheet ${whereClause}`;

    try {
        const data = await pool.query(query, values);
        if (data.rows.length === 0) {
           response = {
                status: 404,
                message: "No data found"
            };
            return NextResponse.json(response, { status: response.status });
        } else {
            response = {
                status: 200,
                data: data.rows
            };
            console.log("Data found", data.rows);
            return NextResponse.json(response, { status: response.status });
        }
    } catch (error) {
        console.error("Error in search API", error);
        response = {
            status: 500,
            message: "Internal server error"
        };
        return NextResponse.json(response, { status: response.status });
    }
}

// import { pool } from "@/lib/db";
// import { NextResponse } from "next/server";

// export async function GET(request) {
//     const { searchParams } = new URL(request.url);
//     const parseList = (param) => {
//         const val = searchParams.get(param);
//         return val ? val.split(',').map(v => v.trim()).filter(Boolean) : [];
//     };
//     const sample_ids = parseList('sample_id');
//     const test_names = parseList('test_name');
//     const run_ids = parseList('run_id');
//     const sample_statuses = parseList('sample_status');
//     const sample_indicators = parseList('sample_indicator');
//     const doctor_names = parseList('doctor_name');
//     const dept_names = parseList('dept_name');
//     const from_dates = parseList('from_date');
//     const to_dates = parseList('to_date');

//     let where = [];
//     let values = [];
//     let idx = 1;

//     if (
//         !sample_ids.length && !test_names.length && !run_ids.length &&
//         !sample_statuses.length && !sample_indicators.length &&
//         !doctor_names.length && !dept_names.length && !from_dates.length && !to_dates.length
//     ) {
//         return NextResponse.json({
//             status: 400,
//             message: "Please provide at least one search parameter"
//         }, { status: 400 });
//     }

//     if (sample_ids.length) {
//         where.push(`sample_id IN (${sample_ids.map(() => `$${idx++}`).join(',')})`);
//         values.push(...sample_ids);
//     }
//     if (test_names.length) {
//         where.push(`test_name IN (${test_names.map(() => `$${idx++}`).join(',')})`);
//         values.push(...test_names);
//     }
//     if (run_ids.length) {
//         where.push(`run_id IN (${run_ids.map(() => `$${idx++}`).join(',')})`);
//         values.push(...run_ids);
//     }
//     if (sample_statuses.length) {
//         where.push(`sample_status IN (${sample_statuses.map(() => `$${idx++}`).join(',')})`);
//         values.push(...sample_statuses);
//     }
//     if (sample_indicators.length) {
//         where.push(`sample_indicator IN (${sample_indicators.map(() => `$${idx++}`).join(',')})`);
//         values.push(...sample_indicators);
//     }
//     if (doctor_names.length) {
//         where.push(`doctor_name IN (${doctor_names.map(() => `$${idx++}`).join(',')})`);
//         values.push(...doctor_names);
//     }
//     if (dept_names.length) {
//         where.push(`dept_name IN (${dept_names.map(() => `$${idx++}`).join(',')})`);
//         values.push(...dept_names);
//     }
//     if (from_dates.length && to_dates.length) {
//         where.push(`sample_date BETWEEN $${idx++} AND $${idx++}`);
//         values.push(from_dates[0], to_dates[0]);
//     }

//     const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
//     const query = `SELECT * FROM master_sheet ${whereClause}`;

//     try {
//         const data = await pool.query(query, values);
//         if (data.rows.length === 0) {
//             return NextResponse.json({
//                 status: 404,
//                 message: "No data found"
//             }, { status: 404 });
//         } else {
//             return NextResponse.json({
//                 status: 200,
//                 data: data.rows
//             });
//         }
//     } catch (error) {
//         console.error("Error in search API", error);
//         return NextResponse.json({
//             status: 500,
//             message: "Internal server error"
//         }, { status: 500 });
//     }
// }