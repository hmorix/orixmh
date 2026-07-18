/**
 * HMorix Platform - MongoDB Schema
 * This file documents the MongoDB collections and their structure
 * Use this with MongoDB Compass or mongosh to create collections
 */

// ============================================
// USER PROFILES COLLECTION
// ============================================
db.createCollection("user_profiles", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "email", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        user_id: { bsonType: "string", description: "Supabase user ID" },
        email: { bsonType: "string" },
        name: { bsonType: "string" },
        username: { bsonType: "string" },
        company: { bsonType: "string" },
        phone: { bsonType: "string" },
        bio: { bsonType: "string" },
        country: { bsonType: "string" },
        avatar_url: { bsonType: "string" },
        social_links: {
          bsonType: "object",
          properties: {
            twitter: { bsonType: "string" },
            linkedin: { bsonType: "string" },
            github: { bsonType: "string" },
            website: { bsonType: "string" }
          }
        },
        role: { enum: ["admin", "user", "editor", "developer", "employee"] },
        plan: { enum: ["free", "starter", "business", "enterprise"] },
        two_factor_enabled: { bsonType: "bool" },
        verified: { bsonType: "bool" },
        created_at: { bsonType: "date" },
        updated_at: { bsonType: "date" },
        deleted_at: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.user_profiles.createIndex({ email: 1 }, { unique: true });
db.user_profiles.createIndex({ user_id: 1 });
db.user_profiles.createIndex({ username: 1 }, { sparse: true });

// ============================================
// NOTIFICATIONS COLLECTION
// ============================================
db.createCollection("notifications", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "user_id", "type", "title", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        user_id: { bsonType: "string" },
        type: { enum: ["login", "password_change", "email_verified", "profile_updated", "subscription_updated", "security_alert", "system"] },
        title: { bsonType: "string" },
        message: { bsonType: "string" },
        action_url: { bsonType: "string" },
        read: { bsonType: "bool" },
        read_at: { bsonType: ["date", "null"] },
        created_at: { bsonType: "date" }
      }
    }
  }
});

db.notifications.createIndex({ user_id: 1, created_at: -1 });
db.notifications.createIndex({ user_id: 1, read: 1 });

// ============================================
// LOGIN HISTORY COLLECTION
// ============================================
db.createCollection("login_history", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "user_id", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        user_id: { bsonType: "string" },
        device: { bsonType: "string" },
        browser: { bsonType: "string" },
        os: { bsonType: "string" },
        ip_address: { bsonType: "string" },
        location: { bsonType: "string" },
        country: { bsonType: "string" },
        city: { bsonType: "string" },
        latitude: { bsonType: ["double", "null"] },
        longitude: { bsonType: ["double", "null"] },
        provider: { enum: ["email", "google", "github", "microsoft"] },
        created_at: { bsonType: "date" }
      }
    }
  }
});

db.login_history.createIndex({ user_id: 1, created_at: -1 });

// ============================================
// USER SETTINGS COLLECTION
// ============================================
db.createCollection("user_settings", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "user_id"],
      properties: {
        _id: { bsonType: "objectId" },
        user_id: { bsonType: "string" },
        theme: { enum: ["dark", "light", "system"] },
        accent_color: { bsonType: "string" },
        language: { bsonType: "string" },
        timezone: { bsonType: "string" },
        date_format: { bsonType: "string" },
        currency: { bsonType: "string" },
        email_notifications: { bsonType: "bool" },
        push_notifications: { bsonType: "bool" },
        security_alerts: { bsonType: "bool" },
        product_updates: { bsonType: "bool" },
        marketing_emails: { bsonType: "bool" },
        weekly_digest: { bsonType: "bool" },
        sidebar_expanded: { bsonType: "bool" },
        font_size: { bsonType: "int" },
        updated_at: { bsonType: "date" }
      }
    }
  }
});

db.user_settings.createIndex({ user_id: 1 }, { unique: true });

// ============================================
// OAUTH CONNECTIONS COLLECTION
// ============================================
db.createCollection("oauth_connections", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "user_id", "provider", "provider_id"],
      properties: {
        _id: { bsonType: "objectId" },
        user_id: { bsonType: "string" },
        provider: { enum: ["google", "github", "microsoft"] },
        provider_id: { bsonType: "string" },
        provider_email: { bsonType: "string" },
        provider_name: { bsonType: "string" },
        provider_avatar: { bsonType: "string" },
        access_token: { bsonType: "string" },
        refresh_token: { bsonType: ["string", "null"] },
        token_expires_at: { bsonType: ["date", "null"] },
        connected_at: { bsonType: "date" },
        last_used_at: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.oauth_connections.createIndex({ user_id: 1, provider: 1 }, { unique: true });
db.oauth_connections.createIndex({ provider_id: 1 });

// ============================================
// ACTIVITY LOG COLLECTION
// ============================================
db.createCollection("activity_log", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "user_id", "action", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        user_id: { bsonType: "string" },
        action: { bsonType: "string" },
        entity_type: { bsonType: "string" },
        entity_id: { bsonType: "string" },
        details: { bsonType: "object" },
        ip_address: { bsonType: "string" },
        created_at: { bsonType: "date" }
      }
    }
  }
});

db.activity_log.createIndex({ user_id: 1, created_at: -1 });

// ============================================
// ACCOUNT DELETION REQUESTS COLLECTION
// ============================================
db.createCollection("account_deletion_requests", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "user_id", "created_at"],
      properties: {
        _id: { bsonType: "objectId" },
        user_id: { bsonType: "string" },
        email: { bsonType: "string" },
        reason: { bsonType: "string" },
        status: { enum: ["pending", "scheduled", "completed", "cancelled"] },
        scheduled_deletion_date: { bsonType: "date" },
        created_at: { bsonType: "date" },
        cancelled_at: { bsonType: ["date", "null"] }
      }
    }
  }
});

db.account_deletion_requests.createIndex({ user_id: 1 });
db.account_deletion_requests.createIndex({ scheduled_deletion_date: 1 });

// ============================================
// CREATE INDEXES FOR PERFORMANCE
// ============================================
db.user_profiles.createIndex({ created_at: -1 });
db.notifications.createIndex({ created_at: -1 });
db.login_history.createIndex({ created_at: -1 });
db.activity_log.createIndex({ created_at: -1 });

console.log("✓ MongoDB collections created successfully!");
