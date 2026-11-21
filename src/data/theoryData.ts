export interface VariableRow {
  symbol: string;
  name: string;
  meaning: string;
  siUnit: string;
}

export interface WorkedExample {
  title: string;
  problem: string;
  steps: string[];
  answer: string;
}

export interface TheoryLevel {
  level: 1 | 2 | 3 | 4 | 5;
  badge: string;
  title: string;
  subtitle: string;
  overview: string;
  sections: {
    heading: string;
    body: string;
    highlightFormula?: string;
    bulletPoints?: string[];
  }[];
  variables: VariableRow[];
  workedExample: WorkedExample;
  visualPreset: {
    label: string;
    angleDeg: number;
    mu: number;
    baseLength: number;
    showOptimalOverlay?: boolean;
    showDualAngle?: boolean;
    showEffectiveGravity?: boolean;
    isSphere?: boolean;
  };
  narrationScript: string;
}

export const SOAL_6_ANALYSIS = {
  pokokBahasan: 'Dinamika Partikel (Hukum Newton) & Kinematika pada Bidang Miring Kasar dengan Optimasi Waktu',
  submateri: [
    'Penguraian komponen gaya berat pada bidang miring',
    'Gaya normal dan gaya gesek kinetik Coulomb',
    'Geometri bidang miring dengan panjang alas horizontal tetap ($\\ell$)',
    'Kinematika GLBB dari keadaan diam dan fungsi waktu tempuh $t(\\alpha)$',
    'Optimasi sudut luncur minimum menggunakan turunan atau identitas trigonometri',
  ],
  prinsipHukum: [
    'Hukum II Newton pada sumbu sejajar dan tegak lurus bidang miring',
    'Hukum gesekan kinetik Amontons-Coulomb: $f_k = \\mu_k N$',
    'Persamaan kinematika GLBB: $s = \\frac{1}{2}at^2$',
    'Prinsip ekstremum fungsi trigonometri untuk waktu tersingkat',
  ],
  rumusUtama: '\\alpha_{\\text{opt}} = 45^\\circ + \\frac{1}{2}\\arctan(\\mu)',
  jawabanAsli: '53,6° (untuk μ = 0,31 dan ℓ = 2,1 m)',
};

export const THEORY_LEVELS: TheoryLevel[] = [
  {
    level: 1,
    badge: 'Level 1',
    title: 'Pengetahuan Awal: Geometri & Gaya Dasar Bidang Miring',
    subtitle: 'Fondasi besaran, satuan SI, dan penguraian vektor pada bidang miring beralas tetap',
    overview:
      'Sebelum mencari sudut tercepat seperti pada Soal Nomor 6 OSK 2026, kita harus memahami secara utuh geometri segitiga bidang miring beralas tetap serta tiga gaya utama yang bekerja pada benda kecil yang meluncur.',
    sections: [
      {
        heading: 'Geometri Bidang Miring dengan Panjang Alas Tetap',
        body: 'Pada Soal Nomor 6, panjang alas horizontal bidang miring dijaga konstan sebesar $\\ell$, bukan tinggi $h$ atau panjang lintasan $s$. Saat sudut kemiringan $\\alpha$ diperbesar, panjang sisi miring yang ditempuh benda otomatis memanjang mengikuti hubungan trigonometri segitiga siku-siku.',
        highlightFormula: 's = \\frac{\\ell}{\\cos\\alpha}, \\qquad h = \\ell\\tan\\alpha',
        bulletPoints: [
          'Jika $\\alpha$ kecil, lintasan $s \\approx \\ell$ cukup pendek, tetapi komponen gravitasi pendorong gerak sangat kecil.',
          'Jika $\\alpha$ sangat besar mendekati $90^\\circ$, percepatan besar, tetapi panjang lintasan $s = \\ell/\\cos\\alpha$ membengkak menuju tak hingga.',
        ],
      },
      {
        heading: 'Penguraian Vektor Gaya Berat & Interaksi Kontak',
        body: 'Kita memilih sumbu koordinat miring: sumbu-$x\'$ sejajar bidang miring mengarah ke bawah, dan sumbu-$y\'$ tegak lurus permukaan bidang miring mengarah ke atas. Gaya berat $W = mg$ selalu berarah vertikal ke bawah sehingga diuraikan menjadi komponen sejajar bidang $mg\\sin\\alpha$ dan komponen tegak lurus bidang $mg\\cos\\alpha$.',
        highlightFormula: 'W_{x\'} = mg\\sin\\alpha, \\qquad W_{y\'} = mg\\cos\\alpha',
      },
    ],
    variables: [
      { symbol: '$\\ell$', name: 'Panjang alas horizontal', meaning: 'Jarak horizontal dari kaki vertikal puncak ke ujung dasar bidang miring', siUnit: 'm (meter)' },
      { symbol: '$s$', name: 'Panjang lintasan miring', meaning: 'Jarak tempuh aktual benda sepanjang permukaan miring', siUnit: 'm (meter)' },
      { symbol: '$\\alpha$', name: 'Sudut kemiringan', meaning: 'Sudut antara permukaan miring dan bidang horizontal', siUnit: 'derajat (°) / rad' },
      { symbol: '$m$', name: 'Massa benda', meaning: 'Ukuran inersia benda kecil yang meluncur', siUnit: 'kg (kilogram)' },
      { symbol: '$g$', name: 'Percepatan gravitasi', meaning: 'Medan gravitasi homogen vertikal ke bawah', siUnit: 'm/s²' },
      { symbol: '$\\mu$', name: 'Koefisien gesek kinetik', meaning: 'Rasio tak berdimensi antara gaya gesek kinetik dan gaya normal', siUnit: 'tanpa satuan' },
    ],
    workedExample: {
      title: 'Contoh Dasar: Menentukan Panjang Lintasan dan Gaya Normal',
      problem:
        'Sebuah benda bermassa $m = 2{,}0\\text{ kg}$ diletakkan pada bidang miring berujung alas $\\ell = 2{,}1\\text{ m}$ dan sudut $\\alpha = 37^\\circ$ ($\\cos 37^\\circ = 0{,}80$; $g = 9{,}8\\text{ m/s}^2$). Hitung panjang lintasan $s$ dan gaya normal $N$.',
      steps: [
        'Hitung panjang lintasan miring: $s = \\frac{\\ell}{\\cos 37^\\circ} = \\frac{2{,}1}{0{,}80} = 2{,}625\\text{ m}$.',
        'Karena benda tidak bergerak tegak lurus bidang, $\\Sigma F_{y\'} = 0 \\Rightarrow N = mg\\cos 37^\\circ$.',
        'Substitusi angka: $N = 2{,}0 \\times 9{,}8 \\times 0{,}80 = 15{,}68\\text{ N}$.',
      ],
      answer: 's = 2,63 m dan N = 15,7 N',
    },
    visualPreset: {
      label: 'Konfigurasi Dasar (α = 37°, μ = 0,31)',
      angleDeg: 37,
      mu: 0.31,
      baseLength: 2.1,
    },
    narrationScript:
      'Selamat datang di Level 1 Pusat Teori bersama Mister Jo. Kunci awal memahami Soal Nomor 6 adalah mengenali bahwa panjang alas el bernilai tetap. Akibatnya, panjang lintasan es sama dengan el dibagi kosinus alfa. Saat sudut alfa diperbesar, gaya gravitasi pendorong membesar, namun panjang lintasan yang harus ditempuh juga ikut memanjang.',
  },
  {
    level: 2,
    badge: 'Level 2',
    title: 'Pemahaman Konseptual: Hukum II Newton & Syarat Luncur',
    subtitle: 'Mengapa persamaan percepatan berlaku, peran gaya gesek, dan batasan asumsi model',
    overview:
      'Di level ini kita merumuskan dinamika gerak meluncur menggunakan Hukum II Newton dan memeriksa kondisi fisika kapan benda benar-benar meluncur ke bawah.',
    sections: [
      {
        heading: 'Penurunan Percepatan dari Hukum II Newton',
        body: 'Sepanjang arah tegak lurus bidang miring ($y\'$), tidak ada percepatan sehingga $N = mg\\cos\\alpha$. Gaya gesek kinetik bekerja berlawanan arah gerak relatif benda terhadap bidang miring dengan besar $f_k = \\mu N = \\mu mg\\cos\\alpha$. Menerapkan $\\Sigma F_{x\'} = ma$ ke arah bawah bidang miring memberikan percepatan konstan yang tidak bergantung pada massa $m$.',
        highlightFormula: 'a = g(\\sin\\alpha - \\mu\\cos\\alpha)',
        bulletPoints: [
          'Asumsi model: benda dianggap partikel kecil (bukan benda tegar yang berguling), udara diabaikan, dan permukaan memiliki $\\mu$ homogen.',
          'Karena percepatan $a$ konstan, benda menempuh Gerak Lurus Berubah Beraturan (GLBB).',
        ],
      },
      {
        heading: 'Kondisi Berlakunya Persamaan & Batas Kritis Sudut',
        body: 'Persamaan di atas hanya menghasilkan gerakan meluncur ke bawah apabila komponen gaya berat lebih besar daripada gaya gesek maksimum. Jika benda dilepas dari diam, benda baru mulai meluncur bila $\\tan\\alpha > \\mu_s$ (atau $> \\mu$ bila $\\mu_s \\approx \\mu_k$).',
        highlightFormula: '\\sin\\alpha - \\mu\\cos\\alpha > 0 \\iff \\tan\\alpha > \\mu',
      },
    ],
    variables: [
      { symbol: '$N$', name: 'Gaya normal', meaning: 'Gaya kontak tegak lurus permukaan bidang miring pada benda', siUnit: 'N (newton)' },
      { symbol: '$f_k$', name: 'Gaya gesek kinetik', meaning: 'Gaya hambat kontak sejajar permukaan selama benda meluncur', siUnit: 'N (newton)' },
      { symbol: '$a$', name: 'Percepatan linier', meaning: 'Percepatan benda menuruni bidang miring', siUnit: 'm/s²' },
    ],
    workedExample: {
      title: 'Contoh Konseptual: Memeriksa Syarat Meluncur',
      problem:
        'Jika koefisien gesekan kinetik $\\mu = 0{,}31$ seperti pada Soal Nomor 6, berapa sudut kemiringan minimum agar benda mulai meluncur ke bawah?',
      steps: [
        'Syarat batas luncur: $\\tan\\alpha_{\\min} = \\mu = 0{,}31$.',
        'Ambil invers tangen: $\\alpha_{\\min} = \\arctan(0{,}31) \\approx 17{,}22^\\circ$.',
        'Untuk $\\alpha > 17{,}2^\\circ$, percepatan $a > 0$ sehingga benda meluncur turun.',
      ],
      answer: 'α > 17,2°',
    },
    visualPreset: {
      label: 'Uji Batas Luncur vs Meluncur Cepat (α = 45°, μ = 0,31)',
      angleDeg: 45,
      mu: 0.31,
      baseLength: 2.1,
    },
    narrationScript:
      'Pada Level 2, kita menghubungkan gaya normal dan gaya gesek kinetik ke dalam Hukum Kedua Newton. Gaya gesek kinetik berbanding lurus dengan kosinus alfa. Jadi semakin curam bidang miring, gaya geseknya semakin kecil karena gaya normal berkurang. Syarat mutlak agar benda meluncur adalah tangen alfa lebih besar dari miu.',
  },
  {
    level: 3,
    badge: 'Level 3',
    title: 'Penerapan: Fungsi Waktu Tempuh t(α) & Interpretasi Grafik',
    subtitle: 'Menghubungkan kinematika GLBB dengan geometri alas tetap dan membaca kurva waktu terhadap sudut',
    overview:
      'Sekarang kita menggabungkan jarak tempuh $s(\\alpha)$ dan percepatan $a(\\alpha)$ menjadi satu fungsi waktu $t(\\alpha)$ dan mengamati terjadinya nilai minimum pada kurva.',
    sections: [
      {
        heading: 'Membangun Fungsi Waktu Luncur t(α)',
        body: 'Karena benda mulai meluncur dari keadaan diam ($v_0 = 0$), persamaan posisi GLBB adalah $s = \\frac{1}{2}at^2$. Substitusikan $s = \\ell/\\cos\\alpha$ dan $a = g(\\sin\\alpha - \\mu\\cos\\alpha)$ sehingga diperoleh hubungan eksplisit antara waktu tempuh $t$ dan sudut $\\alpha$.',
        highlightFormula: 't(\\alpha) = \\sqrt{\\frac{2s}{a}} = \\sqrt{\\frac{2\\ell}{g\\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)}}',
      },
      {
        heading: 'Mengapa Ada Waktu Minimum? (Kompetisi Dua Efek)',
        body: 'Perhatikan penyebut fungsi waktu $f(\\alpha) = \\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)$. Saat $\\alpha \\to \\arctan\\mu$ dari kanan, percepatan $a \\to 0$ sehingga $t \\to \\infty$. Sebaliknya saat $\\alpha \\to 90^\\circ$, $\\cos\\alpha \\to 0$ sehingga panjang lintasan $s \\to \\infty$ dan waktu juga meledak menuju $\\infty$. Oleh karena itu pasti terdapat satu lembah minimum di antara $\\arctan\\mu$ dan $90^\\circ$.',
      },
    ],
    variables: [
      { symbol: '$t(\\alpha)$', name: 'Waktu luncur', meaning: 'Durasi gerak benda dari puncak hingga tepat tiba di dasar', siUnit: 's (sekon)' },
      { symbol: '$f(\\alpha)$', name: 'Fungsi penyebut', meaning: 'Besaran tak berdimensi $\\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)$', siUnit: 'tanpa satuan' },
    ],
    workedExample: {
      title: 'Contoh Penerapan: Membandingkan Waktu pada Sudut 45° dan 53°',
      problem:
        'Untuk $\\ell = 2{,}1\\text{ m}$, $\\mu = 0{,}31$, dan $g = 9{,}8\\text{ m/s}^2$, bandingkan waktu luncur pada $\\alpha = 45^\\circ$ dan $\\alpha = 53^\\circ$.',
      steps: [
        'Pada $45^\\circ$: $f(45^\\circ) = \\cos 45^\\circ(\\sin 45^\\circ - 0{,}31\\cos 45^\\circ) = 0{,}5(1 - 0{,}31) = 0{,}3450$.',
        'Waktu pada $45^\\circ$: $t(45^\\circ) = \\sqrt{\\frac{4{,}2}{9{,}8 \\times 0{,}3450}} = 1{,}115\\text{ s}$.',
        'Pada $53^\\circ$ ($\\sin 53^\\circ \\approx 0{,}80; \\cos 53^\\circ \\approx 0{,}60$): $f(53^\\circ) = 0{,}60(0{,}80 - 0{,}31 \\times 0{,}60) = 0{,}3684$.',
        'Waktu pada $53^\\circ$: $t(53^\\circ) = \\sqrt{\\frac{4{,}2}{9{,}8 \\times 0{,}3684}} = 1{,}079\\text{ s}$ — lebih cepat daripada $45^\\circ$!',
      ],
      answer: 't(53°) ≈ 1,08 s < t(45°) ≈ 1,12 s',
    },
    visualPreset: {
      label: 'Perbandingan Sudut 45° vs Optimal 53,6°',
      angleDeg: 53.6,
      mu: 0.31,
      baseLength: 2.1,
      showOptimalOverlay: true,
    },
    narrationScript:
      'Di Level 3, perhatikan mengapa sudut 45 derajat bukan lagi sudut tercepat ketika ada gesekan. Pada 53 derajat, meskipun lintasan lebih panjang daripada pada 45 derajat, pengurangan gaya gesek dan peningkatan komponen gravitasi memberikan percepatan yang jauh lebih besar sehingga waktu totalnya justru lebih singkat.',
  },
  {
    level: 4,
    badge: 'Level 4',
    title: 'Analisis Lanjut: Penurunan Sudut Optimal & Jebakan Umum',
    subtitle: 'Penurunan analitik lengkap dengan kalkulus serta trigonometri, plus analisis simetri dua sudut',
    overview:
      'Di tingkat olimpiade, kita tidak menebak sudut dengan coba-coba. Kita menurunkan rumus eksak sudut optimal $\\alpha_{\\text{opt}}$ baik melalui turunan pertama maupun transformasi sudut ganda.',
    sections: [
      {
        heading: 'Penurunan Eksak α_opt Menggunakan Sudut Ganda',
        body: 'Meminimumkan $t(\\alpha)$ ekuivalen dengan memaksimumkan $f(\\alpha) = \\cos\\alpha\\sin\\alpha - \\mu\\cos^2\\alpha$. Gunakan identitas sudut ganda $\\sin\\alpha\\cos\\alpha = \\frac{1}{2}\\sin(2\\alpha)$ dan $\\cos^2\\alpha = \\frac{1 + \\cos(2\\alpha)}{2}$:',
        highlightFormula: 'f(\\alpha) = \\frac{1}{2}\\sin(2\\alpha) - \\frac{\\mu}{2}\\cos(2\\alpha) - \\frac{\\mu}{2}',
        bulletPoints: [
          'Turunkan terhadap $\\alpha$ dan samakan dengan nol: $f\'(\\alpha) = \\cos(2\\alpha) + \\mu\\sin(2\\alpha) = 0$.',
          'Diperoleh $\\tan(2\\alpha) = -\\frac{1}{\\mu} = \\tan(90^\\circ + \\arctan\\mu)$.',
          'Karena $2\\alpha$ berada pada kuadran II ($90^\\circ < 2\\alpha < 180^\\circ$), maka $2\\alpha = 90^\\circ + \\arctan\\mu$.',
        ],
      },
      {
        heading: 'Rumus Kunci & Kesalahan Umum Siswa',
        body: 'Membagi dua persamaan di atas menghasilkan rumus elegan sudut optimal. Kesalahan paling sering terjadi saat siswa menganggap sudut optimal selalu $45^\\circ$ (hanya benar jika $\\mu = 0$) atau lupa bahwa $2\\alpha$ berada di kuadran II sehingga salah menulis $45^\\circ - \\frac{1}{2}\\arctan\\mu$.',
        highlightFormula: '\\alpha_{\\text{opt}} = 45^\\circ + \\frac{1}{2}\\arctan(\\mu)',
      },
    ],
    variables: [
      { symbol: '$\\phi$', name: 'Sudut gesek', meaning: 'Sudut kritis tempat $\\tan\\phi = \\mu$, disebut sudut gesek', siUnit: 'derajat (°)' },
      { symbol: '$\\alpha_{\\text{opt}}$', name: 'Sudut optimal', meaning: 'Sudut yang menghasilkan waktu tempuh paling singkat', siUnit: 'derajat (°)' },
      { symbol: '$t_{\\min}$', name: 'Waktu minimum', meaning: 'Waktu luncur tersingkat pada kondisi $\\alpha = \\alpha_{\\text{opt}}$', siUnit: 's (sekon)' },
    ],
    workedExample: {
      title: 'Contoh Analisis Lanjut: Soal Asli OSK 2026 Nomor 6',
      problem:
        'Dengan $\\ell = 2{,}1\\text{ m}$ dan $\\mu = 0{,}31$, tentukan sudut optimal $\\alpha_{\\text{opt}}$ dan simetri sudut lain $\\alpha_2$ jika $\\alpha_1 = 38{,}0^\\circ$ memberi waktu tempuh yang sama.',
      steps: [
        'Sudut gesek: $\\phi = \\arctan(0{,}31) \\approx 17{,}223^\\circ$.',
        'Sudut optimal: $\\alpha_{\\text{opt}} = 45^\\circ + \\frac{17{,}223^\\circ}{2} = 53{,}612^\\circ \\approx 53{,}6^\\circ$.',
        'Dari bentuk $f(\\alpha) = \\frac{\\sqrt{1+\\mu^2}}{2}\\sin(2\\alpha - \\phi) - \\frac{\\mu}{2}$, dua sudut memberi waktu sama bila $\\alpha_1 + \\alpha_2 = 90^\\circ + \\phi = 107{,}22^\\circ$.',
      ],
      answer: 'α_opt = 53,6° dan α₂ = 69,2°',
    },
    visualPreset: {
      label: 'Simetri Kurva Waktu t(α) & Sudut Konjugat',
      angleDeg: 53.6,
      mu: 0.31,
      baseLength: 2.1,
      showOptimalOverlay: true,
      showDualAngle: true,
    },
    narrationScript:
      'Pada Level 4, kita menggunakan identitas sudut ganda. Ternyata fungsi penyebutnya berbentuk sinus dua alfa dikurangi sudut gesek fi. Nilai maksimum tercapai tepat ketika dua alfa minus fi sama dengan 90 derajat, menghasilkan rumus kunci alfa optimal sama dengan 45 derajat ditambah setengah arkus tangen miu. Perhatikan juga bahwa nilai el dan g tidak memengaruhi sudut optimal pada bidang miring sederhana.',
  },
  {
    level: 5,
    badge: 'Level 5',
    title: 'Penguasaan Olimpiade: Metode Gravitasi Efektif, Dualitas & Kasus Kompleks',
    subtitle: 'Strategi cepat OSK/OSP: kerangka non-inersia, dualitas kecepatan horizontal, bola menggelinding, dan target miring',
    overview:
      'Level tertinggi ini membekali kamu dengan trik konseptual juara olimpiade agar soal variasi rumit—kereta dipercepat, benda tegar menggelinding, hingga dinding target miring—dapat diselesaikan dalam hitungan baris.',
    sections: [
      {
        heading: '1. Strategi Cepat Tanpa Kalkulus (Metode Gravitasi Efektif & Sudut Gesek)',
        body: 'Jika terdapat gaya tambahan konstan horizontal $F_h = \\kappa mg$ atau kereta dipercepat horizontal $a_k = \\kappa g$, jangan menurunkan ulang turunan dari nol! Cukup gabungkan $\\mu$ dan $\\kappa$ menjadi koefisien gesek efektif $\\mu_{\\text{eff}} = \\tan(\\phi \\pm \\theta_g)$ melalui aturan tangen penjumlahan sudut:',
        highlightFormula: '\\mu_{\\text{eff}} = \\frac{\\mu \\pm \\kappa}{1 \\mp \\mu\\kappa}, \\qquad \\alpha_{\\text{opt}} = 45^\\circ + \\frac{1}{2}\\arctan(\\mu_{\\text{eff}})',
      },
      {
        heading: '2. Identitas Emas & Dualitas Kecepatan Horizontal Maksimum',
        body: 'Pada $\\alpha_{\\text{opt}}$, nilai $\\tan\\alpha_{\\text{opt}}$ memiliki bentuk aljabar bebas fungsi trigonometri: $\\tan\\alpha_{\\text{opt}} = \\mu + \\sqrt{1+\\mu^2}$. Selain itu, karena gerak sepanjang proyeksi horizontal merupakan GLBB dengan percepatan konstan $a_x$, maka $v_x = \\frac{2\\ell}{t}$. Akibatnya, meminimumkan waktu $t$ IDENTIK dengan memaksimumkan kecepatan horizontal di dasar $v_x$!',
        highlightFormula: 't_{\\min} = \\sqrt{\\frac{4\\ell(\\sqrt{1+\\mu^2} + \\mu)}{g}}, \\qquad v_{x,\\max} = \\frac{2\\ell}{t_{\\min}} = \\sqrt{g\\ell(\\sqrt{1+\\mu^2} - \\mu)}',
      },
      {
        heading: '3. Generalisasi Dinding Target Miring & Rezim Benda Menggelinding',
        body: 'Jika target bukan garis vertikal ($\\psi = 90^\\circ$) melainkan dinding miring bersudut $\\psi$, maka $\\alpha_{\\text{opt}} = 90^\\circ - \\frac{\\psi - \\arctan\\mu}{2}$. Sedangkan untuk bola pejal ($I = \\frac{2}{5}mR^2$), kita wajib menguji apakah bola lebih cepat dalam rezim menggelinding murni ($\\tan\\alpha \\le \\frac{7}{2}\\mu$) atau rezim selip ($a = g(\\sin\\alpha - \\mu\\cos\\alpha)$).',
      },
    ],
    variables: [
      { symbol: '$\\vec{g}_{\\text{eff}}$', name: 'Gravitasi efektif', meaning: 'Resultan gravitasi dan percepatan pseudo dalam kerangka dipercepat', siUnit: 'm/s²' },
      { symbol: '$\\mu_{\\text{eff}}$', name: 'Gesek efektif', meaning: 'Parameter gabungan gesekan dan kemiringan gravitasi efektif', siUnit: 'tanpa satuan' },
      { symbol: '$v_{x,\\max}$', name: 'Kelajuan horizontal maksimum', meaning: 'Komponen horizontal kecepatan akhir maksimum untuk alas tetap $\\ell$', siUnit: 'm/s' },
    ],
    workedExample: {
      title: 'Contoh Penguasaan Olimpiade: Menentukan v_x Maksimum Tanpa Menghitung Sudut',
      problem:
        'Sebuah balok meluncur pada bidang miring alas $\\ell = 4{,}5\\text{ m}$ dengan $\\mu = 0{,}75$ dan $g = 9{,}8\\text{ m/s}^2$. Hitung kelajuan horizontal maksimum $v_{x,\\max}$ di dasar!',
      steps: [
        'Hitung faktor akar: $\\sqrt{1 + \\mu^2} = \\sqrt{1 + 0{,}75^2} = 1{,}25$.',
        'Gunakan identitas cepat: $v_{x,\\max} = \\sqrt{g\\ell(\\sqrt{1+\\mu^2} - \\mu)}$.',
        'Substitusi: $v_{x,\\max} = \\sqrt{9{,}8 \\times 4{,}5 \\times (1{,}25 - 0{,}75)} = \\sqrt{22{,}05} \\approx 4{,}7\\text{ m/s}$.',
      ],
      answer: 'v_x,maks = 4,7 m/s',
    },
    visualPreset: {
      label: 'Kerangka Dipercepat (g efektif) & Rezim Optimal',
      angleDeg: 61.6,
      mu: 0.4,
      baseLength: 2.4,
      showOptimalOverlay: true,
      showEffectiveGravity: true,
    },
    narrationScript:
      'Selamat mencapai Level 5 Penguasaan Olimpiade. Di sini kamu menguasai tiga senjata rahasia: pertama, metode gravitasi efektif untuk kerangka dipercepat; kedua, identitas emas dualitas bahwa meminimumkan waktu tempuh sama persis dengan memaksimumkan kecepatan horizontal di dasar; dan ketiga, kehati-hatian memeriksa rezim selip pada benda yang menggelinding. Kamu siap menaklukkan seluruh 15 soal!',
  },
];
