import { Form, FormField, FormControl } from '@/components/ui/form'
import { sum } from 'lodash'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  total_run: z.number().min(1, 'Total run must be at least 1'),
  per_run_seq_cost: z.number().min(1, 'Per run sequence cost must be at least 1'),
  total_seq_exp: z.number().min(1, 'Total sequence experiments must be at least 1'),
  per_flowcell_gb: z.number().min(1, 'Per flowcell GB must be at least 1'),
  total_gb: z.number().min(1, 'Total GB must be at least 1'),
  per_gb_cost: z.number().min(1, 'Per GB cost must be at least 1'),
})

const CostCalculator = () => {

  const form = useForm({
    defaultValues: {
      total_run: 1,
      per_run_seq_cost: 0,
      per_flowcell_gb: 0,
      total_seq_exp: 0,
      total_gb: 0,
      per_gb_cost: 0,
    }
  })
  const [inputs, setInputs] = useState(() => {
    const saved = localStorage.getItem('costCalculatorInputs')
    if (saved) {
      const loaded = JSON.parse(saved)
      return {
        total_run: Number(loaded.total_run) || 1,
        per_run_seq_cost: Number(loaded.per_run_seq_cost) || 0,
        per_flowcell_gb: Number(loaded.per_flowcell_gb) || 0,
      }
    }
    return {
      total_run: 1,
      per_run_seq_cost: 0,
      per_flowcell_gb: 0,
    }
  })

  const total_seq_exp = (Number(inputs.total_run) || 0) * (Number(inputs.per_run_seq_cost) || 0)
  const total_gb = (Number(inputs.total_run) || 0) * (Number(inputs.per_flowcell_gb) || 0)
  const per_gb_cost = total_gb ? Math.round(total_seq_exp / total_gb) : 0

  const [tableRows, setTableRows] = useState(() => {
    const saved = localStorage.getItem('costCalculatorTableRows')
    if (saved) return JSON.parse(saved)
    return [
      {
        application: '',
        sample_count: '',
        library_cost: '',
        total_lib_expense: '',
        patient_cost: '',
        billing: '',
        gb_per_sample: '',
        total_gb: '',
        cpt: '',
        cprt: '',
        percent_contribution_cpt_by_lib_cost: '',
        percent_contribution_cpt_by_seq_cost: '',
      },
    ]
  })

  useEffect(() => {
    const savedRows = localStorage.getItem('costCalculatorTableRows')
    if (savedRows) {
      setTableRows(JSON.parse(savedRows))
    }
  }, [])

  useEffect(() => {
    // Remove all keys starting with _editing before saving
    const rowsToSave = tableRows.map(row => {
      const cleanRow = {}
      Object.keys(row).forEach(key => {
        if (!key.startsWith('_editing')) {
          cleanRow[key] = row[key]
        }
      })
      return cleanRow
    })
    localStorage.setItem('costCalculatorTableRows', JSON.stringify(rowsToSave))
  }, [tableRows])

  useEffect(() => {
    const savedInputs = localStorage.getItem('costCalculatorInputs')
    if (savedInputs) {
      const loadedInputs = JSON.parse(savedInputs)
      const newInputs = {
        ...loadedInputs,
        total_run: Number(loadedInputs.total_run) || 1,
        per_run_seq_cost: Number(loadedInputs.per_run_seq_cost) || 0,
        per_flowcell_gb: Number(loadedInputs.per_flowcell_gb) || 0,
      }
      setInputs(newInputs)
      // Update form values as well
      form.setValue('total_run', newInputs.total_run)
      form.setValue('per_run_seq_cost', newInputs.per_run_seq_cost)
      form.setValue('per_flowcell_gb', newInputs.per_flowcell_gb)
    }
  }, [])

  useEffect(() => {
    setInputs(prev => ({
      ...prev,
      total_seq_exp,
      total_gb,
      per_gb_cost,
    }))
  }, [inputs.total_run, inputs.per_run_seq_cost, inputs.per_flowcell_gb])

  useEffect(() => {
    localStorage.setItem('costCalculatorInputs', JSON.stringify(inputs))
  }, [inputs])

  useEffect(() => {
    setTableRows(rows =>
      rows.map((row, idx) => {
        // Recalculate derived fields for each row
        const sample_count = Number(row.sample_count) || 0
        const library_cost = Number(row.library_cost) || 0
        const patient_cost = Number(row.patient_cost) || 0
        const gb_per_sample = Number(row.gb_per_sample) || 0

        const total_lib_expense = sample_count * library_cost
        const billing = sample_count * patient_cost
        const total_gb = (gb_per_sample * sample_count).toFixed(2)
        const cpt = (library_cost + (per_gb_cost * gb_per_sample)).toFixed(2)
        const total_sample_count = rows.reduce((sum, r, index) => sum + (Number(r.sample_count) || 0), 0)
        const cprt = (library_cost + (total_seq_exp / (total_sample_count || 1))).toFixed(2)
        const percent_contribution_cpt_by_lib_cost = total_lib_expense ? ((library_cost / Number(cpt)) * 100).toFixed(2) : 0
        const percent_contribution_cpt_by_seq_cost = total_gb ? (((per_gb_cost * gb_per_sample) / Number(cpt)) * 100).toFixed(2) : 0

        return {
          ...row,
          total_lib_expense: total_lib_expense ? total_lib_expense : '',
          billing: billing ? billing : '',
          total_gb: total_gb ? total_gb : '',
          cpt: cpt ? cpt : '',
          cprt: cprt ? cprt : '',
          percent_contribution_cpt_by_lib_cost: percent_contribution_cpt_by_lib_cost ? percent_contribution_cpt_by_lib_cost : '',
          percent_contribution_cpt_by_seq_cost: percent_contribution_cpt_by_seq_cost ? percent_contribution_cpt_by_seq_cost : '',
        }
      })
    )
  }, [per_gb_cost, total_seq_exp, inputs, tableRows.length])
  // useEffect(() => {
  //   const total_seq_exp = (Number(inputs.total_run) || 0) * (Number(inputs.per_run_seq_cost) || 0)
  //   const total_gb = (Number(inputs.total_run) || 0) * (Number(inputs.per_flowcell_gb) || 0)
  //   const per_gb_cost = total_gb ? Math.round(total_seq_exp / total_gb) : 0

  //   setInputs(prev => ({
  //     ...prev,
  //     total_seq_exp,
  //     total_gb,
  //     per_gb_cost,
  //   }))
  // }, [inputs.total_run, inputs.per_run_seq_cost, inputs.per_flowcell_gb])

  const handleTableInputChange = (idx, e) => {
    const { name, value } = e.target
    setTableRows(rows =>
      rows.map((row, i) => {
        if (i !== idx) return row

        // Parse numbers or fallback to 0
        const sample_count = name === 'sample_count' ? Number(value) : Number(row.sample_count) || 0
        const library_cost = name === 'library_cost' ? Number(value) : Number(row.library_cost) || 0
        const patient_cost = name === 'patient_cost' ? Number(value) : Number(row.patient_cost) || 0
        const gb_per_sample = name === 'gb_per_sample' ? Number(value) : Number(row.gb_per_sample) || 0

        // Calculated fields
        const total_lib_expense = sample_count * library_cost
        const billing = sample_count * patient_cost
        const total_gb = (gb_per_sample * sample_count).toFixed(2)
        const cpt = (library_cost + (per_gb_cost * gb_per_sample)).toFixed(2)
        const total_sample_count = tableRows.reduce((sum, r, index) => index !== idx ? sum + (Number(r.sample_count) || 0) : sum, 0) + sample_count
        const cprt = (library_cost + (total_seq_exp / total_sample_count)).toFixed(2)
        const percent_contribution_cpt_by_lib_cost = total_lib_expense ? ((library_cost / Number(cpt)) * 100).toFixed(2) : 0
        const percent_contribution_cpt_by_seq_cost = total_gb ? (((per_gb_cost * gb_per_sample) / Number(cpt)) * 100).toFixed(2) : 0
        return {
          ...row,
          [name]: value,
          total_lib_expense: total_lib_expense ? total_lib_expense : '',
          billing: billing ? billing : '',
          total_gb: total_gb ? total_gb : '',
          cpt: cpt ? cpt : '',
          cprt: cprt ? cprt : '',
          percent_contribution_cpt_by_lib_cost: percent_contribution_cpt_by_lib_cost ? percent_contribution_cpt_by_lib_cost : '',
          percent_contribution_cpt_by_seq_cost: percent_contribution_cpt_by_seq_cost ? percent_contribution_cpt_by_seq_cost : '',
        }
      })
    )
  }

  const addTableRow = () => {
    setTableRows(rows => [
      ...rows,
      {
        application: '',
        sample_count: '',
        library_cost: '',
        total_lib_expense: '',
        patient_cost: '',
        billing: '',
        gb_per_sample: '',
        total_gb: '',
        cpt: '',
        cprt: '',
        percent_contribution_cpt_by_lib_cost: '',
        percent_contribution_cpt_by_seq_cost: '',
      },
    ])
  }



  const handleChange = (e) => {
    const { name, value } = e.target
    setInputs(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const removeTableRow = (idx) => {
    setTableRows(rows => rows.filter((_, i) => i !== idx))
  }
  return (
    <div className="p-4">

      {/* <div className="flex flex-col md:flex-row gap-4 mt-8">
        <div className="flex-1 bg-blue-100 border-l-4 border-blue-500 rounded shadow p-4 flex items-center gap-4">
          <span className="text-3xl text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 0V4m0 7v9m0 0H7m5 0h5" />
            </svg>
          </span>
          <div>
            <div className="text-lg font-semibold text-blue-700">Total Expense</div>
            <div className="text-2xl font-bold text-blue-800">
              {(sum(tableRows.map(row => Number(row.total_lib_expense) || 0)) + total_seq_exp).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
        <div className="flex-1 bg-green-100 border-l-4 border-green-500 rounded shadow p-4 flex items-center gap-4">
          <span className="text-3xl text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 0V4m0 7v9m0 0H7m5 0h5" />
            </svg>
          </span>
          <div>
            <div className="text-lg font-semibold text-green-700">Per Run Profit</div>
            <div className="text-2xl font-bold text-green-800">
              {(sum(tableRows.map(row => Number(row.billing) || 0)) - (sum(tableRows.map(row => Number(row.total_lib_expense) || 0)) + total_seq_exp)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div> */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <Form >
          <form>
            <div className="bg-white rounded shadow p-4 max-w-3xl">
              <div className="grid grid-cols-3 gap-1">
                {/* Left column: Labels */}
                <div className="flex flex-col gap-1">
                  <label className="font-semibold bg-blue-200 px-2 py-2 rounded-t w-full min-w-[180px] border-b border-white">
                    Total No Of Runs performed
                  </label>
                  <label className="font-semibold bg-blue-200 px-2 py-2 w-full min-w-[180px] border-b border-white">
                    Per Run Sequencing Cost
                  </label>
                  <label className="font-semibold bg-blue-200 px-2 py-2 w-full min-w-[180px] border-b border-white">
                    Total Expense for Sequencing
                  </label>
                  <label className="font-semibold bg-blue-200 px-2 py-2 w-full min-w-[180px] border-b border-white">
                    Per flowcell GB
                  </label>
                  <label className="font-semibold bg-blue-200 px-2 py-2 rounded-b w-full min-w-[180px]">
                    Per GB Cost
                  </label>
                </div>
                {/* Middle column: Inputs/Values */}
                <div className="flex flex-col gap-0">
                  <input
                    type="number"
                    min={1}
                    name="total_run"
                    value={inputs.total_run}
                    onChange={e => {
                      form.setValue('total_run', Number(e.target.value))
                      handleChange(e)
                    }}
                    className="bg-blue-100 border-none mb-1 px-2 py-2 text-right w-full min-w-[120px] rounded-t"
                  />
                  <input
                    type="number"
                    min={1}
                    name="per_run_seq_cost"
                    value={inputs.per_run_seq_cost}
                    onChange={e => {
                      form.setValue('per_run_seq_cost', Number(e.target.value))
                      handleChange(e)
                    }}
                    className="bg-blue-100 border-none mb-1 px-2 py-2 text-right w-full min-w-[120px]"
                  />
                  <input
                    type="number"
                    value={total_seq_exp}
                    disabled
                    className="bg-blue-100 border-none mb-1 px-2 py-2 text-right font-bold w-full min-w-[120px]"
                  />
                  <input
                    type="number"
                    min={1}
                    name="per_flowcell_gb"
                    value={inputs.per_flowcell_gb}
                    onChange={e => {
                      form.setValue('per_flowcell_gb', Number(e.target.value))
                      handleChange(e)
                    }}
                    className="bg-blue-100 border-none mb-1 px-2 py-2 text-right w-full min-w-[120px]"
                  />
                  <input
                    type="number"
                    value={per_gb_cost}
                    disabled
                    className="bg-blue-100 border-none mb-1 px-2 py-2 text-right font-bold w-full min-w-[120px] rounded-b"
                  />
                </div>
                {/* Right column: Total GB */}
                <div className="flex flex-col h-full justify-start items-stretch">
                  <label className="font-semibold bg-blue-300 px-2 py-2 mb-1 rounded-t w-full min-w-[120px] text-center border-b border-white text-lg">
                    Total GB
                  </label>
                  <div className="bg-blue-100 px-2 py-6 text-center font-bold w-full min-w-[120px] text-3xl rounded-b flex-1 flex items-center justify-center">
                    {total_gb}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
        <div className="flex flex-col gap-6 w-full lg:w-[420px] mt-2">
          <div className="flex-1 bg-blue-100 border-l-4 mb-2 border-blue-500 rounded shadow p-4 flex items-center gap-4">
            {/* <span className="text-3xl text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 0V4m0 7v9m0 0H7m5 0h5" />
              </svg>
            </span> */}
            <div>
              <div className="text-lg font-semibold text-blue-700">Total Expense</div>
              <div className="text-2xl font-bold text-blue-800">
                {(sum(tableRows.map(row => Number(row.total_lib_expense) || 0)) + total_seq_exp).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <div className="flex-1 bg-green-100 border-l-4 border-green-500 rounded shadow p-4 flex items-center gap-4">
            {/* <span className="text-3xl text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 0V4m0 7v9m0 0H7m5 0h5" />
              </svg>
            </span> */}
            <div>
              <div className="text-lg font-semibold text-green-700">Per Run Profit</div>
              <div className="text-2xl font-bold text-green-800">
                {(sum(tableRows.map(row => Number(row.billing) || 0)) - (sum(tableRows.map(row => Number(row.total_lib_expense) || 0)) + total_seq_exp)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>




      <div className="w-full mt-8">
        <button
          type="button"
          className="mb-2 px-4 py-2 bg-blue-400 hover:bg-blue-500 text-black font-semibold rounded"
          onClick={addTableRow}
        >
          Add Row
        </button>
        <div className="overflow-x-auto w-full lg:overflow-x-visible">
          <table className="min-w-[1000px] w-full border border-gray-300">
            <thead className="sticky top-0 z-10">
              <tr className="bg-blue-200">
                <th className="px-4 py-2 border">Application</th>
                <th className="px-4 py-2 border">Sample Count</th>
                <th className="px-4 py-2 border">Library Cost</th>
                <th className="px-4 py-2 border">Total Lib Expense</th>
                <th className="px-4 py-2 border">Patient Cost</th>
                <th className="px-4 py-2 border">Billing</th>
                <th className="px-4 py-2 border">GB per Sample</th>
                <th className="px-4 py-2 border">Total Gb</th>
                <th className="px-4 py-2 border">CPT</th>
                <th className="px-4 py-2 border">CPRT</th>
                <th className="px-4 py-2 border">% Contribution of CPT by Lib Cost</th>
                <th className="px-4 py-2 border">% Contribution of CPT by Seq Cost</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, idx) => (
                <tr key={idx} className="bg-blue-50">
                  <td className="px-2 py-1 border">
                    <input
                      name="application"
                      value={row.application}
                      onChange={e => handleTableInputChange(idx, e)}
                      placeholder='Application'
                      className="w-full bg-transparent border-1 border-black text-right"
                    />
                  </td>
                  {/* Sample Count */}
                  <td className="px-2 py-1 border">
                    <input
                      name="sample_count"
                      value={row.sample_count}
                      onChange={e => handleTableInputChange(idx, e)}
                      className="w-full bg-transparent border-1 border-black text-right"
                      placeholder='Count'
                      type="text"
                      inputMode="decimal"
                    />
                  </td>
                  {/* Library Cost */}
                  <td className="px-2 py-1 border">
                    <input
                      name="library_cost"
                      value={
                        row._editingLibraryCost
                          ? row.library_cost
                          : (row.library_cost !== '' && !isNaN(Number(row.library_cost))
                            ? Number(row.library_cost).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : '')
                      }
                      onChange={e => {
                        const value = e.target.value.replace(/,/g, '')
                        handleTableInputChange(idx, { target: { name: 'library_cost', value } })
                      }}
                      onFocus={() => setTableRows(rows =>
                        rows.map((r, i) => i === idx ? { ...r, _editingLibraryCost: true } : r)
                      )}
                      onBlur={() => setTableRows(rows =>
                        rows.map((r, i) => i === idx ? { ...r, _editingLibraryCost: false } : r)
                      )}
                      className="w-full bg-transparent border-1 border-black text-right"
                      placeholder='Lib. Cost'
                      type="text"
                      inputMode="decimal"
                    />
                  </td>
                  {/* Total Lib Expense */}
                  <td className="px-2 py-1 border">
                    <input
                      disabled
                      name="total_lib_expense"
                      value={
                        row.total_lib_expense !== '' && !isNaN(Number(row.total_lib_expense))
                          ? Number(row.total_lib_expense).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : ''
                      }
                      className="w-full bg-transparent border-1 border-black text-right"
                      placeholder='Total Exp.'
                      type="text"
                      inputMode="decimal"
                    />
                  </td>
                  {/* Patient Cost */}
                  <td className="px-2 py-1 border">
                    <input
                      name="patient_cost"
                      value={
                        row._editingPatientCost
                          ? row.patient_cost
                          : (row.patient_cost !== '' && !isNaN(Number(row.patient_cost))
                            ? Number(row.patient_cost).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : '')
                      }
                      onChange={e => {
                        const value = e.target.value.replace(/,/g, '')
                        handleTableInputChange(idx, { target: { name: 'patient_cost', value } })
                      }}
                      onFocus={() => setTableRows(rows =>
                        rows.map((r, i) => i === idx ? { ...r, _editingPatientCost: true } : r)
                      )}
                      onBlur={() => setTableRows(rows =>
                        rows.map((r, i) => i === idx ? { ...r, _editingPatientCost: false } : r)
                      )}
                      className="w-full bg-transparent border-1 border-black text-right"
                      placeholder='Patient Cost'
                      type="text"
                      inputMode="decimal"
                    />
                  </td>
                  {/* Billing */}
                  <td className="px-2 py-1 border">
                    <input
                      disabled
                      name="billing"
                      value={
                        row.billing !== '' && !isNaN(Number(row.billing))
                          ? Number(row.billing).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : ''
                      }
                      className="w-full bg-transparent border-1 border-black text-right"
                      placeholder='Billing'
                      type="text"
                      inputMode="decimal"
                    />
                  </td>
                  {/* GB per Sample */}
                  <td className="px-2 py-1 border">
                    <input
                      name="gb_per_sample"
                      value={
                        row._editingGbPerSample
                          ? row.gb_per_sample
                          : (row.gb_per_sample !== '' && !isNaN(Number(row.gb_per_sample))
                            ? Number(row.gb_per_sample).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                            : '')
                      }
                      onChange={e => {
                        const value = e.target.value.replace(/,/g, '')
                        handleTableInputChange(idx, { target: { name: 'gb_per_sample', value } })
                      }}
                      onFocus={() => setTableRows(rows =>
                        rows.map((r, i) => i === idx ? { ...r, _editingGbPerSample: true } : r)
                      )}
                      onBlur={() => setTableRows(rows =>
                        rows.map((r, i) => i === idx ? { ...r, _editingGbPerSample: false } : r)
                      )}
                      placeholder='GB/Sample'
                      className="w-full bg-transparent border-1 border-black text-right"
                      type="text"
                      inputMode="decimal"
                    />
                  </td>
                  {/* Total GB */}
                  <td className="px-2 py-1 border">
                    <input
                      disabled
                      name="total_gb"
                      value={
                        row.total_gb !== '' && !isNaN(Number(row.total_gb))
                          ? Number(row.total_gb).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : ''
                      }
                      className="w-full bg-transparent border-1 border-black text-right"
                      placeholder='Total GB'
                      type="text"
                      inputMode="decimal"
                    />
                  </td>
                  {/* CPT */}
                  <td className="px-2 py-1 border">
                    <input
                      disabled
                      name="cpt"
                      value={
                        row.cpt !== '' && !isNaN(Number(row.cpt))
                          ? Number(row.cpt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : ''
                      }
                      className="w-full bg-transparent border-1 border-black text-right"
                      placeholder='CPT'
                      type="text"
                    />
                  </td>
                  {/* CPRT */}
                  <td className="px-2 py-1 border">
                    <input
                      disabled
                      name="cprt"
                      value={
                        row.cprt !== '' && !isNaN(Number(row.cprt))
                          ? Number(row.cprt).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : ''
                      }
                      className="w-full bg-transparent border-1 border-black text-right"
                      placeholder='CPRT'
                      type="text"
                    />
                  </td>
                  {/* % Contribution CPT by Lib Cost */}
                  <td className="px-2 py-1 border">
                    <input
                      disabled
                      name="percent_contribution_cpt_by_lib_cost"
                      value={
                        row.percent_contribution_cpt_by_lib_cost !== '' && !isNaN(Number(row.percent_contribution_cpt_by_lib_cost))
                          ? Number(row.percent_contribution_cpt_by_lib_cost).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : ''
                      }
                      className="w-full bg-transparent border-1 border-black text-right"
                      type="number"
                    />
                  </td>
                  {/* % Contribution CPT by Seq Cost */}
                  <td className="px-2 py-1 border">
                    <input
                      disabled
                      name="percent_contribution_cpt_by_seq_cost"
                      value={
                        row.percent_contribution_cpt_by_seq_cost !== '' && !isNaN(Number(row.percent_contribution_cpt_by_seq_cost))
                          ? Number(row.percent_contribution_cpt_by_seq_cost).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                          : ''
                      }
                      className="w-full bg-transparent border-1 border-black text-right"
                      type="number"
                    />
                  </td>
                  {/* Remove Button */}
                  <td className="px-2 py-1 border text-center">
                    <button
                      type="button"
                      className="bg-red-400 hover:bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => removeTableRow(idx)}
                      disabled={tableRows.length === 1}
                      title={tableRows.length === 1 ? "At least one row required" : "Remove row"}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-blue-100 font-bold">
                <td className="px-2 py-1 border text-right">Total</td>
                <td className="px-2 py-1 border text-right">
                  {tableRows.reduce((sum, row) => sum + (Number(row.sample_count) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-2 py-1 border"></td>
                <td className="px-2 py-1 border text-right">
                  {tableRows.reduce((sum, row) => sum + (Number(row.total_lib_expense) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-2 py-1 border"></td>
                <td className="px-2 py-1 border text-right">
                  {tableRows.reduce((sum, row) => sum + (Number(row.billing) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-2 py-1 border"></td>
                <td className="px-2 py-1 border text-right">
                  {tableRows.reduce((sum, row) => sum + (Number(row.total_gb) || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                {/* Empty cells for the rest */}
                <td className="px-2 py-1 border"></td>
                <td className="px-2 py-1 border"></td>
                <td className="px-2 py-1 border"></td>
                <td className="px-2 py-1 border"></td>
                <td className="px-2 py-1 border"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

export default CostCalculator