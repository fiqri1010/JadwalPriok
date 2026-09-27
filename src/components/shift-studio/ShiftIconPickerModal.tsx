import React, { useState } from 'react';
import {
    X,
    Search,
    Trash2,
    // --- 1. Santai, Istirahat, Kuliner, Hobi & Individu ---
    Coffee,
    CupSoda,
    Bed,
    BedDouble,
    Armchair,
    Sofa,
    Headphones,
    Music,
    Music2,
    Music3,
    Music4,
    Disc,
    Disc3,
    Mic,
    Mic2,
    Podcast,
    Radio as RadioIcon,
    Book,
    BookOpen,
    BookMarked,
    Library,
    Newspaper,
    Glasses,
    Eye,
    Gamepad2,
    Gamepad,
    Dices,
    Tv,
    Tv2,
    Film,
    Clapperboard,
    Theater,
    Camera,
    Utensils,
    UtensilsCrossed,
    Pizza,
    Sandwich,
    Cookie,
    Cake,
    Dessert,
    ChefHat,
    CookingPot,
    Soup,
    Salad,
    Apple,
    Banana,
    Citrus,
    Wine,
    Beer,
    GlassWater,
    Milk,
    Palmtree,
    Tent,
    Luggage,
    Ticket,
    Flower,
    Flower2,
    Sprout,
    Leaf,
    Trees,
    TreePine,
    Footprints,
    PawPrint,
    Bath,
    ShowerHead,
    Sparkle,
    Sparkles,
    SunDim,
    SunMedium,
    Fish,
    Cat,
    Dog,
    Bird,
    Rabbit,
    Shirt,
    Scissors,
    Palette,
    Brush,
    Paintbrush,
    PaintbrushVertical,
    ShoppingBag,
    ShoppingCart,
    Store,
    PersonStanding,
    UserRound,
    UserRoundCheck,
    UserRoundSearch,
    Sailboat,
    Map,
    MapPin,
    MapPinned,
    Compass,
    Signpost,
    Smile as SmileIcon,

    // --- 2. Olahraga, Kebugaran & Medis ---
    Dumbbell,
    Bike,
    Waves,
    Trophy,
    Medal,
    Target,
    Activity,
    Heart,
    HeartPulse,
    HeartHandshake,
    Brain,
    Stethoscope,
    Pill,
    Ambulance,
    Syringe,
    Cross,
    Thermometer,
    Bandage,

    // --- 3. Profesi, Kantor, IT & Keuangan ---
    Briefcase,
    BriefcaseBusiness,
    BriefcaseMedical,
    Laptop,
    Monitor,
    MonitorSmartphone,
    Smartphone,
    Tablet,
    Server,
    Database,
    HardDrive,
    Code,
    CodeXml,
    Terminal,
    Printer,
    Calculator,
    CreditCard,
    Coins,
    Banknote,
    Wallet,
    Stamp,
    PenTool,
    Pencil,
    FileText,
    FileCheck,
    FileSpreadsheet,
    FileCode,
    Clipboard,
    ClipboardCheck,
    ClipboardList,
    Users,
    User,
    UserCheck,
    UserCog,
    UserPlus,
    GraduationCap,
    School,
    Hospital,
    Building,
    Building2,
    Landmark,
    Hotel,
    Castle,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Key,
    Lock,
    Unlock,
    Fingerprint,
    Scan,
    ScanFace,
    QrCode,
    BarChart,
    BarChart2,
    BarChart3,
    PieChart,
    LineChart,
    TrendingUp,
    TrendingDown,

    // --- 4. Industri, Logistik, Pelabuhan & Lapangan ---
    Ship,
    Anchor,
    Truck,
    Warehouse,
    HardHat,
    Construction,
    Forklift,
    Container,
    Box,
    Package,
    Boxes,
    Wrench,
    Hammer,
    Drill,
    Axe,
    Nut,
    Factory,
    Cog,
    Sliders,
    Zap,
    ZapOff,
    Flame,
    Fuel,
    Cable,
    Magnet,
    Scale,
    Gauge,
    CircuitBoard,
    Cpu,
    BatteryCharging,
    Receipt,
    ReceiptText,

    // --- 5. Waktu, Cuaca, Kendaraan & Perjalanan ---
    Sun,
    Sunrise,
    Sunset,
    Moon,
    MoonStar,
    Clock,
    Watch,
    Hourglass,
    Timer,
    AlarmClock,
    Calendar,
    CalendarDays,
    CalendarCheck,
    History,
    CloudSun,
    CloudMoon,
    CloudRain,
    CloudSnow,
    CloudLightning,
    Cloud,
    Wind,
    Car,
    Plane,
    PlaneTakeoff,
    PlaneLanding,
    Train,
    TrainFront,
    Bus,
    Navigation,
    Navigation2,
    Locate,

    // --- 6. Status, Simbol & Komunikasi ---
    Check,
    CheckCircle2,
    Star,
    Flag,
    Award,
    BadgeCheck,
    AlertCircle,
    AlertTriangle,
    Bell,
    BellRing,
    Megaphone,
    Phone,
    PhoneCall,
    Send,
    MessageSquare,
    MessagesSquare,
    ThumbsUp,
    Gift,
    Tag,
    Undo2,
    Redo2,
    Save,
} from 'lucide-react';
import { ShiftVisualStyle, ShiftNamingConfig } from '../../types';
import { BADGE_PATTERNS, isCustomPatternImage, parseCssPatternToStyle } from './patterns';

interface ShiftIconPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    visual: ShiftVisualStyle;
    naming?: ShiftNamingConfig;
    onChange: (visual: ShiftVisualStyle) => void;
}

export interface CatalogIconItem {
    name: string;
    category: 'Individu & Santai' | 'Olahraga & Medis' | 'Profesi & Kantor' | 'Industri & Logistik' | 'Waktu & Cuaca' | 'Status & Simbol';
    keywords: string;
    component: React.FC<{ className?: string }>;
}

export const ICON_CATALOG: CatalogIconItem[] = [
    // =========================================================================
    // --- 1. Individu & Santai / Istirahat / Kuliner / Hobi / Liburan (85+ Ikon) ---
    // =========================================================================
    { name: 'Coffee', category: 'Individu & Santai', keywords: 'kopi tea cafe istirahat santai relax ngopi cafe break sarapan minuman hangat', component: Coffee },
    { name: 'CupSoda', category: 'Individu & Santai', keywords: 'minum soda es jus segar relax santai minuman dingin cafe boba', component: CupSoda },
    { name: 'GlassWater', category: 'Individu & Santai', keywords: 'air putih mineral minum gelas segar sehat hidrasi', component: GlassWater },
    { name: 'Milk', category: 'Individu & Santai', keywords: 'susu kotak minum sarapan sehat pagi', component: Milk },
    { name: 'Bed', category: 'Individu & Santai', keywords: 'tidur rebahan ranjang kamar sleep rest istirahat malam lelap bobo', component: Bed },
    { name: 'BedDouble', category: 'Individu & Santai', keywords: 'tidur ranjang hotel liburan kasur rest menginap kamar tidur', component: BedDouble },
    { name: 'Armchair', category: 'Individu & Santai', keywords: 'sofa kursi santai ruang tamu nonton duduk malas relax', component: Armchair },
    { name: 'Sofa', category: 'Individu & Santai', keywords: 'sofa ruang keluarga santai rebahan nonton tv santai malas', component: Sofa },
    { name: 'Headphones', category: 'Individu & Santai', keywords: 'musik lagu headphone earphone dengar lagu audio podcast relax', component: Headphones },
    { name: 'Music', category: 'Individu & Santai', keywords: 'musik lagu nada audio hiburan nada melody', component: Music },
    { name: 'Music2', category: 'Individu & Santai', keywords: 'lagu nada musik konser akustik', component: Music2 },
    { name: 'Music3', category: 'Individu & Santai', keywords: 'nada musik tangga nada balok melodi', component: Music3 },
    { name: 'Music4', category: 'Individu & Santai', keywords: 'partitur musik nada lagu irama', component: Music4 },
    { name: 'Disc', category: 'Individu & Santai', keywords: 'cd piringan hitam kaset album rekaman audio musik vinil dj', component: Disc },
    { name: 'Disc3', category: 'Individu & Santai', keywords: 'vinyl piringan audio lagu rekaman dj musik', component: Disc3 },
    { name: 'Radio', category: 'Individu & Santai', keywords: 'radio siaran musik berita santai gelombang fm', component: RadioIcon },
    { name: 'Podcast', category: 'Individu & Santai', keywords: 'podcast siaran obrolan audio rekaman diskusi santai', component: Podcast },
    { name: 'Mic', category: 'Individu & Santai', keywords: 'mikrofon nyanyi karaoke bernyanyi rekaman suara vokal', component: Mic },
    { name: 'Mic2', category: 'Individu & Santai', keywords: 'mic karaoke presenter mc nyanyi hiburan', component: Mic2 },
    { name: 'BookOpen', category: 'Individu & Santai', keywords: 'buku baca bacaan novel belajar santai ilmu perpustakaan', component: BookOpen },
    { name: 'Book', category: 'Individu & Santai', keywords: 'buku catatan baca ilmu novel', component: Book },
    { name: 'BookMarked', category: 'Individu & Santai', keywords: 'pembatas buku favorit bacaan novel simpan materi', component: BookMarked },
    { name: 'Library', category: 'Individu & Santai', keywords: 'perpustakaan rak buku belajar studi tenang literatur', component: Library },
    { name: 'Newspaper', category: 'Individu & Santai', keywords: 'koran berita bacaan pagi santai artikel warta koran pagi', component: Newspaper },
    { name: 'Glasses', category: 'Individu & Santai', keywords: 'kacamata baca santai gaya optik santai', component: Glasses },
    { name: 'Eye', category: 'Individu & Santai', keywords: 'mata lihat nonton pandangan visual awasi fokus', component: Eye },
    { name: 'Gamepad2', category: 'Individu & Santai', keywords: 'game main game joystick playstation hiburan gaming ps5 switch', component: Gamepad2 },
    { name: 'Gamepad', category: 'Individu & Santai', keywords: 'game mainan controller stik console video game', component: Gamepad },
    { name: 'Dices', category: 'Individu & Santai', keywords: 'dadu mainan game boardgame hiburan santai main bareng', component: Dices },
    { name: 'Tv', category: 'Individu & Santai', keywords: 'televisi tv nonton film siaran santai acara serial streaming', component: Tv },
    { name: 'Tv2', category: 'Individu & Santai', keywords: 'layar tv monitor smart tv film serial bioskop streaming', component: Tv2 },
    { name: 'Film', category: 'Individu & Santai', keywords: 'film bioskop movie cinema hiburan rol film layar tancap', component: Film },
    { name: 'Clapperboard', category: 'Individu & Santai', keywords: 'bioskop syuting film nonton produksi take rekaman', component: Clapperboard },
    { name: 'Theater', category: 'Individu & Santai', keywords: 'teater panggung seni pertunjukan drama sandiwara konser', component: Theater },
    { name: 'Camera', category: 'Individu & Santai', keywords: 'kamera foto fotografi foto liburan jepret potret selfie', component: Camera },
    { name: 'Utensils', category: 'Individu & Santai', keywords: 'makan sendok garpu restoran sarapan siang malam kuliner santap', component: Utensils },
    { name: 'UtensilsCrossed', category: 'Individu & Santai', keywords: 'makan malam restoran kuliner food santapan makan bersama', component: UtensilsCrossed },
    { name: 'ChefHat', category: 'Individu & Santai', keywords: 'koki masak topi chef dapur kuliner resep masak memasak', component: ChefHat },
    { name: 'CookingPot', category: 'Individu & Santai', keywords: 'panci masak dapur sup soto kuliner rebus memasak', component: CookingPot },
    { name: 'Soup', category: 'Individu & Santai', keywords: 'sup soto mangkok kuah hangat kuliner makanan lezat', component: Soup },
    { name: 'Salad', category: 'Individu & Santai', keywords: 'salad sayur mangkok vegan sehat diet makanan segar', component: Salad },
    { name: 'Pizza', category: 'Individu & Santai', keywords: 'pizza makanan kuliner jajan santai enak delivery pizza malam', component: Pizza },
    { name: 'Sandwich', category: 'Individu & Santai', keywords: 'roti sandwich sarapan bekal makan siang roti isi', component: Sandwich },
    { name: 'Cookie', category: 'Individu & Santai', keywords: 'kue biskuit cemilan camilan manis kukis renyah', component: Cookie },
    { name: 'Cake', category: 'Individu & Santai', keywords: 'kue tart ulang tahun perayaan manis kue bolu pesta', component: Cake },
    { name: 'Dessert', category: 'Individu & Santai', keywords: 'kue makanan penutup dessert es krim manis manis hidangan', component: Dessert },
    { name: 'Apple', category: 'Individu & Santai', keywords: 'apel buah segar sehat vitamin makanan diet', component: Apple },
    { name: 'Banana', category: 'Individu & Santai', keywords: 'pisang buah segar manis kuning makanan energi', component: Banana },
    { name: 'Citrus', category: 'Individu & Santai', keywords: 'jeruk lemon buah sitrun segar vitamin c asam manis', component: Citrus },
    { name: 'Wine', category: 'Individu & Santai', keywords: 'minum gelas perayaan santai malam anggur bersulang', component: Wine },
    { name: 'Beer', category: 'Individu & Santai', keywords: 'minuman gelas santai nongkrong bir kumpul santai', component: Beer },
    { name: 'Palmtree', category: 'Individu & Santai', keywords: 'pantai pohon kelapa liburan cuti santai piknik pulau tropis summer', component: Palmtree },
    { name: 'Tent', category: 'Individu & Santai', keywords: 'kemah tenda camping alam naik gunung liburan outdoor berkemah', component: Tent },
    { name: 'Luggage', category: 'Individu & Santai', keywords: 'koper tas liburan bepergian wisata cuti traveling jalan-jalan', component: Luggage },
    { name: 'Ticket', category: 'Individu & Santai', keywords: 'tiket konser liburan nonton wisata pass karcis voucher', component: Ticket },
    { name: 'Flower', category: 'Individu & Santai', keywords: 'bunga taman mekar asri hobi berkebun wangi flora', component: Flower },
    { name: 'Flower2', category: 'Individu & Santai', keywords: 'bunga kelopak mekar taman berkebun asri segar hobi', component: Flower2 },
    { name: 'Sprout', category: 'Individu & Santai', keywords: 'tanaman tunas tumbuh hijau berkebun benih bibit', component: Sprout },
    { name: 'Leaf', category: 'Individu & Santai', keywords: 'daun hijau alam asri segar organik herbal', component: Leaf },
    { name: 'Trees', category: 'Individu & Santai', keywords: 'pohon hutan alam sejuk hijau pepohonan rindang', component: Trees },
    { name: 'TreePine', category: 'Individu & Santai', keywords: 'pohon pinus cemara hutan gunung sejuk liburan', component: TreePine },
    { name: 'Footprints', category: 'Individu & Santai', keywords: 'jalan kaki jejak santai jalan sore pagi jogging jalan santai', component: Footprints },
    { name: 'PawPrint', category: 'Individu & Santai', keywords: 'jejak hewan peliharaan kucing anjing jalan bareng pet', component: PawPrint },
    { name: 'Bath', category: 'Individu & Santai', keywords: 'mandi bathtub relaksasi spa istirahat berendam air hangat busa', component: Bath },
    { name: 'ShowerHead', category: 'Individu & Santai', keywords: 'shower mandi air segar bersih-bersih relaksasi', component: ShowerHead },
    { name: 'Fish', category: 'Individu & Santai', keywords: 'ikan mancing hobi memancing laut air tawar akuarium fishing', component: Fish },
    { name: 'Cat', category: 'Individu & Santai', keywords: 'kucing hewan peliharaan menggemaskan santai meong pet', component: Cat },
    { name: 'Dog', category: 'Individu & Santai', keywords: 'anjing hewan peliharaan sahabat setia main santai guk', component: Dog },
    { name: 'Bird', category: 'Individu & Santai', keywords: 'burung kicau terbang alam bebas peliharaan sangkar', component: Bird },
    { name: 'Rabbit', category: 'Individu & Santai', keywords: 'kelinci hewan peliharaan lucu imut melompat santai', component: Rabbit },
    { name: 'Shirt', category: 'Individu & Santai', keywords: 'baju kemeja kaos busana pakaian santai formal cuci laundry', component: Shirt },
    { name: 'Scissors', category: 'Individu & Santai', keywords: 'gunting potong rambut barbershop kerajinan seni salon', component: Scissors },
    { name: 'Palette', category: 'Individu & Santai', keywords: 'palet cat lukis seni melukis warna kanvas hobi gambar', component: Palette },
    { name: 'Brush', category: 'Individu & Santai', keywords: 'kuas lukis sapu kuas gambar seni warna cat hobi', component: Brush },
    { name: 'Paintbrush', category: 'Individu & Santai', keywords: 'kuas cat lukisan melukis dinding seni karya kreatif', component: Paintbrush },
    { name: 'PaintbrushVertical', category: 'Individu & Santai', keywords: 'kuas gambar cat lukisan kaligrafi dekorasi seni', component: PaintbrushVertical },
    { name: 'ShoppingBag', category: 'Individu & Santai', keywords: 'belanja kantong belanja shopping mall hadiah beli', component: ShoppingBag },
    { name: 'ShoppingCart', category: 'Individu & Santai', keywords: 'keranjang belanja supermarket minimarket troli belanja', component: ShoppingCart },
    { name: 'PersonStanding', category: 'Individu & Santai', keywords: 'orang berdiri santai individu manusia figur postur', component: PersonStanding },
    { name: 'UserRound', category: 'Individu & Santai', keywords: 'individu orang sosok profil santai avatar personal', component: UserRound },
    { name: 'Sailboat', category: 'Individu & Santai', keywords: 'perahu layar berlayar laut danau liburan pantai santai', component: Sailboat },
    { name: 'Map', category: 'Individu & Santai', keywords: 'peta petualangan wisata rute perjalanan tur keliling', component: Map },
    { name: 'MapPinned', category: 'Individu & Santai', keywords: 'titik destinasi tujuan wisata lokasi liburan pin tempat', component: MapPinned },

    // =========================================================================
    // --- 2. Olahraga, Kebugaran & Medis / Kesehatan (30+ Ikon) ---
    // =========================================================================
    { name: 'Dumbbell', category: 'Olahraga & Medis', keywords: 'gym fitness angkat beban olahraga otot sehat fit binaraga', component: Dumbbell },
    { name: 'Bike', category: 'Olahraga & Medis', keywords: 'sepeda gowes olahraga cycling sehat roda dua jalan pagi', component: Bike },
    { name: 'Waves', category: 'Olahraga & Medis', keywords: 'renang berenang ombak air kolam renang pantai laut diving', component: Waves },
    { name: 'Trophy', category: 'Olahraga & Medis', keywords: 'trofi juara piala menang prestasi penghargaan kompetisi juara 1', component: Trophy },
    { name: 'Medal', category: 'Olahraga & Medis', keywords: 'medali juara ranking 1 prestasi kejuaraan atlet emas perak', component: Medal },
    { name: 'Target', category: 'Olahraga & Medis', keywords: 'target panahan fokus gol sasaran tujuan capaian akurasi', component: Target },
    { name: 'Activity', category: 'Olahraga & Medis', keywords: 'aktivitas detak jantung sinyal gerak olahraga monitor denyut', component: Activity },
    { name: 'Heart', category: 'Olahraga & Medis', keywords: 'jantung hati cinta kesehatan medis donor darah', component: Heart },
    { name: 'HeartPulse', category: 'Olahraga & Medis', keywords: 'jantung denyut nadi medis sehat klinik rs kardio periksa', component: HeartPulse },
    { name: 'HeartHandshake', category: 'Olahraga & Medis', keywords: 'peduli sukarelawan kemanusiaan donor bantuan amal medis', component: HeartHandshake },
    { name: 'Brain', category: 'Olahraga & Medis', keywords: 'otak pikiran saraf psikologi cerdas ide kecerdasan mental', component: Brain },
    { name: 'Stethoscope', category: 'Olahraga & Medis', keywords: 'stetoskop dokter perawat medis periksa rumah sakit klinis', component: Stethoscope },
    { name: 'Pill', category: 'Olahraga & Medis', keywords: 'obat pil kapsul medis apotek sakit vitamin tablet', component: Pill },
    { name: 'Ambulance', category: 'Olahraga & Medis', keywords: 'ambulans gawat darurat medis mobil rumah sakit p3k sirine klinik', component: Ambulance },
    { name: 'Syringe', category: 'Olahraga & Medis', keywords: 'suntik vaksin medis imunisasi jarum suntikan donor darah', component: Syringe },
    { name: 'Cross', category: 'Olahraga & Medis', keywords: 'palang merah medis p3k obat darurat klinik ambulance pertolongan', component: Cross },
    { name: 'Thermometer', category: 'Olahraga & Medis', keywords: 'termometer suhu demam periksa cek panas badan kesehatan', component: Thermometer },
    { name: 'Bandage', category: 'Olahraga & Medis', keywords: 'plester perban luka obati medis darurat p3k pertolongan', component: Bandage },

    // =========================================================================
    // --- 3. Profesi, Kantor, Keuangan & IT (65+ Ikon) ---
    // =========================================================================
    { name: 'Briefcase', category: 'Profesi & Kantor', keywords: 'tas kantor kerja dinas bisnis eksekutif pns pegawai pengacara', component: Briefcase },
    { name: 'BriefcaseBusiness', category: 'Profesi & Kantor', keywords: 'tas kerja manajer direktur eksekutif konsultan bisnis', component: BriefcaseBusiness },
    { name: 'BriefcaseMedical', category: 'Profesi & Kantor', keywords: 'tas dokter paramedis darurat dokter kunjungan medis lapangan', component: BriefcaseMedical },
    { name: 'Laptop', category: 'Profesi & Kantor', keywords: 'laptop komputer programmer kerja kantor staf wfh laptop dinas', component: Laptop },
    { name: 'Monitor', category: 'Profesi & Kantor', keywords: 'komputer layar pc meja monitor kantor workstation desktop', component: Monitor },
    { name: 'MonitorSmartphone', category: 'Profesi & Kantor', keywords: 'multi platform responsif pc hp perangkat sinkronisasi', component: MonitorSmartphone },
    { name: 'Smartphone', category: 'Profesi & Kantor', keywords: 'hp ponsel telepon genggam smartphone chat whatsapp mobile', component: Smartphone },
    { name: 'Tablet', category: 'Profesi & Kantor', keywords: 'ipad tablet gadget digital form tanda tangan digital', component: Tablet },
    { name: 'Server', category: 'Profesi & Kantor', keywords: 'server data cloud database pusat server jaringan it rack hosting', component: Server },
    { name: 'Database', category: 'Profesi & Kantor', keywords: 'database data sql penyimpanan arsip tabel query storage', component: Database },
    { name: 'HardDrive', category: 'Profesi & Kantor', keywords: 'harddisk memory hdd ssd penyimpanan file backup data', component: HardDrive },
    { name: 'Code', category: 'Profesi & Kantor', keywords: 'koding programmer software dev html developer source script', component: Code },
    { name: 'CodeXml', category: 'Profesi & Kantor', keywords: 'koding xml tag html web dev developer frontend backend', component: CodeXml },
    { name: 'Terminal', category: 'Profesi & Kantor', keywords: 'terminal command cli linux sysadmin coding konsol shell', component: Terminal },
    { name: 'Printer', category: 'Profesi & Kantor', keywords: 'cetak print kertas dokumen laporan resi spk cetakan', component: Printer },
    { name: 'Calculator', category: 'Profesi & Kantor', keywords: 'kalkulator hitung akuntansi keuangan saldo pajak lembur audit', component: Calculator },
    { name: 'CreditCard', category: 'Profesi & Kantor', keywords: 'kartu kredit debit bayar transaksi belanja kas keuangan atm', component: CreditCard },
    { name: 'Coins', category: 'Profesi & Kantor', keywords: 'koin uang logam kas gaji bonus keuangan insentif upah', component: Coins },
    { name: 'Banknote', category: 'Profesi & Kantor', keywords: 'uang kertas rupiah cash gaji bayaran thr tunjangan lembur', component: Banknote },
    { name: 'Wallet', category: 'Profesi & Kantor', keywords: 'dompet keuangan simpanan uang pendapatan kasir saldo', component: Wallet },
    { name: 'Stamp', category: 'Profesi & Kantor', keywords: 'stempel cap legalisir sah surat resmi pengesahan verifikasi', component: Stamp },
    { name: 'PenTool', category: 'Profesi & Kantor', keywords: 'pena desain gambar vektor arsitek grafis tanda tangan digital', component: PenTool },
    { name: 'Pencil', category: 'Profesi & Kantor', keywords: 'pensil tulis catat sketsa gambar draf coretan', component: Pencil },
    { name: 'FileText', category: 'Profesi & Kantor', keywords: 'dokumen berkas surat laporan teks file pdf berita acara', component: FileText },
    { name: 'FileCheck', category: 'Profesi & Kantor', keywords: 'dokumen surat lunas setuju verifikasi acc tuntas disetujui', component: FileCheck },
    { name: 'FileSpreadsheet', category: 'Profesi & Kantor', keywords: 'excel spreadsheet sheet xlsx data tabel laporan angka', component: FileSpreadsheet },
    { name: 'FileCode', category: 'Profesi & Kantor', keywords: 'file kode script program js ts php python html program', component: FileCode },
    { name: 'Clipboard', category: 'Profesi & Kantor', keywords: 'papan jepit formulir form cek inspeksi daftar absen', component: Clipboard },
    { name: 'ClipboardCheck', category: 'Profesi & Kantor', keywords: 'papan ceklis checklist inspeksi audit terverifikasi acc', component: ClipboardCheck },
    { name: 'ClipboardList', category: 'Profesi & Kantor', keywords: 'daftar tugas to-do list agenda catatan rencana kerja sop', component: ClipboardList },
    { name: 'Users', category: 'Profesi & Kantor', keywords: 'tim rekan kerja grup karyawan orang rapat staf divisi kantor', component: Users },
    { name: 'User', category: 'Profesi & Kantor', keywords: 'pegawai staf individu akun profil orang user person', component: User },
    { name: 'UserCheck', category: 'Profesi & Kantor', keywords: 'presensi hadir absensi terverifikasi absensi masuk hadir bertugas', component: UserCheck },
    { name: 'UserRoundCheck', category: 'Profesi & Kantor', keywords: 'presensi absensi user sah terverifikasi petugas siap', component: UserRoundCheck },
    { name: 'UserRoundSearch', category: 'Profesi & Kantor', keywords: 'cari staf rekrutmen pegawai pencarian data user profil', component: UserRoundSearch },
    { name: 'UserCog', category: 'Profesi & Kantor', keywords: 'admin pengelola setelan teknisi setting manajemen akun', component: UserCog },
    { name: 'UserPlus', category: 'Profesi & Kantor', keywords: 'tambah staf karyawan baru anggota tim daftar akun user', component: UserPlus },
    { name: 'GraduationCap', category: 'Profesi & Kantor', keywords: 'toga wisuda sekolah kuliah training pelatihan sarjana diklat', component: GraduationCap },
    { name: 'School', category: 'Profesi & Kantor', keywords: 'sekolah kampus akademi pendidikan lembaga guru dosen', component: School },
    { name: 'Building', category: 'Profesi & Kantor', keywords: 'gedung kantor graha menara perkantoran gedung bumn pusat', component: Building },
    { name: 'Building2', category: 'Profesi & Kantor', keywords: 'gedung bertingkat graha kantor pusat cabang korporat', component: Building2 },
    { name: 'Landmark', category: 'Profesi & Kantor', keywords: 'bank gedung pemerintahan bumn kantor pusat kementerian bea cukai', component: Landmark },
    { name: 'Store', category: 'Profesi & Kantor', keywords: 'toko ritel jualan warung minimarket usaha ruko cabang', component: Store },
    { name: 'Hotel', category: 'Profesi & Kantor', keywords: 'hotel penginapan resort dinas luar kota spd akomodasi', component: Hotel },
    { name: 'Hospital', category: 'Profesi & Kantor', keywords: 'rumah sakit klinik rs dokter rawat inap medis ugd igd', component: Hospital },
    { name: 'Castle', category: 'Profesi & Kantor', keywords: 'benteng istana monumen cagar budaya bersejarah', component: Castle },
    { name: 'Shield', category: 'Profesi & Kantor', keywords: 'perisai perlindungan keamanan satpam security proteksi guard', component: Shield },
    { name: 'ShieldCheck', category: 'Profesi & Kantor', keywords: 'keamanan aman satpam security terlindungi lencana lolos izin', component: ShieldCheck },
    { name: 'ShieldAlert', category: 'Profesi & Kantor', keywords: 'peringatan keamanan waspada darurat bahaya insiden security', component: ShieldAlert },
    { name: 'Key', category: 'Profesi & Kantor', keywords: 'kunci akses pintu izin sandi ruang server token pas', component: Key },
    { name: 'Lock', category: 'Profesi & Kantor', keywords: 'kunci gembok privat rahasia tutup aman enkripsi terkunci', component: Lock },
    { name: 'Unlock', category: 'Profesi & Kantor', keywords: 'buka kunci akses diizinkan bebas terbuka terbuka gembok', component: Unlock },
    { name: 'Fingerprint', category: 'Profesi & Kantor', keywords: 'sidik jari fingerprint absensi biometric tap mesin absen ceisa', component: Fingerprint },
    { name: 'Scan', category: 'Profesi & Kantor', keywords: 'pindai scanner optik dokumen berkas barcode deteksi', component: Scan },
    { name: 'ScanFace', category: 'Profesi & Kantor', keywords: 'face id scan wajah pengenalan absensi presensi biometrik', component: ScanFace },
    { name: 'QrCode', category: 'Profesi & Kantor', keywords: 'barcode qr code scan tiket absensi digital gate pass', component: QrCode },
    { name: 'BarChart', category: 'Profesi & Kantor', keywords: 'grafik diagram batang statistik performa kpi laporan data', component: BarChart },
    { name: 'BarChart2', category: 'Profesi & Kantor', keywords: 'grafik statistik diagram metrik analitik omset produksi', component: BarChart2 },
    { name: 'BarChart3', category: 'Profesi & Kantor', keywords: 'grafik diagram laporan statistik performa capaian kuartal', component: BarChart3 },
    { name: 'PieChart', category: 'Profesi & Kantor', keywords: 'diagram lingkaran laporan persentase bagian proporsi shift', component: PieChart },
    { name: 'LineChart', category: 'Profesi & Kantor', keywords: 'grafik garis tren fluktuasi kinerja pertumbuhan data', component: LineChart },
    { name: 'TrendingUp', category: 'Profesi & Kantor', keywords: 'tren naik omset lembur target performa bagus kenaikan kpi', component: TrendingUp },
    { name: 'TrendingDown', category: 'Profesi & Kantor', keywords: 'tren turun penurunan efisiensi evaluasi pengurangan', component: TrendingDown },

    // =========================================================================
    // --- 4. Industri, Logistik, Pelabuhan & Lapangan (40+ Ikon) ---
    // =========================================================================
    { name: 'Ship', category: 'Industri & Logistik', keywords: 'kapal dermaga pelabuhan tanjung priok npct laut kontainer kargo sandar', component: Ship },
    { name: 'Anchor', category: 'Industri & Logistik', keywords: 'jangkar pelabuhan laut kapal sandar maritim dermaga kolam', component: Anchor },
    { name: 'Truck', category: 'Industri & Logistik', keywords: 'truk kontainer tronton kargo angkutan logistik jalan trailer fuso', component: Truck },
    { name: 'Warehouse', category: 'Industri & Logistik', keywords: 'gudang terminal tpsl logistik depo peti kemas pergudangan', component: Warehouse },
    { name: 'HardHat', category: 'Industri & Logistik', keywords: 'helm proyek k3 keselamatan lapangan teknisi insinyur safety', component: HardHat },
    { name: 'Construction', category: 'Industri & Logistik', keywords: 'konstruksi proyek kerja lapangan rambu kerucut perbaikan', component: Construction },
    { name: 'Forklift', category: 'Industri & Logistik', keywords: 'forklift angkat kargo gudang logistik pallet muat bongkar', component: Forklift },
    { name: 'Container', category: 'Industri & Logistik', keywords: 'kontainer peti kemas fcl lcl kargo muatan dermaga terminal', component: Container },
    { name: 'Box', category: 'Industri & Logistik', keywords: 'paket kardus koli box barang muatan kirim ekspedisi', component: Box },
    { name: 'Package', category: 'Industri & Logistik', keywords: 'paket kiriman kurir ekspedisi logistik barang delivery jnt jne', component: Package },
    { name: 'Boxes', category: 'Industri & Logistik', keywords: 'tumpukan paket banyak stok inventori gudang barang', component: Boxes },
    { name: 'Wrench', category: 'Industri & Logistik', keywords: 'kunci pas obeng bengkel perbaikan teknisi mekanik reparasi', component: Wrench },
    { name: 'Hammer', category: 'Industri & Logistik', keywords: 'palu tukang perbaikan alat perkakas bengkel pukulan martil', component: Hammer },
    { name: 'Drill', category: 'Industri & Logistik', keywords: 'bor bor listrik mesin teknisi bengkel lubang proyek', component: Drill },
    { name: 'Axe', category: 'Industri & Logistik', keywords: 'kapak perkakas potong kayu hutan pemadam darurat', component: Axe },
    { name: 'Nut', category: 'Industri & Logistik', keywords: 'baut mur sekrup perkakas mekanik teknik mesin suku cadang', component: Nut },
    { name: 'Factory', category: 'Industri & Logistik', keywords: 'pabrik industri manufaktur cerobong produksi operasional alat berat', component: Factory },
    { name: 'Cog', category: 'Industri & Logistik', keywords: 'roda gigi mesin gear mekanik teknik komponen berputar', component: Cog },
    { name: 'Sliders', category: 'Industri & Logistik', keywords: 'kontrol tuas setelan panel operasi parameter konfigurasi', component: Sliders },
    { name: 'Zap', category: 'Industri & Logistik', keywords: 'listrik tegangan tinggi kilat daya energi power pln voltase', component: Zap },
    { name: 'ZapOff', category: 'Industri & Logistik', keywords: 'listrik mati padam hemat energi mati lampu blackout', component: ZapOff },
    { name: 'Flame', category: 'Industri & Logistik', keywords: 'api panas pembakaran energi gas bahaya kebakaran semboyan', component: Flame },
    { name: 'Fuel', category: 'Industri & Logistik', keywords: 'bbm bensin solar spbu bahan bakar minyak tangki solar subsidi', component: Fuel },
    { name: 'Cable', category: 'Industri & Logistik', keywords: 'kabel listrik instalasi jaringan teknik ethernet serat optik', component: Cable },
    { name: 'Magnet', category: 'Industri & Logistik', keywords: 'magnet daya tarik medan magnetik elektromagnetik crane scrap', component: Magnet },
    { name: 'Scale', category: 'Industri & Logistik', keywords: 'timbangan jembatan timbang berat kargo tara muatan berat muatan', component: Scale },
    { name: 'Gauge', category: 'Industri & Logistik', keywords: 'speedometer meteran tekanan pengukur indikator jarum presisi', component: Gauge },
    { name: 'CircuitBoard', category: 'Industri & Logistik', keywords: 'elektronika pcb sirkuit mikrochip perangkat mesin komponen', component: CircuitBoard },
    { name: 'Cpu', category: 'Industri & Logistik', keywords: 'prosesor chip komponen komputer hardware otak mesin digital', component: Cpu },
    { name: 'BatteryCharging', category: 'Industri & Logistik', keywords: 'baterai cas daya charging accumulator aki charge pengisian', component: BatteryCharging },
    { name: 'Receipt', category: 'Industri & Logistik', keywords: 'struk nota invoice bukti timbang bon pembayaran kuitansi', component: Receipt },
    { name: 'ReceiptText', category: 'Industri & Logistik', keywords: 'faktur surat jalan manifest kargo dokumen impor ekspor delivery order', component: ReceiptText },

    // =========================================================================
    // --- 5. Waktu, Cuaca, Kendaraan & Perjalanan (35+ Ikon) ---
    // =========================================================================
    { name: 'Sun', category: 'Waktu & Cuaca', keywords: 'matahari pagi siang cerah shift pagi sm sinar terang siang hari', component: Sun },
    { name: 'SunDim', category: 'Waktu & Cuaca', keywords: 'matahari redup pagi mendung senja adem', component: SunDim },
    { name: 'SunMedium', category: 'Waktu & Cuaca', keywords: 'matahari siang hari cerah hangat terik', component: SunMedium },
    { name: 'Sunrise', category: 'Waktu & Cuaca', keywords: 'matahari terbit fajar subuh pagi masuk pagi dinas pagi fajar', component: Sunrise },
    { name: 'Sunset', category: 'Waktu & Cuaca', keywords: 'matahari terbenam senja sore pulang kantor selesai tugas maghrib', component: Sunset },
    { name: 'Moon', category: 'Waktu & Cuaca', keywords: 'bulan malam shift malam sm gelap tidur dinas malam petang', component: Moon },
    { name: 'MoonStar', category: 'Waktu & Cuaca', keywords: 'bulan bintang malam dinas malam larut subuh overnight jaga malam', component: MoonStar },
    { name: 'Clock', category: 'Waktu & Cuaca', keywords: 'jam waktu jadwal arloji menit presensi tepat waktu deadline', component: Clock },
    { name: 'Watch', category: 'Waktu & Cuaca', keywords: 'jam tangan waktu arloji pergelangan aksesori', component: Watch },
    { name: 'Hourglass', category: 'Waktu & Cuaca', keywords: 'jam pasir waktu durasi tunggu lembur toleransi hitungan', component: Hourglass },
    { name: 'Timer', category: 'Waktu & Cuaca', keywords: 'stopwatch hitung mundur durasi waktu kerja lembur hitungan jam', component: Timer },
    { name: 'AlarmClock', category: 'Waktu & Cuaca', keywords: 'jam weker bangun pagi alarm pengingat jam masuk alarm', component: AlarmClock },
    { name: 'Calendar', category: 'Waktu & Cuaca', keywords: 'kalender tanggal jadwal bulan hari kerja roaster bulanan', component: Calendar },
    { name: 'CalendarDays', category: 'Waktu & Cuaca', keywords: 'kalender agenda bulanan jadwal shift roaster mingguan', component: CalendarDays },
    { name: 'CalendarCheck', category: 'Waktu & Cuaca', keywords: 'kalender terisi jadwal siap konfirmasi jadwal final beres', component: CalendarCheck },
    { name: 'History', category: 'Waktu & Cuaca', keywords: 'riwayat masa lalu histori waktu rekaman log perubahan', component: History },
    { name: 'CloudSun', category: 'Waktu & Cuaca', keywords: 'berawan pagi mendung siang sejuk teduh cerah berawan', component: CloudSun },
    { name: 'CloudMoon', category: 'Waktu & Cuaca', keywords: 'malam berawan sejuk hening dinas malam hening gelap', component: CloudMoon },
    { name: 'CloudRain', category: 'Waktu & Cuaca', keywords: 'hujan gerimis basah payung cuaca deras hujan petir', component: CloudRain },
    { name: 'CloudSnow', category: 'Waktu & Cuaca', keywords: 'salju dingin beku es cuaca dingin musim dingin', component: CloudSnow },
    { name: 'CloudLightning', category: 'Waktu & Cuaca', keywords: 'petir badai kilat cuaca ekstrem guntur kilat', component: CloudLightning },
    { name: 'Cloud', category: 'Waktu & Cuaca', keywords: 'awan mendung kelabu langit udara sejuk', component: Cloud },
    { name: 'Wind', category: 'Waktu & Cuaca', keywords: 'angin sepoi kencang udara cuaca hembusan badai', component: Wind },
    { name: 'Car', category: 'Waktu & Cuaca', keywords: 'mobil kendaraan dinas pribadi perjalanan berangkat pulang macet tol', component: Car },
    { name: 'Plane', category: 'Waktu & Cuaca', keywords: 'pesawat terbang dinas luar pulau bandara kargo udara penerbangan', component: Plane },
    { name: 'PlaneTakeoff', category: 'Waktu & Cuaca', keywords: 'pesawat lepas landas berangkat dinas terbang keberangkatan', component: PlaneTakeoff },
    { name: 'PlaneLanding', category: 'Waktu & Cuaca', keywords: 'pesawat mendarat tiba pulang kedatangan airport bandara', component: PlaneLanding },
    { name: 'Train', category: 'Waktu & Cuaca', keywords: 'kereta krl komuter jalan stasiun logistik rel commuter line', component: Train },
    { name: 'TrainFront', category: 'Waktu & Cuaca', keywords: 'kereta api cepat mrt lrt stasiun lokomotif gerbong', component: TrainFront },
    { name: 'Bus', category: 'Waktu & Cuaca', keywords: 'bus jemputan antar jemput angkutan umum transjakarta bis', component: Bus },
    { name: 'Navigation', category: 'Waktu & Cuaca', keywords: 'navigasi arah rute tujuan jalur peta gps kompas', component: Navigation },
    { name: 'Navigation2', category: 'Waktu & Cuaca', keywords: 'arah panah navigasi tujuan haluan panduan', component: Navigation2 },
    { name: 'Locate', category: 'Waktu & Cuaca', keywords: 'lokasi titik koordinat radar deteksi posisi presisi', component: Locate },
    { name: 'MapPin', category: 'Waktu & Cuaca', keywords: 'lokasi pin titik tempat graha terminal posisi gps dermaga pos', component: MapPin },
    { name: 'Signpost', category: 'Waktu & Cuaca', keywords: 'petunjuk arah plang rambu persimpangan jalan penunjuk arah', component: Signpost },

    // =========================================================================
    // --- 6. Status, Simbol, Lencana & Komunikasi (25+ Ikon) ---
    // =========================================================================
    { name: 'Check', category: 'Status & Simbol', keywords: 'centang ceklis sukses selesai tuntas benar sah oke valid', component: Check },
    { name: 'CheckCircle2', category: 'Status & Simbol', keywords: 'ceklis lingkaran sukses verified beres lunas disetujui', component: CheckCircle2 },
    { name: 'Star', category: 'Status & Simbol', keywords: 'bintang favorit utama penting prioritas unggul rekomendasi', component: Star },
    { name: 'Sparkles', category: 'Status & Simbol', keywords: 'bintang kilau istimewa baru cerah kilauan spesial wow', component: Sparkles },
    { name: 'Sparkle', category: 'Status & Simbol', keywords: 'kilau binar cahaya bersih kinclong segar kilat', component: Sparkle },
    { name: 'Flag', category: 'Status & Simbol', keywords: 'bendera libur tanggal merah penanda tugu event penanda penting', component: Flag },
    { name: 'Award', category: 'Status & Simbol', keywords: 'penghargaan apresiasi lencana prestasi piagam karyawan teladan', component: Award },
    { name: 'BadgeCheck', category: 'Status & Simbol', keywords: 'lencana verifikasi resmi sah teruji lolos kualifikasi', component: BadgeCheck },
    { name: 'AlertCircle', category: 'Status & Simbol', keywords: 'perhatian peringatan info tanda seru notice pengumuman', component: AlertCircle },
    { name: 'AlertTriangle', category: 'Status & Simbol', keywords: 'waspada bahaya hati-hati risiko warning perhatian k3', component: AlertTriangle },
    { name: 'Bell', category: 'Status & Simbol', keywords: 'lonceng notifikasi pengingat bel kabar notif', component: Bell },
    { name: 'BellRing', category: 'Status & Simbol', keywords: 'lonceng notifikasi pengingat alarm bunyi getar panggilan aktif', component: BellRing },
    { name: 'Megaphone', category: 'Status & Simbol', keywords: 'toa pengumuman info broadcast woro-woro siaran woro pengumuman penting', component: Megaphone },
    { name: 'Phone', category: 'Status & Simbol', keywords: 'telepon kontak customer service hubungi hotline panggil', component: Phone },
    { name: 'PhoneCall', category: 'Status & Simbol', keywords: 'telepon hubungi panggilan darurat bicara masuk berdering', component: PhoneCall },
    { name: 'Send', category: 'Status & Simbol', keywords: 'kirim pesan telegram surat chat submit bagikan share', component: Send },
    { name: 'MessageSquare', category: 'Status & Simbol', keywords: 'pesan chat diskusi obrolan komentar wa sms feedback', component: MessageSquare },
    { name: 'MessagesSquare', category: 'Status & Simbol', keywords: 'grup chat forum percakapan banyak diskusi koordinasi tim', component: MessagesSquare },
    { name: 'ThumbsUp', category: 'Status & Simbol', keywords: 'jempol mantap setuju oke bagus siip like suka apresiasi', component: ThumbsUp },
    { name: 'Smile', category: 'Status & Simbol', keywords: 'senyum bahagia ramah puas ceria senang senyuman emotikon', component: SmileIcon },
    { name: 'Gift', category: 'Status & Simbol', keywords: 'kado hadiah bonus bingkisan thr perayaan bingkisan reward', component: Gift },
    { name: 'Tag', category: 'Status & Simbol', keywords: 'label tag penanda kategori jenis cap identitas', component: Tag },
];

export const CATEGORIZED_EMOJIS: Record<string, string[]> = {
    '🌴 Santai, Hobi & Liburan': [
        '🏖️', '☕', '🎮', '🎧', '🛌', '🍕', '🏕️', '🧘', '🎬', '🍿', '🏊', '🚴',
        '🍹', '🍔', '🍦', '⛺', '🎣', '🎸', '🛹', '🏄', '🏝️', '🛀', '🥐', '🍩',
        '🍰', '🍻', '🍷', '🥂', '🍫', '🍜', '🍱', '🍙', '🎨', '🧩', '🎳', '🪁',
        '🛋️', '💤', '🥳', '🎉', '🏓', '🏸', '🎾', '🥊', '🥋', '🤿', '🚣', '🧗',
        '🧖', '💆', '🍳', '🥞', '🧇', '🥨', '🌭', '🌮', '🌯', '🍣', '🍤', '🧁',
        '🍧', '🍨', '🍮', '🍭', '🍬', '🧃', '🧉', '🍾', '🍶', '🎯', '🎰', '🃏',
    ],
    '👷 Profesi, Kantor & Lapangan': [
        '👷', '👨‍💻', '👩‍💻', '👨‍⚕️', '👩‍⚕️', '👮', '🚚', '⚓', '🚢', '🏗️', '🔧', '📦',
        '💼', '📊', '🚒', '🚕', '🚜', '🦺', '📡', '🩺', '🛠️', '🧯', '🧑‍🏫', '👨‍🍳',
        '🧑‍🔬', '🧑‍✈️', '💂', '🕵️', '📋', '📁', '💻', '🖥️', '🖨️', '📠', '🔍', '⚙️',
        '👩‍⚖️', '👨‍⚖️', '🧑‍🎨', '🧑‍🎤', '🧑‍🔧', '🧑‍💼', '🧑‍🚒', '🧑‍✈️', '🧑‍🚀', '🪖', '📜', '⚖️',
        '💰', '💵', '💳', '🧾', '📈', '📉', '🗂️', '📂', '📆', '📌', '📎', '✏️',
        '🖊️', '🖋️', '📝', '🔒', '🔓', '🔏', '🔐', '🔑', '🗝️', '🧱', '🪜', '⛏️',
    ],
    '⏰ Waktu, Cuaca & Alam': [
        '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '⚡', '🌙', '🌌',
        '🕒', '🕕', '🕘', '🕛', '🚨', '📅', '📆', '🌅', '🌇', '⏱️', '⏳', '🕰️',
        '🔔', '❄️', '🌈', '🌪️', '🌑', '🌕', '🌖', '🌒', '⭐', '✨', '🪐', '💫',
        '☄️', '🔥', '💧', '🌊', '💨', '🌫️', '🌡️', '🧭', '🌋', '🗻', '🏕️', '🌲',
        '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄',
        '🌸', '🌺', '🌹', '🌻', '🌼', '🌷', '💐', '🌾', '🌙', '🌛', '🌜', '🌞',
    ],
    '🎯 Simbol, Status & Lencana': [
        '✅', '✔️', '❌', '⚠️', '🚫', '🆗', '💤', '🔥', '⭐', '🌟', '🚀', '💡',
        '🏷️', '💯', '📌', '📍', '🔒', '🔓', '🔑', '🏆', '🥇', '🥈', '🥉', '🎖️',
        '🟢', '🔴', '🔵', '🟡', '🟠', '🟣', '⬛', '⬜', '💠', '🔷', '🔶', '🔘',
        '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '🟥', '🟧', '🟨',
        '🟩', '🟦', '🟪', '🟫', '⬛', '⬜', '💎', '🏅', '🎗️', '🎫', '🎟️', '🔮',
        '🧿', '📿', '📢', '📣', '🔔', '🔕', '💬', '🗯️', '💭', '💌', '📮', '📬',
    ],
    '🚗 Kendaraan, Logistik & Bepergian': [
        '🚗', '🚙', '🏎️', '🚐', '🛻', '🚚', '🚛', '🛵', '🏍️', '🚲', '🛴', '🚌',
        '🚋', '🚆', '🚄', '✈️', '🛫', '🛬', '⛵', '🛥️', '🚢', '🛳️', '🚁', '🧳',
        '🎫', '⛽', '🚦', '🛑', '🚧', '⚓', '🗺️', '🧭', '🗼', '🗽', '🏯', '🏰',
        '🚖', '🚔', '🚍', '🚎', '🚒', '🚑', '🚜', '🛵', '🚲', '🛹', '🛼', '🚊',
        '🚉', '🚝', '🚞', '🚈', '🚀', '🛸', '🛰️', '🛶', '🚤', '⛴️', '🛳️', '🛳️',
        '🛢️', '🛣️', '🛤️', '🏁', '🚩', '🏴', '🎌', '⛺', '🎪', '🎡', '🎢', '⛲',
    ],
    '🍔 Makanan, Minuman & Santapan': [
        '☕', '🍵', '🧋', '🥤', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹',
        '🧉', '🍾', '🥛', '🍼', '🧊', '🍕', '🍔', '🍟', '🌭', '🍿', '🥪', '🥙',
        '🌮', '🌯', '🥗', '🥘', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🍤',
        '🍙', '🍚', '🍘', '🍥', '🥠', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁',
        '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯',
    ],
};

export const ShiftIconPickerModal: React.FC<ShiftIconPickerModalProps> = ({
    isOpen,
    onClose,
    visual,
    naming,
    onChange,
}) => {
    const [draftVisual, setDraftVisual] = useState<ShiftVisualStyle>(visual);
    const [history, setHistory] = useState<ShiftVisualStyle[]>([JSON.parse(JSON.stringify(visual))]);
    const [historyIndex, setHistoryIndex] = useState<number>(0);
    const [isApplied, setIsApplied] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'svg' | 'emoji'>('svg');
    const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
    const [selectedEmojiCategory, setSelectedEmojiCategory] = useState<string>('Semua');
    // Sync draftVisual when modal opens
    React.useEffect(() => {
        if (isOpen) {
            const cloned = JSON.parse(JSON.stringify(visual));
            setDraftVisual(cloned);
            setHistory([cloned]);
            setHistoryIndex(0);
            setIsApplied(false);        }
    }, [isOpen, visual]);

    if (!isOpen) return null;

    const updateDraft = (newVisual: ShiftVisualStyle) => {
        const newHist = history.slice(0, historyIndex + 1);
        newHist.push(JSON.parse(JSON.stringify(newVisual)));
        setHistory(newHist);
        setHistoryIndex(newHist.length - 1);
        setDraftVisual(newVisual);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            const prevIdx = historyIndex - 1;
            setHistoryIndex(prevIdx);
            setDraftVisual(JSON.parse(JSON.stringify(history[prevIdx])));
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            const nextIdx = historyIndex + 1;
            setHistoryIndex(nextIdx);
            setDraftVisual(JSON.parse(JSON.stringify(history[nextIdx])));
        }
    };

    const handleHapus = () => {
        updateDraft({
            ...draftVisual,
            iconType: 'none',
            iconName: undefined,
            customIconUrl: undefined,
            emoji: undefined,
        });
    };

    const handleApply = () => {
        onChange(draftVisual);
        setIsApplied(true);
        setTimeout(() => setIsApplied(false), 1500);
    };

    const handleSave = () => {
        onChange(draftVisual);
        onClose();
    };

    const categories = [
        'Semua',
        'Individu & Santai',
        'Olahraga & Medis',
        'Profesi & Kantor',
        'Industri & Logistik',
        'Waktu & Cuaca',
        'Status & Simbol',
    ];

    const filteredIcons = ICON_CATALOG.filter((item) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
            q === '' ||
            item.name.toLowerCase().includes(q) ||
            item.keywords.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q);
        const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleSelectSvg = (name: string) => {
        updateDraft({
            ...draftVisual,
            iconType: 'svg',
            iconName: name,
            customIconUrl: undefined,
            emoji: undefined,
        });
    };

    const handleSelectEmoji = (em: string) => {
        updateDraft({
            ...draftVisual,
            iconType: 'emoji',
            emoji: em,
            iconName: undefined,
            customIconUrl: undefined,
        });
    };

    // Helper to render background of desktop preview badge
    const getBackgroundStyle = (vis: ShiftVisualStyle): React.CSSProperties => {
        if (vis.customCss) {
            return { background: vis.customCss.replace(/background(-color)?:\s*|;/g, '').trim() };
        }
        if (vis.colorMode === 'radial' && vis.colorStops && vis.colorStops.length > 0) {
            const stopsStr = vis.colorStops.map((s) => `${s.color} ${s.position}%`).join(', ');
            return { background: `radial-gradient(circle at center, ${stopsStr})` };
        }
        if (vis.colorMode === 'linear' && vis.colorStops && vis.colorStops.length > 0) {
            const stopsStr = vis.colorStops.map((s) => `${s.color} ${s.position}%`).join(', ');
            return { background: `linear-gradient(${vis.gradientAngle || 135}deg, ${stopsStr})` };
        }
        return { backgroundColor: vis.solidColor || '#006D77' };
    };

    // Helper to render pattern overlay of desktop preview badge
    const renderPatternOverlay = (vis: ShiftVisualStyle) => {
        if (vis.customPatternUrl) {
            let opacity = vis.patternOpacity !== undefined ? vis.patternOpacity : 1.0;
            if (opacity > 1) opacity = opacity / 100;

            if (isCustomPatternImage(vis.customPatternUrl)) {
                const imgScale = vis.patternScale || 1.0;
                const sizePx = Math.max(8, Math.round(16 * imgScale));
                return (
                    <div
                        className="absolute inset-0 pointer-events-none z-0"
                        style={{
                            backgroundImage: `url(${vis.customPatternUrl})`,
                            backgroundRepeat: 'repeat',
                            backgroundPosition: 'center',
                            backgroundSize: `${sizePx}px ${sizePx}px`,
                            opacity,
                        }}
                    />
                );
            }

            const patColor = vis.patternColor || '#FFFFFF';
            const strokeWidth = vis.patternStrokeWidth !== undefined ? vis.patternStrokeWidth : 1.2;
            const cssStyle = parseCssPatternToStyle(vis.customPatternUrl, vis.patternScale || 1.0, patColor, strokeWidth);
            return (
                <div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                        ...cssStyle,
                        opacity,
                    }}
                />
            );
        }
        const patternObj = BADGE_PATTERNS.find((p) => p.id === vis.patternType);
        if (!patternObj || patternObj.id === 'none') return null;

        const patColor = vis.patternColor || '#FFFFFF';
        const strokeWidth = vis.patternStrokeWidth !== undefined ? vis.patternStrokeWidth : 1.2;
        const svgContentStr = patternObj.svgContent(patColor, strokeWidth);
        const scale = vis.patternScale || 1.0;
        const patWidth = Math.max(2, Math.round(patternObj.defaultWidth * scale));
        const patHeight = Math.max(2, Math.round(patternObj.defaultHeight * scale));
        let opacity = vis.patternOpacity !== undefined ? vis.patternOpacity : 1.0;
        if (opacity > 1) opacity = opacity / 100;

        return (
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(
                        `<svg xmlns='http://www.w3.org/2000/svg' width='${patWidth}' height='${patHeight}'>${svgContentStr}</svg>`
                    )}")`,
                    backgroundRepeat: 'repeat',
                    backgroundPosition: 'center',
                    opacity,
                }}
            />
        );
    };

    // Helper to render selected icon in desktop preview badge
    const renderSelectedIcon = (vis: ShiftVisualStyle, className: string = 'w-3 h-3') => {
        if (vis.iconType === 'svg' && vis.iconName) {
            const item = ICON_CATALOG.find((it) => it.name === vis.iconName);
            if (item) {
                const IconComp = item.component;
                return <IconComp className={className} />;
            }
        }
        if (vis.iconType === 'emoji' && vis.emoji) {
            return <span className="text-[11px] leading-none">{vis.emoji}</span>;
        }
        if (vis.iconType === 'customImage' && vis.customIconUrl) {
            return <img src={vis.customIconUrl} alt="custom" className={`${className} object-contain`} />;
        }
        return null;
    };

    return (
        <div className="fixed inset-0 sm:top-7 z-160 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="fixed inset-0 sm:top-7" onClick={onClose} />
            <div className="relative z-10 w-full max-w-3xl max-h-[88vh] flex flex-col rounded-3xl bg-white dark:bg-[#1E1E1E] text-slate-900 dark:text-slate-100 shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Fixed Top Controls Header (Non-scrolling solid area) */}
                <div className="shrink-0 bg-white dark:bg-[#1E1E1E] z-20 border-b border-current/10 p-3.5 sm:p-4 space-y-2.5">
                    {/* Header with Title + Simple Desktop Badge Preview */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0">
                            <div>
                                <h3 className="text-sm sm:text-base font-bold">Pilih Ikon & Logo Shift</h3>
                                <p className="text-[11px] opacity-60 hidden sm:block">260+ Ikon Vektor SVG Tematik, 300+ Emoji & Upload Gambar</p>
                            </div>

                            {/* Simple Desktop Preview Badge */}
                            <div className="flex items-center space-x-1.5 sm:space-x-2 pl-2 sm:pl-3 border-l border-current/10 shrink-0">
                                <span className="text-[10px] sm:text-[11px] font-bold opacity-70">Badge:</span>
                                <div
                                    className="relative px-2 sm:px-2.5 py-0.5 rounded-[5px] font-black text-[10.5px] sm:text-[11px] shadow-xs border flex items-center space-x-1 select-none overflow-hidden"
                                    style={{
                                        ...getBackgroundStyle(draftVisual),
                                        color: draftVisual.textColor || '#FFFFFF',
                                        borderColor: draftVisual.borderColor || '#83C5BE',
                                    }}
                                >
                                    {renderPatternOverlay(draftVisual)}
                                    <div className="relative z-10 flex items-center space-x-1">
                                        {renderSelectedIcon(draftVisual, 'w-3 h-3')}
                                        <span className="tracking-tight">{naming?.displayBadge || 'SHIFT'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-full hover:bg-current/10 cursor-pointer text-current/70 hover:text-current transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Main Tabs */}
                    <div className="flex p-1 gap-1 rounded-xl bg-current/5 border border-current/10 text-xs">
                        <button
                            type="button"
                            onClick={() => setActiveTab('svg')}
                            className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                activeTab === 'svg' ? 'bg-indigo-600 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
                            }`}
                        >
                            260+ Ikon
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('emoji')}
                            className={`flex-1 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                activeTab === 'emoji' ? 'bg-indigo-600 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
                            }`}
                        >
                            300+ Koleksi Emoji
                        </button>
                    </div>

                    {/* Sub Controls for Tab SVG: Search & Category Chips */}
                    {activeTab === 'svg' && (
                        <div className="space-y-2 pt-0.5">
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
                                <input
                                    type="text"
                                    placeholder="Cari ikon (misal: kopi, santai, sofa, tidur, gym, kapal, dokter, laptop, lembur, teh, renang)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-current/20 bg-current/5 outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div className="flex flex-wrap gap-1.5 pt-0.5">
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                                            selectedCategory === cat
                                                ? 'bg-indigo-600 text-white shadow-xs'
                                                : 'bg-current/5 border border-current/10 opacity-70 hover:opacity-100 hover:bg-current/10'
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Sub Controls for Tab Emoji: Category Chips */}
                    {activeTab === 'emoji' && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5">
                            <button
                                type="button"
                                onClick={() => setSelectedEmojiCategory('Semua')}
                                className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                                    selectedEmojiCategory === 'Semua'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'bg-current/5 border border-current/10 opacity-70 hover:opacity-100 hover:bg-current/10'
                                }`}
                            >
                                Semua Emoji
                            </button>
                            {Object.keys(CATEGORIZED_EMOJIS).map((catName) => (
                                <button
                                    key={catName}
                                    type="button"
                                    onClick={() => setSelectedEmojiCategory(catName)}
                                    className={`px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                                        selectedEmojiCategory === catName
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-current/5 border border-current/10 opacity-70 hover:opacity-100 hover:bg-current/10'
                                    }`}
                                >
                                    {catName}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Body Content - Pure Scrolling Content Only */}
                <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 custom-scrollbar">
                    {/* Tab 1: SVG Icons */}
                    {activeTab === 'svg' && (
                        <>
                            {/* SVG Grid */}
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2">
                                {filteredIcons.map((item) => {
                                    const IconComp = item.component;
                                    const isSelected = draftVisual.iconType === 'svg' && draftVisual.iconName === item.name;
                                    return (
                                        <button
                                            key={item.name}
                                            type="button"
                                            onClick={() => handleSelectSvg(item.name)}
                                            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center group cursor-pointer ${
                                                isSelected
                                                    ? 'bg-indigo-600/15 border-indigo-500 text-indigo-500 scale-105 shadow-xs font-bold'
                                                    : 'border-current/10 hover:border-current/30 hover:bg-current/5'
                                            }`}
                                            title={`${item.name} (${item.category})`}
                                        >
                                            <IconComp className="w-5 h-5 mb-1 group-hover:scale-115 transition-transform" />
                                            <span className="text-[9px] font-medium truncate w-full opacity-75">{item.name}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {filteredIcons.length === 0 && (
                                <p className="text-center py-8 text-xs opacity-50">
                                    Tidak ada ikon yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
                                </p>
                            )}
                        </>
                    )}

                    {/* Tab 2: Categorized Emojis */}
                    {activeTab === 'emoji' && (
                        <div className="space-y-4">
                            {/* Emoji Sections */}
                            <div className="space-y-4">
                                {Object.entries(CATEGORIZED_EMOJIS).map(([catTitle, emojiList]) => {
                                    if (selectedEmojiCategory !== 'Semua' && selectedEmojiCategory !== catTitle) return null;
                                    return (
                                        <div key={catTitle} className="space-y-2 p-3 rounded-2xl bg-current/5 border border-current/10">
                                            <h4 className="text-xs font-bold text-indigo-500">{catTitle}</h4>
                                            <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-12 gap-2">
                                                {emojiList.map((em, idx) => {
                                                    const isSelected = draftVisual.iconType === 'emoji' && draftVisual.emoji === em;
                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => handleSelectEmoji(em)}
                                                            className={`text-2xl p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                                                                isSelected
                                                                    ? 'bg-indigo-600/20 border-indigo-500 scale-110 shadow-xs ring-2 ring-indigo-500'
                                                                    : 'border-current/10 hover:border-indigo-500 hover:scale-115 hover:bg-current/5'
                                                            }`}
                                                            title={em}
                                                        >
                                                            {em}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>


                {/* Footer Controls: Undo, Redo, Hapus on Left, Batal, Terapkan, Simpan on Right */}
                <div className="p-2.5 sm:p-3 border-t border-current/10 flex flex-wrap justify-between items-center gap-2 bg-current/5 shrink-0">
                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                        {/* Undo Button */}
                        <button
                            type="button"
                            onClick={handleUndo}
                            disabled={historyIndex <= 0}
                            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg border text-xs font-bold flex items-center space-x-1 transition-all ${
                                historyIndex > 0
                                    ? 'bg-current/10 border-current/20 hover:bg-current/20 cursor-pointer active:scale-95'
                                    : 'opacity-30 border-current/10 cursor-not-allowed'
                            }`}
                            title="Undo (Kembalikan pilihan ikon sebelumnya)"
                        >
                            <Undo2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Undo</span>
                        </button>

                        {/* Redo Button */}
                        <button
                            type="button"
                            onClick={handleRedo}
                            disabled={historyIndex >= history.length - 1}
                            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg border text-xs font-bold flex items-center space-x-1 transition-all ${
                                historyIndex < history.length - 1
                                    ? 'bg-current/10 border-current/20 hover:bg-current/20 cursor-pointer active:scale-95'
                                    : 'opacity-30 border-current/10 cursor-not-allowed'
                            }`}
                            title="Redo (Ulangi pilihan ikon)"
                        >
                            <Redo2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Redo</span>
                        </button>

                        {/* Hapus Button */}
                        <button
                            type="button"
                            onClick={handleHapus}
                            className="px-2.5 py-1 text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg flex items-center space-x-1 cursor-pointer transition-all active:scale-95"
                            title="Hapus ikon / jadikan tanpa ikon"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                        </button>
                    </div>

                    <div className="flex items-center space-x-1.5 sm:space-x-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-1.5 text-xs font-bold rounded-lg bg-current/10 hover:bg-current/20 cursor-pointer transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleApply}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border flex items-center space-x-1.5 cursor-pointer shadow-2xs transition-all active:scale-95 ${
                                isApplied
                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                                    : 'bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
                            }`}
                            title="Terapkan ikon tanpa menutup jendela"
                        >
                            <Check className={`w-3.5 h-3.5 ${isApplied ? 'text-emerald-500' : ''}`} />
                            <span>{isApplied ? 'Diterapkan!' : 'Terapkan'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                            title="Simpan ikon dan tutup jendela"
                        >
                            <Save className="w-3.5 h-3.5" />
                            <span>Simpan</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
