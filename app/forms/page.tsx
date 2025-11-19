// Hidden static form page for Netlify Forms detection
// This page contains the complete form structure that Netlify's build bots can scan
// It should not be linked from anywhere in the UI

export default function FormsPage() {
  return (
    <div style={{ display: 'none' }}>
      {/* Hidden static form for Netlify Forms detection */}
      <form name="fraud-report" netlify="true" method="POST">
        <input type="hidden" name="form-name" value="fraud-report" />
        
        {/* Step 1: Scam Type */}
        <input type="hidden" name="scamType" />
        
        {/* Step 2: Personal Details */}
        <input type="text" name="fullName" />
        <input type="email" name="contactEmail" />
        <input type="tel" name="contactPhone" />
        
        {/* Step 3: Financial Details */}
        <input type="text" name="amount" />
        <input type="text" name="currency" />
        
        {/* Step 4: Timeline */}
        <input type="text" name="timeline" />
        
        {/* Step 5: Description */}
        <textarea name="description"></textarea>
        
        {/* Step 6: Evidence */}
        <input type="text" name="transactionHashes" />
        <input type="text" name="bankReferences" />
        <input type="text" name="evidenceFileCount" />
        <input type="text" name="evidenceFileNames" />
        
        {/* Additional metadata */}
        <input type="hidden" name="caseId" />
        <input type="hidden" name="submissionDate" />
      </form>

      {/* Contact form (already working) */}
      <form name="contact" netlify="true" method="POST">
        <input type="hidden" name="form-name" value="contact" />
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="text" name="subject" />
        <textarea name="message"></textarea>
      </form>
    </div>
  )
}