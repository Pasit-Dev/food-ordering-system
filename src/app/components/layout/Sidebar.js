'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()
  
  const menuItems = [
    { title: 'Dashboard', path: '/admin/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { title: 'Table Management', path: '/admin/table-management', icon: 'M4 6h16M4 12h16M4 18h16' },
    { title: 'Menu Management', path: '/admin/menu-management', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
    { title: 'Order Management', path: '/admin/order-management', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' }
  ]

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...")
    // Example: router.push('/login')
  }

  return (
    <div className="drawer-side">
      <label htmlFor="my-drawer" className="drawer-overlay"></label>
      <div className="w-64 bg-base-100 text-base-content h-full flex flex-col">
        <div className="p-4 font-bold text-xl text-center border-b">
          Restaurant Admin
        </div>
        
        <div className="flex flex-col justify-between h-[calc(100%-68px)]">
          <ul className="menu p-4 w-full">
            {menuItems.map((item, index) => (
              <li key={index} className='mt-4 w-full' >
                <Link 
                  href={item.path} 
                  className={pathname === item.path ? 'active bg-blue-600 hover:bg-blue-700 text-white py-3' : 'py-3'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
          
          {/* Logout button at the bottom */}
          <div className="p-4 mb-4">
            <button 
              onClick={handleLogout}
              className="btn btn-block bg-red-500 hover:bg-red-600 text-white flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}