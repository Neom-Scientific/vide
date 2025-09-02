'use client'
import Cookies from 'js-cookie';
import React, { useEffect, useRef, useState } from 'react'
import { ToastContainer } from 'react-toastify';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import 'chartjs-chart-funnel';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { FunnelController, TrapezoidElement } from 'chartjs-chart-funnel';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import RouteLoader from './components/RouteLoader';

Chart.register(...registerables);
Chart.register(FunnelController, TrapezoidElement);
Chart.register(ChartDataLabels);

const tatMonthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const testNameShortMap = {
  "Cardio Comprehensive Myopathy": { short: "CMP", full: "Cardio Comprehensive Myopathy" },
  "Cardio Metabolic Syndrome (Screening)": { short: "CMS", full: "Cardio Metabolic Syndrome" },
  "Cardio Comprehensive (Screening)": { short: "CCS", full: "Cardio Comprehensive (Screening)" },
  "SolidTumor Panel": { short: "STP", full: "SolidTumor Panel" },
  "WES": { short: "WES", full: "Whole Exome Sequencing" },
  "Carrier Screening": { short: "CS", full: "Carrier Screening" },
  "CES": { short: "CES", full: "Clinical Exome Sequencing" },
  "Myeloid": { short: "Myeloid", full: "Myeloid" },
  "HCP": { short: "HCP", full: "Hereditary Cancer Panel" },
  "HRR": { short: "HRR", full: "Hereditary Retinal Disorders" },
  "SGS": { short: "SGS", full: "Shallow Genome Sequencing" },
  "HLA": { short: "HLA", full: "Human Leukocyte Antigen" },
  "WES + Mito": { short: "WES + Mito", full: "Whole Exome Sequencing + Mitochondrial" },
  "CES + Mito": { short: "CES + Mito", full: "Clinical Exome Sequencing + Mitochondrial" },
};

const Page = () => {

  const now = new Date();
  const currentYear = now.getFullYear();
  const previousYear = currentYear - 1;
  const yearOptions = [currentYear.toString(), previousYear.toString()];

  const [masterSheetData, setMasterSheetData] = useState([]);
  const [poolData, setPoolData] = useState([]);
  const [user, setUser] = useState(null);

  // Chart 1
  const [selectedTestName1, setSelectedTestName1] = useState([]);
  const [selectedMonth1, setSelectedMonth1] = useState("");
  const [selectedYear1, setSelectedYear1] = useState([]);

  // Chart 2
  const [selectedRunId2, setSelectedRunId2] = useState([]);
  const [selectedMonth2, setSelectedMonth2] = useState("");
  const [selectedYear2, setSelectedYear2] = useState([currentYear.toString()]);

  // Chart 3
  const [selectedTatTestName3, setSelectedTatTestName3] = useState([]);
  const [selectedTatMonth3, setSelectedTatMonth3] = useState(tatMonthNames[new Date().getMonth()]);
  const [selectedTatYear3, setSelectedTatYear3] = useState([currentYear.toString()]);

  // Chart 4
  const [selectedTatTestName4, setSelectedTatTestName4] = useState([]);
  const [selectedTatMonth4, setSelectedTatMonth4] = useState(tatMonthNames[new Date().getMonth()]);
  const [selectedTatYear4, setSelectedTatYear4] = useState([currentYear.toString()]);

  const [tableData, setTableData] = useState([]);

  // Chart refs
  const chart1Ref = useRef(null);
  const chart2Ref = useRef(null);
  const chart3Ref = useRef(null);
  const chart4Ref = useRef(null);

  // Chart instance refs
  const chart1Instance = useRef(null);
  const chart2Instance = useRef(null);
  const chart3Instance = useRef(null);
  const chart4Instance = useRef(null);

  // Fetch pool data
  useEffect(() => {
    const cookieData = Cookies.get('vide_user');
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
        const cookieData = Cookies.get('vide_user');
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
  // Extract unique runIds and sort by seq_run_date (ascending)

  function filterRunsByMonthYear(poolData, month, year) {
    if (!month && !year) return poolData;
    return poolData.filter(item => {
      if (!item.seq_run_date) return false;
      const date = new Date(item.seq_run_date);
      const matchesMonth = month ? date.getMonth() === tatMonthNames.indexOf(month) : true;
      const matchesYear = year ? date.getFullYear() === Number(year) : true;
      return matchesMonth && matchesYear;
    });
  }

  const filteredRuns = filterRunsByMonthYear(
    poolData,
    selectedMonth2,
    selectedYear2.length === 1 ? selectedYear2[0] : undefined
  );

  const runIdWithDate = filteredRuns
    .filter(item => item.run_id && item.seq_run_date)
    .map(item => ({
      run_id: item.run_id,
      seq_run_date: new Date(item.seq_run_date)
    }))
    .sort((a, b) => a.seq_run_date - b.seq_run_date);

  const runIds = runIdWithDate.map(item => item.run_id);

  // If you want to include run_ids without seq_run_date at the end:
  const runIdsWithNoDate = filteredRuns
    .filter(item => item.run_id && !item.seq_run_date)
    .map(item => item.run_id);

  const allSortedRunIds = [...runIds, ...runIdsWithNoDate];

  // Normalize test names for uniqueTestNames
  const uniqueTestNames = Array.from(
    new Set(masterSheetData.map(item => (item.test_name || '').trim()))
  ).filter(Boolean);

  const uniqueYears = Array.from(
    new Set(masterSheetData.map(item => {
      const date = item.registration_date || item.created_at;
      return date ? new Date(date).getFullYear().toString() : null;
    }).filter(Boolean))
  ).sort((a, b) => b - a);

  // Update tableData when selectedRunId2 changes (multi-select)
  useEffect(() => {
    let runs;
    if (!selectedRunId2 || selectedRunId2.length === 0) {
      runs = poolData; // Use all runs if none selected
    } else {
      runs = poolData.filter(item => selectedRunId2.includes(item.run_id));
    }
    let parsedTable = [];
    runs.forEach(run => {
      if (run && run.table_data) {
        try {
          const data = typeof run.table_data === 'string'
            ? JSON.parse(run.table_data)
            : run.table_data;
          // Attach run_id to each entry for grouping
          data.forEach(d => parsedTable.push({ ...d, run_id: run.run_id }));
        } catch {
          // ignore
        }
      }
    });
    setTableData(parsedTable);
  }, [selectedRunId2, poolData]);

  // --- Chart 2: Sample Count by Test Name (grouped by run_id) ---
  const runIdXAxisLabels = selectedRunId2.length > 0 ? selectedRunId2 : allSortedRunIds;
  const allTestNamesInRuns = uniqueTestNames;

  const runIdTestNameMap = {};
  tableData.forEach(item => {
    if (!item.run_id) return;
    if (!runIdTestNameMap[item.run_id]) runIdTestNameMap[item.run_id] = {};
    if (!runIdTestNameMap[item.run_id][item.test_name]) runIdTestNameMap[item.run_id][item.test_name] = 0;
    runIdTestNameMap[item.run_id][item.test_name] += item.sample_count || 1;
  });

  const runSampleCounts = runIdXAxisLabels.map(runId => {
    // Sum sample_count for all items with this run_id
    return tableData
      .filter(item => item.run_id === runId)
      .reduce((sum, item) => sum + (item.sample_count || 1), 0);
  });

  const runIdChartData = [{
    label: "Sample Count",
    data: runSampleCounts,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    barPercentage: 0.7,
    categoryPercentage: 0.6,
    datalabels: {
      anchor: 'center',
      align: 'center',
      font: { weight: 'bold', size: 14 },
      color: '#22223b',
      formatter: v => v > 0 ? v : '',
    }
  }];

  // --- Chart 1: Test Name Distribution ---
  const filteredChartData = masterSheetData.filter(item => {
    const dateStr = item.registration_date || item.created_at;
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const monthName = tatMonthNames[date.getMonth()];
    return (
      (selectedTestName1.length === 0 || selectedTestName1.map(n => n.trim()).includes((item.test_name || '').trim())) &&
      (selectedYear1.length === 0 || selectedYear1.includes(String(date.getFullYear()))) &&
      (!selectedMonth1 || selectedMonth1 === monthName)
    );
  });

  function getDaysInMonth(monthIdx, year) {
    // monthIdx: 0-based (0=Jan)
    const now = new Date();
    year = year || now.getFullYear();
    return new Date(year, monthIdx + 1, 0).getDate();
  }

  let chart2XAxisLabels;
  let chart2Datasets;

  if (selectedMonth1) {
    // Show dates in the selected month
    const monthIdx = tatMonthNames.indexOf(selectedMonth1);
    const year = selectedYear1.length === 1 ? Number(selectedYear1[0]) : new Date().getFullYear();
    const daysInMonth = getDaysInMonth(monthIdx, year);
    chart2XAxisLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

    const testNamesToShow = selectedTestName1.length > 0 ? selectedTestName1.map(n => n.trim()) : uniqueTestNames;

    chart2Datasets = testNamesToShow.map((testName, idx) => ({
      label: testName,
      data: chart2XAxisLabels.map(day => {
        return filteredChartData.filter(item => {
          const dateStr = item.registration_date || item.created_at;
          if (!dateStr) return false;
          const date = new Date(dateStr);
          return (
            (item.test_name || '').trim() === testName &&
            date.getMonth() === monthIdx &&
            date.getFullYear() === year &&
            date.getDate() === Number(day)
          );
        }).length;
      }),
      backgroundColor: [
        '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#fbbf24', '#f87171', '#34d399', '#f472b6'
      ][idx % 8],
      borderRadius: 8,
      barPercentage: 0.7,
      categoryPercentage: 0.6,
      datalabels: {
        anchor: 'center',
        align: 'center',
        font: { weight: 'bold', size: 14 },
        color: '#22223b',
        formatter: v => v > 0 ? v : '',
      }
    }));
  } else if (selectedYear1.length === 1) {
    // Show months in the selected year
    const year = Number(selectedYear1[0]);
    chart2XAxisLabels = tatMonthNames;

    chart2Datasets = (selectedTestName1.length > 0 ? selectedTestName1 : uniqueTestNames).map((testName, idx) => ({
      label: testName,
      data: chart2XAxisLabels.map((monthName, monthIdx) => {
        return filteredChartData.filter(item => {
          const dateStr = item.registration_date || item.created_at;
          if (!dateStr) return false;
          const date = new Date(dateStr);
          return (
            (item.test_name || '').trim() === testName &&
            date.getFullYear() === year &&
            date.getMonth() === monthIdx
          );
        }).length;
      }),
      backgroundColor: [
        '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#fbbf24', '#f87171', '#34d399', '#f472b6'
      ][idx % 8],
      borderRadius: 8,
      barPercentage: 0.7,
      categoryPercentage: 0.6,
      datalabels: {
        anchor: 'center',
        align: 'center',
        font: { weight: 'bold', size: 14 },
        color: '#22223b',
        formatter: v => v > 0 ? v : '',
      }
    }));
  } else {
    // Default: show test names on x-axis
    chart2XAxisLabels = (selectedTestName1.length > 0
      ? selectedTestName1.map(n => n.trim())
      : uniqueTestNames
    ).map(name => testNameShortMap[name]?.short || name);

    chart2Datasets = chart2XAxisLabels.map((shortName, idx) => {
      // Find the full test name for this short name
      const fullName = Object.entries(testNameShortMap).find(
        ([key, val]) => val.short === shortName
      )?.[0] || shortName;

      return {
        label: shortName,
        data: chart2XAxisLabels.map((label, i) => {
          // Find the full test name for this label
          const labelFullName = Object.entries(testNameShortMap).find(
            ([key, val]) => val.short === label
          )?.[0] || label;

          return label === shortName
            ? filteredChartData.filter(item => (item.test_name || '').trim() === fullName).length
            : 0;
        }),
        backgroundColor: [
          '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#fbbf24', '#f87171', '#34d399', '#f472b6'
        ][idx % 8],
        borderRadius: 8,
        barPercentage: 0.7,
        categoryPercentage: 0.6,
        datalabels: {
          anchor: 'center',
          align: 'center',
          font: { weight: 'bold', size: 14 },
          color: '#22223b',
          formatter: v => v > 0 ? v : '',
        }
      };
    });
  }

  // --- Chart 3: TAT Days by Month (multi-select) ---
  const filteredTatData3 = masterSheetData.filter(item =>
    (selectedTatTestName3.length === 0 || selectedTatTestName3.includes(item.test_name)) &&
    (selectedTatYear3.length === 0 || selectedTatYear3.includes(String((item.registration_date || item.created_at || '').slice(0, 4)))) &&
    (!selectedTatMonth3 || (() => {
      const dateStr = item.registration_date || item.created_at;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return selectedTatMonth3 === tatMonthNames[date.getMonth()];
    })())
  );

  let tatXAxisLabels3 = [];
  let tatDatasets3 = [];

  if (selectedTatYear3.length > 0 && selectedTatMonth3) {
    // Show dates in the selected month
    const monthIdx = tatMonthNames.indexOf(selectedTatMonth3);
    const year = selectedTatYear3.length === 1 ? Number(selectedTatYear3[0]) : new Date().getFullYear();
    const daysInMonth = getDaysInMonth(monthIdx, year);
    tatXAxisLabels3 = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

    tatDatasets3 = (selectedTatTestName3.length > 0 ? selectedTatTestName3 : uniqueTestNames).map(testName => {
      const data = tatXAxisLabels3.map(day => {
        const arr = filteredTatData3.filter(item => {
          const dateStr = item.registration_date || item.created_at;
          if (!dateStr) return false;
          const date = new Date(dateStr);
          return (
            item.test_name === testName &&
            date.getMonth() === monthIdx &&
            date.getFullYear() === year &&
            date.getDate() === Number(day)
          );
        }).map(item => Number(item.tat_days));
        return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      });
      return { label: testName, data };
    });
  } else if (selectedTatTestName3.length > 0) {
    tatXAxisLabels3 = selectedTatTestName3;
    tatDatasets3 = (selectedTatYear3.length > 0 ? selectedTatYear3 : uniqueYears).map(year => {
      const data = selectedTatTestName3.map(testName => {
        const arr = filteredTatData3.filter(item => {
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
    tatXAxisLabels3 = tatMonthNames;
    tatDatasets3 = [{
      label: "TAT Days",
      data: tatMonthNames.map((month, idx) => {
        const arr = filteredTatData3.filter(item => {
          const dateStr = item.registration_date || item.created_at;
          if (!dateStr) return false;
          const date = new Date(dateStr);
          return date.getMonth() === idx;
        }).map(item => Number(item.tat_days));
        return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      })
    }];
  }

  // --- Chart 4: TAT Days by Month (multi-select, separate state) ---
  const filteredTatData4 = masterSheetData.filter(item =>
    (selectedTatTestName4.length === 0 || selectedTatTestName4.includes(item.test_name)) &&
    (selectedTatYear4.length === 0 || selectedTatYear4.includes(String((item.registration_date || item.created_at || '').slice(0, 4)))) &&
    (!selectedTatMonth4 || (() => {
      const dateStr = item.registration_date || item.created_at;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return selectedTatMonth4 === tatMonthNames[date.getMonth()];
    })())
  );

  let tatXAxisLabels4 = [];
  let tatDatasets4 = [];

  if (selectedTatYear4.length > 0 && selectedTatMonth4) {
    // Show dates in the selected month
    const monthIdx = tatMonthNames.indexOf(selectedTatMonth4);
    const year = selectedTatYear4.length === 1 ? Number(selectedTatYear4[0]) : new Date().getFullYear();
    const daysInMonth = getDaysInMonth(monthIdx, year);
    tatXAxisLabels4 = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

    tatDatasets4 = (selectedTatTestName4.length > 0 ? selectedTatTestName4 : uniqueTestNames).map(testName => {
      const data = tatXAxisLabels4.map(day => {
        const arr = filteredTatData4.filter(item => {
          const dateStr = item.registration_date || item.created_at;
          if (!dateStr) return false;
          const date = new Date(dateStr);
          return (
            item.test_name === testName &&
            date.getMonth() === monthIdx &&
            date.getFullYear() === year &&
            date.getDate() === Number(day)
          );
        }).map(item => Number(item.tat_days));
        return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      });
      return { label: testName, data };
    });
  } else if (selectedTatTestName4.length > 0) {
    tatXAxisLabels4 = selectedTatTestName4;
    tatDatasets4 = (selectedTatYear4.length > 0 ? selectedTatYear4 : uniqueYears).map(year => {
      const data = selectedTatTestName4.map(testName => {
        const arr = filteredTatData4.filter(item => {
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
    tatXAxisLabels4 = tatMonthNames;
    tatDatasets4 = [{
      label: "TAT Days",
      data: tatMonthNames.map((month, idx) => {
        const arr = filteredTatData4.filter(item => {
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

  // Chart rendering logic
  useEffect(() => {
    // Chart 2: Grouped Bar
    if (chart1Instance.current) chart1Instance.current.destroy();
    chart1Instance.current = new Chart(chart1Ref.current, {
      type: 'bar',
      data: {
        labels: runIdXAxisLabels,
        datasets: runIdChartData.map((ds, idx) => ({
          ...ds,
          backgroundColor: [
            '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#fbbf24', '#f87171', '#34d399', '#f472b6'
          ][idx % 8],
          borderRadius: 8,
          barPercentage: 0.7,
          categoryPercentage: 0.6,
          datalabels: {
            anchor: 'center',
            align: 'center',
            font: { weight: 'bold', size: 14 },
            color: '#22223b',
            formatter: v => v > 0 ? v : '',
          }
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'right' },
          tooltip: {
            enabled: true,
            mode: 'nearest',
            intersect: true,
            callbacks: {
              label: function () { return ''; }
            },
            usePointStyle: true,
            displayColors: false,
            external: function (context) {
              let tooltipEl = document.getElementById('chartjs-tooltip');
              if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.id = 'chartjs-tooltip';
                document.body.appendChild(tooltipEl);
              }
              const tooltipModel = context.tooltip;
              if (tooltipModel.opacity === 0) {
                tooltipEl.style.opacity = 0;
                tooltipEl.style.left = '-9999px';
                tooltipEl.style.top = '-9999px';
                return;
              }
              const runId = tooltipModel.dataPoints?.[0]?.label;
              const testMap = runIdTestNameMap[runId] || {};
              let table = '<table style="min-width:120px">';
              table += '<thead><tr><th style="text-align:left;padding-right:8px">Test Name</th><th style="text-align:right">Count</th></tr></thead><tbody>';
              Object.entries(testMap).forEach(([testName, count]) => {
                table += `<tr><td style="text-align:left;padding-right:8px">${testName}</td><td style="text-align:right">${count}</td></tr>`;
              });
              table += '</tbody></table>';
              tooltipEl.innerHTML = table;

              const position = context.chart.canvas.getBoundingClientRect();
              tooltipEl.style.opacity = 1;
              tooltipEl.style.position = 'absolute';
              tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
              tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 30 + 'px';
              tooltipEl.style.pointerEvents = 'none';
              tooltipEl.style.background = 'white';
              tooltipEl.style.border = '1px solid #ddd';
              tooltipEl.style.borderRadius = '8px';
              tooltipEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
              tooltipEl.style.padding = '8px';
              tooltipEl.style.zIndex = 100;
            }
          },
          datalabels: { display: true }
        },
        scales: {
          x: {
            title: { display: true, text: "" },
            stacked: false,
            ticks: {
              font: { size: 12, weight: 'bold' },
              color: '#374151',
              maxRotation: 0,
              minRotation: 0,
            },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: "Sample Count" },
            ticks: { font: { size: 14, weight: 'bold' }, color: '#374151' },
            grid: {
              color: '#e5e7eb',
              borderDash: [4, 4],
              drawTicks: false,
              drawBorder: false,
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });

    // Chart 1: Test Name Distribution
    if (chart2Instance.current) chart2Instance.current.destroy();
    chart2Instance.current = new Chart(chart2Ref.current, {
      type: 'bar',
      data: {
        labels: chart2XAxisLabels,
        datasets: chart2Datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'right',
            onClick: (e, legendItem, legend) => {
              const chart = legend.chart;
              const datasets = chart.data.datasets;
              const clickedIndex = legendItem.datasetIndex;

              if (legendItem.showAll) {
                // Show all datasets
                datasets.forEach((ds, i) => {
                  chart.setDatasetVisibility(i, true);
                });
                chart.update();
                return;
              }

              // Hide all datasets except the clicked one
              datasets.forEach((ds, i) => {
                chart.setDatasetVisibility(i, i === clickedIndex);
              });
              chart.update();
            },
            labels: {
              font: { weight: 'bold' },
              color: '#22223b',
              generateLabels: function (chart) {
                const datasets = chart.data.datasets;
                // Add "Show All" at the top
                const showAllItem = {
                  text: 'Show All',
                  fillStyle: 'transparent',
                  hidden: false,
                  datasetIndex: null,
                  showAll: true // Custom flag
                };
                const datasetItems = datasets.map((ds, i) => ({
                  text: ds.label,
                  fillStyle: ds.backgroundColor,
                  hidden: !chart.isDatasetVisible(i),
                  datasetIndex: i
                }));
                return [showAllItem, ...datasetItems];
              }
            }
          },
          tooltip: { enabled: true },
          datalabels: { display: true }
        },
        scales: {
          x: {
            title: { display: true, text: "" },
            stacked: false,
            ticks: {
              autoSkip: false,
              font: { size: 12, weight: 'bold' },
              color: '#374151',
              maxRotation: 0,
              minRotation: 0,
            },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: "Sample Count" },
            ticks: { font: { size: 14, weight: 'bold' }, color: '#374151' },
            grid: {
              color: '#e5e7eb',
              borderDash: [4, 4],
              drawTicks: false,
              drawBorder: false,
            }
          }
        },
        onHover: (event, chartElement) => {
          event.native.target.style.cursor = chartElement.length ? 'pointer' : 'default';
        }
      },
      plugins: [ChartDataLabels]
    });

    // Chart 3: TAT Days by Month
    if (chart3Instance.current) chart3Instance.current.destroy();
    chart3Instance.current = new Chart(chart3Ref.current, {
      type: 'bar',
      data: {
        labels: tatXAxisLabels3,
        datasets: tatDatasets3.map((ds, idx) => ({
          ...ds,
          borderColor: [
            '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#fbbf24', '#f87171', '#34d399', '#f472b6'
          ][idx % 8],
          backgroundColor: [
            '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#fbbf24', '#f87171', '#34d399', '#f472b6'
          ][idx % 8] + '33',
          borderWidth: 3,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: [
            '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#fbbf24', '#f87171', '#34d399', '#f472b6'
          ][idx % 8],
          datalabels: {
            anchor: 'center',
            align: 'center',
            font: { weight: 'bold', size: 14 },
            color: '#22223b',
            formatter: v => v > 0 ? v.toFixed(1) : '',
          }
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'right' },
          tooltip: { enabled: true },
          datalabels: { display: true }
        },
        scales: {
          x: {
            title: { display: true, text: "" },
            ticks: { font: { size: 12, weight: 'bold' }, color: '#374151' },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: "TAT Days" },
            ticks: { font: { size: 14, weight: 'bold' }, color: '#374151' },
            grid: {
              color: '#e5e7eb',
              borderDash: [4, 4],
              drawTicks: false,
              drawBorder: false,
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });

    //   // Chart 4: TAT Days by Month (separate state)
    //   if (chart4Instance.current) chart4Instance.current.destroy();
    //   chart4Instance.current = new Chart(chart4Ref.current, {
    //     type: 'bar',
    //     data: {
    //       labels: tatXAxisLabels4,
    //       datasets: tatDatasets4.map((ds, idx) => ({
    //         ...ds,
    //         borderColor: [
    //           '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#fbbf24', '#f87171', '#34d399', '#f472b6'
    //         ][idx % 8],
    //         backgroundColor: [
    //           '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#fbbf24', '#f87171', '#34d399', '#f472b6'
    //         ][idx % 8] + '33',
    //         borderWidth: 3,
    //         tension: 0.3,
    //         pointRadius: 5,
    //         pointBackgroundColor: [
    //           '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#fbbf24', '#f87171', '#34d399', '#f472b6'
    //         ][idx % 8],
    //         datalabels: {
    //           anchor: 'center',
    //           align: 'center',
    //           font: { weight: 'bold', size: 14 },
    //           color: '#22223b',
    //           formatter: v => v > 0 ? v.toFixed(1) : '',
    //         }
    //       }))
    //     },
    //     options: {
    //       responsive: true,
    //       maintainAspectRatio: false,
    //       plugins: {
    //         legend: { display: true, position: 'right' },
    //         tooltip: { enabled: true },
    //         datalabels: { display: true }
    //       },
    //       scales: {
    //         x: {
    //           title: { display: true, text: "" },
    //           ticks: { font: { size: 12, weight: 'bold' }, color: '#374151' },
    //           grid: { display: false }
    //         },
    //         y: {
    //           beginAtZero: true,
    //           title: { display: true, text: "TAT Days" },
    //           ticks: { font: { size: 14, weight: 'bold' }, color: '#374151' },
    //           grid: {
    //             color: '#e5e7eb',
    //             borderDash: [4, 4],
    //             drawTicks: false,
    //             drawBorder: false,
    //           }
    //         }
    //       }
    //     },
    //     plugins: [ChartDataLabels]
    //   });

    //   const canvas = chart1Ref.current;
    //   const hideTooltip = () => {
    //     const tooltipEl = document.getElementById('chartjs-tooltip');
    //     if (tooltipEl) {
    //       tooltipEl.style.opacity = 0;
    //       tooltipEl.style.left = '-9999px';
    //       tooltipEl.style.top = '-9999px';
    //     }
    //   };
    //   if (canvas) {
    //     canvas.addEventListener('mouseleave', hideTooltip);
    //   }

    //   // Cleanup
    //   return () => {
    //     if (chart1Instance.current) chart1Instance.current.destroy();
    //     if (canvas) {
    //       canvas.removeEventListener('mouseleave', hideTooltip);
    //     }
    //     // Remove tooltip element from DOM
    //     const tooltipEl = document.getElementById('chartjs-tooltip');
    //     if (tooltipEl) tooltipEl.remove();
    //   };
    // }, [
    //   runIdXAxisLabels, runIdChartData,
    //   chart2XAxisLabels, chart2Datasets,
    //   tatXAxisLabels3, tatDatasets3,
    //   tatXAxisLabels4, tatDatasets4,
    //   funnelChartData,
    //   selectedTestName1, selectedYear1, selectedMonth1,
    //   selectedRunId2, selectedYear2, selectedMonth2,
    //   selectedTatTestName3, selectedTatYear3, selectedTatMonth3,
    //   selectedTatTestName4, selectedTatYear4, selectedTatMonth4
    // ]);

    // Chart 4: Bar (Sample Funnel)
    if (chart4Instance.current) chart4Instance.current.destroy();
    chart4Instance.current = new Chart(chart4Ref.current, {
      type: 'bar',
      data: {
        labels: funnelChartData.map(item => item.label),
        datasets: [{
          label: "Sample Funnel",
          data: funnelChartData.map(item => item.value),
          backgroundColor: [
            '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'
          ],
          borderRadius: 8,
          barPercentage: 0.7,
          categoryPercentage: 0.6,
          datalabels: {
            anchor: 'center',
            align: 'center',
            font: { weight: 'bold', size: 16 },
            color: '#22223b',
            formatter: v => v > 0 ? v : '',
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
          datalabels: { display: true }
        },
        scales: {
          x: {
            title: { display: true, text: "" },
            ticks: {
              font: { size: 14, weight: 'bold' },
              color: '#374151',
            },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            title: { display: true, text: "Sample Count" },
            ticks: { font: { size: 14, weight: 'bold' }, color: '#374151' },
            grid: {
              color: '#e5e7eb',
              borderDash: [4, 4],
              drawTicks: false,
              drawBorder: false,
            }
          }
        }
      },
      plugins: [ChartDataLabels]
    });

    const canvas = chart1Ref.current;
    const hideTooltip = () => {
      const tooltipEl = document.getElementById('chartjs-tooltip');
      if (tooltipEl) {
        tooltipEl.style.opacity = 0;
        tooltipEl.style.left = '-9999px';
        tooltipEl.style.top = '-9999px';
      }
    };
    if (canvas) {
      canvas.addEventListener('mouseleave', hideTooltip);
    }

    // Cleanup
    return () => {
      if (chart1Instance.current) chart1Instance.current.destroy();
      if (canvas) {
        canvas.removeEventListener('mouseleave', hideTooltip);
      }
      // Remove tooltip element from DOM
      const tooltipEl = document.getElementById('chartjs-tooltip');
      if (tooltipEl) tooltipEl.remove();
    };
  }, [
    runIdXAxisLabels, runIdChartData,
    chart2XAxisLabels, chart2Datasets,
    tatXAxisLabels3, tatDatasets3,
    tatXAxisLabels4, tatDatasets4,
    funnelChartData,
    selectedTestName1, selectedYear1, selectedMonth1,
    selectedRunId2, selectedYear2, selectedMonth2,
    selectedTatTestName3, selectedTatYear3, selectedTatMonth3,
    selectedTatTestName4, selectedTatYear4, selectedTatMonth4
  ]);

  // Dropdown rendering helper
  function renderDropdowns(dropdowns, stacked = false) {
    return (
      <div className={`mb-4 ${stacked ? 'flex flex-col gap-2 items-end' : 'flex flex-wrap gap-4 items-center justify-end'}`}>
        {dropdowns.map((dropdown, idx) => (
          <DropdownMenu key={idx}>
            <DropdownMenuTrigger asChild>
              <button
                className="min-w-[180px] max-w-xs border-2 border-indigo-500 dark:border-indigo-300 text-gray-700 p-2 px-4 rounded-lg dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md font-semibold text-left truncate"
                type="button"
              >
                {dropdown.value && Array.isArray(dropdown.value)
                  ? dropdown.value.length > 0 ? dropdown.value.join(', ') : dropdown.label
                  : dropdown.value || dropdown.label}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="min-w-[180px] max-w-xs whitespace-normal">
              <DropdownMenuLabel>{dropdown.label}</DropdownMenuLabel>
              <DropdownMenuItem
                key="__clear__"
                onSelect={() => dropdown.onChange(Array.isArray(dropdown.value) ? [] : "")}
                className={`whitespace-normal break-words ${dropdown.value && ((Array.isArray(dropdown.value) && dropdown.value.length === 0) || dropdown.value === "") ? "font-bold bg-indigo-100 dark:bg-indigo-900" : ""}`}
              >
                Clear
              </DropdownMenuItem>
              {dropdown.options.map(opt => (
                <DropdownMenuItem
                  key={opt}
                  onSelect={() => {
                    if (Array.isArray(dropdown.value)) {
                      let newValue = [...dropdown.value];
                      if (newValue.includes(opt)) {
                        newValue = newValue.filter(v => v !== opt);
                      } else {
                        newValue.push(opt);
                      }
                      dropdown.onChange(newValue);
                    } else {
                      dropdown.onChange(opt);
                    }
                  }}
                  className={`whitespace-normal break-words ${(Array.isArray(dropdown.value) && dropdown.value.includes(opt)) ||
                    dropdown.value === opt
                    ? "font-bold bg-indigo-100 dark:bg-indigo-900"
                    : ""
                    }`}
                >
                  {opt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    );
  }

  return (
    <>
      <RouteLoader />
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* Chart 1 */}
        <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md">
          <div className="flex w-full items-center justify-between mb-2">
            {renderDropdowns([
              {
                label: "Select Test Name",
                options: uniqueTestNames,
                value: selectedTestName1,
                onChange: setSelectedTestName1,
              },
              {
                label: "Select Month",
                options: ["", ...tatMonthNames],
                value: selectedMonth1,
                onChange: setSelectedMonth1
              },
              {
                label: "Select Year",
                options: yearOptions,
                value: selectedYear1,
                onChange: setSelectedYear1,
              }
            ], false)}
          </div>
          <div className="w-full h-[340px] flex items-center justify-center">
            <canvas ref={chart2Ref} className="!bg-transparent" />
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md">
          <div className="flex w-full items-center justify-between mb-2">
            {renderDropdowns([
              {
                label: "Select Run Id",
                options: runIds,
                value: selectedRunId2,
                onChange: setSelectedRunId2,
              },
              {
                label: "Select Month",
                options: ["", ...tatMonthNames],
                value: selectedMonth2,
                onChange: setSelectedMonth2
              },
              {
                label: "Select Year",
                options: yearOptions,
                value: selectedYear2,
                onChange: setSelectedYear2
              }
            ])}
          </div>
          <div className="w-full h-[340px] flex items-center justify-center">
            <canvas ref={chart1Ref} className="!bg-transparent" />
          </div>
        </div>

        {/* Chart 3 */}
        <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md">
          <div className="flex w-full items-center justify-between mb-2">
            {renderDropdowns([
              {
                label: "Select Test Name",
                options: uniqueTestNames,
                value: selectedTatTestName3,
                onChange: setSelectedTatTestName3
              },
              {
                label: "Select Month",
                options: tatMonthNames,
                value: selectedTatMonth3,
                onChange: setSelectedTatMonth3
              },
              {
                label: "Select Year",
                options: yearOptions,
                value: selectedTatYear3,
                onChange: setSelectedTatYear3
              }
            ], false)}
          </div>
          <div className="w-full h-[340px] flex items-center justify-center">
            <canvas ref={chart3Ref} className="!bg-transparent" />
          </div>
        </div>

        {/* Chart 4 */}
        <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md">
          <div className="flex w-full items-center justify-between mb-2">
            {renderDropdowns([
              {
                label: "Select Test Name",
                options: uniqueTestNames,
                value: selectedTatTestName4,
                onChange: setSelectedTatTestName4
              },
              {
                label: "Select Month",
                options: tatMonthNames,
                value: selectedTatMonth4,
                onChange: setSelectedTatMonth4
              },
              {
                label: "Select Year",
                options: yearOptions,
                value: selectedTatYear4,
                onChange: setSelectedTatYear4
              }
            ], false)}
          </div>
          <div className="w-full h-[400px] flex items-center justify-center">
            <canvas ref={chart4Ref} className="!bg-transparent" />
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
};

export default Page;