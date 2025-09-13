'use client';

import { useState } from 'react';
import ToggleSwitch from './ToggleSwitch';

interface NotificationsCardProps {
  newsletterEnabled: boolean;
  onNewsletterToggle: (enabled: boolean) => void;
}

export default function NotificationsCard({ 
  newsletterEnabled, 
  onNewsletterToggle 
}: NotificationsCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleNewsletterToggle = async (enabled: boolean) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    onNewsletterToggle(enabled);
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Notifications</h2>
      
      <div className="space-y-4">
        {/* Newsletter Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              Receive newsletters, promotions, updates
            </h3>
            <p className="text-sm text-gray-500">
              Get notified about new features, tips, and special offers
            </p>
          </div>
          <div className="ml-4">
            <ToggleSwitch
              enabled={newsletterEnabled}
              onChange={handleNewsletterToggle}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Additional notification preferences can be added here */}
        <div className="border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-500">
            More notification preferences coming soon
          </div>
        </div>
      </div>
    </div>
  );
}
