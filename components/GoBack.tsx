"use client"
import React, { useCallback } from 'react'
import { Button } from './ui/button'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'


export default function GoBack({to}:{to:string}) {
    const {push} = useRouter()
    const paths = usePathname()
    const handleBack=useCallback(()=>{
        const newPaths = to?to:paths.split("/").slice(0, -1).join("/")
        push(newPaths)
    
    },[paths, push, to])
  return (
    <div className='w-full'>
        <Button variant="ghost" className='text-lg' onClick={handleBack}> <ArrowLeft/> Go Back</Button>
    </div>
  )
}