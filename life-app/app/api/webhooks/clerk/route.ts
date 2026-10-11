import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { addUser } from '@/lib/user/addUser';

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  
  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;
    
    try {
      console.log('Creating user in Sanity:', id);
      
      // Get the primary email
      const primaryEmail = email_addresses?.find(email => email.id === evt.data.primary_email_address_id);
      const email = primaryEmail?.email_address || email_addresses?.[0]?.email_address || '';
      
      // Create username from name or email
      const fullName = `${first_name || ''} ${last_name || ''}`.trim();
      const username = fullName || email.split('@')[0];
      
      // Create user in Sanity
      await addUser({
        id,
        username,
        imageURL: image_url || '',
        email,
        role: 'member', // Default role
      });
      
      console.log('User created successfully in Sanity:', id);
    } catch (error) {
      console.error('Error creating user in Sanity:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
} 