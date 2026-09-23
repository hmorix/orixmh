package com.example.hmorix.ui.screens

import android.widget.Toast
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.hmorix.data.HMorixRepository
import com.example.hmorix.model.SupportTicket
import com.example.hmorix.ui.components.BrandBadge
import com.example.hmorix.ui.components.GlassCard
import com.example.hmorix.ui.components.MetricCard
import com.example.hmorix.ui.theme.AccentAmber
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
fun TicketsScreen(repository: HMorixRepository) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val tickets by repository.tickets.collectAsState()
    val projects by repository.projects.collectAsState()

    var isRefreshing by remember { mutableStateOf(false) }
    var selectedFilter by remember { mutableStateOf("all") } // all, open, in_progress, resolved
    var showRaiseTicketDialog by remember { mutableStateOf(false) }

    // New Ticket fields
    var ticketSubject by remember { mutableStateOf("") }
    var ticketDescription by remember { mutableStateOf("") }
    var ticketPriority by remember { mutableStateOf("medium") }
    var selectedProjectId by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        if (tickets.isEmpty()) {
            repository.fetchTickets()
        }
    }

    val filteredTickets = remember(tickets, selectedFilter) {
        if (selectedFilter == "all") tickets
        else tickets.filter { it.status.equals(selectedFilter, ignoreCase = true) }
    }

    val openCount = remember(tickets) { tickets.count { it.status == "open" } }
    val inProgressCount = remember(tickets) { tickets.count { it.status == "in_progress" } }
    val resolvedCount = remember(tickets) { tickets.count { it.status == "resolved" } }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(ObsidianBackground),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        item {
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        BrandBadge("CLIENT SUPPORT DESK")

                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(
                                onClick = {
                                    isRefreshing = true
                                    scope.launch {
                                        repository.fetchTickets()
                                        isRefreshing = false
                                        Toast.makeText(context, "Tickets synchronized", Toast.LENGTH_SHORT).show()
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
                                onClick = { showRaiseTicketDialog = true },
                                colors = ButtonDefaults.buttonColors(containerColor = LimePrimary, contentColor = ObsidianBackground),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Raise Ticket", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "Enterprise Support & Triage",
                        color = TextCream,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Submit technical inquiries, billing discrepancies, and custom SLA requests directly to our core engineering teams.",
                        color = TextMuted,
                        fontSize = 12.sp,
                        lineHeight = 17.sp
                    )
                }
            }
        }

        // Summary Metric Cards
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                MetricCard(
                    title = "Active Inquiries",
                    value = "${openCount + inProgressCount}",
                    subtitle = "$openCount open, $inProgressCount in progress",
                    accentColor = AccentAmber,
                    modifier = Modifier.weight(1f)
                )
                MetricCard(
                    title = "Resolved Tickets",
                    value = "$resolvedCount",
                    subtitle = "Avg resolution < 2 hours",
                    accentColor = AccentGreen,
                    modifier = Modifier.weight(1f)
                )
            }
        }

        // Filter Chips
        item {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                val filters = listOf(
                    "all" to "All (${tickets.size})",
                    "open" to "Open ($openCount)",
                    "in_progress" to "In Progress ($inProgressCount)",
                    "resolved" to "Resolved ($resolvedCount)"
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

        // Ticket Items
        items(filteredTickets) { ticket ->
            TicketItemCard(ticket = ticket)
        }

        if (filteredTickets.isEmpty()) {
            item {
                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.padding(vertical = 28.dp).fillMaxWidth()
                    ) {
                        Text("No tickets found in this filter.", color = TextMuted, fontSize = 13.sp)
                    }
                }
            }
        }
    }

    // Raise Ticket Dialog
    if (showRaiseTicketDialog) {
        AlertDialog(
            onDismissRequest = { showRaiseTicketDialog = false },
            title = {
                Text(
                    text = "Raise Support Ticket",
                    color = TextCream,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = ticketSubject,
                        onValueChange = { ticketSubject = it },
                        label = { Text("Subject") },
                        placeholder = { Text("Brief summary of inquiry or issue") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = LimePrimary,
                            unfocusedBorderColor = ObsidianBorder,
                            focusedTextColor = TextCream
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = ticketDescription,
                        onValueChange = { ticketDescription = it },
                        label = { Text("Detailed Description") },
                        placeholder = { Text("Provide error codes, expected behavior, or requests...") },
                        maxLines = 4,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = LimePrimary,
                            unfocusedBorderColor = ObsidianBorder,
                            focusedTextColor = TextCream
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    // Priority Selector
                    Text("Select Priority", color = TextCream, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        listOf("low", "medium", "high", "urgent").forEach { prio ->
                            val isSel = ticketPriority == prio
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isSel) LimePrimary else Color(0xFF222227))
                                    .clickable { ticketPriority = prio }
                                    .padding(vertical = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = prio.uppercase(),
                                    color = if (isSel) ObsidianBackground else TextCream,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (ticketSubject.isBlank() || ticketDescription.isBlank()) {
                            Toast.makeText(context, "Please enter subject and description", Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        scope.launch {
                            val created = repository.createTicket(ticketSubject, ticketDescription, ticketPriority, selectedProjectId)
                            showRaiseTicketDialog = false
                            ticketSubject = ""
                            ticketDescription = ""
                            Toast.makeText(context, "Ticket created: ${created.number}", Toast.LENGTH_LONG).show()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = LimePrimary, contentColor = ObsidianBackground)
                ) {
                    Text("Submit Ticket", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                OutlinedButton(onClick = { showRaiseTicketDialog = false }) {
                    Text("Cancel", color = TextCream)
                }
            },
            containerColor = ObsidianCard
        )
    }
}

@Composable
fun TicketItemCard(ticket: SupportTicket) {
    val (statusBg, statusColor, statusLabel) = when (ticket.status.lowercase()) {
        "resolved" -> Triple(Color(0x2200E676), AccentGreen, "RESOLVED")
        "in_progress" -> Triple(Color(0x2200E5FF), AccentCyan, "IN PROGRESS")
        else -> Triple(Color(0x22FFB300), AccentAmber, "OPEN")
    }

    val (prioBg, prioColor) = when (ticket.priority.lowercase()) {
        "urgent" -> Pair(Color(0x22FF5252), AccentRed)
        "high" -> Pair(Color(0x22FF9100), Color(0xFFFF9100))
        "medium" -> Pair(Color(0x2200E5FF), AccentCyan)
        else -> Pair(Color(0x2200E676), AccentGreen)
    }

    GlassCard(modifier = Modifier.fillMaxWidth()) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            // Header Row: Number + Badges
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = ticket.number,
                        color = LimePrimary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(4.dp))
                            .background(prioBg)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = ticket.priority.uppercase(),
                            color = prioColor,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(statusBg)
                        .padding(horizontal = 6.dp, vertical = 2.dp)
                ) {
                    Text(
                        text = statusLabel,
                        color = statusColor,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            // Subject
            Text(
                text = ticket.subject,
                color = TextCream,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )

            // Description
            Text(
                text = ticket.description,
                color = TextMuted,
                fontSize = 12.sp,
                lineHeight = 16.sp
            )

            // Footer info
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = ticket.projectName,
                    color = TextSubtle,
                    fontSize = 11.sp
                )
                Text(
                    text = "Created: ${ticket.createdAt}",
                    color = TextSubtle,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace
                )
            }
        }
    }
}
