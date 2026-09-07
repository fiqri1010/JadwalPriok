package com.priok.shift.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.Build
import android.widget.RemoteViews
import org.json.JSONObject

/**
 * AppWidgetProvider untuk Home Screen Widget Jadwal Shift Priok (Package com.priok.shift.widget).
 * Jika package aplikasi Android Anda adalah com.jadwalpriok.app, gunakan file di com/jadwalpriok/app/widget/ShiftWidgetProvider.kt.
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
        const val ACTION_UPDATE_WIDGET = "com.priok.shift.ACTION_UPDATE_WIDGET"

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            try {
                val layoutResId = context.resources.getIdentifier("widget_shift_compact", "layout", context.packageName)
                if (layoutResId == 0) return
                val views = RemoteViews(context.packageName, layoutResId)

                val prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE)
                val jsonStr = prefs.getString("android_widget_shift_data_v1", null)
                    ?: context.getSharedPreferences("JadwalPriokPrefs", Context.MODE_PRIVATE)
                        .getString("android_widget_shift_data_v1", null)

                var todayDate = "--/--"
                var todayShift = "OFF"
                var tomorrowDate = "--/--"
                var tomorrowShift = "OFF"
                var currentTheme = "default"

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

                fun getId(name: String) = context.resources.getIdentifier(name, "id", context.packageName)
                fun getDrawable(name: String) = context.resources.getIdentifier(name, "drawable", context.packageName)

                val tvTitleId = getId("tv_widget_title")
                val tvSubtitleId = getId("tv_widget_subtitle")
                val tvTodayLabelId = getId("tv_today_label")
                val tvTodayDateId = getId("tv_today_date")
                val tvTodayShiftId = getId("tv_today_shift")
                val tvTomorrowLabelId = getId("tv_tomorrow_label")
                val tvTomorrowDateId = getId("tv_tomorrow_date")
                val tvTomorrowShiftId = getId("tv_tomorrow_shift")
                val widgetContainerId = getId("widget_container")
                val dividerLineId = getId("divider_line")

                // Tema
                when (currentTheme) {
                    "dark" -> {
                        val bgDark = getDrawable("widget_bg_dark")
                        if (bgDark != 0 && widgetContainerId != 0) views.setInt(widgetContainerId, "setBackgroundResource", bgDark)
                        if (tvTitleId != 0) views.setTextColor(tvTitleId, Color.parseColor("#34D399"))
                        if (tvTodayLabelId != 0) views.setTextColor(tvTodayLabelId, Color.parseColor("#F8FAFC"))
                        if (tvTomorrowLabelId != 0) views.setTextColor(tvTomorrowLabelId, Color.parseColor("#F8FAFC"))
                    }
                    "vista" -> {
                        val bgVista = getDrawable("widget_bg_vista")
                        if (bgVista != 0 && widgetContainerId != 0) views.setInt(widgetContainerId, "setBackgroundResource", bgVista)
                        if (tvTitleId != 0) views.setTextColor(tvTitleId, Color.parseColor("#38BDF8"))
                        if (tvTodayLabelId != 0) views.setTextColor(tvTodayLabelId, Color.parseColor("#FFFFFF"))
                        if (tvTomorrowLabelId != 0) views.setTextColor(tvTomorrowLabelId, Color.parseColor("#FFFFFF"))
                    }
                    "winamp" -> {
                        val bgWinamp = getDrawable("widget_bg_winamp")
                        if (bgWinamp != 0 && widgetContainerId != 0) views.setInt(widgetContainerId, "setBackgroundResource", bgWinamp)
                        if (tvTitleId != 0) views.setTextColor(tvTitleId, Color.parseColor("#00FF00"))
                        if (tvTodayLabelId != 0) views.setTextColor(tvTodayLabelId, Color.parseColor("#00FF00"))
                        if (tvTomorrowLabelId != 0) views.setTextColor(tvTomorrowLabelId, Color.parseColor("#00FF00"))
                    }
                    else -> {
                        val bgLight = getDrawable("widget_bg")
                        if (bgLight != 0 && widgetContainerId != 0) views.setInt(widgetContainerId, "setBackgroundResource", bgLight)
                        if (tvTitleId != 0) views.setTextColor(tvTitleId, Color.parseColor("#0F766E"))
                        if (tvTodayLabelId != 0) views.setTextColor(tvTodayLabelId, Color.parseColor("#0F172A"))
                        if (tvTomorrowLabelId != 0) views.setTextColor(tvTomorrowLabelId, Color.parseColor("#0F172A"))
                    }
                }

                if (tvTodayDateId != 0) views.setTextViewText(tvTodayDateId, todayDate)
                if (tvTodayShiftId != 0) views.setTextViewText(tvTodayShiftId, todayShift)
                if (tvTomorrowDateId != 0) views.setTextViewText(tvTomorrowDateId, tomorrowDate)
                if (tvTomorrowShiftId != 0) views.setTextViewText(tvTomorrowShiftId, tomorrowShift)

                // Launch Intent
                val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
                if (launchIntent != null && widgetContainerId != 0) {
                    launchIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    val pendingFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    } else {
                        PendingIntent.FLAG_UPDATE_CURRENT
                    }
                    val pendingIntent = PendingIntent.getActivity(context, 0, launchIntent, pendingFlags)
                    views.setOnClickPendingIntent(widgetContainerId, pendingIntent)
                }

                appWidgetManager.updateAppWidget(appWidgetId, views)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}
