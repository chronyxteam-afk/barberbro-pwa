import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useStore } from '../store/useStore';
import { useState } from 'react';

export default function LoginScreen() {
  const { config, login } = useStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleProcessing, setGoogleProcessing] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    
    try {
      // Decodifica JWT token di Google per ottenere email
      const decoded = jwtDecode(credentialResponse.credential);
      const email = decoded.email;
      const name = decoded.name;
      
      console.log('✅ Google OAuth success:', { email, name });
      
      // Chiama API login backend
      const result = await login(email, name);
      
      if (!result.success) {
        setError(result.error || 'Errore durante il login');
      }
      // Se successo, useStore gestisce redirect automatico
      
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err.message || 'Errore imprevisto durante il login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Accesso Google annullato o fallito');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f5f7] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Nome */}
        <div className="text-center mb-8">
          {config?.shop_logo_url ? (
            <img 
              src={config.shop_logo_url} 
              alt={config.shop_name}
              className="w-24 h-24 mx-auto rounded-[24px] shadow-lg mb-4"
            />
          ) : (
            <div 
              className="w-24 h-24 mx-auto rounded-[24px] flex items-center justify-center mb-4 shadow-lg"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))`
              }}
            >
              <span className="text-white text-4xl">💈</span>
            </div>
          )}
          
          <h1 className="text-3xl font-bold text-[#1d1d1f] mb-2">
            {config?.shop_name || 'BarberBro'}
          </h1>
          
          {config?.shop_tagline && (
            <p className="text-[#86868b] text-sm">
              {config.shop_tagline}
            </p>
          )}
        </div>

        {/* Card Login */}
        <div className="bg-white rounded-[20px] shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] text-center mb-2">
            Accedi per prenotare
          </h2>
          
          <p className="text-[#86868b] text-center mb-8 text-sm">
            {config?.login_required_message || 'Usa il tuo account Google per accedere in modo sicuro'}
          </p>

          {/* Google Login Button */}
          <div className="flex justify-center mb-6">
            {loading || googleProcessing ? (
              <div className="w-full h-12 bg-[#f5f5f7] rounded-[12px] flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[#86868b] text-sm">
                  {googleProcessing ? 'Connessione in corso...' : 'Verifica account...'}
                </span>
              </div>
            ) : (
              <div 
                onClick={() => setGoogleProcessing(true)}
                className="relative"
              >
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={(err) => {
                    setGoogleProcessing(false);
                    handleGoogleError(err);
                  }}
                  useOneTap={false}
                  text="signin_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  width="300"
                />
              </div>
            )}
          </div>

          {/* Errore */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-[12px] p-4 mb-4">
              <div className="flex items-start">
                <span className="text-red-500 mr-2 flex-shrink-0">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-800 text-sm font-medium mb-1">Errore di accesso</p>
                  <p className="text-red-600 text-xs">{error}</p>
                  
                  {error.includes('non registrata') || error.includes('non abilitato') ? (
                    <div className="mt-3 pt-3 border-t border-red-200">
                      <p className="text-red-700 text-xs font-medium mb-2">Cosa fare:</p>
                      <ul className="text-red-600 text-xs space-y-1 ml-4 list-disc">
                        <li>Contatta il negozio per registrarti</li>
                        <li>Verifica di usare l'email corretta</li>
                        {config?.phone_contact && (
                          <li>
                            Chiama: <a href={`tel:${config.phone_contact}`} className="underline font-medium">{config.phone_contact}</a>
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* Info Sicurezza */}
          <div className="text-center">
            <p className="text-[#86868b] text-xs">
              🔒 Accesso sicuro tramite Google OAuth
              <br />
              Non memorizziamo password
            </p>
          </div>
        </div>

        {/* Footer Contatti */}
        {(config?.phone_contact || config?.email_contact) && (
          <div className="text-center space-y-2">
            <p className="text-[#86868b] text-xs">Non hai un account?</p>
            <div className="flex justify-center gap-4">
              {config.phone_contact && (
                <a 
                  href={`tel:${config.phone_contact}`}
                  className="text-[#007AFF] text-sm font-medium hover:underline"
                >
                  📞 Chiamaci
                </a>
              )}
              {config.email_contact && (
                <a 
                  href={`mailto:${config.email_contact}`}
                  className="text-[#007AFF] text-sm font-medium hover:underline"
                >
                  ✉️ Email
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
