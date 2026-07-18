import { MongoClient, Db, Collection } from 'mongodb'

let mongoClient: MongoClient | null = null
let mongoDb: Db | null = null

const MONGODB_URI = process.env.MONGODB_URI || ''

export async function connectMongo(): Promise<Db> {
  if (mongoDb) return mongoDb

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set')
  }

  try {
    mongoClient = new MongoClient(MONGODB_URI)
    await mongoClient.connect()
    mongoDb = mongoClient.db()
    console.log('✓ Connected to MongoDB')
    return mongoDb
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error)
    throw error
  }
}

export async function getCollection(collectionName: string): Promise<Collection> {
  const db = await connectMongo()
  return db.collection(collectionName)
}

export async function closeMongo(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close()
    mongoClient = null
    mongoDb = null
  }
}

// User Profiles
export async function getUserProfile(userId: string) {
  const collection = await getCollection('user_profiles')
  return collection.findOne({ user_id: userId })
}

export async function createUserProfile(data: any) {
  const collection = await getCollection('user_profiles')
  return collection.insertOne({
    ...data,
    created_at: new Date(),
    updated_at: new Date(),
  })
}

export async function updateUserProfile(userId: string, data: any) {
  const collection = await getCollection('user_profiles')
  return collection.findOneAndUpdate(
    { user_id: userId },
    { $set: { ...data, updated_at: new Date() } },
    { returnDocument: 'after' }
  )
}

// Notifications
export async function getNotifications(userId: string, limit = 20) {
  const collection = await getCollection('notifications')
  return collection
    .find({ user_id: userId })
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray()
}

export async function createNotification(data: any) {
  const collection = await getCollection('notifications')
  return collection.insertOne({
    ...data,
    read: false,
    created_at: new Date(),
  })
}

export async function markNotificationAsRead(notificationId: string) {
  const collection = await getCollection('notifications')
  const { ObjectId } = await import('mongodb')
  return collection.findOneAndUpdate(
    { _id: new ObjectId(notificationId) },
    { $set: { read: true, read_at: new Date() } },
    { returnDocument: 'after' }
  )
}

export async function markAllNotificationsAsRead(userId: string) {
  const collection = await getCollection('notifications')
  return collection.updateMany(
    { user_id: userId, read: false },
    { $set: { read: true, read_at: new Date() } }
  )
}

// Login History
export async function addLoginHistory(data: any) {
  const collection = await getCollection('login_history')
  return collection.insertOne({
    ...data,
    created_at: new Date(),
  })
}

export async function getLoginHistory(userId: string, limit = 4) {
  const collection = await getCollection('login_history')
  return collection
    .find({ user_id: userId })
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray()
}

// User Settings
export async function getUserSettings(userId: string) {
  const collection = await getCollection('user_settings')
  return collection.findOne({ user_id: userId })
}

export async function updateUserSettings(userId: string, data: any) {
  const collection = await getCollection('user_settings')
  return collection.findOneAndUpdate(
    { user_id: userId },
    { $set: { ...data, updated_at: new Date() } },
    { upsert: true, returnDocument: 'after' }
  )
}

// OAuth Connections
export async function getOAuthConnection(userId: string, provider: string) {
  const collection = await getCollection('oauth_connections')
  return collection.findOne({ user_id: userId, provider })
}

export async function createOAuthConnection(data: any) {
  const collection = await getCollection('oauth_connections')
  return collection.insertOne({
    ...data,
    connected_at: new Date(),
  })
}

export async function updateOAuthConnection(userId: string, provider: string, data: any) {
  const collection = await getCollection('oauth_connections')
  return collection.findOneAndUpdate(
    { user_id: userId, provider },
    { $set: { ...data, last_used_at: new Date() } },
    { returnDocument: 'after' }
  )
}

// Activity Log
export async function addActivityLog(data: any) {
  const collection = await getCollection('activity_log')
  return collection.insertOne({
    ...data,
    created_at: new Date(),
  })
}

export async function getActivityLog(userId: string, limit = 50) {
  const collection = await getCollection('activity_log')
  return collection
    .find({ user_id: userId })
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray()
}

// Account Deletion
export async function requestAccountDeletion(userId: string, email: string, reason: string) {
  const collection = await getCollection('account_deletion_requests')
  const scheduledDate = new Date()
  scheduledDate.setDate(scheduledDate.getDate() + 7) // 7 days from now

  return collection.insertOne({
    user_id: userId,
    email,
    reason,
    status: 'scheduled',
    scheduled_deletion_date: scheduledDate,
    created_at: new Date(),
  })
}

export async function getAccountDeletionRequest(userId: string) {
  const collection = await getCollection('account_deletion_requests')
  return collection.findOne({
    user_id: userId,
    status: { $in: ['pending', 'scheduled'] },
  })
}

export async function cancelAccountDeletion(userId: string) {
  const collection = await getCollection('account_deletion_requests')
  return collection.findOneAndUpdate(
    { user_id: userId, status: 'scheduled' },
    { $set: { status: 'cancelled', cancelled_at: new Date() } },
    { returnDocument: 'after' }
  )
}

export default {
  connectMongo,
  getCollection,
  closeMongo,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getNotifications,
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  addLoginHistory,
  getLoginHistory,
  getUserSettings,
  updateUserSettings,
  getOAuthConnection,
  createOAuthConnection,
  updateOAuthConnection,
  addActivityLog,
  getActivityLog,
  requestAccountDeletion,
  getAccountDeletionRequest,
  cancelAccountDeletion,
}
