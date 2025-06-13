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
import { ChevronDown, ChevronUp } from "lucide-react";
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
import Cookies from "js-cookie";


const Processing = () => {
  const user = JSON.parse(Cookies.get("user") || "{}");

  const allColumns = [
    { key: 'hospital_name', label: 'Organization Name' },
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
    { key: 'father_mother_name', label: 'Father/Husband Name' },
    { key: 'spouse_name', label: 'Spouse Name' },
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
    { key: 'seq_run_date', label: 'Seq Run Date' },
    { key: 'report_realising_date', label: 'Report Realising Date' },
    { key: 'hpo_status', label: 'HPO Status' },
    { key: 'annotation', label: 'Annotation' },
    { key: 'report_link', label: 'Report Link' },
    { key: 'report_status', label: 'Report Status' },
    { key: 'report_releasing_date', label: 'Report Releasing Date' },
    { key: 'conc_rxn', label: 'Conc RXN' },
    { key: 'i5_index_reverse', label: 'I5 Index Reverse' },
    { key: 'i7_index', label: 'I7 Index' },
    { key: 'lib_qubit', label: 'Lib Qubit' },
    { key: 'nm_conc', label: 'NM Conc' },
    { key: 'nfw_volu_for_2nm', label: 'NFW Volu for 2nm' },
    { key: 'total_vol_for_2nm', label: 'Total Vol for 2nm' },
    { key: 'barcode', label: 'Barcode' },
    { key: 'lib_vol_for_2nm', label: 'Lib Vol for 2nm' },
    { key: 'qubit_dna', label: 'Qubit DNA' },
    { key: 'per_rxn_gdna', label: 'Per RXN GDNA' },
    { key: 'volume', label: 'Volume' },
    { key: 'gdna_volume_3x', label: 'GDNA Volume 3X' },
    { key: 'nfw', label: 'NFW' },
    { key: 'plate_designation', label: 'Plate Designation' },
    { key: 'well', label: 'Well' },
    { key: 'qubit_lib_qc_ng_ul', label: 'Qubit Lib QC NG/UL' },
    { key: 'stock_ng_ul', label: 'Stock NG/UL' },
    { key: 'lib_vol_for_hyb', label: 'Lib Vol for HYB' },
    { key: 'pool_no', label: 'Pool No' },
    { key: 'size', label: 'Size' },
    { key: 'i5_index_forward', label: 'I5 Index Forward' },
    { key: 'sample_volume', label: 'Sample Volume' },
    { key: 'pooling_volume', label: 'Pooling Volume' },
    { key: 'pool_conc', label: 'Pool Conc' },
    { key: 'one_tenth_of_nm_conc', label: 'One Tenth of NM Conc' },
    { key: 'data_required', label: 'Data Required' },
    { key: 'buffer_volume_next_seq_550', label: 'Buffer Volume Next Seq 550' },
    { key: 'dinatured_lib_next_seq_550', label: 'Dinatured Lib Next Seq 550' },
    { key: 'final_pool_conc_vol_2nm_next_seq_1000_2000', label: 'Final Pool Conc Vol 2nm Next Seq 1000-2000' },
    { key: 'instument_type', label: 'Instrument Type' },
    { key: 'lib_required_next_seq_550', label: 'Lib Required Next Seq 550' },
    { key: 'loading_conc_550', label: 'Loading Conc 550' },
    { key: 'loading_conc_1000_2000', label: 'Loading Conc 1000-2000' },
    { key: 'nm_cal', label: 'NM Cal' },
    { key: 'pool_conc_run_setup', label: 'Pool Conc Run Setup' },
    { key: 'pool_size', label: 'Pool Size' },
    { key: 'rsbetween_vol_2nm_next_seq_1000_2000', label: 'RS Between Vol 2nm Next Seq 1000-2000' },
    { key: 'selected_application', label: 'Selected Application' },
    { key: 'total_gb_available', label: 'Total GB Available' },
    { key: 'total_required', label: 'Total Required' },
    { key: 'total_volume_2nm_next_seq_1000_2000', label: 'Total Volume 2nm Next Seq 1000-2000' },
    { key: 'total_volume_600pm_next_seq_1000_2000', label: 'Total Volume 600pm Next Seq 1000-2000' },
    { key: 'total_volume_next_seq_550', label: 'Total Volume Next Seq 550' },
    { key: 'vol_of_2nm_for_600pm_next_seq_1000_2000', label: 'Vol of 2nm for 600pm Next Seq 1000-2000' },
    { key: 'vol_of_rs_between_for_600pm_next_seq_1000_2000', label: 'Vol of RS Between for 600pm Next Seq 1000-2000' },
    { key: 'total_volume_2nm_next_seq_550', label: 'Total Volume 2nm Next Seq 550' },
    { key: 'final_pool_conc_vol_2nm_next_seq_550', label: 'Final Pool Conc Vol 2nm Next Seq 550' },
    { key: 'nfw_vol_2nm_next_seq_550', label: 'NFW Vol 2nm Next Seq 550' },
    { key: 'final_pool_vol_ul', label: 'Final Pool Vol (ul)' },
    { key: 'ht_buffer_next_seq_1000_2000', label: 'HT Buffer Next Seq 1000-2000' },
  ];

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

  let rows = [];

  const [tableRows, setTableRows] = useState(rows);
  const [selectedTestNames, setSelectedTestNames] = useState([]);
  const [selectedSampleIndicator, setSelectedSampleIndicator] = useState('');
  const dispatch = useDispatch();

  const handleEditRow = (rowData) => {
    // Save the row data to localStorage or Redux for use in the SampleRegistration tab
    console.log('rowData:', rowData); // Debugging row data
    localStorage.setItem("editRowData", JSON.stringify(rowData));

    // Navigate to the SampleRegistration tab
    dispatch(setActiveTab("sample-register"));
  };

  const isPrivilegedUser = user?.role === "AdminUser" || user?.role === "SuperAdmin";
  const columns = React.useMemo(() => [
    {
      accessorKey: "sno",
      header: "S. No.",
      cell: ({ row }) => row.index + 1,
      enableSorting: true,
      enableHiding: false,
    },
    ...allColumns.map((col) => {
      if (col.key === "registration_date") {
        return {
          accessorKey: col.key,
          header: col.label,
          enableSorting: true,
          cell: (info) => {
            const value = info.getValue();
            if (!value) return "";
            const date = new Date(value);
            if (isNaN(date)) return value;
            // Format: YYYY-MM-DD HH:mm
            const yyyy = date.getFullYear();
            const mm = String(date.getMonth() + 1).padStart(2, "0");
            const dd = String(date.getDate()).padStart(2, "0");
            const hh = String(date.getHours()).padStart(2, "0");
            const min = String(date.getMinutes()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
          },
        };
      }
      if (["dna_isolation", "lib_prep", "under_seq", "seq_completed"].includes(col.key)) {
        return {
          accessorKey: col.key,
          header: col.label,
          enableSorting: true,
          cell: (info) => {
            const isChecked = info.getValue() === "Yes";
            const rowIdx = info.row.index;
            return (
              <Checkbox
                checked={isChecked}
                onCheckedChange={async (checked) => {
                  const updatedRow = {
                    ...info.row.original,
                    [col.key]: checked ? "Yes" : "No",
                  };
                  setTableRows((prev) =>
                    prev.map((row, idx) => (idx === rowIdx ? updatedRow : row))
                  );
                  const payload = {
                    sample_id: updatedRow.sample_id,
                    sample_indicator: col.key,
                    indicator_status: checked ? "Yes" : "No",
                  };
                  try {
                    const response = await axios.put("/api/pool-data", { data: payload });
                    if (response.data[0].status === 200) {
                      const updatedRows = tableRows.map((row, idx) =>
                        idx === rowIdx ? { ...row, [col.key]: checked ? "Yes" : "No" } : row
                      );
                      setTableRows(updatedRows);
                      localStorage.setItem("searchData", JSON.stringify(updatedRows)); // Save updated data to localStorage
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
        enableSorting: true,
        cell: (info) => info.getValue() || "",
      };
    }),
    ...(isPrivilegedUser ? [{
      accessorKey: "actions",
      header: "Actions",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const rowData = row.original;
        return (
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => handleEditRow(rowData)}
          >
            Edit
          </Button>
        );
      },
    }] : []),
  ], [allColumns, user, tableRows]);

  // Only these columns are visible by default
  const defaultVisible = [
    "sno",
    "sample_id",
    "registration_date",
    "test_name",
    "patient_name",
    "dna_isolation",
    "lib_prep",
    "under_seq",
    "seq_completed",
    ...(isPrivilegedUser ? ["actions"] : []), // Only show actions for privileged users
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

  useEffect(() => {
    // Load saved data from localStorage if available
    const savedData = localStorage.getItem("searchData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      // Map the data to ensure checkbox fields are "Yes"/"No"
      const mappedData = parsedData.map((row) => ({
        ...row,
        dna_isolation: row.dna_isolation === "Yes" ? "Yes" : "No",
        lib_prep: row.lib_prep === "Yes" ? "Yes" : "No",
        under_seq: row.under_seq === "Yes" ? "Yes" : "No",
        seq_completed: row.seq_completed === "Yes" ? "Yes" : "No",
      }));
      setTableRows(mappedData); // Update the tableRows state with the mapped data
    }
  }, []);

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
    };
    if (user && user.role !== "SuperAdmin") {
      data.hospital_name = user.hospital_name; // Add hospital_name from user data
    }

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
        // console.log('mappedData:', mappedData); // Debugging mapped data
        setTableRows(mappedData); // Update the tableRows state with the mapped data
        localStorage.setItem("searchData", JSON.stringify(mappedData)); // Save to localStorage
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

  const isAnyLibPrepChecked = tableRows.some(row => row.lib_prep === "Yes");

  const handleSendForLibraryPreparation = () => {
    const checkedRows = tableRows.filter(row => row.lib_prep === "Yes");
    if (checkedRows.length === 0) {
      toast.warning("No rows selected for Library Preparation.");
      return;
    }
    console.log('checkedRows:', checkedRows); // Debugging checked rows

    if (checkedRows.run_id !== null && checkedRows.run_id !== undefined) {
      toast.error("Run Id is already provided to the selected samples.");
      return
    }

    //I want to send only those rows whose total_vol_for_2nm is empty or null
    // const filteredRows = checkedRows.filter(row => !row.total_vol_for_2nm || row.total_vol_for_2nm === "");
    // if (filteredRows.length === 0) {
    //   toast.warning("No rows selected for Library Preparation with empty total_vol_for_2nm.");
    //   return;
    // }
    // console.log('filteredRows:', filteredRows); // Debugging filtered rows

    // Group new rows by test_name
    const newGroupedData = checkedRows.reduce((acc, row) => {
      const testName = row.test_name;
      if (!acc[testName]) {
        acc[testName] = [];
      }
      acc[testName].push(row);
      return acc;
    }, {});

    // Fetch existing data from localStorage and merge
    const existingData = JSON.parse(localStorage.getItem("libraryPreparationData") || "{}");
    const mergedData = { ...existingData };
    console.log('mergedData:', mergedData); // Debugging merged data


    Object.keys(newGroupedData).forEach(testName => {
      if (!mergedData[testName]) {
        mergedData[testName] = [];
      }

      // Prevent duplicate sample_ids if necessary
      const existingIds = new Set(mergedData[testName].map(r => r.sample_id));
      newGroupedData[testName].forEach(row => {
        if (!existingIds.has(row.sample_id)) {
          mergedData[testName].push(row);
        }
      });
    });

    // Save back to localStorage
    localStorage.setItem("libraryPreparationData", JSON.stringify(mergedData));

    // Navigate
    dispatch(setActiveTab("library-prepration"));
  };

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
  };

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
              className="mt-6 bg-gray-700 hover:bg-gray-800 text-white cursor-pointer w-[200px]">
              Retrieve
            </Button>
          </div>
        </div>
      </div>

      {tableRows && tableRows.length > 0 && (
        <>
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
            <div
              className="bg-white dark:bg-gray-900 rounded-lg shadow mb-6 overflow-x-auto w-full py-4 h-[400px] overflow-y-auto"
              style={{ maxWidth: 'calc(100vw - 50px)' }}
            >
              <Table className="min-w-full">
                <TableHeader className="bg-orange-100 dark:bg-gray-800">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
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
          <div className="flex justify-between items-center mb-4">
            <Button
              className="bg-gray-700 hover:bg-gray-800 mt-5 text-white cursor-pointer min-w-[120px] h-12"
              onClick={handleSaveToExcel}
            >
              Save to excel
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
        </>
      )}
      <ToastContainer />

    </div>
  );
};

export default Processing;