# 🚀 ArthMitra Quick Start Guide (v2.0)

## ✅ What's Ready
- ✅ Frontend server configured
- ✅ Backend with OpenAI GPT-4o
- ✅ Real Mutual Fund data (mfapi.in)
- ✅ Real Stock prices (Yahoo Finance)
- ✅ User Authentication (Supabase - optional)
- ✅ Profile Database (Supabase - optional)

---

## 🔑 Configuration (.env file)

Edit `backend\.env`:

```env
# Required - AI Features
OPENAI_API_KEY=your-openai-key-here

# Optional - User Auth & Profile Saving
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Where to get keys:
- **OpenAI**: https://platform.openai.com/api-keys
- **Supabase**: https://supabase.com → Your Project → Settings → API

---

## 🎯 Run the App

### Option 1: Full Stack (Recommended)
Double-click: **`start-fullstack.bat`**

### Option 2: Individual Servers

**Frontend:**
```bash
cd frontend && npm run dev
```

**Backend:**
```bash
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

---

## 🌐 URLs

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Frontend App |
| http://localhost:8000 | Backend API |
| http://localhost:8000/docs | API Documentation (Swagger) |

---

## 📡 New API Endpoints

### Mutual Fund Data (No API key needed)
```
GET /api/mf/search?q=parag parikh    # Search funds
GET /api/mf/122639                    # Get fund NAV history
GET /api/mf/122639/latest             # Get latest NAV
GET /api/mf/122639/returns            # Get 1M, 3M, 6M, 1Y, 3Y, 5Y returns
GET /api/mf/popular                   # List of popular fund codes
```

### Stock Data (No API key needed)
```
GET /api/stocks/RELIANCE.NS           # Get stock price
GET /api/stocks/RELIANCE.NS/history   # Get price history
GET /api/stocks/indices               # Get Nifty, Sensex, etc.
GET /api/stocks/gold                  # Get gold price
GET /api/stocks/popular               # List of popular stocks
POST /api/stocks/multiple             # Get multiple stocks at once
```

### Authentication (Requires Supabase)
```
POST /api/auth/signup                 # Register
POST /api/auth/signin                 # Login
POST /api/auth/signout                # Logout
GET  /api/auth/me                     # Get current user
GET  /api/auth/status                 # Check if auth is configured
```

### User Profile (Requires Supabase)
```
GET  /api/profile                     # Get saved profile
POST /api/profile                     # Save profile
GET  /api/profile/chat                # Get chat history
POST /api/profile/chat                # Save chat history
```

---

## 🗄️ Supabase Setup (Optional)

To enable user accounts and profile saving:

1. Create account at https://supabase.com
2. Create a new project
3. Go to **SQL Editor** and run this:

```sql
-- User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    messages JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can manage own profile" ON user_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chat" ON chat_history FOR ALL USING (auth.uid() = user_id);
```

4. Get API keys from **Settings → API**
5. Add to `.env` file

---

## 🛑 Stop Servers

Press `Ctrl + C` in the terminal window
