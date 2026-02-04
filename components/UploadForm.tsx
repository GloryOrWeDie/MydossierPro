'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isValidEmail } from '@/lib/utils';
import FileUploader from './FileUploader';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import Card from './ui/Card';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
}

interface ApplicationData {
  propertyAddress: string;
  landlordName: string;
  moveInDate: string;
  numOccupants: string;
  employer: string;
  jobTitle: string;
  monthlyIncome: string;
  yearsAtJob: string;
  reasonForMoving: string;
  personalMessage: string;
  currentAddress: string;
  dateOfBirth: string;
  householdType: string;
  numChildren: string;
  childrenAges: string;
  smoking: string;
  hasPets: string;
  petTypes: string[];
  numPets: string;
  dogDetails: string;
  catDetails: string;
  hasVehicle: string;
  parkingNeeded: string;
}

export default function UploadForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    city: '',
  });

  const [applicationData, setApplicationData] = useState<ApplicationData>({
    propertyAddress: '',
    landlordName: '',
    moveInDate: '',
    numOccupants: '',
    employer: '',
    jobTitle: '',
    monthlyIncome: '',
    yearsAtJob: '',
    reasonForMoving: '',
    personalMessage: '',
    currentAddress: '',
    dateOfBirth: '',
    householdType: '',
    numChildren: '0',
    childrenAges: '',
    smoking: '',
    hasPets: '',
    petTypes: [],
    numPets: '1',
    dogDetails: '',
    catDetails: '',
    hasVehicle: '',
    parkingNeeded: '1',
  });

  const [documents, setDocuments] = useState<Array<{file: File, description: string}>>([]);
  const [newDocDescription, setNewDocDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validateStep1 = (): boolean => {
    const errors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.city.trim() || formData.city.trim().length < 2) {
      errors.city = 'City must be at least 2 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    // Documents are now optional - no validation needed
    return true;
  };

  const validateStep3 = (): boolean => {
    if (!applicationData.propertyAddress.trim()) {
      setError('Property address is required');
      return false;
    }
    if (!applicationData.moveInDate) {
      setError('Move-in date is required');
      return false;
    }
    if (!applicationData.numOccupants) {
      setError('Number of occupants is required');
      return false;
    }
    if (!applicationData.employer.trim()) {
      setError('Employer is required');
      return false;
    }
    if (!applicationData.jobTitle.trim()) {
      setError('Job title is required');
      return false;
    }
    if (!applicationData.monthlyIncome.trim()) {
      setError('Monthly income is required');
      return false;
    }
    if (!applicationData.yearsAtJob) {
      setError('Years at current job is required');
      return false;
    }
    if (!applicationData.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    if (!applicationData.householdType) {
      setError('Household type is required');
      return false;
    }
    if (!applicationData.smoking) {
      setError('Smoking status is required');
      return false;
    }
    if (!applicationData.hasPets) {
      setError('Please specify if you have pets');
      return false;
    }
    if (!applicationData.hasVehicle) {
      setError('Please specify if you have a vehicle');
      return false;
    }
    return true;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/create-tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || undefined,
          city: formData.city,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create tenant record');
      }

      const data = await response.json();
      setTenantId(data.tenantId);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError('File too large. Maximum size is 5MB.');
        return;
      }
      
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload PDF, JPG, or PNG.');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
    }
  };

  const addDocument = () => {
    if (!selectedFile || !newDocDescription.trim()) {
      setError('Please provide both a description and a file.');
      return;
    }
    
    setDocuments([...documents, {
      file: selectedFile,
      description: newDocDescription.trim()
    }]);
    
    // Reset inputs
    setNewDocDescription('');
    setSelectedFile(null);
    
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    setError(null);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const handleStep2Continue = async () => {
    if (!validateStep2() || !tenantId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Upload all documents (if any)
      if (documents.length > 0) {
        console.log(`Uploading ${documents.length} documents for tenant ${tenantId}`);
        const uploadPromises = documents.map((doc, index) => {
          console.log(`Uploading document ${index + 1}: ${doc.description} - ${doc.file.name}`);
          return uploadFile(tenantId, doc.file, doc.description);
        });
        const results = await Promise.all(uploadPromises);
        console.log('All documents uploaded successfully:', results);
        
        // Small delay to ensure database consistency
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.log('No documents to upload, proceeding to next step');
      }
      setStep(3);
    } catch (err) {
      console.error('Error uploading documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload files. Please try again.');
      setIsLoading(false);
      return; // Don't proceed to next step if upload fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep3Continue = async () => {
    if (!validateStep3() || !tenantId) return;

    setIsLoading(true);
    setError(null);

    try {
      // Update tenant with application details
      const updateResponse = await fetch('/api/update-tenant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId,
          property_address: applicationData.propertyAddress,
          landlord_name: applicationData.landlordName || undefined,
          move_in_date: applicationData.moveInDate || undefined,
          num_occupants: applicationData.numOccupants ? parseInt(applicationData.numOccupants) : undefined,
          employer: applicationData.employer,
          job_title: applicationData.jobTitle,
          monthly_income: applicationData.monthlyIncome ? parseFloat(applicationData.monthlyIncome) : undefined,
          years_at_job: applicationData.yearsAtJob || undefined,
          reason_for_moving: applicationData.reasonForMoving || undefined,
          personal_message: applicationData.personalMessage || undefined,
          current_address: applicationData.currentAddress || undefined,
          date_of_birth: applicationData.dateOfBirth || undefined,
          household_type: applicationData.householdType || undefined,
          num_children: applicationData.numChildren || undefined,
          children_ages: applicationData.childrenAges || undefined,
          smoking: applicationData.smoking || undefined,
          has_pets: applicationData.hasPets || undefined,
          pet_types: applicationData.petTypes && applicationData.petTypes.length > 0 ? applicationData.petTypes : undefined,
          num_pets: applicationData.numPets || undefined,
          dog_details: applicationData.dogDetails || undefined,
          cat_details: applicationData.catDetails || undefined,
          has_vehicle: applicationData.hasVehicle || undefined,
          parking_needed: applicationData.parkingNeeded || undefined,
        }),
      });

      if (!updateResponse.ok) {
        const data = await updateResponse.json();
        throw new Error(data.error || 'Failed to update application details');
      }

      // Generate link automatically (FREE MODE - no payment needed)
      const linkResponse = await fetch('/api/generate-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenantId }),
      });

      if (!linkResponse.ok) {
        const errorData = await linkResponse.json();
        throw new Error(errorData.error || 'Failed to generate link');
      }

      const linkData = await linkResponse.json();

      // Redirect to success page with the slug
      router.push(`/success?slug=${linkData.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete application. Please try again.');
      setIsLoading(false);
    }
  };

  const uploadFile = async (id: string, file: File, description: string): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tenantId', id);
    formData.append('description', description);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json();
      console.error('Upload error:', data);
      const errorMessage = data.details 
        ? `${data.error}: ${data.details}`
        : (data.error || 'Upload failed');
      throw new Error(errorMessage);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleApplicationDataChange = (field: keyof ApplicationData, value: string) => {
    setApplicationData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Step {step} of 3</span>
          <span className="text-sm text-gray-500">{Math.round((step / 3) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-6 md:p-8">
        {step === 1 && (
          <form onSubmit={handleStep1Submit}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>

            <div className="space-y-4 mb-6">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                error={formErrors.fullName}
                required
                placeholder="John Smith"
              />

              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={formErrors.email}
                required
                placeholder="john@example.com"
              />

              <Input
                label="Phone (Optional)"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="555-123-4567"
              />

              <Input
                label="City"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                error={formErrors.city}
                required
                placeholder="Montreal"
              />
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
              Continue to Upload Documents
            </Button>
          </form>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Documents (Optional)</h2>
            <p className="text-gray-600 mb-6">
              Add any documents that support your application. You can add as many or as few as you like.
            </p>
            
            {/* List of uploaded documents */}
            {documents.length > 0 && (
              <div className="space-y-3 mb-6">
                {documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{doc.description}</p>
                        <p className="text-sm text-gray-500">{doc.file.name} ({(doc.file.size / 1024).toFixed(1)} KB)</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-800 ml-4"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add new document */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What type of document is this?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Pay Stub, Previous Lease, Photo ID, Reference Letter, Bank Statement..."
                    value={newDocDescription}
                    onChange={(e) => setNewDocDescription(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload File
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    PDF, JPG, or PNG - Max 5MB per file
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={addDocument}
                  disabled={!newDocDescription || !selectedFile}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  + Add Document
                </button>
              </div>
            </div>
            
            {/* Suggestions */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-900 mb-2">💡 Commonly uploaded documents:</p>
              <div className="flex flex-wrap gap-2">
                {['Pay Stub', 'Previous Lease', 'Photo ID', 'Reference Letter', 'Bank Statement', 'Employment Letter'].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setNewDocDescription(suggestion)}
                    className="text-xs px-3 py-1 bg-white border border-blue-300 text-blue-700 rounded-full hover:bg-blue-100"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleStep2Continue}
                variant="primary"
                isLoading={isLoading}
                className="flex-1"
              >
                Continue to Application Details
              </Button>
            </div>
            
            {/* Skip option */}
            <p className="text-center text-gray-500 mt-6">
              Don't have documents ready? <button type="button" onClick={() => setStep(3)} className="text-blue-600 underline">Skip for now</button>
            </p>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Tell us about this application</h2>
              <p className="text-gray-600 mt-2">We'll use this info to create a professional PDF for the landlord</p>
            </div>

            <div className="space-y-6">
              {/* Property Address */}
              <Input
                label="Property Address"
                value={applicationData.propertyAddress}
                onChange={(e) => handleApplicationDataChange('propertyAddress', e.target.value)}
                required
                placeholder="e.g., 123 rue St-Denis, Montreal, QC H2X 1K9"
              />

              {/* Landlord Name */}
              <Input
                label="Landlord Name (optional)"
                value={applicationData.landlordName}
                onChange={(e) => handleApplicationDataChange('landlordName', e.target.value)}
                placeholder="e.g., M. Jean Tremblay"
              />
              <p className="text-sm text-gray-500 -mt-4">We'll personalize the cover letter if you provide this</p>

              {/* Move-in Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desired Move-in Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={applicationData.moveInDate}
                  onChange={(e) => handleApplicationDataChange('moveInDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Number of Occupants */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Occupants <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={applicationData.numOccupants}
                  onChange={(e) => handleApplicationDataChange('numOccupants', e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="1">1 person (myself only)</option>
                  <option value="2">2 people</option>
                  <option value="3">3 people</option>
                  <option value="4">4 people</option>
                  <option value="5">5 or more people</option>
                </select>
              </div>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Information</h3>

                {/* Current Employer */}
                <div className="mb-4">
                  <Input
                    label="Current Employer"
                    value={applicationData.employer}
                    onChange={(e) => handleApplicationDataChange('employer', e.target.value)}
                    required
                    placeholder="e.g., Desjardins, Google, Self-employed"
                  />
                </div>

                {/* Job Title */}
                <div className="mb-4">
                  <Input
                    label="Job Title"
                    value={applicationData.jobTitle}
                    onChange={(e) => handleApplicationDataChange('jobTitle', e.target.value)}
                    required
                    placeholder="e.g., Software Developer, Manager, Consultant"
                  />
                </div>

                {/* Monthly Income */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Income (before taxes) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-500">$</span>
                    <input
                      type="number"
                      required
                      placeholder="4500"
                      min="0"
                      step="100"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={applicationData.monthlyIncome}
                      onChange={(e) => handleApplicationDataChange('monthlyIncome', e.target.value)}
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">This helps landlords verify you can afford the rent</p>
                </div>

                {/* Years at Job */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years at Current Job <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={applicationData.yearsAtJob}
                    onChange={(e) => handleApplicationDataChange('yearsAtJob', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="Less than 1 year">Less than 1 year</option>
                    <option value="1-2 years">1-2 years</option>
                    <option value="2-5 years">2-5 years</option>
                    <option value="5+ years">5+ years</option>
                  </select>
                </div>
              </div>

              {/* Reason for Moving */}
              <Textarea
                label="Reason for Moving (optional)"
                rows={3}
                placeholder="e.g., Closer to work, need more space, current lease ending..."
                value={applicationData.reasonForMoving}
                onChange={(e) => handleApplicationDataChange('reasonForMoving', e.target.value)}
                maxLength={200}
              />
              <p className="text-sm text-gray-500 -mt-4">{applicationData.reasonForMoving.length}/200 characters</p>

              {/* Personal Message */}
              <Textarea
                label="Personal Message to Landlord (optional)"
                rows={4}
                placeholder="e.g., I visited your property yesterday and loved the natural light in the living room. I'm a quiet professional looking for a long-term home..."
                value={applicationData.personalMessage}
                onChange={(e) => handleApplicationDataChange('personalMessage', e.target.value)}
                maxLength={500}
              />
              <p className="text-sm text-gray-500 -mt-4">{applicationData.personalMessage.length}/500 characters</p>

              {/* === SECTION: CURRENT ADDRESS (OPTIONAL) === */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Current Living Situation (Optional)
                </h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Address (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 456 rue St-Laurent, Montreal, QC"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={applicationData.currentAddress}
                    onChange={(e) => handleApplicationDataChange('currentAddress', e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Optional: Helps show your rental history
                  </p>
                </div>
              </div>

              {/* === SECTION: PERSONAL DETAILS === */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  About You
                </h3>
                
                {/* Age / Date of Birth */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={applicationData.dateOfBirth}
                    onChange={(e) => handleApplicationDataChange('dateOfBirth', e.target.value)}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Must be 18 or older
                  </p>
                </div>
                
                {/* Household Type */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Household Type *
                  </label>
                  <select
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={applicationData.householdType}
                    onChange={(e) => handleApplicationDataChange('householdType', e.target.value)}
                  >
                    <option value="">Select...</option>
                    <option value="single">Single (living alone)</option>
                    <option value="couple">Couple (2 adults)</option>
                    <option value="family">Family (with children)</option>
                    <option value="roommates">Roommates / Colocation</option>
                  </select>
                </div>
                
                {/* If Family - Children Details */}
                {applicationData.householdType === 'family' && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Number of Children
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                      value={applicationData.numChildren}
                      onChange={(e) => handleApplicationDataChange('numChildren', e.target.value)}
                    >
                      <option value="0">No children</option>
                      <option value="1">1 child</option>
                      <option value="2">2 children</option>
                      <option value="3">3 children</option>
                      <option value="4+">4 or more children</option>
                    </select>
                    
                    {applicationData.numChildren && applicationData.numChildren !== '0' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Ages of Children (optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., 5, 8, 12"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={applicationData.childrenAges}
                          onChange={(e) => handleApplicationDataChange('childrenAges', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* === SECTION: LIFESTYLE & HABITS === */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Lifestyle & Habits
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  This helps landlords understand your living situation
                </p>
                
                {/* Smoking */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Smoking Status *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="smoking"
                        value="non-smoker"
                        checked={applicationData.smoking === 'non-smoker'}
                        onChange={(e) => handleApplicationDataChange('smoking', e.target.value)}
                        className="mr-3"
                        required
                      />
                      <div>
                        <div className="font-medium text-gray-900">Non-smoker</div>
                        <div className="text-sm text-gray-500">I do not smoke</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="smoking"
                        value="occasional"
                        checked={applicationData.smoking === 'occasional'}
                        onChange={(e) => handleApplicationDataChange('smoking', e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Occasional smoker</div>
                        <div className="text-sm text-gray-500">I smoke occasionally, outside only</div>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="smoking"
                        value="smoker"
                        checked={applicationData.smoking === 'smoker'}
                        onChange={(e) => handleApplicationDataChange('smoking', e.target.value)}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">Smoker</div>
                        <div className="text-sm text-gray-500">I am a regular smoker</div>
                      </div>
                    </label>
                  </div>
                </div>
                
                {/* Pets */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Do you have pets? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="hasPets"
                        value="no"
                        checked={applicationData.hasPets === 'no'}
                        onChange={(e) => handleApplicationDataChange('hasPets', e.target.value)}
                        className="mr-3"
                        required
                      />
                      <span className="font-medium text-gray-900">No pets</span>
                    </label>
                    
                    <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="hasPets"
                        value="yes"
                        checked={applicationData.hasPets === 'yes'}
                        onChange={(e) => handleApplicationDataChange('hasPets', e.target.value)}
                        className="mr-3"
                      />
                      <span className="font-medium text-gray-900">Yes, I have pets</span>
                    </label>
                  </div>
                </div>
                
                {/* If Has Pets - Pet Details */}
                {applicationData.hasPets === 'yes' && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Type of Pet(s) *
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={applicationData.petTypes?.includes('dog')}
                            onChange={(e) => {
                              const types = applicationData.petTypes || []
                              setApplicationData({
                                ...applicationData,
                                petTypes: e.target.checked 
                                  ? [...types, 'dog']
                                  : types.filter(t => t !== 'dog')
                              })
                            }}
                            className="mr-2"
                          />
                          <span>Dog(s)</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={applicationData.petTypes?.includes('cat')}
                            onChange={(e) => {
                              const types = applicationData.petTypes || []
                              setApplicationData({
                                ...applicationData,
                                petTypes: e.target.checked 
                                  ? [...types, 'cat']
                                  : types.filter(t => t !== 'cat')
                              })
                            }}
                            className="mr-2"
                          />
                          <span>Cat(s)</span>
                        </label>
                        
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={applicationData.petTypes?.includes('other')}
                            onChange={(e) => {
                              const types = applicationData.petTypes || []
                              setApplicationData({
                                ...applicationData,
                                petTypes: e.target.checked 
                                  ? [...types, 'other']
                                  : types.filter(t => t !== 'other')
                              })
                            }}
                            className="mr-2"
                          />
                          <span>Other (bird, fish, etc.)</span>
                        </label>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Number of Pets
                      </label>
                      <select
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={applicationData.numPets}
                        onChange={(e) => handleApplicationDataChange('numPets', e.target.value)}
                      >
                        <option value="1">1 pet</option>
                        <option value="2">2 pets</option>
                        <option value="3">3 pets</option>
                        <option value="4+">4 or more pets</option>
                      </select>
                    </div>
                    
                    {applicationData.petTypes?.includes('dog') && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Dog Details (optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Golden Retriever, 60 lbs, 5 years old"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={applicationData.dogDetails}
                          onChange={(e) => handleApplicationDataChange('dogDetails', e.target.value)}
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Breed, weight, and age help landlords understand your pet
                        </p>
                      </div>
                    )}
                    
                    {applicationData.petTypes?.includes('cat') && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Cat Details (optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Domestic shorthair, indoor only, 3 years old"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={applicationData.catDetails}
                          onChange={(e) => handleApplicationDataChange('catDetails', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}
                
                {/* Vehicle / Parking */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Do you have a vehicle? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="hasVehicle"
                        value="no"
                        checked={applicationData.hasVehicle === 'no'}
                        onChange={(e) => handleApplicationDataChange('hasVehicle', e.target.value)}
                        className="mr-3"
                        required
                      />
                      <span className="font-medium text-gray-900">No vehicle</span>
                    </label>
                    
                    <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="hasVehicle"
                        value="yes"
                        checked={applicationData.hasVehicle === 'yes'}
                        onChange={(e) => handleApplicationDataChange('hasVehicle', e.target.value)}
                        className="mr-3"
                      />
                      <span className="font-medium text-gray-900">Yes, I have a vehicle</span>
                    </label>
                  </div>
                </div>
                
                {applicationData.hasVehicle === 'yes' && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Parking Spaces Needed
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={applicationData.parkingNeeded}
                      onChange={(e) => handleApplicationDataChange('parkingNeeded', e.target.value)}
                    >
                      <option value="1">1 parking space</option>
                      <option value="2">2 parking spaces</option>
                      <option value="3">3 parking spaces</option>
                    </select>
                  </div>
                )}
              </div>

              {/* === PREVIEW OF WHAT WILL BE IN PDF === */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">
                        Your Professional PDF Will Include:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Elegant cover page with your profile</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Complete tenant information</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Lifestyle summary (smoking, pets, etc.)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Employment verification</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>All documents embedded</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>DossierPro verification badge</span>
                        </div>
                      </div>
                      <p className="text-sm text-blue-700 mt-3 font-medium">
                        ✨ Everything organized in one beautiful file!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Navigation */}
              <div className="flex gap-4">
                <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                  ← Back
                </Button>
                <Button onClick={handleStep3Continue} variant="primary" isLoading={isLoading} className="flex-1">
                  Generate My Link →
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
