// modules/user/usecases/GetCurrentUserUseCase.ts
import { UserRepository } from "../repositories/UserRepository"
import { User } from "../domain/User"


export class GetCurrentUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepo.findById(id)

    if (!user) {
      throw new Error("User not found")
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      totalQuota: user.totalQuota,
      usedSpace: user.usedSpace,
      updatedAt: user.updatedAt,
      createdAt: user.createdAt
    }
  }
}
