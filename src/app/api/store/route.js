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
            father_mother_name,
            spouse_name,
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
            selectedTestName,
            systolic_bp,
            diastolic_bp,
            total_cholesterol,
            hdl_cholesterol,
            ldl_cholesterol,
            diabetes,
            smoker,
            hypertension_treatment,
            statin,
            aspirin_therapy,
            tantive_report_date
        } = body;

        const today = new Date(registration_date || Date.now());
        const todayStr = today.toISOString().slice(0, 10);

        // Check if a project_id already exists for the hospital_name on the same day
        const existingProjectIdQuery = `
            SELECT project_id FROM master_sheet
            WHERE registration_date::date = $1 AND hospital_name = $2
            LIMIT 1
        `;
        const existingProjectIdResult = await pool.query(existingProjectIdQuery, [todayStr, hospital_name]);

        let project_id;
        if (existingProjectIdResult.rows.length > 0) {
            // Use the existing project_id
            project_id = existingProjectIdResult.rows[0].project_id;
        } else {
            // Generate a new project_id sequence
            const seqQuery = `
            SELECT project_id FROM master_sheet
            ORDER BY project_id DESC
            LIMIT 1
            `;
            const seqResult = await pool.query(seqQuery, [todayStr]);
            let nextSeq = 1;
            if (seqResult.rows.length > 0 && seqResult.rows[0].project_id) {
                // Extract the numeric part and increment
                const lastSeq = parseInt(seqResult.rows[0].project_id.replace("PI", ""), 10);
                nextSeq = lastSeq + 1;
            }
            project_id = `PI${String(nextSeq).padStart(4, "0")}`;
        }


        const data = await pool.query('SELECT sample_id FROM master_sheet WHERE sample_id = $1', [sample_id]);
        // if (data.rows.length > 0) {
        //     response.push({
        //         status: 400,
        //         message: "Sample ID already exists"
        //     });
        //     return NextResponse.json(response);
        // }

        let internal_id;
        const date = new Date(registration_date || Date.now());
        const year = date.getFullYear();
        
        if (selectedTestName === "Myeloid") {
            // Check if this sample_id already exists for Myeloid
            const existing = await pool.query(
                `SELECT internal_id FROM master_sheet WHERE sample_id = $1 AND test_name = $2`,
                [sample_id, "Myeloid"]
            );
        
            if (existing.rows.length > 0) {
                // Use the same numeric part, but change the suffix to the new sample_type
                const existingInternalId = existing.rows[0].internal_id;
                const numericPart = existingInternalId.split('-')[0];
                internal_id = `${numericPart}-${sample_type}`;
            } else {
                // Find the max numeric part for this year from the whole table
                const maxInternalIdQuery = `
                    SELECT MAX(CAST(SUBSTRING(CAST(internal_id AS TEXT), 5, 5) AS INTEGER)) AS max_seq
                    FROM master_sheet
                    WHERE LEFT(CAST(internal_id AS TEXT), 4) = $1
                `;
                const maxInternalIdResult = await pool.query(maxInternalIdQuery, [String(year)]);
                const maxSeq = maxInternalIdResult.rows[0]?.max_seq || 0;
                const nextSeq = maxSeq + 1;
                const numericPart = `${year}${String(nextSeq).padStart(5, '0')}`;
                internal_id = `${numericPart}-${sample_type}`;
            }
        } else {
            // Default logic for other test_names
            const maxInternalIdQuery = `
                SELECT MAX(CAST(SUBSTRING(CAST(internal_id AS TEXT), 5, 5) AS INTEGER)) AS max_seq
                FROM master_sheet
                WHERE LEFT(CAST(internal_id AS TEXT), 4) = $1
            `;
            const maxInternalIdResult = await pool.query(maxInternalIdQuery, [String(year)]);
            const maxSeq = maxInternalIdResult.rows[0]?.max_seq || 0;
            const nextSeq = maxSeq + 1;
            internal_id = `${year}${String(nextSeq).padStart(5, '0')}`;
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
                father_mother_name,
                spouse_name,
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
                internal_id,
                systolic_bp,
                diastolic_bp,
                total_cholesterol,
                hdl_cholesterol,
                ldl_cholesterol,
                diabetes,
                smoker,
                hypertension_treatment,
                statin,
                aspirin_therapy,
                dna_isolation,
                lib_prep,
                under_seq,
                seq_completed,
                tantive_report_date,
                hpo_status,
                annotation,
                project_id
            )
            VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, $16, $17, $18,
                $19, $20, $21, $22, $23, $24, $25,
                $26, $27, $28, $29, $30,
                $31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41, $42, $43, $44, $45, $46,$47, $48,$49,$50,$51,$52,$53,$54,$55
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
            father_mother_name,
            spouse_name,
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
            internal_id,
            systolic_bp || null,
            diastolic_bp || null,
            total_cholesterol || null,
            hdl_cholesterol || null,
            ldl_cholesterol || null,
            diabetes || null,
            smoker || null,
            hypertension_treatment || null,
            statin || null,
            aspirin_therapy || null,
            "No",
            "No",
            "No",
            "No",
            new Date(new Date(registration_date).getTime() + 7 * 24 * 60 * 60 * 1000) || null, // tantive_report_date = registration_date + 7 days
            "No", // hpo_status
            "No", // annotaion
            project_id,
        ];
        const result = await pool.query(query, values);
        const insertedData = result.rows[0];
        const insertedId = insertedData.id;

        response.push({
            status: 200,
            message: "Data inserted successfully",
            data: insertedId
        });

        return NextResponse.json(response);

    } catch (e) {
        console.log(e);
        return NextResponse.json({ error: "Failed to insert data" }, { status: 500 });
    }

}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const hospital_name = searchParams.get('hospital_name');
    try {
        let response = [];

        if (!role) {
            response.push({
                status: 400,
                message: 'Role is required',
            });
            return NextResponse.json(response);
        }

        if (role === 'SuperAdmin') {
            // Fetch all data for SuperAdmin
            const { rows } = await pool.query('SELECT * FROM master_sheet');
            if (rows.length === 0) {
                response.push({
                    status: 404,
                    message: 'No data found',
                });
            } else {
                response.push({
                    status: 200,
                    data: rows,
                });
            }
        } else if (hospital_name) {
            // Fetch data for a specific hospital
            const { rows } = await pool.query('SELECT * FROM master_sheet WHERE hospital_name = $1', [hospital_name]);
            if (rows.length === 0) {
                response.push({
                    status: 404,
                    message: 'No data found for the specified hospital',
                });
            } else {
                response.push({
                    status: 200,
                    data: rows,
                });
            }
        } else {
            response.push({
                status: 400,
                message: 'Organization Name is required for non-SuperAdmin roles',
            });
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error executing query', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request) {
    const body = await request.json();
    const { sample_id, updates } = body;
    try {
        const response = [];
        if (!sample_id || !updates || typeof updates !== "object") {
            response.push({
                status: 400,
                message: "Sample ID and updates are required.",
            });
            return NextResponse.json(response, { status: 400 });
        }

        // Only update fields that are present in the updates object (safe partial update)
        const updatesCleanedLower = {};
        Object.keys(updates).forEach(key => {
            // Only include fields that are not empty string or undefined
            if (updates[key] !== "" && updates[key] !== undefined) {
                updatesCleanedLower[key.toLowerCase()] = updates[key];
            } else if (updates[key] === null) {
                // Allow explicit nulling if frontend sends null
                // updatesCleanedLower[key.toLowerCase()] = null;
            }
        });

        const columns = Object.keys(updatesCleanedLower);
        const values = Object.values(updatesCleanedLower);
        values.push(sample_id);

        if (columns.length === 0) {
            response.push({
                status: 400,
                message: "No valid fields to update.",
            });
            return NextResponse.json(response, { status: 400 });
        }

        const setClause = columns.map((column, index) => `${column} = $${index + 1}`).join(", ");
        const query = `
            UPDATE master_sheet
            SET ${setClause}
            WHERE sample_id = $${columns.length + 1}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        if (result.rowCount === 0) {
            response.push({
                status: 404,
                message: "Sample ID not found or no updates made.",
            });
        } else {
            response.push({
                status: 200,
                message: "Data updated successfully.",
                data: result.rows[0]
            });
        }
        return NextResponse.json(response);
    } catch (error) {
        console.error("Error updating data:", error);
        return NextResponse.json(
            {
                status: 500,
                message: "Internal Server Error",
                error: error.message
            },
            { status: 500 }
        );
    }
}
