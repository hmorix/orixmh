package com.example.hmorix.data

import android.content.Context
import android.content.SharedPreferences
import com.example.hmorix.model.User
import org.json.JSONObject

class SessionManager(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("hmorix_enterprise_prefs", Context.MODE_PRIVATE)

    var authToken: String?
        get() = prefs.getString(KEY_AUTH_TOKEN, null)
        set(value) = prefs.edit().putString(KEY_AUTH_TOKEN, value).apply()

    var sessionCookie: String?
        get() = prefs.getString(KEY_SESSION_COOKIE, null)
        set(value) = prefs.edit().putString(KEY_SESSION_COOKIE, value).apply()

    var apiBaseUrl: String
        get() = prefs.getString(KEY_API_BASE_URL, "https://hmorix.in/api") ?: "https://hmorix.in/api"
        set(value) = prefs.edit().putString(KEY_API_BASE_URL, value).apply()

    var currentUser: User?
        get() {
            val jsonStr = prefs.getString(KEY_CURRENT_USER, null) ?: return null
            return try {
                val obj = JSONObject(jsonStr)
                User(
                    id = obj.optString("id", ""),
                    email = obj.optString("email", ""),
                    name = obj.optString("name", "User"),
                    role = obj.optString("role", "user"),
                    company = obj.optString("company", ""),
                    avatarUrl = obj.optString("avatarUrl", ""),
                    emailVerified = obj.optBoolean("emailVerified", true),
                    twoFactorEnabled = obj.optBoolean("twoFactorEnabled", false),
                    provider = obj.optString("provider", "email")
                )
            } catch (e: Exception) {
                null
            }
        }
        set(value) {
            if (value == null) {
                prefs.edit().remove(KEY_CURRENT_USER).apply()
            } else {
                val obj = JSONObject().apply {
                    put("id", value.id)
                    put("email", value.email)
                    put("name", value.name)
                    put("role", value.role)
                    put("company", value.company)
                    put("avatarUrl", value.avatarUrl)
                    put("emailVerified", value.emailVerified)
                    put("twoFactorEnabled", value.twoFactorEnabled)
                    put("provider", value.provider)
                }
                prefs.edit().putString(KEY_CURRENT_USER, obj.toString()).apply()
            }
        }

    val isLoggedIn: Boolean
        get() = (!authToken.isNullOrBlank() || !sessionCookie.isNullOrBlank()) && currentUser != null

    fun saveSession(user: User, token: String? = null, cookie: String? = null) {
        currentUser = user
        if (!token.isNullOrBlank()) authToken = token
        if (!cookie.isNullOrBlank()) sessionCookie = cookie
    }

    fun clearSession() {
        prefs.edit()
            .remove(KEY_AUTH_TOKEN)
            .remove(KEY_SESSION_COOKIE)
            .remove(KEY_CURRENT_USER)
            .apply()
    }

    fun getAuthHeaders(): Map<String, String> {
        val headers = mutableMapOf<String, String>()
        val token = authToken
        if (!token.isNullOrBlank()) {
            headers["Authorization"] = "Bearer $token"
        }
        val cookie = sessionCookie
        if (!cookie.isNullOrBlank()) {
            headers["Cookie"] = if (cookie.startsWith("hm_session=")) cookie else "hm_session=$cookie"
        }
        return headers
    }

    companion object {
        private const val KEY_AUTH_TOKEN = "key_auth_token"
        private const val KEY_SESSION_COOKIE = "key_session_cookie"
        private const val KEY_API_BASE_URL = "key_api_base_url"
        private const val KEY_CURRENT_USER = "key_current_user"
    }
}
