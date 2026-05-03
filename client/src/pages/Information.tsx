import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Information() {
  return (
    <div className="space-y-6">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Halaman Informasi</h1>
        <p className="text-gray-600 mb-8">
          Dokumentasi lengkap metodologi perhitungan, indikator penilaian, dan informasi kandidat
        </p>

        {/* A. Parameter Indikator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Parameter Indikator</CardTitle>
            <CardDescription>
              Indikator yang digunakan dalam penilaian BPD
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-4 py-2 text-left">Kategori</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Indikator</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Bobot</th>
                    <th className="border border-gray-200 px-4 py-2 text-left">Deskripsi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="border border-gray-200 px-4 py-2 font-medium">Internal</td>
                    <td className="border border-gray-200 px-4 py-2">Surat Baiat / Rekomendasi Resmi</td>
                    <td className="border border-gray-200 px-4 py-2 font-bold text-blue-600">5.5</td>
                    <td className="border border-gray-200 px-4 py-2">Dokumen resmi yang mengikat dukungan</td>
                  </tr>
                  <tr className="border-b">
                    <td className="border border-gray-200 px-4 py-2 font-medium">Eksternal</td>
                    <td className="border border-gray-200 px-4 py-2">Afiliasi Politik Lokal</td>
                    <td className="border border-gray-200 px-4 py-2 font-bold text-blue-600">4.2</td>
                    <td className="border border-gray-200 px-4 py-2">Kesesuaian dengan kekuatan politik wilayah</td>
                  </tr>
                  <tr className="border-b">
                    <td className="border border-gray-200 px-4 py-2 font-medium">Internal</td>
                    <td className="border border-gray-200 px-4 py-2">Video Dukungan Resmi</td>
                    <td className="border border-gray-200 px-4 py-2 font-bold text-blue-600">3.8</td>
                    <td className="border border-gray-200 px-4 py-2">Pernyataan publik terverifikasi</td>
                  </tr>
                  <tr className="border-b">
                    <td className="border border-gray-200 px-4 py-2 font-medium">Eksternal</td>
                    <td className="border border-gray-200 px-4 py-2">Kedekatan Personal MC</td>
                    <td className="border border-gray-200 px-4 py-2 font-bold text-blue-600">3.2</td>
                    <td className="border border-gray-200 px-4 py-2">Jejaring Master Campaigner</td>
                  </tr>
                  <tr className="border-b">
                    <td className="border border-gray-200 px-4 py-2 font-medium">Internal</td>
                    <td className="border border-gray-200 px-4 py-2">Atribut Fisik</td>
                    <td className="border border-gray-200 px-4 py-2 font-bold text-blue-600">2.1</td>
                    <td className="border border-gray-200 px-4 py-2">Simbol kebersamaan di publik</td>
                  </tr>
                  <tr className="border-b">
                    <td className="border border-gray-200 px-4 py-2 font-medium">Internal</td>
                    <td className="border border-gray-200 px-4 py-2">Sosial Media</td>
                    <td className="border border-gray-200 px-4 py-2 font-bold text-blue-600">1.2</td>
                    <td className="border border-gray-200 px-4 py-2">Interaksi informal</td>
                  </tr>
                  <tr className="bg-gray-50 font-bold">
                    <td className="border border-gray-200 px-4 py-2" colSpan={3}>Total Maksimal</td>
                    <td className="border border-gray-200 px-4 py-2 font-bold text-green-600">20.0</td>
                    <td className="border border-gray-200 px-4 py-2">Skor penuh (100%)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* B. Metodologi Perhitungan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Metodologi Perhitungan</CardTitle>
            <CardDescription>
              Rumus dan logika perhitungan yang digunakan sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-lg mb-2">A. Skor Probabilitas BPD</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm">
                    Total Poin = jumlah indikator terpenuhi<br />
                    Skor (%) = Total Poin × 5
                  </code>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-2">B. Estimasi Suara per BPD</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm">
                    Estimasi Suara = (Skor / 100) × 5
                  </code>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-2">C. Total Suara Dukungan (Deterministik)</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm">
                    Total Dukungan = Jumlah BPD × 5
                  </code>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  👉 Menunjukkan jumlah wilayah yang berpihak
                </p>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-2">D. Total Suara Efektif (Analitik Utama)</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm">
                    Total Efektif = Σ (Estimasi Suara seluruh BPD)
                  </code>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  👉 Menunjukkan kekuatan riil dukungan
                </p>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-2">E. Progress Menuju 50%+1 (FINAL)</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-sm">
                    Progress = Total Efektif / 96
                  </code>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  👉 Digunakan sebagai indikator utama peluang kemenangan
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* C. Informasi Kandidat */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Data Kandidat</CardTitle>
            <CardDescription>
              Informasi lengkap 4 kandidat Caketum HIPMI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2 text-blue-600">Reynaldo Bryan</h3>
                <p className="text-sm text-gray-600 mb-1">Afiliasi: Nasdem</p>
                <div className="w-full h-4 bg-blue-500 rounded-full mb-2"></div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2 text-red-600">Ade Jona</h3>
                <p className="text-sm text-gray-600 mb-1">Afiliasi: Gerindra</p>
                <div className="w-full h-4 bg-red-500 rounded-full mb-2"></div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2 text-yellow-600">Afie Kalla</h3>
                <p className="text-sm text-gray-600 mb-1">Afiliasi: Golkar</p>
                <div className="w-full h-4 bg-yellow-500 rounded-full mb-2"></div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-2 text-green-600">Anthony Leong</h3>
                <p className="text-sm text-gray-600 mb-1">Afiliasi: Gerindra</p>
                <div className="w-full h-4 bg-green-500 rounded-full mb-2"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Akses API Dokumentasi</CardTitle>
            <CardDescription>
              Gunakan Swagger untuk memeriksa endpoint API, respons, dan skema data secara cepat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              API documentation tersedia secara interaktif pada endpoint <strong>/api/docs</strong>.
            </p>
            <a
              href="http://localhost:5000/api/docs"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buka Swagger API Docs
            </a>
          </CardContent>
        </Card>

        {/* D. Interpretasi Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Cara Membaca Dashboard</CardTitle>
            <CardDescription>
              Panduan interpretasi visualisasi data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-lg mb-2">Status Dukungan</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                  <li><span className="font-semibold">Terkunci:</span> Dukungan pasti dan tidak akan berubah</li>
                  <li><span className="font-semibold">Mengarah:</span> Cenderung mendukung tapi masih bisa berubah</li>
                  <li><span className="font-semibold">Dinamis:</span> Belum menentukan pilihan atau masih berubah-ubah</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-lg mb-2">Karakteristik Provinsi</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                  <li><span className="font-semibold">Solid:</span> Dukungan kuat dan stabil</li>
                  <li><span className="font-semibold">Rentan:</span> Dukungan bisa berubah ke kandidat lain</li>
                  <li><span className="font-semibold">Waspada:</span> Perlu perhatian khusus</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-lg mb-2">Metrik Utama</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
                  <li><span className="font-semibold">Total Suara Efektif:</span> Jumlah estimasi suara dari semua BPD (indikator utama)</li>
                  <li><span className="font-semibold">Progress:</span> Persentase menuju target 96 suara (indikator kemenangan)</li>
                  <li><span className="font-semibold">Total Dukungan:</span> Jumlah maksimal suara jika semua BPD terkunci (deterministik)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
