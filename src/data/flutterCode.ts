// KODE LENGKAP FLUTTER DART (RESPONSIF MOBILE/PC + TABEL REKAPITULASI)
export const FLUTTER_DART_CODE = `import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:excel/excel.dart' as xl;
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:universal_html/html.dart' as html;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase init note: \$e');
  }
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Jadwal Shift & Lembur',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFE6E6E6),
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFF297373),
          foregroundColor: Colors.white,
          elevation: 2,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFFF8552),
            foregroundColor: Colors.white,
            elevation: 1,
            shape: const RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(10)),
            ),
          ),
        ),
        floatingActionButtonTheme: const FloatingActionButtonThemeData(
          backgroundColor: Color(0xFFFF8552),
          foregroundColor: Colors.white,
        ),
        textTheme: const TextTheme(
          bodyLarge: TextStyle(color: Color(0xFF39393A)),
          bodyMedium: TextStyle(color: Color(0xFF39393A)),
          titleLarge: TextStyle(color: Color(0xFF39393A)),
        ),
        colorScheme: ColorScheme.fromSwatch().copyWith(
          primary: const Color(0xFF297373),
          secondary: const Color(0xFF85FFC7),
        ),
      ),
      home: const MainNavigationScreen(),
    );
  }
}

/// Model data harian per tanggal
class DailyShiftData {
  String shift;
  bool isLocked;
  String note;
  bool isMasuk;
  String tipeMasukLibur; // 'piket' | 'lembur'
  bool isHoldDokumen;
  String jamMasuk;
  String jamPulang;
  String absenCeisa;
  bool isSuratTugasTambahan;
  bool isManualHoliday;
  bool isGunakanOffGeser;
  String referensiTglOff;

  DailyShiftData({
    this.shift = 'Graha',
    this.isLocked = false,
    this.note = '',
    this.isMasuk = false, // DEFAULT TIDAK MASUK
    this.tipeMasukLibur = 'piket',
    this.isHoldDokumen = false,
    this.jamMasuk = '',
    this.jamPulang = '',
    this.absenCeisa = '',
    this.isSuratTugasTambahan = false,
    this.isManualHoliday = false,
    this.isGunakanOffGeser = false,
    this.referensiTglOff = '',
  });

  factory DailyShiftData.fromJson(Map<String, dynamic> json) {
    return DailyShiftData(
      shift: json['shift'] ?? 'Graha',
      isLocked: json['isLocked'] ?? false,
      note: json['note'] ?? '',
      isMasuk: json['isMasuk'] ?? false,
      tipeMasukLibur: json['tipeMasukLibur'] ?? 'piket',
      isHoldDokumen: json['isHoldDokumen'] ?? false,
      jamMasuk: json['jamMasuk'] ?? '',
      jamPulang: json['jamPulang'] ?? '',
      absenCeisa: json['absenCeisa'] ?? '',
      isSuratTugasTambahan: json['isSuratTugasTambahan'] ?? json['isCutiPengganti'] ?? false,
      isManualHoliday: json['isManualHoliday'] ?? false,
      isGunakanOffGeser: json['isGunakanOffGeser'] ?? false,
      referensiTglOff: json['referensiTglOff'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'shift': shift,
      'isLocked': isLocked,
      'note': note,
      'isMasuk': isMasuk,
      'tipeMasukLibur': tipeMasukLibur,
      'isHoldDokumen': isHoldDokumen,
      'jamMasuk': jamMasuk,
      'jamPulang': jamPulang,
      'absenCeisa': absenCeisa,
      'isSuratTugasTambahan': isSuratTugasTambahan,
      'isManualHoliday': isManualHoliday,
      'isGunakanOffGeser': isGunakanOffGeser,
      'referensiTglOff': referensiTglOff,
    };
  }

  factory DailyShiftData.fromSupabase(Map<String, dynamic> row) {
    return DailyShiftData(
      shift: row['shift'] ?? 'Graha',
      isLocked: row['is_locked'] ?? false,
      note: row['note'] ?? '',
      isMasuk: row['is_masuk'] ?? false,
      tipeMasukLibur: row['tipe_masuk_libur'] ?? 'piket',
      isHoldDokumen: row['is_hold_dokumen'] ?? false,
      jamMasuk: row['jam_masuk'] ?? '',
      jamPulang: row['jam_pulang'] ?? '',
      absenCeisa: row['absen_ceisa'] ?? '',
      isSuratTugasTambahan: row['is_surat_tugas_tambahan'] ?? false,
      isManualHoliday: row['is_manual_holiday'] ?? false,
      isGunakanOffGeser: row['is_gunakan_off_geser'] ?? false,
      referensiTglOff: row['referensi_tgl_off'] ?? '',
    );
  }

  Map<String, dynamic> toSupabase(String dateKey) {
    return {
      'date_key': dateKey,
      'shift': shift,
      'is_locked': isLocked,
      'note': note,
      'is_masuk': isMasuk,
      'tipe_masuk_libur': tipeMasukLibur,
      'is_hold_dokumen': isHoldDokumen,
      'jam_masuk': jamMasuk,
      'jam_pulang': jamPulang,
      'absen_ceisa': absenCeisa,
      'is_surat_tugas_tambahan': isSuratTugasTambahan,
      'is_manual_holiday': isManualHoliday,
      'is_gunakan_off_geser': isGunakanOffGeser,
      'referensi_tgl_off': referensiTglOff,
      'updated_at': DateTime.now().toUtc().toIso8601String(),
    };
  }
}

class DayCalculationResult {
  final bool isLembur;
  final double jamLembur;
  final double durasiKerja;
  final double jamBiasa;
  final bool isPiket;
  final bool isDapatGeserOff;
  final bool isOffDiambil;
  final bool isCutiPengganti;
  final String keteranganStatus;

  DayCalculationResult({
    required this.isLembur,
    required this.jamLembur,
    required this.durasiKerja,
    required this.jamBiasa,
    required this.isPiket,
    required this.isDapatGeserOff,
    required this.isOffDiambil,
    required this.isCutiPengganti,
    required this.keteranganStatus,
  });
}

/// Model Hasil Penilaian Skor Absen CEISA (Tahap 8)
class CeisaScoreResult {
  final int score; // 1, 2, 3, 4, or 0 if not eligible
  final String grade; // 'Sangat Baik', 'Baik', 'Cukup', 'Kurang', 'N/A'
  final String ruleDescription;
  final bool isEligible;

  CeisaScoreResult({
    required this.score,
    required this.grade,
    required this.ruleDescription,
    required this.isEligible,
  });
}

/// Screen Navigasi Utama: Memisahkan Halaman Kalender, Rekapitulasi, & Performance
class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentNavIndex = 0; // 0 = Kalender, 1 = Rekapitulasi, 2 = Performance
  String _performancePeriodType = 'month'; // 'month' | 'quarter' | 'semester' | 'year'
  int _selectedQuarter = 1; // 1..4
  int _selectedSemester = 1; // 1..2

  final GlobalKey _calendarBoundaryKey = GlobalKey();

  late int selectedMonth;
  late int selectedYear;
  bool _isLoading = true;
  bool _isSyncing = false;
  int? _lastPingMs;

  String _supabaseUrl = '';
  String _supabaseAnonKey = '';
  bool _isSupabaseInitialized = false;

  final Map<String, bool> _cellExpanded = {};

  final List<String> monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  final List<int> years = List.generate(9, (index) => 2024 + index);
  final List<String> dayHeaders = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  final List<String> shiftOptions = ['Graha', 'NPCT', 'TPSL', 'OFF', 'SM', 'PM', 'Malam'];
  final Map<String, DailyShiftData> _scheduleData = {};

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    selectedMonth = now.month;
    selectedYear = (now.year >= 2024 && now.year <= 2032) ? now.year : 2025;
    _initApp();
  }

  Future<void> _initApp() async {
    await _loadLocalData();
    if (_supabaseUrl.isNotEmpty && _supabaseAnonKey.isNotEmpty) {
      await _initSupabaseClient(_supabaseUrl, _supabaseAnonKey);
    }
  }

  Future<void> _loadLocalData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _supabaseUrl = prefs.getString('supabase_url') ?? '';
      _supabaseAnonKey = prefs.getString('supabase_anon_key') ?? '';

      final keys = prefs.getKeys();
      for (String key in keys) {
        if (key.startsWith('shift_data_')) {
          final dateKey = key.replaceFirst('shift_data_', '');
          final jsonStr = prefs.getString(key);
          if (jsonStr != null) {
            final Map<String, dynamic> jsonMap = jsonDecode(jsonStr);
            _scheduleData[dateKey] = DailyShiftData.fromJson(jsonMap);
          }
        }
      }
    } catch (e) {
      debugPrint('Error memuat data lokal: \$e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<bool> _initSupabaseClient(String url, String anonKey) async {
    try {
      if (!_isSupabaseInitialized) {
        await Supabase.initialize(
          url: url.trim(),
          anonKey: anonKey.trim(),
        );
        _isSupabaseInitialized = true;
      }
      return true;
    } catch (e) {
      debugPrint('Supabase init error: \$e');
      return false;
    }
  }

  Future<int?> _measureSupabasePing(String url, String anonKey) async {
    try {
      final cleanUrl = url.trim().replaceAll(RegExp(r'/+\$'), '');
      final endpoint = Uri.parse('\$cleanUrl/rest/v1/');
      final stopwatch = Stopwatch()..start();

      final response = await http.get(
        endpoint,
        headers: {
          'apikey': anonKey.trim(),
          'Authorization': 'Bearer \${anonKey.trim()}',
        },
      ).timeout(const Duration(milliseconds: 2000));

      stopwatch.stop();
      if (response.statusCode >= 200 && response.statusCode < 500) {
        return stopwatch.elapsedMilliseconds;
      }
      return null;
    } catch (_) {
      return null;
    }
  }

  Future<void> _syncWithCloud({bool isManualClick = false}) async {
    // 1. Firebase Firestore sync
    try {
      final firestore = FirebaseFirestore.instance;
      for (var entry in _scheduleData.entries) {
        await firestore.collection('shifts').doc(entry.key).set(entry.value.toJson());
      }
    } catch (_) {}

    // 2. Supabase sync jika ada koneksi
    if (_supabaseUrl.isNotEmpty && _supabaseAnonKey.isNotEmpty) {
      setState(() => _isSyncing = true);
      final ping = await _measureSupabasePing(_supabaseUrl, _supabaseAnonKey);
      setState(() => _lastPingMs = ping);

      if (ping == null || ping > 500) {
        setState(() => _isSyncing = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: Colors.deepOrange.shade800,
              content: Text(
                ping == null
                    ? 'Koneksi offline. Menggunakan database lokal.'
                    : 'Koneksi lambat (\${ping}ms > 500ms). Mode Offline.',
              ),
            ),
          );
        }
        return;
      }

      try {
        await _initSupabaseClient(_supabaseUrl, _supabaseAnonKey);
        final client = Supabase.instance.client;
        final response = await client.from('jadwal_shift').select();
        final List<dynamic> rows = response as List<dynamic>;

        for (var row in rows) {
          final dateKey = row['date_key']?.toString();
          if (dateKey != null) {
            final cloudData = DailyShiftData.fromSupabase(row);
            _scheduleData[dateKey] = cloudData;
            final prefs = await SharedPreferences.getInstance();
            await prefs.setString('shift_data_\$dateKey', jsonEncode(cloudData.toJson()));
          }
        }

        final List<Map<String, dynamic>> upsertPayload = [];
        _scheduleData.forEach((key, val) {
          upsertPayload.add(val.toSupabase(key));
        });
        if (upsertPayload.isNotEmpty) {
          await client.from('jadwal_shift').upsert(upsertPayload);
        }

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: Colors.green.shade700,
              content: Text('Sinkronisasi Sukses! Ping: \${ping}ms (Cloud Terhubung)'),
            ),
          );
        }
      } catch (e) {
        debugPrint('Supabase Sync Error: \$e');
      } finally {
        if (mounted) setState(() => _isSyncing = false);
      }
    }
  }

  Future<void> _autoSaveDayData(String key, DailyShiftData data) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('shift_data_\$key', jsonEncode(data.toJson()));

      try {
        FirebaseFirestore.instance.collection('shifts').doc(key).set(data.toJson());
      } catch (_) {}

      if (_supabaseUrl.isNotEmpty && _supabaseAnonKey.isNotEmpty) {
        final ping = await _measureSupabasePing(_supabaseUrl, _supabaseAnonKey);
        if (ping != null && ping <= 500) {
          await _initSupabaseClient(_supabaseUrl, _supabaseAnonKey);
          await Supabase.instance.client.from('jadwal_shift').upsert(data.toSupabase(key));
        }
      }
    } catch (e) {
      debugPrint('Error auto-saving: \$e');
    }
  }

  DailyShiftData _getDayData(int year, int month, int day) {
    final key = '\$year-\$month-\$day';
    if (!_scheduleData.containsKey(key)) {
      _scheduleData[key] = DailyShiftData();
    }
    return _scheduleData[key]!;
  }

  Color _getShiftBgColor(String shift) {
    switch (shift) {
      case 'Graha':
      case 'G': return const Color(0xFFEDF6F9);
      case 'TPSL':
      case 'L': return const Color(0xFFE29578);
      case 'NPCT':
      case 'N': return const Color(0xFFFFDDD2);
      case 'SM':
      case 'S2': return const Color(0xFF83C5BE);
      case 'PM': return const Color(0xFF006D77);
      case 'Malam':
      case 'M': return const Color(0xFF2C4251);
      case 'OFF':
      case 'O': return const Color(0xFFBE1A1A);
      case 'CUTI':
      case 'C':
      case 'CT': return const Color(0xFF0B0909);
      default: return const Color(0xFFE2E8F0);
    }
  }

  Color _getShiftTextColor(String shift) {
    switch (shift) {
      case 'Graha':
      case 'G': return const Color(0xFF1D2A44);
      case 'NPCT':
      case 'N': return const Color(0xFF39393A);
      case 'SM':
      case 'S2': return const Color(0xFF0B0909);
      default: return Colors.white;
    }
  }

  double _calculateWorkDuration(String jamMasuk, String jamPulang) {
    if (!jamMasuk.contains(':') || !jamPulang.contains(':')) return 0.0;
    try {
      final inParts = jamMasuk.split(':');
      final outParts = jamPulang.split(':');
      final inH = int.parse(inParts[0]);
      final inM = int.parse(inParts[1]);
      final outH = int.parse(outParts[0]);
      final outM = int.parse(outParts[1]);

      int diffMinutes = (outH * 60 + outM) - (inH * 60 + inM);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      return diffMinutes / 60.0;
    } catch (_) {
      return 0.0;
    }
  }

  DayCalculationResult _calculateDayResult(DailyShiftData data, DateTime date) {
    final bool isWeekend = date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;
    final bool isTanggalMerah = isWeekend || data.isManualHoliday;
    final double durasi = _calculateWorkDuration(data.jamMasuk, data.jamPulang);
    final bool hasMasukInput = data.jamMasuk.trim().isNotEmpty;
    final bool isUserMasuk = data.isMasuk;

    bool isLembur = false;
    double jamLembur = 0.0;
    double jamBiasa = 0.0;
    bool isPiket = false;
    bool isDapatGeserOff = false;
    bool isOffDiambil = false;
    bool isCutiPengganti = false;
    String status = '';

    if (data.isSuratTugasTambahan && isTanggalMerah) {
      isCutiPengganti = true;
    }

    if (isTanggalMerah) {
      if (data.shift == 'OFF') {
        if (isUserMasuk && hasMasukInput) {
          // Masuk saat jadwal OFF di tanggal merah -> Lembur Hari Libur (2 - 8 Jam)
          if (durasi >= 2.0) {
            isLembur = true;
            jamLembur = durasi > 8.0 ? 8.0 : durasi;
            status = 'Lembur Libur (\${jamLembur.toStringAsFixed(1)}h)';
          } else {
            status = 'Lembur Hangus (<2h)';
          }
        } else {
          status = '';
        }
      } else {
        if (isUserMasuk) {
          final tipeLibur = data.tipeMasukLibur;
          if (tipeLibur == 'lembur') {
            if (hasMasukInput) {
              if (durasi >= 2.0) {
                isLembur = true;
                jamLembur = durasi > 8.0 ? 8.0 : durasi;
                status = 'Lembur Libur (\${jamLembur.toStringAsFixed(1)}h)';
              } else {
                status = 'Lembur Hangus (<2h)';
              }
            } else {
              status = 'Lembur Libur';
            }
          } else {
            isPiket = true;
            status = 'Piket Libur';
            jamBiasa = durasi > 8.5 ? 8.5 : durasi;
            if (durasi > 9.5) {
              final double extra = durasi - 8.5;
              if (extra >= 1.0) {
                isLembur = true;
                jamLembur = extra > 3.0 ? 3.0 : extra;
                status = 'Piket + Lembur (\${jamLembur.toStringAsFixed(1)}h)';
              }
            }
          }
        }
      }
    } else {
      if (data.shift == 'OFF') {
        if (isUserMasuk) {
          // SKENARIO MENABUNG OFF: Masuk kerja di hari kerja jadwal OFF
          isDapatGeserOff = true;
          status = 'OFF Ditabung (+1)';
          jamBiasa = durasi > 8.5 ? 8.5 : durasi;
        } else {
          status = '';
        }
      } else {
        if (isUserMasuk) {
          jamBiasa = durasi > 8.5 ? 8.5 : durasi;
          if (durasi > 9.5) {
            final double extra = durasi - 8.5;
            if (extra >= 1.0) {
              isLembur = true;
              jamLembur = extra > 3.0 ? 3.0 : extra;
              status = 'Lembur (\${jamLembur.toStringAsFixed(1)}h)';
            }
          }
        } else {
          // SKENARIO MENGAMBIL OFF: Jadwal kerja biasa tapi libur menggunakan OFF Geser
          if (data.isGunakanOffGeser) {
            isOffDiambil = true;
            status = 'OFF Diambil (-1)';
          } else {
            status = '';
          }
        }
      }
    }

    return DayCalculationResult(
      isLembur: isLembur,
      jamLembur: jamLembur,
      durasiKerja: durasi,
      jamBiasa: jamBiasa,
      isPiket: isPiket,
      isDapatGeserOff: isDapatGeserOff,
      isOffDiambil: isOffDiambil,
      isCutiPengganti: isCutiPengganti,
      keteranganStatus: status,
    );
  }

  // ==========================================
  // LOGIKA PENILAIAN ABSEN CEISA (TAHAP 8 & HOLD DOKUMEN)
  // ==========================================
  CeisaScoreResult _calculateCeisaScore(String shift, String absenCeisa, bool isMasuk, {bool isHoldDokumen = false}) {
    if (isHoldDokumen) {
      return CeisaScoreResult(score: 0, grade: 'Hold Dokumen', ruleDescription: 'Hold Dokumen (Tidak Masuk Penilaian)', isEligible: false);
    }

    if (!isMasuk || shift == 'OFF') {
      return CeisaScoreResult(score: 0, grade: 'OFF / Libur', ruleDescription: 'Tidak bertugas / Libur', isEligible: false);
    }

    if (shift == 'M') {
      return CeisaScoreResult(score: 4, grade: 'Sangat Baik', ruleDescription: 'Shift M (Otomatis Skor 4)', isEligible: true);
    }

    if (absenCeisa.isEmpty || !absenCeisa.contains(':')) {
      return CeisaScoreResult(score: 0, grade: 'Belum Absen', ruleDescription: 'Data absen CEISA kosong', isEligible: false);
    }

    final totalMinutes = _parseTimeToMinutes(absenCeisa);
    if (totalMinutes == null) {
      return CeisaScoreResult(score: 0, grade: 'Format Salah', ruleDescription: 'Format waktu tidak valid', isEligible: false);
    }

    // Shift G, L, N, PM, SM: <= 07:30 (4), 07:31-08:00 (3), 08:01-08:45 (2), > 08:45 (1)
    if (totalMinutes <= 7 * 60 + 30) {
      return CeisaScoreResult(score: 4, grade: 'Sangat Baik', ruleDescription: '<= 07:30 (Tepat Waktu)', isEligible: true);
    } else if (totalMinutes <= 8 * 60) {
      return CeisaScoreResult(score: 3, grade: 'Baik', ruleDescription: '07:31 - 08:00 (Tepat Waktu)', isEligible: true);
    } else if (totalMinutes <= 8 * 60 + 45) {
      return CeisaScoreResult(score: 2, grade: 'Cukup', ruleDescription: '08:01 - 08:45 (Terlambat Ringan)', isEligible: true);
    } else {
      return CeisaScoreResult(score: 1, grade: 'Kurang', ruleDescription: '> 08:45 (Terlambat Berat)', isEligible: true);
    }
  }

  String _getPredikatPerformance(double avg) {
    if (avg >= 3.75) return 'Sangat Baik';
    if (avg >= 3.00) return 'Baik';
    if (avg >= 2.00) return 'Cukup';
    if (avg > 0) return 'Kurang';
    return 'Belum Ada Data';
  }

  // ==========================================
  // LOGIKA EKSPOR DATA (WEB & NATIVE)
  // ==========================================
  void _downloadFileInBrowser(Uint8List bytes, String filename, String mimeType) {
    if (kIsWeb) {
      final blob = html.Blob([bytes], mimeType);
      final url = html.Url.createObjectUrlFromBlob(blob);
      final anchor = html.AnchorElement(href: url)
        ..setAttribute('download', filename)
        ..click();
      html.Url.revokeObjectUrl(url);
    }
  }

  void _exportAsJSON() {
    final Map<String, dynamic> exportMap = {
      'app': 'Jadwal Shift & Lembur',
      'version': '1.0.0',
      'exported_at': DateTime.now().toIso8601String(),
      'month': selectedMonth,
      'year': selectedYear,
      'month_name': monthNames[selectedMonth - 1],
      'data': _scheduleData.map((k, v) => MapEntry(k, v.toJson())),
    };

    final String jsonStr = const JsonEncoder.withIndent('  ').convert(exportMap);
    final bytes = Uint8List.fromList(utf8.encode(jsonStr));
    final filename = 'Backup_Jadwal_\${monthNames[selectedMonth - 1]}_\$selectedYear.json';

    _downloadFileInBrowser(bytes, filename, 'application/json');
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(backgroundColor: Colors.indigo, content: Text('File \$filename berhasil diekspor!')),
    );
  }

  void _exportAsSQL() {
    final daysInMonth = DateTime(selectedYear, selectedMonth + 1, 0).day;
    final buffer = StringBuffer();
    buffer.writeln('-- DUMP DATA JADWAL SHIFT');
    buffer.writeln('-- Periode: \${monthNames[selectedMonth - 1]} \$selectedYear\\n');

    buffer.writeln('CREATE TABLE IF NOT EXISTS public.jadwal_shift (');
    buffer.writeln('  date_key TEXT PRIMARY KEY,');
    buffer.writeln('  shift TEXT NOT NULL DEFAULT \\'G\\',');
    buffer.writeln('  is_locked BOOLEAN NOT NULL DEFAULT false,');
    buffer.writeln('  note TEXT DEFAULT \\'\\',');
    buffer.writeln('  is_masuk BOOLEAN NOT NULL DEFAULT false,');
    buffer.writeln('  tipe_masuk_libur TEXT NOT NULL DEFAULT \\'piket\\',');
    buffer.writeln('  is_hold_dokumen BOOLEAN NOT NULL DEFAULT false,');
    buffer.writeln('  jam_masuk TEXT DEFAULT \\'\\',');
    buffer.writeln('  jam_pulang TEXT DEFAULT \\'\\',');
    buffer.writeln('  absen_ceisa TEXT DEFAULT \\'\\',');
    buffer.writeln('  is_surat_tugas_tambahan BOOLEAN NOT NULL DEFAULT false,');
    buffer.writeln('  is_manual_holiday BOOLEAN NOT NULL DEFAULT false,');
    buffer.writeln('  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()');
    buffer.writeln(');\\n');

    for (int day = 1; day <= daysInMonth; day++) {
      final key = '\$selectedYear-\$selectedMonth-\$day';
      final data = _getDayData(selectedYear, selectedMonth, day);
      final safeNote = data.note.replaceAll(\"'\", \"''\");
      buffer.writeln(
        \"INSERT INTO public.jadwal_shift (date_key, shift, is_locked, note, is_masuk, tipe_masuk_libur, is_hold_dokumen, jam_masuk, jam_pulang, absen_ceisa, is_surat_tugas_tambahan, is_manual_holiday, updated_at) \"
        \"VALUES ('\$key', '\${data.shift}', \${data.isLocked}, '\$safeNote', \${data.isMasuk}, '\${data.tipeMasukLibur}', \${data.isHoldDokumen}, '\${data.jamMasuk}', '\${data.jamPulang}', '\${data.absenCeisa}', \${data.isSuratTugasTambahan}, \${data.isManualHoliday}, NOW()) \"
        \"ON CONFLICT (date_key) DO UPDATE SET \"
        \"shift = EXCLUDED.shift, note = EXCLUDED.note, is_masuk = EXCLUDED.is_masuk, jam_masuk = EXCLUDED.jam_masuk, jam_pulang = EXCLUDED.jam_pulang, absen_ceisa = EXCLUDED.absen_ceisa, updated_at = NOW();\"
      );
    }

    final bytes = Uint8List.fromList(utf8.encode(buffer.toString()));
    final filename = 'Dump_Jadwal_\${monthNames[selectedMonth - 1]}_\$selectedYear.sql';
    _downloadFileInBrowser(bytes, filename, 'application/sql');

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(backgroundColor: Colors.indigo, content: Text('File \$filename berhasil diekspor!')),
    );
  }

  Future<void> _exportAsExcel() async {
    final excel = xl.Excel.createExcel();
    final sheetName = 'Jadwal_\${monthNames[selectedMonth - 1]}';
    final sheet = excel[sheetName];
    excel.setDefaultSheet(sheetName);

    sheet.appendRow([
      xl.TextCellValue('Tanggal'),
      xl.TextCellValue('Shift'),
      xl.TextCellValue('Masuk'),
      xl.TextCellValue('Jam Masuk'),
      xl.TextCellValue('Jam Pulang'),
      xl.TextCellValue('Ceisa'),
      xl.TextCellValue('Durasi (Jam)'),
      xl.TextCellValue('Lembur (Jam)'),
      xl.TextCellValue('Jam Biasa'),
      xl.TextCellValue('Keterangan'),
      xl.TextCellValue('ST (Cuti)'),
      xl.TextCellValue('Catatan'),
    ]);

    final daysInMonth = DateTime(selectedYear, selectedMonth + 1, 0).day;
    for (int day = 1; day <= daysInMonth; day++) {
      final date = DateTime(selectedYear, selectedMonth, day);
      final data = _getDayData(selectedYear, selectedMonth, day);
      final calc = _calculateDayResult(data, date);

      sheet.appendRow([
        xl.TextCellValue('\$day/\$selectedMonth/\$selectedYear'),
        xl.TextCellValue(data.shift),
        xl.TextCellValue(data.isMasuk ? 'Masuk' : 'Tidak'),
        xl.TextCellValue(data.jamMasuk),
        xl.TextCellValue(data.jamPulang),
        xl.TextCellValue(data.absenCeisa),
        xl.DoubleCellValue(calc.durasiKerja),
        xl.DoubleCellValue(calc.jamLembur),
        xl.DoubleCellValue(calc.jamBiasa),
        xl.TextCellValue(calc.keteranganStatus),
        xl.TextCellValue(data.isSuratTugasTambahan ? 'Ya' : 'Tidak'),
        xl.TextCellValue(data.note),
      ]);
    }

    final fileBytes = excel.save();
    if (fileBytes != null) {
      final filename = 'Jadwal_Shift_\${monthNames[selectedMonth - 1]}_\$selectedYear.xlsx';
      _downloadFileInBrowser(
        Uint8List.fromList(fileBytes),
        filename,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: Colors.green.shade700, content: Text('File Excel \$filename berhasil diunduh!')),
      );
    }
  }

  Future<void> _exportAsPDF() async {
    final pdf = pw.Document();
    final daysInMonth = DateTime(selectedYear, selectedMonth + 1, 0).day;
    final List<List<String>> tableData = [];

    for (int day = 1; day <= daysInMonth; day++) {
      final date = DateTime(selectedYear, selectedMonth, day);
      final data = _getDayData(selectedYear, selectedMonth, day);
      final calc = _calculateDayResult(data, date);

      tableData.add([
        '\$day',
        data.shift,
        data.isMasuk ? 'Ya' : '-',
        data.jamMasuk.isNotEmpty ? '\${data.jamMasuk}-\${data.jamPulang}' : '-',
        data.absenCeisa.isNotEmpty ? data.absenCeisa : '-',
        calc.durasiKerja > 0 ? '\${calc.durasiKerja.toStringAsFixed(1)}h' : '-',
        calc.jamLembur > 0 ? '\${calc.jamLembur.toStringAsFixed(1)}h' : '-',
        calc.jamBiasa > 0 ? '\${calc.jamBiasa.toStringAsFixed(1)}h' : '-',
        calc.keteranganStatus,
        data.isSuratTugasTambahan ? 'Ya' : '-',
        data.note,
      ]);
    }

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4.landscape,
        build: (context) => [
          pw.Header(
            level: 0,
            child: pw.Text(
              'Laporan Jadwal Shift & Rekapitulasi - \${monthNames[selectedMonth - 1]} \$selectedYear',
              style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold),
            ),
          ),
          pw.TableHelper.fromTextArray(
            headers: ['Tgl', 'Shift', 'Msk', 'Jam Kerja', 'Ceisa', 'Durasi', 'Lembur', 'Biasa', 'Keterangan', 'ST', 'Note'],
            data: tableData,
            headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold, color: PdfColors.white),
            headerDecoration: const pw.BoxDecoration(color: PdfColors.indigo),
            cellAlignment: pw.Alignment.centerLeft,
            cellStyle: const pw.TextStyle(fontSize: 8),
          ),
        ],
      ),
    );

    final bytes = await pdf.save();
    final filename = 'Laporan_Shift_\${monthNames[selectedMonth - 1]}_\$selectedYear.pdf';
    await Printing.sharePdf(bytes: bytes, filename: filename);
  }

  Future<void> _exportAsPNG() async {
    try {
      final boundary = _calendarBoundaryKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
      if (boundary == null) return;

      final ui.Image image = await boundary.toImage(pixelRatio: 2.0);
      final ByteData? byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) return;

      final pngBytes = byteData.buffer.asUint8List();
      final filename = 'Screenshot_Kalender_\${monthNames[selectedMonth - 1]}_\$selectedYear.png';
      _downloadFileInBrowser(pngBytes, filename, 'image/png');

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(backgroundColor: Colors.indigo, content: Text('Screenshot \$filename tersimpan!')),
      );
    } catch (e) {
      debugPrint('PNG Export Error: \$e');
    }
  }

  void _showExportDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(color: Colors.indigo.shade50, borderRadius: BorderRadius.circular(8)),
              child: const Icon(Icons.download, color: Colors.indigo),
            ),
            const SizedBox(width: 12),
            const Text('Ekspor Data Jadwal', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.table_view, color: Colors.green),
              title: const Text('Excel (.xlsx)', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Data rekapitulasi lembur dan jam kerja'),
              onTap: () {
                Navigator.pop(ctx);
                _exportAsExcel();
              },
            ),
            ListTile(
              leading: const Icon(Icons.picture_as_pdf, color: Colors.red),
              title: const Text('PDF (.pdf)', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Laporan siap cetak landscape A4'),
              onTap: () {
                Navigator.pop(ctx);
                _exportAsPDF();
              },
            ),
            ListTile(
              leading: const Icon(Icons.image, color: Colors.orange),
              title: const Text('PNG Screenshot (.png)', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Tangkapan gambar grid kalender'),
              onTap: () {
                Navigator.pop(ctx);
                _exportAsPNG();
              },
            ),
            ListTile(
              leading: const Icon(Icons.storage, color: Colors.indigo),
              title: const Text('SQL Dump (.sql)', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Kueri INSERT/UPSERT untuk Supabase/Postgres'),
              onTap: () {
                Navigator.pop(ctx);
                _exportAsSQL();
              },
            ),
            ListTile(
              leading: const Icon(Icons.code, color: Colors.blueGrey),
              title: const Text('JSON Raw Data (.json)', style: TextStyle(fontWeight: FontWeight.bold)),
              subtitle: const Text('Cadangan mentah terstruktur'),
              onTap: () {
                Navigator.pop(ctx);
                _exportAsJSON();
              },
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Tutup')),
        ],
      ),
    );
  }

  void _showHolidayDialog() {
    final daysInMonth = DateTime(selectedYear, selectedMonth + 1, 0).day;
    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Row(
              children: [
                const Icon(Icons.flag, color: Colors.red),
                const SizedBox(width: 8),
                Text('Libur Nasional \${monthNames[selectedMonth - 1]} \$selectedYear', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
            content: SizedBox(
              width: double.maxFinite,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red.shade700, foregroundColor: Colors.white),
                    icon: const Icon(Icons.auto_awesome, size: 18),
                    label: const Text('Auto-Terapkan Libur Resmi'),
                    onPressed: () {
                      for (int day = 1; day <= daysInMonth; day++) {
                        final key = '\$selectedYear-\$selectedMonth-\$day';
                        final data = _getDayData(selectedYear, selectedMonth, day);
                        if ((selectedMonth == 8 && day == 17) || (selectedMonth == 1 && day == 1) || (selectedMonth == 12 && day == 25) || (selectedMonth == 5 && day == 1)) {
                          data.isManualHoliday = true;
                          _autoSaveDayData(key, data);
                        }
                      }
                      setState(() {});
                      setModalState(() {});
                      Navigator.pop(ctx);
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Libur resmi berhasil diterapkan!')));
                    },
                  ),
                  const SizedBox(height: 12),
                  const Text('Daftar Tanggal Bulan Ini (Klik untuk Toggle Libur):', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Flexible(
                    child: ListView.builder(
                      shrinkWrap: true,
                      itemCount: daysInMonth,
                      itemBuilder: (c, i) {
                        final d = i + 1;
                        final dateKey = '\$selectedYear-\$selectedMonth-\$d';
                        final data = _getDayData(selectedYear, selectedMonth, d);
                        final date = DateTime(selectedYear, selectedMonth, d);
                        final isWeekend = date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;
                        return CheckboxListTile(
                          dense: true,
                          title: Text('Tanggal \$d \${isWeekend ? "(Akhir Pekan)" : ""}', style: TextStyle(color: (data.isManualHoliday || isWeekend) ? Colors.red.shade800 : Colors.black87, fontWeight: (data.isManualHoliday || isWeekend) ? FontWeight.bold : FontWeight.normal)),
                          value: data.isManualHoliday || isWeekend,
                          onChanged: isWeekend ? null : (val) {
                            data.isManualHoliday = val ?? false;
                            _autoSaveDayData(dateKey, data);
                            setState(() {});
                            setModalState(() {});
                          },
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Selesai')),
            ],
          );
        },
      ),
    );
  }

  // =========================================================
  // MENU MELAYANG (FLOATING NAVIGATION MENU KHUSUS MOBILE)
  // =========================================================
  void _showMobileNavigationMenu(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Indikator Drag Handle
                Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.indigo.shade50,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.apps, color: Colors.indigo, size: 22),
                    ),
                    const SizedBox(width: 12),
                    const Text(
                      'Menu Navigasi & Opsi',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(ctx),
                    ),
                  ],
                ),
                const Divider(height: 20),

                // BAGIAN 1: NAVIGASI HALAMAN UTAMA (TAHAP 13)
                const Align(
                  alignment: Alignment.centerLeft,
                  child: Padding(
                    padding: EdgeInsets.only(left: 4, bottom: 8),
                    child: Text('NAVIGASI HALAMAN', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 0.5)),
                  ),
                ),
                // Grid 4 Menu Navigasi
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 8,
                  crossAxisSpacing: 8,
                  childAspectRatio: 2.3,
                  children: [
                    // 1. Kalender
                    InkWell(
                      borderRadius: BorderRadius.circular(12),
                      onTap: () {
                        Navigator.pop(ctx);
                        setState(() => _currentNavIndex = 0);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: _currentNavIndex == 0 ? Colors.indigo : Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: _currentNavIndex == 0 ? Colors.indigo : Colors.grey.shade300),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.calendar_month, size: 20, color: _currentNavIndex == 0 ? Colors.white : Colors.indigo),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Kalender',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  color: _currentNavIndex == 0 ? Colors.white : Colors.black87,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    // 2. Rekapitulasi
                    InkWell(
                      borderRadius: BorderRadius.circular(12),
                      onTap: () {
                        Navigator.pop(ctx);
                        setState(() => _currentNavIndex = 1);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: _currentNavIndex == 1 ? Colors.indigo : Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: _currentNavIndex == 1 ? Colors.indigo : Colors.grey.shade300),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.table_chart, size: 20, color: _currentNavIndex == 1 ? Colors.white : Colors.indigo),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Rekapitulasi',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  color: _currentNavIndex == 1 ? Colors.white : Colors.black87,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    // 3. Perform CEISA
                    InkWell(
                      borderRadius: BorderRadius.circular(12),
                      onTap: () {
                        Navigator.pop(ctx);
                        setState(() => _currentNavIndex = 2);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: _currentNavIndex == 2 ? Colors.indigo : Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: _currentNavIndex == 2 ? Colors.indigo : Colors.grey.shade300),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.military_tech, size: 20, color: _currentNavIndex == 2 ? Colors.white : Colors.indigo),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Perform CEISA',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  color: _currentNavIndex == 2 ? Colors.white : Colors.black87,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    // 4. Petunjuk
                    InkWell(
                      borderRadius: BorderRadius.circular(12),
                      onTap: () {
                        Navigator.pop(ctx);
                        setState(() => _currentNavIndex = 3);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: _currentNavIndex == 3 ? Colors.indigo : Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: _currentNavIndex == 3 ? Colors.indigo : Colors.grey.shade300),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.menu_book, size: 20, color: _currentNavIndex == 3 ? Colors.white : Colors.indigo),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Petunjuk',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                  color: _currentNavIndex == 3 ? Colors.white : Colors.black87,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                const Divider(height: 20),

                // BAGIAN 2: ALAT & MANAJEMEN
                const Align(
                  alignment: Alignment.centerLeft,
                  child: Padding(
                    padding: EdgeInsets.only(left: 4, bottom: 4),
                    child: Text('ALAT & MANAJEMEN', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 0.5)),
                  ),
                ),

                // Ekspor Data
                ListTile(
                  dense: true,
                  leading: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8)),
                    child: Icon(Icons.file_download_outlined, color: Colors.green.shade700, size: 20),
                  ),
                  title: const Text('Ekspor Data', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: const Text('Excel (.xlsx), PDF, PNG, SQL, JSON', style: TextStyle(fontSize: 11)),
                  trailing: const Icon(Icons.chevron_right, size: 18),
                  onTap: () {
                    Navigator.pop(ctx);
                    _showExportDialog();
                  },
                ),

                // Pengaturan Server / Database (Firebase & Supabase)
                ListTile(
                  dense: true,
                  leading: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(color: Colors.purple.shade50, borderRadius: BorderRadius.circular(8)),
                    child: Icon(Icons.storage, color: Colors.purple.shade700, size: 20),
                  ),
                  title: const Text('Pengaturan Server & Database', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: const Text('Firebase Firestore & Supabase Sync', style: TextStyle(fontSize: 11)),
                  trailing: const Icon(Icons.chevron_right, size: 18),
                  onTap: () {
                    Navigator.pop(ctx);
                    _showServerConfigDialog();
                  },
                ),

                // Kelola Libur Nasional
                ListTile(
                  dense: true,
                  leading: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(8)),
                    child: Icon(Icons.flag_outlined, color: Colors.red.shade700, size: 20),
                  ),
                  title: const Text('Kelola Libur Nasional', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: const Text('Atur hari libur resmi & tanggal merah', style: TextStyle(fontSize: 11)),
                  trailing: const Icon(Icons.chevron_right, size: 18),
                  onTap: () {
                    Navigator.pop(ctx);
                    _showHolidayDialog();
                  },
                ),

                // Sinkronkan Cloud Sekarang
                ListTile(
                  dense: true,
                  leading: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(color: Colors.teal.shade50, borderRadius: BorderRadius.circular(8)),
                    child: Icon(Icons.cloud_sync, color: Colors.teal.shade700, size: 20),
                  ),
                  title: const Text('Sinkronisasi Cloud Sekarang', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                  subtitle: Text(_isSyncing ? 'Sedang melakukan sinkronisasi...' : 'Sinkronkan jadwal dengan cloud database', style: const TextStyle(fontSize: 11)),
                  trailing: _isSyncing
                      ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.chevron_right, size: 18),
                  onTap: () {
                    Navigator.pop(ctx);
                    _syncWithCloud(isManualClick: true);
                  },
                ),
                const SizedBox(height: 8),
              ],
            ),
          ),
        );
      },
    );
  }

  // =========================================================
  // DIALOG PENGATURAN SERVER & DATABASE (FIREBASE / SUPABASE)
  // =========================================================
  void _showServerConfigDialog() {
    final urlController = TextEditingController(text: _supabaseUrl);
    final keyController = TextEditingController(text: _supabaseAnonKey);

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.indigo.shade50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.storage, color: Colors.indigo),
                ),
                const SizedBox(width: 12),
                const Text('Pengaturan Server & DB', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ],
            ),
            content: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Firebase Firestore Info Banner
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.amber.shade50,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.amber.shade300),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.local_fire_department, color: Colors.orange.shade800, size: 22),
                        const SizedBox(width: 8),
                        const Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Firebase Firestore Cloud Sync',
                                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'Status: Terhubung & Aktif Otomatis. Perubahan data langsung tersimpan aman ke cloud.',
                                style: TextStyle(fontSize: 10, color: Colors.black54),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 14),
                  const Text('Supabase / PostgreSQL Server (Opsional):', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: urlController,
                    decoration: const InputDecoration(
                      labelText: 'Supabase Project URL',
                      hintText: 'https://xyz.supabase.co',
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: keyController,
                    decoration: const InputDecoration(
                      labelText: 'Supabase Anon Key',
                      border: OutlineInputBorder(),
                      contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    ),
                  ),
                  const SizedBox(height: 10),
                  if (_lastPingMs != null) ...[
                    Row(
                      children: [
                        Icon(
                          _lastPingMs! <= 500 ? Icons.check_circle : Icons.warning,
                          size: 16,
                          color: _lastPingMs! <= 500 ? Colors.green : Colors.red,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Ping Terakhir: \${_lastPingMs}ms (\${_lastPingMs! <= 500 ? "Online Cepat" : "Offline / Lambat"})',
                          style: TextStyle(
                            fontSize: 11,
                            color: _lastPingMs! <= 500 ? Colors.green.shade800 : Colors.red.shade800,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                  ],
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Batal'),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.indigo,
                  foregroundColor: Colors.white,
                ),
                icon: const Icon(Icons.save, size: 16),
                label: const Text('Simpan & Sinkron'),
                onPressed: () async {
                  final newUrl = urlController.text.trim();
                  final newKey = keyController.text.trim();
                  final prefs = await SharedPreferences.getInstance();
                  await prefs.setString('supabase_url', newUrl);
                  await prefs.setString('supabase_anon_key', newKey);
                  setState(() {
                    _supabaseUrl = newUrl;
                    _supabaseAnonKey = newKey;
                  });
                  Navigator.pop(ctx);
                  _syncWithCloud(isManualClick: true);
                },
              ),
            ],
          );
        },
      ),
    );
  }

  // Time Picker Jam Tangan (Material Dial Clock Face - Bebas 0-59 Menit)
  Future<String?> _pickTime(String currentTime) async {
    int initH = 8;
    int initM = 0;
    if (currentTime.contains(':')) {
      final parts = currentTime.split(':');
      initH = int.tryParse(parts[0]) ?? 8;
      initM = int.tryParse(parts[1]) ?? 0;
    }

    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay(hour: initH, minute: initM),
      initialEntryMode: TimePickerEntryMode.dial, // Dial Jam Tangan Analog
      helpText: 'PILIH WAKTU (BEBAS 0-59 MENIT)',
      builder: (BuildContext context, Widget? child) {
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
          child: child ?? const SizedBox(),
        );
      },
    );

    if (picked != null) {
      return '\${picked.hour.toString().padLeft(2, '0')}:\${picked.minute.toString().padLeft(2, '0')}';
    }
    return null;
  }

  int? _parseTimeToMinutes(String timeStr) {
    if (timeStr.isEmpty || !timeStr.contains(':')) return null;
    final parts = timeStr.split(':');
    if (parts.length != 2) return null;
    final h = int.tryParse(parts[0]);
    final m = int.tryParse(parts[1]);
    if (h == null || m == null) return null;
    return h * 60 + m;
  }

  // =========================================================
  // LOGIKA CLIPBOARD: PASTE DARI EXCEL
  // =========================================================
  Future<void> _pasteScheduleFromClipboard() async {
    try {
      final clipboardData = await Clipboard.getData(Clipboard.kTextPlain);
      if (clipboardData == null || clipboardData.text == null || clipboardData.text!.trim().isEmpty) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              backgroundColor: Colors.redAccent,
              content: Text('Clipboard kosong atau tidak berisi teks jadwal.'),
            ),
          );
        }
        return;
      }

      final text = clipboardData.text!;
      final lines = text.replaceAll('\r', '').split('\n');
      List<String> cells = lines[0].split('\t');
      if (cells.length <= 1 && lines[0].contains(',')) {
        cells = lines[0].split(',');
      } else if (cells.length <= 1 && lines[0].contains(';')) {
        cells = lines[0].split(';');
      } else if (cells.length <= 1 && lines[0].contains(' ')) {
        cells = lines[0].split(RegExp(r'\s+'));
      }

      final daysInMonth = DateTime(selectedYear, selectedMonth + 1, 0).day;
      int updatedCount = 0;

      for (int i = 0; i < daysInMonth && i < cells.length; i++) {
        final cellText = cells[i].trim().toUpperCase();
        if (cellText.isNotEmpty) {
          // Mapping clipboard legacy/alias text ke nama lengkap
          String targetShift = '';
          if (cellText == 'G' || cellText == 'GRAHA') {
            targetShift = 'Graha';
          } else if (cellText == 'L' || cellText == 'TPSL') {
            targetShift = 'TPSL';
          } else if (cellText == 'N' || cellText == 'NPCT') {
            targetShift = 'NPCT';
          } else if (cellText == 'M' || cellText == 'MALAM') {
            targetShift = 'Malam';
          } else if (cellText == 'OFF' || cellText == 'O') {
            targetShift = 'OFF';
          } else if (cellText == 'SM' || cellText == 'S2') {
            targetShift = 'SM';
          } else if (cellText == 'PM') {
            targetShift = 'PM';
          } else {
            final matched = shiftOptions.firstWhere(
              (opt) => opt.toUpperCase() == cellText,
              orElse: () => '',
            );
            if (matched.isNotEmpty) targetShift = matched;
          }

          if (targetShift.isNotEmpty) {
            final day = i + 1;
            final data = _getDayData(selectedYear, selectedMonth, day);
            data.shift = targetShift;
            final dateKey = '\$selectedYear-\$selectedMonth-\$day';
            _autoSaveDayData(dateKey, data);
            updatedCount++;
          }
        }
      }

      if (mounted) {
        setState(() {});
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.green.shade700,
            content: Text('Berhasil paste jadwal (\$updatedCount hari diperbarui)'),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.red.shade700,
            content: Text('Gagal membaca clipboard: \$e'),
          ),
        );
      }
    }
  }

  // =========================================================
  // POP-OUT DIALOG INPUT DETAIL (KHUSUS TAMPILAN MOBILE)
  // =========================================================
  void _showDayDetailDialog(int day, DateTime date, DailyShiftData data) {
    final dateKey = '\$selectedYear-\$selectedMonth-\$day';
    final isWeekend = date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;
    final isTanggalMerah = isWeekend || data.isManualHoliday;
    final noteController = TextEditingController(text: data.note);
    final referensiController = TextEditingController(text: data.referensiTglOff);

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setModalState) {
          final calc = _calculateDayResult(data, date);

          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            titlePadding: EdgeInsets.zero,
            title: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isTanggalMerah ? Colors.rose.shade700 : Colors.indigo.shade700,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Row(
                children: [
                  Icon(Icons.calendar_today, color: Colors.white, size: 20),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Tgl \$day \${monthNames[selectedMonth - 1]} \$selectedYear',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ),
                  if (calc.keteranganStatus.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(6)),
                      child: Text(
                        calc.keteranganStatus,
                        style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                ],
              ),
            ),
            content: SingleChildScrollView(
              child: SizedBox(
                width: double.maxFinite,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Dropdown Shift
                    Row(
                      children: [
                        const Text('Shift Jadwal:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        const Spacer(),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                          decoration: BoxDecoration(
                            color: _getShiftBgColor(data.shift),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: DropdownButton<String>(
                            value: data.shift,
                            dropdownColor: Colors.white,
                            underline: const SizedBox(),
                            icon: Icon(Icons.arrow_drop_down, color: _getShiftTextColor(data.shift)),
                            style: TextStyle(fontWeight: FontWeight.bold, color: _getShiftTextColor(data.shift), fontSize: 14),
                            items: shiftOptions.map((s) {
                              return DropdownMenuItem(
                                value: s,
                                child: Text(s, style: const TextStyle(color: Colors.black87)),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) {
                                data.shift = val;
                                _autoSaveDayData(dateKey, data);
                                setModalState(() {});
                                setState(() {});
                              }
                            },
                          ),
                        ),
                      ],
                    ),
                    const Divider(height: 16),

                    // Switch Masuk Kerja
                    SwitchListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Status Kehadiran (Masuk Kerja)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      value: data.isMasuk,
                      onChanged: (val) {
                        data.isMasuk = val;
                        _autoSaveDayData(dateKey, data);
                        setModalState(() {});
                        setState(() {});
                      },
                    ),

                    // Opsi Kehadiran Libur (Piket vs Lembur) jika Tanggal Merah & Masuk
                    if (isTanggalMerah && data.isMasuk && data.shift != 'OFF') ...[
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: Colors.amber.shade50, borderRadius: BorderRadius.circular(10), border: Border.all(color: Colors.amber.shade300)),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Jenis Kehadiran Tanggal Merah:', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black87)),
                            const SizedBox(height: 4),
                            Row(
                              children: [
                                Expanded(
                                  child: ChoiceChip(
                                    label: const Text('Piket'),
                                    selected: data.tipeMasukLibur == 'piket',
                                    onSelected: (sel) {
                                      if (sel) {
                                        data.tipeMasukLibur = 'piket';
                                        _autoSaveDayData(dateKey, data);
                                        setModalState(() {});
                                        setState(() {});
                                      }
                                    },
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: ChoiceChip(
                                    label: const Text('Lembur (2-8h)'),
                                    selected: data.tipeMasukLibur == 'lembur',
                                    onSelected: (sel) {
                                      if (sel) {
                                        data.tipeMasukLibur = 'lembur';
                                        _autoSaveDayData(dateKey, data);
                                        setModalState(() {});
                                        setState(() {});
                                      }
                                    },
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],

                    // Skenario OFF Geser (Hari Kerja Biasa)
                    if (!isTanggalMerah && !data.isMasuk && data.shift != 'OFF') ...[
                      const SizedBox(height: 6),
                      SwitchListTile(
                        dense: true,
                        contentPadding: EdgeInsets.zero,
                        title: const Text('Gunakan OFF Geser (-1)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.orange)),
                        subtitle: const Text('Ambil jatah libur dari OFF yang pernah ditabung', style: TextStyle(fontSize: 10)),
                        value: data.isGunakanOffGeser,
                        onChanged: (val) {
                          data.isGunakanOffGeser = val;
                          _autoSaveDayData(dateKey, data);
                          setModalState(() {});
                          setState(() {});
                        },
                      ),
                    ],

                    if (!isTanggalMerah && data.isMasuk && data.shift == 'OFF') ...[
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.green.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.green.shade300),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.savings, color: Colors.green.shade700, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'OFF Ditabung (+1) karena bertugas di jadwal OFF hari kerja.',
                                style: TextStyle(fontSize: 11, color: Colors.green.shade900, fontWeight: FontWeight.w600),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],

                    if (!isTanggalMerah && ((data.shift == 'OFF' && data.isMasuk) || (data.shift != 'OFF' && !data.isMasuk && data.isGunakanOffGeser))) ...[
                      const SizedBox(height: 8),
                      TextField(
                        controller: referensiController,
                        decoration: const InputDecoration(
                          labelText: 'Referensi Tgl OFF (Opsional)',
                          hintText: 'Contoh: Ganti tgl 12',
                          border: OutlineInputBorder(),
                          contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                        ),
                        onChanged: (val) {
                          data.referensiTglOff = val;
                          _autoSaveDayData(dateKey, data);
                        },
                      ),
                    ],

                    const SizedBox(height: 10),
                    // Jam Kerja (Masuk - Pulang) via Dial Clock
                    const Text('Jam Kerja (Absensi):', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.grey)),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.login, size: 16),
                            label: Text(data.jamMasuk.isNotEmpty ? data.jamMasuk : 'Jam Masuk'),
                            onPressed: () async {
                              final picked = await _pickTime(data.jamMasuk);
                              if (picked != null) {
                                if (data.jamPulang.isNotEmpty) {
                                  final inMin = _parseTimeToMinutes(picked);
                                  final outMin = _parseTimeToMinutes(data.jamPulang);
                                  if (inMin != null && outMin != null && inMin >= outMin) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('⚠️ Jam masuk (\$picked) tidak boleh lebih lambat atau sama dengan jam pulang (\${data.jamPulang})! Wajib jamMasuk < jamPulang.'),
                                        backgroundColor: Colors.red.shade700,
                                      ),
                                    );
                                    return;
                                  }
                                }
                                data.jamMasuk = picked;
                                _autoSaveDayData(dateKey, data);
                                setModalState(() {});
                                setState(() {});
                              }
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.logout, size: 16),
                            label: Text(data.jamPulang.isNotEmpty ? data.jamPulang : 'Jam Pulang'),
                            onPressed: () async {
                              final picked = await _pickTime(data.jamPulang);
                              if (picked != null) {
                                if (data.jamMasuk.isNotEmpty) {
                                  final inMin = _parseTimeToMinutes(data.jamMasuk);
                                  final outMin = _parseTimeToMinutes(picked);
                                  if (inMin != null && outMin != null && outMin <= inMin) {
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('⚠️ Jam pulang (\$picked) tidak boleh lebih awal atau sama dengan jam masuk (\${data.jamMasuk})! Wajib jamMasuk < jamPulang.'),
                                        backgroundColor: Colors.red.shade700,
                                      ),
                                    );
                                    return;
                                  }
                                }
                                data.jamPulang = picked;
                                _autoSaveDayData(dateKey, data);
                                setModalState(() {});
                                setState(() {});
                              }
                            },
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 8),
                    // Absen CEISA via Dial Clock
                    OutlinedButton.icon(
                      style: OutlinedButton.styleFrom(foregroundColor: Colors.blue.shade900),
                      icon: const Icon(Icons.badge, size: 16),
                      label: Text(data.absenCeisa.isNotEmpty ? 'Absen CEISA: \${data.absenCeisa}' : 'Set Absen CEISA'),
                      onPressed: () async {
                        final picked = await _pickTime(data.absenCeisa);
                        if (picked != null) {
                          data.absenCeisa = picked;
                          _autoSaveDayData(dateKey, data);
                          setModalState(() {});
                          setState(() {});
                        }
                      },
                    ),

                    const Divider(height: 16),
                    // Switch Hold Dokumen & Switch ST
                    SwitchListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Hold Dokumen', style: TextStyle(fontSize: 12)),
                      value: data.isHoldDokumen,
                      onChanged: (val) {
                        data.isHoldDokumen = val;
                        _autoSaveDayData(dateKey, data);
                        setModalState(() {});
                        setState(() {});
                      },
                    ),

                    SwitchListTile(
                      dense: true,
                      contentPadding: EdgeInsets.zero,
                      title: const Text('Surat Tugas / Cuti Pengganti (ST)', style: TextStyle(fontSize: 12)),
                      value: data.isSuratTugasTambahan,
                      onChanged: (val) {
                        data.isSuratTugasTambahan = val;
                        _autoSaveDayData(dateKey, data);
                        setModalState(() {});
                        setState(() {});
                      },
                    ),

                    const SizedBox(height: 6),
                    // TextField Catatan / Keterangan
                    TextField(
                      controller: noteController,
                      decoration: const InputDecoration(
                        labelText: 'Catatan / Keterangan',
                        border: OutlineInputBorder(),
                        contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      ),
                      onChanged: (val) {
                        data.note = val;
                        _autoSaveDayData(dateKey, data);
                      },
                    ),
                  ],
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () {
                  _autoSaveDayData(dateKey, data);
                  setState(() {});
                  Navigator.pop(ctx);
                },
                child: const Text('Selesai'),
              ),
            ],
          );
        },
      ),
    );
  }

  void _prevMonth() {
    setState(() {
      if (selectedMonth == 1) {
        if (selectedYear > years.first) {
          selectedMonth = 12;
          selectedYear--;
        }
      } else {
        selectedMonth--;
      }
    });
  }

  void _nextMonth() {
    setState(() {
      if (selectedMonth == 12) {
        if (selectedYear < years.last) {
          selectedMonth = 1;
          selectedYear++;
        }
      } else {
        selectedMonth++;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    final bool isMobile = MediaQuery.of(context).size.width < 600;
    final bool isDesktop = !isMobile;
    String screenTitle = 'Kalender';
    if (_currentNavIndex == 1) screenTitle = 'Rekapitulasi';
    if (_currentNavIndex == 2) screenTitle = 'Perform CEISA';
    if (_currentNavIndex == 3) screenTitle = 'Petunjuk';

    return Scaffold(
      // JIKA isMobile true: hilangkan header sepenuhnya (appBar: null) agar ruang kalender maksimal luas & bersih
      // JIKA isMobile false (Desktop/PC): gunakan AppBar minimalis & elegan dengan tombol navigasi bersih
      appBar: isMobile
          ? null
          : AppBar(
              elevation: 0.5,
              backgroundColor: Colors.indigo.shade800,
              foregroundColor: Colors.white,
              title: Row(
                children: [
                  const Icon(Icons.calendar_month, size: 22),
                  const SizedBox(width: 8),
                  const Text(
                    'Jadwal Shift & Lembur',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(width: 24),
                  // MENU NAVIGASI MINIMALIS DESKTOP (TAHAP 13)
                  Container(
                    padding: const EdgeInsets.all(3),
                    decoration: BoxDecoration(
                      color: Colors.indigo.shade950.withOpacity(0.4),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildDesktopNavButton(0, 'Kalender', Icons.calendar_month),
                        _buildDesktopNavButton(1, 'Rekapitulasi', Icons.table_chart),
                        _buildDesktopNavButton(2, 'Perform CEISA', Icons.military_tech),
                        _buildDesktopNavButton(3, 'Petunjuk', Icons.menu_book),
                      ],
                    ),
                  ),
                ],
              ),
              actions: [
                // Tombol Pengaturan Server / Database
                IconButton(
                  tooltip: 'Pengaturan Server & Database',
                  iconSize: 20,
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  icon: const Icon(Icons.storage_outlined),
                  onPressed: _showServerConfigDialog,
                ),
                // Tombol Kelola Libur Nasional
                IconButton(
                  tooltip: 'Kelola Libur Nasional',
                  iconSize: 20,
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  icon: const Icon(Icons.flag_outlined),
                  onPressed: _showHolidayDialog,
                ),
                // Tombol Ekspor Data
                IconButton(
                  tooltip: 'Ekspor Data (Excel, PDF, PNG, SQL, JSON)',
                  iconSize: 20,
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  icon: const Icon(Icons.file_download_outlined),
                  onPressed: _showExportDialog,
                ),
                // Tombol Sinkronisasi Cloud
                IconButton(
                  tooltip: 'Sinkronisasi Cloud',
                  iconSize: 20,
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  icon: _isSyncing
                      ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : const Icon(Icons.cloud_sync),
                  onPressed: () => _syncWithCloud(isManualClick: true),
                ),
                const SizedBox(width: 8),
              ],
            ),
      // Tombol Melayang (Floating Action Button): HANYA MUNCUL jika isMobile == true
      floatingActionButton: isMobile
          ? FloatingActionButton(
              onPressed: () => _showMobileNavigationMenu(context),
              backgroundColor: Colors.indigo,
              foregroundColor: Colors.white,
              tooltip: 'Menu Navigasi & Opsi',
              child: const Icon(Icons.menu),
            )
          : null,
      body: _buildCurrentNavBody(context),
    );
  }

  // Helper Tombol Navigasi Desktop Minimalis
  Widget _buildDesktopNavButton(int index, String label, IconData icon) {
    final bool isSelected = _currentNavIndex == index;
    return InkWell(
      borderRadius: BorderRadius.circular(8),
      onTap: () => setState(() => _currentNavIndex = index),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? Colors.white : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 15,
              color: isSelected ? Colors.indigo.shade900 : Colors.indigo.shade200,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? Colors.indigo.shade900 : Colors.indigo.shade100,
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Router Tampilan Utama Sesuai Tab Terpilih
  Widget _buildCurrentNavBody(BuildContext context) {
    switch (_currentNavIndex) {
      case 1:
        return _buildRecapTableView(context);
      case 2:
        return _buildCeisaPerformanceView(context);
      case 3:
        return _buildGuideView(context);
      case 0:
      default:
        return _buildCalendarView(context);
    }
  }

  // =========================================================
  // VIEW 1: HALAMAN KALENDER (RESPONSIF MOBILE VS PC)
  // =========================================================
  Widget _buildCalendarView(BuildContext context) {
    final isDesktop = MediaQuery.of(context).size.width >= 600;
    final daysInMonth = DateTime(selectedYear, selectedMonth + 1, 0).day;
    final firstDayOffset = DateTime(selectedYear, selectedMonth, 1).weekday - 1;

    // Rekapitulasi Bulan
    double totalJamLembur = 0.0;
    int totalHariLembur = 0;
    int totalPiket = 0;
    int totalDapatGeserOff = 0;
    int totalOffDiambil = 0;
    int totalCutiPengganti = 0;

    for (int day = 1; day <= daysInMonth; day++) {
      final date = DateTime(selectedYear, selectedMonth, day);
      final data = _getDayData(selectedYear, selectedMonth, day);
      final res = _calculateDayResult(data, date);

      if (res.isLembur) {
        totalHariLembur++;
        totalJamLembur += res.jamLembur;
      }
      if (res.isPiket) totalPiket++;
      if (res.isDapatGeserOff) totalDapatGeserOff++;
      if (res.isOffDiambil) totalOffDiambil++;
      if (res.isCutiPengganti) totalCutiPengganti++;
    }

    return RepaintBoundary(
      key: _calendarBoundaryKey,
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header Navigasi Bulan + Action Buttons (Paste Excel & Kunci Data)
            Card(
              elevation: 0,
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(color: Colors.grey.shade300),
              ),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        IconButton(
                          iconSize: isDesktop ? 22 : 18,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          icon: const Icon(Icons.chevron_left),
                          onPressed: _prevMonth,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '\${monthNames[selectedMonth - 1]} \$selectedYear',
                          style: TextStyle(
                            fontSize: isDesktop ? 16 : 13,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(width: 4),
                        IconButton(
                          iconSize: isDesktop ? 22 : 18,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                          icon: const Icon(Icons.chevron_right),
                          onPressed: _nextMonth,
                        ),
                      ],
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Tombol Paste Excel (Icon on mobile, Full on desktop)
                        if (isDesktop)
                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.teal.shade50,
                              foregroundColor: Colors.teal.shade900,
                              elevation: 0,
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            ),
                            icon: const Icon(Icons.content_paste_go, size: 16),
                            label: const Text('Paste Excel', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            onPressed: _pasteScheduleFromClipboard,
                          )
                        else
                          IconButton(
                            tooltip: 'Paste Excel',
                            icon: const Icon(Icons.content_paste_go, color: Colors.teal),
                            onPressed: _pasteScheduleFromClipboard,
                          ),
                        const SizedBox(width: 6),
                        // Tombol Kunci Data (Icon on mobile, Full on desktop)
                        if (isDesktop)
                          OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            ),
                            icon: const Icon(Icons.lock_outline, size: 16),
                            label: const Text('Kunci Data', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                            onPressed: () {
                              for (int d = 1; d <= daysInMonth; d++) {
                                final data = _getDayData(selectedYear, selectedMonth, d);
                                data.isLocked = !data.isLocked;
                                final dateKey = '\$selectedYear-\$selectedMonth-\$d';
                                _autoSaveDayData(dateKey, data);
                              }
                              setState(() {});
                            },
                          )
                        else
                          IconButton(
                            tooltip: 'Kunci Data',
                            icon: const Icon(Icons.lock_outline, color: Colors.blueGrey),
                            onPressed: () {
                              for (int d = 1; d <= daysInMonth; d++) {
                                final data = _getDayData(selectedYear, selectedMonth, d);
                                data.isLocked = !data.isLocked;
                                final dateKey = '\$selectedYear-\$selectedMonth-\$d';
                                _autoSaveDayData(dateKey, data);
                              }
                              setState(() {});
                            },
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),

            // Baris Header Hari (Sen - Min)
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 7,
                crossAxisSpacing: 4,
                mainAxisSpacing: 4,
                childAspectRatio: 2.2,
              ),
              itemCount: 7,
              itemBuilder: (context, i) {
                final isWk = i == 5 || i == 6;
                return Container(
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    dayHeaders[i],
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isWk ? Colors.red.shade700 : Colors.black87,
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 4),

            // Grid Sel Kalender dengan LayoutBuilder untuk penskalaan dinamis di mobile
            LayoutBuilder(
              builder: (context, gridConstraints) {
                final double cellWidth = (gridConstraints.maxWidth - (6 * 4)) / 7;
                final double cellRatio = isDesktop ? 0.72 : (cellWidth < 46 ? 0.80 : 0.85);

                return GridView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 7,
                    crossAxisSpacing: 4,
                    mainAxisSpacing: 4,
                    childAspectRatio: cellRatio,
                  ),
                  itemCount: firstDayOffset + daysInMonth,
                  itemBuilder: (context, index) {
                    if (index < firstDayOffset) {
                      return Container(
                        decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(8)),
                      );
                    }
                    final day = index - firstDayOffset + 1;
                    final date = DateTime(selectedYear, selectedMonth, day);
                    final isWeekend = date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;
                    final data = _getDayData(selectedYear, selectedMonth, day);
                    final isTanggalMerah = isWeekend || data.isManualHoliday;
                    final calc = _calculateDayResult(data, date);
                    final dateKey = '\$selectedYear-\$selectedMonth-\$day';

                    // ==========================================================
                    // JIKA LAYAR KECIL (MOBILE < 600px):
                    // Sel ringkas + LayoutBuilder Dinamis + Pop-Out Modal Form
                    // (Bukan lipat di dalam sel agar rapi dan tidak tumpang tindih)
                    // ==========================================================
                    if (!isDesktop) {
                      return LayoutBuilder(
                        builder: (context, constraints) {
                          final double w = constraints.maxWidth;
                          final double dateFontSize = (w * 0.28).clamp(10.0, 15.0);
                          final double shiftFontSize = (w * 0.22).clamp(8.5, 12.0);
                          final double textFontSize = (w * 0.17).clamp(7.0, 10.0);
                          final double cellPadding = (w * 0.06).clamp(2.0, 5.0);

                          return InkWell(
                            borderRadius: BorderRadius.circular(8),
                            onTap: () => _showDayDetailDialog(day, date, data),
                            child: Container(
                              decoration: BoxDecoration(
                                color: isTanggalMerah ? Colors.rose.shade50.withOpacity(0.5) : Colors.white,
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: calc.isLembur
                                      ? Colors.green.shade600
                                      : calc.isPiket
                                          ? Colors.blue.shade600
                                          : (isTanggalMerah ? Colors.red.shade300 : Colors.grey.shade300),
                                  width: (calc.isLembur || calc.isPiket) ? 1.5 : (isTanggalMerah ? 1.2 : 1),
                                ),
                              ),
                              padding: EdgeInsets.all(cellPadding),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  // Baris Tanggal & Badge Libur/ST/Lembur
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        '\$day',
                                        style: TextStyle(
                                          fontSize: dateFontSize,
                                          fontWeight: FontWeight.w900,
                                          color: isTanggalMerah ? Colors.red.shade700 : Colors.black87,
                                        ),
                                      ),
                                      if (calc.isLembur)
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 2),
                                          decoration: BoxDecoration(color: Colors.green.shade600, borderRadius: BorderRadius.circular(2)),
                                          child: Text('LMBR', style: TextStyle(fontSize: textFontSize * 0.9, fontWeight: FontWeight.bold, color: Colors.white)),
                                        )
                                      else if (calc.isPiket)
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 2),
                                          decoration: BoxDecoration(color: Colors.blue.shade600, borderRadius: BorderRadius.circular(2)),
                                          child: Text('PKT', style: TextStyle(fontSize: textFontSize * 0.9, fontWeight: FontWeight.bold, color: Colors.white)),
                                        )
                                      else if (data.isSuratTugasTambahan)
                                        Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 2),
                                          decoration: BoxDecoration(color: Colors.purple.shade100, borderRadius: BorderRadius.circular(2)),
                                          child: Text('ST', style: TextStyle(fontSize: textFontSize * 0.9, fontWeight: FontWeight.bold, color: Colors.purple.shade800)),
                                        ),
                                    ],
                                  ),
                                  // Badge Shift Dinamis
                                  Container(
                                    padding: EdgeInsets.symmetric(vertical: (w * 0.03).clamp(1.0, 3.0)),
                                    decoration: BoxDecoration(
                                      color: _getShiftBgColor(data.shift),
                                      borderRadius: BorderRadius.circular(4),
                                    ),
                                    child: Text(
                                      data.shift,
                                      textAlign: TextAlign.center,
                                      style: TextStyle(
                                        fontSize: shiftFontSize,
                                        fontWeight: FontWeight.w900,
                                        color: _getShiftTextColor(data.shift),
                                      ),
                                    ),
                                  ),
                                  // Info Jam atau Status Singkat
                                  if (data.jamMasuk.isNotEmpty || data.jamPulang.isNotEmpty)
                                    Text(
                                      '\${data.jamMasuk.isNotEmpty ? data.jamMasuk : "--"}-\${data.jamPulang.isNotEmpty ? data.jamPulang : "--"}',
                                      maxLines: 1,
                                      textAlign: TextAlign.center,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(fontSize: textFontSize, fontFamily: 'monospace', fontWeight: FontWeight.bold),
                                    )
                                  else if (calc.keteranganStatus.isNotEmpty)
                                    Text(
                                      calc.keteranganStatus,
                                      maxLines: 1,
                                      textAlign: TextAlign.center,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(fontSize: textFontSize, color: Colors.indigo.shade900, fontWeight: FontWeight.bold),
                                    )
                                  else
                                    Text(
                                      data.isMasuk ? 'Masuk' : 'Off',
                                      maxLines: 1,
                                      textAlign: TextAlign.center,
                                      style: TextStyle(fontSize: textFontSize * 0.9, color: Colors.grey.shade500),
                                    ),
                                ],
                              ),
                            ),
                          );
                        },
                      );
                    }

                // ==========================================
                // JIKA LAYAR BESAR (PC / DESKTOP >= 600px):
                // Form input langsung di dalam sel kalender
                // ==========================================
                final isExpanded = _cellExpanded[dateKey] ?? false;

                return Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: isTanggalMerah ? Colors.red.shade300 : Colors.grey.shade300),
                  ),
                  padding: const EdgeInsets.all(4),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Header Sel: Tanggal & Toggle Fold/Expand
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '\$day',
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              color: isTanggalMerah ? Colors.red.shade700 : Colors.black87,
                            ),
                          ),
                          InkWell(
                            onTap: () {
                              setState(() {
                                _cellExpanded[dateKey] = !isExpanded;
                              });
                            },
                            child: Icon(
                              isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                              size: 16,
                              color: Colors.grey.shade600,
                            ),
                          ),
                        ],
                      ),
                      // Dropdown Shift Langsung
                      Container(
                        margin: const EdgeInsets.symmetric(vertical: 2),
                        padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                        decoration: BoxDecoration(
                          color: _getShiftBgColor(data.shift),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: DropdownButton<String>(
                          value: data.shift,
                          isDense: true,
                          isExpanded: true,
                          underline: const SizedBox(),
                          icon: Icon(Icons.arrow_drop_down, color: _getShiftTextColor(data.shift), size: 16),
                          style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _getShiftTextColor(data.shift)),
                          items: shiftOptions.map((s) {
                            return DropdownMenuItem(value: s, child: Text(s, style: const TextStyle(color: Colors.black87)));
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) {
                              data.shift = val;
                              _autoSaveDayData(dateKey, data);
                              setState(() {});
                            }
                          },
                        ),
                      ),
                      // Konten Form Inline (Jika di-expand pada PC)
                      if (isExpanded) ...[
                        Row(
                          children: [
                            const Text('Masuk:', style: TextStyle(fontSize: 9)),
                            Checkbox(
                              value: data.isMasuk,
                              materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              onChanged: (val) {
                                data.isMasuk = val ?? false;
                                _autoSaveDayData(dateKey, data);
                                setState(() {});
                              },
                            ),
                          ],
                        ),
                        InkWell(
                          onTap: () async {
                            final picked = await _pickTime(data.jamMasuk);
                            if (picked != null) {
                              if (data.jamPulang.isNotEmpty) {
                                final inMin = _parseTimeToMinutes(picked);
                                final outMin = _parseTimeToMinutes(data.jamPulang);
                                if (inMin != null && outMin != null && inMin >= outMin) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('⚠️ Jam masuk (\$picked) tidak boleh >= jam pulang (\${data.jamPulang})!'),
                                      backgroundColor: Colors.red.shade700,
                                    ),
                                  );
                                  return;
                                }
                              }
                              data.jamMasuk = picked;
                              _autoSaveDayData(dateKey, data);
                              setState(() {});
                            }
                          },
                          child: Text('In: \${data.jamMasuk.isNotEmpty ? data.jamMasuk : "--:--"}', style: const TextStyle(fontSize: 9, fontFamily: 'monospace')),
                        ),
                        InkWell(
                          onTap: () async {
                            final picked = await _pickTime(data.jamPulang);
                            if (picked != null) {
                              if (data.jamMasuk.isNotEmpty) {
                                final inMin = _parseTimeToMinutes(data.jamMasuk);
                                final outMin = _parseTimeToMinutes(picked);
                                if (inMin != null && outMin != null && outMin <= inMin) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text('⚠️ Jam pulang (\$picked) tidak boleh <= jam masuk (\${data.jamMasuk})!'),
                                      backgroundColor: Colors.red.shade700,
                                    ),
                                  );
                                  return;
                                }
                              }
                              data.jamPulang = picked;
                              _autoSaveDayData(dateKey, data);
                              setState(() {});
                            }
                          },
                          child: Text('Out: \${data.jamPulang.isNotEmpty ? data.jamPulang : "--:--"}', style: const TextStyle(fontSize: 9, fontFamily: 'monospace')),
                        ),
                      ] else ...[
                        if (calc.keteranganStatus.isNotEmpty)
                          Text(
                            calc.keteranganStatus,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(fontSize: 8, color: Colors.indigo.shade800, fontWeight: FontWeight.bold),
                          ),
                      ],
                    ],
                  ),
                );
              },
            );
          },
        ),
        const SizedBox(height: 12),

            // Rekapitulasi Summary Cards
            Card(
              elevation: 0,
              color: Colors.white,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
                side: BorderSide(color: Colors.grey.shade300),
              ),
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Rekapitulasi Bulan \${monthNames[selectedMonth - 1]} \$selectedYear',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                    ),
                    const SizedBox(height: 4),
                    const Text('Keterangan: lembur ≤ 1 jam tidak masuk rekapitulasi', style: TextStyle(fontSize: 10, color: Colors.grey)),
                    const Divider(height: 16),
                    Row(
                      children: [
                        Expanded(child: _buildSummaryItem('Lembur (Jam)', '\${totalJamLembur.toStringAsFixed(1)} h', Colors.indigo)),
                        Expanded(child: _buildSummaryItem('Lembur (Hari)', '\$totalHariLembur Hari', Colors.blue)),
                        Expanded(child: _buildSummaryItem('Piket', '\$totalPiket Hari', Colors.teal)),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: _buildSummaryItem(
                            'Kuota OFF Geser',
                            '\${(totalDapatGeserOff - totalOffDiambil) >= 0 ? "+" : ""}\${totalDapatGeserOff - totalOffDiambil} Hari',
                            Colors.green,
                            subtitle: '+\$totalDapatGeserOff tabung | -\$totalOffDiambil ambil',
                          ),
                        ),
                        Expanded(
                          flex: 1,
                          child: _buildSummaryItem('ST (Cuti)', '+\$totalCutiPengganti', Colors.purple),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 60),
          ],
        ),
      ),
    );
  }

  // =========================================================
  // VIEW 2: HALAMAN TABEL REKAPITULASI (TABEL DATA TABLE LENGKAP)
  // =========================================================
  Widget _buildRecapTableView(BuildContext context) {
    final daysInMonth = DateTime(selectedYear, selectedMonth + 1, 0).day;
    final List<DataRow> tableRows = [];

    double sumLembur = 0.0;
    double sumBiasa = 0.0;
    int countPiket = 0;
    int countHariLembur = 0;

    for (int day = 1; day <= daysInMonth; day++) {
      final date = DateTime(selectedYear, selectedMonth, day);
      final isWeekend = date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;
      final data = _getDayData(selectedYear, selectedMonth, day);
      final isTanggalMerah = isWeekend || data.isManualHoliday;
      final calc = _calculateDayResult(data, date);

      if (calc.isLembur) {
        sumLembur += calc.jamLembur;
        countHariLembur++;
      }
      sumBiasa += calc.jamBiasa;
      if (calc.isPiket) countPiket++;

      final dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
      final dayStr = '\${day.toString().padLeft(2, "0")} (\${dayNames[date.weekday - 1]})';

      tableRows.add(
        DataRow(
          color: MaterialStateProperty.resolveWith<Color?>((states) {
            if (isTanggalMerah) return Colors.rose.shade50.withOpacity(0.5);
            return null;
          }),
          cells: [
            // 1. Tanggal
            DataCell(
              Text(
                dayStr,
                style: TextStyle(
                  fontWeight: FontWeight.bold,
                  color: isTanggalMerah ? Colors.red.shade800 : Colors.black87,
                ),
              ),
            ),
            // 2. Jadwal (Shift)
            DataCell(
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: _getShiftBgColor(data.shift),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  data.shift,
                  style: TextStyle(fontWeight: FontWeight.bold, color: _getShiftTextColor(data.shift), fontSize: 11),
                ),
              ),
            ),
            // 3. Jam Absen Masuk-Pulang
            DataCell(
              Text(
                (data.jamMasuk.isNotEmpty || data.jamPulang.isNotEmpty)
                    ? '\${data.jamMasuk.isNotEmpty ? data.jamMasuk : "--"} - \${data.jamPulang.isNotEmpty ? data.jamPulang : "--"}'
                    : '-',
                style: const TextStyle(fontFamily: 'monospace', fontSize: 11),
              ),
            ),
            // 4. Absen CEISA
            DataCell(
              Text(
                data.absenCeisa.isNotEmpty ? data.absenCeisa : '-',
                style: const TextStyle(fontFamily: 'monospace', fontSize: 11),
              ),
            ),
            // 5. Status Piket
            DataCell(
              calc.isPiket
                  ? Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: Colors.teal.shade100, borderRadius: BorderRadius.circular(4)),
                      child: Text('Piket Libur', style: TextStyle(color: Colors.teal.shade900, fontWeight: FontWeight.bold, fontSize: 10)),
                    )
                  : const Text('-'),
            ),
            // 6. Lembur (Hitungan Jam)
            DataCell(
              calc.isLembur && calc.jamLembur > 0
                  ? Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(color: Colors.green.shade100, borderRadius: BorderRadius.circular(4)),
                      child: Text('\${calc.jamLembur.toStringAsFixed(1)} Jam', style: TextStyle(color: Colors.green.shade900, fontWeight: FontWeight.bold, fontSize: 11)),
                    )
                  : const Text('-'),
            ),
            // 7. Biasa (Jam Kerja Normal)
            DataCell(
              calc.jamBiasa > 0
                  ? Text('\${calc.jamBiasa.toStringAsFixed(1)} Jam', style: const TextStyle(fontFamily: 'monospace', fontSize: 11, fontWeight: FontWeight.bold))
                  : const Text('-'),
            ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header Navigasi Periode Bulan
          Card(
            elevation: 0,
            color: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: Colors.grey.shade300),
            ),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(icon: const Icon(Icons.chevron_left), onPressed: _prevMonth),
                  Column(
                    children: [
                      Text(
                        'Rekapitulasi: \${monthNames[selectedMonth - 1]} \$selectedYear',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      const Text('(Lembur ≤ 1 jam tidak masuk rekapitulasi)', style: TextStyle(fontSize: 10, color: Colors.grey)),
                    ],
                  ),
                  IconButton(icon: const Icon(Icons.chevron_right), onPressed: _nextMonth),
                ],
              ),
            ),
          ),
          const SizedBox(height: 8),

          // Ringkasan Kartu Atas
          Row(
            children: [
              Expanded(child: _buildSummaryItem('Total Lembur', '\${sumLembur.toStringAsFixed(1)} Jam', Colors.indigo)),
              Expanded(child: _buildSummaryItem('Jam Biasa', '\${sumBiasa.toStringAsFixed(1)} Jam', Colors.blue)),
              Expanded(child: _buildSummaryItem('Total Piket', '\$countPiket Hari', Colors.teal)),
            ],
          ),
          const SizedBox(height: 12),

          // TABEL DATA TABLE ANTI-OVERFLOW (WRAP VERTICAL & HORIZONTAL SCROLL)
          Card(
            elevation: 0,
            color: Colors.white,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: Colors.grey.shade300),
            ),
            clipBehavior: Clip.antiAlias,
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                headingRowColor: MaterialStateProperty.all(Colors.indigo.shade50),
                headingTextStyle: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo),
                columns: const [
                  DataColumn(label: Text('Tanggal')),
                  DataColumn(label: Text('Jadwal (Shift)')),
                  DataColumn(label: Text('Jam Absen Masuk-Pulang')),
                  DataColumn(label: Text('Absen CEISA')),
                  DataColumn(label: Text('Status Piket')),
                  DataColumn(label: Text('Lembur (Jam)')),
                  DataColumn(label: Text('Biasa (Normal)')),
                ],
                rows: tableRows,
              ),
            ),
          ),
          const SizedBox(height: 60),
        ],
      ),
    );
  }

  Widget _buildSummaryItem(String label, String value, MaterialColor color, {String? subtitle}) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 2),
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(color: color.shade50, borderRadius: BorderRadius.circular(8)),
      child: Column(
        children: [
          Text(label, style: TextStyle(fontSize: 10, color: color.shade900)),
          const SizedBox(height: 2),
          Text(value, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: color.shade800)),
          if (subtitle != null && subtitle.isNotEmpty) ...[
            const SizedBox(height: 2),
            Text(subtitle, style: TextStyle(fontSize: 9, color: color.shade700)),
          ],
        ],
      ),
    );
  }

  // =========================================================
  // VIEW 3: HALAMAN PERHITUNGAN PERFORMANCE CEISA (TAHAP 8)
  // =========================================================
  Widget _buildPerformanceView(BuildContext context) {
    List<int> activeMonths = [];
    String periodTitle = '';

    if (_performancePeriodType == 'month') {
      activeMonths = [selectedMonth];
      periodTitle = 'Bulan \${monthNames[selectedMonth - 1]} \$selectedYear';
    } else if (_performancePeriodType == 'quarter') {
      activeMonths = [(_selectedQuarter - 1) * 3 + 1, (_selectedQuarter - 1) * 3 + 2, (_selectedQuarter - 1) * 3 + 3];
      periodTitle = 'Kuartal \$_selectedQuarter (Q\$_selectedQuarter) \$selectedYear';
    } else if (_performancePeriodType == 'semester') {
      activeMonths = _selectedSemester == 1 ? [1, 2, 3, 4, 5, 6] : [7, 8, 9, 10, 11, 12];
      periodTitle = 'Semester \$_selectedSemester (\${_selectedSemester == 1 ? "Jan-Jun" : "Jul-Des"}) \$selectedYear';
    } else {
      activeMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      periodTitle = 'Tahun \$selectedYear Penuh';
    }

    int totalEvaluated = 0;
    int totalScore = 0;
    int score4Count = 0;
    int score3Count = 0;
    int score2Count = 0;
    int score1Count = 0;

    final List<DataRow> performanceRows = [];

    for (final m in activeMonths) {
      final daysInM = DateTime(selectedYear, m + 1, 0).day;
      for (int day = 1; day <= daysInM; day++) {
        final date = DateTime(selectedYear, m, day);
        final data = _getDayData(selectedYear, m, day);
        final scoreRes = _calculateCeisaScore(data.shift, data.absenCeisa, data.isMasuk, isHoldDokumen: data.isHoldDokumen);

        if (scoreRes.isEligible) {
          totalEvaluated++;
          totalScore += scoreRes.score;
          if (scoreRes.score == 4) score4Count++;
          if (scoreRes.score == 3) score3Count++;
          if (scoreRes.score == 2) score2Count++;
          if (scoreRes.score == 1) score1Count++;
        }

        final isWk = date.weekday == DateTime.saturday || date.weekday == DateTime.sunday;
        final isTanggalMerah = isWk || data.isManualHoliday;

        Color scoreColor = Colors.grey;
        if (scoreRes.score == 4) scoreColor = Colors.green.shade700;
        if (scoreRes.score == 3) scoreColor = Colors.blue.shade700;
        if (scoreRes.score == 2) scoreColor = Colors.amber.shade800;
        if (scoreRes.score == 1) scoreColor = Colors.red.shade700;

        performanceRows.add(
          DataRow(
            color: MaterialStateProperty.resolveWith<Color?>((states) {
              if (isTanggalMerah) return Colors.red.shade50.withOpacity(0.5);
              return null;
            }),
            cells: [
              DataCell(
                Text(
                  '\${day.toString().padLeft(2, "0")}/\${m.toString().padLeft(2, "0")}/\$selectedYear',
                  style: const TextStyle(fontFamily: 'monospace', fontWeight: FontWeight.bold, fontSize: 11),
                ),
              ),
              DataCell(
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: _getShiftBgColor(data.shift), borderRadius: BorderRadius.circular(6)),
                  child: Text(data.shift, style: TextStyle(fontWeight: FontWeight.bold, color: _getShiftTextColor(data.shift), fontSize: 11)),
                ),
              ),
              DataCell(
                Text(
                  data.absenCeisa.isNotEmpty ? data.absenCeisa : '--:--',
                  style: TextStyle(
                    fontFamily: 'monospace',
                    fontWeight: FontWeight.bold,
                    color: data.absenCeisa.isNotEmpty ? Colors.black87 : Colors.grey,
                    fontSize: 11,
                  ),
                ),
              ),
              DataCell(
                scoreRes.isEligible
                    ? Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(color: scoreColor.withOpacity(0.15), borderRadius: BorderRadius.circular(6), border: Border.all(color: scoreColor.withOpacity(0.4))),
                        child: Text(
                          '\${scoreRes.score}',
                          style: TextStyle(fontWeight: FontWeight.bold, color: scoreColor, fontSize: 12),
                        ),
                      )
                    : const Text('-', style: TextStyle(color: Colors.grey)),
              ),
              DataCell(
                Text(
                  scoreRes.grade,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: scoreColor,
                    fontSize: 11,
                  ),
                ),
              ),
              DataCell(
                Text(
                  scoreRes.ruleDescription,
                  style: const TextStyle(fontSize: 11, color: Colors.black87),
                ),
              ),
            ],
          ),
        );
      }
    }

    final double avgScore = totalEvaluated > 0 ? (totalScore / totalEvaluated) : 0.0;
    final String predikat = _getPredikatPerformance(avgScore);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // 1. Selector Periode (Bulan / Kuartal / Semester / Tahun)
          Card(
            elevation: 0,
            color: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: Colors.grey.shade300)),
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Row(
                        children: [
                          Icon(Icons.military_tech, color: Colors.amber, size: 24),
                          SizedBox(width: 8),
                          Text('Perhitungan Performance CEISA', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
                        ],
                      ),
                      // Dropdown Tahun
                      DropdownButton<int>(
                        value: selectedYear,
                        isDense: true,
                        underline: const SizedBox(),
                        items: years.map((y) => DropdownMenuItem(value: y, child: Text('Tahun \$y', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)))).toList(),
                        onChanged: (val) {
                          if (val != null) setState(() => selectedYear = val);
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Segmented Tabs Periode
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: [
                        ChoiceChip(
                          label: const Text('Per Bulan'),
                          selected: _performancePeriodType == 'month',
                          onSelected: (s) {
                            if (s) setState(() => _performancePeriodType = 'month');
                          },
                        ),
                        const SizedBox(width: 6),
                        ChoiceChip(
                          label: const Text('Per 3 Bulan (Kuartal)'),
                          selected: _performancePeriodType == 'quarter',
                          onSelected: (s) {
                            if (s) setState(() => _performancePeriodType = 'quarter');
                          },
                        ),
                        const SizedBox(width: 6),
                        ChoiceChip(
                          label: const Text('Per Semester'),
                          selected: _performancePeriodType == 'semester',
                          onSelected: (s) {
                            if (s) setState(() => _performancePeriodType = 'semester');
                          },
                        ),
                        const SizedBox(width: 6),
                        ChoiceChip(
                          label: const Text('Per Tahun'),
                          selected: _performancePeriodType == 'year',
                          onSelected: (s) {
                            if (s) setState(() => _performancePeriodType = 'year');
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 8),
                  // Sub-Selector Periode
                  if (_performancePeriodType == 'month')
                    Row(
                      children: [
                        const Text('Pilih Bulan:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        const SizedBox(width: 8),
                        DropdownButton<int>(
                          value: selectedMonth,
                          isDense: true,
                          underline: const SizedBox(),
                          items: List.generate(12, (i) => DropdownMenuItem(value: i + 1, child: Text(monthNames[i]))),
                          onChanged: (v) {
                            if (v != null) setState(() => selectedMonth = v);
                          },
                        ),
                      ],
                    ),
                  if (_performancePeriodType == 'quarter')
                    Row(
                      children: [
                        const Text('Pilih Kuartal:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        const SizedBox(width: 8),
                        Wrap(
                          spacing: 4,
                          children: [1, 2, 3, 4].map((q) {
                            return ChoiceChip(
                              label: Text('Q\$q'),
                              selected: _selectedQuarter == q,
                              onSelected: (s) {
                                if (s) setState(() => _selectedQuarter = q);
                              },
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  if (_performancePeriodType == 'semester')
                    Row(
                      children: [
                        const Text('Pilih Semester:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        const SizedBox(width: 8),
                        Wrap(
                          spacing: 4,
                          children: [
                            ChoiceChip(
                              label: const Text('Sem 1 (Jan-Jun)'),
                              selected: _selectedSemester == 1,
                              onSelected: (s) {
                                if (s) setState(() => _selectedSemester = 1);
                              },
                            ),
                            ChoiceChip(
                              label: const Text('Sem 2 (Jul-Des)'),
                              selected: _selectedSemester == 2,
                              onSelected: (s) {
                                if (s) setState(() => _selectedSemester = 2);
                              },
                            ),
                          ],
                        ),
                      ],
                    ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),

          // 2. Metric Score Cards
          Row(
            children: [
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.indigo.shade900,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Rata-rata Skor CEISA', style: TextStyle(color: Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.baseline,
                        textBaseline: TextBaseline.alphabetic,
                        children: [
                          Text(
                            avgScore > 0 ? avgScore.toStringAsFixed(2) : '0.00',
                            style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.bold, fontFamily: 'monospace'),
                          ),
                          const SizedBox(width: 4),
                          const Text('/ 4.00', style: TextStyle(color: Colors.white70, fontSize: 12)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: Colors.amber, borderRadius: BorderRadius.circular(6)),
                        child: Text(
                          predikat,
                          style: const TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.grey.shade300),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Distribusi Skor', style: TextStyle(color: Colors.grey, fontSize: 11, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text('Skor 4 : \$score4Count kali', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.green)),
                      Text('Skor 3 : \$score3Count kali', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.blue)),
                      Text('Skor 2 : \$score2Count kali', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.amber)),
                      Text('Skor 1 : \$score1Count kali', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.red)),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // 3. Info Banner Logika Penilaian
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: Colors.indigo.shade50, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.indigo.shade100)),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Aturan Logika Penilaian CEISA:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 11, color: Colors.indigo)),
                SizedBox(height: 4),
                Text('• Shift G, L, N, PM: <=07:30 (4), 07:31-08:00 (3), 08:01-08:45 (2), >08:45 (1)', style: TextStyle(fontSize: 10)),
                Text('• Shift SM: <=13:00 (4), 13:01-13:15 (3), 13:16-13:45 (2), >13:45 (1)', style: TextStyle(fontSize: 10)),
                Text('• Shift M: Otomatis mendapat Skor 4 (Bebas jam absen)', style: TextStyle(fontSize: 10)),
              ],
            ),
          ),
          const SizedBox(height: 12),

          // 4. Tabel Detail Nilai CEISA
          Card(
            elevation: 0,
            color: Colors.white,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: BorderSide(color: Colors.grey.shade300)),
            clipBehavior: Clip.antiAlias,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Log Harian CEISA - \$periodTitle', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      Text('\$totalEvaluated Hari Terhitung', style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: DataTable(
                    headingRowColor: MaterialStateProperty.all(Colors.indigo.shade50),
                    headingTextStyle: const TextStyle(fontWeight: FontWeight.bold, color: Colors.indigo, fontSize: 11),
                    columns: const [
                      DataColumn(label: Text('Tanggal')),
                      DataColumn(label: Text('Shift')),
                      DataColumn(label: Text('Absen CEISA')),
                      DataColumn(label: Text('Nilai Skor')),
                      DataColumn(label: Text('Grade')),
                      DataColumn(label: Text('Evaluasi')),
                    ],
                    rows: performanceRows,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 60),
        ],
      ),
    );
  }

  // =========================================================
  // VIEW 4: HALAMAN PETUNJUK & DOKUMENTASI LENGKAP (TAHAP 13)
  // =========================================================
  Widget _buildGuideView(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Banner Header Petunjuk
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.indigo.shade900, Colors.indigo.shade700],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.indigo.withOpacity(0.2),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: const Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: Colors.white24,
                  child: Icon(Icons.menu_book, color: Colors.white, size: 26),
                ),
                SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Petunjuk & Panduan Aplikasi',
                        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                      ),
                      SizedBox(height: 2),
                      Text(
                        'Panduan lengkap pengisian jadwal, lembur, performa CEISA, dan sistem database',
                        style: TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // 1. CARA MENGISI JADWAL
          _buildGuideExpansionTile(
            icon: Icons.calendar_today,
            iconColor: Colors.teal,
            title: '1. Cara Mengisi & Mengubah Jadwal',
            badgeText: 'Input Jadwal',
            badgeColor: Colors.teal,
            children: [
              const Text(
                'Anda dapat mengisi jadwal dengan dua metode:\n'
                '• Klik Cepat: Pilih shift langsung melalui menu dropdown pada kotak tanggal kalender.\n'
                '• Pop-up Detail: Klik tanggal atau tombol edit untuk mengatur Jam Masuk, Jam Pulang, Jam Absen CEISA, Kunci Tanggal, Hold Dokumen, dan Catatan.',
                style: TextStyle(fontSize: 12, height: 1.4, color: Colors.black87),
              ),
              const SizedBox(height: 10),
              const Text('Daftar Kode & Singkatan Shift:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              const SizedBox(height: 6),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: const [
                  Chip(label: Text('G : Graha (07:30 - 17:00)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                  Chip(label: Text('L : Loket / TPSL', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                  Chip(label: Text('N : NPCT / Non-CEISA', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                  Chip(label: Text('OFF : Libur Shift', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                  Chip(label: Text('SM : Siang - Malam (Mulai 13:00)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                  Chip(label: Text('PM : Pagi - Malam', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                  Chip(label: Text('M : Malam', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold))),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),

          // 2. FITUR PASTE EXCEL
          _buildGuideExpansionTile(
            icon: Icons.content_paste,
            iconColor: Colors.green,
            title: '2. Fitur Cepat: Paste Excel Satu Baris',
            badgeText: 'Impor Otomatis',
            badgeColor: Colors.green,
            children: [
              const Text(
                'Anda dapat menyalin jadwal 1 bulan langsung dari lembar Excel tanpa input satu per satu:\n'
                '1. Blok satu baris jadwal di Excel (misal kode: G  G  OFF  L  L  N  N  SM  M ...).\n'
                '2. Tekan Ctrl+C untuk menyalin.\n'
                '3. Buka aplikasi dan klik tombol "Paste Excel" (atau tekan Ctrl+V pada halaman Kalender).\n'
                '4. Aplikasi akan otomatis memetakan singkatan kode shift ke tanggal 1 hingga akhir bulan dengan jam standar yang rapi.',
                style: TextStyle(fontSize: 12, height: 1.4, color: Colors.black87),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // 3. LOGIKA LEMBUR
          _buildGuideExpansionTile(
            icon: Icons.access_time,
            iconColor: Colors.indigo,
            title: '3. Logika & Perhitungan Lembur',
            badgeText: 'Kalkulasi Lembur',
            badgeColor: Colors.indigo,
            children: [
              const Text(
                'Sistem mendeteksi dan menghitung lembur otomatis jika:\n'
                '• Selisih Jam Kerja >= 10.5 Jam: Selisih jam masuk dan pulang mencapai 10 jam 30 menit atau lebih (dikurangi jeda istirahat). Status otomatis menjadi Lembur (Indikator Hijau).\n'
                '• Masuk di Hari Libur / Tanggal Merah: Jika bertugas pada tanggal merah resmi dengan pilihan opsi Lembur atau Surat Tugas Tambahan, seluruh jam dinas dihitung sebagai lembur.',
                style: TextStyle(fontSize: 12, height: 1.4, color: Colors.black87),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // 4. SISTEM OFF GESER
          _buildGuideExpansionTile(
            icon: Icons.swap_horiz,
            iconColor: Colors.purple,
            title: '4. Sistem Tabungan & Tarik OFF Geser',
            badgeText: 'Mutasi OFF',
            badgeColor: Colors.purple,
            children: [
              const Text(
                'Mekanisme pencatatan kompensasi hari libur:\n'
                '• Menabung OFF (+1 Hari): Pada hari jadwal OFF normal, nyalakan saklar "Masuk". Status berubah menjadi "OFF Ditabung" dan menambah kuota saldo libur Anda.\n'
                '• Menarik / Mengambil OFF (-1 Hari): Pada hari kerja biasa, matikan saklar "Masuk" dan pilih "Ambil OFF Geser". Tuliskan tanggal tabungan yang digunakan (contoh: "Ganti tgl 12"). Kuota OFF berkurang 1.',
                style: TextStyle(fontSize: 12, height: 1.4, color: Colors.black87),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // 5. PERFORMA CEISA
          _buildGuideExpansionTile(
            icon: Icons.military_tech,
            iconColor: Colors.amber.shade800,
            title: '5. Evaluasi & Skor Performa CEISA',
            badgeText: 'Absen Masuk CEISA',
            badgeColor: Colors.amber.shade800,
            children: [
              const Text(
                'Kriteria penilaian skor (1 hingga 4) berdasarkan jam absen masuk CEISA:\n'
                'A. Shift Pagi / Normal (Graha, TPSL, NPCT):\n'
                '  • Absen <= 07:30 : Skor 4 (Sangat Baik)\n'
                '  • Absen 07:31 - 08:00 : Skor 3 (Tepat Waktu)\n'
                '  • Absen 08:01 - 08:45 : Skor 2 (Cukup)\n'
                '  • Absen > 08:45 : Skor 1 (Kurang)\n\n'
                'B. Shift Siang (SM):\n'
                '  • Absen <= 13:00 : Skor 4 (Sangat Baik)\n'
                '  • Absen 13:01 - 13:15 : Skor 3 (Tepat Waktu)\n'
                '  • Absen 13:16 - 13:30 : Skor 2 (Cukup)\n'
                '  • Absen > 13:30 : Skor 1 (Kurang)\n\n'
                'Pengecualian "Hold Dokumen": Jika saklar Hold Dokumen diaktifkan, hari tersebut diabaikan / dikecualikan dari akumulasi penilaian performa agar tidak menurunkan nilai rata-rata.',
                style: TextStyle(fontSize: 12, height: 1.4, color: Colors.black87),
              ),
            ],
          ),
          const SizedBox(height: 10),

          // 6. SINKRONISASI & DATABASE
          _buildGuideExpansionTile(
            icon: Icons.storage,
            iconColor: Colors.blue,
            title: '6. Sinkronisasi Cloud & Database',
            badgeText: 'Database & Sync',
            badgeColor: Colors.blue,
            children: [
              const Text(
                'Data jadwal Anda tersimpan secara otomatis dan aman:\n'
                '• Firebase Firestore: Tersinkronisasi otomatis secara realtime ke cloud setiap ada perubahan data.\n'
                '• Supabase / PostgreSQL: Buka menu Pengaturan Database untuk menghubungkan URL Project dan Anon Key Supabase Anda.\n'
                '• Tombol Sync Manual: Klik tombol "Sinkronisasi Cloud" kapan saja untuk memastikan data seluruh perangkat telah selaras.',
                style: TextStyle(fontSize: 12, height: 1.4, color: Colors.black87),
              ),
            ],
          ),
          const SizedBox(height: 60),
        ],
      ),
    );
  }

  // Widget Helper Card ExpansionTile untuk Petunjuk
  Widget _buildGuideExpansionTile({
    required IconData icon,
    required Color iconColor,
    required String title,
    required String badgeText,
    required Color badgeColor,
    required List<Widget> children,
  }) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.grey.shade300),
      ),
      clipBehavior: Clip.antiAlias,
      child: ExpansionTile(
        initiallyExpanded: true,
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: iconColor, size: 20),
        ),
        title: Text(
          title,
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
        ),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 4),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: badgeColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: badgeColor.withOpacity(0.3)),
                ),
                child: Text(
                  badgeText,
                  style: TextStyle(color: badgeColor, fontSize: 10, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        ),
        childrenPadding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        expandedCrossAxisAlignment: CrossAxisAlignment.start,
        children: children,
      ),
    );
  }
}
`;
