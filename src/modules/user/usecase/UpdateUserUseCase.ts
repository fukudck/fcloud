// modules/user/usecases/UpdateUserUseCase.ts
import { UserRepository } from "../repositories/UserRepository"
import { User } from "../domain/User"

function toGB(bytes: number): string {
  return (bytes / (1024 * 1024 * 1024)).toFixed(2)
}

export class UpdateUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(userId: string, name: string): Promise<User> {
    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new Error("User not found")
    }


    const updated = await this.userRepo.update(userId, {
      name: name ?? user.name,
    })

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      totalQuota: updated.totalQuota,
      usedSpace: updated.usedSpace,
      createdAt: updated.createAt,
      updatedAt: updated.UpdateAt,
    }
  }
}
