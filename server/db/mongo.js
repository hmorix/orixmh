const { MongoClient, ObjectId } = require('mongodb')

let client
let db
let blogClient
let blogDb

async function connectMongo() {
  if (db) return db
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not set')

  client = new MongoClient(uri)
  await client.connect()
  db = client.db()
  return db
}

async function blogCollection() {
  const uri = process.env.BLOG_MONGODB_URI || process.env.MONGODB_URI
  if (!uri) throw new Error('BLOG_MONGODB_URI or MONGODB_URI is not set')

  if (!blogDb) {
    blogClient = new MongoClient(uri)
    await blogClient.connect()
    blogDb = process.env.BLOG_MONGODB_DB ? blogClient.db(process.env.BLOG_MONGODB_DB) : blogClient.db()
  }

  const collection = blogDb.collection(process.env.BLOG_COLLECTION_NAME || 'blogs')
  await collection.createIndex({ slug: 1 }, { unique: true })
  await collection.createIndex({ status: 1, publishedAt: -1 })
  await collection.createIndex({ title: 'text', content: 'text', category: 'text', tags: 'text' })
  return collection
}

module.exports = { connectMongo, blogCollection, ObjectId }
