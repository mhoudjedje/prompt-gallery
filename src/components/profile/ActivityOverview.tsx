interface ActivityOverviewProps {
  promptsCreated: number;
  promptsUsed: number;
  isLoading?: boolean;
}

export default function ActivityOverview({ 
  promptsCreated, 
  promptsUsed, 
  isLoading = false 
}: ActivityOverviewProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Activity Overview</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Activity Overview</h2>
      
      <div className="grid grid-cols-2 gap-6">
        {/* Prompts Created */}
        <div className="text-center">
          <div className="text-3xl font-bold text-indigo-600 mb-2">
            {promptsCreated.toLocaleString()}
          </div>
          <div className="text-sm font-medium text-gray-700 mb-1">
            Prompts Created
          </div>
          <div className="text-xs text-gray-500">
            Your original prompts
          </div>
        </div>

        {/* Prompts Used/Copied */}
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {promptsUsed.toLocaleString()}
          </div>
          <div className="text-sm font-medium text-gray-700 mb-1">
            Prompts Used
          </div>
          <div className="text-xs text-gray-500">
            Times your prompts were copied
          </div>
        </div>
      </div>

      {/* Additional stats can be added here */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500 text-center">
          More detailed analytics coming soon
        </div>
      </div>
    </div>
  );
}
