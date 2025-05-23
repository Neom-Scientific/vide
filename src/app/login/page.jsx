import React from 'react'

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">Login</h2>
            <form>
            <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input type="email" id="email" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500" required />
            </div>
            <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <input type="password" id="password" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-500" required />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-200">Login</button>
            </form>
        </div>
        
    </div>
  )
}

export default Login