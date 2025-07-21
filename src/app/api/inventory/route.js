import { pool } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();
    const { sku, kit_name, group_classification, mrp, number_of_rxn, list_price, manufacturer, hospital_name } = body;
    try {
        const response = []
        if (!hospital_name) {
            response.push({
                message: 'Hospital name is required',
                status: 400
            })
            return NextResponse.json(response);
        }
        const mrpClean = cleanNumber(mrp);
        const listPriceClean = cleanNumber(list_price);
        const { rows } = await pool.query(`
            INSERT INTO inventories (sku, kit_name, group_classification, mrp, number_of_rxn, list_price, manufacturer, hospital_name)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [sku, kit_name, group_classification, mrpClean, number_of_rxn, listPriceClean, manufacturer, hospital_name]);
        if (rows.length > 0) {
            response.push({
                message: 'New item added successfully',
                status: 200
            });
        }
        else {
            response.push({
                message: 'Failed to add new item',
                status: 500
            });
        }
        return NextResponse.json(response);


    }
    catch (error) {
        console.log('error', error);
        return NextResponse.json({
            error: 'failed to add new item',
            message: error.message,
            status: 500
        })
    }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const hospital_name = searchParams.get('hospital_name');
    try {
        const response = [];
        if (!hospital_name) {
            response.push({
                message: 'Hospital name is required',
                status: 400
            });
            return NextResponse.json(response);
        }
        const { rows } = await pool.query(`SELECT * FROM inventories WHERE hospital_name = $1`, [hospital_name]);
        if (rows.length > 0) {
            response.push({
                message: 'Inventory items fetched successfully',
                status: 200,
                data: rows
            });
        } else {
            response.push({
                message: 'No inventory items found for the specified hospital',
                status: 404
            });
        }
        return NextResponse.json(response);
    }
    catch (error) {
        console.log('error', error);
        return NextResponse.json({
            error: 'failed to fetch inventory items',
            message: error.message,
            status: 500
        });
    }
}

const cleanNumber = (value) => {
    if (typeof value === 'string') {
        return parseFloat(value.replace(/,/g, ''));
    }
    return value;
}