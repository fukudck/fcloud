import { UserRepository } from "../repositories/UserRepository"

export class AdminListUsersUseCase {
  constructor(private readonly userRepo: UserRepository) {}

  async execute(params: {
    page: number
    limit: number
    role?: string
    search?: string
    sort?: string
  }) {
    const { page, limit, role, search, sort } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (role && role.toLowerCase() !== "all") {
      where.role = role
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    let orderBy: any = { createdAt: "desc" }
    if (sort === "oldest") orderBy = { createdAt: "asc" }
    if (["usedspace", "used", "storage", "storageusage"].includes(sort ?? "")) {
      orderBy = { usedSpace: "desc" }
    }

    const [totalUser, users] = await Promise.all([
      this.userRepo.count(where),
      this.userRepo.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ])

    return {
      totalUser,
      page,
      limit,
      users,
    }
  }
}
