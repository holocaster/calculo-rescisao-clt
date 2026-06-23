interface Props {
  size: 'leaderboard' | 'retangulo';
}

// Liga/desliga os espaços de anúncio. Reativar numa próxima versão.
export const ANUNCIOS_ATIVOS = false;

// Slot placeholder de anúncio. Substituir pelo código real (ex.: Google AdSense).
export function EspacoAnuncio({ size }: Props) {
  if (!ANUNCIOS_ATIVOS) return null;
  return (
    <div className={`ad-slot ad-slot--${size}`}>
      <span className="ad-slot__text">
        {size === 'leaderboard' ? 'Anúncio 728 x 90' : 'Anúncio 300 x 250'}
      </span>
    </div>
  );
}
