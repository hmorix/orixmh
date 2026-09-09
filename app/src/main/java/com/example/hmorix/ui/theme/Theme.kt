package com.example.hmorix.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = LimePrimary,
    onPrimary = ObsidianBackground,
    primaryContainer = LimeContainer,
    onPrimaryContainer = LimeOnContainer,
    secondary = AccentCyan,
    onSecondary = ObsidianBackground,
    tertiary = AccentGreen,
    background = ObsidianBackground,
    onBackground = TextCream,
    surface = ObsidianSurface,
    onSurface = TextCream,
    surfaceVariant = ObsidianCard,
    onSurfaceVariant = TextMuted,
    outline = ObsidianBorder,
    error = AccentRed,
    onError = ObsidianBackground
)

@Composable
fun HMorixTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
