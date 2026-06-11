import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 48,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1a1a2e',
  },
  header: {
    marginBottom: 24,
    borderBottom: '2pt solid #6c63ff',
    paddingBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  pill: {
    backgroundColor: '#ede9ff',
    color: '#6c63ff',
    fontSize: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontFamily: 'Helvetica-Bold',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#0a0a1f',
    marginBottom: 12,
  },
  metaGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  metaItem: {
    flex: 1,
    backgroundColor: '#f8f7ff',
    borderRadius: 4,
    padding: 8,
    borderLeft: '3pt solid #6c63ff',
  },
  metaLabel: {
    fontSize: 7,
    color: '#6b6b80',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#1a1a2e',
  },
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6c63ff',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    borderBottom: '1pt solid #ede9ff',
    paddingBottom: 4,
  },
  body: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.6,
  },
  step: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#6c63ff',
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    lineHeight: 2.2,
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
    backgroundColor: '#fafaf8',
    borderRadius: 4,
    padding: 8,
    borderLeft: '2pt solid #e5e3ff',
  },
  stepTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    marginBottom: 3,
    color: '#1a1a2e',
  },
  stepResponsible: {
    fontSize: 8,
    color: '#6b6b80',
    marginTop: 4,
  },
  warning: {
    backgroundColor: '#fffbeb',
    borderLeft: '3pt solid #f59e0b',
    padding: 8,
    marginBottom: 6,
    borderRadius: 4,
    color: '#92400e',
    fontSize: 9,
  },
  note: {
    color: '#374151',
    fontSize: 9,
    marginBottom: 4,
    paddingLeft: 12,
  },
  success: {
    backgroundColor: '#f0fdf4',
    borderLeft: '3pt solid #22c55e',
    padding: 10,
    borderRadius: 4,
    color: '#166534',
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: '1pt solid #e5e7eb',
    paddingTop: 8,
  },
});

export default function SopPDF({ sop }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.pill}>{sop.sopId}</Text>
            <Text style={styles.pill}>v{sop.version}</Text>
          </View>
          <Text style={styles.title}>{sop.title}</Text>
          <View style={styles.metaGrid}>
            {[
              ['Department', sop.department],
              ['Owner', sop.owner],
              ['Frequency', sop.frequency],
              ['Duration', sop.duration],
            ].map(([label, value]) => (
              <View key={label} style={styles.metaItem}>
                <Text style={styles.metaLabel}>{label}</Text>
                <Text style={styles.metaValue}>{value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Purpose */}
        <Text style={styles.sectionTitle}>Purpose</Text>
        <Text style={styles.body}>{sop.purpose}</Text>

        {/* Scope */}
        <Text style={styles.sectionTitle}>Scope</Text>
        <Text style={styles.body}>{sop.scope}</Text>

        {/* Steps */}
        <Text style={styles.sectionTitle}>Procedure Steps</Text>
        {sop.steps?.map((step, i) => (
          <View key={i} style={styles.step}>
            <Text style={styles.stepNum}>{i + 1}</Text>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.body}>{step.description}</Text>
              <Text style={styles.stepResponsible}>👤 {step.responsible}</Text>
            </View>
          </View>
        ))}

        {/* Warnings */}
        {sop.warnings?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Warnings</Text>
            {sop.warnings.map((w, i) => (
              <Text key={i} style={styles.warning}>⚠ {w}</Text>
            ))}
          </>
        )}

        {/* Notes */}
        {sop.notes?.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Notes</Text>
            {sop.notes.map((n, i) => (
              <Text key={i} style={styles.note}>• {n}</Text>
            ))}
          </>
        )}

        {/* Success Criteria */}
        <Text style={styles.sectionTitle}>Success Criteria</Text>
        <View style={styles.success}>
          <Text>✓ {sop.successCriteria}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>Generated by Workscribe · {sop.sopId}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
