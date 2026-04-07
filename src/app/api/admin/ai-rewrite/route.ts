import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error('Không được phép');
  return user;
}

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_URL || 'https://gameviet.io.vn';

// ============ CONFIG FUNCTIONS ============

function getGroqApiKeys(): string[] {
  const raw = process.env.GROQ_API_KEY;
  if (!raw) return [];
  
  // Hỗ trợ nhiều key, cách nhau bằng dấu phẩy
  const keys = raw.split(',').map(k => k.trim().replace(/^["']|["']$/g, '')).filter(k => k.length > 0);
  return keys;
}

function getGeminiApiKey(): string | null {
  const raw =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY;
  if (!raw) return null;
  const k = raw.trim().replace(/^["']|["']$/g, '');
  return k.length > 0 ? k : null;
}

// ============ AI PROVIDERS ============

/**
 * Gọi Groq (miễn phí, cloud - tốt nhất cho production)
 * Đăng ký: https://console.groq.com
 */
async function callGroq(apiKey: string, prompt: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a professional Vietnamese news editor. Always respond in JSON format.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 8192,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq error: ${response.status} - ${err}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  };

  if (data.error) throw new Error(`Groq error: ${data.error.message}`);
  if (!data.choices?.[0]?.message?.content) throw new Error('Groq no response');

  return data.choices[0].message.content;
}

/**
 * Gọi Gemini (có quota miễn phí giới hạn)
 */
async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

/**
 * Retry wrapper cho Gemini (khi bị rate limit)
 */
async function callGeminiWithRetry(
  apiKey: string,
  prompt: string,
  maxRetries = 3
): Promise<string> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await callGemini(apiKey, prompt);
    } catch (error: any) {
      const is429 = error.status === 429 || error.message?.includes('429');
      if (!is429 || attempt === maxRetries - 1) throw error;
      const delay = 2000 * Math.pow(2, attempt);
      console.log(`Gemini rate limit, retry in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error('Gemini retry failed');
}

// ============ MAIN HANDLER ============

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { title, content, excerpt, tags, metaTitle, metaDescription, thumbnail, images } = body;
    if (!content) return NextResponse.json({ error: 'Thiếu nội dung' }, { status: 400 });

    // Bảo vệ ảnh trong HTML: thay thẻ <img> bằng placeholder, sau khi AI trả về sẽ ghép lại
    const imgTagRegex = /<img\s[^>]*>/gi;
    const imgTags: string[] = [];
    let contentForAI = content.replace(imgTagRegex, (match: string) => {
      imgTags.push(match);
      return `<!--IMG${imgTags.length - 1}-->`;
    });

    const prompt = `Bạn là biên tập viên SEO chuyên nghiệp cho trang tin game Việt Nam. Nhiệm vụ: viết lại nội dung để TRÁNH TRÙNG LẶP (duplicate content) với trang nguồn gốc, tốt cho SEO Google.

HƯỚNG DẪN BIÊN TẬP:
1. DIỄN ĐẠT LẠI: thay đổi cách viết, dùng từ đồng nghĩa, đảo ngữ, tách/gộp câu. Không copy y chang bất kỳ câu nào.
2. GIỮ NGUYÊN BỐ CỤC: giữ đúng cấu trúc HTML (thẻ p, h2, h3, ul, li, strong...) và thứ tự các đoạn văn như bài gốc.
3. GIỮ NGUYÊN PLACEHOLDER ẢNH: trong nội dung có các chuỗi <!--IMG0-->, <!--IMG1-->, ... (đại diện ảnh). KHÔNG xóa, KHÔNG đổi, KHÔNG thêm ký tự vào các placeholder này - trả về y nguyên từng <!--IMGn-->.
4. GIỮ NGUYÊN LINK ẢNH: thumbnail và danh sách images - trả về đúng URL gốc, không thay đổi.
5. THÊM GIÁ TRỊ: thêm góc nhìn, bổ sung thông tin, câu mở đầu và kết luận hấp dẫn.
6. TỐI ƯU SEO: nhẹ nhàng chèn từ khóa, viết meta title/description hấp dẫn.

Trả về JSON với đúng 8 key:
   - "title" (viết lại tiêu đề mới, khác với gốc)
   - "excerpt" (mô tả ngắn 150-200 ký tự, hấp dẫn)
   - "content" (HTML đã viết lại, BẮT BUỘC giữ nguyên mọi <!--IMG0-->, <!--IMG1-->, ...)
   - "tags" (danh sách tags, cách nhau bởi dấu phẩy, tiếng Việt)
   - "metaTitle" (SEO title, khoảng 50-60 ký tự)
   - "metaDescription" (SEO description, khoảng 150-160 ký tự)
   - "thumbnail" (GIỮ NGUYÊN URL ảnh đại diện gốc - không đổi)
   - "images" (GIỮ NGUYÊN danh sách URL ảnh trong bài gốc, mỗi URL một dòng - không đổi)

Nội dung gốc cần viết lại:
Tiêu đề gốc: ${title || 'Không có'}
Excerpt gốc: ${excerpt || 'Không có'}
Tags gốc: ${tags || 'Không có'}
Meta Title gốc: ${metaTitle || 'Không có'}
Meta Description gốc: ${metaDescription || 'Không có'}
Ảnh đại diện (THUMBNAIL - GIỮ NGUYÊN): ${thumbnail || 'Không có'}
Danh sách ảnh trong bài (IMAGES - GIỮ NGUYÊN):
${(images || []).join('\n') || 'Không có'}
Nội dung (HTML, có placeholder ảnh <!--IMG0--> etc - không xóa placeholder):
${contentForAI.slice(0, 28000)}

YÊU CẦU QUAN TRỌNG:
- Viết lại content đủ khác biệt để Google không đánh duplicate (thay đổi ít nhất 60-70% cách diễn đạt)
- GIỮ NGUYÊN bố cục HTML và thứ tự đoạn văn
- GIỮ NGUYÊN tất cả placeholder <!--IMGn--> trong content
- GIỮ NGUYÊN link ảnh (thumbnail, images)
- Chỉ trả về JSON, không giải thích.`;

    let text: string | null = null;
    let usedProvider = '';
    const errors: string[] = [];

    // 1. Groq (ưu tiên - miễn phí, cloud) - thử tất cả các key
    const groqKeys = getGroqApiKeys();
    if (groqKeys.length > 0) {
      for (let i = 0; i < groqKeys.length; i++) {
        try {
          console.log(`[AI] Using Groq key ${i + 1}/${groqKeys.length}...`);
          text = await callGroq(groqKeys[i], prompt);
          usedProvider = 'groq';
          break; // Thành công, thoát vòng lặp
        } catch (e: any) {
          console.log(`[AI] Groq key ${i + 1} failed:`, e.message);
          errors.push(`Groq key ${i + 1}: ${e.message}`);
          // Nếu là rate limit (429) hoặc quota exceeded, thử key tiếp theo
          const is429 = e.message?.includes('429') || e.message?.includes('rate_limit') || e.message?.includes('quota');
          if (!is429) break; // Lỗi khác, không thử tiếp
        }
      }
    }

    // 2. Gemini (fallback)
    if (!text) {
      const geminiKey = getGeminiApiKey();
      if (geminiKey) {
        try {
          console.log('[AI] Using Gemini (fallback)...');
          text = await callGeminiWithRetry(geminiKey, prompt);
          usedProvider = 'gemini';
        } catch (e: any) {
          console.log('[AI] Gemini failed:', e.message);
          const is429 = e.status === 429 || e.message?.includes('429');
          if (is429) {
            return NextResponse.json({
              error: 'Tất cả AI providers đều lỗi hoặc quota hết.\n\nThêm GROQ_API_KEY vào .env để dùng miễn phí.',
            }, { status: 429 });
          }
          errors.push(`Gemini: ${e.message}`);
        }
      }
    }

    // Không có provider nào khả dụng
    if (!text) {
      return NextResponse.json({
        error: `Chưa cấu hình AI provider nào.\n\nCấu hình:\n\n1. Groq (khuyên dùng - miễn phí):\n   GROQ_API_KEY=gsk_... (lấy tại console.groq.com)\n\n2. Gemini (có quota giới hạn):\n   GEMINI_API_KEY=AIza...`,
      }, { status: 500 });
    }

    // Parse kết quả
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: 'AI không trả về JSON hợp lệ' }, { status: 500 });

    const parsed = JSON.parse(jsonMatch[0]) as {
      title?: string;
      excerpt?: string;
      content?: string;
      tags?: string;
      metaTitle?: string;
      metaDescription?: string;
      thumbnail?: string;
      images?: string;
    };

    // Luôn dùng link ảnh gốc - không thay đổi thumbnail và danh sách images
    const originalImages = Array.isArray(images) ? (images as string[]).join('\n') : (typeof images === 'string' ? images : '');
    let finalContent = parsed.content || content;
    // Khôi phục thẻ <img> từ placeholder trong content (tránh AI làm mất ảnh)
    if (imgTags.length > 0) {
      finalContent = finalContent.replace(/<!--IMG(\d+)-->/g, (_: string, n: string) => {
        const i = parseInt(n, 10);
        return i >= 0 && i < imgTags.length ? imgTags[i] : '';
      });
    }

    return NextResponse.json({
      title: parsed.title || title,
      excerpt: parsed.excerpt || excerpt,
      content: finalContent,
      tags: parsed.tags || tags,
      metaTitle: parsed.metaTitle || metaTitle,
      metaDescription: parsed.metaDescription || metaDescription,
      thumbnail: thumbnail || '', // Luôn dùng ảnh đại diện gốc, không đổi link
      images: originalImages, // Luôn dùng danh sách ảnh gốc, không đổi link
      _provider: usedProvider,
    });
  } catch (e) {
    if ((e as Error).message === 'Không được phép') return NextResponse.json({ error: 'Không được phép' }, { status: 401 });
    console.error('[AI] Error:', e);
    return NextResponse.json({ error: (e as Error).message || 'Lỗi AI' }, { status: 500 });
  }
}
