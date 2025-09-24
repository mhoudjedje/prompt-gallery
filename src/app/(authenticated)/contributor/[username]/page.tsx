"use client";

import React, { useState } from 'react';
import { Share, Star, Eye, DollarSign, Copy, Lock } from 'lucide-react';

// Mock data types
interface Contributor {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  tags: string[];
  stats: {
    promptsUploaded: number;
    promptsSold: number;
    averageRating: number;
    totalEarnings: number;
  };
}

interface Prompt {
  id: string;
  title: string;
  description: string;
  previewImage?: string;
  price: number;
  isPurchased: boolean;
  rating: number;
  downloads: number;
}

// Mock data
const mockContributor: Contributor = {
  id: '1',
  username: 'alex_designer',
  name: 'Alex Chen',
  avatar: '',
  bio: 'Creative AI artist and prompt engineer with 5+ years of experience in digital art and machine learning. Passionate about creating beautiful, functional prompts that inspire creativity.',
  tags: ['AI Artist', 'Designer', 'Prompt Engineer', 'Creative Director'],
  stats: {
    promptsUploaded: 127,
    promptsSold: 89,
    averageRating: 4.8,
    totalEarnings: 2340.50
  }
};

const mockPrompts: Prompt[] = [
  {
    id: '1',
    title: 'Fantasy Landscape Generator',
    description: 'Create stunning fantasy landscapes with detailed castles, mountains, and magical elements.',
    previewImage: '',
    price: 0,
    isPurchased: true,
    rating: 4.9,
    downloads: 1247
  },
  {
    id: '2',
    title: 'Portrait Photography Style',
    description: 'Professional portrait photography prompts with studio lighting and composition.',
    previewImage: '',
    price: 4.99,
    isPurchased: false,
    rating: 4.7,
    downloads: 892
  },
  {
    id: '3',
    title: 'Cyberpunk City Scenes',
    description: 'Generate futuristic cyberpunk cityscapes with neon lights and urban atmosphere.',
    previewImage: '',
    price: 2.99,
    isPurchased: true,
    rating: 4.8,
    downloads: 1563
  },
  {
    id: '4',
    title: 'Watercolor Art Style',
    description: 'Beautiful watercolor painting prompts with soft colors and artistic brushstrokes.',
    previewImage: '',
    price: 0,
    isPurchased: true,
    rating: 4.6,
    downloads: 987
  },
  {
    id: '5',
    title: 'Product Photography Setup',
    description: 'Professional product photography with clean backgrounds and perfect lighting.',
    previewImage: '',
    price: 6.99,
    isPurchased: false,
    rating: 4.9,
    downloads: 654
  },
  {
    id: '6',
    title: 'Abstract Art Generator',
    description: 'Create unique abstract artworks with vibrant colors and geometric patterns.',
    previewImage: '',
    price: 3.99,
    isPurchased: false,
    rating: 4.5,
    downloads: 432
  }
];

export default function ContributorPortfolio() {
  const [activeTab, setActiveTab] = useState('prompts');
  const [currentPage, setCurrentPage] = useState(1);
  const promptsPerPage = 6;

  // For now, we'll use mock data regardless of username
  const contributor = mockContributor;
  const allPrompts = mockPrompts;

  // Pagination logic
  const totalPages = Math.ceil(allPrompts.length / promptsPerPage);
  const startIndex = (currentPage - 1) * promptsPerPage;
  const currentPrompts = allPrompts.slice(startIndex, startIndex + promptsPerPage);

  const handleCopyPrompt = (promptId: string) => {
    // Placeholder for copy functionality
    console.log('Copying prompt:', promptId);
  };

  const handleShareProfile = () => {
    // Placeholder for share functionality
    console.log('Sharing profile');
  };

  const renderPromptsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {currentPrompts.map((prompt) => (
        <div
          key={prompt.id}
          className={`bg-white rounded-lg shadow-sm border overflow-hidden transition-all duration-200 hover:shadow-md ${
            !prompt.isPurchased && prompt.price > 0 ? 'opacity-75' : ''
          }`}
        >
          {/* Preview Image */}
          <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            {prompt.previewImage ? (
              <img
                src={prompt.previewImage}
                alt={prompt.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400">
                <Eye className="h-12 w-12 mx-auto" />
                <p className="text-sm mt-2">Preview Image</p>
              </div>
            )}
            {!prompt.isPurchased && prompt.price > 0 && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Lock className="h-8 w-8 text-white" />
              </div>
            )}
          </div>

          {/* Card Content */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
              {prompt.title}
            </h3>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {prompt.description}
            </p>

            {/* Price and Rating */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{prompt.rating}</span>
                <span className="text-xs text-gray-400">({prompt.downloads})</span>
              </div>
              <div className="text-sm font-medium">
                {prompt.price === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  <span className="text-gray-900">${prompt.price.toFixed(2)}</span>
                )}
              </div>
            </div>

            {/* Action Button */}
            {prompt.isPurchased || prompt.price === 0 ? (
              <button
                onClick={() => handleCopyPrompt(prompt.id)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                <Copy className="h-4 w-4" />
                <span>Copy Prompt</span>
              </button>
            ) : (
              <button
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
              >
                <DollarSign className="h-4 w-4" />
                <span>Purchase for ${prompt.price.toFixed(2)}</span>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderPagination = () => (
    <div className="flex items-center justify-center space-x-2 mt-8">
      <button
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => setCurrentPage(page)}
          className={`px-3 py-2 text-sm font-medium rounded-md ${
            currentPage === page
              ? 'bg-blue-600 text-white'
              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Contributor Header */}
      <div className="bg-white rounded-lg shadow-sm border p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
          {/* Avatar */}
          <div className="flex-shrink-0 mb-4 md:mb-0">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {contributor.name.split(' ').map(n => n[0]).join('')}
            </div>
          </div>

          {/* Contributor Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {contributor.name}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  @{contributor.username}
                </p>
                <p className="text-gray-700 leading-relaxed max-w-2xl">
                  {contributor.bio}
                </p>
              </div>
              
              {/* Share Button */}
              <button
                onClick={handleShareProfile}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors mt-4 sm:mt-0"
              >
                <Share className="h-4 w-4" />
                <span>Share Profile</span>
              </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {contributor.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {contributor.stats.promptsUploaded}
            </div>
            <div className="text-sm text-gray-600">Prompts Uploaded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {contributor.stats.promptsSold}
            </div>
            <div className="text-sm text-gray-600">Prompts Sold</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="text-2xl font-bold text-gray-900">
                {contributor.stats.averageRating}
              </span>
            </div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              ${contributor.stats.totalEarnings.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Earnings</div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'prompts', name: 'Prompts' },
              { id: 'collections', name: 'Collections' },
              { id: 'about', name: 'About' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'prompts' && (
            <>
              {renderPromptsGrid()}
              {totalPages > 1 && renderPagination()}
            </>
          )}
          
          {activeTab === 'collections' && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Collections Yet</h3>
              <p className="text-gray-500">This contributor hasn&apos;t created any collections yet.</p>
            </div>
          )}
          
          {activeTab === 'about' && (
            <div className="prose max-w-none">
              <h3 className="text-lg font-medium text-gray-900 mb-4">About {contributor.name}</h3>
              <div className="text-gray-700 space-y-4">
                <p>
                  {contributor.bio}
                </p>
                <p>
                  With over {contributor.stats.promptsUploaded} prompts created and a {contributor.stats.averageRating}/5 rating, 
                  {contributor.name} is dedicated to helping creators bring their visions to life through carefully crafted AI prompts.
                </p>
                <p>
                  Specializing in {contributor.tags.slice(0, 2).join(' and ').toLowerCase()}, 
                  {contributor.name} brings a unique perspective to prompt engineering, 
                  combining technical expertise with creative vision.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}