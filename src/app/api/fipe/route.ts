import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';

// Cache em memória para não sobrecarregar a API pública
let cachedBrands: { codigo: string; nome: string }[] | null = null;
let lastBrandsFetch = 0;

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'brands';
    const brandId = searchParams.get('brandId');
    const modelId = searchParams.get('modelId');
    const yearId = searchParams.get('yearId');

    // 1. Listar Marcas de Motos
    if (action === 'brands') {
      const now = Date.now();
      if (cachedBrands && now - lastBrandsFetch < 1000 * 60 * 60) {
        return NextResponse.json(cachedBrands);
      }

      const res = await fetch('https://parallelum.com.br/fipe/api/v1/motos/marcas', {
        headers: { 'User-Agent': 'MotoFlow-ERP/1.0' },
      });

      if (!res.ok) {
        return NextResponse.json({ error: 'Erro ao consultar marcas na FIPE' }, { status: 502 });
      }

      const brands = await res.json();
      cachedBrands = brands;
      lastBrandsFetch = now;
      return NextResponse.json(brands);
    }

    // 2. Listar Modelos de uma Marca
    if (action === 'models') {
      if (!brandId) {
        return NextResponse.json({ error: 'brandId obrigatório' }, { status: 400 });
      }

      const res = await fetch(`https://parallelum.com.br/fipe/api/v1/motos/marcas/${brandId}/modelos`, {
        headers: { 'User-Agent': 'MotoFlow-ERP/1.0' },
      });

      if (!res.ok) {
        return NextResponse.json({ error: 'Erro ao consultar modelos na FIPE' }, { status: 502 });
      }

      const data = await res.json();
      return NextResponse.json(data.modelos || []);
    }

    // 3. Listar Anos de um Modelo
    if (action === 'years') {
      if (!brandId || !modelId) {
        return NextResponse.json({ error: 'brandId e modelId obrigatórios' }, { status: 400 });
      }

      const res = await fetch(
        `https://parallelum.com.br/fipe/api/v1/motos/marcas/${brandId}/modelos/${modelId}/anos`,
        { headers: { 'User-Agent': 'MotoFlow-ERP/1.0' } }
      );

      if (!res.ok) {
        return NextResponse.json({ error: 'Erro ao consultar anos na FIPE' }, { status: 502 });
      }

      const years = await res.json();
      return NextResponse.json(years);
    }

    // 4. Obter Preço e Dados Finais FIPE
    if (action === 'price') {
      if (!brandId || !modelId || !yearId) {
        return NextResponse.json({ error: 'brandId, modelId e yearId obrigatórios' }, { status: 400 });
      }

      const res = await fetch(
        `https://parallelum.com.br/fipe/api/v1/motos/marcas/${brandId}/modelos/${modelId}/anos/${yearId}`,
        { headers: { 'User-Agent': 'MotoFlow-ERP/1.0' } }
      );

      if (!res.ok) {
        return NextResponse.json({ error: 'Erro ao obter preço FIPE' }, { status: 502 });
      }

      const data = await res.json();
      // Extrai número do valor (ex: "R$ 44.658,00" -> 44658)
      const cleanValue = typeof data.Valor === 'string'
        ? Number(data.Valor.replace(/[^\d,]/g, '').replace(',', '.'))
        : 0;

      return NextResponse.json({
        ...data,
        numericValue: cleanValue,
      });
    }

    // 5. Busca Inteligente por Nome da Marca e Modelo (Quick Lookup)
    if (action === 'search') {
      const brandName = (searchParams.get('brand') || '').toLowerCase().trim();
      const modelName = (searchParams.get('model') || '').toLowerCase().trim();
      const year = searchParams.get('year') || '';

      if (!brandName) {
        return NextResponse.json({ error: 'Parâmetro brand obrigatório' }, { status: 400 });
      }

      // Buscar marcas
      let brands = cachedBrands;
      if (!brands) {
        const resBrands = await fetch('https://parallelum.com.br/fipe/api/v1/motos/marcas');
        if (resBrands.ok) {
          brands = await resBrands.json();
          cachedBrands = brands;
        }
      }

      const foundBrand = brands?.find((b) =>
        b.nome.toLowerCase().includes(brandName) || brandName.includes(b.nome.toLowerCase())
      );

      if (!foundBrand) {
        return NextResponse.json({ error: `Marca ${brandName} não encontrada na FIPE` }, { status: 404 });
      }

      // Buscar modelos
      const resModels = await fetch(`https://parallelum.com.br/fipe/api/v1/motos/marcas/${foundBrand.codigo}/modelos`);
      if (!resModels.ok) {
        return NextResponse.json({ error: 'Erro ao buscar modelos da marca' }, { status: 502 });
      }

      const modelsData = await resModels.json();
      const modelsList: { codigo: string; nome: string }[] = modelsData.modelos || [];

      // Filtrar modelos compatíveis
      const matchingModels = modelName
        ? modelsList.filter((m) => {
            const cleanM = m.nome.toLowerCase();
            return cleanM.includes(modelName) || modelName.split(' ').some((word) => word.length > 2 && cleanM.includes(word));
          })
        : modelsList.slice(0, 20);

      return NextResponse.json({
        brand: foundBrand,
        matches: matchingModels.slice(0, 15),
      });
    }

    return NextResponse.json({ error: 'Ação não reconhecida' }, { status: 400 });
  } catch (error: any) {
    console.error('Erro na rota FIPE:', error);
    return NextResponse.json({ error: error.message || 'Erro interno na rota FIPE' }, { status: 500 });
  }
}
