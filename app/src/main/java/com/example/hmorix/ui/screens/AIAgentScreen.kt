package com.example.hmorix.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
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
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.hmorix.model.AgentExecutionStep
import com.example.hmorix.model.ChatMessage
import com.example.hmorix.ui.components.BrandBadge
import com.example.hmorix.ui.components.GlassCard
import com.example.hmorix.ui.theme.AccentCyan
import com.example.hmorix.ui.theme.AccentGreen
import com.example.hmorix.ui.theme.AccentPurple
import com.example.hmorix.ui.theme.LimePrimary
import com.example.hmorix.ui.theme.ObsidianBackground
import com.example.hmorix.ui.theme.ObsidianBorder
import com.example.hmorix.ui.theme.ObsidianCard
import com.example.hmorix.ui.theme.ObsidianCardElevated
import com.example.hmorix.ui.theme.TextCream
import com.example.hmorix.ui.theme.TextMuted
import com.example.hmorix.ui.theme.TextSubtle
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun AIAgentScreen() {
    var selectedTab by remember { mutableIntStateOf(0) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianBackground)
    ) {
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
                onClick = { selectedTab = 0 },
                text = {
                    Text(
                        "Autonomous Agent",
                        fontWeight = if (selectedTab == 0) FontWeight.Bold else FontWeight.Normal,
                        color = if (selectedTab == 0) LimePrimary else TextMuted
                    )
                }
            )
            Tab(
                selected = selectedTab == 1,
                onClick = { selectedTab = 1 },
                text = {
                    Text(
                        "AI SEO & Strategy Chat",
                        fontWeight = if (selectedTab == 1) FontWeight.Bold else FontWeight.Normal,
                        color = if (selectedTab == 1) LimePrimary else TextMuted
                    )
                }
            )
        }

        if (selectedTab == 0) {
            AutonomousAgentPlayground()
        } else {
            AIAssistantChatView()
        }
    }
}

@Composable
fun AutonomousAgentPlayground() {
    val scope = rememberCoroutineScope()
    var promptInput by remember {
        mutableStateOf("Build a high-volume GST billing and inventory ERP for brassware manufacturing in Hathras with automated WhatsApp dispatch.")
    }

    val steps = remember {
        mutableStateListOf(
            AgentExecutionStep("Requirements Analysis", "Decomposing user intent into functional domain modules..."),
            AgentExecutionStep("System Architecture", "Generating microservices blueprint & event pipelines..."),
            AgentExecutionStep("Database Schema", "Designing relational tables, GST indexes & ACID audit trails..."),
            AgentExecutionStep("API Endpoints", "Synthesizing RESTful CRUD routes with JWT security..."),
            AgentExecutionStep("UI Component Design", "Composing Jetpack Compose & responsive web screens..."),
            AgentExecutionStep("Security & Compliance", "Validating GSTIN tax rules, rate limits & encryption..."),
            AgentExecutionStep("Automated Tests", "Running unit tests, validation suites & health checks..."),
            AgentExecutionStep("Artifact Packaging", "Containerizing Docker image and provisioning deployment artifact...")
        )
    }

    var isRunning by remember { mutableStateOf(false) }
    var currentStepIndex by remember { mutableIntStateOf(-1) }
    var executionCompleted by remember { mutableStateOf(false) }
    var generatedArtifact by remember { mutableStateOf<String?>(null) }

    val quickTemplates = listOf(
        "Hathras Brass Manufacturing ERP & GST Billing",
        "Mathura & Vrindavan Hotel Booking AI Agent",
        "Agra Handicraft Global Export SEO & Portal",
        "24/7 Autonomous Customer Support Ticket Resolver"
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        BrandBadge("AUTONOMOUS AGENT RUNTIME")
                        Text(
                            text = "HMORIX ORCHESTRATION",
                            color = TextSubtle,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Autonomous Software Agent",
                        color = TextCream,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Feed natural language requirements and watch the HMorix autonomous engine synthesize architecture, schema, APIs, and production UI components.",
                        color = TextMuted,
                        fontSize = 12.sp,
                        lineHeight = 17.sp
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Templates
                    Text(
                        text = "QUICK TEMPLATES",
                        color = TextSubtle,
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        items(quickTemplates) { template ->
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(ObsidianBackground)
                                    .border(0.8.dp, ObsidianBorder, RoundedCornerShape(6.dp))
                                    .clickable { promptInput = template }
                                    .padding(horizontal = 8.dp, vertical = 5.dp)
                            ) {
                                Text(
                                    text = template,
                                    color = LimePrimary,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = promptInput,
                        onValueChange = { promptInput = it },
                        label = { Text("System Specification & Goals") },
                        minLines = 3,
                        maxLines = 5,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = LimePrimary,
                            unfocusedBorderColor = ObsidianBorder,
                            focusedLabelColor = LimePrimary,
                            unfocusedLabelColor = TextMuted,
                            focusedTextColor = TextCream,
                            unfocusedTextColor = TextCream
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    Button(
                        onClick = {
                            if (!isRunning) {
                                isRunning = true
                                executionCompleted = false
                                generatedArtifact = null
                                scope.launch {
                                    for (i in 0 until steps.size) {
                                        currentStepIndex = i
                                        steps[i] = steps[i].copy(isRunning = true, isCompleted = false)
                                        delay(850)
                                        steps[i] = steps[i].copy(isRunning = false, isCompleted = true)
                                    }
                                    isRunning = false
                                    executionCompleted = true
                                    generatedArtifact = """
                                    [HMORIX AUTONOMOUS AGENT BLUEPRINT]
                                    Project: ${promptInput.take(45)}...
                                    Status: READY FOR PRODUCTION DEPLOYMENT
                                    
                                    1. Domain Architecture:
                                       - Core Billing Service (BillingFlow GST Engine)
                                       - Realtime WhatsApp Dispatch Gateway
                                       - Inventory Ledger & Order State Machine
                                    
                                    2. Database Schemas:
                                       - tables: organizations, clients, invoices, line_items, audit_logs
                                       - compliance: 18% GST CGST/SGST split, HSN lookup
                                    
                                    3. Synthesized Endpoints:
                                       - POST /api/v1/billing/invoices/generate
                                       - POST /api/v1/inventory/reconcile
                                       - GET  /api/v1/reports/gst-gstr1
                                    
                                    4. Deployed Target:
                                       - Edge Gateway: https://billingflow.hmorix.in
                                    """.trimIndent()
                                }
                            }
                        },
                        enabled = !isRunning && promptInput.isNotBlank(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = LimePrimary,
                            contentColor = ObsidianBackground,
                            disabledContainerColor = ObsidianCardElevated,
                            disabledContentColor = TextSubtle
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        if (isRunning) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                color = ObsidianBackground,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Agent Executing Pipeline...", fontWeight = FontWeight.Bold)
                        } else {
                            Icon(imageVector = Icons.Default.PlayArrow, contentDescription = null)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Run Autonomous Agent Pipeline", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Live Pipeline Steps
        if (currentStepIndex >= 0) {
            item {
                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "PIPELINE EXECUTION LOG",
                                color = TextSubtle,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                            if (isRunning) {
                                Text(
                                    text = "Step ${currentStepIndex + 1}/${steps.size}",
                                    color = LimePrimary,
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                            } else if (executionCompleted) {
                                Text(
                                    text = "COMPLETE (100%)",
                                    color = AccentGreen,
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        LinearProgressIndicator(
                            progress = {
                                if (steps.isEmpty()) 0f else (steps.count { it.isCompleted }.toFloat() / steps.size)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(4.dp)
                                .clip(RoundedCornerShape(2.dp)),
                            color = LimePrimary,
                            trackColor = ObsidianBackground
                        )

                        steps.forEachIndexed { idx, step ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(
                                        when {
                                            step.isRunning -> Color(0x22C8FF00)
                                            step.isCompleted -> Color(0x1500E676)
                                            else -> ObsidianBackground
                                        }
                                    )
                                    .padding(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier.size(20.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (step.isCompleted) {
                                        Icon(
                                            imageVector = Icons.Default.CheckCircle,
                                            contentDescription = null,
                                            tint = AccentGreen,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    } else if (step.isRunning) {
                                        CircularProgressIndicator(
                                            modifier = Modifier.size(14.dp),
                                            color = LimePrimary,
                                            strokeWidth = 2.dp
                                        )
                                    } else {
                                        Box(
                                            modifier = Modifier
                                                .size(6.dp)
                                                .clip(CircleShape)
                                                .background(TextSubtle)
                                        )
                                    }
                                }

                                Spacer(modifier = Modifier.width(10.dp))

                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "${idx + 1}. ${step.title}",
                                        color = if (step.isRunning || step.isCompleted) TextCream else TextMuted,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = step.detail,
                                        color = if (step.isRunning) LimePrimary else TextSubtle,
                                        fontSize = 11.sp,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        // Generated Artifact output
        generatedArtifact?.let { artifact ->
            item {
                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "SYNTHESIZED ARTIFACT",
                                color = LimePrimary,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = null,
                                tint = LimePrimary,
                                modifier = Modifier.size(16.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(8.dp))
                                .background(ObsidianBackground)
                                .border(1.dp, ObsidianBorder, RoundedCornerShape(8.dp))
                                .padding(12.dp)
                        ) {
                            Text(
                                text = artifact,
                                color = TextCream,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                lineHeight = 16.sp
                            )
                        }
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

@Composable
fun AIAssistantChatView() {
    val messages = remember {
        mutableStateListOf(
            ChatMessage(
                id = "1",
                sender = "assistant",
                text = "Hello! I am the HMorix Enterprise AI Assistant. I can help analyze your SEO ranking in Hathras, Mathura, Agra, explain BillingFlow GST automation, or architect custom software. How can I assist you today?"
            )
        )
    }

    var textInput by remember { mutableStateOf("") }

    val suggestedQuestions = listOf(
        "How to rank #1 in Hathras on Google?",
        "How does BillingFlow calculate 18% GST?",
        "What is the cost of custom ERP development?",
        "How to integrate WhatsApp for order receipts?"
    )

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianBackground)
    ) {
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = 16.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Text(
                    text = "SUGGESTED CONSULTATION QUERIES",
                    color = TextSubtle,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace
                )
                Spacer(modifier = Modifier.height(6.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    items(suggestQuestions(textInput, suggestedQuestions)) { q ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(ObsidianCard)
                                .border(0.8.dp, ObsidianBorder, RoundedCornerShape(6.dp))
                                .clickable {
                                    sendUserMessage(q, messages)
                                }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(text = q, color = LimePrimary, fontSize = 11.sp)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                HorizontalDivider(color = ObsidianBorder, thickness = 0.8.dp)
            }

            items(messages, key = { it.id }) { msg ->
                val isUser = msg.sender == "user"
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(0.85f)
                            .clip(
                                RoundedCornerShape(
                                    topStart = 12.dp,
                                    topEnd = 12.dp,
                                    bottomStart = if (isUser) 12.dp else 2.dp,
                                    bottomEnd = if (isUser) 2.dp else 12.dp
                                )
                            )
                            .background(if (isUser) Color(0xFF1E2600) else ObsidianCardElevated)
                            .border(
                                1.dp,
                                if (isUser) LimePrimary.copy(alpha = 0.5f) else ObsidianBorder,
                                RoundedCornerShape(12.dp)
                            )
                            .padding(12.dp)
                    ) {
                        Column {
                            Text(
                                text = if (isUser) "You" else "HMorix Assistant",
                                color = if (isUser) LimePrimary else AccentCyan,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = msg.text,
                                color = TextCream,
                                fontSize = 13.sp,
                                lineHeight = 18.sp
                            )
                        }
                    }
                }
            }
        }

        // Input bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(ObsidianCard)
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = textInput,
                onValueChange = { textInput = it },
                placeholder = { Text("Ask about SEO, software, or BillingFlow...", fontSize = 12.sp) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = LimePrimary,
                    unfocusedBorderColor = ObsidianBorder,
                    focusedTextColor = TextCream,
                    unfocusedTextColor = TextCream
                ),
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier.weight(1f)
            )

            IconButton(
                onClick = {
                    if (textInput.isNotBlank()) {
                        val text = textInput.trim()
                        textInput = ""
                        sendUserMessage(text, messages)
                    }
                },
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(LimePrimary)
            ) {
                Icon(
                    imageVector = Icons.Default.Send,
                    contentDescription = "Send",
                    tint = ObsidianBackground,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

private fun suggestQuestions(current: String, defaults: List<String>): List<String> = defaults

private fun sendUserMessage(text: String, messages: MutableList<ChatMessage>) {
    messages.add(ChatMessage(id = System.currentTimeMillis().toString(), sender = "user", text = text))

    val reply = when {
        text.contains("Hathras", ignoreCase = true) || text.contains("SEO", ignoreCase = true) -> {
            "For dominating Google search in Hathras and the Braj region: HMorix implements localized JSON-LD schema (City, GeoCoordinates), Google Business Profile optimization, fast Next.js static pages, and regional long-tail keyword targeting. Our clients in Hathras and Agra have achieved #1 organic rankings within 60-90 days."
        }
        text.contains("GST", ignoreCase = true) || text.contains("BillingFlow", ignoreCase = true) -> {
            "BillingFlow handles automated 18% GST (CGST 9% + SGST 9% for intra-state, or IGST 18% for inter-state), with instant invoice numbering (INV-YYYY-XXXX), multi-currency conversion, cryptographic tamper-proof PDF generation, and direct payment link dispatch."
        }
        text.contains("cost", ignoreCase = true) || text.contains("price", ignoreCase = true) || text.contains("ERP", ignoreCase = true) -> {
            "Custom enterprise ERP development starts at ₹35,000 to ₹75,000 depending on complexity. It includes full inventory state management, BillingFlow GST integration, multi-user role access, and optional Android app integration."
        }
        text.contains("WhatsApp", ignoreCase = true) -> {
            "HMorix integrates automated WhatsApp Business Cloud APIs to send instant PDF invoices, order confirmations, and payment links with QR codes directly to your clients' phones."
        }
        else -> {
            "HMorix delivers end-to-end digital solutions: from BillingFlow invoicing and custom ERPs to autonomous AI agents and Braj regional SEO. You can also explore our Case Studies or submit an inquiry directly in the Services tab!"
        }
    }

    messages.add(ChatMessage(id = (System.currentTimeMillis() + 1).toString(), sender = "assistant", text = reply))
}
