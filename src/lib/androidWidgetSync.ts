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
    theme: 'default' | 'dark' | 'vista' | 'winamp';
}

export const WIDGET_STORAGE_KEY = 'android_widget_shift_data_v1';
export const WIDGET_THEME_KEY = 'android_widget_preferred_theme';

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
 * Simpan dan ambil preferensi tema widget
 */
export function getSavedWidgetTheme(): 'default' | 'dark' | 'vista' | 'winamp' | 'auto' {
    try {
        const saved = localStorage.getItem(WIDGET_THEME_KEY);
        if (saved && ['default', 'dark', 'vista', 'winamp', 'auto'].includes(saved)) {
            return saved as any;
        }
    } catch {
        // fallback
    }
    return 'auto';
}

export function saveWidgetTheme(theme: 'default' | 'dark' | 'vista' | 'winamp' | 'auto'): void {
    try {
        localStorage.setItem(WIDGET_THEME_KEY, theme);
    } catch (e) {
        console.warn('Gagal menyimpan preferensi tema widget:', e);
    }
}

/**
 * Ekstrak data jadwal shift hari ini dan besok untuk Android Widget
 */
export function getWidgetShiftData(
    daysState: Record<string, DayData>,
    activeAppTheme: 'default' | 'dark' | 'vista' | 'winamp' = 'default'
): AndroidWidgetData {
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

    // Tentukan tema widget
    const preferredThemeSetting = getSavedWidgetTheme();
    const finalTheme: 'default' | 'dark' | 'vista' | 'winamp' =
        preferredThemeSetting === 'auto' ? activeAppTheme : preferredThemeSetting;

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
        theme: finalTheme,
        lastUpdated: new Date().toISOString(),
    };

    // Simpan ke storage
    try {
        const jsonStr = JSON.stringify(payload);
        localStorage.setItem(WIDGET_STORAGE_KEY, jsonStr);
        // Juga simpan dengan key CapacitorStorage untuk kompatibilitas plugin
        localStorage.setItem(`CapacitorStorage.${WIDGET_STORAGE_KEY}`, jsonStr);
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
 * Sinkronkan jadwal dan tema ke penyimpanan native Android Widget
 */
export async function syncWidgetShiftData(
    daysState: Record<string, DayData>,
    activeAppTheme: 'default' | 'dark' | 'vista' | 'winamp' = 'default'
): Promise<{ success: boolean; data: AndroidWidgetData; isNative: boolean; message: string }> {
    const data = getWidgetShiftData(daysState, activeAppTheme);
    const jsonStr = JSON.stringify(data);
    let isNative = false;

    // 1. Coba sinkron via Capacitor Preferences jika tersedia
    try {
        const cap = (window as any).Capacitor;
        if (cap?.Plugins?.Preferences) {
            await cap.Plugins.Preferences.set({ key: WIDGET_STORAGE_KEY, value: jsonStr });
            isNative = true;
        }
    } catch (err) {
        console.warn('Preferences plugin sync skipped:', err);
    }

    // 2. Coba broadcast native bridge jika tersedia
    try {
        const bridge = (window as any).AndroidWidgetBridge || (window as any).Capacitor?.Plugins?.WidgetSync;
        if (bridge?.updateWidgetData) {
            bridge.updateWidgetData(jsonStr);
            isNative = true;
        }
    } catch (err) {
        console.warn('Native widget bridge sync skipped:', err);
    }

    return {
        success: true,
        data,
        isNative,
        message: isNative
            ? 'Data jadwal dan tema berhasil disinkronkan ke Native Widget Android!'
            : 'Data jadwal tersimpan di cache lokal. Widget Android akan membaca pembaruan ini secara otomatis.',
    };
}

/**
 * Memicu Pin / Pemasangan Widget ke Layar Depan Android (Android 12+ / API 31+)
 */
export async function requestPinWidgetToHomeScreen(): Promise<{
    supported: boolean;
    message: string;
}> {
    try {
        const cap = (window as any).Capacitor;
        const widgetPlugin = cap?.Plugins?.AppWidget || (window as any).AndroidWidgetBridge;

        if (widgetPlugin?.requestPinWidget) {
            const res = await widgetPlugin.requestPinWidget();
            return {
                supported: true,
                message: res?.message || 'Permintaan pasang widget berhasil dikirim ke Launcher Android.',
            };
        }
    } catch (e: any) {
        return {
            supported: false,
            message: e?.message || 'Gagal memicu pemasangan otomatis.',
        };
    }

    return {
        supported: false,
        message: 'Untuk memasang widget di Android 12+: Tekan & tahan layar depan (Home Screen) > Pilih "Widget" > Cari "JadwalPriok" > Seret ke layar.',
    };
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
    android:background="@drawable/widget_bg"
    android:padding="12dp">

    <!-- Header Judul: Shift Priok -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        android:layout_marginBottom="6dp">

        <TextView
            android:id="@+id/tv_widget_title"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
            android:text="Shift"
            android:textColor="#0F766E"
            android:textSize="14sp"
            android:textStyle="bold" />

        <TextView
            android:id="@+id/tv_widget_subtitle"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Priok"
            android:textColor="#94A3B8"
            android:textSize="10sp" />
    </LinearLayout>

    <!-- Baris 1: Hari Ini mmdd <Shift> -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        android:paddingTop="2dp"
        android:paddingBottom="4dp">

        <TextView
            android:id="@+id/tv_today_label"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Hari Ini"
            android:textColor="#0F172A"
            android:textSize="12sp"
            android:textStyle="bold"
            android:layout_marginEnd="6dp" />

        <TextView
            android:id="@+id/tv_today_date"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
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
            android:background="@drawable/badge_shift_rounded"
            android:paddingStart="8dp"
            android:paddingEnd="8dp"
            android:paddingTop="2dp"
            android:paddingBottom="2dp"
            android:textSize="12sp"
            android:textStyle="bold" />
    </LinearLayout>

    <!-- Divider Pemisah -->
    <View
        android:id="@+id/divider_line"
        android:layout_width="match_parent"
        android:layout_height="1dp"
        android:background="#E2E8F0"
        android:layout_marginTop="2dp"
        android:layout_marginBottom="2dp" />

    <!-- Baris 2: Besok mmdd <Shift> -->
    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1"
        android:orientation="horizontal"
        android:gravity="center_vertical"
        android:paddingTop="4dp"
        android:paddingBottom="2dp">

        <TextView
            android:id="@+id/tv_tomorrow_label"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:text="Besok"
            android:textColor="#0F172A"
            android:textSize="12sp"
            android:textStyle="bold"
            android:layout_marginEnd="6dp" />

        <TextView
            android:id="@+id/tv_tomorrow_date"
            android:layout_width="0dp"
            android:layout_height="wrap_content"
            android:layout_weight="1"
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
            android:background="@drawable/badge_shift_rounded"
            android:paddingStart="8dp"
            android:paddingEnd="8dp"
            android:paddingTop="2dp"
            android:paddingBottom="2dp"
            android:textSize="12sp"
            android:textStyle="bold" />
    </LinearLayout>
</LinearLayout>`;

export const ANDROID_WIDGET_PROVIDER_KOTLIN = `package com.jadwalpriok.app.widget

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
        const val ACTION_UPDATE_WIDGET = "com.jadwalpriok.app.ACTION_UPDATE_WIDGET"

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            try {
                val views = RemoteViews(context.packageName, R.layout.widget_shift_compact)

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

                // Terapkan Tema Widget
                when (currentTheme) {
                    "dark" -> {
                        views.setInt(R.id.widget_container, "setBackgroundResource", R.drawable.widget_bg_dark)
                        views.setTextColor(R.id.tv_widget_title, Color.parseColor("#34D399"))
                        views.setTextColor(R.id.tv_today_label, Color.parseColor("#F8FAFC"))
                        views.setTextColor(R.id.tv_today_date, Color.parseColor("#94A3B8"))
                        views.setTextColor(R.id.tv_tomorrow_label, Color.parseColor("#F8FAFC"))
                        views.setTextColor(R.id.tv_tomorrow_date, Color.parseColor("#94A3B8"))
                    }
                    "vista" -> {
                        views.setInt(R.id.widget_container, "setBackgroundResource", R.drawable.widget_bg_vista)
                        views.setTextColor(R.id.tv_widget_title, Color.parseColor("#38BDF8"))
                        views.setTextColor(R.id.tv_today_label, Color.parseColor("#FFFFFF"))
                        views.setTextColor(R.id.tv_today_date, Color.parseColor("#E0F2FE"))
                        views.setTextColor(R.id.tv_tomorrow_label, Color.parseColor("#FFFFFF"))
                        views.setTextColor(R.id.tv_tomorrow_date, Color.parseColor("#E0F2FE"))
                    }
                    "winamp" -> {
                        views.setInt(R.id.widget_container, "setBackgroundResource", R.drawable.widget_bg_winamp)
                        views.setTextColor(R.id.tv_widget_title, Color.parseColor("#00FF00"))
                        views.setTextColor(R.id.tv_today_label, Color.parseColor("#00FF00"))
                        views.setTextColor(R.id.tv_today_date, Color.parseColor("#00FF00"))
                        views.setTextColor(R.id.tv_tomorrow_label, Color.parseColor("#00FF00"))
                        views.setTextColor(R.id.tv_tomorrow_date, Color.parseColor("#00FF00"))
                    }
                    else -> {
                        views.setInt(R.id.widget_container, "setBackgroundResource", R.drawable.widget_bg)
                        views.setTextColor(R.id.tv_widget_title, Color.parseColor("#0F766E"))
                        views.setTextColor(R.id.tv_today_label, Color.parseColor("#0F172A"))
                        views.setTextColor(R.id.tv_today_date, Color.parseColor("#64748B"))
                        views.setTextColor(R.id.tv_tomorrow_label, Color.parseColor("#0F172A"))
                        views.setTextColor(R.id.tv_tomorrow_date, Color.parseColor("#64748B"))
                    }
                }

                views.setTextViewText(R.id.tv_widget_title, "Shift")
                views.setTextViewText(R.id.tv_widget_subtitle, "Priok")
                views.setTextViewText(R.id.tv_today_date, todayDate)
                views.setTextViewText(R.id.tv_today_shift, todayShift)
                views.setTextViewText(R.id.tv_tomorrow_date, tomorrowDate)
                views.setTextViewText(R.id.tv_tomorrow_shift, tomorrowShift)

                val intent = Intent(context, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                }
                val pendingFlags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                } else {
                    PendingIntent.FLAG_UPDATE_CURRENT
                }
                val pendingIntent = PendingIntent.getActivity(context, 0, intent, pendingFlags)
                views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)

                appWidgetManager.updateAppWidget(appWidgetId, views)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}`;

export const ANDROID_WIDGET_INFO_XML = `<?xml version="1.0" encoding="utf-8"?>
<!-- res/xml/widget_shift_info.xml (Android 12, 13, 14, 15+) -->
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="130dp"
    android:minHeight="65dp"
    android:minResizeWidth="110dp"
    android:minResizeHeight="55dp"
    android:targetCellWidth="2"
    android:targetCellHeight="1"
    android:maxResizeWidth="480dp"
    android:maxResizeHeight="360dp"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/widget_shift_compact"
    android:previewLayout="@layout/widget_shift_compact"
    android:resizeMode="horizontal|vertical"
    android:widgetFeatures="reconfigurable|configuration_optional"
    android:widgetCategory="home_screen"
    android:description="@string/widget_shift_description">
</appwidget-provider>`;

export const ANDROID_MANIFEST_SNIPPET = `<!-- Tambahkan di dalam tag <application>...</application> di AndroidManifest.xml -->
<receiver
    android:name=".widget.ShiftWidgetProvider"
    android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
        <action android:name="com.jadwalpriok.app.ACTION_UPDATE_WIDGET" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/widget_shift_info" />
</receiver>`;
