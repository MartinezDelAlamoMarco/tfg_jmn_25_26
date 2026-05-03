import { useEffect, useState } from "react";
import axios from "axios";
import StarRating from "./StarRating";
import { useTranslation } from "react-i18next";

type Review = {
  id: number;
  stars: number;
  comment: string;
  author?: { id?: number; name?: string };
  created_at?: string;
};

export default function UserReviews({ userId }: { userId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/users/${userId}/reviews`)
      .then((res) => setReviews(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    // Endpoint confirms whether the authenticated user can review this profile
    axios
      .get(`/users/${userId}/can-review`)
      .then((res) => setCanReview(Boolean(res.data?.can_review)))
      .catch(() => setCanReview(false));
  }, [userId]);

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert(t('user_reviews.empty_comment', 'Escribe una opinión antes de enviar.'));
      return;
    }
    if (rating < 1) {
      alert(t('user_reviews.min_star', 'Selecciona al menos 1 estrella.'));
      return;
    }
    setSubmitting(true);
    try {
      await axios.post(`/users/${userId}/reviews`, { rating: rating, comment });
      setComment("");
      const resp = await axios.get(`/users/${userId}/reviews`);
      setReviews(resp.data || []);
      alert(t('user_reviews.sent_success', 'Valoración enviada'));
    } catch (err) {
      console.error(err);
      alert(t('user_reviews.sent_error', 'Error enviando la valoración'));
    } finally {
      setSubmitting(false);
    }
  };

  const average = reviews.length ? reviews.reduce((s, r) => s + r.stars, 0) / reviews.length : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold">{t('user_reviews.title', 'Valoraciones')} ({reviews.length})</h3>
        <div className="flex items-center gap-3">
          <div className="text-2xl font-black">{average.toFixed(1)}</div>
          <StarRating value={Math.round(average)} size={18} />
        </div>
      </div>

      {loading ? (
        <div className="animate-spin h-8 w-8 border-b-2 border-red-700 rounded-full" />
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 && <p className="text-zinc-400">{t('user_reviews.no_reviews', 'Sin valoraciones todavía.')}</p>}
          {reviews.map((r) => (
            <div key={r.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
              <div className="flex justify-between items-center mb-2">
                <div className="font-bold">{r.author?.name || t('user_reviews.anonymous', 'Usuario')}</div>
                <div className="flex items-center gap-2">
                  <StarRating value={r.stars} size={16} />
                  <span className="text-zinc-400 text-sm">{r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</span>
                </div>
              </div>
              <div className="text-zinc-300">{r.comment}</div>
            </div>
          ))}
        </div>
      )}

      {canReview && (
        <form onSubmit={submitReview} className="mt-6 bg-zinc-800 p-4 rounded-lg border border-zinc-700">
          <h4 className="font-bold mb-2">{t('user_reviews.write_review', 'Escribe una valoración')}</h4>
          <StarRating value={rating} editable onChange={(v) => setRating(v)} />
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full mt-2 p-3 bg-zinc-900 border border-zinc-700 rounded" rows={4} />
          <button disabled={submitting} className="mt-3 bg-red-700 hover:bg-red-600 px-4 py-2 rounded text-white">
            {submitting ? t('user_reviews.sending', 'Enviando...') : t('user_reviews.submit', 'Enviar valoración')}
          </button>
        </form>
      )}

      {!canReview && (
        <p className="text-sm text-zinc-500 mt-4 italic">{t('user_reviews.only_after_transaction', 'Solo puedes valorar a usuarios con los que hayas realizado una compra/venta.')}</p>
      )}
    </div>
  );
}
