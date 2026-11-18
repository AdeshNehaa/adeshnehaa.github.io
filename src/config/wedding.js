/**
 * ─────────────────────────────────────────────────────────────
 *  CENTRAL WEDDING CONFIGURATION
 *  Every name, date, time, venue and message on the website
 *  comes from this file. Edit here — nowhere else.
 *
 *  Anything wrapped in [square brackets] is a PLACEHOLDER that
 *  is shown on the site as "details to be added". Replace it
 *  with the real information when available.
 *
 *  Fields ending in "Native" hold the same detail in Marathi,
 *  copied from the printed wedding card. They are shown as a
 *  second line under the English. Leave one empty to hide it.
 * ─────────────────────────────────────────────────────────────
 */

/** Returns true when a value is still a [placeholder]. */
export const isPlaceholder = (value) =>
  typeof value === 'string' && value.trim().startsWith('[');

/** Removes the [square brackets] so a placeholder can be shown as a gentle note. */
export const cleanPlaceholder = (value) =>
  typeof value === 'string' ? value.trim().replace(/^\[|\]$/g, '') : value;

export const wedding = {
  // Navigation menu — `id` must match the id of a section on the page.
  nav: [
    { id: 'home', label: 'Home' },
    { id: 'couple', label: 'Couple' },
    { id: 'countdown', label: 'Countdown' },
    { id: 'events', label: 'Events' },
    { id: 'families', label: 'Families' },
    { id: 'venue', label: 'Venue' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'blessings', label: 'Blessings' },
  ],

  couple: {
    // `photo`: put a portrait in /public/gallery/ and set e.g. 'gallery/aadesh.jpg'.
    // Leave empty to show a decorative placeholder.
    groom: { name: 'Aadesh', role: 'The Groom', photo: '' },
    bride: { name: 'Neha', role: 'The Bride', photo: '' },
    hashtag: '', // e.g. '#AadeshWedsNeha' — leave empty to hide
  },

  // Timezone of the venue. All dates below are local venue time.
  timezoneOffset: '+05:30', // Indian Standard Time
  timezoneLabel: 'IST',

  // The countdown counts down to this moment.
  weddingDate: '2026-12-05T16:15:00+05:30',

  // Each event becomes one card in the "Wedding Events" section.
  //   theme      'haldi' (yellow & marigold) · 'wedding' (maroon & gold) · 'puja' (champagne gold)
  //   highlight  short line under the title (e.g. the muhurat)
  //   dressCode  one line, or a list of lines such as ['Men: …', 'Women: …']
  //   extras     more rows on the card, e.g. { label: 'Lunch', value: '12:00 PM to 3:00 PM' }
  //   venue      leave out when the event is at the main venue below; set a text when it is elsewhere
  //   start/end  used only for "Add to Calendar"; without them the calendar entry is an all-day one
  events: [
    {
      id: 'haldi',
      name: 'Haldi Ceremony',
      nativeName: 'हळदी समारंभ',
      date: '2026-12-04',
      displayDate: 'Friday, 04 December 2026',
      time: '7:00 PM onwards',
      start: '2026-12-04T19:00:00+05:30',
      end: '2026-12-04T23:00:00+05:30',
      theme: 'haldi',
      description:
        'An evening of turmeric, marigolds, music and laughter as we bless the couple with the glow of Haldi.',
      dressCode: ['Men: Yellow kurta', 'Women: Yellow dress or saree'],
    },
    {
      id: 'wedding',
      name: 'Wedding Ceremony',
      nativeName: 'शुभ विवाह',
      date: '2026-12-05',
      displayDate: 'Saturday, 05 December 2026',
      time: '4:15 PM',
      highlight: 'Shubh Muhurat · 4:15 PM',
      start: '2026-12-05T16:15:00+05:30',
      end: '2026-12-05T21:00:00+05:30',
      theme: 'wedding',
      description:
        'With the blessings of the elders and the sacred fire as our witness, Aadesh & Neha begin their journey together.',
      extras: [{ icon: 'lunch', label: 'Lunch', value: '12:00 PM to 3:00 PM', native: 'स्नेह भोजन' }],
      dressCode: ['Women: Nauvari saree', 'Men: Kurta'],
    },
    {
      id: 'jagran-gondhal',
      name: 'Jagran Gondhal',
      nativeName: 'जागरण गोंधळ',
      date: '2026-12-06',
      displayDate: 'Sunday, 06 December 2026',
      // The printed card gives no time or place for this event.
      time: '[Time to be announced]',
      venue: '[Venue to be announced]',
      highlight: 'Satyanarayan Puja',
      theme: 'puja',
      description:
        'A warm invitation to the Jagran Gondhal and Shri Satyanarayan Puja, as we seek blessings for the newlyweds.',
    },
  ],

  // The main venue. Events without their own `venue` are held here.
  venue: {
    name: 'Ashirwad Lawns',
    address: 'Opposite Sahyadri College, Kalyan–Nagar Highway',
    city: 'Belhe, Tal. Junnar, Dist. Pune',
    // The address exactly as printed on the wedding card.
    addressNative: 'आशिर्वाद लॉन्स, सहयाद्री कॉलेज समोर, कल्याण नगर, हायवे बेल्हा, ता. जुन्नर, जि. पुणे',
    // Google Maps share link used by the "Get Directions" button.
    mapsUrl: 'https://maps.app.goo.gl/umfSjHDsjZYpQMPP7',
    // Only used if mapsUrl is ever emptied: the button then searches Google Maps for this text.
    mapsQuery: 'Ashirwad Lawns, Belhe, Junnar',
    note: 'Both the Haldi and the Wedding will be held at Ashirwad Lawns.',
  },

  // Names as printed on the wedding card (English spelling + the original Marathi).
  families: {
    groom: {
      title: "The Groom's Family",
      parents: 'Mrs. Shobha & Mr. Shivaji Nana Borchate',
      parentsNative: 'सौ.श्री. शोभा शिवाजी नाना बोरचटे',
      grandfather: 'Late Nana Ramji Borchate',
      grandfatherNative: 'कै. नाना रामजी बोरचटे',
      village: 'Gunjalwadi, Post Belhe, Tal. Junnar, Dist. Pune',
      villageNative: 'मु. गुंजाळवाडी, पो. बेल्हे, ता. जुन्नर, जि. पुणे',
      familyName: '', // optional extra "Family" line — leave empty to hide
      members: [], // optional extra lines, e.g. ['Siblings: …']
    },
    bride: {
      title: "The Bride's Family",
      parents: 'Mrs. Nanda & Mr. Jalindar Bandu Devkar',
      parentsNative: 'सौ.श्री. नंदा जालिंदर बंडु देवकर',
      grandfather: 'Late Bandu Thakaji Devkar',
      grandfatherNative: 'कै. बंडु ठकाजी देवकर',
      village: 'Gulunchwadi, Post Belhe, Tal. Junnar, Dist. Pune',
      villageNative: 'मु.पो. गुळुंचवाडी, पो. बेल्हे, ता. जुन्नर, जि. पुणे',
      familyName: '',
      members: [],
    },
  },

  messages: {
    welcomeBlessing: '॥ श्री गणेशाय नमः ॥',
    welcomeLine: 'You are cordially invited',
    openButton: 'Open Invitation',
    heroInvite:
      'Together with their families, request the honour of your presence to celebrate their wedding',
    introText:
      'Two hearts, two families and one beautiful beginning. As Aadesh and Neha step into this new chapter of life, we would be delighted to have you with us to shower your blessings and share in our joy.',
    familiesIntro:
      'With heartfelt joy, our families come together to welcome you to this auspicious celebration.',
    closingTitle: 'Your presence is our blessing',
    closingText:
      'We request the pleasure of your company to bless the couple and make this celebration complete. Kindly join us with your family and loved ones.',
    closingBlessing: '॥ शुभं भवतु ॥', // traditional closing blessing — leave empty to hide
    closingSignoff: 'With love and warm regards',
    closingFrom: 'The Families of Aadesh & Neha',
  },

  // Gallery: leave `src` empty to show a decorative placeholder tile.
  // To add photos, put them in /public/gallery/ and set src to
  // 'gallery/your-photo.jpg' (relative, no leading slash).
  gallery: [
    { src: '', alt: 'Couple photo placeholder 1', caption: 'Photo coming soon' },
    { src: '', alt: 'Couple photo placeholder 2', caption: 'Photo coming soon' },
    { src: '', alt: 'Couple photo placeholder 3', caption: 'Photo coming soon' },
    { src: '', alt: 'Couple photo placeholder 4', caption: 'Photo coming soon' },
    { src: '', alt: 'Couple photo placeholder 5', caption: 'Photo coming soon' },
    { src: '', alt: 'Couple photo placeholder 6', caption: 'Photo coming soon' },
  ],

  // Music
  //   youtube    a YouTube link. The official YouTube player appears in the "Our Song" card on
  //              the page (the video is visible, and YouTube may show ads).
  //   src        OR an audio file you have the right to use: put an mp3 in /public/music/ and
  //              set e.g. 'music/our-song.mp3'. It then plays as background music with no video.
  //              If both are empty, the music button shows a "music will be added soon" note.
  //   autoStart  true  = the music begins by itself; false = guests press play.
  //              No browser lets a page make sound before the guest has tapped once, so:
  //              · an audio file starts the moment the guest taps "Open Invitation";
  //              · a YouTube video starts when the song card scrolls onto the screen (YouTube
  //                only allows a video to start by itself while it is visible), and on
  //                iPhones the guest still has to tap the video once.
  //   show       set to false to remove the music button and the song card completely.
  music: {
    show: true,
    autoStart: true,
    title: 'Tu Hain Toh',
    credit: 'From the film Mr. & Mrs. Mahi',
    youtube: 'https://www.youtube.com/watch?v=TVbI55pDdaI',
    src: '',
  },
};

export default wedding;
