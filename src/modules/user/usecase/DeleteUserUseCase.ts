
import { UserRepository } from "../repositories/UserRepository"

export class DeleteUserUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepo.findById(userId)
    if (!user) {
      throw new Error("User not found")
    }

    // QUAN TRỌNG
    await this.userRepo.deleteUserData(userId)

    await this.userRepo.deleteById(userId)
  }
}

