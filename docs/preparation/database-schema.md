# 🧱 UPDATE FINAL — ENUM SUPPORT STATUS (INDONESIA VERSION)

```
enum SupportStatus {
  TERKUNCI
  MENGARAH
  DINAMIS
}

enum BpdCharacteristic {
  SOLID
  RENTAN
  WASPADA
}
```

---

# 🧠 PENJELASAN SINGKAT (BIAR GA AMBIGU)

## 🟢 SupportStatus (Indonesia version)

- **TERKUNCI**
→ dukungan sudah final ke 1 kandidat
- **MENGARAH**
→ kecenderungan kuat tapi belum final
- **DINAMIS**
→ masih berubah / belum stabil

---

## 🟡 Kenapa enum Indonesia lebih cocok di kasus ini?

Karena:

- dipakai langsung di UI & dashboard
- dipahami user non-teknis
- bukan internal logic system-only
- ini “business state”, bukan “engine keyword”

---

# ⚠️ RULE FINAL (BIAR KONSISTEN)

## ❌ Jangan:

- campur ENG + ID dalam enum yang sama
- bikin alias (LOCKED + TERKUNCI barengan)

## ✅ Harus:

- enum = Indonesia (business layer)
- schema = English (data layer)
- value = Indonesia (UI layer)

---

# 🧱 IMPACT KE SCHEMA LAIN

Yang lain **TIDAK berubah**:

- `Candidate` → tetap English
- `Bpd` → tetap English
- `BpdSupport` → tetap English
- field indikator → tetap English boolean flags
- data isi → Indonesia di seed/UI

---

# 🚀 RESULT

Sekarang sistem lo jadi:

✔ schema engineering clean (English)

✔ business state natural (Indonesia)

✔ UI readable tanpa mapping aneh

✔ ready production tanpa translator layer