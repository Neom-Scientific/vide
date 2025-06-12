'use client'
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import DynamicChartDisplay from './components/DynamicChartDisplay';

const tatMonthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const Page = () => {
  const [masterSheetData, setMasterSheetData] = useState([]);
  const [poolData, setPoolData] = useState([]);
  const [user, setUser] = useState(null);

  // Multi-select states
  const [selectedRunId, setSelectedRunId] = useState([]);
  const [selectedTestName, setSelectedTestName] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);
  const [selectedChartRunId, setSelectedChartRunId] = useState([]);

  // TAT chart multi-select
  const [selectedTatTestName, setSelectedTatTestName] = useState([]);
  const [selectedTatMonth, setSelectedTatMonth] = useState([]);
  const [selectedTatYear, setSelectedTatYear] = useState([]);

  const [tableData, setTableData] = useState([]);

  // Fetch pool data
  useEffect(() => {
    const cookieData = Cookies.get('user');
    if (cookieData) {
      const fetchPoolData = async () => {
        try {
          const parsedData = JSON.parse(cookieData);
          setUser(parsedData);
          const response = await axios.get(`/api/run-setup?role=${parsedData.role}&hospital_name=${parsedData.hospital_name}`);
          if (response.data[0].status === 200) {
            const data = response.data[0].data || [];
            setPoolData(data);
          }
        } catch (error) {
          console.error('Error fetching pool data:', error);
        }
      };
      fetchPoolData();
    }
  }, [user?.role]);

  // Fetch master sheet data
  useEffect(() => {
    const fetchMasterSheetData = async () => {
      try {
        const cookieData = Cookies.get('user');
        if (cookieData) {
          const parsedData = JSON.parse(cookieData);
          const response = await axios.get(`/api/store?role=${parsedData.role}&hospital_name=${parsedData.hospital_name}`);
          if (response.data[0].status === 200) {
            setMasterSheetData(response.data[0].data || []);
          }
        }
      } catch (error) {
        console.error('Error fetching master sheet data:', error);
      }
    }
    fetchMasterSheetData();
  }, []);

  // Extract unique values
  const runIds = Array.from(new Set(poolData.map(item => item.run_id)))
    .sort((a, b) => {
      const numA = parseInt(a.split('_')[1], 10);
      const numB = parseInt(b.split('_')[1], 10);
      return numB - numA;
    });

  // Normalize test names for uniqueTestNames
  const uniqueTestNames = Array.from(
    new Set(masterSheetData.map(item => (item.test_name || '').trim()))
  ).filter(Boolean);

  const uniqueYears = Array.from(
    new Set(masterSheetData.map(item => {
      const date = item.registration_date || item.created_at;
      return date ? new Date(date).getFullYear() : null;
    }).filter(Boolean))
  ).sort((a, b) => b - a);

  // Update tableData when selectedRunId changes (multi-select)
  useEffect(() => {
    if (!selectedRunId || selectedRunId.length === 0) {
      setTableData([]);
      return;
    }
    // Get all runs for selectedRunId array
    const runs = poolData.filter(item => selectedRunId.includes(item.run_id));
    let parsedTable = [];
    runs.forEach(run => {
      if (run && run.table_data) {
        try {
          const data = typeof run.table_data === 'string'
            ? JSON.parse(run.table_data)
            : run.table_data;
          parsedTable = parsedTable.concat(data);
        } catch {
          // ignore
        }
      }
    });
    setTableData(parsedTable);
  }, [selectedRunId, poolData]);

  // --- Chart 1: Sample Count by Test Name (grouped by run_id) ---
  // Group by run_id, then by test_name
  const runIdTestNameMap = {};
  tableData.forEach(item => {
    if (!item.run_id) return;
    if (!runIdTestNameMap[item.run_id]) runIdTestNameMap[item.run_id] = {};
    if (!runIdTestNameMap[item.run_id][item.test_name]) runIdTestNameMap[item.run_id][item.test_name] = 0;
    runIdTestNameMap[item.run_id][item.test_name] += item.sample_count || 1;
  });

  // Always show all selected run ids on x-axis
  const runIdXAxisLabels = selectedRunId.length > 0 ? selectedRunId : runIds;

  // Get all test names present in selected runs (or all if none selected)
  // const allTestNamesInRuns = Array.from(
  //   new Set(
  //     (selectedRunId.length > 0
  //       ? selectedRunId.flatMap(runId => Object.keys(runIdTestNameMap[runId] || {}))
  //       : Object.values(runIdTestNameMap).flatMap(obj => Object.keys(obj))
  //     )
  //   )
  // );

  // Prepare datasets for grouped bar chart
  const allTestNamesInRuns = uniqueTestNames; // Always show all test names

  const runIdChartData = allTestNamesInRuns.map(testName => ({
    label: testName,
    data: runIdXAxisLabels.map(runId => runIdTestNameMap[runId]?.[testName] || 0)
  }));


  // --- Chart 2: Test Name Distribution ---
  // Filter masterSheetData by selected test names, years, run ids
  const filteredChartData = masterSheetData.filter(item =>
    (selectedTestName.length === 0 || selectedTestName.map(n => n.trim()).includes((item.test_name || '').trim())) &&
    (selectedYear.length === 0 || selectedYear.includes(String((item.registration_date || item.created_at || '').slice(0, 4)))) &&
    (selectedChartRunId.length === 0 || selectedChartRunId.includes(item.run_id))
  );

  // When mapping for chart2XAxisLabels and chart2Datasets
  let chart2XAxisLabels = selectedTestName.length > 0
    ? selectedTestName.map(n => n.trim())
    : uniqueTestNames;

  let chart2Datasets = [{
    label: "Samples",
    data: chart2XAxisLabels.map(testName =>
      filteredChartData.filter(item => (item.test_name || '').trim() === testName).length
    )
  }];

  // --- Chart 3: TAT Days by Month (multi-select) ---
  // Filter masterSheetData for TAT chart
  const filteredTatData = masterSheetData.filter(item =>
    (selectedTatTestName.length === 0 || selectedTatTestName.includes(item.test_name)) &&
    (selectedTatYear.length === 0 || selectedTatYear.includes(String((item.registration_date || item.created_at || '').slice(0, 4)))) &&
    (selectedTatMonth.length === 0 || (() => {
      const dateStr = item.registration_date || item.created_at;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return selectedTatMonth.includes(tatMonthNames[date.getMonth()]);
    })())
  );

  // If years selected, show months on x-axis, grouped by test_name
  let tatXAxisLabels = [];
  let tatDatasets = [];
  if (selectedTatYear.length > 0) {
    tatXAxisLabels = tatMonthNames;
    tatDatasets = (selectedTatTestName.length > 0 ? selectedTatTestName : uniqueTestNames).map(testName => {
      const data = tatMonthNames.map((month, idx) => {
        // For each month, average tat_days for this testName
        const arr = filteredTatData.filter(item => {
          const dateStr = item.registration_date || item.created_at;
          if (!dateStr) return false;
          const date = new Date(dateStr);
          return item.test_name === testName &&
            selectedTatYear.includes(String(date.getFullYear())) &&
            date.getMonth() === idx;
        }).map(item => Number(item.tat_days));
        return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      });
      return { label: testName, data };
    });
  } else if (selectedTatTestName.length > 0) {
    // If test names selected, show test names on x-axis, grouped by year
    tatXAxisLabels = selectedTatTestName;
    tatDatasets = (selectedTatYear.length > 0 ? selectedTatYear : uniqueYears).map(year => {
      const data = selectedTatTestName.map(testName => {
        const arr = filteredTatData.filter(item => {
          const dateStr = item.registration_date || item.created_at;
          if (!dateStr) return false;
          const date = new Date(dateStr);
          return item.test_name === testName &&
            String(date.getFullYear()) === String(year);
        }).map(item => Number(item.tat_days));
        return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      });
      return { label: year, data };
    });
  } else {
    // Default: group by month, average tat_days
    tatXAxisLabels = tatMonthNames;
    tatDatasets = [{
      label: "TAT Days",
      data: tatMonthNames.map((month, idx) => {
        const arr = filteredTatData.filter(item => {
          const dateStr = item.registration_date || item.created_at;
          if (!dateStr) return false;
          const date = new Date(dateStr);
          return date.getMonth() === idx;
        }).map(item => Number(item.tat_days));
        return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      })
    }];
  }

  // --- Funnel Chart ---
  const funnelSteps = [
    { key: "dna_isolation", label: "DNA Isolation" },
    { key: "lib_prep", label: "Library Prep" },
    { key: "under_seq", label: "Under Sequencing" },
    { key: "seq_completed", label: "Sequencing Completed" }
  ];
  const funnelChartData = funnelSteps.map(step => ({
    label: step.label,
    value: masterSheetData.filter(item => item[step.key] === "Yes").length
  }));

  // console.log('tatDatasets:', tatDatasets);
  // console.log('tatXAxisLabels:', tatXAxisLabels);
  return (
    <div className='grid grid-cols-2 gap-4'>
      <div>
        {/* Chart 1: Grouped bar chart by run_id and test_name */}
        <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md">
          <DynamicChartDisplay
            dropdowns={[
              {
                label: "Select Run Id",
                options: runIds,
                value: selectedRunId,
                onChange: setSelectedRunId,
              }
            ]}
            chartTitle="Sample Count by Test Name"
            chartType="bar-grouped"
            chartData={{
              labels: runIdXAxisLabels,
              datasets: runIdChartData
            }}
          />
        </div>
      </div>
      <div>
        {/* Chart 2: Test Name Distribution */}
        <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md">
          <DynamicChartDisplay
            dropdowns={[
              {
                label: "Select Test Name",
                options: uniqueTestNames,
                value: selectedTestName,
                onChange: setSelectedTestName,
              },
              {
                label: "Select Year",
                options: uniqueYears,
                value: selectedYear,
                onChange: setSelectedYear,
              },
            ]}
            chartTitle="Test Name Distribution"
            chartType="bar-grouped"
            chartData={{
              labels: chart2XAxisLabels,
              datasets: chart2Datasets
            }}
            dropdownStacked={true}
          />
        </div>
      </div>
      <div>
        {/* Chart 3: TAT Days by Month */}
        <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md">
          <DynamicChartDisplay
            dropdowns={[
              {
                label: "Select Test Name",
                options: uniqueTestNames,
                value: selectedTatTestName,
                onChange: setSelectedTatTestName
              },
              {
                label: "Select Year",
                options: uniqueYears,
                value: selectedTatYear,
                onChange: setSelectedTatYear
              },
              {
                label: "Select Month",
                options: tatMonthNames,
                value: selectedTatMonth,
                onChange: setSelectedTatMonth
              }
            ]}
            chartTitle="TAT Days by Month"
            chartType="line-grouped"
            chartData={{
              labels: tatXAxisLabels,
              datasets: tatDatasets
            }}
            dropdownStacked={true}
          />
        </div>
      </div>
      <div>
        {/* Funnel chart */}
        <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md">
          <DynamicChartDisplay
            chartTitle="Sample Funnel"
            chartData={funnelChartData}
            chartType="funnel"
            chartHeight={400}
            dropdowns={[]} // No dropdowns for this chart
          />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Page;