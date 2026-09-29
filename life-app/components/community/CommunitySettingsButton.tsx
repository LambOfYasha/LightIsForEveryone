'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Edit, Users, Shield, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

interface CommunitySettingsButtonProps {
  communityId: string;
  communitySlug: string;
  communityTitle: string;
  isModerator: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "secondary" | "ghost";
}

export default function CommunitySettingsButton({ 
  communityId, 
  communitySlug, 
  communityTitle,
  isModerator,
  size = "sm",
  variant = "outline"
}: CommunitySettingsButtonProps) {
  const [open, setOpen] = useState(false);

  if (!isModerator) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={size} variant={variant}>
          <Settings className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/community-questions/${communitySlug}`}>
            <Edit className="w-4 h-4 mr-2" />
            View Community
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href={`/manage/communities/${communityId}`}>
            <Shield className="w-4 h-4 mr-2" />
            Manage Community
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link href={`/manage/communities/${communityId}/members`}>
            <Users className="w-4 h-4 mr-2" />
            Manage Members
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link href={`/manage/communities/${communityId}/moderation`}>
            <Shield className="w-4 h-4 mr-2" />
            Moderation Tools
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 