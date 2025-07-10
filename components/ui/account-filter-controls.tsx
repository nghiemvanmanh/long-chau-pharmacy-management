"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ROLE_PERMISSIONS } from "@/lib/constants"

interface AccountFilterControlsProps {
  roleFilter: string
  setRoleFilter: (value: string) => void
  statusFilter: string
  setStatusFilter: (value: string) => void
}

export function AccountFilterControls({
  roleFilter,
  setRoleFilter,
  statusFilter,
  setStatusFilter,
}: AccountFilterControlsProps) {
  return (
    <>
      <Select value={roleFilter} onValueChange={setRoleFilter}>
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder="Vai trò" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả vai trò</SelectItem>
          {Object.entries(ROLE_PERMISSIONS).map(([key, role]) => (
            <SelectItem key={key} value={key}>
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả trạng thái</SelectItem>
          <SelectItem value="active">Hoạt động</SelectItem>
          <SelectItem value="inactive">Không hoạt động</SelectItem>
        </SelectContent>
      </Select>
    </>
  )
}
