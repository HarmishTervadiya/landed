# Landed

A lightning-fast, mobile-first CRM built specifically for students to manage job applications, track interview schedules, and maintain follow-up discipline. Built during a 24-hour hackathon to solve the chaos of the modern internship hunt.

## The Problem it Solves

Students often apply to hundreds of roles, leading to forgotten follow-ups, missed deadlines, and lost job descriptions. Landed moves away from messy spreadsheets, offering a clean, automated dashboard to track the entire application lifecycle—from wishlisting a role to logging your first day on the job.

## Tech Stack

- **Frontend:** React Native with Expo
- **UI/Styling:** Tamagui (for slick, accessible, and performant components)
- **State Management:** Zustand (lightweight, unopinionated store)
- **Forms:** React Hook Form
- **Backend & Auth:** Supabase (PostgreSQL + RLS + Storage)

## Core Features

- **Quick Capture (Smart Fallback):** Paste a job URL from LinkedIn or a careers page. The app automatically extracts the domain, saves the link, and queues it as a draft (`Wishlist`) so you don't break your browsing flow.
- **Flexible Pipeline Management:** Move applications through precise statuses (`Wishlist`, `Applied`, `Interviewing`, `Offered`, `Offer_Accepted`, `Offer_Declined`, `Rejected`, `Ghosted`).
- **Event-Driven Scheduling:** Attach unbounded events (`Interview`, `Assessment`, `Follow_Up`, `Deadline`, `Start_Date`) to any application without being forced into rigid stage structures.
- **JD Storage:** Upload PDF Job Descriptions directly to Supabase Storage so you never lose the requirements if the listing is taken down.
- **Smart Dashboard:** Aggregated analytics (Total Applied, Interview Rate) and a timeline of upcoming events.
- **Push Notifications:** Expo Push API integration for upcoming interview and start-date reminders (via Supabase Edge Functions).

## Quick Start

1. Clone the repository: `git clone https://github.com/yourusername/landed.git`
2. Install dependencies: `npm install`
3. Set up your `.env` variables with your Supabase URL and Anon Key.
4. Run the development server: `npx expo start`

## Contributing

Built with focus and chai. Feel free to submit issues or pull requests to help expand the feature set.
