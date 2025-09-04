import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu'
import { ChevronDown } from 'lucide-react'
import React from 'react'

const RunIdDropDown = ({runids , selectedRunId , onChange}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className='border-2 border-indigo-500 dark:border-indigo-300 text-gray-700 p-2 px-6 rounded-lg dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md font-semibold bg-white dark:bg-gray-800 hover:bg-indigo-50 transition-all'>
        {selectedRunId || "Select Run Id"} <ChevronDown className='inline ml-2' />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-600">
        {runids && runids.map((runid) => (
          <DropdownMenuItem
            key={runid}
            className={`cursor-pointer px-4 py-2 dark:text-white font-medium rounded hover:bg-indigo-100 dark:hover:bg-indigo-700 transition-all ${selectedRunId === runid ? 'bg-indigo-500 text-white' : ''}`}
            onClick={() => onChange(runid)}
          >
            {runid}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default RunIdDropDown