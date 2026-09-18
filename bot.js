const mineflayer = require('mineflayer');

// הגדרות שרת המיינקראפט שלך - שנה אותן כאן!
const botOptions = {
    host: 'oooooij-A.aternos.me', // <--- כאן שמים את ה-IP של השרת באטרנוס
    port: 55413,                     // פורט ברירת מחדל (השאר 25565 אלא אם יש לך פורט דינמי)
    username: 'AntiAFK_Bot',         // השם של הבוט בתוך המשחק
    version: '1.21.11'                // <--- שנה לגרסה המדויקת של השרת שלך (למשל 1.21, 1.20.4 וכו')
};

function createBot() {
    console.log(`[BOT] מנסה להתחבר אל ${botOptions.host}...`);
    const bot = mineflayer.createBot(botOptions);

    // אירוע: כניסה מוצלחת לשרת
    bot.on('spawn', () => {
        console.log(`[BOT] ${bot.username} נכנס בהצלחה לשרת!`);
        
        // לולאת תנועה אנושית מדומה כדי לעקוף הגנות AFK (מתבצעת כל 25 שניות)
        setInterval(() => {
            if (!bot || !bot.entity) return;
            
            const actions = ['jump', 'forward', 'back', 'left', 'right'];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            
            bot.setControlState(randomAction, true);
            setTimeout(() => {
                bot.setControlState(randomAction, false);
            }, 400); 
            
        }, 25000);
    });

    // אירוע צ'אט: אם מישהו כותב משהו בצ'אט
    bot.on('chat', (username, message) => {
        if (username === bot.username) return; // מתעלם מההודעות של עצמו
        
        // אם שחקן כותב בצ'אט את המילה "קפוץ", הבוט יקפוץ
        if (message.toLowerCase() === 'קפוץ') {
            bot.chat(`מבצע פקודה עבור ${username}`);
            bot.setControlState('jump', true);
            setTimeout(() => bot.setControlState('jump', false), 500);
        }
    });

    // טיפול בניתוקים: מנסה להתחבר מחדש אחרי 20 שניות
    bot.on('disconnect', (packet) => {
        console.log('[BOT] הבוט נותק. מנסה להתחבר מחדש בעוד 20 שניות...');
        setTimeout(createBot, 20000);
    });

    // טיפול בשגיאות קריסה
    bot.on('error', (err) => {
        console.error('[שגיאה]', err.message);
    });
}

// הפעלת הבוט
createBot();
