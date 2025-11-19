# Netlify Forms Integration Setup

This document outlines the complete Netlify Forms configuration for your fraud recovery platform.

## Forms Configured

### 1. **Fraud Report Form** (`fraud-report`)
- **Location**: `/report` page (`app/report/page.tsx`)
- **Component**: `components/fraud-reporting-wizard.tsx`
- **Handler**: `netlify/functions/form.ts`
- **Form Type**: Multi-step wizard with 6 steps
- **Fields Captured**:
  - Full Name
  - Scam Type (crypto, fiat, other)
  - Amount Lost
  - Currency
  - Timeline
  - Description
  - Contact Email
  - Contact Phone
  - Transaction Hashes (array)
  - Bank References (array)
  - Evidence Files (up to 10 files)

**Netlify Configuration**:
```toml
[[forms]]
  name = "fraud-report"
  action = "/.netlify/functions/form"
```

**Security Features**:
- ✅ Spam protection with honeypot field (`bot-field`)
- ✅ Required field validation
- ✅ File upload handling (multipart/form-data)
- ✅ IP and user-agent logging
- ✅ Unique case ID generation (`CSRU-XXXXXXXXX`)
- ✅ Detailed logging to Netlify function logs

---

### 2. **Contact Form** (`contact`)
- **Location**: `/contact` page (`app/contact/page.tsx`)
- **Handler**: `netlify/functions/contact.ts`
- **Form Type**: Standard contact form
- **Fields Captured**:
  - First Name
  - Last Name
  - Email
  - Phone (optional)
  - Subject
  - Message

**Netlify Configuration**:
```toml
[[forms]]
  name = "contact"
  action = "/.netlify/functions/contact"
```

**Security Features**:
- ✅ Spam protection with honeypot field (`bot-field`)
- ✅ Required field validation
- ✅ IP and user-agent logging
- ✅ Detailed logging to Netlify function logs

---

## Netlify Configuration (`netlify.toml`)

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

# Fraud Report Form Configuration
[[forms]]
  name = "fraud-report"
  action = "/.netlify/functions/form"

# Contact Form Configuration
[[forms]]
  name = "contact"
  action = "/.netlify/functions/contact"

# Email notification for contact form (optional - requires Netlify account)
[context.production.forms]
  contact = { notification_email = "notifications@example.com" }
  fraud-report = { notification_email = "notifications@example.com" }
```

---

## Function Handlers

### Form Handler (`netlify/functions/form.ts`)
- Handles fraud report form submissions
- Parses multipart/form-data with file uploads
- Validates required fields
- Logs submissions with formatted output for Netlify dashboard
- Captures file metadata without storing actual files (due to serverless constraints)
- Returns case ID for tracking

**Error Handling**:
- Returns 405 for non-POST requests
- Returns 400 for missing required fields
- Returns 500 with error details on processing failures

### Contact Handler (`netlify/functions/contact.ts`)
- Handles contact form submissions
- Parses form data in multiple formats
- Validates required fields
- Logs submissions with formatted output for Netlify dashboard
- Returns success confirmation with timestamp

---

## Form Attributes

### HTML Form Attributes (Both Forms)
```html
<form
  name="[form-name]"
  method="POST"
  data-netlify="true"
  netlify-honeypot="bot-field"
>
  <input type="hidden" name="bot-field" />
  <input type="hidden" name="form-name" value="[form-name]" />
  <!-- form fields -->
</form>
```

- `name`: Unique form identifier (required)
- `method="POST"`: Required for Netlify Forms
- `data-netlify="true"`: Enables Netlify Forms processing
- `netlify-honeypot="bot-field"`: Spam protection field
- Hidden inputs: Allow Netlify to identify and track forms

---

## Viewing Submissions in Netlify Dashboard

Once deployed to Netlify:

1. **Go to your Netlify Site Dashboard**
2. **Navigate to**: Forms > [Form Name]
3. **View Submissions**:
   - Each form submission appears as a new entry
   - View field values and metadata
   - Export submissions as CSV
   - Set up email notifications

---

## Logging & Monitoring

### Netlify Function Logs
Both handlers log detailed submission information:

```
====================================================================================
📋 FRAUD REPORT SUBMISSION RECEIVED | 📧 CONTACT FORM SUBMISSION RECEIVED
====================================================================================
Case ID: CSRU-XXXXXXXXX | Time: 2024-01-XX...
Form: fraud-report | Form: contact
───────────────────────────────────────────────────────────────────────────────────
Submitter: Name (email) | Name: First Last
Phone: +1234567890 | Email: email@example.com
Scam Type: crypto | Subject: Subject Line
Amount: 1000 USD | Message: Message content...
Timeline: Last week
Description: Description...
───────────────────────────────────────────────────────────────────────────────────
Transaction Hashes: 2 | IP Address: 192.168.1.1
Bank References: 1 | User Agent: Mozilla/5.0...
Files Uploaded: 3
File Names: receipt.pdf, screenshot.jpg, ...
───────────────────────────────────────────────────────────────────────────────────
====================================================================================

FULL_SUBMISSION_DATA: { ... complete JSON ... }
```

### View Logs In:
- **Netlify Dashboard**: Functions > Function Logs
- **Command Line** (local): `netlify logs`

---

## Testing Forms Locally

To test forms locally before deploying to Netlify:

```bash
# 1. Start local dev server
npm run dev

# 2. Start Netlify CLI
netlify dev

# 3. Navigate to forms:
# - Fraud Report: http://localhost:3000/report
# - Contact Form: http://localhost:3000/contact

# 4. Submit the forms to test handlers
```

---

## Future Enhancements

To add database persistence or email notifications:

1. **Database Integration** (Supabase, Neon, etc.):
   - Store submissions in a database
   - Query and analyze reports
   - Link with admin dashboard

2. **Email Notifications**:
   - Send confirmation emails to submitters
   - Alert admins of new submissions
   - Include submission summary

3. **File Storage**:
   - Upload evidence files to cloud storage (AWS S3, Netlify Blob)
   - Maintain file references in database
   - Implement file retrieval system

4. **Admin Dashboard**:
   - View all submissions
   - Filter and search reports
   - Update case status
   - Add notes and evidence

---

## Form Validation

### Fraud Report Form
- **Required**: Full Name, Email, Scam Type
- **At Step 2**: Full Name and Email
- **At Step 3**: Amount, Currency, Timeline, Description
- **At Step 4**: At least one transaction hash or bank reference

### Contact Form
- **Required**: First Name, Last Name, Email, Subject, Message
- **Optional**: Phone Number

---

## Security & Privacy

✅ **Implemented**:
- HTTPS encryption (automatic with Netlify)
- Spam protection (honeypot fields)
- Required field validation
- IP logging for abuse detection
- User-agent tracking
- No sensitive data in logs
- Files not persisted in serverless logs

⚠️ **Considerations**:
- Review Netlify's privacy policy for form submissions
- Consider GDPR compliance for EU users
- Implement data retention policies
- Use `.env` for sensitive email configurations

---

## Support & Troubleshooting

### Forms Not Appearing in Dashboard
- Ensure `name` attribute is set correctly
- Verify `data-netlify="true"` is present
- Check that `method="POST"` is set
- Redeploy site after netlifY.toml changes

### Submissions Not Received
- Check Netlify function logs for errors
- Verify form is on a deployed site (not localhost)
- Ensure correct form name matches netlify.toml

### File Upload Issues
- Maximum file size depends on Netlify plan
- Handlers only log file metadata, not contents
- Implement cloud storage integration for actual file handling

---

## Related Files
- `netlify.toml` - Configuration
- `netlify/functions/form.ts` - Fraud report handler
- `netlify/functions/contact.ts` - Contact form handler
- `components/fraud-reporting-wizard.tsx` - Fraud wizard form
- `app/contact/page.tsx` - Contact form page
- `app/report/page.tsx` - Report page wrapper
