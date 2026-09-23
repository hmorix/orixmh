package com.example.hmorix.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
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
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
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
import com.example.hmorix.model.Invoice
import com.example.hmorix.model.InvoiceItem
import com.example.hmorix.model.InvoiceStatus
import com.example.hmorix.ui.components.BrandBadge
import com.example.hmorix.ui.components.GlassCard
import com.example.hmorix.ui.components.MetricCard
import com.example.hmorix.ui.components.StatusChip
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
import java.util.Locale

@Composable
fun BillingFlowScreen(repository: HMorixRepository) {
    val context = LocalContext.current
    val invoices by repository.invoices.collectAsState()

    var selectedTopTab by remember { mutableIntStateOf(0) } // 0: Invoices & GST, 1: SaaS Pricing Plans
    var selectedStatusFilter by remember { mutableStateOf<InvoiceStatus?>(null) }
    var viewingInvoice by remember { mutableStateOf<Invoice?>(null) }
    var isEditingNewInvoice by remember { mutableStateOf(false) }

    val pricingPlans = remember { repository.getPricingPlans() }

    val filteredInvoices = remember(invoices, selectedStatusFilter) {
        if (selectedStatusFilter == null) invoices else invoices.filter { it.status == selectedStatusFilter }
    }

    val totalBilled = remember(invoices) {
        invoices.filter { it.currency == "INR" }.sumOf { it.totalDue }
    }
    val totalPaid = remember(invoices) {
        invoices.filter { it.status == InvoiceStatus.PAID && it.currency == "INR" }.sumOf { it.totalDue }
    }
    val totalPending = remember(invoices) {
        invoices.filter { it.status != InvoiceStatus.PAID && it.currency == "INR" }.sumOf { it.totalDue }
    }

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
                        BrandBadge("BILLINGFLOW.HMORIX.IN")

                        if (selectedTopTab == 0) {
                            Button(
                                onClick = { isEditingNewInvoice = true },
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = LimePrimary,
                                    contentColor = ObsidianBackground
                                ),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Add,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("New Invoice", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        } else {
                            OutlinedButton(
                                onClick = {
                                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://hmorix.in/account/billing"))
                                    context.startActivity(intent)
                                },
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Icon(Icons.Default.Share, contentDescription = null, tint = LimePrimary, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Web Checkout", color = LimePrimary, fontSize = 11.sp)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = "BillingFlow & Enterprise Pricing",
                        color = TextCream,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Automated GST compliance, multi-currency invoicing, instant PDF exports, and flexible SaaS enterprise tiers.",
                        color = TextMuted,
                        fontSize = 12.sp,
                        lineHeight = 17.sp
                    )
                }
            }
        }

        // Top Navigation Tabs
        item {
            TabRow(
                selectedTabIndex = selectedTopTab,
                containerColor = ObsidianCard,
                contentColor = LimePrimary,
                indicator = { tabPositions ->
                    TabRowDefaults.SecondaryIndicator(
                        modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTopTab]),
                        color = LimePrimary
                    )
                }
            ) {
                Tab(
                    selected = selectedTopTab == 0,
                    onClick = { selectedTopTab = 0 },
                    text = { Text("Invoices & GST (${invoices.size})", fontSize = 13.sp, fontWeight = FontWeight.SemiBold) }
                )
                Tab(
                    selected = selectedTopTab == 1,
                    onClick = { selectedTopTab = 1 },
                    text = { Text("SaaS Pricing Plans", fontSize = 13.sp, fontWeight = FontWeight.SemiBold) }
                )
            }
        }

        // TAB 0: INVOICES & GST
        if (selectedTopTab == 0) {
            // Metrics summary
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        title = "Total Billed",
                        value = "₹" + String.format(Locale.US, "%,.0f", totalBilled),
                        subtitle = "${invoices.size} invoices total",
                        accentColor = TextCream,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "Paid Collected",
                        value = "₹" + String.format(Locale.US, "%,.0f", totalPaid),
                        subtitle = "Settled via UPI/NEFT",
                        accentColor = AccentGreen,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // Status Filter Chips
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    item {
                        FilterChip(
                            selected = selectedStatusFilter == null,
                            onClick = { selectedStatusFilter = null },
                            label = { Text("All (${invoices.size})") },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = LimePrimary,
                                selectedLabelColor = ObsidianBackground,
                                containerColor = ObsidianCard,
                                labelColor = TextCream
                            )
                        )
                    }
                    InvoiceStatus.values().forEach { status ->
                        val count = invoices.count { it.status == status }
                        item {
                            FilterChip(
                                selected = selectedStatusFilter == status,
                                onClick = { selectedStatusFilter = if (selectedStatusFilter == status) null else status },
                                label = { Text("${status.name} ($count)") },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = LimePrimary,
                                    selectedLabelColor = ObsidianBackground,
                                    containerColor = ObsidianCard,
                                    labelColor = TextCream
                                )
                            )
                        }
                    }
                }
            }

            // Invoices List
            if (filteredInvoices.isEmpty()) {
                item {
                    GlassCard(modifier = Modifier.fillMaxWidth()) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.DateRange,
                                contentDescription = null,
                                tint = TextSubtle,
                                modifier = Modifier.size(40.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "No invoices found for this filter",
                                color = TextMuted,
                                fontSize = 14.sp
                            )
                        }
                    }
                }
            } else {
                items(filteredInvoices, key = { it.id }) { invoice ->
                    InvoiceCard(
                        invoice = invoice,
                        onView = { viewingInvoice = invoice },
                        onMarkStatus = { newStatus -> repository.markInvoiceStatus(invoice.id, newStatus) },
                        onDelete = { repository.deleteInvoice(invoice.id) }
                    )
                }
            }
        }

        // TAB 1: SAAS PRICING PLANS
        if (selectedTopTab == 1) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    MetricCard(
                        title = "GST Compliance",
                        value = "18% GST",
                        subtitle = "Standard CGST + SGST",
                        accentColor = LimePrimary,
                        modifier = Modifier.weight(1f)
                    )
                    MetricCard(
                        title = "Payment Gateways",
                        value = "UPI & Wire",
                        subtitle = "Instant Webhook Sync",
                        accentColor = AccentCyan,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            items(pricingPlans) { plan ->
                PricingPlanCard(
                    plan = plan,
                    onSelect = {
                        Toast.makeText(context, "Selected ${plan.name} - Opening HMorix Checkout", Toast.LENGTH_SHORT).show()
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://hmorix.in/account/billing"))
                        context.startActivity(intent)
                    }
                )
            }

            item {
                GlassCard(modifier = Modifier.fillMaxWidth()) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text("Indian Statutory GST & Tax Exemption", color = TextCream, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        Text(
                            text = "All invoice amounts are displayed exclusive of 18% Goods & Services Tax (GST). Indian registered GSTIN entities receive full input tax credit (ITC). International USD clients are processed under export reverse charge.",
                            color = TextMuted,
                            fontSize = 12.sp,
                            lineHeight = 16.sp
                        )
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(20.dp))
        }
    }

    // Invoice Detail Dialog
    viewingInvoice?.let { inv ->
        InvoiceDetailDialog(
            invoice = inv,
            onDismiss = { viewingInvoice = null },
            onStatusChange = { newStatus ->
                repository.markInvoiceStatus(inv.id, newStatus)
                viewingInvoice = inv.copy(status = newStatus)
            }
        )
    }

    // New Invoice Creator Dialog
    if (isEditingNewInvoice) {
        NewInvoiceDialog(
            repository = repository,
            onDismiss = { isEditingNewInvoice = false },
            onCreated = { created ->
                repository.addOrUpdateInvoice(created)
                isEditingNewInvoice = false
                Toast.makeText(context, "Invoice ${created.invoiceNumber} created!", Toast.LENGTH_SHORT).show()
            }
        )
    }
}

@Composable
fun InvoiceCard(
    invoice: Invoice,
    onView: () -> Unit,
    onMarkStatus: (InvoiceStatus) -> Unit,
    onDelete: () -> Unit
) {
    GlassCard(
        modifier = Modifier.fillMaxWidth(),
        onClick = onView
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = invoice.invoiceNumber,
                        color = LimePrimary,
                        fontSize = 14.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    StatusChip(invoice.status)
                }

                Text(
                    text = "${invoice.currencySymbol}${String.format(Locale.US, "%,.2f", invoice.totalDue)}",
                    color = TextCream,
                    fontSize = 16.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = invoice.clientName.ifBlank { "Client not specified" },
                color = TextCream,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold
            )

            if (invoice.clientEmail.isNotBlank()) {
                Text(
                    text = invoice.clientEmail,
                    color = TextMuted,
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "${invoice.items.size} line items • Due on ${invoice.dueDate}",
                color = TextSubtle,
                fontSize = 11.sp
            )

            Spacer(modifier = Modifier.height(12.dp))
            HorizontalDivider(color = ObsidianBorder, thickness = 0.8.dp)
            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (invoice.status != InvoiceStatus.PAID) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color(0x2200E676))
                                .clickable { onMarkStatus(InvoiceStatus.PAID) }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "Mark Paid",
                                color = AccentGreen,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    if (invoice.status == InvoiceStatus.DRAFT) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color(0x2200E5FF))
                                .clickable { onMarkStatus(InvoiceStatus.SENT) }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "Mark Sent",
                                color = AccentCyan,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Row {
                    IconButton(
                        onClick = onDelete,
                        modifier = Modifier.size(28.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Delete",
                            tint = AccentRed.copy(alpha = 0.7f),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun InvoiceDetailDialog(
    invoice: Invoice,
    onDismiss: () -> Unit,
    onStatusChange: (InvoiceStatus) -> Unit
) {
    val context = LocalContext.current
    val payUrl = "https://billingflow.hmorix.in/pay/${invoice.invoiceNumber}"

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = ObsidianCardElevated,
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = invoice.invoiceNumber,
                        color = LimePrimary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        text = "Issued: ${invoice.issueDate} • Due: ${invoice.dueDate}",
                        color = TextSubtle,
                        fontSize = 11.sp
                    )
                }
                StatusChip(invoice.status)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Client Info
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(ObsidianBackground)
                        .padding(10.dp)
                ) {
                    Column {
                        Text(
                            text = "BILL TO",
                            color = TextSubtle,
                            fontSize = 10.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = invoice.clientName,
                            color = TextCream,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        if (invoice.clientEmail.isNotBlank()) {
                            Text(text = invoice.clientEmail, color = TextMuted, fontSize = 12.sp)
                        }
                        if (invoice.clientGstin.isNotBlank()) {
                            Text(
                                text = "GSTIN: ${invoice.clientGstin}",
                                color = LimePrimary,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        if (invoice.clientAddress.isNotBlank()) {
                            Text(text = invoice.clientAddress, color = TextSubtle, fontSize = 11.sp)
                        }
                    }
                }

                // Line Items
                Text(
                    text = "LINE ITEMS",
                    color = TextSubtle,
                    fontSize = 10.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )

                invoice.items.forEach { item ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = item.description, color = TextCream, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                            Text(
                                text = "${item.quantity} x ${invoice.currencySymbol}${item.unitPrice}",
                                color = TextSubtle,
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        Text(
                            text = "${invoice.currencySymbol}${String.format(Locale.US, "%,.2f", item.total)}",
                            color = TextCream,
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    HorizontalDivider(color = ObsidianBorder, thickness = 0.5.dp)
                }

                // Financial Breakdown
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(ObsidianBackground)
                        .padding(10.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Subtotal", color = TextMuted, fontSize = 12.sp)
                        Text(
                            text = "${invoice.currencySymbol}${String.format(Locale.US, "%,.2f", invoice.subtotal)}",
                            color = TextCream,
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    if (invoice.discountAmount > 0) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(text = "Discount", color = AccentGreen, fontSize = 12.sp)
                            Text(
                                text = "- ${invoice.currencySymbol}${String.format(Locale.US, "%,.2f", invoice.discountAmount)}",
                                color = AccentGreen,
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "GST (${invoice.taxRate}%)", color = TextMuted, fontSize = 12.sp)
                        Text(
                            text = "${invoice.currencySymbol}${String.format(Locale.US, "%,.2f", invoice.taxAmount)}",
                            color = TextCream,
                            fontSize = 12.sp,
                            fontFamily = FontFamily.Monospace
                        )
                    }

                    HorizontalDivider(color = ObsidianBorder, thickness = 1.dp, modifier = Modifier.padding(vertical = 4.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Grand Total Due", color = LimePrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        Text(
                            text = "${invoice.currencySymbol}${String.format(Locale.US, "%,.2f", invoice.totalDue)}",
                            color = LimePrimary,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }

                // Copy Pay Link
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(6.dp))
                        .background(Color(0x15C8FF00))
                        .clickable {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(ClipData.newPlainText("Invoice Pay Link", payUrl))
                            Toast.makeText(context, "Payment URL copied to clipboard!", Toast.LENGTH_SHORT).show()
                        }
                        .padding(8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = payUrl,
                        color = LimePrimary,
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        maxLines = 1,
                        modifier = Modifier.weight(1f)
                    )
                    Icon(
                        imageVector = Icons.Default.Share,
                        contentDescription = "Copy link",
                        tint = LimePrimary,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val nextStatus = when (invoice.status) {
                        InvoiceStatus.DRAFT -> InvoiceStatus.SENT
                        InvoiceStatus.SENT -> InvoiceStatus.PAID
                        InvoiceStatus.OVERDUE -> InvoiceStatus.PAID
                        InvoiceStatus.PAID -> InvoiceStatus.DRAFT
                    }
                    onStatusChange(nextStatus)
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = LimePrimary,
                    contentColor = ObsidianBackground
                )
            ) {
                Text(
                    text = if (invoice.status == InvoiceStatus.PAID) "Reopen as Draft" else "Mark Paid",
                    fontWeight = FontWeight.Bold
                )
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss) {
                Text("Close", color = TextCream)
            }
        }
    )
}

@Composable
fun NewInvoiceDialog(
    repository: HMorixRepository,
    onDismiss: () -> Unit,
    onCreated: (Invoice) -> Unit
) {
    var draft by remember { mutableStateOf(repository.createNewInvoiceDraft()) }

    var clientName by remember { mutableStateOf("") }
    var clientEmail by remember { mutableStateOf("") }
    var clientGstin by remember { mutableStateOf("") }
    var clientAddress by remember { mutableStateOf("") }
    var currency by remember { mutableStateOf("INR") }
    var taxRateStr by remember { mutableStateOf("18") }
    var discountStr by remember { mutableStateOf("0") }

    val itemsList = remember {
        mutableStateListOf(
            InvoiceItem("1", "Enterprise Web Application Development", 1.0, 35000.0)
        )
    }

    var newItemDesc by remember { mutableStateOf("") }
    var newItemQty by remember { mutableStateOf("1") }
    var newItemPrice by remember { mutableStateOf("5000") }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = ObsidianCardElevated,
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "New BillingFlow Invoice",
                    color = TextCream,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = draft.invoiceNumber,
                    color = LimePrimary,
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Preset buttons
                Text(text = "QUICK PRESETS", color = TextSubtle, fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(0x22C8FF00))
                            .clickable {
                                clientName = "Apex Braj Exports LLC"
                                clientEmail = "accounts@apexbraj.in"
                                clientGstin = "09BBBBB1111B2Z6"
                                clientAddress = "Industrial Area, Hathras, UP"
                                currency = "INR"
                                taxRateStr = "18"
                                discountStr = "2000"
                                itemsList.clear()
                                itemsList.add(InvoiceItem("1", "Custom ERP & Inventory Tracking", 1.0, 75000.0))
                                itemsList.add(InvoiceItem("2", "Razorpay UPI Gateway Integration", 1.0, 20000.0))
                            }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text("Software", color = LimePrimary, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(0x2200E5FF))
                            .clickable {
                                clientName = "Global Scale AI Inc"
                                clientEmail = "finance@globalscale.ai"
                                clientGstin = "US-DEL-98412"
                                clientAddress = "San Francisco, CA, USA"
                                currency = "USD"
                                taxRateStr = "0"
                                discountStr = "50"
                                itemsList.clear()
                                itemsList.add(InvoiceItem("1", "BillingFlow Enterprise Subscription", 1.0, 499.0))
                                itemsList.add(InvoiceItem("2", "Cryptographic PDF Document Pack", 1.0, 150.0))
                            }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text("SaaS", color = AccentCyan, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(0x22FFB300))
                            .clickable {
                                clientName = "Sharma & Sons Enterprises"
                                clientEmail = "sharma.sons@enterprise.in"
                                clientGstin = "09CCCCC2222C3Z7"
                                clientAddress = "Civil Lines, Agra, UP"
                                currency = "INR"
                                taxRateStr = "18"
                                discountStr = "500"
                                itemsList.clear()
                                itemsList.add(InvoiceItem("1", "Full-Stack Architecture Consulting (10 hrs)", 10.0, 2500.0))
                            }
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text("Consulting", color = AccentAmber, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    }
                }

                // Client Inputs
                OutlinedTextField(
                    value = clientName,
                    onValueChange = { clientName = it },
                    label = { Text("Client Business Name") },
                    placeholder = { Text("e.g. Acme Industries") },
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

                OutlinedTextField(
                    value = clientEmail,
                    onValueChange = { clientEmail = it },
                    label = { Text("Client Email") },
                    placeholder = { Text("billing@client.com") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
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

                OutlinedTextField(
                    value = clientGstin,
                    onValueChange = { clientGstin = it },
                    label = { Text("GSTIN Number (Optional)") },
                    placeholder = { Text("07AAAAA0000A1Z5") },
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

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = taxRateStr,
                        onValueChange = { taxRateStr = it },
                        label = { Text("GST %") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = LimePrimary,
                            unfocusedBorderColor = ObsidianBorder,
                            focusedLabelColor = LimePrimary,
                            unfocusedLabelColor = TextMuted,
                            focusedTextColor = TextCream,
                            unfocusedTextColor = TextCream
                        ),
                        modifier = Modifier.weight(1f)
                    )

                    OutlinedTextField(
                        value = discountStr,
                        onValueChange = { discountStr = it },
                        label = { Text("Discount ($currency)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = LimePrimary,
                            unfocusedBorderColor = ObsidianBorder,
                            focusedLabelColor = LimePrimary,
                            unfocusedLabelColor = TextMuted,
                            focusedTextColor = TextCream,
                            unfocusedTextColor = TextCream
                        ),
                        modifier = Modifier.weight(1f)
                    )
                }

                // Line Items Header
                Text(text = "LINE ITEMS (${itemsList.size})", color = TextSubtle, fontSize = 10.sp, fontFamily = FontFamily.Monospace)

                itemsList.forEachIndexed { index, item ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(6.dp))
                            .background(ObsidianBackground)
                            .padding(8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(text = item.description, color = TextCream, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                            Text(
                                text = "${item.quantity} × $currency ${item.unitPrice} = $currency ${item.total}",
                                color = LimePrimary,
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        if (itemsList.size > 1) {
                            IconButton(
                                onClick = { itemsList.removeAt(index) },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Remove item",
                                    tint = AccentRed,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }

                // Add Item Section
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = newItemDesc,
                        onValueChange = { newItemDesc = it },
                        placeholder = { Text("Add item description", fontSize = 11.sp) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = LimePrimary,
                            unfocusedBorderColor = ObsidianBorder,
                            focusedTextColor = TextCream,
                            unfocusedTextColor = TextCream
                        ),
                        modifier = Modifier.weight(1.5f)
                    )

                    OutlinedTextField(
                        value = newItemPrice,
                        onValueChange = { newItemPrice = it },
                        placeholder = { Text("Price", fontSize = 11.sp) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = LimePrimary,
                            unfocusedBorderColor = ObsidianBorder,
                            focusedTextColor = TextCream,
                            unfocusedTextColor = TextCream
                        ),
                        modifier = Modifier.weight(1f)
                    )

                    IconButton(
                        onClick = {
                            if (newItemDesc.isNotBlank()) {
                                itemsList.add(
                                    InvoiceItem(
                                        id = System.currentTimeMillis().toString(),
                                        description = newItemDesc.trim(),
                                        quantity = newItemQty.toDoubleOrNull() ?: 1.0,
                                        unitPrice = newItemPrice.toDoubleOrNull() ?: 1000.0
                                    )
                                )
                                newItemDesc = ""
                                newItemPrice = "1000"
                            }
                        },
                        modifier = Modifier
                            .size(40.dp)
                            .clip(RoundedCornerShape(8.dp))
                            .background(LimePrimary)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Add item",
                            tint = ObsidianBackground
                        )
                    }
                }

                // Calculated total preview
                val calculatedSubtotal = itemsList.sumOf { it.total }
                val calculatedDiscount = (discountStr.toDoubleOrNull() ?: 0.0).coerceIn(0.0, calculatedSubtotal)
                val calculatedTaxRate = taxRateStr.toDoubleOrNull() ?: 18.0
                val calculatedTax = (calculatedSubtotal - calculatedDiscount) * (calculatedTaxRate / 100.0)
                val calculatedTotal = (calculatedSubtotal - calculatedDiscount) + calculatedTax

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0x22C8FF00))
                        .padding(10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "Grand Total Preview:", color = TextCream, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text(
                            text = "$currency " + String.format(Locale.US, "%,.2f", calculatedTotal),
                            color = LimePrimary,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val finalInvoice = draft.copy(
                        clientName = clientName.ifBlank { "Apex Client" },
                        clientEmail = clientEmail.ifBlank { "client@enterprise.in" },
                        clientGstin = clientGstin,
                        clientAddress = clientAddress,
                        currency = currency,
                        taxRate = taxRateStr.toDoubleOrNull() ?: 18.0,
                        discount = discountStr.toDoubleOrNull() ?: 0.0,
                        items = itemsList.toList(),
                        status = InvoiceStatus.DRAFT
                    )
                    onCreated(finalInvoice)
                },
                colors = ButtonDefaults.buttonColors(
                    containerColor = LimePrimary,
                    contentColor = ObsidianBackground
                )
            ) {
                Text("Save Invoice", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss) {
                Text("Cancel", color = TextCream)
            }
        }
    )
}

@Composable
fun PricingPlanCard(
    plan: com.example.hmorix.model.PricingPlan,
    onSelect: () -> Unit
) {
    val borderColor = if (plan.isPopular) LimePrimary else ObsidianBorder
    val borderWidth = if (plan.isPopular) 1.5.dp else 1.dp

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(ObsidianCard)
            .border(borderWidth, borderColor, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = plan.name,
                        color = TextCream,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = plan.tag,
                        color = if (plan.isPopular) LimePrimary else TextSubtle,
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.5.sp
                    )
                }

                if (plan.isPopular) {
                    BrandBadge("MOST POPULAR")
                }
            }

            Row(verticalAlignment = Alignment.Bottom) {
                Text(
                    text = plan.priceInr,
                    color = LimePrimary,
                    fontSize = 26.sp,
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "(${plan.priceUsd}) / ${plan.billingPeriod}",
                    color = TextMuted,
                    fontSize = 11.sp,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
            }

            Text(
                text = plan.description,
                color = TextMuted,
                fontSize = 12.sp,
                lineHeight = 16.sp
            )

            HorizontalDivider(color = ObsidianBorder, thickness = 0.8.dp)

            Text(
                text = "INCLUDED ENTERPRISE CAPABILITIES",
                color = TextSubtle,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.Bold
            )

            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                plan.features.forEach { feat ->
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = if (plan.isPopular) LimePrimary else AccentGreen,
                            modifier = Modifier.size(15.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = feat,
                            color = TextCream,
                            fontSize = 12.sp,
                            lineHeight = 16.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            Button(
                onClick = onSelect,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (plan.isPopular) LimePrimary else Color(0xFF222227),
                    contentColor = if (plan.isPopular) ObsidianBackground else TextCream
                ),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = if (plan.isPopular) "Upgrade to Growth" else "Select ${plan.name}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp
                )
            }
        }
    }
}
