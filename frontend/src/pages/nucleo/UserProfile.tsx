import { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import UserReviews from "../../components/UserReviews";
import StarRating from "../../components/StarRating";
import { useTranslation } from "react-i18next";

export default function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    (async () => {
      try {
        if (id) {
          try {
            const res = await axios.get(`/users/${id}`);
            setUser(res.data);
          } catch (e) {
            setUser(null);
          }
        } else {
          try {
            const res = await axios.get(`/user`);
            setUser(res.data);
          } catch (e) {
            setUser(null);
          }
        }


        if (id) {

          try {
            const res = await axios.get(`/users/${id}/advertisements`);
            const data = res.data;
            let arr: any[] = [];
            if (Array.isArray(data)) arr = data;
            else if (Array.isArray(data?.data)) arr = data.data;
            else if (Array.isArray(data?.items)) arr = data.items;

            if (arr.length === 0) {

              const allResp = await axios.get('/advertisements');
              const all = allResp.data;
              const list = Array.isArray(all) ? all : Array.isArray(all?.data) ? all.data : Array.isArray(all?.items) ? all.items : [];
              const filtered = list.filter((a: any) => String(a.owner_id || a.owner?.id || a.user_id || a.seller_id) === String(id));
              setAds(filtered);
            } else {
              setAds(arr || []);
            }
          } catch (e) {
            try {
              const allResp = await axios.get('/advertisements');
              const all = allResp.data;
              const list = Array.isArray(all) ? all : Array.isArray(all?.data) ? all.data : Array.isArray(all?.items) ? all.items : [];
              const filtered = list.filter((a: any) => String(a.owner_id || a.owner?.id || a.user_id || a.seller_id) === String(id));
              setAds(filtered);
            } catch (e2) {
              setAds([]);
            }
          }
        } else {
          try {
            const res = await axios.get('/my-advertisements');
            const data = res.data;
            const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : Array.isArray(data?.items) ? data.items : [];
            setAds(arr || []);
          } catch (e) {
            try {
              const allResp = await axios.get('/advertisements');
              const all = allResp.data;
              const list = Array.isArray(all) ? all : Array.isArray(all?.data) ? all.data : Array.isArray(all?.items) ? all.items : [];
              const ownerId = id ?? (user && user.id ? user.id : null);
              const filtered = list.filter((a: any) => String(a.owner_id || a.owner?.id || a.user_id || a.seller_id) === String(ownerId));
              setAds(filtered);
            } catch (e2) {
              setAds([]);
            }
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <div className="animate-spin h-12 w-12 border-b-2 border-red-700 rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-zinc-900">
        <div>
          <p className="text-xl mb-4">{t('user_profile.user_not_found', 'Usuario no encontrado')}</p>
          <Link to="/" className="text-red-500 hover:underline">{t('user_profile.back_to_home', 'Volver al inicio')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white py-6 px-4 bg-zinc-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Volver: respetando estado 'from' o 'fromAd', si existen */}
        {(() => {
          const state = (location.state || {}) as any;
          const fromPath = state.from;
          const fromAd = state.fromAd || new URLSearchParams(location.search).get('fromAd') || new URLSearchParams(location.search).get('from');

          if (fromPath) {
            return (
              <div className="lg:col-span-4">
                <Link to={fromPath} className="flex items-center text-zinc-400 hover:text-white mb-4 transition duration-200">
                  <span className="mr-2">←</span> {t('user_profile.back', 'Volver')}
                </Link>
              </div>
            );
          }

          if (fromAd) {
            const adTarget = String(fromAd).startsWith('/') ? fromAd : `/advertisement/${fromAd}`;
            return (
              <div className="lg:col-span-4">
                <Link to={adTarget} className="flex items-center text-zinc-400 hover:text-white mb-4 transition duration-200">
                  <span className="mr-2">←</span> {t('user_profile.back_to_ad', 'Volver al anuncio')}
                </Link>
              </div>
            );
          }

          return (
            <div className="lg:col-span-4">
              <button onClick={() => navigate(-1)} className="flex items-center text-zinc-400 hover:text-white mb-4 transition duration-200">
                <span className="mr-2">←</span> {t('user_profile.back', 'Volver')}
              </button>
            </div>
          );
        })()}
        <main className="lg:col-span-3">
          <div className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 mb-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-zinc-900 flex items-center justify-center text-2xl font-bold uppercase overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name || t('user_profile.profile_image', 'Perfil')} className="w-full h-full object-cover" />
                ) : (
                  <span>{user.name ? user.name[0] : 'U'}</span>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-black">{user.name || user.username}</h1>
                    <p className="text-zinc-400">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-zinc-400">{t('user_profile.ads_published', 'Anuncios publicados')}</div>
                    <div className="text-2xl font-black">{ads.length}</div>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  {user.average_rating !== undefined && (
                    <>
                      <div className="text-xl font-black">{Number(user.average_rating).toFixed(1)}</div>
                      <div className="flex items-center gap-2">
                        <StarRating value={Math.round(user.average_rating)} size={16} />
                        <div className="text-zinc-400 text-sm">({user.reviews_count || 0})</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-4">
              {(id || user?.id) && <UserReviews userId={String(id ?? user?.id)} />}
            </div>
          </div>

          <section className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700">
              <h2 className="text-xl font-bold mb-3 flex items-center justify-between">
                <span>{t('user_profile.ads_published', 'Anuncios publicados')}</span>
                <span className="text-sm text-zinc-400">{t('user_profile.ads_found', { count: ads.length, defaultValue: `${ads.length} encontrados` })}</span>
              </h2>

            {ads.length === 0 ? (
              <div className="py-8 text-center text-zinc-400">{t('user_profile.no_ads', 'Este usuario no tiene anuncios publicados.')}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ads.map((ad) => {
                  let parsedImages: any[] = [];
                  try {
                    parsedImages = typeof ad.images === 'string' ? JSON.parse(ad.images) : ad.images || [];
                  } catch (e) {
                    parsedImages = ad.images || [];
                  }
                  const imageUrl = parsedImages.length > 0 ? parsedImages[0].image_url : null;
                  const year = ad.year || ad.vehicle?.year || ad.vehicle_year;
                  const km = ad.km || ad.vehicle?.km || ad.vehicle_km;
                  return (
                    <Link key={ad.id} to={`/advertisement/${ad.id}`} className="block bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700 hover:shadow-lg transition">
                      <div className="relative">
                        <div className="w-full h-36 bg-zinc-800 overflow-hidden">
                          {imageUrl ? <img src={imageUrl} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-500">{t('user_profile.no_photo', 'SIN FOTO')}</div>}
                        </div>
                        <div className="absolute right-3 top-3 bg-red-700 text-white px-2 py-1 rounded text-sm font-bold">{Number(ad.price).toLocaleString('es-ES')} €</div>
                      </div>
                      <div className="p-3">
                        <div className="font-bold text-md">{ad.brand_name || ad.brand || ''} {ad.model_name || ad.model || ''}</div>
                        <div className="text-sm text-zinc-400 mt-1">{ad.province_name || ad.province?.name || ''}</div>
                        <div className="mt-2 text-sm text-zinc-400 flex items-center justify-between">
                          <span>{year ? `${year}` : ''}{km ? ` · ${Number(km).toLocaleString('es-ES')} km` : ''}</span>
                          <span>{t('details.views', 'Vistas')} {ad.views || 0}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <aside className="lg:col-span-1">
          <div className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 sticky top-6">
            <h3 className="font-bold mb-2">{t('user_profile.summary', 'Resumen')}</h3>
            <ul className="text-sm text-zinc-400 space-y-2">
              <li><strong className="text-white">{t('user_profile.ads_label', 'Anuncios')}:</strong> {ads.length}</li>
              <li><strong className="text-white">{t('user_profile.reviews_label', 'Valoraciones')}:</strong> {user.reviews_count || 0}</li>
              <li><strong className="text-white">{t('user_profile.member_since', 'Miembro desde')}:</strong> {user.created_at ? new Date(user.created_at).toLocaleDateString() : t('user_profile.unknown', 'Desconocido')}</li>
              <li><strong className="text-white">{t('user_profile.location_label', 'Ubicación')}:</strong> {user.province || t('user_profile.unspecified', 'No especificada')}</li>
              {user.phone && <li><strong className="text-white">{t('user_profile.phone_label', 'Teléfono')}:</strong> {user.phone}</li>}
            </ul>
            {user.bio && <p className="text-zinc-300 text-sm mt-4">{user.bio}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}