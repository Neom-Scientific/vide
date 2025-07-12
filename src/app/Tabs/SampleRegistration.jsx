"use client"
import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import React, { use, useEffect, useState } from 'react'
import { set, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { toast, ToastContainer } from 'react-toastify'
import Dialogbox from '@/app/components/Dialogbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import Cookies from 'js-cookie'

const formSchema = z.object({
  sample_id: z.string().min(1, 'Sample ID is required'),
  sample_type: z.string().min(1, 'Sample Type is required'),
  client_name: z.string().min(1, 'Client Name is required'),
  doctor_name: z.string().min(1, 'Doctor Name is required'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  // test_name: z.string().min(1, 'Test Name is required'),
  selectedTestName: z.string().min(1, 'Add the test name to confirm'),
  hospital_id: z.string().min(1, 'Organization ID is required'),
  patient_name: z.string().min(1, 'Patient Name is required'),
  trf: z.string().min(1, 'TRF is required'),
  specimen_quality: z.string().min(1, 'Specimen Quality is required'),
  age: z.string().min(1, 'Age is required'),
  clinical_history: z.string().min(1, 'Clinical History is required'),
  systolic_bp: z.string().optional(),
  diastolic_bp: z.string().optional(),
  total_cholesterol: z.string().optional(),
  hdl_cholesterol: z.string().optional(),
  ldl_cholesterol: z.string().optional(),
  diabetes: z.string().optional(),
  smoker: z.string().optional(),
  hypertension_treatment: z.string().optional(),
  statin: z.string().optional(),
  aspirin_therapy: z.string().optional(),
  sample_name: z.string().min(1, 'Sample Name is required'),
  trf_file: z.string().optional(),
})

export const SampleRegistration = () => {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [trfFile, setTrfFile] = useState(null);
  const [trfUrl, setTrfUrl] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
  const [hasSelectedFirstTest, setHasSelectedFirstTest] = useState(false);
  const [testToRemove, setTestToRemove] = useState(null); // <-- Add this line
  const [user, setUser] = useState(null);
  const [editButton, setEditButton] = useState([]);
  const [processing, setProcessing] = useState(false);

  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const currentDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // hosptial and doctor information
      hospital_name: user?.hospital_name || '',
      hospital_id: user?.hospital_id || '',
      doctor_name: '',
      dept_name: '',
      doctor_mobile: '',
      email: '',

      // patient information
      patient_name: '',
      DOB: '',
      age: '',
      sex: '',
      patient_mobile: '',
      ethnicity: '',
      father_mother_name: '',
      address: '',
      city: '',
      state: '',
      country: '',
      client_id: '',
      client_name: '',
      spouse_name: '',
      patient_email: '',

      // sample details
      sample_name: '',
      sample_id: '',
      registration_date: currentDate,
      trf: '',
      sample_type: '',
      collection_date_time: '',
      sample_date: currentDate,
      specimen_quality: '',
      prority: '',
      storage_condition: '',
      vial_received: '',
      test_name: '',
      selectedTestName: '',
      systolic_bp: '',
      diastolic_bp: '',
      total_cholesterol: '',
      hdl_cholesterol: '',
      ldl_cholesterol: '',
      diabetes: '',
      smoker: '',
      hypertension_treatment: '',
      statin: '',
      aspirin_therapy: '',
      remarks: '',
      clinical_history: '',
      repeat_required: '',
      repeat_reason: '',
      repeat_date: '',
      trf_file: '',
    }
  })

  useEffect(() => {
    const cookieUser = Cookies.get('user');
    if (cookieUser) {
      const parsedUser = JSON.parse(cookieUser);
      setUser(parsedUser);
      form.reset({
        hospital_name: parsedUser.hospital_name || '',
        hospital_id: parsedUser.hospital_id || '',
      })
    }
  }, []);


  const allTests = [
    'WES',
    'Carrier Screening',
    'CES',
    'Myeloid',
    'HLA',
    'SGS',
    'WES + Mito',
    'HCP',
    'HRR',
    'CES + Mito',
    'SolidTumor Panel',
    'Cardio Comprehensive (Screening)',
    'Cardio Metabolic Syndrome (Screening)',
    'Cardio Comprehensive Myopathy'
  ];

  const dob = form.watch('DOB');
  const repeatRequired = form.watch('repeat_required');
  const sample_name = form.watch('sample_name');

  useEffect(() => {
    if (repeatRequired === 'no') {
      form.setValue('repeat_reason', '');
      form.setValue('repeat_date', '');
    }
  }, [repeatRequired]);

  const get_state_and_country = async (city) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&addressdetails=1&limit=1`
      );
      const data = response.data;
      if (data && data.length > 0 && data[0].address) {
        const address = data[0].address;
        form.setValue('state', address.state || address.state_district || '');
        form.setValue('country', address.country || '');
      } else {
        form.setValue('state', '');
        form.setValue('country', '');
      }
    } catch (error) {
      form.setValue('state', '');
      form.setValue('country', '');
      console.log(error);
    }
  };

  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();

      let years = today.getFullYear() - birthDate.getFullYear();
      let months = today.getMonth() - birthDate.getMonth();
      let days = today.getDate() - birthDate.getDate();

      if (days < 0) {
        months--;
        // Get days in previous month
        const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      let ageString = '';
      if (years > 0) ageString += `${years} year${years > 1 ? 's' : ''} `;
      if (months > 0) ageString += `${months} month${months > 1 ? 's' : ''} `;
      if (days > 0) ageString += `${days} day${days > 1 ? 's' : ''}`;

      form.setValue('age', ageString.trim() || '0 days');
    }
  }, [dob, form]);


  useEffect(() => {
    if (sample_name) {
      form.setValue('patient_name', sample_name);
    }
  }, [sample_name, form]);

  const uploadTrf = async (file) => {
    setTrfFile(file);
    try {
      if (file) {
        const url = URL.createObjectURL(file);
        setTrfUrl(url);
        form.setValue('trf', file.name); // Store file name if needed
        form.setValue('trf_file', file.name); // Store the file object
      } else {
        setTrfUrl('');
        form.setValue('trf', '');
        form.setValue('trf_file', '');
      }
    }
    catch (error) {
      console.error('Error uploading TRF:', error);
    }
  }

  // const uploadTrf = async (file) => {
  //   setTrfFile(file);
  //   try {
  //     if (file) {
  //       const formData = new FormData();
  //       formData.append('file', file);
  //       formData.append('fileName', file.name);

  //       const response = await axios.post('/api/upload', formData, {
  //         headers: {
  //           'Content-Type': 'multipart/form-data'
  //         }
  //       });

  //       if (response.data && response.data.status === 200) {
  //         const fileId = response.data.fileId;
  //         // Optionally, you can generate a Google Drive preview URL
  //         const url = `https://drive.google.com/file/d/${fileId}/preview`;
  //         setTrfUrl(url);
  //         form.setValue('trf', file.name);
  //         form.setValue('trf_file', fileId); // Store fileId for reference
  //       } else {
  //         setTrfUrl('');
  //         form.setValue('trf', '');
  //         form.setValue('trf_file', '');
  //         toast.error('Failed to upload TRF');
  //       }
  //     } else {
  //       setTrfUrl('');
  //       form.setValue('trf', '');
  //       form.setValue('trf_file', '');
  //     }
  //   } catch (error) {
  //     setTrfUrl('');
  //     form.setValue('trf', '');
  //     form.setValue('trf_file', '');
  //     console.error('Error uploading TRF:', error);
  //     toast.error('Error uploading TRF');
  //   }
  // }


  useEffect(() => {
    return () => {
      if (trfUrl) URL.revokeObjectURL(trfUrl);
    };
  }, [trfUrl]);

  const onFormSubmit = async () => {
    setProcessing(true);

    // Set registration_date to current date-time string
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const currentDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    form.setValue('registration_date', currentDate);

    // Get all form data
    const allData = form.getValues();

    // Prepare FormData for file + data
    const formData = new FormData();
    Object.entries(allData).forEach(([key, value]) => {
      formData.append(key, value ?? '');
    });

    // Attach the TRF file if present
    if (trfFile) {
      formData.append('file', trfFile);
    }

    try {
      const res = await axios.post('/api/store', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data[0].status === 200) {
        toast.success('Sample registered successfully');
        form.reset();
        setProcessing(false);
        selectedTests.length = 0;
        setTrfFile(null);
        setTrfUrl('');
        form.setValue('trf-upload', null);
        form.setValue('trf', '');
        form.setValue('trf_file', '');
        localStorage.removeItem('sampleRegistrationForm');
      } else if (res.data[0].status === 400) {
        toast.error(res.data[0].message);
        setProcessing(false);
      } else {
        toast.error('Sample registration failed');
        setProcessing(false);
      }
    } catch (error) {
      toast.error('Sample registration failed');
      setProcessing(false);
    }
  }

  const handleRemoveTestName = () => {
    if (!testToRemove) {
      toast.error('Please select a test to remove');
      return;
    }
    const updated = selectedTests.filter(test => test !== testToRemove);
    setSelectedTests(updated);
    if (testToRemove === 'Cardio Comprehensive (Screening)' ||
      testToRemove === 'Cardio Metabolic Syndrome (Screening)' ||
      testToRemove === 'Cardio Comprehensive Myopathy') {
      form.setValue('ldl_cholesterol', '');
      form.setValue('hdl_cholesterol', '');
      form.setValue('total_cholesterol', '');
      form.setValue('systolic_bp', '');
      form.setValue('diastolic_bp', '');
      form.setValue('diabetes', '');
      form.setValue('smoker', '');
      form.setValue('hypertension_treatment', '');
      form.setValue('statin', '');
      form.setValue('aspirin_therapy', '');
    }
    form.setValue('selectedTestName', updated.join(', '));
    setShowRemoveModal(false);
    toast.warning(`${testToRemove} removed`);
    setTestToRemove(null); // Reset
    if (updated.length === 0) {
      setHasSelectedFirstTest(false);
      form.setValue('test_name', ''); // Optionally reset test_name select
    }
  };

  const handleUpdate = async () => {
    setProcessing(true);
    const allData = form.getValues();
    const sampleId = allData.sample_id;

    if (!sampleId) {
      toast.error("Sample ID is required");
      return;
    }

    const originalData = JSON.parse(localStorage.getItem('editRowData') || '{}');

    const updates = { ...allData }; // Prepare updates object
    delete updates.selectedTestName; // Exclude selectedTestName
    updates.test_name = selectedTests.join(', '); // Join selected tests
    delete updates.sample_name; // Exclude sample_name
    delete updates.trf_file; // Exclude trf_file

    // Convert empty strings for date fields to null
    const dateFields = ['DOB', 'registration_date', 'sample_date', 'repeat_date'];
    dateFields.forEach(field => {
      if (updates[field] === '') {
        const parsedData = JSON.parse(localStorage.getItem('editRowData'));
        updates[field] = parsedData ? parsedData[field] : null; // Use existing value if available
      }
    });

    const changes = [];
    Object.keys(updates).forEach(key => {
      const oldValue = originalData[key] ?? '';
      const newValue = updates[key] ?? '';

      // Ignore changes from 0/null/undefined to ''
      if ((oldValue === 0 || oldValue === null || oldValue === undefined) && newValue === '') return;

      // Ignore array fields if both are empty or have same content
      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        if (JSON.stringify(oldValue) === JSON.stringify(newValue)) return;
      }

      // Ignore fields you don't want to track (add more as needed)
      const ignoreFields = ['table_data', /* add more fields here */];
      if (ignoreFields.includes(key)) return;

      if (oldValue !== newValue) {
        changes.push({ field: key, oldValue, newValue });
      }
    });

    // Prepare audit log
    const auditLog = {
      sample_id: sampleId,
      changed_by: user?.email || '',
      changed_at: new Date().toISOString(),
      changes
    };

    console.log('changes', changes);

    try {
      const res = await axios.put('/api/store', {
        sample_id: sampleId,
        updates,
        auditLog // <-- send audit log
      });

      if (res.status === 200) {
        toast.success('Sample updated successfully');
        form.reset();
        setProcessing(false);
        localStorage.removeItem('editRowData'); // Clear edit data from localStorage
        selectedTests.length = 0; // Clear selected tests
      } else {
        toast.error('Sample update failed');
      }
    } catch (error) {
      console.error('Error updating sample:', error);
      toast.error('Sample update failed');
    }
  };

  // useEffect(() => {
  //   // remove the searchData from localstorage
  //   const searchData = localStorage.getItem('searchData');
  //   if (searchData) {
  //     localStorage.removeItem('searchData');
  //   }
  // }, []);

  useEffect(() => {
    // Don't auto-save if editing from Processing tab
    if (localStorage.getItem('editRowData')) return;

    const subscription = form.watch((value) => {
      localStorage.setItem('sampleRegistrationForm', JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    setEditButton(!!localStorage.getItem('editRowData'));
  }, []);

  useEffect(() => {
    const editData = localStorage.getItem('editRowData');
    if (editData) {
      const parsedData = JSON.parse(editData);
      Object.keys(parsedData).forEach(key => {
        const dateFields = ['DOB', 'registration_date', 'sample_date', 'repeat_date'];
        if (dateFields.includes(key) && parsedData[key] === '') {
          form.setValue(key, null);
        } else {
          form.setValue(key, parsedData[key] || '');
        }
      });
      form.setValue('sample_name', parsedData.patient_name || '');
      form.setValue('age', parsedData.age || '');
      form.setValue('trf_file', parsedData.trf || '');
      form.setValue('father_mother_name', parsedData.father_mother_name || '');
      form.setValue('spouse_name', parsedData.spouse_name || '');
      setSelectedTests(parsedData.test_name ? parsedData.test_name.split(', ') : []);
    }
    else {
      const savedData = localStorage.getItem('sampleRegistrationForm');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        Object.keys(parsedData).forEach(key => {
          const dateFields = ['DOB', 'registration_date', 'sample_date', 'repeat_date'];
          if (dateFields.includes(key) && parsedData[key] === '') {
            form.setValue(key, null);
          } else {
            form.setValue(key, parsedData[key] || '');
          }
        });
        form.setValue('sample_name', parsedData.patient_name || '');
        form.setValue('age', parsedData.age || '');
        form.setValue('trf_file', parsedData.trf || '');
        form.setValue('father_mother_name', parsedData.father_mother_name || '');
        form.setValue('spouse_name', parsedData.spouse_name || '');
        setSelectedTests(parsedData.test_name ? parsedData.test_name.split(', ') : []);
      }
    }
  }, [])

  return (
    <div className="flex justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="w-full max-w-3xl lg:max-w-5xl sm:max-w-2xl md:max-w-3xl mt-3">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onFormSubmit)}>
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-4 dark:border dark:border-orange-50">
              <h1 className=' font-bold text-2xl text-orange-400 mb-2'>Organization Information</h1>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <FormField
                  control={form.control}
                  name='hospital_name'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel >Organization Name</FormLabel>
                      <Input
                        placeholder='Organization Name'
                        className='border-2 border-orange-300 my-2'
                        disabled={user?.role !== 'SuperAdmin'}
                        {...field} />
                    </FormItem>
                  )}
                />

                {/* organization id */}
                <FormField
                  control={form.control}
                  name='hospital_id'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <div className="flex justify-between items-center">
                        <FormLabel>Organization ID</FormLabel>
                        {form.formState.errors.hospital_id && (
                          <p className='text-red-500 text-sm'>
                            {form.formState.errors.hospital_id.message}
                          </p>
                        )}
                      </div>
                      <Input
                        disabled={user?.role !== 'SuperAdmin'}
                        placeholder='Organization ID'
                        className='my-2 border-2 border-orange-300'
                        {...field} />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-4 dark:border dark:border-orange-50">
              <h1 className=' font-bold text-2xl text-orange-400 mb-2'>Sample Information</h1>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>

                {/* sample id */}
                <FormField
                  control={form.control}
                  name='sample_id'
                  render={({ field }) => (
                    <FormItem className='my-2 flex-1'>
                      <div className="flex justify-between items-center">
                        <FormLabel>Sample ID</FormLabel>
                        {form.formState.errors.sample_id && (
                          <p className='text-red-500 text-sm'>
                            {form.formState.errors.sample_id.message}
                          </p>
                        )}
                      </div>
                      <Input
                        placeholder='Sample ID'
                        className='my-2 border-2 border-orange-300'
                        {...field} />
                    </FormItem>
                  )}
                />

                {/* sample name */}
                <FormField
                  control={form.control}
                  name='sample_name'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <div className="flex justify-between items-center">
                        <FormLabel>Sample Name</FormLabel>
                        {form.formState.errors.sample_name && (
                          <p className='text-red-500 text-sm'>
                            {form.formState.errors.sample_name.message}
                          </p>
                        )}
                      </div>
                      <Input
                        placeholder='Sample Name'
                        className='my-2 border-2 border-orange-300'
                        {...field}
                      />
                    </FormItem>
                  )}
                />


                {/* DOB */}
                <FormField
                  control={form.control}
                  name='DOB'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>DOB</FormLabel>
                      <Input
                        type='date'
                        className='my-2 border-2 border-orange-300'
                        {...field} />
                    </FormItem>
                  )}
                />

                {/* age */}
                <FormField
                  control={form.control}
                  name='age'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <div className="flex justify-between items-center">
                        <FormLabel>Age</FormLabel>
                        {form.formState.errors.age && (
                          <p className='text-red-500 text-sm'>
                            {form.formState.errors.age.message}
                          </p>
                        )}
                      </div>
                      <Input
                        placeholder='Age'
                        className='my-2 border-2 border-orange-300'
                        {...field} />
                    </FormItem>
                  )}
                />

                {/* gender */}
                <FormField
                  control={form.control}
                  name='sex'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Gender</FormLabel>
                      <select
                        className=' dark:bg-gray-800 my-2 border-2 border-orange-300 rounded-md p-2'
                        {...field}>
                        <option className='dark:text-white' value=''>Select Gender</option>
                        <option className='dark:text-white' value='male'>Male</option>
                        <option className='dark:text-white' value='female'>Female</option>
                        <option className='dark:text-white' value='other'>Other</option>
                      </select>
                    </FormItem>
                  )}
                />

                {/* collection date time */}
                <FormField
                  control={form.control}
                  name='collection_date_time'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Collection Date Time</FormLabel>
                      <Input
                        type='datetime-local'
                        className='my-2 border-2 border-orange-300'
                        {...field} />
                    </FormItem>
                  )}
                />

                {/* sample receiving date */}
                <FormField
                  control={form.control}
                  name='sample_date'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Sample Receiving Date and Time</FormLabel>
                      <Input
                        type='datetime-local'
                        className='my-2 border-2 border-orange-300'
                        {...field} />
                    </FormItem>
                  )}
                />

                {/* registration data */}
                <FormField
                  control={form.control}
                  name='registration_date'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Registration Date</FormLabel>
                      <Input
                        type='datetime-local'
                        className='my-2 border-2 border-orange-300'
                        disabled
                        {...field} />
                    </FormItem>
                  )}
                />

                {/* sample type */}
                <FormField
                  control={form.control}
                  name='sample_type'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <div className="flex justify-between items-center">
                        <FormLabel>Sample Type</FormLabel>
                        {form.formState.errors.sample_type && (
                          <p className='text-red-500 text-sm'>
                            {form.formState.errors.sample_type.message}
                          </p>
                        )}
                      </div>
                      <select
                        className='dark:bg-gray-800 my-2 border-2 border-orange-300 rounded-md p-2'
                        {...field}
                      >
                        <option className='dark:text-white' value=''>Select Sample Type</option>
                        <option className='dark:text-white' value='EDTA Blood'>EDTA Blood</option>
                        <option className='dark:text-white' value='DNA'>DNA</option>
                        <option className='dark:text-white' value='RNA'>RNA</option>
                        <option className='dark:text-white' value='Plasma'>Plasma</option>
                        <option className='dark:text-white' value='CF DNA'>CF DNA</option>
                        <option className='dark:text-white' value='Tissue'>Tissue</option>
                        <option className='dark:text-white' value='Buccal Swab'>Buccal Swab</option>
                      </select>
                    </FormItem>
                  )}
                />

                {/* specimen quality */}
                <FormField
                  control={form.control}
                  name='specimen_quality'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <div className="flex justify-between items-center">
                        <FormLabel>Specimen Quality</FormLabel>
                        {form.formState.errors.specimen_quality && (
                          <p className='text-red-500 text-sm'>
                            {form.formState.errors.specimen_quality.message}
                          </p>
                        )}
                      </div>
                      <select
                        className=' dark:bg-gray-800 my-2 border-2 border-orange-300 rounded-md p-2'
                        {...field}
                      >
                        <option className='dark:text-white' value=''>Select Specimen Quality</option>
                        <option className='dark:text-white' value='Accepted'>Accepted</option>
                        <option className='dark:text-white' value='Not Accepted'>Not Accepted</option>
                      </select>
                    </FormItem>
                  )}
                />

                {/* prority */}
                <FormField
                  control={form.control}
                  name='prority'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Prority</FormLabel>
                      <select
                        className=' dark:bg-gray-800 my-2  rounded-md p-2 border-2 border-orange-300'
                        {...field}>
                        <option className='dark:text-white' value=''>Select Prority</option>
                        <option className='dark:text-white' value='routine'>Routine</option>
                        <option className='dark:text-white' value='Urgent'>Urgent</option>

                      </select>
                    </FormItem>
                  )}
                />

                {/* storage condition */}
                <FormField
                  control={form.control}
                  name='storage_condition'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Storage Condition</FormLabel>
                      <select
                        className=' dark:bg-gray-800 my-2  rounded-md p-2 border-2 border-orange-300'
                        {...field}>
                        <option className='dark:text-white' value=''>Select Storage Condition</option>
                        <option className='dark:text-white' value='refrigerated'>Refrigerated</option>
                        <option className='dark:text-white' value='ambient'>Ambient</option>
                      </select>
                    </FormItem>
                  )}
                />

                {/* vial received */}
                <FormField
                  control={form.control}
                  name='vial_received'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Vial Received</FormLabel>
                      <Input
                        placeholder='Number of Vial Received'
                        className='border-2 border-orange-300 my-2'
                        {...field} />
                    </FormItem>
                  )}
                />


                {/* repeat required? */}
                <FormField
                  control={form.control}
                  name='repeat_required'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Repeat Required ?</FormLabel>
                      <select
                        className=' dark:bg-gray-800 my-2  rounded-md p-2 border-2 border-orange-300'
                        {...field}>
                        <option className='dark:text-white' value=''>Select Repeat Required</option>
                        <option className='dark:text-white' value='yes'>Yes</option>
                        <option className='dark:text-white' value='no'>No</option>
                      </select>
                    </FormItem>
                  )}
                />


                {repeatRequired === 'yes' && (
                  <>
                    <FormField
                      control={form.control}
                      name='repeat_reason'
                      render={({ field }) => (
                        <FormItem className='my-2'>
                          <FormLabel>Repeat Reason</FormLabel>
                          <Input
                            placeholder='Repeat Reason'
                            className='my-2 border-2 border-orange-300'
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='repeat_date'
                      render={({ field }) => (
                        <FormItem className='my-2'>
                          <FormLabel>Repeat Date</FormLabel>
                          <Input
                            type='date'
                            className='my-2 border-2 border-orange-300'
                            {...field}
                            value={field.value ?? ''}
                          />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </div>

            <div className='bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 mb-4 dark:border dark:border-orange-50'>
              <h1 className=' font-bold text-2xl text-orange-400 mb-2'>Patient Information</h1>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {/* patient name */}
                <FormField
                  control={form.control}
                  name='patient_name'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <div className="flex justify-between items-center">
                        <FormLabel>Patient Name</FormLabel>
                        {form.formState.errors.patient_name && (
                          <p className='text-red-500 text-sm'>
                            {form.formState.errors.patient_name.message}
                          </p>
                        )}
                      </div>
                      <Input
                        placeholder='Patient Name'
                        disabled
                        className='my-2 border-2 border-orange-300'
                        {...field} />
                    </FormItem>
                  )}
                />

                {/* father husband name */}
                <FormField
                  control={form.control}
                  name='father_mother_name'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Father/Mother Name</FormLabel>
                      <Input
                        {...field}
                        className='my-2 border-2 border-orange-300'
                        placeholder='Father/Mother Name' />
                    </FormItem>
                  )}
                />

                {/* spouse name
                <FormField
                  control={form.control}
                  name='spouse_name'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Spouse Name</FormLabel>
                      <Input
                        {...field}
                        className='my-2 border-2 border-orange-300'
                        placeholder='Spouse Name' />
                    </FormItem>
                  )}
                /> */}

                <FormField
                  control={form.control}
                  name='patient_email'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Patient's Email</FormLabel>
                      <Input
                        {...field}
                        className='my-2 border-2 border-orange-300'
                        placeholder='Email' />
                    </FormItem>
                  )}
                />

                {/* patient mobile */}
                <FormField
                  control={form.control}
                  name='patient_mobile'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Patient's Mobile</FormLabel>
                      <Input
                        {...field}
                        className='my-2 border-2 border-orange-300'
                        placeholder='Mobile'
                      />
                    </FormItem>
                  )}
                />

                {/* ethnicity */}
                <FormField
                  control={form.control}
                  name='ethnicity'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Ethnicity</FormLabel>
                      <Input
                        placeholder='Ethnicity'
                        className='my-2 border-2 border-orange-300'
                        {...field}
                      />
                    </FormItem>
                  )}
                />

                {/* address */}
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Address</FormLabel>
                      <Input
                        {...field}
                        className='my-2 border-2 border-orange-300'
                        placeholder='Address'
                      />
                    </FormItem>
                  )}
                />

                {/* city */}
                <FormField
                  control={form.control}
                  name='city'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>City</FormLabel>
                      <Input
                        {...field}
                        className='my-2 border-2 border-orange-300'
                        placeholder='City'
                        onBlur={(e) => {
                          get_state_and_country(e.target.value);
                        }}
                      />
                    </FormItem>
                  )}
                />

                {/* state */}
                <FormField
                  control={form.control}
                  name='state'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>State</FormLabel>
                      <Input
                        {...field}
                        className='my-2 border-2 border-orange-300'
                        placeholder='State'
                      />
                    </FormItem>
                  )}
                />

                {/* country */}
                <FormField
                  control={form.control}
                  name='country'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Country</FormLabel>
                      <Input
                        {...field}
                        className='my-2 border-2 border-orange-300'
                        placeholder='Country'
                      />
                    </FormItem>
                  )}
                />

                {/* client id */}
                <FormField
                  control={form.control}
                  name='client_id'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Client ID</FormLabel>
                      <Input
                        placeholder='Client ID'
                        className='my-2 border-2 border-orange-300'
                        {...field} />
                    </FormItem>
                  )}
                />

                {/* client name */}
                <FormField
                  control={form.control}
                  name='client_name'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <div className="flex justify-between items-center">
                        <FormLabel>Client Name</FormLabel>
                        {form.formState.errors.client_name && (
                          <p className='text-red-500 text-sm'>
                            {form.formState.errors.client_name.message}
                          </p>
                        )}
                      </div>
                      <Input
                        placeholder='Client Name'
                        className='my-2 border-2 border-orange-300'
                        {...field}
                      />
                    </FormItem>
                  )}
                />


              </div>
              {/* clinical history */}
              <FormField
                control={form.control}
                name='clinical_history'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <div className="flex justify-between items-center">
                      <FormLabel>Clinical History</FormLabel>
                      {form.formState.errors.clinical_history && (
                        <p className='text-red-500 text-sm'>
                          {form.formState.errors.clinical_history.message}
                        </p>
                      )}
                    </div>
                    <textarea
                      placeholder='Clinical History'
                      {...field}
                      className='my-2 border-2 text-black dark:text-white border-orange-300 rounded-md p-2'
                    >
                    </textarea>
                  </FormItem>
                )}
              />
            </div>

            <div className='bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:border dark:border-orange-50 p-8 mb-4'>
              <h1 className=' font-bold text-2xl text-orange-400 mb-2'>Doctor Information</h1>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/*  Doctor name  */}
                <FormField
                  control={form.control}
                  name='doctor_name'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <div className="flex justify-between items-center">
                        <FormLabel>Doctor Name</FormLabel>
                        {form.formState.errors.doctor_name && (
                          <p className='text-red-500 text-sm'>
                            {form.formState.errors.doctor_name.message}
                          </p>
                        )}
                      </div>
                      <Input
                        {...field}
                        className='my-2 border-2 border-orange-300'
                        placeholder='Doctor Name'
                      />
                    </FormItem>
                  )}
                />

                {/* dept name */}
                <FormField
                  control={form.control}
                  name='dept_name'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel >Department Name</FormLabel>
                      <Input
                        placeholder='Department Name'
                        className='border-2 border-orange-300 my-2'
                        {...field} />
                    </FormItem>
                  )}
                />

                {/* doctor mobile */}
                <FormField
                  control={form.control}
                  name='doctor_mobile'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <FormLabel>Doctor's Mobile</FormLabel>
                      <Input
                        {...field}
                        className='my-2 border-2 border-orange-300'
                        placeholder='Mobile'
                      />
                    </FormItem>
                  )}
                />

                {/* doctor email */}
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <div className="flex justify-between items-center">
                        <FormLabel>Doctor's Email</FormLabel>
                        {form.formState.errors.email && (
                          <p className='text-red-500 text-sm'>
                            {form.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                      <Input
                        {...field}
                        className='my-2 border-2 border-orange-300'
                        placeholder='Email'
                      />
                    </FormItem>
                  )}
                />

              </div>
            </div>

            <div className='bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:border dark:border-orange-50 p-8 mb-4'>
              <h1 className='font-bold text-2xl text-orange-400 mb-2'>Test Information</h1>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>


                <div className='mt-3'>
                  <FormField
                    control={form.control}
                    name='test_name'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <FormLabel>Add Test Name</FormLabel>
                        <div className="flex justify-between items-center">
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              className="h-10 w-1/2 bg-gray-700 hover:bg-gray-800 cursor-pointer text-white"
                            >
                              Add Test
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="min-w-[250px] mx-10">
                            {selectedTests.length === allTests.length ? (
                              <DropdownMenuItem disabled>
                                <span className="text-sm text-gray-500">All tests added</span>
                              </DropdownMenuItem>
                            ) : (
                              allTests
                                .filter(test => !selectedTests.includes(test))
                                .map(test => (
                                  <DropdownMenuItem
                                    key={test}
                                    onClick={() => {
                                      if (selectedTests.includes(test)) {
                                        toast.warning(`${test} is already added`);
                                        return;
                                      }
                                      const updated = [...selectedTests, test];
                                      setSelectedTests(updated);
                                      form.setValue('selectedTestName', updated.join(', '));
                                      toast.success(`${test} added`);
                                      setHasSelectedFirstTest(true);
                                      form.setValue('test_name', '');// Reset if needed
                                    }}
                                  >
                                    <span className="text-sm">{test}</span>
                                  </DropdownMenuItem>
                                ))
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </FormItem>
                    )}
                  />
                </div>

                {/* selected test name */}
                <div className=''>
                  <FormField
                    control={form.control}
                    name='selectedTestName'
                    render={({ field }) => (
                      <FormItem className='flex-1'>
                        <div className="flex justify-between items-center mb-1">
                          <FormLabel>Test Added</FormLabel>
                          {form.formState.errors.selectedTestName && (
                            <p className='text-red-500 text-sm'>
                              {form.formState.errors.selectedTestName.message}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[42px] border-2 border-orange-300 rounded-md p-2 dark:bg-gray-800">
                          {selectedTests.length === 0 && (
                            <span className="text-gray-400 dark:text-white">No test added</span>
                          )}
                          {selectedTests.map((test, idx) => (
                            <span
                              key={test}
                              className="flex items-center bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-sm font-semibold"
                            >
                              {test}
                              <button
                                type="button"
                                className="ml-2 text-orange-700 hover:text-red-600 focus:outline-none"
                                onClick={() => {
                                  setTestToRemove(test);// < --Set which test to remove
                                  setShowRemoveModal(true); //< --Open dialog
                                }}
                                aria-label={`Remove ${test}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Remove Test Name Dialog */}
                  <Dialogbox
                    open={showRemoveModal}
                    setOpen={setShowRemoveModal}
                    testName={testToRemove} //<-- Use testToRemove here
                    type="remove"
                    onRemove={handleRemoveTestName}
                  />
                </div>

                {[
                  "Cardio Comprehensive (Screening)",
                  "Cardio Metabolic Syndrome (Screening)",
                  "Cardio Comprehensive Myopathy"
                ].some(test => selectedTests.includes(test)) && (
                    <>
                      {/* Cardio-specific fields */}

                      <FormField
                        control={form.control}
                        name="systolic_bp"
                        render={({ field }) => (
                          <FormItem className="my-2">
                            <FormLabel>Systolic Blood Pressure
                              <span className="text-xs font-normal">(mm Hg)</span>
                              <span className="text-orange-500">*</span>
                            </FormLabel>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              placeholder="90-200"
                              type="number"
                              className="my-2 border-2 border-orange-300"
                              min={90}
                              max={200} />
                            <p className="text-xs text-gray-500">Value must be between 90-200</p>
                            {form.formState.errors.systolic_bp && (
                              <p className="text-red-500 text-sm">{form.formState.errors.systolic_bp.message}</p>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="diastolic_bp"
                        render={({ field }) => (
                          <FormItem className="my-2">
                            <FormLabel>Diastolic Blood Pressure
                              <span className="text-xs font-normal">(mm Hg)</span>
                              <span className="text-orange-500">*</span>
                            </FormLabel>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              className="my-2 border-2 border-orange-300"
                              placeholder="60-130"
                              type="number"
                              min={60}
                              max={130} />
                            <p
                              className="text-xs text-gray-500"
                            >Value must be between 60-130</p>
                            {form.formState.errors.diastolic_bp && (
                              <p className="text-red-500 text-sm">{form.formState.errors.diastolic_bp.message}</p>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="total_cholesterol"
                        render={({ field }) => (
                          <FormItem className="my-2">
                            <FormLabel>Total Cholesterol
                              <span className="text-xs font-normal">(mg/dL)</span>
                              <span className="text-orange-500">*</span>
                            </FormLabel>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              placeholder="130-320"
                              className="my-2 border-2 border-orange-300"
                              type="number"
                              min={130}
                              max={320} />
                            <p className="text-xs text-gray-500">Value must be between 130 - 320</p>
                            {form.formState.errors.total_cholesterol && (
                              <p className="text-red-500 text-sm">{form.formState.errors.total_cholesterol.message}</p>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hdl_cholesterol"
                        render={({ field }) => (
                          <FormItem className="my-2">
                            <FormLabel>HDL Cholesterol
                              <span className="text-xs font-normal">(mg/dL)</span>
                              <span className="text-orange-500">*</span>
                            </FormLabel>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              className="my-2 border-2 border-orange-300"
                              placeholder="20-100"
                              type="number"
                              min={20}
                              max={100} />
                            <p className="text-xs text-gray-500">Value must be between 20 - 100</p>
                            {form.formState.errors.hdl_cholesterol && (
                              <p className="text-red-500 text-sm">{form.formState.errors.hdl_cholesterol.message}</p>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="ldl_cholesterol"
                        render={({ field }) => (
                          <FormItem className="my-2">
                            <FormLabel>LDL Cholesterol
                              <span className="text-xs font-normal">(mg/dL)</span>
                              <span className="text-orange-500">*</span>
                            </FormLabel>
                            <Input
                              {...field}
                              value={field.value ?? ''}
                              className="my-2 border-2 border-orange-300"
                              placeholder="30-300"
                              type="number"
                              min={30}
                              max={300} />
                            <p className="text-xs text-gray-500">Value must be between 30 - 300</p>
                            {form.formState.errors.ldl_cholesterol && (
                              <p className="text-red-500 text-sm">{form.formState.errors.ldl_cholesterol.message}</p>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="diabetes"
                        render={({ field }) => (
                          <FormItem className="my-2">
                            <FormLabel>History of Diabetes?
                              <span className="text-orange-500">*</span>
                            </FormLabel>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant={field.value === "yes" ? "default" : "outline"}
                                onClick={() => field.onChange("yes")}>Yes</Button>
                              <Button
                                type="button"
                                variant={field.value === "no" ? "default" : "outline"}
                                onClick={() => field.onChange("no")}>No</Button>
                            </div>
                            {form.formState.errors.diabetes && (
                              <p className="text-red-500 text-sm">{form.formState.errors.diabetes.message}</p>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="smoker"
                        render={({ field }) => (
                          <FormItem className="my-2">
                            <FormLabel>Smoker?
                              <span className="text-orange-500">*</span>
                            </FormLabel>
                            <div className="flex gap-2">
                              {["current", "former", "never"].map(opt => (
                                <Button
                                  key={opt}
                                  type="button"
                                  variant={field.value === opt ? "default" : "outline"}
                                  onClick={() => field.onChange(opt)}
                                >
                                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </Button>
                              ))}
                            </div>
                            {form.formState.errors.smoker && (
                              <p className="text-red-500 text-sm">{form.formState.errors.smoker.message}</p>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hypertension_treatment"
                        render={({ field }) => (
                          <FormItem className="my-2">
                            <FormLabel>On Hypertension Treatment? <span className="text-orange-500">*</span></FormLabel>
                            <div className="flex gap-2">
                              <Button type="button" variant={field.value === "yes" ? "default" : "outline"} onClick={() => field.onChange("yes")}>Yes</Button>
                              <Button type="button" variant={field.value === "no" ? "default" : "outline"} onClick={() => field.onChange("no")}>No</Button>
                            </div>
                            {form.formState.errors.hypertension_treatment && (
                              <p className="text-red-500 text-sm">{form.formState.errors.hypertension_treatment.message}</p>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="statin"
                        render={({ field }) => (
                          <FormItem className="my-2">
                            <FormLabel>On a Statin? <span className="text-orange-500">*</span></FormLabel>
                            <div className="flex gap-2">
                              <Button type="button" variant={field.value === "yes" ? "default" : "outline"} onClick={() => field.onChange("yes")}>Yes</Button>
                              <Button type="button" variant={field.value === "no" ? "default" : "outline"} onClick={() => field.onChange("no")}>No</Button>
                            </div>
                            {form.formState.errors.statin && (
                              <p className="text-red-500 text-sm">{form.formState.errors.statin.message}</p>
                            )}
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="aspirin_therapy"
                        render={({ field }) => (
                          <FormItem className="my-2">
                            <FormLabel>On Aspirin Therapy? <span className="text-orange-500">*</span></FormLabel>
                            <div className="flex gap-2">
                              <Button type="button" variant={field.value === "yes" ? "default" : "outline"} onClick={() => field.onChange("yes")}>Yes</Button>
                              <Button type="button" variant={field.value === "no" ? "default" : "outline"} onClick={() => field.onChange("no")}>No</Button>
                            </div>
                            {form.formState.errors.aspirin_therapy && (
                              <p className="text-red-500 text-sm">{form.formState.errors.aspirin_therapy.message}</p>
                            )}
                          </FormItem>
                        )}
                      />

                    </>
                  )}

                {/* upload trf */}
                <FormField
                  control={form.control}
                  name='trf'
                  render={({ field }) => (
                    <FormItem className='mt-3'>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          className="bg-gray-700 hover:bg-gray-700 cursor-pointer text-white flex items-center gap-2"
                          onClick={() => document.getElementById('trf-upload').click()}
                        >
                          <svg
                            xmlns="http:www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Upload TRF
                        </Button>
                        <input
                          id="trf-upload"
                          type="file"
                          accept=".pdf"
                          className="hidden"
                          onChange={e => {
                            uploadTrf(e.target.files[0]);
                            e.target.value = ""; // Reset input value
                          }}
                        />
                        {/* {trfUrl && ( */}
                        <Button
                          type="button"
                          className="ml-2"
                          onClick={() => window.open(trfUrl, '_blank')}
                          disabled={!trfUrl}
                          variant="outline"
                        >
                          Preview TRF
                        </Button>
                        {/* )} */}
                      </div>
                    </FormItem>
                  )}
                />

                {/* trf file name */}
                <FormField
                  control={form.control}
                  name='trf_file'
                  render={({ field }) => (
                    <FormItem className='my-2'>
                      <div className="flex justify-between items-center">
                        <FormLabel>TRF File Name</FormLabel>
                        {form.formState.errors.trf && (
                          <p className='text-red-500 text-sm'>
                            {form.formState.errors.trf.message}
                          </p>
                        )}
                      </div>
                      <Input
                        disabled
                        {...field}
                        className='my-2 border-2 border-orange-300'
                      //value={trfFile ? trfFile.name : ''}
                      />
                    </FormItem>
                  )}
                />

              </div>
              {/* remarks */}
              <FormField
                control={form.control}
                name='remarks'
                render={({ field }) => (
                  <FormItem className='my-2'>
                    <FormLabel>Remarks</FormLabel>
                    <textarea
                      placeholder='Remarks'
                      {...field}
                      className='my-2 border-2 text-black dark:text-white border-orange-300 rounded-md p-2'
                    >

                    </textarea>
                  </FormItem>
                )}
              />
            </div>

            {!editButton && (
              <Button
                type='submit'
                className='bg-orange-400 text-white cursor-pointer hover:bg-orange-500 my-4'
              >
                Submit
              </Button>
            )}

            {
              user && user.role !== 'NormalUser' && editButton && (
                <Button
                  type='button'
                  className='bg-orange-400 text-white cursor-pointer hover:bg-orange-500 my-4 ml-2'
                  onClick={handleUpdate}
                >
                  Update
                </Button>
              )
            }

            <Button
              type='reset'
              className='bg-gray-500 text-white cursor-pointer hover:bg-gray-600 my-4 ml-2'
              onClick={() => {
                form.reset();
                setSelectedTests([]);
                setTrfUrl('');
                setEditButton(false);
                setHasSelectedFirstTest(false);
                localStorage.removeItem('sampleRegistrationData');
                localStorage.removeItem('editRowData')
              }}
            >
              Reset
            </Button>
            {/* </div> */}


          </form >
        </Form >
      </div >
      <ToastContainer />
    </div >
  )
}
