package com.example.hmorix.ui.components

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.hmorix.model.InvoiceStatus
import com.example.hmorix.ui.theme.AccentAmber
import com.example.hmorix.ui.theme.AccentCyan
import com.example.hmorix.ui.theme.AccentGreen
import com.example.hmorix.ui.theme.AccentRed
import com.example.hmorix.ui.theme.LimePrimary
import com.example.hmorix.ui.theme.ObsidianBorder
import com.example.hmorix.ui.theme.ObsidianCard
import com.example.hmorix.ui.theme.ObsidianCardElevated
import com.example.hmorix.ui.theme.TextCream
import com.example.hmorix.ui.theme.TextMuted
import com.example.hmorix.ui.theme.TextSubtle

@Composable
fun BrandBadge(
    text: String = "LIVE AT HMORIX.IN",
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(900),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseAlpha"
    )

    Row(
        modifier = modifier
            .clip(RoundedCornerShape(50))
            .background(Color(0x22C8FF00))
            .border(1.dp, Color(0x55C8FF00), RoundedCornerShape(50))
            .padding(horizontal = 10.dp, vertical = 5.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Box(
            modifier = Modifier
                .size(7.dp)
                .alpha(pulseAlpha)
                .clip(CircleShape)
                .background(LimePrimary)
        )
        Text(
            text = text,
            color = LimePrimary,
            fontSize = 11.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.8.sp
        )
    }
}

@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    content: @Composable () -> Unit
) {
    val cardModifier = modifier
        .clip(RoundedCornerShape(16.dp))
        .background(
            Brush.verticalGradient(
                colors = listOf(ObsidianCardElevated, ObsidianCard)
            )
        )
        .border(1.dp, ObsidianBorder, RoundedCornerShape(16.dp))
        .then(
            if (onClick != null) Modifier.clickable { onClick() } else Modifier
        )
        .padding(16.dp)

    Box(modifier = cardModifier) {
        content()
    }
}

@Composable
fun MetricCard(
    title: String,
    value: String,
    subtitle: String,
    accentColor: Color = LimePrimary,
    modifier: Modifier = Modifier
) {
    GlassCard(modifier = modifier) {
        Column {
            Text(
                text = title.uppercase(),
                color = TextSubtle,
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace,
                fontWeight = FontWeight.SemiBold,
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = value,
                color = accentColor,
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                color = TextMuted,
                fontSize = 11.sp
            )
        }
    }
}

@Composable
fun StatusChip(status: InvoiceStatus) {
    val (bgColor, textColor, label) = when (status) {
        InvoiceStatus.PAID -> Triple(Color(0x2200E676), AccentGreen, "PAID")
        InvoiceStatus.SENT -> Triple(Color(0x2200E5FF), AccentCyan, "SENT")
        InvoiceStatus.DRAFT -> Triple(Color(0x22FFB300), AccentAmber, "DRAFT")
        InvoiceStatus.OVERDUE -> Triple(Color(0x22FF5252), AccentRed, "OVERDUE")
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(bgColor)
            .border(1.dp, textColor.copy(alpha = 0.4f), RoundedCornerShape(6.dp))
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Text(
            text = label,
            color = textColor,
            fontSize = 10.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.6.sp
        )
    }
}

@Composable
fun SectionHeader(
    title: String,
    subtitle: String? = null,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = title,
            color = TextCream,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )
        if (subtitle != null) {
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                color = TextMuted,
                fontSize = 13.sp,
                lineHeight = 18.sp
            )
        }
    }
}
