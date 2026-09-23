package com.example.hmorix.ui.screens

import android.content.Intent
import android.net.Uri
import android.webkit.CookieManager
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.hmorix.R
import com.example.hmorix.data.HMorixRepository
import com.example.hmorix.ui.components.BrandBadge
import com.example.hmorix.ui.components.GlassCard
import com.example.hmorix.ui.theme.AccentCyan
import com.example.hmorix.ui.theme.AccentGreen
import com.example.hmorix.ui.theme.AccentRed
import com.example.hmorix.ui.theme.LimePrimary
import com.example.hmorix.ui.theme.ObsidianBackground
import com.example.hmorix.ui.theme.ObsidianBorder
import com.example.hmorix.ui.theme.ObsidianCard
import com.example.hmorix.ui.theme.ObsidianCardElevated
import com.example.hmorix.ui.theme.TextCream
import com.example.hmorix.ui.theme.TextMuted
import com.example.hmorix.ui.theme.TextSubtle
import kotlinx.coroutines.launch

@Composable
fun AuthScreen(
    repository: HMorixRepository,
    onAuthSuccess: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var selectedTab by remember { mutableIntStateOf(0) } // 0: Sign In, 1: Sign Up, 2: Web / OAuth

    // Sign In states
    var signInEmail by remember { mutableStateOf("") }
    var signInPassword by remember { mutableStateOf("") }
    var showSignInPassword by remember { mutableStateOf(false) }

    // Sign Up states
    var signUpName by remember { mutableStateOf("") }
    var signUpEmail by remember { mutableStateOf("") }
    var signUpPassword by remember { mutableStateOf("") }
    var signUpCompany by remember { mutableStateOf("") }
    var showSignUpPassword by remember { mutableStateOf(false) }

    // Web Transfer states
    var webTokenInput by remember { mutableStateOf("") }
    var showWebViewModal by remember { mutableStateOf(false) }
    var webViewTargetUrl by remember { mutableStateOf("https://hmorix.in/signin") }

    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Brand Header
        item {
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .clip(RoundedCornerShape(16.dp))
                            .background(Color(0xFF141416))
                            .border(1.dp, Color(0x66C8FF00), RoundedCornerShape(16.dp))
                            .padding(8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_logo_hex_lime),
                            contentDescription = "HMorix Logo",
                            modifier = Modifier.fillMaxSize()
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "HMORIX CLOUD PORTAL",
                        color = TextCream,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        letterSpacing = 1.sp
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = "Sign in to access projects, raise tickets, and manage billing.",
                        color = TextMuted,
                        fontSize = 12.sp
                    )

                    Spacer(modifier = Modifier.height(14.dp))
                    BrandBadge("ZERO-TRUST RBAC AUTH")
                }
            }
        }

        // Tab Selector
        item {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = ObsidianCard,
                contentColor = LimePrimary,
                indicator = { tabPositions ->
                    TabRowDefaults.SecondaryIndicator(
                        modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                        color = LimePrimary
                    )
                }
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0; errorMessage = null },
                    text = { Text("Sign In", fontSize = 13.sp, fontWeight = FontWeight.SemiBold) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1; errorMessage = null },
                    text = { Text("Sign Up", fontSize = 13.sp, fontWeight = FontWeight.SemiBold) }
                )
                Tab(
                    selected = selectedTab == 2,
                    onClick = { selectedTab = 2; errorMessage = null },
                    text = { Text("Web Transfer", fontSize = 13.sp, fontWeight = FontWeight.SemiBold) }
                )
            }
        }

        // Alerts / Notifications
        if (errorMessage != null) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0x22FF5252))
                        .border(1.dp, AccentRed.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                        .padding(12.dp)
                ) {
                    Text(
                        text = errorMessage ?: "",
                        color = AccentRed,
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        }

        if (successMessage != null) {
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0x2200E676))
                        .border(1.dp, AccentGreen.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                        .padding(12.dp)
                ) {
                    Text(
                        text = successMessage ?: "",
                        color = AccentGreen,
                        fontSize = 12.sp,
                        lineHeight = 16.sp
                    )
                }
            }
        }

        // TAB 0: SIGN IN
        if (selectedTab == 0) {
            item {
                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text(
                            text = "Welcome Back",
                            color = TextCream,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )

                        OutlinedTextField(
                            value = signInEmail,
                            onValueChange = { signInEmail = it },
                            label = { Text("Work Email") },
                            placeholder = { Text("name@company.com") },
                            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = TextMuted) },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = LimePrimary,
                                unfocusedBorderColor = ObsidianBorder,
                                focusedTextColor = TextCream,
                                unfocusedTextColor = TextCream
                            )
                        )

                        OutlinedTextField(
                            value = signInPassword,
                            onValueChange = { signInPassword = it },
                            label = { Text("Password") },
                            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = TextMuted) },
                            trailingIcon = {
                                Text(
                                    text = if (showSignInPassword) "HIDE" else "SHOW",
                                    color = LimePrimary,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace,
                                    modifier = Modifier
                                        .clickable { showSignInPassword = !showSignInPassword }
                                        .padding(8.dp)
                                )
                            },
                            singleLine = true,
                            visualTransformation = if (showSignInPassword) VisualTransformation.None else PasswordVisualTransformation(),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = LimePrimary,
                                unfocusedBorderColor = ObsidianBorder,
                                focusedTextColor = TextCream,
                                unfocusedTextColor = TextCream
                            )
                        )

                        Spacer(modifier = Modifier.height(4.dp))

                        Button(
                            onClick = {
                                if (signInEmail.isBlank() || signInPassword.isBlank()) {
                                    errorMessage = "Please enter both email and password"
                                    return@Button
                                }
                                isLoading = true
                                errorMessage = null
                                scope.launch {
                                    val res = repository.signIn(signInEmail, signInPassword)
                                    isLoading = false
                                    if (res.success) {
                                        successMessage = "Signed in successfully! Welcome ${res.user?.name}."
                                        Toast.makeText(context, "Welcome ${res.user?.name}", Toast.LENGTH_SHORT).show()
                                        onAuthSuccess()
                                    } else {
                                        errorMessage = res.error ?: "Sign in failed"
                                    }
                                }
                            },
                            enabled = !isLoading,
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = LimePrimary,
                                contentColor = ObsidianBackground
                            ),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            if (isLoading) {
                                CircularProgressIndicator(modifier = Modifier.size(18.dp), color = ObsidianBackground, strokeWidth = 2.dp)
                            } else {
                                Text("Sign In with Email", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                        }

                        // Demo Quick Login
                        OutlinedButton(
                            onClick = {
                                signInEmail = "harsh@hmorix.in"
                                signInPassword = "demoPassword123"
                                scope.launch {
                                    isLoading = true
                                    val res = repository.signIn("harsh@hmorix.in", "demoPassword123")
                                    isLoading = false
                                    if (res.success) {
                                        Toast.makeText(context, "Logged in as Harsh Sharma", Toast.LENGTH_SHORT).show()
                                        onAuthSuccess()
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Fast Demo Login (Harsh Sharma / Admin)", color = LimePrimary, fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        // TAB 1: SIGN UP
        if (selectedTab == 1) {
            item {
                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text(
                            text = "Create HMorix Account",
                            color = TextCream,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )

                        OutlinedTextField(
                            value = signUpName,
                            onValueChange = { signUpName = it },
                            label = { Text("Full Name") },
                            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = TextMuted) },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = LimePrimary,
                                unfocusedBorderColor = ObsidianBorder,
                                focusedTextColor = TextCream
                            )
                        )

                        OutlinedTextField(
                            value = signUpEmail,
                            onValueChange = { signUpEmail = it },
                            label = { Text("Work Email") },
                            leadingIcon = { Icon(Icons.Default.Email, contentDescription = null, tint = TextMuted) },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = LimePrimary,
                                unfocusedBorderColor = ObsidianBorder,
                                focusedTextColor = TextCream
                            )
                        )

                        OutlinedTextField(
                            value = signUpCompany,
                            onValueChange = { signUpCompany = it },
                            label = { Text("Company / Organization") },
                            placeholder = { Text("e.g. Acme Agro Industries") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = LimePrimary,
                                unfocusedBorderColor = ObsidianBorder,
                                focusedTextColor = TextCream
                            )
                        )

                        OutlinedTextField(
                            value = signUpPassword,
                            onValueChange = { signUpPassword = it },
                            label = { Text("Password (8+ characters)") },
                            leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = TextMuted) },
                            singleLine = true,
                            visualTransformation = if (showSignUpPassword) VisualTransformation.None else PasswordVisualTransformation(),
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = LimePrimary,
                                unfocusedBorderColor = ObsidianBorder,
                                focusedTextColor = TextCream
                            )
                        )

                        Button(
                            onClick = {
                                if (signUpName.isBlank() || signUpEmail.isBlank() || signUpPassword.length < 8) {
                                    errorMessage = "Please enter valid name, email, and password (min 8 chars)"
                                    return@Button
                                }
                                isLoading = true
                                errorMessage = null
                                scope.launch {
                                    val res = repository.signUp(signUpName, signUpEmail, signUpPassword, signUpCompany)
                                    isLoading = false
                                    if (res.success) {
                                        successMessage = "Account created! Welcome to HMorix."
                                        Toast.makeText(context, "Account created successfully", Toast.LENGTH_SHORT).show()
                                        onAuthSuccess()
                                    } else {
                                        errorMessage = res.error ?: "Sign up failed"
                                    }
                                }
                            },
                            enabled = !isLoading,
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = LimePrimary,
                                contentColor = ObsidianBackground
                            ),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            if (isLoading) {
                                CircularProgressIndicator(modifier = Modifier.size(18.dp), color = ObsidianBackground)
                            } else {
                                Text("Create Account", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            }
                        }
                    }
                }
            }
        }

        // TAB 2: WEB & OAUTH TRANSFER
        if (selectedTab == 2) {
            item {
                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(8.dp)
                                    .clip(CircleShape)
                                    .background(AccentCyan)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Web OAuth & Session Bridge",
                                color = TextCream,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Text(
                            text = "Log in seamlessly using Google or GitHub via HMorix Web, or transfer your active session from your desktop portal.",
                            color = TextMuted,
                            fontSize = 12.sp,
                            lineHeight = 17.sp
                        )

                        // Google OAuth Button
                        Button(
                            onClick = {
                                webViewTargetUrl = "https://hmorix.in/api/auth/google"
                                showWebViewModal = true
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF222227),
                                contentColor = TextCream
                            ),
                            border = androidx.compose.foundation.BorderStroke(1.dp, ObsidianBorder),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("G", color = Color(0xFFEA4335), fontSize = 18.sp, fontWeight = FontWeight.Black)
                                Spacer(modifier = Modifier.width(10.dp))
                                Text("Continue with Google", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }

                        // GitHub OAuth Button
                        Button(
                            onClick = {
                                webViewTargetUrl = "https://hmorix.in/api/auth/github"
                                showWebViewModal = true
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF222227),
                                contentColor = TextCream
                            ),
                            border = androidx.compose.foundation.BorderStroke(1.dp, ObsidianBorder),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("🐙", fontSize = 16.sp)
                                Spacer(modifier = Modifier.width(10.dp))
                                Text("Continue with GitHub", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }

                        // In-App Web Login Sheet Button
                        OutlinedButton(
                            onClick = {
                                webViewTargetUrl = "https://hmorix.in/signin"
                                showWebViewModal = true
                            },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Share, contentDescription = null, tint = LimePrimary, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Interactive In-App Web Sign In", color = LimePrimary, fontSize = 13.sp)
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        // Manual Token / Key Paste
                        Text(
                            text = "OR PASTE WEB SESSION TOKEN",
                            color = TextSubtle,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )

                        OutlinedTextField(
                            value = webTokenInput,
                            onValueChange = { webTokenInput = it },
                            placeholder = { Text("Paste hm_session cookie or JWT token") },
                            singleLine = true,
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = LimePrimary,
                                unfocusedBorderColor = ObsidianBorder,
                                focusedTextColor = TextCream
                            )
                        )

                        Button(
                            onClick = {
                                if (webTokenInput.isBlank()) {
                                    errorMessage = "Please enter a valid session token or cookie"
                                    return@Button
                                }
                                repository.saveWebSession(webTokenInput.trim())
                                Toast.makeText(context, "Session transferred successfully!", Toast.LENGTH_SHORT).show()
                                onAuthSuccess()
                            },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = AccentCyan,
                                contentColor = ObsidianBackground
                            ),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Apply Web Session", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }

    // Interactive In-App WebView Dialog for Web OAuth & Cookie Sniffing
    if (showWebViewModal) {
        Dialog(
            onDismissRequest = { showWebViewModal = false },
            properties = DialogProperties(usePlatformDefaultWidth = false)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(ObsidianBackground)
            ) {
                Column(modifier = Modifier.fillMaxSize()) {
                    // Top Bar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(ObsidianCard)
                            .padding(horizontal = 16.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Image(
                                painter = painterResource(id = R.drawable.ic_logo_hex_lime),
                                contentDescription = null,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "HMorix Web Auth Bridge",
                                color = TextCream,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        IconButton(onClick = { showWebViewModal = false }) {
                            Icon(Icons.Default.Close, contentDescription = "Close", tint = TextMuted)
                        }
                    }

                    // WebView with cookie interceptor
                    AndroidView(
                        factory = { ctx ->
                            WebView(ctx).apply {
                                settings.javaScriptEnabled = true
                                settings.domStorageEnabled = true
                                settings.userAgentString = "Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36 HMorixApp/2.0"

                                webViewClient = object : WebViewClient() {
                                    override fun shouldOverrideUrlLoading(
                                        view: WebView?,
                                        request: WebResourceRequest?
                                    ): Boolean {
                                        val url = request?.url.toString()
                                        val cookies = CookieManager.getInstance().getCookie(url) ?: ""
                                        if (cookies.contains("hm_session=")) {
                                            val session = cookies.split(";")
                                                .firstOrNull { it.trim().startsWith("hm_session=") }
                                                ?.trim()
                                            if (session != null) {
                                                repository.saveWebSession(session)
                                                showWebViewModal = false
                                                onAuthSuccess()
                                                return true
                                            }
                                        }
                                        return false
                                    }

                                    override fun onPageFinished(view: WebView?, url: String?) {
                                        super.onPageFinished(view, url)
                                        val cookies = CookieManager.getInstance().getCookie(url) ?: ""
                                        if (cookies.contains("hm_session=")) {
                                            val session = cookies.split(";")
                                                .firstOrNull { it.trim().startsWith("hm_session=") }
                                                ?.trim()
                                            if (session != null) {
                                                repository.saveWebSession(session)
                                                showWebViewModal = false
                                                onAuthSuccess()
                                            }
                                        }
                                    }
                                }
                                loadUrl(webViewTargetUrl)
                            }
                        },
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        }
    }
}
