import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();
    const { setup } = body;
    try {
        let run_id;
        const response = [];
        if (!setup) {
            response.push({
                message: "No setup provided.",
                status: 404
            });
        }
        // const { rows } = await pool.query('SELECT run_id FROM run_setup ORDER BY run_id DESC LIMIT 1');
        // if (rows.length > 0) {
        //     const { rows } = await pool.query('SELECT nextval(\'run_id_seq\') AS next_id');
        //     const id = rows[0].next_id;
        //     console.log('run_id', id);
        //     run_id = `run_${id}`; // Generate the new run_id
        // } else {
        //     run_id = 'run_1'; // Start with run_1 if no entries exist
        // }
        const { rows } = await pool.query('SELECT nextval(\'run_id_seq\') AS next_id');
        const id = rows[0].next_id;
        run_id = `run_${id}`; // Generate the new run_id
        await pool.query(
            `INSERT INTO run_setup (
              run_id,
              selected_application,
              seq_run_date,
              total_gb_available,
              instument_type,
              pool_size,
              pool_conc,
              nM_cal,
              total_required,
              dinatured_lib_next_seq_550,
              total_volume_next_seq_550,
              loading_conc_550,
              lib_required_next_seq_550,
              buffer_volume_next_seq_550,
              final_pool_conc_vol_2nm_next_seq_1000_2000,
              rsbetween_vol_2nm_next_seq_1000_2000,
              total_volume_2nm_next_seq_1000_2000,
              vol_of_2nm_for_600pm_next_seq_1000_2000,
              vol_of_rs_between_for_600pm_next_seq_1000_2000,
              total_volume_600pm_next_seq_1000_2000,
              loading_conc_1000_2000,
              hospital_name,
              total_volume_2nm_next_seq_550,
              final_pool_conc_vol_2nm_next_seq_550,
              nfw_vol_2nm_next_seq_550
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,$23,$24, $25
            )`,
            [
                run_id,
                setup.selected_application,
                setup.seq_run_date,
                setup.total_gb_available,
                setup.instument_type,
                setup.pool_size,
                setup.pool_conc,
                setup.nM_cal,
                setup.total_required,
                setup.dinatured_lib_next_seq_550,
                setup.total_volume_next_seq_550,
                setup.loading_conc_550,
                setup.lib_required_next_seq_550,
                setup.buffer_volume_next_seq_550,
                setup.final_pool_conc_vol_2nm_next_seq_1000_2000,
                setup.rsbetween_vol_2nm_next_seq_1000_2000,
                setup.total_volume_2nm_next_seq_1000_2000,
                setup.vol_of_2nm_for_600pm_next_seq_1000_2000,
                setup.vol_of_rs_between_for_600pm_next_seq_1000_2000,
                setup.total_volume_600pm_next_seq_1000_2000,
                setup.loading_conc_1000_2000,
                setup.hospital_name,
                setup.total_volume_2nm_next_seq_550,
                setup.final_pool_conc_vol_2nm_next_seq_550,
                setup.nfw_vol_2nm_next_seq_550
            ]
        );

        // I am passing the array of the sample_id with the name sample_ids
        console.log('sample_ids', setup.sample_ids);
        if (setup.sample_ids && setup.sample_ids.length > 0) {
            const sampleIds = setup.sample_ids.map(id => id); // Trim and filter out empty strings
            if (sampleIds.length > 0) {
                for (const id of sampleIds) {
                    await pool.query(`UPDATE pool_info SET run_id = $1 WHERE sample_id = $2`, [run_id, id]);
                    await pool.query(`UPDATE master_sheet SET run_id = $1 WHERE sample_id = $2`, [run_id, id]);
                }
            }
        }

        response.push({
            message: "Run setup inserted successfully.",
            status: 200
        });
        return NextResponse.json(response);
    }
    catch (error) {
        console.log('error', error);
        return NextResponse.json({
            error: "An error occurred while processing your request.",
            details: error.message
        }, { status: 500 });
    }
}