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
    hospital_name: z.string().min(1, "Hospital name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    phone_no: z.string().min(1, "Phone number is required").regex(/^\d+$/, "Phone number must contain only digits").min(10, "Phone number must be at least 10 digits"),
    otp: z.string().min(1, "OTP is required"),
    username: z.string().optional(),
    password: z.string().optional(),
});

const Request = () => {
    const [step, setStep] = useState(1);
    const [otpError, setOtpError] = useState('');
    const [isOtpDisabled, setIsOtpDisabled] = useState(false); // State to track button disable status

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            hospital_name: '',
            email: '',
            phone_no: '',
            otp: '',
            username: '',
            password: ''
        }
    });

    const handleOTP = async () => {
        const data = form.getValues();
        setTimeout(() => {
            setIsOtpDisabled(false); // Re-enable the button after 10 minutes
        }, 600000); // 10 minutes in milliseconds
        setOtpError('');
        try {
            const response = await axios.post('/api/send-otp', { email: data.email });
            console.log('response', response.data);
            if (response.data[0].status === 200) {
                toast.success("OTP sent successfully. Please check your email.");
                setIsOtpDisabled(true); // Disable the button
               
            } 
            else if (response.data[0].status === 400 && response.data[0].message === "Email already exists") {
                console.log('response', response.data[0].message);
                setIsOtpDisabled(false)
                toast.error("You have already requested one Time");
            }
        } catch (error) {
            setOtpError("Failed to send OTP. Please try again.");
            setIsOtpDisabled(false); // Re-enable the button on error
            toast.error("Failed to send OTP. Please try again.");
        }
    };

    const handleRegister = async (data) => {
        setOtpError('');
        try {
            const response = await axios.post('/api/validate-otp', data);
            console.log(response.data);
            if (response.data[0].status === 200) {
                toast.success("OTP validated successfully! Please set your username and password.");
                const email = form.getValues('email'); // Get the email value from the form
                if (email) {
                    const emailParts = email.split('@');
                    const username = emailParts[0]; // Extract the part before the '@'
                    form.setValue('username', username); // Set the username field
                }
                setStep(2);
            } else if (response.data[0].status === 400 && response.data[0].message === "Invalid OTP") {
                toast.error("Invalid OTP. Please try again.");
            } else if (response.data[0].status === 400 && response.data[0].message === "OTP expired") {
                toast.error("OTP expired. Please request a new OTP.");
            } else {
                toast.error("Registration failed. Please try again.");
            }
        } catch (error) {
            toast.error("Registration failed. Please try again.");
        }
    };

    const handleUsernamePassword = async (data) => {
        console.log('data', data);
        try {
            const response = await axios.put('/api/request-insert', {
                email: data.email,
                username: data.username,
                hospital_name: data.hospital_name,
                phone_no: data.phone_no,
                name: data.name,
                password: data.password
            });
            if (response.data[0].status === 200) {
                toast.success("Username and password set successfully!");
                // Optionally reset form or redirect
            } else {
                toast.error("Failed to set username and password.");
            }
        } catch (error) {
            toast.error("Failed to set username and password.");
        }
    };

    return (
        <div className="max-w-md mt-10">
            <h1 className="text-2xl font-bold mb-6">Request Form</h1>
            <Form {...form}>
                <form
                    onSubmit={step === 1
                        ? form.handleSubmit(handleRegister)
                        : form.handleSubmit(handleUsernamePassword)}
                    className="space-y-4"
                >
                    {step === 1 && (
                        <>
                            <FormField
                                control={form.control}
                                name="name"
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
                                name="hospital_name"
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
                                name="email"
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
                            <FormField
                                control={form.control}
                                name="otp"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>OTP</FormLabel>
                                        <FormControl>
                                            <Input className="focus-within:ring-orange-500" placeholder="OTP" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            {otpError && <p className="text-red-500 text-sm">{otpError}</p>}
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    onClick={handleOTP}
                                    disabled={isOtpDisabled} // Disable the button if isOtpDisabled is true
                                    className={`bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 cursor-pointer transition duration-200 ${
                                        isOtpDisabled ? "opacity-50 cursor-not-allowed" : ""
                                    }`}
                                >
                                    {isOtpDisabled ? "Wait 10 minutes" : "Send OTP"}
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition duration-200"
                                >
                                    Register
                                </Button>
                            </div>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <FormField
                                control={form.control}
                                name="username"
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
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input className="focus-within:ring-orange-500" placeholder="Password" type="password" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <Button
                                type="submit"
                                className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition duration-200"
                            >
                                Submit
                            </Button>
                        </>
                    )}
                </form>
            </Form>
            <ToastContainer />
        </div>
    );
};

export default Request;