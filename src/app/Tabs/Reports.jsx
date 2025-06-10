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
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
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
  const [user, setUser] = useState(null);
  useEffect(() => {
    const CookieUser = Cookies.get('user');
    if (CookieUser) {
      setUser(JSON.parse(CookieUser));
    }
  }, []);
  const allTests = [
    'WES',
    'CS',
    'Clinical Exome',
    'Myeloid',
    'HLA',
    'SGS',
    'SolidTumor Panel',
    'Cardio Comprehensive (Screening Test)',
    'Cardio Metabolic Syndrome (Screening Test)',
    'Cardio Comprehensive Myopathy'
  ];

  const allColumns = [
    { key: 'hospital_name', label: 'Organization Name' },
    { key: 'vial_received', label: 'Vial Received' },
    { key: 'specimen_quality', label: 'Specimen Quality' },
    { key: 'run_id', label: 'Run ID' },
    { key: 'sample_id', label: 'Sample ID' },
    { key: 'registration_date', label: 'Registration Date' },
    { key: 'sample_date', label: 'Sample Date' },
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'client_name', label: 'Client Name' },
    { key: 'seq_run_date', label: 'Sequencing Run Date' },
    { key: 'phenotype_rec_date', label: 'Phenotype Receiving Date' },
    { key: 'tantive_report_date', label: 'Tantive Report Date' },
    { key: 'report_releasing_date', label: 'Report Releasing Date' },
    { key: 'tat_days', label: 'TAT Days' },
    { key: 'sample_type', label: 'Sample Type' },
    { key: 'test_name', label: 'Test Name' },
    { key: 'trf', label: 'TRF' },
    { key: 'report_status', label: 'Report Status' },
    { key: 'report_link', label: 'Report Link' },
    { key: 'upload_report', label: 'Upload Report' },
    { key: 'hpo_status', label: 'HPO Status' },
    { key: 'annotation', label: 'Annotation' },
    { key: 'doctor_name', label: 'Doctor Name' },
    { key: 'dept_name', label: 'Department Name' },
    { key: 'collection_date_time', label: 'Collection Date Time' },
    { key: 'storage_condition', label: 'Storage Condition' },
    { key: 'prority', label: 'Prority' },
    { key: 'hospital_id', label: 'Hospital ID' },
    { key: 'client_id', label: 'Client ID' },
    { key: 'DOB', label: 'DOB' },
    { key: 'age', label: 'Age' },
    { key: 'sex', label: 'Sex' },
    { key: 'ethnicity', label: 'Ethnicity' },
    { key: 'father_husband_name', label: 'Father/Husband Name' },
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

  const handleChangeCheckbox = async (e, columnKey, sampleId) => {
    const isChecked = e.target.checked;
    try {
      console.log('Updating:', sampleId, columnKey, isChecked);

      // Prepare the updates object
      const updates = {
        [columnKey]: isChecked ? "Yes" : "No", // Dynamically set the column value
      };

      // Send the PUT request with the correct structure
      const response = await axios.put('/api/store', {
        sample_id: sampleId, // Pass the sample_id
        updates, // Pass the updates object
      });

      console.log('response:', response.data);
      if (response.data[0].status === 200) {
        toast.success(`Updated ${columnKey} successfully!`);
        // Update the tableRows state to reflect the change
        setTableRows(prevRows =>
          prevRows.map(row =>
            row.sample_id === sampleId
              ? { ...row, [columnKey]: isChecked ? "Yes" : "No" }
              : row
          )
        );
      } else {
        toast.error(`Failed to update ${columnKey}: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error updating data:", error);
      toast.error("An error occurred while updating the data.");
    }
  };

  const handleFileUpload = async (file, sampleId) => {
    if (!file) {
      toast.error("No file selected");
      return;
    }
    try {
      // Prepare the form data
      const formData = new FormData();
      formData.append("file", file);
      // Upload the file to the backend
      // const uploadResponse = await axios.post("/api/upload", formData, {
      //   headers: {
      //     "Content-Type": "multipart/form-data",
      //   },
      // });

      // if (uploadResponse.status === 200) {
      //   const reportLink = uploadResponse.data.fileUrl; // Assuming the backend returns the file URL

      // Prepare the updates object
      const updates = {
        report_link: file.name, // Use the file name as the report link
        report_releasing_date: new Date().toISOString(), // Current date in ISO format
        sample_status: "Reported", // Set the report status to "Reported"
      };

      // Send the PUT request to update the database
      const response = await axios.put("/api/store", {
        sample_id: sampleId,
        updates,
      });

      if (response.data[0].status === 200) {
        toast.success("Report uploaded and updated successfully!");
        // Update the tableRows state to reflect the change
        setTableRows((prevRows) =>
          prevRows.map((row) =>
            row.sample_id === sampleId
              ? { ...row, ...updates }
              : row
          )
        );
      } else {
        toast.error(`Failed to update report: ${response.data.message}`);
      }
      // } else {
      //   toast.error("Failed to upload the file");
      // }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("An error occurred while uploading the file.");
    }
  };

  const isPrivilegedUser = user?.role === "SuperAdmin";

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
        // Checkboxes
        if (col.key === "hpo_status" || col.key === "annotation") {
          return {
            accessorKey: col.key,
            id: col.key,
            header: col.label,
            cell: info => {
              const value = info.getValue();
              const sampleId = info.row.original.sample_id;
              return (
                <input
                  type="checkbox"
                  checked={value === "Yes"}
                  onChange={e => handleChangeCheckbox(e, col.key, sampleId)}
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
            return (
              <input
                type="file"
                className="border-2 border-orange-300 rounded-md p-1 dark:bg-gray-800"
                onChange={e => handleFileUpload(e.target.files[0], sampleId)}
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

  const defaultVisible = [
    'sno',
    'run_id',
    'sample_id',
    'registration_date',
    'patient_name',
    'client_name',
    'seq_run_date',
    'phenotype_rec_date',
    'tantive_report_date',
    'report_releasing_date',
    'tat_days',
    'sample_type',
    'test_name',
    'trf',
    'report_status',
    'report_link',
    ...(isPrivilegedUser ? ["upload_report"] : []), // Only show actions for privileged users
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
    getPaginationRowModel: getPaginationRowModel(),
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

    const data = {
      sample_id: getValue("sample_id"),
      test_name: selectedTestNames.join(","),
      sample_status: getValue("sample_status"),
      from_date: getValue("from_date"),
      to_date: getValue("to_date"),
      doctor_name: getValue("doctor_name"),
      dept_name: getValue("dept_name"),
      run_id: getValue("run_id"),
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
            const registrationDate = new Date(row.registration_date);
            const tantiveReportDate = new Date(registrationDate);
            tantiveReportDate.setDate(tantiveReportDate.getDate() + 7); // Add 7 days
            // const formattedTantiveReportDate = `${tantiveReportDate.getFullYear()}-${String(tantiveReportDate.getMonth() + 1).padStart(2, '0')}-${String(tantiveReportDate.getDate()).padStart(2, '0')}`;
            const tatDays = Math.ceil((tantiveReportDate - registrationDate) / (1000 * 60 * 60 * 24)); // Difference in days
            return {
              ...row,
              phenotype_rec_date: row.registration_date, // Set phenotype_rec_date to registration_date
              tantive_report_date: row.tantive_report_date, // Format as YYYY-MM-DD
              report_realising_date: row.report_realising_date || '', // Ensure report_realising_date is set
              tat_days: tatDays,
            };
          });

          setTableRows(updatedRows);
        } else {
          setTableRows([]);
          console.warn("No data found for the given filters.");
        }
      } else {
        toast.error(response.data[0].message || "Failed to retrieve data");
      }
    }
    catch (error) {
      console.error("Error in handleSubmit:", error);
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
  return (
    <div className="p-4">

      {/* top filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 mb-2">
          <div className="me-5">
            <label className="block font-semibold mb-1">Sample id</label>
            <Input
              name='sample_id'
              placeholder="Sample id"
              className="my-1 w-[200px] border-2 border-orange-300"
            />
          </div>
          <div className="me-5">
            <label className="block font-semibold mb-1 whitespace-nowrap">Test name</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  className="h-10 bg-gray-700 hover:bg-gray-800 cursor-pointer text-white"
                >
                  Add Test
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-[250px]">
                {allTests
                  .filter(test => !selectedTestNames.includes(test))
                  .map(test => (
                    <DropdownMenuItem
                      key={test}
                      onClick={() => {
                        if (selectedTestNames.includes(test)) {
                          return;
                        }
                        const updated = [...selectedTestNames, test];
                        setSelectedTestNames(updated);
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
            <div className="flex w-[400px] border-2 border-orange-300 flex-wrap gap-2 rounded-md p-2 dark:bg-gray-800 ml-2" style={{ flex: 1 }}>
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
                      const updated = selectedTestNames.filter(t => t !== test);
                      setSelectedTestNames(updated);
                    }}
                    aria-label={`Remove ${test}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          <div className="me-5">
            <label className="block font-semibold mb-1">Status</label>
            <select
              name='sample_status'
              className="w-[400px] border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800"
            >
              <option value="">Select Status</option>
              <option value="ready">Ready for Reporting</option>
              <option value="reported">Reported</option>
            </select>
          </div>

          <div className="flex gap-4 me-5">
            <div className="me-5">
              <label className="block font-semibold mb-1 mt-2">From Date</label>
              <Input
                name='from_date'
                type="date"
                className="my-1 border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 mt-2">To Date</label>
              <Input
                name='to_date'
                type="date"
                className="my-1 border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800"
              />
            </div>
          </div>

        </div>

        <div className="flex gap-4 mb-2">
          <div className="me-5">
            <label className="block font-semibold mb-1 mt-2">Doctor's Name</label>
            <Input
              name='doctor_name'
              placeholder="Doctor's Name"
              className="w-[400px] my-1 border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800"
            />
          </div>

          <div className="me-5">
            <label className="block font-semibold mb-1 mt-2">Dept. Name</label>
            <Input
              name='dept_name'
              placeholder="Dept. Name"
              className="w-[400px] my-1 border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800"
            />
          </div>

          <div className="me-5">
            <label className="block font-semibold mb-1 mt-2">Run id</label>
            <Input
              name='run_id'
              placeholder="Run id"
              className="w-[400px] my-1 border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800"
            />
          </div>

        </div>

        <div className='grid grid-cols-4 gap-4 mb-2 '>

          <div>
            <Button
              type='submit'
              onClick={handleSubmit}
              className="mt-6 bg-gray-700 hover:bg-gray-800 text-white cursor-pointer w-[200px]">
              Retrieve
            </Button>
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
            <div
              className="bg-white dark:bg-gray-900 rounded-lg shadow mb-6 overflow-x-auto w-full py-4"
              style={{ maxWidth: 'calc(100vw - 50px)', overflowY: 'auto' }}
            >
              <Table className="min-w-full">
                <TableHeader className="bg-orange-100 dark:bg-gray-800">
                  {table.getHeaderGroups().map(headerGroup => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <TableHead
                          key={header.id}
                          className="cursor-pointer"
                          onClick={header.column.getToggleSortingHandler()} // Add sorting handler
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                          {/* Show sorting indicator */}
                          {header.column.getIsSorted() === "asc"}
                          {header.column.getIsSorted() === "desc"}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map(row => (
                      <TableRow key={row.id ?? row.index}>
                        {row.getVisibleCells().map(cell => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="text-center py-4 text-gray-400">
                        No data
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
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
