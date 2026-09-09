package com.example.hmorix

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.hmorix.data.HMorixRepository
import com.example.hmorix.ui.screens.MainScreen
import com.example.hmorix.ui.theme.HMorixTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        val repository = HMorixRepository(applicationContext)

        setContent {
            HMorixTheme {
                MainScreen(repository = repository)
            }
        }
    }
}
