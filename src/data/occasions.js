// Ocasiões servidas pela Tralalá Criativo.
// O slug é o mesmo valor guardado em products.occasions e quote_requests.occasion.

export const OCCASIONS = [
  {
    slug: 'festas-infantis',
    name: 'Festas infantis',
    title: 'Festa infantil com o tema que ele escolheu',
    intro:
      'Caixinhas, tubetes, topos e lembranças com o personagem, o nome e a idade. Tudo desenhado de raiz para a festa, não tirado de um molde.',
    image: '/assets/produtos/caixinha-luxo.webp',
    showKits: true,
    ideas: ['Mesa de doces completa', 'Lembranças para os convidados', 'Topo de bolo e centros de mesa'],
  },
  {
    slug: 'batizado',
    name: 'Batizado',
    title: 'Batizado com detalhes que ficam na família',
    intro:
      'Caixa para convidar os padrinhos, lembranças em MDF, cones para pétalas e a mesa decorada com o nome do bebé.',
    image: '/assets/produtos/caixa-padrinhos.webp',
    showKits: true,
    ideas: ['Convite aos padrinhos', 'Lembranças em MDF', 'Mesa e topo de bolo'],
  },
  {
    slug: 'casamento',
    name: 'Casamento',
    title: 'Casamento: da papelaria à lembrança',
    intro:
      'Convites, cones para pétalas, ímanes gravados, rótulos e placards para o plano de mesas. Criamos a arte a partir das vossas cores.',
    image: '/assets/produtos/iman-mdf.webp',
    showKits: false,
    ideas: ['Convites e cartões', 'Lembranças para convidados', 'Placard e plano de mesas'],
  },
  {
    slug: 'empresas',
    name: 'Empresas',
    title: 'Brindes e eventos para empresas',
    intro:
      'Brindes com o logótipo, rótulos, sacos e papelaria para eventos, inaugurações e festas de Natal. Quantidades grandes com fatura em nome da empresa.',
    image: '/assets/produtos/sacolinha.webp',
    showKits: false,
    ideas: ['Brindes com logótipo', 'Papelaria para eventos', 'Encomendas de grande volume'],
  },
  {
    slug: 'individuais',
    name: 'Presentes',
    title: 'Presentes personalizados, um de cada vez',
    intro:
      'Canecas, azulejos, molduras e nomes em MDF feitos para uma pessoa só. Para oferecer ou para guardar.',
    image: '/assets/produtos/nome-mdf.webp',
    showKits: false,
    ideas: ['Canecas e azulejos', 'Nomes e molduras em MDF', 'Kits de presente'],
  },
];

export const OCCASION_BY_SLUG = Object.fromEntries(OCCASIONS.map((o) => [o.slug, o]));

export const QUOTE_OCCASION_OPTIONS = [
  ...OCCASIONS.map(({ slug, name }) => ({ value: slug, label: name })),
  { value: 'outro', label: 'Outro' },
];

// Kits de decoração (feed.pdf). Reserva por orçamento, não vão ao carrinho.
export const PARTY_KITS = [
  {
    id: 'kit-essencial',
    name: 'Kit Essencial',
    price: 89,
    tagline: 'Tudo o que precisa para uma festa bonita.',
    image: '/assets/produtos/kit-essencial.webp',
    items: ['Painel com o tema', '1 estrutura', '3 cilindros', '3 bandejas', '10 caixinhas personalizadas', 'Topo de bolo', 'Convite digital'],
  },
  {
    id: 'kit-premium',
    name: 'Kit Premium',
    price: 140,
    tagline: 'Mais detalhes para uma festa ainda mais especial.',
    image: '/assets/produtos/kit-premium.webp',
    items: ['2 painéis com o tema', '2 estruturas', '3 cilindros', '3 bandejas', '1 vaso decorativo', '15 caixinhas personalizadas', 'Topo de bolo', 'Convite digital ou impresso'],
  },
  {
    id: 'kit-completo',
    name: 'Kit Completo',
    price: 175,
    tagline: 'A festa montada de ponta a ponta.',
    image: '/assets/produtos/kit-completo.webp',
    items: ['3 painéis com o tema', '3 estruturas', '3 cilindros', '3 bandejas', '1 vaso decorativo', '20 caixinhas personalizadas', 'Topo de bolo', 'Convite digital', 'Display 50 cm'],
  },
];

// Envio: manter igual ao definido na edge function create-checkout-session.
export const SHIPPING = {
  cttPrice: 4.9,
  freeFrom: 60,
  pickupLabel: 'Levantamento grátis em Leiria',
};

export const CONTACT = {
  phoneDisplay: '961 073 787',
  phoneE164: '+351961073787',
  whatsapp: '351961073787',
  email: 'geral@tralalacriativo.pt',
  instagram: 'https://www.instagram.com/tralalacriativo.pt/',
  address: 'Av. Marquês de Pombal, 226 - Leiria',
};
