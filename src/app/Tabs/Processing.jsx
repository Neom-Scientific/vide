import React, { use, useEffect, useState } from "react";
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
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";


const Processing = () => {


  const allColumns = [
    { key: 'hospital_name', label: 'Hospital Name' },
    { key: 'vial_received', label: 'Vial Received' },
    { key: 'specimen_quality', label: 'Specimen Quality' },
    { key: 'registration_date', label: 'Registration Date' },
    { key: 'sample_date', label: 'Sample Date' },
    { key: 'sample_type', label: 'Sample Type' },
    { key: 'trf', label: 'TRF' },
    { key: 'collection_date_time', label: 'Collection Date Time' },
    { key: 'storage_condition', label: 'Storage Condition' },
    { key: 'prority', label: 'Prority' },
    { key: 'hospital_id', label: 'Hospital ID' },
    { key: 'client_id', label: 'Client ID' },
    { key: 'client_name', label: 'Client Name' },
    { key: 'sample_id', label: 'Sample ID' },
    { key: 'patient_name', label: 'Patient Name' },
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
    { key: 'docter_name', label: 'Doctor Name' },
    { key: 'email', label: 'Email' },
    { key: 'test_name', label: 'Test Name' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'clinical_history', label: 'Clinical History' },
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
    { key: 'Qubit_hs', label: 'Qubit HS' },
    { key: 'conc/rxn', label: 'conc/rxn' },
    { key: 'barcode', label: 'Barcode' },
    { key: 'i5_index_reverse', label: 'i5 (reverse)' },
    { key: 'i7_index', label: 'i7 index' },
    { key: 'lib_qubit', label: 'Lib Qubit ng/ml' },
    { key: 'nM_conc', label: 'nM conc' },
    { key: 'volumefromStock_lib', label: 'Volume from stock library for 2nM' },
    { key: 'nfw_volu_for_2nM', label: 'NFW Volume For 2nM' },
    { key: 'total_vol_for_2nM', label: 'Total Volume For 2nM' },
  ];

  const allTests = [
    'WES',
    'CS',
    'Myeloid',
    'Cardio',
    'SHS',
    'SolidTumor Panel',
    'Cardio Comprehensive (Screening Test)',
    'Cardio Metabolic Syndrome (Screening Test)',
    'Cardio Comprehensive Myopathy'
  ];

  const rows = [
    {
      hospital_name: 'Apollo',
      vial_received: 'Yes',
      specimen_quality: 'Good',
      registration_date: '2024-05-21',
      sample_date: '2024-05-21',
      sample_type: 'Blood',
      trf: 'trf1.pdf',
      collection_date_time: '2024-05-21T10:00',
      storage_condition: 'Refrigerated',
      prority: 'Routine',
      hospital_id: 'H001',
      client_id: 'C001',
      client_name: 'Client A',
      sample_id: 'S001',
      patient_name: 'John Doe',
      DOB: '1990-01-01',
      age: '34',
      sex: 'Male',
      ethnicity: 'Asian',
      father_husband_name: 'Richard Doe',
      address: '123 Main St',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      patient_mobile: '9999999999',
      docter_mobile: '8888888888',
      docter_name: 'Dr. Smith',
      email: 'john@example.com',
      test_name: 'WES,Myeloid',
      remarks: 'N/A',
      clinical_history: 'None',
      repeat_required: 'No',
      repeat_reason: '',
      repeat_date: '',
      selectedTestName: 'WES',
      systolic_bp: '120',
      diastolic_bp: '80',
      total_cholesterol: '180',
      hdl_cholesterol: '50',
      ldl_cholesterol: '100',
      diabetes: 'No',
      smoker: 'Never',
      hypertension_treatment: 'No',
      statin: 'No',
      aspirin_therapy: 'No',
      dna_isolation: 'Yes',
      lib_prep: 'No',
      under_seq: 'No',
      seq_completed: 'No',
    },
    // Add more rows as needed
  ];

  const [tableRows, setTableRows] = useState(rows);
  const [selectedTestNames, setSelectedTestNames] = useState([]);
  const [showLibPrepColumns, setShowLibPrepColumns] = useState(false);
  const [getTheTestNames, setGetTheTestNames] = useState([]);
  const [selectedSampleIndicator, setSelectedSampleIndicator] = useState('');

  // Build columns for tanstack table
  const columns = [
    {
      accessorKey: "sno",
      header: "S. No.",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: false,
    },
    ...allColumns.map(col => {
      if (col.key === "registration_date") {
        return {
          accessorKey: col.key,
          header: col.label,
          cell: info => {
            const value = info.getValue();
            if (!value) return "";
            const date = new Date(value);
            if (isNaN(date)) return value;
            // Format: YYYY-MM-DD HH:mm
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, '0');
            const dd = String(date.getDate()).padStart(2, '0');
            const hh = String(date.getHours()).padStart(2, '0');
            const min = String(date.getMinutes()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
          },
        };
      }
      // ...your checkbox logic for dna_isolation, etc...
      if (
        ["dna_isolation", "lib_prep", "under_seq", "seq_completed"].includes(col.key)
      ) {
        if (col.key === "lib_prep") {
          return {
            accessorKey: col.key,
            header: col.label,
            cell: info => {
              const isChecked = info.getValue() === "Yes";
              const rowIdx = info.row.index;
              return (
                <Checkbox
                  checked={isChecked}
                  disabled={isChecked}
                  onCheckedChange={checked => {
                    // Update the state to show/hide the columns
                    setShowLibPrepColumns(checked);

                    // Update the row data
                    setTableRows(prev =>
                      prev.map((row, idx) =>
                        idx === rowIdx
                          ? { ...row, lib_prep: checked ? "Yes" : "No" }
                          : row
                      )
                    );
                    if(checked){
                      setSelectedSampleIndicator(col.key);
                    }
                    else{
                      setSelectedSampleIndicator('');
                    }
                  }}
                />
              );
            }
          };
        }
        return {
          accessorKey: col.key,
          header: col.label,
          cell: info => {
            const isChecked = info.getValue() === "Yes";
            return (
              <Checkbox
                checked={isChecked}
                disabled={isChecked}
                onCheckedChange={checked => {
                  const testNames = info.row.original.test_name;
                  setGetTheTestNames(testNames.split(',').map(name => name.trim()));
                  setSelectedSampleIndicator(col.key);
                  setTableRows(prev =>
                    prev.map((row, idx) =>
                      idx === info.row.index
                        ? { ...row, [col.key]: checked ? "Yes" : "No" }
                        : row
                    )
                  );
                }}
              />
            );
          },
        };
      }
      // Default: render as text
      if ([
        "Qubit_hs",
        "conc/rxn",
        "barcode",
        "i5_index_reverse",
        "i7_index",
        "lib_qubit",
        "nM_conc",
        "volumefromStock_lib",
        "nfw_volu_for_2nM",
        "total_vol_for_2nM",
      ].includes(col.key)) {
        return {
          accessorKey: col.key,
          header: col.label,
          cell: info => {
            const value = info.getValue() ?? ""; // Current value from the state
            const rowIndex = info.row.index;
            const columnId = info.column.id;
        
            // Check if the row is eligible for editing
            const testNames = info.row.original.test_name?.split(',').map(t => t.trim());
            const isLibPrepMyeloid =
              info.row.original.lib_prep === "Yes" && testNames.includes("Myeloid");
        
            if (!isLibPrepMyeloid) return value;
        
            return (
              <Input
                className="border rounded p-1 text-xs w-full"
                value={value}
                type="text"
                placeholder={`Enter ${info.column.columnDef.header}`}
                name={columnId}
                onChange={async (e) => {
                  const newValue = e.target.value;
        
                  // Update the local state
                  info.table.options.meta?.updateData(rowIndex, columnId, newValue);
        
                  // Prepare the payload for the API
                  const payload = {
                    sample_id: info.row.original.sample_id,
                    sample_indicator: selectedSampleIndicator,
                    test_name: getTheTestNames.length > 0 ? getTheTestNames.join(',') : info.row.original.test_name,
                    [columnId]: newValue, // Update only the changed column
                  };
        
                  try {
                    // Make the API call
                    const response = await axios.post('/api/update-sample-indicator', payload);
                    toast.success("Value updated successfully!");
                    console.log("API Response:", response.data);
                  } catch (error) {
                    console.error("Error updating value:", error);
                    toast.error("An error occurred while updating the value.");
                  }
                }}
              />
            );
          }
        }
      }
      return {
        accessorKey: col.key,
        header: col.label,
        cell: info => info.getValue() || "",
      };
    }),
  ];

  // Only these columns are visible by default
  const defaultVisible = [
    "sno",
    "sample_id",
    "registration_date",
    "test_name",
    "client_name",
    "dna_isolation",
    "lib_prep",
    "under_seq",
    "seq_completed",
  ];

  // Set initial column visibility: true for defaultVisible, false for others
  const [columnVisibility, setColumnVisibility] = useState(() =>
    columns.reduce((acc, col) => {
      acc[col.accessorKey] = defaultVisible.includes(col.accessorKey);
      return acc;
    }, {})
  );

  // Dynamically update column visibility when `showLibPrepColumns` changes
  useEffect(() => {
    setColumnVisibility(prev => ({
      ...prev,
      Qubit_hs: showLibPrepColumns,
      'conc/rxn': showLibPrepColumns,
      barcode: showLibPrepColumns,
      i5_index_reverse: showLibPrepColumns,
      i7_index: showLibPrepColumns,
      lib_qubit: showLibPrepColumns,
      nM_conc: showLibPrepColumns,
      volumefromStock_lib: showLibPrepColumns,
      nfw_volu_for_2nM: showLibPrepColumns,
      total_vol_for_2nM: showLibPrepColumns,
      under_seq: !showLibPrepColumns,
      seq_completed: !showLibPrepColumns,
    }));
  }, [showLibPrepColumns]);

  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

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

  const handlesubmit = async () => {
    const getValue = (name) => document.getElementsByName(name)[0]?.value || "";

    const data = {
      sample_id: getValue('sample_id'),
      test_name: selectedTestNames.join(','),
      sample_status: getValue('sample_status'),
      sample_indicator: getValue('sample_indicator'),
      from_date: getValue('from_date'),
      to_date: getValue('to_date'),
      doctor_name: getValue('doctor_name'),
      dept_name: getValue('dept_name'),
      run_id: getValue('run_id'),
    };

    try {
      const response = await axios.get(`/api/search`, { params: data });
      // Axios automatically parses JSON, so use response.data
      setTableRows(response.data.data);
      // toast.success("Data fetched successfully!");
    } catch (error) {
      // Axios error handling
      if (error.response) {
        // Server responded with a status other than 2xx
        setTableRows([]);
        toast.error(error.response.data.message || "An error occurred while fetching the data.");
      } else {
        // Network error or other
        setTableRows([]);
        toast.error(error.message || "An unknown error occurred.");
      }
      console.error("Error fetching data:", error);
    }

    console.log("Form submitted with filters:", data);
  };

  return (
    <div className="p-4">


      {/* Top Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-5 gap-4 mb-2">
          <div>
            <label className="block font-semibold mb-1">Sample id</label>
            <Input
              name='sample_id'
              placeholder="Sample id"
              className="my-1"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 whitespace-nowrap">Test name</label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  className="h-10 bg-gray-800 text-white"
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
                          toast.warning(`${test} is already added`);
                          return;
                        }
                        const updated = [...selectedTestNames, test];
                        setSelectedTestNames(updated);
                        toast.success(`${test} added`);
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
            <div className="flex flex-wrap gap-2 min-h-[42px] border rounded-md p-2 dark:bg-gray-800 ml-2" style={{ flex: 1 }}>
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
          <div>
            <label className="block font-semibold mb-1">Sample Status</label>
            <select
              name='sample_status'
              className="w-full border rounded-md p-2 dark:bg-gray-800"
            >
              <option value="">Select Sample Status</option>
              <option value="processing">Under Processing</option>
              <option value="reporting">Ready for Reporting</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Sample Indicator</label>
            <select
              name='sample_indicator'
              className="w-full border rounded-md p-2 dark:bg-gray-800"
              onChange={e => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedSampleIndicator(options);
              }}
            >
              <option value="">Select the Sample Indicator</option>
              <option value="dna">DNA Isolation</option>
              <option value="library">Library Prep</option>
              <option value="sequencing">Under sequencing</option>
              <option value="completed">Sequencing completed</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-2">
          <div>
            <label className="block font-semibold mb-1 mt-2">From Date</label>
            <Input
              name='from_date'
              type="date"
              className="my-1"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 mt-2">To Date</label>
            <Input
              name='to_date'
              type="date"
              className="my-1"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 mt-2">Doctor's Name</label>
            <Input
              name='doctor_name'
              placeholder="Doctor's Name"
              className="my-1"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 mt-2">Dept. Name</label>
            <Input
              name='dept_name'
              placeholder="Dept. Name"
              className="my-1"
            />
          </div>
        </div>
        <div className='grid grid-cols-4 gap-4 mb-2 '>
          <div>
            <label className="block font-semibold mb-1">Run id</label>
            <Input
              name='run_id'
              placeholder="Run id"
              className="my-1"
            />
          </div>

          <div>
            <Button
              type='submit'
              onClick={() => { handlesubmit() }}
              className="mt-6 bg-gray-700 text-white hover:bg-gray-800 w-full">
              Retrieve
            </Button>
          </div>
        </div>
      </div>

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
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                    {/* Submit Button for rows where lib_prep columns are visible
                    {showLibPrepColumns && (
                      <TableCell colSpan={1}>
                        <Button
                          type="button"
                          onClick={handleLibPrepMyeloidSubmit}
                          className="bg-orange-500 text-white hover:bg-orange-600 w-full"
                        >
                          Submit
                        </Button>
                      </TableCell>
                    )} */}
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
      <Button className="bg-gray-700 mt-5 text-white hover:bg-gray-800 min-w-[120px] h-12">Save</Button>
      <ToastContainer />

    </div>
  );
};

export default Processing;