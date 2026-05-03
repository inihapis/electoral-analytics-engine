import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  Shield,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface User {
  id: string;
  username: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'USER';
  createdAt: string;
  updatedAt: string;
  _count: {
    bpds: number;
  };
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAll
  });

  const deleteMutation = useMutation({
    mutationFn: userService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const createMutation = useMutation({
    mutationFn: userService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowCreateForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => userService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
    }
  });

  const filteredUsers = users?.filter((user: User) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
  };

  const handleCreate = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: any) => {
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data });
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      SUPERADMIN: 'bg-red-100 text-red-800',
      ADMIN: 'bg-blue-100 text-blue-800',
      USER: 'bg-green-100 text-green-800',
    };
    const labels = {
      SUPERADMIN: 'Superadmin',
      ADMIN: 'Admin',
      USER: 'User',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[role as keyof typeof colors]}`}>
        <Shield className="w-3 h-3 mr-1" />
        {labels[role as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Manajemen User</CardTitle>
              <CardDescription>
                Kelola akses user dan peran dalam sistem
              </CardDescription>
            </div>
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah User Baru</DialogTitle>
                  <DialogDescription>
                    Buat user baru dengan peran dan akses yang sesuai
                  </DialogDescription>
                </DialogHeader>
                <UserForm
                  onSubmit={handleCreate}
                  onCancel={() => setShowCreateForm(false)}
                  isLoading={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Search */}
      <div className="relative">
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Cari user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-gray-400">Memuat data...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? 'Tidak ada user yang ditemukan.' : 'Belum ada user.'}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredUsers.map((user: User) => (
                <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-gray-500 flex items-center space-x-4">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(user.createdAt).toLocaleDateString('id-ID')}
                          </span>
                          <span>{user._count.bpds} BPD</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getRoleBadge(user.role)}
                      <div className="flex space-x-2">
                        <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => handleEdit(user)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                              <DialogDescription>
                                Perbarui informasi user
                              </DialogDescription>
                            </DialogHeader>
                            <UserForm
                              initialData={editingUser}
                              onSubmit={handleUpdate}
                              onCancel={() => setEditingUser(null)}
                              isLoading={updateMutation.isPending}
                            />
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                          disabled={deleteMutation.isPending || user._count.bpds > 0}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  {user._count.bpds > 0 && (
                    <div className="mt-2 text-xs text-amber-600 flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      User memiliki data BPD dan tidak dapat dihapus
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface UserFormProps {
  initialData?: User | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function UserForm({ initialData, onSubmit, onCancel, isLoading }: UserFormProps) {
  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    password: '',
    role: initialData?.role || 'USER',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username) {
      alert('Username harus diisi');
      return;
    }

    if (!initialData && !formData.password) {
      alert('Password harus diisi untuk user baru');
      return;
    }

    const submitData = {
      username: formData.username,
      role: formData.role as 'SUPERADMIN' | 'ADMIN' | 'USER',
    };

    if (formData.password) {
      Object.assign(submitData, { password: formData.password });
    }

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Username
        </label>
        <Input
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="Masukkan username"
          required
        />
      </div>
      
      {!initialData && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Masukkan password"
            required
          />
        </div>
      )}

      {initialData && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password (kosongkan jika tidak ingin mengubah)
          </label>
          <Input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Masukkan password baru"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Role
        </label>
        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as 'SUPERADMIN' | 'ADMIN' | 'USER' })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="USER">User - Read Only</option>
          <option value="ADMIN">Admin - Input & Update</option>
          <option value="SUPERADMIN">Superadmin - Full Access</option>
        </select>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : (initialData ? 'Perbarui' : 'Buat')}
        </Button>
      </DialogFooter>
    </form>
  );
}
