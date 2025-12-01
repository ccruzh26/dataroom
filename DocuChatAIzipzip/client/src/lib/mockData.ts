import { Document, ChatMessage } from './types';

// todo: remove mock functionality
export const mockDocuments: Document[] = [
  {
    id: 'folder-1',
    title: 'Financial Documents',
    path: '/financial',
    order: 1,
    summary: '',
    content: '',
    sections: [],
    isFolder: true,
    children: [
      {
        id: 'doc-1',
        title: 'Financial Plan 2024',
        path: '/financial/plan-2024',
        order: 1,
        summary: 'Comprehensive financial projections including revenue forecasts, expense budgets, and capital requirements for fiscal year 2024.',
        content: `# Financial Plan 2024

## Executive Summary
This document outlines our financial strategy and projections for fiscal year 2024, including detailed revenue forecasts, expense management, and capital allocation plans.

## Revenue Projections
Our projected revenue for 2024 is $12.5M, representing a 45% year-over-year growth. This growth is primarily driven by:
- Enterprise customer expansion
- New product launches
- Geographic expansion into EMEA

## Expense Budget
Total operating expenses are projected at $8.2M:
- R&D: $3.5M (43%)
- Sales & Marketing: $2.8M (34%)
- G&A: $1.9M (23%)

## Capital Requirements
We anticipate requiring $5M in additional capital to fund growth initiatives, primarily for:
- Team expansion
- Infrastructure scaling
- Market development`,
        sections: [
          { id: 'sec-1-1', title: 'Executive Summary', content: 'This document outlines our financial strategy...', order: 1 },
          { id: 'sec-1-2', title: 'Revenue Projections', content: 'Our projected revenue for 2024 is $12.5M...', order: 2 },
          { id: 'sec-1-3', title: 'Expense Budget', content: 'Total operating expenses are projected at $8.2M...', order: 3 },
          { id: 'sec-1-4', title: 'Capital Requirements', content: 'We anticipate requiring $5M in additional capital...', order: 4 },
        ],
        parentId: 'folder-1',
      },
      {
        id: 'doc-2',
        title: 'Revenue Model',
        path: '/financial/revenue-model',
        order: 2,
        summary: 'Detailed breakdown of revenue streams, pricing tiers, and unit economics across all product lines.',
        content: `# Revenue Model

## Pricing Structure
Our SaaS pricing follows a tiered model:
- Starter: $49/month
- Professional: $149/month
- Enterprise: Custom pricing

## Unit Economics
- CAC: $1,200
- LTV: $8,400
- LTV/CAC Ratio: 7:1

## Revenue Streams
1. Subscription Revenue (85%)
2. Professional Services (10%)
3. Marketplace Commissions (5%)`,
        sections: [
          { id: 'sec-2-1', title: 'Pricing Structure', content: 'Our SaaS pricing follows a tiered model...', order: 1 },
          { id: 'sec-2-2', title: 'Unit Economics', content: 'CAC: $1,200, LTV: $8,400...', order: 2 },
          { id: 'sec-2-3', title: 'Revenue Streams', content: 'Subscription Revenue (85%)...', order: 3 },
        ],
        parentId: 'folder-1',
      },
    ],
  },
  {
    id: 'folder-2',
    title: 'Legal Documents',
    path: '/legal',
    order: 2,
    summary: '',
    content: '',
    sections: [],
    isFolder: true,
    children: [
      {
        id: 'doc-3',
        title: 'Terms of Service',
        path: '/legal/terms',
        order: 1,
        summary: 'Standard terms and conditions governing the use of our platform and services.',
        content: `# Terms of Service

## Agreement to Terms
By accessing our platform, you agree to be bound by these Terms of Service and all applicable laws and regulations.

## Use License
Permission is granted to temporarily access the materials on our platform for personal, non-commercial transitory viewing only.

## Limitations
In no event shall we be liable for any damages arising out of the use or inability to use our platform.`,
        sections: [
          { id: 'sec-3-1', title: 'Agreement to Terms', content: 'By accessing our platform...', order: 1 },
          { id: 'sec-3-2', title: 'Use License', content: 'Permission is granted to temporarily access...', order: 2 },
          { id: 'sec-3-3', title: 'Limitations', content: 'In no event shall we be liable...', order: 3 },
        ],
        parentId: 'folder-2',
      },
      {
        id: 'doc-4',
        title: 'Privacy Policy',
        path: '/legal/privacy',
        order: 2,
        summary: 'Comprehensive privacy policy detailing data collection, usage, and protection practices.',
        content: `# Privacy Policy

## Information We Collect
We collect information you provide directly, including name, email, and usage data.

## How We Use Information
Your information is used to provide and improve our services, communicate with you, and ensure platform security.

## Data Protection
We implement industry-standard security measures to protect your personal information.`,
        sections: [
          { id: 'sec-4-1', title: 'Information We Collect', content: 'We collect information you provide directly...', order: 1 },
          { id: 'sec-4-2', title: 'How We Use Information', content: 'Your information is used to provide...', order: 2 },
          { id: 'sec-4-3', title: 'Data Protection', content: 'We implement industry-standard security measures...', order: 3 },
        ],
        parentId: 'folder-2',
      },
    ],
  },
  {
    id: 'folder-3',
    title: 'Product Documentation',
    path: '/product',
    order: 3,
    summary: '',
    content: '',
    sections: [],
    isFolder: true,
    children: [
      {
        id: 'doc-5',
        title: 'Product Roadmap',
        path: '/product/roadmap',
        order: 1,
        summary: 'Strategic product roadmap outlining key features, milestones, and development timeline for the next 18 months.',
        content: `# Product Roadmap 2024-2025

## Q1 2024: Foundation
- Enhanced security features
- API v2 launch
- Mobile app beta

## Q2 2024: Growth
- Enterprise SSO integration
- Advanced analytics dashboard
- Workflow automation

## Q3 2024: Scale
- Multi-region deployment
- Custom integrations marketplace
- AI-powered insights

## Q4 2024: Innovation
- Next-gen collaboration tools
- Predictive analytics
- Platform API expansion`,
        sections: [
          { id: 'sec-5-1', title: 'Q1 2024: Foundation', content: 'Enhanced security features, API v2 launch...', order: 1 },
          { id: 'sec-5-2', title: 'Q2 2024: Growth', content: 'Enterprise SSO integration, Advanced analytics...', order: 2 },
          { id: 'sec-5-3', title: 'Q3 2024: Scale', content: 'Multi-region deployment, Custom integrations...', order: 3 },
          { id: 'sec-5-4', title: 'Q4 2024: Innovation', content: 'Next-gen collaboration tools, Predictive analytics...', order: 4 },
        ],
        parentId: 'folder-3',
      },
    ],
  },
  {
    id: 'doc-6',
    title: 'Company Overview',
    path: '/overview',
    order: 4,
    summary: 'Executive summary of company history, mission, team, and market position.',
    content: `# Company Overview

## Mission
To democratize access to enterprise-grade software through intuitive, AI-powered solutions.

## History
Founded in 2020, we have grown from a 3-person team to 45 employees across 5 countries.

## Market Position
We are the leading provider in our segment with 500+ enterprise customers and 98% customer retention.

## Leadership Team
- CEO: Strategic vision and growth
- CTO: Technical innovation
- CFO: Financial operations
- VP Sales: Revenue growth`,
    sections: [
      { id: 'sec-6-1', title: 'Mission', content: 'To democratize access to enterprise-grade software...', order: 1 },
      { id: 'sec-6-2', title: 'History', content: 'Founded in 2020, we have grown...', order: 2 },
      { id: 'sec-6-3', title: 'Market Position', content: 'We are the leading provider...', order: 3 },
      { id: 'sec-6-4', title: 'Leadership Team', content: 'CEO: Strategic vision and growth...', order: 4 },
    ],
  },
];

// todo: remove mock functionality
export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'What are the projected revenue figures for 2024?',
    timestamp: new Date(Date.now() - 120000),
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'Based on the Financial Plan 2024, the projected revenue for fiscal year 2024 is $12.5M, which represents a 45% year-over-year growth. This growth is primarily driven by enterprise customer expansion, new product launches, and geographic expansion into EMEA.',
    citations: [
      { index: 1, docId: 'doc-1', sectionId: 'sec-1-2', docTitle: 'Financial Plan 2024', sectionTitle: 'Revenue Projections' },
    ],
    timestamp: new Date(Date.now() - 110000),
  },
  {
    id: 'msg-3',
    role: 'user',
    content: 'What are the main expense categories and how is the budget allocated?',
    timestamp: new Date(Date.now() - 60000),
  },
  {
    id: 'msg-4',
    role: 'assistant',
    content: 'According to the expense budget outlined in the Financial Plan, total operating expenses for 2024 are projected at $8.2M. The allocation breaks down as follows:\n\n- R&D: $3.5M (43%)\n- Sales & Marketing: $2.8M (34%)\n- G&A: $1.9M (23%)\n\nThe company also anticipates requiring $5M in additional capital for growth initiatives, primarily for team expansion, infrastructure scaling, and market development.',
    citations: [
      { index: 1, docId: 'doc-1', sectionId: 'sec-1-3', docTitle: 'Financial Plan 2024', sectionTitle: 'Expense Budget' },
      { index: 2, docId: 'doc-1', sectionId: 'sec-1-4', docTitle: 'Financial Plan 2024', sectionTitle: 'Capital Requirements' },
    ],
    timestamp: new Date(Date.now() - 50000),
  },
];

export function flattenDocuments(docs: Document[]): Document[] {
  const result: Document[] = [];
  for (const doc of docs) {
    if (doc.isFolder && doc.children) {
      result.push(...flattenDocuments(doc.children));
    } else if (!doc.isFolder) {
      result.push(doc);
    }
  }
  return result;
}

export function findDocumentById(docs: Document[], id: string): Document | undefined {
  for (const doc of docs) {
    if (doc.id === id) return doc;
    if (doc.children) {
      const found = findDocumentById(doc.children, id);
      if (found) return found;
    }
  }
  return undefined;
}
