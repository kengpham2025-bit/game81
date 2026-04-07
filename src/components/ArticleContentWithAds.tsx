'use client';

import { useMemo } from 'react';
import { AdItem } from '@/lib/ads';
import { InArticleAd } from '@/components/InArticleAd';

type Props = {
  content: string;
  ads: AdItem[];
};

/**
 * Chèn ads vào giữa các đoạn văn của HTML content.
 * Mỗi 3 đoạn sẽ chèn 1 quảng cáo (xoay vòng qua danh sách ads).
 */
export function ArticleContentWithAds({ content, ads }: Props) {
  const contentWithAds = useMemo(() => {
    if (!ads.length || !content) return content;

    // Tách HTML thành các phần tử đoạn văn
    const paragraphRegex = /(<p[^>]*>[\s\S]*?<\/p>)/gi;
    const parts = content.split(paragraphRegex);

    if (parts.length <= 1) return content; // Không có đoạn p nào

    const result: (string | AdItem)[] = [];
    let adIndex = 0;
    let paraCount = 0;

    for (const part of parts) {
      if (part.match(paragraphRegex)) {
        result.push(part);
        paraCount++;
        // Sau mỗi 3 đoạn, chèn quảng cáo (nếu còn ads)
        if (paraCount % 3 === 0 && ads[adIndex]) {
          result.push(ads[adIndex]);
          adIndex = (adIndex + 1) % ads.length;
        }
      } else if (part.trim()) {
        result.push(part); // Giữ các phần không phải p (như thẻ khác, text thuần...)
      }
    }

    // Nếu không chèn được ads theo nhịp 3 đoạn, thử chèn ở cuối cùng
    if (adIndex === 0 && ads.length > 0 && paraCount > 0) {
      // Chèn quảng cáo cuối cùng
      result.push(ads[0]);
    }

    return result;
  }, [content, ads]);

  if (!Array.isArray(contentWithAds)) {
    return (
      <article
        className="game8-prose max-w-none"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  return (
    <article className="game8-prose max-w-none">
      {contentWithAds.map((part, idx) => {
        if (
          typeof part === 'object' &&
          part !== null &&
          '_id' in part &&
          ((part as AdItem).imageUrl?.trim() ||
            ((part as AdItem).adText?.trim() && (part as AdItem).linkUrl))
        ) {
          return <InArticleAd key={`ad-${idx}`} ad={part as AdItem} />;
        }
        return (
          <div key={idx} dangerouslySetInnerHTML={{ __html: part }} />
        );
      })}
    </article>
  );
}
