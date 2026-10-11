import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { assignRole } from '@/lib/auth/assignRole';
import { getCurrentUser } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const user = await getCurrentUser();
    
    // Check if user has permission to assign roles (Senior Teachers and up)
    if (!user || !user.role || !['senior_teacher', 'lead_teacher', 'dev', 'admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions to assign roles' }, 
        { status: 403 }
      );
    }
    
    const { userId, role } = await request.json();
    
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'User ID and role are required' }, 
        { status: 400 }
      );
    }

    // Validate that the role is a valid UserRole
    const validRoles = ['member', 'moderator', 'admin', 'teacher', 'junior_teacher', 'senior_teacher', 'lead_teacher', 'dev'] as const;
    if (!validRoles.includes(role as any)) {
      return NextResponse.json(
        { error: 'Invalid role provided' }, 
        { status: 400 }
      );
    }

    // Role assignment restrictions based on user's role
    if (user.role === 'senior_teacher') {
      // Senior teachers can only assign up to teacher roles
      if (['admin', 'lead_teacher', 'dev'].includes(role)) {
        return NextResponse.json(
          { error: 'Senior teachers can only assign up to teacher roles' }, 
          { status: 403 }
        );
      }
    } else if (user.role === 'dev') {
      // Devs can assign up to senior teacher roles
      if (['admin', 'lead_teacher'].includes(role)) {
        return NextResponse.json(
          { error: 'Developers can only assign up to senior teacher roles' }, 
          { status: 403 }
        );
      }
    }
    // Lead teachers and admins can assign any role

    const updatedUser = await assignRole(userId, role as 'member' | 'moderator' | 'admin' | 'teacher' | 'junior_teacher' | 'senior_teacher' | 'lead_teacher' | 'dev');
    
    return NextResponse.json({ 
      success: true, 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error assigning role:', error);
    return NextResponse.json(
      { error: 'Failed to assign role' }, 
      { status: 500 }
    );
  }
} 