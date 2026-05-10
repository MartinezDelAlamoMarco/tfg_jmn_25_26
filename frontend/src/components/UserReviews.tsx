// UserReviews.tsx corregido
import { useEffect, useState } from "react";
import axios from "axios";
import StarRating from "./StarRating";
import { useTranslation } from "react-i18next";

type Review = {
  id: number;
  rating: number; 
  comment: string;
  reviewer?: { id?: number; name?: string }; 
  created_at?: string;
};

export default function UserReviews({ userId }: { userId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    // Usamos la ruta relativa para evitar errores de URL mal formada
    axios
      .get(`/users/${userId}/reviews`) 
      .then((res) => {
        setReviews(res.data || []);
      })
      .catch((err) => console.error("Error al cargar reseñas:", err))
      .finally(() => setLoading(false));
  }, [userId]);

  const average = reviews.length 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-4 border-b border-zinc-700 pb-2">
        <h3 className="text-xl font-bold uppercase italic tracking-tighter text-white">
          {t('user_reviews.title', 'Valoraciones')} ({reviews.length})
        </h3>
        <div className="flex items-center gap-3 bg-zinc-900 px-3 py-1 rounded-lg border border-zinc-700 shadow-inner">
          <div className="text-xl font-black text-yellow-500">{average.toFixed(1)}</div>
          <StarRating value={Math.round(average)} size={16} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin h-6 w-6 border-b-2 border-red-700 rounded-full" />
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-zinc-500 italic text-center py-6 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
              {t('user_reviews.no_reviews', 'Sin valoraciones todavía.')}
            </p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="bg-zinc-800/40 p-4 rounded-xl border border-zinc-700/50 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-red-700 flex items-center justify-center text-[10px] font-black text-white shadow-md">
                      {r.reviewer?.name ? r.reviewer.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="font-bold text-sm text-zinc-100">{r.reviewer?.name || t('user_reviews.anonymous', 'Usuario')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating value={r.rating} size={12} />
                    <span className="text-zinc-500 text-[10px] font-medium">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
                {/* Mostramos el comentario con un estilo más destacado */}
                <div className="text-zinc-300 text-sm italic leading-relaxed pl-8 border-l-2 border-zinc-700 ml-3">
                  "{r.comment}"
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}