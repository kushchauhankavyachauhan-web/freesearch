import './globals.css';
import StoreProvider from '../components/StoreProvider.jsx';
import Navigation from '../components/Navigation.jsx';

export const metadata = {
  title: 'ScrapDevIQ — Turn E-Waste into IQ',
  description: 'AI-powered e-waste lifecycle platform. Predict. Resell. Prove it.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Navigation />
          <main className="pt-14 min-h-screen bg-bg">
            {children}
          </main>
        </StoreProvider>
      </body>
    </html>
  );
}
