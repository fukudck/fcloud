// modules/user/infrastructure/prisma/PrismaUserRepository.ts
import { db } from "@/lib/db"
import { AdminListUsersResult, UserRepository } from "@/modules/user/repositories/UserRepository"
import { User } from "@/modules/user/domain/User"

export class PrismaUserRepository implements UserRepository {
  async deleteUserData(userId: string): Promise<void> {
  await db.$transaction([
    db.file.deleteMany({ where: { userId } }),
    db.folder.deleteMany({ where: { userId } }),
  ])
}
  async deleteById(id: string): Promise<void> {
    await db.user.delete({
      where: { id },
    })
  }
  async count(where: any) {
    return db.user.count({ where })
  }

  async findMany({ where, orderBy, skip, take }: any) {
  const users = await db.user.findMany({
    where,
    orderBy,
    skip,
    take,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      totalQuota: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          folders: true,
          files: true,
        },
      },
    },
  })

  return Promise.all(
    users.map(async (user) => ({
      ...user,
      usedSpace: await this.getUsedSpace(user.id),
    }))
  )
}

  async getUsedSpace(userId: string): Promise<number> {
    const result = await db.file.aggregate({
    where: {
      userId: userId,
      status: 'NORMAL',        
      deletedAt: null,
    },
    _sum: {
      size: true,
    },
  })
  return result._sum.size ?? 0;
  }
  async findById(id: string): Promise<User | null> {
    const user = await db.user.findUnique({ where: { id } })
    if (!user) return null
    const usedSpace = await this.getUsedSpace(id);

    return new User(
      user.id,
      user.name,
      user.email,
      user.role,
      user.totalQuota,
      usedSpace,
      user.createdAt,
      user.updatedAt
    )
  }

  async updateUsedSpace(userId: string, usedSpace: number) {
    await db.user.update({
      where: { id: userId },
      data: { usedSpace },
    })
  }
  async update(id: string, data: { name?: string; email?: string; password?: string }) {
    const result = await db.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        role: true,
        email: true,
        totalQuota: true,
        usedSpace: true,
        createdAt: true,
        updatedAt: true
      },
    })
    
    return {
      id: result.id,
      name: result.name,
      email: result.email,
      role: result.role.toString(),
      totalQuota: result.totalQuota,
      usedSpace: result.usedSpace,
      createAt: result.createdAt,
      UpdateAt: result.updatedAt
    }
  }
}
