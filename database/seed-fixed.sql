-- Prompt Gallery Database Seed Script (FIXED VERSION)
-- Run this in your Supabase SQL editor

-- Step 1: Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create user_profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create prompts table if it doesn't exist
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  result_url TEXT,
  model_used TEXT,
  hidden_prompt TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create unlocks table if it doesn't exist
CREATE TABLE IF NOT EXISTS unlocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  prompt_id UUID REFERENCES prompts(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, prompt_id)
);

-- Step 5: Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
-- Categories - public read
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
CREATE POLICY "Categories are publicly readable" ON categories FOR SELECT USING (true);

-- Prompts - public read
DROP POLICY IF EXISTS "Prompts are publicly readable" ON prompts;
CREATE POLICY "Prompts are publicly readable" ON prompts FOR SELECT USING (true);

-- Unlocks - users can read their own unlocks
DROP POLICY IF EXISTS "Users can view their own unlocks" ON unlocks;
DROP POLICY IF EXISTS "Users can create their own unlocks" ON unlocks;
CREATE POLICY "Users can view their own unlocks" ON unlocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own unlocks" ON unlocks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Step 7: Insert base categories (with ON CONFLICT DO NOTHING)
INSERT INTO categories (name) VALUES 
  ('Images'),
  ('Text'),
  ('Video'),
  ('Code'),
  ('Business'),
  ('Education')
ON CONFLICT (name) DO NOTHING;

-- Step 8: Create admin user in auth.users (if not exists)
-- Note: This requires superuser privileges, so we'll create a placeholder
-- and then you can manually create the admin user through Supabase Auth

-- Step 9: Insert admin user profile (this will work once the auth user exists)
INSERT INTO user_profiles (id, email, role) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com', 'admin')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role;

-- Step 10: Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 11: Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 12: Insert sample prompts with proper category references
WITH category_ids AS (
  SELECT 
    (SELECT id FROM categories WHERE name = 'Images' LIMIT 1) as images_id,
    (SELECT id FROM categories WHERE name = 'Text' LIMIT 1) as text_id,
    (SELECT id FROM categories WHERE name = 'Video' LIMIT 1) as video_id,
    (SELECT id FROM categories WHERE name = 'Code' LIMIT 1) as code_id,
    (SELECT id FROM categories WHERE name = 'Business' LIMIT 1) as business_id,
    (SELECT id FROM categories WHERE name = 'Education' LIMIT 1) as education_id
)
INSERT INTO prompts (title, description, category_id, result_url, model_used, hidden_prompt, user_id)
SELECT 
  prompt_data.title,
  prompt_data.description,
  CASE prompt_data.category_name
    WHEN 'Images' THEN c.images_id
    WHEN 'Text' THEN c.text_id
    WHEN 'Video' THEN c.video_id
    WHEN 'Code' THEN c.code_id
    WHEN 'Business' THEN c.business_id
    WHEN 'Education' THEN c.education_id
  END as category_id,
  prompt_data.result_url,
  prompt_data.model_used,
  prompt_data.hidden_prompt,
  '00000000-0000-0000-0000-000000000001'::UUID as user_id
FROM category_ids c
CROSS JOIN (VALUES
  ('Futuristic City Skyline', 'A stunning cyberpunk-inspired city with neon lights and flying cars', 'Images', 'https://picsum.photos/800/600?random=1', 'DALL-E 3', 'Create a hyper-realistic digital art piece depicting a futuristic cityscape at night. The scene should feature towering skyscrapers with glowing neon signs in various colors (blue, pink, purple, green). Include flying cars with light trails streaking across the sky. The architecture should blend modern glass and steel with cyberpunk aesthetics. Add atmospheric fog and rain effects for mood. Style: photorealistic, cinematic lighting, 8K resolution.'),
  
  ('Professional Portrait Generator', 'Create stunning professional headshots with perfect lighting', 'Images', 'https://picsum.photos/800/600?random=2', 'Midjourney', 'Generate a professional portrait photograph of a [person description] in business attire, shot with an 85mm lens, soft natural lighting from a window, clean neutral background, high resolution, corporate photography style, confident expression, looking directly at camera, depth of field, professional headshot.'),
  
  ('Email Marketing Template', 'A well-structured business email for client communications', 'Text', 'https://picsum.photos/800/600?random=3', 'GPT-4', 'Write a professional business email template for following up with potential clients after an initial meeting. The email should: 1) Thank them for their time, 2) Summarize key discussion points, 3) Outline next steps, 4) Include a clear call-to-action, 5) Maintain a warm but professional tone. Keep it concise (under 200 words) and include placeholders for customization like [CLIENT_NAME], [PROJECT_NAME], etc.'),
  
  ('Blog Post Generator', 'Generate engaging blog posts that drive traffic and engagement', 'Text', 'https://picsum.photos/800/600?random=4', 'Claude', 'Write a comprehensive blog post about [TOPIC] that includes: 1) An attention-grabbing headline with SEO keywords, 2) A compelling introduction with a hook, 3) 5-7 main sections with subheadings (H2, H3), 4) Practical examples and actionable tips, 5) Internal and external linking opportunities, 6) A strong conclusion with call-to-action, 7) Meta description. Target audience: [AUDIENCE], tone: [TONE], word count: 1500-2000 words.'),
  
  ('Video Script Generator', 'Create engaging video scripts for YouTube and social media', 'Video', 'https://picsum.photos/800/600?random=5', 'GPT-4', 'Write a compelling video script for [TOPIC] that includes: 1) Hook in first 3 seconds, 2) Clear value proposition, 3) 3-5 main points with examples, 4) Call-to-action, 5) Engaging transitions, 6) Visual cues for [VIDEO_TYPE]. Duration: [LENGTH] minutes, tone: [TONE], target audience: [AUDIENCE]. Include timestamps and suggested visuals.'),
  
  ('React Component Builder', 'Generate a complete React component with TypeScript', 'Code', 'https://picsum.photos/800/600?random=6', 'GPT-4', 'Create a React TypeScript component for [COMPONENT_NAME] with the following specifications: 1) Support multiple variants and sizes, 2) Include loading and error states, 3) Handle all necessary props with proper TypeScript interfaces, 4) Use Tailwind CSS for styling, 5) Include proper accessibility attributes, 6) Add JSDoc comments for documentation, 7) Include usage examples and prop descriptions. Export as default.'),
  
  ('API Integration Guide', 'Complete guide for integrating external APIs with error handling', 'Code', 'https://picsum.photos/800/600?random=7', 'Claude', 'Create a comprehensive API integration guide for [API_NAME] in [FRAMEWORK]. Include: 1) Authentication setup and API key management, 2) Request/response TypeScript interfaces, 3) Error handling with retry logic, 4) Rate limiting and caching strategies, 5) Testing with mock data, 6) Environment configuration, 7) Complete code examples with best practices. Include both REST and GraphQL examples if applicable.'),
  
  ('Business Plan Generator', 'Create comprehensive business plans for startups', 'Business', 'https://picsum.photos/800/600?random=8', 'GPT-4', 'Generate a complete business plan for [BUSINESS_IDEA] including: 1) Executive summary, 2) Market analysis and competitive landscape, 3) Marketing and sales strategy, 4) Operations plan, 5) Financial projections (3-5 years), 6) Funding requirements, 7) Risk analysis, 8) Implementation timeline. Target market: [TARGET_MARKET], funding needed: [AMOUNT], timeline: [TIMEFRAME].'),
  
  ('Lesson Plan Creator', 'Design engaging lesson plans for any subject', 'Education', 'https://picsum.photos/800/600?random=9', 'Claude', 'Create a comprehensive lesson plan for [SUBJECT] - [TOPIC] for [GRADE_LEVEL] students. Include: 1) Learning objectives (3-5), 2) Materials needed, 3) Warm-up activity (5-10 min), 4) Main lesson (30-40 min) with interactive elements, 5) Assessment activity (10-15 min), 6) Homework/extension, 7) Differentiation strategies, 8) Technology integration. Duration: [CLASS_LENGTH] minutes.')
) AS prompt_data(title, description, category_name, result_url, model_used, hidden_prompt)
ON CONFLICT DO NOTHING;

-- Step 13: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_unlocks_user_prompt ON unlocks(user_id, prompt_id);

-- Step 14: Confirm success by returning all data
SELECT 'Categories:' as table_name, count(*) as row_count FROM categories
UNION ALL
SELECT 'User Profiles:', count(*) FROM user_profiles
UNION ALL
SELECT 'Prompts:', count(*) FROM prompts
UNION ALL
SELECT 'Unlocks:', count(*) FROM unlocks;

-- Step 15: Show sample data
SELECT 'Sample Categories:' as info;
SELECT id, name, created_at FROM categories ORDER BY name;

SELECT 'Sample Prompts:' as info;
SELECT p.id, p.title, p.description, c.name as category, p.model_used, p.created_at 
FROM prompts p 
LEFT JOIN categories c ON p.category_id = c.id 
ORDER BY p.created_at DESC 
LIMIT 5;

SELECT 'Admin User Profile:' as info;
SELECT id, email, role, created_at FROM user_profiles WHERE role = 'admin';
