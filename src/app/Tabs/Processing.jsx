import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const Processing = () => {

  // Dummy data for table
  const rows = [
    { sampleId: 'S001', patientName: 'John Doe', regDate: '2024-05-21', testName: 'WES', clientName: 'Client A', dnaIsolation: 'Completed', libraryPreparation: 'In Progress', underSequencing: 'No', sequencingCompleted: 'No' },
    { sampleId: 'S002', patientName: 'Jane Smith', regDate: '2024-05-22', testName: 'CS', clientName: 'Client B', dnaIsolation: 'Completed', libraryPreparation: 'Completed', underSequencing: 'Yes', sequencingCompleted: 'No' },
    { sampleId: 'S003', patientName: 'Alice Johnson', regDate: '2024-05-23', testName: 'Myeloid', clientName: 'Client C', dnaIsolation: 'In Progress', libraryPreparation: 'No', underSequencing: 'No', sequencingCompleted: 'No' },
  ];

  return (
    <div className="p-4">
      {/* Top Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-4 gap-4 mb-2">
          <div>
            <label className="block font-semibold mb-1">Sample id</label>
            <Input
              placeholder="Sample id"
              className="my-1"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Test name</label>
            <div className='flex gap-10'>

              <select

                className="w-full border rounded-md p-2 dark:bg-gray-800"
              >
                <option value="">Select the Test Name</option>
                <option className='dark:text-white' value='WES'>WES</option>
                <option className='dark:text-white' value='CS'>CS</option>
                <option className='dark:text-white' value='Myeloid'>Myeloid</option>
                <option className='dark:text-white' value='Cardio'>Cardio</option>
                <option className='dark:text-white' value='SHS'>SHS</option>
                <option className='dark:text-white' value='SolidTumor Panel'>SolidTumor Panel</option>
                <option className='dark:text-white' value='Cardio Comprehensive'>Cardio Comprehensive (Screening Test)</option>
                <option className='dark:text-white' value='Cardio Metabolic Syndrome'>Cardio Metabolic Syndrome (Screening Test)</option>
                <option className='dark:text-white' value='Cardio Comprehensive Myopathy'>Cardio Comprehensive Myopathy</option>
              </select>
              <Button className=" bg-orange-500 text-white hover:bg-orange-600">Add</Button>
            </div>
          </div>
          <div>
            <label className="block font-semibold mb-1">Sample Status</label>
            <select
              className="w-full border rounded-md p-2 dark:bg-gray-800"
            >
              <option value="">Select Sample Status</option>
              <option value="processing">Under Processing</option>
              <option value="reporting">Ready for Reporting</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Sample Indicator</label>
            <select
              className="w-full border rounded-md p-2 dark:bg-gray-800"
            >
              <option value="">Select the Sample Indicator</option>
              <option value="dna">DNA Isolation</option>
              <option value="library">Library Prep</option>
              <option value="sequencing">Under sequencing</option>
              <option value="completed">Sequencing completed</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mb-2">
          <div>
            <label className="block font-semibold mb-1 mt-2">From Date</label>
            <Input
              type="date"
              className="my-1"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 mt-2">To Date</label>
            <Input
              type="date"
              className="my-1"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 mt-2">Doctor's Name</label>
            <Input
              placeholder="Doctor's Name"
              className="my-1"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 mt-2">Dept. Name</label>
            <Input
              placeholder="Dept. Name"
              className="my-1"
            />
          </div>
        </div>
        <div className='grid grid-cols-4 gap-4 mb-2 '>
          <div>
            <label className="block font-semibold mb-1">Run id</label>
            <Input
              placeholder="Run id"
              className="my-1"
            />
          </div>

          <div>
            <Button
              type='submit'
              className="mt-6 bg-gray-700 text-white hover:bg-gray-800 w-full">
              Retrieve
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 mb-6">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-orange-100 dark:bg-gray-800">
              <th className="border px-2 py-1">S. No.</th>
              <th className="border px-2 py-1">Sample id</th>
              <th className="border px-2 py-1">Patient Name</th>
              <th className="border px-2 py-1">Reg Date</th>
              <th className="border px-2 py-1">Test Name</th>
              <th className="border px-2 py-1">Client Name</th>
              <th className="border px-2 py-1">DNA Isolation</th>
              <th className="border px-2 py-1">Library Preparation</th>
              <th className="border px-2 py-1">Under Sequencing</th>
              <th className="border px-2 py-1">Sequencing completed</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-4 text-gray-400">No data</td>
              </tr>
            ) : (
              rows.map((row, idx) => (
                <tr key={row.sampleId}>
                  <td className="border px-2 py-1">{idx + 1}</td>
                  <td className="border px-2 py-1">{row.sampleId}</td>
                  <td className="border px-2 py-1">{row.patientName}</td>
                  <td className="border px-2 py-1">{row.regDate}</td>
                  <td className="border px-2 py-1">{row.testName}</td>
                  <td className="border px-2 py-1">{row.clientName}</td>

                  <td className="border px-2 py-1 text-center">
                    <div className="flex justify-center items-center">
                      <Input
                        type="checkbox"
                        className="accent-green-500 w-4 h-4"
                      />
                    </div>
                  </td>

                  <td className="border px-2 py-1 text-center">
                    <div className="flex justify-center items-center">
                      <Input
                        type="checkbox"
                        className="accent-green-500 w-4 h-4"
                      />
                    </div>
                  </td>

                  <td className="border px-2 py-1 text-center">
                    <div className="flex justify-center items-center">
                      <Input
                        type="checkbox"
                        className="accent-green-500 w-4 h-4"
                      />
                    </div>
                  </td>

                  <td className="border px-2 py-1 text-center">
                    <div className="flex justify-center items-center">
                      <Input
                        type="checkbox"
                        className="accent-green-500 w-4 h-4"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Notes and Save Button */}
      <div className="flex flex-row gap-4 items-end">
        <div className="flex-1 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded p-4 text-sm">
          <div className="font-semibold mb-1">Note:</div>
          <ul className="list-disc pl-5">
            <li>Connects sample ID to patient and test details</li>
            <li>Enables tracking across collection, processing, testing, and reporting</li>
            <li>Timestamped transitions and status logs</li>
            <li>Export logs in Excel</li>
            <li>Alerts if sample exceeds TAT thresholds</li>
          </ul>
        </div>
      </div>
      <Button className="bg-gray-700 mt-5 text-white hover:bg-gray-800 min-w-[120px] h-12">Save</Button>
    </div>
  )
}

export default Processing