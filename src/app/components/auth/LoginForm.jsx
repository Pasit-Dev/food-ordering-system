'use client'
import { useState } from 'react'


export default function LoginForm(onSubmit, isLoading) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(username, password)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-control">
        <label className="label">
          <span className="label-text text-black">Username</span>
        </label>
        <input
          type="text"
          placeholder="Enter username"
          className="input input-bordered text-black"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      
      <div className="form-control mt-4">
        <label className="label">
          <span className="label-text text-black">Password</span>
        </label>
        <input
          type="password"
          placeholder="Enter password"
          className="input input-bordered text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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