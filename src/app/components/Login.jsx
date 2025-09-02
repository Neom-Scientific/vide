import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { set, useForm } from 'react-hook-form'
import { toast, ToastContainer } from 'react-toastify'
import { z } from "zod"
import { FaEye, FaEyeSlash } from "react-icons/fa"
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

const formSchema = z.object({
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

const Login = () => {
    const router = useRouter();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [processing, setProcessing] = useState(false);

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: ''
        }
    });

    const onSubmit = async (data) => {
        setProcessing(true);
        console.log(data)
        data.application_name = 'vide'
        try {
            const response = await axios.post('/api/login-insert', data);
            if (response.data[0].status === 200) {
                toast.success(response.data[0].message);
                console.log(response.data[0].data);
                Cookies.set('vide_user', JSON.stringify(response.data[0].data), { expires: 7 });
                if (response.data[0].data.user_login === 0) {
                    router.push('/reset-password');
                    setProcessing(false);
                }
                else {
                    router.push('/');
                    setProcessing(false);

                }
            }
            else if (response.data[0].status === 401) {
                toast.error(response.data[0].message);
                setProcessing(false);
            }
            else {
                toast.error('Login failed, please try again');
                setProcessing(false);
            }
        }
        catch (error) {
            console.error('Error during login:', error);
            setProcessing(false);
        }
    }

    return (
        <div className="max-w-md mt-10">
            <h1 className="text-2xl font-bold mb-6">LOGIN</h1>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input className="focus-within:ring-orange-500" placeholder="Username" {...field} />
                                </FormControl>
                                {form.formState.errors.username && (
                                    <p className="text-red-500 text-sm mt-1">
                                        {form.formState.errors.username.message}
                                    </p>
                                )}
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

                    <Button
                        type="submit"
                        disabled={processing}
                        // onClick={() => setProcessing(true)}
                        className="w-full mt-4 cursor-pointer bg-orange-500 hover:bg-orange-600"
                    >
                        Submit
                    </Button>
                </form>
            </Form>
            <ToastContainer />
        </div>
    )
}

export default Login