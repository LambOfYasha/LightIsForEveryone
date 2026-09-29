import { notFound } from 'next/navigation';
import { getBlogsByTag } from '@/sanity/lib/blogs/getBlogsByTag';
import { getTagInfo } from '@/payload/lib/tags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TagList } from '@/components/ui/tag';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

interface TagPageProps {
  params: {
    slug: string;
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const { slug } = params;
  
  try {
    const [blogs, tagInfo] = await Promise.all([
      getBlogsByTag(slug),
      getTagInfo(slug)
    ]);

    if (!tagInfo) {
      notFound();
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Blogs tagged with "{tagInfo.name}"
          </h1>
          {tagInfo.description && (
            <p className="text-gray-600 mb-4">{tagInfo.description}</p>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{blogs.length} blog{blogs.length !== 1 ? 's' : ''} found</span>
            <span>•</span>
            <span>Created {formatDistanceToNow(new Date(tagInfo.createdAt), { addSuffix: true })}</span>
          </div>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-600 mb-2">
              No blogs found with this tag
            </h2>
            <p className="text-gray-500">
              Try browsing our other tags or check back later for new content.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <Card key={blog._id} className="hover:shadow-lg transition-shadow">
                <Link href={`/blogs/${blog.slug}`}>
                  {blog.image && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={blog.imageUrl || blog.image?.url || blog.image?.asset?.url || ''}
                        alt={blog.image.alt || blog.title}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {blog.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>By {blog.author.username}</span>
                      <span>{formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
                    </div>
                    {blog.tags && blog.tags.length > 0 && (
                      <TagList tags={blog.tags} size="sm" />
                    )}
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Error fetching tag data:', error);
    notFound();
  }
} 