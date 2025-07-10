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
        console.log('table_data', setup.table_data);
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
              pool_conc_run_setup,
              nm_cal,
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
              nfw_vol_2nm_next_seq_550,
              count,
              table_data,
              ht_buffer_next_seq_1000_2000
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
              $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,$23,$24, $25, $26,$27,$28
            )`,
            [
            run_id,
            setup.selected_application,
            setup.seq_run_date,
            setup.total_gb_available,
            setup.instument_type,
            setup.pool_size,
            setup.pool_conc_run_setup,
            setup.nm_cal,
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
            setup.nfw_vol_2nm_next_seq_550,
            setup.sample_ids.length,
            setup.table_data,
            setup.ht_buffer_next_seq_1000_2000
            ]
        );

        if (setup.sample_ids && setup.sample_ids.length > 0) {
            for (const sampleId of setup.sample_ids) {
            await pool.query(
                `UPDATE master_sheet SET 
                  selected_application = $1,
                  seq_run_date = $2,
                  total_gb_available = $3,
                  instument_type = $4,
                  pool_size = $5,
                  pool_conc_run_setup = $6,
                  nm_cal = $7,
                  total_required = $8,
                  dinatured_lib_next_seq_550 = $9,
                  total_volume_next_seq_550 = $10,
                  loading_conc_550 = $11,
                  lib_required_next_seq_550 = $12,
                  buffer_volume_next_seq_550 = $13,
                  final_pool_conc_vol_2nm_next_seq_1000_2000 = $14,
                  rsbetween_vol_2nm_next_seq_1000_2000 = $15,
                  total_volume_2nm_next_seq_1000_2000 = $16,
                  vol_of_2nm_for_600pm_next_seq_1000_2000 = $17,
                  vol_of_rs_between_for_600pm_next_seq_1000_2000 = $18,
                  total_volume_600pm_next_seq_1000_2000 = $19,
                  loading_conc_1000_2000 = $20,
                  hospital_name = $21,
                  total_volume_2nm_next_seq_550 = $22,
                  final_pool_conc_vol_2nm_next_seq_550 = $23,
                  nfw_vol_2nm_next_seq_550 = $24,
                  count = $25,
                  table_data = $26,
                  ht_buffer_next_seq_1000_2000 = $27,
                  run_id = $28
                WHERE sample_id = $29`,
                [
                setup.selected_application,
                setup.seq_run_date,
                setup.total_gb_available,
                setup.instument_type,
                setup.pool_size,
                setup.pool_conc_run_setup,
                setup.nm_cal,
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
                setup.nfw_vol_2nm_next_seq_550,
                setup.sample_ids.length,
                setup.table_data,
                setup.ht_buffer_next_seq_1000_2000,
                run_id,
                sampleId,
                ]
            );
            }
        }

        // I am passing the array of the sample_id with the name sample_ids
        console.log('sample_ids', setup.sample_ids);
        if (setup.sample_ids && setup.sample_ids.length > 0) {
            const sampleIds = setup.sample_ids.map(id => id); // Trim and filter out empty strings
            if (sampleIds.length > 0) {
                for (const id of sampleIds) {
                    await pool.query(`UPDATE pool_info SET run_id = $1 WHERE sample_id = $2`, [run_id, id]);
                    await pool.query(`UPDATE master_sheet SET under_seq = $1 WHERE sample_id = $2`, ['Yes', id]);
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

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const hospital_name = searchParams.get('hospital_name');
    const  role  = searchParams.get('role')
    try {
        console.log('role', role);
        console.log('hospital_name', hospital_name);
        const response = [];
        if (!hospital_name) {
            response.push({
                status: 400,
                message: "Organization Name is required"
            });
        }
        if (!role) {
            response.push({
                status: 400,
                message: "Role is required"
            });
        }
        if (role === 'SuperAdmin') {
            const { rows } = await pool.query(`SELECT run_id ,seq_run_date, instument_type ,total_required, total_gb_available, selected_application, run_remarks,table_data, count FROM run_setup ORDER BY run_id;`);
            if (rows.length === 0) {
                response.push({
                    status: 404,
                    message: "No run setups found"
                });
            } else {
                response.push({
                    status: 200,
                    data: rows
                });
            }
        }
        else {
            const { rows } = await pool.query(
                `SELECT run_id, total_required, total_gb_available, selected_application,instument_type, table_data, seq_run_date,count FROM run_setup WHERE hospital_name = $1 ORDER BY seq_run_date DESC;`,
                [hospital_name]
            );
            if (rows.length === 0) {
                response.push({
                    status: 404,
                    message: "No run setups found for the provided Organization Name"
                });
            } else {
                response.push({
                    status: 200,
                    data: rows
                });
            }
        }
        return NextResponse.json(response);
    } catch (error) {
        console.log('error', error);
        return NextResponse.json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });
    }
}

export async function PUT(request){
    try{
        const body = await request.json();
        const {run_id ,run_remarks} = body;
        const response = [];
        if(!run_id || !run_remarks){
            response.push({
                status: 400,
                message: "Run ID and Remarks are required"
            });
            return NextResponse.json(response);
        }
        const { rows } = await pool.query(
            `UPDATE run_setup SET run_remarks = $1 WHERE run_id = $2 RETURNING *;`,
            [run_remarks, run_id]
        );

        if(rows.length === 0){
            response.push({
                status: 404,
                message: "Run setup not found"
            });
        }
        else{
            await pool.query(`UPDATE master_sheet SET run_remarks = $1 WHERE run_id = $2`,[run_remarks, run_id]);
            response.push({
                status: 200,
                message: "Run remarks updated successfully",
                data: rows[0]
            });
        }
        return NextResponse.json(response);
    }
    catch(error){
        console.log('error', error);
        return NextResponse.json({
            status: 500,
            message: "Internal Server Error",
            error: error.message
        });
    }
}