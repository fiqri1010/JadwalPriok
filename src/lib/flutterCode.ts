/**
 * Kode sumber Flutter / Dart untuk aplikasi mobile Kalender Shift Bea Cukai
 * Terhubung langsung ke Supabase PostgreSQL backend.
 */
export const FLUTTER_MAIN_DART_CODE = `import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';

// Ganti dengan konfigurasi Supabase proyek Anda
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
  );
  runApp(const KalenderShiftApp());
}

class KalenderShiftApp extends StatelessWidget {
  const KalenderShiftApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kalender Shift Bea Cukai',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF601700)),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({Key? key}) : super(key: key);

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  DateTime _currentMonth = DateTime.now();
  Map<String, dynamic> _shifts = {};
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _fetchShifts();
  }

  Future<void> _fetchShifts() async {
    setState(() => _isLoading = true);
    try {
      final supabase = Supabase.instance.client;
      final response = await supabase.from('shifts').select();
      final Map<String, dynamic> map = {};
      for (var item in response) {
        map[item['id']] = item;
      }
      setState(() {
        _shifts = map;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Gagal memuat data: \$e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFF601700),
        title: const Text('Kalender Shift Bea Cukai', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _fetchShifts,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.chevron_left),
                        onPressed: () => setState(() {
                          _currentMonth = DateTime(_currentMonth.year, _currentMonth.month - 1);
                        }),
                      ),
                      Text(
                        DateFormat('MMMM yyyy', 'id_ID').format(_currentMonth),
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      IconButton(
                        icon: const Icon(Icons.chevron_right),
                        onPressed: () => setState(() {
                          _currentMonth = DateTime(_currentMonth.year, _currentMonth.month + 1);
                        }),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Center(
                    child: Text('Total shift tercatat: \${_shifts.length} hari'),
                  ),
                ),
              ],
            ),
    );
  }
}
`;
