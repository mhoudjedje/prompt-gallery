interface SubscriptionCardProps {
  subscription: 'Free' | 'Pro';
  role: string;
}

export default function SubscriptionCard({ subscription, role }: SubscriptionCardProps) {
  const isPro = subscription === 'Pro';
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Subscription & Status</h2>
      
      <div className="space-y-4">
        {/* Subscription Status */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Subscription</h3>
            <p className="text-sm text-gray-500">Current plan</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isPro 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {subscription}
            </span>
            {!isPro && (
              <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                Upgrade
              </button>
            )}
          </div>
        </div>

        {/* Role */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Role</h3>
            <p className="text-sm text-gray-500">Account type</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
            {role}
          </span>
        </div>

        {/* Pro Features (if applicable) */}
        {isPro && (
          <div className="mt-4 p-4 bg-purple-50 rounded-lg">
            <h4 className="text-sm font-medium text-purple-900 mb-2">Pro Benefits</h4>
            <ul className="text-sm text-purple-700 space-y-1">
              <li>• Unlimited prompt creation</li>
              <li>• Advanced analytics</li>
              <li>• Priority support</li>
              <li>• Custom branding</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
