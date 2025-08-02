# Mirath Legal - UX Design Guidelines & Wireframes

## 1. Design Philosophy

### Core Principles
1. **Trust & Credibility**: Professional, secure, and reliable interface that builds confidence
2. **Simplicity First**: Complex legal processes made intuitive and accessible
3. **Cultural Sensitivity**: Respectful of UAE's multicultural, multilingual environment
4. **Progressive Disclosure**: Show only what's needed, when it's needed
5. **Mobile-First**: Seamless experience across all devices

### Design Values
- **Professional Elegance**: Sophisticated without being intimidating
- **Accessible Expertise**: Making legal complexity approachable
- **Efficient Workflows**: Every click has purpose, every screen adds value
- **Inclusive Design**: Accessible to diverse backgrounds and technical abilities

## 2. Visual Design System

### 2.1 Color Palette
*Building on existing Tailwind CSS v4 and dark/light theme support*

#### Primary Colors
```css
/* Professional Trust - Deep Blue */
--primary-50: #eff6ff
--primary-100: #dbeafe
--primary-500: #3b82f6  /* Main brand color */
--primary-600: #2563eb
--primary-900: #1e3a8a

/* Legal Authority - Deep Navy */
--secondary-500: #1e40af
--secondary-600: #1d4ed8
--secondary-900: #1e3a8a

/* UAE Heritage - Gold Accent */
--accent-400: #fbbf24
--accent-500: #f59e0b
--accent-600: #d97706
```

#### Status Colors
```css
/* Success - Will Complete */
--success-50: #f0fdf4
--success-500: #22c55e
--success-600: #16a34a

/* Warning - Review Required */
--warning-50: #fffbeb
--warning-500: #f59e0b
--warning-600: #d97706

/* Error - Compliance Issue */
--error-50: #fef2f2
--error-500: #ef4444
--error-600: #dc2626

/* Info - DIFC Updates */
--info-50: #eff6ff
--info-500: #3b82f6
--info-600: #2563eb
```

### 2.2 Typography
*Leveraging existing shadcn/ui typography system*

#### Font Hierarchy
```css
/* Primary Font - Clean, Professional */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

/* Arabic Support */
font-family: 'Noto Sans Arabic', 'Inter', sans-serif;

/* Legal Documents - Serif for formality */
font-family: 'Crimson Text', Georgia, serif;
```

#### Type Scale
```css
/* Display - Hero sections */
.text-display: 3rem/1.1 (48px)

/* Heading 1 - Page titles */
.text-h1: 2.25rem/1.2 (36px)

/* Heading 2 - Section titles */
.text-h2: 1.875rem/1.3 (30px)

/* Heading 3 - Subsection titles */
.text-h3: 1.5rem/1.4 (24px)

/* Body Large - Important content */
.text-lg: 1.125rem/1.6 (18px)

/* Body - Default text */
.text-base: 1rem/1.6 (16px)

/* Caption - Helper text */
.text-sm: 0.875rem/1.5 (14px)

/* Legal - Fine print */
.text-xs: 0.75rem/1.4 (12px)
```

### 2.3 Spacing & Layout
*Building on Tailwind's spacing system*

#### Container System
```css
/* Mobile First Containers */
.container-sm: max-width: 640px
.container-md: max-width: 768px
.container-lg: max-width: 1024px
.container-xl: max-width: 1280px

/* Section Spacing */
.section-padding: py-16 md:py-24
.section-gap: gap-8 md:gap-12
```

#### Grid System
```css
/* Dashboard Layout */
.dashboard-grid: grid-cols-1 lg:grid-cols-4 xl:grid-cols-5
.main-content: lg:col-span-3 xl:col-span-4
.sidebar: lg:col-span-1

/* Form Layout */
.form-grid: grid-cols-1 md:grid-cols-2 gap-6
.form-section: space-y-6
```

## 3. Component Library Extensions

### 3.1 Custom Components
*Extending existing shadcn/ui components*

#### Legal Form Components
```tsx
// Progress Indicator for Will Creation
<WillProgress currentStep={3} totalSteps={8} />

// Legal Document Preview
<DocumentPreview 
  content={willContent} 
  mode="preview" | "edit" 
  language="en" | "ar" 
/>

// Compliance Checker
<ComplianceAlert 
  level="info" | "warning" | "error"
  title="DIFC Requirement"
  description="..."
/>

// Asset Input Component
<AssetInput 
  type="property" | "business" | "investment"
  jurisdiction="UAE" | "International"
  validation={difcRules}
/>
```

#### Law Firm Specific Components
```tsx
// Client Portfolio Card
<ClientCard 
  client={clientData}
  status="draft" | "review" | "complete"
  priority="normal" | "urgent"
/>

// Matter Timeline
<MatterTimeline 
  events={matterEvents}
  currentStage="intake" | "draft" | "review" | "complete"
/>

// Billing Summary
<BillingSummary 
  matter={matterData}
  timeEntries={timeData}
  expenses={expenseData}
/>
```

### 3.2 Layout Templates

#### Dashboard Layout
```tsx
// Law Firm Dashboard
<DashboardLayout>
  <Sidebar>
    <Navigation />
    <ClientSearch />
    <QuickActions />
  </Sidebar>
  
  <MainContent>
    <DashboardHeader />
    <StatsOverview />
    <ActiveMatters />
    <RecentActivity />
  </MainContent>
  
  <RightPanel>
    <Notifications />
    <DIFCUpdates />
    <SupportChat />
  </RightPanel>
</DashboardLayout>
```

#### Will Creation Flow
```tsx
// Multi-step Will Creation
<WillCreationLayout>
  <ProgressHeader />
  
  <FormContent>
    <StepContent currentStep={step} />
    <ValidationAlerts />
  </FormContent>
  
  <FormActions>
    <SaveDraft />
    <PreviousStep />
    <NextStep />
    <ExitFlow />
  </FormActions>
</WillCreationLayout>
```

## 4. User Journey Maps

### 4.1 Law Firm Onboarding Journey

#### Discovery & Registration
```
1. Landing Page Visit
   ↓
2. Pricing Comparison
   ↓
3. Demo Request/Trial Signup
   ↓
4. Firm Verification Process
   ↓
5. Setup & Configuration
   ↓
6. Team Training
   ↓
7. First Client Onboarding
```

**Key Touchpoints:**
- Professional landing page with UAE-specific value props
- Interactive demo showcasing DIFC compliance features
- Streamlined verification using UAE business registration
- Guided setup wizard for firm branding and preferences
- Video training library and live onboarding sessions

#### Sample Wireframe Flow:
```
[Landing Page]
Hero: "Transform Your Estate Planning Practice"
- Value props: 70% cost reduction, DIFC compliance, AI-powered
- Social proof: Partner law firm logos
- CTA: "Start Free Trial"

[Pricing Page]
Three-tier comparison:
Starter | Professional | Enterprise
Features matrix with UAE-specific benefits
ROI calculator based on firm size

[Demo Booking]
Calendar integration
Firm information collection
Specific interest areas (DIFC, expatriate, business succession)
```

### 4.2 Client Will Creation Journey

#### Initial Consultation to Completion
```
1. Lawyer Invitation/Portal Access
   ↓
2. Personal Information Collection
   ↓
3. Asset Inventory & Classification
   ↓
4. Family Structure & Beneficiaries
   ↓
5. Expatriate Considerations
   ↓
6. AI-Generated Draft Review
   ↓
7. Lawyer Review & Modifications
   ↓
8. Client Final Approval
   ↓
9. DIFC Registration Process
   ↓
10. Document Delivery & Storage
```

**UX Considerations:**
- Clear progress indication at each step
- Save & resume functionality for complex forms
- Multi-language support with cultural sensitivity
- Mobile-friendly for busy professionals
- Secure document handling with encryption indicators

## 5. Detailed Wireframes

### 5.1 Law Firm Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Mirath Legal     [Search Clients]  [Notifications] [Profile] │
├─────────────┬───────────────────────────────────────────────┤
│             │ DASHBOARD OVERVIEW                           │
│ NAVIGATION  │                                             │
│             │ ┌─────────┬─────────┬─────────┬─────────┐   │
│ • Dashboard │ │ Active  │ Pending │ Revenue │ DIFC    │   │
│ • Clients   │ │ Matters │ Review  │ This    │ Pending │   │
│ • Documents │ │   24    │   8     │ Month   │   3     │   │
│ • Billing   │ │         │         │ AED 45K │         │   │
│ • Reports   │ └─────────┴─────────┴─────────┴─────────┘   │
│ • Settings  │                                             │
│             │ RECENT ACTIVITY                             │
│ QUICK       │ ┌─────────────────────────────────────────┐ │
│ ACTIONS     │ │ • Sarah Ahmed - Complex Will Draft      │ │
│             │ │   Status: Lawyer Review                 │ │
│ + New Will  │ │ • Mohammed Al-Rashid - DIFC Registration│ │
│ + Add Client│ │   Status: Pending Approval              │ │
│ + Upload    │ │ • Jennifer Smith - Document Complete    │ │
│             │ │   Status: Client Signature Required     │ │
│ DIFC ALERTS │ └─────────────────────────────────────────┘ │
│             │                                             │
│ ⚠️ Regulation│ URGENT MATTERS                              │
│   Update    │ ┌─────────────────────────────────────────┐ │
│             │ │ 🔴 Estate Planning - Due in 2 days     │ │
│             │ │ 🟡 Business Succession - Review needed  │ │
│             │ └─────────────────────────────────────────┘ │
└─────────────┴───────────────────────────────────────────────┤
```

### 5.2 Will Creation Flow - Step 1 (Personal Information)

```
┌─────────────────────────────────────────────────────────────┐
│ [Back] CREATE NEW WILL - Personal Information     [Save Draft]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Progress: ●●○○○○○○ Step 1 of 8 - Personal Information      │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ BASIC INFORMATION                                       │ │
│ │                                                         │ │
│ │ Full Name (as per Emirates ID)                          │ │
│ │ [_________________________________]                    │ │
│ │                                                         │ │
│ │ Emirates ID Number                                      │ │
│ │ [___-____-_______-_] [Verify with UAE Pass]            │ │
│ │                                                         │ │
│ │ Date of Birth        │ Place of Birth                   │ │
│ │ [DD/MM/YYYY]        │ [Country____________]            │ │
│ │                                                         │ │
│ │ Current UAE Visa Status                                 │ │
│ │ ○ UAE Residence Visa ○ Investor Visa ○ Golden Visa     │ │
│ │ ○ Employment Visa    ○ Other: [_________]               │ │
│ │                                                         │ │
│ │ 💡 Tip: Your visa status affects which UAE laws        │ │
│ │    apply to your estate. We'll guide you through       │ │
│ │    the implications in later steps.                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ CONTACT INFORMATION                                     │ │
│ │                                                         │ │
│ │ Mobile Number (UAE)   │ Email Address                   │ │
│ │ [+971 _____________] │ [_________________]              │ │
│ │                                                         │ │
│ │ Current Address in UAE                                  │ │
│ │ [_________________________________________________]      │ │
│ │ [City____________] [Emirate__________] [PO Box_____]    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                    [Previous] [Save & Continue]            │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Will Creation Flow - Step 3 (Asset Classification)

```
┌─────────────────────────────────────────────────────────────┐
│ [Back] CREATE NEW WILL - Assets & Property        [Save Draft]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Progress: ●●●○○○○○ Step 3 of 8 - Assets & Property         │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ UAE PROPERTY                                            │ │
│ │                                                         │ │
│ │ Do you own property in the UAE?                         │ │
│ │ ○ Yes ○ No                                              │ │
│ │                                                         │ │
│ │ ┌─ Property 1 ────────────────────────────────────────┐ │ │
│ │ │ Property Type: [Apartment ▼]                       │ │ │
│ │ │ Location: [Downtown Dubai_________________]          │ │ │
│ │ │ Ownership: ○ Freehold ○ Leasehold                  │ │ │
│ │ │ Title Deed Number: [________________]                │ │ │
│ │ │ Estimated Value: AED [____________]                  │ │ │
│ │ │                                    [Remove Property]│ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ │                                                         │ │
│ │ [+ Add Another Property]                                │ │
│ │                                                         │ │
│ │ ⚠️  DIFC Compliance Note:                              │ │
│ │    UAE property can be distributed according to DIFC   │ │
│ │    will provisions. International property may be      │ │
│    subject to home country inheritance laws.            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ INTERNATIONAL ASSETS                                    │ │
│ │                                                         │ │
│ │ Do you have assets outside the UAE?                     │ │
│ │ ○ Yes ○ No                                              │ │
│ │                                                         │ │
│ │ Asset Type: [Bank Accounts ▼]                           │ │
│ │ Country: [United Kingdom_______________]                 │ │
│ │ Description: [HSBC Current Account_____]                 │ │
│ │ Estimated Value: [Currency ▼] [Amount_______]           │ │
│ │                                                         │ │
│ │ 🔍 AI Insight: UK assets may require separate          │ │
│ │    probate proceedings. Consider creating a UK will     │ │
│ │    specifically for these assets.                       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                    [Previous] [Save & Continue]            │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 AI Review & Recommendations Screen

```
┌─────────────────────────────────────────────────────────────┐
│ [Back] AI ANALYSIS & RECOMMENDATIONS           [Save Draft] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Progress: ●●●●●●○○ Step 6 of 8 - AI Review                 │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🤖 AI ANALYSIS COMPLETE                                 │ │
│ │                                                         │ │
│ │ Based on your information, our AI has identified       │ │
│ │ several recommendations for your estate plan:          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ✅ COMPLIANCE STATUS                                    │ │
│ │                                                         │ │
│ │ • DIFC Will Requirements: ✓ Met                         │ │
│ │ • UAE Federal Law Conflicts: ✓ None Detected           │ │
│ │ • International Considerations: ⚠️ Review Required     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 💡 RECOMMENDATIONS                                      │ │
│ │                                                         │ │
│ │ 1. UK Property Considerations                           │ │
│ │    Your UK property may require separate probate.      │ │
│ │    Recommendation: Create UK will for UK assets only   │ │
│ │    [Learn More] [Accept] [Dismiss]                      │ │
│ │                                                         │ │
│ │ 2. Guardian Appointment                                 │ │
│ │    Consider appointing backup guardians for your       │ │
│ │    minor children in case primary guardian unavailable │ │
│ │    [Learn More] [Accept] [Dismiss]                      │ │
│ │                                                         │ │
│ │ 3. Business Succession Planning                         │ │
│ │    Your UAE business shares may benefit from a         │ │
│ │    specific succession plan to avoid operational       │ │
│ │    disruption                                           │ │
│ │    [Learn More] [Accept] [Dismiss]                      │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📄 GENERATED WILL PREVIEW                               │ │
│ │                                                         │ │
│ │ [Preview Document] [Download Draft]                     │ │
│ │                                                         │ │
│ │ Your will has been generated and is ready for lawyer   │ │
│ │ review. The document includes all DIFC-required        │ │
│ │ clauses and addresses your specific circumstances.     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│                    [Previous] [Continue to Review]         │
└─────────────────────────────────────────────────────────────┘
```

### 5.5 Mobile Dashboard (Law Firm)

```
┌─────────────────────────┐
│ ≡ Mirath Legal    🔔 👤 │
├─────────────────────────┤
│                         │
│ Good morning, Sarah     │
│ Al-Mansouri Law Firm    │
│                         │
│ ┌─────┬─────┬─────────┐ │
│ │ 12  │ 4   │ AED 28K │ │
│ │ Active│ Pending│ Revenue │ │
│ │ Matters│ Review│ Month │ │
│ └─────┴─────┴─────────┘ │
│                         │
│ 🔴 URGENT (2)           │
│ ┌─────────────────────┐ │
│ │ Ahmed Hassan        │ │
│ │ DIFC Registration   │ │
│ │ Due: Today          │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │ Lisa Chen           │ │
│ │ Document Review     │ │
│ │ Due: Tomorrow       │ │
│ └─────────────────────┘ │
│                         │
│ 📋 RECENT ACTIVITY     │
│ • New client: John Smith│
│ • Will completed: Sarah │
│ • Payment received: AED │
│   2,500                 │
│                         │
│ ┌─────────────────────┐ │
│ │    + NEW WILL       │ │
│ └─────────────────────┘ │
│                         │
│ ┌─────────────────────┐ │
│ │   📞 SUPPORT        │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

## 6. Responsive Design Guidelines

### 6.1 Breakpoint Strategy
```css
/* Mobile First Approach */
.mobile: 0px - 639px
.tablet: 640px - 1023px  
.desktop: 1024px - 1279px
.large: 1280px+
```

### 6.2 Component Adaptation

#### Navigation
- **Mobile**: Collapsible hamburger menu with full-screen overlay
- **Tablet**: Side drawer that can be toggled
- **Desktop**: Fixed sidebar with full navigation visible

#### Data Tables
- **Mobile**: Card-based layout with key information stacked
- **Tablet**: Horizontal scroll with sticky first column
- **Desktop**: Full table with all columns visible

#### Forms
- **Mobile**: Single column, full-width inputs
- **Tablet**: Two-column layout where appropriate
- **Desktop**: Multi-column with optimal grouping

## 7. Accessibility Guidelines

### 7.1 WCAG 2.1 AA Compliance

#### Color & Contrast
- Minimum contrast ratio 4.5:1 for normal text
- Minimum contrast ratio 3:1 for large text
- Color not sole means of conveying information

#### Keyboard Navigation
- All interactive elements accessible via keyboard
- Logical tab order throughout interface
- Visible focus indicators on all focusable elements

#### Screen Reader Support
- Semantic HTML structure
- Proper ARIA labels and descriptions
- Alt text for all images and icons

### 7.2 Multilingual Considerations

#### Arabic Language Support
- RTL (Right-to-Left) layout support
- Arabic font optimization
- Cultural color and imagery considerations
- Date and number format localization

#### Content Strategy
- Professional translation (not machine translation)
- Cultural adaptation, not just literal translation
- Legal terminology consistency across languages
- Clear language switching interface

## 8. Performance Optimization

### 8.1 Loading Strategy
- Critical CSS inlined for above-the-fold content
- Progressive image loading with placeholders
- Code splitting for route-based optimization
- Prefetching for anticipated user actions

### 8.2 Mobile Performance
- Optimized touch targets (minimum 44px)
- Reduced network requests for slower connections
- Offline capability for essential features
- Progressive Web App capabilities

## 9. Design System Documentation

### 9.1 Component Usage Guidelines
- When to use each component variant
- Accessibility requirements for each component
- Content guidelines and best practices
- Examples of proper implementation

### 9.2 Brand Guidelines
- Logo usage and placement rules
- Photography and illustration style
- Voice and tone for UI copy
- Legal disclaimer requirements

## 10. Testing & Validation

### 10.1 Usability Testing Plan
- User testing with law firm partners
- Client journey testing with diverse user groups
- Accessibility testing with assistive technologies
- Cross-browser and device testing

### 10.2 Success Metrics
- Task completion rates for key workflows
- Time to complete will creation process
- Error rates and user frustration points
- User satisfaction and Net Promoter Score

This comprehensive UX design framework ensures Mirath Legal delivers a professional, accessible, and culturally appropriate experience that builds trust while simplifying complex legal processes.