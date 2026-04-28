import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Section, Link, Img, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "VellumPet"
const BASE_URL = "https://vellumpet.com"
const DEFAULT_LOGO_URL = `${BASE_URL}/logo.png`

interface PaymentConfirmationProps {
  petName?: string
  slug?: string
  tributeId?: string
  manageToken?: string
  logoUrl?: string
  state?: 'processing' | 'ready'
}

const PaymentConfirmationEmail = ({
  petName,
  slug,
  manageToken,
  logoUrl,
  state,
}: PaymentConfirmationProps) => {
  const name = petName || 'your pet'
  const isReady = state === 'ready'
  const publicUrl = slug ? `${BASE_URL}/memorial/${slug}` : BASE_URL
  const manageUrl = slug && manageToken
    ? `${BASE_URL}/memorial/manage/${slug}?token=${manageToken}`
    : null
  const logo = logoUrl || DEFAULT_LOGO_URL

  const headline = isReady
    ? `Your memorial for ${name} is ready 💛`
    : `We're creating ${name}'s memorial 🐾`
  const subtext = isReady
    ? `A quiet little place to hold ${name}'s story, whenever you need to return to it.`
    : `Thank you. We're carefully shaping ${name}'s tribute now — you'll receive another email the moment it's ready.`
  const previewText = isReady
    ? `${name}'s memorial is ready 💛`
    : `We're creating ${name}'s memorial`

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={card}>
          <Section style={logoSection}>
            <Img src={logo} alt="VellumPet" width="90" style={logoStyle} />
          </Section>

          {isReady && (
            <Text style={memoryLine}>In loving memory of {name} 🐾</Text>
          )}

          <Heading style={h1}>{headline}</Heading>

          <Text style={text}>{subtext}</Text>

          {isReady && (
            <Section style={buttonSection}>
              <Button style={primaryButton} href={publicUrl}>
                View Memorial
              </Button>
            </Section>
          )}

          {isReady && <Hr style={divider} />}

          {isReady && (
            <Text style={supportingText}>
              You can return anytime to remember, update, or share.
            </Text>
          )}

          {manageUrl && (
            <Text style={manageLine}>
              <Link href={manageUrl} style={manageLink}>Manage your memorial</Link>
            </Text>
          )}

          <Text style={footer}>
            With care,<br />
            The {SITE_NAME} Team
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: PaymentConfirmationEmail,
  subject: (data: Record<string, any>) => {
    const name = data.petName || 'your pet'
    return data.state === 'ready'
      ? `Your memorial for ${name} is ready 💛`
      : `We're creating ${name}'s memorial 🐾`
  },
  displayName: 'Memorial status',
  previewData: { petName: 'Bella', slug: 'bella-golden-retriever', manageToken: 'test-token-uuid', state: 'ready' },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#f6f3ef',
  fontFamily: "Arial, Helvetica, sans-serif",
  margin: '0',
  padding: '40px 20px',
}
const card = {
  backgroundColor: '#ffffff',
  maxWidth: '520px',
  margin: '0 auto',
  padding: '48px 40px',
  borderRadius: '14px',
  boxShadow: '0 4px 20px rgba(60, 40, 25, 0.06)',
}
const logoSection = { textAlign: 'center' as const, margin: '0 0 20px' }
const logoStyle = {
  display: 'block',
  margin: '0 auto',
  maxWidth: '90px',
  height: 'auto',
  opacity: 0.9,
}
const memoryLine = {
  fontSize: '13px',
  color: '#8a7866',
  textAlign: 'center' as const,
  letterSpacing: '0.5px',
  textTransform: 'uppercase' as const,
  margin: '0 0 12px',
}
const h1 = {
  fontSize: '22px',
  fontWeight: '700' as const,
  color: '#3B2E22',
  margin: '0 0 16px',
  lineHeight: '1.35',
  textAlign: 'center' as const,
}
const text = {
  fontSize: '15px',
  color: '#55575d',
  lineHeight: '1.6',
  margin: '0 0 28px',
  textAlign: 'center' as const,
}
const buttonSection = { textAlign: 'center' as const, margin: '0 0 28px' }
const primaryButton = {
  backgroundColor: '#6f4e37',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  padding: '14px 32px',
  borderRadius: '999px',
  textDecoration: 'none',
  display: 'inline-block',
}
const divider = {
  border: 'none',
  borderTop: '1px solid #ece6dd',
  margin: '0 0 20px',
}
const supportingText = {
  fontSize: '14px',
  color: '#8a7866',
  textAlign: 'center' as const,
  lineHeight: '1.5',
  margin: '0 0 20px',
}
const manageLine = { fontSize: '13px', color: '#999999', textAlign: 'center' as const, margin: '0 0 32px' }
const manageLink = { color: '#6f4e37', textDecoration: 'underline' }
const footer = {
  fontSize: '13px',
  color: '#999999',
  textAlign: 'center' as const,
  margin: '0',
  lineHeight: '1.5',
}
