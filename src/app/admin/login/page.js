'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid' // ใช้สร้าง Token
import Cookies from 'js-cookie' // ใช้จัดเก็บ Token
import LoginForm from '../../components/auth/LoginForm'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (pin) => {
    setIsLoading(true)
    setError('')

    if (!/^\d{4}$/.test(pin)) { // ตรวจสอบว่าเป็นตัวเลข 4 หลัก
      setError('PIN ต้องมี 4 หลัก')
      setIsLoading(false)
      return
    }

    try {
      // จำลองการตรวจสอบ PIN (ในระบบจริงต้องเช็คจาก API)
      if (pin === '1234') { // ตัวอย่าง PIN ถูกต้อง
        const token = nanoid(32) // สร้าง Token 32 ตัวอักษร
        Cookies.set('auth_token', token, { expires: 1 }) // เก็บใน Cookie (1 วัน)
        router.push('/admin/dashboard')
      } else {
        setError('PIN ไม่ถูกต้อง')
      }
    } catch (error) {
      console.error('Login failed:', error)
      setError('เกิดข้อผิดพลาดในการล็อกอิน')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
      <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-2xl transform transition-all hover:scale-105">
        <div className="card-body">
          <h2 className="text-3xl font-extrabold text-center text-gray-800">Admin Login</h2>
          <p className="text-center text-gray-500 mb-4">กรุณากรอก PIN 4 หลัก</p>
          {error && <p className="text-red-500 text-center">{error}</p>}
          <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}
