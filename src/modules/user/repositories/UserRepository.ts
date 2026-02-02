// modules/user/repositories/UserRepository.ts
import { User } from "@/modules/user/domain/User"

export interface UserRepository {
  findById(id: string): Promise<User | null>
  deleteById(id: string): Promise<void>
  deleteUserData(userId: string): Promise<void>

  updateUsedSpace(
    userId: string,
    usedSpace: number
  ): Promise<void>

  getUsedSpace(userId: string): Promise<number>
  update(
    id: string,
    data: {
      name?: string
      email?: string
      password?: string
    }
  ): Promise<{
    id: string
    name: string
    email: string
    role: string
    totalQuota: number
    usedSpace: number
    createAt: Date
    UpdateAt: Date
  }>
  count(where: any): Promise<number>
  findMany(params: {
    where: any
    orderBy: any
    skip: number
    take: number
  }): Promise<AdminListUsersResult["users"]>
}


export interface AdminListUsersParams {
  page: number
  limit: number
  role?: string
  search?: string
  sort?: string
}

export interface AdminListUsersResult {
  totalUser: number
  users: (User & {
    _count: {
      folders: number
      files: number
    }
  })[]
}


