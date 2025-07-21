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

Chart.register(...registerables);
Chart.register(FunnelController, TrapezoidElement);
Chart.register(ChartDataLabels);

const tatMonthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const Page = () => {
  const [masterSheetData, setMasterSheetData] = useState([]);
  const [poolData, setPoolData] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedChartMonth, setSelectedChartMonth] = useState("");
  // Multi-select states
  const [selectedRunId, setSelectedRunId] = useState([]);
  const [selectedTestName, setSelectedTestName] = useState([]);
  const [selectedYear, setSelectedYear] = useState([]);
  const [selectedChartRunId, setSelectedChartRunId] = useState([]);

  // TAT chart multi-select
  const [selectedTatTestName, setSelectedTatTestName] = useState([]);
  const [selectedTatMonth, setSelectedTatMonth] = useState(tatMonthNames[new Date().getMonth()]);
  const [selectedTatYear, setSelectedTatYear] = useState([]);

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
      return date ? new Date(date).getFullYear().toString() : null;
    }).filter(Boolean))
  ).sort((a, b) => b - a);

  // Update tableData when selectedRunId changes (multi-select)
  useEffect(() => {
    let runs;
    if (!selectedRunId || selectedRunId.length === 0) {
      runs = poolData; // Use all runs if none selected
    } else {
      runs = poolData.filter(item => selectedRunId.includes(item.run_id));
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
    console.log('parsedTable', parsedTable);
    setTableData(parsedTable);
  }, [selectedRunId, poolData]);

  // --- Chart 2: Sample Count by Test Name (grouped by run_id) ---

  const runIdXAxisLabels = selectedRunId.length > 0 ? selectedRunId : runIds;
  const allTestNamesInRuns = uniqueTestNames; // or however you define your test names

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
      anchor: 'end',
      align: 'top',
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
      (selectedTestName.length === 0 || selectedTestName.map(n => n.trim()).includes((item.test_name || '').trim())) &&
      (selectedYear.length === 0 || selectedYear.includes(String(date.getFullYear()))) &&
      (selectedChartRunId.length === 0 || selectedChartRunId.includes(item.run_id)) &&
      (!selectedChartMonth || selectedChartMonth === monthName)
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

  if (selectedChartMonth) {
    // Show dates in the selected month
    const monthIdx = tatMonthNames.indexOf(selectedChartMonth);
    const year = selectedYear.length === 1 ? Number(selectedYear[0]) : new Date().getFullYear();
    const daysInMonth = getDaysInMonth(monthIdx, year);
    chart2XAxisLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

    chart2Datasets = uniqueTestNames.map((testName, idx) => ({
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
        anchor: 'end',
        align: 'top',
        font: { weight: 'bold', size: 14 },
        color: '#22223b',
        formatter: v => v > 0 ? v : '',
      }
    }));
  } else if (selectedYear.length === 1) {
    // Show months in the selected year
    const year = Number(selectedYear[0]);
    chart2XAxisLabels = tatMonthNames;

    chart2Datasets = uniqueTestNames.map((testName, idx) => ({
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
        anchor: 'end',
        align: 'top',
        font: { weight: 'bold', size: 14 },
        color: '#22223b',
        formatter: v => v > 0 ? v : '',
      }
    }));
  } else {
    // Default: show test names on x-axis
    chart2XAxisLabels = selectedTestName.length > 0
      ? selectedTestName.map(n => n.trim())
      : uniqueTestNames;

    chart2Datasets = chart2XAxisLabels.map((testName, idx) => ({
      label: testName,
      data: chart2XAxisLabels.map((label, i) =>
        label === testName
          ? filteredChartData.filter(item => (item.test_name || '').trim() === testName).length
          : 0
      ),
      backgroundColor: [
        '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#fbbf24', '#f87171', '#34d399', '#f472b6'
      ][idx % 8],
      borderRadius: 8,
      barPercentage: 0.7,
      categoryPercentage: 0.6,
      datalabels: {
        anchor: 'end',
        align: 'top',
        font: { weight: 'bold', size: 14 },
        color: '#22223b',
        formatter: v => v > 0 ? v : '',
      }
    }));
  }

  // --- Chart 3: TAT Days by Month (multi-select) ---
  const filteredTatData = masterSheetData.filter(item =>
    (selectedTatTestName.length === 0 || selectedTatTestName.includes(item.test_name)) &&
    (selectedTatYear.length === 0 || selectedTatYear.includes(String((item.registration_date || item.created_at || '').slice(0, 4)))) &&
    (!selectedTatMonth || (() => {
      const dateStr = item.registration_date || item.created_at;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      return selectedTatMonth === tatMonthNames[date.getMonth()];
    })())
  );

  let tatXAxisLabels = [];
  let tatDatasets = [];

  if (selectedTatYear.length > 0 && selectedTatMonth) {
    // Show dates in the selected month
    const monthIdx = tatMonthNames.indexOf(selectedTatMonth);
    const year = selectedTatYear.length === 1 ? Number(selectedTatYear[0]) : new Date().getFullYear();
    const daysInMonth = getDaysInMonth(monthIdx, year);
    tatXAxisLabels = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

    tatDatasets = (selectedTatTestName.length > 0 ? selectedTatTestName : uniqueTestNames).map(testName => {
      const data = tatXAxisLabels.map(day => {
        const arr = filteredTatData.filter(item => {
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
  } else if (selectedTatTestName.length > 0) {
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

  // Chart rendering logic
  useEffect(() => {
    // Chart 2: Grouped Bar
    if (chart1Instance.current) chart1Instance.current.destroy();
    // console.log('runidchartdata', runIdChartData);
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
            anchor: 'end',
            align: 'top',
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
          legend: { display: true, position: 'right' },
          tooltip: { enabled: true },
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

    // Chart 3: TAT Days by Month
    if (chart3Instance.current) chart3Instance.current.destroy();
    chart3Instance.current = new Chart(chart3Ref.current, {
      type: 'line',
      data: {
        labels: tatXAxisLabels,
        datasets: tatDatasets.map((ds, idx) => ({
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
            anchor: 'end',
            align: 'top',
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
            anchor: 'end',
            align: 'top',
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
    tatXAxisLabels, tatDatasets,
    funnelChartData,
    selectedTestName,
    selectedYear, selectedChartMonth
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
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      {/* Chart 1 */}
      <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md">
        <div className="flex w-full items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-white ml-2">
            Test Name Distribution
          </h2>
          {renderDropdowns([
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
              label: "Select Month",
              options: ["", ...tatMonthNames], // "" means all months
              value: selectedChartMonth,
              onChange: (val) => setSelectedChartMonth(val)
            }
          ], true)}
        </div>
        <div className="w-full h-[340px] flex items-center justify-center">
          <canvas ref={chart2Ref} className="!bg-transparent" />
        </div>
      </div>

      {/* Chart 2 */}
      <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md">
        <div className="flex w-full items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-white ml-2">
            Sample Count by Runs
          </h2>
          {renderDropdowns([
            {
              label: "Select Run Id",
              options: runIds,
              value: selectedRunId,
              onChange: setSelectedRunId,
            }
          ])}
        </div>
        <div className="w-full h-[340px] flex items-center justify-center">
          <canvas ref={chart1Ref} className="!bg-transparent" />
        </div>
        {/* {selectedRunId.length === 1 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Test Names in {selectedRunId[0]}</h3>
            <table className="min-w-full bg-white border rounded shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Test Name</th>
                  <th className="px-4 py-2 text-left">Sample Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(runIdTestNameMap[selectedRunId[0]] || {}).map(([testName, count]) => (
                  <tr key={testName}>
                    <td className="px-4 py-2">{testName}</td>
                    <td className="px-4 py-2">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )} */}
      </div>

      {/* Chart 3 */}
      <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md">
        <div className="flex w-full items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-white ml-2">
            TAT Days by Month
          </h2>
          {renderDropdowns([
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
              onChange: (val) => setSelectedTatMonth(val)
            }
          ], true)}
        </div>
        <div className="w-full h-[340px] flex items-center justify-center">
          <canvas ref={chart3Ref} className="!bg-transparent" />
        </div>
      </div>

      {/* Chart 4 */}
      <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md">
        <div className="flex w-full items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-white ml-2">
            Sample Indicator
          </h2>
        </div>
        <div className="w-full h-[400px] flex items-center justify-center">
          <canvas ref={chart4Ref} className="!bg-transparent" />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Page;