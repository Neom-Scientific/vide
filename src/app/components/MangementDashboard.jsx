import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import Cookies from 'js-cookie';
import { X } from 'lucide-react';
import React, { use, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Example test options for dropdown
let testOptions = [];

const formSchema = z.object({
  per_run_seq: z.optional(z.string()),
  total_exp_seq: z.optional(z.string()),
  per_run_profit: z.optional(z.string()),
  per_flowcell_gb: z.optional(z.string()),
  total_number_of_runs: z.optional(z.string()),
  project_run_profit: z.optional(z.string()),
  per_gb_cost: z.optional(z.string()),
  total_lab_exp: z.optional(z.string()),
  total_gb_consumed: z.optional(z.string()),
  total_p_and_l: z.optional(z.string()),
});

const MangementDashboard = () => {
  const [yearSelection, setYearSelection] = useState('');
  const [user, setUser] = useState({});
  const [rows, setRows] = useState(() => {
    const saved = localStorage.getItem('trf_dashboard_rows');
    return saved ? JSON.parse(saved) : [];
  }); const [newRow, setNewRow] = useState({
    testCode: '',
    testName: '',
    testCount: '',
    extraction: '',
    library: '',
    libraryQC: '',
    wetLabExpense: '',
    patientCost: '',
    patientBilling: '',
    gbSample: '',
    totalGb: '',
    cpt: '',
    cprt: ''
  });
  const [runData, setRunData] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const savedInputs = JSON.parse(localStorage.getItem('trf_dashboard_formInputs') || '{}');
  const [perRunSeq, setPerRunSeq] = useState(savedInputs.perRunSeq || '');
  const [perFlowcellGb, setPerFlowcellGb] = useState(savedInputs.perFlowcellGb || '');
  const [totalNoRun, setTotalNoRun] = useState(savedInputs.totalNoRun || '');
  const [perGbCost, setPerGbCost] = useState(savedInputs.perGbCost || '');
  const [totalGbConsumption, setTotalGbConsumption] = useState(savedInputs.totalGbConsumption || '');
  const [totalSeqExp, setTotalSeqExp] = useState(savedInputs.totalSeqExp || '');
  const [totalLabExpense, setTotalLabExpense] = useState(savedInputs.totalLabExpense || '');
  const [totalPandL, setTotalPandL] = useState(savedInputs.totalPandL || '');
  const [perRunProfit, setPerRunProfit] = useState(savedInputs.perRunProfit || '');
  const [filteredRunData, setFilteredRunData] = useState([]);
  const [testOptions, setTestOptions] = useState([]);
  const [monthSelection, setMonthSelection] = useState('');


  let currentYear = new Date().getFullYear();
  let previousYear;

  // Save rows to localStorage whenever rows change
  useEffect(() => {
    localStorage.setItem('trf_dashboard_rows', JSON.stringify(rows));
  }, [rows]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      per_run_seq: '',
      total_exp_seq: '',
      per_run_profit: '',
      per_flowcell_gb: '',
      total_number_of_runs: '',
      project_run_profit: '',
      per_gb_cost: '',
      total_lab_exp: '',
      total_gb_consumed: '',
      total_p_and_l: ''
    }
  });

  const handleNewRowChange = (eOrObj) => {
    if (eOrObj.target) {
      setNewRow({ ...newRow, [eOrObj.target.name]: eOrObj.target.value });
    } else {
      setNewRow({ ...newRow, ...eOrObj });
    }
  };

  const handleAddRow = (e) => {
    e.preventDefault();
    setRows([...rows, newRow]);
    setNewRow({
      testCode: '',
      testName: '',
      testCount: '',
      extraction: '',
      library: '',
      libraryQC: '',
      wetLabExpense: '',
      patientCost: '',
      patientBilling: '',
      gbSample: '',
      totalGb: '',
      cpt: '',
      cprt: ''
    });
  };

  const handleDialogAddRow = (newRow) => {
    // Add new row
    setRows([...rows, newRow]);
    setNewRow({
      testCode: '',
      testName: '',
      testCount: '',
      extraction: '',
      library: '',
      libraryQC: '',
      wetLabExpense: '',
      patientCost: '',
      patientBilling: '',
      gbSample: '',
      totalGb: '',
      cpt: '',
      cprt: ''
    });
    setAddDialogOpen(false);
  };

  useEffect(() => {
    previousYear = currentYear - 1;
    localStorage.removeItem('trf_dashboard_rows')
    setRows([]); // <-- clear rows in state
    setNewRow({
      testCode: '',
      testName: '',
      testCount: '',
      extraction: '',
      library: '',
      libraryQC: '',
      wetLabExpense: '',
      patientCost: '',
      patientBilling: '',
      gbSample: '',
      totalGb: '',
      cpt: '',
      cprt: ''
    });
  }, [yearSelection]);

  useEffect(() => {
    const cookieData = Cookies.get('vide_user');
    if (cookieData) {
      const fetchRunData = async () => {
        try {
          const parsedData = JSON.parse(cookieData);
          setUser(parsedData);
          const response = await axios.get(`/api/run-setup?role=${parsedData.role}&hospital_name=${parsedData.hospital_name}`);
          if (response.data[0].status === 200) {
            const data = response.data[0].data || [];
            setRunData(data);
          }
        } catch (error) {
          console.error('Error fetching pool data:', error);
        }
      };
      fetchRunData();
    }
  }, [user?.role]);

  // useEffect(() => {
  //   const currentYear = new Date().getFullYear();
  //   const previousYear = currentYear - 1;

  //   let yearToShow = currentYear;
  //   if (yearSelection === 'previous') yearToShow = previousYear;

  //   const filtered = runData.filter(run =>
  //     new Date(run.seq_run_date).getFullYear() === yearToShow
  //   );

  //   // Filter by month if selected
  //   if (monthSelection) {
  //     const monthIndex = [
  //       'january', 'february', 'march', 'april', 'may', 'june',
  //       'july', 'august', 'september', 'october', 'november', 'december'
  //     ].indexOf(monthSelection);
  //     filtered = filtered.filter(run =>
  //       new Date(run.seq_run_date).getMonth() === monthIndex
  //     );
  //   }

  //   const testSamples = filtered.flatMap(run =>
  //     (run.table_data || []).map(table => ({
  //       test_name: table.test_name,
  //       sample_count: Number(table.sample_count) || 0
  //     }))
  //   );

  //   // Aggregate test counts by test_name
  //   const testCountMap = {};
  //   testSamples.forEach(({ test_name, sample_count }) => {
  //     if (!testCountMap[test_name]) testCountMap[test_name] = 0;
  //     testCountMap[test_name] += sample_count;
  //   });

  //   // Build testOptions array in the required format
  //   const testOptionsArr = Object.entries(testCountMap).map(([name, count]) => ({
  //     value: name.toLowerCase().replace(/\s+/g, '_'),
  //     label: name,
  //     test_count: count
  //   }));

  //   // If you want to use this globally, store in state:
  //   setTestOptions(testOptionsArr);
  //   setFilteredRunData(filtered);
  //   // console.log('filtered:', filtered);
  //   setTotalNoRun(filtered.length);
  // }, [runData, yearSelection , monthSelection]);

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    let yearToShow = currentYear;
    if (yearSelection === 'previous') yearToShow = previousYear;

    // Filter by year
    let filtered = runData.filter(run =>
      new Date(run.seq_run_date).getFullYear() === yearToShow
    );

    // Filter by month if selected
    if (monthSelection) {
      const monthIndex = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ].indexOf(monthSelection);
      filtered = filtered.filter(run =>
        new Date(run.seq_run_date).getMonth() === monthIndex
      );
    }

    // --- The rest of your aggregation logic for testOptions etc. ---
    const testSamples = filtered.flatMap(run =>
      (run.table_data || []).map(table => ({
        test_name: table.test_name,
        sample_count: Number(table.sample_count) || 0
      }))
    );

    // Aggregate test counts by test_name
    const testCountMap = {};
    testSamples.forEach(({ test_name, sample_count }) => {
      if (!testCountMap[test_name]) testCountMap[test_name] = 0;
      testCountMap[test_name] += sample_count;
    });

    // Build testOptions array in the required format
    const testOptionsArr = Object.entries(testCountMap).map(([name, count]) => ({
      value: name.toLowerCase().replace(/\s+/g, '_'),
      label: name,
      test_count: count
    }));

    setTestOptions(testOptionsArr);
    setFilteredRunData(filtered);
    setTotalNoRun(filtered.length);
  }, [runData, yearSelection, monthSelection]);

  useEffect(() => {
    // Parse numbers safely
    const perRunSeqNum = parseFloat(perRunSeq) || 0;
    const perFlowcellGbNum = parseFloat(perFlowcellGb) || 0;
    const totalNoRunNum = parseFloat(totalNoRun) || 0;

    // total_seq_exp = total_no_run * per_run_seq
    const totalSeqExpCalc = totalNoRunNum * perRunSeqNum;

    // total_lab_expense = sum(wet lab expense) + total_seq_exp
    const wetLabExpenseSum = rows.reduce((sum, row) => sum + Number(row.wetLabExpense || 0), 0);
    const totalLabExpenseCalc = wetLabExpenseSum + totalSeqExpCalc;

    // total_p_and_l = sum(patient billing) - total_lab_expense
    const patientBillingSum = rows.reduce((sum, row) => sum + Number(row.patientBilling || 0), 0);
    const totalPandLCalc = patientBillingSum - totalLabExpenseCalc;

    // total_test_count
    const totalTestCount = rows.reduce((sum, row) => sum + Number(row.testCount || 0), 0);
    const perGbCostCalc = perFlowcellGbNum ? perRunSeqNum / perFlowcellGbNum : 0;
    setPerGbCost(perGbCostCalc ? perGbCostCalc.toFixed(2) : '');

    // Recalculate cpt and cprt for all rows
    const updatedRows = rows.map(row => {
      const gbSample = Number(row.gbSample) || 0;
      const libraryQC = Number(row.libraryQC) || 0;
      // CPT = libraryQC + (per_gb_cost * gbSample)
      const cpt = libraryQC + (perGbCostCalc * gbSample);
      // CPRT = libraryQC + (total_seq_exp / test_count)
      const cprt = totalTestCount ? libraryQC + (totalSeqExpCalc / totalTestCount) : libraryQC;
      return {
        ...row,
        cpt: cpt.toFixed(2),
        cprt: cprt.toFixed(2),
      };
    });

    setRows(updatedRows);

    // // total_test_count
    // const totalTestCount = rows.reduce((sum, row) => sum + Number(row.testCount || 0), 0);

    // per_gb_cost = per_run_seq / per_flowcell_gb


    // total_gb_consumption = per_flowcell_gb * total_no_run
    const totalGbConsumptionCalc = rows.reduce((sum, row) => {
      // Always use the latest test_count from testOptions if available
      const opt = testOptions.find(opt => opt.value === row.testName);
      const testCount = opt ? Number(opt.test_count) : Number(row.testCount) || 0;
      // console.log('testCount:', testCount, 'for row:', row);
      const gbSample = Number(row.gbSample) || 0;
      return sum + (testCount * gbSample);
    }, 0);
    setTotalGbConsumption(totalGbConsumptionCalc ? totalGbConsumptionCalc.toFixed(2) : '');
  
    // total_seq_exp = total_no_run * per_run_seq
    setTotalSeqExp(totalSeqExpCalc ? totalSeqExpCalc.toFixed(2) : '');

    // total_lab_expense = sum(wet lab expense) + total_seq_exp
    setTotalLabExpense(totalLabExpenseCalc ? totalLabExpenseCalc.toFixed(2) : '');

    // total_p_and_l = sum(patient billing) - total_lab_expense
    setTotalPandL(totalPandLCalc ? totalPandLCalc.toFixed(2) : '');

    // per_run_profit = total_p_and_l / total_no_run
    const perRunProfitCalc = totalNoRunNum ? totalPandLCalc / totalNoRunNum : 0;
    setPerRunProfit(perRunProfitCalc ? perRunProfitCalc.toFixed(2) : '');

  }, [perRunSeq, perFlowcellGb, totalNoRun, rows.length]);

  useEffect(() => {
    const formInputs = {
      perRunSeq,
      perFlowcellGb,
      totalNoRun,
      perGbCost,
      totalGbConsumption,
      totalSeqExp,
      totalLabExpense,
      totalPandL,
      perRunProfit,
    };
    localStorage.setItem('trf_dashboard_formInputs', JSON.stringify(formInputs));
  }, [
    perRunSeq,
    perFlowcellGb,
    totalNoRun,
    perGbCost,
    totalGbConsumption,
    totalSeqExp,
    totalLabExpense,
    totalPandL,
    perRunProfit,
  ]);

  const handleDeleteRow = (idx) => {
    setRows(rows.filter((_, i) => i !== idx));
  };


  return (
    <div className='p-4'>
      <div className='flex justify-between gap-2 mb-4 p-2 max-w-xs'>
        <select
          value={yearSelection}
          onChange={(e) => setYearSelection(e.target.value)}
          className='p-2 border-2 rounded-lg border-orange-200 max-w-xl dark:bg-gray-900 dark:text-white'>
          <option value='current'>Current Financial Year</option>
          <option value='previous'>Previous Financial Year</option>
        </select>

        <select
          value={monthSelection}
          onChange={e => setMonthSelection(e.target.value)}
          className='p-2 border-2 rounded-lg border-orange-200 max-w-xl dark:bg-gray-900 dark:text-white'
        >
          <option value=''>Select Month</option>
          <option value='january'>January</option>
          <option value='february'>February</option>
          <option value='march'>March</option>
          <option value='april'>April</option>
          <option value='may'>May</option>
          <option value='june'>June</option>
          <option value='july'>July</option>
          <option value='august'>August</option>
          <option value='september'>September</option>
          <option value='october'>October</option>
          <option value='november'>November</option>
          <option value='december'>December</option>
        </select>
      </div>
      <div className='p-4'>
        <Form {...form}>
          <form className="">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4 gap-y-6">
              {/* Cost Parameters */}
              <div className="shadow-lg p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-4 flex items-center text-blue-700">
                  {/* <span className="mr-2">💲</span> Cost Parameters */}
                </h3>
                <FormField
                  control={form.control}
                  name='per_run_seq'
                  render={() => (
                    <FormItem className="mb-4">
                      <div className="flex items-center">
                        <label className="font-semibold min-w-[180px] mr-2 text-right">Per Run Sequencing Cost</label>
                        <input
                          type='number'
                          value={perRunSeq}
                          onChange={e => setPerRunSeq(e.target.value)}
                          placeholder='Per Run Sequencing Cost'
                          className='p-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 transition w-full'
                        />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='per_flowcell_gb'
                  render={() => (
                    <FormItem className="mb-4">
                      <div className="flex items-center">
                        <label className="font-semibold min-w-[180px] mr-2 text-right">Per flowcell GB</label>
                        <input
                          type='number'
                          value={perFlowcellGb}
                          onChange={e => setPerFlowcellGb(e.target.value)}
                          placeholder='Per Flowcell GB'
                          className='p-3 border-2 border-blue-200 rounded-xl focus:border-blue-400 transition w-full'
                        />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='per_gb_cost'
                  render={() => (
                    <FormItem className="mb-4">
                      <div className="flex items-center">
                        <label className="font-semibold min-w-[180px] mr-2 text-right">Per GB Cost</label>
                        <input
                          type='text'
                          value={perGbCost ? Number(perGbCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                          readOnly
                          placeholder='Per GB Cost'
                          className='p-3 border-2 border-blue-200 rounded-xl w-full'
                        />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='total_gb_consumed'
                  render={() => (
                    <FormItem className="mb-4">
                      <div className="flex items-center">
                        <label className="font-semibold min-w-[180px] mr-2 text-right">Total GB Consumption</label>
                        <input
                          type='text'
                          value={totalGbConsumption ? Number(totalGbConsumption).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                          readOnly
                          placeholder='Total GB Consumption'
                          className='p-3 border-2 border-blue-200 rounded-xl w-full'
                        />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              {/* Expense Analysis */}
              <div className="shadow-lg p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-4 flex items-center text-orange-600">
                  {/* <span className="mr-2">📊</span> Expense Analysis */}
                </h3>
                <FormField
                  control={form.control}
                  name='total_exp_seq'
                  render={() => (
                    <FormItem className="mb-4">
                      <div className="flex items-center">
                        <label className="font-semibold min-w-[180px] mr-2 text-right">Total Expense for Sequencing</label>
                        <input
                          type='text'
                          value={totalSeqExp ? Number(totalSeqExp).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                          readOnly
                          placeholder='Total Expense for Sequencing'
                          className='p-3 border-2 border-yellow-300 rounded-xl w-full'
                        />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='total_number_of_runs'
                  render={() => (
                    <FormItem className="mb-4">
                      <div className="flex items-center">
                        <label className="font-semibold min-w-[180px] mr-2 text-right">Total No Of Runs performed</label>
                        <input
                          type='number'
                          value={totalNoRun}
                          disabled
                          onChange={e => setTotalNoRun(e.target.value)}
                          placeholder='Total No Of Runs performed'
                          className='p-3 border-2 border-yellow-300 rounded-xl focus:border-yellow-400 transition w-full'
                        />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='total_lab_exp'
                  render={() => (
                    <FormItem className="mb-4">
                      <div className="flex items-center">
                        <label className="font-semibold min-w-[180px] mr-2 text-right">Total Lab Expense</label>
                        <input
                          type='text'
                          value={totalLabExpense ? Number(totalLabExpense).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                          readOnly
                          placeholder='Total Lab Expense'
                          className='p-3 border-2 border-yellow-300 rounded-xl w-full'
                        />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='total_p_and_l'
                  render={() => (
                    <FormItem className="mb-4">
                      <div className="flex items-center">
                        <label className="font-semibold min-w-[180px] mr-2 text-right">Total P & L</label>
                        <input
                          type='text'
                          value={totalPandL ? Number(totalPandL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                          readOnly
                          placeholder='Total P & L'
                          className='p-3 border-2 border-yellow-300 rounded-xl w-full'
                        />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              {/* Profitability Metrics */}
              <div className="shadow-lg p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-4 flex items-center text-green-700">
                  {/* <span className="mr-2">📈</span> Profitability Metrics */}
                </h3>
                <FormField
                  control={form.control}
                  name='per_run_profit'
                  render={() => (
                    <FormItem className="mb-4">
                      <div className="flex items-center">
                        <label className="font-semibold min-w-[180px] mr-2 text-right text-green-700">Per Run Profitability</label>
                        <input
                          type='text'
                          value={perRunProfit ? Number(perRunProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''}
                          readOnly
                          placeholder='Per Run Profitability'
                          className='p-3 border-2 border-green-300 rounded-xl w-full'
                        />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='projected_run_profit'
                  render={({ field }) => (
                    <FormItem className="mb-4">
                      <div className="flex items-center">
                        <label className="font-semibold min-w-[180px] mr-2 text-right text-green-700">Projected Run Profitability</label>
                        <input
                          {...field}
                          type='text'
                          placeholder='Projected Run Profitability'
                          className='p-3 border-2 border-green-300 rounded-xl focus:border-green-400 transition w-full'
                        />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </div>
      <div className='mt-6 w-full'>
        <div className="w-full overflow-x-auto">
          <table className="w-full border border-black">
            <thead>
              <tr>
                <th className='px-4 py-2 border border-black bg-gray-100 dark:text-black'>Test Code</th>
                <th className='px-4 py-2 border border-black bg-gray-100 dark:text-black'>Test Name & Description</th>
                <th className='px-4 py-2 border border-black bg-yellow-100 dark:text-black'>Test Count</th>
                <th className='px-4 py-2 border border-black bg-orange-100 dark:text-black'>Extraction</th>
                <th className='px-4 py-2 border border-black bg-orange-100 dark:text-black'>Library</th>
                <th className='px-4 py-2 border border-black bg-orange-100 dark:text-black'>Library QC</th>
                <th className='px-4 py-2 border border-black bg-orange-100 dark:text-black'>Wet Lab Expense</th>
                <th className='px-4 py-2 border border-black bg-green-100 dark:text-black'>Patient Cost</th>
                <th className='px-4 py-2 border border-black bg-green-100 dark:text-black'>Patient Billing</th>
                <th className='px-4 py-2 border border-black bg-blue-100 dark:text-black'>GB/Sample</th>
                <th className='px-4 py-2 border border-black bg-blue-100 dark:text-black'>Total GB</th>
                <th className='px-4 py-2 border border-black bg-blue-100 dark:text-black'>CPT</th>
                <th className='px-4 py-2 border border-black bg-blue-100 dark:text-black'>CPRT</th>
                <th className='px-4 py-2 border border-black bg-gray-100'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  <td className='px-4 py-2 border border-black bg-gray-50 dark:text-black'>{row.testCode}</td>
                  <td className='px-4 py-2 border border-black bg-gray-50 dark:text-black'>{testOptions.find(opt => opt.value === row.testName)?.label || row.testName}</td>
                  {/* <td className='px-4 py-2 border border-black text-right bg-yellow-50 dark:text-black'>
                    {row.testCount && !isNaN(Number(row.testCount)) ? Number(row.testCount).toLocaleString() : row.testCount}
                  </td> */}
                  <td className='px-4 py-2 border border-black text-right bg-yellow-50 dark:text-black'>
                    {
                      (() => {
                        const opt = testOptions.find(opt => opt.value === row.testName);
                        return opt && !isNaN(Number(opt.test_count))
                          ? Number(opt.test_count).toLocaleString()
                          : row.testCount;
                      })()
                    }
                  </td>
                  <td className='px-4 py-2 border border-black text-right bg-orange-50 dark:text-black'>
                    {row.extraction && !isNaN(Number(row.extraction)) ? Number(row.extraction).toLocaleString() : row.extraction}
                  </td>
                  <td className='px-4 py-2 border border-black text-right bg-orange-50 dark:text-black'>
                    {row.library && !isNaN(Number(row.library)) ? Number(row.library).toLocaleString() : row.library}
                  </td>
                  <td className='px-4 py-2 border border-black text-right bg-orange-50 dark:text-black'>
                    {row.libraryQC && !isNaN(Number(row.libraryQC)) ? Number(row.libraryQC).toLocaleString() : row.libraryQC}
                  </td>
                  <td className='px-4 py-2 border border-black text-right bg-orange-50 dark:text-black'>
                    {((
                      (Number(row.extraction) || 0) +
                      (Number(row.library) || 0) +
                      (Number(row.libraryQC) || 0)
                    ) * (Number(row.testCount) || 0)
                    ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className='px-4 py-2 border border-black text-right bg-green-50 dark:text-black'>
                    {row.patientCost && !isNaN(Number(row.patientCost)) ? Number(row.patientCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.patientCost}
                  </td>
                  <td className='px-4 py-2 border border-black text-right bg-green-50 dark:text-black'>
                    {row.patientBilling && !isNaN(Number(row.patientBilling)) ? Number(row.patientBilling).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.patientBilling}
                  </td>
                  <td className='px-4 py-2 border border-black text-right bg-blue-50 dark:text-black'>
                    {row.gbSample && !isNaN(Number(row.gbSample)) ? Number(row.gbSample).toLocaleString() : row.gbSample}
                  </td>
                  <td className='px-4 py-2 border border-black text-right bg-blue-50 dark:text-black'>
                    {row.totalGb && !isNaN(Number(row.totalGb)) ? Number(row.totalGb).toLocaleString() : row.totalGb}
                  </td>
                  <td className='px-4 py-2 border border-black text-right bg-purple-50 dark:text-black'>
                    {row.cpt && !isNaN(Number(row.cpt)) ? Number(row.cpt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.cpt}
                  </td>
                  <td className='px-4 py-2 border border-black text-right bg-purple-50 dark:text-black'>
                    {row.cprt && !isNaN(Number(row.cprt)) ? Number(row.cprt).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : row.cprt}
                  </td>
                  <td className='px-4 py-2 border border-black bg-gray-50'>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded ml-2"
                      onClick={() => handleDeleteRow(idx)}
                    >Delete</button>
                  </td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className='px-4 py-2 border border-black bg-red-600 text-white text-right' colSpan={2}>Total-Test Count</td>
                <td className='px-4 py-2 border border-black bg-yellow-400 text-black text-right'>
                  {rows.reduce((sum, row) => sum + Number(row.testCount || 0), 0).toLocaleString()}
                </td>
                <td className='px-4 py-2 border border-black bg-red-600 text-white text-right' colSpan={3}>Total Wet Lab Expense</td>
                <td className='px-4 py-2 border border-black bg-orange-600 text-white text-right'>
                  {rows.reduce((sum, row) => sum + Number(row.wetLabExpense || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className='px-4 py-2 border border-black bg-green-200 text-right'></td>
                <td className='px-4 py-2 border border-black bg-green-600 text-white text-right'>
                  {rows.reduce((sum, row) => sum + Number(row.patientBilling || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className='px-4 py-2 border border-black bg-blue-200 text-right'></td>
                <td className='px-4 py-2 border border-black bg-blue-600 text-white text-right'>
                  {rows.reduce((sum, row) => sum + Number(row.totalGb || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className='px-4 py-2 border border-black bg-purple-200 text-right'></td>
                <td className='px-4 py-2 border border-black bg-purple-200 text-right'></td>
              </tr>
            </tbody>
          </table>
        </div>
        {/* Add Row Button at the bottom */}
        <div className="flex justify-end mt-4">
          <button
            className="bg-orange-500 text-white px-4 py-2 mb-4 rounded"
            onClick={() => {
              setNewRow({
                testCode: '',
                testName: '',
                testCount: '',
                extraction: '',
                library: '',
                libraryQC: '',
                wetLabExpense: '',
                patientCost: '',
                patientBilling: '',
                gbSample: '',
                totalGb: '',
                cpt: '',
                cprt: ''
              }); // <-- clear form
              setAddDialogOpen(true);
            }}
          >
            Add Row
          </button>
        </div>
      </div>
      <div className='mt-6 w-full'>
        <div className="w-full overflow-x-auto">
          <table className="w-full border border-black">
            <thead>
              <tr>
                <th className='px-4 py-2 border border-black bg-gray-50 dark:text-black'>Run Name</th>
                <th className='px-4 py-2 border border-black bg-gray-50 dark:text-black'>Run Date</th>
                <th className='px-4 py-2 border border-black bg-gray-50 dark:text-black'>Expense</th>
                <th className='px-4 py-2 border border-black bg-gray-50 dark:text-black'>Billing</th>
                <th className='px-4 py-2 border border-black bg-gray-50 dark:text-black'>GB Consumption</th>
                <th className='px-4 py-2 border border-black bg-gray-50 dark:text-black'>Per Run Profitability</th>
              </tr>
            </thead>
            <tbody>
              {filteredRunData.map((run, idx) => {
                const normalize = str =>
                  (str || '')
                    .toLowerCase()
                    .replace(/[\s+]+/g, '_')
                    .replace(/_+/g, '_')
                    .trim();

                // Expense calculation (already present)
                const runExpense = Array.isArray(run.table_data)
                  ? run.table_data.reduce((sum, test) => {
                    const row = rows.find(r =>
                      normalize(r.testName) === normalize(test.test_name)
                    );
                    if (!row) return sum;
                    const extraction = Number(row.extraction) || 0;
                    const library = Number(row.library) || 0;
                    const libraryQC = Number(row.libraryQC) || 0;
                    const testExpense = (extraction + library + libraryQC) * (Number(test.sample_count) || 0);
                    return sum + testExpense;
                  }, 0)
                  : 0;

                // Step 3: Billing calculation
                const runBilling = Array.isArray(run.table_data)
                  ? run.table_data.reduce((sum, test) => {
                    const row = rows.find(r =>
                      normalize(r.testName) === normalize(test.test_name)
                    );
                    if (!row) return sum;
                    const patientCost = Number(row.patientCost) || 0;
                    const testBilling = patientCost * (Number(test.sample_count) || 0);
                    return sum + testBilling;
                  }, 0)
                  : 0;

                // Step 4: Profit calculation
                const runProfit = runBilling - runExpense;

                return (
                  <tr key={idx}>
                    <td className='px-4 py-2 border border-black bg-gray-50 dark:text-black'>{run.run_id}</td>
                    <td className='px-4 py-2 border border-black bg-gray-50 dark:text-black'>
                      {new Date(run.seq_run_date).toLocaleDateString('en-GB')}
                    </td>
                    <td className='px-4 py-2 border border-black bg-gray-50 dark:text-black'>
                      {runExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className='px-4 py-2 border border-black bg-gray-50 dark:text-black'>
                      {runBilling.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className='px-4 py-2 border border-black bg-gray-50 dark:text-black'>{Number(run.total_required || 0).toFixed(2)}</td>
                    <td className='px-4 py-2 border border-black bg-gray-50 dark:text-black'>
                      {runProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Dialog for adding row */}
      <AddRowDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleDialogAddRow}
        newRow={newRow}
        onChange={handleNewRowChange}
        rows={rows}
        perFlowcellGb={perFlowcellGb}
        perRunSeq={perRunSeq}
        totalNoRun={totalNoRun}
        testOptions={testOptions}
      />
    </div>
  )
}

export default MangementDashboard

// Dialog component for adding a row
function AddRowDialog({
  open,
  onOpenChange,
  onAdd,
  newRow,
  onChange,
  rows,
  perFlowcellGb,
  perRunSeq,
  totalNoRun,
  testOptions
}) {
  const usedTestNames = rows.map(row => row.testName);
  const availableTestOptions = testOptions.filter(opt => !usedTestNames.includes(opt.value));
  const extraction = Number(newRow.extraction) || 0;
  const library = Number(newRow.library) || 0;
  const libraryQC = Number(newRow.libraryQC) || 0;
  const testCount = Number(newRow.testCount) || 0;
  const patientCost = Number(newRow.patientCost) || 0;
  const gbSample = Number(newRow.gbSample) || 0;

  // Simulate future rows
  const futureRow = {
    ...newRow,
    wetLabExpense: (extraction + library + libraryQC) * testCount,
    patientBilling: testCount * patientCost,
  };
  const futureRows = [...rows, futureRow];

  const wetLabExpenseSum = futureRows.reduce((sum, row) => sum + Number(row.wetLabExpense || 0), 0);
  const totalSeqExpCalc = Number(perRunSeq) * Number(totalNoRun);
  const totalLabExpenseCalc = wetLabExpenseSum + totalSeqExpCalc;
  const patientBillingSum = futureRows.reduce((sum, row) => sum + Number(row.patientBilling || 0), 0);
  const totalPandLCalc = patientBillingSum - totalLabExpenseCalc;
  const totalTestCount = futureRows.reduce((sum, row) => sum + Number(row.testCount || 0), 0);

  const perRunSeqNum = Number(perRunSeq) || 0;
  const perFlowcellGbNum = Number(perFlowcellGb) || 0;
  const totalNoRunNum = Number(totalNoRun) || 0;
  const perGbCostCalc = perFlowcellGbNum ? perRunSeqNum / perFlowcellGbNum : 0;

  // const totalSeqExpCalc = totalNoRunNum * perRunSeqNum;

  const wetLabExpense = extraction + library + libraryQC;
  const patientBilling = testCount * patientCost;
  const totalGb = testCount * gbSample;
  // CPT = libraryQC + (per_gb_cost * gbSample)
  const cpt = libraryQC + (perGbCostCalc * gbSample);
  // CPRT = libraryQC + (total_seq_exp / test_count)
  const cprt = totalTestCount ? libraryQC + (totalSeqExpCalc / totalTestCount) : libraryQC;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Row</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={e => {
            e.preventDefault();
            // Add calculated fields to newRow before adding
            onAdd({
              ...newRow,
              wetLabExpense: wetLabExpense.toFixed(2),
              patientBilling: patientBilling.toFixed(2),
              totalGb: totalGb.toFixed(2),
              cpt: cpt.toFixed(2),
              cprt: cprt.toFixed(2),
            });
          }}
          className="grid grid-cols-2 gap-4 mt-2"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Test Code</label>
            <input name="testCode" value={newRow.testCode} onChange={onChange} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Test Name & Description</label>
            <select
              name="testName"
              value={newRow.testName}
              onChange={e => {
                const selected = availableTestOptions.find(opt => opt.value === e.target.value);
                onChange({
                  testName: e.target.value,
                  testCount: selected ? String(selected.test_count) : ''
                });
              }}
              className="border p-2 rounded w-full"
            >
              <option value="">Select Test</option>
              {availableTestOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} {opt.test_count ? `(${opt.test_count})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Test Count</label>
            <input
              name="testCount"
              value={newRow.testCount}
              onChange={onChange}
              className="border p-2 rounded w-full"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Extraction</label>
            <input name="extraction" value={newRow.extraction} onChange={onChange} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Library</label>
            <input name="library" value={newRow.library} onChange={onChange} className="border p-2 rounded w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Library QC</label>
            <input name="libraryQC" value={newRow.libraryQC} onChange={onChange} className="border p-2 rounded w-full" />
          </div>
          {/* Calculated: Wet Lab Expense */}
          <div>
            <label className="block text-sm font-medium mb-1">Wet Lab Expense</label>
            <input value={futureRow.wetLabExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} readOnly className="border p-2 rounded w-full bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Patient Cost</label>
            <input name="patientCost" value={newRow.patientCost} onChange={onChange} className="border p-2 rounded w-full" />
          </div>
          {/* Calculated: Patient Billing */}
          <div>
            <label className="block text-sm font-medium mb-1">Patient Billing</label>
            <input value={patientBilling.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} readOnly className="border p-2 rounded w-full bg-gray-100" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">GB/Sample</label>
            <input name="gbSample" value={newRow.gbSample} onChange={onChange} className="border p-2 rounded w-full" />
          </div>
          {/* Calculated: Total GB */}
          <div>
            <label className="block text-sm font-medium mb-1">Total GB</label>
            <input value={totalGb.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} readOnly className="border p-2 rounded w-full bg-gray-100" />
          </div>
          {/* Calculated: CPT */}
          <div>
            <label className="block text-sm font-medium mb-1">CPT</label>
            <input value={cpt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} readOnly className="border p-2 rounded w-full bg-gray-100" />
          </div>
          {/* Calculated: CPRT */}
          <div>
            <label className="block text-sm font-medium mb-1">CPRT</label>
            <input value={cprt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} readOnly className="border p-2 rounded w-full bg-gray-100" />
          </div>
          <div className="col-span-2 flex justify-end">
            <button type="submit" className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600">
              Add Row
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}