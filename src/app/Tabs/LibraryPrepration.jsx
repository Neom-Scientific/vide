import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { useDispatch } from "react-redux";
import { setActiveTab } from "@/lib/redux/slices/tabslice";
import Cookies from "js-cookie";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { CldOgImage } from "next-cloudinary";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { isEqual } from "lodash";


const LibraryPrepration = () => {
  const [message, setMessage] = useState(0);
  const [tableRows, setTableRows] = useState([]);
  const [testName, setTestName] = useState("");
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedSampleIndicator, setSelectedSampleIndicator] = useState('');
  const [showPooledFields, setShowPooledFields] = useState(false);
  const [pooledValues, setPooledValues] = useState({});
  const [selectedCells, setSelectedCells] = useState([]);
  const [getTheTestNames, setGetTheTestNames] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [bulkValue, setBulkValue] = useState("");
  const [processing, setProcessing] = useState(false);
  const [pooledRowData, setPooledRowData] = useState([]);
  const [currentSelection, setCurrentSelection] = useState([]);
  const [createdBatchIds, setCreatedBatchIds] = useState([]);
  const [DialogOpen, setDialogOpen] = useState(false);
  const user = JSON.parse(Cookies.get('user') || '{}');
  const testNameRef = useRef(testName);
  const dispatch = useDispatch();

  useEffect(() => {
    testNameRef.current = testName;
  }, [testName]);


  const allColumns = [
    { key: 'sno', label: 'S.No.' },
    { key: 'batch_id', label: 'Batch ID' },
    { key: 'pool_no', label: 'Pool No.' },
    { key: 'sample_id', label: 'Sample ID' },
    { key: 'registration_date', label: 'Registration Date' },
    { key: 'internal_id', label: 'Internal ID' },
    { key: 'test_name', label: 'Test Name' },
    { key: 'sample_type', label: 'Sample Type' },
    { key: 'client_id', label: 'Client ID' },
    { key: 'client_name', label: 'Client Name' },
    { key: 'patient_name', label: 'Patient Name' },
    { key: 'age', label: 'Age' },
    { key: 'sex', label: 'Gender' },
    { key: 'father_husband_name', label: 'Father/Mother Name' },
    { key: 'docter_name', label: 'Doctor Name' },
    { key: 'email', label: 'Doctor Email' },
    { key: 'qubit_dna', label: 'Qubit DNA (ng/ul)' },
    { key: 'conc_rxn', label: 'conc/rxn (ng/rxn)' },
    { key: 'barcode', label: 'Barcode' },
    { key: 'per_rxn_gdna', label: 'Per Rxn gDNA (ng/rxn)' },
    { key: 'volume', label: 'Volume (ul)' },
    { key: 'gdna_volume_3x', label: 'gDNA Volume (ul) (3X)' },
    { key: 'nfw', label: 'NFW (ul) (3x)' },
    { key: 'plate_designation', label: 'Plate Designation' },
    { key: 'well', label: 'Well No./Barcode' },
    { key: 'i5_index_reverse', label: 'i5 (reverse)' },
    { key: 'i5_index_forward', label: 'i5 (forward)' },
    { key: 'i7_index', label: 'i7 index' },
    { key: 'lib_qubit', label: 'Lib Qubit ng/ml' },
    { key: 'qubit_lib_qc_ng_ul', label: 'Library Qubit (ng/ul)' },
    { key: 'lib_vol_for_hyb', label: 'Library Volume for Hyb (ul)' },
    { key: 'pool_conc', label: 'Pooled Library Conc. (ng/ul)' },
    { key: 'size', label: 'Size (bp)' },
    { key: 'nm_conc', label: 'nM conc' },
    { key: 'one_tenth_of_nm_conc', label: '1/10th of nM Conc' },
    { key: 'lib_vol_for_2nm', label: 'Volume from Stock library for 20nM' },
    { key: 'nfw_volu_for_2nm', label: 'NFW Volume For 20nM' },
    { key: 'total_vol_for_2nm', label: 'Total Volume For 20nM' },
    { key: 'stock_ng_ul', label: 'Stock (ng/ul)' },
    { key: 'sample_volume', label: 'Sample Volume (ul)' },
    { key: 'pooling_volume', label: 'Pooling Volume (ul)' },
    { key: 'data_required', label: 'Data Required(GB)' },
    { key: 'vol_for_40nm_percent_pooling', label: '20nM vol. % pooling' },
    { key: 'volume_from_40nm_for_total_25ul_pool', label: 'Volume from 20nM for Total 25ul Pool' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'clinical_history', label: 'Clinical History' },
  ];


  const pooledColumns = [
    "pool_conc",
    "size",
    "nm_conc",
    "one_tenth_of_nm_conc",
    "lib_vol_for_2nm",
    "nfw_volu_for_2nm",
    "total_vol_for_2nm",
  ];

  const finalPoolingColumns = ["vol_for_40nm_percent_pooling", "volume_from_40nm_for_total_25ul_pool"];

  const insertPooledColumns = (columns) => {
    const result = [];
    for (let col of columns) {
      if (col === "data_required") {
        result.push(...pooledColumns); // insert pooled columns before data_required
      }
      result.push(col);
    }
    return result;
  };
  const insertFinalPoolingColumns = (columns) => {
    const result = [];
    for (let col of columns) {
      result.push(col);
      if (col === "data_required") {
        result.push(...finalPoolingColumns); // insert final pooling columns after data_required
      }
    }
    return result
  }

  const getDefaultVisible = (testName) => {
    let baseCols = [];
    if (testName === "Myeloid") {
      baseCols = [
        "sno",
        "sample_id",
        "registration_date",
        "internal_id",
        "test_name",
        "patient_name",
        "sample_type",
        "qubit_dna",
        "conc_rxn",
        "barcode",
        "i5_index_forward",
        "i5_index_reverse",
        "i7_index",
        "size",
        "lib_qubit",
        "nm_conc",
        "total_vol_for_2nm",
        "lib_vol_for_2nm",
        "nfw_volu_for_2nm",
        "data_required",
      ];
    } else if (
      testName === "WES" ||
      testName === "CS" ||
      testName === "CES" ||
      testName === "Cardio Comprehensive (Screening Test)" ||
      testName === "Cardio Metabolic Syndrome (Screening Test)" ||
      testName === "Cardio Comprehensive Myopathy" ||
      testName === "WES + Mito" ||
      testName === "CES + Mito" ||
      testName === "HRR" ||
      testName === "HCP"
    ) {
      baseCols = [
        "select",
        "sno",
        "batch_id",
        "pool_no",
        "sample_id",
        "registration_date",
        "internal_id",
        "test_name",
        "patient_name",
        "qubit_dna",
        "per_rxn_gdna",
        "volume",
        "gdna_volume_3x",
        "nfw",
        "plate_designation",
        "well",
        "i5_index_reverse",
        "i7_index",
        "qubit_lib_qc_ng_ul",
        "lib_vol_for_hyb",
        "data_required",
      ];
    } else if (testName === "SGS" || testName === "HLA") {
      baseCols = [
        "select",
        "sno",
        "batch_id",
        "pool_no",
        "sample_id",
        "registration_date",
        "internal_id",
        "test_name",
        "patient_name",
        "qubit_dna",
        "sample_volume",
        "well",
        "i7_index",
        "qubit_lib_qc_ng_ul",
        "pooling_volume",
        "data_required",
      ];
    }
    return insertFinalPoolingColumns(insertPooledColumns(baseCols));
  };


  const [columnVisibility, setColumnVisibility] = useState(() => {
    const defaultVisible = getDefaultVisible(testName);
    const visibility = allColumns.reduce((acc, col) => {
      acc[col.key] = defaultVisible.includes(col.key);
      return acc;
    }, {});
    // Ensure select column visibility is set if needed
    if (defaultVisible.includes("select")) {
      visibility["select"] = true;
    }
    return visibility;
  });

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
    if (Object.keys(storedData).length === 0) {
      setMessage(1); // Set message to indicate no data available
    } else {
      setMessage(0); // Reset message if data is available
    }
  }, []);

  useEffect(() => {
    const fetchPoolInfo = async () => {
      try {
        const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
        // Fix: handle both array and object format for allSampleIds
        const allSampleIds = Object.values(storedData)
          .flatMap(val => {
            if (Array.isArray(val)) {
              return val.map(row => row.sample_id);
            } else if (val && Array.isArray(val.rows)) {
              return val.rows.map(row => row.sample_id);
            }
            return [];
          })
          .filter(Boolean);
        const testName = Object.keys(storedData)[0];

        // If local data exists for this testName, use it and do not overwrite
        if (testName && storedData[testName]) {
          if (Array.isArray(storedData[testName])) {
            setTableRows(storedData[testName]);
            setPooledRowData([]);
          } else {
            setTableRows(storedData[testName].rows || []);
            setPooledRowData(storedData[testName].pools || []);
          }
          setGetTheTestNames(Object.keys(storedData));
          setTestName(testName);
          return; // Do not fetch or overwrite with API data
        }

        // Otherwise, fetch from API
        const response = await axios.get(`/api/pool-data`, {
          params: {
            hospital_name: user.hospital_name,
            application: testName,
            sample_id: allSampleIds.join(','), // Join sample IDs into a comma-separated string
          },
        });
        if (response.data[0].status === 200) {
          const poolData = response.data[0].data;
          if (poolData && poolData.length > 0) {
            // Transform data into testName: [...] format
            const newData = poolData.reduce((acc, row) => {
              const tn = row.test_name;
              if (!acc[tn]) acc[tn] = [];
              acc[tn].push(row);
              return acc;
            }, {});

            // Only update localStorage if there was no local data for this testName
            if (!storedData[testName] || (Array.isArray(storedData[testName]) && storedData[testName].length === 0)) {
              const mergedData = { ...storedData, ...newData };
              setTableRows(newData[testName] || []);
              setPooledRowData([]);
              setGetTheTestNames(Object.keys(mergedData));
              setTestName(Object.keys(newData)[0]);
              localStorage.setItem('libraryPreparationData', JSON.stringify(mergedData));
            } else {
              if (Array.isArray(storedData[testName])) {
                setTableRows(storedData[testName]);
                setPooledRowData([]);
              } else {
                setTableRows(storedData[testName].rows || []);
                setPooledRowData(storedData[testName].pools || []);
              }
              setGetTheTestNames(Object.keys(storedData));
              setTestName(testName);
            }
          } else {
            setMessage(1);
          }
        }
      } catch (error) {
        console.error("Error fetching pool info:", error);
        toast.error("An error occurred while fetching pool info.");
      }
    };

    fetchPoolInfo();
  }, []);

  const columns = useMemo(() => {
    const cols = [];
    // Add checkbox column
    cols.push({
      accessorKey: "select",
      header: "",
      cell: ({ row }) => (
        <Checkbox
          checked={rowSelection[row.id] || false}
          onCheckedChange={(checked) => {
            const newSelection = { ...rowSelection, [row.id]: checked };
            if (!checked) delete newSelection[row.id];
            setRowSelection(newSelection);
          }}
        />
      ),
      enableSorting: false,
      enableHiding: true, // allow hiding via column selector
    });

    // Add S. No. column
    cols.push({
      accessorKey: "sno",
      header: "S. No.",
      cell: ({ row }) => row.index + 1,
      enableSorting: false,
      enableHiding: true, // allow hiding via column selector
    });

    // Add all other columns
    cols.push(
      ...allColumns
        .filter(col => col.key !== "select" && col.key !== "sno")
        .map((column) => ({
          accessorKey: column.key,
          header: column.label,
          cell: (info) => {
            const value = typeof info.getValue === "function"
              ? info.getValue()
              : (info.row && info.row.original ? info.row.original[column.key] : "");
            if (column.key === 'registration_date') {
              return <span>{new Date(value).toLocaleDateString()}</span> || "";
            }
            if (
              column.key === "sample_id" ||
              column.key === "test_name" ||
              column.key === "patient_name" ||
              column.key === "sample_type" ||
              column.key === "pool_no" ||
              column.key === "internal_id" ||
              column.key === "batch_id" ||
              column.key === "registration_date" ||
              column.key === "client_id" ||
              column.key === "client_name" ||
              column.key === "docter_name" ||
              column.key === "email" ||
              column.key === "remarks" ||
              column.key === "clinical_history" ||
              column.key === "father_husband_name" ||
              column.key === "age" ||
              column.key === "sex"
            ) {
              return <span>{value}</span> || "";
            }
            if (!info.row) return null;
            return (
              <InputCell
                value={value || ""}
                rowIndex={info.row.index}
                columnId={column.key}
                updateData={table.options.meta.updateData}
              />
            );
          },
          enableSorting: false,
          enableHiding: true,
        }))
    );

    return cols;
  }, [allColumns, rowSelection]);

  useEffect(() => {
    const defaultVisible = getDefaultVisible(testName);

    // Start with allColumns
    const visibility = allColumns.reduce((acc, col) => {
      acc[col.key] = defaultVisible.includes(col.key);
      return acc;
    }, {});

    // Ensure "select" and "sno" are included if present in defaultVisible
    ["select", "sno"].forEach(key => {
      if (defaultVisible.includes(key)) {
        visibility[key] = true;
      } else {
        visibility[key] = false;
      }
    });

    setColumnVisibility(visibility);
  }, [testName]);

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
    // getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      updateData: (rowIndex, columnId, value) => {
        setTableRows((prev) => {
          const updatedRows = prev.map((row, idx) => {
            if (idx !== rowIndex) return row; // Only update the specific row

            // Update the current field
            const updatedRow = { ...row, [columnId]: value };

            // Apply formulas dynamically
            const total_vol_for_2nm = parseFloat(updatedRow.total_vol_for_2nm) || 0;
            const lib_vol_for_2nm = parseFloat(updatedRow.lib_vol_for_2nm) || 0;
            const per_rxn_gdna = parseFloat(updatedRow.per_rxn_gdna) || 0;
            const volume = parseFloat(updatedRow.volume) || 0;
            const qubit_lib_qc_ng_ul = parseFloat(updatedRow.qubit_lib_qc_ng_ul) || 0;
            const one_tenth_of_nm_conc = parseFloat(updatedRow.one_tenth_of_nm_conc) || 0;
            const size = parseFloat(updatedRow.size) || 0;
            const nm_conc = parseFloat(updatedRow.nm_conc) || 0;
            const qubit_dna = parseFloat(updatedRow.qubit_dna) || 0;

            if (columnId === "lib_qubit") {
              const lib_qubit = parseFloat(updatedRow.lib_qubit) || 0;
              const size = parseFloat(updatedRow.size) || 0;
              const nm_conc = lib_qubit > 0 ? (lib_qubit / (size * 660)) * 1000 : 0;

              updatedRow.nm_conc = parseFloat(nm_conc.toFixed(2));

              const total_vol_for_2nm = parseFloat(updatedRow.total_vol_for_2nm) || 0;

              if (nm_conc > 0 && total_vol_for_2nm > 0) {
                updatedRow.lib_vol_for_2nm = parseFloat(((3 * total_vol_for_2nm) / nm_conc).toFixed(2));
                if (updatedRow.lib_vol_for_2nm > total_vol_for_2nm) {
                  updatedRow.lib_vol_for_2nm = total_vol_for_2nm;
                }
                updatedRow.nfw_volu_for_2nm = parseFloat((total_vol_for_2nm - updatedRow.lib_vol_for_2nm).toFixed(2));
              } else {
                updatedRow.lib_vol_for_2nm = 0;
                updatedRow.nfw_volu_for_2nm = total_vol_for_2nm;
              }
              return updatedRow;
            }

            if (columnId === "total_vol_for_2nm" || columnId === "vol_for_40nm_percent_pooling") {
              const totalVol = columnId === "total_vol_for_2nm"
                ? parseFloat(value) || 0
                : parseFloat(updatedRow.total_vol_for_2nm) || 0;
              const percent = columnId === "vol_for_40nm_percent_pooling"
                ? parseFloat(value) || 0
                : parseFloat(updatedRow.vol_for_40nm_percent_pooling) || 0;

              console.log('totalvol:', totalVol)
              console.log('percent:', percent)
              updatedRow.volume_from_40nm_for_total_25ul_pool = ((totalVol * percent) / 100).toFixed(2);
              console.log('volume_from_40nm_for_total_25ul_pool:', updatedRow.volume_from_40nm_for_total_25ul_pool)

              // If you have other logic for total_vol_for_2nm, keep it here:
              if (columnId === "total_vol_for_2nm") {
                updatedRow.nfw_volu_for_2nm =
                  updatedRow.lib_vol_for_2nm && value
                    ? parseFloat((parseFloat(value) - parseFloat(updatedRow.lib_vol_for_2nm)).toFixed(2))
                    : "";
              }
              return updatedRow;
            }


            if (columnId === 'pool_conc' || columnId === 'size') {
              const poolConc = parseFloat(updatedRow.pool_conc) || 0;
              updatedRow.nm_conc = size > 0 ? ((poolConc / (size * 660)) * Math.pow(10, 6)).toFixed(2) : "";
            }

            if (qubit_lib_qc_ng_ul) {
              updatedRow.lib_vol_for_hyb = parseFloat(200 / qubit_lib_qc_ng_ul).toFixed(2)
            }

            if (columnId === "size") {
              updatedRow.one_tenth_of_nm_conc = nm_conc > 0 ? (parseFloat((nm_conc / 10).toFixed(2))) : "";
            }
            if (qubit_dna || per_rxn_gdna) {
              updatedRow.gdna_volume_3x = qubit_dna > 0 ? Math.round((per_rxn_gdna / qubit_dna) * 3) : "";
            }

            if (columnId === "volume" || columnId === "gdna_volume_3x") {
              const gdna_volume_3x = parseFloat(updatedRow.gdna_volume_3x) || 0;
              updatedRow.nfw = volume > 0 ? volume - gdna_volume_3x : "";
            }

            if (columnId === "qubit_lib_qc_ng_ul") {
              updatedRow.stock_ng_ul = qubit_lib_qc_ng_ul > 0 ? qubit_lib_qc_ng_ul * 10 : "";
              updatedRow.lib_vol_for_hyb = (200 / qubit_lib_qc_ng_ul).toFixed(2);

            }
            if (columnId === "stock_ng_ul") {
              const stock = parseFloat(value) || 0;
              updatedRow.stock_ng_ul = stock;
            }

            if (columnId === "qubit_lib_qc_ng_ul") {
              updatedRow.pooling_volume = qubit_lib_qc_ng_ul > 0 ? (200 / qubit_lib_qc_ng_ul).toFixed(2) : "";
            }

            if (columnId === 'pool_conc' || columnId === 'size') {
              updatedRow.one_tenth_of_nm_conc = updatedRow.nm_conc > 0 ? (parseFloat((updatedRow.nm_conc / 10).toFixed(2))) : "";
            }

            console.log('updateData called:', rowIndex, columnId, value);
            return updatedRow;

          })

          // Save to localStorage
          const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
          const currentTestName = testNameRef.current;
          if (currentTestName) {
            if (Array.isArray(storedData[currentTestName])) {
              // Upgrade old format to new
              storedData[currentTestName] = { rows: updatedRows, pools: pooledRowData };
            } else {
              storedData[currentTestName] = {
                rows: updatedRows,
                pools: pooledRowData,
              };
            }
            localStorage.setItem('libraryPreparationData', JSON.stringify(storedData));
          }
          return updatedRows;
        });
      },
    },
  });



  const handleCreatePool = async () => {
    if (Array.isArray(currentSelection) && currentSelection.length > 0) {
      try {
        const response = await axios.get('/api/pool-no?id=pool_no');
        if (response.data[0].status === 200) {
          const poolNo = response.data[0].pool_no;
          const firstIdx = currentSelection[0];
          const firstRow = tableRows[firstIdx] || {};
          const mergedPooledValues = {
            ...firstRow,
            ...pooledValues,
            total_vol_for_2nm: pooledValues.total_vol_for_2nm ?? firstRow.total_vol_for_2nm ?? "",
          };
          setTableRows(prevRows =>
            prevRows.map((row, idx) =>
              currentSelection.includes(idx)
                ? { ...row, pool_no: poolNo }
                : row
            )
          );
          setPooledRowData(prev => [
            ...prev,
            { sampleIndexes: [...currentSelection], values: mergedPooledValues }
          ]);
          setPooledValues({});
          setCurrentSelection([]);
          setShowPooledFields(false);
          setRowSelection({});
        } else {
          toast.error(response.data[0].message);
        }
      } catch (error) {
        console.log('something went wrong:', error);
      }
    }
  };

  const handleCreateBatch = async () => {
    if (Array.isArray(currentSelection) && currentSelection.length > 0) {
      try {
        const response = await axios.get('/api/pool-no?id=batch_id');
        if (response.data[0].status === 200) {
          const batchId = response.data[0].batch_id;
          setTableRows(prevRows =>
            prevRows.map((row, idx) =>
              currentSelection.includes(idx)
                ? { ...row, batch_id: batchId }
                : row
            )
          );
          setPooledRowData(prev => {
            const newPools = [
              ...prev,
              { sampleIndexes: [...currentSelection], values: pooledValues }
            ];

            // --- Calculate percent and volume for all pools in this batch ---
            const poolsInBatch = newPools.filter(pool => {
              const firstIdx = pool.sampleIndexes[0];
              return tableRows[firstIdx]?.batch_id === batchId;
            });

            const batchRows = tableRows.filter(row => row.batch_id === batchId);
            const batchSum = batchRows.reduce(
              (sum, row) => sum + (parseFloat(row.data_required) || 0),
              0
            );

            poolsInBatch.forEach(pool => {
              const poolSum = pool.sampleIndexes.reduce(
                (sum, idx) => sum + (parseFloat(tableRows[idx]?.data_required) || 0),
                0
              );
              const percent = batchSum > 0 ? ((poolSum / batchSum) * 100).toFixed(2) : "";
              pool.values.vol_for_40nm_percent_pooling = percent;

              // Use fallback for totalVolFor2nm
              const totalVolFor2nm =
                parseFloat(pool.values.total_vol_for_2nm) ||
                parseFloat(tableRows[pool.sampleIndexes[0]]?.total_vol_for_2nm) ||
                0;
              const percentPooling = parseFloat(percent) || 0;
              pool.values.volume_from_40nm_for_total_25ul_pool =
                totalVolFor2nm && percentPooling
                  ? ((totalVolFor2nm * percentPooling) / 100).toFixed(2)
                  : "";
            });

            console.log('pool.value.total_vol_for_2nm:', pooledValues.total_vol_for_2nm);
            console.log('pool.value.vol_for_40nm_percent_pooling:', pooledValues.vol_for_40nm_percent_pooling);
            console.log('pool.value.volume_from_40nm_for_total_25ul_pool:', pooledValues.volume_from_40nm_for_total_25ul_pool);

            return newPools;
          });
          setPooledValues({});
          setCurrentSelection([]);
          setShowPooledFields(false);
          setRowSelection({});
          setCreatedBatchIds(prev => [...prev, batchId]);
        } else {
          toast.error(response.data[0].message);
        }
      } catch (error) {
        console.log('something went wrong:', error);
      }
    }
  }

  const editableColumns = allColumns
    .map(col => col.key)
    .filter(key =>
      !["sno", "select", "sample_id", "test_name", "patient_name", "sample_type", "pool_no", "internal_id"].includes(key)
    );

  useEffect(() => {
    // For each pool, update all rows in tableRows that belong to that pool
    setTableRows(prevRows => {
      // Ensure prevRows is always an array
      const safeRows = Array.isArray(prevRows) ? prevRows : [];
      let updatedRows = [...safeRows];
      pooledRowData.forEach(pool => {
        pool.sampleIndexes.forEach(idx => {
          updatedRows[idx] = {
            ...updatedRows[idx],
            ...pooledColumns.reduce((acc, col) => {
              acc[col] = pool.values[col] ?? "";
              return acc;
            }, {})
          };
        });
      });
      return updatedRows;
    });
  }, [pooledRowData]);

  const InputCell = ({ value: initialValue, rowIndex, columnId, updateData }) => {
    const [value, setValue] = useState(initialValue || "");
    const inputRef = useRef(null);

    const isSelected = selectedCells.some(
      cell => cell.rowIndex === rowIndex && cell.columnId === columnId
    );

    useEffect(() => {
      setValue(initialValue);
    }, [initialValue]);

    const handleChange = (e) => {
      setValue(e.target.value);
    };

    const handleBlur = () => {
      updateData(rowIndex, columnId, value);
    };

    // Disable selection logic if we're clicking into the input for typing
    const handleMouseDown = (e) => {
      if (e.detail === 1 && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        // Single click, not modifier — allow editing, don't trigger selection logic
        return;
      }

      setIsSelecting(true);
      setSelectionStart({ rowIndex, columnId });
      setSelectedCells([{ rowIndex, columnId }]);
    };

    const handleMouseEnter = (e) => {
      if (isSelecting && selectionStart) {
        const cells = [];
        const minRow = Math.min(selectionStart.rowIndex, rowIndex);
        const maxRow = Math.max(selectionStart.rowIndex, rowIndex);
        const visibleColumns = columns.map(col => col.accessorKey);
        const startColIdx = visibleColumns.indexOf(selectionStart.columnId);
        const endColIdx = visibleColumns.indexOf(columnId);
        const minCol = Math.min(startColIdx, endColIdx);
        const maxCol = Math.max(startColIdx, endColIdx);

        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            const colKey = visibleColumns[c];
            if (editableColumns.includes(colKey)) {
              cells.push({ rowIndex: r, columnId: colKey });
            }
          }
        }
        setSelectedCells(cells);
      }
    };

    const handleMouseUp = () => {
      setIsSelecting(false);
      setSelectionStart(null);
    };

    return (
      <Input
        ref={inputRef}
        className={`border border-orange-300 rounded p-1 text-xs w-[200px] ${isSelected ? "ring-2 ring-orange-500 bg-orange-50" : ""}`}
        value={value}
        type="text"
        placeholder={`Enter ${columnId}`}
        onChange={handleChange}
        onBlur={handleBlur}
        tabIndex={1}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseUp={handleMouseUp}
      />
    );
  };


  useEffect(() => {
    const handlePaste = (e) => {
      if (!selectedCells.length) return;

      const clipboard = e.clipboardData.getData("text/plain");
      if (!clipboard) return;

      // Parse clipboard into a 2D array
      const clipboardRows = clipboard.split(/\r?\n/).filter(Boolean).map(row => row.split('\t'));
      if (clipboardRows.length === 0) return;

      // Get visible columns in order (including non-editable)
      const visibleColumns = columns
        .filter(col => table.getState().columnVisibility[col.accessorKey])
        .map(col => col.accessorKey);

      // Find selection bounds
      // Use selection start point as origin
      const origin = selectionStart || selectedCells[0]; // fallback
      const startRow = origin.rowIndex;
      const startCol = visibleColumns.indexOf(origin.columnId);

      setTableRows(prevRows => {
        let updatedRows = [...prevRows];
        for (let r = 0; r < clipboardRows.length; r++) {
          for (let c = 0; c < clipboardRows[r].length; c++) {
            const rowIndex = startRow + r;
            const colIndex = startCol + c;
            const columnId = visibleColumns[colIndex];

            if (
              rowIndex < updatedRows.length &&
              editableColumns.includes(columnId)
            ) {
              const pastedValue = clipboardRows[r][c];

              let updatedRow = { ...updatedRows[rowIndex], [columnId]: pastedValue };

              // --- Apply your formulas here (copy from updateData) ---
              // Example (add all your formula logic here):
              const total_vol_for_2nm = parseFloat(updatedRow.total_vol_for_2nm) || 0;
              const lib_vol_for_2nm = parseFloat(updatedRow.lib_vol_for_2nm) || 0;
              const per_rxn_gdna = parseFloat(updatedRow.per_rxn_gdna) || 0;
              const volume = parseFloat(updatedRow.volume) || 0;
              const qubit_lib_qc_ng_ul = parseFloat(updatedRow.qubit_lib_qc_ng_ul) || 0;
              const one_tenth_of_nm_conc = parseFloat(updatedRow.one_tenth_of_nm_conc) || 0;
              const size = parseFloat(updatedRow.size) || 0;
              const nm_conc = parseFloat(updatedRow.nm_conc) || 0;
              const qubit_dna = parseFloat(updatedRow.qubit_dna) || 0;

              if (columnId === "lib_qubit") {
                const lib_qubit = parseFloat(updatedRow.lib_qubit) || 0;
                const size = parseFloat(updatedRow.size) || 0;
                const nm_conc = lib_qubit > 0 ? (lib_qubit / (size * 660)) * 1000 : 0;

                updatedRow.nm_conc = parseFloat(nm_conc.toFixed(2));

                const total_vol_for_2nm = parseFloat(updatedRow.total_vol_for_2nm) || 0;

                if (nm_conc > 0 && total_vol_for_2nm > 0) {
                  updatedRow.lib_vol_for_2nm = parseFloat(((20 * total_vol_for_2nm) / nm_conc).toFixed(2));
                  if (updatedRow.lib_vol_for_2nm > total_vol_for_2nm) {
                    updatedRow.lib_vol_for_2nm = total_vol_for_2nm;
                  }
                  updatedRow.nfw_volu_for_2nm = parseFloat((total_vol_for_2nm - updatedRow.lib_vol_for_2nm).toFixed(2));
                } else {
                  updatedRow.lib_vol_for_2nm = 0;
                  updatedRow.nfw_volu_for_2nm = total_vol_for_2nm;
                }
              }

              if (columnId === "nm_conc" || columnId === "total_vol_for_2nm") {
                if (nm_conc > 0 && total_vol_for_2nm > 0) {
                  updatedRow.lib_vol_for_2nm = parseFloat(((20 * total_vol_for_2nm) / nm_conc).toFixed(2));
                  if (updatedRow.lib_vol_for_2nm > total_vol_for_2nm) {
                    updatedRow.lib_vol_for_2nm = total_vol_for_2nm;
                  }
                  updatedRow.nfw_volu_for_2nm = parseFloat((total_vol_for_2nm - updatedRow.lib_vol_for_2nm).toFixed(2));
                } else {
                  updatedRow.lib_vol_for_2nm = "";
                  updatedRow.nfw_volu_for_2nm = "";
                }
              }

              if (columnId === "total_vol_for_2nm") {
                updatedRow.nfw_volu_for_2nm =
                  updatedRow.lib_vol_for_2nm && value
                    ? parseFloat((parseFloat(value) - parseFloat(updatedRow.lib_vol_for_2nm)).toFixed(2))
                    : "";
                return updatedRow;
              }

              if (columnId === 'pool_conc' || columnId === 'size') {
                const poolConc = parseFloat(updatedRow.pool_conc) || 0;
                updatedRow.nm_conc = size > 0 ? ((poolConc / (size * 660)) * Math.pow(10, 6)).toFixed(2) : "";
              }

              if (qubit_lib_qc_ng_ul) {
                updatedRow.lib_vol_for_hyb = parseFloat(200 / qubit_lib_qc_ng_ul).toFixed(2)
              }

              if (columnId === "size") {
                updatedRow.one_tenth_of_nm_conc = nm_conc > 0 ? (parseFloat((nm_conc / 10).toFixed(2))) : "";
              }

              if (qubit_dna || per_rxn_gdna) {
                updatedRow.gdna_volume_3x = qubit_dna > 0 ? Math.round((per_rxn_gdna / qubit_dna) * 3) : "";
              }

              if (columnId === "volume" || columnId === "gdna_volume_3x") {
                const gdna_volume_3x = parseFloat(updatedRow.gdna_volume_3x) || 0;
                updatedRow.nfw = volume > 0 ? volume - gdna_volume_3x : "";
              }

              if (columnId === "qubit_lib_qc_ng_ul") {
                updatedRow.stock_ng_ul = qubit_lib_qc_ng_ul > 0 ? qubit_lib_qc_ng_ul * 10 : "";
                updatedRow.lib_vol_for_hyb = (200 / qubit_lib_qc_ng_ul).toFixed(2);
              }
              if (columnId === "stock_ng_ul") {
                const stock = parseFloat(rows[r][c]) || 0;
                updatedRow.stock_ng_ul = stock;
              }

              if (columnId === "qubit_lib_qc_ng_ul") {
                updatedRow.pooling_volume = qubit_lib_qc_ng_ul > 0 ? (200 / qubit_lib_qc_ng_ul).toFixed(2) : "";
              }

              if (columnId === 'pool_conc' || columnId === 'size') {
                updatedRow.one_tenth_of_nm_conc = updatedRow.nm_conc > 0 ? (parseFloat((updatedRow.nm_conc / 10).toFixed(2))) : "";
              }

              updatedRows[rowIndex] = updatedRow;
            }
          }
        }
        return updatedRows;
      });
      e.preventDefault();
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [selectedCells, editableColumns, columns, table]);

  useEffect(() => {
    const handleCopy = (e) => {
      if (!selectedCells.length) return;

      // Sort cells by rowIndex, then columnId
      const sortedCells = [...selectedCells].sort((a, b) => {
        if (a.rowIndex === b.rowIndex) {
          return a.columnId.localeCompare(b.columnId);
        }
        return a.rowIndex - b.rowIndex;
      });

      // Group cells by rowIndex
      const grouped = sortedCells.reduce((acc, cell) => {
        if (!acc[cell.rowIndex]) acc[cell.rowIndex] = [];
        acc[cell.rowIndex].push(cell);
        return acc;
      }, {});

      // Build clipboard string
      const lines = Object.keys(grouped)
        .sort((a, b) => a - b)
        .map(rowIdx =>
          grouped[rowIdx]
            .sort((a, b) => a.columnId.localeCompare(b.columnId))
            .map(cell => tableRows[cell.rowIndex][cell.columnId] ?? "")
            .join('\t')
        );

      const clipboardString = lines.join('\n');
      e.clipboardData.setData('text/plain', clipboardString);
      e.preventDefault();
    };

    window.addEventListener("copy", handleCopy);
    return () => window.removeEventListener("copy", handleCopy);
  }, [selectedCells, tableRows]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only trigger if Delete or Backspace is pressed and cells are selected
      if (
        selectedCells.length > 0 &&
        (e.key === "Delete" || e.key === "Backspace") &&
        // Don't trigger if an input is focused (let the input handle it)
        document.activeElement.tagName !== "INPUT"
      ) {
        setTableRows(prevRows =>
          prevRows.map((row, rowIndex) => {
            const updatedRow = { ...row };
            selectedCells.forEach(cell => {
              if (cell.rowIndex === rowIndex) {
                updatedRow[cell.columnId] = "";
              }
            });
            return updatedRow;
          })
        );
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedCells]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('libraryPreparationData'));
    if (storedData) {
      const testNames = Object.keys(storedData); // Extract keys from the stored data
      setGetTheTestNames(testNames); // Update state with test names

      if (testNames.length > 0) {
        const defaultTestName = testNames[0];
        setTestName(defaultTestName);
        if (Array.isArray(storedData[defaultTestName])) {
          setTableRows(storedData[defaultTestName]);
          setPooledRowData([]);
        } else {
          setTableRows(storedData[defaultTestName].rows || []);
          setPooledRowData(storedData[defaultTestName].pools || []);
        }
      }
    }
  }, []);

  const handleTestNameSelection = async (selectedTestName) => {
    setTestName(selectedTestName);
    setSelectedSampleIndicator(selectedTestName);
    const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};

    // Always show local data if it exists
    if (storedData && storedData[selectedTestName]) {
      if (Array.isArray(storedData[selectedTestName])) {
        setTableRows(storedData[selectedTestName]);
        setPooledRowData([]);
      } else {
        setTableRows(storedData[selectedTestName].rows || []);
        setPooledRowData(storedData[selectedTestName].pools || []);
      }
      return; // Do not fetch or overwrite with API data
    }

    // If no local data, fetch from API
    try {
      const allSampleIds = Object.values(storedData)
        .flatMap(arr => arr.map(row => row.sample_id))
        .filter(Boolean);
      const response = await axios.get(`/api/pool-data`, {
        params: {
          hospital_name: user.hospital_name,
          application: selectedTestName,
          sample_id: allSampleIds.join(','),
        },
      });
      if (response.data[0].status === 200) {
        const poolData = response.data[0].data;
        if (poolData && poolData.length > 0) {
          const newData = poolData.reduce((acc, row) => {
            const testName = row.test_name;
            if (!acc[testName]) acc[testName] = [];
            acc[testName].push(row);
            return acc;
          }, {});
          setTableRows(newData[selectedTestName] || []);
          // Only update localStorage if there was no local data
          if (!storedData[selectedTestName] || storedData[selectedTestName].length === 0) {
            const mergedData = { ...storedData, ...newData };
            localStorage.setItem('libraryPreparationData', JSON.stringify(mergedData));
          }
        } else {
          setTableRows([]);
          setMessage(1);
        }
      }
    } catch (error) {
      console.error("Error in handleTestNameSelection:", error);
      toast.error("An error occurred while selecting the test name.");
    }
  };

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('libraryPreparationData'));
    if (storedData) {
      const testNames = Object.keys(storedData); // Extract keys from the stored data
      setGetTheTestNames(testNames); // Update state with test names

      // Set default testName and tableRows based on the first key
      if (testNames.length > 0) {
        const defaultTestName = testNames[0];
        setTestName(defaultTestName);
        setTableRows(storedData[defaultTestName]);
      }
    }
  }, []);

  const handleSaveAll = async () => {
    setProcessing(true);
    try {
      const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
      const hospital_name = user.hospital_name;

      // Prepare an array of promises for all testNames
      const savePromises = Object.entries(storedData).map(([testName, data]) => {
        let rows = [];
        if (Array.isArray(data)) {
          rows = data;
        } else if (data && Array.isArray(data.rows)) {
          // Sync pools for each testName
          rows = data.rows.map((row, idx) => {
            const pool = (data.pools || []).find(pool => pool.sampleIndexes.includes(idx));
            if (pool) {
              return { ...row, ...pool.values };
            }
            return row;
          });
        }
        return axios.post('/api/pool-data', {
          hospital_name,
          testName,
          rows,
        });
      });

      const results = await Promise.all(savePromises);

      // Check if all were successful
      const allSuccess = results.every(res => res.data[0]?.status === 200);

      if (allSuccess) {
        toast.success("All data saved successfully!");
        setProcessing(false);
        // localStorage.removeItem('libraryPreparationData');
        // setMessage(1); // Set message to indicate no data available
        // setTableRows([]);
        // setGetTheTestNames([]);
      } else {
        setProcessing(false);
        toast.error("Some data could not be saved. Please check and try again.");
      }
    } catch (error) {
      console.error("Error saving all data:", error);
      toast.error("An error occurred while saving all data.");
      setProcessing(false);
    }
  };

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
      // const poolNos = [...new Set(tableRows.map(row => row.pool_no).filter(Boolean))];

      // Prepare the payload for the API call
      const syncedRows = tableRows.map((row, idx) => {
        const pool = pooledRowData.find(pool => pool.sampleIndexes.includes(idx));
        if (pool) {
          // Only merge pooledColumns, not all pool.values
          const pooledFields = pooledColumns.reduce((acc, key) => {
            acc[key] = pool.values[key];
            return acc;
          }, {});
          return {
            ...row,
            ...pooledFields,
            id: idx + 1,
          };
        }
        return { ...row, id: idx + 1 };
      });
      const payload = {
        hospital_name: user.hospital_name,
        testName: testName,
        rows: syncedRows,
      };

      console.log('payload:', payload);

      const response = await axios.post('/api/pool-data', payload);

      if (response.data[0].status === 200) {
        toast.success("Sample indicator updated successfully!");
        setProcessing(false);
        // Remove only the selected testName's data
        const updatedData = { ...storedData };
        // delete updatedData[testName];

        localStorage.setItem('libraryPreparationData', JSON.stringify(updatedData));
        // setTableRows([]); 
        // setMessage(1); // Set message to indicate no data available
      } else if (response.data[0].status === 400) {
        toast.error(response.data[0].message);
        setProcessing(false);
      }
    } catch (error) {
      console.log("Error updating values:", error);
      setProcessing(false);
      toast.error("An error occurred while updating the values.");
    }
  };

  const selectedRows = table.getRowModel().rows.filter(r => rowSelection[r.id]);
  const lastSelectedIndex = selectedRows.length > 0
    ? selectedRows[selectedRows.length - 1].index
    : null;
  const currentSelectedIndexes = selectedRows.map(r => r.index);

  useEffect(() => {
    setCurrentSelection(currentSelectedIndexes);
  }, [rowSelection]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
    if (storedData[testName]) {
      if (Array.isArray(storedData[testName])) {
        setTableRows(storedData[testName]);
        setPooledRowData([]);
      } else {
        setTableRows(storedData[testName].rows || []);
        setPooledRowData(storedData[testName].pools || []);
      }
    }
  }, [testName]);

  useEffect(() => {
    // Save pooledColumns for each pool in localStorage under the current testName
    if (!testName) return;
    const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
    // Save both tableRows and pooledRowData under the same testName key
    storedData[testName] = {
      rows: tableRows,
      pools: pooledRowData,
    };
    localStorage.setItem('libraryPreparationData', JSON.stringify(storedData));
  }, [pooledRowData, tableRows, testName]);


  useEffect(() => {
    if (!pooledRowData.length || !tableRows.length) return;

    let needsUpdate = false;
    const poolsByBatch = {};

    // Group pools by batch_id
    pooledRowData.forEach((pool, poolIdx) => {
      const firstIdx = pool.sampleIndexes[0];
      const batchId = tableRows[firstIdx]?.batch_id;
      if (!batchId) return;
      if (!poolsByBatch[batchId]) poolsByBatch[batchId] = [];
      poolsByBatch[batchId].push({ pool, poolIdx });
    });

    let newPooledRowData = [...pooledRowData];

    Object.values(poolsByBatch).forEach(poolsInBatch => {
      // 1. Calculate percent for each pool (as before)
      const batchRows = tableRows.filter(row => row.batch_id === tableRows[poolsInBatch[0].pool.sampleIndexes[0]]?.batch_id);
      const batchSum = batchRows.reduce(
        (sum, row) => sum + (parseFloat(row.data_required) || 0),
        0
      );

      // 2. Calculate initial (unscaled) volume for each pool
      const unscaled = poolsInBatch.map(({ pool, poolIdx }) => {
        const totalVol = parseFloat(pool.values.total_vol_for_2nm) || 0;

        // Calculate poolSum for this pool
        const poolSum = pool.sampleIndexes.reduce(
          (sum, idx) => sum + (parseFloat(tableRows[idx]?.data_required) || 0),
          0
        );

        // Use calculated percent if available, else recalculate
        const percent = pool.values.vol_for_40nm_percent_pooling
          ? parseFloat(pool.values.vol_for_40nm_percent_pooling) || 0
          : batchSum > 0 ? ((poolSum / batchSum) * 100) : 0;

        const vol = ((totalVol * percent) / 100) || 0;

        // Update percent if needed
        const percentStr = batchSum > 0 ? ((poolSum / batchSum) * 100).toFixed(2) : "";
        if (pool.values.vol_for_40nm_percent_pooling !== percentStr) {
          needsUpdate = true;
          newPooledRowData[poolIdx] = {
            ...pool,
            values: {
              ...pool.values,
              vol_for_40nm_percent_pooling: percentStr,
            }
          };
        }
        return vol;
      });

      // 3. Scale so sum is 25
      const sumUnscaled = unscaled.reduce((a, b) => a + b, 0) || 1;
      poolsInBatch.forEach(({ pool, poolIdx }, i) => {
        const scaled = ((unscaled[i] / sumUnscaled) * 25).toFixed(2);
        if (pool.values.volume_from_40nm_for_total_25ul_pool !== scaled) {
          needsUpdate = true;
          newPooledRowData[poolIdx] = {
            ...newPooledRowData[poolIdx],
            values: {
              ...newPooledRowData[poolIdx].values,
              volume_from_40nm_for_total_25ul_pool: scaled,
            }
          };
        }
      });
    });

    if (needsUpdate && !isEqual(newPooledRowData, pooledRowData)) {
      setPooledRowData(newPooledRowData);
    }
    // eslint-disable-next-line
  }, [tableRows, pooledRowData]);

  return (
    <div className="p-4 ">
      {!message ?
        (<>
          <div className="mb-4 flex items-center gap-4 overflow-x-auto ">
            <Tabs value={testName} className="w-full rounded-lg ">
              <TabsList className="flex flex-nowrap bg-white dark:bg-gray-800 ">
                {getTheTestNames.map((testName, index) => (
                  <TabsTrigger
                    key={index}
                    value={testName}
                    onClick={() => handleTestNameSelection(testName)}
                    className={`text-sm px-4 py-2 cursor-pointer font-bold rounded-lg data-[state=active]:bg-orange-400 data-[state=active]:text-white
                      }`}
                  >
                    {testName}
                  </TabsTrigger>
                ))}

              </TabsList>
            </Tabs>
          </div>

          {selectedCells.length > 1 && (
            <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded shadow z-50">
              <input
                type="text"
                placeholder="Bulk value"
                value={bulkValue}
                onChange={e => setBulkValue(e.target.value)}
                className="border p-2"
              />
              <Button
                onClick={() => {
                  setTableRows(prevRows => {
                    let updatedRows = [...prevRows];
                    const affectedRows = new Set();

                    // 1. Set bulk value for selected cells
                    selectedCells.forEach(cell => {
                      updatedRows[cell.rowIndex] = {
                        ...updatedRows[cell.rowIndex],
                        [cell.columnId]: bulkValue
                      };
                      affectedRows.add(cell.rowIndex);
                    });

                    // 2. Recalculate formulas for all affected rows
                    updatedRows = updatedRows.map((row, idx) => {
                      if (!affectedRows.has(idx)) return row;

                      // --- Formula logic (copy from updateData) ---
                      const updatedRow = { ...row };
                      const total_vol_for_2nm = parseFloat(updatedRow.total_vol_for_2nm) || 0;
                      const lib_vol_for_2nm = parseFloat(updatedRow.lib_vol_for_2nm) || 0;
                      const per_rxn_gdna = parseFloat(updatedRow.per_rxn_gdna) || 0;
                      const volume = parseFloat(updatedRow.volume) || 0;
                      const qubit_dna = parseFloat(updatedRow.qubit_dna) || 0;

                      // gdna_volume_3x
                      updatedRow.gdna_volume_3x = (qubit_dna > 0 && per_rxn_gdna > 0)
                        ? Math.round((per_rxn_gdna / qubit_dna) * 3)
                        : "";

                      // nfw
                      const gdna_volume_3x = parseFloat(updatedRow.gdna_volume_3x) || 0;
                      updatedRow.nfw = volume > 0 ? volume - gdna_volume_3x : "";

                      // nfw_volu_for_2nm
                      if (total_vol_for_2nm && lib_vol_for_2nm) {
                        updatedRow.nfw_volu_for_2nm = parseFloat((total_vol_for_2nm - lib_vol_for_2nm).toFixed(2));
                      }

                      // ...add any other formulas you want to auto-calculate here...

                      return updatedRow;
                    });

                    return updatedRows;
                  });
                  setBulkValue("");
                }}
              >
                Apply to Selected
              </Button>
            </div>
          )}

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
                    const visibleCols = getDefaultVisible(testName); // <-- get the correct default columns here
                    table.getAllLeafColumns().forEach((column) => {
                      column.toggleVisibility(visibleCols.includes(column.id));
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

          <div className="">
            {/* Table */}
            <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow mb-6 overflow-x-auto w-full whitespace-nowrap" style={{ maxWidth: 'calc(100vw - 60px)' }}>
              <div className="overflow-y-auto" style={{ maxHeight: 700 }}>
                <table className="min-w-full border-collapse table-auto">
                  <thead className="bg-orange-100 dark:bg-gray-800 sticky top-0 z-30">
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header, colIdx) => {
                          const colKey = header.column.id;
                          let stickyClass = "";
                          let style = {};
                          if (colKey === "lib_vol_for_2nm") style = { maxWidth: "120px", minWidth: "100px" };
                          if (colKey === "volume_from_40nm_for_total_25ul_pool") style = { maxWidth: "120px", minWidth: "100px" };

                          if (colKey === "sno") stickyClass = "sticky left-0 z-40 w-[60px]";
                          if (colKey === "batch_id") stickyClass = "sticky left-[50px] z-40 w-[120px]";
                          if (colKey === "pool_no") stickyClass = "sticky left-[120px] z-40 w-[100px]";
                          if (colKey === "sample_id") stickyClass = "sticky left-[180px] z-40 w-[140px]";
                          return (
                            <th
                              key={header.id}
                              onClick={header.column.getToggleSortingHandler()}
                              className={`cursor-pointer table-header px-4 py-2 text-left border-b border-gray-200 sticky top-0 z-30 bg-orange-100 dark:bg-gray-800 ${stickyClass}`}
                              style={style}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          );
                        })}
                      </tr>
                    ))}
                  </thead>

                  <tbody>
                    {table.getRowModel().rows.map((row, rowIndex, arr) => {
                      const pool = pooledRowData.find(pool => pool.sampleIndexes.includes(rowIndex));
                      const isFirstOfPool = pool && rowIndex === Math.min(...pool.sampleIndexes);

                      const isSelected = currentSelection.includes(rowIndex);
                      const isFirstSelected = isSelected && rowIndex === Math.min(...currentSelection);

                      const currentBatchId = row.original.batch_id;
                      const isLastOfBatch =
                        rowIndex === arr.length - 1 ||
                        arr[rowIndex + 1].original.batch_id !== currentBatchId;

                      const batchRows = arr.filter(r => r.original.batch_id === currentBatchId);
                      const batchSum = batchRows.reduce(
                        (sum, r) => sum + (parseFloat(r.original.data_required) || 0),
                        0
                      );

                      return (
                        <React.Fragment key={row.id}>
                          <tr>
                            {row.getVisibleCells().map((cell, colIdx) => {
                              // Pooled (existing) inputs
                              if (pooledColumns.includes(cell.column.id) && pool) {
                                if (isFirstOfPool) {
                                  return (
                                    <td
                                      key={cell.column.id}
                                      rowSpan={pool.sampleIndexes.length}
                                      className="align-middle px-2 py-1 border border-gray-300"
                                    >
                                      <input
                                        className="border border-orange-300 rounded p-1 w-[200px]"
                                        placeholder={cell.column.columnDef.header || cell.column.id}
                                        value={pool.values[cell.column.id] || ""}
                                        onChange={e => {
                                          const value = e.target.value;
                                          setPooledRowData(prev =>
                                            prev.map(p => {
                                              if (p !== pool) return p;
                                              const updated = { ...p.values, [cell.column.id]: value };

                                              // Always use the latest value if editing a dependency
                                              const totalVolFor2nm =
                                                cell.column.id === "total_vol_for_2nm"
                                                  ? parseFloat(value) || 0
                                                  : parseFloat(updated.total_vol_for_2nm) || 0;
                                              const percentPooling =
                                                cell.column.id === "vol_for_40nm_percent_pooling"
                                                  ? parseFloat(value) || 0
                                                  : parseFloat(updated.vol_for_40nm_percent_pooling ?? 0) || 0;

                                              updated.volume_from_40nm_for_total_25ul_pool = ((totalVolFor2nm * percentPooling) / 100).toFixed(2);

                                              const poolConc = parseFloat(updated.pool_conc) || 0;

                                              const size = parseFloat(updated.size) || 0;

                                              updated.nm_conc = (size > 0 && poolConc > 0)
                                                ? ((poolConc / (size * 660)) * 1000000).toFixed(2)
                                                : "";

                                              const nmConc = parseFloat(updated.nm_conc) || 0;
                                              updated.one_tenth_of_nm_conc = (nmConc > 0) ? (nmConc / 10).toFixed(2) : "";


                                              updated.lib_vol_for_2nm = (20 * totalVolFor2nm / nmConc).toFixed(2);
                                              updated.nfw_volu_for_2nm = (totalVolFor2nm - updated.lib_vol_for_2nm).toFixed(2);

                                              return { ...p, values: updated };
                                            })
                                          );
                                          table.options.meta.updateData(pool.sampleIndexes[0], cell.column.id, value);
                                        }}
                                      />
                                    </td>
                                  );
                                }
                                return null; // Covered by rowspan
                              }


                              if (finalPoolingColumns.includes(cell.column.id) && pool) {
                                if (isFirstOfPool) {
                                  // Calculate poolSum for this pool
                                  const poolRows = pool.sampleIndexes.map(idx => arr[idx]);
                                  const poolSum = poolRows.reduce(
                                    (sum, r) => sum + (parseFloat(r.original.data_required) || 0),
                                    0
                                  );
                                  // Calculate batchSum for the batch of this pool
                                  const batchRows = arr.filter(r => r.original.batch_id === row.original.batch_id);
                                  const batchSum = batchRows.reduce(
                                    (sum, r) => sum + (parseFloat(r.original.data_required) || 0),
                                    0
                                  );
                                  // Calculate percentage
                                  const percent = batchSum > 0 ? ((poolSum / batchSum) * 100).toFixed(2) : "";

                                  return (
                                    <td
                                      key={cell.column.id}
                                      rowSpan={pool.sampleIndexes.length}
                                      className="align-middle px-2 py-1 border border-gray-300"
                                    >
                                      {cell.column.id === "vol_for_40nm_percent_pooling" ? (
                                        <input
                                          className="border border-orange-300 rounded p-1 w-[200px] mb-1 "
                                          value={
                                            // Only show value if batch_id exists for this pool
                                            pool.sampleIndexes.every(idx => arr[idx]?.original?.batch_id)
                                              ? (pool.values.vol_for_40nm_percent_pooling ?? percent)
                                              : ""
                                          }
                                          onChange={e => {
                                            const value = e.target.value;
                                            setPooledRowData(prev =>
                                              prev.map(p => {
                                                if (p !== pool) return p;
                                                const updated = { ...p.values, vol_for_40nm_percent_pooling: value };

                                                const totalVolFor2nm = parseFloat(updated.total_vol_for_2nm) || 0;
                                                const percentPooling = parseFloat(value) || 0;

                                                updated.volume_from_40nm_for_total_25ul_pool = ((totalVolFor2nm * percentPooling) / 100).toFixed(2);

                                                return { ...p, values: updated };
                                              })
                                            );
                                            table.options.meta.updateData(pool.sampleIndexes[0], cell.column.id, value);
                                          }}
                                          placeholder="40nM vol. % pooling"
                                        />
                                      ) : (
                                        <input
                                          className="border border-orange-300 rounded p-1 w-[200px]"
                                          placeholder={cell.column.columnDef.header || cell.column.id}
                                          value={pool.values[cell.column.id] || ""}
                                          onChange={e => {
                                            const value = e.target.value;
                                            setPooledRowData(prev =>
                                              prev.map(p => {
                                                if (p !== pool) return p;
                                                const updated = { ...p.values, [cell.column.id]: value };

                                                // Always use the latest value if editing a dependency
                                                const totalVolFor2nm =
                                                  cell.column.id === "total_vol_for_2nm"
                                                    ? parseFloat(value) || 0
                                                    : parseFloat(updated.total_vol_for_2nm) || 0;
                                                const percentPooling =
                                                  cell.column.id === "vol_for_40nm_percent_pooling"
                                                    ? parseFloat(value) || 0
                                                    : parseFloat(updated.vol_for_40nm_percent_pooling) || 0;

                                                updated.volume_from_40nm_for_total_25ul_pool = ((totalVolFor2nm * percentPooling) / 100).toFixed(2);

                                                return { ...p, values: updated };
                                              })
                                            );
                                            table.options.meta.updateData(pool.sampleIndexes[0], cell.column.id, value);
                                          }}
                                        />
                                      )}
                                    </td>
                                  );
                                }
                                return null; // Covered by rowspan
                              }

                              if (cell.column.id === "vol_for_40nm_percent_pooling" && pool && isFirstOfPool) {
                                return (
                                  <td key={cell.column.id} rowSpan={pool.sampleIndexes.length} className="align-middle px-2 py-1 border border-gray-300">
                                    <input
                                      className="border border-orange-300 rounded p-1 w-[200px] mb-1"
                                      value={pool.values.vol_for_40nm_percent_pooling || ""}
                                      onChange={e => {
                                        const value = e.target.value;
                                        setPooledRowData(prev =>
                                          prev.map(p => {
                                            if (p !== pool) return p;
                                            const updated = { ...p.values, vol_for_40nm_percent_pooling: value };
                                            const totalVolFor2nm = parseFloat(updated.total_vol_for_2nm) || 0;
                                            const percentPooling = parseFloat(value) || 0;
                                            updated.volume_from_40nm_for_total_25ul_pool = ((totalVolFor2nm * percentPooling) / 100).toFixed(2);
                                            return { ...p, values: updated };
                                          })
                                        );
                                        table.options.meta.updateData(pool.sampleIndexes[0], cell.column.id, value);
                                      }}
                                      placeholder="40nM vol. % pooling"
                                    />
                                  </td>
                                );
                              }

                              if (cell.column.id === "volume_from_40nm_for_total_25ul_pool" && pool && isFirstOfPool) {
                                const totalVolFor2nm = parseFloat(pool.values.total_vol_for_2nm) || 0;
                                const percentPooling = parseFloat(pool.values.vol_for_40nm_percent_pooling) || 0;
                                const var_name = ((totalVolFor2nm * percentPooling) / 100).toFixed(2);
                                return (
                                  <td key={cell.column.id} rowSpan={pool.sampleIndexes.length} className="align-middle px-2 py-1 border border-gray-300">
                                    <input
                                      className="border border-orange-300 text-black dark:text-white rounded p-1 w-[200px]"
                                      placeholder={cell.column.columnDef.header || cell.column.id}
                                      value={pool.values.volume_from_40nm_for_total_25ul_pool || ""}
                                      readOnly
                                    />
                                  </td>
                                );
                              }

                              // Pooled (new) inputs
                              if (
                                pooledColumns.includes(cell.column.id) &&
                                showPooledFields &&
                                isFirstSelected
                              ) {
                                return (
                                  <td
                                    key={cell.column.id}
                                    rowSpan={currentSelection.length}
                                    className="align-middle px-2 py-1 border border-gray-300"
                                  >
                                    <input
                                      className="border border-orange-300 rounded p-1 w-[200px]"
                                      placeholder={cell.column.columnDef.header || cell.column.id}
                                      value={pool?.values[cell.column.id] || ""}
                                      onChange={e => {
                                        const value = e.target.value;
                                        setPooledRowData(prev =>
                                          prev.map(p => {
                                            if (p !== pool) return p;
                                            const updated = { ...p.values, [cell.column.id]: value };

                                            // Always use the latest value if editing a dependency
                                            const totalVolFor2nm =
                                              cell.column.id === "total_vol_for_2nm"
                                                ? parseFloat(value) || 0
                                                : parseFloat(updated.total_vol_for_2nm) || 0;
                                            const percentPooling =
                                              cell.column.id === "vol_for_40nm_percent_pooling"
                                                ? parseFloat(value) || 0
                                                : parseFloat(updated.vol_for_40nm_percent_pooling) || 0;

                                            updated.volume_from_40nm_for_total_25ul_pool = ((totalVolFor2nm * percentPooling) / 100).toFixed(2);

                                            const poolConc = parseFloat(updated.pool_conc) || 0;

                                            const size = parseFloat(updated.size) || 0;

                                            updated.nm_conc = (size > 0 && poolConc > 0)
                                              ? ((poolConc / (size * 660)) * 1000000).toFixed(2)
                                              : "";

                                            const nmConc = parseFloat(updated.nm_conc) || 0;
                                            updated.one_tenth_of_nm_conc = (nmConc > 0) ? (nmConc / 10).toFixed(2) : "";

                                            if (cell.column.id === "lib_vol_for_2nm" || cell.column.id === "nm_conc" || cell.column.id === "one_tenth_of_nm_conc") {
                                              const nmConc = parseFloat(updated.nm_conc) || 0;
                                              const libVolFor2nm = parseFloat(updated.lib_vol_for_2nm) || 0;

                                              updated.total_vol_for_2nm = (updated.one_tenth_of_nm_conc && libVolFor2nm)
                                                ? (parseFloat(updated.one_tenth_of_nm_conc) * libVolFor2nm / 2).toFixed(2)
                                                : "";

                                              updated.nfw_volu_for_2nm = (totalVolFor2nm && libVolFor2nm)
                                                ? (totalVolFor2nm - libVolFor2nm).toFixed(2)
                                                : "";
                                            }

                                            if (cell.column.id === "total_vol_for_2nm") {
                                              const libVolFor2nm = parseFloat(updated.lib_vol_for_2nm) || 0;
                                              updated.nfw_volu_for_2nm = (value && libVolFor2nm)
                                                ? (parseFloat(value) - libVolFor2nm).toFixed(2)
                                                : "";
                                            }

                                            updated.volume_from_40nm_for_total_25ul_pool = ((totalVolFor2nm * percentPooling) / 100).toFixed(2);

                                            return { ...p, values: updated };
                                          })
                                        );
                                        table.options.meta.updateData(pool.sampleIndexes[0], cell.column.id, value);
                                      }}
                                    />
                                  </td>
                                );
                              }

                              if (
                                pooledColumns.includes(cell.column.id) &&
                                ((showPooledFields && isSelected) || pool)
                              ) {
                                return null; // skip cell covered by rowspan
                              }

                              if (finalPoolingColumns.includes(cell.column.id) && pool) {
                                if (isFirstOfPool) {
                                  return (
                                    <td
                                      key={cell.column.id}
                                      rowSpan={pool.sampleIndexes.length}
                                      className="align-middle px-2 py-1 border border-gray-300"
                                    >
                                      <input
                                        className="border border-orange-300 text-black dark:text-white rounded p-1 w-[200px]"
                                        placeholder={cell.column.columnDef.header || cell.column.id}
                                        value={pool.values[cell.column.id] || ""}
                                        onChange={e => {
                                          const value = e.target.value;
                                          setPooledRowData(prev =>
                                            prev.map(p => {
                                              if (p !== pool) return p;
                                              const updated = { ...p.values, [cell.column.id]: value };

                                              // Always use the latest value if editing a dependency
                                              const totalVolFor2nm =
                                                cell.column.id === "total_vol_for_2nm"
                                                  ? parseFloat(value) || 0
                                                  : parseFloat(updated.total_vol_for_2nm) || 0;
                                              const percentPooling =
                                                cell.column.id === "vol_for_40nm_percent_pooling"
                                                  ? parseFloat(value) || 0
                                                  : parseFloat(updated.vol_for_40nm_percent_pooling) || 0;

                                              updated.volume_from_40nm_for_total_25ul_pool = ((totalVolFor2nm * percentPooling) / 100).toFixed(2);
                                              return { ...p, values: updated };
                                            })
                                          );
                                          table.options.meta.updateData(pool.sampleIndexes[0], cell.column.id, value);
                                        }}
                                      />
                                    </td>
                                  );
                                }
                                return null; // Covered by rowspan
                              }
                              // Default cell render
                              let stickyClass = "";
                              if (cell.column.id === "sno") stickyClass = "sticky left-0 z-20 w-[60px] bg-white dark:bg-gray-900";
                              if (cell.column.id === "batch_id") stickyClass = "sticky left-[50px] z-20 w-[120px] bg-white dark:bg-gray-900";
                              if (cell.column.id === "pool_no") stickyClass = "sticky left-[120px] z-20 w-[100px] bg-white dark:bg-gray-900";
                              if (cell.column.id === "sample_id") stickyClass = "sticky left-[180px] z-20 w-[140px] bg-white dark:bg-gray-900";
                              return (
                                <td
                                  key={cell.column.id}
                                  className={`px-4 py-1 border-b border-gray-100 ${stickyClass}`}
                                >
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                  )}
                                </td>
                              );
                            })}
                          </tr>

                          {isLastOfBatch && (
                            <tr>
                              <td colSpan={columns.length} className="font-bold text-xl py-3 pe-[500px] text-right">
                                Total Data: {batchSum}
                              </td>
                            </tr>
                          )}

                          {rowIndex === Math.max(...currentSelection) && currentSelection.length > 0 && !showPooledFields && (
                            <tr>
                              <td colSpan={columns.length} className="py-2 px-4">
                                <div className="w-[250px] flex justify-around">
                                  <Button
                                    onClick={handleCreatePool}
                                    className="text-white text-sm px-4 py-1 rounded bg-black"
                                  >
                                    Create Pool
                                  </Button>
                                  <Button
                                    onClick={handleCreateBatch}
                                    className="text-white text-sm px-4 py-1 rounded bg-black"
                                  >
                                    Create Batch
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
          <Button
            type="button"
            onClick={handleSaveAll}
            className="bg-green-600 hover:bg-green-700 mt-5 text-white cursor-pointer mx-2 min-w-[120px] h-12"
          >
            Save All
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-gray-700 hover:bg-gray-800 mt-5 text-white cursor-pointer min-w-[120px] h-12">
            Save
          </Button>
          <Button
            type="button"
            onClick={() => { setDialogOpen(true); }}
            className="bg-red-500 hover:bg-red-600 mt-5 text-white cursor-pointer ml-2 min-w-[120px] h-12"
          >
            Remove
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
      <DialogBox isOpen={DialogOpen} onClose={() => setDialogOpen(false)} selectedTestName={testName} />      <ToastContainer />
    </div>
  )
}

export default LibraryPrepration

const DialogBox = ({ isOpen, onClose, selectedTestName }) => {
  const dispatch = useDispatch();
  return (
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      style={{ backdropFilter: 'blur(5px)' }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Remove from Library Preparation?</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <span className="text-normal text-black dark:text-white">
            Do you want to remove the data of <span className="font-bold text-lg">{selectedTestName}</span> from Library Preparation? This action cannot be undone.
          </span>
        </DialogDescription>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              const storedData = JSON.parse(localStorage.getItem('libraryPreparationData')) || {};
              if (storedData && selectedTestName && storedData[selectedTestName]) {
                delete storedData[selectedTestName];
                localStorage.setItem('libraryPreparationData', JSON.stringify(storedData));
              }
              dispatch(setActiveTab("processing"));
              onClose();
            }}
            className="ml-2 bg-red-600 hover:bg-red-700 text-white"
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
