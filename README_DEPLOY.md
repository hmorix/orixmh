# 🚀 HMorix Platform - Deployment Guide

This document provides step-by-step instructions to fix the "black screen" issue and successfully host your platform on Vercel.

## 🛠️ Step 1: Apply the Fixes
I have already applied the following fixes to your project:
1.  **Safe Supabase Initialization**: Modified `client/src/lib/supabase.ts` to prevent the app from crashing if environment variables are missing. It now logs a clear error in the console instead of showing a black screen.
2.  **Loading State**: Added a professional loading spinner in `client/src/App.tsx` that appears while the platform is initializing, preventing a blank screen during the initial session check.
3.  **Vercel Configuration**: Updated `vercel.json` with correct rewrite rules to ensure that refreshing the page doesn't cause a 404 error and that the API routes are correctly mapped.

## 🔑 Step 2: Set Up Environment Variables
The most common cause of a black screen is missing `VITE_` variables. Vercel needs these to be explicitly set in the dashboard.

1.  Go to your **Vercel Project Settings**.
2.  Navigate to **Environment Variables**.
3.  Open the file `.env.vercel` included in this fix.
4.  Copy and paste each variable into Vercel. 
    *   **Important**: Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are exactly correct.

## 📦 Step 3: Deployment
Once the variables are set, trigger a new deployment:
1.  Push the updated code to your repository.
2.  Vercel will automatically start a new build.
3.  If you still see a black screen, open the browser console (F12) to see the specific error message.

## 🧠 Step 4: Using Project Memory
I have created a `PROJECT_MEMORY.md` file. When you need to fix something in the future, you can refer to this file to understand the architecture and key files without having to read the entire codebase.
