import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { submitCustomerSignup } from '../lib/customer-signup'
import { getSiteUrl } from '../lib/site-url'

const Footer = (props) => {
  const [instagramPanelOpen, setInstagramPanelOpen] = useState(false)
  const [instagramStatus, setInstagramStatus] = useState('Ready to share')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState({
    type: '',
    message: '',
  })
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false)

  const shareUrl = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }

    return getSiteUrl()
  }, [])

  const shareTitle = 'Cocoa Mocha'
  const shareText =
    'Take a look at Cocoa Mocha. Fun coffee, playful vibes, and a shop worth sharing.'

  const openShareWindow = (url) => {
    if (typeof window === 'undefined') {
      return
    }

    window.open(url, '_blank', 'noopener,noreferrer,width=720,height=720')
  }

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`
    openShareWindow(url)
  }

  const handleXShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      shareText
    )}&url=${encodeURIComponent(shareUrl)}`
    openShareWindow(url)
  }

  const handleInstagramShare = async () => {
    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
        return
      } catch (error) {
        // Fall through to the custom Instagram panel if native share is canceled or unavailable.
      }
    }

    setInstagramStatus('Copy the link and share it in Instagram')
    setInstagramPanelOpen(true)
  }

  const handleCopyShareLink = async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      setInstagramStatus('Copy not available on this browser')
      return
    }

    try {
      await navigator.clipboard.writeText(shareUrl)
      setInstagramStatus('Link copied. Paste it into your Instagram story or bio.')
    } catch (error) {
      setInstagramStatus('Could not copy the link just now')
    }
  }

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault()

    if (!newsletterEmail.trim()) {
      setNewsletterStatus({
        type: 'error',
        message: 'Please enter your email first.',
      })
      return
    }

    setIsNewsletterSubmitting(true)
    setNewsletterStatus({
      type: '',
      message: '',
    })

    try {
      const result = await submitCustomerSignup(
        newsletterEmail,
        'footer-newsletter'
      )

      setNewsletterEmail('')
      setNewsletterStatus({
        type: 'success',
        message: result?.alreadyExists
          ? 'This email is already in our coffee list.'
          : 'You are in. Your email is now saved in Medusa.',
      })
    } catch (error) {
      setNewsletterStatus({
        type: 'error',
        message:
          error?.message || 'We could not save your email right now.',
      })
    } finally {
      setIsNewsletterSubmitting(false)
    }
  }

  return (
    <>
      <div className="footer-container1">
        <footer className="footer-root">
          <div className="footer-container">
            <div className="footer-top-grid">
              <div className="footer-brand-column">
                <div className="footer-logo-wrapper">
                  <div className="footer-logo-icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                    >
                      <g
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      >
                        <path d="M3 14c.83.642 2.077 1.017 3.5 1c1.423.017 2.67-.358 3.5-1s2.077-1.017 3.5-1c1.423-.017 2.67.358 3.5 1M8 3a2.4 2.4 0 0 0-1 2a2.4 2.4 0 0 0 1 2m4-4a2.4 2.4 0 0 0-1 2a2.4 2.4 0 0 0 1 2"></path>
                        <path d="M3 10h14v5a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6z"></path>
                        <path d="M16.746 16.726a3 3 0 1 0 .252-5.555"></path>
                      </g>
                    </svg>
                  </div>
                  <span className="footer-brand-name">Cocoa Mocha</span>
                </div>
                <p className="footer-description section-content">
                  Brewing joy in every cup. Experience the perfect blend of fun,
                  flavor, and community at Cocoa Mocha. Your daily dose of
                  happiness starts here.
                </p>
                <div className="footer-social-links">
                  <button
                    type="button"
                    aria-label="Share on Facebook"
                    className="footer-social-item"
                    onClick={handleFacebookShare}
                  >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M7 10v4h3v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3h-3a5 5 0 0 0-5 5v2z"
                        ></path>
                      </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Share on Instagram"
                    className="footer-social-item"
                    onClick={handleInstagramShare}
                  >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        >
                          <path d="M4 8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"></path>
                          <path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0m7.5-4.5v.01"></path>
                        </g>
                      </svg>
                  </button>
                  <button
                    type="button"
                    aria-label="Share on X"
                    className="footer-social-item"
                    onClick={handleXShare}
                  >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M22 4.01c-1 .49-1.98.689-3 .99c-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4c0 0-4.182 7.433 4 11c-1.872 1.247-3.739 2.088-6 2c3.308 1.803 6.913 2.423 10.034 1.517c3.58-1.04 6.522-3.723 7.651-7.742a13.8 13.8 0 0 0 .497-3.753c0-.249 1.51-2.772 1.818-4.013z"
                        ></path>
                      </svg>
                  </button>
                </div>
                {instagramPanelOpen ? (
                  <div className="footer-share-panel">
                    <div className="footer-share-panel-header">
                      <div>
                        <span className="footer-share-panel-kicker">
                          Instagram Share
                        </span>
                        <h3 className="footer-share-panel-title">
                          Share Cocoa Mocha
                        </h3>
                      </div>
                      <button
                        type="button"
                        className="footer-share-panel-close"
                        aria-label="Close Instagram share panel"
                        onClick={() => setInstagramPanelOpen(false)}
                      >
                        ×
                      </button>
                    </div>
                    <p className="footer-share-panel-copy">
                      Instagram does not offer a direct website share window, so
                      this gives your customer the fastest handoff.
                    </p>
                    <div className="footer-share-link-box">
                      <span>{shareUrl}</span>
                    </div>
                    <div className="footer-share-panel-actions">
                      <button
                        type="button"
                        className="footer-share-copy-btn"
                        onClick={handleCopyShareLink}
                      >
                        Copy Link
                      </button>
                      <a
                        href="https://www.instagram.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="footer-share-open-btn"
                      >
                        Open Instagram
                      </a>
                    </div>
                    <span className="footer-share-status">{instagramStatus}</span>
                  </div>
                ) : null}
              </div>
              <div className="footer-newsletter-column">
                <h2 className="footer-column-title section-subtitle">
                  Stay Caffeineated
                </h2>
                <p className="footer-newsletter-text section-content">
                  Join our club for exclusive deals and the freshest coffee news
                  delivered to your inbox.
                </p>
                <form
                  className="footer-newsletter-form"
                  onSubmit={handleNewsletterSubmit}
                >
                  <div className="footer-input-group">
                    <input
                      type="email"
                      placeholder="Your email address"
                      required
                      className="footer-email-input"
                      value={newsletterEmail}
                      onChange={(event) => setNewsletterEmail(event.target.value)}
                      disabled={isNewsletterSubmitting}
                    />
                    <button
                      type="submit"
                      aria-label="Subscribe"
                      className="footer-submit-btn"
                      disabled={isNewsletterSubmitting}
                    >
                      {isNewsletterSubmitting ? (
                        <span>...</span>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 12h14m-6 6l6-6m-6-6l6 6"
                          ></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  {newsletterStatus.message ? (
                    <p
                      className={`footer-newsletter-status footer-newsletter-status--${newsletterStatus.type || 'info'}`}
                    >
                      {newsletterStatus.message}
                    </p>
                  ) : null}
                </form>
              </div>
            </div>
            <div className="footer-bottom">
              <div className="footer-legal">
                <span className="footer-copyright">
                  © 2026 Cocoa Mocha. All rights reserved.
                </span>
                <div className="footer-legal-links">
                  <a href="#">
                    <div className="footer-legal-link">
                      <span>Privacy Policy</span>
                    </div>
                  </a>
                  <a href="#">
                    <div className="footer-legal-link">
                      <span>Terms of Service</span>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
      <style jsx>
        {`
          .footer-container1 {
            display: contents;
          }
          .footer-social-item {
            border: 0;
            cursor: pointer;
          }
          .footer-share-panel {
            margin-top: 1.25rem;
            padding: 1rem;
            border-radius: 22px;
            border: 1px solid rgba(118, 68, 31, 0.14);
            background:
              radial-gradient(circle at top right, rgba(255, 203, 153, 0.24), transparent 34%),
              rgba(255, 248, 239, 0.96);
            box-shadow: 0 18px 40px rgba(71, 40, 20, 0.12);
          }
          .footer-share-panel-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
          }
          .footer-share-panel-kicker {
            color: #a55a2b;
            display: block;
            font-size: 0.72rem;
            font-weight: 800;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            margin-bottom: 0.25rem;
          }
          .footer-share-panel-title {
            margin: 0;
            color: var(--color-on-surface);
            font-size: 1.1rem;
          }
          .footer-share-panel-close {
            width: 34px;
            height: 34px;
            border: 0;
            cursor: pointer;
            border-radius: 999px;
            background: rgba(255, 255, 255, 0.7);
            color: var(--color-on-surface);
            font-size: 1.4rem;
            line-height: 1;
          }
          .footer-share-panel-copy {
            margin-bottom: 0.85rem;
            color: var(--color-on-surface-secondary);
          }
          .footer-share-link-box {
            padding: 0.85rem 1rem;
            overflow: hidden;
            border-radius: 16px;
            margin-bottom: 0.85rem;
            background: rgba(255, 255, 255, 0.8);
            border: 1px dashed rgba(118, 68, 31, 0.18);
          }
          .footer-share-link-box span {
            color: var(--color-on-surface);
            word-break: break-all;
          }
          .footer-share-panel-actions {
            gap: 0.75rem;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }
          .footer-share-copy-btn,
          .footer-share-open-btn {
            border: 0;
            display: inline-flex;
            min-height: 48px;
            cursor: pointer;
            align-items: center;
            border-radius: 999px;
            justify-content: center;
            text-decoration: none;
            font-weight: 800;
          }
          .footer-share-copy-btn {
            background: rgba(118, 68, 31, 0.08);
            color: #8e4c24;
          }
          .footer-share-open-btn {
            background: linear-gradient(135deg, #ef7c47 0%, #f46fb1 100%);
            color: white;
          }
          .footer-share-status {
            display: inline-block;
            margin-top: 0.85rem;
            color: #8e4c24;
            font-size: 0.92rem;
            font-weight: 700;
          }
          .footer-newsletter-status {
            margin-top: 0.75rem;
            font-size: 0.92rem;
            line-height: 1.5;
          }
          .footer-newsletter-status--success {
            color: #1f7a45;
          }
          .footer-newsletter-status--error {
            color: #b23a2a;
          }
          .footer-container2 {
            display: none;
          }
          .footer-container3 {
            display: contents;
          }
          @media (max-width: 479px) {
            .footer-share-panel-actions {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </>
  )
}

export default Footer

