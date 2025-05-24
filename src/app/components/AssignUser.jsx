import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { generateUsernamePassword } from '@/lib/generate_username_password';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  hospital_name: z.string().min(1, "Hospital name is required"),
  email: z.string().email("Invalid email address"),
  phone_no: z.string().min(10, "Phone number must be at least 10 digits"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const AssignUser = () => {
  const [userData, setUserData] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      hospital_name: '',
      email: '',
      phone_no: '',
      username: '',
      password: ''
    }
  });

  // Populate form when userData changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/api/request-insert');
        if (res.status === 200 && res.data.data.length > 0) {
          setUserData(res.data.data[0]);
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (userData) {
      form.reset({
        name: userData.name || '',
        hospital_name: userData.hospital_name || '',
        email: userData.email || '',
        phone_no: userData.phone_no || '',
        username: userData.username || '',
        password: userData.password || ''
      });
    }
  }, [userData, form]);

  const handleGenerateUsernamePassword = async () => {
    const { name, hospital_name, email, phone_no } = form.getValues();
    const data = await generateUsernamePassword(email, name, hospital_name, phone_no);
    form.setValue('username', data.username);
    form.setValue('password', data.password);
  }

  const handleSubmit = async (data) => {
    console.log(data);
  }

  return (
    <div className="max-w-md mt-10">
      <h1 className="text-2xl font-bold mb-6"> Assign Username and Password</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input className="focus-within:ring-orange-500" placeholder="Name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='hospital_name'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hospital Name</FormLabel>
                <FormControl>
                  <Input className="focus-within:ring-orange-500" placeholder="Hospital Name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input className="focus-within:ring-orange-500" placeholder="Email" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='phone_no'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input className="focus-within:ring-orange-500" placeholder="Phone" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='username'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input className="focus-within:ring-orange-500" placeholder="Username" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input className="focus-within:ring-orange-500" placeholder="Password" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type='button'
            onClick={handleGenerateUsernamePassword}
            className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition duration-200">
            Generate Username and Password
          </Button>
          <Button
            type='submit'
            className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition duration-200">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default AssignUser