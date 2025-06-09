'use client'
import React, { useRef, useEffect, useState } from 'react'
import { Chart } from 'chart.js/auto'
import axios from 'axios'
import Cookies from 'js-cookie'
import { toast, ToastContainer } from 'react-toastify'

const Page = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const secondChartRef = useRef(null);
  const secondChartInstanceRef = useRef(null);
  const thirdChartRef = useRef(null);
  const thirdChartInstanceRef = useRef(null);
  const user = JSON.parse(Cookies.get('user') || '{}');
  const [poolData, setPoolData] = useState([]);
  const [masterSheetData, setMasterSheetData] = useState([]);

  useEffect(() => {
    const fetchMasterSheetData = async () => {
      try {
        const response = await axios.get(`/api/store?role=${user.role}&hospital_name=${user.hospital_name}`);
        if (response.data[0].status === 200) {
          const data = response.data[0].data || [];
          setMasterSheetData(data);
        }
      } catch (error) {
        console.error('Error fetching master sheet data:', error);
      }
    };
    fetchMasterSheetData();
  }, [user.hospital_name]);

  useEffect(() => {
    const fetchPoolData = async () => {
      try {
        const response = await axios.get(`/api/run-setup?hospital_name=${user.hospital_name}&role=${user.role}`);
        if (response.data[0].status === 200) {
          const data = response.data[0].data || [];
          setPoolData(data);
        }
      } catch (error) {
        console.error('Error fetching pool data:', error);
      }
    };
    fetchPoolData();
  }, [user.hospital_name]);

  // First Chart: Bar Chart
  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');

    const applications = {};
    const datasets = [];

    poolData.forEach(item => {
      let tableData;
      try {
        tableData = typeof item.table_data === 'string' ? JSON.parse(item.table_data) : item.table_data || [];
      } catch (error) {
        console.error('Error parsing table_data:', error);
        tableData = [];
      }

      tableData.forEach(app => {
        const appName = app.test_name;
        if (!applications[appName]) {
          applications[appName] = [];
        }
        applications[appName].push({
          run_id: item.run_id,
          sample_count: app.sample_count || 0,
        });
      });
    });

    const predefinedColors = [
      'rgba(255, 99, 132, 0.8)',  // Red
      'rgba(255, 159, 64, 0.8)',  // Orange
      'rgba(54, 162, 235, 0.8)',  // Blue
      'rgba(75, 192, 192, 0.8)',  // Green
      'rgba(255, 205, 86, 0.8)',  // Yellow
      'rgba(153, 102, 255, 0.8)', // Purple
      'rgba(255, 105, 180, 0.8)', // Pink
    ];

    Object.keys(applications).forEach((appName, index) => {
      const data = poolData.map(item => {
        const appData = applications[appName].find(app => app.run_id === item.run_id);
        return appData ? appData.sample_count : 0;
      });

      datasets.push({
        label: appName,
        data,
        backgroundColor: predefinedColors[index % predefinedColors.length],
        borderRadius: 6,
      });
    });

    const labels = poolData.map(item => item.run_id || 'N/A');

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets,
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Sample Count by Application per Run ID',
            font: { size: 18 },
          },
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const hospitalName = user.role === 'SuperAdmin' && masterSheetData.length > 0
                  ? masterSheetData[0].hospital_name
                  : 'Unknown';
                return user.role === 'SuperAdmin'
                  ? `${tooltipItem.dataset.label}: ${tooltipItem.raw} (Hospital: ${hospitalName})`
                  : `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
              },
            },
          },
        },
        scales: {
          y: {
            stacked: true,
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: function (value) {
                return Number.isInteger(value) ? value : '';
              },
            },
          },
          x: {
            stacked: true,
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, [poolData, masterSheetData]);

  // Second Chart: Stacked Bar Chart
  useEffect(() => {
    if (secondChartInstanceRef.current) {
      secondChartInstanceRef.current.destroy();
    }

    const ctx = secondChartRef.current.getContext('2d');

    secondChartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: poolData.map(item => item.run_id || 'N/A'),
        datasets: [
          {
            label: 'Total GB Available',
            data: poolData.map(item => item.total_gb_available || 0),
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderRadius: 6,
          },
          {
            label: 'Total Required',
            data: poolData.map(item => item.total_required || 0),
            backgroundColor: 'rgba(255, 159, 64, 0.7)',
            borderRadius: 6,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Total GB Available vs Total Required per Run ID',
            font: { size: 18 },
          },
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const hospitalName = user.role === 'SuperAdmin' && masterSheetData.length > 0
                  ? masterSheetData[0].hospital_name
                  : 'Unknown';
                return user.role === 'SuperAdmin'
                  ? `${tooltipItem.dataset.label}: ${tooltipItem.raw} (Hospital: ${hospitalName})`
                  : `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 10,
            },
          },
          x: { grid: { display: false } },
        },
      },
    });

    return () => {
      if (secondChartInstanceRef.current) {
        secondChartInstanceRef.current.destroy();
      }
    };
  }, [poolData, masterSheetData]);

  // Third Chart: Pie Chart
  useEffect(() => {
    if (thirdChartInstanceRef.current) {
      thirdChartInstanceRef.current.destroy();
    }

    const ctx = thirdChartRef.current.getContext('2d');

    const aggregatedCounts = {
      dna_isolation: { Yes: 0 },
      lib_prep: { Yes: 0 },
      under_seq: { Yes: 0 },
      seq_completed: { Yes: 0 },
    };

    masterSheetData.forEach(item => {
      aggregatedCounts.dna_isolation.Yes += item.dna_isolation === 'Yes' ? 1 : 0;
      aggregatedCounts.lib_prep.Yes += item.lib_prep === 'Yes' ? 1 : 0;
      aggregatedCounts.under_seq.Yes += item.under_seq === 'Yes' ? 1 : 0;
      aggregatedCounts.seq_completed.Yes += item.seq_completed === 'Yes' ? 1 : 0;
    });

    const pieData = {
      labels: ['DNA Isolation', 'Library Prep', 'Under Seq', 'Seq Completed'],
      datasets: [
        {
          data: [
            aggregatedCounts.dna_isolation.Yes,
            aggregatedCounts.lib_prep.Yes,
            aggregatedCounts.under_seq.Yes,
            aggregatedCounts.seq_completed.Yes,
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',  // Red
            'rgba(54, 162, 235, 0.8)',  // Blue
            'rgba(255, 205, 86, 0.8)',  // Yellow
            'rgba(255, 105, 180, 0.8)', // Pink
          ],
        },
      ],
    };

    thirdChartInstanceRef.current = new Chart(ctx, {
      type: 'pie',
      data: pieData,
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Sample Status Distribution',
            font: { size: 18 },
          },
          legend: {
            display: true,
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const hospitalName = user.role === 'SuperAdmin' && masterSheetData.length > 0
                  ? masterSheetData[0].hospital_name
                  : 'Unknown';
                return user.role === 'SuperAdmin'
                  ? `${tooltipItem.label}: ${tooltipItem.raw} (Hospital: ${hospitalName})`
                  : `${tooltipItem.label}: ${tooltipItem.raw}`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (thirdChartInstanceRef.current) {
        thirdChartInstanceRef.current.destroy();
      }
    };
  }, [masterSheetData]);

  return (
    <div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md">
            <canvas ref={chartRef} />
          </div>
        </div>
        <div className="col-span-4">
          <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md">
            <canvas ref={secondChartRef} />
          </div>
        </div>
        <div className="col-span-4">
          <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md">
            <canvas ref={thirdChartRef} />
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Page;