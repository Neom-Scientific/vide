// the data which is displayed in the browser convert it to the excel file and download it


export async function POST(request) {
    // I only wnat that data which is displayed in the browser
    const body = await request.json();
    const { data } = body;
    const { sample_id, test_name, client_name, patient_name, registration_date, dna_isolation, lib_prep, under_seq, seq_completed } = data[0];
    let response = {};
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sample Data');

        // Add column headers
        worksheet.columns = [
            { header: 'Sample ID', key: 'sample_id', width: 15 },
            { header: 'Patient Name', key: 'patient_name', width: 20 },
            { header: 'Reg Date', key: 'registration_date', width: 20 },
            { header: 'Test Name', key: 'test_name', width: 20 },
            { header: 'Client Name', key: 'client_name', width: 20 },
            { header: 'DNA Isolation', key: 'dna_isolation', width: 20 },
            { header: 'Library Preparation', key: 'lib_prep', width: 20 },
            { header: 'Under Sequencing', key: 'under_seq', width: 20 },
            { header: 'Sequencing Completed', key: 'seq_completed', width: 20 },

        ];

        // Add data rows
        data.forEach((item) => {
            worksheet.addRow(item);
        });

        // Set response headers
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = URL.createObjectURL(blob);

        response = {
            status: 200,
            message: "Excel file created successfully",
            url,
        };
    } catch (error) {
        console.error("Error in convert-to-excel API", error);
        response = {
            status: 500,
            message: "Internal server error",
        };
    }
    return new Response(JSON.stringify(response), {
        status: response.status,
        headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename=sample_data.xlsx`,
        },
    });
}