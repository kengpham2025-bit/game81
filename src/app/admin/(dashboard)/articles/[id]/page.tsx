import { notFound, redirect } from 'next/navigation';
import { articleDB } from '@/lib/db';
import ArticleForm from '../ArticleForm';

function isInvalidArticleRouteId(id: string | undefined): boolean {
  if (id == null) return true;
  const s = String(id).trim();
  return !s || s === 'undefined' || s === 'null';
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (isInvalidArticleRouteId(id)) {
    redirect('/admin/articles');
  }
  const article = await articleDB.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Chỉnh sửa bài viết</h1>
      <ArticleForm
        editArticleId={id}
        article={article as unknown as Parameters<typeof ArticleForm>[0]['article']}
      />
    </div>
  );
}
