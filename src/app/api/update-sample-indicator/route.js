import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();
    const { sample_id, sample_indicator, test_name } = body;
    let response = [];
    try {
        if (!sample_id || !sample_indicator || sample_indicator.length === 0 || !test_name) {
            response.push({
                status: 400,
                message: "sample_id, sample_indicator, and test_name are required"
            });
        }
        console.log('sample_id:', sample_id);
        console.log('sample_indicator:', sample_indicator);
        console.log('test_name:', test_name);

        const data = await pool.query(`SELECT sample_id FROM master_sheet`);
        const sampleExists = data.rows.some(row => row.sample_id === sample_id);
        if (!sampleExists) {
            response.push({
                status: 404,
                message: "Sample ID not found"
            });
        }

        if (sample_indicator === 'lib_prep' && test_name.includes('Myeloid')) {
            const {
                qubit_hs,
                conc_rxn,
                i5_index_reverse,
                i7_index,
                lib_qubit,
                nm_conc,
                nfw_volu_for_2nm,
                total_vol_for_2nm
            } = body;

            // Validate that all required fields are present
            if (
                qubit_hs === undefined ||
                conc_rxn === undefined ||
                i5_index_reverse === undefined ||
                i7_index === undefined ||
                lib_qubit === undefined ||
                nm_conc === undefined ||
                nfw_volu_for_2nm === undefined ||
                total_vol_for_2nm === undefined
            ) {
                response.push({
                    status: 400,
                    message: "All related fields are required to update lib_prep to 'yes'"
                });
                return NextResponse.json(response);
            }

            // Build dynamic query for partial updates
            const fields = [];
            const values = [];
            let index = 1;

            fields.push(`qubit_hs = $${index++}`);
            values.push(qubit_hs);

            fields.push(`conc_rxn = $${index++}`);
            values.push(conc_rxn);

            fields.push(`i5_index_reverse = $${index++}`);
            values.push(i5_index_reverse);

            fields.push(`i7_index = $${index++}`);
            values.push(i7_index);

            fields.push(`lib_qubit = $${index++}`);
            values.push(lib_qubit);

            fields.push(`nm_conc = $${index++}`);
            values.push(nm_conc);

            fields.push(`nfw_volu_for_2nm = $${index++}`);
            values.push(nfw_volu_for_2nm);

            fields.push(`total_vol_for_2nm = $${index++}`);
            values.push(total_vol_for_2nm);

            // Add lib_prep and sample_id to the query
            fields.push(`lib_prep = $${index++}`);
            values.push("yes");
            values.push(sample_id);

            const query = `
                UPDATE master_sheet
                SET ${fields.join(", ")}
                WHERE sample_id = $${index}
            `;

            const result = await pool.query(query, values);
            response.push({
                status: 200,
                message: "Sample indicator updated successfully",
                rowsAffected: result.rowCount
            });
        } else {
            response.push({
                status: 400,
                message: "Invalid sample_indicator or test_name"
            });
        }

        return NextResponse.json(response);
    } catch (error) {
        console.error("Error in update-sample-indicator API", error);
        response = {
            status: 500,
            message: "Internal server error"
        };
        return NextResponse.json(response);
    }
}