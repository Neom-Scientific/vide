'use client'
import React, { useRef, useEffect, useState } from 'react'
import { Chart } from 'chart.js/auto'
import axios from 'axios'
import Cookies from 'js-cookie'
import { toast, ToastContainer } from 'react-toastify'

const Page = () => {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const secondChartRef = useRef(null); // Ref for the second chart
  const secondChartInstanceRef = useRef(null); // Instance for the second chart
  const thirdChartRef = useRef(null); // Ref for the third chart
  const thirdChartInstanceRef = useRef(null); // Instance for the third chart
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
        } else {
          // toast.error(response.data[0].message || 'Failed to fetch master sheet data');
        }
      } catch (error) {
        console.error('Error fetching master sheet data:', error);
      }
    };
    fetchMasterSheetData();
  }
    , []);
  useEffect(() => {
    const handleFetchData = async () => {
      try {
        const response = await axios.get(`/api/run-setup?hospital_name=${user.hospital_name}`);
        if (response.data[0].status === 200) {
          const data = response.data[0].data || [];
          setPoolData(data);
        } else {
          // toast.error(response.data[0].message || 'Failed to fetch data');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    handleFetchData();
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy(); // Destroy the previous chart instance
    }

    const ctx = chartRef.current.getContext('2d');

    // Parse table_data and group data by applications for each run_id
    const applications = {}; // Store unique applications
    const datasets = []; // Store datasets for the chart

    poolData.forEach(item => {
      let tableData;

      // Handle both string and object formats for table_data
      try {
        tableData = typeof item.table_data === 'string' ? JSON.parse(item.table_data) : item.table_data || [];
      } catch (error) {
        console.error('Error parsing table_data:', error);
        tableData = []; // Fallback to an empty array if parsing fails
      }

      tableData.forEach(app => {
        const appName = app.test_name;
        if (!applications[appName]) {
          applications[appName] = []; // Initialize application data
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

    // Create datasets for each application
    Object.keys(applications).forEach((appName, index) => {
      const data = poolData.map(item => {
        const appData = applications[appName].find(app => app.run_id === item.run_id);
        return appData ? appData.sample_count : 0; // Use sample_count or 0 if not found
      });

      datasets.push({
        label: appName, // Application name
        data,
        backgroundColor: predefinedColors[index % predefinedColors.length], // Use predefined colors
        borderRadius: 6,
      });
    });

    const labels = poolData.map(item => item.run_id || 'N/A'); // Use run_id for labels

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels, // Use run_id for labels
        datasets, // Use datasets for applications
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Sample Count by Application per Run ID', // Chart title
            font: { size: 18 },
          },
          legend: { display: true }, // Display legend for applications
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`; // Show application name and sample count
              },
            },
          },
        },
        scales: {
          y: {
            stacked: true, // Enable stacked bars
            beginAtZero: true,
            ticks: {
              stepSize: 1, // Ensure the y-axis increments by 1
              callback: function (value) {
                return Number.isInteger(value) ? value : ''; // Display only integer values
              },
            },
          },
          x: {
            stacked: true, // Enable stacked bars
            grid: { display: false },
          },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy(); // Cleanup chart instance
      }
    };
  }, [poolData]);

  useEffect(() => {
    if (secondChartInstanceRef.current) {
      secondChartInstanceRef.current.destroy(); // Destroy the previous second chart instance
    }

    const ctx = secondChartRef.current.getContext('2d');

    secondChartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: poolData.map(item => item.run_id || 'N/A'), // Use run_id for labels
        datasets: [
          {
            label: 'Total GB Available',
            data: poolData.map(item => item.total_gb_available || 0), // Use total_gb_available for data
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderRadius: 6,
          },
          {
            label: 'Total Required',
            data: poolData.map(item => item.total_required || 0), // Use total_required for data
            backgroundColor: 'rgba(255, 159, 64, 0.7)', // Different color for the second dataset
            borderRadius: 6,
          },
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Total GB Available vs Total Required per Run ID', // Chart title
            font: { size: 18 },
          },
          legend: { display: true }, // Display legend for both datasets
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 10, // Adjust step size for larger values
            },
          },
          x: { grid: { display: false } },
        },
      },
    });

    return () => {
      if (secondChartInstanceRef.current) {
        secondChartInstanceRef.current.destroy(); // Cleanup second chart instance
      }
    };
  }, [poolData]);

  useEffect(() => {
    if (thirdChartInstanceRef.current) {
      thirdChartInstanceRef.current.destroy(); // Destroy the previous third chart instance
    }

    const ctx = thirdChartRef.current.getContext('2d');

    // Group data by sample_id and count "Yes" and "No" values for each column
    const countsBySampleId = {};

    masterSheetData.forEach(item => {
      const sampleId = item.sample_id;
      if (!countsBySampleId[sampleId]) {
        countsBySampleId[sampleId] = {
          dna_isolation: { Yes: 0, No: 0 },
          lib_prep: { Yes: 0, No: 0 },
          under_seq: { Yes: 0, No: 0 },
          seq_completed: { Yes: 0, No: 0 },
        };
      }

      countsBySampleId[sampleId].dna_isolation[item.dna_isolation] += 1;
      countsBySampleId[sampleId].lib_prep[item.lib_prep] += 1;
      countsBySampleId[sampleId].under_seq[item.under_seq] += 1;
      countsBySampleId[sampleId].seq_completed[item.seq_completed] += 1;
    });

    // Aggregate counts across all sample_ids
    const aggregatedCounts = {
      dna_isolation: { Yes: 0 },
      lib_prep: { Yes: 0 },
      under_seq: { Yes: 0 },
      seq_completed: { Yes: 0 },
    };

    Object.values(countsBySampleId).forEach(sampleCounts => {
      aggregatedCounts.dna_isolation.Yes += sampleCounts.dna_isolation.Yes;
      // aggregatedCounts.dna_isolation.No += sampleCounts.dna_isolation.No;
      aggregatedCounts.lib_prep.Yes += sampleCounts.lib_prep.Yes;
      // aggregatedCounts.lib_prep.No += sampleCounts.lib_prep.No;
      aggregatedCounts.under_seq.Yes += sampleCounts.under_seq.Yes;
      // aggregatedCounts.under_seq.No += sampleCounts.under_seq.No;
      aggregatedCounts.seq_completed.Yes += sampleCounts.seq_completed.Yes;
      // aggregatedCounts.seq_completed.No += sampleCounts.seq_completed.No;
    });

    // Prepare data for the pie chart
    const pieData = {
      labels: [
        'DNA Isolation',
        // 'DNA Isolation No',
        'Library Prep',
        // 'Library Prep No',
        'Under Seq',
        // 'Under Seq No',
        'Seq Completed',
        // 'Seq Completed No',
      ],
      datasets: [
        {
          data: [
            aggregatedCounts.dna_isolation.Yes,
            // aggregatedCounts.dna_isolation.No,
            aggregatedCounts.lib_prep.Yes,
            // aggregatedCounts.lib_prep.No,
            aggregatedCounts.under_seq.Yes,
            // aggregatedCounts.under_seq.No,
            aggregatedCounts.seq_completed.Yes,
            // aggregatedCounts.seq_completed.No,
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',  // Red
            // 'rgba(255, 159, 64, 0.8)',  // Orange
            'rgba(54, 162, 235, 0.8)',  // Blue
            // 'rgba(75, 192, 192, 0.8)',  // Green
            'rgba(255, 205, 86, 0.8)',  // Yellow
            // 'rgba(153, 102, 255, 0.8)', // Purple
            'rgba(255, 105, 180, 0.8)', // Pink
            // 'rgba(201, 203, 207, 0.8)', // Gray
          ],
        },
      ],
    };

    // Render the pie chart
    thirdChartInstanceRef.current = new Chart(ctx, {
      type: 'pie',
      data: pieData,
      options: {
        plugins: {
          title: {
            display: true,
            text: 'Sample Indicators', // Chart title
            font: { size: 18 },
          },
          legend: {
            display: true,
            position: 'bottom',
          },
        },
      },
    });

    return () => {
      if (thirdChartInstanceRef.current) {
        thirdChartInstanceRef.current.destroy(); // Cleanup third chart instance
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
      <div className="mt-4">

      </div>
      <ToastContainer />
    </div>
  );
};

export default Page;