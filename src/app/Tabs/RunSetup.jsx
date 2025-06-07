'use client'

import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Cookies from 'js-cookie'
import React, { use, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaQuora } from 'react-icons/fa'
import { toast, ToastContainer } from 'react-toastify'
import { set, z } from 'zod'

const formSchema = z.object({
  // application: z.string().min(1, 'Application is required'),
  selected_application: z.string().optional(),
  seq_run_date: z.string().min(1, 'Sequence run date is required'),
  total_gb_available: z.string().min(1, 'Total GB available is required'),
  instument_type: z.string().min(1, 'Instrument type is required'),
  pool_size: z.number().min(1, 'Pool size is required'),
  pool_conc: z.string().min(1, 'Pool concentration is required'),
  nm_cal: z.number().min(1, 'nM calibration is required'),
  total_required: z.number().min(1, 'Total required is required'),
  dinatured_lib_next_seq_550: z.number().optional(),
  total_volume_next_seq_550: z.number().optional(),
  final_pool_vol_ul: z.number().min(1, 'Final pool volume (ul) is required'),
  loading_conc_550: z.number().optional(),
  lib_required_next_seq_550: z.number().optional(),
  buffer_volume_next_seq_550: z.number().optional(),
  final_pool_conc_vol_2nm_next_seq_1000_2000: z.number().optional(),
  rsbetween_vol_2nm_next_seq_1000_2000: z.number().optional(),
  total_volume_2nm_next_seq_1000_2000: z.number().optional(),
  vol_of_2nm_for_600pm_next_seq_1000_2000: z.number().optional(),
  vol_of_rs_between_for_600pm_next_seq_1000_2000: z.number().optional(),
  total_volume_600pm_next_seq_1000_2000: z.number().optional(),
  loading_conc_1000_2000: z.number().optional(),
  select_application: z.array(z.string()).optional(),
  total_volume_2nm_next_seq_550: z.number().optional(),
  final_pool_conc_vol_2nm_next_seq_550: z.number().optional(),
  nfw_vol_2nm_next_seq_550: z.number().optional(),
  table_data: z.string().optional(),
  ht_buffer_next_seq_1000_2000: z.number().optional(),
})

const RunSetup = () => {
  const [testNames, setTestNames] = useState([]);
  const [poolData, setPoolData] = useState([]);
  const [selectedTestNames, setSelectedTestNames] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]); // Track selected checkboxes
  const [size, setSize] = useState([]);
  const [percentage, setPercentage] = useState([]);
  const [avgSize, setAvgSize] = useState(0);
  const [InstrumentType, setInstrumentType] = useState('');
  const user = JSON.parse(Cookies.get('user') || '{}');

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // application: '',
      seq_run_date: '',
      total_gb_available: '0',
      instument_type: '',
      pool_size: 0, // Ensure numeric default value
      pool_conc: '0',
      nm_cal: 0,
      total_required: 0,
      final_pool_vol_ul: 0,
      selected_application: '',
      dinatured_lib_next_seq_550: 20,
      total_volume_next_seq_550: 0, // Ensure numeric default value
      loading_conc_550: 0, // Ensure numeric default value
      lib_required_next_seq_550: 0, // Ensure numeric default value
      buffer_volume_next_seq_550: 0, // Ensure numeric default value
      final_pool_conc_vol_2nm_next_seq_1000_2000: 0, // Ensure numeric default value
      rsbetween_vol_2nm_next_seq_1000_2000: 0, // Ensure numeric default value
      total_volume_2nm_next_seq_1000_2000: 0, // Ensure numeric default value
      vol_of_2nm_for_600pm_next_seq_1000_2000: 0, // Ensure numeric default value
      vol_of_rs_between_for_600pm_next_seq_1000_2000: 0, // Ensure numeric default value
      total_volume_600pm_next_seq_1000_2000: 0, // Ensure numeric default value
      loading_conc_1000_2000: 600,
      total_volume_2nm_next_seq_550: 0, // Ensure numeric default value
      final_pool_conc_vol_2nm_next_seq_550: 0, // Ensure numeric default value
      nfw_vol_2nm_next_seq_550: 0, // Ensure numeric default value
      ht_buffer_next_seq_1000_2000: 0, // Ensure numeric default value
      table_data: [],
    },
  });

  useEffect(() => {
    const fetchTestNames = async () => {
      try {
        if (!user.hospital_name) {
          console.error("Hospital name is missing");
          return;
        }

        const response = await axios.get(`/api/test-names?hospital_name=${user.hospital_name}`);
        if (response.data[0].status === 200) {
          setTestNames(response.data[0].data);
        } else if (response.data[0].status === 404) {
          setTestNames([]);
          console.log("No test names found for the provided hospital name");
        }
      } catch (error) {
        console.error("Error fetching test names:", error);
      }
    };

    fetchTestNames();
  }, []);


  const handleTestNameChange = async (selectedTestName) => {
    try {
      if (!user.hospital_name || !selectedTestName) {
        console.log("Hospital name or test name is missing");
        return;
      }

      // Prevent duplicates in the selectedTestName list
      if (selectedTestNames.includes(selectedTestName)) {
        console.log("Test name already selected");
        return;
      }

      // Remove the selected test name from the dropdown
      setTestNames((prev) => prev.filter((test) => test.test_name !== selectedTestName));

      // Add the selected test name to the selected list
      const updatedSelectedTestNames = [...selectedTestNames, selectedTestName];
      setSelectedTestNames(updatedSelectedTestNames);

      // Update the selected_application field in the form state
      form.setValue("selected_application", updatedSelectedTestNames.join(", "));

      // Fetch pool data for the selected test name
      const response = await axios.get(`/api/pool-data?hospital_name=${user.hospital_name}&application=${selectedTestName}`);
      if (response.data[0].status === 200) {
        const poolDataForTest = response.data[0].data;

        // Update poolData state
        setPoolData((prev) => [...prev, ...poolDataForTest]);
      } else if (response.data[0].status === 404) {
        console.log("No pool data found for the provided hospital name and test name");
      }

      // Reset the application field in the form
      form.setValue("application", ""); // Reset the select value
    } catch (error) {
      console.log("Error fetching pool data:", error);
    }
  };

  const handleSubmit = async (data) => {
    try {
      const filteredPoolData = poolData.filter((pool) =>
        selectedTestNames.includes(pool.test_name)
      );

      const selectedSampleIds = filteredPoolData.map((pool) => pool.sample_id);

      const response = await axios.post('/api/run-setup', {
        setup: {
          ...data,
          table_data: data.table_data, // Use table_data from form state
          sample_ids: selectedSampleIds,
          hospital_name: user.hospital_name,
        },
      });

      if (response.data[0].status === 200) {
        toast.success("Run setup submitted successfully!");
        form.reset();
        setSelectedTestNames([]);
        setSelectedCheckboxes([]);
        setPoolData([]);
      } else if (response.data[0].status === 404) {
        toast.error(response.data[0].message || "No data found for the provided hospital name and test name");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form.");
    }
  };

  const validateTotalGbAvailable = () => {
    const totalRequired = form.getValues("total_required"); // Get the current value of total_required
    console.log('totalRequired', totalRequired);
    const totalGbAvailable = form.getValues("total_gb_available"); // Get the current value of total_gb_available

    if (Number(totalGbAvailable) < Number(totalRequired)) {
      // If total_gb_available is less than total_required, reset the field and show an error
      form.setValue("total_gb_available", 0);
      toast.error("Total GB available cannot be less than Total Required.");
    }
  };


  const dinatured_lib_next_seq_550 = form.watch("dinatured_lib_next_seq_550");
  const total_volume_next_seq_550 = form.watch("total_volume_next_seq_550");
  const loading_conc_550 = form.watch("loading_conc_550");
  useEffect(() => {
    if (dinatured_lib_next_seq_550 && total_volume_next_seq_550 && loading_conc_550) {
      const libReq = parseFloat((total_volume_next_seq_550 * loading_conc_550 / dinatured_lib_next_seq_550).toFixed(2));
      form.setValue("lib_required_next_seq_550", libReq);
      const bufferVolume = parseFloat((total_volume_next_seq_550 - libReq).toFixed(2));
      form.setValue("buffer_volume_next_seq_550", bufferVolume);
    }
  }, [dinatured_lib_next_seq_550, total_volume_next_seq_550, loading_conc_550])

  const nMCal = form.watch("nm_cal");
  const totalVol2nM = form.watch("total_volume_2nm_next_seq_1000_2000");
  useEffect(() => {
    if (nMCal && totalVol2nM) {
      const volumeForFinalPoolConc2nM = parseFloat((2 * totalVol2nM / nMCal).toFixed(2));
      form.setValue("final_pool_conc_vol_2nm_next_seq_1000_2000", volumeForFinalPoolConc2nM);
      const rsBetweenVol2nM = parseFloat((totalVol2nM - volumeForFinalPoolConc2nM).toFixed(2));
      form.setValue("rsbetween_vol_2nm_next_seq_1000_2000", rsBetweenVol2nM);
    }
  }, [nMCal, totalVol2nM])

  const totalVolumeLoadingConc = form.watch("total_volume_600pm_next_seq_1000_2000");
  const loading_conc_1000_2000 = form.watch("loading_conc_1000_2000");
  useEffect(() => {
    if (totalVolumeLoadingConc && loading_conc_1000_2000) {
      console.log('loading_conc', loading_conc_1000_2000);
      const volOf2nmLoadingConc = parseFloat((loading_conc_1000_2000 * totalVolumeLoadingConc / 2000).toFixed(2));
      form.setValue("vol_of_2nm_for_600pm_next_seq_1000_2000", volOf2nmLoadingConc);
      const volOfRsBetweenLoadingConc = parseFloat((totalVolumeLoadingConc - volOf2nmLoadingConc).toFixed(2));
      form.setValue("vol_of_rs_between_for_600pm_next_seq_1000_2000", volOfRsBetweenLoadingConc);
    }
  }, [totalVolumeLoadingConc, loading_conc_1000_2000]);


  const totalVolume2nMNextSeq550 = form.watch("total_volume_2nm_next_seq_550");
  useEffect(() => {
    const volumeForFinalPoolConc2nM = parseFloat((2 * totalVolume2nMNextSeq550 / nMCal).toFixed(2));
    form.setValue("final_pool_conc_vol_2nm_next_seq_550", volumeForFinalPoolConc2nM);
    const rnfwVol2nM = parseFloat((totalVolume2nMNextSeq550 - volumeForFinalPoolConc2nM).toFixed(2));
    form.setValue("nfw_vol_2nm_next_seq_550", rnfwVol2nM);
  })

  const handleCheckboxChange = (testName, isChecked) => {
    let updatedCheckboxes;

    if (isChecked) {
      // Add the test name to the selected checkboxes
      updatedCheckboxes = [...selectedCheckboxes, testName];

      // Extract the size data for the selected test_name
      const sizeData = poolData
        .filter((pool) => pool.test_name === testName)
        .map((pool) => Number(pool.size)); // Ensure size is a number

      // Update the size state
      setSize((prev) => [...prev, ...sizeData]);
    } else {
      // Remove the test name from the selected checkboxes
      updatedCheckboxes = selectedCheckboxes.filter((name) => name !== testName);

      // Remove the size data for the deselected test_name
      const sizeDataToRemove = poolData
        .filter((pool) => pool.test_name === testName)
        .map((pool) => Number(pool.size)); // Ensure size is a number

      setSize((prev) => prev.filter((size) => !sizeDataToRemove.includes(size)));
    }

    setSelectedCheckboxes(updatedCheckboxes);

    // Calculate the average size
    const updatedSize = poolData
      .filter((pool) => updatedCheckboxes.includes(pool.test_name))
      .map((pool) => Number(pool.size)); // Ensure size is a number

    const avgSize = updatedSize.length > 0
      ? parseFloat((updatedSize.reduce((sum, size) => sum + size, 0) / updatedSize.length).toFixed(2))
      : 0;

    setAvgSize(avgSize); // Update the avgSize state

    // Trigger validation for total_gb_available
    validateTotalGbAvailable();
  };

  useEffect(() => {
    const totalGbAvailable = Number(form.watch("total_gb_available")); // Watch for changes in total_gb_available

    if (totalGbAvailable > 0) {
      const updatedPercentageData = poolData
        .filter((pool) => selectedCheckboxes.includes(pool.test_name))
        .map((pool) => ({
          test_name: pool.test_name,
          percentage: parseFloat(((pool.data_required / totalGbAvailable) * 100).toFixed(2)),
        }));

      setPercentage(updatedPercentageData);
    } else {
      setPercentage([]); // Reset percentages if total_gb_available is invalid
    }
  }, [form.watch("total_gb_available"), selectedCheckboxes, poolData]);

  const pool_conc = form.watch("pool_conc");

  useEffect(() => {
    if (avgSize && pool_conc && !isNaN(avgSize) && !isNaN(pool_conc)) {
      const nM = parseFloat(((pool_conc / (avgSize * 660)) * 1000000).toFixed(9)); // Perform calculation
      form.setValue("nm_cal", nM); // Update nm_cal field
    } else {
      form.setValue("nm_cal", 0); // Set default value if inputs are invalid
    }
  }, [avgSize, pool_conc]); // Watch for changes in pool_size and pool_conc

  useEffect(() => {
    if (avgSize && !isNaN(avgSize)) {
      form.setValue("pool_size", avgSize); // Set the value programmatically

      form.trigger("pool_size"); // Trigger validation for the pool_size field
    }
  }, [avgSize]); // Watch for changes in avgSize


  useEffect(() => {
    const updatedTableData = selectedTestNames.map((test) => {

      const filteredPoolData = poolData.filter((pool) => pool.test_name === test);

      const sampleCount = filteredPoolData.length;

      const totalDataRequiredForTest = poolData
        .filter((pool) => pool.test_name === test)
        .reduce((sum, pool) => sum + (pool.data_required || 0), 0);

      const percentageForTest = percentage
        .filter((item) => item.test_name === test)
        .reduce((sum, item) => sum + item.percentage, 0) || 0;

      const finalPoolVolUl = form.getValues("final_pool_vol_ul");
      const calculatedFinalPoolVolUl = parseFloat(((percentageForTest / 100) * finalPoolVolUl).toFixed(2));

      return {
        test_name: test,
        total_data_required: totalDataRequiredForTest,
        sample_count: sampleCount,
        percentage: percentageForTest,
        final_pool_volume_ul: calculatedFinalPoolVolUl,
      };
    });

    // Update table_data directly in the form state
    form.setValue("table_data", JSON.stringify(updatedTableData));
  }, [selectedTestNames, poolData, percentage, form.watch("final_pool_vol_ul")]);

  useEffect(() => {
    // Calculate the total required data based on selected test names
    const totalRequired = poolData
      .filter((pool) => selectedTestNames.includes(pool.test_name)) // Filter pool data for selected test names
      .reduce((sum, pool) => sum + (pool.data_required || 0), 0); // Sum up the data_required values

    form.setValue("total_required", totalRequired); // Update the total_required field in the form
  }, [selectedTestNames, poolData]); // Trigger the effect whenever selectedTestNames or poolData change


  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className='w-1/2 mx-auto mt-4 grid grid-cols-2 gap-4'>
            {/* Application Dropdown */}
            <FormField
              control={form.control}
              name="application"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Application</FormLabel>
                  <select
                    {...field}
                    onChange={(e) => {
                      field.onChange(e); // Update form state
                      handleTestNameChange(e.target.value); // Fetch pool data and update state
                    }}
                    className="mb-2 w-full p-2 border-2 border-orange-300 rounded">
                    <option value="">Select application</option>
                    {testNames && testNames.map((test) => (
                      <option
                        key={test.test_name}
                        value={test.test_name}>
                        {test.test_name}
                      </option>
                    ))}
                  </select>
                </FormItem>
              )}
            />

            {/* final pool vol (ul) */}
            <FormField
              control={form.control}
              name="final_pool_vol_ul"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Final Pool Volume (ul)</FormLabel>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter final pool volume (ul)"
                    value={field.value !== undefined && !isNaN(field.value) ? field.value : 0} // Ensure valid numeric value
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))} // Convert input to number
                    className="mb-2 border-2 border-orange-300"
                    required
                  />
                  {form.formState.errors.final_pool_vol_ul && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.final_pool_vol_ul.message}
                    </p>
                  )}
                </FormItem>
              )}
            />


            { /* Selected Applications */}
            <div className="col-span-2">
              <FormField
                control={form.control}
                name="selected_application"
                render={({ field }) => (
                  <FormItem>
                    <div className="mb-2 p-2 ">
                      {selectedTestNames && selectedTestNames.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Application</TableHead>
                              <TableHead>Data Required (GB)</TableHead>
                              <TableHead>%</TableHead>
                              <TableHead>Final Pool Volume (ul)</TableHead>
                              <TableHead>Add Data</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedTestNames.map((test) => {
                              // Calculate the total data_required for the current test
                              const totalDataRequiredForTest = poolData
                                .filter((pool) => pool.test_name === test)
                                .reduce((sum, pool) => sum + (pool.data_required || 0), 0);

                              // Get the percentage for the current test_name
                              const percentageForTest = percentage
                                .filter((item) => item.test_name === test)
                                .reduce((sum, item) => sum + item.percentage, 0) || 0;

                              // Get the final pool volume (ul) from the input field
                              const finalPoolVolUl = form.getValues("final_pool_vol_ul");

                              // Calculate the final pool volume (ul) for the current test_name
                              const calculatedFinalPoolVolUl = parseFloat(((percentageForTest / 100) * finalPoolVolUl).toFixed(2));

                              return (
                                <TableRow key={test}>
                                  <TableCell>{test}</TableCell>
                                  <TableCell>
                                    {totalDataRequiredForTest > 0 ? totalDataRequiredForTest : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    {percentageForTest}%
                                  </TableCell>
                                  <TableCell>
                                    {calculatedFinalPoolVolUl > 0 ? calculatedFinalPoolVolUl : 'N/A'}
                                  </TableCell>
                                  <TableCell>
                                    <Input
                                      type="checkbox"
                                      name="select_application"
                                      className="w-[20px] h-[20px]"
                                      onChange={(e) => handleCheckboxChange(test, e.target.checked)} // Handle checkbox change
                                    />
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      ) : null}
                    </div>
                  </FormItem>
                )}
              />
            </div>


            <FormField
              control={form.control}
              name="total_required"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Total Required (GB)</FormLabel>
                  <Input
                    {...field}
                    value={field.value ?? 0}
                    type="number"
                    disabled
                    placeholder="Enter total required"
                    className="mb-2 border-2 border-orange-300"
                  />
                </FormItem>
              )}
            />

            {/* total gb Available */}
            <FormField
              control={form.control}
              name="total_gb_available"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Total Available (GB)</FormLabel>
                  <Input
                    {...field}
                    min="0"
                    required
                    value={field.value ?? 0}
                    onBlur={() => validateTotalGbAvailable()} // Trigger validation on blur
                    type="number"
                    placeholder="Enter total GB available"
                    className="mb-2 border-2 border-orange-300"
                  />
                  {form.formState.errors.total_gb_available && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.total_gb_available.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* sequnce run date*/}
            <FormField
              control={form.control}
              name="seq_run_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Sequence Run Date</FormLabel>
                  <Input
                    {...field}
                    type="date"
                    className="mb-2 border-2 border-orange-300"
                    required
                  />

                </FormItem>
              )}
            />

            {/* pool concentration */}
            <FormField
              control={form.control}
              name="pool_conc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Final Pool Concentration (Qubit)</FormLabel>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    step="0.01"
                    value={field.value !== undefined && !isNaN(field.value) ? field.value.toString() : "0"} // Ensure valid value
                    onChange={(e) => field.onChange(e.target.value === "" ? "0" : e.target.value)} // Handle empty input
                    placeholder="Enter pool concentration"
                    className="mb-2 border-2 border-orange-300"
                  />
                </FormItem>

              )}
            />

            {/* pool size */}
            <FormField
              control={form.control}
              name="pool_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Average Final Pool Size (Tapestation)</FormLabel>
                  <Input
                    {...field}
                    type="number"
                    step="0.01" // Allow decimal values
                    value={field.value !== undefined && !isNaN(field.value) ? field.value : ''} // Ensure valid value
                    onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))} // Convert input to number
                    placeholder="Enter pool size"
                    className="mb-2 border-2 border-orange-300" 
                  />
                  {form.formState.errors.pool_size && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.pool_size.message}
                    </p>
                  )}
                </FormItem>
              )}
            />


            {/* nM Calculation */}
            <FormField
              control={form.control}
              name="nm_cal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Final Pool nM Calculation</FormLabel>
                  <Input
                    required
                    {...field}
                    value={field.value ?? 0}
                    type="number"
                    placeholder="Enter nM calculation"
                    className="mb-2 border-2 border-orange-300"
                  />
                  {form.formState.errors.nm_cal && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.nm_cal.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* Instrument Type */}
            <FormField
              control={form.control}
              name="instument_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Instrument Type</FormLabel>
                  <select
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e); // Update form state
                      setInstrumentType(e.target.value); // Update instrument type state
                    }}
                    className="mb-2 w-full p-2 border-2 border-orange-300 rounded"
                    required>
                    <option value="">Select instrument type</option>
                    <option value="NextSeq_550">NextSeq 550</option>
                    <option value="NextSeq_1000_2000">NextSeq 1000/2000</option>
                  </select>
                </FormItem>
              )}
            />

            {InstrumentType && InstrumentType === 'NextSeq_550' ? (
              <>

                {/* total volume for 2nM */}
                <FormField
                  control={form.control}
                  name='total_volume_2nm_next_seq_550'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Total Volume (2nM)</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        value={field.value ?? ""}
                        onChange={e => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)}
                        placeholder="Enter Total Volume (2nM)"
                        className="mb-2 border-2 border-orange-300"
                      />
                      {form.formState.errors.total_volume_2nm_next_seq_1000_2000 && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.total_volume_2nm_next_seq_1000_2000.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                {/* final pool conc vol for 2nM */}
                <FormField
                  control={form.control}
                  name='final_pool_conc_vol_2nm_next_seq_550'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Volulme for Final Pool conc 2nM</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter Volulme for Final Pool conc 2nM"
                        className="mb-2 border-2 border-orange-300"
                      />
                    </FormItem>
                  )}
                />

                {/* NFW vol for 2nM */}
                <FormField
                  control={form.control}
                  name='nfw_vol_2nm_next_seq_550'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">NFW (2nM)</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter RS Between (2nM)"
                        className="mb-2 border-2 border-orange-300"
                      />
                    </FormItem>
                  )}
                />
                {/* dinatured */}
                <FormField
                  control={form.control}
                  name='dinatured_lib_next_seq_550'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Stock Conc(pM)</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        value={field.value ?? ""}
                        onChange={e => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)}
                        placeholder="Enter Stock Concentration"
                        className="mb-2 border-2 border-orange-300"
                      />
                      {form.formState.errors.dinatured_lib_next_seq_550 && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.dinatured_lib_next_seq_550.message}
                        </p>
                      )}
                    </FormItem>

                  )}
                />

                {/* total volume */}
                <FormField
                  control={form.control}
                  name='total_volume_next_seq_550'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Total Volume</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        value={field.value ?? ""}
                        onChange={e => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)}
                        placeholder="Enter Total Volume"
                        className="mb-2 border-2 border-orange-300"
                      />
                      {form.formState.errors.total_volume_next_seq_550 && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.total_volume_next_seq_550.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                {/* Loading Conc */}
                <FormField
                  control={form.control}
                  name='loading_conc_550'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Required Concentration(pM)</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        value={field.value ?? ""}
                        onChange={e => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)}
                        placeholder="Enter Required Concentration"
                        className="mb-2 border-2 border-orange-300"
                      />
                    </FormItem>
                  )}
                />

                {/* lib required */}
                <FormField
                  control={form.control}
                  name='lib_required_next_seq_550'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Volume from Stock</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter Volume from Stock"
                        className="mb-2 border-2 border-orange-300"
                      />
                    </FormItem>
                  )}
                />

                {/* buffer volume */}
                <FormField
                  control={form.control}
                  name='buffer_volume_next_seq_550'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2"> HT Buffer</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter HT Buffer"
                        className="mb-2 border-2 border-orange-300"
                      />
                      {form.formState.errors.ht_buffer_next_seq_1000_2000 && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.ht_buffer_next_seq_1000_2000.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

              </>
            ) : ""}

            {InstrumentType && InstrumentType === 'NextSeq_1000_2000' ? (
              <>

                {/* total volume for 2nM */}
                <FormField
                  control={form.control}
                  name="total_volume_2nm_next_seq_1000_2000"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Total Volume (2nM)</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        value={field.value !== undefined && !isNaN(field.value) ? field.value : 0} // Ensure valid numeric value
                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))} // Convert input to number
                        placeholder="Enter Total Volume (2nM)"
                        className="mb-2 border-2 border-orange-300"
                      />
                      {form.formState.errors.total_volume_2nm_next_seq_1000_2000 && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.total_volume_2nm_next_seq_1000_2000.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                {/* final pool conc vol for 2nM */}
                <FormField
                  control={form.control}
                  name='final_pool_conc_vol_2nm_next_seq_1000_2000'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Volulme for Final Pool conc 2nM</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        value={field.value !== undefined && !isNaN(field.value) ? field.value : 0} // Ensure valid value
                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                        placeholder="Enter Volulme for Final Pool conc 2nM"
                        className="mb-2 border-2 border-orange-300"
                      />
                    </FormItem>
                  )}
                />

                {/* RSBetween vol for 2nM */}
                <FormField
                  control={form.control}
                  name='rsbetween_vol_2nm_next_seq_1000_2000'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">RS Between (2nM)</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        value={field.value !== undefined && !isNaN(field.value) ? field.value : 0} // Ensure valid value
                        onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                        placeholder="Enter RS Between (2nM)"
                        className="mb-2 border-2 border-orange-300"
                      />
                    </FormItem>
                  )}
                />

                {/* loading concentration */}
                <FormField
                  control={form.control}
                  name='loading_conc_1000_2000'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Loading Concentration(pM)</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter Loading Concentration"
                        value={600}
                        className="mb-2 border-2 border-orange-300"
                      />
                    </FormItem>
                  )}
                />

                {/* total volume of 600pM */}
                <FormField
                  control={form.control}
                  name='total_volume_600pm_next_seq_1000_2000'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Total Volume(600pM)</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        value={field.value ?? ""}
                        onChange={e => field.onChange(e.target.value === "" ? "" : e.target.valueAsNumber)}
                        placeholder="Enter Total Volume(600pM)"
                        className="mb-2 border-2 border-orange-300"
                      />
                      {form.formState.errors.total_volume_600pm_next_seq_1000_2000 && (
                        <p className="text-red-500 text-sm">
                          {form.formState.errors.total_volume_600pm_next_seq_1000_2000.message}
                        </p>
                      )}
                    </FormItem>
                  )}
                />

                {/* vol for 2nM of the loading conc */}
                <FormField
                  control={form.control}
                  name='vol_of_2nm_for_600pm_next_seq_1000_2000'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Volume of 2nM conc(600pM)</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter Volume of 2nM conc(600pM)"
                        className="mb-2 border-2 border-orange-300"
                      />
                    </FormItem>
                  )}
                />

                {/* vol of RSBetween of loading conc */}
                <FormField
                  control={form.control}
                  name='vol_of_rs_between_for_600pm_next_seq_1000_2000'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Volume of RS Between(600pM)</FormLabel>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Enter Volume of RS Between(600pM)"
                        className="mb-2 border-2 border-orange-300"
                      />
                    </FormItem>
                  )}
                />



              </>
            ) : ""}

            {/* Retrieve table data on submit
            <FormField
              control={form.control}
              name="table_data"
              render={({ field }) => (
                <FormItem>
                  <Input
                    type="hidden"
                    {...field}
                  />
                </FormItem>
              )}
            /> */}

            <Button
              type="submit"
              className="w-full mt-7 bg-gray-700 text-white py-2 rounded hover:bg-gray-800 transition-colors"
            >
              Submit
            </Button>


          </div>
        </form>
      </Form>
      <ToastContainer />
    </div>
  );
};

export default RunSetup;