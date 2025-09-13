'use client';

import { useState } from 'react';
import ToggleSwitch from './ToggleSwitch';
import ActionButton from './ActionButton';

interface SecurityCardProps {
  twoFactorEnabled: boolean;
  onPasswordChange: () => void;
  onTwoFactorToggle: (enabled: boolean) => void;
}

export default function SecurityCard({ 
  twoFactorEnabled, 
  onPasswordChange, 
  onTwoFactorToggle 
}: SecurityCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleTwoFactorToggle = async (enabled: boolean) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    onTwoFactorToggle(enabled);
    setIsLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Security</h2>
      
      <div className="space-y-6">
        {/* Change Password */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Password</h3>
            <p className="text-sm text-gray-500">Last updated 3 months ago</p>
          </div>
          <ActionButton onClick={onPasswordChange} variant="secondary" size="sm">
            Change password
          </ActionButton>
        </div>

        {/* Two-Factor Authentication */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">Two-factor authentication</h3>
            <p className="text-sm text-gray-500">
              Add an extra layer of security to your account
            </p>
          </div>
          <div className="ml-4">
            <ToggleSwitch
              enabled={twoFactorEnabled}
              onChange={handleTwoFactorToggle}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Security Tips */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Security Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use a strong, unique password</li>
            <li>• Enable two-factor authentication</li>
            <li>• Log out from shared devices</li>
            <li>• Review connected accounts regularly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
