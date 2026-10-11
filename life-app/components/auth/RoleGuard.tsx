'use client';

import { ReactNode } from 'react';
import { hasPermission, UserRole } from '@/lib/auth/roles';
import { useRole } from '@/hooks/useRole';

type PermissionType = 'canCreatePosts' | 'canComment' | 'canCreateCommunities' | 'canModerate' | 'canManageUsers' | 'canManageTeachers' | 'canAccessAdminPanel' | 'canManageBlogs' | 'canDeleteMembers' | 'canGiveTeacherApprovals' | 'canDeleteOtherContent';

interface RoleGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  permission?: PermissionType;
  fallback?: ReactNode;
}

export function RoleGuard({ 
  children, 
  requiredRole,
  allowedRoles,
  permission, 
  fallback = null 
}: RoleGuardProps) {
  const { user, loading, hasPermission: hasRolePermission, hasRoleOrHigher, isAuthenticated } = useRole();

  if (loading) {
    return null; // or a loading spinner
  }

  if (!isAuthenticated) {
    return fallback;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) return fallback;

  if (requiredRole && !hasRoleOrHigher(requiredRole)) {
    return fallback;
  }

  if (permission && !hasRolePermission(permission)) {
    return fallback;
  }

  return <>{children}</>;
}

interface PermissionGuardProps {
  children: ReactNode;
  permission: PermissionType;
  fallback?: ReactNode;
}

export function PermissionGuard({ children, permission, fallback = null }: PermissionGuardProps) {
  return (
    <RoleGuard permission={permission} fallback={fallback}>
      {children}
    </RoleGuard>
  );
} 