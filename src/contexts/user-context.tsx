"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "USER"
  totalQuota: number
  usedSpace: number
}

interface UserContextType {
  user: User | null
  isLoading: boolean
  error: string | null
  refreshUser: () => Promise<void>
  updateUser: (updates: Partial<User>) => void
  clearUser: () => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUserData = async (): Promise<User> => {
    const res = await fetch('/api/user')
    if (!res.ok) throw new Error("Failed to fetch user")
    return res.json()
  }

  useEffect(() => {
    const loadUser = async () => {
      try {
        const cachedUser = localStorage.getItem("user-data")
        const cacheTimestamp = localStorage.getItem("user-data-timestamp")

        const isCacheValid =
          cacheTimestamp && Date.now() - Number.parseInt(cacheTimestamp) < 1 * 1000

        if (cachedUser && isCacheValid) {
          setUser(JSON.parse(cachedUser))
          setIsLoading(false)
          return
        } 
        

        const userData = await fetchUserData()
        setUser(userData)

        localStorage.setItem("user-data", JSON.stringify(userData))
        localStorage.setItem("user-data-timestamp", Date.now().toString())
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user")
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const refreshUser = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const userData = await fetchUserData()
      setUser(userData)
      localStorage.setItem("user-data", JSON.stringify(userData))
      localStorage.setItem("user-data-timestamp", Date.now().toString())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh user")
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = (updates: Partial<User>) => {
    if (!user) return
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem("user-data", JSON.stringify(updatedUser))
    localStorage.setItem("user-data-timestamp", Date.now().toString())
  }
  const clearUser = async () => {
    setUser(null)
    localStorage.removeItem("user-data")
    localStorage.removeItem("user-data-timestamp")
  }

  return (
    <UserContext.Provider value={{ user, isLoading, error, refreshUser, updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}


