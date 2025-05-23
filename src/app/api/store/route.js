import { pool } from "@/lib/db";
import { NextResponse } from "next/server";


export async function POST(request) {
    const body = await request.json();
    let response = {};
    try {
        const {
            hospital_name,
            vial_received,
            specimen_quality,
            registration_date,
            sample_date,
            sample_type,
            trf,
            collection_date_time,
            storage_condition,
            prority,
            hospital_id,
            client_id,
            client_name,
            sample_id,
            patient_name,
            DOB,
            age,
            sex,
            ethnicity,
            father_husband_name,
            address,
            city,
            state,
            country,
            patient_mobile,
            docter_mobile,
            docter_name,
            email,
            test_name,
            remarks,
            clinical_history,
            repeat_required,
            repeat_reason,
            repeat_date,
            selectedTestName
        } = body;

        const data = await pool.query('select $1 from master_sheet',[sample_id]);
        const rows = data.rows.length;
        for (let i = 0; i < rows; i++) {
            if (data.rows[i].sample_id === sample_id) {
                response = {
                    status: 400,
                    message: "Sample ID already exists"
                };
                return NextResponse.json(response, { status: response.status });
            }
        }

        const date = new Date();
        
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const counter = await pool.query('select count(*) as count from master_sheet where hospital_id = $1 and EXTRACT(YEAR FROM registration_date) = $2 and EXTRACT(MONTH FROM registration_date) = $3', [hospital_id, year, month]);
        const counterValue = counter.rows[0]?.count || 0; // Default to 0 if no count exists
        const internal_id = `${year}${month}${String(counterValue + 1).padStart(3, '0')}`;
        const query = `
            INSERT INTO master_sheet (
                hospital_name,
                vial_received,
                specimen_quality,
                registration_date,
                sample_date,
                sample_type,
                trf,
                collection_date_time,
                storage_condition,
                prority,
                hospital_id,
                client_id,
                client_name,
                sample_id,
                patient_name,
                DOB,
                age,
                sex,
                ethnicity,
                father_husband_name,
                address,
                city,
                state,
                country,
                patient_mobile,
                docter_mobile,
                docter_name,
                email,
                test_name,
                remarks,
                clinical_history,
                repeat_required,
                repeat_reason,
                repeat_date,
                internal_id
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18,
                $19, $20, $21, $22, $23, $24, $25,
                $26, $27, $28, $29, $30,
                $31,$32,$33,$34,$35
            )
            RETURNING *
        `;
        const values = [
            hospital_name,
            vial_received,
            specimen_quality,
            registration_date || null,
            sample_date || null,
            sample_type,
            trf,
            collection_date_time || null,
            storage_condition,
            prority,
            hospital_id,
            client_id,
            client_name,
            sample_id,
            patient_name,
            DOB || null,
            age,
            sex,
            ethnicity,
            father_husband_name,
            address,
            city,
            state,
            country,
            patient_mobile,
            docter_mobile,
            docter_name,
            email,
            test_name,
            remarks,
            clinical_history,
            repeat_required,
            repeat_reason,
            repeat_date || null,
            internal_id
        ];
        const result = await pool.query(query, values);
        const insertedData = result.rows[0];
        const insertedId = insertedData.id;

        response = {
            status: 200,
            message: "Data inserted successfully",
            data:insertedId
        }

    } catch (e) {
        console.log(e);
        response = {
            status: 500,
            message: "Internal Server Error"
        };
    }
    return NextResponse.json(response, { status: response.status });

}