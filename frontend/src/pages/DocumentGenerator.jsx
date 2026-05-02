import { useState } from 'react'
import API from '../api/axios'
import toast from 'react-hot-toast'
import { Document, Packer, Paragraph, TextRun, AlignmentType } from 'docx'
import { saveAs } from 'file-saver'
import styles from './DocumentGenerator.module.css'

const templates = [
  {
    id: 'bail_application',
    name: 'Bail Application',
    icon: '⚖️',
    desc: 'Application for bail in criminal cases',
    fields: [
      { key: 'applicantName',  label: 'Applicant Name',        placeholder: 'Full name of accused' },
      { key: 'caseNumber',     label: 'Case Number',           placeholder: 'e.g. CR No. 123/2024' },
      { key: 'courtName',      label: 'Court Name',            placeholder: 'e.g. Sessions Court, Mumbai' },
      { key: 'offenceSection', label: 'Offence / Section',     placeholder: 'e.g. IPC Section 302' },
      { key: 'arrestDate',     label: 'Date of Arrest',        placeholder: 'e.g. 01/01/2024', type: 'date' },
      { key: 'groundsForBail', label: 'Grounds for Bail',      placeholder: 'Reasons why bail should be granted', multiline: true },
      { key: 'lawyerName',     label: 'Advocate Name',         placeholder: 'Your full name' },
      { key: 'lawyerBarNo',    label: 'Bar Council Number',    placeholder: 'e.g. MH/1234/2020' },
    ]
  },
  {
    id: 'legal_notice',
    name: 'Legal Notice',
    icon: '📜',
    desc: 'Formal legal notice to individuals or companies',
    fields: [
      { key: 'senderName',      label: 'Sender Name',          placeholder: 'Your client full name' },
      { key: 'senderAddress',   label: 'Sender Address',       placeholder: 'Full address' },
      { key: 'recipientName',   label: 'Recipient Name',       placeholder: 'Who the notice is sent to' },
      { key: 'recipientAddress',label: 'Recipient Address',    placeholder: 'Full address' },
      { key: 'subject',         label: 'Subject of Notice',    placeholder: 'e.g. Recovery of dues' },
      { key: 'facts',           label: 'Facts of the Matter',  placeholder: 'Describe the issue in detail', multiline: true },
      { key: 'demand',          label: 'Demand / Relief Sought',placeholder: 'What you are demanding', multiline: true },
      { key: 'deadline',        label: 'Response Deadline (days)', placeholder: 'e.g. 15' },
      { key: 'lawyerName',      label: 'Advocate Name',        placeholder: 'Your full name' },
    ]
  },
  {
    id: 'affidavit',
    name: 'Affidavit',
    icon: '📋',
    desc: 'Sworn statement of facts',
    fields: [
      { key: 'deponentName',       label: 'Deponent Name',     placeholder: 'Person making the affidavit' },
      { key: 'deponentAge',        label: 'Age',               placeholder: 'e.g. 35' },
      { key: 'deponentAddress',    label: 'Address',           placeholder: 'Full residential address' },
      { key: 'deponentOccupation', label: 'Occupation',        placeholder: 'e.g. Business person' },
      { key: 'purpose',            label: 'Purpose of Affidavit', placeholder: 'e.g. Change of name', multiline: true },
      { key: 'statements',         label: 'Statements / Facts', placeholder: 'List the facts being sworn to', multiline: true },
      { key: 'courtName',          label: 'Court / Authority', placeholder: 'e.g. Notary Public, Mumbai' },
    ]
  },
  {
    id: 'vakalatnama',
    name: 'Vakalatnama',
    icon: '🤝',
    desc: 'Power of attorney for legal representation',
    fields: [
      { key: 'clientName',    label: 'Client Name',          placeholder: 'Full name of client' },
      { key: 'clientAddress', label: 'Client Address',       placeholder: 'Full address' },
      { key: 'lawyerName',    label: 'Advocate Name',        placeholder: 'Your full name' },
      { key: 'lawyerBarNo',   label: 'Bar Council Number',   placeholder: 'e.g. MH/1234/2020' },
      { key: 'courtName',     label: 'Court Name',           placeholder: 'e.g. High Court of Bombay' },
      { key: 'caseTitle',     label: 'Case Title',           placeholder: 'e.g. Ram vs State of Maharashtra' },
      { key: 'caseNumber',    label: 'Case Number',          placeholder: 'e.g. WP No. 1234/2024' },
    ]
  },
  {
    id: 'rent_agreement',
    name: 'Rent Agreement',
    icon: '🏠',
    desc: 'Rental agreement between landlord and tenant',
    fields: [
      { key: 'landlordName',    label: 'Landlord Name',       placeholder: 'Full name' },
      { key: 'tenantName',      label: 'Tenant Name',         placeholder: 'Full name' },
      { key: 'propertyAddress', label: 'Property Address',    placeholder: 'Complete address of property' },
      { key: 'rentAmount',      label: 'Monthly Rent (₹)',    placeholder: 'e.g. 15000' },
      { key: 'depositAmount',   label: 'Security Deposit (₹)',placeholder: 'e.g. 45000' },
      { key: 'startDate',       label: 'Start Date',          placeholder: 'e.g. 01/01/2024', type: 'date' },
      { key: 'duration',        label: 'Duration (months)',   placeholder: 'e.g. 11' },
      { key: 'terms',           label: 'Special Terms',       placeholder: 'Any additional terms', multiline: true },
    ]
  },
  {
    id: 'power_of_attorney',
    name: 'Power of Attorney',
    icon: '✍️',
    desc: 'Authorize someone to act on your behalf',
    fields: [
      { key: 'principalName',    label: 'Principal Name',     placeholder: 'Person giving power' },
      { key: 'principalAddress', label: 'Principal Address',  placeholder: 'Full address' },
      { key: 'agentName',        label: 'Agent / Attorney Name', placeholder: 'Person receiving power' },
      { key: 'agentAddress',     label: 'Agent Address',      placeholder: 'Full address' },
      { key: 'purpose',          label: 'Powers Granted',     placeholder: 'Describe what the agent is authorized to do', multiline: true },
      { key: 'validityPeriod',   label: 'Validity Period',    placeholder: 'e.g. 1 year from date of execution' },
      { key: 'jurisdiction',     label: 'Jurisdiction',       placeholder: 'e.g. Mumbai, Maharashtra' },
    ]
  }
]

// ── Convert AI text to proper docx paragraphs ──────────────────────
const buildDocxFromText = (templateName, text) => {
  const lines = text.split('\n')

  const children = [
    // Document Title
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 300 },
      children: [new TextRun({
        text: templateName.toUpperCase(),
        bold: true,
        size: 32,
        font: 'Times New Roman',
        underline: {}
      })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 400 },
      children: [new TextRun({
        text: `Generated by LegalPro — ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'long', year:'numeric' })}`,
        size: 20,
        font: 'Times New Roman',
        color: '666666',
        italics: true
      })]
    }),
  ]

  lines.forEach(line => {
    const trimmed = line.trim()
    if (!trimmed) {
      // Empty line → spacer
      children.push(new Paragraph({
        spacing: { before: 80, after: 80 },
        children: [new TextRun({ text: '' })]
      }))
      return
    }

    // Detect section headings (ALL CAPS lines or lines ending with :)
    const isHeading =
      (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && /^[A-Z\s/().-]+$/.test(trimmed)) ||
      (trimmed.endsWith(':') && trimmed.length < 60 && trimmed === trimmed.toUpperCase())

    // Detect sub-headings (Title Case short lines ending with :)
    const isSubHeading =
      trimmed.endsWith(':') && trimmed.length < 80 && !isHeading

    // Detect numbered items
    const isNumbered = /^\d+[\.\)]\s/.test(trimmed)

    // Detect bullet items
    const isBullet = /^[-•*]\s/.test(trimmed)

    if (isHeading) {
      children.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 280, after: 140 },
        children: [new TextRun({
          text: trimmed,
          bold: true,
          size: 26,
          font: 'Times New Roman',
          underline: {}
        })]
      }))
    } else if (isSubHeading) {
      children.push(new Paragraph({
        spacing: { before: 200, after: 100 },
        children: [new TextRun({
          text: trimmed,
          bold: true,
          size: 24,
          font: 'Times New Roman'
        })]
      }))
    } else if (isNumbered) {
      children.push(new Paragraph({
        indent: { left: 720 },
        spacing: { before: 80, after: 80, line: 300 },
        children: [new TextRun({
          text: trimmed,
          size: 24,
          font: 'Times New Roman'
        })]
      }))
    } else if (isBullet) {
      children.push(new Paragraph({
        indent: { left: 720, hanging: 200 },
        spacing: { before: 60, after: 60, line: 280 },
        children: [new TextRun({
          text: '• ' + trimmed.replace(/^[-•*]\s/, ''),
          size: 24,
          font: 'Times New Roman'
        })]
      }))
    } else {
      children.push(new Paragraph({
        alignment: AlignmentType.BOTH,
        spacing: { before: 80, after: 80, line: 300 },
        children: [new TextRun({
          text: trimmed,
          size: 24,
          font: 'Times New Roman'
        })]
      }))
    }
  })

  // Footer note
  children.push(
    new Paragraph({ spacing: { before: 400, after: 80 }, children: [new TextRun({ text: '' })] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: '─────────────────────────────────',
        color: '999999', size: 20, font: 'Times New Roman'
      })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80, after: 0 },
      children: [new TextRun({
        text: 'This document was generated by LegalPro AI. Please review carefully before use.',
        size: 18, color: '888888', italics: true, font: 'Times New Roman'
      })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 0 },
      children: [new TextRun({
        text: 'Consult a licensed attorney before submitting to any court or authority.',
        size: 18, color: '888888', italics: true, font: 'Times New Roman'
      })]
    })
  )

  return new Document({
    styles: {
      default: {
        document: { run: { font: 'Times New Roman', size: 24 } }
      }
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1800 }
        }
      },
      children
    }]
  })
}

export default function DocumentGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [fields, setFields]                     = useState({})
  const [generatedDoc, setGeneratedDoc]         = useState('')
  const [loading, setLoading]                   = useState(false)
  const [downloading, setDownloading]           = useState(false)
  const [step, setStep]                         = useState(1)

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template)
    const init = {}
    template.fields.forEach(f => init[f.key] = '')
    setFields(init)
    setGeneratedDoc('')
    setStep(2)
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    const emptyCount = Object.values(fields).filter(v => !v.trim()).length
    if (emptyCount > 3) {
      toast.error('Please fill in at least the required fields')
      return
    }
    setLoading(true)
    try {
      const { data } = await API.post('/chat/generate-document', {
        templateType: selectedTemplate.name,
        fields
      })
      setGeneratedDoc(data.document)
      setStep(3)
      toast.success('Document generated!')
    } catch {
      toast.error('Failed to generate document')
    }
    setLoading(false)
  }

  // ── Download as .docx ─────────────────────────────────────────────
  const handleDownloadDocx = async () => {
    if (!generatedDoc) return
    setDownloading(true)
    try {
      const doc = buildDocxFromText(selectedTemplate.name, generatedDoc)
      const blob = await Packer.toBlob(doc)
      const fileName = `${selectedTemplate.name.replace(/\s+/g, '_')}_${
        new Date().toISOString().split('T')[0]
      }.docx`
      saveAs(blob, fileName)
      toast.success('Downloaded as .docx!')
    } catch (err) {
      console.error(err)
      toast.error('Download failed')
    }
    setDownloading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDoc)
    toast.success('Copied to clipboard!')
  }

  const handlePrint = () => {
    const win = window.open('', '_blank')
    win.document.write(`
      <html>
        <head>
          <title>${selectedTemplate.name}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px 60px; line-height: 1.8; color: #000; font-size: 14px; }
            pre { white-space: pre-wrap; font-family: 'Times New Roman', serif; font-size: 14px; }
            h1 { text-align: center; font-size: 18px; margin-bottom: 20px; text-decoration: underline; }
            @media print { body { padding: 20px 40px; } }
          </style>
        </head>
        <body>
          <h1>${selectedTemplate.name.toUpperCase()}</h1>
          <pre>${generatedDoc}</pre>
        </body>
      </html>
    `)
    win.document.close()
    win.print()
  }

  const handleBack = () => {
    if (step === 2) { setStep(1); setSelectedTemplate(null) }
    if (step === 3) setStep(2)
  }

  return (
    <div className={styles.container}>

      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Legal Document Generator</h2>
          <p className={styles.subtitle}>AI-powered legal document creation — downloads as Word (.docx)</p>
        </div>
        {step > 1 && (
          <button className={styles.backBtn} onClick={handleBack}>
            ← Back
          </button>
        )}
      </div>

      {/* STEPS */}
      <div className={styles.steps}>
        {['Choose Template', 'Fill Details', 'Download .docx'].map((s, i) => (
          <div key={i} className={`${styles.step} ${step === i + 1 ? styles.stepActive : ''} ${step > i + 1 ? styles.stepDone : ''}`}>
            <div className={styles.stepNum}>{step > i + 1 ? '✓' : i + 1}</div>
            <span className={styles.stepLabel}>{s}</span>
          </div>
        ))}
      </div>

      {/* STEP 1 — TEMPLATE SELECTION */}
      {step === 1 && (
        <div className={styles.templates}>
          {templates.map(t => (
            <div key={t.id} className={styles.templateCard}
              onClick={() => handleSelectTemplate(t)}>
              <span className={styles.templateIcon}>{t.icon}</span>
              <h3 className={styles.templateName}>{t.name}</h3>
              <p className={styles.templateDesc}>{t.desc}</p>
              <span className={styles.templateBtn}>Use Template →</span>
            </div>
          ))}
        </div>
      )}

      {/* STEP 2 — FILL FIELDS */}
      {step === 2 && selectedTemplate && (
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <span className={styles.templateIcon}>{selectedTemplate.icon}</span>
            <div>
              <h3 className={styles.formTitle}>{selectedTemplate.name}</h3>
              <p className={styles.formSubtitle}>Fill in the details — AI will complete the rest</p>
            </div>
          </div>
          <form className={styles.form} onSubmit={handleGenerate}>
            <div className={styles.fieldGrid}>
              {selectedTemplate.fields.map(f => (
                <div key={f.key}
                  className={`${styles.inputGroup} ${f.multiline ? styles.fullWidth : ''}`}>
                  <label>{f.label}</label>
                  {f.multiline ? (
                    <textarea
                      placeholder={f.placeholder}
                      value={fields[f.key] || ''}
                      onChange={e => setFields({...fields, [f.key]: e.target.value})}
                      rows={3}
                    />
                  ) : (
                    <input
                      type={f.type || 'text'}
                      placeholder={f.placeholder}
                      value={fields[f.key] || ''}
                      onChange={e => setFields({...fields, [f.key]: e.target.value})}
                    />
                  )}
                </div>
              ))}
            </div>
            <button type="submit" className={styles.generateBtn} disabled={loading}>
              {loading ? (
                <span className={styles.loadingText}>
                  <span className={styles.spinner} />
                  Generating with AI...
                </span>
              ) : '✨ Generate Document with AI'}
            </button>
          </form>
        </div>
      )}

      {/* STEP 3 — RESULT */}
      {step === 3 && generatedDoc && (
        <div className={styles.resultContainer}>
          <div className={styles.resultHeader}>
            <div className={styles.resultTitle}>
              <span>{selectedTemplate.icon}</span>
              <span>{selectedTemplate.name}</span>
              <span className={styles.readyBadge}>Ready</span>
            </div>
            <div className={styles.resultActions}>
              <button className={styles.actionBtn} onClick={handleCopy}>
                📋 Copy Text
              </button>
              <button className={styles.actionBtn} onClick={handlePrint}>
                🖨️ Print / PDF
              </button>
              <button
                className={`${styles.actionBtn} ${styles.downloadDocxBtn}`}
                onClick={handleDownloadDocx}
                disabled={downloading}>
                {downloading
                  ? '⏳ Preparing...'
                  : '⬇️ Download .docx'
                }
              </button>
              <button
                className={`${styles.actionBtn} ${styles.regenerateBtn}`}
                onClick={() => setStep(2)}>
                🔄 Regenerate
              </button>
            </div>
          </div>

          <div className={styles.docPreview}>
            <pre className={styles.docText}>{generatedDoc}</pre>
          </div>

          <div className={styles.disclaimer}>
            ⚠️ This document is AI-generated for reference. Review carefully and consult a licensed attorney before use.
            The <strong>Download .docx</strong> button saves a properly formatted Word document.
          </div>
        </div>
      )}
    </div>
  )
}