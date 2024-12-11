const btnaddtask = document.querySelector('.btn-add-task');
const formaddtask = document.querySelector('.form-add-task');
const textarea = document.querySelector('.app__form-textarea');
const sectionTarefas = document.querySelector('.app__section-task-list');
const taskDescription = document.getElementById('task-description'); // Elemento para mostrar a descrição
const taskTimer = document.getElementById('task-timer'); // Elemento para mostrar o tempo do cronômetro
const startTimerButton = document.getElementById('start-timer'); // Botão para iniciar o cronômetro
const btnClearTasks = document.querySelector('.btn-clear-tasks'); // Botão para limpar todas as tarefas

let tarefas = JSON.parse(localStorage.getItem('tarefas')) || [];
let tarefaAtiva = null;  // Armazena a tarefa ativa, se houver
let timerInterval = null; // Variável para armazenar o intervalo do cronômetro

// Evento para adicionar a tarefa
btnaddtask.addEventListener('click', () => {
    formaddtask.classList.toggle('hidden');
});

formaddtask.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const tarefa = {
        descricao: textarea.value.trim(),
        selecionada: false,
        concluida: false,
    };

    tarefas.push(tarefa);
    const elementoTarefa = createElementTask(tarefa);
    sectionTarefas.append(elementoTarefa);

    textarea.value = '';
    formaddtask.classList.add('hidden');

    localStorage.setItem('tarefas', JSON.stringify(tarefas));
});

// Função para criar o elemento da tarefa
function createElementTask(tarefa) {
    const li = document.createElement('li');
    li.classList.add('app__section-task-list-item');
    li.classList.toggle('concluida', tarefa.concluida);

    // Criação do checkbox para selecionar a tarefa
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = tarefa.selecionada;
    checkbox.addEventListener('change', () => toggleTaskSelection(tarefa, li, checkbox));

    const paragrafo = document.createElement('p');
    paragrafo.textContent = tarefa.descricao;
    paragrafo.classList.add('app__section-task-list-item-description');

    const botao = document.createElement('button');
    botao.classList.add('app_button-edit');
    botao.textContent = 'Editar';
    botao.addEventListener('click', () => editarTarefa(tarefa, paragrafo));

    // Botão para disparar o evento de conclusão
    const botaoConcluir = document.createElement('button');
    botaoConcluir.classList.add('app_button-complete');
    botaoConcluir.textContent = 'Concluir';
    botaoConcluir.addEventListener('click', () => concluirTarefa(tarefa, li));

    // Botão para excluir a tarefa
    const botaoExcluir = document.createElement('button');
    botaoExcluir.classList.add('app_button-delete');
    botaoExcluir.textContent = 'Excluir';
    botaoExcluir.addEventListener('click', () => excluirTarefa(tarefa, li));

    // Adiciona um evento para alternar entre tarefas ativas
    li.addEventListener('click', () => toggleTaskActive(tarefa, li));

    li.append(checkbox);
    li.append(paragrafo);
    li.append(botao);
    li.append(botaoConcluir);
    li.append(botaoExcluir);

    // Adiciona a referência do li à tarefa
    tarefa.li = li;

    return li;
}

// Função para excluir uma tarefa
function excluirTarefa(tarefa, li) {
    // Remove a tarefa da lista de tarefas
    tarefas = tarefas.filter(t => t !== tarefa);

    // Remove o elemento da tarefa do DOM
    li.remove();

    // Atualiza o localStorage
    localStorage.setItem('tarefas', JSON.stringify(tarefas));

    alert('Tarefa excluída com sucesso!');
}

// Função para alternar entre tarefas ativas
function toggleTaskActive(tarefa, li) {
    if (tarefaAtiva && tarefaAtiva !== tarefa) {
        tarefaAtiva.li.classList.remove('ativa');
    }

    tarefaAtiva = tarefaAtiva === tarefa ? null : tarefa;
    li.classList.toggle('ativa', tarefaAtiva === tarefa);

    // Exibir a descrição da tarefa ativa no local específico
    if (tarefaAtiva) {
        taskDescription.textContent = tarefaAtiva.descricao;
    } else {
        taskDescription.textContent = 'Clique em uma tarefa para ver a descrição aqui.';
    }

    // Se a tarefa se tornar ativa, inicialize o cronômetro
    if (tarefaAtiva) {
        startTimerButton.disabled = false;
    } else {
        startTimerButton.disabled = true;
    }
}

// Função para iniciar o cronômetro de foco
function iniciarFoco(tarefa) {
    if (tarefaAtiva !== tarefa) return;  // Só começa o foco se for a tarefa ativa

    let tempoRestante = 1.00 * 60; // 25 minutos em segundos
    updateTimerDisplay(tempoRestante);

    // Atualizar o cronômetro a cada segundo
    timerInterval = setInterval(() => {
        tempoRestante--;

        updateTimerDisplay(tempoRestante);

        // Se o tempo acabar, dispara o evento FocoFinalizado
        if (tempoRestante <= 0) {
            clearInterval(timerInterval);
            const eventoFocoFinalizado = new CustomEvent('FocoFinalizado', {
                detail: { descricao: tarefa.descricao },
            });
            sectionTarefas.dispatchEvent(eventoFocoFinalizado);
        }
    }, 1000);
}

// Atualiza o display do cronômetro
function updateTimerDisplay(tempoRestante) {
    const minutos = Math.floor(tempoRestante / 60);
    const segundos = tempoRestante % 60;
    taskTimer.textContent = `Tempo de Foco: ${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

// Escutando o evento FocoFinalizado
sectionTarefas.addEventListener('FocoFinalizado', (evento) => {
    console.log(`O tempo de foco para a tarefa "${evento.detail.descricao}" acabou!`);
    alert(`Foco finalizado para a tarefa "${evento.detail.descricao}". Marcação automática como concluída.`);

    if (tarefaAtiva) {
        concluirTarefa(tarefaAtiva, tarefaAtiva.li);
    }
});

// Função para alternar a seleção da tarefa
function toggleTaskSelection(tarefa, li, checkbox) {
    tarefa.selecionada = checkbox.checked;
    li.classList.toggle('selecionada', tarefa.selecionada);

    // Salva o estado da tarefa no localStorage
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

// Função para editar a tarefa
function editarTarefa(tarefa, paragrafo) {
    const novaDescricao = prompt("Editar tarefa:", tarefa.descricao);

    if (novaDescricao === null || novaDescricao.trim() === '') {
        return;
    }

    tarefa.descricao = novaDescricao.trim();
    paragrafo.textContent = tarefa.descricao;

    // Atualiza o localStorage
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
    alert("Tarefa atualizada com sucesso!");
}

// Função para concluir a tarefa
function concluirTarefa(tarefa, li) {
    tarefa.concluida = true;
    li.classList.add('concluida');

    // Dispara o evento de conclusão
    const eventoConcluida = new CustomEvent('tarefaConcluida', {
        detail: { descricao: tarefa.descricao },
    });
    li.dispatchEvent(eventoConcluida);

    // Salva o estado da tarefa no localStorage
    localStorage.setItem('tarefas', JSON.stringify(tarefas));
}

// Escuta o evento personalizado de tarefa concluída
sectionTarefas.addEventListener('tarefaConcluida', (evento) => {
    console.log("A tarefa '" + evento.detail.descricao + "' foi marcada como concluída!");
    alert(`Tarefa "${evento.detail.descricao}" concluída com sucesso!`);
});

// Carrega as tarefas salvas no localStorage
tarefas.forEach(tarefa => {
    const elementoTarefa = createElementTask(tarefa);
    sectionTarefas.append(elementoTarefa);
});

// Evento para iniciar o cronômetro quando o botão for clicado
startTimerButton.addEventListener('click', () => {
    if (tarefaAtiva) {
        iniciarFoco(tarefaAtiva);
        startTimerButton.disabled = true; // Desabilita o botão enquanto o cronômetro está ativo
    }
});

// Evento para limpar todas as tarefas
btnClearTasks.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja excluir todas as tarefas?')) {
        tarefas = []; // Limpa a lista de tarefas
        sectionTarefas.innerHTML = ''; // Remove todas as tarefas da tela

        // Atualiza o localStorage
        localStorage.setItem('tarefas', JSON.stringify(tarefas));

        alert('Todas as tarefas foram excluídas!');
    }
});
