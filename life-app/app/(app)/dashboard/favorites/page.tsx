import { getUserFavoritesAction } from "@/action/embeddedCommentActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Heart, 
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import FavoritesClient from "./favorites-client";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';

export default async function FavoritesPage() {
  const favoritesResult = await getUserFavoritesAction();
  const favorites = favoritesResult.favorites || [];
  
  if (favoritesResult.error) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold mb-2">Unable to Load Favorites</h2>
            <p className="text-muted-foreground mb-4">{favoritesResult.error}</p>
            <Button asChild><Link href="/dashboard/favorites">Try Again</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
                <p className="text-muted-foreground">Posts you've saved for later</p>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {favorites.length} favorites
            </Badge>
          </div>
        </div>

        {/* Favorites List */}
        <FavoritesClient initialFavorites={favorites} />
      </div>
    </div>
  );
} 