'use client';

import { Card } from '@/components/ui/Card';
import { Settings, Bell, Lock, Palette, Globe } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1 text-sm md:text-base">Manage your application preferences</p>
      </div>

      <div className="grid gap-4 md:gap-6">
        {/* Notifications */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm md:text-base">Email Notifications</p>
                <p className="text-xs md:text-sm text-gray-600">Receive email updates about your workspaces</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm md:text-base">Task Updates</p>
                <p className="text-xs md:text-sm text-gray-600">Get notified when tasks are assigned to you</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 text-sm md:text-base">Milestone Reminders</p>
                <p className="text-xs md:text-sm text-gray-600">Reminders for upcoming milestone deadlines</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Lock className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Privacy & Security</h3>
          </div>
          
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-left">
              <div>
                <p className="font-medium text-gray-900 text-sm md:text-base">Change Password</p>
                <p className="text-xs md:text-sm text-gray-600">Update your account password</p>
              </div>
              <span className="text-blue-600 text-sm">Change</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-left">
              <div>
                <p className="font-medium text-gray-900 text-sm md:text-base">Two-Factor Authentication</p>
                <p className="text-xs md:text-sm text-gray-600">Add an extra layer of security</p>
              </div>
              <span className="text-gray-500 text-sm">Coming Soon</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition text-left">
              <div>
                <p className="font-medium text-gray-900 text-sm md:text-base">Active Sessions</p>
                <p className="text-xs md:text-sm text-gray-600">Manage your active login sessions</p>
              </div>
              <span className="text-blue-600 text-sm">View</span>
            </button>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Appearance</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button className="p-3 border-2 border-blue-600 rounded-lg bg-white text-center">
                  <p className="text-sm font-medium text-gray-900">Light</p>
                </button>
                <button className="p-3 border-2 border-gray-200 rounded-lg bg-gray-800 text-center">
                  <p className="text-sm font-medium text-white">Dark</p>
                </button>
                <button className="p-3 border-2 border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-800 text-center">
                  <p className="text-sm font-medium text-gray-900">Auto</p>
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Language & Region */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Globe className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900">Language & Region</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900">
                <option>English (US)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900">
                <option>UTC-8 (Pacific Time)</option>
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC+0 (GMT)</option>
                <option>UTC+5:30 (India)</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
