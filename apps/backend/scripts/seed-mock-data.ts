/**
 * SustainSite — Mock Data Seed Script
 *
 * Run with:
 *   npx ts-node -r tsconfig-paths/register scripts/seed-mock-data.ts
 *
 * Requires MONGODB_URI in .env (or set it inline below).
 * WARNING: This script INSERTS new documents — it does NOT wipe existing data.
 *          Run once. If you need to re-run, drop the seeded collections first.
 *
 * insertMany does NOT run pre('save') hooks. Seeded docs must set any fields
 * those hooks would compute (e.g. Material.totalCost, ComplianceChecklist totals).
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ─── Models ──────────────────────────────────────────────────────────────────
import Project    from '../src/models/Project';
import Milestone  from '../src/models/Milestone';
import Supplier   from '../src/models/Supplier';
import Material   from '../src/models/Material';
import Equipment  from '../src/models/Equipment';
import SustainabilityMetric from '../src/models/SustainabilityMetric';
import DocumentModel        from '../src/models/Document';
import ComplianceChecklist  from '../src/models/ComplianceChecklist';
import SafetyInspection     from '../src/models/SafetyInspection';

// ─── Known User IDs (from your MongoDB) ──────────────────────────────────────
const JAMES   = new mongoose.Types.ObjectId('69d909e359250aecadad7eb3'); // ADMIN
const EMILY   = new mongoose.Types.ObjectId('69d90a0e59250aecadad7f02'); // PROJECT_MANAGER
const MICHAEL = new mongoose.Types.ObjectId('69d90a3859250aecadad7f1d'); // PROJECT_MANAGER
const SARAH   = new mongoose.Types.ObjectId('69d90a6d59250aecadad7f38'); // INSPECTOR
const DANIEL  = new mongoose.Types.ObjectId('69d90a8b59250aecadad7f53'); // SUPPLIER
const OLIVIA  = new mongoose.Types.ObjectId('69d90aca59250aecadad7f78'); // VIEWER

// ─── Helpers ─────────────────────────────────────────────────────────────────
const daysAgo  = (n: number) => new Date(Date.now() - n * 86_400_000);
const daysFrom = (n: number) => new Date(Date.now() + n * 86_400_000);

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('✅  Connected to MongoDB');

  // ── 1. SUPPLIERS ────────────────────────────────────────────────────────────
  console.log('🌱  Seeding suppliers…');

  const [sup1, sup2, sup3] = await Supplier.insertMany([
    {
      companyName: 'GreenBuild Materials Ltd.',
      registrationNumber: 'GB-2019-04412',
      contactPerson: 'Daniel Patel',
      email: 'daniel.patel@greenbuild.com',
      phoneNumber: '+94771234567',
      address: { street: '14 Industrial Park Rd', city: 'Colombo', state: 'Western', country: 'Sri Lanka', postalCode: '00300' },
      materialsSupplied: ['Cement', 'Steel', 'Aggregates'],
      servicesProvided: ['Bulk delivery', 'On-site mixing'],
      paymentTerms: 'Net 30',
      deliveryLeadTime: 5,
      totalOrders: 42,
      completedOrders: 40,
      onTimeDeliveryRate: 95.24,
      averageRating: 4.6,
      isSustainabilityCertified: true,
      certifications: ['ISO 14001', 'LEED Supplier'],
      sustainabilityScore: 8.5,
      isActive: true,
      isPreferred: true,
      addedBy: JAMES,
      notes: 'Primary supplier for structural materials. Excellent track record.',
    },
    {
      companyName: 'EcoTimber Solutions',
      registrationNumber: 'ET-2021-00887',
      contactPerson: 'Rachel Fernandez',
      email: 'rachel@ecotimber.lk',
      phoneNumber: '+94779876543',
      address: { street: '7 Forest Lane', city: 'Kandy', state: 'Central', country: 'Sri Lanka', postalCode: '20000' },
      materialsSupplied: ['Wood', 'Bamboo Composites'],
      servicesProvided: ['Custom cutting', 'Certified timber supply'],
      paymentTerms: 'Net 15',
      deliveryLeadTime: 7,
      totalOrders: 18,
      completedOrders: 17,
      onTimeDeliveryRate: 88.24,
      averageRating: 4.2,
      isSustainabilityCertified: true,
      certifications: ['FSC Certified', 'PEFC'],
      sustainabilityScore: 9.1,
      isActive: true,
      isPreferred: false,
      addedBy: EMILY,
      notes: 'Specialist in FSC-certified timber. Slightly longer lead times but excellent quality.',
    },
    {
      companyName: 'Apex Brick & Block Co.',
      registrationNumber: 'AB-2017-11234',
      contactPerson: 'Kevin Mendis',
      email: 'kevin@apexbrick.lk',
      phoneNumber: '+94762345678',
      address: { street: '22 Kiln Road', city: 'Gampaha', state: 'Western', country: 'Sri Lanka', postalCode: '11000' },
      materialsSupplied: ['Bricks', 'Concrete Blocks', 'Paving'],
      servicesProvided: ['Bulk delivery', 'Custom orders'],
      paymentTerms: 'Net 45',
      deliveryLeadTime: 3,
      totalOrders: 31,
      completedOrders: 29,
      onTimeDeliveryRate: 90.32,
      averageRating: 3.9,
      isSustainabilityCertified: false,
      certifications: [],
      sustainabilityScore: 5.5,
      isActive: true,
      isPreferred: false,
      addedBy: MICHAEL,
      notes: 'Competitive pricing on bricks. Working towards sustainability certification.',
    },
  ]);

  // Link Daniel (SUPPLIER user) to sup1
  await mongoose.connection.collection('users').updateOne(
    { _id: DANIEL },
    { $set: { supplierId: sup1._id } }
  );

  // ── 2. PROJECTS ─────────────────────────────────────────────────────────────
  console.log('🌱  Seeding projects…');

  const [proj1, proj2, proj3] = await Project.insertMany([
    {
      projectName: 'Verdant Tower — Phase 1',
      description: 'A 24-storey mixed-use development targeting LEED Gold certification. Phase 1 covers foundation, basement car park, and structural frame up to level 8.',
      location: { address: '45 Galle Road, Colombo 03, Sri Lanka', latitude: 6.8942, longitude: 79.8528 },
      startDate: daysAgo(180),
      endDate: daysFrom(120),
      status: 'In Progress',
      budget: 485_000_000,
      actualCost: 198_750_000,
      projectManager: EMILY,
      teamMembers: [EMILY, SARAH, OLIVIA, JAMES],
      sustainabilityScore: 78,
      currentPhase: 'Structural Frame — Level 6',
      completionPercentage: 42,
      createdBy: JAMES,
    },
    {
      projectName: 'Riverside Eco-Residences',
      description: 'A 60-unit residential complex with passive cooling design, rooftop solar, and rainwater harvesting. Targeting BREEAM Excellent.',
      location: { address: '12 Beira Lake Drive, Colombo 02, Sri Lanka', latitude: 6.9271, longitude: 79.8612 },
      startDate: daysAgo(90),
      endDate: daysFrom(275),
      status: 'In Progress',
      budget: 320_000_000,
      actualCost: 74_200_000,
      projectManager: MICHAEL,
      teamMembers: [MICHAEL, SARAH, DANIEL, OLIVIA],
      sustainabilityScore: 85,
      currentPhase: 'Foundation & Basement',
      completionPercentage: 18,
      createdBy: JAMES,
    },
    {
      projectName: 'Harbour View Commercial Hub',
      description: 'Renovation and expansion of an existing 8-storey commercial building. Focus on energy efficiency upgrades, facade replacement, and green roof installation.',
      location: { address: '3 Marine Drive, Colombo 01, Sri Lanka', latitude: 6.9366, longitude: 79.8503 },
      startDate: daysAgo(300),
      endDate: daysAgo(15),
      status: 'Completed',
      budget: 155_000_000,
      actualCost: 148_300_000,
      projectManager: EMILY,
      teamMembers: [EMILY, MICHAEL, SARAH, JAMES],
      sustainabilityScore: 91,
      currentPhase: 'Completed',
      completionPercentage: 100,
      createdBy: JAMES,
    },
  ]);

  // Update users' assignedProjects
  await mongoose.connection.collection('users').updateOne(
    { _id: EMILY },
    { $set: { assignedProjects: [proj1._id, proj3._id] } }
  );
  await mongoose.connection.collection('users').updateOne(
    { _id: MICHAEL },
    { $set: { assignedProjects: [proj2._id, proj3._id] } }
  );
  await mongoose.connection.collection('users').updateOne(
    { _id: SARAH },
    { $set: { assignedProjects: [proj1._id, proj2._id, proj3._id] } }
  );
  await mongoose.connection.collection('users').updateOne(
    { _id: OLIVIA },
    { $set: { assignedProjects: [proj1._id, proj2._id] } }
  );

  // ── 3. MILESTONES ───────────────────────────────────────────────────────────
  console.log('🌱  Seeding milestones…');

  await Milestone.insertMany([
    // Verdant Tower milestones
    { projectId: proj1._id, title: 'Site Clearance & Hoarding', description: 'Complete site preparation and install perimeter hoarding.', targetDate: daysAgo(160), completionDate: daysAgo(158), status: 'Completed', completionPercentage: 100, assignedTo: EMILY },
    { projectId: proj1._id, title: 'Piling & Foundation Works', description: 'Install 180 bored piles and pour pile caps.', targetDate: daysAgo(100), completionDate: daysAgo(95), status: 'Completed', completionPercentage: 100, assignedTo: EMILY },
    { projectId: proj1._id, title: 'Basement B2 Slab Pour', description: 'Complete reinforced concrete slab for basement level 2.', targetDate: daysAgo(60), completionDate: daysAgo(55), status: 'Completed', completionPercentage: 100, assignedTo: EMILY },
    { projectId: proj1._id, title: 'Structural Frame to Level 8', description: 'Complete RC frame, columns and slabs up to level 8.', targetDate: daysFrom(45), status: 'In Progress', completionPercentage: 65, assignedTo: EMILY },
    { projectId: proj1._id, title: 'MEP Rough-In — Levels 1–4', description: 'Install mechanical, electrical and plumbing rough-in for lower floors.', targetDate: daysFrom(90), status: 'Pending', completionPercentage: 0, assignedTo: SARAH },
    { projectId: proj1._id, title: 'Facade Cladding Installation', description: 'Install high-performance glazed curtain wall system.', targetDate: daysFrom(115), status: 'Pending', completionPercentage: 0, assignedTo: EMILY },

    // Riverside Eco-Residences milestones
    { projectId: proj2._id, title: 'Geotechnical Survey & Soil Tests', description: 'Conduct bore holes and soil bearing capacity tests.', targetDate: daysAgo(80), completionDate: daysAgo(78), status: 'Completed', completionPercentage: 100, assignedTo: MICHAEL },
    { projectId: proj2._id, title: 'Raft Foundation Pour', description: 'Pour 1,200 m³ of reinforced raft foundation.', targetDate: daysAgo(20), completionDate: daysAgo(18), status: 'Completed', completionPercentage: 100, assignedTo: MICHAEL },
    { projectId: proj2._id, title: 'Ground Floor Slab & Podium', description: 'Complete ground floor slab and podium structure.', targetDate: daysFrom(30), status: 'In Progress', completionPercentage: 40, assignedTo: MICHAEL },
    { projectId: proj2._id, title: 'Solar PV System Design Approval', description: 'Finalise and get approval for 120 kWp rooftop solar design.', targetDate: daysFrom(60), status: 'Pending', completionPercentage: 0, assignedTo: MICHAEL },

    // Harbour View (completed)
    { projectId: proj3._id, title: 'Facade Demolition & Shoring', targetDate: daysAgo(270), completionDate: daysAgo(265), status: 'Completed', completionPercentage: 100, assignedTo: EMILY },
    { projectId: proj3._id, title: 'New Curtain Wall Installation', targetDate: daysAgo(180), completionDate: daysAgo(175), status: 'Completed', completionPercentage: 100, assignedTo: EMILY },
    { projectId: proj3._id, title: 'HVAC Upgrade — All Floors', targetDate: daysAgo(90), completionDate: daysAgo(88), status: 'Completed', completionPercentage: 100, assignedTo: MICHAEL },
    { projectId: proj3._id, title: 'Green Roof & Landscaping', targetDate: daysAgo(30), completionDate: daysAgo(20), status: 'Completed', completionPercentage: 100, assignedTo: EMILY },
    { projectId: proj3._id, title: 'Final Inspections & Handover', targetDate: daysAgo(15), completionDate: daysAgo(15), status: 'Completed', completionPercentage: 100, assignedTo: SARAH },
  ]);

  // ── 4. SUSTAINABILITY METRICS ────────────────────────────────────────────────
  console.log('🌱  Seeding sustainability metrics…');

  // Verdant Tower — 6 monthly readings (improving trend)
  const verdantMetrics = [
    { month: 150, carbon: { t: 0.8, e: 1.2, m: 2.1 }, energy: { el: 12000, diesel: 4500, renew: 3000 }, waste: { rec: 18, nonRec: 8, haz: 0.5 }, water: { mun: 420, rec: 80 } },
    { month: 120, carbon: { t: 0.7, e: 1.1, m: 1.9 }, energy: { el: 11500, diesel: 4200, renew: 3500 }, waste: { rec: 20, nonRec: 7, haz: 0.4 }, water: { mun: 400, rec: 95 } },
    { month: 90,  carbon: { t: 0.65, e: 1.0, m: 1.8 }, energy: { el: 11000, diesel: 3800, renew: 4000 }, waste: { rec: 22, nonRec: 6, haz: 0.3 }, water: { mun: 380, rec: 110 } },
    { month: 60,  carbon: { t: 0.6, e: 0.9, m: 1.7 }, energy: { el: 10500, diesel: 3500, renew: 4500 }, waste: { rec: 24, nonRec: 5, haz: 0.3 }, water: { mun: 360, rec: 125 } },
    { month: 30,  carbon: { t: 0.55, e: 0.85, m: 1.6 }, energy: { el: 10000, diesel: 3200, renew: 5000 }, waste: { rec: 26, nonRec: 5, haz: 0.2 }, water: { mun: 340, rec: 140 } },
    { month: 5,   carbon: { t: 0.5, e: 0.8, m: 1.5 }, energy: { el: 9500, diesel: 3000, renew: 5500 }, waste: { rec: 28, nonRec: 4, haz: 0.2 }, water: { mun: 320, rec: 155 } },
  ];

  for (const m of verdantMetrics) {
    const metric = new SustainabilityMetric({
      projectId: proj1._id,
      carbonEmissions: { transportation: m.carbon.t, equipment: m.carbon.e, materials: m.carbon.m, total: 0 },
      energyConsumption: { electricity: m.energy.el, diesel: m.energy.diesel, renewableEnergy: m.energy.renew, total: 0 },
      wasteManagement: { recyclable: m.waste.rec, nonRecyclable: m.waste.nonRec, hazardous: m.waste.haz, total: 0, diversionRate: 0 },
      waterUsage: { municipal: m.water.mun, recycled: m.water.rec, total: 0 },
      recordedDate: daysAgo(m.month),
      recordedBy: EMILY,
      notes: `Monthly environmental audit — ${new Date(Date.now() - m.month * 86_400_000).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
    });
    await metric.save(); // triggers pre-save score calculation
  }

  // Riverside — 3 readings (early stage, improving)
  const riversideMetrics = [
    { month: 70, carbon: { t: 0.4, e: 0.6, m: 0.9 }, energy: { el: 6000, diesel: 2000, renew: 2500 }, waste: { rec: 12, nonRec: 4, haz: 0.2 }, water: { mun: 200, rec: 60 } },
    { month: 40, carbon: { t: 0.35, e: 0.55, m: 0.8 }, energy: { el: 5500, diesel: 1800, renew: 3000 }, waste: { rec: 14, nonRec: 3, haz: 0.1 }, water: { mun: 180, rec: 75 } },
    { month: 10, carbon: { t: 0.3, e: 0.5, m: 0.75 }, energy: { el: 5000, diesel: 1600, renew: 3500 }, waste: { rec: 16, nonRec: 3, haz: 0.1 }, water: { mun: 165, rec: 90 } },
  ];

  for (const m of riversideMetrics) {
    const metric = new SustainabilityMetric({
      projectId: proj2._id,
      carbonEmissions: { transportation: m.carbon.t, equipment: m.carbon.e, materials: m.carbon.m, total: 0 },
      energyConsumption: { electricity: m.energy.el, diesel: m.energy.diesel, renewableEnergy: m.energy.renew, total: 0 },
      wasteManagement: { recyclable: m.waste.rec, nonRecyclable: m.waste.nonRec, hazardous: m.waste.haz, total: 0, diversionRate: 0 },
      waterUsage: { municipal: m.water.mun, recycled: m.water.rec, total: 0 },
      recordedDate: daysAgo(m.month),
      recordedBy: MICHAEL,
      notes: `Monthly environmental audit — ${new Date(Date.now() - m.month * 86_400_000).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
    });
    await metric.save();
  }

  // Harbour View — 5 readings (completed project, high scores)
  const harbourMetrics = [
    { month: 280, carbon: { t: 0.9, e: 1.4, m: 2.5 }, energy: { el: 18000, diesel: 5000, renew: 1000 }, waste: { rec: 14, nonRec: 10, haz: 1.0 }, water: { mun: 600, rec: 50 } },
    { month: 220, carbon: { t: 0.7, e: 1.1, m: 2.0 }, energy: { el: 15000, diesel: 4000, renew: 2500 }, waste: { rec: 18, nonRec: 8, haz: 0.6 }, water: { mun: 520, rec: 80 } },
    { month: 160, carbon: { t: 0.55, e: 0.9, m: 1.6 }, energy: { el: 12000, diesel: 3000, renew: 4000 }, waste: { rec: 22, nonRec: 5, haz: 0.3 }, water: { mun: 420, rec: 120 } },
    { month: 90,  carbon: { t: 0.4, e: 0.7, m: 1.2 }, energy: { el: 9000, diesel: 2000, renew: 6000 }, waste: { rec: 28, nonRec: 3, haz: 0.2 }, water: { mun: 300, rec: 180 } },
    { month: 20,  carbon: { t: 0.3, e: 0.5, m: 0.9 }, energy: { el: 7000, diesel: 1500, renew: 8000 }, waste: { rec: 32, nonRec: 2, haz: 0.1 }, water: { mun: 200, rec: 220 } },
  ];

  for (const m of harbourMetrics) {
    const metric = new SustainabilityMetric({
      projectId: proj3._id,
      carbonEmissions: { transportation: m.carbon.t, equipment: m.carbon.e, materials: m.carbon.m, total: 0 },
      energyConsumption: { electricity: m.energy.el, diesel: m.energy.diesel, renewableEnergy: m.energy.renew, total: 0 },
      wasteManagement: { recyclable: m.waste.rec, nonRecyclable: m.waste.nonRec, hazardous: m.waste.haz, total: 0, diversionRate: 0 },
      waterUsage: { municipal: m.water.mun, recycled: m.water.rec, total: 0 },
      recordedDate: daysAgo(m.month),
      recordedBy: EMILY,
      notes: `Monthly environmental audit — ${new Date(Date.now() - m.month * 86_400_000).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
    });
    await metric.save();
  }

  // ── 5. DOCUMENTS ────────────────────────────────────────────────────────────
  console.log('🌱  Seeding documents…');

  await DocumentModel.insertMany([
    // Verdant Tower
    {
      projectId: proj1._id,
      documentType: 'Blueprint',
      title: 'Structural Foundation Drawings — Rev C',
      description: 'Revised structural drawings incorporating piling layout changes approved by the structural engineer.',
      fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      fileName: 'VT-STR-FND-RevC.pdf',
      fileSize: 4_820_000,
      fileFormat: 'pdf',
      version: '3.0',
      status: 'Approved',
      uploadedBy: EMILY,
      approvedBy: JAMES,
      approvalDate: daysAgo(85),
      tags: ['structural', 'foundation', 'approved'],
    },
    {
      projectId: proj1._id,
      documentType: 'Permit',
      title: 'Building Permit — UDA Approval',
      description: 'Urban Development Authority building permit for 24-storey mixed-use development.',
      fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      fileName: 'VT-UDA-PERMIT-2024.pdf',
      fileSize: 1_250_000,
      fileFormat: 'pdf',
      version: '1.0',
      status: 'Approved',
      uploadedBy: JAMES,
      approvedBy: JAMES,
      approvalDate: daysAgo(170),
      tags: ['permit', 'UDA', 'legal'],
    },
    {
      projectId: proj1._id,
      documentType: 'Safety Report',
      title: 'Monthly Safety Audit — March 2026',
      description: 'Comprehensive safety audit covering scaffolding, PPE compliance, and emergency procedures.',
      fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      fileName: 'VT-SAFETY-MAR2026.pdf',
      fileSize: 2_100_000,
      fileFormat: 'pdf',
      version: '1.0',
      status: 'Under Review',
      uploadedBy: SARAH,
      tags: ['safety', 'audit', 'monthly'],
    },
    {
      projectId: proj1._id,
      documentType: 'Contract',
      title: 'Main Contractor Agreement — BuildCorp Lanka',
      description: 'Lump sum contract for civil and structural works, valued at LKR 320M.',
      fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      fileName: 'VT-CONTRACT-BUILDCORP.pdf',
      fileSize: 3_450_000,
      fileFormat: 'pdf',
      version: '2.0',
      status: 'Approved',
      uploadedBy: JAMES,
      approvedBy: JAMES,
      approvalDate: daysAgo(175),
      tags: ['contract', 'civil', 'structural'],
    },
    {
      projectId: proj1._id,
      documentType: 'Certificate',
      title: 'LEED Pre-Certification Letter',
      description: 'USGBC pre-certification confirming Verdant Tower is on track for LEED Gold.',
      fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      fileName: 'VT-LEED-PRECERT.pdf',
      fileSize: 890_000,
      fileFormat: 'pdf',
      version: '1.0',
      status: 'Approved',
      uploadedBy: EMILY,
      approvedBy: JAMES,
      approvalDate: daysAgo(130),
      tags: ['LEED', 'certification', 'sustainability'],
    },

    // Riverside
    {
      projectId: proj2._id,
      documentType: 'Blueprint',
      title: 'Architectural Floor Plans — Ground to Level 3',
      description: 'Architectural drawings for residential units, common areas and podium levels.',
      fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      fileName: 'RE-ARCH-L0-L3.pdf',
      fileSize: 6_200_000,
      fileFormat: 'pdf',
      version: '2.0',
      status: 'Under Review',
      uploadedBy: MICHAEL,
      tags: ['architectural', 'floor plans', 'residential'],
    },
    {
      projectId: proj2._id,
      documentType: 'Permit',
      title: 'Environmental Impact Assessment — Approved',
      description: 'Central Environmental Authority EIA approval for Riverside Eco-Residences.',
      fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      fileName: 'RE-EIA-CEA-APPROVAL.pdf',
      fileSize: 2_800_000,
      fileFormat: 'pdf',
      version: '1.0',
      status: 'Approved',
      uploadedBy: MICHAEL,
      approvedBy: JAMES,
      approvalDate: daysAgo(75),
      tags: ['EIA', 'environmental', 'CEA'],
    },
    {
      projectId: proj2._id,
      documentType: 'Other',
      title: 'Solar PV System Specification',
      description: 'Technical specification for 120 kWp rooftop solar photovoltaic system including inverters and battery storage.',
      fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      fileName: 'RE-SOLAR-SPEC-v1.pdf',
      fileSize: 1_650_000,
      fileFormat: 'pdf',
      version: '1.0',
      status: 'Draft',
      uploadedBy: MICHAEL,
      tags: ['solar', 'renewable', 'specification'],
    },

    // Harbour View (completed project — all approved)
    {
      projectId: proj3._id,
      documentType: 'Certificate',
      title: 'BREEAM Excellent Certificate',
      description: 'Official BREEAM Excellent certification awarded upon project completion.',
      fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      fileName: 'HV-BREEAM-EXCELLENT.pdf',
      fileSize: 750_000,
      fileFormat: 'pdf',
      version: '1.0',
      status: 'Approved',
      uploadedBy: EMILY,
      approvedBy: JAMES,
      approvalDate: daysAgo(18),
      tags: ['BREEAM', 'certification', 'completed'],
    },
    {
      projectId: proj3._id,
      documentType: 'Safety Report',
      title: 'Project Completion Safety Sign-Off',
      description: 'Final safety inspection report confirming all works completed to statutory requirements.',
      fileUrl: 'https://res.cloudinary.com/demo/raw/upload/sample.pdf',
      fileName: 'HV-SAFETY-FINAL.pdf',
      fileSize: 1_900_000,
      fileFormat: 'pdf',
      version: '1.0',
      status: 'Approved',
      uploadedBy: SARAH,
      approvedBy: JAMES,
      approvalDate: daysAgo(16),
      tags: ['safety', 'final', 'sign-off'],
    },
  ]);

  // ── 6. COMPLIANCE CHECKLISTS ─────────────────────────────────────────────────
  console.log('🌱  Seeding compliance checklists…');

  await ComplianceChecklist.insertMany([
    // Verdant Tower — Environmental
    {
      projectId: proj1._id,
      checklistName: 'LEED Gold — Energy & Atmosphere Credits',
      category: 'Environmental',
      dueDate: daysFrom(60),
      lastReviewDate: daysAgo(10),
      createdBy: EMILY,
      items: [
        { itemId: 'EA-1', itemName: 'Fundamental Commissioning of Building Energy Systems', isCompleted: true, completedDate: daysAgo(50), completedBy: EMILY },
        { itemId: 'EA-2', itemName: 'Minimum Energy Performance — ASHRAE 90.1 compliance', isCompleted: true, completedDate: daysAgo(45), completedBy: EMILY },
        { itemId: 'EA-3', itemName: 'Building-Level Energy Metering installed', isCompleted: true, completedDate: daysAgo(30), completedBy: EMILY },
        { itemId: 'EA-4', itemName: 'Optimize Energy Performance — 15% above baseline', isCompleted: false, notes: 'Awaiting MEP contractor submission' },
        { itemId: 'EA-5', itemName: 'Renewable Energy — On-site solar PV design approved', isCompleted: false },
        { itemId: 'EA-6', itemName: 'Enhanced Commissioning — third-party review', isCompleted: false },
      ],
      totalItems: 6,
      completedItems: 3,
      complianceScore: 50,
    },
    {
      projectId: proj1._id,
      checklistName: 'Construction Safety — Monthly Compliance',
      category: 'Safety',
      dueDate: daysFrom(8),
      lastReviewDate: daysAgo(2),
      createdBy: SARAH,
      items: [
        { itemId: 'CS-1', itemName: 'All workers hold valid safety induction certificates', isCompleted: true, completedDate: daysAgo(5), completedBy: SARAH },
        { itemId: 'CS-2', itemName: 'Scaffolding inspection completed and tagged', isCompleted: true, completedDate: daysAgo(3), completedBy: SARAH },
        { itemId: 'CS-3', itemName: 'Fire extinguishers serviced and in place', isCompleted: true, completedDate: daysAgo(3), completedBy: SARAH },
        { itemId: 'CS-4', itemName: 'Emergency evacuation drill conducted', isCompleted: false, notes: 'Scheduled for next week' },
        { itemId: 'CS-5', itemName: 'First aid kits stocked and accessible', isCompleted: true, completedDate: daysAgo(1), completedBy: SARAH },
        { itemId: 'CS-6', itemName: 'PPE compliance audit — 100% of workers', isCompleted: false },
        { itemId: 'CS-7', itemName: 'Crane operator licences verified', isCompleted: true, completedDate: daysAgo(7), completedBy: SARAH },
      ],
      totalItems: 7,
      completedItems: 5,
      complianceScore: 71,
    },
    {
      projectId: proj1._id,
      checklistName: 'Building Code — Structural Works Approval',
      category: 'Building Code',
      dueDate: daysFrom(35),
      lastReviewDate: daysAgo(15),
      createdBy: EMILY,
      items: [
        { itemId: 'BC-1', itemName: 'Structural drawings approved by licensed engineer', isCompleted: true, completedDate: daysAgo(80), completedBy: EMILY },
        { itemId: 'BC-2', itemName: 'Concrete cube test results — 28-day strength confirmed', isCompleted: true, completedDate: daysAgo(40), completedBy: EMILY },
        { itemId: 'BC-3', itemName: 'Rebar inspection sign-off — Level 4 slab', isCompleted: true, completedDate: daysAgo(20), completedBy: SARAH },
        { itemId: 'BC-4', itemName: 'Rebar inspection sign-off — Level 5 slab', isCompleted: false, notes: 'Scheduled for next pour' },
        { itemId: 'BC-5', itemName: 'Post-pour inspection — Level 5 columns', isCompleted: false },
      ],
      totalItems: 5,
      completedItems: 3,
      complianceScore: 60,
    },

    // Riverside — Environmental & Safety
    {
      projectId: proj2._id,
      checklistName: 'BREEAM Excellent — Water Efficiency Credits',
      category: 'Environmental',
      dueDate: daysFrom(90),
      lastReviewDate: daysAgo(5),
      createdBy: MICHAEL,
      items: [
        { itemId: 'WE-1', itemName: 'Rainwater harvesting system design approved', isCompleted: true, completedDate: daysAgo(30), completedBy: MICHAEL },
        { itemId: 'WE-2', itemName: 'Greywater recycling system specified', isCompleted: true, completedDate: daysAgo(25), completedBy: MICHAEL },
        { itemId: 'WE-3', itemName: 'Water-efficient fixtures schedule submitted', isCompleted: false },
        { itemId: 'WE-4', itemName: 'Irrigation system — drip design approved', isCompleted: false },
        { itemId: 'WE-5', itemName: 'Water metering strategy documented', isCompleted: false },
      ],
      totalItems: 5,
      completedItems: 2,
      complianceScore: 40,
    },
    {
      projectId: proj2._id,
      checklistName: 'Foundation Works — Safety Compliance',
      category: 'Safety',
      dueDate: daysFrom(15),
      lastReviewDate: daysAgo(1),
      createdBy: SARAH,
      items: [
        { itemId: 'FW-1', itemName: 'Excavation shoring inspected and certified', isCompleted: true, completedDate: daysAgo(10), completedBy: SARAH },
        { itemId: 'FW-2', itemName: 'Dewatering system operational and monitored', isCompleted: true, completedDate: daysAgo(8), completedBy: SARAH },
        { itemId: 'FW-3', itemName: 'Adjacent property monitoring points installed', isCompleted: true, completedDate: daysAgo(12), completedBy: SARAH },
        { itemId: 'FW-4', itemName: 'Concrete pump setup safety check', isCompleted: false, notes: 'Pump arriving next week' },
        { itemId: 'FW-5', itemName: 'Night work noise permit obtained', isCompleted: false },
      ],
      totalItems: 5,
      completedItems: 4,
      complianceScore: 80,
    },

    // Harbour View (completed — all items done)
    {
      projectId: proj3._id,
      checklistName: 'BREEAM Excellent — Final Certification Checklist',
      category: 'Sustainability Certification',
      dueDate: daysAgo(20),
      lastReviewDate: daysAgo(18),
      createdBy: EMILY,
      items: [
        { itemId: 'FC-1', itemName: 'Energy performance certificate issued', isCompleted: true, completedDate: daysAgo(25), completedBy: EMILY },
        { itemId: 'FC-2', itemName: 'Water efficiency report submitted to BREEAM assessor', isCompleted: true, completedDate: daysAgo(22), completedBy: EMILY },
        { itemId: 'FC-3', itemName: 'Waste management final diversion rate documented', isCompleted: true, completedDate: daysAgo(22), completedBy: EMILY },
        { itemId: 'FC-4', itemName: 'Ecology survey completed and signed off', isCompleted: true, completedDate: daysAgo(28), completedBy: EMILY },
        { itemId: 'FC-5', itemName: 'BREEAM assessor site visit completed', isCompleted: true, completedDate: daysAgo(19), completedBy: JAMES },
        { itemId: 'FC-6', itemName: 'Certificate received and filed', isCompleted: true, completedDate: daysAgo(18), completedBy: JAMES },
      ],
      totalItems: 6,
      completedItems: 6,
      complianceScore: 100,
    },
  ]);

  // ── 7. SAFETY INSPECTIONS ────────────────────────────────────────────────────
  console.log('🌱  Seeding safety inspections…');

  await SafetyInspection.insertMany([
    // Verdant Tower — mix of risk levels
    {
      projectId: proj1._id,
      inspectionType: 'Safety',
      inspectionDate: daysAgo(5),
      inspector: SARAH,
      inspectorNotes: 'Routine weekly safety walk. Overall compliance good. Two minor issues noted.',
      findings: 'Scaffolding on Level 6 north face has two missing mid-rails. Workers on Level 5 observed without hard hats in one section. All other areas compliant.',
      riskLevel: 'Medium',
      issuesIdentified: [
        { issue: 'Missing mid-rails on scaffolding', severity: 'Moderate', location: 'Level 6 — North Face' },
        { issue: 'Workers without hard hats', severity: 'Minor', location: 'Level 5 — East Wing' },
      ],
      actionRequired: 'Reinstate scaffolding mid-rails immediately. Issue PPE reminder to all Level 5 workers.',
      recommendedActions: ['Replace missing mid-rails within 24 hours', 'Conduct PPE toolbox talk', 'Increase spot checks on Level 5'],
      actionDeadline: daysFrom(2),
      actionStatus: 'In Progress',
      isResolved: false,
    },
    {
      projectId: proj1._id,
      inspectionType: 'Structural',
      inspectionDate: daysAgo(18),
      inspector: SARAH,
      inspectorNotes: 'Pre-pour inspection for Level 5 slab. All rebar in place and correct cover maintained.',
      findings: 'Rebar layout matches approved drawings. Concrete cover spacers correctly installed. Formwork secure. Ready for pour.',
      riskLevel: 'Low',
      issuesIdentified: [],
      actionRequired: '',
      recommendedActions: ['Proceed with concrete pour as scheduled'],
      actionStatus: 'Completed',
      isResolved: true,
    },
    {
      projectId: proj1._id,
      inspectionType: 'Environmental',
      inspectionDate: daysAgo(35),
      inspector: SARAH,
      inspectorNotes: 'Monthly environmental compliance check. Dust suppression and waste segregation reviewed.',
      findings: 'Dust suppression systems operational. Waste segregation bins in place but hazardous waste storage area lacks secondary containment. Concrete washout area needs relocation — too close to storm drain.',
      riskLevel: 'High',
      issuesIdentified: [
        { issue: 'Hazardous waste storage lacks secondary containment', severity: 'Major', location: 'Site compound — South corner' },
        { issue: 'Concrete washout too close to storm drain', severity: 'Major', location: 'Site entrance — West side' },
      ],
      actionRequired: 'Install secondary containment bund around hazardous waste storage. Relocate concrete washout area minimum 10m from storm drain.',
      recommendedActions: [
        'Install 200L bund around chemical storage within 48 hours',
        'Relocate concrete washout within 5 working days',
        'Notify environmental officer',
        'Update site environmental management plan',
      ],
      actionDeadline: daysAgo(28),
      actionStatus: 'Completed',
      isResolved: true,
    },
    {
      projectId: proj1._id,
      inspectionType: 'Safety',
      inspectionDate: daysAgo(2),
      inspector: SARAH,
      inspectorNotes: 'Urgent inspection following near-miss incident report submitted by site foreman.',
      findings: 'Crane slewing radius encroaches onto public footpath during certain lifts. Footpath not adequately barricaded. Potential for dropped object to reach public area. CRITICAL risk — crane operations suspended pending rectification.',
      riskLevel: 'Critical',
      issuesIdentified: [
        { issue: 'Crane slewing radius over public footpath — no adequate barricade', severity: 'Major', location: 'Tower crane TC-01 — North elevation' },
        { issue: 'Dropped object risk to public', severity: 'Major', location: 'Galle Road footpath adjacent to site' },
      ],
      actionRequired: 'Suspend crane operations immediately. Install hard barricade and overhead protection on footpath. Obtain approval from local authority before resuming lifts.',
      recommendedActions: [
        'Suspend all crane lifts immediately',
        'Install overhead protection gantry on footpath',
        'Engage structural engineer to review crane lift plan',
        'Submit revised lift plan to local authority',
        'Brief all workers on revised exclusion zones',
      ],
      actionDeadline: daysFrom(1),
      actionStatus: 'In Progress',
      isResolved: false,
    },

    // Riverside
    {
      projectId: proj2._id,
      inspectionType: 'Safety',
      inspectionDate: daysAgo(8),
      inspector: SARAH,
      inspectorNotes: 'Foundation excavation safety inspection. Deep excavation — 4.5m below ground level.',
      findings: 'Shoring system in good condition. Dewatering pumps operational. Edge protection in place. One section of edge protection on north side has a 3m gap. Ladder access to excavation is non-compliant — no safety cage.',
      riskLevel: 'High',
      issuesIdentified: [
        { issue: 'Gap in edge protection — 3m section', severity: 'Major', location: 'North side of excavation' },
        { issue: 'Ladder access without safety cage', severity: 'Moderate', location: 'Main access ladder — East end' },
      ],
      actionRequired: 'Close edge protection gap immediately. Replace ladder with compliant access tower.',
      recommendedActions: ['Install temporary Heras fencing to close gap', 'Order compliant ladder tower — 48hr delivery', 'Restrict access until rectified'],
      actionDeadline: daysAgo(5),
      actionStatus: 'Completed',
      isResolved: true,
    },
    {
      projectId: proj2._id,
      inspectionType: 'Environmental',
      inspectionDate: daysAgo(22),
      inspector: SARAH,
      inspectorNotes: 'Initial environmental baseline inspection for new project.',
      findings: 'Site boundary silt fencing installed and intact. Wheel wash operational. No evidence of sediment runoff to adjacent waterway. Fuel storage area compliant with bunding requirements.',
      riskLevel: 'Low',
      issuesIdentified: [],
      actionRequired: '',
      recommendedActions: ['Maintain current environmental controls', 'Monitor silt fence after heavy rainfall'],
      actionStatus: 'Completed',
      isResolved: true,
    },

    // Harbour View (completed project)
    {
      projectId: proj3._id,
      inspectionType: 'Safety',
      inspectionDate: daysAgo(20),
      inspector: SARAH,
      inspectorNotes: 'Final pre-handover safety inspection.',
      findings: 'All temporary works removed. Site clean and tidy. No outstanding safety issues. Building ready for occupancy inspection.',
      riskLevel: 'Low',
      issuesIdentified: [],
      actionRequired: '',
      recommendedActions: ['Proceed with statutory occupancy inspection'],
      actionStatus: 'Completed',
      isResolved: true,
    },
  ]);

  // ── 8. MATERIALS ─────────────────────────────────────────────────────────────
  console.log('🌱  Seeding materials…');

  await Material.insertMany([
    // Verdant Tower materials
    {
      projectId: proj1._id,
      materialName: 'Grade 60 Deformed Rebar',
      category: 'Steel',
      description: 'High-yield deformed steel reinforcement bars, Grade 60 (420 MPa), for structural RC works.',
      quantity: 850,
      unit: 'tonnes',
      unitPrice: 185_000,
      totalCost: 850 * 185_000,
      supplier: sup1._id,
      purchaseOrderNumber: 'PO-VT-2025-0042',
      orderDate: daysAgo(120),
      expectedDeliveryDate: daysAgo(90),
      actualDeliveryDate: daysAgo(88),
      status: 'In Stock',
      currentStock: 320,
      minimumThreshold: 80,
      suggestedReorderQuantity: 200,
      sustainabilityRating: 7,
      isEcoFriendly: false,
      recycledContent: 30,
      certifications: ['SLS 375'],
      createdBy: EMILY,
      notes: 'Delivered in 4 batches. Current stock sufficient for Level 6–8 works.',
    },
    {
      projectId: proj1._id,
      materialName: 'Ordinary Portland Cement (OPC 53)',
      category: 'Cement',
      description: '53-grade OPC in 50 kg bags for general concrete works and masonry.',
      quantity: 12_000,
      unit: 'bags',
      unitPrice: 1_850,
      totalCost: 12_000 * 1_850,
      supplier: sup1._id,
      purchaseOrderNumber: 'PO-VT-2025-0043',
      orderDate: daysAgo(100),
      expectedDeliveryDate: daysAgo(75),
      actualDeliveryDate: daysAgo(73),
      status: 'In Stock',
      currentStock: 3_200,
      minimumThreshold: 500,
      suggestedReorderQuantity: 2_000,
      sustainabilityRating: 5,
      isEcoFriendly: false,
      recycledContent: 0,
      certifications: ['SLS 107'],
      createdBy: EMILY,
    },
    {
      projectId: proj1._id,
      materialName: 'Crushed Granite Aggregate (20mm)',
      category: 'Aggregates',
      description: '20mm crushed granite coarse aggregate for structural concrete mixes.',
      quantity: 2_500,
      unit: 'm³',
      unitPrice: 8_500,
      totalCost: 2_500 * 8_500,
      supplier: sup1._id,
      purchaseOrderNumber: 'PO-VT-2025-0044',
      orderDate: daysAgo(95),
      expectedDeliveryDate: daysAgo(70),
      actualDeliveryDate: daysAgo(68),
      status: 'In Stock',
      currentStock: 780,
      minimumThreshold: 150,
      suggestedReorderQuantity: 500,
      sustainabilityRating: 6,
      isEcoFriendly: false,
      recycledContent: 0,
      certifications: [],
      createdBy: EMILY,
    },
    {
      projectId: proj1._id,
      materialName: 'Structural Formwork Plywood (18mm)',
      category: 'Wood',
      description: 'FSC-certified 18mm marine-grade plywood for slab and column formwork.',
      quantity: 3_500,
      unit: 'sheets',
      unitPrice: 4_200,
      totalCost: 3_500 * 4_200,
      supplier: sup2._id,
      purchaseOrderNumber: 'PO-VT-2025-0051',
      orderDate: daysAgo(80),
      expectedDeliveryDate: daysAgo(60),
      actualDeliveryDate: daysAgo(58),
      status: 'In Stock',
      currentStock: 1_100,
      minimumThreshold: 200,
      suggestedReorderQuantity: 600,
      sustainabilityRating: 9,
      isEcoFriendly: true,
      recycledContent: 0,
      certifications: ['FSC Certified'],
      createdBy: EMILY,
      notes: 'FSC-certified — contributes to LEED MR credits.',
    },

    // Riverside materials
    {
      projectId: proj2._id,
      materialName: 'Hollow Concrete Blocks (200mm)',
      category: 'Bricks',
      description: '200mm hollow concrete blocks for non-structural partition walls.',
      quantity: 45_000,
      unit: 'units',
      unitPrice: 120,
      totalCost: 45_000 * 120,
      supplier: sup3._id,
      purchaseOrderNumber: 'PO-RE-2025-0011',
      orderDate: daysAgo(50),
      expectedDeliveryDate: daysAgo(30),
      actualDeliveryDate: daysAgo(28),
      status: 'In Stock',
      currentStock: 38_000,
      minimumThreshold: 5_000,
      suggestedReorderQuantity: 10_000,
      sustainabilityRating: 5,
      isEcoFriendly: false,
      recycledContent: 15,
      certifications: [],
      createdBy: MICHAEL,
    },
    {
      projectId: proj2._id,
      materialName: 'Bamboo Composite Decking',
      category: 'Wood',
      description: 'High-density bamboo composite boards for balcony and common area decking.',
      quantity: 800,
      unit: 'm²',
      unitPrice: 6_800,
      totalCost: 800 * 6_800,
      supplier: sup2._id,
      purchaseOrderNumber: 'PO-RE-2025-0012',
      orderDate: daysAgo(30),
      expectedDeliveryDate: daysFrom(10),
      status: 'Ordered',
      currentStock: 0,
      minimumThreshold: 0,
      suggestedReorderQuantity: 0,
      sustainabilityRating: 10,
      isEcoFriendly: true,
      recycledContent: 0,
      certifications: ['FSC Certified', 'PEFC'],
      createdBy: MICHAEL,
      notes: 'Contributes to BREEAM Materials credits. Awaiting delivery.',
    },
  ]);

  // ── 9. EQUIPMENT ─────────────────────────────────────────────────────────────
  console.log('🌱  Seeding equipment…');

  await Equipment.insertMany([
    {
      equipmentName: 'Liebherr Tower Crane TC-01',
      equipmentType: 'Crane',
      serialNumber: 'LH-TC-2019-00441',
      assetId: 'EQ-CRANE-001',
      manufacturer: 'Liebherr',
      equipmentModel: '132 EC-H 8',
      yearOfManufacture: 2019,
      currentProjectId: proj1._id,
      assignedTo: EMILY,
      status: 'In Use',
      lastMaintenanceDate: daysAgo(30),
      nextScheduledMaintenance: daysFrom(60),
      purchasePrice: 42_000_000,
      currentValue: 35_000_000,
      depreciationRate: 10,
      rentalRatePerDay: 85_000,
      currentLocation: 'Verdant Tower — Tower crane base Level B1',
      maintenanceHistory: [
        { maintenanceDate: daysAgo(30), maintenanceType: 'Routine', description: 'Monthly inspection — greasing, wire rope check, limit switch test.', cost: 45_000, performedBy: 'Liebherr Lanka Service', nextMaintenanceDate: daysFrom(60) },
        { maintenanceDate: daysAgo(90), maintenanceType: 'Routine', description: 'Quarterly service — full mechanical inspection and load test.', cost: 120_000, performedBy: 'Liebherr Lanka Service', nextMaintenanceDate: daysAgo(30) },
      ],
      assignmentHistory: [
        { projectId: proj1._id, assignedDate: daysAgo(170), operatorId: EMILY, hoursUsed: 1240, fuelConsumed: 0 },
      ],
      notes: 'Critical asset. Crane operations currently suspended pending safety rectification.',
    },
    {
      equipmentName: 'Caterpillar Excavator CAT 320',
      equipmentType: 'Excavator',
      serialNumber: 'CAT-320-2021-08812',
      assetId: 'EQ-EXC-001',
      manufacturer: 'Caterpillar',
      equipmentModel: '320',
      yearOfManufacture: 2021,
      currentProjectId: proj2._id,
      assignedTo: MICHAEL,
      status: 'In Use',
      lastMaintenanceDate: daysAgo(15),
      nextScheduledMaintenance: daysFrom(45),
      purchasePrice: 28_000_000,
      currentValue: 24_500_000,
      depreciationRate: 8,
      rentalRatePerDay: 55_000,
      currentLocation: 'Riverside Eco-Residences — Excavation area',
      maintenanceHistory: [
        { maintenanceDate: daysAgo(15), maintenanceType: 'Routine', description: '250-hour service — oil change, filter replacement, track inspection.', cost: 38_000, performedBy: 'CAT Lanka', nextMaintenanceDate: daysFrom(45) },
      ],
      assignmentHistory: [
        { projectId: proj3._id, assignedDate: daysAgo(290), returnedDate: daysAgo(100), operatorId: MICHAEL, hoursUsed: 820, fuelConsumed: 12_500 },
        { projectId: proj2._id, assignedDate: daysAgo(85), operatorId: MICHAEL, hoursUsed: 340, fuelConsumed: 5_200 },
      ],
    },
    {
      equipmentName: 'Schwing Concrete Pump SP 3800',
      equipmentType: 'Other',
      serialNumber: 'SCH-SP38-2020-00234',
      assetId: 'EQ-PUMP-001',
      manufacturer: 'Schwing',
      equipmentModel: 'SP 3800',
      yearOfManufacture: 2020,
      currentProjectId: proj1._id,
      status: 'In Use',
      lastMaintenanceDate: daysAgo(45),
      nextScheduledMaintenance: daysFrom(15),
      purchasePrice: 18_500_000,
      currentValue: 15_200_000,
      depreciationRate: 12,
      rentalRatePerDay: 35_000,
      currentLocation: 'Verdant Tower — Ground floor pump station',
      maintenanceHistory: [
        { maintenanceDate: daysAgo(45), maintenanceType: 'Repair', description: 'Replaced worn piston seals and delivery cylinder. Pressure tested to 85 bar.', cost: 95_000, performedBy: 'Schwing Lanka', nextMaintenanceDate: daysFrom(15) },
      ],
      assignmentHistory: [
        { projectId: proj1._id, assignedDate: daysAgo(150), operatorId: EMILY, hoursUsed: 680 },
      ],
    },
    {
      equipmentName: 'Komatsu Bulldozer D65EX',
      equipmentType: 'Bulldozer',
      serialNumber: 'KOM-D65-2018-05521',
      assetId: 'EQ-BULL-001',
      manufacturer: 'Komatsu',
      equipmentModel: 'D65EX-18',
      yearOfManufacture: 2018,
      status: 'Available',
      lastMaintenanceDate: daysAgo(10),
      nextScheduledMaintenance: daysFrom(80),
      purchasePrice: 22_000_000,
      currentValue: 14_000_000,
      depreciationRate: 10,
      rentalRatePerDay: 48_000,
      currentLocation: 'Equipment yard — Colombo depot',
      maintenanceHistory: [
        { maintenanceDate: daysAgo(10), maintenanceType: 'Overhaul', description: 'Major overhaul — engine rebuild, track replacement, hydraulic system service.', cost: 380_000, performedBy: 'Komatsu Lanka', nextMaintenanceDate: daysFrom(80) },
      ],
      assignmentHistory: [
        { projectId: proj3._id, assignedDate: daysAgo(295), returnedDate: daysAgo(20), operatorId: MICHAEL, hoursUsed: 1_450, fuelConsumed: 28_000 },
      ],
      notes: 'Recently overhauled. Available for next project assignment.',
    },
    {
      equipmentName: 'Concrete Mixer Truck — Unit 3',
      equipmentType: 'Mixer',
      serialNumber: 'MIX-2022-00789',
      assetId: 'EQ-MIX-003',
      manufacturer: 'Zoomlion',
      equipmentModel: 'HJC5310GJBB',
      yearOfManufacture: 2022,
      currentProjectId: proj2._id,
      status: 'In Use',
      lastMaintenanceDate: daysAgo(20),
      nextScheduledMaintenance: daysFrom(40),
      purchasePrice: 14_500_000,
      currentValue: 13_000_000,
      depreciationRate: 8,
      rentalRatePerDay: 28_000,
      currentLocation: 'Riverside Eco-Residences — Batching plant',
      maintenanceHistory: [
        { maintenanceDate: daysAgo(20), maintenanceType: 'Routine', description: 'Drum inspection, water system flush, hydraulic oil change.', cost: 22_000, performedBy: 'In-house', nextMaintenanceDate: daysFrom(40) },
      ],
      assignmentHistory: [
        { projectId: proj2._id, assignedDate: daysAgo(80), operatorId: MICHAEL, hoursUsed: 280 },
      ],
    },
  ]);

  console.log('\n✅  Seed complete! Summary:');
  console.log(`   • 3 Suppliers`);
  console.log(`   • 3 Projects (Verdant Tower, Riverside Eco-Residences, Harbour View)`);
  console.log(`   • 15 Milestones`);
  console.log(`   • 14 Sustainability Metrics`);
  console.log(`   • 10 Documents`);
  console.log(`   • 6 Compliance Checklists`);
  console.log(`   • 7 Safety Inspections`);
  console.log(`   • 6 Materials`);
  console.log(`   • 5 Equipment`);

  await mongoose.disconnect();
  console.log('👋  Disconnected from MongoDB');
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});
