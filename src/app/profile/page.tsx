"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PasswordChangeModal from '@/components/profile/PasswordChangeModal';
import { profileApi } from '@/lib/profileApi'; // Assuming this is the correct path
import { UserProfile } from '@/types/profile'; // Assuming this is the correct path

const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fetch user profile data here using profileApi
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        // Replace 'user-id' with the actual user ID (e.g., from Supabase auth)
        const userId = 'user-id'; // Placeholder: Replace with actual user ID
        const response = await profileApi.getProfile(userId);
        if (response.data) {
          setUserProfile(response.data);
        } else {
          console.error('Failed to fetch profile:', response.error);
          // Handle error (e.g., redirect to login)
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Handle error (e.g., display error message)
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChangePassword = async (newPassword: string) => {
    setIsLoading(true);
    try {
      const response = await profileApi.updatePassword(newPassword);
      if (response.data === null) {
        alert('Password changed successfully!');
        setIsPasswordModalOpen(false);
      } else {
        console.error('Failed to update password:', response.error);
        alert('Failed to change password. Please try again.');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      alert('An error occurred while changing password.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  if (!userProfile) {
    return <p>Failed to load profile.</p>;
  }

  return (
    <div>
      <h1>Profile Page</h1>
      <p>Welcome, {userProfile.full_name || 'User'}!</p>
      {/* Display other profile information here */}
      <button onClick={() => setIsPasswordModalOpen(true)}>Change Password</button>
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onConfirm={handleChangePassword}
        isLoading={isLoading}
      />
      <button onClick={() => router.push('/')}>Go to Home</button>
    </div>
  );
};

export default ProfilePage;
