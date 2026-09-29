import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/sanity/lib/adminClient';
import { client } from '@/sanity/lib/client';
import {
  type AdminSettings,
  DEFAULT_ADMIN_SETTINGS,
  canManageAdminSettings,
  canReadAdminSettings,
  getClientSafeAdminSettings,
} from '@/lib/admin-settings';
import { getUser } from '@/lib/user/getUser';
import { isAdmin } from '@/lib/auth/roles';
import { getMaintenanceMode, setMaintenanceMode } from '@/payload/lib/pages';

interface PersistedAdminSettingsDocument extends AdminSettings {
  _id: string;
}

export async function GET(request: NextRequest) {
  try {
    console.log("=== ADMIN SETTINGS API CALLED ===");

    const user = await getUser();

    // Check for authentication error
    if ("error" in user) {
      console.error("Authentication error:", user.error);
      return NextResponse.json({ error: user.error }, { status: 401 });
    }

    if (!user || !user._id) {
      console.error("User not found or missing ID");
      return NextResponse.json({ error: 'User authentication failed' }, { status: 401 });
    }

    if (!canReadAdminSettings(user.role)) {
      console.error("User does not have settings access:", user.role);
      return NextResponse.json({ error: 'Settings access required' }, { status: 403 });
    }

    // Get settings from Sanity (or return default settings)
    const settingsQuery = `*[_type == "adminSettings"][0]`;
    const settings = await client.fetch<PersistedAdminSettingsDocument | null>(settingsQuery);
    const safe = getClientSafeAdminSettings(settings);
    safe.maintenanceMode = await getMaintenanceMode();

    return NextResponse.json({
      success: true,
      settings: safe
    });

  } catch (error) {
    console.error('Error fetching admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin settings' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUser();

    // Check for authentication error
    if ("error" in user) {
      console.error("Authentication error:", user.error);
      return NextResponse.json({ error: user.error }, { status: 401 });
    }

    if (!user || !user._id) {
      console.error("User not found or missing ID");
      return NextResponse.json({ error: 'User authentication failed' }, { status: 401 });
    }

    if (!canManageAdminSettings(user.role)) {
      console.error("User does not have settings management role:", user.role);
      return NextResponse.json({ error: 'Admin or developer access required' }, { status: 403 });
    }

    const body = await request.json();
    const { section, settings } = body;

    if (!section || !settings) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get existing settings
    const existingSettingsQuery = `*[_type == "adminSettings"][0]`;
    const existingSettings = await client.fetch<PersistedAdminSettingsDocument | null>(existingSettingsQuery);
    const normalizedSettings =
      section === 'email' &&
      existingSettings?.smtpPassword &&
      typeof settings.smtpPassword === 'string' &&
      !settings.smtpPassword.trim()
        ? { ...settings, smtpPassword: existingSettings.smtpPassword }
        : settings;

    let updatedSettings: PersistedAdminSettingsDocument;
    if (existingSettings) {
      // Update existing settings
      const committedSettings = await adminClient
        .patch(existingSettings._id)
        .set({
          ...existingSettings,
          ...normalizedSettings,
          updatedAt: new Date().toISOString(),
          updatedBy: {
            _type: 'reference',
            _ref: user._id
          }
        })
        .commit();

      updatedSettings = committedSettings as unknown as PersistedAdminSettingsDocument;
    } else {
      // Create new settings document
      const createdSettings = await adminClient.create({
        _type: 'adminSettings',
        ...DEFAULT_ADMIN_SETTINGS,
        ...normalizedSettings,
        createdAt: new Date().toISOString(),
        createdBy: {
          _type: 'reference',
          _ref: user._id
        },
        updatedAt: new Date().toISOString(),
        updatedBy: {
          _type: 'reference',
          _ref: user._id
        }
      });

      updatedSettings = createdSettings as unknown as PersistedAdminSettingsDocument;
    }

    if (typeof normalizedSettings.maintenanceMode === 'boolean') {
      await setMaintenanceMode(normalizedSettings.maintenanceMode);
      updatedSettings = { ...updatedSettings, maintenanceMode: normalizedSettings.maintenanceMode };
    }

    console.log("Settings updated:", section);

    return NextResponse.json({
      success: true,
      settings: getClientSafeAdminSettings(updatedSettings)
    });

  } catch (error) {
    console.error('Error updating admin settings:', error);
    return NextResponse.json(
      { error: 'Failed to update admin settings' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    
    // Check for authentication error
    if ("error" in user) {
      console.error("Authentication error:", user.error);
      return NextResponse.json({ error: user.error }, { status: 401 });
    }

    // Check if user exists
    if (!user || !user._id) {
      console.error("User not found or missing ID");
      return NextResponse.json({ error: 'User authentication failed' }, { status: 401 });
    }

    // Check if user has admin role (only admins can delete the app)
    if (!isAdmin(user.role)) {
      console.error("User does not have admin role:", user.role);
      return NextResponse.json({ error: 'Admin access required for app deletion' }, { status: 403 });
    }

    const body = await request.json();
    const { confirmation } = body;

    if (confirmation !== 'DELETE') {
      return NextResponse.json({ error: 'Invalid confirmation code' }, { status: 400 });
    }

    // This is a very dangerous operation - in a real app, you'd want additional safeguards
    console.log("APP DELETION INITIATED BY ADMIN:", user.username);

    // In a real implementation, you would:
    // 1. Create a backup
    // 2. Notify all users
    // 3. Gradually shut down services
    // 4. Delete all data
    // 5. Shut down the application

    return NextResponse.json({
      success: true,
      message: 'App deletion process initiated. This action cannot be undone.'
    });

  } catch (error) {
    console.error('Error in app deletion:', error);
    return NextResponse.json(
      { error: 'Failed to initiate app deletion' },
      { status: 500 }
    );
  }
}