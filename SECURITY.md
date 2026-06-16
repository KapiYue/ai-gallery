Security
Creem signs every webhook request with an HMAC-SHA256 digest. The verifyCreemWebhookSignature helper in lib/creem.ts computes the expected digest from CREEM_WEBHOOK_SECRET and compares it using Node's crypto.timingSafeEqual to prevent timing attacks. Requests with missing or mismatched signatures are rejected with HTTP 401.

Authentication
Authentication is handled entirely by Supabase Auth. The @supabase/ssr package configures cookie-based sessions that propagate through Server Components, Route Handlers, and Middleware without any manual token passing.
The middleware.ts file refreshes the Supabase session on every matched request. It explicitly excludes /api/payment/webhook and static assets to preserve raw request bodies and avoid unnecessary overhead.

Available Scripts

Deployment
The recommended deployment target is Vercel:
Push the repository to GitHub.
Import the repository in the Vercel dashboard and add all environment variables from the reference table above.
Install the Supabase Vercel integration to have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY populated automatically.
In the Creem dashboard, set the webhook URL to https://<your-domain>/api/payment/webhook and select the events: checkout.completed, subscription.paid, refund.created.
Switch CREEM_API_BASE to https://api.creem.io for live transactions.



Code of Conduct

Our Pledge
We as members, contributors, and maintainers pledge to make participation in the creem-payment project and our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, caste, color, religion, or sexual identity and orientation.
We pledge to act and interact in ways that contribute to an open, welcoming, diverse, inclusive, and healthy community.

Our Standards
Examples of behavior that contributes to a positive environment:
Demonstrating empathy and kindness toward other people
Being respectful of differing opinions, viewpoints, and experiences
Giving and gracefully accepting constructive feedback
Accepting responsibility and apologizing to those affected by our mistakes, and learning from the experience
Focusing on what is best not just for us as individuals, but for the overall community

Examples of unacceptable behavior:
The use of sexualized language or imagery, and sexual attention or advances of any kind
Trolling, insulting or derogatory comments, and personal or political attacks
Public or private harassment
Publishing others' private information, such as a physical or email address, without their explicit permission
Other conduct which could reasonably be considered inappropriate in a professional setting

Enforcement Responsibilities
Project maintainers are responsible for clarifying and enforcing our standards of acceptable behavior and will take appropriate and fair corrective action in response to any behavior that they deem inappropriate, threatening, offensive, or harmful.
Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, wiki edits, issues, and other contributions that are not aligned to this Code of Conduct, and will communicate reasons for moderation decisions when appropriate.

Scope
This Code of Conduct applies within all community spaces, and also applies when an individual is officially representing the community in public spaces. Examples of representing our community include using an official e-mail address, posting via an official social media account, or acting as an appointed representative at an online or offline event.

Enforcement
Instances of abusive, harassing, or otherwise unacceptable behavior may be reported to the project maintainers responsible for enforcement. All complaints will be reviewed and investigated promptly and fairly.
All project maintainers are obligated to respect the privacy and security of the reporter of any incident.

Enforcement Guidelines
1. Correction
Community Impact: Use of inappropriate language or other behavior deemed unprofessional or unwelcome in the community.
Consequence: A private, written warning from project maintainers, providing clarity around the nature of the violation and an explanation of why the behavior was inappropriate. A public apology may be requested.

2. Warning
Community Impact: A violation through a single incident or series of actions.
Consequence: A warning with consequences for continued behavior. No interaction with the people involved, including unsolicited interaction with those enforcing the Code of Conduct, for a specified period of time.

3. Temporary Ban
Community Impact: A serious violation of community standards, including sustained inappropriate behavior.
Consequence: A temporary ban from any sort of interaction or public communication with the community for a specified period of time.

4. Permanent Ban
Community Impact: Demonstrating a pattern of violation of community standards, including sustained inappropriate behavior, harassment of an individual, or aggression toward or disparagement of classes of individuals.
Consequence: A permanent ban from any sort of public interaction within the community.

Attribution
This Code of Conduct is adapted from the Contributor Covenant, version 2.1, available at https://www.contributor-covenant.org/version/2/1/code_of_conduct.html.



Contributing

Welcome
Thank you for your interest in contributing to creem-payment! Contributions of all kinds are welcome — bug reports, feature requests, documentation improvements, and code changes. Please read this guide before submitting anything so that maintainers can review and merge your work efficiently.

Getting Started
Development prerequisites
Node.js 18+
pnpm 9+
A Supabase project (free tier is sufficient)
A Creem account with at least one test product
Git

Fork and clone
Environment setup
Copy .env.example to .env.local and fill in your Supabase and Creem credentials. Run pnpm db:migrate to apply the latest migrations.

Contribution Types
Bug Reports
Before opening an issue, please search existing issues to avoid duplicates. When filing a bug report, include:
A concise, descriptive title
Steps to reproduce the issue
Expected vs. actual behavior
Relevant environment information (OS, Node version, browser if applicable)
Any relevant error messages or stack traces

Feature Requests
Open a GitHub Issue with the label enhancement. Describe the problem your feature solves and provide a rough implementation sketch if possible. Feature requests are discussed with the maintainers before work begins to avoid duplicate effort.

Pull Requests
For anything beyond small typo fixes, open an issue first to discuss the change. This saves you time if the direction does not align with project goals.
Pull request checklist:
Branch naming: feat/<name>, fix/<name>, docs/<name>, chore/<name>
Code style: run pnpm lint before pushing; fix all warnings
TypeScript: all new code must be fully typed; avoid any
Schema changes: run pnpm db:generate to create a migration file and commit it alongside the schema change
Commit messages: follow Conventional Commits — e.g. feat: add subscription pause endpoint
PR description: explain what changed, why, and how to test it

Code Style Guidelines
TypeScript strict mode is enabled — avoid type assertions unless absolutely necessary
Prefer server-side data fetching in Server Components and Route Handlers over client-side fetch where possible
All Drizzle queries must go through lib/db/index.ts — do not create additional database clients
Creem API calls must go through lib/creem.ts — do not call the Creem API directly from components
Environment variables must be validated at the point of use with a non-null assertion or runtime check; never hardcode secrets
Use nanoid for generating IDs — do not use Math.random() or Date.now()

Testing Webhooks Locally
Use the Creem CLI or a tunnel tool such as ngrok to expose your local server:

Review Process
Maintainers aim to respond to new pull requests within five business days. Reviews may request changes; please address all comments and push new commits to the same branch — do not force-push after review has started. Once approved, a maintainer will squash-merge the pull request.

Releasing
Releases are managed by the core maintainers and follow semantic versioning (MAJOR.MINOR.PATCH). Contributors do not need to bump version numbers; the maintainers handle this as part of the release workflow.



MIT License

Copyright (c) 2025 creem-payment Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



Security

Reporting a Vulnerability
The creem-payment project takes security issues seriously. If you believe you have found a security vulnerability in this codebase, please do not open a public GitHub Issue. Instead, report it through one of the following channels:
Email: security@your-org.example.com
GitHub Private Vulnerability Reporting: use the "Report a vulnerability" button in the Security tab of the repository

Please include:
A clear description of the vulnerability and its potential impact
Steps to reproduce the issue
Any proof-of-concept code or screenshots
Your recommended fix or mitigation, if you have one

You will receive an acknowledgment within 48 hours and a full response — including a timeline for a fix — within five business days.


Supported Versions

Security Architecture
Authentication
All authenticated API routes call supabase.auth.getUser() and return HTTP 401 if no valid session is present.
Session tokens are stored in HTTP-only cookies via @supabase/ssr — they are not accessible to JavaScript running in the browser.
The middleware.ts file refreshes the Supabase session on every request to detect token expiry promptly.

Webhook Signature Verification
Every incoming webhook from Creem is verified using HMAC-SHA256 before any payload processing occurs.
The signature comparison uses Node.js crypto.timingSafeEqual to prevent timing-based attacks.
Requests with missing or invalid signatures are rejected with HTTP 401 and logged server-side.

Environment Variable Hygiene
Secret environment variables (CREEM_API_KEY, CREEM_WEBHOOK_SECRET, DATABASE_URL) are server-only — they are never prefixed with NEXT_PUBLIC_ and are therefore never exposed to the browser bundle.
The .env.local file must never be committed to version control. A .gitignore entry is included to prevent this.

Idempotent Webhook Handling
Before inserting a new order, the webhook handler checks whether an order with the same Creem order ID already exists. Duplicate events are silently skipped, preventing double-charging records.

Database Access
All database operations use Drizzle ORM's parameterized queries — raw SQL strings are not used, eliminating SQL injection risk.
The database connection uses prepare: false (required for Supabase Transaction pool mode) but the underlying postgres.js driver still parameterizes all values.

Dependency Security
Keep dependencies up to date. Run the following regularly:
Dependabot or Renovate Bot are recommended for automated dependency update PRs.

Responsible Disclosure Policy
creem-payment follows a coordinated vulnerability disclosure process:
Reporter submits the vulnerability privately.
Maintainers acknowledge receipt within 48 hours.
Maintainers assess severity and develop a fix.
A patched release is published and a security advisory is created on GitHub.
The reporter is credited in the advisory unless they prefer to remain anonymous.

We kindly ask reporters to refrain from public disclosure for at least 90 days after the initial report to give users sufficient time to upgrade.
