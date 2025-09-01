'use client'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { use, useEffect, useState } from 'react'
import { set, useForm } from 'react-hook-form'
import { z } from 'zod'
import { ChevronDown } from "lucide-react";
import Cookies from 'js-cookie';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';


const formSchema = z.object({
  sample_id: z.string().optional(),
  test_name: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  status: z.string().optional(),
  run_id: z.string().optional(),
  doctor_name: z.string().optional(),
  dept_name: z.string().optional(),
})

const Reports = () => {
  const [selectedTestNames, setSelectedTestNames] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  let rows = [];
  const [tableRows, setTableRows] = useState(rows);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState(null);
  const [allTests, setAllTests] = useState([]);
  const [filters, setFilters] = useState({
    sample_id: "",
    test_name: "",
    from_date: "",
    to_date: "",
    status: "",
    run_id: "",
    doctor_name: "",
    dept_name: "",
    selectedTestNames: [],
  });
  useEffect(() => {
    const CookieUser = Cookies.get('user');
    if (CookieUser) {
      setUser(JSON.parse(CookieUser));
    }
  }, []);
  // const allTests = [
  //   'WES',
  //   'Carrier Screening',
  //   'CES',
  //   'Myeloid',
  //   'HLA',
  //   'SGS',
  //   // 'WES + Mito',
  //   'HCP',
  //   'HRR',
  //   // 'CES + Mito',
  //   'SolidTumor Panel',
  //   'Cardio Comprehensive (Screening)',
  //   'Cardio Metabolic Syndrome (Screening)',
  //   'Cardio Comprehensive Myopathy'
  // ];

  const allColumns = [
    { key: 'hospital_name', label: 'Organization Name' },
    { key: 'vial_received', label: 'Vial Received' },
    { key: 'specimen_quality', label: 'Specimen Quality' },
    { key: 'run_id', label: 'Run ID' },
    { key: 'sample_id', label: 'Patient ID' },
    { key: 'registration_date', label: 'Registration Date' },
    { key: 'internal_id', label: 'Lab ID' },
    { key: 'sample_date', label: 'Sample Date' },
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'client_name', label: 'Client Name' },
    { key: 'seq_run_date', label: 'Sequencing Run Date' },
    { key: 'hpo_id', label: 'HPO ID' },
    { key: 'hpo_term', label: 'HPO Term' },
    { key: 'q30', label: 'Q 30 >=' },
    { key: 'raw_data_gen', label: 'Raw Data Genaration' },
    { key: 'duplication_rate', label: 'Duplication Rate' },
    { key: 'gc_control', label: 'GC Content' },
    { key: 'data_qc', label: 'Data QC' },
    { key: 'secondary_analysis', label: 'Secondary Analysis' },
    { key: 'hpo_status', label: 'HPO Status' },
    { key: 'annotation', label: 'Annotation' },
    { key: 'phenotype_rec_date', label: 'Phenotype Receiving Date' },
    { key: 'tantive_report_date', label: 'Tantive Report Date' },
    { key: 'report_releasing_date', label: 'Report Releasing Date' },
    { key: 'tat_days', label: 'TAT Days' },
    { key: 'sample_type', label: 'Sample Type' },
    { key: 'test_name', label: 'Test Name' },
    { key: 'trf', label: 'TRF' },
    { key: 'report_status', label: 'Report Status' },
    { key: 'report_link', label: 'Report Link' },
    { key: 'mito_report_link', label: 'Mito Report Link' },
    { key: 'upload_report', label: 'Upload Report' },
    { key: 'doctor_name', label: 'Doctor Name' },
    { key: 'dept_name', label: 'Department Name' },
    { key: 'collection_date_time', label: 'Collection Date Time' },
    { key: 'storage_condition', label: 'Storage Condition' },
    { key: 'prority', label: 'Prority' },
    { key: 'hospital_id', label: 'Organization ID' },
    { key: 'client_id', label: 'Client ID' },
    { key: 'DOB', label: 'DOB' },
    { key: 'age', label: 'Age' },
    { key: 'gender', label: 'Gender' },
    { key: 'ethnicity', label: 'Ethnicity' },
    { key: 'father_mother_name', label: 'Father/Mother Name' },
    // { key: 'spouse_name', label: 'Spouse Name' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { key: 'patient_mobile', label: "Patient's Mobile" },
    { key: 'docter_mobile', label: "Doctor's Mobile" },
    { key: 'email', label: 'Email' },
    { key: 'clinical_history', label: 'Clinical History' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'repeat_required', label: 'Repeat Required' },
    { key: 'repeat_reason', label: 'Repeat Reason' },
    { key: 'repeat_date', label: 'Repeat Date' },
    { key: 'selectedTestName', label: 'Selected Test Name' },
    { key: 'systolic_bp', label: 'Systolic BP' },
    { key: 'diastolic_bp', label: 'Diastolic BP' },
    { key: 'total_cholesterol', label: 'Total Cholesterol' },
    { key: 'hdl_cholesterol', label: 'HDL Cholesterol' },
    { key: 'ldl_cholesterol', label: 'LDL Cholesterol' },
    { key: 'diabetes', label: 'Diabetes' },
    { key: 'smoker', label: 'Smoker' },
    { key: 'hypertension_treatment', label: 'Hypertension Treatment' },
    { key: 'statin', label: 'Statin' },
    { key: 'aspirin_therapy', label: 'Aspirin Therapy' },
    { key: 'dna_isolation', label: 'DNA Isolation' },
    { key: 'lib_prep', label: 'Library Prep' },
    { key: 'under_seq', label: 'Under Sequencing' },
    { key: 'seq_completed', label: 'Sequencing Completed' },
    { key: 'lib_prep_date', label: 'Library Prep Date' },
  ];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sample_id: '',
      test_name: '',
      from_date: '',
      to_date: '',
      status: '',
      run_id: '',
      doctor_name: '',
      dept_name: ''
    }
  })

  const handleChangeCheckbox = async (e, columnKey, InternalId) => {
    const isChecked = e.target.checked;
    try {
      console.log('Updating:', InternalId, columnKey, isChecked);

      // Prepare the updates object
      const updates = {
        [columnKey]: isChecked ? "Yes" : "No", // Dynamically set the column value
      };

      // Send the PUT request with the correct structure
      const response = await axios.put('/api/store', {
        internal_id: InternalId, // Pass the sample_id
        updates, // Pass the updates object
      });

      console.log('response:', response.data);
      if (response.data[0].status === 200) {
        // toast.success(`Updated ${columnKey} successfully!`);
        // Update the tableRows state to reflect the change
        setTableRows(prevRows =>
          prevRows.map(row =>
            row.internal_id === InternalId
              ? { ...row, [columnKey]: isChecked ? "Yes" : "No" }
              : row
          )
        );
      } else {
        // toast.error(`Failed to update ${columnKey}: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error updating data:", error);
      // toast.error("An error occurred while updating the data.");
    }
  };

  const handleFileUpload = async (file, sampleId, testName, internalId, isMito = false) => {
    if (!file) {
      toast.error("No file selected");
      return;
    }
    try {
      // Prepare the form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("internal_id", internalId); // Append internal_id to the form data
      formData.append("testName", testName); // Append isMito to the form data
      // Upload the file to the backend
      const uploadResponse = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log('uploadResponse:', uploadResponse);
      if (uploadResponse.status === 200) {
        const reportLink = uploadResponse.data[0].fileId; // Assuming the backend returns the file URL
        // href={`https://drive.google.com/file/d/${value}/view?usp=sharing`}
        const url = `https://drive.google.com/file/d/${reportLink}/view?usp=sharing`;
        // console.log('Report URL:', url);

        // Prepare the updates object
        const registrationDate = tableRows.find(row => row.sample_id === sampleId)?.registration_date;
        const reportReleasingDate = new Date().toISOString();
        const tatDays = Math.ceil(
          (new Date(reportReleasingDate) - new Date(registrationDate)) / (1000 * 60 * 60 * 24)
        );

        const updates = {
          report_releasing_date: reportReleasingDate,
          sample_status: "Reported",
          // location: 'reported',
          report_status: "Reported",
          tat_days: tatDays,
        };

        if (isMito) {
          updates["mito_report_link"] = url;
        } else {
          updates["report_link"] = url;
        }

        const response = await axios.put("/api/store", {
          internal_id: internalId,
          updates,
        });

        if (response.data[0].status === 200) {
          toast.success(`Report (${isMito ? 'Mito' : 'Main'}) uploaded`);
          const data = {
            sample_id: sampleId,
            comments: `Report ${isMito ? 'Mito' : 'Main'} uploaded`,
            changed_by: user.email,
            changed_at: new Date().toISOString(),
          }
          const res = await axios.post('/api/audit-logs', data);
          setTableRows((prevRows) =>
            prevRows.map((row) => {
              if (row.sample_id === sampleId) {
                if (isMito && row.test_name && row.test_name.toLowerCase().includes("mito")) {
                  return { ...row, ...updates };
                }
                if (!isMito && (!row.test_name || !row.test_name.toLowerCase().includes("mito"))) {
                  return { ...row, ...updates };
                }
              }
              return row;
            })
          );
        } else {
          toast.error(`Failed to update ${isMito ? 'mito' : 'main'} report`);
        }
      }
      else {
        toast.error("File upload failed");
      }

    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Error during report upload");
    }
  };

  const handleMetricChange = async (e,col_key,internal_id) => {
    const value = e.target.value;
    try {
      const updates = {
        [col_key]: value,
      };
      const response = await axios.put('/api/store', {
        internal_id: internal_id,
        updates,
      });
      if (response.data[0].status === 200) {
        // toast.success(`Updated ${col_key} successfully!`);
        setTableRows(prevRows =>
          prevRows.map(row =>
            row.internal_id === internal_id
              ? { ...row, [col_key]: value }
              : row
          )
        );
      } else {
        // toast.error(`Failed to update ${col_key}: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error updating data:", error);
      // toast.error("An error occurred while updating the data.");
    }
  }

  const isPrivilegedUser = user?.role === "SuperAdmin" || user?.role === "AdminUser";

  const columns = [
    {
      accessorKey: "sno",
      id: "sno",
      header: "S. No.",
      cell: ({ row }) => row.index + 1,
      enableSorting: true,
      enableHiding: false,
    },
    ...allColumns
      .filter(col => col.key !== "upload_report") // Exclude upload_report here
      .map(col => {
        // Date formatting
        if (col.key === "registration_date" || col.key === "phenotype_rec_date") {
          return {
            accessorKey: col.key,
            id: col.key,
            header: col.label,
            cell: info => {
              const value = info.getValue();
              if (!value) return "";
              const date = new Date(value);
              if (isNaN(date)) return value;
              const yyyy = date.getFullYear();
              const mm = String(date.getMonth() + 1).padStart(2, '0');
              const dd = String(date.getDate()).padStart(2, '0');
              const hh = String(date.getHours()).padStart(2, '0');
              const min = String(date.getMinutes()).padStart(2, '0');
              return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
            },
          };
        }
        if (
          col.key === "seq_run_date" ||
          col.key === "tantive_report_date" ||
          col.key === "report_releasing_date" ||
          col.key === "repeat_date"
        ) {
          return {
            accessorKey: col.key,
            id: col.key,
            header: col.label,
            cell: info => {
              const value = info.getValue();
              if (!value) return "";
              const date = new Date(value);
              if (isNaN(date)) return value;
              const yyyy = date.getFullYear();
              const mm = String(date.getMonth() + 1).padStart(2, '0');
              const dd = String(date.getDate()).padStart(2, '0');
              return `${yyyy}-${mm}-${dd}`;
            },
          };
        }

        if (col.key === "trf") {
          return {
            accessorKey: col.key,
            header: col.label,
            enableSorting: true,
            cell: (info) => {
              const value = info.getValue();
              if (!value) return "";
              return (
                <a className="underline text-blue-500" href={`https://drive.google.com/file/d/${value}/view?usp=sharing`} target="_blank" rel="noopener noreferrer">
                  View TRF
                </a>
              );
            },
          };
        }

        if (col.key === "q30" || col.key === "raw_data_gen" || col.key === "duplication_rate" || col.key === "gc_control") {
          return {
            accessorKey: col.key,
            id: col.key,
            header: col.label,
            cell: info => {
              const value = info.getValue();
              if (!value) {
                return (
                  <input
                    type="text"
                    className='border border-orange-400 rounded-md w-20 p-1 text-center'
                    placeholder={col.label}
                    onBlur={e => handleMetricChange(e, col.key, info.row.original.internal_id)}
                  />
                )
              }
              return (
                <input
                  type="text"
                  className='border border-orange-400 rounded-md w-20 p-1 text-center'
                  defaultValue={value}
                  onBlur={e => handleMetricChange(e, col.key, info.row.original.internal_id)}
                />
              );
            },
          };
        }

        if(col.key === "data_qc"){
          return {
            accessorKey: col.key,
            id: col.key,
            header: col.label,
            cell: info => {
              const value = info.getValue();
              if (!value) {
                return (
                  <select
                    className='border border-orange-400 rounded-md w-28 p-1 text-center'
                    defaultValue=""
                    onChange={e => handleMetricChange(e, col.key, info.row.original.internal_id)}
                  >
                    <option value="" disabled>Data QC</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                  </select>
                )
              }
              return (
                <select
                  className='border border-orange-400 rounded-md w-28 p-1 text-center'
                  defaultValue={value}
                  onChange={e => handleMetricChange(e, col.key, info.row.original.internal_id)}
                >
                  <option value="Pass">Pass</option>
                  <option value="Fail">Fail</option>
                </select>
              );
            },
          };
        }

        if (col.key === "report_link") {
          return {
            accessorKey: col.key,
            header: col.label,
            enableSorting: true,
            cell: (info) => {
              const value = info.getValue();
              if (!value) return "";
              return (
                <a className="underline text-blue-500" href={value} target="_blank" rel="noopener noreferrer">
                  View Report
                </a>
              );
            },
          };
        }

        if (col.key === "mito_report_link") {
          return {
            accessorKey: col.key,
            header: col.label,
            enableSorting: true,
            cell: (info) => {
              const value = info.getValue();
              if (!value) return "";
              return (
                <a className="underline text-blue-500" href={value} target="_blank" rel="noopener noreferrer">
                  View Mito Report
                </a>
              );
            },
          };
        }

        // Checkboxes
        if (col.key === "hpo_status" || col.key === "annotation" || col.key === "secondary_analysis") {
          return {
            accessorKey: col.key,
            id: col.key,
            header: col.label,
            cell: info => {
              const value = info.getValue();
              const InternalId = info.row.original.internal_id;
              return (
                <input
                  type="checkbox"
                  className='border border-orange-400'
                  checked={value === "Yes"}
                  onChange={e => handleChangeCheckbox(e, col.key, InternalId)}
                />
              );
            },
          };
        }
        // Default
        return {
          accessorKey: col.key,
          id: col.key,
          header: col.label,
        };
      }),
    // Only add upload_report column for SuperAdmin
    ...(isPrivilegedUser
      ? [
        {
          accessorKey: "upload_report",
          id: "upload_report",
          header: "Upload Report",
          cell: info => {
            const sampleId = info.row.original.sample_id;
            const testName = info.row.original.test_name;
            const internalId = info.row.original.internal_id;
            // If test name contains "Mito", render two inputs with headers
            if (testName && testName.toLowerCase().includes("mito")) {
              return (
                <div className="flex flex-col gap-2">
                  <div>
                    <span className="block text-xs font-semibold mb-1">Main Report</span>
                    <input
                      type="file"
                      className="border-2 border-orange-300 rounded-md p-1 dark:bg-gray-800"
                      onChange={e => handleFileUpload(e.target.files[0], sampleId, testName, internalId, false)}
                      accept=".pdf,.doc,.docx"
                    />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold mb-1">Mito Report</span>
                    <input
                      type="file"
                      className="border-2 border-orange-300 rounded-md p-1 dark:bg-gray-800"
                      onChange={e => handleFileUpload(e.target.files[0], sampleId, testName, internalId, true)}
                      accept=".pdf,.doc,.docx"
                    />

                  </div>
                </div>
              );
            }
            // Otherwise, render one input
            return (
              <input
                type="file"
                className="border-2 border-orange-300 rounded-md p-1 dark:bg-gray-800"
                onChange={e => handleFileUpload(e.target.files[0], sampleId, testName, internalId)}
                accept=".pdf,.doc,.docx"
              />
            );
          },
          enableSorting: true,
          enableHiding: false,
        },
      ]
      : []),
  ];

  useEffect(() => {
    const fetchTestNames = async () => {
      const user = JSON.parse(Cookies.get("user") || "{}");
      const hospitalName = user?.hospital_name || 'default';
      try {
        const res = await axios.get(`/api/default-values?hospital_name=${encodeURIComponent(hospitalName)}&type=test_name`);
        setAllTests(res.data[0]?.values || []);
      } catch (e) {
        setAllTests([]);
      }
    };
    fetchTestNames();
  }, []);

  const defaultVisible = [
    'sno',
    'run_id',
    'sample_id',
    'registration_date',
    'internal_id',
    'patient_name',
    'client_name',
    'seq_run_date',
    'hpo_id',
    'hpo_term',
    'q30',
    'raw_data_gen',
    'duplication_rate',
    'gc_control',
    'data_qc',
    'secondary_analysis',
    'phenotype_rec_date',
    'tantive_report_date',
    'report_releasing_date',
    'tat_days',
    'sample_type',
    'test_name',
    'trf',
    'report_status',
    'report_link',
    'mito_report_link',
    ...(isPrivilegedUser ? ["upload_report"] : []), // Only show actions for privileged users
    ...(isPrivilegedUser ? ["hospital_name"] : []),
    'hpo_status',
    'annotation',
    'doctor_name',
    'dept_name',
    'clinical_history',
    'remarks',
  ]

  const [columnVisibility, setColumnVisibility] = useState(() =>
    columns.reduce((acc, col) => {
      acc[col.accessorKey] = defaultVisible.includes(col.accessorKey);
      return acc;
    }, {})
  );


  const table = useReactTable({
    data: tableRows,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setTableRows(prev =>
          prev.map((row, idx) => {
            if (idx !== rowIndex) return row;
            return { ...row, [columnId]: value };
          })
        );
      },
    },
  });

  const handleSubmit = async () => {
    const getValue = (name) => document.getElementsByName(name)[0]?.value || "";
    setProcessing(true);
    const data = {
      sample_id: filters.sample_id,
      test_name: filters.selectedTestNames.join(","),
      sample_status: filters.sample_status,
      from_date: filters.from_date,
      to_date: filters.to_date,
      doctor_name: filters.doctor_name,
      dept_name: filters.dept_name,
      run_id: filters.run_id,
      for: "report",
    };
    if (user && user.role !== 'SuperAdmin') {
      data.hospital_name = user.hospital_name;
    }
    try {
      const response = await axios.get(`/api/search`, { params: data });
      if (response.data[0].status === 200) {
        const responseData = response.data[0].data;
        if (Array.isArray(responseData) && responseData.length > 0) {
          // Map the response data and calculate tantive_report_date
          const updatedRows = responseData.map(row => {
            return {
              ...row,
              phenotype_rec_date: row.registration_date, // Set phenotype_rec_date to registration_date
              tantive_report_date: row.tantive_report_date, // Format as YYYY-MM-DD
              report_realising_date: row.report_realising_date || '', // Ensure report_realising_date is set
            };
          });
          setProcessing(false);
          setTableRows(updatedRows);
          localStorage.setItem('reportsData', JSON.stringify(updatedRows));
        } else {
          setTableRows([]);
          console.warn("No data found for the given filters.");
          setProcessing(false);
          toast.info("No data found for the given filters.");
        }
      } else {
        toast.error(response.data[0].message || "Failed to retrieve data");
        setTableRows([]);
        setProcessing(false);
      }
    }
    catch (error) {
      console.log("Error in handleSubmit:", error);
      setProcessing(false);
      setTableRows([]);
    }
  }

  const handleSaveToExcel = async () => {
    try {
      // Get visible columns
      const visibleColumns = Object.keys(table.getState().columnVisibility).filter(
        (key) => table.getState().columnVisibility[key]
      );

      // Filter tableRows to include only visible columns
      const filteredData = tableRows.map((row) => {
        const filteredRow = {};
        visibleColumns.forEach((key) => {
          filteredRow[key] = row[key];
        });
        return filteredRow;
      });

      // Send filtered data to the API
      const response = await axios.post(
        '/api/convert-to-excel',
        { data: filteredData },
        { responseType: 'blob' }
      );

      // Create a URL for the file and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sample_data.xlsx'); // Set the file name
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('An error occurred while saving the data.');
    }
  }

  useEffect(() => {
    const savedFilters = JSON.parse(localStorage.getItem("reportsFilters") || "{}");
    setFilters({
      sample_id: savedFilters.sample_id || "",
      test_name: savedFilters.test_name || "",
      from_date: savedFilters.from_date || "",
      to_date: savedFilters.to_date || "",
      status: savedFilters.status || "",
      run_id: savedFilters.run_id || "",
      doctor_name: savedFilters.doctor_name || "",
      dept_name: savedFilters.dept_name || "",
      selectedTestNames: savedFilters.selectedTestNames || [],
    });
    setSelectedTestNames(savedFilters.selectedTestNames || []);
  }, []);

  const handleFilterChange = (name, value) => {
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    localStorage.setItem("reportsFilters", JSON.stringify(updated));
    if (name === "selectedTestNames") setSelectedTestNames(value);
  };

  useEffect(() => {
    const savedData = localStorage.getItem('reportsData');
    if (savedData) {
      setTableRows(JSON.parse(savedData));
    } else {
      setTableRows([]);
    }
  }, []);

  return (
    <div className="p-4">

      {/* top filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 items-end ">
          <div>
            <label className="block font-semibold mb-1">Sample id</label>
            <Input
              name='sample_id'
              placeholder="Sample id"
              value={filters.sample_id}
              onChange={(e) => handleFilterChange('sample_id', e.target.value)}
              className="w-full border-2 border-orange-300"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 whitespace-nowrap">Test name</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  className="h-10 bg-gray-700 hover:bg-gray-800 cursor-pointer text-white w-full"
                >
                  Add Test
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[250px]">
                {/* Select All Option */}
                <DropdownMenuItem
                  onSelect={e => e.preventDefault()}
                  onClick={() => {
                    handleFilterChange('selectedTestNames', allTests);
                  }}
                  disabled={selectedTestNames.length === allTests.length}
                >
                  <span className="text-sm font-semibold">Select All</span>
                </DropdownMenuItem>
                {/* Deselect All Option */}
                <DropdownMenuItem
                  onSelect={e => e.preventDefault()}
                  onClick={() => {
                    handleFilterChange('selectedTestNames', []);
                  }}
                  disabled={selectedTestNames.length === 0}
                >
                  <span className="text-sm font-semibold">Deselect All</span>
                </DropdownMenuItem>
                {/* Divider */}
                <div className="border-b border-gray-200 my-1" />
                {/* Individual Test Options */}
                {allTests
                  .filter(test => !selectedTestNames.includes(test))
                  .map(test => (
                    <DropdownMenuItem
                      key={test}
                      onSelect={e => e.preventDefault()} // <-- Add this line
                      onClick={() => {
                        if (selectedTestNames.includes(test)) return;
                        const updated = [...filters.selectedTestNames, test];
                        handleFilterChange('selectedTestNames', updated);
                      }}
                    >
                      <span className="text-sm">{test}</span>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div>
            <label className="block font-semibold mb-1">Selected Test Name</label>
            <div className="flex border-2 border-orange-300 flex-wrap gap-2 rounded-md p-2 dark:bg-gray-800 min-h-[42px] w-full overflow-y-auto max-h-20">
              {selectedTestNames.length === 0 && (
                <span className="text-gray-400 dark:text-white">No test added</span>
              )}
              {selectedTestNames.map((test, idx) => (
                <span
                  key={test}
                  className="flex items-center bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm font-semibold"
                >
                  {test}
                  <button
                    type="button"
                    className="ml-2 text-orange-700 hover:text-red-600 focus:outline-none"
                    onClick={() => {
                      const updated = filters.selectedTestNames.filter(t => t !== test);
                      handleFilterChange('selectedTestNames', updated);
                    }}
                    aria-label={`Remove ${test}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Sample Status</label>
            <select
              name='sample_status'
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800"
            >
              <option value="">Select Sample Status</option>
              <option value="reporting">Under Reporting</option>
              <option value="reported">Reported</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">From Date</label>
            <Input
              name='from_date'
              type="date"
              value={filters.from_date}
              onChange={(e) => handleFilterChange('from_date', e.target.value)}
              className="border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800 w-full"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">To Date</label>
            <Input
              name='to_date'
              type="date"
              value={filters.to_date}
              onChange={(e) => handleFilterChange('to_date', e.target.value)}
              className="border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800 w-full"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Doctor's Name</label>
            <Input
              name='doctor_name'
              value={filters.doctor_name}
              onChange={(e) => handleFilterChange('doctor_name', e.target.value)}
              placeholder="Doctor's Name"
              className="border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800 w-full"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Dept. Name</label>
            <Input
              name='dept_name'
              placeholder="Dept. Name"
              value={filters.dept_name}
              onChange={(e) => handleFilterChange('dept_name', e.target.value)}
              className="border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800 w-full"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Run id</label>
            <Input
              name='run_id'
              placeholder="Run id"
              value={filters.run_id}
              onChange={(e) => handleFilterChange('run_id', e.target.value)}
              className="border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800 w-full"
            />
          </div>
          <div className="col-span-full">
          {processing ? 
            <Button
              type='submit'
              disabled
              className="w-[240px] mt-[20px] bg-gray-700 hover:bg-gray-800 text-white cursor-pointer"
            >
              Retrieving...
            </Button>
           : 
           
            <Button
              type='submit'
              onClick={() => { handleSubmit() }}
              className="w-[240px] mt-[20px] bg-gray-700 hover:bg-gray-800 text-white cursor-pointer"
            >
              Retrieve
            </Button>
           }
          </div>
        </div>
      </div>

      {tableRows && tableRows.length > 0 && (
        <div>
          {/* Column Selector Dropdown */}
          <div className="mb-4 flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[180px]">
                  Select Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="max-h-72 overflow-y-auto w-64">
                <DropdownMenuCheckboxItem
                  checked={Object.values(table.getState().columnVisibility).every(Boolean)} // Check if all are visible
                  onCheckedChange={(value) =>
                    table.getAllLeafColumns().forEach((column) => column.toggleVisibility(!!value))
                  }
                >
                  Select All
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  // Deselect All: show only defaultVisible columns
                  onClick={() => {
                    table.getAllLeafColumns().forEach((column) => {
                      column.toggleVisibility(defaultVisible.includes(column.id));
                    });
                  }}
                >
                  Deselect All
                </DropdownMenuCheckboxItem>
                {table
                  .getAllLeafColumns()
                  .slice() // Create a copy of the array
                  .sort((a, b) => a.columnDef.header.localeCompare(b.columnDef.header)) // Sort the copied array
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.columnDef.header}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-sm text-gray-500">
              Showing {Object.values(table.getState().columnVisibility).filter(Boolean).length || columns.length} of {columns.length} columns
            </span>
          </div>

          {/* Table */}
          <div className="">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-6 overflow-x-auto w-full whitespace-nowrap" style={{ maxWidth: 'calc(100vw - 60px)' }}>
              <div className="max-h-[70vh] overflow-y-auto w-full">
                <table className="min-w-full border-collapse table-auto">
                  <thead className="bg-orange-100 dark:bg-gray-800 sticky top-0 z-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            onClick={header.column.getToggleSortingHandler()}
                            className="cursor-pointer px-4 py-2 text-left border-b border-gray-200 bg-orange-100 dark:bg-gray-800 sticky top-0 z-50 whitespace-nowrap"
                            style={{ width: '140px', minWidth: '140px', maxWidth: '140px' }} // <-- fixed width
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.length ? (
                      table.getRowModel().rows.map((row) => (
                        <tr key={row.id ?? row.index}>
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              className="px-4 py-2 border-b border-gray-100"
                              style={{ width: '400px', minWidth: '140px', maxWidth: '400px', padding: 0 }} // Remove padding for scroll
                            >
                              <div
                                style={{
                                  width: '400px',
                                  minWidth: '140px',
                                  maxWidth: '200px',
                                  overflowX: 'auto',
                                  whiteSpace: 'nowrap',
                                  padding: '8px 16px', // add padding inside scrollable area
                                }}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={columns.length} className="text-center py-4 text-gray-400">
                          No data
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <Button
            className="bg-gray-700 hover:bg-gray-800 text-white cursor-pointer mb-4"
            onClick={handleSaveToExcel}
          >
            Save as Excel
          </Button>
        </div>
      )}
      <ToastContainer />
    </div>
  )
}

export default Reports