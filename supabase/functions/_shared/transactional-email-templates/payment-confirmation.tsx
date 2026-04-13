import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "VellumPet"
const BASE_URL = "https://vellumpet.com"

interface PaymentConfirmationProps {
  petName?: string
  slug?: string
  tributeId?: string
  manageToken?: string
}

const PaymentConfirmationEmail = ({ petName, slug, tributeId, manageToken }: PaymentConfirmationProps) => {
  const name = petName || 'your pet'
  const memoralUrl = slug
    ? `${BASE_URL}/memorial/manage/${slug}${manageToken ? `?token=${manageToken}` : ''}`
    : `${BASE_URL}/tribute/${tributeId || ''}`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your memorial for {name} is ready 💛</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logoText}>🐾 {SITE_NAME}</Text>

          <Heading style={h1}>Your memorial for {name} is ready 💛</Heading>

          <Text style={text}>
            Thank you for creating a beautiful tribute. Your memorial page is now live and ready to share with friends and family.
          </Text>

          <Section style={buttonSection}>
            <Button style={primaryButton} href={memoralUrl}>
              View Memorial Page
            </Button>
          </Section>

          <Hr style={divider} />

          <Text style={subheading}>What you can do now:</Text>

          <Text style={text}>
            • <strong>Share it</strong> — Send the link to loved ones who knew {name}{'\n'}
            • <strong>Add photos</strong> — Upload more memories to your page{'\n'}
            • <strong>Edit your story</strong> — Update the tribute anytime
          </Text>

          <Text style={linkLabel}>Your memorial link:</Text>
          <Text style={linkText}>{memoralUrl}</Text>

          <Hr style={divider} />

          <Text style={footer}>
            With love,{'\n'}
            The {SITE_NAME} Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: PaymentConfirmationEmail,
  subject: (data: Record<string, any>) => `Your memorial for ${data.petName || 'your pet'} is ready 💛`,
  displayName: 'Payment confirmation',
  previewData: { petName: 'Bella', slug: 'bella-golden-retriever', tributeId: 'abc-123' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Source Sans 3', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const logoText = { fontSize: '18px', fontWeight: '600' as const, color: '#5A4634', margin: '0 0 30px', textAlign: 'center' as const }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#3B2E22', margin: '0 0 20px', fontFamily: "'Playfair Display', Georgia, serif", lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const subheading = { fontSize: '16px', fontWeight: '600' as const, color: '#3B2E22', margin: '0 0 12px' }
const buttonSection = { textAlign: 'center' as const, margin: '28px 0' }
const primaryButton = { backgroundColor: '#5A4634', color: '#F3EEE7', fontSize: '16px', fontWeight: '600' as const, padding: '14px 32px', borderRadius: '8px', textDecoration: 'none' }
const divider = { borderTop: '1px solid #E8E0D8', margin: '28px 0' }
const linkLabel = { fontSize: '13px', color: '#999999', margin: '0 0 4px' }
const linkText = { fontSize: '14px', color: '#5A4634', margin: '0 0 20px', wordBreak: 'break-all' as const }
const footer = { fontSize: '13px', color: '#999999', margin: '20px 0 0', whiteSpace: 'pre-line' as const }
