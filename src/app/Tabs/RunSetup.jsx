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
import { toast, ToastContainer } from 'react-toastify'
import { z } from 'zod'

const formSchema = z.object({
  // application: z.string().min(1, 'Application is required'),
  selected_application: z.string().optional(),
  seq_run_date: z.string().min(1, 'Sequence run date is required'),
  total_gb_available: z.string().min(1, 'Total GB available is required'),
  instument_type: z.string().min(1, 'Instrument type is required'),
  pool_size: z.string().min(1, 'Pool size is required'),
  pool_conc: z.string().min(1, 'Pool concentration is required'),
  nM_cal: z.number().min(1, 'nM calibration is required'),
})

const RunSetup = () => {
  const [testNames, setTestNames] = useState([]);
  const [poolData, setPoolData] = useState([]);
  const [selectedTestNames, setSelectedTestNames] = useState([]);
  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]); // Track selected checkboxes
  const user = JSON.parse(Cookies.get('user') || '{}');

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      application: '',
      seq_run_date: '',
      total_gb_available: '',
      instument_type: '',
      pool_size: '',
      pool_conc: '',
      nM_cal: 0,
      total_required: 0,
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
        setPoolData((prev) => [...prev, ...response.data[0].data]);
      } else if (response.data[0].status === 404) {
        console.log("No pool data found for the provided hospital name and test name");
      }

      // Reset the application field in the form
      form.setValue("application", ""); // Reset the select value
    } catch (error) {
      console.log("Error fetching pool data:", error);
    }
  };

  const handleRemoveTestName = (testNameToRemove) => {
    // Remove the test name from the selected list
    const updatedSelectedTestNames = selectedTestNames.filter((test) => test !== testNameToRemove);
    setSelectedTestNames(updatedSelectedTestNames);

    // Update the selected_application field in the form state
    form.setValue("selected_application", updatedSelectedTestNames.join(", "));

    // Add the removed test name back to the dropdown
    setTestNames((prev) => [...prev, { test_name: testNameToRemove }]);

    // Remove associated pool data
    setPoolData((prev) => prev.filter((pool) => pool.test_name !== testNameToRemove));
  };

  const handleSubmit = async (data) => {
    console.log('data', data);
  }


  const handleGbAvailable = (value) => {
   if(value < form.getValues('total_required')){
    toast.error("Total GB available cannot be less than total required.");
   }
  }

  // useEffect(() => {
  //   if(form.getValues('total_gb_available') <= totalDataRequired) {
  //     toast.error("Total data required exceeds the total GB available.");
  //     form.setValue("total_gb_available", ""); // Reset the total GB available field
  //   } 
  // },[form.getValues('total_gb_available')])

  const pool_size = form.watch("pool_size");
  const pool_conc = form.watch("pool_conc");
  useEffect(() => {
    if (pool_size && pool_conc) {
      const nM = parseFloat(((pool_conc / (pool_size * 660)) * 1000000).toFixed(9));
      form.setValue("nM_cal", nM);
    }
  }, [pool_size, pool_conc])

  const handleCheckboxChange = (testName, isChecked) => {
    let updatedCheckboxes;

    if (isChecked) {
      // Add the test name to the selected checkboxes
      updatedCheckboxes = [...selectedCheckboxes, testName];
    } else {
      // Remove the test name from the selected checkboxes
      updatedCheckboxes = selectedCheckboxes.filter((name) => name !== testName);
    }

    setSelectedCheckboxes(updatedCheckboxes);

    // Calculate the total data required for selected checkboxes
    const totalDataRequired = poolData
      .filter((pool) => updatedCheckboxes.includes(pool.test_name))
      .reduce((sum, pool) => sum + (pool.data_required || 0), 0);

    // Update the Total Required field in the form
    form.setValue("total_required", totalDataRequired);};

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
                    className="mb-2 w-full p-2 border rounded">
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
                    className="mb-2"
                    required
                  />

                </FormItem>
              )}
            />

            {/* Selected Applications */}
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
                              <TableHead>Delete</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedTestNames.map((test) => {
                              // Calculate the total data_required for the current test
                              const totalDataRequiredForTest = poolData
                                .filter((pool) => pool.test_name === test)
                                .reduce((sum, pool) => sum + (pool.data_required || 0), 0);

                              return (
                                <TableRow key={test}>
                                  <TableCell>{test}</TableCell>
                                  <TableCell>
                                    {totalDataRequiredForTest > 0 ? totalDataRequiredForTest : 'N/A'}
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
                    // value={totalDataRequired || ''}
                    type="number"
                    disabled
                    placeholder="Enter total required"
                    className="mb-2"
                  />
                </FormItem>
              )}
            />

            {/* total gb Availabe */}
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
                    onBlur={(e) => handleGbAvailable(e.target.value)}
                    type="number"
                    placeholder="Enter total GB available"
                    className="mb-2"
                  />
                  {form.formState.errors.total_gb_available && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.total_gb_available.message}
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* pool size */}
            <FormField
              control={form.control}
              name="pool_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Final Pool Size (Tapestation)</FormLabel>
                  <Input
                    required
                    {...field}
                    placeholder="Enter pool size"
                    className="mb-2"
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
                    placeholder="Enter pool concentration"
                    className="mb-2"
                  />
                </FormItem>

              )}
            />


            {/* nM Calculation */}
            <FormField
              control={form.control}
              name="nM_cal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Final Pool nM Calculation</FormLabel>
                  <Input
                    required
                    {...field}
                    type="number"
                    placeholder="Enter nM calculation"
                    className="mb-2"
                  />
                  {form.formState.errors.nM_cal && (
                    <p className="text-red-500 text-sm">
                      {form.formState.errors.nM_cal.message}
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
                    className="mb-2 w-full p-2 border rounded"
                    required>
                    <option value="">Select instrument type</option>
                    <option value="NextSeq_550">NextSeq 550</option>
                    <option value="NextSeq_1000_2000">NextSeq 1000/2000</option>
                  </select>
                </FormItem>
              )}
            />

            

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