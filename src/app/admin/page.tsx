'use client'

import UserTable from '@/components/admin/UserTable';
import { useEffect, useState } from 'react';

export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  totalQuota: number;
  usedSpace: number;
  _count: {
    files: number,
    folders: number,
  }
  createdAt: Date;
  updatedAt: Date;
}

interface responsive {
    limit: number,
    page: number,
    totalUser: number,
    users: User[],
}

export default function UsersPage() {
    const [data, setData] = useState<responsive>()

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setData(data))
  }, [])

  console.log(data)
  return (
    <div className="animate-fade-in">
      {data ? <UserTable data={data} /> : <p>Loading...</p>}
    </div>
  );
}