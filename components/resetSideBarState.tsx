"use client"
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { useSidebar } from './ui/sidebar'


export default function ResetSideBarState() {
    const pathname = usePathname()
    const {setOpen} = useSidebar()
    useEffect(() => {
        setOpen(false)
    }, [pathname, setOpen])
    
  return (
   null
  )
}