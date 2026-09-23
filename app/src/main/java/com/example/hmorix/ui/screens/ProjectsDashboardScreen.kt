package com.example.hmorix.ui.screens

import android.widget.Toast
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.hmorix.data.HMorixRepository
import com.example.hmorix.model.ProjectItem
import com.example.hmorix.ui.components.BrandBadge
import com.example.hmorix.ui.components.GlassCard
import com.example.hmorix.ui.components.MetricCard
import com.example.hmorix.ui.components.SectionHeader
import com.example.hmorix.ui.theme.AccentAmber
import com.example.hmorix.ui.theme.AccentCyan
import com.example.hmorix.ui.theme.AccentGreen
import com.example.hmorix.ui.theme.AccentPurple
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
import java.util.Locale

@Composable
fun ProjectsDashboardScreen(
    repository: HMorixRepository,
    onNavigateToTickets: () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val projects by repository.projects.collectAsState()
    var isRefreshing by remember { mutableStateOf(false) }
    var selectedFilter by remember { mutableStateOf("all") } // all, active, in_progress, completed, planning
    var showNewProjectDialog by remember { mutableStateOf(false) }

    // Form states
    var newProjectName by remember { mutableStateOf("") }
    var newProjectDesc by remember { mutableStateOf("") }
    var newProjectBudget by remember { mutableStateOf("50000") }
    var newProjectServices by remember { mutableStateOf("Enterprise Web, AI Agent") }

    LaunchedEffect(Unit) {
        if (projects.isEmpty()) {
            repository.fetchProjects()
        }
    }

    val filteredProjects = remember(projects, selectedFilter) {
        if (selectedFilter == "all") projects
        else projects.filter { it.status.equals(selectedFilter, ignoreCase = true) }
    }

    val totalBudget = remember(projects) { projects.sumOf { it.budget } }
    val activeCount = remember(projects) { projects.count { it.status in listOf("active", "in_progress") } }
    val completedCount = remember(projects) { projects.count { it.status == "completed" } }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Banner Header
        item {
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        BrandBadge("PROJECTS CLOUD DASHBOARD")

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = {
                                    isRefreshing = true
                                    scope.launch {
                                        repository.fetchProjects()
                                        isRefreshing = false
                                        Toast.makeText(context, "Projects updated", Toast.LENGTH_SHORT).show()
                                    }
                                },
                                modifier = Modifier.size(36.dp)
                            ) {
                                if (isRefreshing) {
                                    CircularProgressIndicator(modifier = Modifier.size(16.dp), color = LimePrimary, strokeWidth = 2.dp)
                                } else {
                                    Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = LimePrimary, modifier = Modifier.size(20.dp))
                                }
                            }

                            Spacer(modifier = Modifier.width(4.dp))

                            Button(
                                onClick = { showNewProjectDialog = true },
                                colors = ButtonDefaults.buttonColors(containerColor = LimePrimary, contentColor = ObsidianBackground),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("New Project", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Real Project Operations",
                        color = TextCream,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Track deliverables, development sprints, milestones, and team workload in real time.",
                        color = TextMuted,
                        fontSize = 12.sp,
                        lineHeight = 17.sp
                    )
                }
            }
        }

        // Metrics Row
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricCard(
                    title = "Active Sprints",
                    value = "$activeCount",
                    subtitle = "${projects.size} total engagements",
                    accentColor = LimePrimary,
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "Committed Budget",
                    value = "₹" + String.format(Locale.US, "%,.0f", totalBudget),
                    subtitle = "$completedCount completed to date",
                    accentColor = AccentCyan,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Filter Chips
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                val filters = listOf(
                    "all" to "All (${projects.size})",
                    "active" to "Active",
                    "in_progress" to "In Progress",
                    "completed" to "Completed",
                    "planning" to "Planning"
                )
                items(filters) { (key, label) ->
                    val isSelected = selectedFilter == key
                    FilterChip(
                        selected = isSelected,
                        onClick = { selectedFilter = key },
                        label = { Text(label) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = LimePrimary,
                            selectedLabelColor = ObsidianBackground,
                            containerColor = ObsidianCard,
                            labelColor = TextMuted
                        )
                    )
                }
            }
        }

        // Project Cards
        items(filteredProjects) { project ->
            ProjectCard(project = project, onRaiseTicket = onNavigateToTickets)
        }

        if (filteredProjects.isEmpty()) {
            item {
                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(vertical = 24.dp).fillMaxWidth()
                    ) {
                        Text("No projects found in this category", color = TextMuted, fontSize = 13.sp)
                    }
                }
            }
        }
    }

    // New Project Dialog
    if (showNewProjectDialog) {
        AlertDialog(
            onDismissRequest = { showNewProjectDialog = false },
            title = { Text("Request New Enterprise Project", color = TextCream, fontSize = 18.sp, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = newProjectName,
                        onValueChange = { newProjectName = it },
                        label = { Text("Project Title") },
                        placeholder = { Text("e.g. AI Customer Service Agent") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = LimePrimary,
                            unfocusedBorderColor = ObsidianBorder,
                            focusedTextColor = TextCream
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = newProjectDesc,
                        onValueChange = { newProjectDesc = it },
                        label = { Text("Scope & Requirements") },
                        placeholder = { Text("Describe deliverables and target goals...") },
                        maxLines = 3,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = LimePrimary,
                            unfocusedBorderColor = ObsidianBorder,
                            focusedTextColor = TextCream
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = newProjectBudget,
                        onValueChange = { newProjectBudget = it },
                        label = { Text("Estimated Budget (INR)") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = LimePrimary,
                            unfocusedBorderColor = ObsidianBorder,
                            focusedTextColor = TextCream
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = newProjectServices,
                        onValueChange = { newProjectServices = it },
                        label = { Text("Services (comma separated)") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = LimePrimary,
                            unfocusedBorderColor = ObsidianBorder,
                            focusedTextColor = TextCream
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (newProjectName.isBlank()) {
                            Toast.makeText(context, "Please enter project title", Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        val budgetVal = newProjectBudget.toDoubleOrNull() ?: 50000.0
                        val srvList = newProjectServices.split(",").map { it.trim() }.filter { it.isNotBlank() }
                        scope.launch {
                            repository.createProject(newProjectName, newProjectDesc, budgetVal, srvList)
                            showNewProjectDialog = false
                            Toast.makeText(context, "Project created successfully!", Toast.LENGTH_SHORT).show()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = LimePrimary, contentColor = ObsidianBackground)
                ) {
                    Text("Submit Project", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { showNewProjectDialog = false }) {
                    Text("Cancel", color = TextCream)
                }
            },
            containerColor = ObsidianCard
        )
    }
}

@Composable
fun ProjectCard(
    project: ProjectItem,
    onRaiseTicket: () -> Unit
) {
    val progressAnim by animateFloatAsState(
        targetValue = (project.progress.coerceIn(0, 100)) / 100f,
        label = "progress"
    )

    val (statusBg, statusColor, statusLabel) = when (project.status.lowercase()) {
        "completed" -> Triple(Color(0x2200E676), AccentGreen, "COMPLETED")
        "active" -> Triple(Color(0x22C8FF00), LimePrimary, "ACTIVE")
        "in_progress" -> Triple(Color(0x2200E5FF), AccentCyan, "IN PROGRESS")
        else -> Triple(Color(0x22FFB300), AccentAmber, "PLANNING")
    }

    GlassCard(modifier = Modifier.fillMaxWidth()) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            // Top Row: Title + Status
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = project.name,
                        color = TextCream,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Client: ${project.clientName}",
                        color = TextMuted,
                        fontSize = 12.sp
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(statusBg)
                        .border(1.dp, statusColor.copy(alpha = 0.4f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = statusLabel,
                        color = statusColor,
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            if (project.description.isNotBlank()) {
                Text(
                    text = project.description,
                    color = TextSubtle,
                    fontSize = 12.sp,
                    lineHeight = 16.sp
                )
            }

            // Services Pills
            if (project.services.isNotEmpty()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    project.services.take(3).forEach { srv ->
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(Color(0xFF222227))
                                .padding(horizontal = 6.dp, vertical = 3.dp)
                        ) {
                            Text(srv, color = TextCream, fontSize = 10.sp)
                        }
                    }
                }
            }

            // Progress Bar
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Sprint Progress", color = TextSubtle, fontSize = 11.sp)
                    Text(
                        text = "${project.progress}%",
                        color = LimePrimary,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(50))
                        .background(Color(0xFF222227))
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(progressAnim)
                            .height(6.dp)
                            .clip(RoundedCornerShape(50))
                            .background(
                                Brush.horizontalGradient(
                                    colors = listOf(AccentCyan, LimePrimary)
                                )
                            )
                    )
                }
            }

            // Bottom row: Budget + Deadline + Team
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Budget: ₹" + String.format(Locale.US, "%,.0f", project.budget),
                        color = TextCream,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        text = "Target: ${project.deadline}",
                        color = TextMuted,
                        fontSize = 11.sp
                    )
                }

                OutlinedButton(
                    onClick = onRaiseTicket,
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 2.dp),
                    shape = RoundedCornerShape(6.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, LimePrimary.copy(alpha = 0.5f))
                ) {
                    Text("Raise Ticket", color = LimePrimary, fontSize = 11.sp)
                }
            }
        }
    }
}
