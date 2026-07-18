Prompt
Convert my existing React TypeScript static blog pages into a complete JavaScript (Node.js + Express + MongoDB Atlas + MariaDB) blog management system.
Requirements
Do not change any UI, colors, spacing, typography, layout, responsive design, animations, cards, buttons, icons, or SEO appearance.
The frontend should look exactly like my existing blog pages.
Convert everything from TypeScript to JavaScript.
Tech Stack
Frontend
React JavaScript
React Router
Axios
React Quill (blog editor)
Tailwind CSS
Lucide React
Backend
Node.js
Express.js
JWT Authentication
Multer
Sharp
Slugify
Morgan
Helmet
CORS
dotenv
Database
MongoDB Atlas
Store
blog content
author
tags
category
images
comments
likes
bookmarks
MariaDB
Store
users
admin
permissions
sessions
analytics
settings
Folder Structure
project/

client/

server/

uploads/

storage/

blogs/

public/
JSON Backup
Every published blog should automatically save a JSON file locally.
Example
storage/blogs/

2026/

07/

my-first-blog.json
Format
{
 "title":"",
 "slug":"",
 "content":"",
 "author":"",
 "publishedAt":"",
 "updatedAt":"",
 "tags":[],
 "category":"",
 "coverImage":"",
 "seo":{},
 "status":"published"
}
Blog Editor
Create an admin dashboard.
Only logged in admin can access.
Features
Create Blog
Edit Blog
Delete Blog
Save Draft
Publish
Preview
Upload Cover Image
Upload Images Inside Content
SEO Fields
Canonical URL
Meta Description
Keywords
Slug Generator
Reading Time Generator
Rich Text Editor
Use React Quill.
Support
H1-H6
Bold
Italic
Underline
Code
Code Block
Quote
Lists
Tables
Images
Videos
Links
Colors
Alignment
Emoji
Blog Listing
Keep same design.
Load blogs dynamically.
Newest first.
Pagination.
Search.
Category filter.
Tag filter.
Reading time.
Author.
Publish date.
Featured image.
Excerpt.
Blog Page
Keep exact layout.
Show
cover image
author
publish date
updated date
reading time
category
tags
share buttons
bookmark
like
related blogs
next previous blog
Comments
MongoDB
Users can
comment
reply
edit own comment
delete own comment
Admin can moderate.
Share Buttons
Facebook
LinkedIn
Twitter/X
WhatsApp
Telegram
Copy Link
Native Share API
SEO
Generate automatically
slug
sitemap
robots
meta tags
OpenGraph
Twitter Cards
JSON-LD
RSS Feed
Update sitemap.xml automatically.
API
GET /api/blogs

GET /api/blog/:slug

POST /api/blog

PUT /api/blog/:id

DELETE /api/blog/:id

GET /api/categories

GET /api/tags

POST /api/upload

POST /api/login

POST /api/logout
Image Upload
Upload
uploads/

blog/

cover/

content/
Compress using Sharp.
Generate WebP.
Search
Real-time search.
Search by
title
tags
category
content
Security
Helmet
Rate Limiter
JWT
Input Validation
Sanitize HTML
XSS Protection
CSRF Protection
Analytics
Store
views
unique visitors
likes
shares
reading time
trending posts
Admin Dashboard
Statistics
Published blogs
Drafts
Views
Comments
Likes
Recent Posts
Trending Posts
Storage Used
Database Status
Automatic Features
Generate
slug
excerpt
reading time
publish timestamp
update timestamp
Local Development (Termux)
Run with
npm install

npm run dev
Backend
http://localhost:5000
Frontend
http://localhost:3000
Environment Variables
PORT=

MONGODB_URI=

MARIADB_HOST=

MARIADB_PORT=

MARIADB_USER=

MARIADB_PASSWORD=

MARIADB_DATABASE=

JWT_SECRET=

UPLOAD_PATH=

JSON_STORAGE_PATH=
Final Goal
The finished project must:
Keep the exact same design as the current blog pages.
Replace all hardcoded blog data with database data.
Allow creating, editing, deleting, drafting, and publishing blogs from a web interface.
Save every published blog to MongoDB Atlas and automatically create a local JSON backup.
Display publish date, update date, author, reading time, tags, categories, and SEO metadata.
Work entirely in JavaScript (no TypeScript).
Be optimized to run in Termux on Android using Node.js and npm.
