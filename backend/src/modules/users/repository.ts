import { getDb } from '@/shared/db/mongo'

export interface UserLite {
  _id: string
  name: string
  email: string
  image?: string | null
}

export class UsersRepo {
  private coll() {
    return getDb().collection<UserLite>('users')
  }

  async findByIds(ids: string[]): Promise<UserLite[]> {
    const unique = [...new Set(ids)]
    if (!unique.length) return []
    return this.coll()
      .find({ _id: { $in: unique } })
      .project({ name: 1, email: 1, image: 1 })
      .toArray() as unknown as UserLite[]
  }

  async findByEmail(email: string): Promise<UserLite | null> {
    return this.coll().findOne({ email: email.toLowerCase() })
  }
}
