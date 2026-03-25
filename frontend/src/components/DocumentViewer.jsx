import { useState } from 'react'
import styles from './DocumentViewer.module.css'

export default function DocumentViewer({ doc, onDelete }) {
  const [viewing, setViewing] = useState(false)

  const isPDF = doc.fileType === 'application/pdf' || doc.name?.endsWith('.pdf')
  const isImage = doc.fileType?.startsWith('image/') ||
    doc.name?.match(/\.(jpg|jpeg|png|gif|webp)$/i)

  const getIcon = () => {
    if (isPDF) return '📄'
    if (isImage) return '🖼️'
    return '📎'
  }

  const formatName = (name) => {
    if (!name) return 'Document'
    return name.length > 30 ? name.substring(0, 27) + '...' : name
  }

  return (
    <>
      <div className={styles.docCard}>
        <div className={styles.docInfo}>
          <span className={styles.docIcon}>{getIcon()}</span>
          <div className={styles.docMeta}>
            <span className={styles.docName}>{formatName(doc.name)}</span>
            <span className={styles.docType}>
              {isPDF ? 'PDF Document' : isImage ? 'Image' : 'Document'}
            </span>
          </div>
        </div>
        <div className={styles.docActions}>
          <button className={styles.viewBtn} onClick={() => setViewing(true)}>
            👁️ View
          </button>
          <a href={doc.url} target="_blank" rel="noreferrer"
            className={styles.downloadBtn} download>
            ⬇️
          </a>
          {onDelete && (
            <button className={styles.deleteBtn} onClick={() => onDelete(doc._id)}>
              🗑️
            </button>
          )}
        </div>
      </div>

      {viewing && (
        <div className={styles.modal} onClick={() => setViewing(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>{doc.name}</span>
              <button className={styles.closeBtn} onClick={() => setViewing(false)}>✕</button>
            </div>
            <div className={styles.modalBody}>
              {isPDF ? (
                <iframe
                  src={doc.url}
                  title={doc.name}
                  className={styles.pdfViewer}
                />
              ) : isImage ? (
                <img src={doc.url} alt={doc.name} className={styles.imageViewer} />
              ) : (
                <div className={styles.unsupported}>
                  <span>📎</span>
                  <p>Preview not available for this file type.</p>
                  <a href={doc.url} target="_blank" rel="noreferrer"
                    className={styles.openLink}>
                    Open in new tab
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}