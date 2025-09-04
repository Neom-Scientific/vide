import { pool } from "@/lib/db";
import { google } from "googleapis";
import { NextResponse } from "next/server";
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  const formData = await request.formData();
  const fields = {};
  for (const [key, value] of formData.entries()) {
    if (key !== "file") fields[key] = value;
  }
  const file = formData.get("file");

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
      gender,
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
      tantive_report_date,
      patient_email,
      trf_checkbox,
      opd_notes_checkbox,
      consent_form_checkbox,
    } = fields;

    // 🔹 Call FastAPI to generate HPO terms from clinical_history
    let hpo_id_final = null;
    let hpo_term_final = null;
    if (clinical_history) {
      try {
        const resp = await fetch("/api/store/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: clinical_history }),
        });

        if (resp.ok) {
          const data = await resp.json();
          if (Array.isArray(data) && data.length > 0) {
            const hpoIds = data.map((d) => d["HPO ID"] || d.hpo_id).filter(Boolean);
            const hpoTerms = data.map((d) => d["Term"] || d.hpo_term).filter(Boolean);

            hpo_id_final = hpoIds.length > 0 ? hpoIds.join(", ") : "Not Found";
            hpo_term_final = hpoTerms.length > 0 ? hpoTerms.join(", ") : "Not Found";
          } else {
            hpo_id_final = "Not Found";
            hpo_term_final = "Not Found";
          }
        } else {
          console.error("FastAPI error:", await resp.text());
          hpo_id_final = "Not Found";
          hpo_term_final = "Not Found";
        }
      } catch (err) {
        console.error("Failed to call extractor:", err);
        hpo_id_final = "Not Found";
        hpo_term_final = "Not Found";
      }
    }

    const testNames = (selectedTestName || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const today = new Date(registration_date || Date.now());
    const todayStr = today.toISOString().slice(0, 10);

    const existingProjectIdQuery = `
      SELECT project_id FROM master_sheet
      WHERE registration_date::date = $1 AND hospital_name = $2
      LIMIT 1
    `;
    const existingProjectIdResult = await pool.query(existingProjectIdQuery, [todayStr, hospital_name]);

    let project_id;
    if (existingProjectIdResult.rows.length > 0) {
      project_id = existingProjectIdResult.rows[0].project_id;
    } else {
      const seqQuery = `
        SELECT project_id FROM master_sheet
        ORDER BY project_id DESC
        LIMIT 1
      `;
      const seqResult = await pool.query(seqQuery);
      let nextSeq = 1;
      if (seqResult.rows.length > 0 && seqResult.rows[0].project_id) {
        const lastSeq = parseInt(seqResult.rows[0].project_id.replace("PI", ""), 10);
        nextSeq = lastSeq + 1;
      }
      project_id = `PI${String(nextSeq).padStart(4, "0")}`;
    }

    // ================= SINGLE TEST ===================
    if (testNames.length === 1) {
      let internal_id;
      const date = new Date(registration_date || Date.now());
      const year = date.getFullYear();

      if (selectedTestName === "Myeloid") {
        const existing = await pool.query(
          `SELECT internal_id FROM master_sheet WHERE sample_id = $1 AND test_name = $2`,
          [sample_id, "Myeloid"]
        );

        if (existing.rows.length > 0) {
          const existingInternalId = existing.rows[0].internal_id;
          const numericPart = existingInternalId.split("-")[0];
          internal_id = `${numericPart}-${sample_type}`;
        } else {
          const maxInternalIdQuery = `
            SELECT MAX(CAST(SUBSTRING(CAST(internal_id AS TEXT), 5, 5) AS INTEGER)) AS max_seq
            FROM master_sheet
            WHERE LEFT(CAST(internal_id AS TEXT), 4) = $1
          `;
          const maxInternalIdResult = await pool.query(maxInternalIdQuery, [String(year)]);
          const maxSeq = maxInternalIdResult.rows[0]?.max_seq || 0;
          const nextSeq = maxSeq + 1;
          const numericPart = `${year}${String(nextSeq).padStart(5, "0")}`;
          internal_id = `${numericPart}-${sample_type}`;
        }
      } else {
        const maxInternalIdQuery = `
          SELECT MAX(CAST(SUBSTRING(CAST(internal_id AS TEXT), 5, 5) AS INTEGER)) AS max_seq
          FROM master_sheet
          WHERE LEFT(CAST(internal_id AS TEXT), 4) = $1
        `;
        const maxInternalIdResult = await pool.query(maxInternalIdQuery, [String(year)]);
        const maxSeq = maxInternalIdResult.rows[0]?.max_seq || 0;
        const nextSeq = maxSeq + 1;
        internal_id = `${year}${String(nextSeq).padStart(5, "0")}`;
      }

      let trf_file_id = null;
      if (file && typeof file.arrayBuffer === "function") {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const auth = new google.auth.GoogleAuth({
          credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
          scopes: ["https://www.googleapis.com/auth/drive"],
        });
        const drive = google.drive({ version: "v3", auth });
        const responseFile = await drive.files.create({
          requestBody: {
            name: internal_id,
            parents: ["1xzTkB-k3PxEbGpvj4yoHXxBFgAtCLz1p"],
          },
          media: {
            mimeType: file.type,
            body: Readable.from(fileBuffer),
          },
          supportsAllDrives: true,
          driveId: "0AGcjkp59qA5iUk9PVA",
        });
        trf_file_id = responseFile.data.id;
      }

      const query = `
        INSERT INTO master_sheet (
          hospital_name, dept_name, vial_received, specimen_quality,
          registration_date, sample_date, sample_type, trf,
          collection_date_time, storage_condition, prority, hospital_id,
          client_id, client_name, sample_id, patient_name, DOB, age, gender,
          ethnicity, father_mother_name, spouse_name, address, city, state,
          country, patient_mobile, doctor_mobile, doctor_name, email,
          test_name, remarks, clinical_history, repeat_required, repeat_reason,
          repeat_date, internal_id, systolic_bp, diastolic_bp, total_cholesterol,
          hdl_cholesterol, ldl_cholesterol, diabetes, smoker,
          hypertension_treatment, statin, aspirin_therapy, dna_isolation,
          lib_prep, under_seq, seq_completed, tantive_report_date, hpo_status,
          annotation, project_id, patient_email, sample_status, location,
          trf_checkbox, opd_notes_checkbox, consent_form_checkbox,
          hpo_id, hpo_term
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
          $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
          $31,$32,$33,$34,$35,$36,$37,$38,$39,$40,
          $41,$42,$43,$44,$45,$46,$47,$48,$49,$50,
          $51,$52,$53,$54,$55,$56,$57,$58,$59,$60,
          $61,$62,$63
        )
        RETURNING *
      `;
      const values = [
        hospital_name, dept_name || null, vial_received, specimen_quality,
        registration_date || null, sample_date || null, sample_type, trf_file_id || null,
        collection_date_time || null, storage_condition, prority, hospital_id,
        client_id, client_name, sample_id, patient_name, DOB || null, age, gender,
        ethnicity, father_mother_name, spouse_name, address, city, state,
        country, patient_mobile, doctor_mobile, doctor_name, email,
        selectedTestName, remarks, clinical_history, repeat_required, repeat_reason,
        repeat_date || null, internal_id, systolic_bp || null, diastolic_bp || null,
        total_cholesterol || null, hdl_cholesterol || null, ldl_cholesterol || null,
        diabetes || null, smoker || null, hypertension_treatment || null, statin || null,
        aspirin_therapy || null, "No","No","No","No",
        new Date(new Date(registration_date).getTime() + 7*24*60*60*1000) || null,
        "No","No", project_id, patient_email,
        "processing","monitering",
        trf_checkbox || 'No', opd_notes_checkbox || 'No', consent_form_checkbox || 'No',
        hpo_id_final, hpo_term_final
      ];
      const result = await pool.query(query, values);
      response.push({
        status: 200,
        message: "Data inserted successfully",
        data: result.rows[0].id,
      });
    }

    // ================= MULTI TEST ===================
    else if (testNames.length > 1) {
      const date = new Date(registration_date || Date.now());
      const year = date.getFullYear();
      const maxInternalIdQuery = `
        SELECT MAX(CAST(SUBSTRING(CAST(internal_id AS TEXT), 5, 5) AS INTEGER)) AS max_seq
        FROM master_sheet
        WHERE LEFT(CAST(internal_id AS TEXT), 4) = $1
      `;
      const maxInternalIdResult = await pool.query(maxInternalIdQuery, [String(year)]);
      const maxSeq = maxInternalIdResult.rows[0]?.max_seq || 0;
      const nextSeq = maxSeq + 1;
      const base_internal_id = `${year}${String(nextSeq).padStart(5, "0")}`;

      let trf_file_id = null;
      if (file && typeof file.arrayBuffer === "function") {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const auth = new google.auth.GoogleAuth({
          credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
          scopes: ["https://www.googleapis.com/auth/drive"],
        });
        const drive = google.drive({ version: "v3", auth });
        const responseFile = await drive.files.create({
          requestBody: {
            name: base_internal_id,
            parents: ["1xzTkB-k3PxEbGpvj4yoHXxBFgAtCLz1p"],
          },
          media: {
            mimeType: file.type,
            body: Readable.from(fileBuffer),
          },
          supportsAllDrives: true,
          driveId: "0AGcjkp59qA5iUk9PVA",
        });
        trf_file_id = responseFile.data.id;
      }

      for (const testName of testNames) {
        let internal_id;
        if (testName === "Myeloid") {
          internal_id = `${base_internal_id}-${sample_type}`;
        } else {
          internal_id = `${base_internal_id}-${testName.replace(/\s+/g, "").replace(/[^\w+]/g, "")}`;
        }

        const query = `
          INSERT INTO master_sheet (
            hospital_name, dept_name, vial_received, specimen_quality,
            registration_date, sample_date, sample_type, trf,
            collection_date_time, storage_condition, prority, hospital_id,
            client_id, client_name, sample_id, patient_name, DOB, age, gender,
            ethnicity, father_mother_name, spouse_name, address, city, state,
            country, patient_mobile, doctor_mobile, doctor_name, email,
            test_name, remarks, clinical_history, repeat_required, repeat_reason,
            repeat_date, internal_id, systolic_bp, diastolic_bp, total_cholesterol,
            hdl_cholesterol, ldl_cholesterol, diabetes, smoker,
            hypertension_treatment, statin, aspirin_therapy, dna_isolation,
            lib_prep, under_seq, seq_completed, tantive_report_date, hpo_status,
            annotation, project_id, patient_email, sample_status, location,
            trf_checkbox, opd_notes_checkbox, consent_form_checkbox,
            base_internal_id, hpo_id, hpo_term
          )
          VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
            $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
            $21,$22,$23,$24,$25,$26,$27,$28,$29,$30,
            $31,$32,$33,$34,$35,$36,$37,$38,$39,$40,
            $41,$42,$43,$44,$45,$46,$47,$48,$49,$50,
            $51,$52,$53,$54,$55,$56,$57,$58,$59,$60,
            $61,$62,$63,$64,$65
          )
          RETURNING *
        `;
        const values = [
          hospital_name, dept_name || null, vial_received, specimen_quality,
          registration_date || null, sample_date || null, sample_type, trf_file_id || null,
          collection_date_time || null, storage_condition, prority, hospital_id,
          client_id, client_name, sample_id, patient_name, DOB || null, age, gender,
          ethnicity, father_mother_name, spouse_name, address, city, state,
          country, patient_mobile, doctor_mobile, doctor_name, email,
          testName, remarks, clinical_history, repeat_required, repeat_reason,
          repeat_date || null, internal_id, systolic_bp || null, diastolic_bp || null,
          total_cholesterol || null, hdl_cholesterol || null, ldl_cholesterol || null,
          diabetes || null, smoker || null, hypertension_treatment || null, statin || null,
          aspirin_therapy || null, "No","No","No","No",
          new Date(new Date(registration_date).getTime() + 7*24*60*60*1000) || null,
          "No","No", project_id, patient_email,
          "processing","monitering",
          trf_checkbox || "No", opd_notes_checkbox || "No", consent_form_checkbox || "No",
          base_internal_id, hpo_id_final, hpo_term_final
        ];
        const result = await pool.query(query, values);
        response.push({
          status: 200,
          message: "Data inserted successfully",
          data: result.rows[0].id,
        });
      }
    }

    return NextResponse.json(response);
  } catch (e) {
    console.log(e);
    return NextResponse.json({ error: "Failed to insert data" }, { status: 500 });
  }
}
