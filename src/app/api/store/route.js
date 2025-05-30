import { pool } from "@/lib/db";
import { NextResponse } from "next/server";


export async function POST(request) {
    const body = await request.json();
    try {
        let response = [];
        const {
            hospital_name,
            dept_name,
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
            doctor_mobile,
            doctor_name,
            email,
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
                response.push({
                    status: 400,
                    message: "Sample ID already exists"
                });
                return NextResponse.json(response, { status: response.status });
            }
        }

        const date = new Date();
        

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Pad month to two digits
        const maxInternalIdQuery = `
          SELECT MAX(CAST(SUBSTRING(CAST(internal_id AS TEXT), 7, 3) AS INTEGER)) AS max_id
          FROM master_sheet
          WHERE hospital_id = $1
            AND EXTRACT(YEAR FROM registration_date) = $2
            AND EXTRACT(MONTH FROM registration_date) = $3
        `;
        const maxInternalIdResult = await pool.query(maxInternalIdQuery, [hospital_id, year, month]);
        const maxInternalId = maxInternalIdResult.rows[0]?.max_id || 0; // Default to 0 if no max_id exists
        const internal_id = `${year}${month}${String(maxInternalId + 1).padStart(3, '0')}`;
        console.log('internal_id', internal_id);
        // Check if internal_id already exists
        const data2 = await pool.query('SELECT internal_id FROM master_sheet');
        const existingInternalIds = data2.rows.map(row => row.internal_id);
        if (existingInternalIds.includes(internal_id)) {
            response.push({
                status: 400,
                message: "Internal ID already exists"
            });
            return NextResponse.json(response, { status: response.status });
        }
        const query = `
            INSERT INTO master_sheet (
                hospital_name,
                dept_name,
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
                doctor_mobile,
                doctor_name,
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
                $31,$32,$33,$34,$35,$36
            )
            RETURNING *
        `;
        const values = [
            hospital_name,
            dept_name || null,
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
            doctor_mobile,
            doctor_name,
            email,
            selectedTestName,
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

        response.push({
            status: 200,
            message: "Data inserted successfully",
            data:insertedId
        });

        return NextResponse.json(response);

    } catch (e) {
        console.log(e);
        return NextResponse.json({error: "Failed to insert data"}, {status: 500});
    }

}