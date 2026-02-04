import Link from 'next/link';
import UploadForm from '@/components/UploadForm';

export default function CreatePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              DossierPro
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Create Your Rental Dossier
          </h1>
          <p className="text-lg text-gray-600">
            Follow the steps below to create your professional rental application
          </p>
        </div>

        <UploadForm />
      </main>
    </div>
  );
}
