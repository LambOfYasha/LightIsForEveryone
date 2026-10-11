'use client';

import { useState } from 'react';
import type { CustomGuideline } from '@/lib/ai/customGuidelines';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Save, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GuidelineFormProps {
  guideline?: Partial<CustomGuideline>;
  onSave: (guideline: any) => Promise<void>;
  onCancel: () => void;
}

export default function GuidelineForm({ guideline, onSave, onCancel }: GuidelineFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: guideline?.name || '',
    description: guideline?.description || '',
    category: String(guideline?.category || 'spam'),
    severity: String(guideline?.severity || 'medium'),
    keywords: guideline?.keywords || [],
    patterns: guideline?.patterns || [],
    conditions: {
      contentType: String(guideline?.conditions?.contentType || 'post'),
      userRole: String(guideline?.conditions?.userRole || 'user'),
      contentLength: {
        min: guideline?.conditions?.contentLength?.min || 10,
        max: guideline?.conditions?.contentLength?.max || 1000
      }
    },
    actions: {
      suggestedAction: String(guideline?.actions?.suggestedAction || 'flag'),
      confidenceThreshold: guideline?.actions?.confidenceThreshold || 0.7,
      customMessage: guideline?.actions?.customMessage || '',
      requireReview: guideline?.actions?.requireReview || true
    },
    priority: guideline?.priority || 5,
    isActive: guideline?.isActive ?? true
  });

  const [newKeyword, setNewKeyword] = useState('');
  const [newPattern, setNewPattern] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave(formData);
      toast({
        title: guideline ? 'Guideline Updated' : 'Guideline Created',
        description: guideline ? 'Your guideline has been updated successfully.' : 'Your guideline has been created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save guideline. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !formData.keywords.includes(newKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const addPattern = () => {
    if (newPattern.trim() && !formData.patterns.includes(newPattern.trim())) {
      setFormData(prev => ({
        ...prev,
        patterns: [...prev.patterns, newPattern.trim()]
      }));
      setNewPattern('');
    }
  };

  const removePattern = (pattern: string) => {
    setFormData(prev => ({
      ...prev,
      patterns: prev.patterns.filter(p => p !== pattern)
    }));
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="w-5 h-5" />
          {guideline ? 'Edit Guideline' : 'Create New Guideline'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Guideline Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Spam Detection"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this guideline detects"
                required
              />
            </div>
          </div>

          {/* Category and Severity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="language">Language</SelectItem>
                  <SelectItem value="behavior">Behavior</SelectItem>
                  <SelectItem value="content">Content</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={formData.severity} onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          {/* Keywords */}
          <div>
            <Label>Keywords</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
              />
              <Button type="button" onClick={addKeyword} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {keyword}
                  <button
                    type="button"
                    onClick={() => removeKeyword(keyword)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Patterns */}
          <div>
            <Label>Regex Patterns</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                placeholder="Add regex pattern..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPattern())}
              />
              <Button type="button" onClick={addPattern} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.patterns.map((pattern, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {pattern}
                  <button
                    type="button"
                    onClick={() => removePattern(pattern)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="contentType">Content Type</Label>
              <Select value={formData.conditions.contentType} onValueChange={(value) => setFormData(prev => ({ ...prev, conditions: { ...prev.conditions, contentType: value } }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="response">Response</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="blog">Blog</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="userRole">User Role</Label>
              <Select value={formData.conditions.userRole} onValueChange={(value) => setFormData(prev => ({ ...prev, conditions: { ...prev.conditions, userRole: value } }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="contentLength">Content Length</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={formData.conditions.contentLength.min}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    conditions: { 
                      ...prev.conditions, 
                      contentLength: { ...prev.conditions.contentLength, min: parseInt(e.target.value) || 0 }
                    } 
                  }))}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={formData.conditions.contentLength.max}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    conditions: { 
                      ...prev.conditions, 
                      contentLength: { ...prev.conditions.contentLength, max: parseInt(e.target.value) || 1000 }
                    } 
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="suggestedAction">Suggested Action</Label>
              <Select value={formData.actions.suggestedAction} onValueChange={(value) => setFormData(prev => ({ ...prev, actions: { ...prev.actions, suggestedAction: value } }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allow">Allow</SelectItem>
                  <SelectItem value="flag">Flag</SelectItem>
                  <SelectItem value="block">Block</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="confidenceThreshold">Confidence Threshold</Label>
              <Input
                id="confidenceThreshold"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={formData.actions.confidenceThreshold}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  actions: { ...prev.actions, confidenceThreshold: parseFloat(e.target.value) }
                }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="customMessage">Custom Message</Label>
            <Textarea
              id="customMessage"
              value={formData.actions.customMessage}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                actions: { ...prev.actions, customMessage: e.target.value }
              }))}
              placeholder="Custom message to show when this guideline is triggered"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : (guideline ? 'Update Guideline' : 'Create Guideline')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 