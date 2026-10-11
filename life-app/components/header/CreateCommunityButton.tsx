'use client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import React, { useState, useRef, useTransition } from 'react'
import { useUser } from '@clerk/nextjs' 
import { Input } from "../ui/input"
import ClientRichEditor from "../ui/client-rich-editor"
import { ImageIcon, Plus, X, MessageCircle } from "lucide-react"
import Image from "next/image"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { createCommunityQuestion } from "@/action/createCommunityQuestion"
import { useRouter } from "next/navigation"
import { useModeration } from "@/hooks/useModeration"
import { ModerationFeedback } from "@/components/ui/moderation-feedback"
import GuestCreateCommunityButton from "../community/GuestCreateCommunityButton"
import { richTextContentToPlainText } from "@/lib/utils"

function CreateCommunityButton() {

  const { user, isSignedIn } = useUser()
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [description, setDescription] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Initialize moderation for community question content
  const {
    content: moderatedContent,
    updateContent: updateModeratedContent,
    moderationState,
    checkModeration,
    clearModeration,
    getModerationFeedback,
    canSubmit
  } = useModeration({
    contentType: 'post',
    debounceMs: 1500,
    autoCheck: true
  });

  // Update moderated content when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setName(value)
    
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value))
    }
    
    // Check both name and description together
    updateModeratedContent(`${richTextContentToPlainText(value)}\n\n${richTextContentToPlainText(description)}`);
  }

  // Update moderated content when description changes
  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    // Check both name and description together
    updateModeratedContent(`${name}\n\n${richTextContentToPlainText(newDescription)}`);
  };

const generateSlug = (text: string) => {
  return text.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, "").slice(0, 21)
}

const removeImage = () => {
  setImagePreview(null)
  setImageFile(null)
  if (fileInputRef.current) {
    fileInputRef.current.value = ""
  }
}

const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  
  if (file) {
    setImageFile(file)
    const reader = new FileReader()
reader.onload = () => {
  const result = reader.result as string
  setImagePreview(result)
} 
reader.readAsDataURL(file)
}
}

const resetForm = () => {
  setName("")
  setSlug("")
  setDescription("")
  setImagePreview(null)
  setImageFile(null)
  setErrorMessage("")
  clearModeration()
  if (fileInputRef.current) {
    fileInputRef.current.value = ""
  }
}

const handleCreateCommunity = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()

  const normalizedDescription = richTextContentToPlainText(description)
  
  if (!user) {
    setErrorMessage("You must be signed in to create a community question.")
    return
  }

  if (!name.trim() || !slug.trim() || !normalizedDescription.trim()) {
    setErrorMessage("Title, slug, and question content are required.")
    return
  }

  if (!canSubmit) {
    setErrorMessage("Please wait for content moderation to complete.")
    return
  }

  startTransition(async () => {
    try {
      // Pass imageFile as undefined if not present, and as a string (URL) if needed
      // But createCommunityQuestion expects string | null | undefined for image
      // If imageFile is a File, you need to upload it first and get a URL or asset ref
      // For now, pass undefined if no image, or handle upload here if needed
      const image: string | null | undefined = undefined
      if (imageFile instanceof File) {
        // You need to upload the file and get a URL or asset ref string
        // For now, just set image to undefined (or handle upload logic here)
        // image = await uploadImageAndGetUrl(imageFile)
        setErrorMessage("Image upload not implemented.")
        return
      }
      const result = await createCommunityQuestion({
        name,
        slug,
        description: normalizedDescription.slice(0, 300),
        content: description.trim(),
      })
      
      if ("createdCommunity" in result) {
        setOpen(false)
        resetForm()
        router.push(`/community-questions/${slug}`)
      } else {
        setErrorMessage(result.error || "Failed to create community question.")
      }
    } catch (error) {
      console.error("Error creating community question:", error)
      setErrorMessage("An unexpected error occurred. Please try again.")
    }
  })
}

  // If user is not signed in, show the guest community creation button
  if (!isSignedIn) {
    return <GuestCreateCommunityButton />
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="w-full p-2 pl-5 flex items-center rounded-md 
        cursor-pointer bg-primary text-primary-foreground 
        hover:bg-primary/90 transition-all duration-200">
          <MessageCircle className="mr-2 h-4 w-4" />
          <span>Ask a Question</span>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ask a Question</DialogTitle>
          <DialogDescription>
            Ask a question to get help from the community.
          </DialogDescription>

      <form onSubmit={handleCreateCommunity} className="space-y-4 mt-2">
        {errorMessage && (
          <div className="text-red-500 text-sm">{errorMessage}</div>
        )}

        <div className="space-y-2">
          <label htmlFor="question" className="text-sm font-medium">
            Title
          </label>
          <Input 
          id="question" 
          placeholder="What is your question title?"
          className="w-full focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={handleNameChange}
          required
          minLength={3}
          maxLength={21} 
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">
            Community Slug (URL)
          </label>
          <Input 
          id="slug" 
          placeholder="Enter a unique slug for your question"
          className="w-full focus:ring-2 focus:ring-blue-500"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          minLength={3}
          maxLength={21} 
          pattern="[a-z0-9-]*"
          title="Lowercase letters, numbers, and hyphens only"
          />
          <p className="text-sm text-muted-foreground">
            This will be used in the URL: shama.com/community-questions/{slug || "community-slug"}
          </p>
        </div>
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Question
          </label>
          <ClientRichEditor
          content={description}
          onChange={handleDescriptionChange}
          placeholder="Ask your question here"
          maxHeight="300px"
          />
          
          {/* Moderation Feedback */}
          {(name.trim() || description.trim()) && (
            <div className="mt-3">
              <ModerationFeedback
                isChecking={moderationState.isChecking}
                result={moderationState.result}
                error={moderationState.error}
                showDetails={true}
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Community Image (Optional)
            </Label>

            {imagePreview ? (
              <div className="relative w-24 h-24 mx-auto">
              <Image 
              src={imagePreview}
              alt="Community Preview"
              fill
              className="object-cover rounded-full"
              />
              <button 
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <Label htmlFor="community-image" className="flex flex-col items-center justify-center w-full
                h-24 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                  <div className="flex flex-col items-center justify-center">
                    <ImageIcon className="w-6 h-6 mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Click to upload image
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 5MB • JPEG, PNG, WebP, GIF
                    </p>
                  </div>
                  <input 
                  id="community-image"
                  name="community-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                  className="hidden" />
                </Label>
                </div>
            )}
            </div>

            <Button 
              type="submit" 
              className="w-full  font-medium py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={isPending || !user || !canSubmit}
            >
              {isPending ? "Creating..." : "Create Question"}
            </Button>
      </form>
    </DialogHeader>
  </DialogContent>
</Dialog>  )
}

export default CreateCommunityButton