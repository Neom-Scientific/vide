"use client"
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import React, { useState } from 'react'
import { set, useForm } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import { z } from 'zod';

const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    hospital_name: z.string().min(1, "Organization Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    phone_no: z.string()
        .min(1, "Phone number is required")
        .regex(/^\d+$/, "Phone number must contain only digits")
        .min(10, "Phone number must be at least 10 digits"),
});

const Request = () => {
    const [processing, setProcessing] = useState(false);
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            hospital_name: '',
            email: '',
            phone_no: '',
            otp: '',
            // hospital_id: '',
            username: '',
            password: ''
        }
    });

    const handleUsernamePassword = async (data) => {
        setProcessing(true);

        const password = Math.random().toString(36).slice(-8); // Generate a random password
        data.password = password;
        // console.log('data', data);
        try {
            const response = await axios.post('/api/request-insert', {
                data
            });
            if (response.data[0].status === 200) {
                toast.success("Request submitted successfully. Please check your email for the username and password.");
                setProcessing(false);
                form.reset();
            } else {
                toast.error(response.data[0].message || "Failed to SignUp.");
                setProcessing(false);
            }
        } catch (error) {
            toast.error("Failed to set username and password.");
            setProcessing(false);
        }
    };

    return (
        <div className="max-w-md mt-10">
            <h1 className="text-2xl font-bold mb-6">SIGNUP</h1>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleUsernamePassword)}
                    className="space-y-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        className="focus-within:ring-orange-500"
                                        placeholder="Name"
                                        {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="hospital_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Organization Name</FormLabel>
                                <FormControl>
                                    <Input
                                        className="focus-within:ring-orange-500"
                                        placeholder="Organization Name"
                                        {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                   
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        className="focus-within:ring-orange-500"
                                        placeholder="Email"
                                        {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone_no"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input
                                        type='tel'
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                        maxLength={10}
                                        className="focus-within:ring-orange-500"
                                        placeholder="Phone Number"
                                        {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    >
                        SignUp
                    </Button>
                </form>
            </Form>
            <ToastContainer />
        </div>
    );
};

export default Request;