package com.jadwalpriok.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.widget.RemoteViews
import com.jadwalpriok.app.MainActivity
import com.jadwalpriok.app.R
import org.json.JSONObject

/**
 * AppWidgetProvider untuk Home Screen Widget Jadwal Shift Priok.
 * Mendukung sinkronisasi tema (Default, Dark, Vista, Winamp) & data real-time.
 */
class ShiftWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (widgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, widgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        // Tangkap broadcast update kustom dari Web / Capacitor
        if (intent.action == ACTION_UPDATE_WIDGET || intent.action == AppWidgetManager.ACTION_APPWIDGET_UPDATE) {
            val appWidgetManager = AppWidgetManager.getInstance(context)
            val thisWidget = ComponentName(context, ShiftWidgetProvider::class.java)
            val allWidgetIds = appWidgetManager.getAppWidgetIds(thisWidget)
            for (widgetId in allWidgetIds) {
                updateAppWidget(context, appWidgetManager, widgetId)
            }
        }
    }

    companion object {
        const val ACTION_UPDATE_WIDGET = "com.jadwalpriok.app.ACTION_UPDATE_WIDGET"

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            try {
                val views = RemoteViews(context.packageName, R.layout.widget_shift_compact)

                // 1. Baca data tersimpan dari SharedPreferences (CapacitorStorage atau default)
                val prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE)
                val jsonStr = prefs.getString("android_widget_shift_data_v1", null)
                    ?: context.getSharedPreferences("JadwalPriokPrefs", Context.MODE_PRIVATE)
                        .getString("android_widget_shift_data_v1", null)

                var todayDate = "--/--"
                var todayShift = "OFF"
                var tomorrowDate = "--/--"
                var tomorrowShift = "OFF"
                var currentTheme = "default" // default, dark, vista, winamp

                if (!jsonStr.isNullOrEmpty()) {
                    try {
                        val obj = JSONObject(jsonStr)
                        if (obj.has("today")) {
                            val todayObj = obj.getJSONObject("today")
                            todayDate = todayObj.optString("mmdd", "--/--")
                            todayShift = todayObj.optString("shift", "OFF")
                        }
                        if (obj.has("tomorrow")) {
                            val tomObj = obj.getJSONObject("tomorrow")
                            tomorrowDate = tomObj.optString("mmdd", "--/--")
                            tomorrowShift = tomObj.optString("shift", "OFF")
                        }
                        if (obj.has("theme")) {
                            currentTheme = obj.optString("theme", "default").lowercase()
                        }
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                }

                // 2. Terapkan Tema Widget (Background & Warna Teks)
                when (currentTheme) {
                    "dark" -> {
                        views.setInt(R.id.widget_container, "setBackgroundResource", R.drawable.widget_bg_dark)
                        views.setTextColor(R.id.tv_widget_title, Color.parseColor("#34D399")) // emerald-400
                        views.setTextColor(R.id.tv_widget_subtitle, Color.parseColor("#94A3B8"))
                        views.setTextColor(R.id.tv_today_label, Color.parseColor("#F8FAFC"))
                        views.setTextColor(R.id.tv_today_date, Color.parseColor("#94A3B8"))
                        views.setTextColor(R.id.tv_tomorrow_label, Color.parseColor("#F8FAFC"))
                        views.setTextColor(R.id.tv_tomorrow_date, Color.parseColor("#94A3B8"))
                        views.setInt(R.id.divider_line, "setBackgroundColor", Color.parseColor("#334155"))
                    }
                    "vista" -> {
                        views.setInt(R.id.widget_container, "setBackgroundResource", R.drawable.widget_bg_vista)
                        views.setTextColor(R.id.tv_widget_title, Color.parseColor("#38BDF8")) // sky-400
                        views.setTextColor(R.id.tv_widget_subtitle, Color.parseColor("#BAE6FD"))
                        views.setTextColor(R.id.tv_today_label, Color.parseColor("#FFFFFF"))
                        views.setTextColor(R.id.tv_today_date, Color.parseColor("#E0F2FE"))
                        views.setTextColor(R.id.tv_tomorrow_label, Color.parseColor("#FFFFFF"))
                        views.setTextColor(R.id.tv_tomorrow_date, Color.parseColor("#E0F2FE"))
                        views.setInt(R.id.divider_line, "setBackgroundColor", Color.parseColor("#0284C7"))
                    }
                    "winamp" -> {
                        views.setInt(R.id.widget_container, "setBackgroundResource", R.drawable.widget_bg_winamp)
                        views.setTextColor(R.id.tv_widget_title, Color.parseColor("#00FF00")) // neon green
                        views.setTextColor(R.id.tv_widget_subtitle, Color.parseColor("#00FF00"))
                        views.setTextColor(R.id.tv_today_label, Color.parseColor("#00FF00"))
                        views.setTextColor(R.id.tv_today_date, Color.parseColor("#00FF00"))
                        views.setTextColor(R.id.tv_tomorrow_label, Color.parseColor("#00FF00"))
                        views.setTextColor(R.id.tv_tomorrow_date, Color.parseColor("#00FF00"))
                        views.setInt(R.id.divider_line, "setBackgroundColor", Color.parseColor("#005500"))
                    }
                    else -> { // "default" light theme
                        views.setInt(R.id.widget_container, "setBackgroundResource", R.drawable.widget_bg)
                        views.setTextColor(R.id.tv_widget_title, Color.parseColor("#0F766E")) // teal-700
                        views.setTextColor(R.id.tv_widget_subtitle, Color.parseColor("#94A3B8"))
                        views.setTextColor(R.id.tv_today_label, Color.parseColor("#0F172A"))
                        views.setTextColor(R.id.tv_today_date, Color.parseColor("#64748B"))
                        views.setTextColor(R.id.tv_tomorrow_label, Color.parseColor("#0F172A"))
                        views.setTextColor(R.id.tv_tomorrow_date, Color.parseColor("#64748B"))
                        views.setInt(R.id.divider_line, "setBackgroundColor", Color.parseColor("#E2E8F0"))
                    }
                }

                // 3. Tampilkan Data Shift
                views.setTextViewText(R.id.tv_widget_title, "Shift")
                views.setTextViewText(R.id.tv_widget_subtitle, "Priok")
                views.setTextViewText(R.id.tv_today_date, todayDate)
                views.setTextViewText(R.id.tv_today_shift, todayShift)

                views.setTextViewText(R.id.tv_tomorrow_date, tomorrowDate)
                views.setTextViewText(R.id.tv_tomorrow_shift, tomorrowShift)

                // 4. Atur Warna Shift Badge
                fun getShiftTextColor(shift: String, theme: String): Int {
                    if (theme == "winamp") return Color.parseColor("#00FF00")
                    return when (shift.uppercase()) {
                        "GRAHA", "G" -> Color.parseColor("#0369A1")
                        "NPCT", "N", "NPCS" -> Color.parseColor("#C2410C")
                        "TPSL", "L" -> Color.parseColor("#B45309")
                        "OFF", "O" -> Color.parseColor("#DC2626")
                        "SM", "S2" -> Color.parseColor("#0D9488")
                        "PM" -> Color.parseColor("#0F766E")
                        "MALAM", "M" -> Color.parseColor("#4338CA")
                        "CUTI", "C" -> Color.parseColor("#475569")
                        else -> Color.parseColor("#0F766E")
                    }
                }

                views.setTextColor(R.id.tv_today_shift, getShiftTextColor(todayShift, currentTheme))
                views.setTextColor(R.id.tv_tomorrow_shift, getShiftTextColor(tomorrowShift, currentTheme))

                // 5. Intent Klik Widget -> Buka Aplikasi ke MainActivity
                val intent = Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                val pendingFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                } else {
                    PendingIntent.FLAG_UPDATE_CURRENT
                }
                val pendingIntent = PendingIntent.getActivity(
                    context, 0, intent, pendingFlags
                )
                views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

                // 6. Push Update ke RemoteViews
                appWidgetManager.updateAppWidget(appWidgetId, views)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
