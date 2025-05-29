import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();
    const { rows, testName } = body;
    try {
        const response = []
        let pool_no ='P_001';
        const poolData = await pool.query('SELECT pool_no FROM pool_info');
       if (poolData.rows.length === 0) {
            pool_no = 'P_001'; // Default pool number if no records exist
        }
        else {
            const lastPoolNo = poolData.rows[0].pool_no;
            const lastNumber = parseInt(lastPoolNo.split('_')[1], 10);
            const newNumber = lastNumber + 1;
            pool_no = `P_${newNumber.toString().padStart(3, '0')}`; // Increment and format the pool number
        }

        if (testName === "Myeloid") {

            for (let i = 0; i < rows.length; i++) {
                const sample_id = rows[i].sample_id;
                const Qubit_hs = rows[i].Qubit_hs;
                const conc_rxn = rows[i].conc_rxn;
                const barcode = rows[i].barcode;
                const i5_index_reverse = rows[i].i5_index_reverse;
                const i7_index = rows[i].i7_index;
                const lib_qubit = rows[i].lib_qubit;
                const nM_conc = rows[i].nM_conc;
                const volumefromStock_lib = rows[i].volumefromStock_lib;
                const nfw_volu_for_2nM = rows[i].nfw_volu_for_2nM;
                const total_vol_for_2nM = rows[i].total_vol_for_2nM;
                const size = rows[i].size;
                if (!sample_id) {
                    response.push({
                        message: 'Sample Id is required',
                        status: 400
                    });
                } else {
                    const data = await pool.query('SELECT sample_id FROM pool_info WHERE sample_id = $1', [sample_id]);
                    const sampleExists = data.rows.length > 0;
                    if (sampleExists) {
                        response.push({
                            message: 'Sample Id exists',
                            status: 404
                        });
                    } else {
                        await pool.query(
                            `INSERT INTO pool_info (sample_id, Qubit_hs, "conc/rxn", barcode, i5_index_reverse, i7_index, lib_qubit, nM_conc, volumefromStock_lib, nfw_volu_for_2nM, total_vol_for_2nM, pool_no,size,test_name)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,$11, $12, $13, $14)`,
                            [sample_id, Qubit_hs, conc_rxn, barcode, i5_index_reverse, i7_index, lib_qubit, nM_conc, volumefromStock_lib, nfw_volu_for_2nM, total_vol_for_2nM, pool_no, size],testName
                        );
                        response.push({
                            message: 'Sample indicator updated successfully',
                            status: 200
                        });
                    }
                }
            }
        }
        else if (testName === "WES" ||
            testName === "CS" ||
            testName === "Clinical Exome" ||
            testName === "Cardio Comprehensive (Screening Test)" ||
            testName === "Cardio Metabolic Syndrome (Screening Test)" ||
            testName === "Cardio Comprehensive Myopathy") {
               
            for (let i = 0; i < rows.length; i++) {
                const sample_id = rows[i].sample_id;
                const Qubit_dna_hs = rows[i].Qubit_dna_hs;
                const per_rxn_gdna = rows[i].per_rxn_gdna;
                const volume = rows[i].volume;
                const gdna_volume_3x = rows[i].gdna_volume_3x;
                const nfw = rows[i].nfw;
                const plate_designation = rows[i].plate_designation;
                const well = rows[i].well;
                const i5_index_reverse = rows[i].i5_index_reverse;
                const i7_index = rows[i].i7_index;
                const qubit_lib_qc_ng_ul = rows[i].qubit_lib_qc_ng_ul;
                const stock_ng_ul = rows[i].stock_ng_ul;
                const lib_vol_for_hyb = rows[i].lib_vol_for_hyb;
                const gb_per_sample = rows[i].gb_per_sample;

                if (!sample_id) {
                    response.push({
                        message: 'Sample Id is required',
                        status: 400
                    });
                }
                const data = await pool.query('SELECT sample_id FROM pool_info WHERE sample_id = $1', [sample_id]);
                const sampleExists = data.rows.length > 0;
                if (sampleExists) {
                    response.push({
                        message: 'Sample Id exists',
                        status: 404
                    });
                }
                else {
                    await pool.query(
                        `INSERT INTO pool_info (sample_id, Qubit_dna_hs, per_rxn_gdna, volume, gdna_volume_3x, nfw, plate_designation, well, i5_index_reverse, i7_index, qubit_lib_qc_ng_ul, stock_ng_ul, lib_vol_for_hyb, gb_per_sample, test_name, pool_no)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
                        [sample_id, Qubit_dna_hs, per_rxn_gdna, volume, gdna_volume_3x, nfw, plate_designation, well, i5_index_reverse, i7_index, qubit_lib_qc_ng_ul, stock_ng_ul, lib_vol_for_hyb, gb_per_sample, testName, pool_no]
                    );
                    response.push({
                        message: 'Sample indicator updated successfully',
                        status: 200
                    });
                }
            }
        }
        return NextResponse.json(response)
    }
    catch (e) {
        console.error("Error updating sample indicator:", e);
        return NextResponse.json({ error: "Failed to update sample indicator" }, { status: 500 });
    }
}