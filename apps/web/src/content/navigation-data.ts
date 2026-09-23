import type { NavItem } from '@ukbt/truth';

/**
 * Primary navigation — 7 links + 1 CTA. This is the single source of truth
 * for header, footer, and any navigation component.
 *
 * "Join the Club" is a primary CTA, not an ordinary navigation item.
 * Parent items with children remain navigable — clicking the label navigates
 * to the href, clicking the arrow/toggle opens the submenu.
 */
export const primaryNav: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'About Us', href: '/about' },
  { label: 'Club Captain', href: '/club-captain' },
  { label: 'Players Profile', href: '/players' },
  {
    label: 'Our Franchises',
    href: '/franchises',
    children: [{ label: 'Uppsala Tigers', href: '/franchises/uppsala-tigers' }],
  },
  {
    label: 'Events',
    href: '/tournaments',
    ariaLabel: 'International Tournaments and Events',
    // No /tournaments/previous|current|future routes exist (ROUTE-CONTRACT
    // authorises /tournaments only; statuses in evidence are Upcoming /
    // Completed, no separately-evidenced current feed). Children anchor to
    // the page's own sections: previous = completed, current/future =
    // upcoming fixtures. A dedicated route needs a contract amendment.
    children: [
      { label: 'Previous Events', href: '/tournaments#completed' },
      { label: 'Current Events', href: '/tournaments#upcoming' },
      { label: 'Future Events', href: '/tournaments#upcoming' },
    ],
  },
  { label: 'Contact Us', href: '/contact' },
];

/**
 * Primary CTA — rendered as a button in the header, not as a nav link.
 */
export const primaryCta = {
  label: 'Join the Club',
  href: '/join',
};

/**
 * Secondary navigation — footer only. Template-mirrored routes that extend
 * the client's IA without widening primary navigation.
 */
export const secondaryNav: NavItem[] = [
  { label: 'Community', href: '/community' },
  { label: 'Coaching & Development', href: '/coaching' },
  { label: 'Club News', href: '/news' },
  { label: 'FAQ', href: '/faq' },
];
