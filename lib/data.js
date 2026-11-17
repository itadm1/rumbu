// All site content in one place. Edit here on GitHub to update the site.

export const company = {
  name: 'Rumbu Industries Limited',
  short: 'Rumbu Industries',
  tagline: 'World leader in quality polypropylene woven mats and twine ropes',
  founded: 2001,
  phone1: '+234 803 691 8902',
  phone2: '+234 814 444 9789',
  email: 'info@rumbuindustries.com',
  address: 'KM 4 Hadejia Road, Opp. Sir Muhd Sanusi Hospital, Kano, Nigeria.',
};

export const about = [
  'Since its founding in Kano, Nigeria in 2001, Rumbu Industries Limited (RIL), a 100% indigenous Nigerian company, has become a leader in the manufacturing of polypropylene (PP) woven mats and woven twine. The largest in Nigeria and West Africa, and one of the largest in the world. Formerly known as Rumbu Sacks Nigeria Limited, it was primarily incorporated to carry out the manufacturing of polypropylene woven sacks, before its diversification into PP woven mats. In 2015 its name was changed to Rumbu Industries Limited.',
  'With a revenue of over $28 million (2020) and manpower of about 2,200 ground staff, Rumbu Industries Limited produces a wide range of quality woven mats and twine ropes.',
  'As one of the first inductees into the Bank of Industry \u201cHall of Fame\u201d, Rumbu has evolved and grown in leaps, its presence felt as it establishes semi-related companies in other African countries.',
  'Rumbu Industries Ltd keeps striving to be the best in the manufacturing sector, with a future focus on diversifying into the aviation, agriculture and renewable energy sectors.',
  'Rumbu is the first and only mat production company in Africa to acquire, install and fully operate the computerised Jacquard weaving machine, giving us the ability to produce customised mats in small batches. Rumbu takes great pride in making superior products and puts the end-user\u2019s interest at the centre of its operations, standing for quality and value for money.',
];

export const stats = [
  { num: '8 mil', label: 'Constructed mats' },
  { num: '30 mil', label: 'Meters of twine' },
  { num: '2,873', label: 'Satisfied customers' },
  { num: '20+', label: 'Years of excellence' },
];

// `slug` is the product page URL (/products/<slug>) and must stay unique.
// `short` is the compact name used in navigation and cards.
// `img` may point to a file that has not been supplied yet: the site checks
// whether the file exists and shows a labelled placeholder until it does.
export const productCategories = ['Mats & twine', 'Household', 'Materials & fibres'];

export const products = [
  { slug: 'polypropylene-woven-mats', category: 'Mats & twine', short: 'PP woven mats', img: '/products/woven-mats.jpg', name: 'Polypropylene (PP) Woven Mats', desc: 'Standard polypropylene mats used as decorations, comfortable for sitting and creating great ambiance within spaces.' },
  { slug: 'pp-twisted-twine-ropes', category: 'Mats & twine', short: 'Twisted twine ropes', img: '/products/twine-ropes.jpg', name: 'PP Twisted Twine Ropes', desc: 'Plastic twine ropes used for construction, transportation of goods, and household activities.' },
  { slug: 'customised-woven-mats', category: 'Mats & twine', short: 'Customised woven mats', img: '/products/custom-mats.jpg', name: 'Customised Woven Mats', desc: 'Customised mats of different sizes. Branding done per customer design and specification.' },
  { slug: 'kettles', category: 'Household', short: 'Kettles', img: '/products/kettles.png', name: 'Kettles', desc: 'Durable moulded plastic kettles for everyday household use.' },
  { slug: 'bowls', category: 'Household', short: 'Bowls', img: '/products/bowls.png', name: 'Bowls', desc: 'Quality moulded plastic bowls in a range of sizes and colours.' },
  { slug: 'buckets', category: 'Household', short: 'Buckets', img: '/products/buckets.png', name: 'Buckets', desc: 'Strong moulded plastic buckets built for daily use.' },
  { slug: 'pet-flakes', category: 'Materials & fibres', short: 'PET flakes', img: '/products/pet-flakes.jpg', name: 'PET Flakes', desc: 'Recycled PET flakes produced as part of our commitment to sustainable manufacturing and the circular economy.' },
  { slug: 'yarn-thread', category: 'Materials & fibres', short: 'Yarn thread', img: '/products/yarn-thread.jpg', name: 'Yarn Thread', desc: 'Quality yarn and thread produced at our Tamburawa mill for a range of industrial and textile applications.' },
  { slug: 'polyester-staple-fibre', category: 'Materials & fibres', short: 'Polyester staple fibre', img: '/products/psf.jpg', name: 'Polyester Staple Fibre (PSF)', desc: 'Polyester staple fibre manufactured at our Agbara mill, used in spinning, filling and non-woven applications.' },
];

export const services = [
  {
    img: '/services/woven-sacks.jpg',
    name: 'PP Woven Sacks',
    desc: 'We manufacture quality PP woven sacks used for packaging and agricultural purposes.',
    link: '',
  },
  {
    img: '/services/renewable-energy.jpg',
    name: 'Renewable Energy',
    desc: 'Our Hybrid Solar innovation, in collaboration with ENERWHERE Sustainable Energy, uses state-of-the-art solar panels and an advanced solar power grid to provide energy across our facilities. We actively pursue green initiatives for environmental protection.',
    link: 'https://www.enerwhere.com/references/rumbu-industries-nigeria/',
    linkLabel: 'ENERWHERE',
  },
];

export const clients =
  'Our clients include government agencies such as the National Emergency Management Agency (NEMA), North East Development Commission (NEDC) and the National Hajj Commission of Nigeria (NAHCON); international organisations such as the Red Cross; and the Nigerian Olympic Committee (London 2012 Summer Olympics). We also serve private individual clients across Africa.';

// rank drives the org-chart layout:
//   'founder' = top, largest
//   'ceo'     = second tier, slightly smaller than founder
//   'ed'      = third tier (ED1 and ED2 side by side)
//   'exec'    = bottom row (other executives)
// Founder/CEO/ED cards carry a bio and social links.
export const team = [
  {
    img: '/team/ceo-ibrahim.jpg',
    name: 'Ibrahim Salisu Buhari',
    role: 'Founder',
    rank: 'founder',
    bio: 'Founder of Rumbu Industries Limited.',
    fullBio: 'Ibrahim Salisu Buhari is the Founder of Rumbu Industries Limited. Since establishing the company in Kano in 2001, he has grown it from a polypropylene woven sacks manufacturer into the largest producer of polypropylene woven mats and twine ropes in Nigeria and West Africa, and one of the largest in the world. Under his vision, the company was among the first inductees into the Bank of Industry Hall of Fame, and it continues to expand with semi-related companies across other African countries. His leadership emphasises quality, value for money, and continued investment in people and technology.',
    social: { linkedin: '#', instagram: '#', twitter: '#', facebook: '#' },
  },
  {
    img: '/team/mohammed.jpg',
    name: 'Muhammad Ibrahim Buhari',
    role: 'Chief Executive Officer',
    rank: 'ceo',
    bio: 'Chief Executive Officer of Rumbu Industries Limited.',
    fullBio: 'Muhammad Ibrahim Buhari is the Chief Executive Officer of Rumbu Industries Limited, providing overall leadership and strategic direction for the company and its operations. He oversees the group\u2019s day-to-day management and its long-term growth strategy, driving the company\u2019s expansion across manufacturing and into new sectors including aviation, agriculture and renewable energy.',
    social: { linkedin: '#', instagram: '#', twitter: '#', facebook: '#' },
  },
  {
    img: '/team/habib.jpg',
    name: 'Habib Ibrahim Buhari',
    role: 'Executive Director 1',
    rank: 'ed',
    bio: 'Executive Director, corporate services and finance.',
    fullBio: 'Habib Ibrahim Buhari serves as Executive Director responsible for corporate services and finance. He oversees the company\u2019s financial strategy, corporate governance and shared services, ensuring sound financial management and operational support across all of Rumbu\u2019s facilities.',
    social: { linkedin: '#', instagram: '#', twitter: '#', facebook: '#' },
  },
  {
    img: null,
    name: 'Hamza Ibrahim Buhari',
    role: 'Executive Director 2',
    rank: 'ed',
    bio: 'Executive Director, oversight and IT.',
    fullBio: 'Hamza Ibrahim Buhari serves as Executive Director responsible for oversight and information technology. He leads corporate governance and the company\u2019s IT operations, overseeing systems, infrastructure and digital initiatives that support Rumbu\u2019s manufacturing and administrative functions.',
    social: { linkedin: '#', instagram: '#', twitter: '#', facebook: '#' },
  },
  {
    img: null,
    name: 'Hajia Suwaiba Ibrahim Buhari',
    role: 'Executive Director 3',
    rank: 'ed',
    bio: 'Executive Director.',
    fullBio: 'Hajia Suwaiba Ibrahim Buhari serves as Executive Director at Rumbu Industries Limited, contributing to the leadership and strategic direction of the company across its operations.',
    social: { linkedin: '#', instagram: '#', twitter: '#', facebook: '#' },
  },
  { img: '/team/sani.png', name: 'Sani Hussein Saleh', role: 'Director', rank: 'exec' },
  { img: '/team/micheal.jpg', name: 'Micheal Gwamna', role: 'Director', rank: 'exec' },
];

export const memberships = [
  { img: '/membership/man.png', name: 'Manufacturers Association of Nigeria' },
  { img: '/membership/nepc.png', name: 'Nigerian Export Promotion Council' },
  { img: '/membership/kaccima.png', name: 'Kano Chamber of Commerce, Industry, Mines & Agriculture' },
  { img: '/membership/son.png', name: 'Standards Organisation of Nigeria' },
  { img: '/membership/excipia.png', name: 'Excipia' },
];

// Homepage carousel: wide factory-floor shot plus product highlights
export const carousel = [
  { src: '/products/factory-floor.jpg', tag: 'Our factory', title: 'PP weaving hall, Kano' },
  { src: '/products/woven-mats.jpg', tag: 'Product', title: 'Polypropylene woven mats' },
  { src: '/products/twine-ropes.jpg', tag: 'Product', title: 'PP twisted twine ropes' },
  { src: '/products/custom-mats.jpg', tag: 'Product', title: 'Customised branded mats' },
];

// Named clients (from the live site's clients paragraph)
export const clientList = [
  'National Emergency Management Agency (NEMA)',
  'North East Development Commission (NEDC)',
  'National Hajj Commission of Nigeria (NAHCON)',
  'International Committee of the Red Cross',
  'Nigerian Olympic Committee (London 2012)',
];

// Exhibitions. Add photo paths under /public/exhibitions and set `img`.
// Any item with img: null shows a captioned placeholder.
export const exhibitions = [
  {
    event: 'Intra-African Trade Fair 2021',
    place: 'Durban, South Africa',
    year: '2021',
    photos: [
      { img: '/exhibitions/p1.jpg', caption: 'Rumbu Industries Ltd stand at the IATF Exhibition, Durban' },
      { img: '/exhibitions/p2.jpg', caption: 'Nigerian Pavilion at IATF Exhibition, Durban' },
      { img: '/exhibitions/p3.jpg', caption: 'Nigerian Pavilion at IATF Exhibition, Durban' },
      { img: '/exhibitions/p4.jpg', caption: 'Mat presented to Kwara State Governor Abdulrahman Abdulrazaq by Rumbu\u2019s Director' },
      { img: '/exhibitions/p5.jpg', caption: 'President Muhammadu Buhari visiting the Nigerian Pavilion at IATF' },
      { img: '/exhibitions/p6.jpg', caption: 'Visit to the Rumbu stand by the Minister of Industry, Trade & Investment, Adeniyi Adebayo' },
    ],
  },
  {
    event: 'Intra-African Trade Fair 2018',
    place: 'Cairo, Egypt',
    year: '2018',
    photos: [
      { img: '/exhibitions/p7.jpg', caption: 'Former Vice President Namadi Sambo visiting the Nigerian Pavilion, Cairo' },
      { img: '/exhibitions/p8.jpg', caption: 'MD and Executive Director, Bank of Industry, visiting the Rumbu stand' },
      { img: '/exhibitions/p9.jpg', caption: 'MD and Executive Director, Bank of Industry, visiting the Rumbu stand' },
      { img: '/exhibitions/p10.jpg', caption: 'Vice President Prof. Yemi Osinbajo visiting the Rumbu Industries Ltd stand' },
      { img: '/exhibitions/p11.jpg', caption: 'Vice President Prof. Yemi Osinbajo visiting the Rumbu Industries Ltd stand' },
      { img: '/exhibitions/p12.jpg', caption: 'Vice President Prof. Yemi Osinbajo visiting the Rumbu Industries Ltd stand' },
    ],
  },
  {
    event: 'PROPAK West Africa 2021',
    place: 'Lagos, Nigeria',
    year: '2021',
    photos: [
      { img: '/exhibitions/p13.jpg', caption: 'Rumbu Directors at PROPAK West Africa 2021, Lagos' },
      { img: '/exhibitions/p14.jpg', caption: 'Rumbu Directors at PROPAK West Africa 2021, Lagos' },
    ],
  },
  {
    event: 'Made in Kano Products Exhibition 2021',
    place: 'Kano, Nigeria',
    year: '2021',
    note: 'Organised by the Manufacturers Association of Nigeria (MAN), Kano/Jigawa Branch.',
    photos: [
      { img: '/exhibitions/p15.jpg', caption: 'Rumbu stand at the Made in Kano Products Exhibition 2021' },
      { img: '/exhibitions/p16.jpg', caption: 'Rumbu stand at the Made in Kano Products Exhibition 2021' },
      { img: '/exhibitions/p17.jpg', caption: 'Rumbu personnel at the Made in Kano Products Exhibition 2021' },
      { img: '/exhibitions/p18.jpg', caption: 'Rumbu personnel at the Made in Kano Products Exhibition 2021' },
      { img: '/exhibitions/p19.jpg', caption: 'Rumbu personnel at the Made in Kano Products Exhibition 2021' },
    ],
  },
  {
    event: 'AADFI 2017',
    place: 'Abuja, Nigeria',
    year: '2017',
    note: 'Association of African Development and Finance Institutions.',
    photos: [
      { img: '/exhibitions/p20.jpg', caption: 'Rumbu Directors at the AADFI Exhibition, Abuja, 2017' },
      // Pending: add p21.jpg to public/exhibitions/ once you have it — nothing else to change.
      { img: '/exhibitions/p21.jpg', caption: 'Rumbu Directors at the AADFI Exhibition, Abuja, 2017' },
    ],
  },
];

// News & milestones. Newest first. `slug` must be unique and URL-safe.
// `cover: null` shows a styled placeholder; set a path under /public/news/ later.
// `body` is an array of paragraphs.
export const news = [
  {
    slug: 'president-buhari-visits-iatf-stand',
    title: 'President Muhammadu Buhari visits Rumbu at Intra-African Trade Fair',
    date: '2021-11-20',
    category: 'Press',
    cover: null,
    excerpt:
      'Rumbu Industries hosted His Excellency at the Nigerian Pavilion during the IATF Exhibition in Durban, South Africa.',
    body: [
      'Rumbu Industries Limited welcomed President Muhammadu Buhari to the Nigerian Pavilion during the Intra-African Trade Fair 2021 in Durban, South Africa.',
      'The visit recognised Rumbu\u2019s standing as the largest polypropylene woven mat and twine manufacturer in Nigeria and West Africa, and its contribution to non-oil exports.',
      'Alongside the President, the company also received the Minister of Industry, Trade and Investment, Adeniyi Adebayo, at its stand.',
    ],
  },
  {
    slug: 'made-in-kano-exhibition-2021',
    title: 'Rumbu showcases at Made in Kano Products Exhibition 2021',
    date: '2021-10-12',
    category: 'Events',
    cover: null,
    excerpt:
      'Organised by the Manufacturers Association of Nigeria (MAN), Kano/Jigawa Branch, the exhibition spotlighted local manufacturing.',
    body: [
      'Rumbu Industries Limited took part in the Made in Kano Products Exhibition 2021, organised by the Manufacturers Association of Nigeria (MAN), Kano/Jigawa Branch.',
      'The company\u2019s stand featured its range of polypropylene woven mats, twine ropes and moulded household products, reinforcing its role in the state\u2019s manufacturing sector.',
    ],
  },
  {
    slug: 'jacquard-weaving-milestone',
    title: 'First in Africa to operate a computerised Jacquard weaving machine',
    date: '2020-06-01',
    category: 'Milestone',
    cover: null,
    excerpt:
      'The investment lets Rumbu produce customised mats in small batches, a first for the continent.',
    body: [
      'Rumbu Industries Limited became the first and only mat production company in Africa to acquire, install and fully operate the computerised Jacquard weaving machine.',
      'The technology gives Rumbu the ability to produce customised mats in small batches, branding designs to precise customer specifications while maintaining quality at scale.',
    ],
  },
  {
    slug: 'renewable-energy-partnership-enerwhere',
    title: 'Hybrid solar rollout with ENERWHERE across facilities',
    date: '2019-09-01',
    category: 'Milestone',
    cover: null,
    excerpt:
      'A hybrid solar innovation in collaboration with ENERWHERE Sustainable Energy powers Rumbu\u2019s operations.',
    body: [
      'Rumbu Industries Limited partnered with ENERWHERE Sustainable Energy to deploy a hybrid solar solution using state-of-the-art solar panels and an advanced solar power grid across its facilities.',
      'The initiative is part of Rumbu\u2019s wider pursuit of green practices and environmental protection in manufacturing.',
    ],
  },
];

// Careers / job adverts. Newest first. Set applyLink to an email or URL.
// To close a role, remove its object or set `open: false`.
export const careers = [
  {
    id: 'production-supervisor-kano',
    title: 'Production Supervisor',
    location: 'Kano, Nigeria',
    type: 'Full-time',
    department: 'Production',
    open: true,
    summary: 'Oversee daily operations on the weaving floor, ensuring output targets and quality standards are met.',
    responsibilities: [
      'Supervise machine operators and weaving teams across shifts.',
      'Monitor production output, quality and downtime.',
      'Enforce safety and housekeeping standards on the floor.',
      'Report daily production figures to management.',
    ],
    requirements: [
      'Experience in a manufacturing or production environment.',
      'Strong leadership and team-coordination skills.',
      'Attention to detail and a focus on quality.',
    ],
    applyLink: 'mailto:info@rumbuindustries.com?subject=Application: Production Supervisor',
  },
];

// Research team fields. Add or edit entries as your team's work evolves.
export const research = {
  intro:
    'Rumbu Industries maintains an active research team working across multiple fields to improve our products, processes and sustainability, and to explore new areas of growth for the company.',
  areas: [
    { title: 'Materials & Polymers', desc: 'Improving the strength, durability and finish of our polypropylene woven products.' },
    { title: 'Manufacturing Processes', desc: 'Optimising weaving, moulding and finishing processes for efficiency and quality.' },
    { title: 'Renewable Energy', desc: 'Advancing our hybrid solar initiatives and green practices across facilities.' },
    { title: 'Agriculture', desc: 'Exploring applications of our products and diversification into the agriculture sector.' },
    { title: 'Product Development', desc: 'Designing new products and customised solutions using our Jacquard weaving capability.' },
  ],
  // Research team members. Replace names, roles, fields and add photos under
  // /public/research/ (e.g. img: '/research/member1.jpg'). img: null shows initials.
  members: [
    { img: null, name: 'Researcher Name 1', role: 'Lead Researcher', field: 'Materials & Polymers' },
    { img: null, name: 'Researcher Name 2', role: 'Research Scientist', field: 'Manufacturing Processes' },
    { img: null, name: 'Researcher Name 3', role: 'Research Scientist', field: 'Renewable Energy' },
    { img: null, name: 'Researcher Name 4', role: 'Research Associate', field: 'Agriculture' },
    { img: null, name: 'Researcher Name 5', role: 'Research Associate', field: 'Product Development' },
    { img: null, name: 'Researcher Name 6', role: 'Research Associate', field: 'Materials & Polymers' },
  ],
};

// Career areas highlighted on the Careers page. Each has an icon (emoji, shown
// on the gradient placeholder) and an optional `img` you can set later to a
// real photo under /public/careers/ (e.g. img: '/careers/production.jpg').
export const careerAreas = [
  { icon: '\u{1F3ED}', img: null, title: 'Manufacturing & Production', desc: 'Run and supervise our weaving and moulding lines, turning polypropylene into world-class mats, twine and household products at scale.' },
  { icon: '\u{2699}', img: null, title: 'Engineering & Maintenance', desc: 'Keep our machinery, including our computerised Jacquard looms, running at peak performance across all six facilities.' },
  { icon: '\u{2705}', img: null, title: 'Quality Control', desc: 'Uphold the standards that make Rumbu a byword for quality, inspecting and testing products from raw material to finished goods.' },
  { icon: '\u{1F52C}', img: null, title: 'Research & Development', desc: 'Join our research team advancing materials, processes and new products across polymers, energy and agriculture.' },
  { icon: '\u{1F69A}', img: null, title: 'Supply Chain & Logistics', desc: 'Move raw materials and finished products efficiently across Nigeria and beyond, keeping our operations flowing.' },
  { icon: '\u{2600}', img: null, title: 'Renewable Energy', desc: 'Build the future of clean manufacturing through our hybrid solar initiative and green energy programmes.' },
  { icon: '\u{1F5A5}', img: null, title: 'Information Technology', desc: 'Design and maintain the systems, networks and infrastructure that power a modern manufacturing enterprise.' },
  { icon: '\u{1F916}', img: null, title: 'Artificial Intelligence', desc: 'Apply AI and data science to optimise production, forecasting and quality across our operations.' },
  { icon: '\u{1F4CA}', img: null, title: 'Monitoring & Evaluation', desc: 'Track performance, measure impact and drive continuous improvement across projects and departments.' },
];
