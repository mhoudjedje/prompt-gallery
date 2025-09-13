'use client';

import { useState } from 'react';
import ActionButton from './ActionButton';

interface DangerZoneProps {
  onDeleteAccount: () => void;
}

export default function DangerZone({ onDeleteAccount }: DangerZoneProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    onDeleteAccount();
    setIsDeleting(false);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
      <h2 className="text-lg font-semibold text-red-900 mb-6">Danger Zone</h2>
      
      <div className="space-y-4">
        {!showConfirm ? (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Delete Account
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <div className="w-full">
              <ActionButton 
                onClick={handleDeleteClick} 
                variant="danger" 
                size="lg"
              >
                Delete Account
              </ActionButton>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-900 mb-2">
              Are you absolutely sure?
            </h3>
            <p className="text-sm text-red-700 mb-4">
              This action cannot be undone. This will permanently delete your account 
              and remove all your data from our servers.
            </p>
            <div className="flex space-x-3">
              <div className="flex-1">
                <ActionButton 
                  onClick={handleConfirmDelete} 
                  variant="danger" 
                  size="md"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                </ActionButton>
              </div>
              <div className="flex-1">
                <ActionButton 
                  onClick={handleCancel} 
                  variant="secondary" 
                  size="md"
                  disabled={isDeleting}
                >
                  Cancel
                </ActionButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
