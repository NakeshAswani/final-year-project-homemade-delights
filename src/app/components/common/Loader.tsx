import { Loader2 } from 'lucide-react'
import React from 'react'

export default function Loader() {
    return (
        <div className="flex items-center justify-center bg-gray-100 w-full h-screen">
            <Loader2 className="animate-spin h-16 w-16 text-gray-950" />
        </div>
    )
}
