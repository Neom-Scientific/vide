'use client'
import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react'
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import DynamicChartDisplay from './components/DynamicChartDisplay';

const Page = () => {
  const [masterSheetData, setMasterSheetData] = useState([]);
  const [poolData, setPoolData] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedRunId, setSelectedRunId] = useState('');
  const [tableData, setTableData] = useState([]);

  // State for the new chart
  const [selectedTestName, setSelectedTestName] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedChartRunId, setSelectedChartRunId] = useState('');

  // State for TAT chart
  const [selectedTatTestName, setSelectedTatTestName] = useState('');
  const [selectedTatMonth, setSelectedTatMonth] = useState('');
  const [selectedTatYear, setSelectedTatYear] = useState('');
  const uniqueApplications = Array.from(new Set(masterSheetData.map(item => item.application))).filter(Boolean);
  const [selectedTatApplication, setSelectedTatApplication] = useState('');

  // Define tatMonthNames
  const tatMonthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  // Only filter by test name and year for months dropdown
  const filteredTatDataForMonths = masterSheetData.filter(item =>
    (!selectedTatTestName || item.test_name === selectedTatTestName) &&
    (!selectedTatYear || (item.registration_date || item.created_at || '').startsWith(selectedTatYear))
  );

  const uniqueTatMonths = Array.from(
    new Set(
      filteredTatDataForMonths
        .map(item => {
          const dateStr = item.registration_date || item.created_at;
          if (!dateStr) return null;
          const date = new Date(dateStr);
          return tatMonthNames[date.getMonth()];
        })
        .filter(Boolean)
    )
  );

  // Define filteredTatData
  const filteredTatData = masterSheetData.filter(item =>
    (!selectedTatTestName || item.test_name === selectedTatTestName) &&
    (!selectedTatYear || (item.registration_date || item.created_at || '').startsWith(selectedTatYear)) &&
    (!selectedTatMonth || (() => {
      const dateStr = item.registration_date || item.created_at;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return tatMonthNames[date.getMonth()] === selectedTatMonth;
    })())
  );

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
          console.error('Error fetching master sheet data:', error);
        }
      };
      fetchPoolData();
    }
  }, [user?.role]);

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

  // Set default TAT dropdowns when masterSheetData loads
  useEffect(() => {
    if (masterSheetData.length > 0) {
      // Find first test_name and year that have tat_days
      const firstTatRow = masterSheetData.find(item => item.tat_days != null);
      if (firstTatRow) {
        if (!selectedTatTestName) setSelectedTatTestName(firstTatRow.test_name);
        const year = (firstTatRow.registration_date || firstTatRow.created_at)
          ? new Date(firstTatRow.registration_date || firstTatRow.created_at).getFullYear().toString()
          : '';
        if (!selectedTatYear && year) setSelectedTatYear(year);
      }
    }
    // Only run when masterSheetData changes or if either is empty
    // eslint-disable-next-line
  }, [masterSheetData]);

  // Extract unique run_ids
  const runIds = Array.from(new Set(poolData.map(item => item.run_id)))
    .sort((a, b) => {
      const numA = parseInt(a.split('_')[1], 10);
      const numB = parseInt(b.split('_')[1], 10);
      return numB - numA;
    });

  // Auto-select first run_id when runIds change
  useEffect(() => {
    if (runIds.length > 0 && !selectedRunId) {
      setSelectedRunId(runIds[0]);
    }
  }, [runIds, selectedRunId]);

  // Update tableData when selectedRunId changes
  useEffect(() => {
    if (!selectedRunId) {
      setTableData([]);
      return;
    }
    const run = poolData.find(item => item.run_id === selectedRunId);
    let parsedTable = [];
    if (run && run.table_data) {
      try {
        parsedTable = typeof run.table_data === 'string'
          ? JSON.parse(run.table_data)
          : run.table_data;
      } catch {
        parsedTable = [];
      }
    }
    setTableData(parsedTable);
  }, [selectedRunId, poolData]);

  const uniqueTestNames = Array.from(new Set(masterSheetData.map(item => item.test_name)));
  const uniqueYears = Array.from(
    new Set(masterSheetData.map(item => {
      const date = item.registration_date || item.created_at;
      return date ? new Date(date).getFullYear() : null;
    }).filter(Boolean))
  ).sort((a, b) => b - a);

  // Filter data for the new chart
  const filteredChartData = masterSheetData.filter(item =>
    (!selectedTestName || item.test_name === selectedTestName) &&
    (!selectedYear || (item.registration_date || item.created_at || '').startsWith(selectedYear)) &&
    (!selectedChartRunId || item.run_id === selectedChartRunId)
  );

  // Prepare chart data for the second chart
  let chartDataArr;
  if (selectedTestName && selectedYear) {
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const monthCounts = Array(12).fill(0);
    filteredChartData.forEach(item => {
      const dateStr = item.registration_date || item.created_at;
      if (dateStr) {
        const date = new Date(dateStr);
        if (String(date.getFullYear()) === String(selectedYear)) {
          monthCounts[date.getMonth()] += 1;
        }
      }
    });
    chartDataArr = monthNames.map((label, idx) => ({
      label,
      value: monthCounts[idx]
    })).filter(item => item.value > 0); // Only show months with data
  } else {
    // Default: group by test_name
    const chartData = filteredChartData.reduce((acc, item) => {
      const label = item.test_name;
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    chartDataArr = Object.entries(chartData).map(([label, value]) => ({ label, value }));
  }

  // Prepare TAT chart data: group by month, average tat_days
  const tatMonthData = Array(12).fill().map(() => []);
  filteredTatData.forEach(item => {
    const dateStr = item.registration_date || item.created_at;
    if (dateStr && item.tat_days != null) {
      const date = new Date(dateStr);
      if (String(date.getFullYear()) === String(selectedTatYear)) {
        tatMonthData[date.getMonth()].push(Number(item.tat_days));
      }
    }
  });
  const tatChartData = tatMonthNames.map((label, idx) => {
    const arr = tatMonthData[idx];
    const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    return { label, value: avg };
  }).filter(item => item.value > 0);

  // Collect all tat_days as points with their month index
  const tatScatterData = [];
  filteredTatData.forEach(item => {
    const dateStr = item.registration_date || item.created_at;
    if (dateStr && item.tat_days != null) {
      const date = new Date(dateStr);
      if (String(date.getFullYear()) === String(selectedTatYear)) {
        tatScatterData.push({
          x: tatMonthNames[date.getMonth()],
          y: Number(item.tat_days)
        });
      }
    }
  });

  // Prepare TAT line chart data
  const tatLineData = filteredTatData
    .filter(item => item.tat_days != null)
    .map(item => {
      const dateStr = item.registration_date || item.created_at;
      const date = new Date(dateStr);
      return {
        x: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`, // e.g. "2025-06"
        month: tatMonthNames[date.getMonth()],
        y: Number(item.tat_days),
        date: date // for sorting
      };
    })
    .sort((a, b) => a.date - b.date); // sort by actual date

  // For the first chart (run_id only)
  const runIdChartData = tableData.map(item => ({
    label: item.test_name,
    value: item.sample_count,
  }));

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

  // console.log('selectedTatTestName:', selectedTatTestName);
  // console.log('selectedTatYear:', selectedTatYear);
  // console.log('filteredTatData:', filteredTatData);

  return (
    <div className='grid grid-cols-2 gap-4'>
      <div>
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
            chartData={runIdChartData}
          />
        </div>
      </div>
      <div>
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
              {
                label: "Select Run Id",
                options: runIds,
                value: selectedChartRunId,
                onChange: setSelectedChartRunId,
              }
            ]}
            chartTitle="Test Name Distribution"
            chartData={chartDataArr}
            dropdownStacked={true}
          />
        </div>
      </div>
      <div>
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
                options: uniqueTatMonths,
                value: selectedTatMonth,
                onChange: setSelectedTatMonth
              }
            ]}
            chartTitle="TAT Days by Month"
            chartData={tatLineData.map(d => ({ x: d.month, y: d.y }))}
            chartType="line"
            dropdownStacked={true}
            // chartHeight={400}
          />
        </div>
      </div>
      <div>
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