package com.example.hmorix.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.Crossfade
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Menu
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.hmorix.R
import com.example.hmorix.data.HMorixRepository
import com.example.hmorix.ui.components.BrandBadge
import com.example.hmorix.ui.theme.AccentCyan
import com.example.hmorix.ui.theme.AccentGreen
import com.example.hmorix.ui.theme.LimePrimary
import com.example.hmorix.ui.theme.ObsidianBackground
import com.example.hmorix.ui.theme.ObsidianBorder
import com.example.hmorix.ui.theme.ObsidianCard
import com.example.hmorix.ui.theme.TextCream
import com.example.hmorix.ui.theme.TextMuted
import com.example.hmorix.ui.theme.TextSubtle

enum class NavItem(val label: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    HOME("Home", Icons.Default.Home),
    PROJECTS("Projects", Icons.Default.CheckCircle),
    BILLING("Billing", Icons.Default.DateRange),
    TICKETS("Tickets", Icons.Default.Email),
    AI_AGENT("AI Agent", Icons.Default.Star),
    PROFILE("Profile", Icons.Default.Person)
}

enum class SubScreen {
    NONE, SERVICES, CASES, FOUNDER, AUTH_FLOW
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(repository: HMorixRepository) {
    var showSplash by remember { mutableStateOf(true) }
    var selectedIndex by remember { mutableIntStateOf(0) }
    var currentSubScreen by remember { mutableStateOf(SubScreen.NONE) }
    val currentUser by repository.currentUser.collectAsState()
    val navItems = remember { NavItem.values() }

    Crossfade(targetState = showSplash, animationSpec = tween(500), label = "SplashCrossfade") { isSplash ->
        if (isSplash) {
            SplashScreen(onSplashFinished = { showSplash = false })
        } else {
            Scaffold(
                containerColor = ObsidianBackground,
                topBar = {
                    TopAppBar(
                        title = {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.clickable {
                                    selectedIndex = 0
                                    currentSubScreen = SubScreen.NONE
                                }
                            ) {
                                // Official Vector Hexagon Logo
                                Box(
                                    modifier = Modifier
                                        .size(34.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color(0xFF141416))
                                        .border(1.dp, Color(0x66C8FF00), RoundedCornerShape(8.dp))
                                        .padding(4.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Image(
                                        painter = painterResource(id = R.drawable.ic_logo_hex_lime),
                                        contentDescription = "HMorix Official Logo",
                                        modifier = Modifier.fillMaxSize()
                                    )
                                }

                                Spacer(modifier = Modifier.width(10.dp))

                                Column {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Text(
                                            text = "HMORIX",
                                            color = TextCream,
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Black,
                                            fontFamily = FontFamily.Monospace,
                                            letterSpacing = 1.sp
                                        )
                                        Spacer(modifier = Modifier.width(5.dp))
                                        Box(
                                            modifier = Modifier
                                                .size(6.dp)
                                                .clip(CircleShape)
                                                .background(LimePrimary)
                                        )
                                    }
                                    Text(
                                        text = "Enterprise AI & Cloud SaaS",
                                        color = TextSubtle,
                                        fontSize = 10.sp,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }
                        },
                        actions = {
                            // User Profile Avatar or Sign In button in Top Bar
                            if (currentUser != null) {
                                val user = currentUser!!
                                val initials = user.name.split(" ")
                                    .mapNotNull { it.firstOrNull()?.toString() }
                                    .take(2)
                                    .joinToString("")
                                    .uppercase()
                                    .ifEmpty { "HM" }

                                Row(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(50))
                                        .background(Color(0xFF222227))
                                        .border(1.dp, LimePrimary.copy(alpha = 0.5f), RoundedCornerShape(50))
                                        .clickable {
                                            selectedIndex = 5 // Profile tab
                                            currentSubScreen = SubScreen.NONE
                                        }
                                        .padding(horizontal = 8.dp, vertical = 4.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(20.dp)
                                            .clip(CircleShape)
                                            .background(LimePrimary),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = initials,
                                            color = ObsidianBackground,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            fontFamily = FontFamily.Monospace
                                        )
                                    }
                                    Text(
                                        text = user.name.substringBefore(" "),
                                        color = TextCream,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            } else {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(50))
                                        .background(Color(0x22C8FF00))
                                        .border(1.dp, LimePrimary.copy(alpha = 0.6f), RoundedCornerShape(50))
                                        .clickable {
                                            selectedIndex = 5
                                            currentSubScreen = SubScreen.NONE
                                        }
                                        .padding(horizontal = 10.dp, vertical = 5.dp)
                                ) {
                                    Text(
                                        text = "SIGN IN",
                                        color = LimePrimary,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace,
                                        letterSpacing = 0.5.sp
                                    )
                                }
                            }
                        },
                        colors = TopAppBarDefaults.topAppBarColors(
                            containerColor = ObsidianCard,
                            titleContentColor = TextCream
                        )
                    )
                },
                bottomBar = {
                    NavigationBar(
                        containerColor = ObsidianCard,
                        contentColor = LimePrimary,
                        tonalElevation = 8.dp
                    ) {
                        navItems.forEachIndexed { index, item ->
                            val isSelected = selectedIndex == index && currentSubScreen == SubScreen.NONE
                            NavigationBarItem(
                                selected = isSelected,
                                onClick = {
                                    selectedIndex = index
                                    currentSubScreen = SubScreen.NONE
                                },
                                icon = {
                                    Icon(
                                        imageVector = item.icon,
                                        contentDescription = item.label,
                                        modifier = Modifier.size(19.dp)
                                    )
                                },
                                label = {
                                    Text(
                                        text = item.label,
                                        fontSize = 9.5.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                    )
                                },
                                colors = NavigationBarItemDefaults.colors(
                                    selectedIconColor = ObsidianBackground,
                                    selectedTextColor = LimePrimary,
                                    indicatorColor = LimePrimary,
                                    unselectedIconColor = TextMuted,
                                    unselectedTextColor = TextMuted
                                )
                            )
                        }
                    }
                }
            ) { innerPadding ->
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(innerPadding)
                        .background(ObsidianBackground)
                ) {
                    // Sub-screens override
                    when (currentSubScreen) {
                        SubScreen.SERVICES -> ServicesScreen(repository = repository)
                        SubScreen.CASES -> CaseStudiesScreen(repository = repository)
                        SubScreen.FOUNDER -> FounderScreen()
                        SubScreen.AUTH_FLOW -> AuthScreen(
                            repository = repository,
                            onAuthSuccess = { currentSubScreen = SubScreen.NONE; selectedIndex = 5 }
                        )
                        SubScreen.NONE -> {
                            AnimatedContent(
                                targetState = selectedIndex,
                                transitionSpec = {
                                    fadeIn(animationSpec = tween(250)) togetherWith
                                            fadeOut(animationSpec = tween(180))
                                },
                                label = "ScreenTransition"
                            ) { targetIndex ->
                                when (navItems[targetIndex]) {
                                    NavItem.HOME -> HomeScreen(
                                        repository = repository,
                                        onNavigateToProjects = { selectedIndex = 1 },
                                        onNavigateToTickets = { selectedIndex = 3 },
                                        onNavigateToBilling = { selectedIndex = 2 },
                                        onNavigateToAgent = { selectedIndex = 4 },
                                        onNavigateToServices = { currentSubScreen = SubScreen.SERVICES },
                                        onNavigateToCaseStudies = { currentSubScreen = SubScreen.CASES },
                                        onNavigateToFounder = { currentSubScreen = SubScreen.FOUNDER }
                                    )
                                    NavItem.PROJECTS -> ProjectsDashboardScreen(
                                        repository = repository,
                                        onNavigateToTickets = { selectedIndex = 3 }
                                    )
                                    NavItem.BILLING -> BillingFlowScreen(repository = repository)
                                    NavItem.TICKETS -> TicketsScreen(repository = repository)
                                    NavItem.AI_AGENT -> AIAgentScreen()
                                    NavItem.PROFILE -> {
                                        if (currentUser != null) {
                                            ProfileSettingsScreen(
                                                repository = repository,
                                                onNavigateToAuth = { currentSubScreen = SubScreen.AUTH_FLOW }
                                            )
                                        } else {
                                            AuthScreen(
                                                repository = repository,
                                                onAuthSuccess = { selectedIndex = 5 }
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
