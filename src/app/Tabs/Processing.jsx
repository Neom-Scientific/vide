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
import { useDispatch } from "react-redux";
import { setActiveTab } from "@/lib/redux/slices/tabslice";
import { CldOgImage } from "next-cloudinary";
import Cookies from "js-cookie";


const Processing = () => {

  const user = JSON.parse(Cookies.get('user') || '{}');

  const allColumns = [
    { key: 'hospital_name', label: 'Hospital Name' },
    { key: 'vial_received', label: 'Vial Received' },
    { key: 'specimen_quality', label: 'Specimen Quality' },
    { key: 'registration_date', label: 'Registration Date' },
    { key: 'dept_name', label: 'Department Name' },
    { key: 'run_id', label: 'Run ID' },
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
  ];

  const allTests = [
    'WES',
    'CS',
    'Clinical Exome',
    'Myeloid',
    'Cardio',
    'SGS',
    'SolidTumor Panel',
    'Cardio Comprehensive (Screening Test)',
    'Cardio Metabolic Syndrome (Screening Test)',
    'Cardio Comprehensive Myopathy'
  ];

  let rows = [];

  const [tableRows, setTableRows] = useState(rows);
  const [selectedTestNames, setSelectedTestNames] = useState([]);
  const [showLibPrepColumns, setShowLibPrepColumns] = useState(false);
  const [getTheTestNames, setGetTheTestNames] = useState([]);
  const [selectedSampleIndicator, setSelectedSampleIndicator] = useState('');
  const [selectedLibPrepTestName, setSelectedLibPrepTestName] = useState(null);
  const dispatch = useDispatch();

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
              const currentTestName = info.row.original.test_name;

              return (
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={async checked => {
                    // Validate test_name before allowing selection
                    if (checked) {
                      if (
                        selectedLibPrepTestName &&
                        selectedLibPrepTestName !== currentTestName
                      ) {
                        toast.warning(
                          `You can only select Library Prep for rows with the same test name: ${selectedLibPrepTestName}`
                        );
                        return;
                      }

                      // Set the selected test_name if valid
                      setSelectedLibPrepTestName(currentTestName);
                    } else {
                      // Clear the selected test_name if no rows are selected
                      const remainingRows = tableRows.filter(
                        row => row.lib_prep === "Yes" && row.test_name === currentTestName
                      );
                      if (remainingRows.length === 1) {
                        setSelectedLibPrepTestName(null);
                      }
                    }


                    const payload = {
                      sample_id: info.row.original.sample_id,
                      sample_indicator: col.key,
                      indicator_status: checked ? "Yes" : "No",
                    };
                    console.log("Payload for API call:", payload);

                    try {
                      // Make the API call
                      const response = await axios.put("/api/update-sample-indicator", {
                        data: payload,
                      });

                      console.log("API response:", response.data);
                      if (response.data[0].status === 200) {
                      } else {
                        toast.error(response.data[0].message || "Failed to update sample indicator.");
                      }
                    } catch (error) {
                      console.error("Error updating sample indicator:", error);
                      toast.error("An error occurred while updating the sample indicator.");
                    }

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
                  }}
                />
              );
            },
          };
        }
        return {
          accessorKey: col.key,
          header: col.label,
          cell: info => {
            const isChecked = info.getValue() === "Yes";
            const rowIdx = info.row.index;
            const currentTestName = info.row.original.test_name;

            return (
              <Checkbox
                checked={isChecked}
                onCheckedChange={async checked => {
                  // Update the row data locally
                  const updatedRow = {
                    ...info.row.original,
                    [col.key]: checked ? "Yes" : "No",
                  };

                  // Update the state
                  setTableRows(prev =>
                    prev.map((row, idx) =>
                      idx === rowIdx ? updatedRow : row
                    )
                  );

                  // Prepare the API payload
                  const payload = {
                    sample_id: updatedRow.sample_id,
                    sample_indicator: col.key,
                    indicator_status: checked ? "Yes" : "No",
                  };

                  try {
                    // Make the API call
                    const response = await axios.put("/api/update-sample-indicator", {
                      data: payload,
                    });

                    console.log("API response:", response.data);
                    if (response.data[0].status === 200) {
                    } else {
                      toast.error(response.data[0].message || "Failed to update sample indicator.");
                    }
                  } catch (error) {
                    console.error("Error updating sample indicator:", error);
                    toast.error("An error occurred while updating the sample indicator.");
                  }
                }}
              />
            );
          },
        };
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
      sample_id: getValue("sample_id"),
      test_name: selectedTestNames.join(","),
      sample_status: getValue("sample_status"),
      sample_indicator: getValue("sample_indicator"),
      from_date: getValue("from_date"),
      to_date: getValue("to_date"),
      doctor_name: getValue("doctor_name"),
      dept_name: getValue("dept_name"),
      run_id: getValue("run_id"),
      hospital_name: user.hospital_name, // Use the hospital name from the user cookie
    };

    try {
      const response = await axios.get(`/api/search`, { params: data });

      if (response.data[0].status === 200) {
        // Map the data to ensure checkbox fields are "Yes"/"No"
        const mappedData = response.data[0].data.map((row) => ({
          ...row,
          dna_isolation: row.dna_isolation === "Yes" ? "Yes" : "No",
          lib_prep: row.lib_prep === "Yes" ? "Yes" : "No",
          under_seq: row.under_seq === "Yes" ? "Yes" : "No",
          seq_completed: row.seq_completed === "Yes" ? "Yes" : "No",
        }));
        setTableRows(mappedData); // Update the tableRows state with the mapped data
        localStorage.setItem("searchData", JSON.stringify(mappedData)); // Store the data in localStorage
      } else if (response.data[0].status === 400 || response.data[0].status === 404) {
        toast.error(response.data[0].message || "No data found for the given filters.");
        setTableRows([]);
      }
    } catch (error) {
      if (error.response) {
        setTableRows([]);
        toast.error(error.response.data.message || "An error occurred while fetching the data.");
      }
      console.error("Error fetching data:", error);
    }

  };

  // Check if any row has lib_prep set to "Yes"
  const isAnyLibPrepChecked = tableRows.some(row => row.lib_prep === "Yes");

  const handleSendForLibraryPreparation = () => {
   

    if (checkedRows.length === 0) {
      toast.warning("No rows selected for Library Preparation.");
      return;
    }

    // Check if data already exists in localStorage
    if (localStorage.getItem("libraryPreparationData")) {
      toast.warning("Some rows are already present in the Library Preparation.");
      return;
    }

    // Save the checked rows to localStorage or a shared state
    localStorage.setItem("libraryPreparationData", JSON.stringify(checkedRows));

    // Navigate to the LibraryPreparation tab
    dispatch(setActiveTab("library-prepration"));
  };

  useEffect(()=>{
    if(localStorage.getItem("searchData")){
      const storedData = JSON.parse(localStorage.getItem("searchData"));
      setTableRows(storedData);
    }
  },[])

  return (
    <div className="p-4">


      {/* Top Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4 mb-2">
          <div className="me-5">
            <label className="block font-semibold mb-1">Sample id</label>
            <Input
              name='sample_id'
              placeholder="Sample id"
              className="my-1 w-[150px] border-2 border-orange-300"
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
            <label className="block font-semibold mb-1">Sample Status</label>
            <select
              name='sample_status'
              className="w-[400px] border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800"
            >
              <option value="">Select Sample Status</option>
              <option value="processing">Under Processing</option>
              <option value="reporting">Ready for Reporting</option>
            </select>
          </div>
          <div className="me-5">
            <label className="block font-semibold mb-1">Sample Indicator</label>
            <select
              name='sample_indicator'
              className="w-[400px] border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800"
              onChange={e => {
                const options = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedSampleIndicator(options);
              }}
            >
              <option value="">Select the Sample Indicator</option>
              <option value="dna_isolation">DNA Isolation</option>
              <option value="lib_prep">Library Prep</option>
              <option value="under_seq">Under sequencing</option>
              <option value="seq_completed">Sequencing completed</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4 mb-2">
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
              onClick={() => { handlesubmit() }}
              className="mt-6 bg-gray-700 hover:bg-gray-800 text-white cursor-pointer w-full">
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
      <div className="flex justify-between items-center mb-4">
        <Button
          className="bg-gray-700 hover:bg-gray-800 mt-5 text-white cursor-pointer min-w-[120px] h-12"
          onClick={() => {
            // Save logic here
            console.log("Save clicked");
          }}
        >
          Save
        </Button>

        {isAnyLibPrepChecked && (
          <Button
            className={"mt-5 text-white cursor-pointer min-w-[200px] h-12 bg-gray-700 hover:bg-gray-800 " + (isAnyLibPrepChecked ? "" : "opacity-50")}
            onClick={handleSendForLibraryPreparation}
          >
            Send for Library Preparation
          </Button>
        )}

      </div>
      <ToastContainer />

    </div>
  );
};

export default Processing;