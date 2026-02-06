import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BRVM Monitor - Dashboard',
  description: 'Surveillance automatisee du marche BRVM avec alertes intelligentes',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <div className="min-h-screen">
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <span className="text-xl font-bold text-gray-900">BRVM Monitor</span>
                </div>
                <div className="flex items-center space-x-8">
                  <a href="/" className="text-gray-600 hover:text-gray-900 font-medium">Accueil</a>
                  <a href="/market" className="text-gray-600 hover:text-gray-900 font-medium">Marche</a>
                  <a href="/portfolio" className="text-gray-600 hover:text-gray-900 font-medium">Portfolio</a>
                  <a href="/alerts" className="text-gray-600 hover:text-gray-900 font-medium">Alertes</a>
                  <a href="/settings" className="text-gray-600 hover:text-gray-900 font-medium">Config</a>
                </div>
              </div>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
