-- Migração 020, parte 2 de 6. Depende de: parte 1.
-- Correr no Supabase > SQL Editor. Pode repetir-se sem duplicar nada.

-- ---------------------------------------------------------------------
-- 2. PRODUTOS: catálogo "Papelaria Festas" (Tabela Papelaria.pdf)
--    Imagens em /public/assets/produtos (servidas pelo próprio site).
--    min_quantity: valores sugeridos, confirmar com a Tralalá.
-- ---------------------------------------------------------------------
WITH novos (name, description, price, category, image_url, occasions, min_quantity, is_featured, sort_order, sale_mode, price_note, customization_options) AS (
  VALUES
  ('Caixinha Simples', 'Caixinha de lembrança personalizada com o tema, nome e idade. Ideal para doces e pequenos mimos.', 2.00, 'Caixinhas e embalagens', '/assets/produtos/caixinha-simples.webp', ARRAY['festas-infantis','batizado','casamento','empresas'], 10, true, 10, 'cart', NULL, NULL::jsonb),
  ('Caixinha 3D', 'Caixinha com elemento em relevo 3D no topo, personalizada com o tema da festa.', 2.30, 'Caixinhas e embalagens', '/assets/produtos/caixinha-3d.webp', ARRAY['festas-infantis','batizado'], 10, true, 11, 'cart', NULL, NULL),
  ('Caixinha Luxo', 'Caixinha com laço e aplicações em camadas. Acabamento mais elaborado para mesas de destaque.', 2.80, 'Caixinhas e embalagens', '/assets/produtos/caixinha-luxo.webp', ARRAY['festas-infantis','batizado','casamento'], 10, true, 12, 'cart', NULL, NULL),
  ('Sacolinha', 'Sacolinha personalizada com alças, para levar as lembranças da festa.', 2.50, 'Caixinhas e embalagens', '/assets/produtos/sacolinha.webp', ARRAY['festas-infantis','batizado','empresas'], 10, false, 13, 'cart', NULL, NULL),
  ('Caixa Cineminha + Copos', 'Caixa cineminha personalizada com copos para pipocas e sumo. Perfeita para sessões de cinema em festa.', 8.00, 'Caixinhas e embalagens', '/assets/produtos/caixa-cineminha.webp', ARRAY['festas-infantis'], 5, true, 14, 'cart', NULL, NULL),
  ('Tubete Simples', 'Tubete personalizado para confeitos e pequenos doces.', 1.50, 'Caixinhas e embalagens', '/assets/produtos/tubete-simples.webp', ARRAY['festas-infantis','batizado','casamento','empresas'], 10, false, 15, 'cart', NULL, NULL),
  ('Tubete 3D', 'Tubete com aplicação 3D no topo, com o personagem ou tema da festa.', 1.80, 'Caixinhas e embalagens', '/assets/produtos/tubete-3d.webp', ARRAY['festas-infantis','batizado'], 10, true, 16, 'cart', NULL, NULL),
  ('Cone Personalizado', 'Cone em papel para pétalas, arroz ou doces. Muito usado em casamentos e batizados.', 0.60, 'Caixinhas e embalagens', '/assets/produtos/cone-personalizado.webp', ARRAY['casamento','batizado'], 20, false, 17, 'cart', NULL, NULL),
  ('Caixa Padrinhos', 'Caixa em madeira para o convite aos padrinhos, com embalagem e laço incluídos. O preço final depende do tamanho e do modelo.', 30.00, 'Caixinhas e embalagens', '/assets/produtos/caixa-padrinhos.webp', ARRAY['batizado','casamento'], 1, true, 18, 'quote', 'A partir de 30 €', NULL),
  ('Caixa Play-Doh', 'Caixa personalizada com plasticinas, uma lembrança para brincar depois da festa.', 3.80, 'Lembrancinhas', '/assets/produtos/caixa-playdoh.webp', ARRAY['festas-infantis'], 10, false, 20, 'cart', NULL, NULL),
  ('Kit Pintura', 'Kit de pintura personalizado com desenhos do tema e lápis. Entretém as crianças durante a festa.', 3.00, 'Lembrancinhas', '/assets/produtos/kit-pintura.webp', ARRAY['festas-infantis'], 10, false, 21, 'cart', NULL, NULL),
  ('Jogo do Galo', 'Jogo do galo personalizado com peças do tema. Lembrança para brincar em casa.', 2.50, 'Lembrancinhas', '/assets/produtos/jogo-da-velha.webp', ARRAY['festas-infantis'], 10, false, 22, 'cart', NULL, NULL),
  ('Copo Personalizado', 'Copo reutilizável com nome e tema da festa.', 2.40, 'Lembrancinhas', '/assets/produtos/copo-personalizado.webp', ARRAY['festas-infantis','empresas'], 10, false, 23, 'cart', NULL, NULL),
  ('Porta-chaves em MDF', 'Porta-chaves em MDF gravado com nome, data ou logótipo.', 1.50, 'Lembrancinhas', '/assets/produtos/porta-chave-mdf.webp', ARRAY['casamento','batizado','empresas','individuais'], 10, false, 24, 'cart', NULL, NULL),
  ('Íman em MDF', 'Íman em MDF gravado, lembrança clássica de casamento e batizado.', 2.00, 'Lembrancinhas', '/assets/produtos/iman-mdf.webp', ARRAY['casamento','batizado','empresas'], 10, true, 25, 'cart', NULL, NULL),
  ('Moldura com Foto em MDF', 'Moldura em MDF com fotografia impressa. Lembrança afetiva para a família.', 2.80, 'Lembrancinhas', '/assets/produtos/moldura-mdf.webp', ARRAY['batizado','casamento','individuais'], 1, false, 26, 'cart', NULL, NULL),
  ('Centro de Mesa', 'Centro de mesa personalizado com o tema, nome e idade.', 3.80, 'Decoração de mesa', '/assets/produtos/centro-de-mesa.webp', ARRAY['festas-infantis','batizado','casamento'], 1, false, 30, 'cart', NULL, NULL),
  ('Topo de Bolo Simples', 'Topo de bolo em papel com nome, idade e tema.', 6.50, 'Decoração de mesa', '/assets/produtos/topo-bolo-simples.webp', ARRAY['festas-infantis','batizado','casamento'], 1, true, 31, 'cart', NULL, NULL),
  ('Topo de Docinho', 'Topos personalizados para docinhos e cupcakes.', 0.50, 'Decoração de mesa', '/assets/produtos/topo-docinho.webp', ARRAY['festas-infantis','batizado','casamento'], 20, false, 32, 'cart', NULL, NULL),
  ('Nome em MDF', 'Letras em MDF (20 × 15 cm) para decorar a mesa ou o quarto. Preço por letra: escolha a quantidade igual ao número de letras.', 6.00, 'Decoração de mesa', '/assets/produtos/nome-mdf.webp', ARRAY['festas-infantis','batizado','individuais'], 1, false, 33, 'cart', 'Preço por letra', NULL),
  ('Display em PVC', 'Figura recortada em PVC com o personagem ou a fotografia que escolher. Escolha a altura.', 22.00, 'Decoração de mesa', '/assets/produtos/display-pvc.webp', ARRAY['festas-infantis','batizado','casamento'], 1, true, 34, 'cart', 'Desde 22 €',
     '[{"label":"Até 50 cm","price":22.00,"allows_text":true,"allows_image":true},{"label":"Até 70 cm","price":27.00,"allows_text":true,"allows_image":true},{"label":"Até 100 cm","price":32.00,"allows_text":true,"allows_image":true}]'::jsonb),
  ('Placard de Eventos', 'Placard de 1 m × 80 cm para boas-vindas, plano de mesas ou menu.', 40.00, 'Decoração de mesa', '/assets/produtos/placard-eventos.webp', ARRAY['casamento','batizado','empresas'], 1, false, 35, 'cart', NULL, NULL),
  ('Convite Impresso', 'Convite impresso com criação da arte incluída. O valor depende do tamanho, do modelo e da quantidade.', 0, 'Papelaria', '/assets/produtos/convite-impresso.webp', ARRAY['casamento','batizado','festas-infantis','empresas'], 1, true, 40, 'quote', 'Sob orçamento', NULL),
  ('Cartão Personalizado', 'Cartão de agradecimento ou de mesa, personalizado com nomes e data.', 0.80, 'Papelaria', '/assets/produtos/cartao-personalizado.webp', ARRAY['casamento','batizado','empresas','individuais'], 10, false, 41, 'cart', NULL, NULL),
  ('Rótulo de Garrafa de Água', 'Rótulo 20 × 5 cm para garrafas de água, com o tema do evento.', 0.55, 'Papelaria', '/assets/produtos/rotulo-garrafa.webp', ARRAY['festas-infantis','batizado','casamento','empresas'], 10, false, 42, 'cart', NULL, NULL),
  ('Adesivo Redondo', 'Autocolantes redondos personalizados para fechar saquinhos e caixas.', 0.18, 'Papelaria', '/assets/produtos/adesivo-redondo.webp', ARRAY['festas-infantis','batizado','casamento','empresas'], 20, false, 43, 'cart', NULL, NULL)
)
INSERT INTO products (name, description, price, category, image_url, occasions, min_quantity, is_featured, sort_order, sale_mode, price_note, customization_options, is_active)
SELECT n.name, n.description, n.price, n.category, n.image_url, n.occasions, n.min_quantity, n.is_featured, n.sort_order, n.sale_mode, n.price_note,
       COALESCE(n.customization_options,
         jsonb_build_array(jsonb_build_object(
           'label', 'Personalizado com o tema da festa',
           'price', n.price,
           'allows_text', true,
           'allows_image', true))),
       true
FROM novos n
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.name = n.name);
