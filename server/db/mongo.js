const { MongoClient, ObjectId } = require('mongodb')

let client
let db

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
  const database = await connectMongo()
  const collection = database.collection('blogs')
  await collection.createIndex({ slug: 1 }, { unique: true })
  await collection.createIndex({ status: 1, publishedAt: -1 })
  await collection.createIndex({ title: 'text', content: 'text', category: 'text', tags: 'text' })
  return collection
}

module.exports = { connectMongo, blogCollection, ObjectId }
