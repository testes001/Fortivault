# Fraud Reporting Wizard - Error Handlers Review

## Executive Summary
The wizard has **3 critical issues**, **3 high-priority issues**, and **3 medium-priority issues** affecting error handling, validation, and user experience.

---

## CRITICAL Issues (P0) 🔴

### 1. **Transaction Step - NO INPUT VALIDATION**
**File:** `components/wizard-steps/transaction-step.tsx`

**Problem:**
- Zero validation for transaction hashes or bank references
- Accepts empty strings (`.trim()` masks empty input)
- No format validation (crypto hashes should be 64 hex chars, bank refs need format checks)
- No duplicate detection
- Silent acceptance of invalid data

**Impact:** Users can submit invalid transaction references, wasting investigation time.

**Recommended Fix:**
```tsx
// Add validation helper
const isValidTransactionHash = (hash: string): boolean => {
  const cleaned = hash.trim();
  return /^[a-fA-F0-9]{64}$/.test(cleaned); // Bitcoin/Ethereum TXID format
}

// Add to addTransactionHash
const addTransactionHash = () => {
  const cleaned = newHash.trim();
  
  // Check empty
  if (!cleaned) {
    setErrors({ hash: "Hash cannot be empty" });
    return;
  }
  
  // Check format
  if (!isValidTransactionHash(cleaned)) {
    setErrors({ hash: "Invalid hash format. Expected 64 hex characters" });
    return;
  }
  
  // Check duplicates
  if (data.transactionHashes.includes(cleaned)) {
    setErrors({ hash: "This hash has already been added" });
    return;
  }
  
  updateData({ transactionHashes: [...data.transactionHashes, cleaned] });
  setNewHash("");
  setErrors({});
}
```

---

### 2. **Details Step - Missing Select Field Validation**
**File:** `components/wizard-steps/details-step.tsx`

**Problem:**
- Currency select can be empty without showing error
- Timeline select can be empty without showing error
- Only amount and description show field errors
- User receives generic error only at submit time

**Impact:** Users don't know why they can't proceed to next step.

**Recommended Fix:**
```tsx
// Add to DetailsStep component
const [errors, setErrors] = useState<Record<string, string>>({})

const handleCurrencyChange = (value: string) => {
  updateData({ currency: value })
  if (errors.currency) {
    setErrors({ ...errors, currency: "" })
  }
}

const handleTimelineChange = (value: string) => {
  updateData({ timeline: value })
  if (errors.timeline) {
    setErrors({ ...errors, timeline: "" })
  }
}

// Update SelectTrigger components:
<Select value={data.currency} onValueChange={handleCurrencyChange}>
  <SelectTrigger 
    id="currency"
    aria-describedby={errors.currency ? "currency-error" : undefined}
  >
    <SelectValue placeholder="Select currency" />
  </SelectTrigger>
  {/* ... */}
</Select>
{errors.currency && (
  <p id="currency-error" className="text-sm text-red-500" role="alert">
    {errors.currency}
  </p>
)}
```

---

### 3. **Personal Details - Email Validation Not Triggered on First Interaction**
**File:** `components/wizard-steps/personal-details-step.tsx`

**Problem:**
- Email validation only clears error if email is VALID
- User sees no error message until they enter a valid email and the error disappears
- Confusing UX flow

**Impact:** Users don't get immediate feedback that their email format is wrong.

**Recommended Fix:**
```tsx
const handleEmailChange = (value: string) => {
  updateData({ contactEmail: value })
  // Show error if invalid, clear if valid
  if (value && !validateEmail(value)) {
    setErrors({ ...errors, contactEmail: "Please enter a valid email address" })
  } else {
    setErrors({ ...errors, contactEmail: "" })
  }
}
```

---

## HIGH Priority Issues (P1) 🟠

### 1. **Main Wizard - Inconsistent Error State Management**
**File:** `components/fraud-reporting-wizard.tsx`

**Problem:**
- `submissionError` clears only on successful submit or manual dismiss
- `showStepError` only passed to 2 of 6 steps
- Error states not cleared when navigating between steps
- Mix of wizard-level and step-level error handling

**Impact:** Stale error messages persist, confusing users about current state.

**Recommended Fix:**
```tsx
const nextStep = () => {
  if (!canProceed()) {
    setShowStepError(true)
    return
  }
  if (currentStep < steps.length - 1) {
    setCurrentStep(currentStep + 1)
    setShowStepError(false) // ✅ Clear step error on navigation
    setSubmissionError("") // ✅ Clear submission error
  }
}

const prevStep = () => {
  if (currentStep > 0) {
    setCurrentStep(currentStep - 1)
    setShowStepError(false)
    setSubmissionError("")
  }
}
```

---

### 2. **Details Step - Zero Amount Validation**
**File:** `components/wizard-steps/details-step.tsx`

**Problem:**
- `handleAmountChange` accepts `num >= 0`
- User can submit with amount "0" (not a real loss)
- `validateAmount()` in utils requires `num > 0` but step doesn't use it

**Impact:** Users can submit fraud reports with $0 loss, which is nonsensical.

**Recommended Fix:**
```tsx
const handleAmountChange = (value: string) => {
  const num = parseFloat(value)
  
  // Allow empty or valid positive numbers
  if (value === "" || (num > 0 && !isNaN(num))) {
    updateData({ amount: value })
    if (errors.amount) {
      setErrors({ ...errors, amount: "" })
    }
  } else if (value !== "" && num === 0) {
    setErrors({ ...errors, amount: "Amount must be greater than 0" })
  }
}
```

---

### 3. **Evidence Step - File Upload State Prevents Navigation But Not Validation**
**File:** `components/wizard-steps/evidence-step.tsx`

**Problem:**
- `uploadInProgress` state blocks file input
- No error state validation in main wizard's `canProceed()`
- User can be stuck on step with validation errors but `canProceed()` returns true

**Impact:** Users could navigate away from evidence step even if file validation failed.

**Recommended Fix:**
```tsx
// In fraud-reporting-wizard.tsx canProceed()
case 4:
  // EvidenceStep - allow proceeding even without files (optional step)
  // But in EvidenceStep, we could add:
  return !uploadInProgress // Prevent next step during upload

// Or add validation to EvidenceStep props
export interface EvidenceStepProps {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
  isBlocked?: boolean // Add this
}

// Usage in wizard:
{currentStep === 4 && (
  <EvidenceStep 
    data={data} 
    updateData={updateData}
    isBlocked={uploadInProgress}
  />
)}
```

---

## MEDIUM Priority Issues (P2) 🟡

### 1. **Personal Details - Confusing Phone Validation Logic**
**File:** `components/wizard-steps/personal-details-step.tsx`

**Problem:**
```tsx
// Current logic - confusing
if (errors.contactPhone && (value.trim().length === 0 || validatePhone(value))) {
  setErrors({ ...errors, contactPhone: "" })
}
```
- Error clears if field is EMPTY OR VALID
- User might think empty phone clears the error
- Should show error message before clearing

**Impact:** Unclear error handling flow.

**Recommended Fix:**
```tsx
const handlePhoneChange = (value: string) => {
  updateData({ contactPhone: value })
  
  // Phone is optional, only show error if provided but invalid
  if (value.trim().length > 0 && !validatePhone(value)) {
    setErrors({ ...errors, contactPhone: "Invalid phone format" })
  } else {
    setErrors({ ...errors, contactPhone: "" })
  }
}
```

---

### 2. **Evidence Step - Errors Cleared on File Removal**
**File:** `components/wizard-steps/evidence-step.tsx`

**Problem:**
```tsx
const removeFile = (indexToRemove: number) => {
  updateData({
    evidenceFiles: data.evidenceFiles.filter((_, index) => index !== indexToRemove),
  })
  setFileErrors([]) // ✗ Clears ALL errors
}
```
- User gets validation error for file
- Removes that file
- Error disappears even if other files still have issues
- User might miss that other files also failed validation

**Impact:** Silent failure - user doesn't know why previous upload failed.

**Recommended Fix:**
```tsx
const removeFile = (indexToRemove: number) => {
  const newFiles = data.evidenceFiles.filter((_, index) => index !== indexToRemove)
  updateData({ evidenceFiles: newFiles })
  
  // Only clear errors if no files remain, otherwise keep them
  if (newFiles.length === 0) {
    setFileErrors([])
  }
  // File removal doesn't clear validation errors from attempted uploads
}
```

---

### 3. **All Steps - No Blur/Focus Event Validation**
**Files:** Multiple step components

**Problem:**
- Validation only happens on onChange or when clicking Next
- No validation on blur (field exit)
- User won't see errors until they try to proceed
- Delays feedback

**Impact:** Poor UX - validation feedback is delayed.

**Recommended Fix Example (PersonalDetailsStep):**
```tsx
const handleEmailBlur = (value: string) => {
  if (value && !validateEmail(value)) {
    setErrors({ ...errors, contactEmail: "Please enter a valid email address" })
  }
}

<Input
  id="contactEmail"
  type="email"
  value={data.contactEmail}
  onChange={(e) => handleEmailChange(e.target.value)}
  onBlur={(e) => handleEmailBlur(e.target.value)}
  aria-describedby={errors.contactEmail ? "contactEmail-error" : "contactEmail-hint"}
  aria-required="true"
/>
```

---

## Summary Table

| Issue | Severity | File | Quick Fix |
|-------|----------|------|-----------|
| No transaction input validation | 🔴 CRITICAL | transaction-step.tsx | Add format & duplicate validation |
| Missing currency/timeline errors | 🔴 CRITICAL | details-step.tsx | Add error states and displays |
| Email validation UX flow broken | 🔴 CRITICAL | personal-details-step.tsx | Show error when invalid |
| Error states not cleared between steps | 🟠 HIGH | fraud-reporting-wizard.tsx | Clear errors on navigation |
| Zero amount validation | 🟠 HIGH | details-step.tsx | Validate > 0 |
| Upload state blocks without validation | 🟠 HIGH | evidence-step.tsx | Block based on file validation |
| Phone validation logic confusing | 🟡 MEDIUM | personal-details-step.tsx | Simplify optional logic |
| Error cleared on file removal | 🟡 MEDIUM | evidence-step.tsx | Keep errors if other files fail |
| No blur event validation | 🟡 MEDIUM | All steps | Add onBlur handlers |

---

## Implementation Priority

1. **Fix transaction validation** (prevents invalid submissions)
2. **Fix currency/timeline errors** (blocks form progression)
3. **Fix email validation UX** (critical field)
4. **Fix error state clearing** (fixes multiple issues)
5. **Fix zero amount** (data quality)
6. **Fix upload state** (prevents edge cases)
7. **Fix medium priority issues** (UX improvements)

