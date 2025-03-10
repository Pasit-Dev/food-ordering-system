'use client'
import { useState } from 'react'

export default function LoginForm({ onSubmit, isLoading }) {
  const [pin, setPin] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(pin)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-control">
        <label className="label">
          <span className="label-text text-black">Enter PIN (6 digits)</span>
        </label>
        <input
          type="text"
          placeholder="Enter 6-digit PIN"
          className="input input-bordered text-black"
          value={pin}
          onChange={(e) => {
            // Allow only numbers and limit to 6 characters
            const value = e.target.value;
            if (/^\d{0,6}$/.test(value)) {
              setPin(value);
            }
          }}
          required
          maxLength={6}  // Ensures the input can only have up to 6 digits
        />
      </div>
      
      <div className="form-control mt-6">
        <button 
          type="submit" 
          className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </form>
  )
}
