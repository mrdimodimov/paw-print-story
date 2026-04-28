import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "VellumPet"
const BASE_URL = "https://vellumpet.com"

interface ReadyProps {
  petName?: string
  slug?: string
  manageToken?: string
}

const ReadyEmail = ({ petName, slug, manageToken }: ReadyProps) => {
  const name = petName || 'your pet'
  const publicUrl = slug ? `${BASE_URL}/memorial/${slug}` : BASE_URL
  const manageUrl = slug && manageToken
    ? `${BASE_URL}/memorial/manage/${slug}?token=${manageToken}`
    : null

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{name}'s memorial is ready to view and share ❤️</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={logoText}>🐾 {SITE_NAME}</Text>

          <Heading style={h1}>{name}'s memorial is ready ❤️</Heading>

          <Text style={text}>
            We've gently woven {name}'s story into a memorial you can keep,
            revisit, and share with everyone who loved them.
          </Text>

          <Section style={buttonSection}>
            <Button style={primaryButton} href={publicUrl}>
              View Your Memorial
            </Button>
          </Section>

          {manageUrl && (
            <Section style={buttonSection}>
              <Button style={secondaryButton} href={manageUrl}>
                Manage Your Memorial
              </Button>
            </Section>
          )}

          <Hr style={divider} />

          <Text style={linkLabel}>Public memorial link:</Text>
          <Text style={linkText}>{publicUrl}</Text>

          {manageUrl && (
            <>
              <Text style={linkLabel}>Your private management link (save this!):</Text>
              <Text style={linkText}>{manageUrl}</Text>
            </>
          )}

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
  component: ReadyEmail,
  subject: (data: Record<string, any>) => `Your memorial for ${data.petName || 'your pet'} is ready ❤️`,
  displayName: 'Memorial ready',
  previewData: { petName: 'Bella', slug: 'bella-golden-retriever', manageToken: 'test-token-uuid' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'Source Sans 3', Arial, sans-serif" }
const container = { padding: '40px 25px', maxWidth: '560px', margin: '0 auto' }
const logoText = { fontSize: '18px', fontWeight: '600' as const, color: '#5A4634', margin: '0 0 30px', textAlign: 'center' as const }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: '#3B2E22', margin: '0 0 20px', fontFamily: "'Playfair Display', Georgia, serif", lineHeight: '1.3' }
const text = { fontSize: '15px', color: '#55575d', lineHeight: '1.6', margin: '0 0 20px' }
const buttonSection = { textAlign: 'center' as const, margin: '16px 0' }
const primaryButton = { backgroundColor: '#5A4634', color: '#F3EEE7', fontSize: '16px', fontWeight: '600' as const, padding: '14px 32px', borderRadius: '999px', textDecoration: 'none' }
const secondaryButton = { backgroundColor: 'transparent', color: '#5A4634', fontSize: '14px', fontWeight: '600' as const, padding: '10px 24px', borderRadius: '999px', textDecoration: 'none', border: '2px solid #5A4634' }
const divider = { borderTop: '1px solid #E8E0D8', margin: '28px 0' }
const linkLabel = { fontSize: '13px', color: '#999999', margin: '0 0 4px' }
const linkText = { fontSize: '14px', color: '#5A4634', margin: '0 0 20px', wordBreak: 'break-all' as const }
const footer = { fontSize: '13px', color: '#999999', margin: '20px 0 0', whiteSpace: 'pre-line' as const }
