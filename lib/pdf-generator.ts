import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib'
import { createSupabaseAdmin } from './supabase'

const COLORS = {
  slate900: rgb(0.059, 0.090, 0.165),
  blue500: rgb(0.231, 0.510, 0.965),
  purple500: rgb(0.545, 0.361, 0.965),
  slate50: rgb(0.973, 0.980, 0.988),
  slate100: rgb(0.945, 0.961, 0.980),
  slate200: rgb(0.886, 0.910, 0.941),
  slate500: rgb(0.392, 0.455, 0.545),
  emerald500: rgb(0.063, 0.725, 0.506),
  purple50: rgb(0.933, 0.949, 1),
  white: rgb(1, 1, 1),
  black: rgb(0, 0, 0),
}

interface TenantData {
  full_name: string
  email: string
  phone: string
  city: string
  current_address?: string
  date_of_birth: string
  property_address: string
  landlord_name?: string
  move_in_date: string
  num_occupants: string
  household_type: string
  num_children?: string
  children_ages?: string
  employer: string
  job_title: string
  monthly_income: number
  years_at_job: string
  smoking: string
  has_pets: string
  pet_types?: string[]
  num_pets?: string
  dog_details?: string
  cat_details?: string
  has_vehicle: string
  parking_needed?: string
  reason_for_moving?: string
  personal_message?: string
  created_at: string
}

interface Document {
  file_path: string
  description: string
  file_name: string
  file_type?: string  // Add file_type to know if it's PDF, PNG, or JPG
}

export async function generateProfessionalPDF(
  tenantData: TenantData,
  documents: Document[]
): Promise<Uint8Array> {
  
  const pdfDoc = await PDFDocument.create()
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  const coverPage = pdfDoc.addPage(PageSizes.Letter)
  const { width, height } = coverPage.getSize()
  
  let yPos = height
  
  const headerHeight = 150
  
  coverPage.drawRectangle({
    x: 0,
    y: height - headerHeight,
    width: width,
    height: headerHeight,
    color: COLORS.blue500,
  })
  
  for (let i = 0; i < 10; i++) {
    const progress = i / 10
    const layerHeight = headerHeight / 10
    const r = 0.231 + (0.545 - 0.231) * progress
    const g = 0.510 - (0.510 - 0.361) * progress  
    const b = 0.965
    
    coverPage.drawRectangle({
      x: 0,
      y: height - headerHeight + (i * layerHeight),
      width: width,
      height: layerHeight,
      color: rgb(r, g, b),
      opacity: 0.3 + (0.7 * progress),
    })
  }
  
  coverPage.drawText('RENTAL APPLICATION', {
    x: 56,
    y: height - 65,
    size: 32,
    font: helveticaBold,
    color: COLORS.white,
  })
  
  coverPage.drawText('Professional Tenant Dossier', {
    x: 56,
    y: height - 95,
    size: 13,
    font: helvetica,
    color: COLORS.white,
    opacity: 0.9,
  })
  
  // Add visual separator line
  coverPage.drawRectangle({
    x: 0,
    y: height - 155,
    width: width,
    height: 2,
    color: COLORS.slate200,
    opacity: 0.3,
  })
  
  // Move down from header to create breathing room
  yPos = height - 190
  
  // Calculate age if date_of_birth is available
  const age = tenantData.date_of_birth ? calculateAge(tenantData.date_of_birth) : null
  
  // Name (smaller, more elegant)
  coverPage.drawText(tenantData.full_name.toUpperCase(), {
    x: 56,
    y: yPos,
    size: 36,
    font: helveticaBold,
    color: COLORS.slate900,
  })
  
  yPos -= 30
  
  const subtitle = age 
    ? `${age} years old${tenantData.job_title ? ` • ${tenantData.job_title}` : ''}`
    : (tenantData.job_title || '')
  coverPage.drawText(subtitle, {
    x: 56,
    y: yPos,
    size: 14,
    font: helvetica,
    color: COLORS.slate500,
  })
  
  yPos -= 60
  
  const cardX = 46
  const cardY = yPos - 95
  const cardWidth = width - 92
  const cardHeight = 100
  
  for (let i = 0; i < 3; i++) {
    coverPage.drawRectangle({
      x: cardX - i,
      y: cardY - i,
      width: cardWidth + (i * 2),
      height: cardHeight + (i * 2),
      color: rgb(0, 0, 0, 0.02),
    })
  }
  
  coverPage.drawRectangle({
    x: cardX,
    y: cardY,
    width: cardWidth,
    height: cardHeight,
    color: COLORS.slate50,
    borderColor: COLORS.slate200,
    borderWidth: 1.5,
  })
  
  yPos -= 15
  
  coverPage.drawText('APPLYING FOR', {
    x: cardX + 20,
    y: yPos,
    size: 10,
    font: helveticaBold,
    color: COLORS.purple500,
  })
  
  yPos -= 22
  
  coverPage.drawText(tenantData.property_address, {
    x: cardX + 20,
    y: yPos,
    size: 16,
    font: helveticaBold,
    color: COLORS.slate900,
  })
  
  yPos -= 20
  
  if (tenantData.landlord_name) {
    coverPage.drawText(`Attention: ${tenantData.landlord_name}`, {
      x: cardX + 20,
      y: yPos,
      size: 12,
      font: helvetica,
      color: COLORS.slate500,
    })
    yPos -= 18
  }
  
  coverPage.drawText(`Move-in: ${formatDate(tenantData.move_in_date)}`, {
    x: cardX + 20,
    y: yPos,
    size: 12,
    font: helvetica,
    color: COLORS.slate500,
  })
  
  yPos -= 40  // Just space after title
  
  coverPage.drawText('APPLICATION HIGHLIGHTS', {
    x: 56,
    y: yPos,
    size: 16,
    font: helveticaBold,
    color: COLORS.slate900,
  })
  
  yPos -= 30
  
  const statsData = [
    { icon: '#', label: 'EMPLOYMENT', value: tenantData.employer || 'Not specified' },
    { icon: '$', label: 'INCOME', value: tenantData.monthly_income ? `$${tenantData.monthly_income.toLocaleString()}/month` : 'Not specified' },
    { icon: '#', label: 'EXPERIENCE', value: tenantData.years_at_job || 'Not specified' },
    { icon: '*', label: 'HOUSEHOLD', value: getHouseholdLabel(tenantData) },
    { icon: 'o', label: 'SMOKING', value: tenantData.smoking ? getSmokingLabel(tenantData.smoking) : 'Not specified' },
    { icon: '*', label: 'PETS', value: getPetsLabel(tenantData) },
    { icon: '#', label: 'VEHICLE', value: getVehicleLabel(tenantData) },
    { icon: '*', label: 'VERIFIED', value: 'DossierPro' },
  ]
  
  const startX = 56
  const cellWidth = (width - 132) / 2
  const cellHeight = 55
  const gapX = 10
  const gapY = 10
  
  statsData.forEach((stat, index) => {
    const col = index % 2
    const row = Math.floor(index / 2)
    
    const cellX = startX + (col * (cellWidth + gapX))
    const cellY = yPos - (row * (cellHeight + gapY))
    
    coverPage.drawRectangle({
      x: cellX,
      y: cellY - cellHeight + 12,
      width: cellWidth,
      height: cellHeight,
      color: COLORS.white,
      borderColor: COLORS.slate200,
      borderWidth: 1,
    })
    
    // Icon (slightly smaller)
    coverPage.drawText(stat.icon, {
      x: cellX + 12,
      y: cellY - 16,
      size: 10,
      font: helveticaBold,
      color: COLORS.blue500,
    })
    
    // Label (better spacing)
    coverPage.drawText(stat.label, {
      x: cellX + 26,
      y: cellY - 16,
      size: 7.5,
      font: helveticaBold,
      color: COLORS.slate500,
    })
    
    // Value (better positioned and readable)
    const valueText = stat.value.length > 28 
      ? stat.value.substring(0, 25) + '...' 
      : stat.value
      
    coverPage.drawText(valueText, {
      x: cellX + 12,
      y: cellY - 36,
      size: 11,
      font: helveticaBold,
      color: COLORS.slate900,
    })
  })
  
  // PROPER FOOTER - Fixed at bottom of page
  coverPage.drawText('This application includes verified documents and complete tenant information.', {
    x: 56,
    y: 35,
    size: 8,
    font: helvetica,
    color: COLORS.slate500,
  })

  coverPage.drawText(`Generated by DossierPro on ${formatDate(tenantData.created_at)}`, {
    x: 56,
    y: 25,
    size: 8,
    font: helvetica,
    color: COLORS.slate500,
  })
  
  const profilePage = pdfDoc.addPage(PageSizes.Letter)
  yPos = height - 80  // More space from top
  
  profilePage.drawText('TENANT PROFILE', {
    x: 56,
    y: yPos,
    size: 32,
    font: helveticaBold,
    color: COLORS.slate900,
  })
  
  yPos -= 60  // More breathing room before sections
  
  const sections = [
    {
      title: 'PERSONAL INFORMATION',
      hasBackground: false,
      fields: [
        ['Full Name:', tenantData.full_name],
        ...(age ? [['Age:', `${age} years old`]] : []),
        ['Email:', tenantData.email],
        ...(tenantData.phone ? [['Phone:', tenantData.phone]] : []),
        ['Current City:', tenantData.city || 'Not specified'],
        ...(tenantData.current_address ? [['Current Address:', tenantData.current_address]] : []),
      ]
    },
    {
      title: 'EMPLOYMENT INFORMATION',
      hasBackground: true,
      fields: [
        ['Employer:', tenantData.employer],
        ['Position:', tenantData.job_title],
        ['Monthly Income:', `$${tenantData.monthly_income.toLocaleString()} (before taxes)`],
        ['Years at Position:', tenantData.years_at_job],
      ]
    },
    {
      title: 'LIFESTYLE & HABITS',
      hasBackground: false,
      fields: [
        ...(age ? [['Age:', `${age} years old`]] : []),
        ['Household Type:', tenantData.household_type ? getHouseholdTypeLabel(tenantData.household_type, tenantData) : 'Not specified'],
        ['Smoking:', tenantData.smoking ? getSmokingLabel(tenantData.smoking) : 'Not specified'],
        ['Pets:', getPetsLabelDetailed(tenantData)],
        ['Vehicle:', getVehicleLabelDetailed(tenantData)],
      ]
    },
    {
      title: 'RENTAL APPLICATION DETAILS',
      hasBackground: true,
      fields: [
        ['Property:', tenantData.property_address],
        ['Move-in Date:', formatDate(tenantData.move_in_date)],
        ['Number of Occupants:', tenantData.num_occupants],
        ...(tenantData.reason_for_moving ? [['Reason for Moving:', tenantData.reason_for_moving]] : []),
      ]
    },
  ]
  
  sections.forEach((section) => {
    const sectionHeight = (section.fields.length * 22) + 60
    
    // Draw background if needed
    if (section.hasBackground) {
      profilePage.drawRectangle({
        x: 40,
        y: yPos - sectionHeight + 20,
        width: width - 80,
        height: sectionHeight,
        color: COLORS.slate50,
      })
    }
    
    // Title
    profilePage.drawText(section.title, {
      x: 56,
      y: yPos,
      size: 13,
      font: helveticaBold,
      color: COLORS.slate900,
    })
    
    // Blue underline BELOW title (consistent for all sections)
    profilePage.drawRectangle({
      x: 56,
      y: yPos - 4,
      width: 160,
      height: 2.5,
      color: COLORS.blue500,
    })
    
    yPos -= 25  // Reduced from 30 for tighter spacing
    
    // Fields
    section.fields.forEach(([label, value]) => {
      profilePage.drawText(label, {
        x: 56,
        y: yPos,
        size: 10,
        font: helveticaBold,
        color: COLORS.slate500,
      })
      
      const lines = wrapText(value || 'N/A', 50)
      lines.forEach((line, i) => {
        profilePage.drawText(line, {
          x: 220,
          y: yPos - (i * 12),
          size: 10,
          font: helvetica,
          color: COLORS.slate900,
        })
      })
      
      yPos -= Math.max(22, lines.length * 12 + 10)
    })
    
    yPos -= 25  // Gap between sections
  })
  
  yPos -= 20
  
  const boxHeight = 115
  const boxX = 50
  const boxY = yPos - boxHeight
  
  profilePage.drawRectangle({
    x: boxX,
    y: boxY,
    width: width - 100,
    height: boxHeight,
    color: COLORS.purple50,
  })
  
  profilePage.drawRectangle({
    x: boxX,
    y: boxY,
    width: 4,
    height: boxHeight,
    color: COLORS.purple500,
  })
  
  yPos -= 15
  
  profilePage.drawText('DOCUMENTS INCLUDED IN THIS APPLICATION', {
    x: boxX + 20,
    y: yPos,
    size: 10,
    font: helveticaBold,
    color: COLORS.slate900,
  })
  
  yPos -= 22
  
  // Use actual uploaded documents or show message if none
  // Note: Using "*" instead of "✓" because WinAnsi cannot encode checkmark character (0x2713)
  const docs = documents.length > 0
    ? documents.map(doc => `* ${cleanTextForPDF(doc.description || 'Document')}`)
    : ['No documents uploaded']
  
  docs.forEach(doc => {
    profilePage.drawText(cleanTextForPDF(doc), {
      x: boxX + 20,
      y: yPos,
      size: 9,
      font: helvetica,
      color: COLORS.slate900,
    })
    yPos -= 16
  })
  
  yPos -= 8
  
  profilePage.drawText('All documents have been verified and organized by DossierPro.', {
    x: boxX + 20,
    y: yPos,
    size: 8,
    font: helvetica,
    color: COLORS.slate500,
  })
  
  addFooter(profilePage, width, height, 2)
  
  const supabaseAdmin = createSupabaseAdmin()
  
  console.log(`Processing ${documents.length} documents to embed in PDF`)
  
  for (const doc of documents) {
    console.log(`Processing document: ${doc.file_name} (${doc.file_type || 'unknown type'})`)
    
    try {
      const { data: signedUrl } = await supabaseAdmin
        .storage
        .from('documents')
        .createSignedUrl(doc.file_path, 3600)
      
      if (!signedUrl || !signedUrl.signedUrl) {
        console.error(`Failed to create signed URL for ${doc.file_name}`)
        continue
      }
      
      console.log(`Fetching document from: ${doc.file_path}`)
      const docResponse = await fetch(signedUrl.signedUrl)
      
      if (!docResponse.ok) {
        console.error(`Failed to fetch document: ${docResponse.status} ${docResponse.statusText}`)
        continue
      }
      
      const docBytes = await docResponse.arrayBuffer()
      console.log(`Document fetched, size: ${docBytes.byteLength} bytes`)
      
      const fileType = doc.file_type || 'application/pdf'
      
      // Handle PDF files
      if (fileType === 'application/pdf') {
        try {
          const embeddedPdf = await PDFDocument.load(docBytes)
          const copiedPages = await pdfDoc.copyPages(embeddedPdf, embeddedPdf.getPageIndices())
          
          console.log(`PDF document has ${copiedPages.length} pages`)
          
          copiedPages.forEach((page) => {
            const addedPage = pdfDoc.addPage(page)
            
            const docLabel = cleanTextForPDF(doc.description || 'Document').toUpperCase()
            addedPage.drawRectangle({
              x: 0,
              y: addedPage.getHeight() - 40,
              width: addedPage.getWidth(),
              height: 40,
              color: COLORS.slate50,
            })
            
            addedPage.drawText(docLabel, {
              x: 50,
              y: addedPage.getHeight() - 25,
              size: 12,
              font: helveticaBold,
              color: COLORS.blue500,
            })
            
            addFooter(addedPage, addedPage.getWidth(), addedPage.getHeight(), pdfDoc.getPageCount())
          })
          console.log(`Successfully embedded PDF: ${doc.file_name}`)
        } catch (pdfError: any) {
          console.error(`Failed to load PDF ${doc.file_name}:`, pdfError.message)
        }
      } 
      // Handle image files (PNG, JPG)
      else if (fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/jpg') {
        try {
          console.log(`Embedding image: ${doc.file_name}`)
          
          // Embed the image
          let image
          if (fileType === 'image/png') {
            image = await pdfDoc.embedPng(docBytes)
          } else {
            image = await pdfDoc.embedJpg(docBytes)
          }
          
          // Create a new page with the image
          const imagePage = pdfDoc.addPage(PageSizes.Letter)
          const { width: pageWidth, height: pageHeight } = imagePage.getSize()
          
          // Calculate dimensions to fit image on page (with margins)
          const margin = 50
          const maxWidth = pageWidth - (margin * 2)
          const maxHeight = pageHeight - 120 // Leave space for header and footer
          
          // Scale image to fit page while maintaining aspect ratio
          const imageDims = image.scale(1)
          const scale = Math.min(
            maxWidth / imageDims.width,
            maxHeight / imageDims.height
          )
          
          const scaledWidth = imageDims.width * scale
          const scaledHeight = imageDims.height * scale
          
          // Center image on page
          const x = (pageWidth - scaledWidth) / 2
          const y = pageHeight - 80 - scaledHeight // 80px for header
          
          // Draw header
          imagePage.drawRectangle({
            x: 0,
            y: pageHeight - 40,
            width: pageWidth,
            height: 40,
            color: COLORS.slate50,
          })
          
          const docLabel = cleanTextForPDF(doc.description || 'Document').toUpperCase()
          imagePage.drawText(docLabel, {
            x: 50,
            y: pageHeight - 25,
            size: 12,
            font: helveticaBold,
            color: COLORS.blue500,
          })
          
          // Draw the image
          imagePage.drawImage(image, {
            x: x,
            y: y,
            width: scaledWidth,
            height: scaledHeight,
          })
          
          // Add footer
          addFooter(imagePage, pageWidth, pageHeight, pdfDoc.getPageCount())
          
          console.log(`Successfully embedded image: ${doc.file_name}`)
        } catch (imageError: any) {
          console.error(`Failed to embed image ${doc.file_name}:`, imageError.message)
        }
      } else {
        console.warn(`Unsupported file type: ${fileType} for ${doc.file_name}`)
      }
    } catch (error: any) {
      console.error(`Error processing document ${doc.file_name}:`, error.message)
      console.error('Error stack:', error.stack)
    }
  }
  
  console.log(`PDF generation complete. Total pages: ${pdfDoc.getPageCount()}`)
  
  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birth = new Date(dateOfBirth)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

// Clean text to remove characters that can't be encoded in WinAnsi
// Only replace problematic characters, keep most Unicode characters
function cleanTextForPDF(text: string | number | null | undefined): string {
  if (text == null) return 'N/A'
  const textStr = String(text)
  // Replace only problematic characters that cause encoding errors
  return textStr
    .replace(/✓/g, '*')  // Checkmark (0x2713) - causes WinAnsi encoding error
    .replace(/[^\x00-\xFF]/g, '?')  // Replace characters outside Latin-1 with ?
    .trim()
}

function wrapText(text: string | number | null | undefined, maxChars: number): string[] {
  // Convert to string, handle null/undefined/numbers, and clean for PDF
  const textStr = cleanTextForPDF(text)
  const words = textStr.split(' ')
  const lines: string[] = []
  let currentLine = ''
  
  words.forEach(word => {
    if ((currentLine + word).length <= maxChars) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      if (currentLine) lines.push(currentLine)
      currentLine = word
    }
  })
  
  if (currentLine) lines.push(currentLine)
  return lines
}

function getHouseholdLabel(tenant: any): string {
  if (tenant.household_type === 'couple') return `Couple (${tenant.num_occupants || 2})`
  if (tenant.household_type === 'family') return `Family (${tenant.num_occupants})`
  if (tenant.household_type === 'single') return 'Single'
  return `${tenant.num_occupants} occupant(s)`
}

function getHouseholdTypeLabel(type: string, tenant: any): string {
  if (type === 'couple') return 'Couple (2 adults)'
  if (type === 'family') return `Family (with ${tenant.num_children || 'children'})`
  if (type === 'single') return 'Single (living alone)'
  if (type === 'roommates') return `Roommates (${tenant.num_occupants} adults)`
  return type
}

function getSmokingLabel(smoking: string): string {
  if (smoking === 'non-smoker') return 'Non-smoker'
  if (smoking === 'occasional') return 'Occasional smoker (outside only)'
  if (smoking === 'smoker') return 'Smoker'
  return smoking
}

function getPetsLabel(tenant: any): string {
  if (!tenant.has_pets) return 'Not specified'
  if (tenant.has_pets === 'no') return 'No pets'
  return `${tenant.num_pets || 1} pet(s)`
}

function getPetsLabelDetailed(tenant: any): string {
  if (tenant.has_pets === 'no') return 'No pets'
  
  const types = tenant.pet_types || []
  const num = tenant.num_pets || '1'
  
  if (types.includes('dog') && tenant.dog_details) {
    return `${num} dog(s) (${tenant.dog_details})`
  } else if (types.includes('dog')) {
    return `${num} dog(s)`
  } else if (types.includes('cat') && tenant.cat_details) {
    return `${num} cat(s) (${tenant.cat_details})`
  } else if (types.includes('cat')) {
    return `${num} cat(s)`
  }
  
  return `${num} pet(s)`
}

function getVehicleLabel(tenant: any): string {
  if (!tenant.has_vehicle) return 'Not specified'
  if (tenant.has_vehicle === 'no') return 'No vehicle'
  return `Yes (${tenant.parking_needed || 1} parking)`
}

function getVehicleLabelDetailed(tenant: any): string {
  if (tenant.has_vehicle === 'no') return 'No vehicle'
  return `Yes (${tenant.parking_needed || 1} parking space needed)`
}


function addFooter(page: any, width: number, height: number, pageNum: number) {
  page.drawText(`DossierPro - Verified Rental Application | Page ${pageNum}`, {
    x: 50,
    y: 30,
    size: 8,
    color: COLORS.slate500,
  })
  
  page.drawText('www.dossierpro.com', {
    x: width - 130,
    y: 30,
    size: 8,
    color: COLORS.slate500,
  })
}
