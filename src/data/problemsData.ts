import { solveProblemExact } from '../physics/inclineEngine';

export type StimulusType =
  | 'standard-incline'
  | 'energy-height-base'
  | 'optimal-unknown-angle'
  | 'time-curve-optimal'
  | 'dual-angle-symmetry'
  | 'horizontal-force-wind'
  | 'two-angle-ratio-table'
  | 'accelerating-train-cart'
  | 'rolling-sphere-incline'
  | 'horizontal-exit-vector'
  | 'cart-on-rough-slope'
  | 'tilted-target-wall'
  | 'incline-plus-flat-floor';

export interface FbdForce {
  id: string;
  label: string;
  angleFromHorizontalDeg: number; // 0 = right, 90 = up, -90 = down, 180 = left
  origin: 'cm' | 'contact';
  color: string;
}

export interface SimConfig {
  mode:
    | 'standard'
    | 'compare-optimal'
    | 'dual-race'
    | 'wind-force'
    | 'ratio-compare'
    | 'train-frame'
    | 'sphere-roll-slip'
    | 'cart-rough-slope'
    | 'tilted-wall'
    | 'incline-floor';
  baseLength: number;
  angleDeg: number;
  compareAngleDeg?: number;
  mu: number;
  muSecondary?: number;
  g: number;
  kappa?: number;
  betaDeg?: number;
  psiDeg?: number;
}

export interface PhysicsProblem {
  id: number;
  number: number;
  tier: 1 | 2 | 3 | 4 | 5;
  tierLabel: string;
  title: string;
  contextTag: string;
  theoryLevelRef: 1 | 2 | 3 | 4 | 5;
  questionText: string;
  knownData: Array<{ symbol: string; label: string; value: string; unit: string }>;
  askedQuantity: { symbol: string; label: string; unit: string };
  unit: string;
  exactAnswer: number;
  answerOneDecimal: number;
  hints: [string, string, string];
  stimulus: {
    type: StimulusType;
    caption: string;
    angleDeg?: number;
    angleLabel?: string;
    baseLengthLabel?: string;
    heightLabel?: string;
    muLabel?: string;
    extraLabel?: string;
    muValueForPlot?: number;
    secondaryAngleDeg?: number;
  };
  fbd: {
    relevant: boolean;
    note?: string;
    inclineAngleDeg: number;
    forces: FbdForce[];
  };
  simConfig: SimConfig;
  solution: {
    memahamiPermasalahan: string;
    identifikasiData: string[];
    besaranDitanyakan: string;
    analisisFisika: string;
    fbdPenjelasan: string;
    persamaanDasar: string;
    substitusiAngka: string;
    perhitungan: string;
    hasilAkhir: string;
    interpretasiFisika: string;
    strategiCepatOlimpiade: string;
  };
  narration: {
    soal: string;
    stimulus: string;
    fbd: string;
    pembahasan: string;
  };
}

export const TIER_META: Record<1 | 2 | 3 | 4 | 5, { name: string; range: string; description: string }> = {
  1: {
    name: 'Penguatan Konsep Dasar',
    range: 'Soal 1–3',
    description: 'Penguraian gaya, percepatan luncur, waktu tempuh GLBB, dan usaha gaya gesek pada alas tetap.',
  },
  2: {
    name: 'Penerapan Kompleks',
    range: 'Soal 4–6',
    description: 'Batas gesek statis-kinetis, penentuan sudut tercepat (Soal 6 OSK 2026), dan waktu minimum.',
  },
  3: {
    name: 'Analisis Matematis & Multivariabel',
    range: 'Soal 7–9',
    description: 'Simetri dua sudut waktu sama, pengaruh gaya horizontal luar, dan penentuan koefisien gesek.',
  },
  4: {
    name: 'Penalaran Tingkat Tinggi',
    range: 'Soal 10–12',
    description: 'Kerangka non-inersia kereta dipercepat, transisi bola menggelinding vs selip, dan dualitas kecepatan.',
  },
  5: {
    name: 'Tantangan Olimpiade Kota',
    range: 'Soal 13–15',
    description: 'Gerbong pada lereng kasar, generalisasi dinding miring, dan kombinasi lintasan miring-datar.',
  },
};

function makeStandardFbd(angleDeg: number, extraForces: FbdForce[] = []): FbdForce[] {
  // Block slides down-right along slope angled at angleDeg below +x (horizontal right).
  // Down-slope direction is -angleDeg from +x.
  // Outward normal is (90 - angleDeg) from +x.
  // Up-slope (friction) is (180 - angleDeg) from +x.
  return [
    {
      id: 'W',
      label: 'W = mg',
      angleFromHorizontalDeg: -90,
      origin: 'cm',
      color: '#5B3828',
    },
    {
      id: 'N',
      label: 'N',
      angleFromHorizontalDeg: 90 - angleDeg,
      origin: 'contact',
      color: '#C49A62',
    },
    {
      id: 'fk',
      label: 'f_k = μN',
      angleFromHorizontalDeg: 180 - angleDeg,
      origin: 'contact',
      color: '#B45309',
    },
    ...extraForces,
  ];
}

export const PROBLEMS: PhysicsProblem[] = [
  {
    id: 1,
    number: 1,
    tier: 1,
    tierLabel: 'Tier 1 · Konsep Dasar',
    title: 'Percepatan Benda pada Bidang Miring Kasar',
    contextTag: 'Dinamika Dasar Bidang Miring',
    theoryLevelRef: 2,
    questionText:
      'Sebuah balok kecil $A$ bermassa $m = 2{,}0\\text{ kg}$ dilepas dari keadaan diam di puncak sebuah bidang miring kasar yang memiliki panjang alas $\\ell = 2{,}1\\text{ m}$ dan sudut kemiringan $\\alpha = 37^\\circ$ ($\\sin 37^\\circ = 0{,}60$; $\\cos 37^\\circ = 0{,}80$). Koefisien gesekan kinetik antara balok dan bidang miring adalah $\\mu = 0{,}31$ dan percepatan gravitasi $g = 9{,}8\\text{ m/s}^2$. Tentukan besar percepatan balok saat meluncur menuruni bidang miring (dalam $\\text{m/s}^2$).',
    knownData: [
      { symbol: '$m$', label: 'Massa balok', value: '2,0', unit: 'kg' },
      { symbol: '$\\ell$', label: 'Panjang alas', value: '2,1', unit: 'm' },
      { symbol: '$\\alpha$', label: 'Sudut kemiringan', value: '37', unit: '°' },
      { symbol: '$\\mu$', label: 'Koefisien gesek kinetik', value: '0,31', unit: '-' },
      { symbol: '$g$', label: 'Percepatan gravitasi', value: '9,8', unit: 'm/s²' },
    ],
    askedQuantity: { symbol: '$a$', label: 'Percepatan luncur balok', unit: 'm/s²' },
    unit: 'm/s²',
    exactAnswer: solveProblemExact(1),
    answerOneDecimal: 3.4,
    hints: [
      'Uraikan gaya berat $W = mg$ menjadi komponen sejajar bidang miring ($mg\\sin\\alpha$) dan tegak lurus bidang miring ($mg\\cos\\alpha$).',
      'Gunakan kesetimbangan arah tegak lurus bidang ($\\Sigma F_{y\'} = 0$) untuk memperoleh gaya normal $N$, lalu hitung gaya gesek kinetik $f_k = \\mu N$.',
      'Terapkan Hukum II Newton sepanjang bidang miring: $a = g(\\sin\\alpha - \\mu\\cos\\alpha)$.',
    ],
    stimulus: {
      type: 'standard-incline',
      caption: 'Diagram sistem balok A meluncur pada bidang miring beralas ℓ = 2,1 m dengan sudut α = 37° dan koefisien gesek μ = 0,31.',
      angleDeg: 37,
      angleLabel: '37°',
      baseLengthLabel: 'ℓ = 2,1 m',
      muLabel: 'μ = 0,31',
    },
    fbd: {
      relevant: true,
      inclineAngleDeg: 37,
      forces: makeStandardFbd(37),
    },
    simConfig: {
      mode: 'standard',
      baseLength: 2.1,
      angleDeg: 37,
      mu: 0.31,
      g: 9.8,
    },
    solution: {
      memahamiPermasalahan:
        'Balok kecil $A$ dilepas dari puncak bidang miring bersudut $37^\\circ$ sehingga komponen gaya berat sejajar bidang menariknya ke bawah sambil dilawan oleh gaya gesek kinetik akibat kontak dengan permukaan kasar.',
      identifikasiData: [
        'Massa $m = 2{,}0\\text{ kg}$',
        'Panjang alas $\\ell = 2{,}1\\text{ m}$',
        'Sudut kemiringan $\\alpha = 37^\\circ$ ($\\sin 37^\\circ = 0{,}60$; $\\cos 37^\\circ = 0{,}80$)',
        'Koefisien gesek kinetik $\\mu = 0{,}31$',
        'Percepatan gravitasi $g = 9{,}8\\text{ m/s}^2$',
      ],
      besaranDitanyakan: 'Percepatan linier balok menuruni bidang miring, $a$ (dalam $\\text{m/s}^2$).',
      analisisFisika:
        'Pada sumbu tegak lurus bidang ($y\'$), percepatan nol sehingga gaya normal menyeimbangkan komponen tegak lurus gaya berat. Pada sumbu sejajar bidang ($x\'$), resultan gaya terdiri atas komponen gravitasi ke bawah dikurangi gaya gesek kinetik ke atas.',
      fbdPenjelasan:
        'Gaya berat $W = mg$ bekerja vertikal ke bawah dari pusat massa balok. Gaya normal $N$ bekerja tegak lurus keluar dari bidang kontak. Gaya gesek kinetik $f_k$ bekerja sejajar permukaan mengarah ke atas bidang miring karena balok meluncur ke bawah.',
      persamaanDasar: 'N = mg\\cos\\alpha, \\quad f_k = \\mu N = \\mu mg\\cos\\alpha \\implies a = g(\\sin\\alpha - \\mu\\cos\\alpha)',
      substitusiAngka: 'a = 9{,}8\\,(0{,}60 - 0{,}31 \\times 0{,}80)',
      perhitungan:
        '$$a = 9{,}8\\,(0{,}60 - 0{,}248) = 9{,}8 \\times 0{,}352 = 3{,}4496\\text{ m/s}^2$$',
      hasilAkhir: '3,4 m/s²',
      interpretasiFisika:
        'Karena $\\tan 37^\\circ = 0{,}75 > \\mu = 0{,}31$, balok pasti meluncur turun dengan percepatan konstan $3{,}4\\text{ m/s}^2$. Massa balok $m$ dan panjang alas $\\ell$ tidak memengaruhi nilai percepatan sesaat.',
      strategiCepatOlimpiade:
        'Langsung ingat faktor percepatan tanpa massa: $a = g(\\sin\\alpha - \\mu\\cos\\alpha)$. Untuk $\\alpha = 37^\\circ$, gunakan tripel Pythagoras $(3, 4, 5)$ sehingga $a = 9{,}8(0{,}6 - 0{,}8\\mu)$.',
    },
    narration: {
      soal: 'Soal nomor 1. Sebuah balok kecil A bermassa 2,0 kilogram dilepas dari keadaan diam di puncak bidang miring kasar dengan panjang alas 2,1 meter dan sudut kemiringan 37 derajat. Koefisien gesekan kinetik adalah 0,31 dan percepatan gravitasi 9,8 meter per sekon kuadrat. Tentukan besar percepatan balok saat meluncur menuruni bidang miring.',
      stimulus: 'Perhatikan gambar bidang miring dengan sudut alas 37 derajat dan panjang alas mendatar 2,1 meter. Balok A berada di puncak dan mulai meluncur sepanjang sisi miring.',
      fbd: 'Pada diagram benda bebas, gaya berat mengarah vertikal ke bawah dari pusat massa. Gaya normal mengarah tegak lurus permukaan miring ke atas kanan, sedangkan gaya gesek kinetik sejajar permukaan mengarah ke atas kiri melawan gerak luncur.',
      pembahasan: 'Dari keseimbangan arah tegak lurus bidang, gaya normal sama dengan m g kosinus alfa. Gaya gesek kinetik sama dengan miu dikali gaya normal. Menurut Hukum Kedua Newton sejajar bidang miring, percepatan sama dengan g dikali kurung buka sinus alfa dikurangi miu kosinus alfa kurung tutup. Memasukkan angka menghasilkan 3,4496, yang dibulatkan satu angka desimal menjadi 3,4 meter per sekon kuadrat.',
    },
  },
  {
    id: 2,
    number: 2,
    tier: 1,
    tierLabel: 'Tier 1 · Konsep Dasar',
    title: 'Waktu Luncur Benda pada Bidang Miring Alas Tetap',
    contextTag: 'Kinematika GLBB & Geometri Alas',
    theoryLevelRef: 3,
    questionText:
      'Sebuah benda kecil $A$ mulai meluncur dari keadaan diam dari puncak bidang miring yang panjang alas horizontalnya $\\ell = 2{,}1\\text{ m}$ dan sudut kemiringannya $\\alpha = 53^\\circ$ ($\\sin 53^\\circ = 0{,}80$; $\\cos 53^\\circ = 0{,}60$). Jika koefisien gesekan kinetik $\\mu = 0{,}31$ dan $g = 9{,}8\\text{ m/s}^2$, hitunglah waktu yang diperlukan benda $A$ untuk tiba di dasar bidang miring (dalam sekon).',
    knownData: [
      { symbol: '$\\ell$', label: 'Panjang alas', value: '2,1', unit: 'm' },
      { symbol: '$\\alpha$', label: 'Sudut kemiringan', value: '53', unit: '°' },
      { symbol: '$\\mu$', label: 'Koefisien gesek kinetik', value: '0,31', unit: '-' },
      { symbol: '$v_0$', label: 'Kecepatan awal', value: '0', unit: 'm/s' },
      { symbol: '$g$', label: 'Percepatan gravitasi', value: '9,8', unit: 'm/s²' },
    ],
    askedQuantity: { symbol: '$t$', label: 'Waktu tempuh ke dasar', unit: 's' },
    unit: 's',
    exactAnswer: solveProblemExact(2),
    answerOneDecimal: 1.1,
    hints: [
      'Panjang lintasan miring $s$ bukan $\\ell$, melainkan sisi miring segitiga siku-siku dengan alas $\\ell$.',
      'Tentukan panjang lintasan $s = \\ell / \\cos\\alpha$ dan percepatan $a = g(\\sin\\alpha - \\mu\\cos\\alpha)$.',
      'Gunakan persamaan GLBB dari keadaan diam: $t = \\sqrt{\\frac{2s}{a}} = \\sqrt{\\frac{2\\ell}{g\\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)}}$.',
    ],
    stimulus: {
      type: 'standard-incline',
      caption: 'Bidang miring beralas ℓ = 2,1 m dengan kemiringan lebih curam α = 53° dan gesekan μ = 0,31.',
      angleDeg: 53,
      angleLabel: '53°',
      baseLengthLabel: 'ℓ = 2,1 m',
      muLabel: 'μ = 0,31',
    },
    fbd: {
      relevant: true,
      inclineAngleDeg: 53,
      forces: makeStandardFbd(53),
    },
    simConfig: {
      mode: 'standard',
      baseLength: 2.1,
      angleDeg: 53,
      mu: 0.31,
      g: 9.8,
    },
    solution: {
      memahamiPermasalahan:
        'Benda kecil meluncur dari diam sepanjang sisi miring segitiga bersudut $53^\\circ$ yang panjang alasnya $2{,}1\\text{ m}$. Karena sudut lebih curam daripada $37^\\circ$, lintasan menjadi lebih panjang tetapi percepatannya juga lebih besar.',
      identifikasiData: [
        'Panjang alas $\\ell = 2{,}1\\text{ m}$',
        'Sudut $\\alpha = 53^\\circ$ ($\\sin 53^\\circ = 0{,}80$; $\\cos 53^\\circ = 0{,}60$)',
        'Koefisien gesek $\\mu = 0{,}31$',
        'Percepatan gravitasi $g = 9{,}8\\text{ m/s}^2$',
      ],
      besaranDitanyakan: 'Waktu luncur dari puncak ke dasar bidang miring, $t$ (dalam sekon).',
      analisisFisika:
        'Geometri bidang miring menentukan jarak tempuh $s = \\ell/\\cos\\alpha$, sedangkan dinamika Hukum II Newton menentukan percepatan konstan $a = g(\\sin\\alpha - \\mu\\cos\\alpha)$. Gabungan keduanya dimasukkan ke persamaan kinematika GLBB.',
      fbdPenjelasan:
        'Gaya berat vertikal ke bawah, gaya normal tegak lurus bidang miring, dan gaya gesek kinetik sejajar bidang berarah ke atas. Pada sudut $53^\\circ$, gaya normal mengecil sehingga gaya gesek lebih kecil daripada pada $37^\\circ$.',
      persamaanDasar:
        's = \\frac{\\ell}{\\cos\\alpha}, \\quad a = g(\\sin\\alpha - \\mu\\cos\\alpha), \\quad t = \\sqrt{\\frac{2s}{a}}',
      substitusiAngka:
        's = \\frac{2{,}1}{0{,}60} = 3{,}5\\text{ m}, \\qquad a = 9{,}8\\,(0{,}80 - 0{,}31 \\times 0{,}60)',
      perhitungan:
        '$$a = 9{,}8 \\times 0{,}614 = 6{,}0172\\text{ m/s}^2$$ $$t = \\sqrt{\\frac{2 \\times 3{,}5}{6{,}0172}} = \\sqrt{1{,}16333} = 1{,}0786\\text{ s}$$',
      hasilAkhir: '1,1 s',
      interpretasiFisika:
        'Waktu tempuh $1{,}1\\text{ s}$ pada sudut $53^\\circ$ hampir menyentuh batas waktu paling singkat untuk sistem ini karena $53^\\circ$ sangat dekat dengan sudut optimal $53{,}6^\\circ$.',
      strategiCepatOlimpiade:
        'Langsung hitung faktor penyebut $f(53^\\circ) = 0{,}60(0{,}80 - 0{,}186) = 0{,}3684$, lalu gunakan $t = \\sqrt{2\\ell / (g f)} = \\sqrt{4{,}2 / (9{,}8 \\times 0{,}3684)} \\approx 1{,}08\\text{ s}$.',
    },
    narration: {
      soal: 'Soal nomor 2. Sebuah benda kecil A mulai meluncur dari keadaan diam dari puncak bidang miring yang panjang alas horizontalnya 2,1 meter dan sudut kemiringannya 53 derajat. Jika koefisien gesekan kinetik 0,31 dan g 9,8 meter per sekon kuadrat, hitunglah waktu yang diperlukan benda untuk tiba di dasar bidang miring.',
      stimulus: 'Gambar memperlihatkan bidang miring dengan sudut alas 53 derajat yang cukup curam dan panjang alas mendatar 2,1 meter.',
      fbd: 'Diagram benda bebas terdiri atas gaya berat ke bawah, gaya normal tegak lurus bidang, dan gaya gesek kinetik ke atas sepanjang bidang miring.',
      pembahasan: 'Pertama tentukan panjang sisi miring es sama dengan 2,1 dibagi kosinus 53 derajat yaitu 3,5 meter. Selanjutnya hitung percepatan a sama dengan 6,0172 meter per sekon kuadrat. Dengan persamaan GLBB waktu sama dengan akar dua es per a, diperoleh 1,0786 sekon, dibulatkan menjadi 1,1 sekon.',
    },
  },
  {
    id: 3,
    number: 3,
    tier: 1,
    tierLabel: 'Tier 1 · Konsep Dasar',
    title: 'Kelajuan di Dasar & Invariansi Usaha Gesek pada Alas ℓ',
    contextTag: 'Teorema Usaha-Energi pada Bidang Miring',
    theoryLevelRef: 1,
    questionText:
      'Sebuah benda kecil bermassa $m = 1{,}5\\text{ kg}$ meluncur dari keadaan diam menuruni bidang miring kasar dengan panjang alas $\\ell = 2{,}4\\text{ m}$ dan tinggi puncak $h = 1{,}8\\text{ m}$. Jika koefisien gesekan kinetik adalah $\\mu = 0{,}25$ dan $g = 10\\text{ m/s}^2$, tentukan kelajuan benda tepat saat tiba di dasar bidang miring (dalam $\\text{m/s}$).',
    knownData: [
      { symbol: '$m$', label: 'Massa benda', value: '1,5', unit: 'kg' },
      { symbol: '$\\ell$', label: 'Panjang alas', value: '2,4', unit: 'm' },
      { symbol: '$h$', label: 'Tinggi puncak', value: '1,8', unit: 'm' },
      { symbol: '$\\mu$', label: 'Koefisien gesek kinetik', value: '0,25', unit: '-' },
      { symbol: '$g$', label: 'Percepatan gravitasi', value: '10', unit: 'm/s²' },
    ],
    askedQuantity: { symbol: '$v$', label: 'Kelajuan benda di dasar', unit: 'm/s' },
    unit: 'm/s',
    exactAnswer: solveProblemExact(3),
    answerOneDecimal: 4.9,
    hints: [
      'Gunakan Teorema Usaha-Energi atau hitung terlebih dahulu percepatan $a$ dan panjang sisi miring $s = \\sqrt{\\ell^2 + h^2}$.',
      'Perhatikan bahwa usaha gaya gesek kinetik adalah $W_f = -f_k s = -\\mu mg\\cos\\alpha \\cdot (\\ell/\\cos\\alpha) = -\\mu mg\\ell$.',
      'Dari kekekalan energi mekanik dengan disipasi gesek: $\\frac{1}{2}mv^2 = mgh - \\mu mg\\ell \\Rightarrow v = \\sqrt{2g(h - \\mu\\ell)}$.',
    ],
    stimulus: {
      type: 'energy-height-base',
      caption: 'Bidang miring dengan alas horizontal ℓ = 2,4 m dan tinggi vertikal h = 1,8 m.',
      angleDeg: 36.87,
      angleLabel: 'α',
      baseLengthLabel: 'ℓ = 2,4 m',
      heightLabel: 'h = 1,8 m',
      muLabel: 'μ = 0,25',
    },
    fbd: {
      relevant: true,
      inclineAngleDeg: 36.87,
      forces: makeStandardFbd(36.87),
    },
    simConfig: {
      mode: 'standard',
      baseLength: 2.4,
      angleDeg: 36.87,
      mu: 0.25,
      g: 10,
    },
    solution: {
      memahamiPermasalahan:
        'Benda meluncur dari ketinggian $h = 1{,}8\\text{ m}$ di atas bidang miring beralas $\\ell = 2{,}4\\text{ m}$. Energi potensial gravitasi awal diubah menjadi energi kinetik di dasar dikurangi energi yang hilang akibat usaha gaya gesek.',
      identifikasiData: [
        'Panjang alas $\\ell = 2{,}4\\text{ m}$ dan tinggi $h = 1{,}8\\text{ m}$',
        'Koefisien gesek $\\mu = 0{,}25$',
        'Massa $m = 1{,}5\\text{ kg}$ dan $g = 10\\text{ m/s}^2$',
      ],
      besaranDitanyakan: 'Kelajuan benda tepat di dasar bidang miring, $v$ (dalam $\\text{m/s}$).',
      analisisFisika:
        'Usaha gaya gesek sepanjang bidang miring ternyata hanya bergantung pada panjang alas horizontal $\\ell$ karena $s\\cos\\alpha = \\ell$. Sifat indah ini membuat perhitungan kelajuan akhir sangat sederhana.',
      fbdPenjelasan:
        'Gaya normal $N = mg\\cos\\alpha$ tidak melakukan usaha karena selalu tegak lurus terhadap arah perpindahan. Hanya komponen gaya berat sejajar bidang dan gaya gesek kinetik yang melakukan usaha.',
      persamaanDasar:
        'W_f = -\\mu mg\\cos\\alpha \\cdot \\frac{\\ell}{\\cos\\alpha} = -\\mu mg\\ell, \\qquad \\frac{1}{2}mv^2 = mgh - \\mu mg\\ell',
      substitusiAngka: 'v = \\sqrt{2 \\times 10 \\times (1{,}8 - 0{,}25 \\times 2{,}4)}',
      perhitungan:
        '$$v = \\sqrt{20 \\times (1{,}8 - 0{,}6)} = \\sqrt{20 \\times 1{,}2} = \\sqrt{24} = 4{,}89898\\text{ m/s}$$',
      hasilAkhir: '4,9 m/s',
      interpretasiFisika:
        'Kelajuan akhir di dasar lebih kecil daripada kasus licin ($\\sqrt{2gh} = 6{,}0\\text{ m/s}$) karena sebesar $\\mu mg\\ell$ energi mekanik terdisipasi menjadi kalor. Terlihat jelas mengapa untuk alas $\\ell$ tetap, sudut $\\alpha$ lebih besar membuat $h$ lebih tinggi dan kelajuan di dasar jauh lebih besar.',
      strategiCepatOlimpiade:
        'Ingat prinsip emas OSN: usaha gaya gesek pada sembarang bidang miring datar berkoefisien $\\mu$ hanyalah $-\\mu mg\\ell$ (seakan-akan benda bergeser di lantai datar sepanjang proyeksi alas $\\ell$). Maka $v = \\sqrt{2g(h - \\mu\\ell)}$ langsung tanpa mencari $\\sin\\alpha$ atau $\\cos\\alpha$!',
    },
    narration: {
      soal: 'Soal nomor 3. Sebuah benda kecil bermassa 1,5 kilogram meluncur dari keadaan diam menuruni bidang miring kasar dengan panjang alas 2,4 meter dan tinggi puncak 1,8 meter. Jika koefisien gesekan kinetik 0,25 dan percepatan gravitasi 10 meter per sekon kuadrat, tentukan kelajuan benda tepat saat tiba di dasar.',
      stimulus: 'Diagram menunjukkan segitiga bidang miring dengan alas mendatar 2,4 meter dan tinggi vertikal 1,8 meter.',
      fbd: 'Gaya berat vertikal ke bawah, gaya normal tegak lurus bidang miring, dan gaya gesek kinetik ke atas sepanjang permukaan.',
      pembahasan: 'Trik penting olimpiade: usaha gaya gesek di bidang miring sama dengan minus miu m g dikali panjang alas el, karena faktor kosinus alfa saling meniadakan dengan jarak es sama dengan el per kosinus alfa. Dengan teorema usaha energi, kecepatan akhir sama dengan akar dua g dikali kurung buka h dikurangi miu el kurung tutup, menghasilkan akar 24 atau 4,9 meter per sekon.',
    },
  },
  {
    id: 4,
    number: 4,
    tier: 2,
    tierLabel: 'Tier 2 · Penerapan Kompleks',
    title: 'Batas Gesek Statis Kritis & Kecepatan Luncur pada Alas Tetap',
    contextTag: 'Transisi Gesek Statis ke Kinetik',
    theoryLevelRef: 2,
    questionText:
      'Sebuah balok diletakkan di puncak bidang miring yang memiliki panjang alas tetap $\\ell = 3{,}0\\text{ m}$, koefisien gesek statis $\\mu_s = 0{,}50$, dan koefisien gesek kinetik $\\mu_k = 0{,}30$ ($g = 9{,}8\\text{ m/s}^2$). Sudut kemiringan $\\alpha$ diperbesar perlahan hingga balok tepat mulai meluncur, lalu sudut tersebut dijaga tetap. Tentukan kelajuan balok saat tiba di dasar bidang miring (dalam $\\text{m/s}$).',
    knownData: [
      { symbol: '$\\ell$', label: 'Panjang alas tetap', value: '3,0', unit: 'm' },
      { symbol: '$\\mu_s$', label: 'Koefisien gesek statis', value: '0,50', unit: '-' },
      { symbol: '$\\mu_k$', label: 'Koefisien gesek kinetik', value: '0,30', unit: '-' },
      { symbol: '$g$', label: 'Percepatan gravitasi', value: '9,8', unit: 'm/s²' },
    ],
    askedQuantity: { symbol: '$v$', label: 'Kelajuan di dasar bidang miring', unit: 'm/s' },
    unit: 'm/s',
    exactAnswer: solveProblemExact(4),
    answerOneDecimal: 3.4,
    hints: [
      'Tentukan kondisi sudut saat balok tepat akan bergerak: gaya berat sejajar bidang menyamai gaya gesek statis maksimum.',
      'Dari $mg\\sin\\alpha = \\mu_s mg\\cos\\alpha$, kamu langsung memperoleh $\\tan\\alpha = \\mu_s$, yang menentukan tinggi $h = \\ell\\tan\\alpha$.',
      'Saat meluncur, gesekan berubah menjadi kinetik $\\mu_k$. Gunakan $v = \\sqrt{2g\\ell(\\mu_s - \\mu_k)}$.',
    ],
    stimulus: {
      type: 'standard-incline',
      caption: 'Bidang miring alas tetap ℓ = 3,0 m diangkat hingga sudut kritis α tempat balok tepat mulai meluncur.',
      angleDeg: 26.57,
      angleLabel: 'α_kritis',
      baseLengthLabel: 'ℓ = 3,0 m',
      muLabel: 'μ_s = 0,50 ; μ_k = 0,30',
    },
    fbd: {
      relevant: true,
      inclineAngleDeg: 26.57,
      forces: makeStandardFbd(26.57),
    },
    simConfig: {
      mode: 'standard',
      baseLength: 3.0,
      angleDeg: 26.57,
      mu: 0.3,
      g: 9.8,
    },
    solution: {
      memahamiPermasalahan:
        'Sudut bidang miring dinaikkan perlahan sampai tepat melewati ambang batas gesek statis maksimum. Begitu bergerak, koefisien gesek turun dari $\\mu_s = 0{,}50$ menjadi $\\mu_k = 0{,}30$ sehingga balok mengalami percepatan mendadak menuju dasar.',
      identifikasiData: [
        'Panjang alas $\\ell = 3{,}0\\text{ m}$',
        'Koefisien gesek statis $\\mu_s = 0{,}50$ dan kinetik $\\mu_k = 0{,}30$',
        'Percepatan gravitasi $g = 9{,}8\\text{ m/s}^2$',
      ],
      besaranDitanyakan: 'Kelajuan balok tepat saat tiba di dasar bidang miring, $v$ (dalam $\\text{m/s}$).',
      analisisFisika:
        'Pada saat tepat mulai meluncur, $\\tan\\alpha = \\mu_s$, sehingga ketinggian puncak adalah $h = \\ell\\tan\\alpha = \\mu_s\\ell$. Selama meluncur turun, berlaku gesekan kinetik dengan usaha disipasi sebesar $-\\mu_k mg\\ell$.',
      fbdPenjelasan:
        'Tepat sebelum bergerak, $f_{s,\\text{maks}} = \\mu_s N = mg\\sin\\alpha$. Sesaat setelah meluncur, arah gaya tetap sama tetapi besar gaya gesek turun menjadi $f_k = \\mu_k N < mg\\sin\\alpha$.',
      persamaanDasar:
        '\\tan\\alpha = \\mu_s \\implies h = \\ell\\mu_s, \\qquad \\frac{1}{2}mv^2 = mgh - \\mu_k mg\\ell',
      substitusiAngka: 'v = \\sqrt{2 \\times 9{,}8 \\times 3{,}0 \\times (0{,}50 - 0{,}30)}',
      perhitungan:
        '$$v = \\sqrt{58{,}8 \\times 0{,}20} = \\sqrt{11{,}76} = 3{,}4293\\text{ m/s}$$',
      hasilAkhir: '3,4 m/s',
      interpretasiFisika:
        'Karena $\\mu_s > \\mu_k$, energi potensial awal yang tersedia tepat melebihi disipasi gesek kinetik sebesar $mg\\ell(\\mu_s - \\mu_k)$. Jika $\\mu_s = \\mu_k$, balok hanya akan meluncur dengan kelajuan nol (keseimbangan netral).',
      strategiCepatOlimpiade:
        'Tidak perlu mencari nilai sudut $\\alpha = \\arctan(0{,}50)$ dengan kalkulator! Langsung substitusi $h = \\ell\\mu_s$ ke rumus energi $v = \\sqrt{2g\\ell(\\mu_s - \\mu_k)}$.',
    },
    narration: {
      soal: 'Soal nomor 4. Sebuah balok diletakkan di puncak bidang miring beralas tetap 3,0 meter dengan koefisien gesek statis 0,50 dan kinetik 0,30. Sudut dinaikkan perlahan hingga balok tepat mulai meluncur lalu sudut dijaga tetap. Tentukan kelajuan balok di dasar bidang miring.',
      stimulus: 'Diagram menunjukkan bidang miring pada sudut kritis saat balok tepat terlepas dari cengkeraman gesek statis.',
      fbd: 'Saat meluncur, gaya berat mendorong dengan komponen sinus alfa, sementara gaya gesek kinetik menahan sebesar miu k kali gaya normal.',
      pembahasan: 'Pada sudut kritis tepat mulai bergerak, tangen alfa sama dengan miu statis, sehingga tinggi puncak h sama dengan el dikali miu statis. Menggunakan kekekalan energi dengan usaha gesek minus miu kinetik m g el, diperoleh kelajuan akhir akar dua g el dikali selisih miu statis dan miu kinetik, yaitu 3,4 meter per sekon.',
    },
  },
  {
    id: 5,
    number: 5,
    tier: 2,
    tierLabel: 'Tier 2 · Soal Asli OSK 2026 No. 6',
    title: 'Sudut Optimal Waktu Luncur Paling Singkat (Soal Nomor 6 OSK 2026)',
    contextTag: 'Optimasi Brachistochrone Bidang Miring Kasar',
    theoryLevelRef: 4,
    questionText:
      'Sebuah benda kecil $A$ mulai meluncur ke bawah dari keadaan diam dari puncak sebuah bidang miring yang panjang alasnya $\\ell = 2{,}1\\text{ m}$. Koefisien gesekan kinetik antara benda dan permukaan bidang miring adalah $\\mu = 0{,}31$. Agar benda $A$ dapat meluncur mencapai dasar dengan waktu paling singkat, maka nilai sudut $\\alpha$ nya adalah ... derajat.',
    knownData: [
      { symbol: '$\\ell$', label: 'Panjang alas horizontal', value: '2,1', unit: 'm' },
      { symbol: '$\\mu$', label: 'Koefisien gesek kinetik', value: '0,31', unit: '-' },
      { symbol: '$v_0$', label: 'Kecepatan awal', value: '0', unit: 'm/s' },
    ],
    askedQuantity: { symbol: '$\\alpha$', label: 'Sudut kemiringan optimal', unit: '°' },
    unit: '°',
    exactAnswer: solveProblemExact(5),
    answerOneDecimal: 53.6,
    hints: [
      'Nyatakan waktu tempuh $t$ sebagai fungsi dari $\\alpha$ dengan mengingat bahwa jarak miring $s = \\ell/\\cos\\alpha$ dan percepatan $a = g(\\sin\\alpha - \\mu\\cos\\alpha)$.',
      'Meminimumkan $t(\\alpha)$ berarti memaksimumkan penyebut $f(\\alpha) = \\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)$.',
      'Ubah $f(\\alpha)$ menggunakan identitas sudut ganda $\\sin(2\\alpha)$ dan $\\cos(2\\alpha)$, lalu cari titik stasionernya sehingga $\\tan(2\\alpha) = -\\frac{1}{\\mu}$.',
    ],
    stimulus: {
      type: 'optimal-unknown-angle',
      caption: 'Reproduksi akurat stimulus Soal Nomor 6 OSK Fisika SMA 2026: panjang alas ℓ = 2,1 m, koefisien gesek μ = 0,31, sudut α dicari agar waktu paling singkat.',
      angleDeg: 53.6,
      angleLabel: 'α = ?',
      baseLengthLabel: 'ℓ = 2,1 m',
      muLabel: 'μ = 0,31',
    },
    fbd: {
      relevant: true,
      inclineAngleDeg: 53.6,
      forces: makeStandardFbd(53.6),
    },
    simConfig: {
      mode: 'compare-optimal',
      baseLength: 2.1,
      angleDeg: 53.61,
      compareAngleDeg: 45,
      mu: 0.31,
      g: 9.8,
    },
    solution: {
      memahamiPermasalahan:
        'Ini adalah persoalan inti Soal Nomor 6 OSK 2026. Panjang alas horizontal $\\ell$ tetap, sementara sudut $\\alpha$ dapat diubah-ubah. Jika $\\alpha$ terlalu kecil, percepatan lemah; jika $\\alpha$ terlalu besar mendekati $90^\\circ$, lintasan $s = \\ell/\\cos\\alpha$ menjadi terlalu panjang. Diperlukan sudut optimal $\\alpha$ yang menyeimbangkan keduanya.',
      identifikasiData: [
        'Panjang alas $\\ell = 2{,}1\\text{ m}$',
        'Koefisien gesekan kinetik $\\mu = 0{,}31$',
        'Kondisi awal: dilepas dari diam ($v_0 = 0$)',
      ],
      besaranDitanyakan: 'Sudut kemiringan $\\alpha$ agar waktu luncur paling singkat (dalam derajat).',
      analisisFisika:
        'Dengan panjang lintasan $s = \\ell/\\cos\\alpha$ dan percepatan $a = g(\\sin\\alpha - \\mu\\cos\\alpha)$, waktu luncur $t = \\sqrt{\\frac{2\\ell}{g\\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)}}$. Nilai minimum $t$ tercapai ketika fungsi $f(\\alpha) = \\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)$ mencapai maksimum.',
      fbdPenjelasan:
        'Diagram benda bebas terdiri atas gaya berat $W = mg$ vertikal ke bawah, gaya normal $N = mg\\cos\\alpha$ tegak lurus permukaan, dan gaya gesek kinetik $f_k = \\mu mg\\cos\\alpha$ ke atas sepanjang lintasan.',
      persamaanDasar:
        'f(\\alpha) = \\frac{1}{2}\\sin(2\\alpha) - \\frac{\\mu}{2}(1 + \\cos(2\\alpha)), \\qquad f\'(\\alpha) = \\cos(2\\alpha) + \\mu\\sin(2\\alpha) = 0',
      substitusiAngka:
        '\\tan(2\\alpha) = -\\frac{1}{\\mu} = -\\frac{1}{0{,}31} \\implies 2\\alpha = 90^\\circ + \\arctan(0{,}31)',
      perhitungan:
        '$$\\arctan(0{,}31) \\approx 17{,}2234^\\circ$$ $$\\alpha_{\\text{opt}} = 45^\\circ + \\frac{17{,}2234^\\circ}{2} = 45^\\circ + 8{,}6117^\\circ = 53{,}6117^\\circ$$',
      hasilAkhir: '53,6°',
      interpretasiFisika:
        'Pada kasus licin ($\\mu = 0$), sudut optimal adalah tepat $45^\\circ$. Kehadiran gesekan menggeser sudut optimal menjadi lebih curam ($53{,}6^\\circ$) karena kemiringan lebih besar mengurangi gaya normal sehingga menekan gaya gesek.',
      strategiCepatOlimpiade:
        'Hafalkan hasil fundamental ini: untuk bidang miring beralas tetap $\\ell$ dengan gesekan $\\mu$, $\\alpha_{\\text{opt}} = 45^\\circ + \\frac{1}{2}\\arctan\\mu$. Terlihat bahwa panjang alas $\\ell = 2{,}1\\text{ m}$ dan nilai $g$ tidak memengaruhi sudut optimal!',
    },
    narration: {
      soal: 'Soal nomor 5, merupakan Soal Asli OSK 2026 Nomor 6. Sebuah benda kecil A mulai meluncur ke bawah dari puncak bidang miring yang panjang alasnya 2,1 meter. Koefisien gesekan kinetik adalah 0,31. Agar benda A dapat meluncur dengan waktu paling singkat, berapakah nilai sudut alfa dalam derajat?',
      stimulus: 'Stimulus memperlihatkan segitiga bidang miring beralas 2,1 meter dengan benda A di puncak dan sudut alfa yang harus dioptimalkan.',
      fbd: 'Tiga gaya bekerja pada benda A: gaya berat ke bawah, gaya normal tegak lurus bidang miring, dan gaya gesek kinetik sejajar bidang berarah ke atas.',
      pembahasan: 'Dengan menyatakan waktu luncur sebagai akar dua el per g dikali kosinus alfa kali kurung buka sinus alfa minus miu kosinus alfa kurung tutup, kita memaksimumkan penyebutnya melalui turunan pertama. Diperoleh tangen dua alfa sama dengan minus satu per miu, atau alfa optimal sama dengan 45 derajat ditambah setengah arkus tangen 0,31, yaitu 53,6 derajat.',
    },
  },
  {
    id: 6,
    number: 6,
    tier: 2,
    tierLabel: 'Tier 2 · Penerapan Kompleks',
    title: 'Menentukan Waktu Luncur Minimum Eksak',
    contextTag: 'Evaluasi Nilai Ekstremum Waktu',
    theoryLevelRef: 4,
    questionText:
      'Sebuah benda kecil meluncur dari keadaan diam dari puncak bidang miring berujung alas tetap $\\ell = 4{,}0\\text{ m}$ dengan koefisien gesekan kinetik $\\mu = 0{,}45$ dan percepatan gravitasi $g = 9{,}8\\text{ m/s}^2$. Jika sudut bidang miring diatur tepat pada sudut optimal agar waktu luncur paling singkat, tentukan besar waktu minimum $t_{\\min}$ tersebut (dalam sekon).',
    knownData: [
      { symbol: '$\\ell$', label: 'Panjang alas tetap', value: '4,0', unit: 'm' },
      { symbol: '$\\mu$', label: 'Koefisien gesek kinetik', value: '0,45', unit: '-' },
      { symbol: '$g$', label: 'Percepatan gravitasi', value: '9,8', unit: 'm/s²' },
    ],
    askedQuantity: { symbol: '$t_{\\min}$', label: 'Waktu tempuh paling singkat', unit: 's' },
    unit: 's',
    exactAnswer: solveProblemExact(6),
    answerOneDecimal: 1.6,
    hints: [
      'Cari terlebih dahulu sudut optimal menggunakan $\\alpha_{\\text{opt}} = 45^\\circ + \\frac{1}{2}\\arctan(\\mu)$.',
      'Substitusikan $\\alpha_{\\text{opt}}$ ke rumus waktu luncur $t = \\sqrt{\\frac{2\\ell}{g\\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)}}$.',
      'Secara aljabar, nilai maksimum penyebut adalah $\\frac{1}{2}(\\sqrt{1+\\mu^2} - \\mu)$, sehingga $t_{\\min} = \\sqrt{\\frac{4\\ell(\\sqrt{1+\\mu^2}+\\mu)}{g}}$.',
    ],
    stimulus: {
      type: 'time-curve-optimal',
      caption: 'Kurva hubungan waktu luncur t(α) terhadap sudut α untuk alas ℓ = 4,0 m dan μ = 0,45 yang memperlihatkan titik lembah minimum.',
      angleDeg: 57.11,
      muValueForPlot: 0.45,
      baseLengthLabel: 'ℓ = 4,0 m',
      muLabel: 'μ = 0,45',
    },
    fbd: {
      relevant: true,
      inclineAngleDeg: 57.11,
      forces: makeStandardFbd(57.11),
    },
    simConfig: {
      mode: 'compare-optimal',
      baseLength: 4.0,
      angleDeg: 57.11,
      compareAngleDeg: 45,
      mu: 0.45,
      g: 9.8,
    },
    solution: {
      memahamiPermasalahan:
        'Berbeda dari Soal 5 yang menanyakan sudut optimalnya, di sini kita menghitung berapa nilai waktu minimum aktual yang tercapai saat bidang miring disetel pada $\\alpha_{\\text{opt}}$.',
      identifikasiData: [
        'Panjang alas $\\ell = 4{,}0\\text{ m}$',
        'Koefisien gesek $\\mu = 0{,}45$',
        'Percepatan gravitasi $g = 9{,}8\\text{ m/s}^2$',
      ],
      besaranDitanyakan: 'Waktu tempuh minimum $t_{\\min}$ (dalam sekon).',
      analisisFisika:
        'Pada sudut optimal $2\\alpha_{\\text{opt}} = 90^\\circ + \\phi$ (dengan $\\tan\\phi = \\mu$), diperoleh $\\sin(2\\alpha_{\\text{opt}} - \\phi) = 1$, sehingga nilai maksimum penyebut $f(\\alpha)$ adalah $\\frac{1}{2}(\\sqrt{1+\\mu^2} - \\mu)$.',
      fbdPenjelasan:
        'Gaya berat, normal, dan gesek kinetik bekerja dengan sudut optimal $\\alpha_{\\text{opt}} = 45^\\circ + \\frac{1}{2}\\arctan(0{,}45) \\approx 57{,}11^\\circ$.',
      persamaanDasar:
        'f_{\\max} = \\frac{1}{2}\\left(\\sqrt{1+\\mu^2} - \\mu\\right), \\qquad t_{\\min} = \\sqrt{\\frac{4\\ell}{g(\\sqrt{1+\\mu^2} - \\mu)}} = \\sqrt{\\frac{4\\ell(\\sqrt{1+\\mu^2} + \\mu)}{g}}',
      substitusiAngka:
        '\\sqrt{1 + 0{,}45^2} = \\sqrt{1{,}2025} \\approx 1{,}09659, \\qquad t_{\\min} = \\sqrt{\\frac{4 \\times 4{,}0 \\times (1{,}09659 + 0{,}45)}{9{,}8}}',
      perhitungan:
        '$$t_{\\min} = \\sqrt{\\frac{16 \\times 1{,}54659}{9{,}8}} = \\sqrt{2{,}52504} = 1{,}5890\\text{ s}$$',
      hasilAkhir: '1,6 s',
      interpretasiFisika:
        'Jika permukaan licin ($\\mu = 0$), waktu minimumnya adalah $\\sqrt{4\\ell/g} = 1{,}28\\text{ s}$. Adanya gesekan $\\mu = 0{,}45$ memperpanjang waktu minimum menjadi $1{,}6\\text{ s}$.',
      strategiCepatOlimpiade:
        'Gunakan bentuk rasional $t_{\\min} = \\sqrt{\\frac{4\\ell(\\sqrt{1+\\mu^2}+\\mu)}{g}}$ agar terhindar dari kesalahan pembulatan nilai $\\alpha_{\\text{opt}}$ di tengah perhitungan!',
    },
    narration: {
      soal: 'Soal nomor 6. Sebuah benda kecil meluncur dari diam pada bidang miring beralas tetap 4,0 meter dengan koefisien gesekan 0,45 dan g 9,8 meter per sekon kuadrat. Jika sudut diatur optimal, tentukan waktu minimum yang dicapai.',
      stimulus: 'Grafik memperlihatkan kurva waktu luncur t sebagai fungsi sudut alfa yang memiliki satu titik lembah minimum.',
      fbd: 'Pada sudut optimal sekitar 57,1 derajat, komponen gaya gravitasi sejajar bidang mendominasi gaya gesek.',
      pembahasan: 'Nilai maksimum fungsi penyebut sama dengan setengah kali kurung buka akar satu tambah miu kuadrat dikurangi miu. Dengan merasionalkan penyebut, waktu minimum sama dengan akar empat el kali akar satu tambah miu kuadrat ditambah miu, dibagi g. Hasilnya adalah 1,589 sekon atau 1,6 sekon.',
    },
  },
  {
    id: 7,
    number: 7,
    tier: 3,
    tierLabel: 'Tier 3 · Analisis Matematis',
    title: 'Simetri Dua Sudut dengan Waktu Luncur Identik',
    contextTag: 'Simetri Fungsi Trigonometri t(α)',
    theoryLevelRef: 4,
    questionText:
      'Pada sebuah bidang miring dengan panjang alas tetap $\\ell = 2{,}1\\text{ m}$ dan koefisien gesekan kinetik $\\mu = 0{,}31$, sebuah benda kecil dilepas dari puncak tanpa kecepatan awal. Terdapat dua sudut kemiringan berbeda $\\alpha_1$ dan $\\alpha_2$ yang menghasilkan **waktu luncur yang tepat sama**. Jika salah satu sudut adalah $\\alpha_1 = 38{,}0^\\circ$, tentukan besar sudut kedua $\\alpha_2$ (dalam derajat).',
    knownData: [
      { symbol: '$\\ell$', label: 'Panjang alas tetap', value: '2,1', unit: 'm' },
      { symbol: '$\\mu$', label: 'Koefisien gesek kinetik', value: '0,31', unit: '-' },
      { symbol: '$\\alpha_1$', label: 'Sudut pertama', value: '38,0', unit: '°' },
    ],
    askedQuantity: { symbol: '$\\alpha_2$', label: 'Sudut konjugat waktu sama', unit: '°' },
    unit: '°',
    exactAnswer: solveProblemExact(7),
    answerOneDecimal: 69.2,
    hints: [
      'Dua sudut memiliki waktu luncur sama jika dan hanya jika nilai $f(\\alpha) = \\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)$ sama.',
      'Nyatakan $\\mu = \\tan\\phi$ (sudut gesek), lalu gabungkan fungsi penyebut menjadi satu suku sinus: $f(\\alpha) = \\frac{\\sqrt{1+\\mu^2}}{2}\\sin(2\\alpha - \\phi) - \\frac{\\mu}{2}$.',
      'Ingat sifat $\\sin(\\theta_1) = \\sin(\\theta_2) \\implies \\theta_1 + \\theta_2 = 180^\\circ$, sehingga $\\alpha_1 + \\alpha_2 = 90^\\circ + \\phi = 2\\alpha_{\\text{opt}}$.',
    ],
    stimulus: {
      type: 'dual-angle-symmetry',
      caption: 'Dua lintasan bersudut berbeda α₁ = 38,0° dan α₂ pada alas tetap ℓ yang menghasilkan waktu tempuh identik.',
      angleDeg: 38,
      secondaryAngleDeg: 69.22,
      muValueForPlot: 0.31,
      baseLengthLabel: 'ℓ = 2,1 m',
      muLabel: 'μ = 0,31',
    },
    fbd: {
      relevant: false,
      note: 'Soal ini menganalisis simetri geometris dan matematis kurva fungsi waktu tempuh t(α) di sekitar titik minimum α_opt.',
      inclineAngleDeg: 38,
      forces: [],
    },
    simConfig: {
      mode: 'dual-race',
      baseLength: 2.1,
      angleDeg: 38,
      compareAngleDeg: 69.2234,
      mu: 0.31,
      g: 9.8,
    },
    solution: {
      memahamiPermasalahan:
        'Karena kurva $t(\\alpha)$ berbentuk menyerupai huruf U dengan satu minimum di $\\alpha_{\\text{opt}}$, garis horizontal $t = t_0 > t_{\\min}$ akan memotong kurva di dua sudut berbeda: satu sudut landai $\\alpha_1 < \\alpha_{\\text{opt}}$ dan satu sudut curam $\\alpha_2 > \\alpha_{\\text{opt}}$.',
      identifikasiData: [
        'Koefisien gesek $\\mu = 0{,}31$',
        'Sudut pertama $\\alpha_1 = 38{,}0^\\circ$',
        'Syarat: $t(\\alpha_1) = t(\\alpha_2)$ dengan $\\alpha_1 \\neq \\alpha_2$',
      ],
      besaranDitanyakan: 'Sudut kedua $\\alpha_2$ (dalam derajat).',
      analisisFisika:
        'Substitusikan $\\mu = \\tan\\phi = \\frac{\\sin\\phi}{\\cos\\phi}$ ke dalam $f(\\alpha) = \\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)$ untuk mengungkap simetri cermin terhadap $\\alpha_{\\text{opt}}$.',
      fbdPenjelasan:
        'Pada $\\alpha_1 = 38{,}0^\\circ$, lintasan lebih pendek tetapi percepatan lebih kecil. Pada $\\alpha_2 = 69{,}2^\\circ$, lintasan jauh lebih panjang namun percepatan jauh lebih besar—kedua efek tepat seimbang.',
      persamaanDasar:
        'f(\\alpha) = \\frac{1}{2\\cos\\phi}\\sin(2\\alpha - \\phi) - \\frac{\\mu}{2}, \\qquad (2\\alpha_1 - \\phi) + (2\\alpha_2 - \\phi) = 180^\\circ',
      substitusiAngka:
        '\\phi = \\arctan(0{,}31) \\approx 17{,}2234^\\circ, \\qquad \\alpha_1 + \\alpha_2 = 90^\\circ + \\phi',
      perhitungan:
        '$$\\alpha_2 = 90^\\circ + 17{,}2234^\\circ - 38{,}0^\\circ = 69{,}2234^\\circ$$',
      hasilAkhir: '69,2°',
      interpretasiFisika:
        'Perhatikan bahwa $\\frac{\\alpha_1 + \\alpha_2}{2} = 53{,}61^\\circ = \\alpha_{\\text{opt}}$! Artinya kurva $f(\\alpha)$ simetris sempurna terhadap $\\alpha_{\\text{opt}}$. Pada kasus tanpa gesekan ($\\phi = 0$), dua sudut komplementer ($\\alpha_1 + \\alpha_2 = 90^\\circ$) selalu memberi waktu sama.',
      strategiCepatOlimpiade:
        'Cukup ingat bahwa $\\alpha_1 + \\alpha_2 = 2\\alpha_{\\text{opt}} = 90^\\circ + \\arctan\\mu$. Jadi $\\alpha_2 = 2(53{,}6117^\\circ) - 38{,}0^\\circ = 69{,}2^\\circ$ dalam satu baris!',
    },
    narration: {
      soal: 'Soal nomor 7. Pada bidang miring dengan alas tetap 2,1 meter dan koefisien gesekan 0,31, terdapat dua sudut kemiringan berbeda yang menghasilkan waktu luncur tepat sama. Jika sudut pertama 38,0 derajat, tentukan sudut kedua dalam derajat.',
      stimulus: 'Ilustrasi menampilkan dua bidang miring dengan alas yang sama namun sudut berbeda serta kurva t terhadap alfa yang simetris terhadap sudut optimal.',
      fbd: 'Soal ini berfokus pada analisis fungsi trigonometri penyebut waktu tempuh terhadap sudut alfa.',
      pembahasan: 'Dengan menulis koefisien gesek miu sama dengan tangen sudut fi, fungsi penyebut berubah menjadi sinus dua alfa minus fi. Dua sudut memiliki nilai sinus yang sama apabila jumlah kedua argumennya 180 derajat. Akibatnya alfa satu ditambah alfa dua sama dengan 90 derajat ditambah fi, yaitu dua kali sudut optimal. Maka alfa dua sama dengan 107,22 dikurangi 38,0, yaitu 69,2 derajat.',
    },
  },
  {
    id: 8,
    number: 8,
    tier: 3,
    tierLabel: 'Tier 3 · Analisis Matematis',
    title: 'Bidang Miring dengan Gaya Horizontal Pendorong Konstan',
    contextTag: 'Optimasi dengan Gaya Luar Horizontal',
    theoryLevelRef: 5,
    questionText:
      'Sebuah benda kecil bermassa $m$ meluncur dari keadaan diam dari puncak bidang miring berujung alas tetap $\\ell = 2{,}5\\text{ m}$ dan koefisien gesekan kinetik $\\mu = 0{,}50$. Selama meluncur, benda mengalami tiupan angin pendorong konstan dalam arah horizontal ke kanan (searah komponen horizontal gerak luncur) dengan gaya $F_w = 0{,}20\\,mg$. Tentukan sudut kemiringan $\\alpha$ agar benda mencapai dasar bidang miring dalam waktu paling singkat (dalam derajat).',
    knownData: [
      { symbol: '$\\ell$', label: 'Panjang alas tetap', value: '2,5', unit: 'm' },
      { symbol: '$\\mu$', label: 'Koefisien gesek kinetik', value: '0,50', unit: '-' },
      { symbol: '$F_w$', label: 'Gaya angin horizontal', value: '0,20 mg', unit: 'N' },
    ],
    askedQuantity: { symbol: '$\\alpha$', label: 'Sudut kemiringan optimal', unit: '°' },
    unit: '°',
    exactAnswer: solveProblemExact(8),
    answerOneDecimal: 52.6,
    hints: [
      'Uraikan gaya angin horizontal $F_w = 0{,}20\\,mg$ ke sumbu sejajar bidang ($+F_w\\cos\\alpha$) dan tegak lurus bidang ($+F_w\\sin\\alpha$ mengarah keluar permukaan!).',
      'Karena komponen angin mengurangi gaya tekan ke bidang, gaya normal berkurang menjadi $N = mg(\\cos\\alpha - 0{,}20\\sin\\alpha)$.',
      'Kelompokkan suku $\\sin\\alpha$ dan $\\cos\\alpha$ pada percepatan $a$ sehingga berbentuk $g(1+\\mu\\kappa)(\\sin\\alpha - \\mu_{\\text{eff}}\\cos\\alpha)$ dengan $\\mu_{\\text{eff}} = \\frac{\\mu - \\kappa}{1 + \\mu\\kappa}$.',
    ],
    stimulus: {
      type: 'horizontal-force-wind',
      caption: 'Benda meluncur pada bidang miring beralas ℓ sambil didorong gaya angin horizontal konstan F_w = 0,20 mg ke kanan.',
      angleDeg: 52.63,
      angleLabel: 'α = ?',
      baseLengthLabel: 'ℓ = 2,5 m',
      muLabel: 'μ = 0,50',
      extraLabel: 'F_w = 0,20 mg →',
    },
    fbd: {
      relevant: true,
      inclineAngleDeg: 52.63,
      forces: makeStandardFbd(52.63, [
        {
          id: 'Fw',
          label: 'F_w = 0,20mg',
          angleFromHorizontalDeg: 0,
          origin: 'cm',
          color: '#0284C7',
        },
      ]),
    },
    simConfig: {
      mode: 'wind-force',
      baseLength: 2.5,
      angleDeg: 52.63,
      mu: 0.5,
      g: 9.8,
      kappa: 0.2,
    },
    solution: {
      memahamiPermasalahan:
        'Selain gravitasi dan gesekan, terdapat gaya horizontal konstan ke kanan $F_w = \\kappa mg$ ($\\kappa = 0{,}20$). Gaya ini bukan hanya mendorong benda maju sepanjang bidang miring, tetapi juga mengangkat benda sedikit menjauh dari permukaan sehingga mengurangi gaya normal dan gesekan.',
      identifikasiData: [
        'Panjang alas $\\ell = 2{,}5\\text{ m}$',
        'Koefisien gesek $\\mu = 0{,}50$',
        'Rasio gaya horizontal $\\kappa = F_w/(mg) = 0{,}20$',
      ],
      besaranDitanyakan: 'Sudut kemiringan optimal $\\alpha$ agar waktu luncur tersingkat (dalam derajat).',
      analisisFisika:
        'Proyeksi $F_w$ ke sumbu $x\'$ adalah $+\\kappa mg\\cos\\alpha$, sedangkan ke sumbu $y\'$ (keluar bidang) adalah $+\\kappa mg\\sin\\alpha$. Oleh sebab itu $N = mg(\\cos\\alpha - \\kappa\\sin\\alpha)$.',
      fbdPenjelasan:
        'Empat gaya bekerja pada benda: berat $W$ ke bawah, angin $F_w$ mendatar ke kanan, normal $N$ tegak lurus keluar bidang, dan gesek kinetik $f_k$ ke atas sepanjang bidang.',
      persamaanDasar:
        'a = g\\left[(1 + \\mu\\kappa)\\sin\\alpha - (\\mu - \\kappa)\\cos\\alpha\\right] = g(1+\\mu\\kappa)\\left(\\sin\\alpha - \\mu_{\\text{eff}}\\cos\\alpha\\right)',
      substitusiAngka:
        '\\mu_{\\text{eff}} = \\frac{\\mu - \\kappa}{1 + \\mu\\kappa} = \\frac{0{,}50 - 0{,}20}{1 + 0{,}50 \\times 0{,}20} = \\frac{0{,}30}{1{,}10} = \\frac{3}{11}',
      perhitungan:
        '$$\\alpha_{\\text{opt}} = 45^\\circ + \\frac{1}{2}\\arctan\\left(\\frac{3}{11}\\right) = 45^\\circ + \\frac{15{,}2551^\\circ}{2} = 52{,}6276^\\circ$$',
      hasilAkhir: '52,6°',
      interpretasiFisika:
        'Angin pendorong dari belakang menurunkan koefisien gesek efektif dari $0{,}50$ menjadi $0{,}273$, sehingga sudut optimalnya turun mendekati $45^\\circ$ menjadi $52{,}6^\\circ$. Periksa syarat kontak: $\\tan 52{,}6^\\circ = 1{,}31 < 1/0{,}20 = 5$, jadi benda tetap menempel pada bidang.',
      strategiCepatOlimpiade:
        'Gaya horizontal $F_w = \\kappa mg$ + gravitasi $mg$ ekivalen dengan memiringkan medan gravitasi sebesar $\\theta_g = \\arctan\\kappa$ ke depan. Karena itu $\\alpha_{\\text{opt}} = 45^\\circ + \\frac{\\phi - \\theta_g}{2}$, di mana $\\phi = \\arctan\\mu$!',
    },
    narration: {
      soal: 'Soal nomor 8. Sebuah benda kecil meluncur dari puncak bidang miring beralas 2,5 meter dengan koefisien gesek 0,50 sambil didorong angin horizontal ke kanan sebesar 0,20 kali beratnya. Tentukan sudut kemiringan agar waktu luncur paling singkat.',
      stimulus: 'Diagram menampilkan bidang miring dengan vektor gaya angin horizontal konstan F w ke kanan mendorong balok.',
      fbd: 'Selain berat, normal, dan gesek, terdapat gaya angin mendatar ke kanan. Komponen gaya angin mengurangi gaya normal karena ikut mengangkat balok dari bidang.',
      pembahasan: 'Dengan memproyeksikan gaya angin ke arah sejajar dan tegak lurus bidang miring, percepatan dapat difaktorkan menjadi bentuk standar Soal 6 dengan koefisien gesek efektif sama dengan miu minus kapa dibagi satu tambah miu kapa, bernilai tiga per sebelas. Maka sudut optimal sama dengan 45 derajat ditambah setengah arkus tangen tiga per sebelas, hasilnya 52,6 derajat.',
    },
  },
  {
    id: 9,
    number: 9,
    tier: 3,
    tierLabel: 'Tier 3 · Analisis Matematis',
    title: 'Menentukan Koefisien Gesek dari Rasio Waktu Dua Sudut',
    contextTag: 'Masalah Invers Dinamika Bidang Miring',
    theoryLevelRef: 3,
    questionText:
      'Sebuah benda kecil meluncur dari keadaan diam dari puncak bidang miring dengan panjang alas tetap $\\ell$. Pada percobaan pertama dengan sudut kemiringan $\\alpha_1 = 37^\\circ$ ($\\sin 37^\\circ = 0{,}60$; $\\cos 37^\\circ = 0{,}80$), waktu luncurnya adalah $t_1$. Pada percobaan kedua dengan sudut $\\alpha_2 = 53^\\circ$ ($\\sin 53^\\circ = 0{,}80$; $\\cos 53^\\circ = 0{,}60$), waktu luncurnya menjadi $t_2$. Jika perbandingan kuadrat waktunya adalah $\\left(\\frac{t_1}{t_2}\\right)^2 = 1{,}50$, tentukan koefisien gesekan kinetik $\\mu$ permukaan bidang miring tersebut.',
    knownData: [
      { symbol: '$\\alpha_1$', label: 'Sudut percobaan 1', value: '37', unit: '°' },
      { symbol: '$\\alpha_2$', label: 'Sudut percobaan 2', value: '53', unit: '°' },
      { symbol: '$(t_1/t_2)^2$', label: 'Rasio kuadrat waktu', value: '1,50', unit: '-' },
    ],
    askedQuantity: { symbol: '$\\mu$', label: 'Koefisien gesek kinetik', unit: 'tanpa satuan' },
    unit: '-',
    exactAnswer: solveProblemExact(9),
    answerOneDecimal: 0.4,
    hints: [
      'Gunakan rumus waktu tempuh $t(\\alpha) = \\sqrt{\\frac{2\\ell}{g\\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)}}$ untuk kedua sudut.',
      'Saat mengambil rasio $(t_1 / t_2)^2$, besaran $\\ell$ dan $g$ saling meniadakan sehingga tersisa $\\frac{f(\\alpha_2)}{f(\\alpha_1)} = 1{,}50$.',
      'Substitusikan nilai $\\sin$ dan $\\cos$ untuk $37^\\circ$ dan $53^\\circ$, lalu selesaikan persamaan linear untuk $\\mu$.',
    ],
    stimulus: {
      type: 'two-angle-ratio-table',
      caption: 'Perbandingan geometri dua percobaan pada alas tetap ℓ dengan sudut α₁ = 37° dan α₂ = 53°.',
      angleDeg: 37,
      secondaryAngleDeg: 53,
      baseLengthLabel: 'ℓ tetap',
      extraLabel: '(t₁ / t₂)² = 1,50',
    },
    fbd: {
      relevant: true,
      inclineAngleDeg: 37,
      forces: makeStandardFbd(37),
    },
    simConfig: {
      mode: 'ratio-compare',
      baseLength: 2.5,
      angleDeg: 37,
      compareAngleDeg: 53,
      mu: 0.4,
      g: 9.8,
    },
    solution: {
      memahamiPermasalahan:
        'Ini adalah masalah invers: alih-alih mencari waktu atau sudut dari $\\mu$ yang diketahui, kita menentukan parameter permukaan $\\mu$ hanya dari perbandingan waktu tempuh pada dua sudut berbeda dengan alas yang sama.',
      identifikasiData: [
        '$\\alpha_1 = 37^\\circ \\implies \\sin\\alpha_1 = 0{,}60, \\; \\cos\\alpha_1 = 0{,}80$',
        '$\\alpha_2 = 53^\\circ \\implies \\sin\\alpha_2 = 0{,}80, \\; \\cos\\alpha_2 = 0{,}60$',
        'Rasio kuadrat waktu: $(t_1/t_2)^2 = 1{,}50$',
      ],
      besaranDitanyakan: 'Koefisien gesekan kinetik $\\mu$ (tak bersatuan).',
      analisisFisika:
        'Karena $\\ell$ dan $g$ identik pada kedua percobaan, rasio kuadrat waktu berbanding terbalik terhadap rasio fungsi penyebut $f(\\alpha) = \\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)$.',
      fbdPenjelasan:
        'Pada $\\alpha_1 = 37^\\circ$, komponen normal lebih besar sehingga gesekan lebih menghambat gerak daripada saat sudut $53^\\circ$.',
      persamaanDasar:
        '\\left(\\frac{t_1}{t_2}\\right)^2 = \\frac{\\cos\\alpha_2(\\sin\\alpha_2 - \\mu\\cos\\alpha_2)}{\\cos\\alpha_1(\\sin\\alpha_1 - \\mu\\cos\\alpha_1)}',
      substitusiAngka:
        '1{,}50 = \\frac{0{,}60(0{,}80 - 0{,}60\\mu)}{0{,}80(0{,}60 - 0{,}80\\mu)} = \\frac{0{,}48 - 0{,}36\\mu}{0{,}48 - 0{,}64\\mu}',
      perhitungan:
        '$$1{,}50(0{,}48 - 0{,}64\\mu) = 0{,}48 - 0{,}36\\mu$$ $$0{,}72 - 0{,}96\\mu = 0{,}48 - 0{,}36\\mu$$ $$0{,}24 = 0{,}60\\mu \\implies \\mu = 0{,}40$$',
      hasilAkhir: '0,4',
      interpretasiFisika:
        'Perhatikan keunikan pasangan $37^\\circ$ dan $53^\\circ$: tanpa gesekan ($\\mu = 0$), $\\sin 37^\\circ\\cos 37^\\circ = \\sin 53^\\circ\\cos 53^\\circ = 0{,}48$, sehingga $t_1 = t_2$. Perbedaan waktu antara dua sudut komplementer murni disebabkan oleh gaya gesek!',
      strategiCepatOlimpiade:
        'Langsung tulis $\\frac{0{,}48 - 0{,}36\\mu}{0{,}48 - 0{,}64\\mu} = \\frac{3}{2}$, bagi pembilang dan penyebut dengan $0{,}04$: $\\frac{12 - 9\\mu}{12 - 16\\mu} = \\frac{3}{2} \\implies 24 - 18\\mu = 36 - 48\\mu \\implies 30\\mu = 12 \\implies \\mu = 0{,}4$.',
    },
    narration: {
      soal: 'Soal nomor 9. Sebuah benda meluncur dari diam di puncak bidang miring beralas tetap. Saat sudut 37 derajat waktu luncurnya t satu, dan saat sudut 53 derajat waktu luncurnya t dua. Jika kuadrat perbandingan t satu per t dua sama dengan 1,50, tentukan koefisien gesekan kinetik miu.',
      stimulus: 'Stimulus membandingkan dua lintasan pada alas yang sama: 37 derajat lebih landai dengan waktu t satu, dan 53 derajat lebih curam dengan waktu t dua.',
      fbd: 'Pada sudut 37 derajat gaya normal lebih besar dibandingkan pada sudut 53 derajat.',
      pembahasan: 'Karena panjang alas dan gravitasi sama, perbandingan kuadrat waktu sama dengan rasio terbalik fungsi penyebut. Untuk 37 dan 53 derajat, suku sinus kali kosinus sama-sama 0,48, sehingga perbedaan waktu murni berasal dari suku miu kosinus kuadrat. Menyelesaikan persamaan aljabar sederhana menghasilkan miu tepat sama dengan 0,4.',
    },
  },
  {
    id: 10,
    number: 10,
    tier: 4,
    tierLabel: 'Tier 4 · Penalaran Tinggi',
    title: 'Bidang Miring di Dalam Kereta yang Dipercepat Horizontal',
    contextTag: 'Kerangka Non-Inersia & Gravitasi Efektif',
    theoryLevelRef: 5,
    questionText:
      'Sebuah bidang miring dengan panjang alas $\\ell = 2{,}4\\text{ m}$ dan koefisien gesekan kinetik $\\mu = 0{,}40$ diletakkan di lantai sebuah gerbong kereta yang bergerak ke arah kanan (searah alas menuruni bidang miring) dengan percepatan konstan $a_k = 0{,}20\\,g$. Benda kecil $A$ dilepas dari keadaan diam relatif terhadap kereta dari puncak bidang miring. Tentukan sudut kemiringan $\\alpha$ agar benda $A$ mencapai dasar bidang miring dalam waktu paling singkat relatif terhadap kereta (dalam derajat).',
    knownData: [
      { symbol: '$\\ell$', label: 'Panjang alas bidang miring', value: '2,4', unit: 'm' },
      { symbol: '$\\mu$', label: 'Koefisien gesek kinetik', value: '0,40', unit: '-' },
      { symbol: '$a_k$', label: 'Percepatan kereta ke kanan', value: '0,20 g', unit: 'm/s²' },
    ],
    askedQuantity: { symbol: '$\\alpha$', label: 'Sudut kemiringan optimal', unit: '°' },
    unit: '°',
    exactAnswer: solveProblemExact(10),
    answerOneDecimal: 61.6,
    hints: [
      'Tinjau gerak dalam kerangka acuan kereta yang dipercepat ke kanan: bekerja gaya fiktif (pseudo) $F_{\\text{ps}} = ma_k$ berarah ke KIRI pada benda.',
      'Gaya fiktif ke kiri memperbesar gaya normal menjadi $N = mg(\\cos\\alpha + 0{,}20\\sin\\alpha)$ dan menghambat gerak turun.',
      'Gunakan faktor gesek efektif $\\mu_{\\text{eff}} = \\frac{\\mu + \\kappa}{1 - \\mu\\kappa}$ dengan $\\kappa = a_k/g = 0{,}20$, lalu hitung $\\alpha_{\\text{opt}} = 45^\\circ + \\frac{1}{2}\\arctan(\\mu_{\\text{eff}})$.',
    ],
    stimulus: {
      type: 'accelerating-train-cart',
      caption: 'Bidang miring berada di dalam gerbong kereta yang dipercepat ke kanan sebesar a_k = 0,20 g.',
      angleDeg: 61.56,
      angleLabel: 'α = ?',
      baseLengthLabel: 'ℓ = 2,4 m',
      muLabel: 'μ = 0,40',
      extraLabel: 'a_kereta = 0,20 g →',
    },
    fbd: {
      relevant: true,
      inclineAngleDeg: 61.56,
      forces: makeStandardFbd(61.56, [
        {
          id: 'Fps',
          label: 'F_ps = ma_k',
          angleFromHorizontalDeg: 180,
          origin: 'cm',
          color: '#7C2D12',
        },
      ]),
    },
    simConfig: {
      mode: 'train-frame',
      baseLength: 2.4,
      angleDeg: 61.56,
      mu: 0.4,
      g: 9.8,
      kappa: 0.2,
    },
    solution: {
      memahamiPermasalahan:
        'Kereta dipercepat ke kanan sehingga pengamat di dalam kereta merasakan gaya fiktif berarah ke kiri sebesar $ma_k = 0{,}20\\,mg$. Gaya fiktif ini menekan balok ke permukaan bidang miring sekaligus melawan komponen gerak meluncur ke kanan.',
      identifikasiData: [
        'Panjang alas $\\ell = 2{,}4\\text{ m}$',
        'Koefisien gesek $\\mu = 0{,}40$',
        'Rasio percepatan kereta $\\kappa = a_k/g = 0{,}20$',
      ],
      besaranDitanyakan: 'Sudut optimal $\\alpha$ dalam kerangka kereta (dalam derajat).',
      analisisFisika:
        'Dalam kerangka kereta, komponen sejajar bidang dari gravitasi dan gaya fiktif adalah $mg(\\sin\\alpha - \\kappa\\cos\\alpha)$, sedangkan gaya normal menjadi $N = mg(\\cos\\alpha + \\kappa\\sin\\alpha)$.',
      fbdPenjelasan:
        'Dalam kerangka non-inersia kereta: gaya berat ke bawah, gaya fiktif $ma_k$ mendatar ke kiri, gaya normal tegak lurus keluar bidang, dan gaya gesek kinetik ke atas sepanjang bidang.',
      persamaanDasar:
        'a_{\\text{rel}} = g\\left[(1 - \\mu\\kappa)\\sin\\alpha - (\\mu + \\kappa)\\cos\\alpha\\right], \\qquad \\mu_{\\text{eff}} = \\frac{\\mu + \\kappa}{1 - \\mu\\kappa}',
      substitusiAngka:
        '\\mu_{\\text{eff}} = \\frac{0{,}40 + 0{,}20}{1 - 0{,}40 \\times 0{,}20} = \\frac{0{,}60}{0{,}92} = \\frac{15}{23} \\approx 0{,}65217',
      perhitungan:
        '$$\\alpha_{\\text{opt}} = 45^\\circ + \\frac{1}{2}\\arctan\\left(\\frac{15}{23}\\right) = 45^\\circ + \\frac{33{,}1113^\\circ}{2} = 61{,}5557^\\circ$$',
      hasilAkhir: '61,6°',
      interpretasiFisika:
        'Perhatian jebakan olimpiade! Jika seseorang menggunakan gravitasi efektif $\\vec{g}_{\\text{eff}}$ miring sebesar $\\theta_g = \\arctan(0{,}20) = 11{,}31^\\circ$ ke belakang, sudut bidang terhadap $\\vec{g}_{\\text{eff}}$ memang $\\alpha - \\theta_g$, tetapi alas $\\ell$ tetap horizontal (tidak tegak lurus $\\vec{g}_{\\text{eff}}$)! Karena itu sudut optimal bertambah satu penuh $\\frac{\\theta_g}{2}$, bukan seluruh $\\theta_g$: $45^\\circ + \\frac{\\phi + \\theta_g}{2} = 61{,}6^\\circ$.',
      strategiCepatOlimpiade:
        'Gunakan penjumlahan sudut tangen: $\\mu = \\tan\\phi$ dan $\\kappa = \\tan\\theta_g$, maka $\\frac{\\mu + \\kappa}{1 - \\mu\\kappa} = \\tan(\\phi + \\theta_g)$, sehingga $\\alpha_{\\text{opt}} = 45^\\circ + \\frac{\\phi + \\theta_g}{2}$!',
    },
    narration: {
      soal: 'Soal nomor 10. Sebuah bidang miring beralas 2,4 meter dengan koefisien gesek 0,40 berada di lantai kereta yang dipercepat ke kanan sebesar 0,20 g. Benda kecil dilepas dari puncak bidang miring. Tentukan sudut kemiringan agar benda mencapai dasar dalam waktu paling singkat relatif terhadap kereta.',
      stimulus: 'Diagram menampilkan gerbong kereta yang dipercepat ke kanan, dengan bidang miring berada di lantai gerbong.',
      fbd: 'Dalam kerangka kereta, bekerja gaya fiktif ke arah kiri sebesar m kali percepatan kereta, yang memperbesar gaya normal sekaligus menghambat luncuran.',
      pembahasan: 'Memasukkan gaya fiktif ke kiri menghasilkan koefisien gesek efektif sama dengan miu tambah kapa dibagi satu kurang miu kapa, yaitu lima belas per dua puluh tiga. Menggunakan rumus optimal Soal 6 dengan miu efektif tersebut memberikan alfa optimal 61,6 derajat.',
    },
  },
  {
    id: 11,
    number: 11,
    tier: 4,
    tierLabel: 'Tier 4 · Penalaran Tinggi',
    title: 'Bola Pejal Homogen: Menggelinding Murni vs Menggelinding Disertai Selip',
    contextTag: 'Dinamika Rotasi & Transisi Rezim Gesek',
    theoryLevelRef: 5,
    questionText:
      'Sebuah bola pejal homogen ($I = \\frac{2}{5}mR^2$) dilepas dari keadaan diam di puncak bidang miring dengan panjang alas tetap $\\ell = 2{,}8\\text{ m}$. Koefisien gesek statis dan kinetik antara bola dan permukaan bidang miring bernilai sama, $\\mu_s = \\mu_k = \\mu = 0{,}25$. Tentukan sudut kemiringan $\\alpha$ agar pusat massa bola mencapai dasar bidang miring dalam waktu paling singkat (dalam derajat).',
    knownData: [
      { symbol: '$I$', label: 'Momen inersia bola pejal', value: '2/5 mR²', unit: 'kg·m²' },
      { symbol: '$\\ell$', label: 'Panjang alas tetap', value: '2,8', unit: 'm' },
      { symbol: '$\\mu$', label: 'Koefisien gesek statis & kinetik', value: '0,25', unit: '-' },
    ],
    askedQuantity: { symbol: '$\\alpha$', label: 'Sudut optimal bola pejal', unit: '°' },
    unit: '°',
    exactAnswer: solveProblemExact(11),
    answerOneDecimal: 52.0,
    hints: [
      'Bola tidak selalu menggelinding murni! Cek batas sudut selip: untuk bola pejal, menggelinding murni hanya berlaku bila $\\tan\\alpha \\le \\frac{7}{2}\\mu$.',
      'Bandingkan dua rezim: pada rezim menggelinding murni ($a = \\frac{5}{7}g\\sin\\alpha$), dan pada rezim selip ($\\tan\\alpha > \\frac{7}{2}\\mu$) di mana gaya gesek adalah $f_k = \\mu mg\\cos\\alpha$.',
      'Saat bola sudah selip, percepatan pusat massanya adalah $a_{\\text{cm}} = g(\\sin\\alpha - \\mu\\cos\\alpha)$, persis sama dengan partikel di Soal 6! Bandingkan $t_{\\min}$ kedua rezim.',
    ],
    stimulus: {
      type: 'rolling-sphere-incline',
      caption: 'Bola pejal homogen bermassa m dan jari-jari R di puncak bidang miring beralas ℓ = 2,8 m dengan μ = 0,25.',
      angleDeg: 52.02,
      angleLabel: 'α = ?',
      baseLengthLabel: 'ℓ = 2,8 m',
      muLabel: 'μ = 0,25',
      extraLabel: 'I = ⅖ mR²',
    },
    fbd: {
      relevant: true,
      inclineAngleDeg: 52.02,
      forces: makeStandardFbd(52.02),
    },
    simConfig: {
      mode: 'sphere-roll-slip',
      baseLength: 2.8,
      angleDeg: 52.02,
      compareAngleDeg: 41.18,
      mu: 0.25,
      g: 9.8,
    },
    solution: {
      memahamiPermasalahan:
        'Berbeda dari partikel titik, bola pejal dapat menggelinding tanpa selip jika sudut tidak terlalu curam, atau menggelinding sambil selip jika sudut melampaui ambang batas gesek statis. Kita harus menguji kedua rezim untuk menemukan waktu paling singkat!',
      identifikasiData: [
        'Momen inersia bola pejal $I = \\frac{2}{5}mR^2$',
        'Panjang alas $\\ell = 2{,}8\\text{ m}$',
        'Koefisien gesek $\\mu = 0{,}25$',
      ],
      besaranDitanyakan: 'Sudut kemiringan $\\alpha$ agar waktu tiba di dasar paling singkat (dalam derajat).',
      analisisFisika:
        '1) Rezim menggelinding murni: $a = \\frac{g\\sin\\alpha}{1 + 2/5} = \\frac{5}{7}g\\sin\\alpha$, dengan syarat $f_s = \\frac{2}{7}mg\\sin\\alpha \\le \\mu mg\\cos\\alpha \\iff \\tan\\alpha \\le \\frac{7}{2}\\mu = 0{,}875$ ($\\alpha \\le 41{,}19^\\circ$). Nilai maksimum $a\\cos\\alpha$ pada rezim ini tercapai di batas $\\alpha = 41{,}19^\\circ$ sebesar $\\frac{5}{14}g\\sin(82{,}37^\\circ) = 0{,}3540\\,g$.\n2) Rezim selip ($\\alpha > 41{,}19^\\circ$): gesekan menjadi kinetik $f_k = \\mu mg\\cos\\alpha$ sehingga percepatan pusat massa menjadi $a_{\\text{cm}} = g(\\sin\\alpha - \\mu\\cos\\alpha)$, identik dengan Soal 6!',
      fbdPenjelasan:
        'Gaya berat di pusat massa, gaya normal melalui titik kontak dan pusat massa, serta gaya gesek $f$ di titik kontak permukaan bawah bola yang menimbulkan torsi putar sekaligus menghambat translasi.',
      persamaanDasar:
        '\\text{Rezim selip: } a_{\\text{cm}} = g(\\sin\\alpha - \\mu\\cos\\alpha) \\implies \\alpha_{\\text{opt}} = 45^\\circ + \\frac{1}{2}\\arctan(\\mu)',
      substitusiAngka:
        '\\alpha_{\\text{opt, selip}} = 45^\\circ + \\frac{1}{2}\\arctan(0{,}25) = 45^\\circ + \\frac{14{,}0362^\\circ}{2} = 52{,}0181^\\circ',
      perhitungan:
        '$$\\text{Uji perbandingan: } f_{\\text{selip}}(52{,}02^\\circ) = \\frac{1}{2}(\\sqrt{1+0{,}25^2} - 0{,}25) = 0{,}3904 > f_{\\text{gulung}}(41{,}19^\\circ) = 0{,}3540$$',
      hasilAkhir: '52,0°',
      interpretasiFisika:
        'Karena $0{,}3904 > 0{,}3540$, waktu luncur di rezim selip pada $\\alpha = 52{,}0^\\circ$ benar-benar lebih singkat dibandingkan seluruh sudut pada rezim menggelinding murni! Sebaliknya, jika $\\mu$ cukup besar (misal $\\mu = 0{,}45$), rezim menggelinding murni di $45^\\circ$ justru mengalahkan rezim selip.',
      strategiCepatOlimpiade:
        'Selalu periksa batas selip $\\tan\\alpha_{\\text{selip}} = \\left(1 + \\frac{mR^2}{I}\\right)\\mu = \\frac{7}{2}\\mu$, lalu bandingkan $\\frac{5}{14}\\sin(2\\alpha_{\\text{maks, gulung}})$ dengan $\\frac{1}{2}(\\sqrt{1+\\mu^2} - \\mu)$!',
    },
    narration: {
      soal: 'Soal nomor 11. Sebuah bola pejal homogen dilepas dari diam di puncak bidang miring beralas 2,8 meter dengan koefisien gesek 0,25. Tentukan sudut kemiringan agar pusat massa bola mencapai dasar dalam waktu paling singkat.',
      stimulus: 'Diagram memperlihatkan bola pejal bermomen inersia dua per lima m R kuadrat menuruni bidang miring kasar.',
      fbd: 'Gaya gesek bekerja pada titik kontak bawah bola. Jika bola selip, besarnya tepat sama dengan miu kali gaya normal.',
      pembahasan: 'Kita harus menguji dua rezim gerak. Pada rezim menggelinding murni, batas sudut maksimumnya adalah arkus tangen 0,875 yaitu 41,2 derajat, dengan faktor percepatan maksimum 0,3540 g. Pada rezim selip di atas 41,2 derajat, percepatan pusat massa mengikuti rumus Soal 6 dengan puncak di 52,0 derajat dan faktor percepatan 0,3904 g. Karena lebih besar, rezim selip menang dan sudut optimalnya 52,0 derajat.',
    },
  },
  {
    id: 12,
    number: 12,
    tier: 4,
    tierLabel: 'Tier 4 · Penalaran Tinggi',
    title: 'Dualitas Kecepatan Horizontal Maksimum di Dasar Bidang Miring',
    contextTag: 'Optimasi Proyeksi Horizontal Kecepatan',
    theoryLevelRef: 5,
    questionText:
      'Sebuah balok kecil dilepas dari keadaan diam di puncak bidang miring kasar dengan panjang alas tetap $\\ell = 4{,}5\\text{ m}$, koefisien gesekan kinetik $\\mu = 0{,}75$, dan percepatan gravitasi $g = 9{,}8\\text{ m/s}^2$. Sudut kemiringan $\\alpha$ dapat divariasikan bebas. Tentukan nilai maksimum **komponen horizontal kecepatan** balok ($v_x = v\\cos\\alpha$) tepat saat tiba di dasar bidang miring (dalam $\\text{m/s}$).',
    knownData: [
      { symbol: '$\\ell$', label: 'Panjang alas tetap', value: '4,5', unit: 'm' },
      { symbol: '$\\mu$', label: 'Koefisien gesek kinetik', value: '0,75', unit: '-' },
      { symbol: '$g$', label: 'Percepatan gravitasi', value: '9,8', unit: 'm/s²' },
    ],
    askedQuantity: { symbol: '$v_{x,\\max}$', label: 'Komponen horizontal kecepatan maksimum', unit: 'm/s' },
    unit: 'm/s',
    exactAnswer: solveProblemExact(12),
    answerOneDecimal: 4.7,
    hints: [
      'Nyatakan kelajuan di dasar bidang miring sebagai fungsi $\\alpha$: $v(\\alpha) = \\sqrt{2g\\ell(\\tan\\alpha - \\mu)}$.',
      'Kalikan dengan $\\cos\\alpha$ untuk mendapatkan komponen horizontal: $v_x(\\alpha) = \\sqrt{2g\\ell\\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)}$.',
      'Fungsi di dalam akar persis sama dengan fungsi penyebut $f(\\alpha)$ pada Soal 6! Nilai maksimumnya adalah $\\frac{1}{2}(\\sqrt{1+\\mu^2} - \\mu)$.',
    ],
    stimulus: {
      type: 'horizontal-exit-vector',
      caption: 'Di dasar bidang miring beralas ℓ = 4,5 m, vektor kecepatan akhir v diuraikan menjadi komponen horizontal v_x = v cos α.',
      angleDeg: 63.43,
      angleLabel: 'α',
      baseLengthLabel: 'ℓ = 4,5 m',
      muLabel: 'μ = 0,75',
      extraLabel: 'v_x = v cos α',
    },
    fbd: {
      relevant: true,
      inclineAngleDeg: 63.43,
      forces: makeStandardFbd(63.43),
    },
    simConfig: {
      mode: 'compare-optimal',
      baseLength: 4.5,
      angleDeg: 63.43,
      compareAngleDeg: 45,
      mu: 0.75,
      g: 9.8,
    },
    solution: {
      memahamiPermasalahan:
        'Jika $\\alpha$ dibuat sangat besar mendekati $90^\\circ$, kelajuan total $v$ di dasar memang terus meningkat menuju tak hingga, tetapi arahnya hampir vertikal sehingga komponen horizontalnya $v_x = v\\cos\\alpha \\to 0$! Sebaliknya jika $\\alpha$ mendekati $\\arctan\\mu$, $v \\to 0$. Maka pasti ada sudut yang memaksimumkan $v_x$.',
      identifikasiData: [
        'Panjang alas $\\ell = 4{,}5\\text{ m}$',
        'Koefisien gesek $\\mu = 0{,}75$',
        'Percepatan gravitasi $g = 9{,}8\\text{ m/s}^2$',
      ],
      besaranDitanyakan: 'Komponen horizontal kecepatan maksimum di dasar, $v_{x,\\max}$ (dalam $\\text{m/s}$).',
      analisisFisika:
        'Dari Teorema Usaha-Energi, $v = \\sqrt{2g\\ell(\\tan\\alpha - \\mu)}$. Memasukkan $\\cos\\alpha$ ke dalam akar menghasilkan $v_x(\\alpha) = \\sqrt{2g\\ell\\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)}$, yang bentuknya identik dengan penyebut waktu tempuh di Soal 6!',
      fbdPenjelasan:
        'Gaya berat, normal, dan gesek kinetik menghasilkan percepatan horizontal konstan $a_x = a\\cos\\alpha = g\\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)$.',
      persamaanDasar:
        'v_x(\\alpha) = \\sqrt{2g\\ell\\cos\\alpha(\\sin\\alpha - \\mu\\cos\\alpha)}, \\qquad v_{x,\\max} = \\sqrt{g\\ell(\\sqrt{1+\\mu^2} - \\mu)}',
      substitusiAngka:
        '\\sqrt{1 + 0{,}75^2} = \\sqrt{1{,}5625} = 1{,}25, \\qquad v_{x,\\max} = \\sqrt{9{,}8 \\times 4{,}5 \\times (1{,}25 - 0{,}75)}',
      perhitungan:
        '$$v_{x,\\max} = \\sqrt{44{,}1 \\times 0{,}50} = \\sqrt{22{,}05} = 4{,}6957\\text{ m/s}$$',
      hasilAkhir: '4,7 m/s',
      interpretasiFisika:
        'Dualitas yang luar biasa: karena percepatan horizontal $a_x$ konstan dari diam, $v_x = 2\\bar{v}_x = \\frac{2\\ell}{t}$. Dengan demikian, sudut yang memaksimumkan komponen kecepatan horizontal di dasar ($\\alpha = 63{,}4^\\circ$) tepat sama dengan sudut yang meminimumkan waktu luncur!',
      strategiCepatOlimpiade:
        'Tanpa mencari sudut sama sekali, pakai identitas $v_{x,\\max} = \\frac{2\\ell}{t_{\\min}} = \\sqrt{g\\ell(\\sqrt{1+\\mu^2} - \\mu)}$. Untuk $\\mu = 0{,}75 = 3/4$, tripel $(3,4,5)$ memberi $\\sqrt{1+\\mu^2} = 5/4$ seketika!',
    },
    narration: {
      soal: 'Soal nomor 12. Sebuah balok kecil dilepas dari diam di puncak bidang miring kasar dengan panjang alas tetap 4,5 meter, koefisien gesekan 0,75, dan g 9,8 meter per sekon kuadrat. Tentukan nilai maksimum komponen horizontal kecepatan balok tepat saat tiba di dasar.',
      stimulus: 'Diagram menampilkan vektor kecepatan total v di dasar bidang miring beserta penguraian komponen horizontal v x.',
      fbd: 'Komponen horizontal percepatan sebanding dengan kosinus alfa kali sinus alfa dikurangi miu kosinus alfa.',
      pembahasan: 'Dari hukum gerak horizontal beraturan mulai dari diam, kecepatan horizontal akhir sama dengan dua kali panjang alas dibagi waktu tempuh. Karena itu memaksimumkan v x identik dengan meminimumkan waktu tempuh. Rumus cepatnya adalah akar g el dikali kurung buka akar satu tambah miu kuadrat dikurangi miu. Untuk miu 0,75, hasilnya adalah akar 22,05 yaitu 4,7 meter per sekon.',
    },
  },
  {
    id: 13,
    number: 13,
    tier: 5,
    tierLabel: 'Tier 5 · Tantangan Olimpiade',
    title: 'Bidang Miring di Dalam Gerbong pada Jalan Menurun Kasar',
    contextTag: 'Dinamika Kerangka Berjenjang',
    theoryLevelRef: 5,
    questionText:
      'Sebuah gerbong berada di atas jalan menurun panjang bersudut $\\beta = 15^\\circ$ terhadap horizontal dengan koefisien gesek kinetik antara gerbong dan jalan $\\mu_k = 0{,}20$, sehingga gerbong meluncur bebas dipercepat menuruni jalan. Di atas lantai gerbong (yang sejajar jalan menurun), terpasang sebuah bidang miring kecil dengan panjang alas $\\ell = 2{,}0\\text{ m}$ dan koefisien gesekan kinetik internal $\\mu_A = 0{,}60$ yang menurun searah gerak gerbong. Benda kecil $A$ dilepas dari diam relatif terhadap gerbong dari puncak bidang miring kecil tersebut. Tentukan sudut kemiringan $\\alpha$ bidang miring kecil terhadap lantai gerbong agar $A$ mencapai ujung alas $\\ell$ dalam waktu paling singkat (dalam derajat).',
    knownData: [
      { symbol: '$\\beta$', label: 'Sudut jalan menurun', value: '15', unit: '°' },
      { symbol: '$\\mu_k$', label: 'Gesekan gerbong-jalan', value: '0,20', unit: '-' },
      { symbol: '$\\mu_A$', label: 'Gesekan benda-bidang kecil', value: '0,60', unit: '-' },
      { symbol: '$\\ell$', label: 'Alas bidang miring kecil', value: '2,0', unit: 'm' },
    ],
    askedQuantity: { symbol: '$\\alpha$', label: 'Sudut optimal terhadap lantai gerbong', unit: '°' },
    unit: '°',
    exactAnswer: solveProblemExact(13),
    answerOneDecimal: 54.8,
    hints: [
      'Hitung percepatan gerbong menuruni jalan miring kasar: $a_g = g(\\sin\\beta - \\mu_k\\cos\\beta)$.',
      'Dalam kerangka acuan gerbong, gaya fiktif $-ma_g$ sejajar lantai gerbong hampir seluruhnya membatalkan komponen gravitasi $mg\\sin\\beta$! Sisanya adalah gaya efektif maju sebesar $+\\mu_k mg\\cos\\beta$ sejajar lantai dan $+mg\\cos\\beta$ tegak lurus lantai.',
      'Perbandingan komponen sejajar-lantai dan tegak-lurus-lantai dari gravitasi efektif adalah tepat $\\mu_k$ (tidak bergantung pada $\\beta$!). Maka $\\mu_{\\text{eff}} = \\frac{\\mu_A - \\mu_k}{1 + \\mu_A\\mu_k}$.',
    ],
    stimulus: {
      type: 'cart-on-rough-slope',
      caption: 'Gerbong meluncur menuruni lereng kasar bersudut β = 15° (gesekan μ_k = 0,20), membawa bidang miring kecil beralas ℓ dengan sudut α di dalamnya.',
      angleDeg: 54.83,
      secondaryAngleDeg: 15,
      angleLabel: 'α = ?',
      baseLengthLabel: 'ℓ = 2,0 m',
      muLabel: 'μ_k = 0,20 ; μ_A = 0,60',
    },
    fbd: {
      relevant: true,
      note: 'FBD benda A di dalam kerangka lantai gerbong (diputar sejajar lantai lereng β).',
      inclineAngleDeg: 54.83,
      forces: makeStandardFbd(54.83, [
        {
          id: 'geffx',
          label: 'F_ef,x = μ_k mg cos β',
          angleFromHorizontalDeg: 0,
          origin: 'cm',
          color: '#0284C7',
        },
      ]),
    },
    simConfig: {
      mode: 'cart-rough-slope',
      baseLength: 2.0,
      angleDeg: 54.83,
      betaDeg: 15,
      mu: 0.6,
      muSecondary: 0.2,
      g: 9.8,
    },
    solution: {
      memahamiPermasalahan:
        'Sistem bertingkat ini menggabungkan dinamika gerbong pada lereng kasar $\\beta$ dan dinamika benda $A$ di dalam gerbong. Prinsip kesetaraan Einstein/gravitasi efektif membuat soal yang tampak menakutkan ini berubah sangat sederhana.',
      identifikasiData: [
        'Sudut jalan $\\beta = 15^\\circ$, gesekan jalan $\\mu_k = 0{,}20$',
        'Gesekan internal bidang miring kecil $\\mu_A = 0{,}60$',
        'Panjang alas di lantai gerbong $\\ell = 2{,}0\\text{ m}$',
      ],
      besaranDitanyakan: 'Sudut kemiringan optimal $\\alpha$ terhadap lantai gerbong (dalam derajat).',
      analisisFisika:
        'Gerbong memiliki percepatan $a_g = g(\\sin\\beta - \\mu_k\\cos\\beta)$ menuruni lereng. Di dalam kerangka gerbong, komponen gravitasi sejajar lantai adalah $+g\\sin\\beta$ sedangkan percepatan fiktifnya $-a_g$, sehingga resultan medan efektif sejajar lantai gerbong adalah $g_{\\text{eff},x} = g\\sin\\beta - g(\\sin\\beta - \\mu_k\\cos\\beta) = \\mu_k g\\cos\\beta$ ke arah depan, dan $g_{\\text{eff},y} = g\\cos\\beta$ ke arah lantai.',
      fbdPenjelasan:
        'Relatif terhadap lantai gerbong, benda mengalami gravitasi tegak lurus $mg\\cos\\beta$, gaya dorong efektif maju $\\mu_k mg\\cos\\beta$, gaya normal $N$, dan gesekan $\\mu_A N$.',
      persamaanDasar:
        'a_{\\text{rel}} = g\\cos\\beta\\left[(1 + \\mu_A\\mu_k)\\sin\\alpha - (\\mu_A - \\mu_k)\\cos\\alpha\\right]',
      substitusiAngka:
        '\\mu_{\\text{eff}} = \\frac{\\mu_A - \\mu_k}{1 + \\mu_A\\mu_k} = \\frac{0{,}60 - 0{,}20}{1 + 0{,}60 \\times 0{,}20} = \\frac{0{,}40}{1{,}12} = \\frac{5}{14}',
      perhitungan:
        '$$\\alpha_{\\text{opt}} = 45^\\circ + \\frac{1}{2}\\arctan\\left(\\frac{5}{14}\\right) = 45^\\circ + \\frac{19{,}6538^\\circ}{2} = 54{,}8269^\\circ$$',
      hasilAkhir: '54,8°',
      interpretasiFisika:
        'Sudut lereng $\\beta = 15^\\circ$ ternyata saling meniadakan dalam penentuan sudut optimal! Bila jalan luar licin ($\\mu_k = 0$), tidak ada gaya fiktif sisa sejajar lantai sehingga jawabannya kembali ke $45^\\circ + \\frac{1}{2}\\arctan\\mu_A$.',
      strategiCepatOlimpiade:
        'Gaya fiktif dari gerak turun lereng kasar selalu menyisakan komponen maju tepat sebesar $\\mu_k g\\cos\\beta$. Langsung gunakan selisih sudut gesek: $\\alpha_{\\text{opt}} = 45^\\circ + \\frac{\\arctan\\mu_A - \\arctan\\mu_k}{2}$!',
    },
    narration: {
      soal: 'Soal nomor 13. Sebuah gerbong meluncur bebas menuruni jalan menurun bersudut 15 derajat dengan koefisien gesek jalan 0,20. Di lantai gerbong terdapat bidang miring kecil beralas 2,0 meter dengan koefisien gesek 0,60. Tentukan sudut kemiringan bidang kecil agar benda di dalamnya mencapai dasar dalam waktu paling singkat.',
      stimulus: 'Gambar menunjukkan gerbong di atas jalan miring 15 derajat, dan di dalam gerbong terdapat bidang miring kecil bersudut alfa.',
      fbd: 'Dalam kerangka gerbong, gaya fiktif menghapus komponen sinus beta gravitasi, hanya menyisakan gaya dorong efektif maju sebesar miu k m g kosinus beta.',
      pembahasan: 'Karena komponen gravitasi sejajar lantai terkurangi gaya fiktif, sisa medan efektif ke depan tepat berbanding miu k terhadap medan tegak lurus lantai. Sudut optimal tidak bergantung pada sudut jalan beta dan langsung menjadi 45 derajat ditambah setengah kali selisih arkus tangen miu A dan miu k, yaitu 54,8 derajat.',
    },
  },
  {
    id: 14,
    number: 14,
    tier: 5,
    tierLabel: 'Tier 5 · Tantangan Olimpiade',
    title: 'Generalisasi Brachistochrone Kasar Menuju Dinding Target Miring',
    contextTag: 'Generalisasi Geometri Target Soal 6',
    theoryLevelRef: 5,
    questionText:
      'Sebuah benda kecil mulai meluncur dari keadaan diam dari titik puncak $O$ sepanjang lintasan lurus kasar ($\\mu = 0{,}40$) bersudut $\\alpha$ terhadap horizontal, menuju sebuah dinding target datar yang berjarak tegak lurus $d = 2{,}5\\text{ m}$ dari titik $O$ dan miring membentuk sudut $\\psi = 60^\\circ$ terhadap horizontal (perhatikan bahwa untuk $\\psi = 90^\\circ$ dinding menjadi vertikal seperti Soal 6). Tentukan sudut kemiringan lintasan $\\alpha$ agar benda mencapai dinding target tersebut dalam waktu paling singkat (dalam derajat).',
    knownData: [
      { symbol: '$d$', label: 'Jarak tegak lurus O ke dinding', value: '2,5', unit: 'm' },
      { symbol: '$\\psi$', label: 'Sudut kemiringan dinding target', value: '60', unit: '°' },
      { symbol: '$\\mu$', label: 'Koefisien gesek kinetik', value: '0,40', unit: '-' },
    ],
    askedQuantity: { symbol: '$\\alpha$', label: 'Sudut lintasan tercepat', unit: '°' },
    unit: '°',
    exactAnswer: solveProblemExact(14),
    answerOneDecimal: 70.9,
    hints: [
      'Gunakan proyeksi jarak tegak lurus $d$ dari titik $O$ ke dinding target untuk menyatakan panjang lintasan $s(\\alpha) = \\frac{d}{\\sin(\\alpha + \\psi)}$ (periksa bahwa untuk $\\psi = 90^\\circ$ ini menjadi $d/\\cos\\alpha$).',
      'Nyatakan $\\sin\\alpha - \\mu\\cos\\alpha = \\frac{1}{\\cos\\phi}\\sin(\\alpha - \\phi)$ dengan $\\tan\\phi = \\mu$.',
      'Fungsi penyebut menjadi $\\sin(\\alpha + \\psi)\\sin(\\alpha - \\phi) = \\frac{1}{2}[\\cos(\\psi + \\phi) - \\cos(2\\alpha + \\psi - \\phi)]$. Nilai maksimum terjadi saat $\\cos(2\\alpha + \\psi - \\phi) = -1$.',
    ],
    stimulus: {
      type: 'tilted-target-wall',
      caption: 'Lintasan lurus bersudut α dari titik O menuju dinding target miring bersudut ψ = 60° yang berjarak tegak lurus d = 2,5 m dari O.',
      angleDeg: 70.9,
      secondaryAngleDeg: 60,
      angleLabel: 'α = ?',
      baseLengthLabel: 'd = 2,5 m',
      muLabel: 'μ = 0,40',
      extraLabel: 'ψ = 60°',
    },
    fbd: {
      relevant: true,
      inclineAngleDeg: 70.9,
      forces: makeStandardFbd(70.9),
    },
    simConfig: {
      mode: 'tilted-wall',
      baseLength: 2.5,
      angleDeg: 70.9,
      psiDeg: 60,
      mu: 0.4,
      g: 9.8,
    },
    solution: {
      memahamiPermasalahan:
        'Soal Nomor 6 OSK 2026 sebenarnya adalah kasus khusus ketika garis target berupa dinding vertikal ($\\psi = 90^\\circ$) pada jarak $d = \\ell$. Di soal ini kita menggeneralisasikan target menjadi garis miring sembarang bersudut $\\psi = 60^\\circ$.',
      identifikasiData: [
        'Jarak tegak lurus $d = 2{,}5\\text{ m}$',
        'Sudut dinding target $\\psi = 60^\\circ$',
        'Koefisien gesek $\\mu = 0{,}40$',
      ],
      besaranDitanyakan: 'Sudut kemiringan lintasan $\\alpha$ terhadap horizontal agar waktu minimum (dalam derajat).',
      analisisFisika:
        'Persamaan garis dinding target berjarak $d$ dari $O$ dengan sudut $\\psi$ terhadap horizontal adalah $x\\sin\\psi - y\\cos\\psi = d$. Titik potong lintasan $(s\\cos\\alpha, -s\\sin\\alpha)$ memenuhi $s\\sin(\\alpha + \\psi) = d \\implies s = \\frac{d}{\\sin(\\alpha + \\psi)}$.',
      fbdPenjelasan:
        'Selama meluncur sepanjang lintasan miring bersudut $\\alpha$, gaya yang bekerja tetap berat, normal, dan gesek kinetik seperti biasa.',
      persamaanDasar:
        't(\\alpha) = \\sqrt{\\frac{2d\\cos\\phi}{g\\sin(\\alpha+\\psi)\\sin(\\alpha-\\phi)}}, \\qquad 2\\alpha + \\psi - \\phi = 180^\\circ',
      substitusiAngka:
        '\\phi = \\arctan(0{,}40) \\approx 21{,}8014^\\circ, \\qquad \\alpha_{\\text{opt}} = 90^\\circ - \\frac{\\psi - \\phi}{2}',
      perhitungan:
        '$$\\alpha_{\\text{opt}} = 90^\\circ - \\frac{60^\\circ - 21{,}8014^\\circ}{2} = 90^\\circ - 19{,}0993^\\circ = 70{,}9007^\\circ$$',
      hasilAkhir: '70,9°',
      interpretasiFisika:
        'Uji batas rumus umum ini: jika $\\psi = 90^\\circ$ (dinding vertikal Soal 6), diperoleh $90^\\circ - 45^\\circ + \\frac{\\phi}{2} = 45^\\circ + \\frac{1}{2}\\arctan\\mu$. Jika $\\psi = 60^\\circ$, dinding miring menjauh di bagian bawah sehingga lintasan harus lebih curam ke $70{,}9^\\circ$ untuk segera memotong dinding.',
      strategiCepatOlimpiade:
        'Ingat prinsip garis bagi sudut brachistochrone kasar: lintasan tercepat dari titik ke garis miring membagi dua sudut antara arah tegak lurus garis target dan arah gaya efektif miring sudut gesek $\\phi$!',
    },
    narration: {
      soal: 'Soal nomor 14. Sebuah benda kecil meluncur dari diam dari titik O sepanjang lintasan kasar dengan miu 0,40 menuju sebuah dinding target miring yang berjarak tegak lurus 2,5 meter dari O dan membentuk sudut psi 60 derajat terhadap horizontal. Tentukan sudut lintasan alfa agar waktu mencapai dinding paling singkat.',
      stimulus: 'Diagram menunjukkan titik O di kiri atas dan dinding miring bersudut psi 60 derajat. Untuk psi 90 derajat dinding menjadi vertikal seperti Soal 6.',
      fbd: 'Pada bidang miring bersudut alfa, tetap bekerja gaya berat, gaya normal, dan gaya gesek kinetik.',
      pembahasan: 'Dari geometri jarak tegak lurus d ke dinding miring, panjang lintasan es sama dengan d dibagi sinus alfa tambah psi. Menggabungkannya dengan percepatan menghasilkan penyebut sinus alfa tambah psi kali sinus alfa minus fi. Memaksimumkan hasil kali sinus memberi dua alfa tambah psi minus fi sama dengan 180 derajat, sehingga alfa optimal adalah 70,9 derajat.',
    },
  },
  {
    id: 15,
    number: 15,
    tier: 5,
    tierLabel: 'Tier 5 · Tantangan Olimpiade',
    title: 'Total Waktu Perjalanan pada Bidang Miring Optimal & Lantai Datar Kasar',
    contextTag: 'Sintesis Optimasi, Energi & Kinematika Lanjutan',
    theoryLevelRef: 5,
    questionText:
      'Sebuah benda kecil meluncur dari keadaan diam dari puncak bidang miring beralas tetap $\\ell = 3{,}0\\text{ m}$ dengan koefisien gesek kinetik $\\mu = 0{,}40$ ($g = 10\\text{ m/s}^2$). Sudut bidang miring $\\alpha$ diatur sedemikian rupa agar **waktu luncur di bidang miring paling singkat**. Tepat di dasar bidang miring terdapat belokan melengkung sangat kecil yang licin sehingga benda berpindah ke lantai horizontal kasar (koefisien gesek kinetik juga $\\mu = 0{,}40$) tanpa kehilangan kelajuan. Hitunglah **total waktu tempuh** benda sejak dilepas dari puncak hingga akhirnya berhenti di lantai horizontal (dalam sekon).',
    knownData: [
      { symbol: '$\\ell$', label: 'Panjang alas bidang miring', value: '3,0', unit: 'm' },
      { symbol: '$\\mu$', label: 'Koefisien gesek (bidang & lantai)', value: '0,40', unit: '-' },
      { symbol: '$g$', label: 'Percepatan gravitasi', value: '10', unit: 'm/s²' },
    ],
    askedQuantity: { symbol: '$t_{\\text{total}}$', label: 'Total waktu sampai berhenti', unit: 's' },
    unit: 's',
    exactAnswer: solveProblemExact(15),
    answerOneDecimal: 3.3,
    hints: [
      'Bagi perjalanan menjadi dua tahap: tahap 1 menuruni bidang miring pada sudut $\\alpha_{\\text{opt}}$, dan tahap 2 meluncur di lantai horizontal hingga berhenti.',
      'Pada $\\alpha_{\\text{opt}}$, hitung $t_1 = t_{\\min} = \\sqrt{\\frac{4\\ell(\\sqrt{1+\\mu^2}+\\mu)}{g}}$ serta kelajuan di dasar $v = \\sqrt{2g\\ell(\\tan\\alpha_{\\text{opt}} - \\mu)}$.',
      'Gunakan identitas olimpiade $\\tan\\alpha_{\\text{opt}} = \\mu + \\sqrt{1+\\mu^2}$, sehingga $v = \\sqrt{2g\\ell\\sqrt{1+\\mu^2}}$, dan waktu henti di lantai adalah $t_2 = \\frac{v}{\\mu g}$.',
    ],
    stimulus: {
      type: 'incline-plus-flat-floor',
      caption: 'Lintasan dua tahap: bidang miring optimal beralas ℓ = 3,0 m dilanjutkan lantai datar kasar μ = 0,40 hingga benda berhenti.',
      angleDeg: 55.9,
      angleLabel: 'α_opt',
      baseLengthLabel: 'ℓ = 3,0 m',
      muLabel: 'μ = 0,40',
      extraLabel: 'Lantai datar (μ = 0,40)',
    },
    fbd: {
      relevant: true,
      note: 'Menampilkan gaya pada tahap 1 (bidang miring). Pada tahap 2 (lantai datar), N = mg dan f_k = μmg berarah ke kiri.',
      inclineAngleDeg: 55.9,
      forces: makeStandardFbd(55.9),
    },
    simConfig: {
      mode: 'incline-floor',
      baseLength: 3.0,
      angleDeg: 55.9,
      mu: 0.4,
      g: 10,
    },
    solution: {
      memahamiPermasalahan:
        'Soal tantangan terakhir ini menguji penguasaan menyeluruh atas seluruh konsep Soal 6: menentukan sudut optimal, menghitung waktu minimum $t_1$, menentukan kelajuan keluar menggunakan teorema usaha-energi dan identitas trigonometri, lalu menghitung waktu perlambatan $t_2$ pada lantai datar.',
      identifikasiData: [
        'Panjang alas $\\ell = 3{,}0\\text{ m}$',
        'Koefisien gesek $\\mu = 0{,}40$',
        'Percepatan gravitasi $g = 10\\text{ m/s}^2$',
      ],
      besaranDitanyakan: 'Waktu total dari puncak hingga berhenti di lantai datar, $t_{\\text{total}} = t_1 + t_2$ (dalam sekon).',
      analisisFisika:
        'Tahap 1 terjadi pada kondisi $\\alpha_{\\text{opt}} = 45^\\circ + \\frac{1}{2}\\arctan(0{,}40) \\approx 55{,}90^\\circ$. Tahap 2 adalah GLBB diperlambat dengan $a_2 = -\\mu g$ hingga $v = 0$.',
      fbdPenjelasan:
        'Pada tahap bidang miring berlaku FBD standar bidang miring. Setelah masuk lantai datar, gaya berat dan normal sama besar ($N = mg$), sehingga satu-satunya gaya horizontal adalah gesekan kinetik $f_k = \\mu mg$ ke kiri.',
      persamaanDasar:
        't_1 = \\sqrt{\\frac{4\\ell(\\sqrt{1+\\mu^2}+\\mu)}{g}}, \\qquad \\tan\\alpha_{\\text{opt}} = \\mu + \\sqrt{1+\\mu^2} \\implies v = \\sqrt{2g\\ell\\sqrt{1+\\mu^2}}, \\qquad t_2 = \\frac{v}{\\mu g}',
      substitusiAngka:
        '\\sqrt{1 + 0{,}40^2} = \\sqrt{1{,}16} \\approx 1{,}077033',
      perhitungan:
        '$$t_1 = \\sqrt{\\frac{12{,}0 \\times (1{,}077033 + 0{,}40)}{10}} = \\sqrt{1{,}77244} = 1{,}3313\\text{ s}$$ $$v = \\sqrt{2 \\times 10 \\times 3{,}0 \\times 1{,}077033} = \\sqrt{64{,}6220} = 8{,}0388\\text{ m/s}$$ $$t_2 = \\frac{8{,}0388}{0{,}40 \\times 10} = 2{,}0097\\text{ s}$$ $$t_{\\text{total}} = 1{,}3313 + 2{,}0097 = 3{,}3410\\text{ s}$$',
      hasilAkhir: '3,3 s',
      interpretasiFisika:
        'Menarik untuk dicatat bahwa di lantai datar benda membutuhkan waktu $2{,}01\\text{ s}$ (lebih lama daripada waktu turunnya $1{,}33\\text{ s}$) karena perlambatan oleh gesekan $\\mu g = 4{,}0\\text{ m/s}^2$ lebih kecil daripada percepatan luncur optimal di bidang miring.',
      strategiCepatOlimpiade:
        'Gunakan identitas emas $\\tan\\left(45^\\circ + \\frac{\\phi}{2}\\right) = \\sec\\phi + \\tan\\phi = \\sqrt{1+\\mu^2} + \\mu$ sehingga $\\tan\\alpha_{\\text{opt}} - \\mu = \\sqrt{1+\\mu^2}$ tanpa perlu menyentuh fungsi trigonometri sama sekali!',
    },
    narration: {
      soal: 'Soal nomor 15, tantangan penutup olimpiade. Sebuah benda kecil meluncur dari diam di puncak bidang miring beralas 3,0 meter dengan koefisien gesek 0,40 dan sudut diatur untuk waktu luncur tercepat. Setelah sampai di dasar, benda berbelok mulus ke lantai horizontal kasar berkoefisien gesek 0,40 hingga berhenti. Hitunglah total waktu tempuh seluruh perjalanan.',
      stimulus: 'Diagram menunjukkan dua fase lintasan: bidang miring optimal beralas 3,0 meter, diikuti lintasan datar kasar tempat benda melambat hingga berhenti.',
      fbd: 'Pada bidang miring bekerja gaya berat, normal, dan gesek. Di lantai datar gaya normal tepat sama dengan berat dan gaya gesek memperlambat gerak ke kiri.',
      pembahasan: 'Pertama hitung waktu turun minimum t satu sama dengan 1,331 sekon. Kedua, gunakan identitas emas tangen alfa optimal sama dengan miu tambah akar satu tambah miu kuadrat, sehingga kelajuan di dasar adalah akar dua g el kali akar satu tambah miu kuadrat, yaitu 8,039 meter per sekon. Waktu perlambatan di lantai t dua sama dengan v per miu g, yaitu 2,010 sekon. Total waktu perjalanan adalah 3,341 sekon atau 3,3 sekon.',
    },
  },
];
