'use client';

import { Users, Shield } from 'lucide-react';
import { 
  getAllUsers, 
  updateUserRole, 
  toggleUserStatus, 
  deleteUser, 
  getUserStats,
  bulkUpdateUsers,
  updateUserProfile,
  createUser,
  type UserData,
  type UserFilters
} from '@/action/userActions';
import SharedManagement, { type ManagementConfig } from './shared-management';
import { useRole } from '@/hooks/useRole';

interface UserManagementProps {
  initialUsers?: UserData[];
}

export default function UserManagement({ initialUsers = [] }: UserManagementProps) {
  const { user: currentUser } = useRole();
  
  const config: ManagementConfig = {
    title: 'Users',
    icon: Users,
    dataType: 'users',
    roles: [
      { value: 'member', label: 'Member' },
      { value: 'junior_teacher', label: 'Junior Teacher' },
      { value: 'teacher', label: 'Teacher' },
      { value: 'senior_teacher', label: 'Senior Teacher' },
      { value: 'lead_teacher', label: 'Lead Teacher' },
      { value: 'dev', label: 'Dev' },
      { value: 'admin', label: 'Admin' }
    ],
    getRoleBadgeVariant: (role: string) => {
      switch (role) {
        case 'admin':
          return 'destructive';
        case 'lead_teacher':
          return 'default';
        case 'dev':
          return 'secondary';
        case 'senior_teacher':
          return 'outline';
        case 'junior_teacher':
          return 'outline';
        case 'teacher':
          return 'default';
        case 'member':
          return 'secondary';
        default:
          return 'outline';
      }
    },
    getStatusBadgeVariant: (user: UserData) => {
      if (user.isReported) return 'destructive';
      if (!user.isActive) return 'secondary';
      return 'default';
    },
    profileFields: [
      {
        key: 'bio',
        label: 'Bio',
        type: 'textarea' as const,
        placeholder: 'User biography...',
        description: 'A short biography displayed on the user\'s profile',
      },
      {
        key: 'youtubeChannelId',
        label: 'YouTube Channel ID',
        type: 'text' as const,
        placeholder: 'UCxxxxxxxxxxxxxxxxxxxxxxxx',
        description: 'The YouTube channel ID for ministry channel (only applicable for teachers)',
        visibleWhen: (item: any) => ['teacher', 'junior_teacher', 'senior_teacher', 'lead_teacher'].includes(item.role),
      },
    ],
    createFields: [
      {
        key: 'username',
        label: 'Username',
        type: 'text' as const,
        placeholder: 'Enter username',
        required: true,
      },
      {
        key: 'email',
        label: 'Email',
        type: 'text' as const,
        placeholder: 'user@example.com',
        required: true,
      },
      {
        key: 'role',
        label: 'Role',
        type: 'select' as const,
        placeholder: 'Select role',
        required: true,
        options: [
          { value: 'member', label: 'Member' },
          { value: 'junior_teacher', label: 'Junior Teacher' },
          { value: 'teacher', label: 'Teacher' },
          { value: 'senior_teacher', label: 'Senior Teacher' },
          { value: 'lead_teacher', label: 'Lead Teacher' },
          { value: 'dev', label: 'Dev' },
          { value: 'admin', label: 'Admin' },
        ],
      },
      {
        key: 'bio',
        label: 'Bio',
        type: 'textarea' as const,
        placeholder: 'User biography...',
      },
      {
        key: 'imageURL',
        label: 'Profile Image URL',
        type: 'text' as const,
        placeholder: 'https://example.com/photo.jpg',
      },
    ],
    loadData: getAllUsers,
    updateRole: async (id: string, role: string) => {
      if (role === 'admin' || role === 'dev' || role === 'lead_teacher' || role === 'member' || role === 'moderator' || role === 'teacher' || role === 'junior_teacher' || role === 'senior_teacher') return updateUserRole(id, role);
      return { success: false, error: 'Invalid role' };
    },
    toggleStatus: toggleUserStatus,
    deleteItem: async (userId: string) => {
      // Check if current user is senior teacher and target user is not a member
      if (currentUser?.role === 'senior_teacher') {
        // Get the user data to check their role
        const userData = await getAllUsers({ limit: 1000 });
        if (userData.success) {
          const targetUser = userData.users.find((u: UserData) => u._id === userId);
          if (targetUser && targetUser.role !== 'member') {
            return { success: false, error: 'Senior teachers can only delete members' };
          }
        }
      }
      
      return deleteUser(userId);
    },
    bulkUpdate: bulkUpdateUsers,
    updateProfile: updateUserProfile,
    createItem: createUser,
  };

  return (
    <SharedManagement 
      config={config}
      initialData={initialUsers}
    />
  );
} 