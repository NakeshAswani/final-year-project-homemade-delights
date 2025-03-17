"use client"

import type React from "react"
import { useEffect } from "react"
import { Provider, useDispatch, useSelector } from "react-redux"
import Cookies from "js-cookie"
import { RootState, store } from "@/lib/redux/store"
import { setUser } from "@/lib/redux/slices/authSlice"

function InitializeUser() {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.auth.user)

  useEffect(() => {
    if (!user) {
      const userData = Cookies.get("user")
      if (userData) {
        try {
          const user = JSON.parse(userData)
          dispatch(setUser(user)) // Store in Redux
        } catch (error) {
          console.error("Failed to parse user data from cookies:", error)
        }
      }
    }
  }, [dispatch])

  return null
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <InitializeUser />
      {children}
    </Provider>
  )
}