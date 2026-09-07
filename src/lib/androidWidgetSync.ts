import { DayData } from '../types';

export interface WidgetShiftEntry {
    rawDate: string; // "2026-09-07"
    mmdd: string; // "09/07"
    dayName: string; // "Senin"
    shift: string; // "Graha", "NPCT", "OFF", dll
    jamMasuk: string;
    jamPulang: string;
    isMasuk: boolean;
}

export interface AndroidWidgetData {
    title: string; // "Shift"
    today: WidgetShiftEntry;
    tomorrow: WidgetShiftEntry;
    lastUpdated: string;
}

const WIDGET_STORAGE_KEY = 'android_widget_shift_data_v1';

export function formatMmDd(date: Date): string {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${m}/${d}`;
}

export function formatMmDdCompact(date: Date): string {
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${m}${d}`;
}

/**
 * Ekstrak data jadwal shift hari ini dan besok untuk Android Widget
 */
export function getWidgetShiftData(daysState: Record<string, DayData>): AndroidWidgetData {
    const now = new Date();
    const todayY = now.getFullYear();
    const todayM = now.getMonth() + 1;
    const todayD = now.getDate();
    const todayKey = `${todayY}-${todayM}-${todayD}`;

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const tomY = tomorrow.getFullYear();
    const tomM = tomorrow.getMonth() + 1;
    const tomD = tomorrow.getDate();
    const tomKey = `${tomY}-${tomM}-${tomD}`;

    const defaultDay: DayData = {
        shift: 'OFF',
        note: '',
        isMasuk: false,
        jamMasuk: '',
        jamPulang: '',
        absenCeisa: '',
        isHoldDokumen: false,
        isLocked: false,
        isManualHoliday: false,
        isSuratTugasTambahan: false,
    };

    const todayData = daysState[todayKey] || defaultDay;
    const tomorrowData = daysState[tomKey] || defaultDay;

    const todayShift = todayData.shift || (todayData.isMasuk ? 'Masuk' : 'OFF');
    const tomorrowShift = tomorrowData.shift || (tomorrowData.isMasuk ? 'Masuk' : 'OFF');

    const payload: AndroidWidgetData = {
        title: 'Shift',
        today: {
            rawDate: todayKey,
            mmdd: formatMmDd(now),
            dayName: now.toLocaleDateString('id-ID', { weekday: 'short' }),
            shift: todayShift,
            jamMasuk: todayData.jamMasuk || '',
            jamPulang: todayData.jamPulang || '',
            isMasuk: todayData.isMasuk,
        },
        tomorrow: {
            rawDate: tomKey,
            mmdd: formatMmDd(tomorrow),
            dayName: tomorrow.toLocaleDateString('id-ID', { weekday: 'short' }),
            shift: tomorrowShift,
            jamMasuk: tomorrowData.jamMasuk || '',
            jamPulang: tomorrowData.jamPulang || '',
            isMasuk: tomorrowData.isMasuk,
        },
        lastUpdated: new Date().toISOString(),
    };

    // Simpan ke localStorage agar bisa diakses oleh Native Android Bridge / Webview
    try {
        localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
        console.warn('Gagal menyimpan cache widget shift:', e);
    }

    return payload;
}

export function getCachedWidgetShiftData(): AndroidWidgetData | null {
    try {
        const raw = localStorage.getItem(WIDGET_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch {
        return null;
    }
    return null;
}

/**
 * Template Kode Android Asli (Native Kotlin / XML) untuk Home Screen Widget
 */
export const ANDROID_WIDGET_LAYOUT_XML = `<?xml version="1.0" encoding="utf-8"?>
<!-- res/layout/widget_shift_compact.xml -->
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_container"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:background="@drawable/widget_background"
    android:padding="12dp">

    <!-- Header: Judul "Shift" -->
    <TextView
        android:id="@+id/tv_widget_title"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="Shift"
        android:textColor="#0D9488"
        android:textSize="14sp"
        android:textStyle="bold"
        android:layout_marginBottom="6dp" />

    <!-- Baris 1: Hari Ini mmdd <Shift> -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        android:layout_marginBottom="4dp">

        <TextView
            android:id="@+id/tv_today_label"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Hari Ini"
            android:textColor="#1E293B"
            android:textSize="13sp"
            android:textStyle="bold"
            android:layout_marginEnd="6dp" />

        <TextView
            android:id="@+id/tv_today_date"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="09/07"
            android:textColor="#64748B"
            android:textSize="12sp"
            android:layout_marginEnd="8dp" />

        <TextView
            android:id="@+id/tv_today_shift"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Graha"
            android:textColor="#0369A1"
            android:background="@drawable/badge_shift_blue"
            android:paddingStart="8dp"
            android:paddingEnd="8dp"
            android:paddingTop="2dp"
            android:paddingBottom="2dp"
            android:textSize="12sp"
            android:textStyle="bold" />
    </LinearLayout>

    <!-- Baris 2: Besok mmdd <Shift> -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical">

        <TextView
            android:id="@+id/tv_tomorrow_label"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Besok"
            android:textColor="#1E293B"
            android:textSize="13sp"
            android:textStyle="bold"
            android:layout_marginEnd="6dp" />

        <TextView
            android:id="@+id/tv_tomorrow_date"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="09/08"
            android:textColor="#64748B"
            android:textSize="12sp"
            android:layout_marginEnd="8dp" />

        <TextView
            android:id="@+id/tv_tomorrow_shift"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="NPCT"
            android:textColor="#C2410C"
            android:background="@drawable/badge_shift_orange"
            android:paddingStart="8dp"
            android:paddingEnd="8dp"
            android:paddingTop="2dp"
            android:paddingBottom="2dp"
            android:textSize="12sp"
            android:textStyle="bold" />
    </LinearLayout>
</LinearLayout>`;

export const ANDROID_WIDGET_PROVIDER_KOTLIN = `package com.priok.shift.widget

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
 * AppWidgetProvider untuk Home Screen Widget Jadwal Shift Priok
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

            // Klik widget untuk membuka aplikasi
            val intent = Intent(context, MainActivity::class.java)
            val pendingIntent = PendingIntent.getActivity(
                context, 0, intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}`;

export const ANDROID_WIDGET_INFO_XML = `<?xml version="1.0" encoding="utf-8"?>
<!-- res/xml/widget_shift_info.xml -->
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="140dp"
    android:minHeight="70dp"
    android:targetCellWidth="2"
    android:targetCellHeight="1"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/widget_shift_compact"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen"
    android:description="@string/widget_shift_description">
</appwidget-provider>`;

export const ANDROID_MANIFEST_SNIPPET = `<!-- Tambahkan di dalam <application> di AndroidManifest.xml -->
<receiver
    android:name=".widget.ShiftWidgetProvider"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/widget_shift_info" />
</receiver>`;
