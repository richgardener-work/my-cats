import { useSyncExternalStore } from 'react'

const listeners = new Set()
const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
const emit = () => listeners.forEach(fn => fn())

let dark = (() => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('theme') === 'dark'
})()

if (typeof document !== 'undefined') {
  document.documentElement.classList.toggle('dark', dark)
}

const toggle = () => {
  dark = !dark
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }
  emit()
}

const getSnapshot = () => dark
const getServerSnapshot = () => false

export function useTheme() {
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return { dark: value, toggle }
}
