import React from 'react'
import Head from 'next/head'

import Navigation from '../components/navigation'
import Footer from '../components/footer'

const storyMoments = [
  {
    year: '2019',
    title: 'A Dream Built at Home',
    copy:
      'What began as a modest coffee ritual and a stack of handwritten ideas slowly became a vision for a brand that could feel joyful, generous, and unforgettable.',
  },
  {
    year: '2022',
    title: 'Purpose Became the Standard',
    copy:
      'The mission sharpened: serve coffee with beauty, honesty, and consistency, while building a business rooted in service, discipline, and genuine care for people.',
  },
  {
    year: 'Today',
    title: 'A New Kind of Neighborhood Favorite',
    copy:
      'Cocoa Mocha now stands for premium flavor, playful design, and a customer experience that feels uplifting from the first click to the last sip.',
  },
]

const values = [
  {
    title: 'Craft With Character',
    copy:
      'We believe drinks should feel memorable, balanced, and beautifully made, never rushed or generic.',
  },
  {
    title: 'Serve With Heart',
    copy:
      'Every product, promotion, and detail is designed to leave people feeling welcomed, appreciated, and excited to return.',
  },
  {
    title: 'Grow With Purpose',
    copy:
      'We build for longevity by combining smart business decisions with real customer delight so the brand keeps earning trust.',
  },
]

const AboutUs = () => {
  return (
    <>
      <div className="about-us-page">
        <Head>
          <title>About Us - Third Brave Mandrill</title>
          <meta property="og:title" content="About Us - Third Brave Mandrill" />
          <link
            rel="canonical"
            href="https://third-brave-mandrill-dq10nb.teleporthq.app/about-us"
          />
          <meta
            property="og:url"
            content="https://third-brave-mandrill-dq10nb.teleporthq.app/about-us"
          />
        </Head>
        <Navigation></Navigation>
        <section className="about-hero">
          <div className="about-shell">
            <div className="about-copy">
              <span className="about-kicker">About Us</span>
              <h1 className="hero-title">
                Built with heart, discipline, and a joyful love for coffee.
              </h1>
              <p className="hero-subtitle">
                Cocoa Mocha was created to feel different from ordinary coffee
                shops. We wanted something brighter, more elegant, more human,
                and more emotionally memorable. Every page, every drink, and
                every detail is meant to feel like a small celebration.
              </p>
              <div className="about-founder-card">
                <span className="about-founder-eyebrow">Founder Story</span>
                <h2 className="about-founder-title">
                  Evaristo Suarez Eichelmann
                </h2>
                <p className="about-founder-meta">
                  CEO, 23 years old, from Nuevo Leon, Mexico
                </p>
                <p className="about-founder-copy">
                  Evaristo is the kind of young founder people remember. He is
                  resilient, imaginative, deeply disciplined, and known for
                  turning pressure into clarity. His Catholic faith shaped the
                  spirit of the company: work with integrity, lead with
                  gratitude, stay humble, and treat excellence as a form of
                  service. What makes Cocoa Mocha feel alive is the same thing
                  that defines him: a rare mix of creativity, conviction, and
                  sincere care for people.
                </p>
              </div>
            </div>
            <div className="about-visual">
              <div className="about-portrait-card">
                <div className="about-portrait-glow"></div>
                <img
                  src="/evaristo-ceo.jpg"
                  alt="Evaristo Suarez Eichelmann, CEO of Cocoa Mocha"
                  className="about-portrait"
                />
                <div className="about-quote">
                  <p>
                    "We never wanted to build just another coffee brand. We
                    wanted to build a place people would trust, remember, and
                    feel proud to return to."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-story">
          <div className="about-shell about-shell--story">
            <div className="about-section-head">
              <span className="about-kicker">Our Journey</span>
              <h2 className="section-title">A humble beginning with a bigger calling.</h2>
              <p className="section-content">
                Cocoa Mocha was never imagined as something cold or corporate.
                It was shaped around the belief that excellence and warmth can
                live in the same place. That is why our brand feels polished,
                but never distant.
              </p>
            </div>
            <div className="about-timeline">
              {storyMoments.map((moment) => (
                <div key={moment.year} className="about-timeline-card">
                  <span className="about-timeline-year">{moment.year}</span>
                  <h3 className="about-timeline-title">{moment.title}</h3>
                  <p className="section-content">{moment.copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="about-values">
          <div className="about-shell about-shell--values">
            <div className="about-section-head">
              <span className="about-kicker">Why People Believe In Us</span>
              <h2 className="section-title">A brand designed to feel premium and personal.</h2>
            </div>
            <div className="about-values-grid">
              {values.map((value) => (
                <div key={value.title} className="about-value-card">
                  <h3 className="about-value-title">{value.title}</h3>
                  <p className="section-content">{value.copy}</p>
                </div>
              ))}
            </div>
            <div className="about-closing-card">
              <h3 className="about-closing-title">Why Cocoa Mocha keeps winning people over</h3>
              <p className="section-content">
                Customers do not just buy from Cocoa Mocha because the products
                look good. They buy because the brand feels intentional. It
                feels trustworthy. It feels alive. It carries a story of
                discipline, hope, and thoughtful ambition. That combination is
                what turns curiosity into loyalty.
              </p>
            </div>
          </div>
        </section>

        <Footer></Footer>
      </div>
      <style jsx>{`
        .about-us-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(255, 197, 137, 0.22), transparent 32%),
            radial-gradient(circle at bottom right, rgba(255, 110, 199, 0.12), transparent 28%),
            linear-gradient(180deg, #fffaf4 0%, #fff5ea 100%);
        }
        .about-shell {
          gap: 2rem;
          margin: 0 auto;
          padding: 0 1.5rem;
          max-width: 1180px;
        }
        .about-hero {
          padding: 7rem 0 4.5rem;
        }
        .about-hero .about-shell {
          display: grid;
          align-items: center;
          grid-template-columns: 1.1fr 0.9fr;
        }
        .about-kicker {
          color: #a35c29;
          display: inline-flex;
          font-size: 0.8rem;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .about-founder-card {
          margin-top: 2rem;
          padding: 1.5rem;
          border-radius: 28px;
          background:
            radial-gradient(circle at top right, rgba(255, 209, 168, 0.28), transparent 34%),
            rgba(255, 255, 255, 0.78);
          border: 1px solid rgba(118, 68, 31, 0.12);
          box-shadow: 0 24px 50px rgba(82, 44, 20, 0.1);
          backdrop-filter: blur(14px);
        }
        .about-founder-eyebrow {
          color: #16784c;
          display: block;
          font-size: 0.74rem;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          margin-bottom: 0.45rem;
        }
        .about-founder-title {
          margin: 0 0 0.4rem;
          color: var(--color-on-surface);
          font-size: 1.5rem;
          line-height: 1.2;
        }
        .about-founder-meta {
          margin-bottom: 1rem;
          color: #8f4f27;
          font-weight: 800;
        }
        .about-founder-copy {
          color: var(--color-on-surface-secondary);
          line-height: 1.7;
        }
        .about-visual {
          display: flex;
          justify-content: center;
        }
        .about-portrait-card {
          width: min(100%, 460px);
          padding: 1rem;
          position: relative;
          border-radius: 32px;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(118, 68, 31, 0.12);
          box-shadow: 0 30px 60px rgba(74, 42, 21, 0.12);
          backdrop-filter: blur(16px);
        }
        .about-portrait-glow {
          inset: 18px;
          z-index: 0;
          position: absolute;
          border-radius: 28px;
          background: linear-gradient(135deg, rgba(255, 182, 119, 0.28), rgba(255, 110, 199, 0.12));
          filter: blur(16px);
        }
        .about-portrait {
          z-index: 1;
          width: 100%;
          height: 560px;
          object-fit: cover;
          position: relative;
          border-radius: 24px;
        }
        .about-quote {
          left: 50%;
          bottom: 24px;
          z-index: 2;
          width: calc(100% - 48px);
          padding: 1rem 1.15rem;
          position: absolute;
          transform: translateX(-50%);
          border-radius: 20px;
          background: rgba(15, 23, 32, 0.72);
          color: white;
          box-shadow: 0 18px 36px rgba(15, 23, 32, 0.2);
        }
        .about-quote p {
          margin: 0;
          line-height: 1.6;
        }
        .about-story,
        .about-values {
          padding: 0 0 4.5rem;
        }
        .about-shell--story,
        .about-shell--values {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .about-section-head {
          max-width: 760px;
          text-align: center;
          margin-bottom: 2rem;
        }
        .about-timeline {
          gap: 1rem;
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        .about-timeline-card,
        .about-value-card,
        .about-closing-card {
          padding: 1.5rem;
          border-radius: 26px;
          background:
            radial-gradient(circle at top right, rgba(255, 205, 154, 0.24), transparent 34%),
            rgba(255, 255, 255, 0.82);
          border: 1px solid rgba(118, 68, 31, 0.12);
          box-shadow: 0 18px 38px rgba(82, 44, 20, 0.08);
        }
        .about-timeline-year {
          color: #16784c;
          display: inline-flex;
          margin-bottom: 0.75rem;
          font-size: 0.8rem;
          font-weight: 900;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .about-timeline-title,
        .about-value-title,
        .about-closing-title {
          margin: 0 0 0.7rem;
          color: var(--color-on-surface);
          font-size: 1.2rem;
          line-height: 1.25;
        }
        .about-values-grid {
          gap: 1rem;
          width: 100%;
          display: grid;
          margin-bottom: 1rem;
          grid-template-columns: repeat(3, 1fr);
        }
        .about-closing-card {
          width: 100%;
          max-width: 980px;
          text-align: center;
        }
        @media (max-width: 991px) {
          .about-hero .about-shell,
          .about-timeline,
          .about-values-grid {
            grid-template-columns: 1fr;
          }
          .about-copy,
          .about-visual {
            width: 100%;
          }
          .about-visual {
            order: -1;
          }
          .about-portrait-card {
            width: min(100%, 560px);
          }
        }
        @media (max-width: 767px) {
          .about-hero {
            padding: 6rem 0 3.5rem;
          }
          .about-shell {
            padding: 0 1rem;
          }
          .about-founder-card,
          .about-timeline-card,
          .about-value-card,
          .about-closing-card {
            padding: 1.2rem;
          }
          .about-portrait {
            height: 420px;
          }
        }
      `}</style>
    </>
  )
}

export default AboutUs
