import { getTags } from '@/payload/lib/tags';
import { TagList } from '@/components/ui/tag';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default async function TagsPage() {
  const tags = await getTags();

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">All Tags</h1>
        <p className="text-sm sm:text-base text-gray-600">
          Browse all available tags to discover content by topic
        </p>
      </div>

      {tags.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-600 mb-1 sm:mb-2">
            No tags available
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            Tags will appear here once they are created.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => {
            // Ensure we have a valid slug
            const tagSlug = tag.slug || tag.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') || 'unknown';
            

            
            return (
              <Card key={tag._id} className="hover:shadow-lg transition-shadow">
                <Link href={`/tags/${tagSlug}`}>
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base sm:text-lg">{tag.name}</CardTitle>
                      <Badge 
                        variant="secondary"
                        className={`bg-${tag.color}-100 text-${tag.color}-800 border-${tag.color}-200 text-xs sm:text-sm`}
                      >
                        {tag.color}
                      </Badge>
                    </div>
                    {tag.description && (
                      <CardDescription className="line-clamp-2 text-sm">
                        {tag.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500">
                      <span>Click to view related blogs</span>
                      <span>→</span>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
} 