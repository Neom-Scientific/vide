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
  const user = JSON.parse(Cookies.get('user') || '{}');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const handleFetchData = async () => {
      try {
        const response = await axios.get(`/api/run-setup?hospital_name=${user.hospital_name}`);
        if (response.data[0].status === 200) {
          const data = response.data[0].data || [];
          setChartData(data);
        } else {
          toast.error(response.data[0].message || 'Failed to fetch data');
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

    const applicationCounts = chartData.map(item => {
      const applications = item.selected_application ? item.selected_application.split(',') : [];
      return applications.length; // Count the number of applications
    });

    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.map(item => item.run_id || 'N/A'), // Use run_id for labels
        datasets: [
          {
            label: 'Sample Count',
            data: chartData.map(item => item.count || 0), // Use count for data
            backgroundColor: 'rgba(54, 99, 235, 0.7)',
            borderRadius: 6,
          },
          {
            label: 'Applications',
            data: applicationCounts, // Use application counts for data
            backgroundColor: 'rgba(255, 99, 132, 0.7)', // Different color for the second dataset
            borderRadius: 6,
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: true }, // Display legend for both datasets
          tooltip: {
            callbacks: {
              label: function (tooltipItem) {
                const index = tooltipItem.dataIndex; // Get the index of the hovered bar
                const datasetIndex = tooltipItem.datasetIndex; // Get the dataset index

                if (datasetIndex === 1) { // Check if the hovered dataset is "Applications"
                  const selectedApplications = chartData[index].selected_application || 'N/A'; // Get selected_application
                  return `Applications: ${selectedApplications}`; // Display selected_application in the tooltip
                }

                return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1, // Ensure the y-axis increments by 1
              callback: function (value) {
                return Number.isInteger(value) ? value : ''; // Display only integer values
              },
            },
          },
          x: { grid: { display: false } },
        },
      },
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy(); // Cleanup chart instance
      }
    };
  }, [chartData]);

  useEffect(() => {
    if (secondChartInstanceRef.current) {
      secondChartInstanceRef.current.destroy(); // Destroy the previous second chart instance
    }

    const ctx = secondChartRef.current.getContext('2d');

    secondChartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: chartData.map(item => item.run_id || 'N/A'), // Use run_id for labels
        datasets: [
          {
            label: 'Total GB Available',
            data: chartData.map(item => item.total_gb_available || 0), // Use total_gb_available for data
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderRadius: 6,
          },
          {
            label: 'Total Required',
            data: chartData.map(item => item.total_required || 0), // Use total_required for data
            backgroundColor: 'rgba(255, 159, 64, 0.7)', // Different color for the second dataset
            borderRadius: 6,
          },
        ],
      },
      options: {
        plugins: {
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
  }, [chartData]);

  return (
    <div>
      <div className='grid grid-cols-12 gap-4'>
        <div className='col-span-8'>
          <div className='bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md'>
            <canvas ref={chartRef} />
          </div>
        </div>
        <div className='col-span-4'>
          <div className='bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md'>
            <canvas ref={secondChartRef} />
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Page;