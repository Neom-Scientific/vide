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
import { Checkbox } from "@/components/ui/checkbox";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { setActiveTab } from "@/lib/redux/slices/tabslice";
import Cookies from "js-cookie";


const Processing = () => {
  const user = JSON.parse(Cookies.get("user") || "{}");
  const [processing, setProcessing] = useState(false);

  const allColumns = [
    { key: 'hospital_name', label: 'Organization Name' },
    { key: 'vial_received', label: 'Vial Received' },
    { key: 'specimen_quality', label: 'Specimen Quality' },
    { key: 'registration_date', label: 'Registration Date' },
    { key: 'internal_id', label: 'Internal ID' },
    { key: 'dept_name', label: 'Department Name' },
    { key: 'run_id', label: 'Run ID' },
    { key: 'sample_date', label: 'Sample Date' },
    { key: 'sample_type', label: 'Sample Type' },
    { key: 'trf', label: 'TRF' },
    { key: 'collection_date_time', label: 'Collection Date Time' },
    { key: 'storage_condition', label: 'Storage Condition' },
    { key: 'prority', label: 'Prority' },
    { key: 'hospital_id', label: 'Organization ID' },
    { key: 'client_id', label: 'Client ID' },
    { key: 'client_name', label: 'Client Name' },
    { key: 'sample_id', label: 'Sample ID' },
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'DOB', label: 'DOB' },
    { key: 'age', label: 'Age' },
    { key: 'sex', label: 'Gender' },
    { key: 'ethnicity', label: 'Ethnicity' },
    { key: 'father_mother_name', label: 'Father/Mother Name' },
    // { key: 'spouse_name', label: 'Spouse Name' },
    { key: 'address', label: 'Address' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'country', label: 'Country' },
    { key: 'patient_mobile', label: "Patient's Mobile" },
    { key: 'patient_email', label: "Patient Email" },
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
    { key: 'lib_prep_date', label: 'Library Prep Date' },
    { key: 'batch_id', label: 'Batch ID' },
    { key: 'vol_for_40nm_percent_pooling', label: '20nM vol. % pooling' },
    { key: 'volume_from_40nm_for_total_25ul_pool', label: 'Volume from 20nM for Total 25ul Pool' },
    { key: 'run_remarks', label: 'Run Remarks' },
  ];

  const allTests = [
    'WES',
    'CS',
    'CES',
    'Myeloid',
    'HLA',
    'SGS',
    // 'WES + Mito',
    'HCP',
    'HRR',
    // 'CES + Mito',
    'SolidTumor Panel',
    'Cardio Comprehensive (Screening Test)',
    'Cardio Metabolic Syndrome (Screening Test)',
    'Cardio Comprehensive Myopathy'
  ];

  let rows = [];

  const [filters, setFilters] = useState({
    sample_id: "",
    sample_status: "",
    sample_indicator: "",
    from_date: "",
    to_date: "",
    doctor_name: "",
    dept_name: "",
    run_id: "",
    selectedTestNames: [],
  });
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
      if (col.key === "registration_date" || col.key === "sample_date" || col.key === "repeat_date" || col.key === "seq_run_date" || col.key === "report_releasing_date" || col.key === "lib_prep_date" || col.key === "collection_date_time") {
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
            return <span>{new Date(value).toLocaleDateString()}</span> || "";
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
            const rowData = info.row.original;

            // Disable logic
            let disabled = false;
            if (col.key === "dna_isolation" && rowData.lib_prep === "Yes") disabled = true;
            if (col.key === "lib_prep" && (rowData.under_seq === "Yes" || rowData.seq_completed === "Yes")) disabled = true;
            if (col.key === "dna_isolation" && (rowData.under_seq === "Yes" || rowData.seq_completed === "Yes")) disabled = true;
            if (col.key === "under_seq" && rowData.seq_completed === "Yes") disabled = true;

            return (
              <Checkbox
                checked={isChecked}
                className="border border-orange-400"
                disabled={disabled}
                onCheckedChange={async (checked) => {
                  if (disabled) return;
                  const updatedRow = {
                    ...rowData,
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
                      localStorage.setItem("searchData", JSON.stringify(updatedRows));
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
    "internal_id",
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
    setProcessing(true);
    const getValue = (name) => document.getElementsByName(name)[0]?.value || "";

    const data = {
      sample_id: filters.sample_id,
      test_name: filters.selectedTestNames.join(","),
      sample_status: filters.sample_status,
      sample_indicator: filters.sample_indicator,
      from_date: filters.from_date,
      to_date: filters.to_date,
      doctor_name: filters.doctor_name,
      dept_name: filters.dept_name,
      run_id: filters.run_id,
      for: 'process'
    };
    if (user && user.role !== "SuperAdmin") {
      data.hospital_name = user.hospital_name; // Add hospital_name from user data
    }

    try {
      const response = await axios.get(`/api/search`, { params: data });
      console.log('response.data:', response.data[0].data); // Debugging response data

      if (response.data[0].status === 200) {
        // Map the data to ensure checkbox fields are "Yes"/"No"
        const mappedData = response.data[0].data.map((row) => ({
          ...row,
          dna_isolation: row.dna_isolation === "Yes" ? "Yes" : "No",
          lib_prep: row.lib_prep === "Yes" ? "Yes" : "No",
          under_seq: row.under_seq === "Yes" ? "Yes" : "No",
          seq_completed: row.seq_completed === "Yes" ? "Yes" : "No",
        }));
        setProcessing(false);
        console.log('mappedData:', mappedData); // Debugging mapped data
        setTableRows(mappedData); // Update the tableRows state with the mapped data
        localStorage.setItem("searchData", JSON.stringify(mappedData)); // Save to localStorage
      } else if (response.data[0].status === 400 || response.data[0].status === 404) {
        toast.error(response.data[0].message || "No data found for the given filters.");
        setProcessing(false);
        setTableRows([]);
      }
    } catch (error) {
      if (error.response) {
        setTableRows([]);
        setProcessing(false);
        toast.error(error.response.data.message || "An error occurred while fetching the data.");
      }
      console.error("Error fetching data:", error);
    }

  };

  const isAnyLibPrepChecked = tableRows.some(row => row.lib_prep === "Yes");

  const pooledColumns = [
    "pool_conc",
    "size",
    "nm_conc",
    "one_tenth_of_nm_conc",
    "total_vol_for_2nm",
    "lib_vol_for_2nm",
    "nfw_volu_for_2nm",
    "vol_for_40nm_percent_pooling",
    "volume_from_40nm_for_total_25ul_pool",
  ];

  const handleSendForLibraryPreparation = () => {
    const checkedRows = tableRows.filter(row => row.lib_prep === "Yes");
    if (checkedRows.length === 0) {
      toast.warning("No rows selected for Library Preparation.");
      return;
    }

    // Group new rows by main test name (strip " + Mito" if present)
    const newGroupedData = checkedRows.reduce((acc, row) => {
      // Extract main test name (before " + Mito")
      const mainTestName = row.test_name.includes(" + Mito")
        ? row.test_name.split(" + Mito")[0].trim()
        : row.test_name;
      if (!acc[mainTestName]) acc[mainTestName] = [];
      acc[mainTestName].push(row);
      return acc;
    }, {});

    // Fetch existing data from localStorage and merge
    const existingData = JSON.parse(localStorage.getItem("libraryPreparationData") || "{}");
    const mergedData = { ...existingData };

    Object.keys(newGroupedData).forEach(testName => {
      // If already in new format, merge into .rows, else upgrade old array to new format
      if (!mergedData[testName]) {
        mergedData[testName] = { rows: [], pools: [] };
      } else if (Array.isArray(mergedData[testName])) {
        mergedData[testName] = { rows: mergedData[testName], pools: [] };
      }
      // Prevent duplicate sample_ids
      const existingIds = new Set((mergedData[testName].rows || []).map(r => r.sample_id));
      newGroupedData[testName].forEach(row => {
        if (!existingIds.has(row.sample_id)) {
          mergedData[testName].rows.push(row);
        }
      });

      // --- NEW LOGIC: Group pooled data by pool_no ---
      const rows = mergedData[testName].rows || [];
      const poolsMap = {};

      rows.forEach((row, idx) => {
        const poolNo = row.pool_no;
        if (!poolNo) return; // Only group rows with a pool_no

        if (!poolsMap[poolNo]) {
          poolsMap[poolNo] = {
            sampleIndexes: [],
            values: {},
          };
        }
        poolsMap[poolNo].sampleIndexes.push(idx);

        // Collect pooled columns (last non-empty value wins)
        pooledColumns.forEach(col => {
          if (row[col] !== undefined && row[col] !== null && row[col] !== "") {
            poolsMap[poolNo].values[col] = row[col];
          }
        });

      });

      // Convert poolsMap to array
      const poolRows = Object.values(poolsMap);

      // Only add if there is pooled data
      if (poolRows.length > 0) {
        mergedData[testName].pools = poolRows;
      }
      // --- END NEW LOGIC ---
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

  useEffect(() => {
    const savedFilters = JSON.parse(localStorage.getItem("processingFilters") || "{}");
    setFilters({
      sample_id: savedFilters.sample_id || "",
      sample_status: savedFilters.sample_status || "",
      sample_indicator: savedFilters.sample_indicator || "",
      from_date: savedFilters.from_date || "",
      to_date: savedFilters.to_date || "",
      doctor_name: savedFilters.doctor_name || "",
      dept_name: savedFilters.dept_name || "",
      run_id: savedFilters.run_id || "",
      selectedTestNames: savedFilters.selectedTestNames || [],
    });
    setSelectedTestNames(savedFilters.selectedTestNames || []);
  }, []);

  const handleFilterChange = (name, value) => {
    const updated = { ...filters, [name]: value };
    setFilters(updated);
    localStorage.setItem("processingFilters", JSON.stringify(updated));
    if (name === "selectedTestNames") setSelectedTestNames(value);
  };

  useEffect(() => {
    const fetchInUseEffect = async () => {
      setProcessing(true);
      const filters = JSON.parse(localStorage.getItem("processingFilters") || "{}");
      console.log('filters:', filters); // Debugging filters
      const data = {
        sample_id: filters.sample_id,
        test_name: (filters.selectedTestNames || []).join(","),
        sample_status: filters.sample_status,
        sample_indicator: filters.sample_indicator,
        from_date: filters.from_date,
        to_date: filters.to_date,
        doctor_name: filters.doctor_name,
        dept_name: filters.dept_name,
        run_id: filters.run_id,
        for: 'process',
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
          setProcessing(false);
          console.log('mappedData:', mappedData); // Debugging mapped data
          setTableRows(mappedData); // Update the tableRows state with the mapped data
          localStorage.setItem("searchData", JSON.stringify(mappedData)); // Save to localStorage
        } else if (response.data[0].status === 400 || response.data[0].status === 404) {
          setProcessing(false);
          setTableRows([]);
        }
      } catch (error) {
        if (error.response) {
          setTableRows([]);
          setProcessing(false);
        }
        console.error("Error fetching data:", error);
      }
    }
    fetchInUseEffect();
  }, [])

  return (
    <div className="p-4">


      {/* Top Filters */}
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
                {allTests
                  .filter(test => !selectedTestNames.includes(test))
                  .map(test => (
                    <DropdownMenuItem
                      key={test}
                      onClick={() => {
                        if (selectedTestNames.includes(test)) {
                          return;
                        }
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
            <div className="flex border-2 border-orange-300 flex-wrap gap-2 rounded-md p-2 dark:bg-gray-800 min-h-[42px] w-full">
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
              value={filters.sample_status}
              onChange={(e) => handleFilterChange('sample_status', e.target.value)}
              className="w-full border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800"
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
              className="w-full border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800"
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
              placeholder="Doctor's Name"
              value={filters.doctor_name}
              onChange={(e) => handleFilterChange('doctor_name', e.target.value)}
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
            <Button
              type='submit'
              onClick={() => { handlesubmit() }}
              className="w-[240px] mt-[20px] bg-gray-700 hover:bg-gray-800 text-white cursor-pointer"
            >
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
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow mb-6 overflow-x-auto w-full whitespace-nowrap"
              style={{ maxWidth: 'calc(100vw - 60px)' }}
            >
              <div className="h-[400px] overflow-y-auto w-full">
                <table className="min-w-full border-collapse table-auto">
                  <thead className="bg-orange-100 dark:bg-gray-800 sticky top-0 z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            onClick={header.column.getToggleSortingHandler()}
                            className="cursor-pointer px-4 py-2 text-left border-b border-gray-200 bg-orange-100 dark:bg-gray-800 sticky top-0 z-20"
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
                      table.getRowModel().rows.map(row => (
                        <tr key={row.id ?? row.index}>
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="px-4 py-2 border-b border-gray-100">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
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