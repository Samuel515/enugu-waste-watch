
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";

// Mock users data - would be replaced by backend API
const MOCK_USERS = [
  { id: "1", name: "John Resident", email: "resident@example.com", role: "resident", area: "Independence Layout", status: "active" },
  { id: "2", name: "Mary Official", email: "official@example.com", role: "official", area: null, status: "active" },
  { id: "3", name: "Admin User", email: "admin@example.com", role: "admin", area: null, status: "active" },
  { id: "4", name: "Jane Smith", email: "jane@example.com", role: "resident", area: "New Haven", status: "inactive" },
  { id: "5", name: "Robert Johnson", email: "robert@example.com", role: "resident", area: "Trans Ekulu", status: "active" },
];

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  area: string | null;
  status: "active" | "inactive";
}

const ManageUsers = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>(MOCK_USERS);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.area && u.area.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Toggle user status (active/inactive)
  const toggleUserStatus = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === "active" ? "inactive" : "active" }
          : u
      )
    );
  };

  // Delete user
  const deleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
  };

  // Role badge color
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-purple-500 hover:bg-purple-600";
      case "official":
        return "bg-blue-500 hover:bg-blue-600";
      case "resident":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Layout requireAuth allowedRoles={["admin"]}>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
          <p className="text-muted-foreground">
            View and manage user accounts in the system
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>System Users</CardTitle>
                <CardDescription>
                  Total users: {users.length}
                </CardDescription>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-9 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Add User</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Area</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center h-24 text-muted-foreground"
                      >
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className={getRoleBadgeColor(user.role)}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.area || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={user.status === "active" ? "outline" : "secondary"}
                            className={
                              user.status === "active"
                                ? "text-green-500 border-green-500"
                                : "text-gray-500"
                            }
                          >
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              title="Edit User"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              title={
                                user.status === "active"
                                  ? "Deactivate User"
                                  : "Activate User"
                              }
                              onClick={() => toggleUserStatus(user.id)}
                            >
                              {user.status === "active" ? (
                                <UserX className="h-4 w-4 text-amber-500" />
                              ) : (
                                <UserCheck className="h-4 w-4 text-green-500" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              title="Delete User"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ManageUsers;
