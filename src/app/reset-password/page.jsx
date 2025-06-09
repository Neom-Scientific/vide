'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import SideImage from "../../../public/NEOM.png"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Cookies from 'js-cookie'
import { toast, ToastContainer } from 'react-toastify'
import { useRouter } from 'next/navigation'

const formSchema = z.object({
    password: z.string().min(1, "Password is required"),
    new_password: z.string().min(6, "New Password must be at least 6 characters"),
    confirm_password: z.string().min(6, "Confirm Password must be at least 6 characters")
}).refine((data) => data.confirm_password === data.new_password, {
    message: "Passwords do not match",
    path: ["confirm_password"], // Specify the field where the error should appear
});

const page = () => {
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [newPasswordVisible, setNewPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const cookieData = Cookies.get('user');
        if (cookieData) {
            const fetchUser = async () => {
                try {
                    const parsedData = JSON.parse(cookieData);
                    setUser(parsedData);
                    if (!parsedData || !parsedData.role || !parsedData.username) {
                        console.log('parsedData', parsedData);
                        console.error("User role or username is undefined");
                        return;
                    }
                    try {
                        const response = await axios.get(`/api/request-insert?role=${parsedData.role}&username=${parsedData.username}`);
                        if (response.data[0]?.status === 200) {
                            console.log("User data fetched successfully:", response.data[0].data);
                        } 
                        else if (response.data[0]?.status === 404) {
                            console.error(response.data[0]?.message);
                        }
                        else {
                            console.error("Failed to fetch user data:", response.data[0]?.message);
                        }
                    } catch (error) {
                        console.error("Error fetching user data:", error);
                    }

                } catch (error) {
                    console.error("Error parsing user data from cookies:", error);
                }
            };
            fetchUser()
        } else {
            console.error("No user data found in cookies");
        }

    }, []);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            new_password: '',
            confirm_password: ''
        }
    });

    const handleSubmit = async(data) => {
        console.log("Form submitted with data:", data);
        try{
            const response = await axios.post('/api/reset-password', {
                password: data.password,
                confirm_password: data.confirm_password,
                username: user?.username // Assuming you have the username from the cookie
            });
            if (response.data[0].status === 200) {
                toast.success("Password reset successfully");
                router.push('/')
                console.log(response.data[0].message);
                
            } else if (response.data[0]?.status === 401) {
                toast.error(response.data[0].message);
                console.log( response.data[0].message);
            } 
        }
        catch (error) {
            console.error("Error during form submission:", error);
        }
    };

    return (
        <div className="grid h-screen grid-cols-1 md:grid-cols-12">
            {/* Left Section (Hidden on Mobile) */}
            <div className="hidden md:block md:col-span-8">
                <Image
                    src={SideImage}
                    className="w-full h-full"
                    alt="side image"
                />
            </div>

            {/* Right Section */}
            <div className="col-span-1 md:col-span-4 bg-white p-5 md:p-10 flex flex-col justify-center items-center relative">
                <div className="absolute top-2 left-2 md:hidden">
                    <Image
                        src={SideImage}
                        alt="side image"
                        width={100} // Adjust size for mobile
                        height={100}
                        className="object-contain"
                    />
                </div>

                <div className="w-full max-w-sm">
                    <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
                    <Form {...form}>
                        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='block mb-3 font-bold'>Password you get from Email</FormLabel>
                                        <FormControl>
                                            <div
                                                className={`flex items-center border rounded-md focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500`}
                                            >
                                                <input
                                                    type={passwordVisible ? "text" : "password"}
                                                    className="flex-1 px-3 py-2 rounded-md outline-none focus:ring-0 focus:border-none"
                                                    placeholder="Password"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    className="px-3 py-2 bg-white border-l border-gray-300 flex items-center justify-center focus:outline-none"
                                                    onClick={() => setPasswordVisible(!passwordVisible)}
                                                >
                                                    {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        {form.formState.errors.password && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {form.formState.errors.password.message}
                                            </p>
                                        )}
                                    </FormItem>
                                )}
                            />

                            {/* New Password Field */}
                            <FormField
                                control={form.control}
                                name="new_password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='block mb-3 font-bold'>New Password</FormLabel>
                                        <FormControl>
                                            <div
                                                className={`flex items-center border rounded-md focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500`}
                                            >
                                                <input
                                                    type={newPasswordVisible ? "text" : "password"}
                                                    className="flex-1 px-3 py-2 rounded-md outline-none focus:ring-0 focus:border-none"
                                                    placeholder="New Password"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    className="px-3 py-2 bg-white border-l border-gray-300 flex items-center justify-center focus:outline-none"
                                                    onClick={() => setNewPasswordVisible(!newPasswordVisible)}
                                                >
                                                    {newPasswordVisible ? <FaEye /> : <FaEyeSlash />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        {form.formState.errors.new_password && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {form.formState.errors.new_password.message}
                                            </p>
                                        )}
                                    </FormItem>
                                )}
                            />

                            {/* Confirm Password Field */}
                            <FormField
                                control={form.control}
                                name="confirm_password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className='block mb-3 font-bold'>Confirm Password</FormLabel>
                                        <FormControl>
                                            <div
                                                className={`flex items-center border rounded-md focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-orange-500`}
                                            >
                                                <input
                                                    type={confirmPasswordVisible ? "text" : "password"}
                                                    className="flex-1 px-3 py-2 rounded-md outline-none focus:ring-0 focus:border-none"
                                                    placeholder="Confirm Password"
                                                    {...field}
                                                />
                                                <button
                                                    type="button"
                                                    className="px-3 py-2 bg-white border-l border-gray-300 flex items-center justify-center focus:outline-none"
                                                    onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                                                >
                                                    {confirmPasswordVisible ? <FaEye /> : <FaEyeSlash />}
                                                </button>
                                            </div>
                                        </FormControl>
                                        {form.formState.errors.confirm_password && (
                                            <p className="text-red-500 text-sm mt-1">
                                                {form.formState.errors.confirm_password.message}
                                            </p>
                                        )}
                                    </FormItem>
                                )}
                            />

                            <Button
                                type="submit"
                                className="w-full cursor-pointer bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600 transition-colors duration-300"
                            >
                                Submit
                            </Button>
                        </form>
                    </Form>
                </div>
            </div>
            <ToastContainer/>
        </div>
    );
};

export default page;