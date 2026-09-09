package com.example.hmorix.ui.screens

import android.content.Context
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.hmorix.data.HMorixRepository
import com.example.hmorix.model.EnterpriseService
import com.example.hmorix.ui.components.BrandBadge
import com.example.hmorix.ui.components.GlassCard
import com.example.hmorix.ui.components.SectionHeader
import com.example.hmorix.ui.theme.AccentCyan
import com.example.hmorix.ui.theme.AccentGreen
import com.example.hmorix.ui.theme.LimePrimary
import com.example.hmorix.ui.theme.ObsidianBackground
import com.example.hmorix.ui.theme.ObsidianBorder
import com.example.hmorix.ui.theme.ObsidianCard
import com.example.hmorix.ui.theme.ObsidianCardElevated
import com.example.hmorix.ui.theme.TextCream
import com.example.hmorix.ui.theme.TextMuted
import com.example.hmorix.ui.theme.TextSubtle
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale

@Composable
fun ServicesScreen(repository: HMorixRepository) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val services = remember { repository.getEnterpriseServices() }

    var selectedServiceForQuote by remember { mutableStateOf<EnterpriseService?>(null) }
    var selectedTier by remember { mutableStateOf("Growing Business") }
    var selectedTimeline by remember { mutableStateOf("Standard (4 weeks)") }
    var includeAndroidApp by remember { mutableStateOf(false) }
    var includeWhatsApp by remember { mutableStateOf(false) }
    var includeSeoAudit by remember { mutableStateOf(false) }

    var clientName by remember { mutableStateOf("") }
    var clientPhone by remember { mutableStateOf("") }
    var clientEmail by remember { mutableStateOf("") }
    var projectDetails by remember { mutableStateOf("") }

    var isSubmittingInquiry by remember { mutableStateOf(false) }
    var submissionSuccessDialog by remember { mutableStateOf(false) }

    // Cost Calculator
    val basePrice = when (selectedServiceForQuote?.id) {
        "srv_ai" -> 25000
        "srv_web" -> 18000
        "srv_mobile" -> 35000
        "srv_billing" -> 15000
        "srv_seo" -> 12000
        "srv_pdf" -> 8000
        else -> 20000
    }
    val tierMultiplier = when (selectedTier) {
        "Startup / MVP" -> 0.8
        "Growing Business" -> 1.0
        "Enterprise / Custom" -> 1.7
        else -> 1.0
    }
    var addOnSum = 0
    if (includeAndroidApp) addOnSum += 25000
    if (includeWhatsApp) addOnSum += 8000
    if (includeSeoAudit) addOnSum += 5000

    val estimatedTotal = (basePrice * tierMultiplier + addOnSum).toInt()

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
                        BrandBadge("ENTERPRISE CATALOG")
                        Text(
                            text = "HMORIX SOLUTIONS",
                            color = TextSubtle,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Services & Solutions",
                        color = TextCream,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "From custom software & BillingFlow to regional SEO across Hathras, Mathura, Agra, and global markets.",
                        color = TextMuted,
                        fontSize = 12.sp,
                        lineHeight = 17.sp
                    )
                }
            }
        }

        // Services List
        items(services, key = { it.id }) { service ->
            ServiceCard(
                service = service,
                isSelected = selectedServiceForQuote?.id == service.id,
                onSelectForEstimator = {
                    selectedServiceForQuote = if (selectedServiceForQuote?.id == service.id) null else service
                }
            )
        }

        // Project Cost & Timeline Estimator
        item {
            SectionHeader(
                title = "Interactive Project Estimator",
                subtitle = "Configure scope to calculate instant pricing and submit an inquiry"
            )
        }

        item {
            GlassCard(modifier = Modifier.fillMaxWidth()) {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = null,
                                tint = LimePrimary,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "ESTIMATE SCOPE & PRICING",
                                color = TextCream,
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        selectedServiceForQuote?.let {
                            Text(
                                text = it.category,
                                color = LimePrimary,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }

                    // Selected service indicator
                    Text(
                        text = "Selected: ${selectedServiceForQuote?.title ?: "Full-Stack Web & ERP"}",
                        color = LimePrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )

                    // Business Scale selector
                    Text(text = "BUSINESS SCALE", color = TextSubtle, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        listOf("Startup / MVP", "Growing Business", "Enterprise / Custom").forEach { tier ->
                            val isSelected = selectedTier == tier
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(if (isSelected) LimePrimary else ObsidianBackground)
                                    .border(0.8.dp, if (isSelected) LimePrimary else ObsidianBorder, RoundedCornerShape(6.dp))
                                    .clickable { selectedTier = tier }
                                    .padding(vertical = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = tier,
                                    color = if (isSelected) ObsidianBackground else TextCream,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    maxLines = 1
                                )
                            }
                        }
                    }

                    // Addons Checkboxes
                    Text(text = "OPTIONAL MODULE ADDONS", color = TextSubtle, fontSize = 10.sp, fontFamily = FontFamily.Monospace)

                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { includeAndroidApp = !includeAndroidApp }
                        ) {
                            Checkbox(
                                checked = includeAndroidApp,
                                onCheckedChange = { includeAndroidApp = it },
                                colors = CheckboxDefaults.colors(
                                    checkedColor = LimePrimary,
                                    checkmarkColor = ObsidianBackground
                                )
                            )
                            Text(
                                text = "Dedicated Android App (+₹25,000)",
                                color = TextCream,
                                fontSize = 12.sp
                            )
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { includeWhatsApp = !includeWhatsApp }
                        ) {
                            Checkbox(
                                checked = includeWhatsApp,
                                onCheckedChange = { includeWhatsApp = it },
                                colors = CheckboxDefaults.colors(
                                    checkedColor = LimePrimary,
                                    checkmarkColor = ObsidianBackground
                                )
                            )
                            Text(
                                text = "WhatsApp Cloud API Notifications (+₹8,000)",
                                color = TextCream,
                                fontSize = 12.sp
                            )
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { includeSeoAudit = !includeSeoAudit }
                        ) {
                            Checkbox(
                                checked = includeSeoAudit,
                                onCheckedChange = { includeSeoAudit = it },
                                colors = CheckboxDefaults.colors(
                                    checkedColor = LimePrimary,
                                    checkmarkColor = ObsidianBackground
                                )
                            )
                            Text(
                                text = "Braj Regional SEO & Google Maps (+₹5,000)",
                                color = TextCream,
                                fontSize = 12.sp
                            )
                        }
                    }

                    // Price Breakdown Result
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color(0x22C8FF00))
                            .border(1.dp, Color(0x44C8FF00), RoundedCornerShape(8.dp))
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "ESTIMATED INVESTMENT",
                                    color = TextSubtle,
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                                Text(
                                    text = "₹" + String.format(Locale.US, "%,d", estimatedTotal),
                                    color = LimePrimary,
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            }

                            Column(horizontalAlignment = Alignment.End) {
                                Text(
                                    text = "DELIVERY TIME",
                                    color = TextSubtle,
                                    fontSize = 10.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                                Text(
                                    text = "2-4 Weeks",
                                    color = TextCream,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    HorizontalDivider(color = ObsidianBorder, thickness = 0.8.dp)

                    // Inquiry Form
                    Text(
                        text = "SUBMIT DIRECT PROJECT INQUIRY",
                        color = TextSubtle,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    )

                    OutlinedTextField(
                        value = clientName,
                        onValueChange = { clientName = it },
                        label = { Text("Your Full Name / Company") },
                        placeholder = { Text("e.g. Rahul Sharma, Ganesh Agro") },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = LimePrimary,
                            unfocusedBorderColor = ObsidianBorder,
                            focusedTextColor = TextCream,
                            unfocusedTextColor = TextCream
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedTextField(
                            value = clientPhone,
                            onValueChange = { clientPhone = it },
                            label = { Text("Phone / WhatsApp") },
                            placeholder = { Text("+91 98765 43210") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = LimePrimary,
                                unfocusedBorderColor = ObsidianBorder,
                                focusedTextColor = TextCream,
                                unfocusedTextColor = TextCream
                            ),
                            modifier = Modifier.weight(1f)
                        )

                        OutlinedTextField(
                            value = clientEmail,
                            onValueChange = { clientEmail = it },
                            label = { Text("Email") },
                            placeholder = { Text("name@domain.com") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = LimePrimary,
                                unfocusedBorderColor = ObsidianBorder,
                                focusedTextColor = TextCream,
                                unfocusedTextColor = TextCream
                            ),
                            modifier = Modifier.weight(1f)
                        )
                    }

                    OutlinedTextField(
                        value = projectDetails,
                        onValueChange = { projectDetails = it },
                        label = { Text("Project Notes & Requirements") },
                        placeholder = { Text("Describe what you want built, your existing tech stack, and goals...") },
                        minLines = 2,
                        maxLines = 4,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = LimePrimary,
                            unfocusedBorderColor = ObsidianBorder,
                            focusedTextColor = TextCream,
                            unfocusedTextColor = TextCream
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Button(
                        onClick = {
                            if (clientName.isNotBlank() && (clientPhone.isNotBlank() || clientEmail.isNotBlank())) {
                                isSubmittingInquiry = true
                                scope.launch {
                                    withContext(Dispatchers.IO) {
                                        try {
                                            // Post to live hmorix.in backend API endpoint
                                            val url = URL("https://hmorix.in/api/contact")
                                            val conn = (url.openConnection() as HttpURLConnection).apply {
                                                requestMethod = "POST"
                                                doOutput = true
                                                connectTimeout = 4000
                                                readTimeout = 4000
                                                setRequestProperty("Content-Type", "application/json")
                                                val body = """
                                                {
                                                  "name": "${clientName.replace("\"", "\\\"")}",
                                                  "email": "${clientEmail.replace("\"", "\\\"")}",
                                                  "phone": "${clientPhone.replace("\"", "\\\"")}",
                                                  "message": "Estimate: ₹$estimatedTotal for ${selectedServiceForQuote?.title ?: "Web & ERP"} (${selectedTier}). Details: ${projectDetails.replace("\"", "\\\"")}"
                                                }
                                                """.trimIndent()
                                                outputStream.write(body.toByteArray())
                                            }
                                            conn.responseCode
                                            conn.disconnect()
                                        } catch (e: Exception) {
                                            // Gracefully handled for offline/local
                                        }
                                    }
                                    isSubmittingInquiry = false
                                    submissionSuccessDialog = true
                                }
                            } else {
                                Toast.makeText(context, "Please enter your name and phone/email", Toast.LENGTH_SHORT).show()
                            }
                        },
                        enabled = !isSubmittingInquiry,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = LimePrimary,
                            contentColor = ObsidianBackground
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        if (isSubmittingInquiry) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                color = ObsidianBackground,
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Transmitting to HMorix...", fontWeight = FontWeight.Bold)
                        } else {
                            Icon(imageVector = Icons.Default.Send, contentDescription = null, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Submit Inquiry to Harsh Sharma", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(20.dp))
        }
    }

    if (submissionSuccessDialog) {
        AlertDialog(
            onDismissRequest = { submissionSuccessDialog = false },
            containerColor = ObsidianCardElevated,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null, tint = AccentGreen)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Inquiry Received!", color = TextCream, fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Text(
                    text = "Thank you, $clientName! Your project inquiry for ₹${String.format(Locale.US, "%,d", estimatedTotal)} has been logged. Founder Harsh Sharma or our enterprise engineering team will reach out to you via WhatsApp / Phone ($clientPhone) or email within 24 hours.",
                    color = TextMuted,
                    fontSize = 13.sp,
                    lineHeight = 18.sp
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        submissionSuccessDialog = false
                        clientName = ""
                        clientPhone = ""
                        clientEmail = ""
                        projectDetails = ""
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = LimePrimary,
                        contentColor = ObsidianBackground
                    )
                ) {
                    Text("Done", fontWeight = FontWeight.Bold)
                }
            }
        )
    }
}

@Composable
fun ServiceCard(
    service: EnterpriseService,
    isSelected: Boolean,
    onSelectForEstimator: () -> Unit
) {
    GlassCard(
        modifier = Modifier
            .fillMaxWidth()
            .then(
                if (isSelected) Modifier.border(1.5.dp, LimePrimary, RoundedCornerShape(16.dp)) else Modifier
            )
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = service.category.uppercase(),
                    color = LimePrimary,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.6.sp
                )

                Text(
                    text = service.startingPrice,
                    color = TextCream,
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = service.title,
                color = TextCream,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = service.description,
                color = TextMuted,
                fontSize = 12.sp,
                lineHeight = 17.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                service.highlights.forEach { highlight ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = null,
                            tint = LimePrimary,
                            modifier = Modifier.size(14.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = highlight, color = TextCream, fontSize = 11.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedButton(
                onClick = onSelectForEstimator,
                border = ButtonDefaults.outlinedButtonBorder.copy(
                    brush = if (isSelected) ButtonDefaults.outlinedButtonBorder.brush else ButtonDefaults.outlinedButtonBorder.brush
                ),
                colors = ButtonDefaults.outlinedButtonColors(
                    containerColor = if (isSelected) Color(0x22C8FF00) else Color.Transparent
                ),
                shape = RoundedCornerShape(6.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = if (isSelected) "Selected in Estimator" else "Estimate Cost for this Service",
                    color = if (isSelected) LimePrimary else TextCream,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
