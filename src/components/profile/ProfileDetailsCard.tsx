'use client';

import { useState } from 'react';
import ActionButton from './ActionButton';

interface ProfileDetailsCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
  onNameChange: (newName: string) => void;
  onAvatarChange: () => void;
  onAvatarRemove: () => void;
}

export default function ProfileDetailsCard({
  name,
  email,
  avatarUrl,
  onNameChange,
  onAvatarChange,
  onAvatarRemove
}: ProfileDetailsCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);

  const handleSave = () => {
    onNameChange(editedName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(name);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Details</h2>
      
      <div className="flex items-start space-x-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-indigo-100 flex items-center justify-center">
                  <span className="text-2xl font-medium text-indigo-600">
                    {name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onAvatarChange}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-indigo-700 transition-colors"
            >
              +
            </button>
          </div>
          <div className="mt-2 space-y-1">
            <button
              onClick={onAvatarChange}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Change photo
            </button>
            <button
              onClick={onAvatarRemove}
              className="text-xs text-red-600 hover:text-red-700 font-medium block"
            >
              Remove photo
            </button>
          </div>
        </div>

        {/* Name and Email Section */}
        <div className="flex-1">
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <div className="flex-1 flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      autoFocus
                    />
                    <ActionButton onClick={handleSave} size="sm">
                      Save
                    </ActionButton>
                    <ActionButton onClick={handleCancel} variant="secondary" size="sm">
                      Cancel
                    </ActionButton>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-900">{name}</span>
                    <ActionButton onClick={() => setIsEditing(true)} variant="secondary" size="sm">
                      Edit
                    </ActionButton>
                  </div>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-600">
                {email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
