/**
 * Aggiorna dinamicamente il manifest della PWA con i valori da ConfigPWA
 */
export async function updateManifest(config) {
  if (!config) return;

  try {
    // Crea un manifest dinamico con i valori da ConfigPWA
    const manifest = {
      name: config.shop_name || 'BarberBro Booking',
      short_name: config.shop_name?.substring(0, 12) || 'BarberBro',
      description: config.shop_tagline || 'Prenota il tuo taglio in pochi tap',
      theme_color: config.primary_color || '#C19A6B',
      background_color: '#1F1F1F',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/barberbro-pwa/',
      start_url: '/barberbro-pwa/',
      icons: [
        {
          src: '/barberbro-pwa/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/barberbro-pwa/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    };

    // Converti in blob
    const manifestBlob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(manifestBlob);

    // Rimuovi vecchio link manifest se esiste
    const existingLink = document.querySelector('link[rel="manifest"]');
    if (existingLink) {
      existingLink.remove();
    }

    // Aggiungi nuovo link manifest dinamico
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = manifestURL;
    document.head.appendChild(link);

    // Aggiorna anche il title e meta description
    document.title = `${config.shop_name || 'BarberBro'} - Prenota`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.content = config.shop_tagline || 'Prenota il tuo taglio in pochi tap';
    }

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = config.primary_color || '#C19A6B';
    }

    console.log('✅ Manifest PWA aggiornato dinamicamente:', manifest.name);
  } catch (error) {
    console.error('❌ Errore aggiornamento manifest:', error);
  }
}

