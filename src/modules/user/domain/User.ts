// modules/user/domain/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly role: string,
    public readonly totalQuota: number,
    public readonly usedSpace: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
