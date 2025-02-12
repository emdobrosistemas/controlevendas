// Funções para interagir com a API
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/gestao/api'
    : '/gestao/api';

// Função para permitir apenas números e vírgula
window.apenasNumeros = function(event) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 44) {
        return false;
    }
    return true;
}

// Função para formatar o valor como moeda
window.formatarMoeda = function(campo) {
    let valor = campo.value.replace(/\D/g, '');
    valor = (valor/100).toFixed(2);
    
    // Adiciona separador de milhares e vírgula decimal
    valor = valor.replace('.', ',');
    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    campo.value = valor;
}

// Função para formatar valor como moeda (para exibição)
function formatarValorMoeda(valor) {
    // Garante que o valor é um número
    valor = typeof valor === 'string' ? parseFloat(valor) : valor;
    
    return valor.toLocaleString('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Função para converter valor formatado para número
function converterParaNumero(valor) {
    if (typeof valor === 'number') return valor;
    // Remove R$, pontos e espaços, e substitui vírgula por ponto
    return parseFloat(valor.replace(/[R$\s.]/g, '').replace(',', '.'));
}

// Função genérica para tratar erros da API
async function handleApiResponse(response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro na requisição' }));
        throw new Error(error.message || `Erro ${response.status}`);
    }
    return response.json();
}

// Exportar funções da API
export async function fetchApi(endpoint, options = {}) {
    try {
        const url = `${API_BASE_URL}${endpoint}`;
        console.log('Fazendo requisição para:', url);

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erro na requisição');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Função de login (temporária para teste)
async function login(email, senha) {
    try {
        // Por enquanto, vamos simular um login bem-sucedido
        console.log('Tentando login com:', { email, senha });
        
        // Simular dados do usuário
        const userData = {
            id: 1,
            email: email,
            nome: 'Usuário Teste'
        };
        
        localStorage.setItem('usuario', JSON.stringify(userData));
        
        // Atualizar UI
        document.getElementById('telaLogin').classList.add('hidden');
        document.getElementById('sistema').classList.remove('hidden');
        
        return userData;
    } catch (error) {
        console.error('Erro no login:', error);
        throw new Error('Erro ao fazer login');
    }
}

// Função para carregar dados (temporária para teste)
async function carregarDados() {
    try {
        // Dados simulados para teste
        const cidades = [
            { id: 1, nome: 'Cidade 1' },
            { id: 2, nome: 'Cidade 2' }
        ];
        
        const lotes = [
            { id: 1, numero: 'Lote 1' },
            { id: 2, numero: 'Lote 2' }
        ];

        const cidadeSelect = document.querySelector('select[name="cidade"]');
        const loteSelect = document.querySelector('select[name="lote"]');

        cidadeSelect.innerHTML = '<option value="">Selecione uma cidade</option>';
        loteSelect.innerHTML = '<option value="">Selecione um lote</option>';

        cidades.forEach(cidade => {
            cidadeSelect.innerHTML += `<option value="${cidade.id}">${cidade.nome}</option>`;
        });

        lotes.forEach(lote => {
            loteSelect.innerHTML += `<option value="${lote.id}">${lote.numero}</option>`;
        });

        console.log('Dados carregados com sucesso');
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        throw error;
    }
}

// Função para formatar data
function formatarData(dataString) {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Carregar dados nas tabelas
async function carregarTabelas() {
    try {
        // Carregar cidades
        const cidades = await fetchApi('/cidades');
        const tabelaCidades = document.getElementById('tabelaCidades');
        tabelaCidades.innerHTML = cidades.map(cidade => `
            <tr class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b">${cidade.id}</td>
                <td class="py-2 px-4 border-b">${cidade.nome}</td>
                <td class="py-2 px-4 border-b">${formatarData(cidade.created_at)}</td>
            </tr>
        `).join('');

        // Carregar lotes
        const lotes = await fetchApi('/lotes');
        const tabelaLotes = document.getElementById('tabelaLotes');
        tabelaLotes.innerHTML = lotes.map(lote => `
            <tr class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b">${lote.id}</td>
                <td class="py-2 px-4 border-b">${lote.numero}</td>
                <td class="py-2 px-4 border-b">${formatarData(lote.created_at)}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Erro ao carregar tabelas:', error);
    }
}

// Cadastrar cidade
async function cadastrarCidade(event) {
    event.preventDefault();
    const nome = document.querySelector('input[name="nome_cidade"]').value;
    
    try {
        const response = await fetchApi('/cidades', {
            method: 'POST',
            body: JSON.stringify({ nome })
        });
        
        if (response.ok) {
            document.querySelector('input[name="nome_cidade"]').value = '';
            await Promise.all([carregarDados(), carregarTabelas()]);
        }
    } catch (error) {
        console.error('Erro ao cadastrar cidade:', error);
    }
}

// Cadastrar lote
async function cadastrarLote(event) {
    event.preventDefault();
    const numero = document.querySelector('input[name="numero_lote"]').value;
    
    try {
        const response = await fetchApi('/lotes', {
            method: 'POST',
            body: JSON.stringify({ numero })
        });
        
        if (response.ok) {
            document.querySelector('input[name="numero_lote"]').value = '';
            await Promise.all([carregarDados(), carregarTabelas()]);
        }
    } catch (error) {
        console.error('Erro ao cadastrar lote:', error);
    }
}

// Adicione esta função de volta ao arquivo
async function cadastrarLancamento(event) {
    event.preventDefault();
    const valorInput = document.querySelector('input[name="valor"]');
    const formData = {
        cidade_id: document.querySelector('select[name="cidade"]').value,
        lote_id: document.querySelector('select[name="lote"]').value,
        data_lancamento: document.querySelector('input[name="data"]').value,
        valor_faturado: converterParaNumero(valorInput.value)
    };
    
    try {
        const response = await fetchApi('/lancamentos', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            event.target.reset();
            valorInput.value = '0,00';
            await Promise.all([carregarRelatorio(), carregarResultados()]);
        }
    } catch (error) {
        console.error('Erro ao cadastrar lançamento:', error);
    }
}

// Função para carregar e exibir o relatório
async function carregarRelatorio() {
    try {
        const response = await fetchApi('/lancamentos');
        const lancamentos = await response;

        // Agrupa lançamentos por cidade
        const lancamentosPorCidade = lancamentos.reduce((acc, lancamento) => {
            if (!acc[lancamento.cidade_nome]) {
                acc[lancamento.cidade_nome] = [];
            }
            acc[lancamento.cidade_nome].push(lancamento);
            return acc;
        }, {});

        // Gera o HTML do relatório com gráficos
        const relatorioHTML = Object.entries(lancamentosPorCidade).map(([cidade, lancamentos]) => {
            // Calcular o total da cidade
            const totalCidade = lancamentos.reduce((sum, lancamento) => 
                sum + parseFloat(lancamento.valor_faturado), 0
            );

            return `
                <div class="bg-gray-50 p-4 lg:p-6 rounded-lg mb-6">
                    <h4 class="text-lg font-semibold mb-3 text-gray-800">${cidade}</h4>
                    
                    <div class="overflow-x-auto -mx-4 lg:mx-0">
                        <div class="inline-block min-w-full align-middle">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr class="bg-gray-100">
                                        <th class="py-2 px-4 text-left">Data</th>
                                        <th class="py-2 px-4 text-left">Lote</th>
                                        <th class="py-2 px-4 text-right">Valor</th>
                                        <th class="py-2 px-4 text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${lancamentos.map(lancamento => `
                                        <tr class="border-b hover:bg-gray-50" id="lancamento-${lancamento.id}">
                                            <td class="py-2 px-4">${formatarData(lancamento.data_lancamento)}</td>
                                            <td class="py-2 px-4">${lancamento.lote_numero}</td>
                                            <td class="py-2 px-4 text-right">
                                                <span class="valor-display">${formatarValorMoeda(lancamento.valor_faturado)}</span>
                                                <div class="valor-edit hidden">
                                                    <input type="text" 
                                                        class="w-full p-1 border rounded text-right" 
                                                        value="${parseFloat(lancamento.valor_faturado).toFixed(2).replace('.', ',')}"
                                                        onkeyup="formatarMoeda(this)"
                                                        onkeypress="return apenasNumeros(event)"
                                                    >
                                                </div>
                                            </td>
                                            <td class="py-2 px-4 text-center">
                                                <button onclick="editarLancamento(${lancamento.id})" 
                                                    class="edit-btn text-blue-600 hover:text-blue-800">
                                                    Editar
                                                </button>
                                                <button onclick="salvarEdicao(${lancamento.id})" 
                                                    class="save-btn hidden text-green-600 hover:text-green-800">
                                                    Salvar
                                                </button>
                                                <button onclick="cancelarEdicao(${lancamento.id})" 
                                                    class="cancel-btn hidden text-red-600 hover:text-red-800">
                                                    Cancelar
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                    <!-- Linha do total -->
                                    <tr class="bg-gray-100 font-semibold">
                                        <td class="py-2 px-4" colspan="2">Total</td>
                                        <td class="py-2 px-4 text-right">${formatarValorMoeda(totalCidade)}</td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Container do gráfico responsivo -->
                    <div class="bg-white border rounded p-4 mt-4" style="height: 300px;">
                        <canvas id="grafico-${cidade.replace(/\s+/g, '-')}"></canvas>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('relatorioLancamentos').innerHTML = relatorioHTML;

        // Criar gráficos para cada cidade
        Object.entries(lancamentosPorCidade).forEach(([cidade, lancamentos]) => {
            const ctx = document.getElementById(`grafico-${cidade.replace(/\s+/g, '-')}`).getContext('2d');
            
            // Ordenar lançamentos por data
            lancamentos.sort((a, b) => new Date(a.data_lancamento) - new Date(b.data_lancamento));

            // Preparar dados para o gráfico
            const dados = {
                labels: lancamentos.map(l => formatarData(l.data_lancamento)),
                datasets: [{
                    label: 'Valor Faturado',
                    data: lancamentos.map(l => parseFloat(l.valor_faturado)),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)', // Azul do Tailwind
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }]
            };

            // Configurações do gráfico
            const config = {
                type: 'bar',
                data: dados,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return formatarValorMoeda(value);
                                },
                                maxRotation: 0,
                                autoSkip: true,
                                autoSkipPadding: 10
                            }
                        },
                        x: {
                            ticks: {
                                maxRotation: 45,
                                minRotation: 45
                            }
                        }
                    }
                }
            };

            // Criar o gráfico
            new Chart(ctx, config);
        });

    } catch (error) {
        console.error('Erro ao carregar relatório:', error);
    }
}

// Funções para edição de lançamento
function editarLancamento(id) {
    const row = document.getElementById(`lancamento-${id}`);
    const valorAtual = row.querySelector('.valor-display').textContent;
    const valorLimpo = valorAtual.replace(/[R$\s.]/g, '').replace(',', '.');
    
    row.querySelector('.valor-display').classList.add('hidden');
    row.querySelector('.valor-edit').classList.remove('hidden');
    row.querySelector('.valor-edit input').value = parseFloat(valorLimpo).toFixed(2).replace('.', ',');
    row.querySelector('.edit-btn').classList.add('hidden');
    row.querySelector('.save-btn').classList.remove('hidden');
    row.querySelector('.cancel-btn').classList.remove('hidden');
}

function cancelarEdicao(id) {
    const row = document.getElementById(`lancamento-${id}`);
    row.querySelector('.valor-display').classList.remove('hidden');
    row.querySelector('.valor-edit').classList.add('hidden');
    row.querySelector('.edit-btn').classList.remove('hidden');
    row.querySelector('.save-btn').classList.add('hidden');
    row.querySelector('.cancel-btn').classList.add('hidden');
}

async function salvarEdicao(id) {
    const row = document.getElementById(`lancamento-${id}`);
    const valorInput = row.querySelector('.valor-edit input');
    const novoValor = converterParaNumero(valorInput.value);
    
    console.log('Tentando salvar edição:', {
        id,
        valorOriginal: valorInput.value,
        valorConvertido: novoValor
    });
    
    try {
        const response = await fetchApi(`/lancamentos/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ 
                valor_faturado: novoValor 
            })
        });
        
        console.log('Resposta do servidor:', {
            status: response.status,
            ok: response.ok
        });

        if (response.ok) {
            // Atualiza todos os relatórios
            await Promise.all([
                carregarRelatorio(),
                carregarResultados(),
                carregarConsolidado()
            ]);
            
            // Esconde os botões de edição
            cancelarEdicao(id);
        } else {
            const errorData = await response;
            console.error('Erro do servidor:', errorData);
            alert('Erro ao salvar: ' + (errorData.error || 'Erro desconhecido'));
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao salvar: ' + (error.message || 'Erro desconhecido'));
    }
}

// Função para calcular o relatório de resultados
async function carregarResultados() {
    try {
        const response = await fetchApi('/lancamentos');
        const lancamentos = await response;

        // Primeiro, agrupa por cidade
        const resultadosPorCidade = {};
        let totalGeral = 0;

        // Agrupa por cidade e depois por lote
        lancamentos.forEach(lancamento => {
            const cidadeNome = lancamento.cidade_nome;
            const loteNumero = lancamento.lote_numero;

            if (!resultadosPorCidade[cidadeNome]) {
                resultadosPorCidade[cidadeNome] = {
                    lotes: {},
                    totalCidade: 0
                };
            }

            if (!resultadosPorCidade[cidadeNome].lotes[loteNumero]) {
                resultadosPorCidade[cidadeNome].lotes[loteNumero] = {
                    total: 0,
                    dias: new Set()
                };
            }

            resultadosPorCidade[cidadeNome].lotes[loteNumero].total += parseFloat(lancamento.valor_faturado);
            resultadosPorCidade[cidadeNome].lotes[loteNumero].dias.add(lancamento.data_lancamento);
            resultadosPorCidade[cidadeNome].totalCidade += parseFloat(lancamento.valor_faturado);
            totalGeral += parseFloat(lancamento.valor_faturado);
        });

        // Gera o HTML do relatório
        const relatorioHTML = Object.entries(resultadosPorCidade).map(([cidade, dados]) => `
            <div class="bg-white border rounded p-4 mb-8">
                <h3 class="text-xl font-bold mb-4">${cidade}</h3>
                <div class="overflow-x-auto">
                    <table class="min-w-full bg-white border">
                        <thead>
                            <tr class="bg-gray-100">
                                <th class="py-2 px-4 border text-left">Lote</th>
                                <th class="py-2 px-4 border text-right">Faturamento</th>
                                <th class="py-2 px-4 border text-right">% sobre o total</th>
                                <th class="py-2 px-4 border text-right">Média diária</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.entries(dados.lotes).map(([lote, loteData]) => {
                                const percentual = (loteData.total / dados.totalCidade * 100).toFixed(2);
                                const mediaDiaria = loteData.total / loteData.dias.size;
                                return `
                                    <tr class="border-b">
                                        <td class="py-2 px-4 border">${lote}</td>
                                        <td class="py-2 px-4 border text-right">${formatarValorMoeda(loteData.total)}</td>
                                        <td class="py-2 px-4 border text-right">${percentual}%</td>
                                        <td class="py-2 px-4 border text-right">${formatarValorMoeda(mediaDiaria)}</td>
                                    </tr>
                                `;
                            }).join('')}
                            <tr class="bg-gray-100 font-bold">
                                <td class="py-2 px-4 border">Total da Cidade</td>
                                <td class="py-2 px-4 border text-right">${formatarValorMoeda(dados.totalCidade)}</td>
                                <td class="py-2 px-4 border text-right">100,00%</td>
                                <td class="py-2 px-4 border text-right">-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `).join('');

        // Adiciona o total geral no final
        const totalGeralHTML = `
            <div class="bg-white border rounded p-4 mt-8">
                <div class="text-xl font-bold text-right">
                    Total Geral: ${formatarValorMoeda(totalGeral)}
                </div>
            </div>
        `;

        document.getElementById('resultadoContainer').innerHTML = relatorioHTML + totalGeralHTML;

    } catch (error) {
        console.error('Erro ao carregar resultados:', error);
    }
}

// Função para carregar o relatório consolidado
async function carregarConsolidado() {
    try {
        const [lancamentosResponse, lotesResponse] = await Promise.all([
            fetchApi('/lancamentos'),
            fetchApi('/lotes')
        ]);
        
        const lancamentos = await lancamentosResponse;
        const lotes = await lotesResponse;

        // Define a ordem específica dos lotes
        const ordemLotes = ['Pré-venda', 'Primeiro Lote', 'Segundo Lote', 'Terceiro Lote'];
        
        // Filtra e ordena os lotes conforme a ordem definida
        const lotesOrdenados = ordemLotes.filter(loteNome => 
            lotes.some(l => l.numero === loteNome)
        );

        const cidades = new Set(lancamentos.map(l => l.cidade_nome));

        // Criar matriz de dados
        const dadosConsolidados = {};
        let totaisLote = {};
        lotesOrdenados.forEach(lote => {
            totaisLote[lote] = 0;
            dadosConsolidados[lote] = {};
            cidades.forEach(cidade => {
                dadosConsolidados[lote][cidade] = 0;
            });
        });

        // Preencher dados
        lancamentos.forEach(lancamento => {
            const loteNumero = lancamento.lote_numero;
            const cidade = lancamento.cidade_nome;
            if (dadosConsolidados[loteNumero]) {
                dadosConsolidados[loteNumero][cidade] = (dadosConsolidados[loteNumero][cidade] || 0) + parseFloat(lancamento.valor_faturado);
            }
        });

        // Calcular totais
        let totaisCidade = {};
        cidades.forEach(cidade => {
            totaisCidade[cidade] = 0;
            lotesOrdenados.forEach(lote => {
                totaisCidade[cidade] += dadosConsolidados[lote][cidade] || 0;
                totaisLote[lote] += dadosConsolidados[lote][cidade] || 0;
            });
        });

        // Calcular total geral
        const totalGeral = Object.values(totaisLote).reduce((a, b) => a + b, 0);

        // Gerar HTML da tabela
        const tabelaHTML = `
            <thead>
                <tr class="bg-gray-100">
                    <th class="py-2 px-4 border text-left">LOTE</th>
                    ${Array.from(cidades).map(cidade => 
                        `<th class="py-2 px-4 border text-right">${cidade.toUpperCase()}</th>`
                    ).join('')}
                    <th class="py-2 px-4 border text-right">TOTAL</th>
                    <th class="py-2 px-4 border text-right">%</th>
                </tr>
            </thead>
            <tbody>
                ${lotesOrdenados.map(lote => `
                    <tr class="border-b">
                        <td class="py-2 px-4 border font-medium">${lote}</td>
                        ${Array.from(cidades).map(cidade => `
                            <td class="py-2 px-4 border text-right">
                                ${formatarValorMoeda(dadosConsolidados[lote][cidade] || 0)}
                            </td>
                        `).join('')}
                        <td class="py-2 px-4 border text-right font-medium">
                            ${formatarValorMoeda(totaisLote[lote])}
                        </td>
                        <td class="py-2 px-4 border text-right">
                            ${((totaisLote[lote] / totalGeral) * 100).toFixed(2)}%
                        </td>
                    </tr>
                `).join('')}
                <tr class="bg-gray-100 font-bold">
                    <td class="py-2 px-4 border">TOTAL</td>
                    ${Array.from(cidades).map(cidade => `
                        <td class="py-2 px-4 border text-right">
                            ${formatarValorMoeda(totaisCidade[cidade])}
                        </td>
                    `).join('')}
                    <td class="py-2 px-4 border text-right">${formatarValorMoeda(totalGeral)}</td>
                    <td class="py-2 px-4 border text-right">100,00%</td>
                </tr>
            </tbody>
        `;

        document.getElementById('tabelaConsolidado').innerHTML = tabelaHTML;

        // Limpar gráficos existentes
        const telaConsolidado = document.getElementById('telaConsolidado');
        const graficosExistentes = telaConsolidado.querySelectorAll('.grafico-container');
        graficosExistentes.forEach(grafico => grafico.remove());

        // Adicione o container do gráfico após a tabela
        const containerGrafico = `
            <div class="grafico-container mt-8 bg-white border rounded p-4" style="height: 400px;">
                <canvas id="graficoConsolidado"></canvas>
            </div>
        `;
        
        telaConsolidado.insertAdjacentHTML('beforeend', containerGrafico);

        // Criar o gráfico de barras
        const ctx = document.getElementById('graficoConsolidado').getContext('2d');
        
        // Preparar dados para o gráfico
        const dadosGrafico = {
            labels: Array.from(cidades),
            datasets: [{
                label: 'Total por Cidade',
                data: Array.from(cidades).map(cidade => totaisCidade[cidade]),
                backgroundColor: 'rgba(59, 130, 246, 0.5)', // Azul do Tailwind
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1
            }]
        };

        // Configurações do gráfico
        const configGrafico = {
            type: 'bar',
            data: dadosGrafico,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Faturamento por Cidade',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatarValorMoeda(value);
                            }
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                weight: 'bold'
                            }
                        }
                    }
                }
            }
        };

        // Criar o gráfico
        new Chart(ctx, configGrafico);

        // Remova o array de cores alternadas e use sempre azul para as barras
        const corBarra = {
            bg: 'rgba(59, 130, 246, 0.5)',  // Azul do Tailwind
            border: 'rgb(59, 130, 246)'
        };

        // Adicionar container para os gráficos por lote
        const containerGraficosLote = `
            <div class="grafico-container mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                ${lotesOrdenados.map(lote => `
                    <div class="bg-gray-50 border rounded p-4" style="height: 300px;">
                        <canvas id="grafico-lote-${lote.replace(/\s+/g, '-')}"></canvas>
                    </div>
                `).join('')}
            </div>
        `;

        telaConsolidado.insertAdjacentHTML('beforeend', containerGraficosLote);

        // Criar gráficos para cada lote
        lotesOrdenados.forEach(lote => {
            const ctxLote = document.getElementById(`grafico-lote-${lote.replace(/\s+/g, '-')}`).getContext('2d');
            
            // Preparar dados para o gráfico do lote
            const dadosGraficoLote = {
                labels: Array.from(cidades),
                datasets: [{
                    label: lote,
                    data: Array.from(cidades).map(cidade => dadosConsolidados[lote][cidade] || 0),
                    backgroundColor: corBarra.bg,
                    borderColor: corBarra.border,
                    borderWidth: 1
                }]
            };

            // Configurações do gráfico do lote
            const configGraficoLote = {
                type: 'bar',
                data: dadosGraficoLote,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: lote,
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return formatarValorMoeda(value);
                                }
                            }
                        },
                        x: {
                            ticks: {
                                font: {
                                    weight: 'bold'
                                }
                            }
                        }
                    }
                }
            };

            // Criar o gráfico do lote
            new Chart(ctxLote, configGraficoLote);
        });

    } catch (error) {
        console.error('Erro ao carregar consolidado:', error);
    }
}

// Função de logout
async function fazerLogout() {
    try {
        localStorage.removeItem('usuario');
        document.getElementById('sistema')?.classList.add('hidden');
        document.getElementById('telaLogin')?.classList.remove('hidden');
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
}

// Função para inicializar os event listeners
function initializeEventListeners() {
    // Links do menu
    document.getElementById('lancamentoLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('telaLancamento').classList.remove('hidden');
        document.getElementById('telaResultado').classList.add('hidden');
        document.getElementById('telaConsolidado').classList.add('hidden');
        document.getElementById('telaConfig').classList.add('hidden');
        carregarRelatorio();
    });

    document.getElementById('resultadoLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('telaLancamento').classList.add('hidden');
        document.getElementById('telaResultado').classList.remove('hidden');
        document.getElementById('telaConsolidado').classList.add('hidden');
        document.getElementById('telaConfig').classList.add('hidden');
        carregarResultados();
    });

    document.getElementById('consolidadoLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('telaLancamento').classList.add('hidden');
        document.getElementById('telaResultado').classList.add('hidden');
        document.getElementById('telaConsolidado').classList.remove('hidden');
        document.getElementById('telaConfig').classList.add('hidden');
        carregarConsolidado();
    });

    document.getElementById('configLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('telaLancamento').classList.add('hidden');
        document.getElementById('telaResultado').classList.add('hidden');
        document.getElementById('telaConsolidado').classList.add('hidden');
        document.getElementById('telaConfig').classList.remove('hidden');
        carregarTabelas();
    });

    // Event listener para login
    const menuElements = {
        formLogin: document.getElementById('formLogin'),
        logoutBtn: document.getElementById('logoutBtn'),
        formCidade: document.querySelector('#formCidade'),
        formLote: document.querySelector('#formLote'),
        formLancamento: document.querySelector('#formLancamento')
    };

    // Event listener para login
    if (menuElements.formLogin) {
        menuElements.formLogin.addEventListener('submit', async function(event) {
            event.preventDefault();
            try {
                const email = event.target.email.value;
                const senha = event.target.senha.value;
                await login(email, senha);
            } catch (error) {
                console.error('Erro no login:', error);
                alert(error.message);
            }
        });
    }

    // Event listener para logout
    if (menuElements.logoutBtn) {
        menuElements.logoutBtn.addEventListener('click', fazerLogout);
    }

    // Event listeners para formulários
    if (menuElements.formCidade) {
        menuElements.formCidade.addEventListener('submit', cadastrarCidade);
    }
    if (menuElements.formLote) {
        menuElements.formLote.addEventListener('submit', cadastrarLote);
    }
    if (menuElements.formLancamento) {
        menuElements.formLancamento.addEventListener('submit', cadastrarLancamento);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    
    // Verificar se o usuário está logado
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
        document.getElementById('telaLogin')?.classList.add('hidden');
        document.getElementById('sistema')?.classList.remove('hidden');
        Promise.all([
            carregarDados(),
            carregarTabelas(),
            carregarRelatorio(),
            carregarResultados(),
            carregarConsolidado()
        ]).catch(console.error);
    }
});

// Exportar funções necessárias
export {
    login,
    fazerLogout,
    carregarDados,
    carregarTabelas,
    carregarRelatorio,
    carregarResultados,
    carregarConsolidado
}; 