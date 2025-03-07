'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'

export default function AdminLayout({ children }) {
    const router = useRouter()
    const pathname = usePathname()
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const excludedPaths = ['/admin/login'];

    useEffect(() => {

        // const token = localStorage.getItem('auth_token')
        // if (!token) {
        //     router.push('/admin/login')
        // } else {
        //     setIsAuthenticated(true)
        // }
        setIsAuthenticated(true)
        setIsLoading(false)
    }, [router])

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <span className='loading loading-spinner loading-lg'></span>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null 
    }

    const isExcludedPath = excludedPaths.some(path => pathname.startsWith(path));

    if (isExcludedPath) {
        return <>{children}</>
    }

    return (
        <div className="drawer lg:drawer-open">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content flex flex-col">
            {/* <Header /> */}
            <main className="flex-1 p-6 bg-base-200 overflow-y-auto">
              {children}
            </main>
          </div>
          <Sidebar />
        </div>
      )
}