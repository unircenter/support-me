let currentLimits = localStorage.getItem('ai_limits_v4') !== null ? parseInt(localStorage.getItem('ai_limits_v4')) : 5;

// МАСКИРОВКА: Разрежьте ваш новый ключ на 4 части и вставьте сюда
const k1 = "sk-tpvIS";
const k2 = "lXngz1tWZ";
const k3 = "QN47w2gdR";
const k4 = "rer7IsWnU";

let chatHistory = [
    {
        role: 'system', 
        content: 'Ты — самый добрый, чуткий и поддерживающий друг и психолог на свете. Твоя цель — вести последовательный, логичный и глубокий диалог с пользователем. Задавай наводящие мягкие вопросы, внимательно цепляйся за детали из прошлых ответов. Используй короткие, понятные предложения. Показывай, что ты помнишь всё, что он сказал ранее.'
    }
];

function updateUI() {
    document.getElementById('limit-count').innerText = currentLimits;
    if (currentLimits <= 0) {
        document.getElementById('user-input').disabled = true;
        document.getElementById('send-btn').disabled = true;
        document.getElementById('pay-zone').style.display = 'block';
    } else {
        document.getElementById('user-input').disabled = false;
        document.getElementById('send-btn').disabled = false;
        document.getElementById('pay-zone').style.display = 'none';
    }
}
updateUI();

document.getElementById('user-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (currentLimits > 0) askAI();
    }
});

async function askAI() {
    const text = document.getElementById('user-input').value.trim();
    if (!text) return alert("Пожалуйста, напиши что-нибудь.");
    
    const responseBox = document.getElementById('response');
    const sendBtn = document.getElementById('send-btn');
    
    sendBtn.disabled = true;
    sendBtn.innerText = "Обдумываю твои слова...";
    responseBox.style.display = "block";
    responseBox.innerText = "Внимательно читаю...";

    let userMessageContent = text;
    if (currentLimits === 1) {
        userMessageContent += "\n\n(ИНСТРУКЦИЯ ДЛЯ ИИ: Это твой последний ответ в текущем сеансе. Сеанс завершен. Тебе нужно очень мягко подвести итог беседы, подбодрить меня, сказать, что всё обязательно будет хорошо, и в самом конце ответа строго добавить фразу: 'Наш сегодняшний бесплатный экспресс-сеанс подошел к концу. Чтобы продолжить наш разговор без ограничений, пожалуйста, выбери пакет дозарядки батарейки ниже. Я буду очень ждать тебя!').";
    }

    chatHistory.push({ role: 'user', content: userMessageContent });

    try {
        // Программа незаметно склеивает ключ из четырех кусочков в единое целое
        const fullKey = "" + k1 + k2 + k3 + k4;

        // Используем проверенный базовый адрес ProxyAPI
        const response = await fetch('https://api.proxyapi.ru/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + fullKey
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: chatHistory
            })
        });

        const data = await response.json();
        if (!response.ok || data.error) throw new Error('Ошибка сервера');

        const aiReply = data.choices.message.content;
        chatHistory.push({ role: 'assistant', content: aiReply });
        responseBox.innerText = aiReply;
        
        currentLimits--;
        localStorage.setItem('ai_limits_v4', currentLimits);
        updateUI();
        document.getElementById('user-input').value = "";

    } catch (error) {
        chatHistory.pop();
        responseBox.innerText = "Ой, я немного отвлекся. Повтори, пожалуйста, я очень хочу тебя выслушать.";
        console.error(error);
    } finally {
        if (currentLimits > 0) {
            sendBtn.disabled = false;
            sendBtn.innerText = "Поделиться";
        }
    }
}

function startRecharge(amount) {
    let payUrl = "";
    
    if (amount === 5) {
        payUrl = "https://www.tbank.ru/cf/3sc0phCSkIT"; 
    } else if (amount === 10) {
        payUrl = "https://www.tbank.ru/cf/2jJQ3IVrmsy"; 
    } else if (amount === 25) {
        payUrl = "https://www.tbank.ru/cf/5ZWRIiZrUq";
    }

    window.open(payUrl, '_blank');
    
    const buttons = document.querySelectorAll('.tariff-btn');
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.display = 'none';
    }
    document.getElementById('timer-status').style.display = 'block';
    
    setTimeout(function() {
        localStorage.setItem('ai_limits_v4', amount);
        currentLimits = amount;
        updateUI();
        
        document.getElementById('welcome-text').innerText = "Рад, что ты вернулся. Наш сеанс продолжается, я внимательно слушаю...";
        document.getElementById('timer-status').style.display = 'none';
        
        for (let j = 0; j < buttons.length; j++) {
            buttons[j].style.display = 'block';
        }
        
        chatHistory = [{ role: 'system', content: 'Ты — самый добрый, чуткий и поддерживающий друг и психолог на свете. Ты снова готов слушать.' }];
        
        alert("🔋 Батарейка успешно заряжена на " + amount + " ответов! Наш сеанс продолжается.");
    }, 40000); 
}
