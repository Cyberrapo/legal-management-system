import { useState } from 'react'
import API from '../api/axios'
import toast from 'react-hot-toast'
import styles from './DocumentGenerator.module.css'

const templates = [
  {
    id: 'bail_application',
    name: 'Bail Application',
    icon: '⚖️',
    description: 'Application for bail in criminal cases',
    fields: [
      { key: 'applicantName', label: 'Applicant Name', placeholder: 'Full name of the accused' },
      { key: 'fatherName', label: "Father's Name", placeholder: "Father's full name" },
      { key: 'address', label: 'Address', placeholder: 'Complete residential address' },
      { key: 'caseNumber', label: 'Case Number / FIR Number', placeholder: 'e.g. FIR No. 123/2024' },
      { key: 'policeStation', label: 'Police Station', placeholder: 'Name of police station' },
      { key: 'offenseCharged', label: 'Offense Charged', placeholder: 'e.g. IPC Section 420' },
      { key: 'courtName', label: 'Court Name', placeholder: 'e.g. Sessions Court, Mumbai' },
      { key: 'groundsForBail', label: 'Grounds for Bail', placeholder: 'Key reasons for granting bail', multiline: true },
      { key: 'lawyerName', label: 'Advocate Name', placeholder: 'Your full name' },
      { key: 'date', label: 'Date', placeholder: 'e.g. 26 March 2026', type: 'date' },
    ]
  },
  {
    id: 'legal_notice',
    name: 'Legal Notice',
    icon: '📨',
    description: 'Formal legal notice to a party',
    fields: [
      { key: 'senderName', label: 'Sender Name', placeholder: 'Your client\'s full name' },
      { key: 'senderAddress', label: 'Sender Address', placeholder: 'Complete address' },
      { key: 'recipientName', label: 'Recipient Name', placeholder: 'Name of person receiving notice' },
      { key: 'recipientAddress', label: 'Recipient Address', placeholder: 'Recipient\'s complete address' },
      { key: 'subjectMatter', label: 'Subject Matter', placeholder: 'Brief subject of the notice' },
      { key: 'facts', label: 'Facts & Grievances', placeholder: 'Detailed facts of the matter', multiline: true },
      { key: 'demand', label: 'Demand / Relief Sought', placeholder: 'What you are demanding', multiline: true },
      { key: 'deadline', label: 'Response Deadline (days)', placeholder: 'e.g. 15 days' },
      { key: 'lawyerName', label: 'Advocate Name', placeholder: 'Your full name' },
      { key: 'date', label: 'Date', placeholder: 'e.g. 26 March 2026', type: 'date' },
    ]
  },
  {
    id: 'affidavit',
    name: 'Affidavit',
    icon: '📋',
    description: 'Sworn statement of facts',
    fields: [
      { key: 'deponentName', label: 'Deponent Name', placeholder: 'Full name of person making affidavit' },
      { key: 'deponentAge', label: 'Age', placeholder: 'Age in years' },
      { key: 'deponentAddress', label: 'Address', placeholder: 'Complete residential address' },
      { key: 'purpose', label: 'Purpose of Affidavit', placeholder: 'e.g. Change of name, residence proof' },
      { key: 'statements', label: 'Statements / Facts', placeholder: 'List all facts to be declared', multiline: true },
      { key: 'courtName', label: 'Before (Court/Authority)', placeholder: 'e.g. Notary Public, Mumbai' },
      { key: 'date', label: 'Date', placeholder: 'e.g. 26 March 2026', type: 'date' },
    ]
  },
  {
    id: 'power_of_attorney',
    name: 'Power of Attorney',
    icon: '✍️',
    description: 'Authorize someone to act on your behalf',
    fields: [
      { key: 'principalName', label: 'Principal Name', placeholder: 'Name of person granting power' },
      { key: 'principalAddress', label: 'Principal Address', placeholder: 'Complete address' },
      { key: 'attorneyName', label: 'Attorney Name', placeholder: 'Name of person receiving power' },
      { key: 'attorneyAddress', label: 'Attorney Address', placeholder: 'Attorney\'s complete address' },
      { key: 'relationship', label: 'Relationship', placeholder: 'e.g. Son, Friend, Colleague' },
      { key: 'powers', label: 'Powers Granted', placeholder: 'List all powers being granted', multiline: true },
      { key: 'purpose', label: 'Purpose', placeholder: 'Why this POA is being created' },
      { key: 'validity', label: 'Validity Period', placeholder: 'e.g. 1 year, Until revoked' },
      { key: 'date', label: 'Date', placeholder: 'e.g. 26 March 2026', type: 'date' },
    ]
  },
  {
    id: 'rent_agreement',
    name: 'Rent Agreement',
    icon: '🏠',
    description: 'Residential or commercial rental agreement',
    fields: [
      { key: 'landlordName', label: 'Landlord Name', placeholder: 'Full name of landlord' },
      { key: 'landlordAddress', label: 'Landlord Address', placeholder: 'Landlord\'s permanent address' },
      { key: 'tenantName', label: 'Tenant Name', placeholder: 'Full name of tenant' },
      { key: 'tenantAddress', label: 'Tenant\'s Permanent Address', placeholder: 'Tenant\'s permanent address' },
      { key: 'propertyAddress', label: 'Property Address', placeholder: 'Full address of rented property' },
      { key: 'rentAmount', label: 'Monthly Rent (₹)', placeholder: 'e.g. 15000' },
      { key: 'securityDeposit', label: 'Security Deposit (₹)', placeholder: 'e.g. 45000' },
      { key: 'startDate', label: 'Start Date', placeholder: 'e.g. 1 April 2026', type: 'date' },
      { key: 'duration', label: 'Duration', placeholder: 'e.g. 11 months, 1 year' },
      { key: 'terms', label: 'Special Terms & Conditions', placeholder: 'Any additional terms', multiline: true },
      { key: 'date', label: 'Agreement Date', placeholder: 'e.g. 26 March 2026', type: 'date' },
    ]
  },
  {
    id: 'complaint_petition',
    name: 'Complaint Petition',
    icon: '📝',
    description: 'Formal complaint to court or authority',
    fields: [
      { key: 'complainantName', label: 'Complainant Name', placeholder: 'Your client\'s full name' },
      { key: 'complainantAddress', label: 'Complainant Address', placeholder: 'Complete address' },
      { key: 'respondentName', label: 'Respondent / Accused Name', placeholder: 'Name of accused party' },
      { key: 'respondentAddress', label: 'Respondent Address', placeholder: 'Respondent\'s address' },
      { key: 'courtName', label: 'Court Name', placeholder: 'e.g. Chief Judicial Magistrate, Delhi' },
      { key: 'offenseSection', label: 'Offense / Section', placeholder: 'e.g. IPC 420, 406' },
      { key: 'facts', label: 'Facts of the Case', placeholder: 'Detailed chronological facts', multiline: true },
      { key: 'relief', label: 'Relief Sought', placeholder: 'What relief you are seeking', multiline: true },
      { key: 'lawyerName', label: 'Advocate Name', placeholder: 'Your full name' },
      { key: 'date', label: 'Date', placeholder: 'e.g. 26 March 2026', type: 'date' },
    ]
  }
]

export default function DocumentGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [fields, setFields] = useState({})
  const [generatedDoc, setGeneratedDoc] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template)
    const initialFields = {}
    template.fields.forEach(f => { initialFields[f.key] = '' })
    setFields(initialFields)
    setGeneratedDoc('')
    setStep(2)
  }

  const handleGenerate = async () => {
    const emptyRequired = selectedTemplate.fields
      .filter(f => !f.optional && !fields[f.key]?.trim())
    if (emptyRequired.length > 0) {
      toast.error(`Please fill in: ${emptyRequired[0].label}`)
      return
    }
    setLoading(true)
    setStep(3)
    try {
      const { data } = await API.post('/chat/generate-document', {
        templateType: selectedTemplate.name,
        fields
      })
      setGeneratedDoc(data.document)
      toast.success('Document generated successfully!')
    } catch (err) {
      toast.error('Failed to generate document')
      setStep(2)
    }
    setLoading(false)
  }

  const handleDownload = () => {
    const blob = new Blob([generatedDoc], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedTemplate.name.replace(/\s+/g, '_')}_${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Document downloaded!')
  }

  const handlePrint = () => {
    const win = window.open('', '_blank')
    win.document.write(`
      <html>
        <head>
          <title>${selectedTemplate.name}</title>
          <style>
            body { font-family: 'Times New Roman', serif; font-size: 14px;
                   line-height: 1.8; margin: 40px; color: #000; }
            pre { white-space: pre-wrap; font-family: inherit; }
          </style>
        </head>
        <body><pre>${generatedDoc}</pre></body>
      </html>
    `)
    win.document.close()
    win.print()
  }

  const handleReset = () => {
    setSelectedTemplate(null)
    setFields({})
    setGeneratedDoc('')
    setStep(1)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Legal Document Generator</h2>
          <p className={styles.subtitle}>
            AI powered — generate professional legal documents in seconds
          </p>
        </div>
        {step > 1 && (
          <button className={styles.resetBtn} onClick={handleReset}>
            ← Back to Templates
          </button>
        )}
      </div>

      <div className={styles.steps}>
        <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ''}`}>
          <span className={styles.stepNum}>1</span> Choose Template
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ''}`}>
          <span className={styles.stepNum}>2</span> Fill Details
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.step} ${step >= 3 ? styles.stepActive : ''}`}>
          <span className={styles.stepNum}>3</span> Generated Document
        </div>
      </div>

      {step === 1 && (
        <div className={styles.templateGrid}>
          {templates.map(t => (
            <div key={t.id} className={styles.templateCard}
              onClick={() => handleSelectTemplate(t)}>
              <span className={styles.templateIcon}>{t.icon}</span>
              <h3 className={styles.templateName}>{t.name}</h3>
              <p className={styles.templateDesc}>{t.description}</p>
              <span className={styles.templateFields}>
                {t.fields.length} fields
              </span>
            </div>
          ))}
        </div>
      )}

      {step === 2 && selectedTemplate && (
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <span className={styles.formIcon}>{selectedTemplate.icon}</span>
            <div>
              <h3 className={styles.formTitle}>{selectedTemplate.name}</h3>
              <p className={styles.formSubtitle}>Fill in the details below</p>
            </div>
          </div>

          <div className={styles.fieldsGrid}>
            {selectedTemplate.fields.map(f => (
              <div key={f.key}
                className={`${styles.fieldGroup} ${f.multiline ? styles.fieldFull : ''}`}>
                <label className={styles.fieldLabel}>{f.label}</label>
                {f.multiline ? (
                  <textarea
                    className={styles.fieldInput}
                    placeholder={f.placeholder}
                    value={fields[f.key] || ''}
                    onChange={e => setFields({...fields, [f.key]: e.target.value})}
                    rows={4}
                  />
                ) : (
                  <input
                    className={styles.fieldInput}
                    type={f.type || 'text'}
                    placeholder={f.placeholder}
                    value={fields[f.key] || ''}
                    onChange={e => setFields({...fields, [f.key]: e.target.value})}
                  />
                )}
              </div>
            ))}
          </div>

          <div className={styles.generateSection}>
            <p className={styles.generateNote}>
              🤖 AI will generate a complete professional document based on your inputs
            </p>
            <button className={styles.generateBtn} onClick={handleGenerate}
              disabled={loading}>
              {loading ? '⏳ Generating...' : '✨ Generate Document with AI'}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className={styles.outputContainer}>
          {loading ? (
            <div className={styles.loadingDoc}>
              <div className={styles.loadingSpinner} />
              <p>AI is drafting your {selectedTemplate.name}...</p>
              <span>This takes about 10-15 seconds</span>
            </div>
          ) : (
            <>
              <div className={styles.outputHeader}>
                <div className={styles.outputInfo}>
                  <span>{selectedTemplate.icon}</span>
                  <h3>{selectedTemplate.name}</h3>
                </div>
                <div className={styles.outputActions}>
                  <button className={styles.editBtn}
                    onClick={() => setStep(2)}>
                    ✏️ Edit Fields
                  </button>
                  <button className={styles.downloadBtn}
                    onClick={handleDownload}>
                    ⬇️ Download
                  </button>
                  <button className={styles.printBtn}
                    onClick={handlePrint}>
                    🖨️ Print / PDF
                  </button>
                </div>
              </div>

              <textarea
                className={styles.docOutput}
                value={generatedDoc}
                onChange={e => setGeneratedDoc(e.target.value)}
                spellCheck={false}
              />

              <p className={styles.editNote}>
                ✏️ You can directly edit the document above before downloading
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}