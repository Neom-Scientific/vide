'use client'
import React, { useRef, useEffect } from 'react'
import { Chart } from 'chart.js/auto'

const Page = () => {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }
    const ctx = chartRef.current.getContext('2d')
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [
          {
            label: 'Monthly Sales',
            data: [120, 340, 180, 270, 150, 200, 250, 100, 180, 350, 220, 80],
            backgroundColor: 'rgba(54, 99, 235, 0.7)',
            borderRadius: 6,
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true, grid: { color: '#eee' } },
          x: { grid: { display: false } },
        },
      },
    })
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [])

  return (
    <div>
      <div className='grid grid-cols-12 gap-4'>
        <div className='col-span-8'>
          <div className="col-span-4">
            <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md flex flex-col items-center">
              <div className='text-gray-400 text-lg dark:text-gray-100'>TRFs Submitted</div>
              <div className='text-3xl font-bold text-gray-800 dark:text-gray-200'>120</div>
              <div className='text-gray-400 text-lg dark:text-gray-100'>Last 30 days</div>
            </div>
          </div>
          <div className="col-span-4">
            <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md flex flex-col items-center">
              <div className='text-gray-400 text-lg dark:text-gray-100'>TRFs Submitted</div>
              <div className='text-3xl font-bold text-gray-800 dark:text-gray-200'>120</div>
              <div className='text-gray-400 text-lg dark:text-gray-100'>Last 30 days</div>
            </div>
          </div>
          {/* Second row: one centered card */}
          <div className="col-span-3 col-start-5">
            <div className="bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md flex flex-col items-center">
              <div className='text-gray-400 text-lg dark:text-gray-100'>TRFs Submitted</div>
              <div className='text-3xl font-bold text-gray-800 dark:text-gray-200'>120</div>
              <div className='text-gray-400 text-lg dark:text-gray-100'>Last 30 days</div>
            </div>
          </div>
        </div>
        <div className='col-span-4'>
          <div className='bg-white dark:bg-gray-900 dark:text-white border-2 border-black dark:border-white rounded-lg p-4 shadow-md'>
            <canvas ref={chartRef} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Page