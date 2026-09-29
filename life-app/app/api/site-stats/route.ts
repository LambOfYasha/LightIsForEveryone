import { NextResponse } from 'next/server';
import { defineQuery } from 'groq';
import { client } from '@/sanity/lib/client';
import { countBlogs } from '@/payload/lib/blogs/queries';

export async function GET() {
  try {
    // Define GROQ query for site statistics
    const siteStatsQuery = defineQuery(`
      {
        "totalQuestions": count(*[_type == "post" && (isDeleted == false || isDeleted == null)]),
        "totalTeachers": count(*[_type == "user" && role in ["teacher", "junior_teacher", "senior_teacher", "lead_teacher"]]),
        "totalBlogs": count(*[_type == "blog" && (isDeleted == false || isDeleted == null)]),
        "totalMembers": count(*[_type == "user" && (isDeleted == false || isDeleted == null)])
      }
    `);

    // Execute the query
    const stats = await client.fetch(siteStatsQuery);
    let totalBlogs = stats.totalBlogs || 0;
    try {
      totalBlogs = await countBlogs();
    } catch (error) {
      console.error('Payload blog count failed, leaving Sanity count:', error);
    }

    return NextResponse.json({
      totalQuestions: stats.totalQuestions || 0,
      totalTeachers: stats.totalTeachers || 0,
      totalBlogs,
      totalMembers: stats.totalMembers || 0
    });

  } catch (error) {
    console.error('Error fetching site stats:', error);
    
    // Return fallback stats if there's an error
    return NextResponse.json({
      totalQuestions: 1247,
      totalTeachers: 89,
      totalBlogs: 456,
      totalMembers: 3421
    });
  }
}
