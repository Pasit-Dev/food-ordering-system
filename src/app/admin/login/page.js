'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '../../components/auth/LoginForm'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (username, password) => {
    setIsLoading(true)
    try {
      // โค้ดสำหรับ authentication API
      // สมมติว่าได้ token แล้ว
      localStorage.setItem('auth_token', 'dummy_token')
      router.push('/admin/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl transform transition-all hover:scale-105">
        <div className="card-body">
          <h2 className="text-3xl font-extrabold text-center text-gray-800">Admin Login</h2>
          <p className="text-center text-gray-500 mb-6">เข้าสู่ระบบเพื่อจัดการระบบของคุณ</p>
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}