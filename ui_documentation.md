# Sustainable Construction Project Management System - Detailed UI Documentation

This document explicitly breaks down the User Interfaces for **Component 1, 2, 3, and 4**, detailing the specific pages, modals, and individual interactive elements required to build the frontend.

## Global / Foundation UIs
These are the foundational screens that provide access to all components based on user role.

### 1. Main Dashboard (Landing Page)
- **Work:** Provides a summarized view of the user’s responsibilities across all 4 components immediately after login.
- **UI Elements:**
  - **Cards & Widgets:** "Active Projects" count card, "Average Sustainability Score" radial gauge or card, "Pending Document Approvals" alert card, "Low Stock Alerts" list widget.
  - **Navigation:** Persistent sidebar or top navbar with links to Projects, Sustainability, Documents, and Resources.
  - **Quick Action Menu:** Dropdown or floating action button containing shortcuts (e.g., "New Project," "Log Metrics," "Upload Document").
- **Modals:**
  - **Quick Task/Update Modal:** To rapidly mark a project milestone as complete without navigating away. (Elements: Title, Checkbox for milestones, "Save" button).

### 2. Authentication Pages (Login & Register)
- **Work:** Authenticates the user and registers new accounts.
- **UI Elements (Login):** Email Input, Password Input (with visibility toggle icon), "Forgot Password" link, "Login" submit button.
- **UI Elements (Register):** Full Name Input, Email Input, Phone Number Input, Password Input, Role Dropdown (Admin, PM, Inspector, Supplier, Viewer), "Register" submit button.

---

## Component 1: Project Management (Owner: Member 1)
Responsible for project lifecycles, milestones, locations, and overall project tracking.

### 3. Project Directory Page (List View)
- **Work:** Shows all active/past projects a user has access to.
- **UI Elements:**
  - **Search & Filters:** Search bar (by project name), Status Dropdown filter (Planning, In Progress, On Hold, Completed), Year or Date Range picker.
  - **Project Cards / Table:** Displays Project Name, Image placeholder, Status Badge (color-coded), Manager Name, Location string, and a Progress Bar (0-100%).
  - **Action Buttons:** "Create New Project" primary button.
- **Modals:**
  - **Confirm Delete Project Modal:** Warning icon, "Are you sure?" text, "Cancel" and "Delete" (red) buttons.

### 4. Create / Edit Project Page (Or Multi-step Form)
- **Work:** Captures all required data to start a new project.
- **UI Elements:**
  - **Text Inputs:** Project Title, Comprehensive Description Textarea, Total Budget (Number input with currency prefix).
  - **Pickers:** Location Input (autocomplete address and/or Google Maps iframe pin-dropper), Start Date & End Date calendar pickers.
  - **Selectors:** Multi-select dropdown or searchable list for assigning Team Members and the primary Project Manager.
  - **Action Buttons:** "Save as Draft", "Create Project".

### 5. Project Detail & Milestone View Page
- **Work:** Provides an in-depth view of a single project's current status and timeline.
- **UI Elements:**
  - **Header:** Project Title, Current Status Badge dropdown (to instantly change status), Location summary.
  - **Milestone Timeline/Kanban:** Visual timeline or drag-and-drop board. Each milestone card shows Title, Assignee avatar, Target Date, and a Status toggle (Pending, Completed).
  - **Tab Navigation:** Switch views between "Overview," "Team," "Milestones," and jump links to Sustainability/Documents for this specific project.
- **Modals:**
  - **Add/Edit Milestone Modal:** Title Input, Description Textarea, Target Date Datepicker, Assignee Dropdown, "Save Milestone" button.
  - **Manage Team Modal:** Searchable list of users to add/remove from the project, with an "Add Member" button.

---

## Component 2: Sustainability Monitoring (Owner: Member 1)
Responsible for tracking carbon footprint, energy/waste/water, and computing the sustainability score.

### 6. Sustainability Analytics Dashboard Page
- **Work:** Visualizes the ecological impact and system recommendations.
- **UI Elements:**
  - **Main Indicators:** Large centralized Circular Progress Bar showing the current Sustainability Score (colored Green/Yellow/Red). "Trees Equivalent Planted" counter.
  - **Charts:** 
    - Radar/Spider chart detailing Carbon vs. Energy vs. Waste vs. Water scores.
    - historical Line Graph showing month-over-month score trends.
    - Stacked Bar Charts for specific emissions or consumption data.
  - **Recommendation List:** Bulleted or card-based list of AI/System generated suggestions to improve the score.
  - **Action Buttons:** "Record New Metrics" button, "Export Report" button.
- **Modals:**
  - **Export Report/Data Modal:** Date range picker, Format selection dropdown (PDF/CSV/Excel), "Download" button.

### 7. Record Environmental Metrics Page
- **Work:** The primary data entry screen for environmental audits.
- **UI Elements:**
  - **Contextual Inputs:** Project Selection dropdown (if not already in a project context), Audit Date picker.
  - **Carbon Emissions Section:** Number inputs for Transportation (kg CO2), Equipment Usage, Material Transport.
  - **Energy Consumption Section:** Number inputs for Electricity (kWh), Diesel (Liters), Renewable Energy Offset.
  - **Waste Management Section:** Number inputs for Recyclable waste (kg), Non-Recyclable, Hazardous.
  - **Water Usage Section:** Number inputs for Municipal Water (liters), Recycled water.
  - **Text Editor:** "Notes" or "Inspector Comments" textarea.
  - **Action Buttons:** "Submit Audit / Metrics" button.

---

## Component 3: Document & Compliance Management (Owner: Member 2)
Acts as a centralized digital repository, handles approvals, and tracks safety inspections.

### 8. Document Repository Page
- **Work:** Manages the uploading, organization, and retrieval of documents.
- **UI Elements:**
  - **Uploader Zone:** Dashed-border drag-and-drop file upload area.
  - **Filters/Search:** Search bar, Document Type Dropdown (Blueprint, Permit, Certificate, Invoice), Date filter.
  - **Data Table:** Columns for Document Title, Type, Status Badge (Approved, Draft, Under Review), Uploaded By avatar, Upload Date, and an Action Menu column (3-dots).
  - **Action Items (in 3-dot menu):** View/Preview, Download, Delete, View Version History.
- **Modals:**
  - **Upload Metadata Modal:** Pops up after a file is dropped. Elements: Title input, Description textarea, Document Type selection dropdown, "Confirm Upload" button.
  - **Version History Modal:** Lists previous versions of the file with dates, uploaders, and a "Restore" button.

### 9. Document Approval Workflow Interface
- **Work:** Interface for Inspectors/Admins to review pending documents.
- **UI Elements:**
  - **Split Screen Layout:** Left side contains an iframe/PDF reader preview of the document. Right side contains the approval workflow timeline and actions.
  - **Comment Feed:** A scrollable list of notes/feedback left by reviewers.
  - **Action Panel:** "Write Comment" textarea, "Approve" (green) button, "Reject/Needs Revision" (red) button.

### 10. Safety Inspection & Compliance Checklist Page
- **Work:** Enables field workers/inspectors to log safety checks on-site.
- **UI Elements:**
  - **Checklist Selector:** Dropdown of available templates (e.g., "Weekly Crane Safety", "Foundation Compliance").
  - **Dynamic Checklist List:** Rows of criteria. Each row contains:
    - Text description of the check.
    - Radio Button or Toggle Group (Yes / No / N/A).
    - Risk Level indicator dropdown (Low, Medium, High).
    - "Add Note/Photo" ghost button.
  - **Action Buttons:** "Calculate Compliance Score", "Sign & Submit Inspection".
- **Modals:**
  - **Add Evidence Modal:** Triggered by "Add Note/Photo". Elements: Photo uploader input, Note textarea, "Save Attached Evidence" button.

---

## Component 4: Resource & Material Management (Owner: Member 3)
Tracks inventory, equipment, suppliers, and cost tracking.

### 11. Material Inventory Tracking Page
- **Work:** Monitors materials on site and alerts on low supplies.
- **UI Elements:**
  - **Low Stock Banner:** High-visibility alert banners pinned to the top for materials dangerously close to 0.
  - **Inventory Data Table:** Columns for Material Name, Category (Concrete, Steel, Wood), Current Quantity (with unit), Target Quantity, and Supplier Name.
  - **Status Indicators:** Micro-badges showing "In Transit" vs. "On Site".
  - **Action Buttons:** "Add New Material", "Receive Shipment".
- **Modals:**
  - **Add/Edit Material Modal:** Material Name input, Category Dropdown, Unit of Measurement (kg, tons, units), Supplier Dropdown, Threshold Alert Quantity input, "Save Material" button.
  - **Update Stock Quantity Modal:** Number input (with +/- steppers), Note/Reason textarea (e.g., "Received shipment", "Used in Foundation"), "Update" button.

### 12. Equipment & Maintenance Page
- **Work:** Tracks heavy machinery availability and prevents breakdown.
- **UI Elements:**
  - **Dual View Toggle:** Toggle between "List View" (table of equipment) and "Calendar View" (shows when equipment is maintenance downtime).
  - **Equipment Cards:** Image of equipment, Name, ID/Serial Number, Status Badge (Available, In Use, Maintenance).
- **Modals:**
  - **Schedule Maintenance Modal:** Equipment auto-selected, Start/End Datepicker for downtime, Assigned Technician dropdown, Description Textarea, "Schedule" button.

### 13. Supplier Directory & Rating Page
- **Work:** Centralizes supplier data and scores their performance.
- **UI Elements:**
  - **Supplier Profile Cards:** Supplier Logo/Name, Contact Info (Email, Phone), 5-Star Rating display (average score), Sustainability Badge (shows if they are a green supplier).
  - **Action Buttons:** "Add Supplier", "Add Review".
- **Modals:**
  - **Rate Supplier Modal:** 5-star interactive input (click to rate Delivery Speed, Quality, Cost), Text review area, "Submit Review" button.

### 14. Financial Tracking & Budget Analysis Page
- **Work:** Compares planned budget vs actual material/resource costs.
- **UI Elements:**
  - **Summary Widgets:** "Total Budget Overview" card showing Planned vs. Actual vs. Variance.
  - **Visualizations:** Dual Bar Charts comparing planned category spend vs actual category spend (e.g., Labor vs Materials vs Equipment).
  - **Expense Table:** Line-by-line breakdown of logged expenses (Date, Category, Amount, Description).
- **Modals:**
  - **Log New Expense Modal:** Expense Title, Amount Input, Category Dropdown (Materials, Labour, Software, etc.), Date picker, File uploader for Invoice/Receipt, "Log Expense" button.
