'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import SideImage from "../../../public/NEOM.png"
import axios from 'axios'
import Cookies from 'js-cookie'
import { toast, ToastContainer } from 'react-toastify'
import { useRouter } from 'next/navigation'

const page = () => {
    const [internalId, setInternalId] = useState("");
    const [runId, setRunId] = useState("");
    const [processing, setProcessing] = useState(false);
    const [user, setUser] = useState([])
    const router = useRouter();

    useEffect(() => {
        const userData = Cookies.get('vide_user')
        if (userData) {
            const parsedUser = JSON.parse(userData)
            setUser(parsedUser)
        }
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const response = await axios.post('/api/format-save', {
                internal_id: internalId,
                run_id: runId,
                hospital_name: user.hospital_name
            });
            if (response.data[0].status === 200) {
                toast.success(response.data[0].message);
                router.push('/')
                setProcessing(false);
            }
            else if (response.data[0].status === 400) {
                toast.error(response.data[0].message);
                setProcessing(false);
            }
        }
        catch (err) {
            setProcessing(false);
            console.error("Error submitting form:", err);
        }
    };
    return (
        <div>
            <div className="grid h-screen grid-cols-1 md:grid-cols-12">
                {/* Left Section (Hidden on Mobile) */}
                <div className="hidden md:block md:col-span-8">
                    <Image
                        src={SideImage}
                        className="mt-[200px]"
                        alt="side image"
                    />
                </div>

                {/* Right Section */}
                <div className="col-span-1 md:col-span-4 bg-white p-5 md:p-10 flex flex-col justify-center items-center relative">
                    {/* Image at Top-Left or Top-Right for Mobile View */}
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
                        <h2 className="text-2xl font-bold mb-4 text-center">Set ID Format</h2>
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Initial Internal ID</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="e.g., ABCD-0000 or 20250000"
                                    value={internalId}
                                    onChange={e => setInternalId(e.target.value)}
                                    required
                                />
                            </div>
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700">Initial Run ID</label>
                                <input
                                    type="text"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                    placeholder="e.g., RUN2025000 or RUN_000 or RUN-000"
                                    value={runId}
                                    onChange={e => setRunId(e.target.value)}
                                    required
                                />
                            </div> */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full cursor-pointer bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600 transition"
                            >
                                Save Format
                            </button>
                        </form>

                    </div>

                </div>
            </div>
            <ToastContainer/>
        </div>
    )
}

export default page