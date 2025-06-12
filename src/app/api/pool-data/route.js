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
                message: "Organization Name is required"
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
                `SELECT * FROM master_sheet WHERE sample_id = ANY($1::integer[]);`,
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
                        message: `No pool data found for Organization Name "${hospital_name}" and test name "${testName}"`
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

export async function POST(request) {
    const body = await request.json();
    const { rows, testName, hospital_name } = body;
    const response = [];
    let pool_no = 'P_001';

    try {
        // Start transaction
        await pool.query('BEGIN');

        // Pool number logic
        const poolData = await pool.query('SELECT pool_no FROM pool_info ORDER BY pool_no DESC LIMIT 1');
        if (poolData.rows.length > 0) {
            const lastPoolNo = poolData.rows[0].pool_no;
            const lastNumber = parseInt(lastPoolNo.split('_')[1], 10);
            const newNumber = lastNumber + 1;
            pool_no = `P_${newNumber.toString().padStart(3, '0')}`;
        }

        if (!hospital_name) {
            await pool.query('ROLLBACK');
            return NextResponse.json([{ message: 'Organization Name is required', status: 400 }]);
        }

        for (let i = 0; i < rows.length; i++) {
            const sample = rows[i];
            const sample_id = sample.sample_id;

            if (!sample_id) {
                response.push({ message: 'Sample Id is required', status: 400 });
                continue;
            }

            // --- Myeloid ---
            if (testName === "Myeloid") {
                const {
                    qubit_dna, data_required, conc_rxn, barcode, i5_index_reverse, i7_index,
                    lib_qubit, nm_conc, lib_vol_for_2nm, nfw_volu_for_2nm, total_vol_for_2nm, size
                } = sample;

                // Upsert pool_info
                await pool.query(
                    `INSERT INTO pool_info (sample_id, qubit_dna, data_required, conc_rxn, barcode, i5_index_reverse, i7_index, lib_qubit, nm_conc, lib_vol_for_2nm, nfw_volu_for_2nm, total_vol_for_2nm, pool_no, size, test_name, hospital_name)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                     ON CONFLICT (sample_id) DO UPDATE SET
                        qubit_dna = EXCLUDED.qubit_dna,
                        data_required = EXCLUDED.data_required,
                        conc_rxn = EXCLUDED.conc_rxn,
                        barcode = EXCLUDED.barcode,
                        i5_index_reverse = EXCLUDED.i5_index_reverse,
                        i7_index = EXCLUDED.i7_index,
                        lib_qubit = EXCLUDED.lib_qubit,
                        nm_conc = EXCLUDED.nm_conc,
                        lib_vol_for_2nm = EXCLUDED.lib_vol_for_2nm,
                        nfw_volu_for_2nm = EXCLUDED.nfw_volu_for_2nm,
                        total_vol_for_2nm = EXCLUDED.total_vol_for_2nm,
                        pool_no = EXCLUDED.pool_no,
                        size = EXCLUDED.size,
                        test_name = EXCLUDED.test_name,
                        hospital_name = EXCLUDED.hospital_name
                    `,
                    [sample_id, qubit_dna, data_required, conc_rxn, barcode, i5_index_reverse, i7_index, lib_qubit, nm_conc, lib_vol_for_2nm, nfw_volu_for_2nm, total_vol_for_2nm, pool_no, size, testName, hospital_name]
                );

                // Upsert master_sheet
                await pool.query(
                    `INSERT INTO master_sheet (sample_id, qubit_dna, data_required, conc_rxn, barcode, i5_index_reverse, i7_index, lib_qubit, nm_conc, lib_vol_for_2nm, nfw_volu_for_2nm, total_vol_for_2nm, pool_no, size, test_name, hospital_name)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                     ON CONFLICT (sample_id) DO UPDATE SET
                        qubit_dna = EXCLUDED.qubit_dna,
                        data_required = EXCLUDED.data_required,
                        conc_rxn = EXCLUDED.conc_rxn,
                        barcode = EXCLUDED.barcode,
                        i5_index_reverse = EXCLUDED.i5_index_reverse,
                        i7_index = EXCLUDED.i7_index,
                        lib_qubit = EXCLUDED.lib_qubit,
                        nm_conc = EXCLUDED.nm_conc,
                        lib_vol_for_2nm = EXCLUDED.lib_vol_for_2nm,
                        nfw_volu_for_2nm = EXCLUDED.nfw_volu_for_2nm,
                        total_vol_for_2nm = EXCLUDED.total_vol_for_2nm,
                        pool_no = EXCLUDED.pool_no,
                        size = EXCLUDED.size,
                        test_name = EXCLUDED.test_name,
                        hospital_name = EXCLUDED.hospital_name
                    `,
                    [sample_id, qubit_dna, data_required, conc_rxn, barcode, i5_index_reverse, i7_index, lib_qubit, nm_conc, lib_vol_for_2nm, nfw_volu_for_2nm, total_vol_for_2nm, pool_no, size, testName, hospital_name]
                );
            }

            // --- WES, CS, Clinical Exome, Cardio Comprehensive, etc. ---
            else if (
                testName === "WES" ||
                testName === "CS" ||
                testName === "Clinical Exome" ||
                testName === "Cardio Comprehensive (Screening Test)" ||
                testName === "Cardio Metabolic Syndrome (Screening Test)" ||
                testName === "Cardio Comprehensive Myopathy"
            ) {
                const {
                    qubit_dna, data_required, per_rxn_gdna, volume, gdna_volume_3x, nfw, plate_designation, well,
                    i5_index_reverse, i7_index, qubit_lib_qc_ng_ul, stock_ng_ul, lib_vol_for_hyb, gb_per_sample,
                    pool_conc, size, nm_conc, one_tenth_of_nm_conc, total_vol_for_2nm, lib_vol_for_2nm, nfw_volu_for_2nm
                } = sample;

                await pool.query(
                    `INSERT INTO pool_info (sample_id, qubit_dna, data_required, per_rxn_gdna, volume, gdna_volume_3x, nfw, plate_designation, well, i5_index_reverse, i7_index, qubit_lib_qc_ng_ul, stock_ng_ul, lib_vol_for_hyb, gb_per_sample, test_name, pool_no, hospital_name, pool_conc, size, nm_conc, one_tenth_of_nm_conc, total_vol_for_2nm, lib_vol_for_2nm, nfw_volu_for_2nm)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
                     ON CONFLICT (sample_id) DO UPDATE SET
                        qubit_dna = EXCLUDED.qubit_dna,
                        data_required = EXCLUDED.data_required,
                        per_rxn_gdna = EXCLUDED.per_rxn_gdna,
                        volume = EXCLUDED.volume,
                        gdna_volume_3x = EXCLUDED.gdna_volume_3x,
                        nfw = EXCLUDED.nfw,
                        plate_designation = EXCLUDED.plate_designation,
                        well = EXCLUDED.well,
                        i5_index_reverse = EXCLUDED.i5_index_reverse,
                        i7_index = EXCLUDED.i7_index,
                        qubit_lib_qc_ng_ul = EXCLUDED.qubit_lib_qc_ng_ul,
                        stock_ng_ul = EXCLUDED.stock_ng_ul,
                        lib_vol_for_hyb = EXCLUDED.lib_vol_for_hyb,
                        gb_per_sample = EXCLUDED.gb_per_sample,
                        test_name = EXCLUDED.test_name,
                        pool_no = EXCLUDED.pool_no,
                        hospital_name = EXCLUDED.hospital_name,
                        pool_conc = EXCLUDED.pool_conc,
                        size = EXCLUDED.size,
                        nm_conc = EXCLUDED.nm_conc,
                        one_tenth_of_nm_conc = EXCLUDED.one_tenth_of_nm_conc,
                        total_vol_for_2nm = EXCLUDED.total_vol_for_2nm,
                        lib_vol_for_2nm = EXCLUDED.lib_vol_for_2nm,
                        nfw_volu_for_2nm = EXCLUDED.nfw_volu_for_2nm
                    `,
                    [sample_id, qubit_dna, data_required, per_rxn_gdna, volume, gdna_volume_3x, nfw, plate_designation, well, i5_index_reverse, i7_index, qubit_lib_qc_ng_ul, stock_ng_ul, lib_vol_for_hyb, gb_per_sample, testName, pool_no, hospital_name, pool_conc, size, nm_conc, one_tenth_of_nm_conc, total_vol_for_2nm, lib_vol_for_2nm, nfw_volu_for_2nm]
                );

                await pool.query(
                    `INSERT INTO master_sheet (sample_id, qubit_dna, data_required, per_rxn_gdna, volume, gdna_volume_3x, nfw, plate_designation, well, i5_index_reverse, i7_index, qubit_lib_qc_ng_ul, stock_ng_ul, lib_vol_for_hyb, gb_per_sample, pool_no, test_name, hospital_name, pool_conc, size, nm_conc, one_tenth_of_nm_conc, total_vol_for_2nm, lib_vol_for_2nm, nfw_volu_for_2nm)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
                     ON CONFLICT (sample_id) DO UPDATE SET
                        qubit_dna = EXCLUDED.qubit_dna,
                        data_required = EXCLUDED.data_required,
                        per_rxn_gdna = EXCLUDED.per_rxn_gdna,
                        volume = EXCLUDED.volume,
                        gdna_volume_3x = EXCLUDED.gdna_volume_3x,
                        nfw = EXCLUDED.nfw,
                        plate_designation = EXCLUDED.plate_designation,
                        well = EXCLUDED.well,
                        i5_index_reverse = EXCLUDED.i5_index_reverse,
                        i7_index = EXCLUDED.i7_index,
                        qubit_lib_qc_ng_ul = EXCLUDED.qubit_lib_qc_ng_ul,
                        stock_ng_ul = EXCLUDED.stock_ng_ul,
                        lib_vol_for_hyb = EXCLUDED.lib_vol_for_hyb,
                        gb_per_sample = EXCLUDED.gb_per_sample,
                        pool_no = EXCLUDED.pool_no,
                        test_name = EXCLUDED.test_name,
                        hospital_name = EXCLUDED.hospital_name,
                        pool_conc = EXCLUDED.pool_conc,
                        size = EXCLUDED.size,
                        nm_conc = EXCLUDED.nm_conc,
                        one_tenth_of_nm_conc = EXCLUDED.one_tenth_of_nm_conc,
                        total_vol_for_2nm = EXCLUDED.total_vol_for_2nm,
                        lib_vol_for_2nm = EXCLUDED.lib_vol_for_2nm,
                        nfw_volu_for_2nm = EXCLUDED.nfw_volu_for_2nm
                    `,
                    [sample_id, qubit_dna, data_required, per_rxn_gdna, volume, gdna_volume_3x, nfw, plate_designation, well, i5_index_reverse, i7_index, qubit_lib_qc_ng_ul, stock_ng_ul, lib_vol_for_hyb, gb_per_sample, pool_no, testName, hospital_name, pool_conc, size, nm_conc, one_tenth_of_nm_conc, total_vol_for_2nm, lib_vol_for_2nm, nfw_volu_for_2nm]
                );
            }

            // --- SGS, HLA ---
            else if (testName === "SGS" || testName === "HLA") {
                const {
                    qubit_dna, data_required, well, i7_index, sample_volume, qubit_lib_qc_ng_ul, pooling_volume,
                    pool_conc, size, nm_conc, one_tenth_of_nm_conc, total_vol_for_2nm, lib_vol_for_2nm, nfw_volu_for_2nm
                } = sample;

                await pool.query(
                    `INSERT INTO pool_info (sample_id, qubit_dna, data_required, well, i7_index, sample_volume, qubit_lib_qc_ng_ul, pooling_volume, pool_conc, size, nm_conc, one_tenth_of_nm_conc, total_vol_for_2nm, lib_vol_for_2nm, nfw_volu_for_2nm, test_name, pool_no, hospital_name)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                     ON CONFLICT (sample_id) DO UPDATE SET
                        qubit_dna = EXCLUDED.qubit_dna,
                        data_required = EXCLUDED.data_required,
                        well = EXCLUDED.well,
                        i7_index = EXCLUDED.i7_index,
                        sample_volume = EXCLUDED.sample_volume,
                        qubit_lib_qc_ng_ul = EXCLUDED.qubit_lib_qc_ng_ul,
                        pooling_volume = EXCLUDED.pooling_volume,
                        pool_conc = EXCLUDED.pool_conc,
                        size = EXCLUDED.size,
                        nm_conc = EXCLUDED.nm_conc,
                        one_tenth_of_nm_conc = EXCLUDED.one_tenth_of_nm_conc,
                        total_vol_for_2nm = EXCLUDED.total_vol_for_2nm,
                        lib_vol_for_2nm = EXCLUDED.lib_vol_for_2nm,
                        nfw_volu_for_2nm = EXCLUDED.nfw_volu_for_2nm,
                        test_name = EXCLUDED.test_name,
                        pool_no = EXCLUDED.pool_no,
                        hospital_name = EXCLUDED.hospital_name
                    `,
                    [sample_id, qubit_dna, data_required, well, i7_index, sample_volume, qubit_lib_qc_ng_ul, pooling_volume, pool_conc, size, nm_conc, one_tenth_of_nm_conc, total_vol_for_2nm, lib_vol_for_2nm, nfw_volu_for_2nm, testName, pool_no, hospital_name]
                );

                await pool.query(
                    `INSERT INTO master_sheet (sample_id, qubit_dna, data_required, well, i7_index, sample_volume, qubit_lib_qc_ng_ul, pooling_volume, pool_conc, size, nm_conc, one_tenth_of_nm_conc, total_vol_for_2nm, lib_vol_for_2nm, nfw_volu_for_2nm, pool_no, test_name, hospital_name)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
                     ON CONFLICT (sample_id) DO UPDATE SET
                        qubit_dna = EXCLUDED.qubit_dna,
                        data_required = EXCLUDED.data_required,
                        well = EXCLUDED.well,
                        i7_index = EXCLUDED.i7_index,
                        sample_volume = EXCLUDED.sample_volume,
                        qubit_lib_qc_ng_ul = EXCLUDED.qubit_lib_qc_ng_ul,
                        pooling_volume = EXCLUDED.pooling_volume,
                        pool_conc = EXCLUDED.pool_conc,
                        size = EXCLUDED.size,
                        nm_conc = EXCLUDED.nm_conc,
                        one_tenth_of_nm_conc = EXCLUDED.one_tenth_of_nm_conc,
                        total_vol_for_2nm = EXCLUDED.total_vol_for_2nm,
                        lib_vol_for_2nm = EXCLUDED.lib_vol_for_2nm,
                        nfw_volu_for_2nm = EXCLUDED.nfw_volu_for_2nm,
                        pool_no = EXCLUDED.pool_no,
                        test_name = EXCLUDED.test_name,
                        hospital_name = EXCLUDED.hospital_name
                    `,
                    [sample_id, qubit_dna, data_required, well, i7_index, sample_volume, qubit_lib_qc_ng_ul, pooling_volume, pool_conc, size, nm_conc, one_tenth_of_nm_conc, total_vol_for_2nm, lib_vol_for_2nm, nfw_volu_for_2nm, pool_no, testName, hospital_name]
                );
            }

            response.push({ message: 'Data upserted successfully', status: 200 });
        }

        await pool.query('COMMIT');
        return NextResponse.json(response);
    } catch (e) {
        await pool.query('ROLLBACK');
        console.error("Error updating sample indicator:", e);
        return NextResponse.json({ error: "Failed to update sample indicator" }, { status: 500 });
    }
}

export async function PUT(request) {
    const body = await request.json();
    const { sample_id, sample_indicator, indicator_status } = body.data;
    console.log('body', body);
    try {
        const response = [];

        if (sample_indicator === 'dna_isolation') {
            await pool.query(`UPDATE master_sheet SET dna_isolation = $2 WHERE sample_id = $1`, [sample_id, indicator_status]);
            response.push({
                message: 'Sample indicator updated successfully',
                indicator_status: indicator_status,
                status: 200
            });
        }
        else if (sample_indicator === 'lib_prep') {
            await pool.query(`UPDATE master_sheet SET lib_prep = $2 WHERE sample_id = $1`, [sample_id, indicator_status]);
            response.push({
                message: 'Sample indicator updated successfully',
                indicator_status: indicator_status,
                status: 200
            });
        }
        else if (sample_indicator === 'under_seq') {
            await pool.query(`UPDATE master_sheet SET under_seq = $2 WHERE sample_id = $1`, [sample_id, indicator_status]);
            response.push({
                message: 'Sample indicator updated successfully',
                status: 200
            });
        }
        else if (sample_indicator === 'seq_completed') {
            await pool.query(`UPDATE master_sheet SET seq_completed = $2 WHERE sample_id = $1`, [sample_id, indicator_status]);
            response.push({
                message: 'Sample indicator updated successfully',
                status: 200
            });
        }
        else {
            response.push({
                message: 'Invalid sample indicator',
                status: 400
            });
        }
        return NextResponse.json(response);
    }
    catch (error) {
        console.error("Error updating sample indicator:", error);
        return NextResponse.json({ error: "Failed to update sample indicator" }, { status: 500 });
    }
}