import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Cookies from 'js-cookie';
import Chart from 'chart.js/auto';
import React, { use, useRef, useEffect, useState, useMemo } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FaLongArrowAltDown } from "react-icons/fa";

// Example test options for dropdown
let testOptions = [];

const formSchema = z.object({
  per_run_seq: z.optional(z.string()),
  total_exp_seq: z.optional(z.string()),
  per_run_profit: z.optional(z.string()),
  per_flowcell_gb: z.optional(z.string()),
  total_number_of_runs: z.optional(z.string()),
  project_run_profit: z.optional(z.string()),
  per_gb_cost: z.optional(z.string()),
  total_lab_exp: z.optional(z.string()),
  total_gb_consumed: z.optional(z.string()),
  total_p_and_l: z.optional(z.string()),
});

function getShortTestName(name) {
  // Add your custom mappings here
  if (!name) return '';
  const map = {
    'Cardio Metabolic Syndrome (Screening)': 'CMS',
    'WES + Mito': 'WES + Mito',
    'Myeloid': 'Myeloid',
    'Cardio Comprehensive Myopathy': 'CMP',
    'HLA': 'HLA',
    'SGS': 'SGS',
    'CES': 'CES',
    'HCP': 'HCP',
    'WES': 'WES'
  };
  if (map[name]) return map[name];
  // Fallback: first 8 chars + "..." if too long
  return name.length > 10 ? name.slice(0, 8) + '…' : name;
}

const MangementDashboard = () => {
  const [user, setUser] = useState({});
  const [yearSelection, setYearSelection] = useState('current');
  // const [rows, setRows] = useState(() => {
  //   const allRows = JSON.parse(localStorage.getItem('trf_dashboard_rows') || '{}');
  //   return allRows['current'] || [];
  // });
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({
    testCode: '',
    testName: '',
    testCount: '',
    extraction: '',
    library: '',
    libraryQC: '',
    wetLabExpense: '',
    patientCost: '',
    patientBilling: '',
    gbSample: '',
    totalGb: '',
    cpt: '',
    cprt: '',
    perruncprt: ''
  });
  const [runData, setRunData] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const savedInputs = JSON.parse(localStorage.getItem('trf_dashboard_formInputs') || '{}');
  const [perRunSeq, setPerRunSeq] = useState(savedInputs.perRunSeq || '');
  const [perFlowcellGb, setPerFlowcellGb] = useState(savedInputs.perFlowcellGb || '');
  const [totalNoRun, setTotalNoRun] = useState(savedInputs.totalNoRun || '');
  const [perGbCost, setPerGbCost] = useState(savedInputs.perGbCost || '');
  const [totalGbConsumption, setTotalGbConsumption] = useState(savedInputs.totalGbConsumption || '');
  const [totalSeqExp, setTotalSeqExp] = useState(savedInputs.totalSeqExp || '');
  const [totalLabExpense, setTotalLabExpense] = useState(savedInputs.totalLabExpense || '');
  const [totalPandL, setTotalPandL] = useState(savedInputs.totalPandL || '');
  const [perRunProfit, setPerRunProfit] = useState(savedInputs.perRunProfit || '');
  const [filteredRunData, setFilteredRunData] = useState([]);
  const [testOptions, setTestOptions] = useState([]);
  const [monthSelection, setMonthSelection] = useState('');
  const [customExpenseDialogOpen, setCustomExpenseDialogOpen] = useState(false);
  const [customExpenses, setCustomExpenses] = useState([]);
  const [perRunCprt, setPerRunCprt] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [hoveredRun, setHoveredRun] = useState(null);
  const [flowcellInfoMap, setFlowcellInfoMap] = useState({}); // { "NextSeq_550|Mid Output": { gb, amount } }
  const [hideDropdownValue, setHideDropdownValue] = useState('');
  const [unhideDropdownValue, setUnhideDropdownValue] = useState('');
  const [hiddenTests, setHiddenTests] = useState([]);
  const cptChartRef = useRef(null);
  const cptChartInstance = useRef(null);
  const profitLossChartRef = useRef(null);
  const profitLossChartInstance = useRef(null);
  const testChartRef = useRef(null);
  const testChartInstance = useRef(null);
  const perRunCprtChartRef = useRef(null);
  const perRunCprtChartInstance = useRef(null);
  let currentYear = new Date().getFullYear();
  let previousYear = currentYear - 1;



  const testColorPalette = [
    '#6366f1', // blue
    '#f87171', // red
    '#34d399', // green
    '#fbbf24', // yellow
    '#f472b6', // pink
    '#22c55e', // emerald
    '#f59e42', // orange
    '#a78bfa', // purple
    '#10b981', // teal
    '#eab308', // gold
    '#3b82f6', // sky blue
    '#ef4444', // dark red
    '#8b5cf6', // violet
    '#14b8a6', // cyan
    '#e11d48', // rose
    '#facc15', // amber
    '#0ea5e9', // light blue
    '#7c3aed', // deep purple
    '#f97316', // deep orange
    '#84cc16', // lime
  ];

  const visibleRows = useMemo(() => {
    const visibleTestNames = new Set(
      filteredRunData.flatMap(run =>
        (run.table_data || []).map(test =>
          (testOptions.find(opt => opt.label === test.test_name)?.value || test.test_name)
        )
      )
    );
    return rows.filter(
      row =>
        visibleTestNames.has(row.testName) &&
        !hiddenTests.includes(row.testName)
    );
  }, [rows, filteredRunData, testOptions, hiddenTests]);

  const testCountByName = useMemo(() => {
    const map = {};
    filteredRunData.forEach(run => {
      (run.table_data || []).forEach(test => {
        const name = testOptions.find(opt => opt.label === test.test_name)?.value || test.test_name;
        map[name] = (map[name] || 0) + (Number(test.sample_count) || 0);
      });
    });
    return map;
  }, [filteredRunData, testOptions]);

  const visibleRowsWithMonthCounts = useMemo(() => {
    return visibleRows.map(row => ({
      ...row,
      testCount: testCountByName[row.testName] || 0
    }));
  }, [visibleRows, testCountByName]);

  // Prepare labels (test names)
  const cptLabels = visibleRowsWithMonthCounts.map(row => {
    const opt = testOptions.find(opt => opt.value === row.testName);
    const fullName = opt ? opt.label : row.testName;
    return getShortTestName(fullName);
  });

  async function fetchFlowcellData(instument_type, flowcell) {
    try {
      const res = await axios.get(`/api/instruments/flowcells?instument_type=${encodeURIComponent(instument_type)}&flowcell=${encodeURIComponent(flowcell)}`);
      const apiResponse = res.data.response?.[0];
      if (apiResponse && apiResponse.status === 200) {
        return apiResponse.data; // { gb: "40", amount: "242000" }
      }
    } catch (error) {
      console.error('Error fetching flowcell data:', error);
    }
    return null;
  }

  const uniqueTestNames = useMemo(() => {
    return [
      ...new Set(
        visibleRowsWithMonthCounts.map(row => row.testName)
      )
    ];
  }, [visibleRowsWithMonthCounts]);


  const testColorMap = useMemo(() => {
    const map = {};
    uniqueTestNames.forEach((name, idx) => {
      map[name] = testColorPalette[idx % testColorPalette.length];
    });
    return map;
  }, [uniqueTestNames]);

  useEffect(() => {
    async function fetchAllFlowcellInfo() {
      const pairs = Array.from(
        new Set(
          filteredRunData.map(run => `${run.instument_type}|${run.flowcell}`)
        )
      );
      const infoMap = {};
      for (const pair of pairs) {
        const [instument_type, flowcell] = pair.split('|');
        const data = await fetchFlowcellData(instument_type, flowcell);
        if (data) infoMap[pair] = data;
      }
      setFlowcellInfoMap(infoMap);
    }
    if (filteredRunData.length > 0) fetchAllFlowcellInfo();
  }, [filteredRunData]);

  const testLabels = useMemo(() => visibleRowsWithMonthCounts.map(row => {
    const opt = testOptions.find(opt => opt.value === row.testName);
    const fullName = opt ? opt.label : row.testName;
    return getShortTestName(fullName);
  }), [visibleRowsWithMonthCounts, testOptions]);

  const testValues = useMemo(() => visibleRowsWithMonthCounts.map(row => Number(row.testCount) || 0), [visibleRowsWithMonthCounts]);


  const cptValues = visibleRowsWithMonthCounts.map(row => Number(row.cpt) || 0);
  const cprtValues = visibleRowsWithMonthCounts.map(row => Number(row.cprt) || 0);

  const perRunCprtlabel = useMemo(
    () => perRunCprt && Object.keys(perRunCprt).length > 0 ? Object.keys(perRunCprt) : ['No Data'],
    [perRunCprt]
  );

  const perRunCprtValues = useMemo(
    () => perRunCprt && Object.keys(perRunCprt).length > 0 ? Object.values(perRunCprt).map(val => Number(val) || 0) : [0],
    [perRunCprt]
  );

  const cptDatasets = [
    {
      label: 'CPT',
      data: cptValues,
      backgroundColor: '#6366f1',
      borderRadius: 8,
      barPercentage: 0.7,
      categoryPercentage: 0.6,
    },
    {
      label: 'CPRT',
      data: cprtValues,
      backgroundColor: '#f87171',
      borderRadius: 8,
      barPercentage: 0.7,
      categoryPercentage: 0.6,
    },
    {
      label: 'Patient Cost',
      data: rows.map(row => Number(row.patientCost) || 0),
      backgroundColor: '#34d399',
      borderRadius: 8,
      barPercentage: 0.7,
      categoryPercentage: 0.6,
    }
  ];

  // Group CPRT by year and month
  const cprtByYearMonth = {};
  rows.forEach(row => {
    let run = filteredRunData.find(r =>
      (r.table_data || []).some(t => t.test_name === (testOptions.find(opt => opt.value === row.testName)?.label || row.testName))
    );
    let date = run ? new Date(run.seq_run_date) : null;
    if (!date || isNaN(date)) return;
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-based

    if (!cprtByYearMonth[year]) cprtByYearMonth[year] = Array(12).fill([]); // Array of 12 arrays
    if (!Array.isArray(cprtByYearMonth[year][month])) cprtByYearMonth[year][month] = [];
    cprtByYearMonth[year][month].push(Number(row.cprt) || 0);
  });

  // Save rows to localStorage whenever rows change
  // useEffect(() => {
  //   localStorage.setItem('trf_dashboard_rows', JSON.stringify(rows));
  // }, [rows]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      per_run_seq: '',
      total_exp_seq: '',
      per_run_profit: '',
      per_flowcell_gb: '',
      total_number_of_runs: '',
      project_run_profit: '',
      per_gb_cost: '',
      total_lab_exp: '',
      total_gb_consumed: '',
      total_p_and_l: ''
    }
  });

  const profitLossLabels = filteredRunData.map(run => run.run_id);

  const profitLossValues = filteredRunData.map(run => {
    // Calculate profit for each run
    let totalExpPerRun = 0;
    let totalMoneyIn = 0;
    const allCustomExpenseNames = Array.from(
      new Set(visibleRowsWithMonthCounts.flatMap(r => (r.customExpenses || []).map(exp => exp.name)))
    );
    (run.table_data || []).forEach(test => {
      const normalizedTestName = (test.test_name || '').toLowerCase().replace(/[\s_]+/g, '_').replace(/_+/g, '_').trim();
      const row = visibleRowsWithMonthCounts.find(r => (r.testName || '').toLowerCase().replace(/[\s_]+/g, '_').replace(/_+/g, '_').trim() === normalizedTestName);
      if (!row) return;
      const testCount = Number(test.sample_count) || 0;
      const perSampleGb = Number(row.gbSample) || 0;
      const lib = Number(row.library) || 0;
      const libQC = Number(row.libraryQC) || 0;
      const extr = Number(row.extraction) || 0;
      const customExpenses = row.customExpenses || [];
      let customExpenseSum = 0;
      allCustomExpenseNames.forEach(name => {
        const found = customExpenses.find(exp => exp.name === name);
        customExpenseSum += found ? Number(found.value) : 0;
      });
      // let perGb = 0;
      // if (run.instument_type === 'NextSeq_550' && run.flowcell === 'Mid Output') {
      //   perGb = 6050;
      // }
      // else if (run.instument_type === 'NextSeq_1000_2000' && run.flowcell === 'Mid Output') {
      //   perGb = 4033;
      // }

      const flowcellKey = `${run.instument_type}|${run.flowcell}`;
      const flowcellInfo = flowcellInfoMap[flowcellKey];
      const flowcellAmount = flowcellInfo ? Number(flowcellInfo.amount) : 0;
      const gb = flowcellInfo ? Number(flowcellInfo.gb) : 1; // avoid division by zero
      const perGb = gb ? flowcellAmount / gb : 0;

      const flowcellConsumption = testCount * perSampleGb * perGb;
      const wetLabExpense = (lib + libQC + extr + customExpenseSum) * testCount;
      const totalExp = flowcellConsumption + wetLabExpense;
      const patientCost = Number(row.patientCost) || 0;
      const moneyIn = patientCost * testCount;
      totalExpPerRun += totalExp;
      totalMoneyIn += moneyIn;
    });
    return totalMoneyIn - totalExpPerRun;
  });

  const handleNewRowChange = (eOrObj) => {
    if (eOrObj.target) {
      setNewRow({ ...newRow, [eOrObj.target.name]: eOrObj.target.value });
    } else {
      setNewRow({ ...newRow, ...eOrObj });
    }
  };

  function toSnakeCaseRow(row) {
    return {
      test_code: row.testCode,
      test_name: row.testName,
      test_count: row.testCount,
      extraction: row.extraction,
      library: row.library,
      library_qc: row.libraryQC,
      wet_lab_expense: row.wetLabExpense,
      patient_cost: row.patientCost,
      patient_billing: row.patientBilling,
      gb_sample: row.gbSample,
      total_gb: row.totalGb,
      // cpt: row.cpt,
      // cprt: row.cprt,
      custom_expenses: Array.isArray(row.customExpenses) ? row.customExpenses : [],
      hospital_name: row.hospital_name,
      email: row.email
    };
  }

  function toCamelCaseRow(row) {
    return {
      testCode: row.test_code,
      testName: row.test_name,
      testCount: row.test_count,
      extraction: row.extraction,
      library: row.library,
      libraryQC: row.library_qc,
      wetLabExpense: row.wet_lab_expense,
      patientCost: row.patient_cost,
      patientBilling: row.patient_billing,
      gbSample: row.gb_sample,
      totalGb: row.total_gb,
      // cpt: row.cpt,
      // cprt: row.cprt,
      customExpenses: Array.isArray(row.custom_expenses) ? row.custom_expenses : [],
      hospital_name: row.hospital_name,
      email: row.email,
      id: row.id,
      year: row.year,
      // add other fields if needed
    };
  }

  const handleDialogAddRow = async (newRow) => {
    const snakeRow = toSnakeCaseRow({
      ...newRow,
      hospital_name: user.hospital_name,
      email: user.email,
    });
    const year = getSelectedYear(yearSelection);
    await axios.post('/api/management-rows', {
      year,
      rows: snakeRow,
    });
    setRows([...rows, newRow]);
    setNewRow({
      testCode: '',
      testName: '',
      testCount: '',
      extraction: '',
      library: '',
      libraryQC: '',
      wetLabExpense: '',
      patientCost: '',
      patientBilling: '',
      gbSample: '',
      totalGb: '',
      cpt: '',
      cprt: '',
      perruncprt: ''
    });
    setAddDialogOpen(false);
  };

  // useEffect(() => {
  //   const allRows = JSON.parse(localStorage.getItem('trf_dashboard_rows') || '{}');
  //   allRows[yearSelection || 'current'] = rows;
  //   localStorage.setItem('trf_dashboard_rows', JSON.stringify(allRows));
  // }, [rows, yearSelection]);

  // Load rows when yearSelection changes
  // useEffect(() => {
  //   const allRows = JSON.parse(localStorage.getItem('trf_dashboard_rows') || '{}');
  //   setRows(allRows[yearSelection || 'current'] || []);
  //   setNewRow({
  //     testCode: '',
  //     testName: '',
  //     testCount: '',
  //     extraction: '',
  //     library: '',
  //     libraryQC: '',
  //     wetLabExpense: '',
  //     patientCost: '',
  //     patientBilling: '',
  //     gbSample: '',
  //     totalGb: '',
  //     cpt: '',
  //     cprt: ''
  //   });
  // }, [yearSelection]);

  function getSelectedYear(yearSelection) {
    const currentYear = new Date().getFullYear();
    if (yearSelection === 'previous') return (currentYear - 1).toString();
    return currentYear.toString();
  }

  useEffect(() => {
    async function fetchRows() {
      if (!user?.hospital_name) return;
      const year = getSelectedYear(yearSelection);
      try {
        const res = await axios.get('/api/management-rows', {
          params: {
            year,
            hospital_name: user.hospital_name,
          }
        });
        const apiResponse = res.data.response?.[0];
        if (apiResponse && apiResponse.status === 200) {
          // Map each row to camelCase
          let mappedRows = (apiResponse.data || []).map(toCamelCaseRow);

          // Calculate cpt and cprt for each row
          // You need perGbCost, totalSeqExp, totalTestCount from your state or recalculate here
          const perRunSeqNum = parseFloat(perRunSeq) || 0;
          // const perFlowcellGbNum = parseFloat(perFlowcellGb) || 0;
          const perFlowcellGbNum = 40;
          const totalNoRunNum = parseFloat(totalNoRun) || 0;
          const totalSeqExpCalc = totalNoRunNum * perRunSeqNum;
          const totalTestCount = mappedRows.reduce((sum, row) => sum + Number(row.testCount || 0), 0);
          const perGbCostCalc = perFlowcellGbNum ? perRunSeqNum / perFlowcellGbNum : 0;

          mappedRows = mappedRows.map(row => {
            const gbSample = Number(row.gbSample) || 0;
            const libraryQC = Number(row.libraryQC) || 0;
            const testCountForRow = Number(row.testCount) || 0;
            // CPT = libraryQC + (per_gb_cost * gbSample)
            const cpt = libraryQC + (perGbCostCalc * gbSample);
            // console.log('cpt from fetch:', cpt);
            // CPRT = libraryQC + (total_seq_exp / test_count_for_this_row)
            const cprt = totalTestCount ? libraryQC + (totalSeqExpCalc / totalTestCount) : libraryQC;
            // console.log('cprt from fetch:', cprt);
            return {
              ...row,
              cpt: cpt.toFixed(2),
              cprt: cprt.toFixed(2),
            };
          });

          setRows(mappedRows);
        } else {
          setRows([]);
        }
      } catch (error) {
        setRows([]);
      }
      setNewRow({
        testCode: '',
        testName: '',
        testCount: '',
        extraction: '',
        library: '',
        libraryQC: '',
        wetLabExpense: '',
        patientCost: '',
        patientBilling: '',
        gbSample: '',
        totalGb: '',
        cpt: '',
        cprt: '',
        perruncprt: ''
      });
    }
    fetchRows();
    // Add dependencies for perRunSeq, perFlowcellGb, totalNoRun if needed
  }, [yearSelection, user?.hospital_name, perRunSeq, perFlowcellGb, totalNoRun]);

  useEffect(() => {
    const cookieData = Cookies.get('vide_user');
    if (cookieData) {
      const fetchRunData = async () => {
        try {
          const parsedData = JSON.parse(cookieData);
          setUser(parsedData);
          const response = await axios.get(`/api/run-setup?role=${parsedData.role}&hospital_name=${parsedData.hospital_name}`);
          if (response.data[0].status === 200) {
            const data = response.data[0].data || [];
            setRunData(data);
          }
        } catch (error) {
          console.error('Error fetching pool data:', error);
        }
      };
      fetchRunData();
    }
  }, [user?.role]);


  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    let yearToShow = currentYear;
    if (yearSelection === 'previous') yearToShow = previousYear;

    // Filter by year
    let filtered = runData.filter(run =>
      new Date(run.seq_run_date).getFullYear() === yearToShow
    );

    // Filter by month if selected
    if (monthSelection) {
      const monthIndex = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ].indexOf(monthSelection);
      filtered = filtered.filter(run =>
        new Date(run.seq_run_date).getMonth() === monthIndex
      );
    }

    // --- The rest of your aggregation logic for testOptions etc. ---
    const testSamples = filtered.flatMap(run =>
      (run.table_data || []).map(table => ({
        test_name: table.test_name,
        sample_count: Number(table.sample_count) || 0
      }))
    );

    // Aggregate test counts by test_name
    const testCountMap = {};
    testSamples.forEach(({ test_name, sample_count }) => {
      if (!testCountMap[test_name]) testCountMap[test_name] = 0;
      testCountMap[test_name] += sample_count;
    });

    // Build testOptions array in the required format
    const testOptionsArr = Object.entries(testCountMap).map(([name, count]) => ({
      value: name.toLowerCase().replace(/\s+/g, '_'),
      label: name,
      test_count: count
    }));

    setTestOptions(testOptionsArr);
    setFilteredRunData(filtered);
    setTotalNoRun(filtered.length);
  }, [runData, yearSelection, monthSelection]);

  useEffect(() => {
    // const perRunSeqCost = 242000;//for nextseq 550 Mid Output
    // const perFlowcellGbNum = 40;//for nextseq 550 Mid Output

    const currentInstrumentType = filteredRunData[0]?.instument_type;
    const currentFlowcell = filteredRunData[0]?.flowcell;
    const flowcellKey = `${currentInstrumentType}|${currentFlowcell}`;
    const flowcellInfo = flowcellInfoMap[flowcellKey];
    const perRunSeqCost = flowcellInfo ? Number(flowcellInfo.amount) : 0;
    const perFlowcellGbNum = flowcellInfo ? Number(flowcellInfo.gb) : 1; // avoid division by zero

    const perGbSeqCost = perRunSeqCost / perFlowcellGbNum;//for nextseq 550 Mid Output
    setPerRunSeq(perRunSeqCost.toString());
    setPerFlowcellGb(perFlowcellGbNum.toString());
    setPerGbCost(perGbSeqCost.toFixed(2));
    const totalSamplesPerRun = {};
    filteredRunData.forEach(run => {
      const totalSamples = (run.table_data || []).reduce(
        (sum, test) => sum + (Number(test.sample_count) || 0),
        0
      );
      totalSamplesPerRun[run.run_id] = totalSamples;
    });
    const updatedRows = rows.map(row => {
      const gbPerSample = Number(row.gbSample) || 0;
      const totalNoRunNum = parseFloat(totalNoRun) || 0;
      const totalSeqExpCalc = totalNoRunNum * perRunSeqCost;
      const singleRunSeqCalc = perRunSeqCost;
      setTotalSeqExp(totalSeqExpCalc ? totalSeqExpCalc.toFixed(2) : '');
      const library = Number(row.library) || 0;
      const libraryQC = Number(row.libraryQC) || 0;
      const extraction = Number(row.extraction) || 0;
      const customExpenses = row.customExpenses || [];
      const perSampleExpense = library + libraryQC + extraction + customExpenses.reduce((sum, exp) => sum + Number(exp.value || 0), 0);

      // Find totalSampleInSingleRun for this test from filteredRunData
      const testLabel = testOptions.find(opt => opt.value === row.testName)?.label || row.testName;
      let totalSampleInSingleRun = 0;
      filteredRunData.forEach(run => {
        const totalSamplesInThisRun = totalSamplesPerRun[run.run_id]; // total samples in this run
        // You can now use totalSamplesInThisRun for per-run CPRT or other calculations
        // For example, if you want to calculate perRunCprt for this row in this run:
        // console.log('totalSamplesInThisRun,run_id', totalSamplesInThisRun,run.run_id);
        const perRunCprt = perSampleExpense + (singleRunSeqCalc / totalSamplesInThisRun);
        // console.log('perRunCprt:', perRunCprt);
      });

      const cpt = perSampleExpense + (perGbSeqCost * gbPerSample);
      const totalSampleCount = rows.reduce((sum, row) => sum + Number(row.testCount || 0), 0);
      const cprt = perSampleExpense + (totalSeqExpCalc / totalSampleCount);
      return {
        ...row,
        cprt: cprt.toFixed(2),
        cpt: cpt.toFixed(2),
        // perruncprt:perRunCprt.toFixed(2)
      };
    });
    setRows(updatedRows);

    // const perRunCprt = perSampleExpense + (singleRunSeqCalc/totalSampleCount);

  }, [perRunSeq, perFlowcellGb, totalNoRun, rows.length])

  useEffect(() => {
    const totalNoRunNum = parseFloat(totalNoRun) || 0;
    const runCprtMap = {}; // { run_id: cprt }

    filteredRunData.forEach(run => {
      // Flowcell expense for this run
      // let flowcellExpense = 0;
      // if (run.instument_type === 'NextSeq_550' && run.flowcell === 'Mid Output') {
      //   flowcellExpense = 242000;
      // } else if (run.instument_type === 'NextSeq_1000_2000' && run.flowcell === 'Mid Output') {
      //   flowcellExpense = 968000;
      // }

      const flowcellKey = `${run.instument_type}|${run.flowcell}`;
      const flowcellInfo = flowcellInfoMap[flowcellKey];
      const flowcellExpense = flowcellInfo ? Number(flowcellInfo.amount) : 0;

      // Total samples in this run
      const totalSamplesInRun = (run.table_data || []).reduce(
        (sum, test) => sum + (Number(test.sample_count) || 0),
        0
      );
      // Per sample expense (sum for all tests in this run)
      let totalPerSampleExpense = 0;
      (run.table_data || []).forEach(test => {
        const normalizedTestName = (test.test_name || '').toLowerCase().replace(/[\s_]+/g, '_').replace(/_+/g, '_').trim();
        const row = rows.find(r => (r.testName || '').toLowerCase().replace(/[\s_]+/g, '_').replace(/_+/g, '_').trim() === normalizedTestName);
        if (!row) return;
        const lib = Number(row.library) || 0;
        const libQC = Number(row.libraryQC) || 0;
        const extr = Number(row.extraction) || 0;
        const customExpenses = row.customExpenses || [];
        const perSampleExpense = lib + libQC + extr + customExpenses.reduce((sum, exp) => sum + Number(exp.value || 0), 0);
        totalPerSampleExpense += perSampleExpense * (Number(test.sample_count) || 0);
      });
      // Average per sample expense for this run
      const avgPerSampleExpense = totalSamplesInRun ? totalPerSampleExpense / totalSamplesInRun : 0;
      // CPRT for this run
      const cprt = avgPerSampleExpense + (flowcellExpense / (totalSamplesInRun || 1));
      runCprtMap[run.run_id] = cprt;
    });

    setPerRunCprt(runCprtMap);
    // Now you can use runCprtMap[run_id] in your graph

  }, [filteredRunData, rows]);

  useEffect(() => {
    const formInputs = {
      perRunSeq,
      perFlowcellGb,
      totalNoRun,
      perGbCost,
      totalGbConsumption,
      totalSeqExp,
      totalLabExpense,
      totalPandL,
      perRunProfit,
    };
    localStorage.setItem('trf_dashboard_formInputs', JSON.stringify(formInputs));
  }, [
    perRunSeq,
    perFlowcellGb,
    totalNoRun,
    perGbCost,
    totalGbConsumption,
    totalSeqExp,
    totalLabExpense,
    totalPandL,
    perRunProfit,
  ]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  function getChartTextColor() {
    return document.documentElement.classList.contains('dark') ? '#fff' : '#374151';
  }

  const axisColor = getChartTextColor();

  useEffect(() => {
    if (cptChartInstance.current) {
      cptChartInstance.current.destroy();
    }
    const hasData = rows.length > 0;
    cptChartInstance.current = new Chart(cptChartRef.current, {
      type: 'bar',
      data: hasData
        ? { labels: cptLabels, datasets: cptDatasets }
        : {
          labels: ['No Data'],
          datasets: [{
            label: 'No Data',
            data: [0],
            backgroundColor: axisColor,
            borderRadius: 8,
          }]
        },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            labels: { color: axisColor }
          },
          tooltip: {
            enabled: hasData,
            usePointStyle: true,
            callbacks: {
              labelPointStyle: () => ({
                pointStyle: 'circle'
              })
            }
          },
          datalabels: {
            display: hasData,
            color: axisColor,
            font: { weight: 'bold', size: 14 },
            anchor: 'end',
            align: 'end',
            formatter: value => value ? value.toLocaleString() : '',
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Test Name', color: axisColor },
            ticks: {
              font: { size: 14, weight: 'bold' },
              color: axisColor,
              maxRotation: 0,
              minRotation: 0,
              autoSkip: false
            },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Value', color: axisColor },
            ticks: { font: { size: 14, weight: 'bold' }, color: axisColor },
            grid: {
              color: axisColor === '#fff' ? '#444' : '#e5e7eb',
              borderDash: [4, 4],
              drawTicks: false,
              drawBorder: false,
            },
          },
        },
      },
    });
    return () => {
      if (cptChartInstance.current) cptChartInstance.current.destroy();
    };
  }, [JSON.stringify(cptDatasets), rows.length, JSON.stringify(testOptions), isDarkMode]);

  useEffect(() => {
    if (profitLossChartInstance.current) {
      profitLossChartInstance.current.destroy();
    }
    const hasData = profitLossValues.length > 0 && profitLossValues.some(v => v !== 0);
    const barColors = hasData ? profitLossValues.map(v => v >= 0 ? '#22c55e' : '#ef4444') : [axisColor];
    profitLossChartInstance.current = new Chart(profitLossChartRef.current, {
      type: 'bar',
      data: hasData
        ? {
          labels: profitLossLabels,
          datasets: [{
            label: 'Profit/Loss',
            data: profitLossValues,
            backgroundColor: barColors,
            borderRadius: 8,
          }]
        }
        : {
          labels: ['No Data'],
          datasets: [{
            label: 'No Data',
            data: [0],
            backgroundColor: axisColor,
            borderRadius: 8,
          }]
        },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: !hasData ? true : false },
          tooltip: {
            enabled: hasData,
            usePointStyle: true,
            callbacks: {
              labelPointStyle: () => ({
                pointStyle: 'circle'
              })
            }
          },
          datalabels: {
            display: hasData,
            color: axisColor,
            font: { weight: 'bold', size: 12 },
            formatter: value => hasData ? `₹${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '',
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: axisColor }
          },
          y: {
            grid: { display: true },
            ticks: { color: axisColor }
          }
        },
        onHover: (event, elements, chart) => {
          if (elements && elements.length > 0) {
            const idx = elements[0].index;
            const run = filteredRunData[idx];
            if (run) {
              // Get the canvas position
              const canvasRect = chart.canvas.getBoundingClientRect();
              // Get the bar element's center position
              const bar = chart.getDatasetMeta(0).data[idx];
              let barX = canvasRect.left;
              let barY = canvasRect.top;
              if (bar) {
                barX += bar.x;
                barY += bar.y;
              }
              setHoveredRun({
                run,
                position: {
                  x: Math.round(barX + 20), // offset to the right
                  y: Math.round(barY - 40)  // offset above
                }
              });
            }
          } else {
            setHoveredRun(null);
          }
        }
      }
    });
    return () => {
      if (profitLossChartInstance.current) profitLossChartInstance.current.destroy();
    };
  }, [JSON.stringify(profitLossValues), JSON.stringify(profitLossLabels), filteredRunData, isDarkMode]);

  useEffect(() => {

    if (testChartInstance.current) {
      testChartInstance.current.destroy();
    }
    const hasData = testValues.length > 0;
    testChartInstance.current = new Chart(testChartRef.current, {
      type: 'bar',
      data: hasData
        ? {
          labels: [...testLabels],
          datasets: [{
            label: 'Total Tests',
            data: [...testValues],
            backgroundColor: visibleRowsWithMonthCounts.map(row => testColorMap[row.testName] || '#6366f1'),
            borderRadius: 8,
          }]
        }
        : {
          labels: ['No Data'],
          datasets: [{
            label: 'No Data',
            data: [0],
            backgroundColor: axisColor,
            borderRadius: 8,
          }]
        },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
            position: 'right',
            labels: { color: axisColor }
          },
          tooltip: {
            enabled: hasData,
            usePointStyle: true,
            callbacks: {
              label: function (context) {
                // context.dataIndex gives the bar index
                const row = rows[context.dataIndex];
                const testCode = row?.testCode || '';
                const value = context.parsed.y ?? context.parsed;
                // Show: Test Code: value
                return testCode
                  ? `Test Code: ${testCode} | Value: ${value.toLocaleString()}`
                  : `Value: ${value.toLocaleString()}`;
              },
              labelPointStyle: () => ({
                pointStyle: 'circle'
              })
            }
          },
          datalabels: {
            display: hasData,
            color: axisColor,
            font: { weight: 'bold', size: 14 },
            anchor: 'end',
            align: 'end',
            formatter: value => value ? value.toLocaleString() : '',
          }
        },
        scales: {
          x: {
            title: { display: true, text: 'Test Name', color: axisColor },
            ticks: {
              font: { size: 14, weight: 'bold' },
              color: axisColor,
              maxRotation: 0,
              minRotation: 0,
              autoSkip: false
            },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Total Tests', color: axisColor },
            ticks: { font: { size: 14, weight: 'bold' }, color: axisColor },
            grid: {
              color: axisColor === '#fff' ? '#444' : '#e5e7eb',
              borderDash: [4, 4],
              drawTicks: false,
              drawBorder: false,
            },
          },
        },
      },
    });
    return () => {
      if (testChartInstance.current) testChartInstance.current.destroy();
    };
  }, [testLabels, testValues, axisColor, isDarkMode]);


  const profitRuns = filteredRunData.map(run => {
    // ...calculate profit for this run (same as before)...
    let totalExpPerRun = 0;
    let totalMoneyIn = 0;
    const allCustomExpenseNames = Array.from(
      new Set(visibleRowsWithMonthCounts.flatMap(r => (r.customExpenses || []).map(exp => exp.name)))
    );
    (run.table_data || []).forEach(test => {
      const normalizedTestName = normalizeName(test.test_name);
      const row = visibleRowsWithMonthCounts.find(r => normalizeName(r.testName) === normalizedTestName);
      if (!row) return;
      const testCount = Number(test.sample_count) || 0;
      const perSampleGb = Number(row.gbSample) || 0;
      const lib = Number(row.library) || 0;
      const libQC = Number(row.libraryQC) || 0;
      const extr = Number(row.extraction) || 0;
      const customExpenses = row.customExpenses || [];
      let customExpenseSum = 0;
      allCustomExpenseNames.forEach(name => {
        const found = customExpenses.find(exp => exp.name === name);
        customExpenseSum += found ? Number(found.value) : 0;
      });

      const flowcellKey = `${run.instument_type}|${run.flowcell}`;
      const flowcellInfo = flowcellInfoMap[flowcellKey];
      const flowcellExpense = flowcellInfo ? Number(flowcellInfo.amount) : 0;
      const gb = flowcellInfo ? Number(flowcellInfo.gb) : 1; // avoid division by zero
      const perGb = gb ? flowcellExpense / gb : 0;
      // let perGb = 0;
      // if (run.instument_type === 'NextSeq_550' && run.flowcell === 'Mid Output') {
      //   perGb = 6050;
      // }
      // else if (run.instument_type === 'NextSeq_1000_2000' && run.flowcell === 'Mid Output') {
      //   perGb = 4033;
      // }

      const flowcellConsumption = testCount * perSampleGb * perGb;
      const wetLabExpense = (lib + libQC + extr + customExpenseSum) * testCount;
      const totalExp = flowcellConsumption + wetLabExpense;
      const patientCost = Number(row.patientCost) || 0;
      const moneyIn = patientCost * testCount;
      totalExpPerRun += totalExp;
      totalMoneyIn += moneyIn;
    });
    const profit = totalMoneyIn - totalExpPerRun;
    return { run, profit };
  }).filter(r => r.profit !== 0); // Only keep runs with non-zero profit

  const bestRun = profitRuns.length > 0
    ? profitRuns.reduce((best, curr) => (best === null || curr.profit > best.profit ? curr : best), null)
    : null;

  const totalProfit = profitLossValues.reduce((sum, v) => sum + v, 0);
  const avgProfit = filteredRunData.length > 0 ? totalProfit / filteredRunData.length : 0;


  const CARD_HEIGHT = 420;
  const CHART_SIZE = 340;

  return (
    <div className='p-4'>
      <div className='flex justify-between gap-2 mb-4 p-2 max-w-xs'>
        <select
          value={yearSelection}
          onChange={(e) => setYearSelection(e.target.value)}
          className='p-2 border-2 rounded-lg border-orange-200 max-w-xl dark:bg-gray-900 dark:text-white'>
          <option value='current'>Current Financial Year</option>
          <option value='previous'>Previous Financial Year</option>
        </select>

        <select
          value={monthSelection}
          onChange={e => setMonthSelection(e.target.value)}
          className='p-2 border-2 rounded-lg border-orange-200 max-w-xl dark:bg-gray-900 dark:text-white'
        >
          <option value=''>Select Month</option>
          <option value='january'>January</option>
          <option value='february'>February</option>
          <option value='march'>March</option>
          <option value='april'>April</option>
          <option value='may'>May</option>
          <option value='june'>June</option>
          <option value='july'>July</option>
          <option value='august'>August</option>
          <option value='september'>September</option>
          <option value='october'>October</option>
          <option value='november'>November</option>
          <option value='december'>December</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 w-full">
        <div className={`flex-1 rounded-2xl px-8 py-6 shadow-sm border ${avgProfit < 0 ? 'border-red-200 bg-red-50' : 'border-green-100 bg-green-50'}`}>
          <div className={`text-base font-semibold ${avgProfit < 0 ? 'text-red-800' : 'text-green-800'} mb-1`}>
            {avgProfit < 0 ? 'Average Run Loss' : 'Average Run Profit'}
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">
            <CountUpNumber value={avgProfit} prefix="₹" decimals={2} />
          </div>
        </div>

        <div className={`flex-1 rounded-2xl px-8 py-6 shadow-sm border ${totalProfit < 0 ? 'border-red-200 bg-red-50' : 'border-green-100 bg-green-50'}`}>
          <div className={`text-base font-semibold ${totalProfit < 0 ? 'text-red-800' : 'text-green-800'} mb-1`}>
            {totalProfit < 0 ? 'Total Loss' : 'Total Profit'}
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">
            <CountUpNumber value={totalProfit} prefix="₹" decimals={2} />
          </div>
        </div>

        <div className="flex-1 rounded-2xl px-8 py-6 shadow-sm border border-blue-100 bg-blue-50">
          <div className="text-base font-semibold text-blue-700 mb-1">
            Total Runs
          </div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">
            <CountUpNumber value={totalNoRun} decimals={0} />
          </div>
        </div>

        {bestRun && bestRun.run && (
          <div className="flex-1 rounded-2xl px-8 py-6 shadow-sm border border-yellow-200 bg-yellow-50">
            <div className="text-base font-semibold text-yellow-700 mb-1">
              Best Run Profit <span className="font-normal text-yellow-700">(Run ID: {bestRun.run.run_id})</span>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">
              <CountUpNumber value={bestRun.profit} prefix="₹" decimals={2} />
            </div>
          </div>
        )}
      </div>


      <div className="py-4">
        {/* Top row: 3 charts */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6"> */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6 w-full">

          {/* Test Count Bar Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg flex flex-col items-center justify-center p-4 relative"
          >
            {/* Chart Title and Add Button */}
            <div className="w-full flex justify-between items-center mb-2">
              <div className="text-lg font-bold text-gray-800 dark:text-white">Test Count Overview</div>
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm shadow"
                onClick={() => {
                  setNewRow({
                    testCode: '',
                    testName: '',
                    testCount: '',
                    extraction: '',
                    library: '',
                    libraryQC: '',
                    wetLabExpense: '',
                    patientCost: '',
                    patientBilling: '',
                    gbSample: '',
                    totalGb: '',
                    cpt: '',
                    cprt: '',
                    perruncprt: ''
                  });
                  setAddDialogOpen(true);
                }}
                title="Add Test"
              >
                Add Test
              </button>
            </div>
            {/* Test Chips */}
            <div className="w-full flex flex-wrap gap-2 mb-2">
              {visibleRows.length > 0 && (
                <div className="w-full flex items-center gap-2 mb-2">
                  <span className="font-semibold text-gray-700">Visible:</span>
                  <select
                    className="border rounded px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 dark:text-white"
                    value={hideDropdownValue}
                    onChange={e => {
                      const testToHide = e.target.value;
                      if (testToHide) {
                        setHiddenTests([...hiddenTests, testToHide]);
                        setHideDropdownValue(''); // reset dropdown
                      }
                    }}
                  >
                    <option value="" disabled>
                      Hide test...
                    </option>
                    {visibleRows.map(row => {
                      const label = testOptions.find(opt => opt.value === row.testName)?.label || row.testName;
                      return (
                        <option key={row.testName} value={row.testName}>
                          {getShortTestName(label)}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>
            {/* Hidden Chips */}
            {hiddenTests.length > 0 && (
              <div className="w-full flex items-center gap-2 mb-2">
                <span className="font-semibold text-gray-500">Hidden:</span>
                <select
                  className="border rounded px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 dark:text-white"
                  value={unhideDropdownValue}
                  onChange={e => {
                    const testToUnhide = e.target.value;
                    if (testToUnhide) {
                      setHiddenTests(hiddenTests.filter(t => t !== testToUnhide));
                      setUnhideDropdownValue(''); // reset dropdown
                    }
                  }}
                >
                  <option value="" disabled>
                    Unhide test...
                  </option>
                  {hiddenTests.map(test => {
                    const label = testOptions.find(opt => opt.value === test)?.label || test;
                    return (
                      <option key={test} value={test}>
                        {getShortTestName(label)}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            {/* Chart */}
            <div className="w-full overflow-x-auto">
              <div className="w-full flex-1 flex items-center justify-center">
                <canvas
                  ref={testChartRef}
                  style={{ width: '100%', height: CARD_HEIGHT - 40, maxHeight: 340 }}
                  width={undefined}
                  height={CARD_HEIGHT - 40}
                />
              </div>
            </div>
          </div>
          {/* Profit/Loss Bar Chart */}
          <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded-2xl shadow-md flex items-center justify-center"
          >
            <div className="w-full overflow-x-auto">
              <div style={{ minWidth: Math.max(900, profitLossLabels.length * 60) }}>
                <canvas ref={profitLossChartRef} width={Math.max(900, profitLossLabels.length * 60)} height={CARD_HEIGHT - 40} />
              </div>
            </div>
          </div>
          {/* Expense Pie Chart */}
          <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded-2xl shadow-md w-full overflow-x-auto flex items-center justify-start">
            <div style={{ width: 700, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <AllRunsExpensePieChart
                runs={filteredRunData}
                rows={rows}
                chartSize={CHART_SIZE}
                flowcellInfoMap={flowcellInfoMap}
              />
            </div>
          </div>
        </div>
        {/* Bottom row: 2 charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Best Run Analysis */}
          <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded-2xl shadow-md w-full overflow-x-auto flex items-center justify-start"
            style={{ height: CARD_HEIGHT, minHeight: CARD_HEIGHT }}>
            <div style={{ width: 700, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              <BestRunBreakdown
                run={bestRun?.run}
                rows={rows}
                chartSize={CHART_SIZE}
                testColorMap={testColorMap}
              />
            </div>
          </div>
          {/* Revenue Analysis by Test Category (CPT/CPRT Bar Chart) */}
          <div className="bg-white dark:bg-gray-900 border-2 border-black dark:border-white rounded-2xl shadow-md flex items-center justify-center"
            style={{ height: CARD_HEIGHT, minHeight: CARD_HEIGHT }}>
            <canvas ref={cptChartRef} height={CARD_HEIGHT - 40} />
          </div>
        </div>
      </div>

      {/* Pass new props to AddRowDialog: */}
      <AddRowDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleDialogAddRow}
        newRow={newRow}
        onChange={handleNewRowChange}
        rows={rows}
        perFlowcellGb={perFlowcellGb}
        perRunSeq={perRunSeq}
        totalNoRun={totalNoRun}
        testOptions={testOptions}
        customExpenses={customExpenses}
        setCustomExpenseDialogOpen={setCustomExpenseDialogOpen}
      />

      {/* Update CustomExpenseDialog props: */}
      <CustomExpenseDialog
        open={customExpenseDialogOpen}
        onOpenChange={setCustomExpenseDialogOpen}
        customExpenses={customExpenses}
        setCustomExpenses={setCustomExpenses}
      />
      {hoveredRun && (
        <FloatingPieChart
          run={hoveredRun.run}
          rows={rows}
          position={hoveredRun.position}
          floating
          testColorMap={testColorMap}
        />)}
    </div>
  )
}

export default MangementDashboard

// Dialog component for adding a row
function AddRowDialog({
  open,
  onOpenChange,
  onAdd,
  newRow,
  onChange,
  rows,
  perFlowcellGb,
  perRunSeq,
  totalNoRun,
  testOptions,
  customExpenses,
  setCustomExpenseDialogOpen
}) {
  const usedTestNames = rows.map(row => row.testName);
  const availableTestOptions = testOptions.filter(opt => !usedTestNames.includes(opt.value));
  const extraction = Number(newRow.extraction) || 0;
  const library = Number(newRow.library) || 0;
  const libraryQC = Number(newRow.libraryQC) || 0;
  const testCount = Number(newRow.testCount) || 0;
  const patientCost = Number(newRow.patientCost) || 0;
  const gbSample = Number(newRow.gbSample) || 0;
  // const customExpenseValue = Number(customExpense.value) || 0;
  const customExpenseTotal = customExpenses.reduce((sum, exp) => sum + (Number(exp.value) || 0), 0);
  // const wetLabExpense = extraction + library + libraryQC + customExpenseValue;


  // Simulate future rows
  const futureRow = {
    ...newRow,
    wetLabExpense: (extraction + library + libraryQC + customExpenseTotal),
    patientBilling: testCount * patientCost,
  };
  const futureRows = [...rows, futureRow];

  const wetLabExpenseSum = futureRows.reduce((sum, row) => sum + Number(row.wetLabExpense || 0), 0);
  const totalSeqExpCalc = Number(perRunSeq) * Number(totalNoRun);
  const totalLabExpenseCalc = wetLabExpenseSum + totalSeqExpCalc;
  const patientBillingSum = futureRows.reduce((sum, row) => sum + Number(row.patientBilling || 0), 0);
  const totalPandLCalc = patientBillingSum - totalLabExpenseCalc;
  const totalTestCount = futureRows.reduce((sum, row) => sum + Number(row.testCount || 0), 0);

  const perRunSeqNum = Number(perRunSeq) || 0;
  const perFlowcellGbNum = Number(perFlowcellGb) || 0;
  const totalNoRunNum = Number(totalNoRun) || 0;
  const perGbCostCalc = perFlowcellGbNum ? perRunSeqNum / perFlowcellGbNum : 0;

  // const totalSeqExpCalc = totalNoRunNum * perRunSeqNum;

  const wetLabExpense = extraction + library + libraryQC + customExpenseTotal;
  const patientBilling = testCount * patientCost;
  const totalGb = testCount * gbSample;
  // CPT = libraryQC + (per_gb_cost * gbSample)
  const cpt = libraryQC + (perGbCostCalc * gbSample);
  // CPRT = libraryQC + (total_seq_exp / test_count)
  const cprt = totalTestCount ? libraryQC + (totalSeqExpCalc / totalTestCount) : libraryQC;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Test</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            onAdd({
              ...newRow,
              customExpenses: customExpenses,
              wetLabExpense: wetLabExpense.toFixed(2),
              patientBilling: patientBilling.toFixed(2),
              totalGb: totalGb.toFixed(2),
              cpt: cpt.toFixed(2),
              cprt: cprt.toFixed(2),
            });
          }}
          className="grid grid-cols-2 gap-4 mt-2"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Test Code</label>
            <input name="testCode" value={newRow.testCode} onChange={onChange} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Test Name & Description</label>
            <select
              name="testName"
              value={newRow.testName}
              onChange={e => {
                const selected = availableTestOptions.find(opt => opt.value === e.target.value);
                onChange({
                  testName: e.target.value,
                  testCount: selected ? String(selected.test_count) : ''
                });
              }}
              className="border p-2 rounded w-full dark:bg-black dark:text-white "
            >
              <option value="">Select Test</option>
              {availableTestOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Extraction</label>
            <input name="extraction" value={newRow.extraction} onChange={onChange} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Library</label>
            <input name="library" value={newRow.library} onChange={onChange} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Library QC</label>
            <input name="libraryQC" value={newRow.libraryQC} onChange={onChange} className="border p-2 rounded w-full" />
          </div>
          {/* Custom Expenses: Place each in its own grid cell after Library QC */}
          {customExpenses.map((exp, idx) => (
            <div key={idx}>
              <label className="block text-sm font-medium mb-1">{exp.name}</label>
              <input
                value={Number(exp.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                readOnly
                className="border p-2 rounded w-full bg-gray-100"
              />
            </div>
          ))}
          {/* Calculated: Wet Lab Expense */}
          <div>
            <label className="block text-sm font-medium mb-1 ">Wet Lab Expense</label>
            <input value={wetLabExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} readOnly className="border p-2 rounded w-full " />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Patient Cost</label>
            <input name="patientCost" value={newRow.patientCost} onChange={onChange} className="border p-2 rounded w-full" />
          </div>
          {/* Calculated: Patient Billing */}
          {/* <div>
            <label className="block text-sm font-medium mb-1">Patient Billing</label>
            <input value={patientBilling.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} readOnly className="border p-2 rounded w-full" />
          </div> */}
          <div>
            <label className="block text-sm font-medium mb-1">GB/Sample</label>
            <input name="gbSample" value={newRow.gbSample} onChange={onChange} className="border p-2 rounded w-full" />
          </div>
          {/* Calculated: Total GB */}
          {/* <div>
            <label className="block text-sm font-medium mb-1">Total GB</label>
            <input value={totalGb.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} readOnly className="border p-2 rounded w-full " />
          </div> */}
          <div className="col-span-2 flex justify-between items-center mt-4">
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
              onClick={() => setCustomExpenseDialogOpen(true)}
            >
              Add Expense
            </button>
            <button type="submit" className="bg-orange-500 text-white px-6 py-2 cursor-pointer rounded hover:bg-orange-600">
              Add Row
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CustomExpenseDialog({ open, onOpenChange, customExpenses, setCustomExpenses }) {
  const [expense, setExpense] = useState({ name: '', value: '' });

  useEffect(() => {
    if (!open) setExpense({ name: '', value: '' });
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Misc. Expense</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            if (expense.name && expense.value) {
              setCustomExpenses(prev => [...prev, expense]);
              setExpense({ name: '', value: '' });
              onOpenChange(false); // Close dialog after adding
            }
          }}
          className="grid gap-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Expense Name</label>
            <input
              value={expense.name}
              onChange={e => setExpense(exp => ({ ...exp, name: e.target.value }))}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Expense Value</label>
            <input
              type="number"
              value={expense.value}
              onChange={e => setExpense(exp => ({ ...exp, value: e.target.value }))}
              className="border p-2 rounded w-full"
              required
            />
          </div>
          <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600">
            Add
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function normalizeName(str) {
  return (str || '')
    .toLowerCase()
    .replace(/[\s_]+/g, '_')
    .replace(/_+/g, '_')
    .trim();
}

function PerRunExpenseLine({ run, rows, setHoveredRun }) {
  // --- Collect all unique custom expense names ---
  const allCustomExpenseNames = Array.from(
    new Set(rows.flatMap(r => (r.customExpenses || []).map(exp => exp.name)))
  );
  const normalize = str => (str || '').toLowerCase().replace(/[\s_]+/g, '_').replace(/_+/g, '_').trim();

  // --- Calculate total expense and money in using getRunSummaryTable logic ---
  let totalExpPerRun = 0;
  let totalMoneyIn = 0;

  (run.table_data || []).forEach(test => {
    const normalizedTestName = normalize(test.test_name);
    const row = rows.find(r => normalize(r.testName) === normalizedTestName);
    if (!row) return;

    const testCount = Number(test.sample_count) || 0;
    const perSampleGb = Number(row.gbSample) || 0;
    const lib = Number(row.library) || 0;
    const libQC = Number(row.libraryQC) || 0;
    const extr = Number(row.extraction) || 0;
    const customExpenses = row.customExpenses || [];
    let customExpenseSum = 0;
    allCustomExpenseNames.forEach(name => {
      const found = customExpenses.find(exp => exp.name === name);
      customExpenseSum += found ? Number(found.value) : 0;
    });

    // Flowcell calculation (same as getRunSummaryTable)
    let perGb = 0;
    if (run.instument_type === 'NextSeq_550' && run.flowcell === 'Mid Output') {
      perGb = 6050;
    }
    else if (run.instument_type === 'NextSeq_1000_2000' && run.flowcell === 'Mid Output') {
      perGb = 4033;
    }
    const flowcellConsumption = testCount * perSampleGb * perGb;
    const wetLabExpense = (lib + libQC + extr + customExpenseSum) * testCount;
    const totalExp = flowcellConsumption + wetLabExpense;
    const patientCost = Number(row.patientCost) || 0;
    const moneyIn = patientCost * testCount;

    totalExpPerRun += totalExp;
    totalMoneyIn += moneyIn;
  });

  const profit = totalMoneyIn - totalExpPerRun;

  // --- Visualization ---
  const maxBarWidth = 1;
  const maxValue = Math.max(totalExpPerRun, totalMoneyIn, 1);
  const expensePercent = (totalExpPerRun / maxValue) * 100;
  const profitPercent = ((profit + totalExpPerRun) / maxValue) * 100;
  const moneyInPercent = (totalMoneyIn / maxValue) * 100;

  // Cap label positions to avoid overflow
  const cap = percent => Math.min(percent, 90);

  return (
    <div className="flex items-center my-2 w-full overflow-x-hidden">
      <span className="w-24 text-sm text-gray-700 dark:text-gray-200 truncate">{run.run_id}</span>
      <div className="relative h-8 flex-1 mx-2 min-w-0 w-full overflow-x-hidden">
        {/* Expense line */}
        <div
          style={{
            width: `${expensePercent}%`,
            height: '30px',
            background: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: '6px',
            position: 'absolute',
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
            cursor: 'pointer'
          }}
          onMouseEnter={e => {
            const rect = e.target.getBoundingClientRect();
            setHoveredRun({
              run,
              position: { x: rect.right + 16, y: rect.top }
            });
          }}
          onMouseLeave={() => setHoveredRun(null)}
        />
        {/* Profit marker */}
        <div
          style={{
            position: 'absolute',
            left: `${cap(moneyInPercent)}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 2,
            color: '#22c55e',
            fontSize: '2rem',
            background: 'transparent',
            pointerEvents: 'none'
          }}
          title={`Money In: ₹${totalMoneyIn.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        >
          <FaLongArrowAltDown />
        </div>
        {/* Expense value label */}
        <span
          style={{
            position: 'absolute',
            left: `calc(${cap(expensePercent)}% + 8px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '13px',
            color: '#b91c1c',
            whiteSpace: 'nowrap',
            maxWidth: '40%',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          ₹{totalExpPerRun.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
        {/* Profit value label */}
        <span
          style={{
            position: 'absolute',
            left: `calc(${cap(profitPercent)}% - 66px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '13px',
            color: '#22c55e',
            whiteSpace: 'nowrap',
            maxWidth: '40%',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          ₹{profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}

function FloatingPieChart({ run, rows, position, title, testColorMap, floating = false }) {
  const chartRef = useRef(null);
  useEffect(() => {
    if (!run) return;
    const testCounts = (run.table_data || []).map(test => ({
      label: getShortTestName(test.test_name),
      rawName: test.test_name,
      value: Number(test.sample_count) || 0,
    }));

    if (chartRef.current) {
      if (chartRef.current.chart) chartRef.current.chart.destroy();
      chartRef.current.chart = new Chart(chartRef.current, {
        type: 'pie',
        data: {
          labels: testCounts.map(t => t.label),
          datasets: [{
            data: testCounts.map(t => t.value),
            backgroundColor: testCounts.map(t =>
              testColorMap && testColorMap[normalizeName(t.rawName)]
                ? testColorMap[normalizeName(t.rawName)]
                : '#6366f1'
            ),
            borderWidth: 0,
          }]
        },
        options: {
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: {
                font: { size: 12, weight: floating ? 'normal' : 'bold' },
                color: floating ? 'black' : 'white'
              }
            },
            datalabels: {
              color: floating ? 'black' : 'white',
              font: { weight: floating ? 'normal' : 'bold', size: floating ? 10 : 14 }
            }
          }
        }
      });
    }
    return () => {
      if (chartRef.current && chartRef.current.chart) chartRef.current.chart.destroy();
    };
  }, [run, testColorMap]);

  if (!run) return null;
  return (
    <div
      style={
        floating
          ? {
            position: 'fixed',
            left: position?.x ?? 0,
            top: position?.y ?? 0,
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            padding: 12,
            width: 220,
            height: 220,
            pointerEvents: 'none'
          }
          : {
            background: '#8080cf',
            border: '1px solid #ddd',
            borderRadius: 8,
            color: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: 12,
            width: 340,
            height: 340,
            margin: '0 auto'
          }
      }
    >
      <canvas ref={chartRef} width={200} height={200} />
    </div>
  );
}

// function BestRunBreakdown({ run, rows, chartSize = 340, testColorMap }) {
//   const chartRef = useRef(null);
//   const isDarkMode = document.documentElement.classList.contains('dark');
//   useEffect(() => {
//     if (chartRef.current && chartRef.current._chart) chartRef.current._chart.destroy();

//     let testCounts = [];
//     if (run) {
//       const testMap = {};
//       (run.table_data || []).forEach(test => {
//         const label = test.test_name?.trim();
//         const value = Number(test.sample_count) || 0;
//         if (label in testMap) {
//           testMap[label] += value;
//         } else {
//           testMap[label] = value;
//         }
//       });
//       testCounts = Object.entries(testMap).map(([label, value]) => ({
//         label: getShortTestName(label),
//         rawName: label,
//         value
//       }));
//     }

//     const data = testCounts.map(t => t.value);
//     const labels = testCounts.map(t => t.label);
//     const colors = testCounts.map(t =>
//       testColorMap && testColorMap[t.rawName]
//         ? testColorMap[t.rawName]
//         : '#6366f1'
//     );
//     const hasData = data.length > 0 && data.some(v => v !== 0);

//     // Center text plugin
//     const centerTextPlugin = {
//       id: 'centerText',
//       afterDraw: chart => {
//         const { ctx, chartArea } = chart;
//         ctx.save();
//         ctx.font = 'bold 2.2rem sans-serif';
//         ctx.textAlign = 'center';
//         ctx.textBaseline = 'middle';
//         ctx.fillStyle = isDarkMode ? '#fff' : '#22223b';
//         if (hasData && run) {
//           ctx.fillText('Best Run', chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2 - 16);
//           ctx.font = 'bold 2rem sans-serif';
//           ctx.fillText(run.run_id, chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2 + 16);
//         } else {
//           ctx.fillText('No Data', chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2);
//         }
//         ctx.restore();
//       }
//     };

//     chartRef.current._chart = new Chart(chartRef.current, {
//       type: 'doughnut',
//       data: hasData
//         ? {
//           labels,
//           datasets: [{
//             data,
//             backgroundColor: colors,
//             borderWidth: 0,
//           }]
//         }
//         : {
//           labels: ['No Data'],
//           datasets: [{
//             data: [1],
//             backgroundColor: [isDarkMode ? '#444' : '#e5e7eb'],
//             borderWidth: 0,
//           }]
//         },
//       options: {
//         cutout: '70%',
//         plugins: {
//           legend: { display: false, labels: { color: isDarkMode ? '#fff' : '#22223b' } },
//           tooltip: { enabled: hasData },
//           datalabels: { display: false }
//         }
//       },
//       plugins: [centerTextPlugin]
//     });

//     return () => {
//       if (chartRef.current && chartRef.current._chart) chartRef.current._chart.destroy();
//     };
//   }, [run, rows, isDarkMode, testColorMap]);

//   // Only show legend if there is data
//   let testCounts = [];
//   if (run) {
//     const testMap = {};
//     (run.table_data || []).forEach(test => {
//       const label = test.test_name?.trim();
//       const value = Number(test.sample_count) || 0;
//       if (label in testMap) {
//         testMap[label] += value;
//       } else {
//         testMap[label] = value;
//       }
//     });
//     testCounts = Object.entries(testMap).map(([label, value]) => ({ label, value }));
//   }
//   const total = testCounts.reduce((sum, t) => sum + t.value, 0);

//   return (
//     <div className="flex items-center" style={{ maxWidth: 800 }}>
//       <div className="flex-shrink-0">
//         <canvas ref={chartRef} width={chartSize} height={chartSize} />
//       </div>
//       {testCounts.length > 0 && total > 0 && (
//         <div className="ml-8">
//           <div className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//             Run Breakdown
//           </div>
//           <ul>
//             {testCounts.map((t, i) => (
//               <li key={t.label} className="flex items-center mb-1">
//                 <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ background: colors[i % colors.length] }} />
//                 <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{t.label}</span>
//                 <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>({((t.value / total) * 100).toFixed(1)}%)</span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }

// function BestRunBreakdown({ run, rows, chartSize = 340, testColorMap }) {
//   const chartRef = useRef(null);
//   const isDarkMode = document.documentElement.classList.contains('dark');
//   useEffect(() => {
//     if (chartRef.current && chartRef.current._chart) chartRef.current._chart.destroy();

//     let testCounts = [];
//     if (run) {
//       const testMap = {};
//       (run.table_data || []).forEach(test => {
//         const label = test.test_name?.trim();
//         const value = Number(test.sample_count) || 0;
//         if (label in testMap) {
//           testMap[label] += value;
//         } else {
//           testMap[label] = value;
//         }
//       });
//       testCounts = Object.entries(testMap).map(([label, value]) => ({
//         label: getShortTestName(label),
//         rawName: label,
//         value
//       }));
//     }

//     const data = testCounts.map(t => t.value);
//     const labels = testCounts.map(t => t.label);
//     const colors = testCounts.map(t =>
//       testColorMap && testColorMap[normalizeName(t.rawName)]
//         ? testColorMap[normalizeName(t.rawName)]
//         : '#6366f1'
//     );
//     const hasData = data.length > 0 && data.some(v => v !== 0);

//     // Center text plugin
//     const centerTextPlugin = {
//       id: 'centerText',
//       afterDraw: chart => {
//         const { ctx, chartArea } = chart;
//         ctx.save();
//         ctx.font = 'bold 2.2rem sans-serif';
//         ctx.textAlign = 'center';
//         ctx.textBaseline = 'middle';
//         ctx.fillStyle = isDarkMode ? '#fff' : '#22223b';
//         if (hasData && run) {
//           ctx.fillText('Best Run', chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2 - 16);
//           ctx.font = 'bold 2rem sans-serif';
//           ctx.fillText(run.run_id, chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2 + 16);
//         } else {
//           ctx.fillText('No Data', chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2);
//         }
//         ctx.restore();
//       }
//     };

//     chartRef.current._chart = new Chart(chartRef.current, {
//       type: 'doughnut',
//       data: hasData
//         ? {
//           labels,
//           datasets: [{
//             data,
//             backgroundColor: colors,
//             borderWidth: 0,
//           }]
//         }
//         : {
//           labels: ['No Data'],
//           datasets: [{
//             data: [1],
//             backgroundColor: [isDarkMode ? '#444' : '#e5e7eb'],
//             borderWidth: 0,
//           }]
//         },
//       options: {
//         cutout: '70%',
//         plugins: {
//           legend: { display: false, labels: { color: isDarkMode ? '#fff' : '#22223b' } },
//           tooltip: {
//             enabled: hasData,
//             usePointStyle: true,
//             callbacks: {
//               labelPointStyle: () => ({
//                 pointStyle: 'circle'
//               }),
//             }
//           },
//           datalabels: { display: false }
//         }
//       },
//       plugins: [centerTextPlugin]
//     });

//     return () => {
//       if (chartRef.current && chartRef.current._chart) chartRef.current._chart.destroy();
//     };
//   }, [run, rows, isDarkMode, testColorMap]);

//   // Only show legend if there is data
//   let testCounts = [];
//   if (run) {
//     const testMap = {};
//     (run.table_data || []).forEach(test => {
//       const label = test.test_name?.trim();
//       const value = Number(test.sample_count) || 0;
//       if (label in testMap) {
//         testMap[label] += value;
//       } else {
//         testMap[label] = value;
//       }
//     });
//     testCounts = Object.entries(testMap).map(([label, value]) => ({
//       label: getShortTestName(label),
//       rawName: label,
//       value
//     }));
//   }
//   const total = testCounts.reduce((sum, t) => sum + t.value, 0);

//   // FIX: Define colors here for use in JSX
//   const colors = testCounts.map(t =>
//     testColorMap && testColorMap[normalizeName(t.rawName)]
//       ? testColorMap[normalizeName(t.rawName)]
//       : '#6366f1'
//   );

//   return (
//     <div style={{ width: 700, minHeight: 420, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
//       <div style={{ width: 340, height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//         <canvas ref={chartRef} width={340} height={340} />
//       </div>
//       <div className="ml-8 flex flex-col justify-center items-start" style={{ width: 340 }}>
//         <div className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
//           Expense Breakdown
//         </div>
//         <ul>
//           {labels.map((label, i) => (
//             <li key={label} className="flex items-center mb-2">
//               <span className="inline-block w-4 h-4 rounded-full mr-3" style={{ background: colors[i % colors.length] }} />
//               <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{label}</span>
//               <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
//                 (₹{dataArr[i].toLocaleString()} / {percentArr[i].toFixed(1)}%)
//               </span>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// }

const BestRunBreakdown = React.memo(function BestRunBreakdown({ run, rows, chartSize = 340, testColorMap }) {
  const chartRef = useRef(null);
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Prepare testCounts, labels, dataArr, percentArr, colors for legend and chart
  let testCounts = [];
  if (run) {
    const testMap = {};
    (run.table_data || []).forEach(test => {
      const label = test.test_name?.trim();
      const value = Number(test.sample_count) || 0;
      if (label in testMap) {
        testMap[label] += value;
      } else {
        testMap[label] = value;
      }
    });
    testCounts = Object.entries(testMap).map(([label, value]) => ({
      label: getShortTestName(label),
      rawName: label,
      value
    }));
  }
  const labels = testCounts.map(t => t.label);
  const dataArr = testCounts.map(t => t.value);
  const total = dataArr.reduce((sum, v) => sum + v, 0);
  const percentArr = dataArr.map(v => total ? (v / total) * 100 : 0);
  const colors = testCounts.map(t =>
    testColorMap && testColorMap[normalizeName(t.rawName)]
      ? testColorMap[normalizeName(t.rawName)]
      : '#6366f1'
  );

  useEffect(() => {
    if (chartRef.current && chartRef.current._chart) chartRef.current._chart.destroy();
    const hasData = dataArr.length > 0 && dataArr.some(v => v !== 0);

    // Center text plugin
    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: chart => {
        const { ctx, chartArea } = chart;
        ctx.save();
        ctx.font = 'bold 2.2rem sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isDarkMode ? '#fff' : '#22223b';
        if (hasData && run) {
          ctx.fillText('Best Run', chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2 - 16);
          ctx.font = 'bold 2rem sans-serif';
          ctx.fillText(run.run_id, chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2 + 16);
        } else {
          ctx.fillText('No Data', chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2);
        }
        ctx.restore();
      }
    };

    chartRef.current._chart = new Chart(chartRef.current, {
      type: 'doughnut',
      data: hasData
        ? {
          labels,
          datasets: [{
            data: dataArr,
            backgroundColor: colors,
            borderWidth: 0,
          }]
        }
        : {
          labels: ['No Data'],
          datasets: [{
            data: [1],
            backgroundColor: [isDarkMode ? '#444' : '#e5e7eb'],
            borderWidth: 0,
          }]
        },
      options: {
        cutout: '70%',
        plugins: {
          legend: { display: false, labels: { color: isDarkMode ? '#fff' : '#22223b' } },
          tooltip: {
            enabled: hasData,
            usePointStyle: true,
            callbacks: {
              labelPointStyle: () => ({
                pointStyle: 'circle'
              }),
            }
          },
          datalabels: { display: false }
        }
      },
      plugins: [centerTextPlugin]
    });

    return () => {
      if (chartRef.current && chartRef.current._chart) chartRef.current._chart.destroy();
    };
  }, [run, rows, isDarkMode, testColorMap, labels, dataArr, colors]);

  return (
    <div style={{ width: 700, minHeight: 400, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <div style={{ width: 340, height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas ref={chartRef} width={340} height={340} />
      </div>
      <div className="ml-8 flex flex-col justify-center items-start" style={{ width: 340 }}>
        <div className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Run Breakdown
        </div>
        <ul>
          {labels.map((label, i) => (
            <li key={label} className="flex items-center mb-2">
              <span className="inline-block w-4 h-4 rounded-full mr-3" style={{ background: colors[i % colors.length] }} />
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{label}</span>
              <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                (₹{dataArr[i].toLocaleString()} / {percentArr[i].toFixed(1)}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

function AllRunsExpensePieChart({ runs, rows, flowcellInfoMap }) {
  const chartRef = useRef(null);
  const isDarkMode = document.documentElement.classList.contains('dark');

  // --- Calculate dataArr, total, percentArr for legend and chart ---
  let flowcell = 0, library = 0, libraryQC = 0, extraction = 0, custom = 0;
  const allCustomExpenseNames = Array.from(
    new Set(rows.flatMap(r => (r.customExpenses || []).map(exp => exp.name)))
  );

  (runs || []).forEach(run => {
    (run.table_data || []).forEach(test => {
      const normalizedTestName = (test.test_name || '').toLowerCase().replace(/[\s_]+/g, '_').replace(/_+/g, '_').trim();
      const row = rows.find(r => (r.testName || '').toLowerCase().replace(/[\s_]+/g, '_').replace(/_+/g, '_').trim() === normalizedTestName);
      if (!row) return;
      const testCount = Number(test.sample_count) || 0;

      // if (run.instument_type === 'NextSeq_550' && run.flowcell === 'Mid Output') {
      //   flowcell += testCount * (Number(row.gbSample) || 0) * 6050;
      // }
      const flowcellKey = `${run.instument_type}|${run.flowcell}`;
      const flowcellInfo = flowcellInfoMap[flowcellKey];
      const flowcellAmount = flowcellInfo ? Number(flowcellInfo.amount) : 0;
      const gb = flowcellInfo ? Number(flowcellInfo.gb) : 1;
      const perGb = gb ? flowcellAmount / gb : 0;
      flowcell += testCount * (Number(row.gbSample) || 0) * perGb;


      library += (Number(row.library) || 0) * testCount;
      libraryQC += (Number(row.libraryQC) || 0) * testCount;
      extraction += (Number(row.extraction) || 0) * testCount;
      const customExpenses = row.customExpenses || [];
      allCustomExpenseNames.forEach(name => {
        const found = customExpenses.find(exp => exp.name === name);
        custom += found ? Number(found.value) * testCount : 0;
      });
    });
  });

  const dataArr = [flowcell, library, libraryQC, extraction, custom];
  const total = dataArr.reduce((a, b) => a + b, 0);
  const percentArr = dataArr.map(v => total ? (v / total) * 100 : 0);
  const labels = ['Flowcell', 'Library', 'Library QC', 'Extraction', 'Misc. Expenses'];
  const colors = ['#6366f1', '#fbbf24', '#818cf8', '#f472b6', '#34d399'];

  useEffect(() => {
    if (chartRef.current && chartRef.current._chart) chartRef.current._chart.destroy();
    const hasData = dataArr.some(v => v > 0);

    // Plugin for center text
    const centerTextPlugin = {
      id: 'centerText',
      afterDraw: function (chart) {
        const { ctx, chartArea } = chart;
        ctx.save();
        ctx.font = 'bold 2.2rem sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = isDarkMode ? '#fff' : '#22223b';
        ctx.fillText('Expense', chartArea.left + chartArea.width / 2, chartArea.top + chartArea.height / 2);
        ctx.restore();
      }
    };

    chartRef.current._chart = new Chart(chartRef.current, {
      type: 'doughnut',
      data: hasData
        ? {
          labels,
          datasets: [{
            data: dataArr,
            backgroundColor: colors
          }]
        }
        : {
          labels: ['No Data'],
          datasets: [{
            data: [1],
            backgroundColor: [isDarkMode ? '#444' : '#e5e7eb']
          }]
        },
      options: {
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            usePointStyle: true,
            callbacks: {
              label: ctx => {
                const val = ctx.parsed;
                const percent = total ? (val / total) * 100 : 0;
                return `${ctx.label}: ₹${val.toLocaleString()} (${percent.toFixed(1)}%)`;
              },
              labelPointStyle: () => ({
                pointStyle: 'circle'
              }),
            },

            bodyColor: isDarkMode ? '#fff' : '#22223b',
            titleColor: isDarkMode ? '#fff' : '#22223b',
            backgroundColor: isDarkMode ? '#22223b' : '#fff',
          },
          datalabels: { display: false, }
        }
      },
      plugins: [centerTextPlugin]
    });

    return () => {
      if (chartRef.current && chartRef.current._chart) chartRef.current._chart.destroy();
    };
  }, [runs, rows, total, isDarkMode]);

  return (
    <div style={{ width: 700, minHeight: 420, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
      <div style={{ width: 340, height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas ref={chartRef} width={340} height={340} />
      </div>
      <div className="ml-8 flex flex-col justify-center items-start" style={{ width: 340 }}>
        <div className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Expense Breakdown
        </div>
        <ul>
          {labels.map((label, i) => (
            <li key={label} className="flex items-center mb-2">
              <span className="inline-block w-4 h-4 rounded-full mr-3" style={{ background: colors[i % colors.length] }} />
              <span className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{label}</span>
              <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                (₹{dataArr[i].toLocaleString()} / {percentArr[i].toFixed(1)}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CountUpNumber({ value, duration = 1200, decimals = 2, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    function animate(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = start + (value - start) * progress;
      setDisplay(current);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(value);
      }
    }
    requestAnimationFrame(animate);
    // Reset on value change
    return () => setDisplay(0);
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

{/* <Form {...form}>
<form className="">
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4 gap-y-6">
    Cost Parameters
    <div className="shadow-lg p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-4 flex items-center text-blue-700">
        <span className="mr-2">💲</span> Cost Parameters
      </h3>
      <FormField
        control={form.control}
        name='per_run_seq'
        render={() => (
          <FormItem className="mb-4">
            <div className="flex items-center">
              <label className="font-semibold min-w-[180px] mr-2 text-right">Per Run Sequencing Cost</label>
              <input
                type='number'
                value={perRunSeq}
                onChange={e => setPerRunSeq(e.target.value)}
                placeholder='Per Run Sequencing Cost'
                className='p-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 transition w-full'
              />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='per_flowcell_gb'
        render={() => (
          <FormItem className="mb-4">
            <div className="flex items-center">
              <label className="font-semibold min-w-[180px] mr-2 text-right">Per flowcell GB</label>
              <input
                type='number'
                value={perFlowcellGb}
                onChange={e => setPerFlowcellGb(e.target.value)}
                placeholder='Per Flowcell GB'
                className='p-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 transition w-full'
              />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='per_gb_cost'
        render={() => (
          <FormItem className="mb-4">
            <div className="flex items-center">
              <label className="font-semibold min-w-[180px] mr-2 text-right">Per GB Cost</label>
              <input
                type='text'
                value={perGbCost ? Number(perGbCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                readOnly
                placeholder='Per GB Cost'
                className='p-3 border-2 border-blue-200 rounded-xl w-full'
              />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='total_gb_consumed'
        render={() => (
          <FormItem className="mb-4">
            <div className="flex items-center">
              <label className="font-semibold min-w-[180px] mr-2 text-right">Total GB Consumption</label>
              <input
                type='text'
                value={totalGbConsumption ? Number(totalGbConsumption).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                readOnly
                placeholder='Total GB Consumption'
                className='p-3 border-2 border-blue-200 rounded-xl w-full'
              />
            </div>
          </FormItem>
        )}
      />
    </div>
    Expense Analysis
    <div className="shadow-lg p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-4 flex items-center text-orange-600">
        <span className="mr-2">📊</span> Expense Analysis
      </h3>
      <FormField
        control={form.control}
        name='total_exp_seq'
        render={() => (
          <FormItem className="mb-4">
            <div className="flex items-center">
              <label className="font-semibold min-w-[180px] mr-2 text-right">Total Expense for Sequencing</label>
              <input
                type='text'
                value={totalSeqExp ? Number(totalSeqExp).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                readOnly
                placeholder='Total Expense for Sequencing'
                className='p-3 border-2 border-yellow-300 rounded-xl w-full'
              />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='total_number_of_runs'
        render={() => (
          <FormItem className="mb-4">
            <div className="flex items-center">
              <label className="font-semibold min-w-[180px] mr-2 text-right">Total No Of Runs performed</label>
              <input
                type='number'
                value={totalNoRun}
                disabled
                onChange={e => setTotalNoRun(e.target.value)}
                placeholder='Total No Of Runs performed'
                className='p-3 border-2 border-yellow-300 rounded-xl focus:border-yellow-400 transition w-full'
              />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='total_lab_exp'
        render={() => (
          <FormItem className="mb-4">
            <div className="flex items-center">
              <label className="font-semibold min-w-[180px] mr-2 text-right">Total Lab Expense</label>
              <input
                type='text'
                value={totalLabExpense ? Number(totalLabExpense).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                readOnly
                placeholder='Total Lab Expense'
                className='p-3 border-2 border-yellow-300 rounded-xl w-full'
              />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='total_p_and_l'
        render={() => (
          <FormItem className="mb-4">
            <div className="flex items-center">
              <label className="font-semibold min-w-[180px] mr-2 text-right">Total P & L</label>
              <input
                type='text'
                value={totalPandL ? Number(totalPandL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                readOnly
                placeholder='Total P & L'
                className='p-3 border-2 border-yellow-300 rounded-xl w-full'
              />
            </div>
          </FormItem>
        )}
      />
    </div>
    Profitability Metrics
    <div className="shadow-lg p-4 rounded-lg">
      <h3 className="text-lg font-bold mb-4 flex items-center text-green-700">
        <span className="mr-2">📈</span> Profitability Metrics
      </h3>
      <FormField
        control={form.control}
        name='per_run_profit'
        render={() => (
          <FormItem className="mb-4">
            <div className="flex items-center">
              <label className="font-semibold min-w-[180px] mr-2 text-right text-green-700">Per Run Profitability</label>
              <input
                type='text'
                value={perRunProfit ? Number(perRunProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                readOnly
                placeholder='Per Run Profitability'
                className='p-3 border-2 border-green-300 rounded-xl w-full'
              />
            </div>
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name='projected_run_profit'
        render={({ field }) => (
          <FormItem className="mb-4">
            <div className="flex items-center">
              <label className="font-semibold min-w-[180px] mr-2 text-right text-green-700">Projected Run Profitability</label>
              <input
                {...field}
                type='text'
                placeholder='Projected Run Profitability'
                className='p-3 border-2 border-green-300 rounded-xl focus:border-green-400 transition w-full'
              />
            </div>
          </FormItem>
        )}
      />
    </div>
  </div>
</form>
</Form> */}