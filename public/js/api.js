// Adicione no início do arquivo
const SESSION_TIMEOUT = 3600000; // 1 hora em milissegundos
const ITEMS_PER_PAGE = 10;
let currentPage = 1;

// Função para mostrar notificações
function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Força um reflow para a animação funcionar
    notification.offsetHeight;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            container.removeChild(notification);
        }, 300);
    }, 3000);
}

// Função para verificar timeout da sessão
function checkSessionTimeout() {
    const lastActivity = localStorage.getItem('lastActivity');
    if (lastActivity && Date.now() - parseInt(lastActivity) > SESSION_TIMEOUT) {
        showNotification('Sua sessão expirou. Por favor, faça login novamente.', 'warning');
        fazerLogout();
        return false;
    }
    localStorage.setItem('lastActivity', Date.now().toString());
    return true;
}

// Funções para interagir com a API
const API_URL = 'http://localhost:3000/api';

// Função para permitir apenas números e vírgula
function apenasNumeros(event) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57) && charCode !== 44) {
        return false;
    }
    return true;
}

// Função para formatar o valor como moeda
function formatarMoeda(campo) {
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

// Carregar cidades e lotes nos selects
async function carregarDados() {
    try {
        const [cidades, lotes] = await Promise.all([
            fetch(`${API_URL}/cidades`).then(res => res.json()),
            fetch(`${API_URL}/lotes`).then(res => res.json())
        ]);

        const cidadeSelect = document.querySelector('select[name="cidade"]');
        const loteSelect = document.querySelector('select[name="lote"]');

        cidades.forEach(cidade => {
            cidadeSelect.innerHTML += `<option value="${cidade.id}">${cidade.nome}</option>`;
        });

        lotes.forEach(lote => {
            loteSelect.innerHTML += `<option value="${lote.id}">${lote.numero}</option>`;
        });
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
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
        const cidades = await fetch(`${API_URL}/cidades`).then(res => res.json());
        const tabelaCidades = document.getElementById('tabelaCidades');
        tabelaCidades.innerHTML = cidades.map(cidade => `
            <tr class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b">${cidade.id}</td>
                <td class="py-2 px-4 border-b">${cidade.nome}</td>
                <td class="py-2 px-4 border-b">${formatarData(cidade.created_at)}</td>
            </tr>
        `).join('');

        // Carregar lotes
        const lotes = await fetch(`${API_URL}/lotes`).then(res => res.json());
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
        const response = await fetch(`${API_URL}/cidades`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
        const response = await fetch(`${API_URL}/lotes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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
        const response = await fetch(`${API_URL}/lancamentos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
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

// Função para gerenciar a paginação
function setupPagination(data, container, renderFunction) {
    // Crie uma variável local para a página atual
    let localCurrentPage = 1;
    
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const paginationContainer = container.querySelector('.pagination-controls');
    const pageNumbers = paginationContainer.querySelector('.page-numbers');
    const btnPrev = paginationContainer.querySelector('.btn-prev');
    const btnNext = paginationContainer.querySelector('.btn-next');
    const pageStart = paginationContainer.querySelector('.page-start');
    const pageEnd = paginationContainer.querySelector('.page-end');
    const totalItems = paginationContainer.querySelector('.total-items');

    // Função para atualizar a exibição
    function updateDisplay() {
        const start = (localCurrentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const paginatedData = data.slice(start, end);
        
        // Calcula o total de todos os lançamentos
        const total = data.reduce((sum, item) => sum + parseFloat(item.valor_faturado), 0);
        
        // Atualiza os números das páginas
        pageNumbers.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const button = document.createElement('button');
            button.className = `relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                i === localCurrentPage 
                    ? 'bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600' 
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
            }`;
            button.textContent = i;
            button.addEventListener('click', () => {
                localCurrentPage = i;
                updateDisplay();
            });
            pageNumbers.appendChild(button);
        }

        // Atualiza os botões de navegação
        btnPrev.disabled = localCurrentPage === 1;
        btnNext.disabled = localCurrentPage === totalPages;
        btnPrev.classList.toggle('opacity-50', localCurrentPage === 1);
        btnNext.classList.toggle('opacity-50', localCurrentPage === totalPages);

        // Atualiza o texto de status
        const displayStart = (localCurrentPage - 1) * ITEMS_PER_PAGE + 1;
        const displayEnd = Math.min(localCurrentPage * ITEMS_PER_PAGE, data.length);
        pageStart.textContent = displayStart;
        pageEnd.textContent = displayEnd;
        totalItems.textContent = data.length;

        // Renderiza os dados e adiciona a linha de total
        renderFunction(paginatedData, total);
    }

    // Adiciona event listeners para os botões
    btnPrev.addEventListener('click', () => {
        if (localCurrentPage > 1) {
            localCurrentPage--;
            updateDisplay();
        }
    });

    btnNext.addEventListener('click', () => {
        if (localCurrentPage < totalPages) {
            localCurrentPage++;
            updateDisplay();
        }
    });

    // Exibe a primeira página
    updateDisplay();
}

// Função para carregar e exibir o relatório
async function carregarRelatorio() {
    try {
        const response = await fetch(`${API_URL}/lancamentos`);
        const lancamentos = await response.json();

        // Agrupa lançamentos por cidade
        const lancamentosPorCidade = {};
        lancamentos.forEach(lancamento => {
            if (!lancamentosPorCidade[lancamento.cidade_nome]) {
                lancamentosPorCidade[lancamento.cidade_nome] = [];
            }
            lancamentosPorCidade[lancamento.cidade_nome].push(lancamento);
        });

        const relatorioContainer = document.getElementById('relatorioLancamentos');
        relatorioContainer.innerHTML = ''; // Limpa o conteúdo anterior

        // Para cada cidade, cria uma tabela com paginação e gráfico
        Object.entries(lancamentosPorCidade).forEach(([cidade, lancamentosCidade]) => {
            const cidadeContainer = document.createElement('div');
            cidadeContainer.className = 'bg-gray-50 p-4 lg:p-6 rounded-lg mb-6';
            
            // Adiciona o HTML da cidade com a tabela e controles de paginação
            cidadeContainer.innerHTML = `
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
                            <tbody></tbody>
                        </table>
                    </div>
                </div>

                <!-- Controles de paginação -->
                <div class="pagination-controls flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                    <div class="flex flex-1 justify-between sm:hidden">
                        <button class="btn-prev relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            Anterior
                        </button>
                        <button class="btn-next relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            Próxima
                        </button>
                    </div>
                    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p class="text-sm text-gray-700">
                                Mostrando <span class="font-medium page-start">1</span> até <span class="font-medium page-end">10</span> de
                                <span class="font-medium total-items">${lancamentosCidade.length}</span> resultados
                            </p>
                        </div>
                        <div>
                            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <button class="btn-prev relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                                    <span class="sr-only">Anterior</span>
                                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                                <div class="page-numbers flex"></div>
                                <button class="btn-next relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                                    <span class="sr-only">Próxima</span>
                                    <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>

                <!-- Container do gráfico -->
                <div class="bg-white border rounded p-4 mt-4" style="height: 300px;">
                    <canvas id="grafico-${cidade.replace(/\s+/g, '-')}"></canvas>
                </div>
            `;

            // Adiciona o container ao DOM
            relatorioContainer.appendChild(cidadeContainer);

            // Configura a paginação
            setupPagination(lancamentosCidade, cidadeContainer, (dados, total) => {
                const tbody = cidadeContainer.querySelector('tbody');
                tbody.innerHTML = dados.map(lancamento => `
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
                `).join('') + `
                    <!-- Linha do total -->
                    <tr class="bg-gray-100 font-semibold">
                        <td class="py-2 px-4" colspan="2">Total</td>
                        <td class="py-2 px-4 text-right">${formatarValorMoeda(total)}</td>
                        <td></td>
                    </tr>
                `;
            });

            // Criar gráfico para a cidade
            const ctx = document.getElementById(`grafico-${cidade.replace(/\s+/g, '-')}`).getContext('2d');
            
            // Ordenar lançamentos por data
            const lancamentosOrdenados = [...lancamentosCidade].sort((a, b) => 
                new Date(a.data_lancamento) - new Date(b.data_lancamento)
            );

            // Preparar dados para o gráfico
            const dados = {
                labels: lancamentosOrdenados.map(l => formatarData(l.data_lancamento)),
                datasets: [{
                    label: 'Valor Faturado',
                    data: lancamentosOrdenados.map(l => parseFloat(l.valor_faturado)),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)', // Azul do Tailwind
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1
                }]
            };

            // Configurações do gráfico
            const configGrafico = {
                type: 'bar',
                data: dados,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: `Faturamento - ${cidade}`,
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
        });

    } catch (error) {
        console.error('Erro ao carregar relatório:', error);
        showNotification('Erro ao carregar relatório', 'error');
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
        const response = await fetch(`${API_URL}/lancamentos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
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
            const errorData = await response.json();
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
        const response = await fetch(`${API_URL}/lancamentos`);
        const lancamentos = await response.json();

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
            fetch(`${API_URL}/lancamentos`),
            fetch(`${API_URL}/lotes`)
        ]);
        
        const lancamentos = await lancamentosResponse.json();
        const lotes = await lotesResponse.json();

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

// Adicione os event listeners para o menu mobile
document.getElementById('lancamentoLinkMobile').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('telaLancamento').classList.remove('hidden');
    document.getElementById('telaConfig').classList.add('hidden');
    document.getElementById('telaResultado').classList.add('hidden');
    document.getElementById('telaConsolidado').classList.add('hidden');
    carregarRelatorio();
});

document.getElementById('resultadoLinkMobile').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('telaLancamento').classList.add('hidden');
    document.getElementById('telaConfig').classList.add('hidden');
    document.getElementById('telaResultado').classList.remove('hidden');
    document.getElementById('telaConsolidado').classList.add('hidden');
    carregarResultados();
});

document.getElementById('consolidadoLinkMobile').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('telaLancamento').classList.add('hidden');
    document.getElementById('telaConfig').classList.add('hidden');
    document.getElementById('telaResultado').classList.add('hidden');
    document.getElementById('telaConsolidado').classList.remove('hidden');
    carregarConsolidado();
});

document.getElementById('configLinkMobile').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('telaLancamento').classList.add('hidden');
    document.getElementById('telaConfig').classList.remove('hidden');
    document.getElementById('telaResultado').classList.add('hidden');
    document.getElementById('telaConsolidado').classList.add('hidden');
    carregarTabelas();
});

// Atualize os outros event listeners para incluir a nova tela
document.getElementById('lancamentoLink').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('telaLancamento').classList.remove('hidden');
    document.getElementById('telaConfig').classList.add('hidden');
    document.getElementById('telaResultado').classList.add('hidden');
    document.getElementById('telaConsolidado').classList.add('hidden');
    carregarRelatorio();
});

document.getElementById('resultadoLink').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('telaLancamento').classList.add('hidden');
    document.getElementById('telaConfig').classList.add('hidden');
    document.getElementById('telaResultado').classList.remove('hidden');
    document.getElementById('telaConsolidado').classList.add('hidden');
    carregarResultados();
});

document.getElementById('configLink').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('telaLancamento').classList.add('hidden');
    document.getElementById('telaConfig').classList.remove('hidden');
    document.getElementById('telaResultado').classList.add('hidden');
    document.getElementById('telaConsolidado').classList.add('hidden');
    carregarTabelas();
});

// Adicione o event listener para o consolidado
document.getElementById('consolidadoLink').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('telaLancamento').classList.add('hidden');
    document.getElementById('telaConfig').classList.add('hidden');
    document.getElementById('telaResultado').classList.add('hidden');
    document.getElementById('telaConsolidado').classList.remove('hidden');
    carregarConsolidado();
});

// Atualize o carregamento inicial
document.addEventListener('DOMContentLoaded', () => {
    // Verifica autenticação
    const usuario = localStorage.getItem('usuario');
    
    if (usuario) {
        document.getElementById('telaLogin').classList.add('hidden');
        document.getElementById('sistema').classList.remove('hidden');
        
        // Carrega dados iniciais
        Promise.all([
            carregarDados(),
            carregarTabelas(),
            carregarRelatorio(),
            carregarResultados(),
            carregarConsolidado()
        ]);
    }

    // Event Listeners do Menu Desktop
    document.getElementById('lancamentoLink').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('telaLancamento').classList.remove('hidden');
        document.getElementById('telaConfig').classList.add('hidden');
        document.getElementById('telaResultado').classList.add('hidden');
        document.getElementById('telaConsolidado').classList.add('hidden');
        carregarRelatorio();
    });

    document.getElementById('resultadoLink').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('telaLancamento').classList.add('hidden');
        document.getElementById('telaConfig').classList.add('hidden');
        document.getElementById('telaResultado').classList.remove('hidden');
        document.getElementById('telaConsolidado').classList.add('hidden');
        carregarResultados();
    });

    document.getElementById('consolidadoLink').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('telaLancamento').classList.add('hidden');
        document.getElementById('telaConfig').classList.add('hidden');
        document.getElementById('telaResultado').classList.add('hidden');
        document.getElementById('telaConsolidado').classList.remove('hidden');
        carregarConsolidado();
    });

    document.getElementById('configLink').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('telaLancamento').classList.add('hidden');
        document.getElementById('telaConfig').classList.remove('hidden');
        document.getElementById('telaResultado').classList.add('hidden');
        document.getElementById('telaConsolidado').classList.add('hidden');
        carregarTabelas();
    });

    // Event Listeners do Menu Mobile
    document.getElementById('lancamentoLinkMobile').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('telaLancamento').classList.remove('hidden');
        document.getElementById('telaConfig').classList.add('hidden');
        document.getElementById('telaResultado').classList.add('hidden');
        document.getElementById('telaConsolidado').classList.add('hidden');
        carregarRelatorio();
    });

    document.getElementById('resultadoLinkMobile').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('telaLancamento').classList.add('hidden');
        document.getElementById('telaConfig').classList.add('hidden');
        document.getElementById('telaResultado').classList.remove('hidden');
        document.getElementById('telaConsolidado').classList.add('hidden');
        carregarResultados();
    });

    document.getElementById('consolidadoLinkMobile').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('telaLancamento').classList.add('hidden');
        document.getElementById('telaConfig').classList.add('hidden');
        document.getElementById('telaResultado').classList.add('hidden');
        document.getElementById('telaConsolidado').classList.remove('hidden');
        carregarConsolidado();
    });

    document.getElementById('configLinkMobile').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('telaLancamento').classList.add('hidden');
        document.getElementById('telaConfig').classList.remove('hidden');
        document.getElementById('telaResultado').classList.add('hidden');
        document.getElementById('telaConsolidado').classList.add('hidden');
        carregarTabelas();
    });

    // Event Listeners dos Formulários
    document.getElementById('formLogin').addEventListener('submit', fazerLogin);
    document.getElementById('formCidade').addEventListener('submit', cadastrarCidade);
    document.getElementById('formLote').addEventListener('submit', cadastrarLote);
    document.getElementById('formLancamento').addEventListener('submit', cadastrarLancamento);
    document.getElementById('logoutBtn').addEventListener('click', fazerLogout);

    // Event Listener do Menu Mobile Toggle
    document.getElementById('menuButton').addEventListener('click', function() {
        document.getElementById('mobileMenu').classList.toggle('hidden');
    });

    // Fecha o menu ao clicar em um link
    document.querySelectorAll('#mobileMenu a').forEach(link => {
        link.addEventListener('click', function() {
            document.getElementById('mobileMenu').classList.add('hidden');
        });
    });

    // Adicionar validações nos formulários
    document.getElementById('formCidade').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = e.target.nome_cidade.value.trim();
        
        if (!nome) {
            showNotification('Por favor, insira o nome da cidade.', 'error');
            return;
        }

        try {
            await cadastrarCidade(e);
            showNotification('Cidade cadastrada com sucesso!');
            e.target.reset();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    document.getElementById('formLote').addEventListener('submit', async (e) => {
        e.preventDefault();
        const numero = e.target.numero_lote.value.trim();
        
        if (!numero) {
            showNotification('Por favor, insira o número do lote.', 'error');
            return;
        }

        try {
            await cadastrarLote(e);
            showNotification('Lote cadastrado com sucesso!');
            e.target.reset();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    document.getElementById('formLancamento').addEventListener('submit', async (e) => {
        e.preventDefault();
        const cidade = e.target.cidade.value;
        const lote = e.target.lote.value;
        const data = e.target.data.value;
        const valor = e.target.valor.value;

        if (!cidade || !lote || !data || !valor) {
            showNotification('Por favor, preencha todos os campos.', 'error');
            return;
        }

        try {
            await cadastrarLancamento(e);
            showNotification('Lançamento cadastrado com sucesso!');
            e.target.reset();
            e.target.valor.value = '0,00';
        } catch (error) {
            showNotification(error.message, 'error');
        }
    });

    // Verificar sessão a cada minuto
    setInterval(checkSessionTimeout, 60000);
});

// Funções de autenticação
async function fazerLogin(event) {
    event.preventDefault();
    const email = document.querySelector('input[name="email"]').value;
    const senha = document.querySelector('input[name="senha"]').value;

    // Validação básica
    if (!email || !senha) {
        showNotification('Por favor, preencha todos os campos.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/usuarios/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, senha })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao fazer login');
        }

        const userData = await response.json();
        localStorage.setItem('usuario', JSON.stringify(userData));
        localStorage.setItem('lastActivity', Date.now().toString());
        
        document.getElementById('telaLogin').classList.add('hidden');
        document.getElementById('sistema').classList.remove('hidden');
        
        showNotification(`Bem-vindo, ${userData.nome}!`);
        
        await Promise.all([
            carregarDados(),
            carregarTabelas(),
            carregarRelatorio(),
            carregarResultados(),
            carregarConsolidado()
        ]);

    } catch (error) {
        showNotification(error.message, 'error');
    }
}

function fazerLogout() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('lastActivity');
    
    document.getElementById('telaLogin').classList.remove('hidden');
    document.getElementById('sistema').classList.add('hidden');
    document.getElementById('formLogin').reset();
    
    showNotification('Você saiu do sistema com sucesso.');
}

// Adicionar verificação de sessão em todas as requisições
const originalFetch = window.fetch;
window.fetch = function(...args) {
    if (!checkSessionTimeout()) {
        return Promise.reject(new Error('Sessão expirada'));
    }
    return originalFetch.apply(this, args);
}; 