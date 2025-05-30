import React, { use, useEffect, useState, useMemo } from "react";
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

const LibraryPrepration = () => {
  const [message, setMessage] = useState(0);
  const [tableRows, setTableRows] = useState([]);
  const [testName, setTestName] = useState("");
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [showLibPrepColumns, setShowLibPrepColumns] = useState(false);
  const [selectedSampleIndicator, setSelectedSampleIndicator] = useState('');
  const [getTheTestNames, setGetTheTestNames] = useState([]);


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
    { key: 'conc_rxn', label: 'conc/rxn' },
    { key: 'barcode', label: 'Barcode' },
    { key: 'i5_index_reverse', label: 'i5 (reverse)' },
    { key: 'i5_index_forward', label: 'i5 (forward)' },
    { key: 'i7_index', label: 'i7 index' },
    { key: 'size', label: 'Size (bp)' },
    { key: 'lib_qubit', label: 'Lib Qubit ng/ml' },
    { key: 'nM_conc', label: 'nM conc' },
    { key: 'lib_vol_for_2nM', label: 'Library Volume for 2nM' },
    { key: 'nfw_volu_for_2nM', label: 'NFW Volume For 2nM' },
    { key: 'total_vol_for_2nM', label: 'Total Volume For 2nM' },
    { key: 'Qubit_dna', label: 'Qubit DNA' },
    { key: 'per_rxn_gdna', label: 'Per Rxn gDNA' },
    { key: 'volume', label: 'Volume' },
    { key: 'gdna_volume_3x', label: 'gDNA Volume (3X)' },
    { key: 'nfw', label: 'NFW (3x)' },
    { key: 'plate_designation', label: 'Plate Designation' },
    { key: 'well', label: 'Well No.' },
    { key: 'qubit_lib_qc_ng_ul', label: 'Qubit Library QC (ng/ul)' },
    { key: 'stock_ng_ul', label: 'Stock (ng/ul)' },
    { key: 'lib_vol_for_hyb', label: 'Library Volume for Hyb' },
    { key: 'gb_per_sample', label: 'GB per Sample' },
    { key: 'sample_volume', label: 'Sample Volume' },
    { key: 'pooling_volume', label: 'Pooling Volume' },
    { key: 'pool_conc', label: 'Pooling Conc (ng/ul)' },
    { key: 'one_tenth_of_nm_conc', label: '1/10th of nM Conc' },
  ];

  const getDefaultVisible = (testName) => {
    if (testName === "Myeloid") {
      return [
        "sno",
        "sample_id",
        "registration_date",
        "test_name",
        "client_name",
        "sample_type",
        "Qubit_dna",
        "conc_rxn",
        "barcode",
        "i5_index_forward",
        "i5_index_reverse",
        "i7_index",
        "size",
        "lib_qubit",
        "nM_conc",
        "lib_vol_for_2nM",
        "nfw_volu_for_2nM",
        "total_vol_for_2nM",
      ];
    } else if (
      testName === "WES" ||
      testName === "CS" ||
      testName === "Clinical Exome" ||
      testName === "Cardio Comprehensive (Screening Test)" ||
      testName === "Cardio Metabolic Syndrome (Screening Test)" ||
      testName === "Cardio Comprehensive Myopathy"
    ) {
      return [
        "sno",
        "sample_id",
        "registration_date",
        "test_name",
        "client_name",
        "Qubit_dna",
        "per_rxn_gdna",
        "volume",
        "gdna_volume_3x",
        "nfw",
        "plate_designation",
        "well",
        "i5_index_reverse",
        "i7_index",
        "qubit_lib_qc_ng_ul",
        "stock_ng_ul",
        "lib_vol_for_hyb",
        "gb_per_sample",
      ];
    } else if (testName === "SGS" || testName === "HLA") {
      return [
        "sno",
        "sample_id",
        "registration_date",
        "test_name",
        "client_name",
        "Qubit_dna",
        "sample_volume",
        "well",
        "i7_index",
        "qubit_lib_qc_ng_ul",
        "pooling_volume",
        "pool_conc",
        "size",
        "nM_conc",
        "one_tenth_of_nm_conc",
        "total_vol_for_2nM",
        "lib_vol_for_2nM",
        "nfw_volu_for_2nM",
      ];
    }
    return [];
  };
  const [columnVisibility, setColumnVisibility] = useState(() => {
    const defaultVisible = getDefaultVisible(testName);
    return allColumns.reduce((acc, col) => {
      acc[col.key] = defaultVisible.includes(col.key); // Default visibility for columns in defaultVisible
      return acc;
    }, {});
  });

  // Define defaultVisible based on testName


  // Initialize columnVisibility state


  useEffect(() => {
    const rows = localStorage.getItem('libraryPreparationData')
      ? JSON.parse(localStorage.getItem('libraryPreparationData'))
      : [];

    if (!rows || rows.length === 0) {
      setMessage(1);
      return;
    } else {
      setMessage("");
    }

    setTestName(rows[0].test_name);

    const updateRows = rows.map(row => ({
      ...row
    }));
    setTableRows(updateRows);

    const defaultVisible = getDefaultVisible(rows[0].test_name);
    const visibleColumns = defaultVisible.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});

    allColumns.forEach((col) => {
      if (!visibleColumns.hasOwnProperty(col.key)) {
        visibleColumns[col.key] = columnVisibility[col.key] || false; // Preserve user selection
      }
    });

    setColumnVisibility(prev => {
      const isEqual = Object.keys(visibleColumns).every(
        key => prev[key] === visibleColumns[key]
      );
      return isEqual ? prev : visibleColumns;
    });
  }, [testName]);



  const columns = useMemo(() => {
    // Dynamically derive defaultVisible based on testName
    const defaultVisible = getDefaultVisible(testName);

    const reorderedColumns = defaultVisible.map((key) => {
      const column = allColumns.find((col) => col.key === key);
      if (column) {
        return {
          accessorKey: column.key,
          header: column.label,
          cell: (info) => {
            if (column.key === "registration_date") {
              // Format the registration_date
              const value = info.getValue();
              if (!value) return ""; // Handle empty value
              const date = new Date(value);
              if (isNaN(date)) return value;
              // Format: YYYY-MM-DD HH:mm
              const yyyy = date.getFullYear();
              const mm = String(date.getMonth() + 1).padStart(2, '0');
              const dd = String(date.getDate()).padStart(2, '0');
              const hh = String(date.getHours()).padStart(2, '0');
              const min = String(date.getMinutes()).padStart(2, '0');
              return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
            }

            if (
              column.key === "sno" ||
              column.key === "sample_id" ||
              column.key === "test_name" ||
              column.key === "client_name" ||
              column.key === "sample_type"
            ) {
              return <span>{info.getValue()}</span> || "";
            }

            return (
              <InputCell
                value={info.getValue()}
                rowIndex={info.row.index}
                columnId={column.key}
                updateData={table.options.meta.updateData}
              />
            );
          },
        };
      }
      return null;
    }).filter(Boolean); // Remove null values for unmatched keys

    // Add any remaining columns that are not in defaultVisible
    const remainingColumns = allColumns
      .filter((col) => !defaultVisible.includes(col.key))
      .map((col) => ({
        accessorKey: col.key,
        header: col.label,
        cell: (info) => info.getValue() || "",
      }));

    return [
      {
        accessorKey: "sno",
        header: "S. No.",
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
        enableHiding: false,
      },
      ...reorderedColumns,
      ...remainingColumns,
    ];
  }, [testName, allColumns]);

  useEffect(() => {
    let defaultVisible = [];
    if (testName === "Myeloid") {
      defaultVisible = [
        "sno",
        "sample_id",
        "registration_date",
        "test_name",
        "client_name",
        "sample_type",
        "Qubit_dna",
        "conc_rxn",
        "barcode",
        "i5_index_forward",
        "i5_index_reverse",
        "i7_index",
        "size",
        "lib_qubit",
        "nM_conc",
        "lib_vol_for_2nM",
        "nfw_volu_for_2nM",
        "total_vol_for_2nM",
      ];
    } else if (
      testName === "WES" ||
      testName === "CS" ||
      testName === "Clinical Exome" ||
      testName === "Cardio Comprehensive (Screening Test)" ||
      testName === "Cardio Metabolic Syndrome (Screening Test)" ||
      testName === "Cardio Comprehensive Myopathy"
    ) {
      defaultVisible = [
        "sno",
        "sample_id",
        "registration_date",
        "test_name",
        "client_name",
        "Qubit_dna",
        "per_rxn_gdna",
        "volume",
        "gdna_volume_3x",
        "nfw",
        "plate_designation",
        "well",
        "i5_index_reverse",
        "i7_index",
        "qubit_lib_qc_ng_ul",
        "stock_ng_ul",
        "lib_vol_for_hyb",
        "gb_per_sample"
      ];
    }
    else if (testName === "SGS" || testName === 'HLA') {
      defaultVisible = [
        "sno",
        "sample_id",
        "registration_date",
        "test_name",
        "client_name",
        "Qubit_dna",
        "well",
        "i7_index",
        "sample_volume",
        "qubit_lib_qc_ng_ul",
        "pooling_volume",
        "pool_conc",
        "size",
        "nM_conc",
        "one_tenth_of_nm_conc",
        "total_vol_for_2nM",
        "lib_vol_for_2nM",
        "nfw_volu_for_2nM",
      ];
    }

    const visibleColumns = defaultVisible.reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});

    // Ensure all columns are included in the visibility state
    columns.forEach((col) => {
      if (!visibleColumns.hasOwnProperty(col.accessorKey)) {
        visibleColumns[col.accessorKey] = false;
      }
    });

    // Only update state if it has changed
    setColumnVisibility(prev => {
      const isEqual = Object.keys(visibleColumns).every(
        key => prev[key] === visibleColumns[key]
      );
      return isEqual ? prev : visibleColumns;
    });
  }, [testName, columns]);

  const table = useReactTable({
    data: tableRows,
    columns,
    state: {
      sorting,
      columnVisibility, // Pass the updated columnVisibility state
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility, // Sync visibility changes
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setTableRows((prev) =>
          prev.map((row, idx) => {
            if (idx !== rowIndex) return row; // Only update the specific row

            // Update the current field
            const updatedRow = { ...row, [columnId]: value };

            // Apply formulas dynamically
            const lib_qubit = parseFloat(updatedRow.lib_qubit) || 0;
            const total_vol_for_2nM = parseFloat(updatedRow.total_vol_for_2nM) || 0;
            const lib_vol_for_2nM = parseFloat(updatedRow.lib_vol_for_2nM) || 0;
            const per_rxn_gdna = parseFloat(updatedRow.per_rxn_gdna) || 0;
            const Qubit_dna_hs = parseFloat(updatedRow.Qubit_dna_hs) || 0;
            const volume = parseFloat(updatedRow.volume) || 0;
            const qubit_lib_qc_ng_ul = parseFloat(updatedRow.qubit_lib_qc_ng_ul) || 0;
            const one_tenth_of_nm_conc = parseFloat(updatedRow.one_tenth_of_nm_conc) || 0;
            const size = parseFloat(updatedRow.size) || 0;
            const nM_conc = parseFloat(updatedRow.nM_conc) || 0;

            if (columnId === "lib_qubit" || columnId === "total_vol_for_2nM") {
              // Calculate nM_conc
              // get the value of nM-conc till 8 decimal places
              updatedRow.nM_conc = lib_qubit > 0 ? (lib_qubit / (size * 660)) * 1000 : "";

              // Calculate lib_vol_for_2nM
              // round to 2 decimal places
              updatedRow.nM_conc = parseFloat(updatedRow.nM_conc).toFixed(2);
              const nM_conc = parseFloat(updatedRow.nM_conc) || 0;
              updatedRow.lib_vol_for_2nM =
                nM_conc > 0 ? (Math.round(((2.5 * total_vol_for_2nM) / nM_conc) * 100) / 100) : "";

              // Calculate nfw_volu_for_2nM
              const lib_vol_for_2nM = parseFloat(updatedRow.lib_vol_for_2nM) || 0;
              updatedRow.nfw_volu_for_2nM =
                total_vol_for_2nM > 0 ? total_vol_for_2nM - lib_vol_for_2nM : "";
            }




            if (columnId === 'lib_qc_for_ng_ul' || columnId === 'size') {
              // calculate 2nM
              updatedRow.nM_conc = size > 0 ? ((qubit_lib_qc_ng_ul / (size * 660)) * Math.pow(10, 6)).toFixed(2) : "";
            }

            if (columnId === "size") {
              console.log('nM_conc:', updatedRow.nM_conc);
              updatedRow.one_tenth_of_nm_conc = nM_conc > 0 ? (parseFloat((nM_conc / 10).toFixed(2))) : "";
              console.log('one_tenth_of_nm_conc:', updatedRow.one_tenth_of_nm_conc);
            }

            // Apply formulas dynamically
            if (columnId === "per_rxn_gdna" || columnId === "Qubit_dna_hs") {
              // Calculate gdna_volume_3x
              updatedRow.gdna_volume_3x = Qubit_dna_hs > 0 ? Math.ceil((per_rxn_gdna / Qubit_dna_hs) * 3) : "";
            }

            if (columnId === "volume" || columnId === "gdna_volume_3x") {
              // Calculate nfw
              const gdna_volume_3x = parseFloat(updatedRow.gdna_volume_3x) || 0;
              updatedRow.nfw = volume > 0 ? volume - gdna_volume_3x : "";
            }

            if (columnId === "qubit_lib_qc_ng_ul") {
              // Calculate stock_ng_ul
              updatedRow.stock_ng_ul = qubit_lib_qc_ng_ul > 0 ? qubit_lib_qc_ng_ul * 10 : "";
            }

            // why does not this work?
            if (columnId === "stock_ng_ul") {
              const stock = parseFloat(value) || 0;
              updatedRow.stock_ng_ul = stock;
              console.log('Parsed stock_ng_ul:', stock);
              updatedRow.lib_vol_for_hyb = stock > 0 ? (200 / stock).toFixed(2) : "";
              console.log('lib_vol_for_hyb:', updatedRow.lib_vol_for_hyb);
            }

            if (columnId === "qubit_lib_qc_ng_ul") {
              // calculate pooling_volume
              updatedRow.pooling_volume = qubit_lib_qc_ng_ul > 0 ? (200 / qubit_lib_qc_ng_ul).toFixed(2) : "";
            }

            if (columnId === 'lib_qc_for_ng_ul' || columnId === 'size') {
              updatedRow.nM_conc = size > 0 ? ((qubit_lib_qc_ng_ul / (size * 660)) * Math.pow(10, 6)).toFixed(2) : "";
            }

            // Ensure one_tenth_of_nm_conc is calculated whenever nM_conc is updated
            if (columnId === 'lib_qc_for_ng_ul' || columnId === 'size') {
              updatedRow.one_tenth_of_nm_conc = updatedRow.nM_conc > 0 ? (parseFloat((updatedRow.nM_conc / 10).toFixed(2))) : "";
              console.log('nM_conc:', updatedRow.nM_conc);
              console.log('one_tenth_of_nm_conc:', updatedRow.one_tenth_of_nm_conc);
            }

            if (columnId === "one_tenth_of_nm_conc" || columnId === "lib_vol_for_2nM") {
              // calculate total_vol_for_2nM
              updatedRow.total_vol_for_2nM = one_tenth_of_nm_conc > 0 ? (one_tenth_of_nm_conc * lib_vol_for_2nM/2).toFixed(2) : "";
              updatedRow.nfw_volu_for_2nM = total_vol_for_2nM > 0 ? (updatedRow.total_vol_for_2nM - updatedRow.lib_vol_for_2nM).toFixed(2) : "";

            }
            
            if (columnId === "total_vol_for_2nM") {
            // calculate nfw_volu_for_2nM
            updatedRow.nfw_volu_for_2nM = total_vol_for_2nM > 0 ? (total_vol_for_2nM - lib_vol_for_2nM).toFixed(2) : "";
            }
            
            return updatedRow;
          })
        );
      },
    },
  });

  const handleSubmit = async () => {
    try {
      // Log all the input values
      console.log("Table Rows:", tableRows);

      // Prepare the payload for the API call
      const payload = {
        testName: testName, // Include the test name
        rows: tableRows, // Send all rows with updated values
      };

      // Make the API call
      const response = await axios.post('/api/update-sample-indicator', payload);
      console.log("API Response:", response.data);
      if (response.data[0].status === 200) {
        toast.success("Sample indicator updated successfully!");
        // remove the localStorage item after successful update
        localStorage.removeItem('libraryPreparationData');
        window.location.reload(); // Reload the page to reflect changes
      }
      if(response.data[0].status === 400) {
        toast.error(response.data[0].message);
      }
    } catch (error) {
      console.error("Error updating values:", error);
      toast.error("An error occurred while updating the values.");
    }
  }



  const InputCell = ({ value: initialValue, rowIndex, columnId, updateData }) => {
    const [value, setValue] = useState(initialValue || ""); // Ensure the initial value is not undefined

    const handleChange = (e) => {
      setValue(e.target.value); // Update local state
    };

    const handleBlur = () => {
      updateData(rowIndex, columnId, value); // Update table rows on blur
    };

    return (
      <Input
        className="border rounded p-1 text-xs w-[100px`]"
        value={value} // Ensure value is always defined
        type="text"
        placeholder={`Enter ${columnId}`}
        onChange={handleChange}
        onBlur={handleBlur} // Update table rows when the input loses focus
      />
    );
  };
  return (
    <div className="p-4 ">
      {!message ?
        (<>
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
                      onCheckedChange={(value) => {
                        setColumnVisibility((prev) => ({
                          ...prev,
                          [column.id]: value, // Toggle visibility for the selected column
                        }));

                        table.setColumnVisibility((prev) => ({
                          ...prev,
                          [column.id]: value, // Sync with the table's internal state
                        }));
                      }}
                    >
                      {column.columnDef.header}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <span className="text-sm text-gray-500">
              Showing {Object.values(columnVisibility).filter(Boolean).length} of {columns.length} columns
            </span>
          </div>


          <div className="">


            {/* Table */}
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
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-gray-700 hover:bg-gray-800 mt-5 text-white cursor-pointer min-w-[120px] h-12">
            Save
          </Button>
        </>
        )
        :
        (
          <div className="text-center text-red-500  mb-4">
            No data available for Library Preparation. Please add some from
            <span
              className="cursor-pointer underline font-bold"
              onClick={() => dispatch(setActiveTab("processing"))}> Processing Tab</span>
          </div>
        )
      }


      {/* Column Selector Dropdown */}
      <ToastContainer />
    </div>
  )
}

export default LibraryPrepration