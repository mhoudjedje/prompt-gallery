-- Prompt Gallery Database Seed Script (FIXED FOR ORIGINAL SCHEMA)
-- Run this in your Supabase SQL editor

-- Step 1: Create categories table (matches your original schema)
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Create user_profiles table (matches your original schema)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create prompts table (matches your original schema)
CREATE TABLE IF NOT EXISTS prompts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  result_url TEXT,
  model_used TEXT,
  hidden_prompt TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create unlocks table (matches your original schema)
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

-- Step 7: Insert sample categories (with duplicate check)
INSERT INTO categories (name) 
SELECT * FROM (VALUES 
  ('AI Art'),
  ('Content Writing'), 
  ('Code Generation'),
  ('Marketing')
) AS new_categories(name)
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE categories.name = new_categories.name
);

-- Step 8: Function to handle new user registration
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

-- Step 9: Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Step 10: Function to insert sample prompts
CREATE OR REPLACE FUNCTION insert_sample_prompts()
RETURNS void AS $$
DECLARE
  ai_art_id UUID;
  content_writing_id UUID;
  code_generation_id UUID;
  marketing_id UUID;
  admin_user_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO ai_art_id FROM categories WHERE name = 'AI Art';
  SELECT id INTO content_writing_id FROM categories WHERE name = 'Content Writing';
  SELECT id INTO code_generation_id FROM categories WHERE name = 'Code Generation';
  SELECT id INTO marketing_id FROM categories WHERE name = 'Marketing';

  -- Get first admin user (or use placeholder)
  SELECT id INTO admin_user_id FROM user_profiles WHERE role = 'admin' LIMIT 1;
  
  -- If no admin user exists, use a placeholder UUID
  IF admin_user_id IS NULL THEN
    admin_user_id := '00000000-0000-0000-0000-000000000000';
  END IF;

  -- Insert sample prompts
  INSERT INTO prompts (title, description, category_id, result_url, model_used, hidden_prompt, created_by) VALUES
    (
      'Futuristic City Skyline',
      'A stunning cyberpunk-inspired city with neon lights and flying cars',
      ai_art_id,
      'https://picsum.photos/800/600?random=1',
      'DALL-E 3',
      'Create a hyper-realistic digital art piece depicting a futuristic cityscape at night. The scene should feature towering skyscrapers with glowing neon signs in various colors (blue, pink, purple, green). Include flying cars with light trails streaking across the sky. The architecture should blend modern glass and steel with cyberpunk aesthetics. Add atmospheric fog and rain effects for mood. Style: photorealistic, cinematic lighting, 8K resolution.',
      admin_user_id
    ),
    (
      'Professional Portrait Generator',
      'Create stunning professional headshots with perfect lighting',
      ai_art_id,
      'https://picsum.photos/800/600?random=2',
      'Midjourney',
      'Generate a professional portrait photograph of a [person description] in business attire, shot with an 85mm lens, soft natural lighting from a window, clean neutral background, high resolution, corporate photography style, confident expression, looking directly at camera, depth of field, professional headshot.',
      admin_user_id
    ),
    (
      'Email Marketing Template',
      'A well-structured business email for client communications',
      content_writing_id,
      'https://picsum.photos/800/600?random=3',
      'GPT-4',
      'Write a professional business email template for following up with potential clients after an initial meeting. The email should: 1) Thank them for their time, 2) Summarize key discussion points, 3) Outline next steps, 4) Include a clear call-to-action, 5) Maintain a warm but professional tone. Keep it concise (under 200 words) and include placeholders for customization like [CLIENT_NAME], [PROJECT_NAME], etc.',
      admin_user_id
    ),
    (
      'Blog Post Generator',
      'Generate engaging blog posts that drive traffic and engagement',
      content_writing_id,
      'https://picsum.photos/800/600?random=4',
      'Claude',
      'Write a comprehensive blog post about [TOPIC] that includes: 1) An attention-grabbing headline with SEO keywords, 2) A compelling introduction with a hook, 3) 5-7 main sections with subheadings (H2, H3), 4) Practical examples and actionable tips, 5) Internal and external linking opportunities, 6) A strong conclusion with call-to-action, 7) Meta description. Target audience: [AUDIENCE], tone: [TONE], word count: 1500-2000 words.',
      admin_user_id
    ),
    (
      'React Component Builder',
      'Generate a complete React component with TypeScript',
      code_generation_id,
      'https://picsum.photos/800/600?random=5',
      'GPT-4',
      'Create a React TypeScript component for [COMPONENT_NAME] with the following specifications: 1) Support multiple variants and sizes, 2) Include loading and error states, 3) Handle all necessary props with proper TypeScript interfaces, 4) Use Tailwind CSS for styling, 5) Include proper accessibility attributes, 6) Add JSDoc comments for documentation, 7) Include usage examples and prop descriptions. Export as default.',
      admin_user_id
    ),
    (
      'API Integration Guide',
      'Complete guide for integrating external APIs with error handling',
      code_generation_id,
      'https://picsum.photos/800/600?random=6',
      'Claude',
      'Create a comprehensive API integration guide for [API_NAME] in [FRAMEWORK]. Include: 1) Authentication setup and API key management, 2) Request/response TypeScript interfaces, 3) Error handling with retry logic, 4) Rate limiting and caching strategies, 5) Testing with mock data, 6) Environment configuration, 7) Complete code examples with best practices. Include both REST and GraphQL examples if applicable.',
      admin_user_id
    ),
    (
      'Social Media Campaign',
      'Engaging social media content for product launches',
      marketing_id,
      'https://picsum.photos/800/600?random=7',
      'GPT-4',
      'Create a complete social media campaign for [PRODUCT/SERVICE] launch including: 1) Instagram posts with captions and hashtags (5 posts), 2) Twitter thread (10 tweets), 3) LinkedIn professional post, 4) Facebook event description, 5) TikTok video concept, 6) Content calendar for 2 weeks, 7) Engagement strategies and community management tips. Include visual concepts and call-to-actions.',
      admin_user_id
    ),
    (
      'Sales Funnel Optimizer',
      'Complete sales funnel strategy with conversion optimization',
      marketing_id,
      'https://picsum.photos/800/600?random=8',
      'Claude',
      'Design a high-converting sales funnel for [PRODUCT/SERVICE] targeting [AUDIENCE]. Include: 1) Lead magnet and landing page copy, 2) Email sequence (5-7 emails) with subject lines, 3) Sales page structure with psychological triggers, 4) Upsell and downsell strategies, 5) A/B testing recommendations, 6) Conversion tracking setup, 7) Retargeting campaign ideas, 8) Key metrics and KPIs to monitor.',
      admin_user_id
    )
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompts_category_id ON prompts(category_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_by ON prompts(created_by);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_unlocks_user_prompt ON unlocks(user_id, prompt_id);

-- =====================================================
-- INSTRUCTIONS AFTER RUNNING THIS SCRIPT:
-- =====================================================
-- 1. Sign up for an account in your app
-- 2. Make yourself an admin: 
--    UPDATE user_profiles SET role = 'admin' WHERE email = 'your-email@example.com';
-- 3. Insert sample data: 
--    SELECT insert_sample_prompts();
-- 4. (Optional) Update sample prompts creator: 
--    UPDATE prompts SET created_by = 'your-user-id' WHERE created_by = '00000000-0000-0000-0000-000000000000';