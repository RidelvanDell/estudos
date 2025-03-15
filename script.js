// Gerenciamento de estado
let estudos = JSON.parse(localStorage.getItem('estudos')) || [];
let cronometroInterval;
let tempoDecorrido = 0;
let cronometroAtivo = false;
let horarioInicio = null;

// Elementos do DOM
const tabelaHistorico = document.getElementById('tabela-historico').getElementsByTagName('tbody')[0];
const totalHoras = document.getElementById('total-horas');
const graficoEvolucao = document.getElementById('grafico-evolucao');

// Elementos do Cronômetro
const horasDisplay = document.getElementById('horas');
const minutosDisplay = document.getElementById('minutos');
const segundosDisplay = document.getElementById('segundos');
const btnIniciar = document.getElementById('iniciar');
const btnPausar = document.getElementById('pausar');
const btnParar = document.getElementById('parar');
const assuntoCronometro = document.getElementById('assunto-cronometro');

// Inicialização do gráfico
let meuGrafico;

function inicializarGrafico() {
    const ctx = graficoEvolucao.getContext('2d');
    meuGrafico = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Inglês',
                    data: [],
                    borderColor: '#60A5FA',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointBackgroundColor: '#60A5FA',
                    pointBorderColor: '#60A5FA',
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#60A5FA',
                    pointHoverBorderColor: '#fff',
                    borderWidth: 3
                },
                {
                    label: 'Psicanálise',
                    data: [],
                    borderColor: '#4ADE80',
                    backgroundColor: 'rgba(74, 222, 128, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointBackgroundColor: '#4ADE80',
                    pointBorderColor: '#4ADE80',
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#4ADE80',
                    pointHoverBorderColor: '#fff',
                    borderWidth: 3
                },
                {
                    label: 'Programação',
                    data: [],
                    borderColor: '#F472B6',
                    backgroundColor: 'rgba(244, 114, 182, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 6,
                    pointBackgroundColor: '#F472B6',
                    pointBorderColor: '#F472B6',
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: '#F472B6',
                    pointHoverBorderColor: '#fff',
                    borderWidth: 3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: '#F8FAFC',
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif",
                            weight: '600'
                        },
                        padding: 20,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#F8FAFC',
                    titleFont: {
                        size: 14,
                        family: "'Inter', sans-serif",
                        weight: '600'
                    },
                    bodyColor: '#CBD5E1',
                    bodyFont: {
                        size: 12,
                        family: "'Inter', sans-serif"
                    },
                    padding: 12,
                    borderColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const minutos = context.parsed.y;
                            if (minutos < 60) {
                                return `${minutos} minutos`;
                            } else {
                                const horas = Math.floor(minutos / 60);
                                const minutosRestantes = minutos % 60;
                                return `${horas}h ${minutosRestantes}min`;
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(139, 92, 246, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#CBD5E1',
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(139, 92, 246, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#CBD5E1',
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif"
                        },
                        stepSize: 15
                    },
                    title: {
                        display: true,
                        text: 'Tempo (minutos)',
                        color: '#F8FAFC',
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif",
                            weight: '600'
                        }
                    }
                }
            }
        }
    });
}

// Funções auxiliares
function formatarData(data) {
    return new Date(data).toLocaleDateString('pt-BR');
}

function formatarTempoEstudo(horas) {
    const horasInteiras = Math.floor(horas);
    const minutos = Math.round((horas - horasInteiras) * 60);
    
    if (horasInteiras === 0) {
        return `${minutos} minutos`;
    } else if (minutos === 0) {
        return `${horasInteiras}h`;
    } else {
        return `${horasInteiras}h ${minutos}min`;
    }
}

function calcularTempoTotalPorAssunto(assunto) {
    return estudos
        .filter(estudo => estudo.assunto === assunto)
        .reduce((total, estudo) => total + parseFloat(estudo.horas), 0);
}

function atualizarEstatisticas() {
    const totalHorasEstudo = estudos.reduce((total, estudo) => total + parseFloat(estudo.horas), 0);
    totalHoras.textContent = formatarTempoEstudo(totalHorasEstudo);
}

function atualizarGrafico() {
    const datasUnicas = [...new Set(estudos.map(estudo => estudo.data))].sort();
    
    const dadosIngles = new Array(datasUnicas.length).fill(0);
    const dadosPsicanalise = new Array(datasUnicas.length).fill(0);
    const dadosProgramacao = new Array(datasUnicas.length).fill(0);

    estudos.forEach(estudo => {
        const index = datasUnicas.indexOf(estudo.data);
        const minutos = estudo.horas * 60;
        
        switch(estudo.assunto) {
            case 'Inglês':
                dadosIngles[index] += minutos;
                break;
            case 'Psicanálise':
                dadosPsicanalise[index] += minutos;
                break;
            case 'Programação':
                dadosProgramacao[index] += minutos;
                break;
        }
    });

    meuGrafico.data.labels = datasUnicas.map(data => formatarData(data));
    meuGrafico.data.datasets[0].data = dadosIngles;
    meuGrafico.data.datasets[1].data = dadosPsicanalise;
    meuGrafico.data.datasets[2].data = dadosProgramacao;
    meuGrafico.update();
}

function atualizarTabela() {
    tabelaHistorico.innerHTML = '';
    
    estudos.sort((a, b) => new Date(b.data) - new Date(a.data)).forEach(estudo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${formatarData(estudo.data)}</td>
            <td>${estudo.assunto}</td>
            <td>${formatarTempoEstudo(estudo.horas)}</td>
        `;
        tabelaHistorico.appendChild(tr);
    });
}

function salvarDados() {
    localStorage.setItem('estudos', JSON.stringify(estudos));
    atualizarEstatisticas();
    atualizarGrafico();
    atualizarTabela();
}

// Funções do Cronômetro
function atualizarDisplay(tempo) {
    const horas = Math.floor(tempo / 3600);
    const minutos = Math.floor((tempo % 3600) / 60);
    const segundos = tempo % 60;

    horasDisplay.textContent = String(horas).padStart(2, '0');
    minutosDisplay.textContent = String(minutos).padStart(2, '0');
    segundosDisplay.textContent = String(segundos).padStart(2, '0');
}

function iniciarCronometro() {
    if (!cronometroAtivo) {
        cronometroAtivo = true;
        horarioInicio = new Date();
        btnIniciar.disabled = true;
        btnPausar.disabled = false;
        btnParar.disabled = false;
        assuntoCronometro.disabled = true;

        cronometroInterval = setInterval(() => {
            tempoDecorrido++;
            atualizarDisplay(tempoDecorrido);
        }, 1000);
    }
}

function pausarCronometro() {
    if (cronometroAtivo) {
        cronometroAtivo = false;
        clearInterval(cronometroInterval);
        btnIniciar.disabled = false;
        btnPausar.disabled = true;
    }
}

function pararCronometro() {
    if (btnParar.disabled) return;

    clearInterval(cronometroInterval);
    const horasEstudadas = tempoDecorrido / 3600;

    const novoEstudo = {
        data: new Date().toISOString().split('T')[0],
        assunto: assuntoCronometro.value,
        horas: Number(horasEstudadas.toFixed(2))
    };

    estudos.push(novoEstudo);
    salvarDados();

    // Resetar cronômetro
    tempoDecorrido = 0;
    cronometroAtivo = false;
    horarioInicio = null;
    atualizarDisplay(0);
    btnIniciar.disabled = false;
    btnPausar.disabled = true;
    btnParar.disabled = true;
    assuntoCronometro.disabled = false;
}

// Event Listeners do Cronômetro
btnIniciar.addEventListener('click', iniciarCronometro);
btnPausar.addEventListener('click', pausarCronometro);
btnParar.addEventListener('click', pararCronometro);

// Inicializar componentes
document.addEventListener('DOMContentLoaded', () => {
    inicializarGrafico();
    atualizarEstatisticas();
    atualizarTabela();
    atualizarGrafico();
}); 