import React from 'react';
import { Link } from 'react-router-dom';
import { CONTAINER_CLASS } from '../constants';
import { CONTACT, SHIPPING } from '../data/occasions';
import { formatPriceSimple } from '../utils/formatters';

const SECTIONS = [
  { id: 'prazos', title: 'Prazos de produção' },
  { id: 'envios', title: 'Envios e levantamento' },
  { id: 'pagamentos', title: 'Pagamentos' },
  { id: 'trocas', title: 'Trocas e devoluções' },
  { id: 'privacidade', title: 'Privacidade' },
];

const Section = ({ id, title, children }) => (
  <section id={id} className="scroll-mt-28">
    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
    <div className="mt-4 space-y-4 text-gray-700 text-lg leading-relaxed">{children}</div>
  </section>
);

const Informacoes = () => (
  <div className={`${CONTAINER_CLASS} py-10 md:py-16`}>
    <div className="grid lg:grid-cols-[14rem_1fr] gap-10 lg:gap-16">
      <nav aria-label="Nesta página" className="lg:sticky lg:top-28 self-start">
        <p className="font-bold text-gray-900 mb-3">Nesta página</p>
        <ul className="flex flex-wrap lg:flex-col gap-2 lg:gap-1">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="block px-3 py-1.5 rounded-lg text-gray-700 hover:bg-white hover:text-brand-blue font-semibold">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <article className="max-w-[68ch] space-y-14">
        <header>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-[-0.02em]">Envios e encomendas</h1>
          <p className="mt-4 text-lg text-gray-700">
            Tudo o que precisa de saber antes de encomendar. Dúvidas? Escreva para{' '}
            <a href={`mailto:${CONTACT.email}`} className="text-brand-blue font-semibold underline underline-offset-2">{CONTACT.email}</a>{' '}
            ou ligue {CONTACT.phoneDisplay}.
          </p>
        </header>

        <Section id="prazos" title="Prazos de produção">
          <p>
            Cada peça é feita à mão depois de aprovar a arte. Recomendamos encomendar com <strong>2 a 4 semanas de antecedência</strong>{' '}
            em relação à data da festa. O prazo exato depende do projeto e da época do ano: em datas muito procuradas, confirme
            connosco a disponibilidade antes de encomendar.
          </p>
          <p>
            Depois de pagar, enviamos-lhe a arte por email ou WhatsApp. A produção só começa quando a aprovar, por isso
            responda o quanto antes para não perder dias.
          </p>
        </Section>

        <Section id="envios" title="Envios e levantamento">
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>CTT Expresso</strong> para Portugal: {formatPriceSimple(SHIPPING.cttPrice)}, entrega em 2 a 4 dias úteis depois de
              expedido. <strong>Grátis</strong> em encomendas a partir de {SHIPPING.freeFrom} €.
            </li>
            <li><strong>Levantamento grátis em Leiria</strong> ({CONTACT.address}), com dia e hora combinados.</li>
          </ul>
          <p>
            Quando a encomenda sai, recebe o código de seguimento CTT. Pode acompanhá-lo na sua{' '}
            <Link to="/perfil" className="text-brand-blue font-semibold underline underline-offset-2">área de cliente</Link>.
          </p>
          <p>Para Açores, Madeira ou envios para fora de Portugal, peça orçamento antes de encomendar.</p>
        </Section>

        <Section id="pagamentos" title="Pagamentos">
          <p>
            Na loja online paga com cartão através da Stripe, uma plataforma de pagamentos segura. Não guardamos os dados do seu cartão.
          </p>
          <p>
            Nos kits de decoração e nos pedidos por orçamento, a reserva fica feita com <strong>50% de sinal</strong> depois de aprovar a
            arte. O restante paga-se até ao levantamento ou envio.
          </p>
        </Section>

        <Section id="trocas" title="Trocas e devoluções">
          <p>
            Os nossos produtos são feitos à medida, com nomes, datas e temas escolhidos por si. Por isso, nos termos do Decreto-Lei
            n.º 24/2014, não se aplica o direito de livre resolução de 14 dias a artigos personalizados.
          </p>
          <p>
            Se alguma peça chegar danificada ou com um erro nosso, avise-nos logo que a receber, com fotografias, e
            encontramos consigo a melhor solução. Os seus direitos de garantia legal mantêm-se sempre.
          </p>
          <p>
            Pode também recorrer ao{' '}
            <a href="https://www.livroreclamacoes.pt" target="_blank" rel="noopener noreferrer" className="text-brand-blue font-semibold underline underline-offset-2">
              Livro de Reclamações Eletrónico
            </a>.
          </p>
        </Section>

        <Section id="privacidade" title="Privacidade">
          <p>
            Usamos os seus dados (nome, email, telefone e morada) apenas para tratar encomendas e pedidos de orçamento e para lhe
            responder. Os pagamentos são processados pela Stripe; não vendemos nem partilhamos dados para publicidade.
          </p>
          <p>
            Pode pedir para ver, corrigir ou apagar os seus dados a qualquer momento através de{' '}
            <a href={`mailto:${CONTACT.email}`} className="text-brand-blue font-semibold underline underline-offset-2">{CONTACT.email}</a>.
          </p>
        </Section>
      </article>
    </div>
  </div>
);

export default Informacoes;
