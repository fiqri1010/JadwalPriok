package com.jadwalpriok.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.priok.shift.MainActivity
import com.priok.shift.R
import org.json.JSONObject

/**
 * AppWidgetProvider untuk Home Screen Widget Jadwal Shift Priok.
 * Mendukung resize horizontal dan vertikal secara dinamis.
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

    companion object {
        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_shift_compact)

            // Baca data tersimpan dari SharedPreferences yang disinkronkan oleh Web / Capacitor
            val prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE)
            val jsonStr = prefs.getString("android_widget_shift_data_v1", null)

            var todayDate = "--/--"
            var todayShift = "OFF"
            var tomorrowDate = "--/--"
            var tomorrowShift = "OFF"

            if (jsonStr != null) {
                try {
                    val obj = JSONObject(jsonStr)
                    val todayObj = obj.getJSONObject("today")
                    todayDate = todayObj.getString("mmdd")
                    todayShift = todayObj.getString("shift")

                    val tomObj = obj.getJSONObject("tomorrow")
                    tomorrowDate = tomObj.getString("mmdd")
                    tomorrowShift = tomObj.getString("shift")
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }

            // Bind data ke tampilan widget RemoteViews
            views.setTextViewText(R.id.tv_widget_title, "Shift")
            views.setTextViewText(R.id.tv_today_date, todayDate)
            views.setTextViewText(R.id.tv_today_shift, todayShift)

            views.setTextViewText(R.id.tv_tomorrow_date, tomorrowDate)
            views.setTextViewText(R.id.tv_tomorrow_shift, tomorrowShift)

            // Klik widget untuk membuka aplikasi langsung ke halaman kalender
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
