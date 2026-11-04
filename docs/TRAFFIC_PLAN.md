# Traffic plan

Contractor Revolution is a small product with a public price and a narrow job: hours, PTO, work orders, and billing for trade contractors. The site should earn visits from people already trying to solve that job, not from ads that promise a whole office suite.

Do not publish customer counts, reviews, ratings, or quotes. The only names on the site are Isom Electric, South Pointe Construction, and Isom Technologies. Do not put referral fees or commission terms on the public site. If a partner is paid, that belongs in a private agreement.

Canonical host is `https://contractor-revolution.co`. `www` should 301 to the bare domain. Say the bare domain everywhere you type a URL.

## 1. Google Business Profile

The product company is Isom Technologies, 7205 US 76, Pendleton, SC 29670, 864-437-1827. Claim or create the profile in Google Business Profile Manager with a Google account Isom controls.

1. Search the address and the phone in Google Maps before you create anything. If a profile already exists, request ownership. Do not open a second profile for the same door.
2. If Google will verify a profile named Contractor Revolution, use that name and the category Software company. If verification fails because it is a product brand, use Isom Technologies as the name and put Contractor Revolution in the description. One profile. Not both.
3. Website: `https://contractor-revolution.co`. Phone: 864-437-1827. Address: the Pendleton shop, not a PO box and not a virtual office.
4. Description, under 750 characters, facts only: time tracking, work orders, PTO, and billing for trade contractors. Own logo and colors. Monthly price starts at $239 for 5 users. Product of Isom Technologies. Link the pricing page in the first post, since the description field does not take a link.
5. Hours: the hours a person actually answers 864-437-1827. A profile that says 24 hours and rings to voicemail gets marked wrong.
6. Photos: the product screens already on the site, the shop exterior, and the truck if it carries the name. Do not use stock crews. Do not upload a customer's logo.
7. Services to add as separate items: time tracking, work orders, PTO, billing setup. Each one gets two plain sentences and a link to the matching page (`/`, `/trades`, `/pricing`).
8. First posts, one a week for a month: the labor calculator, the payroll checklist, the rate card, and "who uses it" with the three names and no adjectives.
9. Questions and answers: paste the FAQ answers yourself so the wrong answer does not sit there. Turn on messaging only if someone will reply the same day.
10. Ask Isom Electric and South Pointe Construction for a Google review only if they offer. Do not hand them a script, and do not offer anything in return. Never buy reviews.

Check the profile monthly. Reply to real questions with the same facts as the FAQ. If the hours or the phone change, change the site, the profile, and `llms.txt` on the same day.

## 2. Google Search Console

1. Add a domain property for `contractor-revolution.co`, not a URL-prefix property. Domain properties cover `www` and `https` in one place.
2. DNS is at GoDaddy (`ns65.domaincontrol.com` / `ns66.domaincontrol.com`). In the GoDaddy DNS panel, add the TXT record Google gives you. Leave it there. Verification dies if someone deletes the TXT during a later DNS edit.
3. After it verifies, submit `https://contractor-revolution.co/sitemap-index.xml`.
4. Use URL inspection on the home page, `/pricing`, `/jobber-alternative`, `/jobtread-alternative`, `/trades/electrical`, and `/tools/labor-burden`. Request indexing for those six first. Do not request the whole sitemap in one afternoon. Google ignores a pile.
5. Confirm the live `www` host 301s to the bare domain and that the canonical tag on each page is the bare domain. The old site pointed canonicals at `www`. That has to be gone, or Search Console will split the clicks.
6. Open the pages report after the sitemap is read. Look for "crawled, not indexed" on the trade pages. If a trade page is thin in Google's eyes, add a worked example from the shop floor, not another adjective.
7. After there are queries, export them. Build the next page only when a query shows up that the site does not answer. Good candidates if they appear: "contractor payroll checklist", "fully loaded labor rate electrician", "Jobber pricing per user".
8. Page experience: the build is static HTML, self-hosted fonts, and width and height on every screenshot. If Core Web Vitals flags a URL, fix that template before writing more pages.

## 3. Bing Webmaster Tools

1. Sign in at Bing Webmaster Tools with the same account you can lose and still recover.
2. Import the site from Google Search Console. That copies the verified domain and the sitemap.
3. If import is unavailable, add `contractor-revolution.co` and verify with the same DNS TXT method, or with the XML file Bing offers. Put that file in `public/` and redeploy. Do not verify only `www`.
4. Submit `https://contractor-revolution.co/sitemap-index.xml` again inside Bing, even after an import. Import sometimes drops the sitemap.
5. Turn on IndexNow only if you want Bing to hear about each deploy. A static marketing site does not need it every commit. Use it when prices change.
6. Look at Bing's SEO reports for blocked resources. `robots.txt` allows the named AI crawlers and everyone else. Nothing on the marketing site should be disallowed.

## 4. Directory listings

Create the four listings in one sitting so the description does not drift. Use the same name, URL, phone, and email.

Suggested categories: time tracking, and field service if the form requires a second. Do not pick "all-in-one CRM." The product is not one.

Paste this description and then stop:

> Contractor Revolution is time tracking, work orders, PTO, and billing for trade contractors. Each shop gets its own instance with its own logo and colors. Monthly price is $239, $329, $429, $529, or $729 for 5, 10, 20, 40, or 75 users. Setup is separate. It does not include payment processing, marketing tools, or a CRM. A product of Isom Technologies, Pendleton, SC. 864-437-1827. info@isomtechnologies.com.

- Capterra: vendor listing for Contractor Revolution. Pricing table copied from `/pricing`, including setup. Screenshots from `/images/app/`, with the note that the names on screen are sample data.
- G2: same facts. Do not join a paid review campaign that asks strangers to review a product they have not used. If Isom Electric or South Pointe wants to review, they do it from their own account, unprompted beyond a single ask.
- GetApp and Software Advice: these often share a vendor center with Capterra. Fill the shared profile once and check that all three storefronts show the bare-domain URL and the real tiers. Reject any "analyst" quote you did not say.
- On every form that asks for number of customers or average rating, leave it blank or type the three names in a notes field if a notes field exists. Do not type a number.

Revisit the listings when the rate card changes. A directory that still shows an old price will get quoted by buyers and by chatbots.

## 5. Trade associations and groups

Show up as the shop that will teach the Friday close, not as a booth that wants a scan.

Associations worth a real phone call, in this order:

- Independent Electrical Contractors, Carolinas chapter. Isom Electric is the reason this is first. Offer a 20-minute segment on where electrical hours go missing between the helper and the invoice. Bring the labor calculator on a laptop. Leave a card with `/tools/labor-burden` and `/trades/electrical`.
- PHCC of the Carolinas, for plumbing. Same talk, pointed at four calls in a day and four work orders. Page: `/trades/plumbing`.
- ACCA chapter that covers the Upstate, for HVAC. Talk is maintenance versus changeout hours. Page: `/trades/hvac`.
- ABC Carolinas or AGC of the Carolinas, only if South Pointe Construction is willing to be named in the room. Do not volunteer their jobs, their numbers, or their logo. Page: `/trades/general-contractors`.
- Anderson and Clemson-area chambers. One breakfast is enough. The ask is an intro to bookkeepers who already do contractor payroll, not a speech.

Do not buy a mailing list from any of them.

Reddit. Read the rules of each community before the first comment. Useful places: `r/electricians`, `r/HVAC`, `r/Plumbing`, `r/Construction`, `r/smallbusiness`, `r/sweatystartup`. Answer the question that was asked. Link the calculator or the checklist only when the question is the burden math or the Friday close. One link, in the last line, with a sentence that says you sell the software. No "DM me." No second comment asking if it helped. If a moderator removes it, do not repost.

Facebook. Skip the giant "Electricians" groups that are mostly tool photos and arguments. Use groups where you can see the moderators: a Carolinas IEC group, an Upstate contractors group, a local HVAC owners group. Same rule as Reddit. Post the checklist as a plain list, and put the URL under it. Do not boost the post.

Contractor Talk and similar forums: one signature link in the profile, answers that stand without the link.

## 6. YouTube shorts

Film on a phone, in the shop or in a van, under a minute. No stock footage of people who do not work there. On-screen text because a lot of people watch with the sound off. End card is the bare URL, not a logo animation.

1. "The wage is not the hour." Hand writes $30. Cut to the calculator. Type 2080, 7.65, a comp percent, 80 hours of PTO. Point at "per hour on a job." Say it is cost, not the bill rate. URL: `/tools/labor-burden`.
2. "Four calls, one line." A notebook page with "8 hours, van." Then four work orders on a phone. Voice-over: the office cannot split that 8 by memory on Friday. URL: `/trades/plumbing`.
3. "Paid is not billed." Two stacks of paper. Label one payroll, one still to bill. Say closing Friday does not invoice the customer. URL: `/resources/work-order-hours-that-get-billed`.
4. "Who is a user." Hold up a phone and a desk phone. "If they log in, they count. Field and office are the same price." Show the five prices. URL: `/pricing`.
5. "Your name on it." Film the wordmark area and say each shop gets its own logo and colors. Do not show a customer's logo unless they handed you the file for this purpose. URL: `/`.
6. "Fifteen minutes." A weekly summary on the laptop, dates visible, sample data only. Walk regular, overtime, leave, total. Say the close is built to take 15 minutes or less because the hours were entered on the job. URL: `/resources/close-the-week-for-payroll`.

Title each short with the search phrase, not a joke. Description: two sentences, one URL, and "Product of Isom Technologies, Pendleton, SC." Put the playlist on the site footer only after three shorts are actually public. Do not embed an empty playlist.

## 7. Partners and referrals

People who already touch the Friday file:

- Bookkeepers and payroll clerks in Anderson, Pendleton, Clemson, and Greenville who run contractor payroll. Offer them the checklist PDF-by-print and the calculator. Their clients feel the pain before the owner does. The intro is "when a client is rebuilding timesheets in Excel, send them here." No public bounty.
- Supply houses where the contractor is already standing still: electrical supply counters, HVAC wholesale (Johnstone and similar), plumbing wholesale (Ferguson and similar). Ask for a quarter sheet by the will-call window. The quarter sheet has the calculator URL and the phone number. It does not have a discount code.
- Isom Electric can introduce electrical contractors they already work beside. The introduction is a name and a phone call, not a blast. Isom Technologies can do the same for low-voltage contractors on shared jobs.
- South Pointe Construction, only if they want to tell another builder. Do not list them as a reference account in a slide until they have said yes to that specific builder.

What not to do: a public "refer a friend, get a month free" banner, a commission table, or a partner portal. Those pages attract the wrong traffic and they do not belong on this site.

When a partner does send a buyer, the order form notes field is enough. Isom can see the name. The site does not need a tracking parameter to rank.

## 8. LLM visibility

Chat tools quote pages that are easy to lift without guessing. The work is already started. Keep it true.

1. `https://contractor-revolution.co/llms.txt` is the short file. `llms-full.txt` is the long one. Both carry `Last updated: 2026-11-04`. Change that date whenever a price, a customer name, or a phone number changes. A stale date next to a stale price is how a chatbot keeps the old number.
2. `robots.txt` allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot, and Applebot-Extended, and it points at both files in comments. Do not add a disallow later "just for the blog."
3. The FAQ page answers in the first sentence. Question text matches how a person asks: "What does a month cost?" not "Leverage our flexible commercial options."
4. Prices appear as digits in HTML, not only inside an image. The JSON-LD `Offer` nodes use the same five monthly prices. There is no `aggregateRating`. Do not add one.
5. Comparison pages name the source URL and the check date (November 3, 2026) and say "pricing as of November 2026." Starred Jobber rows are labeled estimates because Jobber sends 16 or more users to sales. When you re-check getjobber.com/pricing and jobtread.com/pricing, update the table, the FAQ, and `llms-full.txt` together.
6. Organization schema, the footer, the Google profile, and the directory listings must show the same name, address, and phone. Models treat a mismatch as a reason to skip you.
7. The labor calculator and the checklist are the pages worth citing, because they answer a question without a sales wall. Mention them by URL when you answer on Reddit or in a Facebook group.
8. After a price change, request indexing on `/pricing`, `/compare`, and the two alternative pages. Then ask one chat product, in a fresh thread, "What does Contractor Revolution cost?" If it quotes the old number, the files or the cache are wrong. Fix the files. Do not argue with the model in public.
9. Do not buy "we'll get you mentioned in ChatGPT" services. They invent the kind of stats this site is not allowed to invent.

## What to do first

1. Fix `www` to 301, confirm canonicals, submit the sitemap in Search Console and Bing.
2. Publish the Google Business Profile with the real address and the three customer names, nothing else.
3. Fill Capterra, G2, GetApp, and Software Advice from the paragraph above.
4. Film short number 1 and short number 4. They match pages that can already rank.
5. Call the IEC Carolinas chapter and one Upstate bookkeeper.

That is the whole plan. More pages come after a query or a real conversation, not before.
