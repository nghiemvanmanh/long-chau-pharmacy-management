"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface ChartCardProps {
  title: string
  icon: LucideIcon
  iconColor: string
  children: React.ReactNode
  delay?: number
  direction?: "left" | "right"
}

export function ChartCard({ title, icon: Icon, iconColor, children, delay = 0, direction = "left" }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: direction === "left" ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icon className={`w-5 h-5 mr-2 ${iconColor}`} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  )
}
