"use client";

import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Edit,
  Trash2,
  Eye,
  Folder,
  File,
  HardDrive,
  AlertTriangle,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

export enum Role {
  ADMIN = "ADMIN",
  USER = "USER",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  totalQuota: number;
  usedSpace: number;
  _count: {
    files: number;
    folders: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface UserTableProps {
  data: {
    limit: number;
    page: number;
    totalUser: number;
    users: User[];
  };
}

export default function UserTable({ data }: UserTableProps) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(data.page);

  const [users, setUsers] = useState<User[]>(data.users);
  const [totalUser, setTotalUser] = useState(data.totalUser);
  const [limit, setLimit] = useState(data.limit);

  const fetchUsers = async () => {
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search,
        role,
        sort,
      });

      const res = await fetch(`/api/users?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      
      const json = await res.json();
      setUsers(json.users);
      setTotalUser(json.totalUser);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers();
    }, 500);

    return () => clearTimeout(timeout);
  }, [search, role, sort, page]);

  const formatBytes = (bytes: number, decimals: number = 2): string => {
    if (bytes === 0) return "0 Bytes";

    const k = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const calculateUsagePercentage = (used: number, total: number): number => {
    if (total === 0) return 0;
    return parseFloat(((used / total) * 100).toFixed(2));
  };

  const getQuotaColor = (percentage: number): string => {
    if (percentage >= 90) return "bg-red-500/20 text-red-300";
    if (percentage >= 70) return "bg-yellow-500/20 text-yellow-300";
    return "bg-green-500/20 text-green-300";
  };

  // Phân trang
  const totalPages = Math.ceil(data.totalUser / data.limit);
  const start = (data.page - 1) * data.limit + 1;
  const end = Math.min(data.page * data.limit, data.totalUser);

  // delete
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Error:", error);
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  return (
    <div className="bg-dark-200 rounded-xl border border-dark-400 overflow-hidden animate-fade-in">
      <div className="p-6 flex justify-between items-center border-b border-dark-400">
        <div>
          <h2 className="text-xl font-semibold">User Management</h2>
          <p className="text-sm text-gray-400 mt-1">
            Manage your system users efficiently
          </p>
        </div>
      </div>

      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-dark-300 p-4 rounded-lg border border-dark-400">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm  mb-1">Total Users</div>
                <div className="text-2xl font-bold">{users.length}</div>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20">
                <HardDrive size={20} className="text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-dark-300 p-4 rounded-lg border border-dark-400">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm  mb-1">Admin Users</div>
                <div className="text-2xl font-bold">
                  {users.filter((user) => user.role === Role.ADMIN).length}
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-500/20">
                <HardDrive size={20} className="text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-dark-300 p-4 rounded-lg border border-dark-400">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm mb-1">
                  Total Storage Used
                </div>
                <div className="text-2xl font-bold">
                  {formatBytes(
                    users.reduce((acc, user) => acc + user.usedSpace, 0)
                  )}
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-500/20">
                <HardDrive size={20} className="text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-dark-300 p-4 rounded-lg border border-dark-400">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm  mb-1">Average Usage</div>
                <div className="text-2xl font-bold">
                  {Math.round(
                    users.reduce(
                      (acc, user) =>
                        acc +
                        calculateUsagePercentage(
                          user.usedSpace,
                          user.totalQuota
                        ),
                      0
                    ) / users.length
                  )}
                  %
                </div>
              </div>
              <div className="p-3 rounded-full bg-cyan-500/20">
                <HardDrive size={20} className="text-cyan-400" />
              </div>
            </div>
            <div className="text-xs  mt-2">Across all users</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-dark-300 rounded-lg border border-dark-400 overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-dark-400">
            <h3 className="font-medium">All Users</h3>
            <div className="flex items-center space-x-2">
            <Select value={role} onValueChange={(value) => setRole(value)}>
              <SelectTrigger className="w-[180px] bg-dark-400 border ">
                <SelectValue placeholder="All roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                <SelectItem value="USER">USER</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(value) => setSort(value)}>
              <SelectTrigger className="w-[200px] bg-dark-400 border ">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="usedSpace">Storage usage</SelectItem>
              </SelectContent>
            </Select>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-dark-400 border border-dark-500 rounded-lg
             focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-transparent text-sm w-64"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Eye size={18} className="text-gray-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-400 border-b border-dark-400">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Storage Usage</th>
                  <th className="p-4">Files & Folders</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4">Last Updated</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const usagePercentage = calculateUsagePercentage(
                    user.usedSpace,
                    user.totalQuota
                  );

                  return (
                    <tr
                      key={user.id}
                      className="border-b border-dark-400 hover:bg-dark-400/50 transition-colors duration-150"
                    >
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center mr-3 border border-dark-500">
                            <span className="text-accent-blue font-semibold">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-gray-500">
                              {user.email}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              ID: {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === Role.ADMIN
                              ? "bg-purple-500/20 text-purple-300"
                              : "bg-blue-500/20 text-blue-300"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="mb-2">
                          <div className="flex justify-between text-xs  mb-1">
                            <span>
                              {formatBytes(user.usedSpace)} of{" "}
                              {formatBytes(user.totalQuota)}
                            </span>
                            <span>{usagePercentage}%</span>
                          </div>
                          <div className="w-full bg-dark-400 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getQuotaColor(
                                usagePercentage
                              )}`}
                              style={{ width: `${usagePercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center text-sm">
                            <File size={14} className="text-blue-400 mr-1" />
                            <span>{user._count?.files || 0} files</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Folder
                              size={14}
                              className="text-yellow-400 mr-1"
                            />
                            <span>{user._count?.folders || 0} folders</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm">
                          {new Date(user.updatedAt).toLocaleDateString("vi-VN")}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-2 rounded-lg hover:bg-dark-500 transition-colors duration-200 text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Confirm Delete
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{selectedUser?.name}</span>?
                  This action cannot be undone.
                </p>
                <div className="border rounded-md p-3 bg-muted/50">
                  <div className="text-sm flex items-center gap-2">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full flex-shrink-0" />
                    {selectedUser?.email}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <div className="p-4 border-t border-dark-400 flex items-center justify-between">
            <div className="text-sm ">
              Showing {start} to {end} of {data.totalUser} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={page === pageNumber ? "active" : ""}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
