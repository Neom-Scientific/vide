import { Button } from '@/components/ui/button'
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z.object({
  application: z.string().min(1, 'Application is required'),
  selected_application: z.string().optional(),
  seq_run_date: z.string().min(1, 'Sequence run date is required'),
  total_gb_available: z.number().min(1, 'Total GB available is required'),
  instument_type: z.string().min(1, 'Instrument type is required'),
  pool_size: z.number().min(1, 'Pool size is required'),
  pool_conc: z.number().min(1, 'Pool concentration is required'),
  nM_cal: z.number().min(1, 'nM calibration is required'),
})

const RunSetup = () => {
  const [testNames, setTestNames] = useState([]);
  const [poolData, setPoolData] = useState([]);
  const [selectedTestNames, setSelectedTestNames] = useState([]);
  const user = JSON.parse(Cookies.get('user') || '{}');
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      application: '',
      seq_run_date: '',
      total_gb_available: 0,
      instument_type: '',
      pool_size: 0,
      nM_cal: 0,
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
        console.log("Response data:", response.data);
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
      setSelectedTestNames((prev) => [...prev, selectedTestName]);

      // Fetch pool data for the selected test name
      const response = await axios.get(`/api/pool-data?hospital_name=${user.hospital_name}&application=${selectedTestName}`);
      console.log("Pool data:", response.data);
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
    setSelectedTestNames((prev) => prev.filter((test) => test !== testNameToRemove));

    // Add the removed test name back to the dropdown
    setTestNames((prev) => [...prev, { test_name: testNameToRemove }]);

    // Remove associated pool data
    setPoolData((prev) => prev.filter((pool) => pool.test_name !== testNameToRemove));

    // Reset the application field in the form
    form.setValue("application", ""); // Reset the select value
  };
  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => console.log(data))}>
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
                    <FormLabel className="mb-2">Selected Application</FormLabel>
                    <div className="mb-2 p-2 border rounded">
                      {selectedTestNames && selectedTestNames.length > 0 ? (
                        selectedTestNames.map((test) => {
                          // Calculate the total data_required for the current test
                          const totalDataRequired = poolData
                            .filter((pool) => pool.test_name === test)
                            .reduce((sum, pool) => sum + (pool.data_required || 0), 0);

                          return (
                            <div
                              className="flex justify-between items-center mb-2 p-2 border-b last:border-b-0"
                              key={test}
                            >
                              {/* Test Name */}
                              <span className="font-semibold flex-1">{test}</span>

                              {/* Data Required */}
                              <span className="text-sm text-gray-700 flex-1 text-center">
                                Data Required: {totalDataRequired} GB
                              </span>

                              {/* Remove Button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveTestName(test)} // Remove test name
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                x
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        // Placeholder message when no applications are selected
                        <div className="text-gray-500 text-sm text-center">
                          No applications selected.
                        </div>
                      )}
                    </div>
                  </FormItem>
                )}
              />
            </div>


            {/* total gb Availabe */}
            <FormField
              control={form.control}
              name="total_gb_available"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Total GB Available</FormLabel>
                  <Input
                    {...field}
                    type="number"
                    min="0"
                    placeholder="Enter total GB available"
                    className="mb-2"
                  />
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
                  <select {...field} className="mb-2 w-full p-2 border rounded">
                    <option value="">Select instrument type</option>
                    <option value="NextSeq_550">NextSeq 550</option>
                    <option value="NextSeq_1000_2000">NextSeq 1000/2000</option>

                  </select>
                </FormItem>
              )}
            />

            {/* pool size */}
            <FormField
              control={form.control}
              name="pool_size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-2">Pool Size</FormLabel>
                  <Input
                    {...field}
                    type="number"
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
                  <FormLabel className="mb-2">Pool Concentration</FormLabel>
                  <Input
                    {...field}
                    type="number"
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
                  <FormLabel className="mb-2">nM Calculation</FormLabel>
                  <Input
                    {...field}
                    type="number"
                    placeholder="Enter nM calculation"
                    className="mb-2"
                  />
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
    </div>
  );
};

export default RunSetup;