package com.example.grokbackupmemory

import android.annotation.SuppressLint
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.view.View
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.example.grokbackupmemory.databinding.ActivityMainBinding
import java.io.File
import java.io.FileOutputStream

class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding
    private lateinit var prefs: SharedPreferences

    private enum class Dest { CHOOSER, LIBRARY, IMPORT }

    private var dest: Dest = Dest.CHOOSER

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        prefs = getSharedPreferences("grok_memory", MODE_PRIVATE)

        setupWebView()
        binding.btnImport.setOnClickListener { showWeb(Dest.IMPORT) }
        binding.btnLibrary.setOnClickListener { showWeb(Dest.LIBRARY) }
        binding.navImport.setOnClickListener { showWeb(Dest.IMPORT) }
        binding.navLibrary.setOnClickListener { showWeb(Dest.LIBRARY) }
        binding.navSettings.setOnClickListener { showSettings() }
        binding.brandTitle.setOnClickListener {
            dest = Dest.CHOOSER
            binding.webShell.visibility = View.GONE
            binding.chooser.visibility = View.VISIBLE
        }

        handleIntent(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        if (intent == null) return
        val action = intent.action
        val uri: Uri? = when {
            action == Intent.ACTION_SEND -> {
                if (android.os.Build.VERSION.SDK_INT >= 33) {
                    intent.getParcelableExtra(Intent.EXTRA_STREAM, Uri::class.java)
                } else {
                    @Suppress("DEPRECATION")
                    intent.getParcelableExtra(Intent.EXTRA_STREAM)
                }
            }
            action == Intent.ACTION_VIEW -> intent.data
            else -> null
        }

        if (uri != null) {
            stageSharedFile(uri)
            showWeb(Dest.IMPORT)
            Toast.makeText(this, R.string.shared_file_hint, Toast.LENGTH_LONG).show()
        }
    }

    private fun stageSharedFile(uri: Uri) {
        try {
            val name = uri.lastPathSegment?.substringAfterLast('/') ?: "shared-import.bin"
            val destFile = File(cacheDir, name)
            contentResolver.openInputStream(uri)?.use { input ->
                FileOutputStream(destFile).use { output -> input.copyTo(output) }
            }
        } catch (_: Exception) {
            // Best-effort; user can still pick from Downloads on the web import page
        }
    }

    private fun baseUrl(): String {
        return prefs.getString("web_base_url", BuildConfig.DEFAULT_WEB_BASE_URL)
            ?: BuildConfig.DEFAULT_WEB_BASE_URL
    }

    private fun urlFor(dest: Dest): String {
        val base = baseUrl().trimEnd('/')
        return when (dest) {
            Dest.IMPORT -> "$base/import"
            Dest.LIBRARY, Dest.CHOOSER -> "$base/library"
        }
    }

    private fun showWeb(destination: Dest) {
        dest = destination
        binding.chooser.visibility = View.GONE
        binding.webShell.visibility = View.VISIBLE
        binding.offlineBanner.visibility = View.GONE
        binding.webView.loadUrl(urlFor(destination))
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val wv = binding.webView
        wv.setBackgroundColor(0xFF0C0F0D.toInt())
        val settings = wv.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        wv.webChromeClient = WebChromeClient()
        wv.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                binding.offlineBanner.visibility = View.GONE
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?,
            ) {
                if (request?.isForMainFrame == true) {
                    binding.offlineBanner.visibility = View.VISIBLE
                }
            }
        }
    }

    private fun showSettings() {
        val input = EditText(this).apply {
            setText(baseUrl())
            setHint(R.string.web_base_url_label)
            setTextColor(getColor(R.color.fg))
            setHintTextColor(getColor(R.color.fg_muted))
            setPadding(48, 32, 48, 32)
        }
        AlertDialog.Builder(this)
            .setTitle(R.string.web_base_url_label)
            .setView(input)
            .setPositiveButton(R.string.save) { _, _ ->
                val value = input.text.toString().trim()
                if (value.isNotEmpty()) {
                    prefs.edit().putString("web_base_url", value).apply()
                    if (dest != Dest.CHOOSER) {
                        showWeb(dest)
                    }
                }
            }
            .setNegativeButton(android.R.string.cancel, null)
            .show()
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (binding.webShell.visibility == View.VISIBLE && binding.webView.canGoBack()) {
            binding.webView.goBack()
        } else if (binding.webShell.visibility == View.VISIBLE) {
            dest = Dest.CHOOSER
            binding.webShell.visibility = View.GONE
            binding.chooser.visibility = View.VISIBLE
        } else {
            super.onBackPressed()
        }
    }
}
