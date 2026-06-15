import { NextResponse } from 'next/server';
// Pastikan path import ini sesuai dengan file supabase kamu (biasanya di src/lib/supabase.ts)
import { supabase } from '@/lib/supabase'; 

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Pastikan webhook ini menerima pesan teks dari user
    const messageText = body.message?.text;
    const messageId = body.message?.message_id;

    if (!messageText) {
      // Balas OK ke Telegram kalau isinya bukan teks (misal stiker/gambar) biar dicuekin aja
      return NextResponse.json({ status: 'ignored, bukan teks' });
    }

    // Logika memisahkan URL dan Note persis seperti kodemu sebelumnya
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const foundUrls = messageText.match(urlRegex);
    
    let extractedUrl = "Pesan Telegram (Tanpa Link)";
    let extractedNote = messageText.trim();
    
    if (foundUrls) { 
      extractedUrl = foundUrls[0]; 
      extractedNote = messageText.replace(extractedUrl, '').trim(); 
    }
    if (!extractedNote) extractedNote = "Tanpa catatan tambahan.";

    // Simpan langsung ke Supabase dari sisi Server
    const { error } = await supabase
      .from('bank_items') // PENTING: Ganti dengan nama tabel Supabase kamu kalau beda!
      .insert([
        { 
          id: `tg-${messageId}`, 
          url: extractedUrl, 
          note: extractedNote, 
          source: 'Telegram' 
          // Tanggal otomatis diset dari Supabase jika kolom dateAdded pakai default now()
        }
      ]);

    if (error) {
        console.error("Error simpan ke Supabase:", error);
        throw error;
    }

    // PENTING: Selalu balas HTTP 200 OK agar Telegram tau pesannya sudah masuk
    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}