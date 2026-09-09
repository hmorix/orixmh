package com.example.hmorix.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.DateRange
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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import com.example.hmorix.ui.theme.LimePrimary
import com.example.hmorix.ui.theme.ObsidianBackground
import com.example.hmorix.ui.theme.ObsidianBorder
import com.example.hmorix.ui.theme.ObsidianCard
import com.example.hmorix.ui.theme.TextCream
import com.example.hmorix.ui.theme.TextMuted
import com.example.hmorix.ui.theme.TextSubtle

enum class NavItem(val label: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    HOME("Home", Icons.Default.Home),
    BILLING("Billing", Icons.Default.DateRange),
    AI_AGENT("AI Agent", Icons.Default.Star),
    SERVICES("Services", Icons.Default.Menu),
    CASES("Cases", Icons.Default.Info),
    FOUNDER("CEO", Icons.Default.Person)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainScreen(repository: HMorixRepository) {
    var selectedIndex by remember { mutableIntStateOf(0) }
    val navItems = remember { NavItem.values() }

    Scaffold(
        containerColor = ObsidianBackground,
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_hmorix_logo),
                            contentDescription = "HMorix Logo",
                            modifier = Modifier
                                .size(28.dp)
                                .clip(CircleShape)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "HMORIX",
                                    color = TextCream,
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace,
                                    letterSpacing = 1.sp
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .clip(CircleShape)
                                        .background(LimePrimary)
                                )
                            }
                            Text(
                                text = "Enterprise AI & BillingFlow",
                                color = TextSubtle,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }
                },
                actions = {
                    BrandBadge("LIVE")
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
                    val isSelected = selectedIndex == index
                    NavigationBarItem(
                        selected = isSelected,
                        onClick = { selectedIndex = index },
                        icon = {
                            Icon(
                                imageVector = item.icon,
                                contentDescription = item.label,
                                modifier = Modifier.size(20.dp)
                            )
                        },
                        label = {
                            Text(
                                text = item.label,
                                fontSize = 10.sp,
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
            AnimatedContent(
                targetState = selectedIndex,
                transitionSpec = { fadeIn() togetherWith fadeOut() },
                label = "ScreenTransition"
            ) { targetIndex ->
                when (navItems[targetIndex]) {
                    NavItem.HOME -> HomeScreen(
                        repository = repository,
                        onNavigateToBilling = { selectedIndex = 1 },
                        onNavigateToAgent = { selectedIndex = 2 },
                        onNavigateToServices = { selectedIndex = 3 },
                        onNavigateToCaseStudies = { selectedIndex = 4 },
                        onNavigateToFounder = { selectedIndex = 5 }
                    )
                    NavItem.BILLING -> BillingFlowScreen(repository = repository)
                    NavItem.AI_AGENT -> AIAgentScreen()
                    NavItem.SERVICES -> ServicesScreen(repository = repository)
                    NavItem.CASES -> CaseStudiesScreen(repository = repository)
                    NavItem.FOUNDER -> FounderScreen()
                }
            }
        }
    }
}
