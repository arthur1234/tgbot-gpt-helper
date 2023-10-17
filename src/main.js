import { Telegraf, session } from "telegraf" 
import { message } from 'telegraf/filters'
import { code } from "telegraf/format";
import config from "config"
import { ogg } from './ogg.js'
import { openai } from './openai.js'

console.log(config.get('TEST'))

const INITIAL_SESSION = {
    message : []
}
const bot = new Telegraf(config.get('TELEGRAM_TOKEN'))

bot.use(session())

bot.command('new', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx. reply(' Awaiting your message.')
})
bot.command('start', async (ctx) => {
    ctx.session = INITIAL_SESSION
    await ctx. reply(' Awaiting your message.')
})

bot.on(message('voice'), async (ctx) => {
    console.log(' [ctx.session] = ', ctx.session)
    ctx.session = ctx.session || INITIAL_SESSION;

    try {
        await ctx.reply(code('Please wait a moment.'))
        const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id)
        const userId = String(ctx.message.from.id)
        const oggPath = await ogg.create(link.href, userId)
        const mp3Path = await ogg.toMp3(oggPath, userId)
        const text = await openai.transcription(mp3Path)

        await ctx.reply(code(text.text))

         console.log(' [ctx.session] = ', ctx.session)
        ctx.session.message.push({ role: openai.roles.USER, content: text.text })
      
        const response = await openai.chat(ctx.session.message)

        ctx.session.message.push({ 
            role: openai.roles.ASSISTANT, 
            content: text.text 
        })

       await ctx.reply(response.content)

    } catch (e) {
        console.log('error', e.message)
    }
    
})

bot.on(message('text'), async (ctx) => {
    ctx.session = ctx.session || INITIAL_SESSION;
    try {
        await ctx.reply(code('Please wait a moment.'))
        ctx.session.message.push({ role: openai.roles.USER, content: ctx.message.text })
        const response = await openai.chat(ctx.session.message)

        ctx.session.message.push({ 
            role: openai.roles.ASSISTANT, 
            content: ctx.message.text 
        })

        await ctx.reply(response.content)

    } catch (e) {
        console.log('error', e.message)
    }
    
})


bot.launch()

process.once('SIGINT', ()=> bot.stop('SIGINT'))
process.once('SIGTERM', ()=> bot.stop('SIGTERM'))