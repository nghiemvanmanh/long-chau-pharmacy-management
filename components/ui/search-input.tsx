"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SearchInputProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function SearchInput({ placeholder, value, onChange, className = "" }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <Input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="pl-10" />
    </div>
  )
}
