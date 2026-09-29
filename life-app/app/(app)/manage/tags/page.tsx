'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Tag as TagIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, parseISO } from 'date-fns';

interface Tag {
  _id: string;
  name: string;
  slug: string;
  color: string;
  description?: string;
  createdAt?: string;
}

const colorOptions = [
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
  { value: 'red', label: 'Red' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'purple', label: 'Purple' },
  { value: 'orange', label: 'Orange' },
  { value: 'white', label: 'White' },
  { value: 'gray', label: 'Gray' },
];

const colorClasses = {
  blue: {
    swatch: 'bg-blue-500 border-blue-500',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  green: {
    swatch: 'bg-green-500 border-green-500',
    badge: 'bg-green-100 text-green-800 border-green-200',
  },
  red: {
    swatch: 'bg-red-500 border-red-500',
    badge: 'bg-red-100 text-red-800 border-red-200',
  },
  yellow: {
    swatch: 'bg-yellow-400 border-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  purple: {
    swatch: 'bg-purple-500 border-purple-500',
    badge: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  orange: {
    swatch: 'bg-orange-500 border-orange-500',
    badge: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  pink: {
    swatch: 'bg-pink-500 border-pink-500',
    badge: 'bg-pink-100 text-pink-800 border-pink-200',
  },
  white: {
    swatch: 'bg-white border-gray-300',
    badge: 'bg-white text-gray-800 border-gray-300',
  },
  gray: {
    swatch: 'bg-gray-500 border-gray-500',
    badge: 'bg-gray-100 text-gray-800 border-gray-200',
  },
} as const;

const getColorClasses = (value: string) =>
  colorClasses[value as keyof typeof colorClasses] ?? colorClasses.blue;

export default function TagsManagementPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('blue');

  const { toast } = useToast();

  // Helper function to format dates safely
  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return 'Unknown date';
    }

    try {
      return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
    } catch (error) {
      // Fallback to basic date formatting
      try {
        return new Date(dateString).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      } catch {
        return 'Unknown date';
      }
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      const data = await response.json();
      if (data.tags) {
        setTags(data.tags);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tags",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Tag name is required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          color,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Tag created successfully",
        });
        setCreateDialogOpen(false);
        resetForm();
        fetchTags();
      } else {
        throw new Error(data.error || 'Failed to create tag');
      }
    } catch (error) {
      console.error('Failed to create tag:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create tag",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag || !name.trim()) {
      toast({
        title: "Error",
        description: "Tag name is required",
        variant: "destructive",
      });
      return;
    }

    setIsEditing(true);
    try {
      const response = await fetch(`/api/tags/${editingTag._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          color,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Tag updated successfully",
        });
        setEditDialogOpen(false);
        resetForm();
        fetchTags();
      } else {
        throw new Error(data.error || 'Failed to update tag');
      }
    } catch (error) {
      console.error('Failed to update tag:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update tag",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/tags/${tagId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Tag deleted successfully",
        });
        fetchTags();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete tag');
      }
    } catch (error) {
      console.error('Failed to delete tag:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete tag",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setColor('blue');
    setEditingTag(null);
  };

  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag);
    setName(tag.name);
    setDescription(tag.description || '');
    setColor(tag.color);
    setEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">Loading tags...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Tag Management</h1>
            <p >Create and manage tags for blog posts</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Create Tag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Tag</DialogTitle>
                <DialogDescription>
                  Create a new tag to categorize blog posts.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTag} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tag Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter tag name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter tag description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Select value={color} onValueChange={setColor}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border ${getColorClasses(option.value).swatch}`} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Tag"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <Card key={tag._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TagIcon className="w-4 h-4" />
                    <CardTitle className="text-lg">{tag.name}</CardTitle>
                  </div>
                  <Badge
                    variant="secondary"
                    className={getColorClasses(tag.color).badge}
                  >
                    {tag.color}
                  </Badge>
                </div>
                {tag.description && (
                  <CardDescription>{tag.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span>Slug: {tag.slug}</span>
                  <span>Created: {formatDate(tag.createdAt || (tag as any)._createdAt)}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(tag)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteTag(tag._id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {tags.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <TagIcon className="w-12 h-12  mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tags found</h3>
              <p>
                Create your first tag to start categorizing blog posts
              </p>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
              <DialogDescription>
                Update the tag information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditTag} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Tag Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter tag name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description (Optional)</Label>
                <Input
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter tag description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full border ${getColorClasses(option.value).swatch}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isEditing}>
                  {isEditing ? "Updating..." : "Update Tag"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 