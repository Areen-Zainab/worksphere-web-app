import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../css/home/landing.module.css';
import finalImage from '../../assets/decor/landing1.png';

const LandingPage = () => {
  const [menuActive, setMenuActive] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setMenuActive(!menuActive);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={styles.landingContainer}>
      <div className={styles.gradientOverlay}></div>
      
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.headerContent}>
          <Link to="/" className={styles.logo} aria-label="WorkSphere Home">
            <div className={styles.logoIcon}>WS</div>
            <span className={styles.logoText}>WorkSphere</span>
          </Link>
          
          <button
            className={`${styles.menuToggle} ${menuActive ? styles.open : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
          
          <nav className={`${styles.nav} ${menuActive ? styles.active : ''}`}>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/solutions">Solutions</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/resources">Resources</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
            <div className={styles.navButtons}>
              <Link to="/login" className={styles.btnLogin}>Log In</Link>
              <Link to="/signup" className={styles.btnSignup}>Try for Free</Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>
              <span className={styles.accentLight}>Collaborate.</span>
              <span className={styles.accentPrimary}>Organize.</span>
              <span className={styles.accentDark}>Succeed.</span>
            </h1>
            <p className={styles.heroTagline}>The all-in-one workspace where teams get work done.</p>
            <p className={styles.heroParagraph}>
              WorkSphere combines task management, team collaboration, and workflow automation
              in a single powerful platform that adapts to how your team works.
            </p>
            <div className={styles.heroCta}>
              <Link to="/signup" className={styles.btnPrimary}>Start Free Trial</Link>
              <Link to="/demo" className={styles.btnDemo}>
                <span className={styles.playIcon}></span>
                Watch Demo
              </Link>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>10k+</span>
                <span className={styles.statLabel}>Teams</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>99.9%</span>
                <span className={styles.statLabel}>Uptime</span>
              </div>
              <div className={styles.statDivider}></div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>4.9</span>
                <span className={styles.statLabel}>Rating</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImageWrapper}>
            <div className={styles.heroImageContainer}>
              <img 
                src={finalImage} 
                alt="WorkSphere dashboard preview" 
                className={styles.heroImage}
                loading="lazy" 
              />
              <div className={styles.imageDot1}></div>
              <div className={styles.imageDot2}></div>
              <div className={styles.imageDot3}></div>
            </div>
          </div>
        </section>

        <section className={styles.companies}>
          <div className={styles.companiesContainer}>
            <h2>Trusted by innovative teams worldwide</h2>
            <div className={styles.companyLogos}>
              <div className={styles.companyLogo}>Acme Co</div>
              <div className={styles.companyLogo}>TechGiant</div>
              <div className={styles.companyLogo}>Innovate Inc</div>
              <div className={styles.companyLogo}>Startup Labs</div>
              <div className={styles.companyLogo}>Global Reach</div>
            </div>
          </div>
        </section>

        <section className={styles.features}>
          <div className={styles.featuresContainer}>
            <div className={styles.featureHeading}>
              <h2>Features crafted for modern teams</h2>
              <p>Everything you need to streamline your workflow in one intuitive platform.</p>
            </div>
            
            <div className={styles.featuresGrid}>
              <div className={styles.featureCard}>
                <div className={styles.featureCardGlow}></div>
                <div className={styles.featureIconContainer}>
                  <div className={styles.featureIcon}>
                    <span className={styles.featureSymbol}>&#9776;</span>
                  </div>
                </div>
                <h3>Visual Kanban Boards</h3>
                <p>Organize your workflow with customizable drag-and-drop Kanban boards.</p>
                <Link to="/features/kanban" className={styles.featureLink}>Learn more</Link>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureCardGlow}></div>
                <div className={styles.featureIconContainer}>
                  <div className={styles.featureIcon}>
                    <span className={styles.featureSymbol}>&#128172;</span>
                  </div>
                </div>
                <h3>Real-time Collaboration</h3>
                <p>Chat, comment, and collaborate with your team in real-time.</p>
                <Link to="/features/collaboration" className={styles.featureLink}>Learn more</Link>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureCardGlow}></div>
                <div className={styles.featureIconContainer}>
                  <div className={styles.featureIcon}>
                    <span className={styles.featureSymbol}>&#128202;</span>
                  </div>
                </div>
                <h3>Performance Analytics</h3>
                <p>Track team performance with visual reports and interactive dashboards.</p>
                <Link to="/features/analytics" className={styles.featureLink}>Learn more</Link>
              </div>
              
              <div className={styles.featureCard}>
                <div className={styles.featureCardGlow}></div>
                <div className={styles.featureIconContainer}>
                  <div className={styles.featureIcon}>
                    <span className={styles.featureSymbol}>&#128279;</span>
                  </div>
                </div>
                <h3>Powerful Integrations</h3>
                <p>Connect with your favorite tools and services effortlessly.</p>
                <Link to="/features/integrations" className={styles.featureLink}>Learn more</Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.workflow}>
          <div className={styles.workflowContainer}>
            <div className={styles.workflowContent}>
              <div className={styles.tagline}>Workflow Automation</div>
              <h2>Automate repetitive tasks and focus on what matters</h2>
              <p>
                WorkSphere helps you automate routine tasks with customizable workflows, 
                notifications, and triggers. Reduce manual work and keep your team focused 
                on high-value activities.
              </p>
              <ul className={styles.workflowList}>
                <li>
                  <span className={styles.checkmark}></span>
                  <span>Create automated workflows in minutes</span>
                </li>
                <li>
                  <span className={styles.checkmark}></span>
                  <span>Set up custom triggers and notifications</span>
                </li>
                <li>
                  <span className={styles.checkmark}></span>
                  <span>Integrate with your existing tools</span>
                </li>
                <li>
                  <span className={styles.checkmark}></span>
                  <span>Reduce time spent on administrative tasks</span>
                </li>
              </ul>
              <Link to="/workflow" className={styles.btnSecondary}>Explore Automation</Link>
            </div>
            <div className={styles.workflowImageContainer}>
              <div className={styles.workflowImageShape}></div>
              <div className={styles.workflowImageFrame}></div>
            </div>
          </div>
        </section>

        <section className={styles.testimonials}>
          <div className={styles.testimonialsContainer}>
            <div className={styles.sectionHeading}>
              <h2>What our customers say</h2>
              <p>Join thousands of teams who've transformed their workflow with WorkSphere</p>
            </div>
            
            <div className={styles.testimonialCards}>
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <div className={styles.quoteMark}>"</div>
                  <p>WorkSphere has completely transformed how we collaborate. Projects that used to take weeks now take days. The intuitive interface and powerful features have made it our central workspace.</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.authorAvatar}></div>
                    <div className={styles.authorInfo}>
                      <h4>Maryum Fasih</h4>
                      <p>Product Manager, TechVision</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <div className={styles.quoteMark}>"</div>
                  <p>The ability to customize workflows while maintaining a clean interface sets WorkSphere apart from other tools we've tried. Our team productivity has increased by 37% since implementing it.</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.authorAvatar}></div>
                    <div className={styles.authorInfo}>
                      <h4>Abeer Jawad</h4>
                      <p>CTO, Innovate Inc.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.testimonialCard}>
                <div className={styles.testimonialContent}>
                  <div className={styles.quoteMark}>"</div>
                  <p>WorkSphere helped us coordinate our remote team across five time zones. The real-time collaboration and automated notifications ensure we're always on the same page, regardless of location.</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.authorAvatar}></div>
                    <div className={styles.authorInfo}>
                      <h4>Areeba Riaz</h4>
                      <p>Operations Director, Global Solutions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.pricing}>
          <div className={styles.pricingContainer}>
            <div className={styles.pricingHeader}>
              <h2>Simple, transparent pricing</h2>
              <p>Start free, upgrade when you need more features</p>
            </div>
            
            <div className={styles.pricingTiers}>
              <div className={styles.pricingCard}>
                <div className={styles.pricingTitle}>Free</div>
                <div className={styles.pricingPrice}>$0</div>
                <div className={styles.pricingBilling}>forever</div>
                <ul className={styles.pricingFeatures}>
                  <li>Up to 10 team members</li>
                  <li>Basic Kanban boards</li>
                  <li>Task management</li>
                  <li>Limited file storage (100MB)</li>
                </ul>
                <Link to="/signup" className={styles.btnOutline}>Get Started</Link>
              </div>
              
              <div className={`${styles.pricingCard} ${styles.pricingFeatured}`}>
                <div className={styles.pricingBadge}>Most Popular</div>
                <div className={styles.pricingTitle}>Professional</div>
                <div className={styles.pricingPrice}>$12</div>
                <div className={styles.pricingBilling}>per user/month</div>
                <ul className={styles.pricingFeatures}>
                  <li>Unlimited team members</li>
                  <li>Advanced Kanban & Gantt charts</li>
                  <li>Custom workflows & automations</li>
                  <li>Unlimited file storage</li>
                  <li>Priority support</li>
                </ul>
                <Link to="/signup/pro" className={styles.btnPrimary}>Start Free Trial</Link>
              </div>
              
              <div className={styles.pricingCard}>
                <div className={styles.pricingTitle}>Enterprise</div>
                <div className={styles.pricingPrice}>Custom</div>
                <div className={styles.pricingBilling}>tailored solution</div>
                <ul className={styles.pricingFeatures}>
                  <li>Everything in Professional</li>
                  <li>Dedicated account manager</li>
                  <li>Custom integrations</li>
                  <li>Advanced security & compliance</li>
                  <li>On-premise deployment option</li>
                </ul>
                <Link to="/contact-sales" className={styles.btnOutline}>Contact Sales</Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className={styles.ctaContainer}>
            <div className={styles.ctaContent}>
              <h2>Ready to transform how your team works?</h2>
              <p>Join thousands of teams that use WorkSphere to collaborate more effectively and achieve their goals faster.</p>
              <div className={styles.ctaButtons}>
                <Link to="/signup" className={styles.btnPrimary}>Start Free Trial</Link>
                <Link to="/demo" className={styles.btnSecondary}>See It In Action</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <Link to="/" className={styles.footerLogo} aria-label="WorkSphere Home">
                <div className={styles.logoIcon}>WS</div>
                <span className={styles.logoText}>WorkSphere</span>
              </Link>
              <p>The complete workspace for modern teams.</p>
              <div className={styles.socialLinks}>
                <a href="#" aria-label="Twitter">
                  <span className={styles.socialIcon}>𝕏</span>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <span className={styles.socialIcon}>in</span>
                </a>
                <a href="#" aria-label="Instagram">
                  <span className={styles.socialIcon}>📷</span>
                </a>
                <a href="#" aria-label="Facebook">
                  <span className={styles.socialIcon}>f</span>
                </a>
              </div>
              <div>
                <span>   </span>
              </div>
              <div className={styles.footerLinkColumn}>
                <h3>Company</h3>
                <ul>
                  <li><Link to="/about">About Us</Link></li>
                  <li><Link to="/careers">Careers</Link></li>
                  <li><Link to="/contact">Contact</Link></li>
                  <li><Link to="/partners">Partners</Link></li>
                  <li><Link to="/legal">Legal</Link></li>
                </ul>
              </div>
            </div>
            
            <div className={styles.footerLinks}>
              <div className={styles.footerLinkColumn}>
                <h3>Product</h3>
                <ul>
                  <li><Link to="/features">Features</Link></li>
                  <li><Link to="/solutions">Solutions</Link></li>
                  <li><Link to="/integrations">Integrations</Link></li>
                  <li><Link to="/pricing">Pricing</Link></li>
                  <li><Link to="/changelog">Changelog</Link></li>
                </ul>
              </div>
              
              <div className={styles.footerLinkColumn}>
                <h3>Resources</h3>
                <ul>
                  <li><Link to="/blog">Blog</Link></li>
                  <li><Link to="/guides">Guides</Link></li>
                  <li><Link to="/help-center">Help Center</Link></li>
                  <li><Link to="/webinars">Webinars</Link></li>
                  <li><Link to="/api-docs">API Docs</Link></li>
                </ul>
              </div>
              
            </div>
            
            <div className={styles.footerNewsletter}>
              <h3>Stay in the loop</h3>
              <p>Get product updates and news delivered to your inbox.</p>
              <div className={styles.newsletterForm}>
                <input type="email" placeholder="Enter your email" aria-label="Email for newsletter" />
                <button type="submit" className={styles.btnSubmit}>Subscribe</button>
              </div>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <div className={styles.footerCopyright}>
              <p>&copy; 2025 WorkSphere. All rights reserved.</p>
            </div>
            <div className={styles.footerBottomLinks}>
              <Link to="/terms">Terms</Link>
              <Link to="/privacy">Privacy</Link>
              <Link to="/cookies">Cookies</Link>
              <Link to="/security">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;