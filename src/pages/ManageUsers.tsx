
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

// Define extended user type for the UI
interface ExtendedUser {
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
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<UserRole>("resident");
  const [editArea, setEditArea] = useState("");
  const { toast } = useToast();

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        
        // Get all profiles from the profiles table, not just the current user
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          throw profilesError;
        }

        if (!profilesData || profilesData.length === 0) {
          console.log('No profiles found in the database');
          setUsers([]);
          setIsLoading(false);
          return;
        }
        
        console.log('Profiles data fetched:', profilesData);
        
        // Map to ExtendedUser format
        const mappedUsers: ExtendedUser[] = profilesData.map(profile => ({
          id: profile.id,
          name: profile.name || 'Unknown',
          email: profile.email || 'No email',
          role: (profile.role as UserRole) || 'resident',
          area: profile.area,
          status: "active" // All users are active by default
        }));
        
        setUsers(mappedUsers);
        console.log('Mapped users:', mappedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Failed to load users",
          description: "There was an error loading the user list.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUsers();
  }, [toast]);

  // Filter users based on search query
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.area && u.area.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Toggle user status (active/inactive)
  const toggleUserStatus = async (userId: string) => {
    try {
      const userToUpdate = users.find(u => u.id === userId);
      
      if (!userToUpdate) return;
      
      const newStatus = userToUpdate.status === "active" ? "inactive" : "active";
      
      // Update the user status in the UI
      setUsers(
        users.map((u) =>
          u.id === userId
            ? { ...u, status: newStatus }
            : u
        )
      );
      
      toast({
        title: "Status updated",
        description: `User ${userToUpdate.name} is now ${newStatus}.`,
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast({
        title: "Update failed",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  // Delete user
  const deleteUser = async () => {
    if (!currentUser) return;
    
    try {
      // Delete user from profiles table first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', currentUser.id);
        
      if (profileError) throw profileError;
      
      // Try to delete from auth as well (might require admin rights)
      try {
        await supabase.auth.admin.deleteUser(currentUser.id);
      } catch (authError) {
        console.error('Could not delete user from auth system. This may require admin privileges:', authError);
      }
      
      // Update local state
      setUsers(users.filter((u) => u.id !== currentUser.id));
      
      toast({
        title: "User deleted",
        description: `${currentUser.name} has been removed from the system.`,
      });
      
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete user. You may not have sufficient permissions.",
        variant: "destructive",
      });
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    if (!currentUser) return;
    
    try {
      // Update user in profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editName,
          role: editRole,
          area: editArea || null,
          email: editEmail,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);
      
      if (error) throw error;
      
      // Update local state
      setUsers(
        users.map((u) =>
          u.id === currentUser.id
            ? {
                ...u,
                name: editName,
                email: editEmail,
                role: editRole,
                area: editArea || null
              }
            : u
        )
      );
      
      toast({
        title: "User updated",
        description: `${editName}'s details have been updated.`,
      });
      
      setEditDialogOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Update failed",
        description: "Failed to update user details.",
        variant: "destructive",
      });
    }
  };

  // Open edit dialog and populate fields
  const openEditDialog = (user: ExtendedUser) => {
    setCurrentUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditArea(user.area || "");
    setEditDialogOpen(true);
  };

  // Open delete confirmation dialog
  const openDeleteDialog = (user: ExtendedUser) => {
    setCurrentUser(user);
    setDeleteDialogOpen(true);
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
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Loading users...
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length === 0 ? (
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
                              onClick={() => openEditDialog(user)}
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
                              onClick={() => openDeleteDialog(user)}
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

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">
                Name
              </label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="email" className="text-right">
                Email
              </label>
              <Input
                id="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="role" className="text-right">
                Role
              </label>
              <Select value={editRole} onValueChange={(value) => setEditRole(value as UserRole)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="official">Official</SelectItem>
                  <SelectItem value="resident">Resident</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="area" className="text-right">
                Area
              </label>
              <Input
                id="area"
                value={editArea}
                onChange={(e) => setEditArea(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {currentUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteUser}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ManageUsers;
